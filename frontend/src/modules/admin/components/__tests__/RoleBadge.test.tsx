// src/modules/admin/components/__tests__/RoleBadge.test.tsx
// ============================================================================
// Tests unitaires : RoleBadge
// ============================================================================

import { render, screen } from "@testing-library/react"
import RoleBadge from "../RoleBadge"

describe("RoleBadge", () => {
  it.each([
    ["admin", "Administrateur", "bg-red-100"],
    ["provider", "Prestataire", "bg-yellow-100"],
    ["client", "Client", "bg-turquoise-light"],
  ])("rend le rôle %s avec sa couleur", (code_role, nom_role, expectedClass) => {
    render(<RoleBadge role={{ code_role, nom_role }} />)
    expect(screen.getByText(nom_role)).toHaveClass(expectedClass)
  })

  it("retombe sur le gris pour un rôle inconnu", () => {
    render(<RoleBadge role={{ code_role: "autre", nom_role: "Autre" }} />)
    expect(screen.getByText("Autre")).toHaveClass("bg-gray-100")
  })
})
