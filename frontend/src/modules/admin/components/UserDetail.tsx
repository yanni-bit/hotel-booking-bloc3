// src/modules/admin/components/UserDetail.tsx
// ============================================================================
// Admin : fiche utilisateur (coordonnées, rôle, activation, réservations, avis)
// ============================================================================

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FiArrowLeft, FiTrash2 } from "react-icons/fi"
import { useAuth } from "@modules/auth/components/AuthProvider"
import RoleBadge from "./RoleBadge"
import StatutBadge from "./StatutBadge"

interface Role { id_role: number; code_role: string; nom_role: string }

interface User {
  id_user: number
  nom_user: string
  prenom_user: string
  email_user: string
  tel_user: string | null
  date_inscription: string
  derniere_connexion: string | null
  actif: boolean
  email_verifie: boolean
  role: Role
  adresse: { rue_user: string | null; complement_user: string | null; code_postal_user: string | null; ville_user: string | null; pays_user: string | null } | null
  reservations: {
    id_reservation: number
    num_confirmation: string | null
    check_in: string
    check_out: string
    total_price: string
    devise: string
    hotel: { id_hotel: number; nom_hotel: string; ville_hotel: string }
    chambre: { type_room: string }
    statut: { nom_statut: string; couleur: string } | null
  }[]
  avis: {
    id_avis: number
    note: string
    titre_avis: string | null
    commentaire: string | null
    date_avis: string | null
    hotel: { id_hotel: number; nom_hotel: string }
  }[]
  _count: { reservations: number; avis: number }
}

interface UserDetailProps {
  userId: string
  countryCode: string
}

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—"
const formatDateTime = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"

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

