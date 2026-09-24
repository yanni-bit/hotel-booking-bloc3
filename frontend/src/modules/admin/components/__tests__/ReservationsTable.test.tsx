// src/modules/admin/components/__tests__/ReservationsTable.test.tsx
// ============================================================================
// Tests : ReservationsTable (admin) — chargement, filtre, mise à jour optimiste
// du statut avec rollback en cas d'échec.
// ============================================================================

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReservationsTable from "../ReservationsTable";

const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useParams: () => ({ countryCode: "fr" }),
}));

const statuts = [
  { id_statut: 1, nom_statut: "En attente", couleur: "warning" },
  { id_statut: 2, nom_statut: "Confirmée", couleur: "success" },
  { id_statut: 3, nom_statut: "Annulée", couleur: "danger" },
];

const listResponse = {
  reservations: [
    {
      id_reservation: 10,
      num_confirmation: "HB-TEST-0001",
      check_in: "2026-09-16",
      check_out: "2026-09-18",
      nbre_nuits: 2,
      total_price: "156.00",
      devise: "EUR",
      date_reservation: "2026-09-10T10:00:00Z",
      user: {
        id_user: 6,
        nom_user: "Franchaisse",
        prenom_user: "Yannick",
        email_user: "y@test.com",
      },
      hotel: {
        id_hotel: 98,
        nom_hotel: "Luxury Tokyo Hotel",
        ville_hotel: "Tokyo",
      },
      chambre: { id_chambre: 1, type_room: "Deluxe" },
      statut: statuts[0],
    },
  ],
  statuts,
  pagination: { page: 1, limit: 15, total: 1, totalPages: 1 },
};

const jsonResponse = (body: unknown, ok = true, status = 200) =>
  Promise.resolve({
    ok,
    status,
    json: () => Promise.resolve(body),
  } as Response);

beforeEach(() => {
  pushMock.mockClear();
  global.fetch = jest.fn((url: string, init?: RequestInit) => {
    if (init?.method === "PUT")
      return jsonResponse({
        reservation: { id_reservation: 10, statut: statuts[1] },
      });
    return jsonResponse(listResponse);
  }) as jest.Mock;
});

describe("ReservationsTable", () => {
  it("affiche la réservation avec son client, son hôtel et son statut", async () => {
    render(<ReservationsTable />);
    expect(await screen.findByText("HB-TEST-0001")).toBeInTheDocument();
    expect(screen.getByText("Yannick Franchaisse")).toBeInTheDocument();
    expect(screen.getByText("Luxury Tokyo Hotel")).toBeInTheDocument();
    expect(screen.getByText("2 nuits")).toBeInTheDocument();
    expect(screen.getByText("156.00 €")).toBeInTheDocument();
  });

  it("remplit le filtre de statuts depuis l'API", async () => {
    render(<ReservationsTable />);
    await screen.findByText("HB-TEST-0001");
    const filtre = screen.getByLabelText("Filtrer par statut");
    expect(within(filtre).getAllByRole("option")).toHaveLength(4); // "Tous" + 3 statuts
  });

  it("pré-filtre sur le statut reçu en prop", async () => {
    render(<ReservationsTable initialStatut="1" />);
    await screen.findByText("HB-TEST-0001");
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/admin/reservations?page=1&limit=15&statut=1",
    );
  });

  it("change le statut en ligne et envoie un PUT", async () => {
    const user = userEvent.setup();
    render(<ReservationsTable />);
    await screen.findByText("HB-TEST-0001");

    const select = screen.getByLabelText(
      /changer le statut de la réservation HB-TEST-0001/i,
    );
    await user.selectOptions(select, "2");

    // Mise à jour optimiste : le badge change tout de suite
    const row = screen.getByText("HB-TEST-0001").closest("tr")!;
    expect(
      within(row).getByText("Confirmée", { selector: "span" }),
    ).toBeInTheDocument();

    await waitFor(() =>
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/admin/reservations/10",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ id_statut: 2 }),
        }),
      ),
    );
  });

  it("revient au statut précédent si le PUT échoue", async () => {
    global.fetch = jest.fn((url: string, init?: RequestInit) => {
      if (init?.method === "PUT")
        return jsonResponse({ error: "Erreur" }, false, 500);
      return jsonResponse(listResponse);
    }) as jest.Mock;

    const user = userEvent.setup();
    render(<ReservationsTable />);
    await screen.findByText("HB-TEST-0001");

    await user.selectOptions(screen.getByLabelText(/changer le statut/i), "2");

    const row = screen.getByText("HB-TEST-0001").closest("tr")!;
    await waitFor(() =>
      expect(
        within(row).getByText("En attente", { selector: "span" }),
      ).toBeInTheDocument(),
    );
    expect(screen.getByRole("alert")).toHaveTextContent(/a échoué/i);
  });

  it("ouvre la fiche au clic sur la ligne, pas sur le sélecteur", async () => {
    const user = userEvent.setup();
    render(<ReservationsTable />);
    const cell = await screen.findByText("Luxury Tokyo Hotel");

    await user.click(cell);
    expect(pushMock).toHaveBeenCalledWith("/fr/admin/reservations/10");

    pushMock.mockClear();
    await user.click(screen.getByLabelText(/changer le statut/i));
    expect(pushMock).not.toHaveBeenCalled();
  });
});
