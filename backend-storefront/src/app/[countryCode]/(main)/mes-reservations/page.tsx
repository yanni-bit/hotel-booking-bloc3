// src/app/[countryCode]/(main)/mes-reservations/page.tsx
// ============================================================================
// Page "Mes réservations" - Server Component
// 
// Différence Angular → Next.js :
// - Angular : Route guard CanActivate pour protéger la page
// - Next.js : Vérification dans le Server Component + redirect()
// ============================================================================

import { redirect } from "next/navigation";
import { getCurrentUser } from "@lib/auth";
import { getUserReservations } from "@lib/reservations";
import ReservationsList from "@modules/reservations/components/ReservationsList";
import Link from "next/link";
import { FaHome, FaClipboardList } from "react-icons/fa";

interface MesReservationsPageProps {
  params: Promise<{ countryCode: string }>;
}

export const metadata = {
  title: "Mes réservations | Hotel Booking",
  description: "Consultez et gérez vos réservations d'hôtels.",
};

export default async function MesReservationsPage({ params }: MesReservationsPageProps) {
  const { countryCode } = await params;

  // Vérifier l'authentification (Server-side)
  const user = await getCurrentUser();

  if (!user) {
    // Rediriger vers login avec return URL
    redirect(`/${countryCode}/login?redirect=/mes-reservations`);
  }

  // Charger les réservations
  const reservationsRaw = await getUserReservations(user.id_user);

  // Formater les données pour le composant
  const reservations = reservationsRaw.map((r) => ({
    id_reservation: r.id_reservation,
    num_confirmation: r.num_confirmation || "",
    check_in: r.check_in.toISOString(),
    check_out: r.check_out.toISOString(),
    nbre_nuits: r.nbre_nuits,
    nbre_adults: r.nbre_adults,
    nbre_children: r.nbre_children,
    total_price: Number(r.total_price),
    devise: r.devise,
    date_reservation: r.date_reservation.toISOString(),
    id_statut: r.id_statut ?? 1, // Défaut: 1 (En attente) si null
    statut: {
      nom_statut: r.statut?.nom_statut ?? "En attente",
      couleur_statut: r.statut?.couleur ?? "secondary", // ← couleur (pas couleur_statut)
    },
    hotel: {
      nom_hotel: r.hotel.nom_hotel,
      ville_hotel: r.hotel.ville_hotel,
      img_hotel: r.hotel.img_hotel || "",
    },
    chambre: {
      type_room: r.chambre.type_room,
    },
  }));

  return (
    <section className="mes-reservations-page py-8 min-h-screen bg-gray-50">
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
            <li className="text-gray-600">Mes réservations</li>
          </ol>
        </nav>

        {/* Titre */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <FaClipboardList className="mr-3 text-turquoise" />
            Mes réservations
          </h1>
          <p className="text-gray-500 mt-2">
            Bonjour {user.prenom}, voici vos réservations.
          </p>
        </div>

        {/* Liste des réservations (Client Component) */}
        <ReservationsList
          initialReservations={reservations}
          countryCode={countryCode}
        />
      </div>
    </section>
  );
}