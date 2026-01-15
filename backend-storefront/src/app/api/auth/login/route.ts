// src/app/api/auth/login/route.ts
// ============================================================================
// API Connexion - Hotel Booking Bloc 3
// POST /api/auth/login
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import {
  findUserByEmail,
  getUserPasswordHash,
  verifyPassword,
  createToken,
  setAuthCookie,
  updateLastLogin,
} from "@lib/auth";

// ============================================================================
// POST /api/auth/login
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // 1. Validation basique
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    // 2. Trouver l'utilisateur
    const user = await findUserByEmail(email.toLowerCase().trim());
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Email ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    // 3. Vérifier le mot de passe
    const passwordHash = await getUserPasswordHash(email.toLowerCase().trim());
    if (!passwordHash) {
      return NextResponse.json(
        { success: false, error: "Email ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    const isValidPassword = await verifyPassword(password, passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: "Email ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    // 4. Créer le token JWT
    const token = await createToken(user);

    // 5. Définir le cookie
    await setAuthCookie(token);

    // 6. Mettre à jour la dernière connexion
    await updateLastLogin(user.id_user);

    // 7. Retourner l'utilisateur
    return NextResponse.json({
      success: true,
      message: "Connexion réussie",
      user: {
        id_user: user.id_user,
        email: user.email_user,
        nom: user.nom_user,
        prenom: user.prenom_user,
        role: user.role.code_role,
      },
    });
  } catch (error) {
    console.error("Erreur login:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de la connexion" },
      { status: 500 }
    );
  }
}