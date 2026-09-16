// src/modules/admin/components/AdminSidebar.tsx
// ============================================================================
// Barre latérale de l'administration
// Client Component : a besoin de l'URL courante (lien actif) et du logout.
// ============================================================================

"use client"

import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { useAuth } from "@modules/auth/components/AuthProvider"
import {
  FiGrid,
  FiHome,
  FiCalendar,
  FiUsers,
  FiExternalLink,
  FiLogOut,
} from "react-icons/fi"

interface AdminSidebarProps {
  adminName: string
}

// Entrées du menu : le href est relatif à /{countryCode}/admin
const NAV_ITEMS = [
  { href: "", label: "Tableau de bord", icon: FiGrid, exact: true },
  { href: "/hotels", label: "Hôtels", icon: FiHome, exact: false },
  { href: "/reservations", label: "Réservations", icon: FiCalendar, exact: false },
  { href: "/users", label: "Utilisateurs", icon: FiUsers, exact: false },
]

export default function AdminSidebar({ adminName }: AdminSidebarProps) {
  const pathname = usePathname()
  const { countryCode } = useParams<{ countryCode: string }>()
  const { logout } = useAuth()

  const base = `/${countryCode}/admin`

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === base + href : pathname.startsWith(base + href)

  const handleLogout = async () => {
    await logout()
    window.location.href = `/${countryCode}`
  }

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-gray-200 flex flex-col">
      {/* En-tête */}
      <div className="px-6 py-5 border-b border-gray-200">
        <Link href={`/${countryCode}`} className="block">
          <img src="/images/logo.png" alt="Book Your Travel" className="h-10 w-auto" />
        </Link>
        <p className="mt-3 text-sm text-gris-moyen">
          Connecté en tant que <span className="font-semibold text-gris-fonce">{adminName}</span>
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4" aria-label="Administration">
        <ul className="space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact)
            return (
              <li key={href}>
                <Link
                  href={base + href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-rounded text-sm transition-colors ${
                    active
                      ? "bg-turquoise text-white font-semibold"
                      : "text-gris-fonce hover:bg-turquoise-light hover:text-turquoise"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Pied */}
      <div className="px-3 py-4 border-t border-gray-200 space-y-1">
        <Link
          href={`/${countryCode}`}
          className="flex items-center gap-3 px-3 py-2.5 rounded-rounded text-sm text-gris-fonce hover:bg-gris-clair"
        >
          <FiExternalLink className="w-4 h-4 shrink-0" aria-hidden="true" />
          Voir le site
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-rounded text-sm text-erreur hover:bg-red-50"
        >
          <FiLogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
