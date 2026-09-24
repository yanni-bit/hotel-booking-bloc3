// src/app/api/reservations/[id]/confirm/route.ts
// ============================================================================
// API Route pour confirmer une réservation après paiement Stripe
//
// Cette route transforme un paiement en réservation confirmée : c'est le
// point le plus sensible du parcours. Quatre contrôles y sont appliqués :
//   1. l'appelant est authentifié ;
//   2. la réservation lui appartient ;
//   3. le PaymentIntent a bien réussi, porte le bon montant et référence
//      cette réservation précise (metadata.reservation_id) ;
//   4. ce PaymentIntent n'a pas déjà servi pour un autre paiement (anti-rejeu).
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
import { getCurrentUser } from "@lib/auth";
import prisma from "@lib/prisma";

// ============================================================================
// POST /api/reservations/[id]/confirm
// ============================================================================
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // ------------------------------------------------------------------
    // 1. AUTHENTIFICATION
    // ------------------------------------------------------------------
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 },
      );
    }

    const { id } = await params;
    const reservationId = Number(id);

    if (isNaN(reservationId)) {
      return NextResponse.json(
        { error: "ID de réservation invalide" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { paymentIntentId } = body;

    if (!paymentIntentId || typeof paymentIntentId !== "string") {
      return NextResponse.json(
        { error: "paymentIntentId requis" },
        { status: 400 },
      );
    }

    // Récupérer la réservation
    const reservation = await getReservationById(reservationId);

    if (!reservation) {
      return NextResponse.json(
        { error: "Réservation non trouvée" },
        { status: 404 },
      );
    }

    // ------------------------------------------------------------------
    // 2. CONTRÔLE DE PROPRIÉTÉ
    // ------------------------------------------------------------------
    if (reservation.id_user !== user.id_user) {
      return NextResponse.json(
        { error: "Accès refusé à cette réservation" },
        { status: 403 },
      );
    }

    // Vérifier que la réservation n'est pas déjà confirmée
    if (reservation.id_statut === 2) {
      return NextResponse.json(
        { error: "Cette réservation est déjà confirmée" },
        { status: 400 },
      );
    }

    // ------------------------------------------------------------------
    // 3. ANTI-REJEU
    // Un même PaymentIntent ne peut pas confirmer deux réservations.
    // ------------------------------------------------------------------
    const paiementExistant = await prisma.paiement.findFirst({
      where: { reference_externe: paymentIntentId },
      select: { id_paiement: true },
    });

    if (paiementExistant) {
      return NextResponse.json(
        { error: "Ce paiement a déjà été utilisé" },
        { status: 409 },
      );
    }

    // ------------------------------------------------------------------
    // 4. VÉRIFICATION DU PAIEMENT CÔTÉ STRIPE
    // Stripe est la source de vérité : statut, montant et rattachement.
    // ------------------------------------------------------------------
    const stripe = getStripeServer();
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return NextResponse.json(
        {
          error: "Le paiement n'a pas été confirmé par Stripe",
          status: paymentIntent.status,
        },
        { status: 400 },
      );
    }

    // Le PaymentIntent doit référencer CETTE réservation
    const metadataReservationId = paymentIntent.metadata?.reservation_id;

    if (metadataReservationId !== String(reservationId)) {
      console.error(
        `PaymentIntent ${paymentIntentId} rattaché à la réservation ${metadataReservationId}, pas ${reservationId}`,
      );
      return NextResponse.json(
        { error: "Ce paiement ne correspond pas à cette réservation" },
        { status: 400 },
      );
    }

    // Le montant encaissé doit correspondre au montant dû : bloquant.
    const expectedAmount = Math.round(Number(reservation.total_price) * 100);

    if (paymentIntent.amount !== expectedAmount) {
      console.error(
        `Montant différent: attendu ${expectedAmount}, reçu ${paymentIntent.amount}`,
      );
      return NextResponse.json(
        {
          error:
            "Le montant payé ne correspond pas au montant de la réservation",
        },
        { status: 400 },
      );
    }

    // La devise aussi
    if (paymentIntent.currency !== reservation.devise.toLowerCase()) {
      return NextResponse.json(
        { error: "Devise du paiement incohérente" },
        { status: 400 },
      );
    }

    // ------------------------------------------------------------------
    // 5. ENREGISTREMENT
    // ------------------------------------------------------------------
    const paiement = await createPayment({
      id_user: reservation.id_user,
      id_offre: reservation.id_offre,
      montant: reservation.total_price,
      devise: reservation.devise,
      methode_paiement: "stripe",
      reference_externe: paymentIntentId,
      statut_paiement: "succeeded",
    });

    console.log("Paiement créé:", paiement.id_paiement);

    const confirmationNumber = generateConfirmationNumber();

    await confirmReservation(
      reservationId,
      paiement.id_paiement,
      paymentIntentId,
    );

    await updateConfirmationNumber(reservationId, confirmationNumber);

    console.log("Réservation confirmée:", reservationId, confirmationNumber);

    // ------------------------------------------------------------------
    // 6. EMAIL DE CONFIRMATION (en arrière-plan)
    // ------------------------------------------------------------------
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

    if (reservationComplete && reservationComplete.user) {
      const checkInDate = new Date(
        reservationComplete.check_in,
      ).toLocaleDateString("fr-FR", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const checkOutDate = new Date(
        reservationComplete.check_out,
      ).toLocaleDateString("fr-FR", {
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
          hotelName:
            reservationComplete.offre?.chambre?.hotel?.nom_hotel || "Hôtel",
          roomType: reservationComplete.offre?.chambre?.type_room || "Chambre",
          checkIn: checkInDate,
          checkOut: checkOutDate,
          nights: reservationComplete.nbre_nuits,
          adults: reservationComplete.nbre_adults,
          children: reservationComplete.nbre_children,
          totalPrice: Number(reservationComplete.total_price),
        },
      ).then((sent) => {
        if (sent) {
          console.log(
            "Email de confirmation envoyé à:",
            reservationComplete.user?.email_user,
          );
        } else {
          console.error(
            "Échec envoi email de confirmation à:",
            reservationComplete.user?.email_user,
          );
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
    console.error("Erreur confirmation réservation:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Erreur lors de la confirmation" },
      { status: 500 },
    );
  }
}
