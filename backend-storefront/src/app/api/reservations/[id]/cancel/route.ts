// src/app/api/reservations/[id]/cancel/route.ts
// ============================================================================
// API Route: POST /api/reservations/[id]/cancel
// Annule une réservation
// 
// Différence Angular → Next.js :
// - Angular : this.reservationService.cancelReservation(id, userId).subscribe()
// - Next.js : fetch(`/api/reservations/${id}/cancel`, { method: 'POST' })
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@lib/auth";
import { cancelReservation, getReservationById } from "@lib/reservations";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reservationId = Number(id);

    if (isNaN(reservationId)) {
      return NextResponse.json(
        { success: false, error: "ID de réservation invalide" },
        { status: 400 }
      );
    }

    // Vérifier l'authentification
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Vérifier que la réservation existe et appartient à l'utilisateur
    const reservation = await getReservationById(reservationId);

    if (!reservation) {
      return NextResponse.json(
        { success: false, error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    if (reservation.id_user !== user.id_user) {
      return NextResponse.json(
        { success: false, error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Vérifier que la réservation n'est pas déjà annulée
    if (reservation.id_statut === 3) {
      return NextResponse.json(
        { success: false, error: "Cette réservation est déjà annulée" },
        { status: 400 }
      );
    }

    // Annuler la réservation
    await cancelReservation(reservationId, user.id_user);

    console.log("✅ Réservation annulée:", reservationId);

    return NextResponse.json({
      success: true,
      message: "Réservation annulée avec succès",
    });
  } catch (error) {
    console.error("❌ Erreur annulation:", error);
    return NextResponse.json(
      { success: false, error: "Erreur lors de l'annulation" },
      { status: 500 }
    );
  }
}