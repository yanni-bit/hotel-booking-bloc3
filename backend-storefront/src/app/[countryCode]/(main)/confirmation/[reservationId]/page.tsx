// src/app/[countryCode]/(main)/confirmation/[reservationId]/page.tsx
// ============================================================================
// Page de confirmation de réservation (Server Component)
// Affichée après un paiement réussi
// 
// Équivalent de la section "paymentSuccess" dans payment.html Angular
// ============================================================================

import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getReservationById } from "@lib/payments";
import {
  FaCheckCircle,
  FaHome,
  FaCalendarCheck,
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhone,
} from "react-icons/fa";

interface ConfirmationPageProps {
  params: Promise<{ reservationId: string; countryCode: string }>;
}

export default async function ConfirmationPage({ params }: ConfirmationPageProps) {
  const { reservationId, countryCode } = await params;
  const reservationIdNum = parseInt(reservationId);

  if (isNaN(reservationIdNum)) {
    notFound();
  }

  // Charger la réservation
  const reservation = await getReservationById(reservationIdNum);

  if (!reservation) {
    notFound();
  }

  // Vérifier que la réservation est confirmée
  const isConfirmed = reservation.id_statut === 2;

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="content-container">
        <div className="max-w-2xl mx-auto">
          {/* ============================================================ */}
          {/* CARTE DE CONFIRMATION */}
          {/* ============================================================ */}
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            {/* Icône succès */}
            <div className="mb-6">
              <FaCheckCircle className="text-6xl text-green-500 mx-auto" />
            </div>

            {/* Titre */}
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {isConfirmed ? "Réservation confirmée !" : "Réservation en cours"}
            </h1>
            <p className="text-gray-600 mb-6">
              {isConfirmed
                ? "Votre paiement a été accepté et votre réservation est confirmée."
                : "Votre réservation est en attente de confirmation."}
            </p>

            {/* Numéro de confirmation */}
            {reservation.num_confirmation && (
              <div className="bg-turquoise/10 border border-turquoise/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Numéro de confirmation</p>
                <p className="text-2xl font-bold text-turquoise">
                  {reservation.num_confirmation}
                </p>
              </div>
            )}

            {/* Détails hôtel */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <div className="flex gap-4">
                <Image
                  src={reservation.hotel.img_hotel || "/images/default-hotel.jpg"}
                  alt={reservation.hotel.nom_hotel}
                  width={120}
                  height={80}
                  className="w-28 h-20 object-cover rounded-lg"
                />
                <div>
                  <h2 className="font-bold text-gray-800">{reservation.hotel.nom_hotel}</h2>
                  <p className="text-sm text-gray-500">
                    <FaMapMarkerAlt className="inline mr-1" />
                    {reservation.hotel.ville_hotel}, {reservation.hotel.pays_hotel}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {reservation.chambre.type_room}
                    {reservation.chambre.cat_room && ` - ${reservation.chambre.cat_room}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Détails séjour */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-left">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Arrivée</p>
                <p className="font-semibold">
                  {new Date(reservation.check_in).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-500">Départ</p>
                <p className="font-semibold">
                  {new Date(reservation.check_out).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Récapitulatif prix */}
            <div className="border-t border-b py-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  {reservation.nbre_nuits} nuit{reservation.nbre_nuits > 1 ? "s" : ""},{" "}
                  {reservation.nbre_adults} adulte{reservation.nbre_adults > 1 ? "s" : ""}
                  {reservation.nbre_children > 0 &&
                    `, ${reservation.nbre_children} enfant${
                      reservation.nbre_children > 1 ? "s" : ""
                    }`}
                </span>
                <span className="text-xl font-bold text-turquoise">
                  {reservation.total_price.toFixed(2)} €
                </span>
              </div>
            </div>

            {/* Message email */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-blue-800">
                <FaEnvelope className="inline mr-2" />
                Un email de confirmation a été envoyé à votre adresse email avec tous les
                détails de votre réservation.
              </p>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/${countryCode}`}
                className="inline-flex items-center justify-center px-6 py-3 bg-turquoise text-white font-semibold rounded-lg hover:bg-turquoise-dark transition-colors"
              >
                <FaHome className="mr-2" />
                Retour à l&apos;accueil
              </Link>
              <Link
                href={`/${countryCode}/mes-reservations`}
                className="inline-flex items-center justify-center px-6 py-3 border border-turquoise text-turquoise font-semibold rounded-lg hover:bg-turquoise/5 transition-colors"
              >
                <FaCalendarCheck className="mr-2" />
                Mes réservations
              </Link>
            </div>

          </div>

          {/* ============================================================ */}
          {/* AIDE */}
          {/* ============================================================ */}
          <div className="mt-6 bg-white rounded-lg shadow-sm p-6 text-center">
            <h3 className="font-semibold text-gray-800 mb-2">Besoin d&apos;aide ?</h3>
            <p className="text-sm text-gray-600 mb-3">
              Notre équipe est disponible 24h/24 pour répondre à vos questions.
            </p>
            <p className="text-turquoise font-semibold">
              <FaPhone className="inline mr-2" />
              1-555-555-555
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

// Metadata dynamique
export async function generateMetadata({ params }: ConfirmationPageProps) {
  const { reservationId } = await params;
  const reservationIdNum = parseInt(reservationId);

  if (isNaN(reservationIdNum)) {
    return { title: "Confirmation" };
  }

  const reservation = await getReservationById(reservationIdNum);

  if (!reservation) {
    return { title: "Confirmation" };
  }

  return {
    title: `Confirmation - ${reservation.num_confirmation || "Réservation"} | Hotel Booking`,
    description: `Votre réservation à ${reservation.hotel.nom_hotel} est confirmée.`,
  };
}