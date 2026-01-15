// src/modules/reservations/components/ReservationsList.tsx
// ============================================================================
// Liste des réservations - Client Component
// 
// Différence Angular → React :
// - Angular : *ngFor="let reservation of reservations"
// - React : {reservations.map((reservation: Reservation) => ...)}
// 
// - Angular : (click)="cancelReservation(reservation)"
// - React : onClick={() => handleCancel(reservation.id_reservation)}
// ============================================================================

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  FaCalendarAlt, 
  FaUsers, 
  FaEye, 
  FaTimesCircle,
  FaInbox,
  FaSearch 
} from "react-icons/fa";

// ============================================================================
// TYPES
// ============================================================================
interface Reservation {
  id_reservation: number;
  num_confirmation: string;
  check_in: string;
  check_out: string;
  nbre_nuits: number;
  nbre_adults: number;
  nbre_children: number;
  total_price: number;
  devise: string;
  date_reservation: string;
  id_statut: number;
  statut: {
    nom_statut: string;
    couleur_statut: string;
  };
  hotel: {
    nom_hotel: string;
    ville_hotel: string;
    img_hotel: string;
  };
  chambre: {
    type_room: string;
  };
}

interface ReservationsListProps {
  initialReservations: Reservation[];
  countryCode: string;
}

// ============================================================================
// COMPONENT
// ============================================================================
export default function ReservationsList({
  initialReservations,
  countryCode,
}: ReservationsListProps) {
  const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  // Formater une date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Obtenir la classe CSS du badge statut
  const getStatusBadgeClass = (couleur: string): string => {
    const colorMap: Record<string, string> = {
      success: "bg-green-100 text-green-800",
      warning: "bg-yellow-100 text-yellow-800",
      danger: "bg-red-100 text-red-800",
      info: "bg-blue-100 text-blue-800",
      secondary: "bg-gray-100 text-gray-800",
    };
    return colorMap[couleur] || "bg-gray-100 text-gray-800";
  };

  // Vérifier si on peut annuler
  const canCancel = (reservation: Reservation): boolean => {
    // Peut annuler si le statut n'est pas "Annulée" (id_statut = 3)
    return reservation.id_statut !== 3;
  };

  // Annuler une réservation
  const handleCancel = async (reservation: Reservation) => {
    if (!confirm(`Voulez-vous vraiment annuler cette réservation à ${reservation.hotel.nom_hotel} ?`)) {
      return;
    }

    setCancellingId(reservation.id_reservation);

    try {
      const response = await fetch(`/api/reservations/${reservation.id_reservation}/cancel`, {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        // Mettre à jour la liste localement
        setReservations((prev) =>
          prev.map((r) =>
            r.id_reservation === reservation.id_reservation
              ? {
                  ...r,
                  id_statut: 3,
                  statut: { nom_statut: "Annulée", couleur_statut: "danger" },
                }
              : r
          )
        );
        alert("Réservation annulée avec succès");
      } else {
        alert(data.error || "Erreur lors de l'annulation");
      }
    } catch (error) {
      console.error("Erreur annulation:", error);
      alert("Erreur lors de l'annulation");
    } finally {
      setCancellingId(null);
    }
  };

  // ============================================================================
  // RENDER - Aucune réservation
  // ============================================================================
  if (reservations.length === 0) {
    return (
      <div className="text-center py-16">
        <FaInbox className="text-6xl text-turquoise mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Aucune réservation
        </h2>
        <p className="text-gray-500 mb-6">
          Vous n&apos;avez pas encore effectué de réservation.
        </p>
        <Link
          href={`/${countryCode}`}
          className="inline-flex items-center px-6 py-3 bg-turquoise text-white rounded-lg hover:bg-turquoise-dark transition-colors"
        >
          <FaSearch className="mr-2" />
          Rechercher un hôtel
        </Link>
      </div>
    );
  }

  // ============================================================================
  // RENDER - Liste des réservations
  // ============================================================================
  return (
    <div className="space-y-6">
      {reservations.map((reservation: Reservation) => (
        <div
          key={reservation.id_reservation}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
        >
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Image hôtel */}
              <div className="w-full md:w-48 h-32 relative rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={reservation.hotel.img_hotel || "/images/hotel-placeholder.jpg"}
                  alt={reservation.hotel.nom_hotel}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Détails */}
              <div className="flex-grow">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">
                      {reservation.hotel.nom_hotel}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {reservation.hotel.ville_hotel}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      {reservation.chambre.type_room}
                    </p>
                  </div>

                  {/* Badge statut */}
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
                      reservation.statut.couleur_statut
                    )}`}
                  >
                    {reservation.statut.nom_statut}
                  </span>
                </div>

                {/* Infos séjour */}
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-2 text-turquoise" />
                    <span>
                      {formatDate(reservation.check_in)} → {formatDate(reservation.check_out)}
                    </span>
                    <span className="ml-2 text-gray-400">
                      ({reservation.nbre_nuits} nuit{reservation.nbre_nuits > 1 ? "s" : ""})
                    </span>
                  </div>
                  <div className="flex items-center">
                    <FaUsers className="mr-2 text-turquoise" />
                    <span>
                      {reservation.nbre_adults} adulte{reservation.nbre_adults > 1 ? "s" : ""}
                      {(reservation.nbre_children ?? 0) > 0 && (
                        <>, {reservation.nbre_children} enfant{(reservation.nbre_children ?? 0) > 1 ? "s" : ""}</>
                      )}
                    </span>
                  </div>
                </div>

                {/* Prix et actions */}
                <div className="mt-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Prix total</p>
                    <p className="text-xl font-bold text-turquoise">
                      {reservation.total_price.toFixed(2)} {reservation.devise}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    {/* Numéro confirmation */}
                    <div className="text-sm text-gray-500">
                      N° {reservation.num_confirmation}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {/* Bouton voir détail */}
                    <Link
                      href={`/${countryCode}/reservations/${reservation.id_reservation}`}
                      className="inline-flex items-center px-4 py-2 bg-turquoise text-white rounded-lg hover:bg-turquoise-dark transition-colors text-sm"
                    >
                      <FaEye className="mr-2" />
                      Voir détail
                    </Link>

                    {/* Bouton annuler */}
                    {canCancel(reservation) && (
                      <button
                        onClick={() => handleCancel(reservation)}
                        disabled={cancellingId === reservation.id_reservation}
                        className="inline-flex items-center px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <FaTimesCircle className="mr-2" />
                        {cancellingId === reservation.id_reservation ? "Annulation..." : "Annuler"}
                      </button>
                    )}
                  </div>
                </div>

                {/* Date de réservation */}
                <p className="mt-3 text-xs text-gray-400">
                  Réservé le {formatDate(reservation.date_reservation)}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}