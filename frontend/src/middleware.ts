// src/middleware.ts
// ============================================================================
// Middleware applicatif - Hotel Booking Bloc 3
//
// Exécuté avant le rendu de chaque page, il remplit deux rôles :
//   1. préfixe de locale — toute URL sans code pays est redirigée vers /fr/… ;
//   2. gardes de route — vérification du cookie JWT selon trois listes
//      (routes protégées, routes admin, routes réservées aux visiteurs).
//
// Deux points structurants, souvent mal compris :
//
// - Le JWT est vérifié avec `jose` et non `jsonwebtoken`. Le middleware
//   s'exécute dans l'Edge Runtime, qui ne dispose pas des modules Node.js ;
//   `jose` repose sur l'API Web Crypto, disponible dans les deux
//   environnements.
//
// - Le `matcher` en bas de fichier EXCLUT /api. Les routes API ne passent
//   donc jamais par ici : chacune vérifie la session elle-même, via
//   getCurrentUser() ou requireAdmin(). Ce middleware filtre des URL, il ne
//   protège pas des données — c'est la vérification côté serveur qui le fait.
// ============================================================================

import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

// ============================================================================
// CONFIG
// ============================================================================

// Codes pays supportés dans l'URL (/fr/...). Liste statique : plus d'appel
// réseau vers un backend pour déterminer la région.
const COUNTRY_CODES = ["fr"] as const
const DEFAULT_COUNTRY = "fr"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "hotel-booking-secret-key-change-in-production"
)

// Routes qui nécessitent une authentification
const PROTECTED_ROUTES = ["/profil", "/mes-reservations", "/payment", "/reservations"]

// Routes réservées aux admins (rôle "admin" dans le JWT)
const ADMIN_ROUTES = ["/admin"]

// Routes accessibles uniquement si NON connecté
const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password"]

// ============================================================================
// AUTH HELPER
// ============================================================================
async function getAuthUser(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload
  } catch {
    return null
  }
}

// ============================================================================
// MIDDLEWARE
// Équivalent Angular : un CanActivate global + une redirection de locale.
// ============================================================================
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  // Fichiers statiques (favicon, images...) : on laisse passer
  if (pathname.includes(".")) {
    return NextResponse.next()
  }

  const firstSegment = pathname.split("/")[1]?.toLowerCase() ?? ""
  const hasCountryCode = (COUNTRY_CODES as readonly string[]).includes(firstSegment)

  // 1. Pas de code pays dans l'URL → redirection vers /fr/...
  if (!hasCountryCode) {
    const redirectPath = pathname === "/" ? "" : pathname
    return NextResponse.redirect(
      new URL(`/${DEFAULT_COUNTRY}${redirectPath}${search}`, request.url),
      307
    )
  }

  // 2. Guards d'authentification
  const countryCode = firstSegment
  const routePath = "/" + pathname.split("/").slice(2).join("/")
  const user = await getAuthUser(request)

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    routePath.startsWith(route)
  )
  const isAdminRoute = ADMIN_ROUTES.some((route) => routePath.startsWith(route))
  const isAuthRoute = AUTH_ROUTES.some((route) => routePath.startsWith(route))

  // Route protégée ou admin sans utilisateur → login avec retour
  if ((isProtectedRoute || isAdminRoute) && !user) {
    const loginUrl = new URL(`/${countryCode}/login`, request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Route admin avec un utilisateur non admin → accueil
  if (isAdminRoute && user?.role !== "admin") {
    return NextResponse.redirect(new URL(`/${countryCode}`, request.url))
  }

  // Route d'auth alors qu'on est déjà connecté → accueil
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL(`/${countryCode}`, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}