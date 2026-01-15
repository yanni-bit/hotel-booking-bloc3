// src/modules/booking/components/BookingForm.tsx
// ============================================================================
// Formulaire de réservation (Client Component)
// Conversion de booking.component.ts Angular → React
// ============================================================================

"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  FaCalendarAlt,
  FaUser,
  FaUsers,
  FaChild,
  FaEnvelope,
  FaPhone,
  FaCommentAlt,
  FaPlusCircle,
  FaCheckCircle,
  FaMapMarkerAlt,
  FaLock,
  FaGift,
  FaArrowLeft,
} from "react-icons/fa";
import { useAuth } from "@modules/auth/components/AuthProvider";

// ============================================================================
// TYPES
// ============================================================================
interface Offre {
  id_offre: number;
  nom_offre: string;
  prix_nuit: number | string;
  devise: string;
  pension: string;
  petit_dejeuner_inclus: boolean;
  conditions_annulation?: string;
  hotel: {
    id_hotel: number;
    nom_hotel: string;
    ville_hotel: string;
    pays_hotel: string;
    img_hotel: string | null;
    nbre_etoile_hotel: number | null;
  };
  chambre: {
    id_chambre: number;
    type_room: string;
    cat_room: string | null;
    nbre_adults_max: number;
    nbre_children_max: number;
    images?: { url_img: string }[];
  };
}

interface HotelService {
  id_hotel_service: number;
  id_service: number;
  nom_service: string;
  description_service: string | null;
  type_service: string;
  icone_service: string | null;
  prix_service: number;
  inclus?: boolean;
}

interface ServiceSelection {
  id_hotel_service: number;
  nom_service: string;
  prix_service: number;
  type_service: string;
  quantite: number;
}

interface BookingFormProps {
  offre: Offre;
  services: HotelService[];
  countryCode: string;
}

