// src/app/[countryCode]/(admin)/admin/hotels/[id]/page.tsx
// ============================================================================
// Admin : détail / édition d'un hôtel
// ============================================================================

import { Metadata } from "next"
import HotelDetail from "@modules/admin/components/HotelDetail"

export const metadata: Metadata = {
  title: "Détail hôtel | Administration",
}

interface AdminHotelPageProps {
  params: Promise<{ id: string; countryCode: string }>
}

export default async function AdminHotelPage({ params }: AdminHotelPageProps) {
  const { id, countryCode } = await params
  return <HotelDetail hotelId={id} countryCode={countryCode} />
}
