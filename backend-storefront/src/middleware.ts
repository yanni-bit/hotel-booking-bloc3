import { HttpTypes } from "@medusajs/types"
import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

const BACKEND_URL = process.env.MEDUSA_BACKEND_URL
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us"

// ============================================================================
// AUTH CONFIG
// ============================================================================
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "hotel-booking-secret-key-change-in-production"
)

// Routes qui nécessitent une authentification
const PROTECTED_ROUTES = ["/profil", "/mes-reservations", "/payment"]

// Routes réservées aux admins
const ADMIN_ROUTES = ["/admin"]

// Routes accessibles uniquement si NON connecté
const AUTH_ROUTES = ["/login", "/register", "/forgot-password"]

// ============================================================================
// REGION MAP CACHE (Medusa)
// ============================================================================
const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
}

async function getRegionMap(cacheId: string) {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (!BACKEND_URL) {
    throw new Error(
      "Middleware.ts: Error fetching regions. Did you set up regions in your Medusa Admin and define a MEDUSA_BACKEND_URL environment variable? Note that the variable is no longer named NEXT_PUBLIC_MEDUSA_BACKEND_URL."
    )
  }

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    const { regions } = await fetch(`${BACKEND_URL}/store/regions`, {
      headers: {
        "x-publishable-api-key": PUBLISHABLE_API_KEY!,
      },
      next: {
        revalidate: 3600,
        tags: [`regions-${cacheId}`],
      },
      cache: "force-cache",
    }).then(async (response) => {
      const json = await response.json()

      if (!response.ok) {
        throw new Error(json.message)
      }

      return json
    })

    if (!regions?.length) {
      throw new Error(
        "No regions found. Please set up regions in your Medusa Admin."
      )
    }

    regions.forEach((region: HttpTypes.StoreRegion) => {
      region.countries?.forEach((c) => {
        regionMapCache.regionMap.set(c.iso_2 ?? "", region)
      })
    })

    regionMapCache.regionMapUpdated = Date.now()
  }

  return regionMapCache.regionMap
}

async function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion | number>
) {
  try {
    let countryCode

    const vercelCountryCode = request.headers
      .get("x-vercel-ip-country")
      ?.toLowerCase()

    const urlCountryCode = request.nextUrl.pathname.split("/")[1]?.toLowerCase()

    if (urlCountryCode && regionMap.has(urlCountryCode)) {
      countryCode = urlCountryCode
    } else if (vercelCountryCode && regionMap.has(vercelCountryCode)) {
      countryCode = vercelCountryCode
    } else if (regionMap.has(DEFAULT_REGION)) {
      countryCode = DEFAULT_REGION
    } else if (regionMap.keys().next().value) {
      countryCode = regionMap.keys().next().value
    }

    return countryCode
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "Middleware.ts: Error getting the country code. Did you set up regions in your Medusa Admin and define a MEDUSA_BACKEND_URL environment variable? Note that the variable is no longer named NEXT_PUBLIC_MEDUSA_BACKEND_URL."
      )
    }
  }
}

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
// ============================================================================
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  let redirectUrl = request.nextUrl.href
  let response = NextResponse.redirect(redirectUrl, 307)
  let cacheIdCookie = request.cookies.get("_medusa_cache_id")
  let cacheId = cacheIdCookie?.value || crypto.randomUUID()

  const regionMap = await getRegionMap(cacheId)
  const countryCode = regionMap && (await getCountryCode(request, regionMap))

  const urlHasCountryCode =
    countryCode && pathname.split("/")[1].includes(countryCode)

  // ============================================================================
  // AUTH CHECK (après avoir déterminé le countryCode)
  // ============================================================================
  if (urlHasCountryCode && countryCode) {
    const routePath = "/" + pathname.split("/").slice(2).join("/")
    const user = await getAuthUser(request)

    // Routes protégées → redirection vers login si non connecté
    const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
      routePath.startsWith(route)
    )

    if (isProtectedRoute && !user) {
      const loginUrl = new URL(`/${countryCode}/login`, request.url)
      loginUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Routes admin → vérifier le rôle
    const isAdminRoute = ADMIN_ROUTES.some((route) =>
      routePath.startsWith(route)
    )

    if (isAdminRoute) {
      if (!user) {
        const loginUrl = new URL(`/${countryCode}/login`, request.url)
        loginUrl.searchParams.set("redirect", pathname)
        return NextResponse.redirect(loginUrl)
      }

      if (user.role !== "admin") {
        return NextResponse.redirect(new URL(`/${countryCode}`, request.url))
      }
    }

    // Routes auth (login/register) → redirection si déjà connecté
    const isAuthRoute = AUTH_ROUTES.some((route) =>
      routePath.startsWith(route)
    )

    if (isAuthRoute && user) {
      return NextResponse.redirect(new URL(`/${countryCode}`, request.url))
    }
  }

  // ============================================================================
  // MEDUSA REGION LOGIC (existant)
  // ============================================================================
  if (urlHasCountryCode && cacheIdCookie) {
    return NextResponse.next()
  }

  if (urlHasCountryCode && !cacheIdCookie) {
    response.cookies.set("_medusa_cache_id", cacheId, {
      maxAge: 60 * 60 * 24,
    })
    return response
  }

  if (pathname.includes(".")) {
    return NextResponse.next()
  }

  const redirectPath = pathname === "/" ? "" : pathname
  const queryString = request.nextUrl.search ? request.nextUrl.search : ""

  if (!urlHasCountryCode && countryCode) {
    redirectUrl = `${request.nextUrl.origin}/${countryCode}${redirectPath}${queryString}`
    response = NextResponse.redirect(`${redirectUrl}`, 307)
  } else if (!urlHasCountryCode && !countryCode) {
    return new NextResponse(
      "No valid regions configured. Please set up regions with countries in your Medusa Admin.",
      { status: 500 }
    )
  }

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}