// ============================================================================
// COMPOSANT
// ============================================================================
export default function BookingForm({
  offre,
  services,
  countryCode,
}: BookingFormProps) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuth();

  // État du formulaire
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [nbreAdults, setNbreAdults] = useState(2);
  const [nbreChildren, setNbreChildren] = useState(0);

  // Infos client
  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  // Services
  const [servicesSelectionnes, setServicesSelectionnes] = useState<
    ServiceSelection[]
  >([]);

  // UI State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ============================================================================
  // INITIALISATION DES DATES
  // ============================================================================
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    setCheckIn(formatDate(today));
    setCheckOut(formatDate(tomorrow));
  }, []);

  // ============================================================================
  // HELPERS
  // ============================================================================
  function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const minCheckIn = useMemo(() => formatDate(new Date()), []);

  const minCheckOut = useMemo(() => {
    if (checkIn) {
      const checkInDate = new Date(checkIn);
      checkInDate.setDate(checkInDate.getDate() + 1);
      return formatDate(checkInDate);
    }
    return minCheckIn;
  }, [checkIn, minCheckIn]);

  const nbreNuits = useMemo(() => {
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diff = end.getTime() - start.getTime();
      const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return nights > 0 ? nights : 1;
    }
    return 1;
  }, [checkIn, checkOut]);

  const prixNuit = Number(offre.prix_nuit) || 0;
  const prixChambre = prixNuit * nbreNuits;

  const servicesAvecInclus = useMemo(() => {
    return services.map((s) => {
      if (s.id_service === 2) {
        const petitDejInclus =
          offre.petit_dejeuner_inclus ||
          offre.pension === "breakfast" ||
          offre.pension === "half_board" ||
          offre.pension === "full_board" ||
          offre.pension === "all_inclusive";

        if (petitDejInclus) {
          return { ...s, inclus: true };
        }
      }
      return { ...s, inclus: false };
    });
  }, [services, offre]);

  const prixServices = useMemo(() => {
    return servicesSelectionnes.reduce((total, service) => {
      let prix = service.prix_service;

      if (service.type_service === "journalier") {
        prix *= nbreNuits;
      } else if (service.type_service === "par_personne") {
        prix *= nbreNuits * nbreAdults;
      }

      return total + prix;
    }, 0);
  }, [servicesSelectionnes, nbreNuits, nbreAdults]);

  const prixTotal = prixChambre + prixServices;

  // ============================================================================
  // HANDLERS
  // ============================================================================
  function handleServiceChange(service: HotelService, checked: boolean) {
    if (checked) {
      setServicesSelectionnes((prev) => [
        ...prev,
        {
          id_hotel_service: service.id_hotel_service,
          nom_service: service.nom_service,
          prix_service: service.prix_service,
          type_service: service.type_service,
          quantite: 1,
        },
      ]);
    } else {
      setServicesSelectionnes((prev) =>
        prev.filter((s) => s.id_hotel_service !== service.id_hotel_service)
      );
    }
  }

  function calculateServicePrice(service: ServiceSelection): number {
    let prix = service.prix_service;

    if (service.type_service === "journalier") {
      prix *= nbreNuits;
    } else if (service.type_service === "par_personne") {
      prix *= nbreNuits * nbreAdults;
    }

    return prix;
  }

  function getServiceTypeLabel(type: string): string {
    switch (type) {
      case "journalier":
        return "/ jour";
      case "par_personne":
        return "/ pers. / jour";
      case "sejour":
        return "/ séjour";
      case "unitaire":
        return "/ unité";
      default:
        return "";
    }
  }

  // ============================================================================
  // SOUMISSION
  // ============================================================================
  async function handleSubmit() {
    setError("");

    // Vérifier si l'utilisateur est connecté
    if (!isAuthenticated || !user) {
      // Rediriger vers login avec return URL
      router.push(`/${countryCode}/login?redirect=/booking/${offre.id_offre}`);
      return;
    }

    const userId = user.id_user;

    if (!prenom || !nom || !email || !telephone) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (!checkIn || !checkOut || nbreNuits < 1) {
      setError("Veuillez sélectionner des dates valides");
      return;
    }

    setSubmitting(true);

    try {
      const reservationData = {
        id_offre: offre.id_offre,
        id_user: userId,
        id_hotel: offre.hotel.id_hotel,
        id_chambre: offre.chambre.id_chambre,
        check_in: checkIn,
        check_out: checkOut,
        nbre_nuits: nbreNuits,
        nbre_adults: nbreAdults,
        nbre_children: nbreChildren,
        prix_nuit: prixNuit,
        total_price: prixTotal,
        devise: offre.devise || "EUR",
        special_requests: specialRequests,
        id_statut: 1,
        services: servicesSelectionnes,
      };

      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservationData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Erreur lors de la réservation");
      }

      console.log("✅ Réservation créée:", result.data);

      router.push(`/${countryCode}/payment/${result.data.id_reservation}`);
    } catch (err) {
      console.error("❌ Erreur:", err);
      setError(
        err instanceof Error ? err.message : "Erreur lors de la réservation"
      );
      setSubmitting(false);
    }
  }

  // ============================================================================
  // RENDU
  // ============================================================================
  return (
    <main className="pb-5 booking-page bg-gray-50 min-h-screen">
      <div className="content-container py-6">
        {/* BREADCRUMB */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link
                href={`/${countryCode}`}
                className="text-turquoise hover:underline"
              >
                Accueil
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link
                href={`/${countryCode}/hotels?city=${offre.hotel.ville_hotel}`}
                className="text-turquoise hover:underline"
              >
                {offre.hotel.ville_hotel}
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link
                href={`/${countryCode}/hotels/${offre.hotel.id_hotel}/description`}
                className="text-turquoise hover:underline"
              >
                {offre.hotel.nom_hotel}
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-600">Réservation</li>
          </ol>
        </nav>

        {/* Titre section */}
        <h1 className="text-xl font-semibold mb-4 pb-2 border-b text-gray-700 flex items-center">
          <FaCalendarAlt className="mr-3 text-turquoise" />
          Réserver votre séjour
        </h1>

        {/* Erreur */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ============================================================ */}
          {/* FORMULAIRE (2/3) */}
          {/* ============================================================ */}
          <div className="lg:col-span-2 space-y-6">
            {/* DATES ET VOYAGEURS */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-turquoise mb-4 flex items-center">
                <FaCalendarAlt className="mr-2" />
                Dates et voyageurs
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date d&apos;arrivée *
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    min={minCheckIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise focus:border-turquoise"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date de départ *
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    min={minCheckOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise focus:border-turquoise"
                  />
                </div>
              </div>

              <div className="bg-turquoise/10 border border-turquoise/30 rounded-lg p-3 mb-4">
                <p className="text-turquoise font-medium">
                  <FaCalendarAlt className="inline mr-2" />
                  <strong>{nbreNuits}</strong> nuit{nbreNuits > 1 ? "s" : ""}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FaUsers className="inline mr-1" /> Nombre d&apos;adultes *
                  </label>
                  <select
                    value={nbreAdults}
                    onChange={(e) => setNbreAdults(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise focus:border-turquoise"
                  >
                    {[1, 2, 3, 4].map((n) => (
                      <option key={n} value={n}>
                        {n} adulte{n > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FaChild className="inline mr-1" /> Nombre d&apos;enfants
                  </label>
                  <select
                    value={nbreChildren}
                    onChange={(e) => setNbreChildren(Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise focus:border-turquoise"
                  >
                    <option value={0}>Pas d&apos;enfant</option>
                    {[1, 2, 3].map((n) => (
                      <option key={n} value={n}>
                        {n} enfant{n > 1 ? "s" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* INFORMATIONS CLIENT */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-turquoise mb-4 flex items-center">
                <FaUser className="mr-2" />
                Vos informations
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    value={prenom}
                    onChange={(e) => setPrenom(e.target.value)}
                    placeholder="Votre prénom"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise focus:border-turquoise"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="Votre nom"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise focus:border-turquoise"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FaEnvelope className="inline mr-1" /> Email *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise focus:border-turquoise"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FaPhone className="inline mr-1" /> Téléphone *
                  </label>
                  <input
                    type="tel"
                    value={telephone}
                    onChange={(e) => setTelephone(e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise focus:border-turquoise"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaCommentAlt className="inline mr-1" /> Demandes spéciales
                </label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Chambre avec vue, lit bébé, arrivée tardive..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-turquoise focus:border-turquoise"
                />
              </div>
            </div>

            {/* SERVICES ADDITIONNELS */}
            {servicesAvecInclus.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-turquoise mb-4 flex items-center">
                  <FaPlusCircle className="mr-2" />
                  Services additionnels
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {servicesAvecInclus.map((service) => (
                    <div
                      key={service.id_hotel_service}
                      className={`border rounded-lg p-4 transition-all ${
                        service.inclus
                          ? "bg-green-50 border-green-200"
                          : "hover:border-turquoise hover:bg-turquoise/5"
                      }`}
                    >
                      <label className="flex items-start cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={service.inclus}
                          checked={
                            service.inclus ||
                            servicesSelectionnes.some(
                              (s) =>
                                s.id_hotel_service === service.id_hotel_service
                            )
                          }
                          onChange={(e) =>
                            handleServiceChange(service, e.target.checked)
                          }
                          className="mt-1 mr-3 w-5 h-5 text-turquoise rounded focus:ring-turquoise disabled:opacity-0"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-800">
                              {service.nom_service}
                            </span>
                            {service.inclus ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                <FaGift className="mr-1" /> Inclus
                              </span>
                            ) : (
                              <span className="text-turquoise font-bold">
                                {service.prix_service.toFixed(2)} €
                                <span className="text-xs text-gray-500 font-normal ml-1">
                                  {getServiceTypeLabel(service.type_service)}
                                </span>
                              </span>
                            )}
                          </div>
                          {service.description_service && (
                            <p className="text-sm text-gray-500 mt-1">
                              {service.description_service}
                            </p>
                          )}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ============================================================ */}
          {/* RÉSUMÉ (1/3) - STICKY */}
          {/* ============================================================ */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h2 className="text-lg font-semibold mb-4">Récapitulatif</h2>

              <div className="mb-4">
                <Image
                  src={offre.hotel.img_hotel || "/images/default-hotel.jpg"}
                  alt={offre.hotel.nom_hotel}
                  width={400}
                  height={200}
                  className="w-full h-40 object-cover rounded-lg"
                />
              </div>

              <h3 className="font-bold text-gray-800">
                {offre.hotel.nom_hotel}
              </h3>
              <p className="text-sm text-gray-500 mb-3">
                <FaMapMarkerAlt className="inline mr-1" />
                {offre.hotel.ville_hotel}, {offre.hotel.pays_hotel}
              </p>

              <hr className="my-3" />

              <div className="mb-3">
                <p className="text-sm text-gray-500">Chambre</p>
                <p className="font-medium">
                  {offre.chambre.type_room}
                  {offre.chambre.cat_room && ` - ${offre.chambre.cat_room}`}
                </p>
              </div>

              <div className="mb-3">
                <p className="text-sm text-gray-500">Offre</p>
                <p className="font-medium">{offre.nom_offre}</p>
              </div>

              <div className="mb-3">
                <p className="text-sm text-gray-500">Séjour</p>
                <p className="font-medium">
                  {checkIn && new Date(checkIn).toLocaleDateString("fr-FR")} →{" "}
                  {checkOut && new Date(checkOut).toLocaleDateString("fr-FR")}
                </p>
                <p className="text-sm text-gray-500">
                  {nbreNuits} nuit{nbreNuits > 1 ? "s" : ""}
                </p>
              </div>

              <div className="mb-3">
                <p className="text-sm text-gray-500">Voyageurs</p>
                <p className="font-medium">
                  {nbreAdults} adulte{nbreAdults > 1 ? "s" : ""}
                  {nbreChildren > 0 &&
                    `, ${nbreChildren} enfant${nbreChildren > 1 ? "s" : ""}`}
                </p>
              </div>

              <hr className="my-3" />

              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-sm">
                  <span>
                    Chambre ({nbreNuits} nuit{nbreNuits > 1 ? "s" : ""})
                  </span>
                  <span>{prixChambre.toFixed(2)} €</span>
                </div>

                {servicesSelectionnes.length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-sm font-medium mb-2">
                      Services additionnels
                    </p>
                    {servicesSelectionnes.map((service) => (
                      <div
                        key={service.id_hotel_service}
                        className="flex justify-between text-sm text-gray-600"
                      >
                        <span>{service.nom_service}</span>
                        <span>
                          {calculateServicePrice(service).toFixed(2)} €
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-800">Total</span>
                  <span className="text-2xl font-bold text-turquoise">
                    {prixTotal.toFixed(2)} €
                  </span>
                </div>
                {servicesSelectionnes.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    (dont {prixServices.toFixed(2)} € de services)
                  </p>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-3 px-4 bg-turquoise text-white font-semibold rounded-lg hover:bg-turquoise-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {submitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="mr-2" />
                    Confirmer la réservation
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                <FaLock className="inline mr-1" />
                Paiement sécurisé
              </p>
            </div>
          </div>
        </div>

        {/* Bouton retour */}
        <div className="mt-6">
          <Link
            href={`/${countryCode}/hotels/${offre.hotel.id_hotel}/offers`}
            className="inline-flex items-center text-turquoise hover:underline"
          >
            <FaArrowLeft className="mr-2" />
            Retour aux offres
          </Link>
        </div>
      </div>
    </main>
  );
}
