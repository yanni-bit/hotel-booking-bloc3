// src/modules/payment/components/PaymentForm.tsx
// ============================================================================
// Formulaire de paiement Stripe Elements - VERSION AMÉLIORÉE
// Avec champs séparés comme dans Angular (Bloc 2)
// 
// COMPARAISON Angular → React + Stripe :
// ┌─────────────────────────────────────────────────────────────────┐
// │ Angular (Bloc 2)              │ React + Stripe (Bloc 3)        │
// ├─────────────────────────────────────────────────────────────────┤
// │ <select> Type de carte        │ Auto-détecté par Stripe 🎉     │
// │ <input> Numéro + Luhn         │ <CardNumberElement />          │
// │ <input> Nom sur carte         │ <input> classique              │
// │ <input> MM/YY + validation    │ <CardExpiryElement />          │
// │ <input> CVV 3-4 chiffres      │ <CardCvcElement />             │
// │ formatCardNumber() manuel     │ Stripe formate automatiquement │
// └─────────────────────────────────────────────────────────────────┘
// ============================================================================

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { getStripe, STRIPE_CONFIG } from "@lib/stripe";
import {
  FaLock,
  FaCreditCard,
  FaUser,
  FaCalendarAlt,
  FaShieldAlt,
  FaArrowLeft,
  FaMapMarkerAlt,
  FaPhone,
  FaSpinner,
  FaExclamationTriangle,
  FaCcVisa,
  FaCcMastercard,
  FaCcAmex,
  FaCcDiscover,
} from "react-icons/fa";

// ============================================================================
// TYPES
// ============================================================================
interface ReservationData {
  id_reservation: number;
  num_confirmation: string | null;
  check_in: string;
  check_out: string;
  nbre_nuits: number;
  nbre_adults: number;
  nbre_children: number;
  prix_nuit: number;
  total_price: number;
  devise: string;
  special_requests: string | null;
  id_statut: number | null;
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
  services: {
    nom_service: string;
    quantite: number;
    sous_total: number;
  }[];
}

interface PaymentFormProps {
  reservation: ReservationData;
  countryCode: string;
}

// ============================================================================
// STYLES STRIPE ELEMENTS
// ============================================================================
const stripeElementStyle = {
  base: {
    fontSize: "16px",
    color: "#1f2937",
    fontFamily: "system-ui, -apple-system, sans-serif",
    "::placeholder": {
      color: "#9ca3af",
    },
    iconColor: "#17a2b8",
  },
  invalid: {
    color: "#ef4444",
    iconColor: "#ef4444",
  },
  complete: {
    color: "#10b981",
    iconColor: "#10b981",
  },
};

// ============================================================================
// COMPOSANT WRAPPER (avec Elements Provider)
// ============================================================================
export default function PaymentForm({ reservation, countryCode }: PaymentFormProps) {
  const stripePromise = getStripe();

  return (
    <Elements
      stripe={stripePromise}
      options={{
        appearance: STRIPE_CONFIG.appearance,
        locale: "fr",
      }}
    >
      <PaymentFormContent
        reservation={reservation}
        countryCode={countryCode}
      />
    </Elements>
  );
}

