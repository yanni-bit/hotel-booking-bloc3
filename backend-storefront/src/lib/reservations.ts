// src/lib/reservations.ts
// ============================================================================
// Fonctions d'accès aux données - Réservations
// Utilisables dans Server Components ET API Routes
// ============================================================================

import prisma from "./prisma";
import { Prisma } from "@prisma/client";

// ============================================================================
// TYPES (pour le typage TypeScript)
// ============================================================================
export type OffreWithDetails = Awaited<ReturnType<typeof getOffreById>>;
export type HotelServicesList = Awaited<ReturnType<typeof getHotelServices>>;
export type ReservationWithDetails = Awaited<ReturnType<typeof getReservationById>>;

// Type pour la création de réservation
export interface CreateReservationInput {
  id_offre: number;
  id_user: number;
  id_hotel: number;
  id_chambre: number;
  check_in: string; // Format: YYYY-MM-DD
  check_out: string;
  nbre_nuits: number;
  nbre_adults: number;
  nbre_children: number;
  prix_nuit: number;
  total_price: number;
  devise?: string;
  special_requests?: string;
  id_statut?: number; // 1 = En attente, 2 = Confirmée
  services?: ServiceSelection[];
}

export interface ServiceSelection {
  id_hotel_service: number;
  nom_service: string;
  prix_service: number;
  type_service: string;
  quantite: number;
}

// ============================================================================
// OFFRES
// ============================================================================

/**
 * Récupère une offre par son ID avec hôtel et chambre
 */
export async function getOffreById(id: number) {
  return prisma.offre.findUnique({
    where: { id_offre: id },
    include: {
      hotel: {
        select: {
          id_hotel: true,
          nom_hotel: true,
          ville_hotel: true,
          pays_hotel: true,
          img_hotel: true,
          nbre_etoile_hotel: true,
          note_moy_hotel: true,
          rue_hotel: true,
          code_postal_hotel: true,
        },
      },
      chambre: {
        select: {
          id_chambre: true,
          type_room: true,
          cat_room: true,
          type_lit: true,
          nbre_adults_max: true,
          nbre_children_max: true,
          surface_m2: true,
          description_room: true,
          images: {
            take: 1,
            orderBy: { ordre: "asc" },
          },
        },
      },
    },
  });
}

// ============================================================================
// SERVICES ADDITIONNELS
// ============================================================================

/**
 * Récupère les services additionnels d'un hôtel
 */
export async function getHotelServices(hotelId: number) {
  return prisma.hotelServices.findMany({
    where: {
      id_hotel: hotelId,
      disponible: true,
    },
    include: {
      service: {
        select: {
          id_service: true,
          nom_service: true,
          description_service: true,
          type_service: true,
          icone_service: true,
        },
      },
    },
    orderBy: {
      service: { nom_service: "asc" },
    },
  });
}

// ============================================================================
// RÉSERVATIONS
// ============================================================================

/**
 * Génère un numéro de confirmation unique
 * Format: RES-2025-XXXXX (où XXXXX est un nombre aléatoire)
 */
export function generateConfirmationNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000); // 5 chiffres
  return `RES-${year}-${random}`;
}

/**
 * Crée une réservation avec ses services additionnels
 */
export async function createReservation(data: CreateReservationInput) {
  const numConfirmation = generateConfirmationNumber();

  // Utiliser une transaction pour garantir l'intégrité
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // 1. Créer la réservation
    const reservation = await tx.reservation.create({
      data: {
        id_offre: data.id_offre,
        id_user: data.id_user,
        id_hotel: data.id_hotel,
        id_chambre: data.id_chambre,
        check_in: new Date(data.check_in),
        check_out: new Date(data.check_out),
        nbre_nuits: data.nbre_nuits,
        nbre_adults: data.nbre_adults,
        nbre_children: data.nbre_children,
        prix_nuit: data.prix_nuit,
        total_price: data.total_price,
        devise: data.devise || "EUR",
        special_requests: data.special_requests,
        num_confirmation: numConfirmation,
        id_statut: data.id_statut || 1, // 1 = En attente par défaut
      },
    });

    // 2. Créer les services additionnels (si présents)
    if (data.services && data.services.length > 0) {
      await tx.reservationServices.createMany({
        data: data.services.map((service) => ({
          id_reservation: reservation.id_reservation,
          id_hotel_service: service.id_hotel_service,
          quantite: service.quantite,
          prix_unitaire: service.prix_service,
          sous_total: calculateServiceTotal(
            service.prix_service,
            service.type_service,
            service.quantite,
            data.nbre_nuits,
            data.nbre_adults
          ),
        })),
      });
    }

    return reservation;
  });
}

/**
 * Calcule le prix total d'un service selon son type
 */
function calculateServiceTotal(
  prixUnitaire: number,
  typeService: string,
  quantite: number,
  nbreNuits: number,
  nbreAdults: number
): number {
  let total = prixUnitaire * quantite;

  switch (typeService) {
    case "journalier":
      total *= nbreNuits;
      break;
    case "par_personne":
      total *= nbreNuits * nbreAdults;
      break;
    // 'sejour' et 'unitaire' = prix fixe (pas de multiplication)
  }

  return total;
}

/**
 * Récupère une réservation par son ID
 */
export async function getReservationById(id: number) {
  return prisma.reservation.findUnique({
    where: { id_reservation: id },
    include: {
      offre: true,
      hotel: {
        select: {
          nom_hotel: true,
          ville_hotel: true,
          pays_hotel: true,
          img_hotel: true,
        },
      },
      chambre: {
        select: {
          type_room: true,
          cat_room: true,
        },
      },
      statut: true,
      services: {
        include: {
          hotel_service: {
            include: {
              service: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Récupère les réservations d'un utilisateur
 */
export async function getUserReservations(userId: number) {
  return prisma.reservation.findMany({
    where: { id_user: userId },
    orderBy: { date_reservation: "desc" },
    include: {
      hotel: {
        select: {
          nom_hotel: true,
          ville_hotel: true,
          img_hotel: true,
        },
      },
      chambre: {
        select: {
          type_room: true,
        },
      },
      statut: true,
    },
  });
}

/**
 * Met à jour le statut d'une réservation
 */
export async function updateReservationStatus(
  reservationId: number,
  newStatusId: number
) {
  return prisma.reservation.update({
    where: { id_reservation: reservationId },
    data: { id_statut: newStatusId },
  });
}

/**
 * Annule une réservation (statut = 4 annulée)
 */
export async function cancelReservation(reservationId: number, userId: number) {
  // Vérifier que la réservation appartient à l'utilisateur
  const reservation = await prisma.reservation.findFirst({
    where: {
      id_reservation: reservationId,
      id_user: userId,
    },
  });

  if (!reservation) {
    throw new Error("Réservation non trouvée ou non autorisée");
  }

  return prisma.reservation.update({
    where: { id_reservation: reservationId },
    data: { id_statut: 4 }, // 4 = Annulée
  });
}