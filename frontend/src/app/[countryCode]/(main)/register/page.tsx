// src/app/[countryCode]/(main)/register/page.tsx
// ============================================================================
// Page d'inscription - Hotel Booking Bloc 3
// ============================================================================

import { Metadata } from "next";
import RegisterForm from "@modules/auth/components/RegisterForm";
import { FiUserPlus } from "react-icons/fi";

export const metadata: Metadata = {
  title: "Inscription | Hotel Booking",
  description: "Créez votre compte Hotel Booking et réservez vos hôtels",
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-gray-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-cyan-100 rounded-full mb-4">
              <FiUserPlus className="w-8 h-8 text-cyan-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>
            <p className="text-gray-600 mt-2">
              Rejoignez-nous pour réserver vos hôtels
            </p>
          </div>

          <RegisterForm />
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          © {new Date().getFullYear()} Hotel Booking. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}