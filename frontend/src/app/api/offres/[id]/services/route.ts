// src/app/api/hotels/[id]/services/route.ts
// ============================================================================
// API Route: GET /api/hotels/:id/services
// Services additionnels disponibles pour un hôtel
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getHotelServices, HotelServicesList } from "@lib/reservations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const hotelId = parseInt(id);

    if (isNaN(hotelId)) {
      return NextResponse.json(
        { error: "ID d'hôtel invalide" },
        { status: 400 }
      );
    }

    const services = await getHotelServices(hotelId);

    // Transformer les données pour le frontend
    const formattedServices = services.map((hs: HotelServicesList[number]) => ({
      id_hotel_service: hs.id_hotel_service,
      id_service: hs.service.id_service,
      nom_service: hs.service.nom_service,
      description_service: hs.service.description_service,
      type_service: hs.service.type_service,
      icone_service: hs.service.icone_service,
      prix_service: Number(hs.prix),
    }));

    return NextResponse.json({
      success: true,
      data: formattedServices,
    });
  } catch (error) {
    console.error("❌ Erreur récupération services:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des services" },
      { status: 500 }
    );
  }
}