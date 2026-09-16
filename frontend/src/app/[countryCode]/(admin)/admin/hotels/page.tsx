// src/app/[countryCode]/(admin)/admin/hotels/page.tsx
// ============================================================================
// Admin : liste des hôtels
// La page est un Server Component minimal ; l'interactivité (recherche,
// pagination, fetch) vit dans le Client Component HotelsTable.
// ============================================================================

import { Metadata } from "next"
import HotelsTable from "@modules/admin/components/HotelsTable"

export const metadata: Metadata = {
  title: "Hôtels | Administration",
}

export default function AdminHotelsPage() {
  return (
    <div className="max-w-6xl">
      <h1 className="text-2xl font-bold text-gris-fonce mb-6">Hôtels</h1>
      <HotelsTable />
    </div>
  )
}
