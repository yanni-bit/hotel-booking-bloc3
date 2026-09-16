// jest.config.ts
// ============================================================================
// Configuration Jest pour Next.js (App Router)
// next/jest charge automatiquement next.config, les variables .env et le
// transformateur SWC ; on ajoute l'environnement navigateur (jsdom) et les alias.
// ============================================================================

import type { Config } from "jest"
import nextJest from "next/jest.js"

const createJestConfig = nextJest({
  // Racine de l'app Next.js, pour charger next.config.ts et .env
  dir: "./",
})

const config: Config = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  // Alias identiques à tsconfig.json
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@lib/(.*)$": "<rootDir>/src/lib/$1",
    "^@modules/(.*)$": "<rootDir>/src/modules/$1",
  },
  // Où chercher les tests
  testMatch: ["<rootDir>/src/**/__tests__/**/*.test.[jt]s?(x)", "<rootDir>/src/**/*.test.[jt]s?(x)"],
  // Couverture : uniquement le code applicatif
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/app/**/layout.tsx",
    "!src/app/**/loading.tsx",
    "!src/app/**/not-found.tsx",
  ],
}

export default createJestConfig(config)
