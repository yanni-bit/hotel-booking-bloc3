// src/app/api/reservations/[id]/confirm/route.ts
// ============================================================================
// API Route pour confirmer une réservation après paiement Stripe
// 
// Différence Angular → Next.js :
// - Angular : this.reservationService.updateReservationStatus(id, 2)
// - Next.js : POST /api/reservations/[id]/confirm avec paymentIntentId
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import {
  getReservationById,
  createPayment,
  confirmReservation,
  generateConfirmationNumber,
  updateConfirmationNumber,
} from "@lib/payments";
import { getStripeServer } from "@lib/stripe";
import { sendReservationConfirmationEmail } from "@lib/email";
import prisma from "@lib/prisma";

// ============================================================================
// POST /api/reservations/[id]/confirm
// ============================================================================
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reservationId = Number(id);

    if (isNaN(reservationId)) {
      return NextResponse.json(
        { error: "ID de réservation invalide" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { paymentIntentId } = body;

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "paymentIntentId requis" },
        { status: 400 }
      );
    }

    // Récupérer la réservation
    const reservation = await getReservationById(reservationId);

    if (!reservation) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier que la réservation n'est pas déjà confirmée
    if (reservation.id_statut === 2) {
      return NextResponse.json(
        { error: "Cette réservation est déjà confirmée" },
        { status: 400 }
      );
    }

    // Vérifier le PaymentIntent côté Stripe
    const stripe = getStripeServer();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json(
        { 
          error: "Le paiement n'a pas été confirmé par Stripe",
          status: paymentIntent.status 
        },
        { status: 400 }
      );
    }

    // Vérifier que le montant correspond
    const expectedAmount = Math.round(reservation.total_price * 100);
    if (paymentIntent.amount !== expectedAmount) {
      console.error(
        `⚠️ Montant différent: attendu ${expectedAmount}, reçu ${paymentIntent.amount}`
      );
      // On continue quand même mais on log l'erreur
    }

    // 1. Créer l'enregistrement de paiement dans la BDD
    const paiement = await createPayment({
      id_user: reservation.id_user,
      id_offre: reservation.id_offre,
      montant: reservation.total_price,
      devise: reservation.devise,
      methode_paiement: "stripe",
      reference_externe: paymentIntentId,
      statut_paiement: "succeeded",
    });

    console.log("✅ Paiement créé:", paiement.id_paiement);

    // 2. Générer le numéro de confirmation
    const confirmationNumber = generateConfirmationNumber();

    // 3. Mettre à jour la réservation
    await confirmReservation(
      reservationId,
      paiement.id_paiement,
      paymentIntentId
    );

    // 4. Ajouter le numéro de confirmation
    await updateConfirmationNumber(reservationId, confirmationNumber);

    console.log("✅ Réservation confirmée:", reservationId, confirmationNumber);

    // 5. Récupérer les informations complètes pour l'email
    const reservationComplete = await prisma.reservation.findUnique({
      where: { id_reservation: reservationId },
      include: {
        user: {
          select: {
            email_user: true,
            prenom_user: true,
          },
        },
        offre: {
          include: {
            chambre: {
              include: {
                hotel: {
                  select: {
                    nom_hotel: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // 6. Envoyer l'email de confirmation (en arrière-plan)
    if (reservationComplete && reservationComplete.user) {
      const checkInDate = new Date(reservationComplete.check_in).toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const checkOutDate = new Date(reservationComplete.check_out).toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      sendReservationConfirmationEmail(
        reservationComplete.user.email_user,
        reservationComplete.user.prenom_user,
        {
          numConfirmation: confirmationNumber,
          hotelName: reservationComplete.offre?.chambre?.hotel?.nom_hotel || "Hôtel",
          roomType: reservationComplete.offre?.chambre?.type_room || "Chambre",
          checkIn: checkInDate,
          checkOut: checkOutDate,
          nights: reservationComplete.nbre_nuits,
          adults: reservationComplete.nbre_adults,
          children: reservationComplete.nbre_children,
          totalPrice: Number(reservationComplete.total_price),
        }
      ).then((sent) => {
        if (sent) {
          console.log("✅ Email de confirmation envoyé à:", reservationComplete.user?.email_user);
        } else {
          console.error("❌ Échec envoi email de confirmation à:", reservationComplete.user?.email_user);
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        id_reservation: reservationId,
        id_paiement: paiement.id_paiement,
        num_confirmation: confirmationNumber,
        statut: "Confirmée",
      },
    });
  } catch (error) {
    console.error("❌ Erreur confirmation réservation:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la confirmation" },
      { status: 500 }
    );
  }
}