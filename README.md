# Hotel Booking – Application de réservation en ligne

> Application web de réservation d'hôtels développée avec Next.js 15 (React), Prisma et PostgreSQL.
> Projet réalisé dans le cadre du **Bloc 3 – Framework** de la certification Développeur Web.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2F17-336791)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC)

## Description

Book Your Travel est une plateforme de réservation d'hôtels : recherche par destination, fiche hôtel détaillée, choix d'une chambre et d'une offre, services additionnels, paiement par carte (Stripe, mode test), espace client et administration.

Le projet reprend le périmètre fonctionnel du Bloc 2 (Angular + Node.js + MySQL) et le réimplémente avec un framework React full-stack : Next.js fournit à la fois le rendu des pages (App Router, Server Components) et l'API (Route Handlers) qui interroge PostgreSQL via Prisma.

## Stack technique

| Couche | Technologie | Rôle |
|---|---|---|
| Framework | Next.js 15 (App Router, Turbopack) | Pages, routage, API Routes, middleware |
| UI | React 19, TypeScript 5, Tailwind CSS 3.4 | Composants, typage, styles |
| Données | Prisma 6, PostgreSQL 16/17 | ORM, schéma versionné (migrations), base relationnelle |
| Auth | jose (JWT), bcryptjs, cookies HttpOnly | Sessions sécurisées, rôles admin / prestataire / client |
| Paiement | Stripe (Payment Intents, mode test) | Paiement par carte |
| Emails | Nodemailer (Gmail) | Bienvenue, confirmation, annulation, réinitialisation |

## Fonctionnalités

### Côté client
- Recherche d'hôtels par destination, dates et voyageurs ; liste paginée avec filtres
- Fiche hôtel à 5 onglets : description, chambres & offres, équipements, avis, localisation
- Réservation avec services additionnels et calcul du total en temps réel
- Paiement Stripe et numéro de confirmation
- Compte utilisateur : inscription, connexion, profil, mot de passe oublié, mes réservations (annulation)
- Emails transactionnels
- Design responsive, bouton d'accessibilité (police dyslexie)

### Côté administration (`/fr/admin`, rôle admin)
- Tableau de bord : compteurs et dernières réservations
- Hôtels : liste paginée, recherche, fiche avec édition en place, suppression protégée
- Réservations : liste, filtre par statut, changement de statut en ligne, fiche détaillée (séjour, montants, client, paiement)
- Utilisateurs : liste, filtre par rôle, changement de rôle, activation/désactivation, fiche (réservations, avis), suppression protégée

## Architecture

```
frontend/
├── prisma/
│   ├── schema.prisma              # Modèle de données (18 tables)
│   ├── migrations/                # Migrations SQL versionnées
│   ├── hotel_booking_postgres.sql # Dump d'origine (Bloc 2, converti MySQL → PostgreSQL)
│   ├── import_data.sql            # Import des données (102 hôtels, 408 chambres, 1 320 offres, 472 avis)
│   └── seed.ts                    # Destinations et images (idempotent)
├── public/images/                 # Photos hôtels, destinations, logo
└── src/
    ├── middleware.ts              # Préfixe /fr + guards d'authentification (équivalent CanActivate)
    ├── app/
    │   ├── [countryCode]/
    │   │   ├── (main)/            # Site public : accueil, hôtels, réservation, paiement, compte…
    │   │   └── (admin)/admin/     # Administration (layout dédié, barre latérale)
    │   └── api/                   # Route Handlers = backend
    │       ├── auth/              # login, register, me, logout, profil, mot de passe
    │       ├── hotels/, offres/, chambres/, destinations/
    │       ├── reservations/, create-payment-intent/, contact/
    │       └── admin/             # hotels, reservations, users (rôle admin requis)
    ├── lib/                       # Accès données (Prisma), auth, Stripe, emails
    └── modules/                   # Composants React par domaine (home, hotel-detail, booking, admin…)
```

Principe : les pages qui affichent des données sont des **Server Components** (lecture Prisma directe, HTML rendu côté serveur, peu de JavaScript envoyé) ; les composants interactifs (formulaires, tableaux admin) sont des **Client Components** qui appellent l'API en `fetch` sans rechargement de page.

## Installation

### Prérequis
- Node.js 20+
- PostgreSQL 16 ou 17
- Un compte Stripe (clés de test) et un mot de passe d'application Gmail pour les emails

### 1. Base de données
```sql
CREATE USER hotel_user WITH PASSWORD 'votre_mot_de_passe';
CREATE DATABASE hotel_booking_db OWNER hotel_user;
```

### 2. Variables d'environnement
Dans `frontend/`, créer deux fichiers (voir `prisma/README.md` pour le détail) :

`.env` — lu par le CLI Prisma
```env
DATABASE_URL="postgresql://hotel_user:votre_mot_de_passe@localhost:5432/hotel_booking_db?schema=public"
```

`.env.local` — lu par Next.js
```env
NEXT_PUBLIC_BASE_URL=http://localhost:8000
DATABASE_URL="postgresql://hotel_user:votre_mot_de_passe@localhost:5432/hotel_booking_db?schema=public"
JWT_SECRET=une_chaine_longue_et_aleatoire
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
GMAIL_USER=adresse@gmail.com
GMAIL_APP_PASSWORD=mot_de_passe_application
```

### 3. Installation et données
```bash
cd frontend
npm install
npx prisma migrate deploy                                   # crée les tables
psql -U postgres -d hotel_booking_db -f prisma/import_data.sql   # importe les données
npx prisma db seed                                          # destinations + images
npm run dev                                                 # → http://localhost:8000
```

Pour accéder à l'administration, passer un compte en rôle admin :
```sql
UPDATE utilisateur SET id_role = 1 WHERE email_user = 'votre@email';
```

## Base de données

| Table | Enregistrements |
|---|---|
| Hôtels | 102 |
| Chambres | 408 |
| Offres | 1 320 |
| Avis | 472 |
| Destinations | 12 |

## Scripts

| Commande | Action |
|---|---|
| `npm run dev` | Serveur de développement (port 8000) |
| `npm run build` | Build de production |
| `npm start` | Serveur de production |
| `npm run lint` | ESLint |
| `npx prisma studio` | Interface visuelle de la base |

## Historique du projet

- **Bloc 1** – Front HTML/CSS/JS responsive et accessible
- **Bloc 2** – Backend Node.js sans framework + MySQL, front Angular (« Book Your Travel »)
- **Bloc 3** – Première itération sur un starter headless (Medusa.js), puis simplification vers un projet Next.js pur : une seule application, une seule base, une seule authentification. L'historique Git conserve les deux étapes.

## Contexte

Projet réalisé pour la validation du **Bloc 3 – Framework** (certification Développeur Web, Ilaria Digital School).

## Licence

Projet pédagogique – tous droits réservés.