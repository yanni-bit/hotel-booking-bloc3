// src/app/robots.ts
// ============================================================================
// Génère /robots.txt (Next.js Metadata API). L'admin et l'API ne sont pas
// destinés aux moteurs de recherche.
// ============================================================================

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/fr/admin", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