// ============================================================================
// COMPOSANT PRINCIPAL (formulaire)
// ============================================================================
function PaymentFormContent({ reservation, countryCode }: PaymentFormProps) {
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();

  // États
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptConditions, setAcceptConditions] = useState(false);

  // États des champs de carte (comme Angular)
  const [cardName, setCardName] = useState("");
  const [cardBrand, setCardBrand] = useState<string | null>(null);
  const [cardNumberComplete, setCardNumberComplete] = useState(false);
  const [cardExpiryComplete, setCardExpiryComplete] = useState(false);
  const [cardCvcComplete, setCardCvcComplete] = useState(false);

  // Erreurs par champ (comme Angular avec les messages d'erreur)
  const [cardNumberError, setCardNumberError] = useState<string | null>(null);
  const [cardExpiryError, setCardExpiryError] = useState<string | null>(null);
  const [cardCvcError, setCardCvcError] = useState<string | null>(null);

  // Formulaire valide ?
  const isFormValid =
    cardNumberComplete &&
    cardExpiryComplete &&
    cardCvcComplete &&
    cardName.trim() !== "" &&
    acceptConditions;

  // ============================================================================
  // CRÉER LE PAYMENTINTENT AU CHARGEMENT
  // ============================================================================
  useEffect(() => {
    async function createPaymentIntent() {
      try {
        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reservationId: reservation.id_reservation,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Erreur lors de la création du paiement");
        }

        setClientSecret(data.clientSecret);
        setLoading(false);
      } catch (err) {
        console.error("❌ Erreur:", err);
        setError(err instanceof Error ? err.message : "Erreur de chargement");
        setLoading(false);
      }
    }

    createPaymentIntent();
  }, [reservation.id_reservation]);

  // ============================================================================
  // ICÔNE DE CARTE (comme Angular avec cardType)
  // Stripe détecte automatiquement le type de carte
  // ============================================================================
  function getCardIcon() {
    switch (cardBrand) {
      case "visa":
        return <FaCcVisa className="text-2xl text-blue-600" />;
      case "mastercard":
        return <FaCcMastercard className="text-2xl text-orange-500" />;
      case "amex":
        return <FaCcAmex className="text-2xl text-blue-500" />;
      case "discover":
        return <FaCcDiscover className="text-2xl text-orange-600" />;
      default:
        return <FaCreditCard className="text-2xl text-gray-400" />;
    }
  }

  // ============================================================================
  // SOUMISSION DU PAIEMENT
  // ============================================================================
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    if (!isFormValid) {
      setError("Veuillez remplir tous les champs correctement");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // 1. Récupérer l'élément CardNumber (les autres sont liés automatiquement)
      const cardNumberElement = elements.getElement(CardNumberElement);

      if (!cardNumberElement) {
        throw new Error("Élément de carte non trouvé");
      }

      // 2. Confirmer le paiement avec Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardNumberElement,
            billing_details: {
              name: cardName,
            },
          },
        }
      );

      if (stripeError) {
        // Gérer les erreurs Stripe (carte refusée, etc.)
        // Équivalent de declinedTestCards dans Angular
        throw new Error(stripeError.message || "Erreur de paiement");
      }

      if (paymentIntent?.status !== "succeeded") {
        throw new Error("Le paiement n'a pas abouti");
      }

      console.log("✅ Paiement Stripe réussi:", paymentIntent.id);

      // 3. Confirmer la réservation côté serveur
      const confirmResponse = await fetch(
        `/api/reservations/${reservation.id_reservation}/confirm`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
          }),
        }
      );

      const confirmData = await confirmResponse.json();

      if (!confirmResponse.ok) {
        throw new Error(confirmData.error || "Erreur de confirmation");
      }

      console.log("✅ Réservation confirmée:", confirmData.data);

      // 4. Rediriger vers la page de confirmation
      router.push(`/${countryCode}/confirmation/${reservation.id_reservation}`);
    } catch (err) {
      console.error("❌ Erreur paiement:", err);
      setError(err instanceof Error ? err.message : "Erreur de paiement");
      setSubmitting(false);
    }
  }

  // ============================================================================
  // RENDU - LOADING
  // ============================================================================
  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-turquoise mx-auto mb-4" />
          <p className="text-gray-600">Préparation du paiement sécurisé...</p>
        </div>
      </main>
    );
  }

  // ============================================================================
  // RENDU - ERREUR INITIALE
  // ============================================================================
  if (error && !clientSecret) {
    return (
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="content-container">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center max-w-lg mx-auto">
            <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-red-700 mb-2">Erreur</h1>
            <p className="text-red-600 mb-4">{error}</p>
            <Link
              href={`/${countryCode}`}
              className="inline-flex items-center px-4 py-2 bg-turquoise text-white rounded-lg hover:bg-turquoise-dark"
            >
              <FaArrowLeft className="mr-2" />
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ============================================================================
  // RENDU - FORMULAIRE
  // ============================================================================
  return (
    <main className="min-h-screen bg-gray-50 pb-8">
      <div className="content-container py-6">
        {/* BREADCRUMB */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="flex items-center space-x-2 text-sm flex-wrap">
            <li>
              <Link href={`/${countryCode}`} className="text-turquoise hover:underline">
                Accueil
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link
                href={`/${countryCode}/hotels?city=${reservation.hotel.ville_hotel}`}
                className="text-turquoise hover:underline"
              >
                {reservation.hotel.ville_hotel}
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link
                href={`/${countryCode}/hotels/${reservation.hotel.id_hotel}/description`}
                className="text-turquoise hover:underline"
              >
                {reservation.hotel.nom_hotel}
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-600">Paiement</li>
          </ol>
        </nav>

        {/* ÉTAPES */}
        <div className="flex items-center justify-center mb-6">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 text-white font-bold">
              ✓
            </div>
            <span className="ml-2 text-green-600 font-medium">Informations</span>
          </div>
          <div className="w-16 h-1 bg-turquoise mx-4" />
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-turquoise text-white font-bold">
              02
            </div>
            <span className="ml-2 text-turquoise font-medium">Paiement</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ============================================================ */}
          {/* FORMULAIRE PAIEMENT (2/3) */}
          {/* ============================================================ */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
                <h2 className="text-lg font-semibold mb-6 flex items-center text-turquoise">
                  <FaCreditCard className="mr-2" />
                  Paiement sécurisé
                </h2>

                {/* Erreur de paiement globale */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-600 flex items-center">
                      <FaExclamationTriangle className="mr-2 flex-shrink-0" />
                      {error}
                    </p>
                  </div>
                )}

                {/* ========== NUMÉRO DE CARTE ========== */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaCreditCard className="inline mr-2 text-gray-400" />
                    Numéro de carte
                  </label>
                  <div className="relative">
                    <div
                      className={`border rounded-lg p-4 transition-all ${
                        cardNumberError
                          ? "border-red-300 bg-red-50"
                          : cardNumberComplete
                          ? "border-green-300 bg-green-50"
                          : "border-gray-300 focus-within:border-turquoise focus-within:ring-1 focus-within:ring-turquoise"
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="flex-1">
                          <CardNumberElement
                            options={{
                              style: stripeElementStyle,
                              placeholder: "1234 5678 9012 3456",
                              showIcon: true,
                            }}
                            onChange={(e) => {
                              setCardNumberComplete(e.complete);
                              setCardBrand(e.brand);
                              setCardNumberError(e.error?.message || null);
                            }}
                          />
                        </div>
                        <div className="ml-3 flex-shrink-0">
                          {getCardIcon()}
                        </div>
                      </div>
                    </div>
                    {cardNumberError && (
                      <p className="mt-1 text-sm text-red-600">{cardNumberError}</p>
                    )}
                  </div>
                </div>

                {/* ========== NOM SUR LA CARTE ========== */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaUser className="inline mr-2 text-gray-400" />
                    Nom sur la carte
                  </label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Jean Dupont"
                    className={`w-full border rounded-lg p-4 text-gray-800 placeholder-gray-400 transition-all ${
                      cardName.trim()
                        ? "border-green-300 bg-green-50"
                        : "border-gray-300 focus:border-turquoise focus:ring-1 focus:ring-turquoise"
                    }`}
                  />
                </div>

                {/* ========== DATE D'EXPIRATION + CVV ========== */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {/* Date d'expiration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaCalendarAlt className="inline mr-2 text-gray-400" />
                      Date d&apos;expiration
                    </label>
                    <div
                      className={`border rounded-lg p-4 transition-all ${
                        cardExpiryError
                          ? "border-red-300 bg-red-50"
                          : cardExpiryComplete
                          ? "border-green-300 bg-green-50"
                          : "border-gray-300 focus-within:border-turquoise focus-within:ring-1 focus-within:ring-turquoise"
                      }`}
                    >
                      <CardExpiryElement
                        options={{
                          style: stripeElementStyle,
                          placeholder: "MM / AA",
                        }}
                        onChange={(e) => {
                          setCardExpiryComplete(e.complete);
                          setCardExpiryError(e.error?.message || null);
                        }}
                      />
                    </div>
                    {cardExpiryError && (
                      <p className="mt-1 text-sm text-red-600">{cardExpiryError}</p>
                    )}
                  </div>

                  {/* CVV */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FaShieldAlt className="inline mr-2 text-gray-400" />
                      Code de sécurité (CVV)
                    </label>
                    <div
                      className={`border rounded-lg p-4 transition-all ${
                        cardCvcError
                          ? "border-red-300 bg-red-50"
                          : cardCvcComplete
                          ? "border-green-300 bg-green-50"
                          : "border-gray-300 focus-within:border-turquoise focus-within:ring-1 focus-within:ring-turquoise"
                      }`}
                    >
                      <CardCvcElement
                        options={{
                          style: stripeElementStyle,
                          placeholder: "123",
                        }}
                        onChange={(e) => {
                          setCardCvcComplete(e.complete);
                          setCardCvcError(e.error?.message || null);
                        }}
                      />
                    </div>
                    {cardCvcError && (
                      <p className="mt-1 text-sm text-red-600">{cardCvcError}</p>
                    )}
                  </div>
                </div>

                {/* ========== CARTES DE TEST ========== */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-semibold text-blue-800 mb-3 flex items-center">
                    <span className="mr-2">🧪</span>
                    Cartes de test Stripe
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-green-700 font-medium mb-2">✅ Acceptées :</p>
                      <ul className="text-gray-600 space-y-1">
                        <li className="flex items-center">
                          <FaCcVisa className="mr-2 text-blue-600" />
                          4242 4242 4242 4242
                        </li>
                        <li className="flex items-center">
                          <FaCcMastercard className="mr-2 text-orange-500" />
                          5555 5555 5555 4444
                        </li>
                        <li className="flex items-center">
                          <FaCcAmex className="mr-2 text-blue-500" />
                          3782 822463 10005
                        </li>
                        <li className="text-gray-500 text-xs mt-2">
                          Date : toute date future • CVV : 3 chiffres
                        </li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-red-700 font-medium mb-2">❌ Refusées :</p>
                      <ul className="text-gray-600 space-y-1">
                        <li>4000 0000 0000 0002 (Refusée)</li>
                        <li>4000 0000 0000 9995 (Fonds insuffisants)</li>
                        <li>4000 0000 0000 0069 (Carte expirée)</li>
                        <li>4000 0000 0000 0127 (CVV incorrect)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* ========== CONDITIONS ========== */}
                <div className="flex items-start mb-6">
                  <input
                    type="checkbox"
                    id="acceptConditions"
                    checked={acceptConditions}
                    onChange={(e) => setAcceptConditions(e.target.checked)}
                    className="mt-1 w-5 h-5 text-turquoise rounded focus:ring-turquoise cursor-pointer"
                  />
                  <label htmlFor="acceptConditions" className="ml-3 text-sm text-gray-600 cursor-pointer">
                    J&apos;accepte les{" "}
                    <a href="#" className="text-turquoise hover:underline">
                      conditions générales de vente
                    </a>{" "}
                    et la{" "}
                    <a href="#" className="text-turquoise hover:underline">
                      politique de confidentialité
                    </a>
                    .
                  </label>
                </div>

                {/* ========== BOUTONS ========== */}
                <div className="flex gap-3">
                  <Link
                    href={`/${countryCode}/booking/${reservation.offre.id_offre}`}
                    className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center transition-colors"
                  >
                    <FaArrowLeft className="mr-2" />
                    Retour
                  </Link>
                  <button
                    type="submit"
                    disabled={!stripe || !isFormValid || submitting}
                    className="flex-1 py-3 px-6 bg-turquoise text-white font-semibold rounded-lg hover:bg-turquoise-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Traitement en cours...
                      </>
                    ) : (
                      <>
                        <FaLock className="mr-2" />
                        Payer {reservation.total_price.toFixed(2)} €
                      </>
                    )}
                  </button>
                </div>

                {/* ========== SÉCURITÉ ========== */}
                <div className="mt-6 pt-4 border-t text-center">
                  <p className="text-xs text-gray-500">
                    <FaLock className="inline mr-1" />
                    Paiement sécurisé par Stripe. Vos données bancaires ne transitent jamais par nos serveurs.
                  </p>
                  <div className="flex justify-center items-center gap-3 mt-3">
                    <FaCcVisa className="text-2xl text-gray-400" />
                    <FaCcMastercard className="text-2xl text-gray-400" />
                    <FaCcAmex className="text-2xl text-gray-400" />
                    <FaCcDiscover className="text-2xl text-gray-400" />
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* ============================================================ */}
          {/* RÉSUMÉ (1/3) */}
          {/* ============================================================ */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h2 className="text-lg font-semibold mb-4">Récapitulatif</h2>

              {/* Image hôtel */}
              <div className="mb-4">
                <Image
                  src={reservation.hotel.img_hotel || "/images/default-hotel.jpg"}
                  alt={reservation.hotel.nom_hotel}
                  width={400}
                  height={200}
                  className="w-full h-40 object-cover rounded-lg"
                />
              </div>

              <h3 className="font-bold text-gray-800">{reservation.hotel.nom_hotel}</h3>
              <p className="text-sm text-gray-500 mb-3">
                <FaMapMarkerAlt className="inline mr-1" />
                {reservation.hotel.ville_hotel}, {reservation.hotel.pays_hotel}
              </p>

              <hr className="my-3" />

              {/* Détails */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Chambre</span>
                  <span className="font-medium">{reservation.chambre.type_room}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Offre</span>
                  <span className="font-medium">{reservation.offre.nom_offre}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Arrivée</span>
                  <span className="font-medium">
                    {new Date(reservation.check_in).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Départ</span>
                  <span className="font-medium">
                    {new Date(reservation.check_out).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Durée</span>
                  <span className="font-medium">
                    {reservation.nbre_nuits} nuit{reservation.nbre_nuits > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Voyageurs</span>
                  <span className="font-medium">
                    {reservation.nbre_adults} adulte{reservation.nbre_adults > 1 ? "s" : ""}
                    {reservation.nbre_children > 0 &&
                      `, ${reservation.nbre_children} enfant${
                        reservation.nbre_children > 1 ? "s" : ""
                      }`}
                  </span>
                </div>
              </div>

              {/* Services */}
              {reservation.services.length > 0 && (
                <>
                  <hr className="my-3" />
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-gray-700">Services additionnels</p>
                    {reservation.services.map((service, index) => (
                      <div key={index} className="flex justify-between text-gray-600">
                        <span>{service.nom_service}</span>
                        <span>{service.sous_total.toFixed(2)} €</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <hr className="my-3" />

              {/* Total */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-800">Total</span>
                  <span className="text-2xl font-bold text-turquoise">
                    {reservation.total_price.toFixed(2)} €
                  </span>
                </div>
              </div>

              {/* Aide */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium mb-1">Besoin d&apos;aide ?</h4>
                <p className="text-xs text-gray-500">
                  <FaPhone className="inline mr-1" />
                  1-555-555-555
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}