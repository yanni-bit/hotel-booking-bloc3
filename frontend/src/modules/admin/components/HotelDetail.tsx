// src/modules/admin/components/HotelDetail.tsx
// ============================================================================
// Admin : fiche hôtel avec édition en place et suppression.
// Portage de l'ancienne page Medusa vers React/Tailwind.
// ============================================================================

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FiArrowLeft, FiEdit2, FiTrash2, FiCheck, FiX } from "react-icons/fi"

interface Chambre {
  id_chambre: number
  type_room: string
  nbre_adults_max: number
  surface_m2: number | null
  vue: string | null
}

interface Amenities {
  parking: boolean
  restaurant: boolean
  climatisation: boolean
  non_fumeur: boolean
  pet_allowed: boolean
  wi_fi: boolean
  television: boolean
  mini_bar: boolean
  coffre_fort: boolean
  piscine: boolean
  spa: boolean
  salle_sport: boolean
}

interface Hotel {
  id_hotel: number
  nom_hotel: string
  description_hotel: string | null
  rue_hotel: string | null
  code_postal_hotel: string | null
  ville_hotel: string
  pays_hotel: string
  tel_hotel: string | null
  email_hotel: string | null
  site_web_hotel: string | null
  nbre_etoile_hotel: number | null
  note_moy_hotel: string | null // Decimal sérialisé
  img_hotel: string | null
  chambres: Chambre[]
  amenities: Amenities | null
  _count: { reservations: number; avis: number }
}

// Champs éditables et leur libellé, dans l'ordre d'affichage du formulaire
type EditableField =
  | "nom_hotel" | "nbre_etoile_hotel" | "rue_hotel" | "code_postal_hotel"
  | "ville_hotel" | "pays_hotel" | "email_hotel" | "tel_hotel" | "site_web_hotel"
type FormData = Pick<Hotel, EditableField | "description_hotel">

const AMENITY_LABELS: Record<keyof Amenities, string> = {
  wi_fi: "Wi-Fi",
  parking: "Parking",
  restaurant: "Restaurant",
  piscine: "Piscine",
  spa: "Spa",
  salle_sport: "Salle de sport",
  climatisation: "Climatisation",
  television: "Télévision",
  mini_bar: "Mini-bar",
  coffre_fort: "Coffre-fort",
  non_fumeur: "Non-fumeur",
  pet_allowed: "Animaux acceptés",
}

interface HotelDetailProps {
  hotelId: string
  countryCode: string
}

