// src/app/api/auth/reset-password/route.ts
// ============================================================================
// API Reset Password - Hotel Booking Bloc 3
// POST : Réinitialise le mot de passe avec le token
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@lib/prisma";
import { hashPassword } from "@lib/auth";

// ============================================================================
// POST - Réinitialiser le mot de passe
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    // Validation
    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Token et nouveau mot de passe requis" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, error: "Le mot de passe doit contenir au moins 6 caractères" },
        { status: 400 }
      );
    }

    // Vérifier le token
    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id_user: true,
            prenom_user: true,
            nom_user: true,
          },
        },
      },
    });

    // Token non trouvé
    if (!resetRecord) {
      return NextResponse.json(
        { success: false, error: "Lien invalide ou expiré" },
        { status: 400 }
      );
    }

    // Token déjà utilisé
    if (resetRecord.used) {
      return NextResponse.json(
        { success: false, error: "Ce lien a déjà été utilisé" },
        { status: 400 }
      );
    }

    // Token expiré
    if (resetRecord.expires_at < new Date()) {
      return NextResponse.json(
        { success: false, error: "Ce lien a expiré. Veuillez faire une nouvelle demande." },
        { status: 400 }
      );
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await hashPassword(newPassword);

    // Transaction : mettre à jour le mot de passe ET marquer le token comme utilisé
    await prisma.$transaction([
      prisma.utilisateur.update({
        where: { id_user: resetRecord.id_user },
        data: { mot_de_passe: hashedPassword },
      }),
      prisma.passwordReset.update({
        where: { token },
        data: { used: true },
      }),
    ]);

    console.log("\n========================================");
    console.log("MOT DE PASSE RÉINITIALISÉ");
    console.log("========================================");
    console.log(`Utilisateur: ${resetRecord.user.prenom_user} ${resetRecord.user.nom_user}`);
    console.log(`Date: ${new Date().toLocaleString("fr-FR")}`);
    console.log("========================================\n");

    return NextResponse.json({
      success: true,
      message: "Mot de passe réinitialisé avec succès",
    });
  } catch (error) {
    console.error("Erreur POST /api/auth/reset-password:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}