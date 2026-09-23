// src/app/api/reservations/route.ts
// ============================================================================
// API Route: POST /api/reservations
// Création d'une nouvelle réservation
//
// Principe de sécurité appliqué ici : ne jamais faire confiance au client.
// L'identité vient du cookie JWT, le prix est recalculé depuis la base.
// Le corps de la requête ne sert qu'à exprimer un souhait (quelle offre,
// quelles dates, combien de personnes), jamais à fixer une valeur sensible.
//
// Différence Angular → Next.js :
// - Angular : un AuthGuard protège la route côté client, l'API Express
//   revérifie le token dans un middleware.
// - Next.js : le middleware ne couvre que les pages (matcher excluant /api),
//   chaque Route Handler doit donc vérifier la session lui-même.
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import {
  createReservation,
  type CreateReservationInput,
  type ServiceSelection,
} from "@lib/reservations";
import { getCurrentUser } from "@lib/auth";
import prisma from "@lib/prisma";

const MS_PAR_JOUR = 1000 * 60 * 60 * 24;

/** Service tel que le client le demande : rien n'est encore vérifié. */
type ServiceDemande = {
  id_hotel_service?: number | string;
  quantite?: number | string;
};

/**
 * Calcule le prix d'un service selon son type.
 * Doit rester aligné sur calculateServiceTotal() de lib/reservations.ts
 * et sur l'affichage de BookingForm.tsx.
 */
function totalService(
  prixUnitaire: number,
  typeService: string,
  quantite: number,
  nbreNuits: number,
  nbreAdults: number
): number {
  let total = prixUnitaire * quantite;

  if (typeService === "journalier") {
    total *= nbreNuits;
  } else if (typeService === "par_personne") {
    total *= nbreNuits * nbreAdults;
  }
  // 'sejour' et 'unitaire' : prix fixe

  return total;
}

