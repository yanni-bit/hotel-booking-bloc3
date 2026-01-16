// src/app/[countryCode]/(main)/forgot-password/page.tsx
// ============================================================================
// Page Mot de Passe Oublié - Hotel Booking Bloc 3
//
// Différence Angular → Next.js :
// - Angular : @Component avec templateUrl séparé
// - Next.js : Fonction qui retourne du JSX, metadata exportée
// ============================================================================

import { Metadata } from "next";
import ForgotPasswordForm from "@modules/auth/components/ForgotPasswordForm";
import { FiKey } from "react-icons/fi";

export const metadata: Metadata = {
  title: "Mot de passe oublié | Hotel Booking",
  description: "Réinitialisez votre mot de passe Hotel Booking",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-gray-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-100 rounded-full mb-4">
            <FiKey className="w-8 h-8 text-cyan-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Mot de passe oublié</h1>
          <p className="text-gray-600 mt-2">
            Entrez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>

        {/* Formulaire */}
        <ForgotPasswordForm />

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          © {new Date().getFullYear()} Hotel Booking. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}