// src/app/api/auth/register/route.ts
// ============================================================================
// API Inscription - Hotel Booking Bloc 3
// POST /api/auth/register
// 
// Différence Angular → Next.js :
// - Angular : POST vers backend Express séparé
// - Next.js : API Route intégrée dans le même projet
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import {
  createUser,
  emailExists,
  createToken,
  setAuthCookie,
} from "@lib/auth";
import { sendWelcomeEmail } from "@lib/email";

// ============================================================================
// VALIDATION
// ============================================================================
interface RegisterBody {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  tel?: string;
}

function validateRegisterData(data: RegisterBody): string | null {
  if (!data.email || !data.email.includes("@")) {
    return "Email invalide";
  }
  if (!data.password || data.password.length < 6) {
    return "Le mot de passe doit contenir au moins 6 caractères";
  }
  if (!data.nom || data.nom.trim().length < 2) {
    return "Le nom est requis (min 2 caractères)";
  }
  if (!data.prenom || data.prenom.trim().length < 2) {
    return "Le prénom est requis (min 2 caractères)";
  }
  return null;
}

// ============================================================================
// POST /api/auth/register
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const body: RegisterBody = await request.json();

    // 1. Validation des données
    const validationError = validateRegisterData(body);
    if (validationError) {
      return NextResponse.json(
        { success: false, error: validationError },
        { status: 400 }
      );
    }

    // 2. Vérifier si l'email existe déjà
    const exists = await emailExists(body.email.toLowerCase().trim());
    if (exists) {
      return NextResponse.json(
        { success: false, error: "Cet email est déjà utilisé" },
        { status: 409 }
      );
    }

    // 3. Créer l'utilisateur
    const user = await createUser({
      email: body.email.toLowerCase().trim(),
      password: body.password,
      nom: body.nom.trim(),
      prenom: body.prenom.trim(),
      tel: body.tel?.trim(),
    });

    // 4. Créer le token JWT
    const token = await createToken(user);

    // 5. Définir le cookie d'authentification
    await setAuthCookie(token);

    // 6. Envoyer l'email de bienvenue (en arrière-plan, ne bloque pas la réponse)
    sendWelcomeEmail(user.email_user, user.prenom_user).then((sent) => {
      if (sent) {
        console.log("✅ Email de bienvenue envoyé à:", user.email_user);
      } else {
        console.error("❌ Échec envoi email de bienvenue à:", user.email_user);
      }
    });

    // 7. Retourner l'utilisateur (sans le mot de passe)
    return NextResponse.json({
      success: true,
      message: "Inscription réussie",
      user: {
        id_user: user.id_user,
        email: user.email_user,
        nom: user.nom_user,
        prenom: user.prenom_user,
        role: user.role.code_role,
      },
    });
  } catch (error) {
    console.error("Erreur register:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'inscription" },
      { status: 500 }
    );
  }
}