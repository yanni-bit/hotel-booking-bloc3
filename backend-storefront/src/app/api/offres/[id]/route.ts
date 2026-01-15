// src/app/api/offres/[id]/route.ts
// ============================================================================
// API Route: GET /api/offres/:id
// Détails d'une offre spécifique
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getOffreById } from "@lib/reservations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const offreId = parseInt(id);

    if (isNaN(offreId)) {
      return NextResponse.json(
        { error: "ID d'offre invalide" },
        { status: 400 }
      );
    }

    const offre = await getOffreById(offreId);

    if (!offre) {
      return NextResponse.json(
        { error: "Offre non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: offre,
    });
  } catch (error) {
    console.error("❌ Erreur récupération offre:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'offre" },
      { status: 500 }
    );
  }
}