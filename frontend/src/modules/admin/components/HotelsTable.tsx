// src/modules/admin/components/HotelsTable.tsx
// ============================================================================
// Admin : tableau des hôtels (recherche + pagination), portage de l'ancienne
// page Medusa vers React/Tailwind.
// ============================================================================

"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { FiSearch, FiChevronLeft, FiChevronRight, FiStar } from "react-icons/fi"

interface Hotel {
  id_hotel: number
  nom_hotel: string
  ville_hotel: string
  pays_hotel: string
  nbre_etoile_hotel: number | null
  note_moy_hotel: string | null // Decimal sérialisé en JSON
  _count: {
    chambres: number
    reservations: number
  }
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

const PAGE_SIZE = 15
const SEARCH_DELAY_MS = 300

export default function HotelsTable() {
  const router = useRouter()
  const { countryCode } = useParams<{ countryCode: string }>()

  const [hotels, setHotels] = useState<Hotel[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [page, setPage] = useState(1)

  // Recherche avec délai : on n'interroge l'API qu'une fois la frappe terminée
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim())
      setPage(1)
    }, SEARCH_DELAY_MS)
    return () => clearTimeout(timer)
  }, [search])

  // Chargement à chaque changement de page ou de recherche
  useEffect(() => {
    let cancelled = false

    const fetchHotels = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
          ...(debouncedSearch && { search: debouncedSearch }),
        })
        const response = await fetch(`/api/admin/hotels?${params}`)
        if (!response.ok) {
          throw new Error(`Réponse ${response.status}`)
        }
        const data = await response.json()
        if (!cancelled) {
          setHotels(data.hotels)
          setPagination(data.pagination)
        }
      } catch (err) {
        console.error("Erreur chargement hôtels:", err)
        if (!cancelled) setError("Impossible de charger les hôtels. Réessayez.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchHotels()
    return () => {
      cancelled = true
    }
  }, [page, debouncedSearch])

  const openHotel = (id: number) => router.push(`/${countryCode}/admin/hotels/${id}`)

  return (
    <div className="space-y-4">
      {/* Barre d'outils */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <label className="relative flex-1 max-w-sm">
          <span className="sr-only">Rechercher un hôtel</span>
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nom ou ville"
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-rounded text-sm focus:outline-none focus:border-turquoise focus:ring-1 focus:ring-turquoise"
          />
        </label>
        <span className="text-sm text-gris-moyen">
          {pagination ? `${pagination.total} hôtel${pagination.total > 1 ? "s" : ""}` : ""}
        </span>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-rounded border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gris-clair text-left text-gris-moyen">
            <tr>
              <th className="px-4 py-3 font-medium w-16">ID</th>
              <th className="px-4 py-3 font-medium">Nom</th>
              <th className="px-4 py-3 font-medium">Ville</th>
              <th className="px-4 py-3 font-medium">Pays</th>
              <th className="px-4 py-3 font-medium">Étoiles</th>
              <th className="px-4 py-3 font-medium">Note</th>
              <th className="px-4 py-3 font-medium text-right">Chambres</th>
              <th className="px-4 py-3 font-medium text-right">Réservations</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gris-moyen">
                  Chargement…
                </td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-erreur">
                  {error}
                </td>
              </tr>
            )}
            {!loading && !error && hotels.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gris-moyen">
                  Aucun hôtel ne correspond à « {debouncedSearch} ».
                </td>
              </tr>
            )}
            {!loading && !error && hotels.map((hotel) => (
              <tr
                key={hotel.id_hotel}
                onClick={() => openHotel(hotel.id_hotel)}
                onKeyDown={(e) => e.key === "Enter" && openHotel(hotel.id_hotel)}
                tabIndex={0}
                className="cursor-pointer hover:bg-turquoise-light focus:outline-none focus:bg-turquoise-light"
              >
                <td className="px-4 py-3 text-gris-moyen">{hotel.id_hotel}</td>
                <td className="px-4 py-3 font-medium text-gris-fonce">{hotel.nom_hotel}</td>
                <td className="px-4 py-3">{hotel.ville_hotel}</td>
                <td className="px-4 py-3">{hotel.pays_hotel}</td>
                <td className="px-4 py-3">
                  {hotel.nbre_etoile_hotel ? (
                    <span className="inline-flex items-center gap-1 text-attention">
                      <FiStar className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                      {hotel.nbre_etoile_hotel}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {hotel.note_moy_hotel ? (
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-turquoise text-white">
                      {Number(hotel.note_moy_hotel).toFixed(1)}/10
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">{hotel._count.chambres}</td>
                <td className="px-4 py-3 text-right">
                  <span className={hotel._count.reservations > 0 ? "font-semibold text-gris-fonce" : "text-gray-400"}>
                    {hotel._count.reservations}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <nav className="flex items-center justify-center gap-3" aria-label="Pagination">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-rounded text-sm disabled:opacity-40 hover:border-turquoise hover:text-turquoise"
          >
            <FiChevronLeft aria-hidden="true" /> Précédent
          </button>
          <span className="text-sm text-gris-moyen">
            Page {page} / {pagination.totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages || loading}
            className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-rounded text-sm disabled:opacity-40 hover:border-turquoise hover:text-turquoise"
          >
            Suivant <FiChevronRight aria-hidden="true" />
          </button>
        </nav>
      )}
    </div>
  )
}
