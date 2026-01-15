// src/app/[countryCode]/(main)/login/page.tsx
// ============================================================================
// Page de connexion - Hotel Booking Bloc 3
// ============================================================================

import { Metadata } from "next";
import LoginForm from "@modules/auth/components/LoginForm";
import { FiLogIn } from "react-icons/fi";

export const metadata: Metadata = {
  title: "Connexion | Hotel Booking",
  description: "Connectez-vous à votre compte Hotel Booking",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-gray-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-100 rounded-full mb-4">
              <FiLogIn className="w-8 h-8 text-cyan-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Connexion</h1>
            <p className="text-gray-600 mt-2">
              Accédez à votre espace personnel
            </p>
          </div>

          <LoginForm />
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          © {new Date().getFullYear()} Hotel Booking. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}