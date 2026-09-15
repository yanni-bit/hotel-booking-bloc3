// src/lib/prisma.ts
// ============================================================================
// Client Prisma Singleton pour Next.js
// Évite les connexions multiples en mode développement (Hot Reload)
// ============================================================================

import { PrismaClient } from '@prisma/client'

// Déclaration globale pour TypeScript
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Singleton Pattern : réutilise l'instance existante en dev
export const prisma = globalThis.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
})

// En développement, on stocke l'instance dans globalThis
// pour survivre au Hot Module Replacement (HMR)
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma
}

export default prisma