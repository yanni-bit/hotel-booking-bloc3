// src/app/[countryCode]/(main)/payment/[reservationId]/page.tsx
// ============================================================================
// Page de paiement Stripe (Server Component)
// Charge les données et affiche le formulaire PaymentForm
// 
// Différence Angular → Next.js :
// - Angular : ngOnInit() + route.params.subscribe()
// - Next.js : params passés directement au Server Component
// ============================================================================

import { notFound } from "next/navigation";
import { getReservationById } from "@lib/payments";
import PaymentForm from "@modules/payment/components/PaymentForm";

interface PaymentPageProps {
  params: Promise<{ reservationId: string; countryCode: string }>;
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { reservationId, countryCode } = await params;
  const reservationIdNum = parseInt(reservationId);

  if (isNaN(reservationIdNum)) {
    notFound();
  }

  // Charger la réservation avec ses détails
  const reservation = await getReservationById(reservationIdNum);

  if (!reservation) {
    notFound();
  }

  // Vérifier que la réservation n'est pas déjà payée
  if (reservation.id_statut === 2) {
    // Rediriger vers la confirmation si déjà payée
    // On pourrait utiliser redirect() mais on affiche un message pour l'UX
  }

  // Transformer les données pour le composant client
  const reservationData = {
    id_reservation: reservation.id_reservation,
    num_confirmation: reservation.num_confirmation,
    check_in: reservation.check_in.toISOString().split("T")[0],
    check_out: reservation.check_out.toISOString().split("T")[0],
    nbre_nuits: reservation.nbre_nuits,
    nbre_adults: reservation.nbre_adults,
    nbre_children: reservation.nbre_children,
    prix_nuit: reservation.prix_nuit,
    total_price: reservation.total_price,
    devise: reservation.devise,
    special_requests: reservation.special_requests,
    id_statut: reservation.id_statut,
    hotel: {
      id_hotel: reservation.hotel.id_hotel,
      nom_hotel: reservation.hotel.nom_hotel,
      ville_hotel: reservation.hotel.ville_hotel,
      pays_hotel: reservation.hotel.pays_hotel,
      img_hotel: reservation.hotel.img_hotel,
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
      nom_service: s.hotel_service.service.nom_service,
      quantite: s.quantite,
      sous_total: s.sous_total,
    })),
  };

  return (
    <PaymentForm
      reservation={reservationData}
      countryCode={countryCode}
    />
  );
}

// Metadata dynamique
export async function generateMetadata({ params }: PaymentPageProps) {
  const { reservationId } = await params;
  const reservationIdNum = parseInt(reservationId);

  if (isNaN(reservationIdNum)) {
    return { title: "Paiement" };
  }

  const reservation = await getReservationById(reservationIdNum);

  if (!reservation) {
    return { title: "Paiement" };
  }

  return {
    title: `Paiement - ${reservation.hotel.nom_hotel} | Hotel Booking`,
    description: `Finalisez votre réservation à ${reservation.hotel.nom_hotel}, ${reservation.hotel.ville_hotel}.`,
  };
}