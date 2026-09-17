// src/app/sitemap.ts
// ============================================================================
// Génère /sitemap.xml : pages publiques + une entrée par hôtel (Prisma).
// ============================================================================

import type { MetadataRoute } from "next"
import prisma from "@lib/prisma"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000"

  const pages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/fr`, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/fr/hotels`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/fr/contact`, changeFrequency: "yearly", priority: 0.3 },
  ]

  const hotels = await prisma.hotel.findMany({
    select: { id_hotel: true },
    orderBy: { id_hotel: "asc" },
  })

  const hotelPages: MetadataRoute.Sitemap = hotels.map((h) => ({
    url: `${baseUrl}/fr/hotels/${h.id_hotel}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }))

  return [...pages, ...hotelPages]
}
