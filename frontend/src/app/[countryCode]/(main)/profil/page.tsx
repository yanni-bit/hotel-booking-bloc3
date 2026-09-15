// src/app/[countryCode]/(main)/profil/page.tsx
// ============================================================================
// Page Profil - Hotel Booking Bloc 3
//
// Différence Angular → Next.js :
// - Angular : @Component avec selector, templateUrl, styleUrl
// - Next.js : Fonction qui retourne du JSX, metadata exportée
// ============================================================================

import { Metadata } from "next";
import ProfileForm from "@modules/auth/components/ProfileForm";
import { FiUser } from "react-icons/fi";

export const metadata: Metadata = {
  title: "Mon Profil | Hotel Booking",
  description: "Gérez vos informations personnelles et votre mot de passe",
};

export default function ProfilPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-gray-100 py-8 px-4">
      <div className="content-container max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="flex items-center gap-3 mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-cyan-100 rounded-full">
            <FiUser className="w-6 h-6 text-cyan-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
        </div>

        {/* Formulaire Profil */}
        <ProfileForm />

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-8">
          © {new Date().getFullYear()} Hotel Booking. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}