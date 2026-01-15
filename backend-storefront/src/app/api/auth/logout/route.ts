// src/app/api/auth/logout/route.ts
// ============================================================================
// API Déconnexion - Hotel Booking Bloc 3
// POST /api/auth/logout
// ============================================================================

import { NextResponse } from "next/server";
import { removeAuthCookie } from "@lib/auth";

// ============================================================================
// POST /api/auth/logout
// ============================================================================
export async function POST() {
  try {
    // Supprimer le cookie d'authentification
    await removeAuthCookie();

    return NextResponse.json({
      success: true,
      message: "Déconnexion réussie",
    });
  } catch (error) {
    console.error("Erreur logout:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la déconnexion" },
      { status: 500 }
    );
  }
}