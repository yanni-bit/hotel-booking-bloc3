// src/admin/routes/hotels/page.tsx
// ============================================================================
// Admin Medusa: Liste des hôtels
// ============================================================================

import { defineRouteConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Table, Text, Badge, Input } from "@medusajs/ui"
import { Buildings, MagnifyingGlass } from "@medusajs/icons"
import { useEffect, useState } from "react"

// Types
interface Hotel {
  id_hotel: number
  nom_hotel: string
  ville_hotel: string
  pays_hotel: string
  nbre_etoile_hotel: number | null
  note_moy_hotel: string | null
  _count: {
    chambres: number
    reservations: number
  }
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

// Configuration de la route (apparaît dans la sidebar)
export const config = defineRouteConfig({
  label: "Hôtels",
  icon: Buildings,
})

// Composant principal
const HotelsPage = () => {
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // Charger les hôtels
  const fetchHotels = async (page: number, searchTerm: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15",
        ...(searchTerm && { search: searchTerm }),
      })

      const response = await fetch(
        `http://localhost:8000/api/admin/hotels?${params}`,
        {
          headers: {
            "x-admin-key": "hotel-admin-secret-key-2025",
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setHotels(data.hotels)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Erreur chargement hôtels:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHotels(currentPage, search)
  }, [currentPage])

  // Recherche avec délai
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1)
      fetchHotels(1, search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Rendu étoiles
  const renderStars = (stars: number | null) => {
    if (!stars) return "-"
    return "⭐".repeat(stars)
  }

  return (
    <Container className="divide-y p-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">Gestion des Hôtels</Heading>
        <div className="flex items-center gap-4">
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-ui-fg-muted" />
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Badge color="blue">
            {pagination?.total || 0} hôtels
          </Badge>
        </div>
      </div>

      {/* Table */}
      <div className="px-6 py-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <Text>Chargement...</Text>
          </div>
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>ID</Table.HeaderCell>
                <Table.HeaderCell>Nom</Table.HeaderCell>
                <Table.HeaderCell>Ville</Table.HeaderCell>
                <Table.HeaderCell>Pays</Table.HeaderCell>
                <Table.HeaderCell>Étoiles</Table.HeaderCell>
                <Table.HeaderCell>Note</Table.HeaderCell>
                <Table.HeaderCell>Chambres</Table.HeaderCell>
                <Table.HeaderCell>Réservations</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {hotels.map((hotel: Hotel) => (
                <Table.Row
                  key={hotel.id_hotel}
                  className="cursor-pointer hover:bg-ui-bg-hover"
                  onClick={() => {
                    window.location.href = `/app/hotels/${hotel.id_hotel}`
                  }}
                >
                  <Table.Cell>{hotel.id_hotel}</Table.Cell>
                  <Table.Cell className="font-medium">
                    {hotel.nom_hotel}
                  </Table.Cell>
                  <Table.Cell>{hotel.ville_hotel}</Table.Cell>
                  <Table.Cell>{hotel.pays_hotel}</Table.Cell>
                  <Table.Cell>{renderStars(hotel.nbre_etoile_hotel)}</Table.Cell>
                  <Table.Cell>
                    {hotel.note_moy_hotel ? (
                      <Badge color="green">{hotel.note_moy_hotel}/10</Badge>
                    ) : (
                      "-"
                    )}
                  </Table.Cell>
                  <Table.Cell>{hotel._count.chambres}</Table.Cell>
                  <Table.Cell>
                    <Badge color={hotel._count.reservations > 0 ? "blue" : "grey"}>
                      {hotel._count.reservations}
                    </Badge>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Précédent
            </button>
            <span className="px-3 py-1">
              Page {currentPage} / {pagination.totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={currentPage === pagination.totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </Container>
  )
}

export default HotelsPage