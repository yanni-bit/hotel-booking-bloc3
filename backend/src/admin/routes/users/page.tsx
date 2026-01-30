// src/admin/routes/users/page.tsx
// ============================================================================
// Admin Medusa: Liste des utilisateurs
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
import { Users, MagnifyingGlass } from "@medusajs/icons";
import { useEffect, useState } from "react";

// Types
interface User {
  id_user: number;
  nom_user: string;
  prenom_user: string;
  email_user: string;
  tel_user: string | null;
  date_inscription: string;
  actif: boolean;
  email_verifie: boolean;
  role: {
    id_role: number;
    code_role: string;
    nom_role: string;
  };
  _count: {
    reservations: number;
    avis: number;
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Configuration de la route
export const config = defineRouteConfig({
  label: "Utilisateurs",
  icon: Users,
});

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Charger les utilisateurs
  const fetchUsers = async (page: number, searchTerm: string, role: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15",
        ...(searchTerm && { search: searchTerm }),
        ...(role && role !== "all" && { role }),
      });

      const response = await fetch(
        `http://localhost:8000/api/admin/users?${params}`,
        {
          headers: {
            "x-admin-key": "hotel-admin-secret-key-2025",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Erreur chargement utilisateurs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage, search, roleFilter);
  }, [currentPage, roleFilter]);

  // Recherche avec délai
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchUsers(1, search, roleFilter);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Badge couleur selon le rôle
  const getRoleBadge = (role: User["role"]) => {
    const colors: Record<
      string,
      "red" | "orange" | "green" | "blue" | "purple" | "grey"
    > = {
      admin: "red",
      provider: "orange",
      client: "green",
    };
    return (
      <Badge color={colors[role.code_role] || "grey"}>{role.nom_role}</Badge>
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

  // Changer le rôle d'un utilisateur
  const handleRoleChange = async (userId: number, newRoleId: number) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/admin/users/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-admin-key": "hotel-admin-secret-key-2025",
          },
          body: JSON.stringify({ id_role: newRoleId }),
        }
      );

      if (response.ok) {
        fetchUsers(currentPage, search, roleFilter);
      }
    } catch (error) {
      console.error("Erreur changement rôle:", error);
    }
  };

  // Activer/désactiver un utilisateur
  const toggleActif = async (userId: number, currentActif: boolean) => {
    try {
      const response = await fetch(
        `http://localhost:8000/api/admin/users/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-admin-key": "hotel-admin-secret-key-2025",
          },
          body: JSON.stringify({ actif: !currentActif }),
        }
      );

      if (response.ok) {
        fetchUsers(currentPage, search, roleFilter);
      }
    } catch (error) {
      console.error("Erreur toggle actif:", error);
    }
  };

  return (
    <Container className="divide-y p-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h1">Gestion des Utilisateurs</Heading>
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
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <Select.Trigger>
              <Select.Value placeholder="Tous les rôles" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="all">Tous les rôles</Select.Item>
              <Select.Item value="1">Administrateur</Select.Item>
              <Select.Item value="2">Prestataire</Select.Item>
              <Select.Item value="3">Client</Select.Item>
            </Select.Content>
          </Select>
          <Badge color="blue">{pagination?.total || 0} utilisateurs</Badge>
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
                <Table.HeaderCell>Email</Table.HeaderCell>
                <Table.HeaderCell>Rôle</Table.HeaderCell>
                <Table.HeaderCell>Inscrit le</Table.HeaderCell>
                <Table.HeaderCell>Réservations</Table.HeaderCell>
                <Table.HeaderCell>Statut</Table.HeaderCell>
                <Table.HeaderCell>Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {users.map((user: User) => (
                <Table.Row
                  key={user.id_user}
                  className="cursor-pointer hover:bg-ui-bg-hover"
                  onClick={() =>
                    (window.location.href = `/app/users/${user.id_user}`)
                  }
                >
                  {" "}
                  <Table.Cell>{user.id_user}</Table.Cell>
                  <Table.Cell className="font-medium">
                    {user.prenom_user} {user.nom_user}
                  </Table.Cell>
                  <Table.Cell>{user.email_user}</Table.Cell>
                  <Table.Cell>{getRoleBadge(user.role)}</Table.Cell>
                  <Table.Cell>{formatDate(user.date_inscription)}</Table.Cell>
                  <Table.Cell>
                    <Badge
                      color={user._count.reservations > 0 ? "blue" : "grey"}
                    >
                      {user._count.reservations}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={user.actif ? "green" : "red"}>
                      {user.actif ? "Actif" : "Inactif"}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex gap-2">
                      <Select
                        value={user.role.id_role.toString()}
                        onValueChange={(value) =>
                          handleRoleChange(user.id_user, parseInt(value))
                        }
                      >
                        <Select.Trigger className="w-32">
                          <Select.Value />
                        </Select.Trigger>
                        <Select.Content>
                          <Select.Item value="1">Admin</Select.Item>
                          <Select.Item value="2">Prestataire</Select.Item>
                          <Select.Item value="3">Client</Select.Item>
                        </Select.Content>
                      </Select>
                      <button
                        onClick={() => toggleActif(user.id_user, user.actif)}
                        className={`px-3 py-1 rounded text-sm ${
                          user.actif
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {user.actif ? "Désactiver" : "Activer"}
                      </button>
                    </div>
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

export default UsersPage;
