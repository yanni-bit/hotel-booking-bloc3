# 🏨 HotelBooking - Application de Réservation en Ligne

> Application web complète de réservation d'hôtels développée avec Angular et Node.js

![Status](https://img.shields.io/badge/status-en%20développement-yellow)
![Angular](https://img.shields.io/badge/Angular-18+-red)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)

## 📋 Description

HotelBooking est une plateforme moderne de réservation d'hôtels permettant aux utilisateurs de rechercher, comparer et réserver des hébergements. L'application comprend également un panneau d'administration complet pour la gestion des hôtels, réservations et utilisateurs.

## ✨ Fonctionnalités

### Côté Client
- 🔍 Recherche d'hôtels par destination, dates et critères
- 🏠 Affichage détaillé des hôtels (photos, équipements, localisation)
- ⭐ Système d'avis et notes
- 💳 Processus de réservation et paiement
- 👤 Gestion du profil utilisateur
- 📱 Interface responsive (mobile/desktop)

### Côté Administration
- 📊 Dashboard administrateur
- 🏨 Gestion des hôtels et chambres
- 📅 Suivi des réservations
- 👥 Gestion des utilisateurs
- 💬 Gestion des avis et messages
- 🛎️ Configuration des services

## 🛠️ Stack Technique

### Frontend
- **Framework** : Angular 18+
- **Styles** : SCSS
- **Architecture** : Components modulaires

### Backend
- **Runtime** : Node.js
- **Framework** : Express.js
- **Base de données** : MongoDB

## 📁 Structure du Projet

```
├── 📂 Frontend (Angular)
│   ├── Components (*.ts, *.html, *.scss)
│   ├── Services (auth_service, contact_service, currency_service)
│   ├── Models (hotel, reservation, avis, chambre)
│   └── Routes (app_routes.ts)
│
├── 📂 Backend (Node.js)
│   ├── Models (Hotel.js, User.js, Reservation.js, etc.)
│   ├── Routes (authRoutes, hotelRoutes, reservationRoutes, etc.)
│   └── server.js
│
└── 📂 Assets
    └── Maquettes et documentation PDF
```

## 🚀 Installation

### Prérequis
- Node.js 18+
- npm ou yarn
- MongoDB
- Angular CLI

### Installation du Frontend
```bash
cd frontend
npm install
ng serve
```

### Installation du Backend
```bash
cd backend
npm install
npm start
```

## ⚙️ Configuration

Créer un fichier `.env` à la racine du backend :
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

## 🖼️ Aperçu

*Screenshots à venir*

## 📝 Documentation

La documentation complète du projet est disponible dans le fichier `Projet_3___Application_Web_de_Re_servation_en_Ligne.pdf`

## 🤝 Contribution

Ce projet est actuellement en développement. Les contributions seront les bienvenues une fois la version stable publiée.

## 📄 Licence

*À définir*

---

⚠️ **Note** : Ce projet est en cours de développement actif. Certaines fonctionnalités peuvent être incomplètes ou sujettes à modifications.