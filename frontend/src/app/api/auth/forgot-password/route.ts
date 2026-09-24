// src/app/api/auth/forgot-password/route.ts
// ============================================================================
// API Forgot Password - Hotel Booking Bloc 3
// POST : Envoie un email avec le lien de réinitialisation
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import prisma from "@lib/prisma";
import { sendPasswordResetEmail } from "@lib/email";

// ============================================================================
// POST - Demande de réinitialisation de mot de passe
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validation
    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email requis" },
        { status: 400 }
      );
    }

    // Validation format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Format d'email invalide" },
        { status: 400 }
      );
    }

    // Chercher l'utilisateur
    const user = await prisma.utilisateur.findUnique({
      where: { email_user: email },
      select: {
        id_user: true,
        prenom_user: true,
        nom_user: true,
        email_user: true,
        actif: true,
      },
    });

    // Vérifier si l'utilisateur existe
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Aucun compte associé à cet email" },
        { status: 404 }
      );
    }

    // Vérifier si le compte est actif
    if (!user.actif) {
      return NextResponse.json(
        { success: false, error: "Ce compte a été désactivé" },
        { status: 403 }
      );
    }

    // Supprimer les anciens tokens non utilisés pour cet utilisateur
    await prisma.passwordReset.deleteMany({
      where: {
        id_user: user.id_user,
        used: false,
      },
    });

    // Générer un token unique
    const token = crypto.randomUUID() + "-" + Date.now();

    // Expiration dans 1 heure
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Sauvegarder le token en base
    await prisma.passwordReset.create({
      data: {
        id_user: user.id_user,
        token,
        expires_at: expiresAt,
        used: false,
      },
    });

    // Construire le lien de réinitialisation
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";
    const resetLink = `${baseUrl}/fr/reset-password?token=${token}`;

    // Afficher dans la console (pour le développement)
    console.log("\n========================================");
    console.log("DEMANDE DE RÉINITIALISATION MOT DE PASSE");
    console.log("========================================");
    console.log(`Email: ${email}`);
    console.log(`Utilisateur: ${user.prenom_user} ${user.nom_user}`);
    console.log(`Lien de réinitialisation:`);
    console.log(`   ${resetLink}`);
    console.log(`⏰ Expire à: ${expiresAt.toLocaleString("fr-FR")}`);
    console.log("========================================\n");

    // Envoyer l'email
    const emailSent = await sendPasswordResetEmail(
      user.email_user,
      user.prenom_user,
      resetLink
    );

    if (!emailSent) {
      console.error("Échec envoi email, mais token créé");
      // On ne retourne pas d'erreur pour ne pas révéler si l'email existe
    }

    return NextResponse.json({
      success: true,
      message: "Un lien de réinitialisation a été envoyé à votre adresse email",
      // Mode démonstration (projet d'examen) : le lien s'affiche aussi sur la page
      resetLink: resetLink,
    });
  } catch (error) {
    console.error("Erreur POST /api/auth/forgot-password:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}