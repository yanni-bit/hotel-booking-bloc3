// src/app/api/user/profile/route.ts
// ============================================================================
// API Profil Utilisateur - Hotel Booking Bloc 3
// GET : Récupérer les infos du profil
// PUT : Mettre à jour les infos du profil
//
// Différence Angular → Next.js :
// - Angular : AuthService.updateProfile() appelle Express backend
// - Next.js : API Route intégrée, même projet, cookies HttpOnly
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@lib/auth";
import prisma from "@lib/prisma";

// ============================================================================
// GET - Récupérer le profil complet (avec adresse)
// ============================================================================
export async function GET() {
  try {
    // Vérifier l'authentification
    const currentUser = await getCurrentUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Récupérer l'utilisateur avec son adresse
    const user = await prisma.utilisateur.findUnique({
      where: { id_user: currentUser.id_user },
      select: {
        id_user: true,
        nom_user: true,
        prenom_user: true,
        email_user: true,
        tel_user: true,
        date_inscription: true,
        derniere_connexion: true,
        role: {
          select: {
            id_role: true,
            code_role: true,
            nom_role: true,
          },
        },
        adresse: {
          select: {
            id_adress_user: true,
            rue_user: true,
            complement_user: true,
            code_postal_user: true,
            ville_user: true,
            pays_user: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id_user: user.id_user,
        nom: user.nom_user,
        prenom: user.prenom_user,
        email: user.email_user,
        tel: user.tel_user,
        role: user.role.code_role,
        nom_role: user.role.nom_role,
        date_inscription: user.date_inscription,
        derniere_connexion: user.derniere_connexion,
        adresse: user.adresse
          ? {
              rue: user.adresse.rue_user,
              complement: user.adresse.complement_user,
              code_postal: user.adresse.code_postal_user,
              ville: user.adresse.ville_user,
              pays: user.adresse.pays_user,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Erreur GET /api/user/profile:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// ============================================================================
// PUT - Mettre à jour le profil
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
    const { nom, prenom, tel, adresse } = body;

    // Validation
    if (!nom || !prenom) {
      return NextResponse.json(
        { success: false, error: "Le nom et le prénom sont obligatoires" },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur actuel pour voir s'il a une adresse
    const existingUser = await prisma.utilisateur.findUnique({
      where: { id_user: currentUser.id_user },
      select: { id_adress_user: true },
    });

    let adresseId = existingUser?.id_adress_user;

    // Gérer l'adresse si fournie
    if (adresse) {
      if (adresseId) {
        // Mettre à jour l'adresse existante
        await prisma.adresseUser.update({
          where: { id_adress_user: adresseId },
          data: {
            rue_user: adresse.rue || null,
            complement_user: adresse.complement || null,
            code_postal_user: adresse.code_postal || null,
            ville_user: adresse.ville || null,
            pays_user: adresse.pays || null,
          },
        });
      } else {
        // Créer une nouvelle adresse
        const newAdresse = await prisma.adresseUser.create({
          data: {
            rue_user: adresse.rue || null,
            complement_user: adresse.complement || null,
            code_postal_user: adresse.code_postal || null,
            ville_user: adresse.ville || null,
            pays_user: adresse.pays || null,
          },
        });
        adresseId = newAdresse.id_adress_user;
      }
    }

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.utilisateur.update({
      where: { id_user: currentUser.id_user },
      data: {
        nom_user: nom,
        prenom_user: prenom,
        tel_user: tel || null,
        id_adress_user: adresseId,
      },
      select: {
        id_user: true,
        nom_user: true,
        prenom_user: true,
        email_user: true,
        tel_user: true,
        role: {
          select: {
            code_role: true,
            nom_role: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profil mis à jour avec succès",
      user: {
        id_user: updatedUser.id_user,
        nom: updatedUser.nom_user,
        prenom: updatedUser.prenom_user,
        email: updatedUser.email_user,
        tel: updatedUser.tel_user,
        role: updatedUser.role.code_role,
      },
    });
  } catch (error) {
    console.error("Erreur PUT /api/user/profile:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}