// ============================================================================
// CHAMBRES.TS - Fonctions pour les chambres (Prisma)
// ============================================================================

import { prisma } from "@lib/prisma";

// ============================================================================
// INTERFACES EXPORTÉES (pour les composants)
// ============================================================================

export interface Offre {
  id_offre: number;
  nom_offre: string | null;
  description_offre: string | null;
  prix_nuit: number;
  devise: string;
  remboursable: boolean;
  petit_dejeuner_inclus: boolean;
  pension: string | null;
}

export interface Chambre {
  id_chambre: number;
  id_hotel: number;
  type_room: string | null;
  cat_room: string | null;
  type_lit: string | null;
  nbre_lit: number | null;
  nbre_adults_max: number | null;
  nbre_children_max: number | null;
  surface_m2: number | null;
  vue: string | null;
  description_room: string | null;
  offres: Offre[];
}

// ============================================================================
// TYPES INTERNES (pour Prisma)
// ============================================================================

type OffrePrisma = {
  id_offre: number;
  nom_offre: string | null;
  description_offre: string | null;
  prix_nuit: any;
  devise: string | null;
  remboursable: boolean | null;
  petit_dejeuner_inclus: boolean | null;
  pension: string | null;
};

// ============================================================================
// FONCTIONS
// ============================================================================

/**
 * Récupère une chambre avec ses offres (Prisma)
 */
export async function getChambreWithOffersById(
  chambreId: number
): Promise<Chambre | null> {
  try {
    const chambre = await prisma.chambre.findUnique({
      where: { id_chambre: chambreId },
      include: {
        offres: {
          orderBy: { prix_nuit: "asc" },
          select: {
            id_offre: true,
            nom_offre: true,
            description_offre: true,
            prix_nuit: true,
            devise: true,
            remboursable: true,
            petit_dejeuner_inclus: true,
            pension: true,
          },
        },
      },
    });

    if (!chambre) {
      return null;
    }

    // Transformer pour matcher l'interface
    return {
      id_chambre: chambre.id_chambre,
      id_hotel: chambre.id_hotel,
      type_room: chambre.type_room,
      cat_room: chambre.cat_room,
      type_lit: chambre.type_lit,
      nbre_lit: chambre.nbre_lit,
      nbre_adults_max: chambre.nbre_adults_max,
      nbre_children_max: chambre.nbre_children_max,
      surface_m2: chambre.surface_m2,
      vue: chambre.vue,
      description_room: chambre.description_room,
      offres: chambre.offres.map((o: OffrePrisma) => ({
        id_offre: o.id_offre,
        nom_offre: o.nom_offre,
        description_offre: o.description_offre,
        prix_nuit: Number(o.prix_nuit),
        devise: o.devise || "EUR",
        remboursable: o.remboursable || false,
        petit_dejeuner_inclus: o.petit_dejeuner_inclus || false,
        pension: o.pension,
      })),
    };
  } catch (error) {
    console.error("Erreur getChambreWithOffersById:", error);
    return null;
  }
}

/**
 * Version fetch pour appel API (si besoin côté client)
 */
export async function getChambreWithOffers(
  chambreId: number
): Promise<Chambre | null> {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const response = await fetch(`${API_URL}/api/chambres/${chambreId}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Erreur getChambreWithOffers:", error);
    return null;
  }
}
