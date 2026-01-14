// src/app/[countryCode]/(main)/hotels/[id]/page.tsx
// ============================================================================
// Redirection automatique vers l'onglet description
// Quand on va sur /hotels/123, redirige vers /hotels/123/description
// ============================================================================

import { redirect } from "next/navigation"

interface HotelPageProps {
  params: Promise<{ id: string; countryCode: string }>
}

export default async function HotelPage({ params }: HotelPageProps) {
  const { id, countryCode } = await params
  
  // Redirige vers /hotels/[id]/description par défaut
  redirect(`/${countryCode}/hotels/${id}/description`)
}
