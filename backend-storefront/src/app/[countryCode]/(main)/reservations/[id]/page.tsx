// src/app/[countryCode]/(main)/reservations/[id]/page.tsx
// ============================================================================
// Page détail réservation - Server Component
// 
// Différence Angular → Next.js :
// - Angular : Route guard + this.route.params.subscribe()
// - Next.js : Vérification auth dans Server Component + redirect()
// ============================================================================

import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@lib/auth";
import prisma from "@lib/prisma";
import ReservationDetail from "@modules/reservations/components/ReservationDetail";

interface ReservationDetailPageProps {
  params: Promise<{ id: string; countryCode: string }>;
}

export async function generateMetadata({ params }: ReservationDetailPageProps) {
  const { id } = await params;
  
  return {
    title: `Réservation #${id} | Hotel Booking`,
    description: "Détail de votre réservation d'hôtel.",
  };
}

export default async function ReservationDetailPage({ params }: ReservationDetailPageProps) {
  const { id, countryCode } = await params;
  const reservationId = Number(id);

  if (isNaN(reservationId)) {
    notFound();
  }

  // Vérifier l'authentification (Server-side)
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/${countryCode}/login?redirect=/reservations/${id}`);
  }

  // Récupérer la réservation avec toutes les relations
  const reservationRaw = await prisma.reservation.findUnique({
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

  if (!reservationRaw) {
    notFound();
  }

  // Vérifier que la réservation appartient à l'utilisateur
  if (reservationRaw.id_user !== user.id_user) {
    redirect(`/${countryCode}/mes-reservations`);
  }

  // Formater les données pour le composant
  const reservation = {
    id_reservation: reservationRaw.id_reservation,
    num_confirmation: reservationRaw.num_confirmation || "",
    check_in: reservationRaw.check_in.toISOString(),
    check_out: reservationRaw.check_out.toISOString(),
    nbre_nuits: reservationRaw.nbre_nuits,
    nbre_adults: reservationRaw.nbre_adults,
    nbre_children: reservationRaw.nbre_children,
    prix_nuit: Number(reservationRaw.prix_nuit),
    total_price: Number(reservationRaw.total_price),
    devise: reservationRaw.devise,
    special_requests: reservationRaw.special_requests,
    date_reservation: reservationRaw.date_reservation.toISOString(),
    id_statut: reservationRaw.id_statut ?? 1,
    statut: {
      nom_statut: reservationRaw.statut?.nom_statut ?? "En attente",
      couleur: reservationRaw.statut?.couleur ?? "secondary",
    },
    hotel: {
      id_hotel: reservationRaw.hotel.id_hotel,
      nom_hotel: reservationRaw.hotel.nom_hotel,
      ville_hotel: reservationRaw.hotel.ville_hotel,
      pays_hotel: reservationRaw.hotel.pays_hotel,
      img_hotel: reservationRaw.hotel.img_hotel || "",
      nbre_etoile_hotel: reservationRaw.hotel.nbre_etoile_hotel,
    },
    chambre: {
      id_chambre: reservationRaw.chambre.id_chambre,
      type_room: reservationRaw.chambre.type_room,
      cat_room: reservationRaw.chambre.cat_room,
    },
    offre: {
      id_offre: reservationRaw.offre.id_offre,
      nom_offre: reservationRaw.offre.nom_offre,
      pension: reservationRaw.offre.pension,
    },
    services: reservationRaw.services.map((s) => ({
      id_reservation_service: s.id_reservation_service,
      nom_service: s.hotel_service.service.nom_service,
      icone_service: s.hotel_service.service.icone_service,
      quantite: s.quantite,
      prix_unitaire: Number(s.prix_unitaire),
      sous_total: Number(s.sous_total),
    })),
  };

  return (
    <ReservationDetail
      reservation={reservation}
      countryCode={countryCode}
    />
  );
}