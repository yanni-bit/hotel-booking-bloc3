// src/modules/reservations/components/ReservationDetail.tsx
// ============================================================================
// Détail d'une réservation - Client Component
// 
// Différence Angular → React :
// - Angular : (click)="cancelReservation()" avec subscribe
// - React : onClick={() => handleCancel()} avec async/await
// ============================================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  FaHome,
  FaClipboardList,
  FaReceipt,
  FaBuilding,
  FaCalendarCheck,
  FaUsers,
  FaChild,
  FaCommentAlt,
  FaConciergeBell,
  FaInfoCircle,
  FaCreditCard,
  FaArrowLeft,
  FaTimesCircle,
  FaMapMarkerAlt,
  FaStar,
  FaShieldAlt,
  FaPhone,
  FaQuestionCircle,
  FaCheckCircle,
} from "react-icons/fa";

// ============================================================================
// TYPES
// ============================================================================
interface Service {
  id_reservation_service: number;
  nom_service: string;
  icone_service: string | null;
  quantite: number;
  prix_unitaire: number;
  sous_total: number;
}

interface Reservation {
  id_reservation: number;
  num_confirmation: string;
  check_in: string;
  check_out: string;
  nbre_nuits: number;
  nbre_adults: number;
  nbre_children: number;
  prix_nuit: number;
  total_price: number;
  devise: string;
  special_requests: string | null;
  date_reservation: string;
  id_statut: number;
  statut: {
    nom_statut: string;
    couleur: string;
  };
  hotel: {
    id_hotel: number;
    nom_hotel: string;
    ville_hotel: string;
    pays_hotel: string;
    img_hotel: string;
    nbre_etoile_hotel: number | null;
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
  services: Service[];
}

interface ReservationDetailProps {
  reservation: Reservation;
  countryCode: string;
}

// ============================================================================
// COMPONENT
// ============================================================================
export default function ReservationDetail({
  reservation,
  countryCode,
}: ReservationDetailProps) {
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);
  const [currentStatut, setCurrentStatut] = useState(reservation.id_statut);
  const [currentStatutInfo, setCurrentStatutInfo] = useState(reservation.statut);

  // Formater une date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Formater date + heure
  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Classe CSS du badge statut
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

  // Peut annuler ?
  const canCancel = (): boolean => {
    // Ne peut pas annuler si déjà annulée (4) ou terminée (5)
    return currentStatut !== 3 && currentStatut !== 5;
  };

  // Peut payer ?
  const canPay = (): boolean => {
    // Peut payer si en attente (1)
    return currentStatut === 1;
  };

  // Total des services
  const getTotalServices = (): number => {
    return reservation.services.reduce((sum, s) => sum + s.sous_total, 0);
  };

  // Annuler la réservation
  const handleCancel = async () => {
    if (!confirm("Voulez-vous vraiment annuler cette réservation ?")) {
      return;
    }

    setCancelling(true);

    try {
      const response = await fetch(
        `/api/reservations/${reservation.id_reservation}/cancel`,
        { method: "POST" }
      );

      const data = await response.json();

      if (data.success) {
        setCurrentStatut(3);
        setCurrentStatutInfo({ nom_statut: "Annulée", couleur: "danger" });
        alert("Réservation annulée avec succès");
      } else {
        alert(data.error || "Erreur lors de l'annulation");
      }
    } catch (error) {
      console.error("Erreur annulation:", error);
      alert("Erreur lors de l'annulation");
    } finally {
      setCancelling(false);
    }
  };

  // Aller au paiement
  const goToPayment = () => {
    router.push(`/${countryCode}/payment/${reservation.id_reservation}`);
  };

