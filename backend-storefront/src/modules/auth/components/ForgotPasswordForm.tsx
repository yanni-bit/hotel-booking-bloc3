// src/modules/auth/components/ForgotPasswordForm.tsx
// ============================================================================
// Formulaire Mot de Passe Oublié - Hotel Booking Bloc 3
//
// Différence Angular → React :
// - Angular : [(ngModel)]="email", (ngSubmit)="onSubmit()"
// - React : useState + onChange + onSubmit
//
// - Angular : @if (successMessage) { ... }
// - React : {successMessage && <div>...</div>}
//
// - Angular : cdr.markForCheck() pour OnPush
// - React : Automatique avec setState
// ============================================================================

"use client";

import { useState } from "react";
import Link from "next/link";
import { FiMail, FiArrowLeft, FiCheckCircle, FiAlertTriangle } from "react-icons/fi";

export default function ForgotPasswordForm() {
  // États (équivalent Angular: email: string = '', loading: boolean = false, etc.)
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [resetLink, setResetLink] = useState("");

  // ============================================================================
  // SOUMISSION DU FORMULAIRE
  // Équivalent Angular: onSubmit() avec authService.forgotPassword().subscribe()
  // ============================================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation (comme Angular lignes 28-41)
    if (!email) {
      setErrorMessage("Veuillez entrer votre adresse email");
      return;
    }

    // Validation format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMessage("Veuillez entrer une adresse email valide");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(data.message);
        setResetLink(data.resetLink || ""); // Stocker le lien pour l'afficher
        setEmail(""); // Vider le champ
      } else {
        setErrorMessage(data.error || "Une erreur est survenue");
      }
    } catch (error) {
      console.error("Erreur forgot-password:", error);
      setErrorMessage("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // RENDER
  // Équivalent du template Angular (forgot-password.html)
  // ============================================================================
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      {/* Message de succès */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <FiCheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-green-700">{successMessage}</p>
              <hr className="my-3 border-green-200" />
              <p className="text-sm text-green-600">
                📧 Vérifiez votre boîte de réception (et vos spams)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Lien de réinitialisation - Démo projet d'examen */}
      {resetLink && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm font-semibold text-amber-800 mb-2">
            🎓 Mode démonstration (projet d'examen)
          </p>
          <p className="text-xs text-amber-700 mb-3">
            Le lien ci-dessous a également été envoyé par email. Pour faciliter la présentation, vous pouvez cliquer directement ici :
          </p>
          <a
            href={resetLink}
            className="block p-3 bg-white border border-amber-300 rounded text-cyan-600 hover:text-cyan-800 text-sm break-all transition-colors"
          >
            {resetLink}
          </a>
        </div>
      )}

      {/* Message d'erreur */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-3">
            <FiAlertTriangle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Formulaire (caché si succès) */}
      {!successMessage && (
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Adresse email
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                autoComplete="email"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Nous vous enverrons un lien pour réinitialiser votre mot de passe
            </p>
          </div>

          {/* Bouton envoyer */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <FiMail className="w-5 h-5" />
                Envoyer le lien
              </>
            )}
          </button>
        </form>
      )}

      {/* Bouton retour si succès */}
      {successMessage && (
        <Link
          href="/fr/login"
          className="w-full py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2"
        >
          <FiArrowLeft className="w-5 h-5" />
          Retour à la connexion
        </Link>
      )}

      {/* Lien retour login (toujours visible si pas de succès) */}
      {!successMessage && (
        <div className="mt-6 text-center">
          <Link
            href="/fr/login"
            className="text-gray-500 hover:text-cyan-600 transition-colors flex items-center justify-center gap-1"
          >
            <FiArrowLeft className="w-4 h-4" />
            Retour à la connexion
          </Link>
        </div>
      )}
    </div>
  );
}