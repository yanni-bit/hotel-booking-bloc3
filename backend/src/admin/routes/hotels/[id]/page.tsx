// src/admin/routes/hotels/[id]/page.tsx
// ============================================================================
// Admin Medusa: Détail et édition d'un hôtel
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
  Textarea,
  Badge,
  Table,
} from "@medusajs/ui";
import { ArrowLeft, PencilSquare, Trash, Check, XMark } from "@medusajs/icons";

// Types
interface Chambre {
  id_chambre: number;
  type_room: string;
  nbre_adults_max: number;
  surface_m2: number | null;
  vue: string | null;
}

interface Amenities {
  parking: boolean;
  restaurant: boolean;
  piscine: boolean;
  spa: boolean;
  wi_fi: boolean;
  climatisation: boolean;
  salle_sport: boolean;
}

interface Hotel {
  id_hotel: number;
  nom_hotel: string;
  description_hotel: string | null;
  rue_hotel: string | null;
  code_postal_hotel: string | null;
  ville_hotel: string;
  pays_hotel: string;
  tel_hotel: string | null;
  email_hotel: string | null;
  nbre_etoile_hotel: number | null;
  note_moy_hotel: string | null;
  img_hotel: string | null;
  chambres: Chambre[];
  amenities: Amenities | null;
  _count: {
    reservations: number;
    avis: number;
  };
}

const HotelDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<Hotel>>({});

  // Charger l'hôtel
  const fetchHotel = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/admin/hotels/${id}`,
        {
          headers: {
            "x-admin-key": "hotel-admin-secret-key-2025",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setHotel(data.hotel);
        setFormData(data.hotel);
      }
    } catch (error) {
      console.error("Erreur chargement hôtel:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchHotel();
  }, [id]);

  // Sauvegarder les modifications
  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(
        `http://localhost:8000/api/admin/hotels/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-admin-key": "hotel-admin-secret-key-2025",
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setHotel({ ...hotel, ...data.hotel } as Hotel);
        setEditing(false);
      }
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
    } finally {
      setSaving(false);
    }
  };

  // Supprimer l'hôtel
  const handleDelete = async () => {
    if (
      !confirm(
        `Supprimer "${hotel?.nom_hotel}" ? Cette action est irréversible.`
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:8000/api/admin/hotels/${id}`,
        {
          method: "DELETE",
          headers: {
            "x-admin-key": "hotel-admin-secret-key-2025",
          },
        }
      );

      if (response.ok) {
        navigate("/app/hotels");
      }
    } catch (error) {
      console.error("Erreur suppression:", error);
    }
  };

  // Mettre à jour le formulaire
  const updateField = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <Container className="p-6">
        <Text>Chargement...</Text>
      </Container>
    );
  }

  if (!hotel) {
    return (
      <Container className="p-6">
        <Text>Hôtel non trouvé</Text>
      </Container>
    );
  }

  return (
    <Container className="p-0">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-ui-border-base">
        <div className="flex items-center gap-4">
          <Button variant="transparent" onClick={() => navigate("/hotels")}>
            <ArrowLeft />
          </Button>
          <div>
            <Heading level="h1">{hotel.nom_hotel}</Heading>
            <Text className="text-ui-fg-muted">
              {hotel.ville_hotel}, {hotel.pays_hotel}
            </Text>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Button
                variant="secondary"
                onClick={() => {
                  setEditing(false);
                  setFormData(hotel);
                }}
              >
                <XMark /> Annuler
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Check /> {saving ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setEditing(true)}>
                <PencilSquare /> Modifier
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                <Trash /> Supprimer
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 p-6">
        {/* Colonne 1-2: Infos générales */}
        <div className="col-span-2 space-y-6">
          {/* Informations de base */}
          <div className="border border-ui-border-base rounded-lg p-4">
            <Heading level="h2" className="mb-4">
              Informations générales
            </Heading>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nom de l'hôtel</Label>
                {editing ? (
                  <Input
                    value={formData.nom_hotel || ""}
                    onChange={(e) => updateField("nom_hotel", e.target.value)}
                  />
                ) : (
                  <Text className="mt-1">{hotel.nom_hotel}</Text>
                )}
              </div>
              <div>
                <Label>Étoiles</Label>
                {editing ? (
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={formData.nbre_etoile_hotel || ""}
                    onChange={(e) =>
                      updateField("nbre_etoile_hotel", parseInt(e.target.value))
                    }
                  />
                ) : (
                  <Text className="mt-1">
                    {"⭐".repeat(hotel.nbre_etoile_hotel || 0)}
                  </Text>
                )}
              </div>
              <div>
                <Label>Rue</Label>
                {editing ? (
                  <Input
                    value={formData.rue_hotel || ""}
                    onChange={(e) => updateField("rue_hotel", e.target.value)}
                  />
                ) : (
                  <Text className="mt-1">{hotel.rue_hotel || "-"}</Text>
                )}
              </div>
              <div>
                <Label>Code postal</Label>
                {editing ? (
                  <Input
                    value={formData.code_postal_hotel || ""}
                    onChange={(e) =>
                      updateField("code_postal_hotel", e.target.value)
                    }
                  />
                ) : (
                  <Text className="mt-1">{hotel.code_postal_hotel || "-"}</Text>
                )}
              </div>
              <div>
                <Label>Ville</Label>
                {editing ? (
                  <Input
                    value={formData.ville_hotel || ""}
                    onChange={(e) => updateField("ville_hotel", e.target.value)}
                  />
                ) : (
                  <Text className="mt-1">{hotel.ville_hotel}</Text>
                )}
              </div>
              <div>
                <Label>Pays</Label>
                {editing ? (
                  <Input
                    value={formData.pays_hotel || ""}
                    onChange={(e) => updateField("pays_hotel", e.target.value)}
                  />
                ) : (
                  <Text className="mt-1">{hotel.pays_hotel}</Text>
                )}
              </div>
              <div>
                <Label>Email</Label>
                {editing ? (
                  <Input
                    type="email"
                    value={formData.email_hotel || ""}
                    onChange={(e) => updateField("email_hotel", e.target.value)}
                  />
                ) : (
                  <Text className="mt-1">{hotel.email_hotel || "-"}</Text>
                )}
              </div>
              <div>
                <Label>Téléphone</Label>
                {editing ? (
                  <Input
                    value={formData.tel_hotel || ""}
                    onChange={(e) => updateField("tel_hotel", e.target.value)}
                  />
                ) : (
                  <Text className="mt-1">{hotel.tel_hotel || "-"}</Text>
                )}
              </div>
            </div>
            <div className="mt-4">
              <Label>Description</Label>
              {editing ? (
                <Textarea
                  value={formData.description_hotel || ""}
                  onChange={(e) =>
                    updateField("description_hotel", e.target.value)
                  }
                  rows={4}
                />
              ) : (
                <Text className="mt-1 text-ui-fg-muted">
                  {hotel.description_hotel || "Aucune description"}
                </Text>
              )}
            </div>
          </div>

          {/* Chambres */}
          <div className="border border-ui-border-base rounded-lg p-4">
            <Heading level="h2" className="mb-4">
              Chambres ({hotel.chambres.length})
            </Heading>
            {hotel.chambres.length > 0 ? (
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Type</Table.HeaderCell>
                    <Table.HeaderCell>Capacité</Table.HeaderCell>
                    <Table.HeaderCell>Surface</Table.HeaderCell>
                    <Table.HeaderCell>Vue</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {hotel.chambres.map((chambre: Chambre) => (
                    <Table.Row key={chambre.id_chambre}>
                      <Table.Cell className="font-medium">
                        {chambre.type_room}
                      </Table.Cell>
                      <Table.Cell>{chambre.nbre_adults_max} adultes</Table.Cell>
                      <Table.Cell>
                        {chambre.surface_m2 ? `${chambre.surface_m2} m²` : "-"}
                      </Table.Cell>
                      <Table.Cell>{chambre.vue || "-"}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            ) : (
              <Text className="text-ui-fg-muted">
                Aucune chambre configurée
              </Text>
            )}
          </div>
        </div>

        {/* Colonne 3: Stats et équipements */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="border border-ui-border-base rounded-lg p-4">
            <Heading level="h2" className="mb-4">
              Statistiques
            </Heading>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Text>Note moyenne</Text>
                <Badge color="green">{hotel.note_moy_hotel || "-"}/10</Badge>
              </div>
              <div className="flex justify-between items-center">
                <Text>Avis</Text>
                <Badge color="blue">{hotel._count.avis}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <Text>Réservations</Text>
                <Badge color="purple">{hotel._count.reservations}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <Text>Chambres</Text>
                <Badge color="grey">{hotel.chambres.length}</Badge>
              </div>
            </div>
          </div>

          {/* Équipements */}
          {hotel.amenities && (
            <div className="border border-ui-border-base rounded-lg p-4">
              <Heading level="h2" className="mb-4">
                Équipements
              </Heading>
              <div className="grid grid-cols-2 gap-2">
                {hotel.amenities.wi_fi && <Badge color="green">📶 WiFi</Badge>}
                {hotel.amenities.parking && (
                  <Badge color="green">🅿️ Parking</Badge>
                )}
                {hotel.amenities.restaurant && (
                  <Badge color="green">🍽️ Restaurant</Badge>
                )}
                {hotel.amenities.piscine && (
                  <Badge color="green">🏊 Piscine</Badge>
                )}
                {hotel.amenities.spa && <Badge color="green">💆 Spa</Badge>}
                {hotel.amenities.salle_sport && (
                  <Badge color="green">🏋️ Sport</Badge>
                )}
                {hotel.amenities.climatisation && (
                  <Badge color="green">❄️ Clim</Badge>
                )}
              </div>
            </div>
          )}

          {/* Adresse */}
          <div className="border border-ui-border-base rounded-lg p-4">
            <Heading level="h2" className="mb-4">
              Adresse
            </Heading>
            <div className="space-y-1">
              <Text>{hotel.rue_hotel || "-"}</Text>
              <Text>
                {hotel.code_postal_hotel} {hotel.ville_hotel}
              </Text>
              <Text>{hotel.pays_hotel}</Text>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default HotelDetailPage;
