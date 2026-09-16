/**
 * @jest-environment node
 */
// src/lib/__tests__/auth.test.ts
// ============================================================================
// Tests : lib/auth.ts — hachage bcrypt, JWT (jose), lecture de session
//
// Doublures :
// - next/headers (cookies) : on contrôle le cookie présenté au serveur
// - ./prisma : aucune requête réelle (les fonctions testées ici n'en font pas,
//   mais le module l'importe au chargement)
// ============================================================================

import {
  hashPassword,
  verifyPassword,
  createToken,
  verifyToken,
  getCurrentUser,
  ROLES,
  type AuthUser,
} from "../auth"
import { cookies } from "next/headers"

jest.mock("next/headers", () => ({ cookies: jest.fn() }))
jest.mock("../prisma", () => ({ __esModule: true, default: {} }))

const cookiesMock = cookies as jest.Mock

const user: AuthUser = {
  id_user: 6,
  email_user: "yannick@test.com",
  nom_user: "Franchaisse",
  prenom_user: "Yannick",
  tel_user: null,
  role: { id_role: ROLES.ADMIN, code_role: "admin", nom_role: "Administrateur" },
}

describe("Mots de passe (bcrypt)", () => {
  it("hache un mot de passe et le vérifie", async () => {
    const hash = await hashPassword("Secret123!")
    expect(hash).not.toBe("Secret123!")
    expect(hash).toMatch(/^\$2[aby]\$/) // format bcrypt
    expect(await verifyPassword("Secret123!", hash)).toBe(true)
  })

  it("refuse un mauvais mot de passe", async () => {
    const hash = await hashPassword("Secret123!")
    expect(await verifyPassword("autre", hash)).toBe(false)
  })

  it("produit un hash différent à chaque appel (sel aléatoire)", async () => {
    const [h1, h2] = await Promise.all([hashPassword("x"), hashPassword("x")])
    expect(h1).not.toBe(h2)
  })
})

describe("Jetons JWT (jose)", () => {
  it("crée un jeton signé qui se vérifie et restitue le payload", async () => {
    const token = await createToken(user)
    expect(token.split(".")).toHaveLength(3) // header.payload.signature

    const payload = await verifyToken(token)
    expect(payload).toMatchObject({
      id_user: 6,
      email: "yannick@test.com",
      nom: "Franchaisse",
      prenom: "Yannick",
      role: "admin",
    })
    expect(payload?.exp).toBeGreaterThan(payload?.iat ?? 0)
  })

  it("rejette un jeton altéré", async () => {
    const token = await createToken(user)
    const [header, payload, signature] = token.split(".")
    // On modifie la signature : la vérification doit échouer
    const forged = `${header}.${payload}.${signature.slice(0, -2)}xx`
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {})

    expect(await verifyToken(forged)).toBeNull()

    errorSpy.mockRestore()
  })

  it("rejette une chaîne quelconque", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {})
    expect(await verifyToken("pas-un-jwt")).toBeNull()
    errorSpy.mockRestore()
  })
})

describe("getCurrentUser (session via cookie)", () => {
  it("renvoie null sans cookie", async () => {
    cookiesMock.mockResolvedValue({ get: () => undefined })
    expect(await getCurrentUser()).toBeNull()
  })

  it("renvoie le payload quand le cookie contient un jeton valide", async () => {
    const token = await createToken(user)
    cookiesMock.mockResolvedValue({ get: (name: string) => (name === "auth-token" ? { value: token } : undefined) })

    const payload = await getCurrentUser()
    expect(payload?.id_user).toBe(6)
    expect(payload?.role).toBe("admin")
  })

  it("renvoie null quand le cookie contient un jeton invalide", async () => {
    cookiesMock.mockResolvedValue({ get: () => ({ value: "invalide" }) })
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {})

    expect(await getCurrentUser()).toBeNull()

    errorSpy.mockRestore()
  })
})

describe("ROLES", () => {
  it("expose les identifiants de rôle de la base", () => {
    expect(ROLES).toEqual({ ADMIN: 1, PRESTATAIRE: 2, CLIENT: 3 })
  })
})
