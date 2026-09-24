// src/app/[countryCode]/(admin)/admin/reservations/[id]/page.tsx
// ============================================================================
// Admin : détail d'une réservation
// ============================================================================

import { Metadata } from "next";
import AdminReservationDetail from "@modules/admin/components/AdminReservationDetail";

export const metadata: Metadata = {
  title: "Détail réservation | Administration",
};

interface AdminReservationPageProps {
  params: Promise<{ id: string; countryCode: string }>;
}

export default async function AdminReservationPage({
  params,
}: AdminReservationPageProps) {
  const { id, countryCode } = await params;
  return (
    <AdminReservationDetail reservationId={id} countryCode={countryCode} />
  );
}
