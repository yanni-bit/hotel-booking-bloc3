// src/app/api/chambres/[id]/route.ts
// ============================================================================
// API Route: GET /api/chambres/[id]
// Récupère une chambre avec ses offres
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getChambreWithOffersById } from "@lib/chambres";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const chambreId = parseInt(id);

    if (isNaN(chambreId)) {
      return NextResponse.json(
        { success: false, message: "ID de chambre invalide" },
        { status: 400 }
      );
    }

    const chambre = await getChambreWithOffersById(chambreId);

    if (!chambre) {
      return NextResponse.json(
        { success: false, message: "Chambre non trouvée" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: chambre,
    });
  } catch (error) {
    console.error("❌ Erreur récupération chambre:", error);
    return NextResponse.json(
      { success: false, message: "Erreur serveur" },
      { status: 500 }
    );
  }
}