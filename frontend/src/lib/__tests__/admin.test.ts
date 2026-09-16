/**
 * @jest-environment node
 */
// src/lib/__tests__/admin.test.ts
// ============================================================================
// Tests : requireAdmin() — contrôle d'accès des routes /api/admin/*
// getCurrentUser (lecture du cookie JWT) est remplacé par une doublure.
// Environnement node (pas jsdom) : NextResponse a besoin des API Request/Response.
// ============================================================================

import { requireAdmin, unauthorized } from "../admin"
import { getCurrentUser } from "../auth"

jest.mock("../auth", () => ({
  getCurrentUser: jest.fn(),
}))

const getCurrentUserMock = getCurrentUser as jest.Mock

describe("requireAdmin", () => {
  it("renvoie null sans session", async () => {
    getCurrentUserMock.mockResolvedValue(null)
    expect(await requireAdmin()).toBeNull()
  })

  it("renvoie null pour un client connecté", async () => {
    getCurrentUserMock.mockResolvedValue({ id_user: 4, role: "client" })
    expect(await requireAdmin()).toBeNull()
  })

  it("renvoie l'utilisateur pour un admin", async () => {
    const admin = { id_user: 1, role: "admin", prenom: "Yannick" }
    getCurrentUserMock.mockResolvedValue(admin)
    expect(await requireAdmin()).toEqual(admin)
  })
})

describe("unauthorized", () => {
  it("renvoie une réponse 401 avec un message", async () => {
    const response = unauthorized()
    expect(response.status).toBe(401)
    expect(await response.json()).toEqual({ error: "Non autorisé" })
  })
})
