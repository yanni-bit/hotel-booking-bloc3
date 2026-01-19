// src/app/api/reservations/[id]/cancel/route.ts
// ============================================================================
// API Route: POST /api/reservations/[id]/cancel
// Annule une réservation et envoie un email de confirmation
// 
// Différence Angular → Next.js :
// - Angular : this.reservationService.cancelReservation(id, userId).subscribe()
// - Next.js : fetch(`/api/reservations/${id}/cancel`, { method: 'POST' })
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@lib/auth";
import { cancelReservation, getReservationById } from "@lib/reservations";
import { sendReservationCancellationEmail } from "@lib/email";
import prisma from "@lib/prisma";

// Helper pour formater les dates en français
function formatDateFr(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

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

    // ========================================================================
    // Récupérer les infos complètes AVANT l'annulation (pour l'email)
    // ========================================================================
    const reservationDetails = await prisma.reservation.findUnique({
      where: { id_reservation: reservationId },
      include: {
        hotel: {
          select: {
            nom_hotel: true,
          },
        },
        chambre: {
          select: {
            type_room: true,
          },
        },
        user: {
          select: {
            email_user: true,
            prenom_user: true,
          },
        },
      },
    });

    // Annuler la réservation
    await cancelReservation(reservationId, user.id_user);

    console.log("✅ Réservation annulée:", reservationId);

    // ========================================================================
    // Envoyer l'email de confirmation d'annulation (en arrière-plan)
    // ========================================================================
    if (reservationDetails) {
      const emailData = {
        numConfirmation: reservationDetails.num_confirmation || `RES-${reservationId}`,
        hotelName: reservationDetails.hotel.nom_hotel,
        roomType: reservationDetails.chambre.type_room,
        checkIn: formatDateFr(reservationDetails.check_in),
        checkOut: formatDateFr(reservationDetails.check_out),
        nights: reservationDetails.nbre_nuits,
        totalPrice: Number(reservationDetails.total_price),
      };

      sendReservationCancellationEmail(
        reservationDetails.user.email_user,
        reservationDetails.user.prenom_user,
        emailData
      ).then((sent) => {
        if (sent) {
          console.log("✅ Email d'annulation envoyé à:", reservationDetails.user.email_user);
        } else {
          console.error("❌ Échec envoi email d'annulation à:", reservationDetails.user.email_user);
        }
      });
    }

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