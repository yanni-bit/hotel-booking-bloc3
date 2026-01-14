// src/lib/hotels.ts
// ============================================================================
// Fonctions d'accès aux données - Hotel Booking
// Utilisables dans Server Components ET API Routes
// ============================================================================

import prisma from "./prisma";

// ============================================================================
// TYPES (pour le typage TypeScript)
// ============================================================================
export type HotelWithDetails = Awaited<ReturnType<typeof getHotelById>>;
export type HotelCard = Awaited<ReturnType<typeof getPopularHotels>>[number];

// Type pour les destinations groupées
type DestinationGroup = {
  ville_hotel: string;
  pays_hotel: string;
  _count: { id_hotel: number };
};

// ============================================================================
// HOTELS
// ============================================================================

/**
 * Récupère tous les hôtels avec pagination
 */
export async function getHotels(options?: {
  page?: number;
  limit?: number;
  city?: string;
  country?: string;
  minStars?: number;
}) {
  const { page = 1, limit = 12, city, country, minStars } = options || {};
  const skip = (page - 1) * limit;

  const where = {
    ...(city && {
      ville_hotel: { contains: city, mode: "insensitive" as const },
    }),
    ...(country && {
      pays_hotel: { contains: country, mode: "insensitive" as const },
    }),
    ...(minStars && { nbre_etoile_hotel: { gte: minStars } }),
  };

  const [hotels, total] = await Promise.all([
    prisma.hotel.findMany({
      where,
      skip,
      take: limit,
      orderBy: { note_moy_hotel: "desc" },
      include: {
        amenities: true,
        _count: { select: { chambres: true, avis: true } },
      },
    }),
    prisma.hotel.count({ where }),
  ]);

  return {
    hotels,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

/**
 * Récupère un hôtel par son ID avec tous les détails
 */
export async function getHotelById(id: number) {
  return prisma.hotel.findUnique({
    where: { id_hotel: id },
    include: {
      amenities: true,
      chambres: {
        include: {
          images: true,
          offres: {
            orderBy: { prix_nuit: "asc" },
          },
        },
      },
      images: { orderBy: { ordre: "asc" } },
      avis: {
        orderBy: { date_avis: "desc" },
        take: 5,
        include: { user: { select: { prenom_user: true, nom_user: true } } },
      },
    },
  });
}

/**
 * Hôtels populaires (pour le composant PopularHotels)
 */
export async function getPopularHotels(limit = 6) {
  return prisma.hotel.findMany({
    where: {
      note_moy_hotel: { gte: 8 }, // Note >= 8
      img_hotel: { not: null }, // Avec image
    },
    orderBy: [{ note_moy_hotel: "desc" }, { nbre_avis_hotel: "desc" }],
    take: limit,
    include: {
      amenities: true,
      offres: {
        where: { date_fin: { gte: new Date() } },
        orderBy: { prix_actuel: "asc" },
        take: 1,
      },
    },
  });
}

// ============================================================================
// DESTINATIONS
// ============================================================================

/**
 * Destinations uniques avec comptage d'hôtels
 */
interface DestinationRow {
  nom_ville: string;
  nom_pays: string;
  url_image: string;
  badge: string | null;
  ordre: number;
}

// Type pour le résultat du groupement
interface HotelCountRow {
  ville_hotel: string;
  _count: {
    id_hotel: number;
  };
}

export async function getDestinations() {
  const configDestinations = (await prisma.destination.findMany({
    orderBy: { ordre: 'asc' },
  })) as DestinationRow[];

  // On précise le type ici pour plus de clarté
  const hotelCounts = (await prisma.hotel.groupBy({
    by: ['ville_hotel'],
    _count: { id_hotel: true },
  })) as unknown as HotelCountRow[];

  return configDestinations.map((dest) => {
    const countData = hotelCounts.find(
      (h) => h.ville_hotel.toLowerCase() === dest.nom_ville.toLowerCase()
    );

    return {
      ville: dest.nom_ville,
      pays: dest.nom_pays,
      count: countData?._count.id_hotel || 0,
      image: dest.url_image,
      badge: dest.badge,
    };
  });
}

// ============================================================================
// OFFRES
// ============================================================================

/**
 * Meilleures offres du moment
 */
export async function getOffres(limit = 6) {
  return prisma.offre.findMany({
    where: {
      date_fin: { gte: new Date() },
      reduction: { gt: 0 },
    },
    orderBy: { reduction: "desc" },
    take: limit,
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
        },
      },
      chambre: {
        select: {
          type_room: true,
          nbre_adults_max: true,
        },
      },
    },
  });
}

// ============================================================================
// AVIS
// ============================================================================

/**
 * Derniers avis
 */
export async function getRecentAvis(limit = 5) {
  return prisma.avis.findMany({
    orderBy: { date_avis: "desc" },
    take: limit,
    include: {
      hotel: {
        select: { nom_hotel: true, ville_hotel: true },
      },
      user: {
        select: { prenom_user: true },
      },
    },
  });
}

// ============================================================================
// SEARCH (pour la recherche)
// ============================================================================

/**
 * Recherche d'hôtels avec critères
 */
export async function searchHotels(params: {
  query?: string;
  city?: string;
  checkIn?: Date;
  checkOut?: Date;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  stars?: number[];
  amenities?: string[];
  page?: number;
  limit?: number;
}) {
  const { page = 1, limit = 12, query, city, stars, guests } = params;
  const skip = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (query) {
    where.OR = [
      { nom_hotel: { contains: query, mode: "insensitive" } },
      { ville_hotel: { contains: query, mode: "insensitive" } },
      { description_hotel: { contains: query, mode: "insensitive" } },
    ];
  }

  if (city) {
    where.ville_hotel = { contains: city, mode: "insensitive" };
  }

  if (stars && stars.length > 0) {
    where.nbre_etoile_hotel = { in: stars };
  }

  if (guests) {
    where.chambres = {
      some: { nbre_adults_max: { gte: guests } },
    };
  }

  const [hotels, total] = await Promise.all([
    prisma.hotel.findMany({
      where,
      skip,
      take: limit,
      orderBy: { note_moy_hotel: "desc" },
      include: {
        amenities: true,
        offres: {
          where: { date_fin: { gte: new Date() } },
          orderBy: { prix_actuel: "asc" },
          take: 1,
        },
        _count: { select: { avis: true } },
      },
    }),
    prisma.hotel.count({ where }),
  ]);

  return {
    hotels,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}
