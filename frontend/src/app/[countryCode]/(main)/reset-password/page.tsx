// src/app/[countryCode]/(main)/reset-password/page.tsx
// ============================================================================
// Page Réinitialisation Mot de Passe - Hotel Booking Bloc 3
//
// Différence Angular → Next.js :
// - Angular : ActivatedRoute.queryParams.subscribe() pour récupérer le token
// - Next.js : useSearchParams() hook ou searchParams prop
// ============================================================================

import { Metadata } from "next";
import ResetPasswordForm from "@modules/auth/components/ResetPasswordForm";
import { FiShield } from "react-icons/fi";

export const metadata: Metadata = {
  title: "Réinitialiser le mot de passe | Hotel Booking",
  description: "Créez un nouveau mot de passe pour votre compte Hotel Booking",
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-gray-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-100 rounded-full mb-4">
            <FiShield className="w-8 h-8 text-cyan-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Nouveau mot de passe</h1>
          <p className="text-gray-600 mt-2">
            Choisissez un nouveau mot de passe sécurisé
          </p>
        </div>

        {/* Formulaire */}
        <ResetPasswordForm />

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          © {new Date().getFullYear()} Hotel Booking. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}