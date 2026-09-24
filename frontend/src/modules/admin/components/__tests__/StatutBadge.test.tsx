// src/modules/admin/components/__tests__/StatutBadge.test.tsx
// ============================================================================
// Tests unitaires : StatutBadge
// Un composant pur : props en entrée, HTML en sortie. On vérifie le texte
// affiché et la classe de couleur choisie selon statut.couleur.
// ============================================================================

import { render, screen } from "@testing-library/react"
import StatutBadge from "../StatutBadge"

describe("StatutBadge", () => {
  it("affiche le nom du statut", () => {
    render(<StatutBadge statut={{ nom_statut: "Confirmée", couleur: "success" }} />)
    expect(screen.getByText("Confirmée")).toBeInTheDocument()
  })

  it("applique la couleur verte pour un statut success", () => {
    render(<StatutBadge statut={{ nom_statut: "Confirmée", couleur: "success" }} />)
    expect(screen.getByText("Confirmée")).toHaveClass("bg-green-100", "text-green-800")
  })

  it("applique la couleur rouge pour un statut danger", () => {
    render(<StatutBadge statut={{ nom_statut: "Annulée", couleur: "danger" }} />)
    expect(screen.getByText("Annulée")).toHaveClass("bg-red-100", "text-red-800")
  })

  it("retombe sur le gris pour une couleur inconnue", () => {
    render(<StatutBadge statut={{ nom_statut: "Inconnu", couleur: "violet" }} />)
    expect(screen.getByText("Inconnu")).toHaveClass("bg-gray-100")
  })

  it("affiche un tiret quand il n'y a pas de statut", () => {
    render(<StatutBadge statut={null} />)
    expect(screen.getByText("—")).toBeInTheDocument()
  })
})
