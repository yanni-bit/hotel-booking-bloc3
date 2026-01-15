// src/app/api/reservations/user/route.ts
// ============================================================================
// API Route: GET /api/reservations/user
// Récupère les réservations de l'utilisateur connecté
//
// Différence Angular → Next.js :
// - Angular : this.reservationService.getUserReservations(user.id_user)
// - Next.js : fetch('/api/reservations/user') avec cookie HttpOnly automatique
// ============================================================================

import { NextResponse } from "next/server";
import { getCurrentUser } from "@lib/auth";
import { getUserReservations } from "@lib/reservations";

export async function GET() {
  try {
    // Récupérer l'utilisateur depuis le cookie (Server-side)
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Récupérer les réservations
    const reservations = await getUserReservations(user.id_user);

    // Formater les données pour le frontend
    const formattedReservations = reservations.map((r) => ({
      id_reservation: r.id_reservation,
      num_confirmation: r.num_confirmation,
      check_in: r.check_in,
      check_out: r.check_out,
      nbre_nuits: r.nbre_nuits,
      nbre_adults: r.nbre_adults,
      nbre_children: r.nbre_children,
      total_price: Number(r.total_price),
      devise: r.devise,
      date_reservation: r.date_reservation,
      id_statut: r.id_statut ?? 1,
      statut: {
        nom_statut: r.statut?.nom_statut ?? "En attente",
        couleur_statut: r.statut?.couleur ?? "secondary", // ← couleur (pas couleur_statut)
      },
      hotel: {
        nom_hotel: r.hotel.nom_hotel,
        ville_hotel: r.hotel.ville_hotel,
        img_hotel: r.hotel.img_hotel,
      },
      chambre: {
        type_room: r.chambre.type_room,
      },
    }));

    return NextResponse.json({
      success: true,
      data: formattedReservations,
    });
  } catch (error) {
    console.error("❌ Erreur récupération réservations:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
