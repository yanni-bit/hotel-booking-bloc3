// src/lib/auth.ts
// ============================================================================
// Authentification - Hotel Booking Bloc 3
// Hash passwords, JWT tokens, session management
// 
// Différence Angular → Next.js :
// - Angular : AuthService injectable avec BehaviorSubject
// - Next.js : Fonctions utilitaires + cookies HttpOnly
// ============================================================================

import { SignJWT, jwtVerify, JWTPayload } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import prisma from "./prisma";

// ============================================================================
// CONFIGURATION
// ============================================================================
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "hotel-booking-secret-key-change-in-production"
);

const COOKIE_NAME = "auth-token";
const TOKEN_EXPIRY = "7d"; // 7 jours
const SALT_ROUNDS = 12;

// ============================================================================
// TYPES
// ============================================================================
export interface UserPayload extends JWTPayload {
  id_user: number;
  email: string;
  nom: string;
  prenom: string;
  role: string;
}

export interface AuthUser {
  id_user: number;
  email_user: string;
  nom_user: string;
  prenom_user: string;
  tel_user: string | null;
  role: {
    id_role: number;
    code_role: string;
    nom_role: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  tel?: string;
}

// ============================================================================
// HASH PASSWORD
// ============================================================================
/**
 * Hash un mot de passe avec bcrypt
 * 
 * Différence Angular → Next.js :
 * - Angular : Fait côté backend Express/Node
 * - Next.js : Fait dans les API Routes (même projet)
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Vérifie un mot de passe contre son hash
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// ============================================================================
// JWT TOKENS
// ============================================================================
/**
 * Crée un JWT signé
 * 
 * Différence Angular → Next.js :
 * - Angular : localStorage.setItem('token', jwt) - vulnérable XSS
 * - Next.js : Cookie HttpOnly - sécurisé
 */
export async function createToken(user: AuthUser): Promise<string> {
  const payload: UserPayload = {
    id_user: user.id_user,
    email: user.email_user,
    nom: user.nom_user,
    prenom: user.prenom_user,
    role: user.role.code_role,
  };

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

/**
 * Vérifie et décode un JWT
 */
export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as UserPayload;
  } catch (error) {
    console.error("Token invalide:", error);
    return null;
  }
}

// ============================================================================
// SESSION (COOKIES)
// ============================================================================
/**
 * Définit le cookie d'authentification
 * 
 * Différence Angular → Next.js :
 * - Angular : Token stocké côté client (localStorage)
 * - Next.js : Cookie HttpOnly côté serveur (plus sécurisé)
 */
export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 jours en secondes
    path: "/",
  });
}

/**
 * Supprime le cookie d'authentification (logout)
 */
export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Récupère le token depuis les cookies
 */
export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value || null;
}

/**
 * Récupère l'utilisateur courant depuis le cookie
 * À utiliser dans les Server Components
 */
export async function getCurrentUser(): Promise<UserPayload | null> {
  const token = await getAuthToken();
  if (!token) return null;
  return verifyToken(token);
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================
/**
 * Trouve un utilisateur par email
 */
export async function findUserByEmail(email: string): Promise<AuthUser | null> {
  const user = await prisma.utilisateur.findUnique({
    where: { email_user: email },
    include: {
      role: {
        select: {
          id_role: true,
          code_role: true,
          nom_role: true,
        },
      },
    },
  });

  if (!user) return null;

  return {
    id_user: user.id_user,
    email_user: user.email_user,
    nom_user: user.nom_user,
    prenom_user: user.prenom_user,
    tel_user: user.tel_user,
    role: user.role,
  };
}

/**
 * Trouve un utilisateur par ID
 */
export async function findUserById(id: number): Promise<AuthUser | null> {
  const user = await prisma.utilisateur.findUnique({
    where: { id_user: id },
    include: {
      role: {
        select: {
          id_role: true,
          code_role: true,
          nom_role: true,
        },
      },
    },
  });

  if (!user) return null;

  return {
    id_user: user.id_user,
    email_user: user.email_user,
    nom_user: user.nom_user,
    prenom_user: user.prenom_user,
    tel_user: user.tel_user,
    role: user.role,
  };
}

/**
 * Récupère le hash du mot de passe (pour login)
 */
export async function getUserPasswordHash(email: string): Promise<string | null> {
  const user = await prisma.utilisateur.findUnique({
    where: { email_user: email },
    select: { mot_de_passe: true },
  });
  return user?.mot_de_passe || null;
}

/**
 * Crée un nouvel utilisateur
 */
export async function createUser(data: RegisterData): Promise<AuthUser> {
  const hashedPassword = await hashPassword(data.password);

  const user = await prisma.utilisateur.create({
    data: {
      email_user: data.email,
      mot_de_passe: hashedPassword,
      nom_user: data.nom,
      prenom_user: data.prenom,
      tel_user: data.tel || null,
      id_role: 2, // 2 = client (1 = admin)
      actif: true,
      email_verifie: false,
    },
    include: {
      role: {
        select: {
          id_role: true,
          code_role: true,
          nom_role: true,
        },
      },
    },
  });

  return {
    id_user: user.id_user,
    email_user: user.email_user,
    nom_user: user.nom_user,
    prenom_user: user.prenom_user,
    tel_user: user.tel_user,
    role: user.role,
  };
}

/**
 * Met à jour la dernière connexion
 */
export async function updateLastLogin(userId: number): Promise<void> {
  await prisma.utilisateur.update({
    where: { id_user: userId },
    data: { derniere_connexion: new Date() },
  });
}

/**
 * Vérifie si un email existe déjà
 */
export async function emailExists(email: string): Promise<boolean> {
  const count = await prisma.utilisateur.count({
    where: { email_user: email },
  });
  return count > 0;
}

// ============================================================================
// PASSWORD RESET
// ============================================================================
/**
 * Crée un token de reset password
 */
export async function createPasswordResetToken(userId: number): Promise<string> {
  // Générer un token aléatoire
  const token = crypto.randomUUID() + "-" + Date.now();
  
  // Expiration dans 1 heure
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.passwordReset.create({
    data: {
      id_user: userId,
      token,
      expires_at: expiresAt,
      used: false,
    },
  });

  return token;
}

/**
 * Vérifie un token de reset password
 */
export async function verifyPasswordResetToken(
  token: string
): Promise<number | null> {
  const reset = await prisma.passwordReset.findUnique({
    where: { token },
  });

  if (!reset) return null;
  if (reset.used) return null;
  if (reset.expires_at < new Date()) return null;

  return reset.id_user;
}

/**
 * Met à jour le mot de passe et marque le token comme utilisé
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<boolean> {
  const userId = await verifyPasswordResetToken(token);
  if (!userId) return false;

  const hashedPassword = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.utilisateur.update({
      where: { id_user: userId },
      data: { mot_de_passe: hashedPassword },
    }),
    prisma.passwordReset.update({
      where: { token },
      data: { used: true },
    }),
  ]);

  return true;
}