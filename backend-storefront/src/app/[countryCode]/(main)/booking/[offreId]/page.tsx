// src/app/[countryCode]/(main)/booking/[offreId]/page.tsx
// ============================================================================
// Page de réservation (Server Component)
// Charge les données et affiche le formulaire BookingForm
// ============================================================================

import { notFound } from "next/navigation";
import { getOffreById, getHotelServices, HotelServicesList } from "@lib/reservations";
import BookingForm from "@modules/booking/components/BookingForm";

interface BookingPageProps {
  params: Promise<{ offreId: string; countryCode: string }>;
}

export default async function BookingPage({ params }: BookingPageProps) {
  const { offreId, countryCode } = await params;
  const offreIdNum = parseInt(offreId);

  if (isNaN(offreIdNum)) {
    notFound();
  }

  // Charger l'offre avec ses détails
  const offre = await getOffreById(offreIdNum);

  if (!offre) {
    notFound();
  }

  // Charger les services additionnels de l'hôtel
  const servicesRaw = await getHotelServices(offre.hotel.id_hotel);

  // Transformer les données pour le composant
  const services = servicesRaw.map((hs: HotelServicesList[number]) => ({
    id_hotel_service: hs.id_hotel_service,
    id_service: hs.service.id_service,
    nom_service: hs.service.nom_service,
    description_service: hs.service.description_service,
    type_service: hs.service.type_service,
    icone_service: hs.service.icone_service,
    prix_service: Number(hs.prix),
  }));

  // Transformer l'offre pour le typage correct
  const offreFormatted = {
    id_offre: offre.id_offre,
    nom_offre: offre.nom_offre,
    prix_nuit: Number(offre.prix_nuit),
    devise: offre.devise,
    pension: offre.pension,
    petit_dejeuner_inclus: offre.petit_dejeuner_inclus,
    conditions_annulation: offre.conditions_annulation || undefined,
    hotel: {
      id_hotel: offre.hotel.id_hotel,
      nom_hotel: offre.hotel.nom_hotel,
      ville_hotel: offre.hotel.ville_hotel,
      pays_hotel: offre.hotel.pays_hotel,
      img_hotel: offre.hotel.img_hotel,
      nbre_etoile_hotel: offre.hotel.nbre_etoile_hotel,
    },
    chambre: {
      id_chambre: offre.chambre.id_chambre,
      type_room: offre.chambre.type_room,
      cat_room: offre.chambre.cat_room,
      nbre_adults_max: offre.chambre.nbre_adults_max,
      nbre_children_max: offre.chambre.nbre_children_max,
      images: offre.chambre.images,
    },
  };

  return (
    <BookingForm
      offre={offreFormatted}
      services={services}
      countryCode={countryCode}
    />
  );
}

// Metadata dynamique
export async function generateMetadata({ params }: BookingPageProps) {
  const { offreId } = await params;
  const offreIdNum = parseInt(offreId);

  if (isNaN(offreIdNum)) {
    return { title: "Réservation" };
  }

  const offre = await getOffreById(offreIdNum);

  if (!offre) {
    return { title: "Réservation" };
  }

  return {
    title: `Réserver - ${offre.hotel.nom_hotel} | Hotel Booking`,
    description: `Réservez votre séjour à ${offre.hotel.nom_hotel}, ${offre.hotel.ville_hotel}. ${offre.chambre.type_room} à partir de ${offre.prix_nuit}€/nuit.`,
  };
}