// src/modules/admin/components/__tests__/HotelsTable.test.tsx
// ============================================================================
// Tests : HotelsTable (admin) avec fetch simulé
//
// Ce composant dépend de deux choses externes qu'on remplace par des doublures :
// - next/navigation (useRouter, useParams) → jest.mock
// - fetch global → jest.fn() qui renvoie des données contrôlées
// ============================================================================

import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import HotelsTable from "../HotelsTable"

// --- Doublure de next/navigation ---------------------------------------------
const pushMock = jest.fn()
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useParams: () => ({ countryCode: "fr" }),
}))

// --- Données de test ----------------------------------------------------------
const hotelsPage1 = {
  hotels: [
    {
      id_hotel: 1, nom_hotel: "Grand Hôtel Paris", ville_hotel: "Paris", pays_hotel: "France",
      nbre_etoile_hotel: 5, note_moy_hotel: "9.4", _count: { chambres: 4, reservations: 2 },
    },
    {
      id_hotel: 2, nom_hotel: "Tokyo Inn", ville_hotel: "Tokyo", pays_hotel: "Japan",
      nbre_etoile_hotel: null, note_moy_hotel: null, _count: { chambres: 3, reservations: 0 },
    },
  ],
  pagination: { page: 1, limit: 15, total: 20, totalPages: 2 },
}

// Réponse JSON simulée
const jsonResponse = (body: unknown, ok = true, status = 200) =>
  Promise.resolve({ ok, status, json: () => Promise.resolve(body) } as Response)

beforeEach(() => {
  pushMock.mockClear()
  global.fetch = jest.fn(() => jsonResponse(hotelsPage1)) as jest.Mock
})

describe("HotelsTable", () => {
  it("affiche l'état de chargement puis les hôtels", async () => {
    render(<HotelsTable />)
    expect(screen.getByText("Chargement…")).toBeInTheDocument()

    expect(await screen.findByText("Grand Hôtel Paris")).toBeInTheDocument()
    expect(screen.getByText("Tokyo Inn")).toBeInTheDocument()
    expect(screen.getByText("20 hôtels")).toBeInTheDocument()
  })

  it("appelle l'API avec la page et la limite", async () => {
    render(<HotelsTable />)
    await screen.findByText("Grand Hôtel Paris")

    expect(global.fetch).toHaveBeenCalledWith("/api/admin/hotels?page=1&limit=15")
  })

  it("affiche un tiret quand l'hôtel n'a ni étoiles ni note", async () => {
    render(<HotelsTable />)
    const row = (await screen.findByText("Tokyo Inn")).closest("tr")!
    expect(row.querySelectorAll("span")).toBeDefined()
    expect(row).toHaveTextContent("—")
    expect(row).not.toHaveTextContent("/10")
  })

  it("relance la recherche avec un délai après la saisie", async () => {
    const user = userEvent.setup()
    render(<HotelsTable />)
    await screen.findByText("Grand Hôtel Paris")

    await user.type(screen.getByPlaceholderText("Nom ou ville"), "paris")

    await waitFor(() =>
      expect(global.fetch).toHaveBeenLastCalledWith("/api/admin/hotels?page=1&limit=15&search=paris")
    )
  })

  it("navigue vers la fiche au clic sur une ligne", async () => {
    const user = userEvent.setup()
    render(<HotelsTable />)
    const row = (await screen.findByText("Grand Hôtel Paris")).closest("tr")!

    await user.click(row)

    expect(pushMock).toHaveBeenCalledWith("/fr/admin/hotels/1")
  })

  it("passe à la page suivante", async () => {
    const user = userEvent.setup()
    render(<HotelsTable />)
    await screen.findByText("Grand Hôtel Paris")

    await user.click(screen.getByRole("button", { name: /suivant/i }))

    await waitFor(() =>
      expect(global.fetch).toHaveBeenLastCalledWith("/api/admin/hotels?page=2&limit=15")
    )
  })

  it("affiche un message d'erreur si l'API échoue", async () => {
    global.fetch = jest.fn(() => jsonResponse({ error: "Non autorisé" }, false, 401)) as jest.Mock
    render(<HotelsTable />)

    expect(await screen.findByText(/impossible de charger les hôtels/i)).toBeInTheDocument()
  })

  it("affiche un message quand aucun hôtel ne correspond", async () => {
    global.fetch = jest.fn(() =>
      jsonResponse({ hotels: [], pagination: { page: 1, limit: 15, total: 0, totalPages: 0 } })
    ) as jest.Mock
    render(<HotelsTable />)

    expect(await screen.findByText(/aucun hôtel ne correspond/i)).toBeInTheDocument()
  })
})
