// src/modules/admin/components/HotelCreate.tsx
// ============================================================================
// Admin : création d'un hôtel.
// Pendant de HotelDetail : mêmes champs, mêmes styles, mais formulaire vierge
// envoyé en POST au lieu d'une édition en place.
// ============================================================================

"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FiArrowLeft, FiCheck } from "react-icons/fi"

interface HotelCreateProps {
  countryCode: string
}

// Champs envoyés à l'API, dans l'ordre d'affichage du formulaire
type FormData = {
  nom_hotel: string
  nbre_etoile_hotel: number | null
  rue_hotel: string
  code_postal_hotel: string
  ville_hotel: string
  pays_hotel: string
  email_hotel: string
  tel_hotel: string
  site_web_hotel: string
  img_hotel: string
  description_hotel: string
}

const FORM_VIDE: FormData = {
  nom_hotel: "",
  nbre_etoile_hotel: null,
  rue_hotel: "",
  code_postal_hotel: "",
  ville_hotel: "",
  pays_hotel: "",
  email_hotel: "",
  tel_hotel: "",
  site_web_hotel: "",
  img_hotel: "",
  description_hotel: "",
}

// Les trois champs sans lesquels un hôtel n'est pas exploitable.
// L'API applique la même règle : la validation côté client ne fait
// qu'éviter un aller-retour réseau inutile.
const CHAMPS_REQUIS: (keyof FormData)[] = [
  "nom_hotel",
  "ville_hotel",
  "pays_hotel",
]

export default function HotelCreate({ countryCode }: HotelCreateProps) {
  const router = useRouter()
  const listUrl = `/${countryCode}/admin/hotels`

  const [formData, setFormData] = useState<FormData>(FORM_VIDE)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{
    type: "ok" | "error"
    text: string
  } | null>(null)

  const updateField = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const manquants = CHAMPS_REQUIS.filter((c) => !String(formData[c]).trim())
  const peutEnvoyer = manquants.length === 0 && !saving

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!peutEnvoyer) return

    setSaving(true)
    setMessage(null)

    try {
      // Les champs laissés vides partent à null plutôt qu'en chaîne vide :
      // une colonne facultative non renseignée vaut NULL en base.
      const payload = Object.fromEntries(
        Object.entries(formData).map(([k, v]) => [
          k,
          typeof v === "string" && v.trim() === "" ? null : v,
        ])
      )

      const response = await fetch("/api/admin/hotels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (!response.ok) {
        setMessage({
          type: "error",
          text: result.error || "Création impossible",
        })
        setSaving(false)
        return
      }

      // Direction la fiche du nouvel hôtel : l'administrateur y ajoute
      // ensuite chambres, offres et équipements.
      router.push(`/${countryCode}/admin/hotels/${result.hotel.id_hotel}`)
    } catch {
      setMessage({ type: "error", text: "Erreur réseau" })
      setSaving(false)
    }
  }

  const labelClass = "block text-sm text-gris-moyen mb-1"
  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-rounded text-sm focus:outline-none focus:border-turquoise focus:ring-1 focus:ring-turquoise"

  // Appelé comme fonction et non comme composant : un composant défini dans
  // le rendu serait recréé à chaque frappe et l'input perdrait le focus.
  const renderField = (
    label: string,
    field: keyof FormData,
    type = "text",
    placeholder?: string
  ) => {
    const requis = CHAMPS_REQUIS.includes(field)
    return (
      <div>
        <label className={labelClass} htmlFor={field}>
          {label}
          {requis && <span className="text-erreur"> *</span>}
        </label>
        <input
          id={field}
          type={type}
          className={inputClass}
          value={formData[field] ?? ""}
          placeholder={placeholder}
          required={requis}
          min={type === "number" ? 1 : undefined}
          max={type === "number" ? 5 : undefined}
          onChange={(e) =>
            updateField(
              field,
              (type === "number"
                ? e.target.value === ""
                  ? null
                  : parseInt(e.target.value, 10)
                : e.target.value) as FormData[typeof field]
            )
          }
        />
      </div>
    )
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <Link
          href={listUrl}
          className="p-2 rounded-rounded text-gris-moyen hover:bg-white hover:text-turquoise"
          aria-label="Retour à la liste des hôtels"
        >
          <FiArrowLeft aria-hidden="true" />
        </Link>
        <h1 className="text-2xl font-bold text-gris-fonce">Nouvel hôtel</h1>
      </div>

      {message && (
        <div
          className={`px-4 py-3 rounded-rounded text-sm ${
            message.type === "ok"
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-700"
          }`}
          role="alert"
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Identité */}
        <section className="bg-white rounded-rounded border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gris-fonce">Identité</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField("Nom", "nom_hotel", "text", "Hôtel des Voyageurs")}
            {renderField("Étoiles", "nbre_etoile_hotel", "number", "1 à 5")}
          </div>
          <div>
            <label className={labelClass} htmlFor="description_hotel">
              Description
            </label>
            <textarea
              id="description_hotel"
              rows={4}
              className={inputClass}
              value={formData.description_hotel}
              onChange={(e) => updateField("description_hotel", e.target.value)}
              placeholder="Présentation de l'établissement"
            />
          </div>
        </section>

        {/* Adresse */}
        <section className="bg-white rounded-rounded border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gris-fonce">Adresse</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField("Rue", "rue_hotel", "text", "12 rue de la Paix")}
            {renderField("Code postal", "code_postal_hotel", "text", "75001")}
            {renderField("Ville", "ville_hotel", "text", "Paris")}
            {renderField("Pays", "pays_hotel", "text", "France")}
          </div>
        </section>

        {/* Contact */}
        <section className="bg-white rounded-rounded border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gris-fonce">Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderField("Email", "email_hotel", "email", "contact@hotel.fr")}
            {renderField("Téléphone", "tel_hotel", "tel", "+33 1 23 45 67 89")}
            {renderField(
              "Site web",
              "site_web_hotel",
              "url",
              "https://www.hotel.fr"
            )}
            {renderField(
              "Image principale",
              "img_hotel",
              "text",
              "/images/hotel.jpg"
            )}
          </div>
        </section>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!peutEnvoyer}
            className="inline-flex items-center gap-2 px-4 py-2 bg-turquoise text-white rounded-rounded text-sm hover:bg-turquoise-hover disabled:opacity-50"
          >
            <FiCheck aria-hidden="true" />
            {saving ? "Création…" : "Créer l'hôtel"}
          </button>
          <Link
            href={listUrl}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-rounded text-sm hover:bg-white"
          >
            Annuler
          </Link>
          {manquants.length > 0 && (
            <span className="text-sm text-gris-moyen">
              Nom, ville et pays sont obligatoires
            </span>
          )}
        </div>
      </form>
    </div>
  )
}