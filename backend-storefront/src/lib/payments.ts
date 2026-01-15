// src/lib/payments.ts
// ============================================================================
// Fonctions BDD pour les paiements et réservations
// Équivalent du ReservationService Angular mais côté serveur
// ============================================================================

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ============================================================================
// TYPES
// ============================================================================
export interface ReservationWithDetails {
  id_reservation: number;
  booking_id_api: string | null;
  id_offre: number;
  id_user: number;
  id_hotel: number;
  id_chambre: number;
  id_paiement: number | null;
  check_in: Date;
  check_out: Date;
  nbre_nuits: number;
  nbre_adults: number;
  nbre_children: number;
  prix_nuit: number;
  total_price: number;
  devise: string;
  special_requests: string | null;
  num_confirmation: string | null;
  id_statut: number | null;
  date_reservation: Date;
  // Relations
  hotel: {
    id_hotel: number;
    nom_hotel: string;
    ville_hotel: string;
    pays_hotel: string;
    img_hotel: string | null;
  };
  chambre: {
    id_chambre: number;
    type_room: string;
    cat_room: string | null;
  };
  offre: {
    id_offre: number;
    nom_offre: string;
    pension: string;
  };
  statut: {
    id_statut: number;
    nom_statut: string;
    couleur: string;
  } | null;
  services: {
    id_reservation_service: number;
    quantite: number;
    prix_unitaire: number;
    sous_total: number;
    hotel_service: {
      service: {
        nom_service: string;
      };
    };
  }[];
}

// ============================================================================
// RÉCUPÉRER UNE RÉSERVATION PAR ID
// ============================================================================
/**
 * Récupère une réservation avec tous ses détails
 * 
 * Différence Angular → Next.js :
 * - Angular : this.reservationService.getReservationById(id).subscribe()
 * - Next.js : await getReservationById(id) (async/await directement)
 */
export async function getReservationById(
  id: number
): Promise<ReservationWithDetails | null> {
  const reservation = await prisma.reservation.findUnique({
    where: { id_reservation: id },
    include: {
      hotel: {
        select: {
          id_hotel: true,
          nom_hotel: true,
          ville_hotel: true,
          pays_hotel: true,
          img_hotel: true,
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
                },
              },
            },
          },
        },
      },
    },
  });

  if (!reservation) return null;

  // Convertir les Decimal en number
  return {
    ...reservation,
    prix_nuit: Number(reservation.prix_nuit),
    total_price: Number(reservation.total_price),
    services: reservation.services.map((s) => ({
      ...s,
      prix_unitaire: Number(s.prix_unitaire),
      sous_total: Number(s.sous_total),
    })),
  };
}

// ============================================================================
// CRÉER UN PAIEMENT
// ============================================================================
export interface CreatePaymentData {
  id_user: number;
  id_offre: number;
  montant: number;
  devise: string;
  methode_paiement: string;
  reference_externe: string; // PaymentIntent ID de Stripe
  statut_paiement: string;
}

/**
 * Crée un enregistrement de paiement dans la BDD
 */
export async function createPayment(data: CreatePaymentData) {
  return prisma.paiement.create({
    data: {
      id_user: data.id_user,
      id_offre: data.id_offre,
      montant: data.montant,
      devise: data.devise,
      methode_paiement: data.methode_paiement,
      reference_externe: data.reference_externe,
      statut_paiement: data.statut_paiement,
    },
  });
}

// ============================================================================
// CONFIRMER UNE RÉSERVATION (APRÈS PAIEMENT)
// ============================================================================
/**
 * Met à jour la réservation après un paiement réussi
 * - id_statut = 2 (Confirmée)
 * - id_paiement = référence vers le paiement
 * - booking_id_api = PaymentIntent ID Stripe
 * 
 * Différence Angular → Next.js :
 * - Angular : this.reservationService.updateReservationStatus(id, 2).subscribe()
 * - Next.js : await confirmReservation(id, paymentId, stripeId)
 */
export async function confirmReservation(
  reservationId: number,
  paymentId: number,
  stripePaymentIntentId: string
) {
  return prisma.reservation.update({
    where: { id_reservation: reservationId },
    data: {
      id_statut: 2, // Confirmée
      id_paiement: paymentId,
      booking_id_api: stripePaymentIntentId,
    },
  });
}

// ============================================================================
// GÉNÉRER UN NUMÉRO DE CONFIRMATION
// ============================================================================
/**
 * Génère un numéro de confirmation unique
 * Format : HB-YYYYMMDD-XXXXX (ex: HB-20250115-A3F7K)
 */
export function generateConfirmationNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  
  // Générer 5 caractères alphanumériques aléatoires
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Sans 0, O, 1, I pour éviter confusion
  let random = "";
  for (let i = 0; i < 5; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `HB-${year}${month}${day}-${random}`;
}

// ============================================================================
// METTRE À JOUR LE NUMÉRO DE CONFIRMATION
// ============================================================================
export async function updateConfirmationNumber(
  reservationId: number,
  confirmationNumber: string
) {
  return prisma.reservation.update({
    where: { id_reservation: reservationId },
    data: {
      num_confirmation: confirmationNumber,
    },
  });
}