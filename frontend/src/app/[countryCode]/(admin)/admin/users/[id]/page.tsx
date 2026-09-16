// src/app/[countryCode]/(admin)/admin/users/[id]/page.tsx
// ============================================================================
// Admin : détail d'un utilisateur
// ============================================================================

import { Metadata } from "next"
import UserDetail from "@modules/admin/components/UserDetail"

export const metadata: Metadata = {
  title: "Détail utilisateur | Administration",
}

interface AdminUserPageProps {
  params: Promise<{ id: string; countryCode: string }>
}

export default async function AdminUserPage({ params }: AdminUserPageProps) {
  const { id, countryCode } = await params
  return <UserDetail userId={id} countryCode={countryCode} />
}
