# Hotel Booking – Application de réservation en ligne

> Application web de réservation d'hôtels développée avec Next.js 15 (React), Prisma et PostgreSQL.
> Projet réalisé dans le cadre du **Bloc 3 – Framework** de la certification Développeur Web.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![React](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2F17-336791)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC)

**Démonstration en ligne : https://hotel-booking-bloc3.vercel.app**

## Description

Book Your Travel est une plateforme de réservation d'hôtels : recherche par destination, fiche hôtel détaillée, choix d'une chambre et d'une offre, services additionnels, paiement par carte (Stripe, mode test), espace client et administration.

Le projet reprend le périmètre fonctionnel du Bloc 2 (Angular + Node.js + MySQL) et le réimplémente avec un framework React full-stack : Next.js fournit à la fois le rendu des pages (App Router, Server Components) et l'API (Route Handlers) qui interroge PostgreSQL via Prisma.

## Essayer l'application

Deux comptes de démonstration sont disponibles sur le site en ligne, mot de passe commun `Demo2026!` :

| Compte | Rôle | Accès |
|---|---|---|
| `demo.client@bookyourtravel.fr` | client | réservation, profil, mes réservations |
| `demo.admin@bookyourtravel.fr` | administrateur | back-office complet |

Carte de test Stripe : `4242 4242 4242 4242`, date future, CVC au choix.

