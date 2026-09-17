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

// Nom du cookie de session (le même que dans login/logout et le middleware)
const AUTH_COOKIE = "auth-token";

// Construit une réponse "non authentifié" qui supprime aussi le cookie :
// un token valide qui ne correspond plus à aucun utilisateur (compte supprimé,
// base réinitialisée) ne doit pas laisser le navigateur dans un état incohérent
// où le middleware voit une session et le front ne voit personne.
function unauthenticated(error: string) {
  const response = NextResponse.json({ success: false, error }, { status: 401 });
  response.cookies.set(AUTH_COOKIE, "", { maxAge: 0, path: "/" });
  return response;
}

// ============================================================================
// GET /api/auth/me
// ============================================================================
export async function GET() {
  try {
    // 1. Récupérer le payload du token
    const payload = await getCurrentUser();
    
    // Pas de session : réponse 200 avec user null. Un visiteur anonyme n'est
    // pas une erreur (un 401 ici polluait la console et le score Lighthouse).
    if (!payload) {
      return NextResponse.json({ success: false, user: null });
    }

    // 2. Récupérer les infos fraîches depuis la BDD
    const user = await findUserById(payload.id_user);
    
    // Token valide mais utilisateur inexistant → session orpheline, on la ferme
    if (!user) {
      return unauthenticated("Utilisateur non trouvé");
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
