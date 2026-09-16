// src/app/[countryCode]/(admin)/admin/users/page.tsx
// ============================================================================
// Admin : liste des utilisateurs
// ============================================================================

import { Metadata } from "next"
import UsersTable from "@modules/admin/components/UsersTable"

export const metadata: Metadata = {
  title: "Utilisateurs | Administration",
}

export default function AdminUsersPage() {
  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold text-gris-fonce mb-6">Utilisateurs</h1>
      <UsersTable />
    </div>
  )
}
