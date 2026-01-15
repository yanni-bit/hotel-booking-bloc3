// src/lib/stripe.ts
// ============================================================================
// Configuration Stripe pour Next.js
// - Client : loadStripe() pour le navigateur
// - Server : Stripe() pour les API routes
// ============================================================================

import { loadStripe, Stripe as StripeClient } from "@stripe/stripe-js";
import Stripe from "stripe";

// ============================================================================
// CLIENT (Navigateur)
// ============================================================================
// Singleton pour éviter de recharger Stripe à chaque rendu
let stripePromise: Promise<StripeClient | null> | null = null;

/**
 * Charge Stripe côté client (navigateur)
 * Utilisé dans les composants React avec <Elements>
 *
 * Différence Angular → React :
 * - Angular : new StripeService() injecté via constructor
 * - React : Hook ou singleton importé
 */
export function getStripe(): Promise<StripeClient | null> {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      console.error("❌ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY non définie");
      return Promise.resolve(null);
    }

    stripePromise = loadStripe(publishableKey);
  }

  return stripePromise;
}

// ============================================================================
// SERVER (API Routes)
// ============================================================================
// Instance Stripe pour le serveur (API routes)
let stripeServer: Stripe | null = null;

/**
 * Récupère l'instance Stripe côté serveur
 * Utilisé dans les API routes pour créer des PaymentIntent
 *
 * Différence Angular → Next.js :
 * - Angular : Service backend séparé (Node.js/Express)
 * - Next.js : API Routes intégrées dans le même projet
 */
export function getStripeServer(): Stripe {
  if (!stripeServer) {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      throw new Error("❌ STRIPE_SECRET_KEY non définie");
    }

    stripeServer = new Stripe(secretKey, {
      typescript: true,
    });
  }

  return stripeServer;
}

// ============================================================================
// TYPES EXPORTÉS
// ============================================================================
export type { Stripe, StripeClient };

// ============================================================================
// CONSTANTES
// ============================================================================
export const STRIPE_CONFIG = {
  // Devise par défaut
  currency: "eur",

  // Pays supportés pour les cartes
  supportedCountries: ["FR", "BE", "CH", "LU", "MC"],

  // Options d'apparence pour Stripe Elements
  appearance: {
    theme: "stripe" as const,
    variables: {
      colorPrimary: "#17a2b8", // Turquoise du projet
      colorBackground: "#ffffff",
      colorText: "#1f2937",
      colorDanger: "#ef4444",
      fontFamily: "system-ui, sans-serif",
      borderRadius: "8px",
    },
    rules: {
      ".Input": {
        border: "1px solid #d1d5db",
        boxShadow: "none",
      },
      ".Input:focus": {
        border: "1px solid #17a2b8",
        boxShadow: "0 0 0 1px #17a2b8",
      },
    },
  },
} as const;
