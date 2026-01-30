// src/admin/routes/reservations/page.tsx
// ============================================================================
// Admin Medusa: Liste des réservations
// ============================================================================

import { defineRouteConfig } from "@medusajs/admin-sdk";
import {
  Container,
  Heading,
  Table,
  Text,
  Badge,
  Input,
  Select,
} from "@medusajs/ui";
import { Calendar, MagnifyingGlass } from "@medusajs/icons";
import { useEffect, useState } from "react";

// Types
interface Reservation {
  id_reservation: number;
  num_confirmation: string | null;
  check_in: string;
  check_out: string;
  nbre_nuits: number;
  nbre_adults: number;
  nbre_children: number;
  total_price: string;
  devise: string;
  date_reservation: string;
  user: {
    id_user: number;
    nom_user: string;
    prenom_user: string;
    email_user: string;
  };
  hotel: {
    id_hotel: number;
    nom_hotel: string;
    ville_hotel: string;
  };
  chambre: {
    id_chambre: number;
    type_room: string;
  };
  statut: {
    id_statut: number;
    nom_statut: string;
    couleur: string;
  } | null;
}

interface Statut {
  id_statut: number;
  nom_statut: string;
  couleur: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Configuration de la route
export const config = defineRouteConfig({
  label: "Réservations Hôtel",
  icon: Calendar,
});

const ReservationsPage = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [statuts, setStatuts] = useState<Statut[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Charger les réservations
  const fetchReservations = async (
    page: number,
    searchTerm: string,
    statut: string
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15",
        ...(searchTerm && { search: searchTerm }),
        ...(statut && statut !== "all" && { statut }),
      });

      const response = await fetch(
        `http://localhost:8000/api/admin/reservations?${params}`,
        {
          headers: {
            "x-admin-key": "hotel-admin-secret-key-2025",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log("DATA REÇUE:", data);
        setReservations(data.reservations);
        setStatuts(data.statuts);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Erreur chargement réservations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("FETCH APPELÉ - page:", currentPage);
    fetchReservations(currentPage, search, statutFilter);
  }, [currentPage, statutFilter]);

  // Recherche avec délai
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchReservations(1, search, statutFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Badge couleur selon le statut
  const getStatutBadge = (statut: Reservation["statut"]) => {
    if (!statut) return <Badge color="grey">-</Badge>;

    const colors: Record<
      string,
      "red" | "orange" | "green" | "blue" | "purple" | "grey"
    > = {
      warning: "orange",
      success: "green",
      danger: "red",
      info: "blue",
      secondary: "grey",
    };
    return (
      <Badge color={colors[statut.couleur] || "grey"}>
        {statut.nom_statut}
      </Badge>
    );
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Changer le statut d'une réservation
  const handleStatutChange = async (
    reservationId: number,
    newStatutId: number
  ) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/admin/reservations/${reservationId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-admin-key": "hotel-admin-secret-key-2025",
          },
          body: JSON.stringify({ id_statut: newStatutId }),
        }
      );

      if (response.ok) {
        fetchReservations(currentPage, search, statutFilter);
      }
    } catch (error) {
      console.error("Erreur changement statut:", error);
    }
  };

  return (
    <Container className="divide-y p-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">Gestion des Réservations</Heading>
        <div className="flex items-center gap-4">
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-ui-fg-muted" />
            <Input
              placeholder="N° confirmation, client, hôtel..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-72"
            />
          </div>
          <Select value={statutFilter} onValueChange={setStatutFilter}>
            <Select.Trigger>
              <Select.Value placeholder="Tous les statuts" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">Tous les statuts</Select.Item>
              {statuts.map((statut: Statut) => (
                <Select.Item
                  key={statut.id_statut}
                  value={statut.id_statut.toString()}
                >
                  {statut.nom_statut}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          <Badge color="blue">{pagination?.total || 0} réservations</Badge>
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
                <Table.HeaderCell>N° Confirmation</Table.HeaderCell>
                <Table.HeaderCell>Client</Table.HeaderCell>
                <Table.HeaderCell>Hôtel</Table.HeaderCell>
                <Table.HeaderCell>Chambre</Table.HeaderCell>
                <Table.HeaderCell>Check-in</Table.HeaderCell>
                <Table.HeaderCell>Check-out</Table.HeaderCell>
                <Table.HeaderCell>Total</Table.HeaderCell>
                <Table.HeaderCell>Statut</Table.HeaderCell>
                <Table.HeaderCell>Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {reservations.map((reservation: Reservation) => (
                <Table.Row
                  key={reservation.id_reservation}
                  className="cursor-pointer hover:bg-ui-bg-hover"
                  onClick={() =>
                    (window.location.href = `/app/bookings/${reservation.id_reservation}`)
                  }
                >
                  <Table.Cell className="font-mono text-sm">
                    {reservation.num_confirmation || "-"}
                  </Table.Cell>
                  <Table.Cell>
                    <div>
                      <Text className="font-medium">
                        {reservation.user.prenom_user}{" "}
                        {reservation.user.nom_user}
                      </Text>
                      <Text className="text-ui-fg-muted text-xs">
                        {reservation.user.email_user}
                      </Text>
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <div>
                      <Text className="font-medium">
                        {reservation.hotel.nom_hotel}
                      </Text>
                      <Text className="text-ui-fg-muted text-xs">
                        {reservation.hotel.ville_hotel}
                      </Text>
                    </div>
                  </Table.Cell>
                  <Table.Cell>{reservation.chambre.type_room}</Table.Cell>
                  <Table.Cell>{formatDate(reservation.check_in)}</Table.Cell>
                  <Table.Cell>{formatDate(reservation.check_out)}</Table.Cell>
                  <Table.Cell className="font-medium">
                    {reservation.total_price} {reservation.devise}
                  </Table.Cell>
                  <Table.Cell>{getStatutBadge(reservation.statut)}</Table.Cell>
                  <Table.Cell onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={reservation.statut?.id_statut.toString() || "1"}
                      onValueChange={(value) =>
                        handleStatutChange(
                          reservation.id_reservation,
                          parseInt(value)
                        )
                      }
                    >
                      <Select.Trigger className="w-32">
                        <Select.Value />
                      </Select.Trigger>
                      <Select.Content>
                        {statuts.map((statut: Statut) => (
                          <Select.Item
                            key={statut.id_statut}
                            value={statut.id_statut.toString()}
                          >
                            {statut.nom_statut}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
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
              onClick={() =>
                setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={currentPage === pagination.totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Suivant
            </button>
          </div>
        )}
      </div>
    </Container>
  );
};

export default ReservationsPage;
