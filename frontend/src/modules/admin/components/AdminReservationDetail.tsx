// src/modules/admin/components/AdminReservationDetail.tsx
// ============================================================================
// Admin : fiche d'une réservation (client, hôtel, séjour, services, paiement)
// avec changement de statut.
// ============================================================================

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { FiArrowLeft } from "react-icons/fi"
import StatutBadge from "./StatutBadge"

interface Statut { id_statut: number; nom_statut: string; couleur: string }

interface Reservation {
  id_reservation: number
  num_confirmation: string | null
  check_in: string
  check_out: string
  nbre_nuits: number
  nbre_adults: number
  nbre_children: number
  prix_nuit: string
  total_price: string
  devise: string
  special_requests: string | null
  date_reservation: string
  cancel_deadline: string | null
  user: { id_user: number; nom_user: string; prenom_user: string; email_user: string; tel_user: string | null }
  hotel: { id_hotel: number; nom_hotel: string; ville_hotel: string; pays_hotel: string }
  chambre: { id_chambre: number; type_room: string; nbre_adults_max: number }
  offre: { id_offre: number; nom_offre: string; remboursable: boolean; petit_dejeuner_inclus: boolean } | null
  statut: Statut | null
  paiement: { id_paiement: number; montant: string; methode_paiement: string | null; statut_paiement: string; reference_externe: string | null; date_paiement: string } | null
  services: {
    id_reservation_service: number
    quantite: number
    prix_unitaire: string
    sous_total: string
    hotel_service: { service: { nom_service: string } }
  }[]
}

interface AdminReservationDetailProps {
  reservationId: string
  countryCode: string
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
const money = (v: string | number, devise = "EUR") =>
  `${Number(v).toFixed(2)} ${devise === "EUR" ? "€" : devise}`

// Petits composants de présentation, définis hors du composant principal
// pour ne pas être recréés à chaque rendu.
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-rounded border border-gray-200 p-5">
      <h2 className="text-lg font-semibold text-gris-fonce mb-4">{title}</h2>
      {children}
    </section>
  )
}
function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <dt className="text-gris-moyen">{label}</dt>
      <dd className="text-gris-fonce text-right">{value}</dd>
    </div>
  )
}

