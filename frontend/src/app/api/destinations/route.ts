// app/api/destinations/route.ts
// ============================================================================
// API Route: GET /api/destinations
// Liste des destinations avec comptage d'hôtels
// ============================================================================

import { NextResponse } from "next/server";
import { getDestinations } from "@lib/hotels";

export async function GET() {
  try {
    const destinations = await getDestinations();

    return NextResponse.json(destinations);
  } catch (error) {
    console.error("Error fetching destinations:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des destinations" },
      { status: 500 }
    );
  }
}
