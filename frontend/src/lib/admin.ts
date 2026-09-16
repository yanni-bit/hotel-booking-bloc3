// src/lib/admin.ts
// ============================================================================
// Contrôle d'accès administrateur - Hotel Booking Bloc 3
//
// Une seule source de vérité pour "qui est admin ?", utilisée par :
// - les routes API /api/admin/*  (requireAdmin + unauthorized)
// - le layout des pages /admin   (requireAdmin)
//
// Différence Angular → Next.js :
// - Angular : AdminGuard (CanActivate) côté client + vérification côté API
// - Next.js : le middleware filtre les URLs, cette fonction vérifie côté serveur
//   avant tout accès aux données. Le cookie HttpOnly est envoyé automatiquement,
//   plus besoin de clé API ni de header spécifique.
// ============================================================================

import { NextResponse } from "next/server";
import { getCurrentUser, type UserPayload } from "@lib/auth";

const ADMIN_ROLE = "admin";

/**
 * Retourne l'utilisateur connecté s'il est admin, sinon null.
 */
export async function requireAdmin(): Promise<UserPayload | null> {
  const user = await getCurrentUser();
  if (!user || user.role !== ADMIN_ROLE) return null;
  return user;
}

/**
 * Réponse standard des routes API quand l'appelant n'est pas admin.
 */
export function unauthorized() {
  return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
}
