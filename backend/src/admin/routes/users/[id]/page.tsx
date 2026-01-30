// src/admin/routes/users/[id]/page.tsx
// ============================================================================
// Admin Medusa: Détail et édition d'un utilisateur
// ============================================================================

import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Container,
  Heading,
  Text,
  Button,
  Input,
  Label,
  Badge,
  Table,
  Select,
} from "@medusajs/ui";
import { ArrowLeft, PencilSquare, Check, XMark } from "@medusajs/icons";

// Types
interface Role {
  id_role: number;
  code_role: string;
  nom_role: string;
}

interface Reservation {
  id_reservation: number;
  num_confirmation: string | null;
  check_in: string;
  check_out: string;
  total_price: string;
  devise: string;
  date_reservation: string;
  hotel: {
    id_hotel: number;
    nom_hotel: string;
    ville_hotel: string;
  };
  chambre: {
    type_room: string;
  };
  statut: {
    nom_statut: string;
    couleur: string;
  } | null;
}

interface User {
  id_user: number;
  nom_user: string;
  prenom_user: string;
  email_user: string;
  tel_user: string | null;
  date_inscription: string;
  actif: boolean;
  email_verifie: boolean;
  derniere_connexion: string | null;
  role: Role;
  reservations: Reservation[];
  _count: {
    reservations: number;
    avis: number;
  };
}

const UserDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});

  // Charger l'utilisateur
  const fetchUser = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/admin/users/${id}`,
        {
          headers: {
            "x-admin-key": "hotel-admin-secret-key-2025",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setRoles(data.roles);
        setFormData(data.user);
      }
    } catch (error) {
      console.error("Erreur chargement utilisateur:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchUser();
  }, [id]);

  // Sauvegarder les modifications
  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/admin/users/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-admin-key": "hotel-admin-secret-key-2025",
          },
          body: JSON.stringify({
            nom_user: formData.nom_user,
            prenom_user: formData.prenom_user,
            email_user: formData.email_user,
            tel_user: formData.tel_user,
            id_role: formData.role?.id_role,
            actif: formData.actif,
            email_verifie: formData.email_verifie,
          }),
        }
      );

      if (response.ok) {
        await fetchUser();
        setEditing(false);
      }
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
    } finally {
      setSaving(false);
    }
  };

  // Mettre à jour le formulaire
  const updateField = (field: string, value: string | number | boolean) => {
    if (field === "id_role") {
      const selectedRole = roles.find((r) => r.id_role === value);
      setFormData((prev) => ({ ...prev, role: selectedRole }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Badge couleur selon le rôle
  const getRoleBadge = (role: Role) => {
    const colors: Record<string, "red" | "orange" | "green"> = {
      admin: "red",
      provider: "orange",
      client: "green",
    };
    return (
      <Badge color={colors[role.code_role] || "grey"}>{role.nom_role}</Badge>
    );
  };

  // Badge statut réservation
  const getStatutBadge = (statut: Reservation["statut"]) => {
    if (!statut) return <Badge color="grey">-</Badge>;
    const colors: Record<string, "red" | "orange" | "green" | "blue" | "grey"> =
      {
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

  if (loading) {
    return (
      <Container className="p-6">
        <Text>Chargement...</Text>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="p-6">
        <Text>Utilisateur non trouvé</Text>
      </Container>
    );
  }

  return (
    <Container className="p-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-ui-border-base">
        <div className="flex items-center gap-4">
          <Button variant="transparent" onClick={() => navigate("/users")}>
            <ArrowLeft />
          </Button>
          <div>
            <Heading level="h1">
              {user.prenom_user} {user.nom_user}
            </Heading>
            <Text className="text-ui-fg-muted">{user.email_user}</Text>
          </div>
          {getRoleBadge(user.role)}
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  setEditing(false);
                  setFormData(user);
                }}
              >
                <XMark /> Annuler
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Check /> {saving ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => setEditing(true)}>
              <PencilSquare /> Modifier
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 p-6">
        {/* Colonne 1-2: Infos + Réservations */}
        <div className="col-span-2 space-y-6">
          {/* Informations personnelles */}
          <div className="border border-ui-border-base rounded-lg p-4">
            <Heading level="h2" className="mb-4">
              Informations personnelles
            </Heading>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Prénom</Label>
                {editing ? (
                  <Input
                    value={formData.prenom_user || ""}
                    onChange={(e) => updateField("prenom_user", e.target.value)}
                  />
                ) : (
                  <Text className="mt-1">{user.prenom_user}</Text>
                )}
              </div>
              <div>
                <Label>Nom</Label>
                {editing ? (
                  <Input
                    value={formData.nom_user || ""}
                    onChange={(e) => updateField("nom_user", e.target.value)}
                  />
                ) : (
                  <Text className="mt-1">{user.nom_user}</Text>
                )}
              </div>
              <div>
                <Label>Email</Label>
                {editing ? (
                  <Input
                    type="email"
                    value={formData.email_user || ""}
                    onChange={(e) => updateField("email_user", e.target.value)}
                  />
                ) : (
                  <Text className="mt-1">{user.email_user}</Text>
                )}
              </div>
              <div>
                <Label>Téléphone</Label>
                {editing ? (
                  <Input
                    value={formData.tel_user || ""}
                    onChange={(e) => updateField("tel_user", e.target.value)}
                  />
                ) : (
                  <Text className="mt-1">{user.tel_user || "-"}</Text>
                )}
              </div>
              <div>
                <Label>Rôle</Label>
                {editing ? (
                  <Select
                    value={formData.role?.id_role.toString() || "3"}
                    onValueChange={(value) =>
                      updateField("id_role", parseInt(value))
                    }
                  >
                    <Select.Trigger>
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      {roles.map((role: Role) => (
                        <Select.Item
                          key={role.id_role}
                          value={role.id_role.toString()}
                        >
                          {role.nom_role}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select>
                ) : (
                  <div className="mt-1">{getRoleBadge(user.role)}</div>
                )}
              </div>
              <div>
                <Label>Statut compte</Label>
                {editing ? (
                  <Select
                    value={formData.actif ? "true" : "false"}
                    onValueChange={(value) =>
                      updateField("actif", value === "true")
                    }
                  >
                    <Select.Trigger>
                      <Select.Value />
                    </Select.Trigger>
                    <Select.Content>
                      <Select.Item value="true">Actif</Select.Item>
                      <Select.Item value="false">Inactif</Select.Item>
                    </Select.Content>
                  </Select>
                ) : (
                  <div className="mt-1">
                    <Badge color={user.actif ? "green" : "red"}>
                      {user.actif ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Réservations */}
          <div className="border border-ui-border-base rounded-lg p-4">
            <Heading level="h2" className="mb-4">
              Réservations ({user._count.reservations})
            </Heading>
            {user.reservations.length > 0 ? (
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>N° Confirmation</Table.HeaderCell>
                    <Table.HeaderCell>Hôtel</Table.HeaderCell>
                    <Table.HeaderCell>Chambre</Table.HeaderCell>
                    <Table.HeaderCell>Check-in</Table.HeaderCell>
                    <Table.HeaderCell>Total</Table.HeaderCell>
                    <Table.HeaderCell>Statut</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {user.reservations.map((reservation: Reservation) => (
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
                            {reservation.hotel.nom_hotel}
                          </Text>
                          <Text className="text-ui-fg-muted text-xs">
                            {reservation.hotel.ville_hotel}
                          </Text>
                        </div>
                      </Table.Cell>
                      <Table.Cell>{reservation.chambre.type_room}</Table.Cell>
                      <Table.Cell>
                        {formatDate(reservation.check_in)}
                      </Table.Cell>
                      <Table.Cell className="font-medium">
                        {reservation.total_price} {reservation.devise}
                      </Table.Cell>
                      <Table.Cell>
                        {getStatutBadge(reservation.statut)}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            ) : (
              <Text className="text-ui-fg-muted">Aucune réservation</Text>
            )}
          </div>
        </div>

        {/* Colonne 3: Stats */}
        <div className="space-y-6">
          {/* Statistiques */}
          <div className="border border-ui-border-base rounded-lg p-4">
            <Heading level="h2" className="mb-4">
              Statistiques
            </Heading>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Text>Réservations</Text>
                <Badge color="blue">{user._count.reservations}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <Text>Avis</Text>
                <Badge color="purple">{user._count.avis}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <Text>Email vérifié</Text>
                <Badge color={user.email_verifie ? "green" : "orange"}>
                  {user.email_verifie ? "Oui" : "Non"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="border border-ui-border-base rounded-lg p-4">
            <Heading level="h2" className="mb-4">
              Activité
            </Heading>
            <div className="space-y-2">
              <div>
                <Text className="text-ui-fg-muted text-sm">Inscrit le</Text>
                <Text>{formatDate(user.date_inscription)}</Text>
              </div>
              {user.derniere_connexion && (
                <div>
                  <Text className="text-ui-fg-muted text-sm">
                    Dernière connexion
                  </Text>
                  <Text>{formatDate(user.derniere_connexion)}</Text>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default UserDetailPage;
