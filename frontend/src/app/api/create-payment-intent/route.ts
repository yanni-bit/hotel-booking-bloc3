// src/app/api/create-payment-intent/route.ts
// ============================================================================
// API Route pour créer un PaymentIntent Stripe
// 
// Différence Angular → Next.js :
// - Angular : Service backend séparé (Express/Node.js)
// - Next.js : API Route intégrée dans le même projet
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getStripeServer } from "@lib/stripe";
import { getReservationById } from "@lib/payments";

// ============================================================================
// POST /api/create-payment-intent
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reservationId } = body;

    // Validation
    if (!reservationId) {
      return NextResponse.json(
        { error: "reservationId requis" },
        { status: 400 }
      );
    }

    // Récupérer la réservation
    const reservation = await getReservationById(Number(reservationId));

    if (!reservation) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier que la réservation n'est pas déjà payée
    if (reservation.id_statut === 2) {
      return NextResponse.json(
        { error: "Cette réservation est déjà confirmée" },
        { status: 400 }
      );
    }

    // Initialiser Stripe
    const stripe = getStripeServer();

    // Convertir le montant en centimes (Stripe utilise les centimes)
    // 150.50€ → 15050 centimes
    const amountInCents = Math.round(reservation.total_price * 100);

    // Créer le PaymentIntent
    // C'est ici que Stripe "réserve" le montant
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: reservation.devise.toLowerCase(),
      // Metadata pour référence (visible dans le dashboard Stripe)
      metadata: {
        reservation_id: reservation.id_reservation.toString(),
        hotel_name: reservation.hotel.nom_hotel,
        check_in: reservation.check_in.toISOString().split("T")[0],
        check_out: reservation.check_out.toISOString().split("T")[0],
      },
      // Description qui apparaît sur le relevé bancaire du client
      description: `Réservation ${reservation.hotel.nom_hotel} - ${reservation.nbre_nuits} nuit(s)`,
      // Activer la capture automatique (le paiement est immédiat)
      capture_method: "automatic",
      // Types de paiement acceptés
      payment_method_types: ["card"],
    });

    console.log("✅ PaymentIntent créé:", paymentIntent.id);

    // Retourner le clientSecret au frontend
    // C'est ce secret qui permet à Stripe Elements de finaliser le paiement
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: reservation.total_price,
      currency: reservation.devise,
    });
  } catch (error) {
    console.error("❌ Erreur création PaymentIntent:", error);

    // Gérer les erreurs Stripe spécifiques
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Erreur lors de la création du paiement" },
      { status: 500 }
    );
  }
}