// src/modules/auth/components/ResetPasswordForm.tsx
// ============================================================================
// Formulaire Réinitialisation Mot de Passe - Hotel Booking Bloc 3
//
// Différence Angular → React :
// - Angular : ActivatedRoute.queryParams.subscribe() dans ngOnInit
// - React : useSearchParams() hook
//
// - Angular : setTimeout(() => this.router.navigate(['/login']), 3000)
// - React : setTimeout(() => router.push('/fr/login'), 3000)
// ============================================================================

"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiArrowLeft, 
  FiCheckCircle, 
  FiAlertTriangle,
  FiMail
} from "react-icons/fi";

export default function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Token depuis l'URL (équivalent Angular: this.route.queryParams.subscribe())
  const [token, setToken] = useState("");

  // États formulaire
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Toggle visibilité mot de passe (équivalent Angular: showNewPassword, showConfirmPassword)
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ============================================================================
  // RÉCUPÉRATION DU TOKEN
  // Équivalent Angular: ngOnInit() avec route.queryParams.subscribe()
  // ============================================================================
  useEffect(() => {
    const tokenFromUrl = searchParams.get("token") || "";
    setToken(tokenFromUrl);

    if (!tokenFromUrl) {
      setErrorMessage("Token manquant. Veuillez utiliser le lien envoyé par email.");
    }
  }, [searchParams]);

  // ============================================================================
  // SOUMISSION DU FORMULAIRE
  // Équivalent Angular: onSubmit() avec authService.resetPassword().subscribe()
  // ============================================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation (comme Angular lignes 55-79)
    if (!newPassword || !confirmPassword) {
      setErrorMessage("Veuillez remplir tous les champs");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("Les mots de passe ne correspondent pas");
      return;
    }

    if (!token) {
      setErrorMessage("Token manquant");
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(data.message);

        // Redirection vers login après 3 secondes (comme Angular ligne 93-95)
        setTimeout(() => {
          router.push("/fr/login");
        }, 3000);
      } else {
        setErrorMessage(data.error || "Une erreur est survenue");
      }
    } catch (error) {
      console.error("Erreur reset-password:", error);
      setErrorMessage("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // RENDER
  // Équivalent du template Angular (reset-password.html)
  // ============================================================================
  return (
    <div className="bg-white rounded-2xl shadow-xl p-8">
      {/* Message de succès */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <FiCheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-green-700">{successMessage}</p>
              <hr className="my-3 border-green-200" />
              <p className="text-sm text-green-600 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                Redirection vers la connexion...
              </p>
            </div>
          </div>
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

      {/* Formulaire (affiché si token présent et pas de succès) */}
      {!successMessage && token && (
        <form onSubmit={handleSubmit}>
          {/* Nouveau mot de passe */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-600 transition-colors"
              >
                {showNewPassword ? (
                  <FiEyeOff className="w-5 h-5" />
                ) : (
                  <FiEye className="w-5 h-5" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
          </div>

          {/* Confirmer mot de passe */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirmer le mot de passe
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-600 transition-colors"
              >
                {showConfirmPassword ? (
                  <FiEyeOff className="w-5 h-5" />
                ) : (
                  <FiEye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Bouton réinitialiser */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-cyan-600 text-white font-semibold rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Réinitialisation...
              </>
            ) : (
              <>
                <FiCheckCircle className="w-5 h-5" />
                Réinitialiser le mot de passe
              </>
            )}
          </button>
        </form>
      )}

      {/* Lien si token manquant */}
      {!token && !successMessage && (
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Vous n'avez pas de lien valide ?
          </p>
          <Link
            href="/fr/forgot-password"
            className="inline-flex items-center gap-2 px-6 py-3 border border-cyan-600 text-cyan-600 rounded-lg hover:bg-cyan-50 transition-colors"
          >
            <FiMail className="w-5 h-5" />
            Demander un nouveau lien
          </Link>
        </div>
      )}

      {/* Lien retour login */}
      <div className="mt-6 text-center">
        <Link
          href="/fr/login"
          className="text-gray-500 hover:text-cyan-600 transition-colors flex items-center justify-center gap-1"
        >
          <FiArrowLeft className="w-4 h-4" />
          Retour à la connexion
        </Link>
      </div>
    </div>
  );
}