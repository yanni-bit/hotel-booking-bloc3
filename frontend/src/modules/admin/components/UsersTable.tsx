// src/modules/admin/components/UsersTable.tsx
// ============================================================================
// Admin : tableau des utilisateurs (recherche, filtre rôle, pagination,
// changement de rôle et activation en ligne). Portage de l'ancienne page Medusa.
// ============================================================================

"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { FiSearch, FiChevronLeft, FiChevronRight } from "react-icons/fi"
import { useAuth } from "@modules/auth/components/AuthProvider"
import RoleBadge from "./RoleBadge"

interface Role { id_role: number; code_role: string; nom_role: string }

interface User {
  id_user: number
  nom_user: string
  prenom_user: string
  email_user: string
  tel_user: string | null
  date_inscription: string
  actif: boolean
  email_verifie: boolean
  role: Role
  _count: { reservations: number; avis: number }
}

interface Pagination { page: number; limit: number; total: number; totalPages: number }

const PAGE_SIZE = 15
const SEARCH_DELAY_MS = 300

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })

export default function UsersTable() {
  const router = useRouter()
  const { countryCode } = useParams<{ countryCode: string }>()
  const { user: me } = useAuth()

  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(search.trim()); setPage(1) }, SEARCH_DELAY_MS)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let cancelled = false
    const fetchUsers = async () => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(PAGE_SIZE),
          ...(debouncedSearch && { search: debouncedSearch }),
          ...(roleFilter !== "all" && { role: roleFilter }),
        })
        const response = await fetch(`/api/admin/users?${params}`)
        if (!response.ok) throw new Error(`Réponse ${response.status}`)
        const data = await response.json()
        if (!cancelled) {
          setUsers(data.users)
          setRoles(data.roles)
          setPagination(data.pagination)
        }
      } catch (err) {
        console.error("Erreur chargement utilisateurs:", err)
        if (!cancelled) setError("Impossible de charger les utilisateurs. Réessayez.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchUsers()
    return () => { cancelled = true }
  }, [page, debouncedSearch, roleFilter])

  // Mise à jour partielle d'un utilisateur, optimiste avec rollback
  const patchUser = async (userId: number, patch: { id_role?: number; actif?: boolean }) => {
    const previous = users
    setUsers((list) =>
      list.map((u) => {
        if (u.id_user !== userId) return u
        const role = patch.id_role !== undefined ? roles.find((r) => r.id_role === patch.id_role) ?? u.role : u.role
        return { ...u, role, actif: patch.actif ?? u.actif }
      })
    )
    setUpdatingId(userId)
    setError(null)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error ?? `Réponse ${response.status}`)
      }
    } catch (err) {
      console.error("Erreur mise à jour utilisateur:", err)
      setUsers(previous)
      setError(err instanceof Error ? err.message : "La modification a échoué.")
    } finally {
      setUpdatingId(null)
    }
  }

  const openUser = (id: number) => router.push(`/${countryCode}/admin/users/${id}`)

  const inputClass =
    "px-3 py-2 border border-gray-300 rounded-rounded text-sm focus:outline-none focus:border-turquoise focus:ring-1 focus:ring-turquoise"

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <label className="relative flex-1 max-w-sm">
          <span className="sr-only">Rechercher un utilisateur</span>
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Nom, prénom ou email" className={`w-full pl-9 ${inputClass}`} />
        </label>
        <label>
          <span className="sr-only">Filtrer par rôle</span>
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }} className={`${inputClass} bg-white`}>
            <option value="all">Tous les rôles</option>
            {roles.map((r) => <option key={r.id_role} value={r.id_role}>{r.nom_role}</option>)}
          </select>
        </label>
        <span className="text-sm text-gris-moyen">
          {pagination ? `${pagination.total} utilisateur${pagination.total > 1 ? "s" : ""}` : ""}
        </span>
      </div>

      {error && <p role="alert" className="px-4 py-3 rounded-rounded text-sm bg-red-50 text-erreur">{error}</p>}

      <div className="bg-white rounded-rounded border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gris-clair text-left text-gris-moyen">
            <tr>
              <th className="px-4 py-3 font-medium w-16">ID</th>
              <th className="px-4 py-3 font-medium">Utilisateur</th>
              <th className="px-4 py-3 font-medium">Rôle</th>
              <th className="px-4 py-3 font-medium">Inscrit le</th>
              <th className="px-4 py-3 font-medium text-right">Réservations</th>
              <th className="px-4 py-3 font-medium">Compte</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && <tr><td colSpan={6} className="px-4 py-10 text-center text-gris-moyen">Chargement…</td></tr>}
            {!loading && users.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-gris-moyen">Aucun utilisateur ne correspond.</td></tr>
            )}
            {!loading && users.map((u) => {
              const isSelf = me?.id_user === u.id_user
              const busy = updatingId === u.id_user
              return (
                <tr key={u.id_user}
                  onClick={() => openUser(u.id_user)}
                  onKeyDown={(e) => e.key === "Enter" && openUser(u.id_user)}
                  tabIndex={0}
                  className="cursor-pointer hover:bg-turquoise-light focus:outline-none focus:bg-turquoise-light">
                  <td className="px-4 py-3 text-gris-moyen">{u.id_user}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gris-fonce">
                      {u.prenom_user} {u.nom_user}
                      {isSelf && <span className="ml-2 text-xs text-gris-moyen">(vous)</span>}
                    </p>
                    <p className="text-xs text-gris-moyen">{u.email_user}</p>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <RoleBadge role={u.role} />
                      <select
                        aria-label={`Changer le rôle de ${u.prenom_user} ${u.nom_user}`}
                        value={u.role.id_role}
                        disabled={busy || isSelf}
                        onChange={(e) => patchUser(u.id_user, { id_role: parseInt(e.target.value) })}
                        className="text-xs border border-gray-300 rounded-rounded px-1.5 py-1 bg-white disabled:opacity-50">
                        {roles.map((r) => <option key={r.id_role} value={r.id_role}>{r.nom_role}</option>)}
                      </select>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(u.date_inscription)}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={u._count.reservations > 0 ? "font-semibold text-gris-fonce" : "text-gray-400"}>{u._count.reservations}</span>
                  </td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      disabled={busy || isSelf}
                      onClick={() => patchUser(u.id_user, { actif: !u.actif })}
                      className={`px-2.5 py-1 rounded-rounded text-xs font-medium disabled:opacity-50 ${
                        u.actif ? "bg-green-100 text-green-800 hover:bg-red-100 hover:text-red-800" : "bg-red-100 text-red-800 hover:bg-green-100 hover:text-green-800"
                      }`}
                      title={u.actif ? "Désactiver le compte" : "Réactiver le compte"}>
                      {u.actif ? "Actif" : "Inactif"}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <nav className="flex items-center justify-center gap-3" aria-label="Pagination">
          <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || loading}
            className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-rounded text-sm disabled:opacity-40 hover:border-turquoise hover:text-turquoise">
            <FiChevronLeft aria-hidden="true" /> Précédent
          </button>
          <span className="text-sm text-gris-moyen">Page {page} / {pagination.totalPages}</span>
          <button type="button" onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={page === pagination.totalPages || loading}
            className="inline-flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-rounded text-sm disabled:opacity-40 hover:border-turquoise hover:text-turquoise">
            Suivant <FiChevronRight aria-hidden="true" />
          </button>
        </nav>
      )}
    </div>
  )
}
