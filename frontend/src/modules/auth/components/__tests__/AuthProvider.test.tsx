// src/modules/auth/components/__tests__/AuthProvider.test.tsx
// ============================================================================
// Tests : AuthProvider / useAuth — gestion d'état de session côté client
// (Context + hook). fetch est simulé.
// ============================================================================

import { render, screen, waitFor, act } from "@testing-library/react"
import { AuthProvider, useAuth } from "../AuthProvider"

const jsonResponse = (body: unknown, ok = true, status = 200) =>
  Promise.resolve({ ok, status, json: () => Promise.resolve(body) } as Response)

const yannick = { id_user: 6, email: "yannick@test.com", nom: "Franchaisse", prenom: "Yannick", role: "admin" }

// Composant sonde : affiche l'état et expose les actions via des boutons
function Probe() {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth()
  return (
    <div>
      <p data-testid="state">
        {isLoading ? "loading" : isAuthenticated ? `auth:${user?.prenom}` : "anonymous"}
      </p>
      <button onClick={() => login("yannick@test.com", "Secret123!")}>login</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  )
}

describe("AuthProvider", () => {
  it("part en chargement puis devient anonyme si /api/auth/me échoue", async () => {
    global.fetch = jest.fn(() => jsonResponse({ success: false }, false, 401)) as jest.Mock
    render(<AuthProvider><Probe /></AuthProvider>)

    expect(screen.getByTestId("state")).toHaveTextContent("loading")
    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("anonymous"))
    expect(global.fetch).toHaveBeenCalledWith("/api/auth/me")
  })

  it("restaure la session depuis /api/auth/me", async () => {
    global.fetch = jest.fn(() => jsonResponse({ success: true, user: yannick })) as jest.Mock
    render(<AuthProvider><Probe /></AuthProvider>)

    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("auth:Yannick"))
  })

  it("login() envoie les identifiants et met à jour l'utilisateur", async () => {
    global.fetch = jest.fn((url: string) =>
      url === "/api/auth/login"
        ? jsonResponse({ success: true, user: yannick })
        : jsonResponse({ success: false }, false, 401)
    ) as jest.Mock
    render(<AuthProvider><Probe /></AuthProvider>)
    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("anonymous"))

    await act(async () => { screen.getByText("login").click() })

    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("auth:Yannick"))
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/auth/login",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "yannick@test.com", password: "Secret123!" }),
      })
    )
  })

  it("logout() appelle l'API et repasse anonyme", async () => {
    global.fetch = jest.fn((url: string) =>
      url === "/api/auth/logout" ? jsonResponse({ success: true }) : jsonResponse({ success: true, user: yannick })
    ) as jest.Mock
    render(<AuthProvider><Probe /></AuthProvider>)
    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("auth:Yannick"))

    await act(async () => { screen.getByText("logout").click() })

    await waitFor(() => expect(screen.getByTestId("state")).toHaveTextContent("anonymous"))
    expect(global.fetch).toHaveBeenCalledWith("/api/auth/logout", { method: "POST" })
  })

  it("useAuth() hors du Provider lève une erreur explicite", () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {})
    expect(() => render(<Probe />)).toThrow("useAuth doit être utilisé dans un AuthProvider")
    errorSpy.mockRestore()
  })
})
