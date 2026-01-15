# 🏨 Hotel Booking - Application de Réservation en Ligne

> Application web headless de réservation d'hôtels développée avec Medusa.js et Next.js

![Status](https://img.shields.io/badge/status-en%20développement-yellow)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Medusa](https://img.shields.io/badge/Medusa.js-2.0-purple)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC)

## 📋 Description

Plateforme moderne de réservation d'hôtels construite sur une architecture **headless e-commerce**. Projet réalisé dans le cadre du **Bloc 3 (Framework)** de la certification Développeur Web.

## 🛠️ Stack Technique

### Frontend
| Technologie | Version | Usage |
|-------------|---------|-------|
| Next.js | 15 | Framework React (App Router) |
| React | 18+ | UI Components |
| TypeScript | 5+ | Typage statique |
| Tailwind CSS | 3.4.19 | Styling utilitaire |
| Medusa Storefront | - | Template e-commerce |

### Backend
| Technologie | Version | Usage |
|-------------|---------|-------|
| Medusa.js | 2.0 | Moteur e-commerce headless |
| Node.js | 18+ | Runtime JavaScript |
| Prisma | 6 | ORM / Query Builder |

### Base de données
| Technologie | Version | Usage |
|-------------|---------|-------|
| PostgreSQL | 16 | Base de données relationnelle |
| Prisma Studio | - | Interface visuelle BDD |

### Cloud (Cible déploiement)
| Service | Usage |
|---------|-------|
| Google Cloud Platform | Infrastructure cloud |
| Cloud Run | Hébergement API |
| Cloud SQL | PostgreSQL managé |
| Cloud Storage | Stockage images |

## ✨ Fonctionnalités

### Côté Client
- 🔍 Recherche d'hôtels avec filtres (ville, dates, capacité)
- 🏨 Liste des hôtels avec pagination
- 📄 Détail hôtel (5 onglets : description, offres, équipements, avis, localisation)
- 📅 Réservation avec services additionnels et calcul dynamique
- 💳 Paiement sécurisé (validation Luhn)
- 👤 Espace utilisateur (profil, mes réservations)
- 💱 Support multi-devises
- 📱 Design responsive

### Côté Administration
- 📊 Dashboard administrateur
- 🏨 CRUD Hôtels et chambres
- 📅 Gestion des réservations
- 👥 Gestion des utilisateurs
- ⭐ Modération des avis

## 📁 Structure du Projet

```
hotel-booking-bloc3/
├── backend/                          # Backend Medusa (port 9000)
│   └── ...
│
└── backend-storefront/               # Frontend Next.js (port 8000)
    ├── prisma/
    │   ├── schema.prisma             # Schéma BDD
    │   ├── seed.ts                   # Données initiales
    │   └── migrations/               # Migrations SQL
    │
    ├── src/
    │   ├── app/
    │   │   ├── [countryCode]/
    │   │   │   └── (main)/
    │   │   │       ├── page.tsx              # Accueil
    │   │   │       ├── hotels/               # Pages hôtels
    │   │   │       └── booking/              # Pages réservation
    │   │   │
    │   │   └── api/                          # API Routes
    │   │       ├── hotels/
    │   │       ├── offres/
    │   │       ├── destinations/
    │   │       └── reservations/
    │   │
    │   ├── lib/                              # Utilitaires
    │   │   ├── prisma.ts
    │   │   ├── hotels.ts
    │   │   └── reservations.ts
    │   │
    │   └── modules/                          # Composants métier
    │       ├── home/
    │       ├── hotel-detail/
    │       └── layout/
    │
    └── public/                               # Assets statiques
```

## 🚀 Installation

### Prérequis
- Node.js 18+
- PostgreSQL 16
- npm ou yarn

### Backend (Medusa)
```bash
cd backend
npm install
npx medusa migrations run
npm run dev
# → http://localhost:9000
```

### Frontend (Next.js)
```bash
cd backend-storefront
npm install
npx prisma migrate dev
npm run dev
# → http://localhost:8000
```

## ⚙️ Configuration

### Backend `.env`
```env
DATABASE_URL=postgresql://user:password@localhost:5432/hotel_booking
JWT_SECRET=your_jwt_secret
COOKIE_SECRET=your_cookie_secret
```

### Frontend `.env.local`
```env
DATABASE_URL=postgresql://user:password@localhost:5432/hotel_booking
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
```

## 📊 Base de données

| Table | Enregistrements |
|-------|-----------------|
| Hôtels | 102 |
| Chambres | 408 |
| Offres | 1 320 |
| Avis | 472 |

## 🔧 Outils de développement

- VS Code
- Git / GitHub
- npm
- PowerShell
- Prisma Studio

## 📝 Documentation

La documentation complète du projet est disponible dans `Projet_3___Application_Web_de_Re_servation_en_Ligne.pdf`

## 🎯 Contexte

Projet réalisé pour :
- ✅ Validation du **Bloc 3 (Framework)** - Certification Développeur Web
- 🎯 Préparation au stage chez **NEBBIU** (partenaire Google Cloud, e-commerce B2B)

## 📄 Licence

*À définir*

---

⚠️ **Note** : Ce projet est en cours de développement actif.