export default function AdminReservationDetail({ reservationId, countryCode }: AdminReservationDetailProps) {
  const listUrl = `/${countryCode}/admin/reservations`

  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [statuts, setStatuts] = useState<Statut[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/admin/reservations/${reservationId}`)
        if (response.status === 404) { if (!cancelled) setNotFound(true); return }
        if (!response.ok) throw new Error(`Réponse ${response.status}`)
        const data = await response.json()
        if (!cancelled) {
          setReservation(data.reservation)
          setStatuts(data.statuts)
        }
      } catch (err) {
        console.error("Erreur chargement réservation:", err)
        if (!cancelled) setMessage({ type: "error", text: "Impossible de charger la réservation." })
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [reservationId])

  const handleStatutChange = async (newStatutId: number) => {
    if (!reservation) return
    setSaving(true)
    setMessage(null)
    try {
      const response = await fetch(`/api/admin/reservations/${reservationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_statut: newStatutId }),
      })
      const data = await response.json()
      if (!response.ok) {
        setMessage({ type: "error", text: data.error ?? "Changement de statut impossible." })
        return
      }
      setReservation((prev) => (prev ? { ...prev, statut: data.reservation.statut } : prev))
      setMessage({ type: "ok", text: `Statut passé à « ${data.reservation.statut.nom_statut} ».` })
    } catch (err) {
      console.error("Erreur changement statut:", err)
      setMessage({ type: "error", text: "Changement de statut impossible. Réessayez." })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-gris-moyen">Chargement…</p>

  if (notFound || !reservation) {
    return (
      <div className="space-y-4">
        <p className="text-gris-fonce">Cette réservation n&apos;existe pas.</p>
        <Link href={listUrl} className="text-turquoise hover:underline">Retour à la liste</Link>
      </div>
    )
  }

  const r = reservation
  const totalServices = r.services.reduce((sum, s) => sum + Number(s.sous_total), 0)
  const totalChambre = Number(r.prix_nuit) * r.nbre_nuits

  return (
    <div className="max-w-6xl space-y-6">
      {/* En-tête */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href={listUrl} className="mt-1 p-2 rounded-rounded text-gris-moyen hover:bg-white hover:text-turquoise" aria-label="Retour à la liste">
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gris-fonce font-mono">{r.num_confirmation ?? `Réservation #${r.id_reservation}`}</h1>
            <p className="text-sm text-gris-moyen">Créée le {formatDateTime(r.date_reservation)}</p>
          </div>
        </div>

        <label className="flex items-center gap-3">
          <StatutBadge statut={r.statut} />
          <select
            value={r.statut?.id_statut ?? ""}
            disabled={saving}
            onChange={(e) => handleStatutChange(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-rounded text-sm bg-white disabled:opacity-50 focus:outline-none focus:border-turquoise"
            aria-label="Changer le statut"
          >
            {statuts.map((s) => <option key={s.id_statut} value={s.id_statut}>{s.nom_statut}</option>)}
          </select>
        </label>
      </div>

      {message && (
        <p role="status" className={`px-4 py-3 rounded-rounded text-sm ${message.type === "ok" ? "bg-green-50 text-validation" : "bg-red-50 text-erreur"}`}>
          {message.text}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Section title="Séjour">
            <dl className="space-y-2">
              <Row label="Hôtel" value={<Link href={`/${countryCode}/admin/hotels/${r.hotel.id_hotel}`} className="text-turquoise hover:underline">{r.hotel.nom_hotel}</Link>} />
              <Row label="Lieu" value={`${r.hotel.ville_hotel}, ${r.hotel.pays_hotel}`} />
              <Row label="Chambre" value={r.chambre.type_room} />
              <Row label="Offre" value={r.offre ? `${r.offre.nom_offre}${r.offre.petit_dejeuner_inclus ? " · petit-déjeuner inclus" : ""}${r.offre.remboursable || /remboursable/i.test(r.offre.nom_offre) ? "" : " · non remboursable"}` : "—"} />
              <Row label="Arrivée" value={formatDate(r.check_in)} />
              <Row label="Départ" value={formatDate(r.check_out)} />
              <Row label="Durée" value={`${r.nbre_nuits} nuit${r.nbre_nuits > 1 ? "s" : ""}`} />
              <Row label="Voyageurs" value={`${r.nbre_adults} adulte${r.nbre_adults > 1 ? "s" : ""}${r.nbre_children > 0 ? `, ${r.nbre_children} enfant${r.nbre_children > 1 ? "s" : ""}` : ""}`} />
              {r.cancel_deadline && <Row label="Annulation gratuite jusqu'au" value={formatDate(r.cancel_deadline)} />}
            </dl>
            {r.special_requests && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gris-moyen mb-1">Demandes spéciales</p>
                <p className="text-sm text-gris-fonce whitespace-pre-line">{r.special_requests}</p>
              </div>
            )}
          </Section>

          <Section title="Montants">
            <dl className="space-y-2">
              <Row label={`Chambre (${r.nbre_nuits} × ${money(r.prix_nuit, r.devise)})`} value={money(totalChambre, r.devise)} />
              {r.services.map((s) => (
                <Row key={s.id_reservation_service}
                  label={`${s.hotel_service.service.nom_service}${s.quantite > 1 ? ` (${s.quantite} × ${money(s.prix_unitaire, r.devise)})` : ""}`}
                  value={money(s.sous_total, r.devise)} />
              ))}
              {r.services.length > 0 && <Row label="Sous-total services" value={money(totalServices, r.devise)} />}
              <div className="flex justify-between pt-3 mt-1 border-t border-gray-200 text-base font-bold">
                <dt className="text-gris-fonce">Total</dt>
                <dd className="text-turquoise">{money(r.total_price, r.devise)}</dd>
              </div>
            </dl>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Client">
            <dl className="space-y-2">
              <Row label="Nom" value={<Link href={`/${countryCode}/admin/users/${r.user.id_user}`} className="text-turquoise hover:underline">{r.user.prenom_user} {r.user.nom_user}</Link>} />
              <Row label="Email" value={<a href={`mailto:${r.user.email_user}`} className="hover:underline break-all">{r.user.email_user}</a>} />
              <Row label="Téléphone" value={r.user.tel_user ?? "—"} />
            </dl>
          </Section>

          <Section title="Paiement">
            {r.paiement ? (
              <dl className="space-y-2">
                <Row label="Montant" value={money(r.paiement.montant, r.devise)} />
                <Row label="Méthode" value={r.paiement.methode_paiement ?? "—"} />
                <Row label="Statut" value={r.paiement.statut_paiement} />
                <Row label="Référence" value={<span className="font-mono text-xs break-all">{r.paiement.reference_externe ?? "—"}</span>} />
                <Row label="Date" value={formatDateTime(r.paiement.date_paiement)} />
              </dl>
            ) : (
              <p className="text-sm text-gris-moyen">Aucun paiement enregistré.</p>
            )}
          </Section>
        </div>
      </div>
    </div>
  )
}
