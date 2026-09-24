// src/app/[countryCode]/(admin)/admin/reservations/page.tsx
// ============================================================================
// Admin : liste des réservations. Accepte ?statut=<id> (lien du tableau de bord).
// ============================================================================

import { Metadata } from "next";
import ReservationsTable from "@modules/admin/components/ReservationsTable";

export const metadata: Metadata = {
  title: "Réservations | Administration",
};

interface AdminReservationsPageProps {
  searchParams: Promise<{ statut?: string }>;
}

export default async function AdminReservationsPage({
  searchParams,
}: AdminReservationsPageProps) {
  const { statut } = await searchParams;
  return (
    <div className="max-w-7xl">
      <h1 className="text-2xl font-bold text-gris-fonce mb-6">Réservations</h1>
      <ReservationsTable initialStatut={statut ?? "all"} />
    </div>
  );
}
