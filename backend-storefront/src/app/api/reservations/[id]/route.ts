// src/app/api/reservations/[id]/route.ts
// ============================================================================
// API Route: GET /api/reservations/[id]
// Récupère le détail d'une réservation
// 
// Différence Angular → Next.js :
// - Angular : this.reservationService.getReservationById(id, userId)
// - Next.js : fetch(`/api/reservations/${id}`) avec auth via cookie
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@lib/auth";
import prisma from "@lib/prisma";

export async function GET(
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

    // Récupérer la réservation avec toutes les relations
    const reservation = await prisma.reservation.findUnique({
      where: { id_reservation: reservationId },
      include: {
        hotel: {
          select: {
            id_hotel: true,
            nom_hotel: true,
            ville_hotel: true,
            pays_hotel: true,
            img_hotel: true,
            nbre_etoile_hotel: true,
          },
        },
        chambre: {
          select: {
            id_chambre: true,
            type_room: true,
            cat_room: true,
          },
        },
        offre: {
          select: {
            id_offre: true,
            nom_offre: true,
            pension: true,
          },
        },
        statut: {
          select: {
            id_statut: true,
            nom_statut: true,
            couleur: true,
          },
        },
        services: {
          include: {
            hotel_service: {
              include: {
                service: {
                  select: {
                    nom_service: true,
                    icone_service: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!reservation) {
      return NextResponse.json(
        { success: false, error: "Réservation non trouvée" },
        { status: 404 }
      );
    }

    // Vérifier que la réservation appartient à l'utilisateur
    if (reservation.id_user !== user.id_user) {
      return NextResponse.json(
        { success: false, error: "Non autorisé" },
        { status: 403 }
      );
    }

    // Formater les données
    const formattedReservation = {
      id_reservation: reservation.id_reservation,
      num_confirmation: reservation.num_confirmation || "",
      check_in: reservation.check_in.toISOString(),
      check_out: reservation.check_out.toISOString(),
      nbre_nuits: reservation.nbre_nuits,
      nbre_adults: reservation.nbre_adults,
      nbre_children: reservation.nbre_children,
      prix_nuit: Number(reservation.prix_nuit),
      total_price: Number(reservation.total_price),
      devise: reservation.devise,
      special_requests: reservation.special_requests,
      date_reservation: reservation.date_reservation.toISOString(),
      id_statut: reservation.id_statut ?? 1,
      statut: {
        nom_statut: reservation.statut?.nom_statut ?? "En attente",
        couleur: reservation.statut?.couleur ?? "secondary",
      },
      hotel: {
        id_hotel: reservation.hotel.id_hotel,
        nom_hotel: reservation.hotel.nom_hotel,
        ville_hotel: reservation.hotel.ville_hotel,
        pays_hotel: reservation.hotel.pays_hotel,
        img_hotel: reservation.hotel.img_hotel || "",
        nbre_etoile_hotel: reservation.hotel.nbre_etoile_hotel,
      },
      chambre: {
        id_chambre: reservation.chambre.id_chambre,
        type_room: reservation.chambre.type_room,
        cat_room: reservation.chambre.cat_room,
      },
      offre: {
        id_offre: reservation.offre.id_offre,
        nom_offre: reservation.offre.nom_offre,
        pension: reservation.offre.pension,
      },
      services: reservation.services.map((s) => ({
        id_reservation_service: s.id_reservation_service,
        nom_service: s.hotel_service.service.nom_service,
        icone_service: s.hotel_service.service.icone_service,
        quantite: s.quantite,
        prix_unitaire: Number(s.prix_unitaire),
        sous_total: Number(s.sous_total),
      })),
    };

    return NextResponse.json({
      success: true,
      data: formattedReservation,
    });
  } catch (error) {
    console.error("❌ Erreur récupération réservation:", error);
    return NextResponse.json(
      { success: false, error: "Erreur serveur" },
      { status: 500 }
    );
  }
}