  // Étoiles de l'hôtel
  const renderStars = (count: number | null) => {
    if (!count) return null;
    return (
      <span className="flex items-center text-yellow-500 ml-2">
        {Array.from({ length: count }, (_, i) => (
          <FaStar key={i} className="text-sm" />
        ))}
      </span>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <section className="reservation-detail-page py-8 min-h-screen bg-gray-50">
      <div className="content-container">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-6">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link
                href={`/${countryCode}`}
                className="text-turquoise hover:underline flex items-center"
              >
                <FaHome className="mr-1" /> Accueil
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link
                href={`/${countryCode}/mes-reservations`}
                className="text-turquoise hover:underline"
              >
                Mes réservations
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-600">{reservation.num_confirmation}</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
              <FaReceipt className="mr-3 text-turquoise" />
              Détail de la réservation
            </h1>
            <p className="text-gray-500 mt-2">
              N° de confirmation : <strong className="text-gray-800">{reservation.num_confirmation}</strong>
            </p>
          </div>
          <span
            className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadgeClass(
              currentStatutInfo.couleur
            )}`}
          >
            {currentStatutInfo.nom_statut}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ============================================================ */}
          {/* COLONNE GAUCHE (2/3) */}
          {/* ============================================================ */}
          <div className="lg:col-span-2 space-y-6">
            {/* HÉBERGEMENT */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-turquoise flex items-center mb-4">
                <FaBuilding className="mr-2" /> Hébergement
              </h2>

              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-48 h-36 relative rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={reservation.hotel.img_hotel || "/images/hotel-placeholder.jpg"}
                    alt={reservation.hotel.nom_hotel}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex-grow">
                  <div className="flex items-center mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">
                      {reservation.hotel.nom_hotel}
                    </h3>
                    {renderStars(reservation.hotel.nbre_etoile_hotel)}
                  </div>
                  <p className="text-gray-500 mb-4">
                    <FaMapMarkerAlt className="inline mr-1" />
                    {reservation.hotel.ville_hotel}, {reservation.hotel.pays_hotel}
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Chambre</p>
                      <p className="font-medium">
                        {reservation.chambre.type_room}
                        {reservation.chambre.cat_room && ` - ${reservation.chambre.cat_room}`}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Offre</p>
                      <p className="font-medium">{reservation.offre.nom_offre}</p>
                    </div>
                  </div>

                  <Link
                    href={`/${countryCode}/hotels/${reservation.hotel.id_hotel}`}
                    className="inline-flex items-center mt-4 text-sm text-turquoise hover:underline"
                  >
                    Voir l'hôtel →
                  </Link>
                </div>
              </div>
            </div>

            {/* DATES & VOYAGEURS */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-turquoise flex items-center mb-4">
                <FaCalendarCheck className="mr-2" /> Dates et voyageurs
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">Arrivée</p>
                  <p className="font-semibold">{formatDate(reservation.check_in)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">Départ</p>
                  <p className="font-semibold">{formatDate(reservation.check_out)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">Durée</p>
                  <p className="font-semibold">
                    {reservation.nbre_nuits} nuit{reservation.nbre_nuits > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center text-gray-700">
                <FaUsers className="mr-2 text-turquoise" />
                <span>
                  <strong>{reservation.nbre_adults}</strong> adulte
                  {reservation.nbre_adults > 1 ? "s" : ""}
                </span>
                {(reservation.nbre_children ?? 0) > 0 && (
                  <span className="ml-2">
                    <FaChild className="inline mr-1 text-turquoise" />
                    <strong>{reservation.nbre_children}</strong> enfant
                    {(reservation.nbre_children ?? 0) > 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>

            {/* DEMANDES SPÉCIALES */}
            {reservation.special_requests && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-turquoise flex items-center mb-4">
                  <FaCommentAlt className="mr-2" /> Demandes spéciales
                </h2>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {reservation.special_requests}
                </p>
              </div>
            )}

            {/* SERVICES ADDITIONNELS */}
            {reservation.services.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-semibold text-turquoise flex items-center mb-4">
                  <FaConciergeBell className="mr-2" /> Services additionnels
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">
                          Service
                        </th>
                        <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">
                          Qté
                        </th>
                        <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">
                          Prix unit.
                        </th>
                        <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {reservation.services.map((service: Service) => (
                        <tr key={service.id_reservation_service}>
                          <td className="px-4 py-3">
                            <FaCheckCircle className="inline mr-2 text-turquoise" />
                            {service.nom_service}
                          </td>
                          <td className="px-4 py-3 text-center">{service.quantite}</td>
                          <td className="px-4 py-3 text-right">
                            {service.prix_unitaire.toFixed(2)} €
                          </td>
                          <td className="px-4 py-3 text-right font-medium">
                            {service.sous_total.toFixed(2)} €
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={3} className="px-4 py-3 text-right font-medium">
                          Total services :
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-turquoise">
                          {getTotalServices().toFixed(2)} €
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {/* INFORMATIONS DE RÉSERVATION */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-turquoise flex items-center mb-4">
                <FaInfoCircle className="mr-2" /> Informations de réservation
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Date de réservation</p>
                  <p className="font-medium">{formatDateTime(reservation.date_reservation)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">N° de confirmation</p>
                  <p className="font-medium">{reservation.num_confirmation}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Statut</p>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(
                      currentStatutInfo.couleur
                    )}`}
                  >
                    {currentStatutInfo.nom_statut}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* COLONNE DROITE (1/3) */}
          {/* ============================================================ */}
          <div className="space-y-6">
            {/* RÉCAPITULATIF PRIX */}
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <h2 className="text-lg font-semibold mb-4">Récapitulatif</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span>Prix par nuit</span>
                  <span>{reservation.prix_nuit.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Nombre de nuits</span>
                  <span>× {reservation.nbre_nuits}</span>
                </div>
                {reservation.services.length > 0 && (
                  <div className="flex justify-between text-sm">
                    <span>Services additionnels</span>
                    <span>{getTotalServices().toFixed(2)} €</span>
                  </div>
                )}
              </div>

              <hr className="my-4" />

              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-2xl font-bold text-turquoise">
                  {reservation.total_price.toFixed(2)} €
                </span>
              </div>

              <p className="text-xs text-gray-500 text-center mb-6">
                <FaShieldAlt className="inline mr-1" /> TVA incluse
              </p>

              {/* BOUTONS ACTIONS */}
              <div className="space-y-3">
                <Link
                  href={`/${countryCode}/mes-reservations`}
                  className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FaArrowLeft className="mr-2" /> Retour
                </Link>

                {canPay() && (
                  <button
                    onClick={goToPayment}
                    className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <FaCreditCard className="mr-2" /> Payer maintenant
                  </button>
                )}

                {canCancel() && (
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="w-full flex items-center justify-center px-4 py-3 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <FaTimesCircle className="mr-2" />
                    {cancelling ? "Annulation..." : "Annuler la réservation"}
                  </button>
                )}
              </div>
            </div>

            {/* AIDE */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-md font-semibold flex items-center mb-3">
                <FaQuestionCircle className="mr-2 text-turquoise" /> Besoin d'aide ?
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                Notre équipe est disponible 24h/24 pour vous aider.
              </p>
              <p className="flex items-center text-gray-800">
                <FaPhone className="mr-2 text-turquoise" />
                <strong>1-555-555-555</strong>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}