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