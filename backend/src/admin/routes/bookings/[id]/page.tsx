// src/admin/routes/bookings/[id]/page.tsx
// ============================================================================
// Admin Medusa: Détail d'une réservation
// ============================================================================

import { useParams, useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import {
  Container,
  Heading,
  Text,
  Button,
  Badge,
  Select,
} from "@medusajs/ui"
import { ArrowLeft } from "@medusajs/icons"

// Types
interface Reservation {
  id_reservation: number
  num_confirmation: string | null
  check_in: string
  check_out: string
  nbre_nuits: number
  nbre_adults: number
  nbre_children: number
  total_price: string
  prix_nuit: string
  devise: string
  special_requests: string | null
  date_reservation: string
  user: {
    id_user: number
    nom_user: string
    prenom_user: string
    email_user: string
    tel_user: string | null
  }
  hotel: {
    id_hotel: number
    nom_hotel: string
    ville_hotel: string
    pays_hotel: string
  }
  chambre: {
    id_chambre: number
    type_room: string
    nbre_adults_max: number
  }
  statut: {
    id_statut: number
    nom_statut: string
    couleur: string
  } | null
  paiement: {
    id_paiement: number
    montant: string
    methode_paiement: string | null
    statut_paiement: string
    date_paiement: string
  } | null
}

interface Statut {
  id_statut: number
  nom_statut: string
  couleur: string
}

const BookingDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [statuts, setStatuts] = useState<Statut[]>([])
  const [loading, setLoading] = useState(true)

  // Charger la réservation
  const fetchReservation = async () => {
    setLoading(true)
    try {
      const response = await fetch(
        `http://localhost:8000/api/admin/reservations/${id}`,
        {
          headers: {
            "x-admin-key": "hotel-admin-secret-key-2025",
          },
        }
      )

      if (response.ok) {
        const data = await response.json()
        setReservation(data.reservation)
      }

      // Charger les statuts
      const statutsResponse = await fetch(
        `http://localhost:8000/api/admin/reservations`,
        {
          headers: {
            "x-admin-key": "hotel-admin-secret-key-2025",
          },
        }
      )
      if (statutsResponse.ok) {
        const statutsData = await statutsResponse.json()
        setStatuts(statutsData.statuts)
      }
    } catch (error) {
      console.error("Erreur chargement réservation:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchReservation()
  }, [id])

  // Changer le statut
  const handleStatutChange = async (newStatutId: number) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/admin/reservations/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-admin-key": "hotel-admin-secret-key-2025",
          },
          body: JSON.stringify({ id_statut: newStatutId }),
        }
      )

      if (response.ok) {
        fetchReservation()
      }
    } catch (error) {
      console.error("Erreur changement statut:", error)
    }
  }

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  // Badge statut
  const getStatutBadge = (statut: Reservation["statut"]) => {
    if (!statut) return <Badge color="grey">-</Badge>
    const colors: Record<string, "red" | "orange" | "green" | "blue" | "grey"> = {
      warning: "orange",
      success: "green",
      danger: "red",
      info: "blue",
      secondary: "grey",
    }
    return <Badge color={colors[statut.couleur] || "grey"}>{statut.nom_statut}</Badge>
  }

  if (loading) {
    return (
      <Container className="p-6">
        <Text>Chargement...</Text>
      </Container>
    )
  }

  if (!reservation) {
    return (
      <Container className="p-6">
        <Text>Réservation non trouvée</Text>
      </Container>
    )
  }

  return (
    <Container className="p-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-ui-border-base">
        <div className="flex items-center gap-4">
          <Button variant="transparent" onClick={() => navigate("/bookings")}>
            <ArrowLeft />
          </Button>
          <div>
            <Heading level="h1">
              Réservation {reservation.num_confirmation || `#${reservation.id_reservation}`}
            </Heading>
            <Text className="text-ui-fg-muted">
              {formatDate(reservation.date_reservation)}
            </Text>
          </div>
          {getStatutBadge(reservation.statut)}
        </div>
        <div className="flex items-center gap-2">
          <Text className="mr-2">Changer statut :</Text>
          <Select
            value={reservation.statut?.id_statut.toString() || "1"}
            onValueChange={(value) => handleStatutChange(parseInt(value))}
          >
            <Select.Trigger className="w-40">
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              {statuts.map((statut: Statut) => (
                <Select.Item key={statut.id_statut} value={statut.id_statut.toString()}>
                  {statut.nom_statut}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 p-6">
        {/* Colonne 1-2 */}
        <div className="col-span-2 space-y-6">
          {/* Séjour */}
          <div className="border border-ui-border-base rounded-lg p-4">
            <Heading level="h2" className="mb-4">Détails du séjour</Heading>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text className="text-ui-fg-muted text-sm">Check-in</Text>
                <Text className="font-medium">{formatDate(reservation.check_in)}</Text>
              </div>
              <div>
                <Text className="text-ui-fg-muted text-sm">Check-out</Text>
                <Text className="font-medium">{formatDate(reservation.check_out)}</Text>
              </div>
              <div>
                <Text className="text-ui-fg-muted text-sm">Nombre de nuits</Text>
                <Text className="font-medium">{reservation.nbre_nuits}</Text>
              </div>
              <div>
                <Text className="text-ui-fg-muted text-sm">Voyageurs</Text>
                <Text className="font-medium">
                  {reservation.nbre_adults} adulte(s)
                  {reservation.nbre_children > 0 && `, ${reservation.nbre_children} enfant(s)`}
                </Text>
              </div>
            </div>
            {reservation.special_requests && (
              <div className="mt-4">
                <Text className="text-ui-fg-muted text-sm">Demandes spéciales</Text>
                <Text>{reservation.special_requests}</Text>
              </div>
            )}
          </div>

          {/* Hôtel */}
          <div className="border border-ui-border-base rounded-lg p-4">
            <Heading level="h2" className="mb-4">Hôtel</Heading>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text className="text-ui-fg-muted text-sm">Établissement</Text>
                <Text
                  className="font-medium cursor-pointer text-blue-600 hover:underline"
                  onClick={() => navigate(`/app/hotels/${reservation.hotel.id_hotel}`)}
                >
                  {reservation.hotel.nom_hotel}
                </Text>
              </div>
              <div>
                <Text className="text-ui-fg-muted text-sm">Localisation</Text>
                <Text>{reservation.hotel.ville_hotel}, {reservation.hotel.pays_hotel}</Text>
              </div>
              <div>
                <Text className="text-ui-fg-muted text-sm">Type de chambre</Text>
                <Text className="font-medium">{reservation.chambre.type_room}</Text>
              </div>
              <div>
                <Text className="text-ui-fg-muted text-sm">Capacité</Text>
                <Text>{reservation.chambre.nbre_adults_max} personnes max</Text>
              </div>
            </div>
          </div>

          {/* Client */}
          <div className="border border-ui-border-base rounded-lg p-4">
            <Heading level="h2" className="mb-4">Client</Heading>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Text className="text-ui-fg-muted text-sm">Nom</Text>
                <Text
                  className="font-medium cursor-pointer text-blue-600 hover:underline"
                  onClick={() => navigate(`/app/users/${reservation.user.id_user}`)}
                >
                  {reservation.user.prenom_user} {reservation.user.nom_user}
                </Text>
              </div>
              <div>
                <Text className="text-ui-fg-muted text-sm">Email</Text>
                <Text>{reservation.user.email_user}</Text>
              </div>
              <div>
                <Text className="text-ui-fg-muted text-sm">Téléphone</Text>
                <Text>{reservation.user.tel_user || "-"}</Text>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne 3: Prix + Paiement */}
        <div className="space-y-6">
          {/* Prix */}
          <div className="border border-ui-border-base rounded-lg p-4">
            <Heading level="h2" className="mb-4">Tarification</Heading>
            <div className="space-y-3">
              <div className="flex justify-between">
                <Text>Prix par nuit</Text>
                <Text>{reservation.prix_nuit} {reservation.devise}</Text>
              </div>
              <div className="flex justify-between">
                <Text>Nombre de nuits</Text>
                <Text>x {reservation.nbre_nuits}</Text>
              </div>
              <div className="border-t pt-2 flex justify-between font-medium">
                <Text>Total</Text>
                <Text className="text-lg">{reservation.total_price} {reservation.devise}</Text>
              </div>
            </div>
          </div>

          {/* Paiement */}
          <div className="border border-ui-border-base rounded-lg p-4">
            <Heading level="h2" className="mb-4">Paiement</Heading>
            {reservation.paiement ? (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <Text>Montant</Text>
                  <Text className="font-medium">{reservation.paiement.montant} {reservation.devise}</Text>
                </div>
                <div className="flex justify-between">
                  <Text>Méthode</Text>
                  <Text>{reservation.paiement.methode_paiement || "-"}</Text>
                </div>
                <div className="flex justify-between">
                  <Text>Statut</Text>
                  <Badge color={reservation.paiement.statut_paiement === "succeeded" ? "green" : "orange"}>
                    {reservation.paiement.statut_paiement}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <Text>Date</Text>
                  <Text>{formatDate(reservation.paiement.date_paiement)}</Text>
                </div>
              </div>
            ) : (
              <Text className="text-ui-fg-muted">Aucun paiement enregistré</Text>
            )}
          </div>

          {/* Statut */}
          <div className="border border-ui-border-base rounded-lg p-4">
            <Heading level="h2" className="mb-4">Statut</Heading>
            <div className="text-center">
              {getStatutBadge(reservation.statut)}
            </div>
          </div>
        </div>
      </div>
    </Container>
  )
}

export default BookingDetailPage