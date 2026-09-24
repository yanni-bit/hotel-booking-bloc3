// src/app/[countryCode]/(admin)/admin/hotels/nouveau/page.tsx
// ============================================================================
// Admin : création d'un hôtel
// Server Component minimal ; le formulaire vit dans HotelCreate.
// Ce segment statique prime sur [id] : /admin/hotels/nouveau n'est jamais
// interprété comme un identifiant.
// ============================================================================

import { Metadata } from "next";
import HotelCreate from "@modules/admin/components/HotelCreate";

export const metadata: Metadata = {
  title: "Nouvel hôtel | Administration",
};

interface AdminHotelCreatePageProps {
  params: Promise<{ countryCode: string }>;
}

export default async function AdminHotelCreatePage({
  params,
}: AdminHotelCreatePageProps) {
  const { countryCode } = await params;
  return <HotelCreate countryCode={countryCode} />;
}