export default function HotelDetail({ hotelId, countryCode }: HotelDetailProps) {
  const router = useRouter()
  const listUrl = `/${countryCode}/admin/hotels`

  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null)
  const [formData, setFormData] = useState<FormData | null>(null)

  // Extrait la partie éditable d'un hôtel pour initialiser le formulaire
  const toFormData = (h: Hotel): FormData => ({
    nom_hotel: h.nom_hotel,
    nbre_etoile_hotel: h.nbre_etoile_hotel,
    rue_hotel: h.rue_hotel,
    code_postal_hotel: h.code_postal_hotel,
    ville_hotel: h.ville_hotel,
    pays_hotel: h.pays_hotel,
    email_hotel: h.email_hotel,
    tel_hotel: h.tel_hotel,
    site_web_hotel: h.site_web_hotel,
    description_hotel: h.description_hotel,
  })

  // Chargement
  useEffect(() => {
    let cancelled = false
    const fetchHotel = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/admin/hotels/${hotelId}`)
        if (response.status === 404) {
          if (!cancelled) setNotFound(true)
          return
        }
        if (!response.ok) throw new Error(`Réponse ${response.status}`)
        const data = await response.json()
        if (!cancelled) {
          setHotel(data.hotel)
          setFormData(toFormData(data.hotel))
        }
      } catch (err) {
        console.error("Erreur chargement hôtel:", err)
        if (!cancelled) setMessage({ type: "error", text: "Impossible de charger l'hôtel." })
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchHotel()
    return () => {
      cancelled = true
    }
  }, [hotelId])

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  const cancelEdit = () => {
    if (hotel) setFormData(toFormData(hotel))
    setEditing(false)
    setMessage(null)
  }

  // Enregistrer
  const handleSave = async () => {
    if (!formData) return
    setSaving(true)
    setMessage(null)
    try {
      const response = await fetch(`/api/admin/hotels/${hotelId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (!response.ok) {
        setMessage({ type: "error", text: data.error ?? "Enregistrement impossible." })
        return
      }
      setHotel((prev) => (prev ? { ...prev, ...data.hotel } : prev))
      setEditing(false)
      setMessage({ type: "ok", text: "Modifications enregistrées." })
    } catch (err) {
      console.error("Erreur sauvegarde:", err)
      setMessage({ type: "error", text: "Enregistrement impossible. Réessayez." })
    } finally {
      setSaving(false)
    }
  }

  // Supprimer
  const handleDelete = async () => {
    if (!hotel) return
    if (!window.confirm(`Supprimer « ${hotel.nom_hotel} » ? Cette action est irréversible.`)) return
    setMessage(null)
    try {
      const response = await fetch(`/api/admin/hotels/${hotelId}`, { method: "DELETE" })
      if (!response.ok) {
        const data = await response.json()
        setMessage({ type: "error", text: data.error ?? "Suppression impossible." })
        return
      }
      router.push(listUrl)
    } catch (err) {
      console.error("Erreur suppression:", err)
      setMessage({ type: "error", text: "Suppression impossible. Réessayez." })
    }
  }

  // ---------------------------------------------------------------------------
  // Rendu
  // ---------------------------------------------------------------------------
  if (loading) {
    return <p className="text-gris-moyen">Chargement…</p>
  }

  if (notFound || !hotel || !formData) {
    return (
      <div className="space-y-4">
        <p className="text-gris-fonce">Cet hôtel n&apos;existe pas ou a été supprimé.</p>
        <Link href={listUrl} className="text-turquoise hover:underline">Retour à la liste</Link>
      </div>
    )
  }

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-rounded text-sm focus:outline-none focus:border-turquoise focus:ring-1 focus:ring-turquoise"
  const labelClass = "block text-xs text-gris-moyen mb-1"

  // Un champ texte : lecture seule ou input selon le mode.
  // Appelé comme fonction (renderField(...)) et non comme composant (<Field/>) :
  // un composant défini dans le rendu serait recréé à chaque frappe et
  // l'input perdrait le focus.
  const renderField = (
    label: string, field: EditableField, type = "text", placeholder?: string
  ) => (
    <div>
      <label className={labelClass} htmlFor={field}>{label}</label>
      {editing ? (
        <input
          id={field}
          type={type}
          className={inputClass}
          value={formData[field] ?? ""}
          placeholder={placeholder}
          min={type === "number" ? 1 : undefined}
          max={type === "number" ? 5 : undefined}
          onChange={(e) =>
            updateField(
              field,
              type === "number"
                ? (e.target.value === "" ? null : parseInt(e.target.value, 10))
                : e.target.value
            )
          }
        />
      ) : (
        <p className="text-sm text-gris-fonce">{hotel[field] ?? <span className="text-gray-400">—</span>}</p>
      )}
    </div>
  )

  const activeAmenities = hotel.amenities
    ? (Object.keys(AMENITY_LABELS) as (keyof Amenities)[]).filter((k) => hotel.amenities?.[k])
    : []

  return (
    <div className="max-w-6xl space-y-6">
      {/* En-tête */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link
            href={listUrl}
            className="mt-1 p-2 rounded-rounded text-gris-moyen hover:bg-white hover:text-turquoise"
            aria-label="Retour à la liste des hôtels"
          >
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gris-fonce">{hotel.nom_hotel}</h1>
            <p className="text-sm text-gris-moyen">{hotel.ville_hotel}, {hotel.pays_hotel} · ID {hotel.id_hotel}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <button type="button" onClick={cancelEdit} disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-rounded text-sm hover:bg-white disabled:opacity-50">
                <FiX aria-hidden="true" /> Annuler
              </button>
              <button type="button" onClick={handleSave} disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 bg-turquoise text-white rounded-rounded text-sm hover:bg-turquoise-hover disabled:opacity-50">
                <FiCheck aria-hidden="true" /> {saving ? "Enregistrement…" : "Enregistrer"}
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => { setEditing(true); setMessage(null) }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-turquoise text-white rounded-rounded text-sm hover:bg-turquoise-hover">
                <FiEdit2 aria-hidden="true" /> Modifier
              </button>
              <button type="button" onClick={handleDelete}
                className="inline-flex items-center gap-2 px-4 py-2 border border-erreur text-erreur rounded-rounded text-sm hover:bg-red-50">
                <FiTrash2 aria-hidden="true" /> Supprimer
              </button>
            </>
          )}
        </div>
      </div>

      {/* Message */}
      {message && (
        <p role="status"
          className={`px-4 py-3 rounded-rounded text-sm ${
            message.type === "ok" ? "bg-green-50 text-validation" : "bg-red-50 text-erreur"
          }`}>
          {message.text}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne principale */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations générales */}
          <section className="bg-white rounded-rounded border border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-gris-fonce mb-4">Informations générales</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {renderField("Nom de l'hôtel", "nom_hotel")}
              {renderField("Étoiles (1 à 5)", "nbre_etoile_hotel", "number")}
              {renderField("Rue", "rue_hotel")}
              {renderField("Code postal", "code_postal_hotel")}
              {renderField("Ville", "ville_hotel")}
              {renderField("Pays", "pays_hotel")}
              {renderField("Email", "email_hotel", "email")}
              {renderField("Téléphone", "tel_hotel", "tel")}
              {renderField("Site web", "site_web_hotel", "url", "https://")}
            </div>
            <div className="mt-4">
              <label className={labelClass} htmlFor="description_hotel">Description</label>
              {editing ? (
                <textarea
                  id="description_hotel"
                  rows={5}
                  className={inputClass}
                  value={formData.description_hotel ?? ""}
                  onChange={(e) => updateField("description_hotel", e.target.value)}
                />
              ) : (
                <p className="text-sm text-gris-fonce whitespace-pre-line">
                  {hotel.description_hotel || <span className="text-gray-400">Aucune description</span>}
                </p>
              )}
            </div>
          </section>

          {/* Chambres */}
          <section className="bg-white rounded-rounded border border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-gris-fonce mb-4">
              Chambres ({hotel.chambres.length})
            </h2>
            {hotel.chambres.length === 0 ? (
              <p className="text-sm text-gris-moyen">Aucune chambre configurée.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-gris-moyen">
                    <tr>
                      <th className="py-2 pr-4 font-medium">Type</th>
                      <th className="py-2 pr-4 font-medium">Capacité</th>
                      <th className="py-2 pr-4 font-medium">Surface</th>
                      <th className="py-2 font-medium">Vue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {hotel.chambres.map((c) => (
                      <tr key={c.id_chambre}>
                        <td className="py-2 pr-4 font-medium text-gris-fonce">{c.type_room}</td>
                        <td className="py-2 pr-4">{c.nbre_adults_max} adultes</td>
                        <td className="py-2 pr-4">{c.surface_m2 ? `${c.surface_m2} m²` : "—"}</td>
                        <td className="py-2">{c.vue ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        {/* Colonne latérale */}
        <div className="space-y-6">
          {/* Image */}
          {hotel.img_hotel && (
            <img
              src={hotel.img_hotel}
              alt={hotel.nom_hotel}
              className="w-full h-44 object-cover rounded-rounded border border-gray-200"
            />
          )}

          {/* Statistiques */}
          <section className="bg-white rounded-rounded border border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-gris-fonce mb-4">Statistiques</h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gris-moyen">Note moyenne</dt>
                <dd className="font-semibold text-gris-fonce">
                  {hotel.note_moy_hotel ? `${Number(hotel.note_moy_hotel).toFixed(1)}/10` : "—"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gris-moyen">Avis</dt>
                <dd className="font-semibold text-gris-fonce">{hotel._count.avis}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gris-moyen">Réservations</dt>
                <dd className="font-semibold text-gris-fonce">{hotel._count.reservations}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gris-moyen">Chambres</dt>
                <dd className="font-semibold text-gris-fonce">{hotel.chambres.length}</dd>
              </div>
            </dl>
          </section>

          {/* Équipements */}
          <section className="bg-white rounded-rounded border border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-gris-fonce mb-4">Équipements</h2>
            {activeAmenities.length === 0 ? (
              <p className="text-sm text-gris-moyen">Aucun équipement renseigné.</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {activeAmenities.map((k) => (
                  <li key={k} className="px-2.5 py-1 rounded-full text-xs bg-turquoise-light text-turquoise font-medium">
                    {AMENITY_LABELS[k]}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
