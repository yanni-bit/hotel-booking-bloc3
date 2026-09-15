// src/app/api/user/password/route.ts
// ============================================================================
// API Changement Mot de Passe - Hotel Booking Bloc 3
// PUT : Changer le mot de passe (ancien + nouveau)
//
// Différence Angular → Next.js :
// - Angular : AuthService.changePassword() avec Observable
// - Next.js : API Route avec async/await
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, verifyPassword, hashPassword } from "@lib/auth";
import prisma from "@lib/prisma";

// ============================================================================
// PUT - Changer le mot de passe
// ============================================================================
export async function PUT(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { oldPassword, newPassword } = body;

    // Validation
    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Veuillez remplir tous les champs" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "Le nouveau mot de passe doit contenir au moins 6 caractères" },
        { status: 400 }
      );
    }

    // Récupérer le hash actuel du mot de passe
    const user = await prisma.utilisateur.findUnique({
      where: { id_user: currentUser.id_user },
      select: { mot_de_passe: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier l'ancien mot de passe
    const isValidPassword = await verifyPassword(oldPassword, user.mot_de_passe);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, error: "Mot de passe actuel incorrect" },
        { status: 400 }
      );
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await hashPassword(newPassword);

    // Mettre à jour le mot de passe
    await prisma.utilisateur.update({
      where: { id_user: currentUser.id_user },
      data: { mot_de_passe: hashedPassword },
    });

    return NextResponse.json({
      success: true,
      message: "Mot de passe modifié avec succès",
    });
  } catch (error) {
    console.error("Erreur PUT /api/user/password:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}