export async function POST(request: NextRequest) {
  try {
    // ------------------------------------------------------------------
    // 1. AUTHENTIFICATION
    // L'utilisateur est lu dans le cookie HttpOnly, jamais dans le corps.
    // ------------------------------------------------------------------
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // ------------------------------------------------------------------
    // 2. VALIDATION DES DONNÉES NON FINANCIÈRES
    // ------------------------------------------------------------------
    const idOffre = Number(body.id_offre);

    if (!Number.isInteger(idOffre) || idOffre < 1) {
      return NextResponse.json({ error: "Offre invalide" }, { status: 400 });
    }

    if (!body.check_in || !body.check_out) {
      return NextResponse.json(
        { error: "Dates de séjour requises: check_in, check_out" },
        { status: 400 }
      );
    }

    const checkIn = new Date(body.check_in);
    const checkOut = new Date(body.check_out);

    if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
      return NextResponse.json({ error: "Dates invalides" }, { status: 400 });
    }

    if (checkOut <= checkIn) {
      return NextResponse.json(
        { error: "La date de départ doit être postérieure à la date d'arrivée" },
        { status: 400 }
      );
    }

    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);

    if (checkIn < aujourdhui) {
      return NextResponse.json(
        { error: "La date d'arrivée ne peut pas être dans le passé" },
        { status: 400 }
      );
    }

    // Le nombre de nuits est déduit des dates, pas repris du client
    const nbreNuits = Math.round(
      (checkOut.getTime() - checkIn.getTime()) / MS_PAR_JOUR
    );

    const nbreAdults = Number(body.nbre_adults);
    const nbreChildren = Number(body.nbre_children) || 0;

    if (!Number.isInteger(nbreAdults) || nbreAdults < 1) {
      return NextResponse.json(
        { error: "Nombre d'adultes invalide" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(nbreChildren) || nbreChildren < 0) {
      return NextResponse.json(
        { error: "Nombre d'enfants invalide" },
        { status: 400 }
      );
    }

    // ------------------------------------------------------------------
    // 3. L'OFFRE FAIT FOI
    // Prix, hôtel et chambre sont lus en base : le client ne les choisit pas.
    // ------------------------------------------------------------------
    const offre = await prisma.offre.findUnique({
      where: { id_offre: idOffre },
      include: { chambre: true },
    });

    if (!offre) {
      return NextResponse.json({ error: "Offre introuvable" }, { status: 404 });
    }

    if (nbreAdults > offre.chambre.nbre_adults_max) {
      return NextResponse.json(
        {
          error: `Cette chambre accueille au maximum ${offre.chambre.nbre_adults_max} adulte(s)`,
        },
        { status: 400 }
      );
    }

    if (nbreChildren > offre.chambre.nbre_children_max) {
      return NextResponse.json(
        {
          error: `Cette chambre accueille au maximum ${offre.chambre.nbre_children_max} enfant(s)`,
        },
        { status: 400 }
      );
    }

    const prixNuit = Number(offre.prix_nuit);
    let totalPrice = prixNuit * nbreNuits;

    // ------------------------------------------------------------------
    // 4. SERVICES ADDITIONNELS
    // Seuls les services réellement proposés par cet hôtel sont retenus,
    // et leur prix est celui de la base, pas celui envoyé par le client.
    // ------------------------------------------------------------------
    const servicesValides: ServiceSelection[] = [];
    const servicesDemandes: ServiceDemande[] = Array.isArray(body.services)
      ? body.services
      : [];

    if (servicesDemandes.length > 0) {
      const ids = servicesDemandes
        .map((s: ServiceDemande) => Number(s.id_hotel_service))
        .filter((id: number) => Number.isInteger(id) && id > 0);

      const hotelServices = await prisma.hotelServices.findMany({
        where: {
          id_hotel_service: { in: ids },
          id_hotel: offre.id_hotel,
          disponible: true,
        },
        include: { service: true },
      });

      // Type de ligne renvoyé par la requête ci-dessus : évite tout any implicite
      type HotelServiceRow = (typeof hotelServices)[number];

      for (const demande of servicesDemandes) {
        const hs = hotelServices.find(
          (h: HotelServiceRow) =>
            h.id_hotel_service === Number(demande.id_hotel_service)
        );

        // Service inconnu, indisponible ou rattaché à un autre hôtel : ignoré
        if (!hs) continue;

        const quantite = Math.max(1, Number(demande.quantite) || 1);
        const prixUnitaire = Number(hs.prix);
        const typeService = hs.service.type_service;

        servicesValides.push({
          id_hotel_service: hs.id_hotel_service,
          nom_service: hs.service.nom_service,
          prix_service: prixUnitaire,
          type_service: typeService,
          quantite,
        });

        totalPrice += totalService(
          prixUnitaire,
          typeService,
          quantite,
          nbreNuits,
          nbreAdults
        );
      }
    }

    // Arrondi au centime : on manipule des euros, pas des flottants libres
    totalPrice = Math.round(totalPrice * 100) / 100;

    // ------------------------------------------------------------------
    // 5. CRÉATION
    // id_statut est forcé à 1 (En attente) : seul le paiement confirme.
    // ------------------------------------------------------------------
    const donnees: CreateReservationInput = {
      id_offre: offre.id_offre,
      id_user: user.id_user,
      id_hotel: offre.id_hotel,
      id_chambre: offre.id_chambre,
      check_in: body.check_in,
      check_out: body.check_out,
      nbre_nuits: nbreNuits,
      nbre_adults: nbreAdults,
      nbre_children: nbreChildren,
      prix_nuit: prixNuit,
      total_price: totalPrice,
      devise: offre.devise,
      special_requests:
        typeof body.special_requests === "string"
          ? body.special_requests.slice(0, 1000)
          : undefined,
      id_statut: 1,
      services: servicesValides,
    };

    const reservation = await createReservation(donnees);

    console.log("Réservation créée:", reservation.num_confirmation);

    return NextResponse.json({
      success: true,
      data: {
        id_reservation: reservation.id_reservation,
        num_confirmation: reservation.num_confirmation,
        total_price: totalPrice,
      },
    });
  } catch (error) {
    console.error("Erreur création réservation:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la réservation" },
      { status: 500 }
    );
  }
}