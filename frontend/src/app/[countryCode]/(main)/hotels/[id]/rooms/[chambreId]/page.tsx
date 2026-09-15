// ============================================================================
// PAGE ROOM DETAIL - Détail d'une chambre avec ses offres
// ============================================================================

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getChambreWithOffers } from "@lib/chambres";
import RoomDetail from "@modules/room/components/RoomDetail";

type Props = {
  params: Promise<{
    countryCode: string;
    id: string;
    chambreId: string;
  }>;
};

// Métadonnées dynamiques
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { chambreId } = await params;
  const chambre = await getChambreWithOffers(parseInt(chambreId));
  
  return {
    title: chambre 
      ? `${chambre.type_room} - ${chambre.cat_room}` 
      : "Chambre non trouvée",
    description: chambre?.description_room || "Détails de la chambre"
  };
}

export default async function RoomDetailPage({ params }: Props) {
  const { countryCode, id, chambreId } = await params;
  
  // Fetch côté serveur
  const chambre = await getChambreWithOffers(parseInt(chambreId));
  
  if (!chambre) {
    notFound();
  }
  
  return (
    <RoomDetail 
      chambre={chambre}
      hotelId={parseInt(id)}
      countryCode={countryCode}
    />
  );
}