// src/app/api/auth/me/route.ts
// ============================================================================
// API Utilisateur courant - Hotel Booking Bloc 3
// GET /api/auth/me
// 
// Différence Angular → Next.js :
// - Angular : Interceptor ajoute le token à chaque requête
// - Next.js : Cookie HttpOnly envoyé automatiquement
// ============================================================================

import { NextResponse } from "next/server";
import { getCurrentUser, findUserById } from "@lib/auth";

// ============================================================================
// GET /api/auth/me
// ============================================================================
export async function GET() {
  try {
    // 1. Récupérer le payload du token
    const payload = await getCurrentUser();
    
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }

    // 2. Récupérer les infos fraîches depuis la BDD
    const user = await findUserById(payload.id_user);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // 3. Retourner l'utilisateur
    return NextResponse.json({
      success: true,
      user: {
        id_user: user.id_user,
        email: user.email_user,
        nom: user.nom_user,
        prenom: user.prenom_user,
        tel: user.tel_user,
        role: user.role.code_role,
      },
    });
  } catch (error) {
    console.error("Erreur me:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}