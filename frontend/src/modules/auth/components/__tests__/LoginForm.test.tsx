// src/modules/auth/components/__tests__/LoginForm.test.tsx
// ============================================================================
// Tests : LoginForm — saisie, validation, appel de login(), redirection, erreurs
//
// useAuth() est remplacé par une doublure : on teste le formulaire seul,
// pas le contexte (qui a son propre test, AuthProvider.test.tsx).
// ============================================================================

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginForm from "../LoginForm";

const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const loginMock = jest.fn();
jest.mock("../AuthProvider", () => ({
  useAuth: () => ({ login: loginMock }),
}));

beforeEach(() => {
  pushMock.mockClear();
  loginMock.mockReset();
});

describe("LoginForm", () => {
  it("affiche les champs email, mot de passe et le bouton", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText("Adresse email")).toBeInTheDocument();
    expect(screen.getByLabelText("Mot de passe")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Se connecter" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /mot de passe oublié/i }),
    ).toHaveAttribute("href", "/fr/forgot-password");
  });

  it("affiche puis masque le mot de passe", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    const password = screen.getByLabelText("Mot de passe");
    expect(password).toHaveAttribute("type", "password");

    await user.click(
      screen.getByRole("button", { name: /afficher le mot de passe/i }),
    );
    expect(password).toHaveAttribute("type", "text");

    await user.click(
      screen.getByRole("button", { name: /masquer le mot de passe/i }),
    );
    expect(password).toHaveAttribute("type", "password");
  });

  it("refuse l'envoi si un champ est vide, sans appeler login()", async () => {
    const { container } = render(<LoginForm />);
    // Soumission directe du formulaire : contourne la validation HTML `required`
    // pour atteindre la validation côté composant
    fireEvent.submit(container.querySelector("form")!);

    expect(
      await screen.findByText("Veuillez remplir tous les champs"),
    ).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("appelle login() avec les identifiants et redirige en cas de succès", async () => {
    loginMock.mockResolvedValue({ success: true });
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Adresse email"), "yannick@test.com");
    await user.type(screen.getByLabelText("Mot de passe"), "Secret123!");
    await user.click(screen.getByRole("button", { name: "Se connecter" }));

    await waitFor(() =>
      expect(loginMock).toHaveBeenCalledWith("yannick@test.com", "Secret123!"),
    );
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/fr"));
  });

  it("affiche le message d'erreur renvoyé par login() et ne redirige pas", async () => {
    loginMock.mockResolvedValue({
      success: false,
      error: "Email ou mot de passe incorrect",
    });
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Adresse email"), "yannick@test.com");
    await user.type(screen.getByLabelText("Mot de passe"), "mauvais");
    await user.click(screen.getByRole("button", { name: "Se connecter" }));

    expect(
      await screen.findByText("Email ou mot de passe incorrect"),
    ).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
    // Le bouton est de nouveau actif après l'échec
    expect(screen.getByRole("button", { name: "Se connecter" })).toBeEnabled();
  });

  it("désactive le bouton pendant la connexion", async () => {
    // login() ne répond pas tout de suite : on garde la promesse en suspens
    let resolveLogin: (v: { success: boolean }) => void = () => {};
    loginMock.mockReturnValue(
      new Promise((resolve) => {
        resolveLogin = resolve;
      }),
    );
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("Adresse email"), "yannick@test.com");
    await user.type(screen.getByLabelText("Mot de passe"), "Secret123!");
    await user.click(screen.getByRole("button", { name: "Se connecter" }));

    const pending = await screen.findByRole("button", {
      name: /connexion\.\.\./i,
    });
    expect(pending).toBeDisabled();

    resolveLogin({ success: true });
    await waitFor(() => expect(pushMock).toHaveBeenCalled());
  });
});
