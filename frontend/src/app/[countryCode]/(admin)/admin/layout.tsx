// src/app/[countryCode]/(admin)/admin/layout.tsx
// ============================================================================
// Layout de l'administration
// Groupe de routes (admin) : pas de Nav/Footer du site public, une barre
// latérale à la place. Le middleware bloque déjà les non-admins ; on revérifie
// ici côté serveur (défense en profondeur) avant de rendre quoi que ce soit.
//
// Équivalent Angular : un composant AdminLayout avec <router-outlet> protégé
// par AdminGuard.
// ============================================================================

import { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireAdmin } from "@lib/admin";
import AdminSidebar from "@modules/admin/components/AdminSidebar";

export const metadata: Metadata = {
  title: "Administration",
};

interface AdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{ countryCode: string }>;
}

export default async function AdminLayout({
  children,
  params,
}: AdminLayoutProps) {
  const { countryCode } = await params;
  const admin = await requireAdmin();

  if (!admin) {
    redirect(`/${countryCode}/login?redirect=/${countryCode}/admin`);
  }

  return (
    <div className="min-h-screen flex bg-gris-clair">
      <AdminSidebar adminName={admin.prenom} />
      <main className="flex-1 min-w-0 p-6 lg:p-10">{children}</main>
    </div>
  );
}
