// src/modules/auth/components/LoginForm.tsx
// ============================================================================
// Formulaire de connexion - Hotel Booking Bloc 3
// ============================================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiMail, FiLock, FiAlertCircle, FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "./AuthProvider";

// Comptes de démonstration (projet d'examen) : pré-remplissent le formulaire
const DEMO_ACCOUNTS = [
  {
    label: "Client",
    email: "demo.client@bookyourtravel.fr",
    password: "Demo2026!",
  },
  {
    label: "Administrateur",
    email: "demo.admin@bookyourtravel.fr",
    password: "Demo2026!",
  },
] as const;

export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email || !password) {
      setError("Veuillez remplir tous les champs");
      setIsLoading(false);
      return;
    }

    const result = await login(email, password);

    if (result.success) {
      router.push("/fr");
    } else {
      setError(result.error || "Erreur de connexion");
    }

    setIsLoading(false);
  };

  // Pré-remplit les identifiants d'un compte de démonstration
  const fillDemo = (account: (typeof DEMO_ACCOUNTS)[number]) => {
    setEmail(account.email);
    setPassword(account.password);
    setError("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <FiAlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Adresse email
        </label>
        <div className="relative">
          <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
            required
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Mot de passe
        </label>
        <div className="relative">
          <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            aria-label={
              showPassword
                ? "Masquer le mot de passe"
                : "Afficher le mot de passe"
            }
          >
            {showPassword ? (
              <FiEyeOff className="w-5 h-5" />
            ) : (
              <FiEye className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        <Link
          href="/fr/forgot-password"
          className="text-sm text-cyan-600 hover:text-cyan-700 hover:underline"
        >
          Mot de passe oublié ?
        </Link>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-400 text-white font-semibold rounded-lg transition duration-200 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Connexion...
          </>
        ) : (
          "Se connecter"
        )}
      </button>

      <p className="text-center text-gray-600">
        Pas encore de compte ?{" "}
        <Link
          href="/fr/register"
          className="text-cyan-600 hover:text-cyan-700 font-medium hover:underline"
        >
          Créer un compte
        </Link>
      </p>

      {/* Comptes de démonstration (projet d'examen) */}
      <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-4 text-sm">
        <p className="font-medium text-cyan-800 mb-2">
          🎓 Mode démonstration — comptes de test
        </p>
        <ul className="space-y-2">
          {DEMO_ACCOUNTS.map((account) => (
            <li
              key={account.email}
              className="flex items-center justify-between gap-3"
            >
              <span className="text-gray-700">
                <span className="font-medium">{account.label}</span>
                <span className="block text-xs text-gray-500">
                  {account.email}
                </span>
              </span>
              <button
                type="button"
                onClick={() => fillDemo(account)}
                className="shrink-0 px-3 py-1 rounded-md border border-cyan-300 bg-white text-cyan-700 text-xs font-medium hover:bg-cyan-100 transition-colors"
              >
                Remplir
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-gray-500">
          Mot de passe des deux comptes : {DEMO_ACCOUNTS[0].password}
        </p>
      </div>
    </form>
  );
}