La page [/fr/a-propos](https://hotel-booking-bloc3.vercel.app/fr/a-propos) détaille le parcours conseillé et répond aux questions courantes.

## Stack technique

| Couche | Technologie | Rôle |
|---|---|---|
| Framework | Next.js 15 (App Router, Turbopack) | Pages, routage, API Routes, middleware |
| UI | React 19, TypeScript 5, Tailwind CSS 3.4 | Composants, typage, styles |
| Données | Prisma 6, PostgreSQL 16/17 | ORM, schéma versionné (migrations), base relationnelle |
| Auth | jose (JWT), bcryptjs, cookies HttpOnly | Sessions sécurisées, rôles admin / prestataire / client |
| Paiement | Stripe (Payment Intents, mode test) | Paiement par carte |
| Emails | Nodemailer (Gmail) | Bienvenue, confirmation, annulation, réinitialisation |
| Tests | Jest, React Testing Library | 58 tests, 9 suites |
| Hébergement | Vercel (application), Neon (base, Francfort) | Déploiement automatique sur push |

## Fonctionnalités

### Côté client
- Recherche d'hôtels par destination, dates et voyageurs ; liste paginée avec filtres
- Fiche hôtel à 5 onglets : description, chambres & offres, équipements, avis, localisation
- Réservation avec contrôle de disponibilité, services additionnels et calcul du total en temps réel
- Paiement Stripe et numéro de confirmation
- Compte utilisateur : inscription, connexion, profil, mot de passe oublié, mes réservations (annulation)
- Emails transactionnels
- Design responsive, bouton d'accessibilité (police dyslexie)

### Côté administration (`/fr/admin`, rôle admin)
- Tableau de bord : compteurs et dernières réservations
- Hôtels : liste paginée, recherche, création, fiche avec édition en place, suppression protégée
- Réservations : liste, filtre par statut, changement de statut en ligne, fiche détaillée (séjour, montants, client, paiement)
- Utilisateurs : liste, filtre par rôle, changement de rôle, activation/désactivation, fiche (réservations, avis), suppression protégée

## Architecture

```
frontend/
├── prisma/
│   ├── schema.prisma              # Modèle de données (20 tables)
│   ├── migrations/                # 5 migrations SQL versionnées
│   ├── hotel_booking_postgres.sql # Dump d'origine (Bloc 2, converti MySQL → PostgreSQL)
│   ├── import_data.sql            # Import des données (102 hôtels, 408 chambres, 1 320 offres, 472 avis)
│   └── seed.ts                    # Destinations et images (idempotent)
├── docs/
│   └── lighthouse/                # Rapports Lighthouse avant / après optimisation
├── public/images/                 # Photos hôtels, destinations, logo
└── src/
    ├── middleware.ts              # Préfixe /fr + guards d'authentification (équivalent CanActivate)
    ├── app/
    │   ├── [countryCode]/
    │   │   ├── (main)/            # Site public : accueil, hôtels, réservation, paiement, compte…
    │   │   └── (admin)/admin/     # Administration (layout dédié, barre latérale)
    │   └── api/                   # 29 Route Handlers = backend
    │       ├── auth/              # login, register, me, logout, profil, mot de passe
    │       ├── hotels/, offres/, chambres/, destinations/
    │       ├── reservations/, create-payment-intent/, contact/
    │       └── admin/             # hotels, reservations, users (rôle admin requis)
    ├── lib/                       # Accès données (Prisma), auth, Stripe, emails
    └── modules/                   # Composants React par domaine (home, hotel-detail, booking, admin…)
```

Principe : les pages qui affichent des données sont des **Server Components** (lecture Prisma directe, HTML rendu côté serveur, peu de JavaScript envoyé) ; les composants interactifs (formulaires, tableaux admin) sont des **Client Components** qui appellent l'API en `fetch` sans rechargement de page.

Le `matcher` du middleware **exclut `/api`** : chaque Route Handler vérifie la session lui-même, via `getCurrentUser()` ou `requireAdmin()`. Le middleware filtre des URL, il ne protège pas des données.

## Documentation

Les rapports de mesure sont dans [`frontend/docs/lighthouse/`](frontend/docs/lighthouse/) : les audits Lighthouse avant et après optimisation, et l'analyse détaillée des contrastes de couleur.

La documentation technique, le schéma de base de données et le guide utilisateur sont en cours de rédaction et rejoindront `frontend/docs/`.

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

Les deux fichiers coexistent volontairement : maintenir `.env` sur la base locale garantit qu'une commande Prisma lancée par inadvertance ne peut pas atteindre la base de production.

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

20 tables, 25 relations, 5 migrations versionnées. Le schéma complet est décrit dans `frontend/prisma/schema.prisma`.

| Table | Enregistrements |
|---|---|
| Hôtels | 102 |
| Chambres | 408 |
| Offres | 1 320 |
| Avis | 472 |
| Images de chambres | 1 224 |
| Destinations | 12 |

## Qualité

Mesures Lighthouse sur le site déployé, ordre des valeurs : performance / accessibilité / bonnes pratiques / SEO.

| Page | Mobile | Bureau |
|---|---|---|
| `/fr` | 99 / 96 / 100 / 100 | 99 / 96 / 100 / 100 |
| `/fr/hotels` | 98 / 96 / 100 / 100 | 100 / 96 / 100 / 100 |

Un seul audit reste en échec, le contraste de la charte graphique : arbitrage assumé, documenté et chiffré dans `docs/lighthouse/README.md`.

58 tests unitaires (Jest + React Testing Library) répartis en 9 suites couvrent `src/lib` et `src/modules`.

## Scripts

| Commande | Action |
|---|---|
| `npm run dev` | Serveur de développement (port 8000) |
| `npm run build` | Build de production |
| `npm start` | Serveur de production |
| `npm run lint` | ESLint |
| `npm test` | Tests unitaires |
| `npm run test:coverage` | Tests avec rapport de couverture |
| `npx prisma studio` | Interface visuelle de la base |

## Historique du projet

- **Bloc 1** – Front HTML/CSS/JS responsive et accessible
- **Bloc 2** – Backend Node.js sans framework + MySQL, front Angular (« Book Your Travel »)
- **Bloc 3** – Première itération sur un starter headless (Medusa.js), puis simplification vers un projet Next.js pur : une seule application, une seule base, une seule authentification. L'historique Git conserve les deux étapes.

## Contexte

Projet réalisé pour la validation du **Bloc 3 – Framework** (certification Développeur Web, Ilaria Digital School).

## Licence

Projet pédagogique – tous droits réservés.