export default function UserDetail({ userId, countryCode }: UserDetailProps) {
  const router = useRouter()
  const { user: me } = useAuth()
  const listUrl = `/${countryCode}/admin/users`

  const [user, setUser] = useState<User | null>(null)
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/admin/users/${userId}`)
        if (response.status === 404) { if (!cancelled) setNotFound(true); return }
        if (!response.ok) throw new Error(`Réponse ${response.status}`)
        const data = await response.json()
        if (!cancelled) { setUser(data.user); setRoles(data.roles) }
      } catch (err) {
        console.error("Erreur chargement utilisateur:", err)
        if (!cancelled) setMessage({ type: "error", text: "Impossible de charger l'utilisateur." })
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [userId])

  const patch = async (body: { id_role?: number; actif?: boolean }, okText: string) => {
    setSaving(true)
    setMessage(null)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await response.json()
      if (!response.ok) { setMessage({ type: "error", text: data.error ?? "Modification impossible." }); return }
      setUser((prev) => (prev ? { ...prev, role: data.user.role, actif: data.user.actif } : prev))
      setMessage({ type: "ok", text: okText })
    } catch (err) {
      console.error("Erreur modification utilisateur:", err)
      setMessage({ type: "error", text: "Modification impossible. Réessayez." })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!user) return
    if (!window.confirm(`Supprimer le compte de ${user.prenom_user} ${user.nom_user} ? Cette action est irréversible.`)) return
    setMessage(null)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" })
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

  if (loading) return <p className="text-gris-moyen">Chargement…</p>

  if (notFound || !user) {
    return (
      <div className="space-y-4">
        <p className="text-gris-fonce">Cet utilisateur n&apos;existe pas.</p>
        <Link href={listUrl} className="text-turquoise hover:underline">Retour à la liste</Link>
      </div>
    )
  }

  const isSelf = me?.id_user === user.id_user
  const u = user

  return (
    <div className="max-w-6xl space-y-6">
      {/* En-tête */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Link href={listUrl} className="mt-1 p-2 rounded-rounded text-gris-moyen hover:bg-white hover:text-turquoise" aria-label="Retour à la liste">
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gris-fonce">
              {u.prenom_user} {u.nom_user}
              {isSelf && <span className="ml-2 text-sm font-normal text-gris-moyen">(vous)</span>}
            </h1>
            <p className="text-sm text-gris-moyen">{u.email_user} · ID {u.id_user}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2">
            <RoleBadge role={u.role} />
            <select
              value={u.role.id_role}
              disabled={saving || isSelf}
              onChange={(e) => patch({ id_role: parseInt(e.target.value) }, "Rôle mis à jour.")}
              className="px-3 py-2 border border-gray-300 rounded-rounded text-sm bg-white disabled:opacity-50"
              aria-label="Changer le rôle">
              {roles.map((r) => <option key={r.id_role} value={r.id_role}>{r.nom_role}</option>)}
            </select>
          </label>
          <button type="button" disabled={saving || isSelf}
            onClick={() => patch({ actif: !u.actif }, u.actif ? "Compte désactivé." : "Compte réactivé.")}
            className={`px-4 py-2 rounded-rounded text-sm border disabled:opacity-50 ${
              u.actif ? "border-gray-300 text-gris-fonce hover:bg-white" : "border-validation text-validation hover:bg-green-50"
            }`}>
            {u.actif ? "Désactiver" : "Réactiver"}
          </button>
          <button type="button" disabled={isSelf} onClick={handleDelete}
            className="inline-flex items-center gap-2 px-4 py-2 border border-erreur text-erreur rounded-rounded text-sm hover:bg-red-50 disabled:opacity-50">
            <FiTrash2 aria-hidden="true" /> Supprimer
          </button>
        </div>
      </div>

      {message && (
        <p role="status" className={`px-4 py-3 rounded-rounded text-sm ${message.type === "ok" ? "bg-green-50 text-validation" : "bg-red-50 text-erreur"}`}>
          {message.text}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Section title={`Réservations (${u._count.reservations})`}>
            {u.reservations.length === 0 ? (
              <p className="text-sm text-gris-moyen">Aucune réservation.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-left text-gris-moyen">
                    <tr>
                      <th className="py-2 pr-4 font-medium">Confirmation</th>
                      <th className="py-2 pr-4 font-medium">Hôtel</th>
                      <th className="py-2 pr-4 font-medium">Séjour</th>
                      <th className="py-2 pr-4 font-medium text-right">Total</th>
                      <th className="py-2 font-medium">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {u.reservations.map((r) => (
                      <tr key={r.id_reservation}>
                        <td className="py-2 pr-4">
                          <Link href={`/${countryCode}/admin/reservations/${r.id_reservation}`} className="font-mono text-xs text-turquoise hover:underline">
                            {r.num_confirmation ?? `#${r.id_reservation}`}
                          </Link>
                        </td>
                        <td className="py-2 pr-4">
                          <p className="text-gris-fonce">{r.hotel.nom_hotel}</p>
                          <p className="text-xs text-gris-moyen">{r.chambre.type_room}</p>
                        </td>
                        <td className="py-2 pr-4 whitespace-nowrap">{formatDate(r.check_in)} → {formatDate(r.check_out)}</td>
                        <td className="py-2 pr-4 text-right whitespace-nowrap">{Number(r.total_price).toFixed(2)} {r.devise === "EUR" ? "€" : r.devise}</td>
                        <td className="py-2"><StatutBadge statut={r.statut} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          <Section title={`Avis (${u._count.avis})`}>
            {u.avis.length === 0 ? (
              <p className="text-sm text-gris-moyen">Aucun avis déposé.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {u.avis.map((a) => (
                  <li key={a.id_avis} className="py-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <Link href={`/${countryCode}/admin/hotels/${a.hotel.id_hotel}`} className="font-medium text-turquoise hover:underline">{a.hotel.nom_hotel}</Link>
                      <span className="text-gris-moyen whitespace-nowrap">{Number(a.note).toFixed(1)}/10 · {formatDate(a.date_avis)}</span>
                    </div>
                    {a.titre_avis && <p className="mt-1 font-medium text-gris-fonce">{a.titre_avis}</p>}
                    {a.commentaire && <p className="mt-1 text-gris-fonce">{a.commentaire}</p>}
                  </li>
                ))}
              </ul>
            )}
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Compte">
            <dl className="space-y-2">
              <Row label="Statut" value={u.actif ? "Actif" : "Inactif"} />
              <Row label="Email vérifié" value={u.email_verifie ? "Oui" : "Non"} />
              <Row label="Inscrit le" value={formatDate(u.date_inscription)} />
              <Row label="Dernière connexion" value={formatDateTime(u.derniere_connexion)} />
            </dl>
          </Section>

          <Section title="Coordonnées">
            <dl className="space-y-2">
              <Row label="Email" value={<a href={`mailto:${u.email_user}`} className="hover:underline break-all">{u.email_user}</a>} />
              <Row label="Téléphone" value={u.tel_user ?? "—"} />
              {u.adresse && (
                <Row label="Adresse" value={
                  <span className="whitespace-pre-line">
                    {[u.adresse.rue_user, u.adresse.complement_user, [u.adresse.code_postal_user, u.adresse.ville_user].filter(Boolean).join(" "), u.adresse.pays_user]
                      .filter(Boolean).join("\n") || "—"}
                  </span>
                } />
              )}
            </dl>
          </Section>
        </div>
      </div>
    </div>
  )
}
