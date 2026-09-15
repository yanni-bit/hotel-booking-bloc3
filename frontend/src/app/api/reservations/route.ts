// src/app/api/reservations/route.ts
// ============================================================================
// API Route: POST /api/reservations
// Création d'une nouvelle réservation
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createReservation, CreateReservationInput } from "@lib/reservations";

export async function POST(request: NextRequest) {
  try {
    const body: CreateReservationInput = await request.json();

    // Validation des champs requis
    if (!body.id_offre || !body.id_user || !body.id_hotel || !body.id_chambre) {
      return NextResponse.json(
        { error: "Champs requis manquants: id_offre, id_user, id_hotel, id_chambre" },
        { status: 400 }
      );
    }

    if (!body.check_in || !body.check_out) {
      return NextResponse.json(
        { error: "Dates de séjour requises: check_in, check_out" },
        { status: 400 }
      );
    }

    if (!body.nbre_nuits || body.nbre_nuits < 1) {
      return NextResponse.json(
        { error: "Nombre de nuits invalide" },
        { status: 400 }
      );
    }

    if (!body.nbre_adults || body.nbre_adults < 1) {
      return NextResponse.json(
        { error: "Nombre d'adultes invalide" },
        { status: 400 }
      );
    }

    // Créer la réservation
    const reservation = await createReservation(body);

    console.log("✅ Réservation créée:", reservation.num_confirmation);

    return NextResponse.json({
      success: true,
      data: {
        id_reservation: reservation.id_reservation,
        num_confirmation: reservation.num_confirmation,
      },
    });
  } catch (error) {
    console.error("❌ Erreur création réservation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la réservation" },
      { status: 500 }
    );
  }
}