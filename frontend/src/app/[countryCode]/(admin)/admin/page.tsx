// src/app/[countryCode]/(admin)/admin/page.tsx
// ============================================================================
// Tableau de bord administrateur
// Server Component : les compteurs sont lus directement via Prisma, aucune
// API intermédiaire nécessaire pour de la lecture seule.
// ============================================================================

import Link from "next/link"
import prisma from "@lib/prisma"
import { FiHome, FiCalendar, FiUsers, FiClock } from "react-icons/fi"

// Statut "En attente" (voir table statut, id 1)
const STATUT_EN_ATTENTE = 1

interface DashboardPageProps {
  params: Promise<{ countryCode: string }>
}

export default async function AdminDashboardPage({ params }: DashboardPageProps) {
  const { countryCode } = await params
  const base = `/${countryCode}/admin`

  const [hotels, reservations, users, enAttente, dernieres] = await Promise.all([
    prisma.hotel.count(),
    prisma.reservation.count(),
    prisma.utilisateur.count({ where: { actif: true } }),
    prisma.reservation.count({ where: { id_statut: STATUT_EN_ATTENTE } }),
    prisma.reservation.findMany({
      take: 5,
      orderBy: { date_reservation: "desc" },
      select: {
        id_reservation: true,
        num_confirmation: true,
        check_in: true,
        total_price: true,
        hotel: { select: { nom_hotel: true } },
        user: { select: { prenom_user: true, nom_user: true } },
        statut: { select: { nom_statut: true, couleur: true } },
      },
    }),
  ])

  const cards = [
    { label: "Hôtels", value: hotels, icon: FiHome, href: `${base}/hotels` },
    { label: "Réservations", value: reservations, icon: FiCalendar, href: `${base}/reservations` },
    { label: "Utilisateurs actifs", value: users, icon: FiUsers, href: `${base}/users` },
    { label: "Réservations en attente", value: enAttente, icon: FiClock, href: `${base}/reservations?statut=${STATUT_EN_ATTENTE}` },
  ]

  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold text-gris-fonce mb-6">Tableau de bord</h1>

      {/* Compteurs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-rounded border border-gray-200 p-5 hover:border-turquoise transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-gris-moyen">{label}</span>
              <Icon className="w-5 h-5 text-turquoise" aria-hidden="true" />
            </div>
            <p className="mt-2 text-3xl font-bold text-gris-fonce">{value}</p>
          </Link>
        ))}
      </div>

      {/* Dernières réservations */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gris-fonce">Dernières réservations</h2>
          <Link href={`${base}/reservations`} className="text-sm text-turquoise hover:underline">
            Tout voir
          </Link>
        </div>

        <div className="bg-white rounded-rounded border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gris-clair text-left text-gris-moyen">
              <tr>
                <th className="px-4 py-3 font-medium">Confirmation</th>
                <th className="px-4 py-3 font-medium">Client</th>
                <th className="px-4 py-3 font-medium">Hôtel</th>
                <th className="px-4 py-3 font-medium">Arrivée</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
                <th className="px-4 py-3 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dernieres.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gris-moyen">
                    Aucune réservation pour le moment.
                  </td>
                </tr>
              )}
              {dernieres.map((r) => (
                <tr key={r.id_reservation} className="hover:bg-gris-clair">
                  <td className="px-4 py-3">
                    <Link href={`${base}/reservations/${r.id_reservation}`} className="text-turquoise hover:underline">
                      {r.num_confirmation ?? `#${r.id_reservation}`}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{r.user.prenom_user} {r.user.nom_user}</td>
                  <td className="px-4 py-3">{r.hotel.nom_hotel}</td>
                  <td className="px-4 py-3">{new Date(r.check_in).toLocaleDateString("fr-FR")}</td>
                  <td className="px-4 py-3 text-right">{Number(r.total_price).toFixed(2)} €</td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs bg-gris-clair text-gris-fonce">
                      {r.statut?.nom_statut ?? "—"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
