# 🏨 HotelBooking - Application de Réservation en Ligne

> Application web de réservation d'hôtels développée avec Medusa.js et Next.js


## 📋 Description

HotelBooking est une plateforme moderne de réservation d'hôtels construite sur une architecture headless. Elle utilise Medusa.js comme backend e-commerce et Next.js pour le frontend.

## ✨ Fonctionnalités

### Côté Client
- 🔍 Recherche d'hôtels par destination, dates et critères
- 🏠 Affichage détaillé des hôtels (photos, équipements, localisation)
- ⭐ Système d'avis et notes
- 💳 Processus de réservation et paiement
- 👤 Gestion du profil utilisateur
- 📱 Interface responsive (mobile/desktop)
- 💱 Support multi-devises

### Côté Administration
- 📊 Dashboard Medusa Admin
- 🏨 Gestion des hôtels et chambres
- 📅 Suivi des réservations
- 👥 Gestion des utilisateurs
- 💬 Gestion des avis et messages

## 🛠️ Stack Technique

### Frontend
- **Framework** : Next.js 14+
- **Langage** : TypeScript
- **Styles** : SCSS / Tailwind CSS
- **State Management** : React Hooks

### Backend
- **Plateforme** : Medusa.js 2.0+
- **Base de données** : PostgreSQL
- **Cache** : Redis

## 🚀 Installation

### Prérequis
- Node.js 18+
- npm ou yarn
- PostgreSQL
- Redis

### Backend (Medusa)
```bash
cd backend
npm install
npx medusa migrations run
npm run dev
```

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```

## ⚙️ Configuration

### Backend `.env`
```env
DATABASE_URL=postgres://...
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
COOKIE_SECRET=your_cookie_secret
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
```

## 📝 Documentation

La documentation complète du projet est disponible dans le fichier `Projet_3___Application_Web_de_Re_servation_en_Ligne.pdf`

## 📄 Licence

*À définir*

---

⚠️ **Note** : Ce projet est en cours de développement actif.