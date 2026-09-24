# Rapports Lighthouse — 24 septembre 2026

Mesures effectuées sur le site déployé (https://hotel-booking-bloc3.vercel.app)
via PageSpeed Insights, en conditions réelles : le serveur Vercel répond depuis
Francfort, la base PostgreSQL est celle de production.

Chaque rapport est un fichier HTML autonome : il s'ouvre dans un navigateur sans
connexion, et affiche le détail de chaque audit.

---

## Pourquoi un avant / après

Les fichiers `avant` ont été mesurés à 16 h 00, les fichiers `apres` à 16 h 43,
entre les deux se trouve le commit `41932e5`. Trois défauts ont été corrigés
dans cet intervalle :

1. **Hiérarchie des titres** (`heading-order`) — les noms d'hôtels des cartes de
   résultats étaient en `<h3>` alors que la page passe du `<h1>` directement à
   ce niveau. Correction : `<h2>` dans `HotelCard.tsx`.

2. **Cibles tactiles** (`target-size`) — les liens de la barre inférieure du
   footer, en 13 px sans remplissage vertical, offraient une zone cliquable
   d'environ 20 px de haut. Correction : `min-h-[48px]` sur `.footer-bottom-link`.

3. **Description absente** (`meta-description`) — la page `/fr/hotels` dépend de
   `searchParams`, elle est donc rendue dynamiquement. Depuis Next.js 15, les
   métadonnées d'une page dynamique sont diffusées en fin de document plutôt que
   placées dans le `<head>`. Les moteurs de recherche exécutent le JavaScript et
   les trouvent ; Lighthouse analyse le HTML initial et ne les voyait pas.
   Correction : `htmlLimitedBots: /.*/` dans `next.config.ts`, qui rétablit un
   rendu bloquant des métadonnées.

---

## Scores

Ordre des valeurs : performance / accessibilité / bonnes pratiques / SEO

| Page            | Appareil | Avant            | Après             |
| --------------- | -------- | ---------------- | ----------------- |
| `/fr`           | mobile   | 100 / 93 / 100 / 100 | 99 / 96 / 100 / 100 |
| `/fr`           | desktop  | 98 / 96 / 100 / 100  | 99 / 96 / 100 / 100 |
| `/fr/hotels`    | mobile   | 99 / 91 / 100 / 92   | 98 / 96 / 100 / 100 |
| `/fr/hotels`    | desktop  | 100 / 95 / 100 / 92  | 100 / 96 / 100 / 100 |

Les variations d'un point en performance ne sont pas significatives : le score
est calculé à partir de mesures de temps, qui fluctuent d'une exécution à
l'autre sur une infrastructure partagée.

---

## Limite connue et assumée : le contraste des couleurs

Un seul audit reste en échec après correction, sur les quatre rapports :
`color-contrast`. Il provient de la charte graphique, reprise du projet Bloc 2
pour assurer la continuité visuelle entre les deux rendus.

Paires de couleurs signalées, par nombre d'occurrences :

| Ratio | Texte     | Fond      | Usage                                      |
| ----- | --------- | --------- | ------------------------------------------ |
| 1,99  | `#ffffff` | `#5fc8c2` | texte blanc sur turquoise (boutons, badges) |
| 1,99  | `#5fc8c2` | `#ffffff` | liens turquoise sur fond blanc              |
| 2,53  | `#9ca3af` | `#ffffff` | mentions secondaires en gris clair          |
| 1,63  | `#ffffff` | `#d6c8c0` | texte blanc sur beige (bandeau supérieur)   |
| 1,81  | `#5fc8c2` | `#f3f4f6` | liens turquoise sur fond gris très clair    |

Le seuil WCAG 2.1 niveau AA est de 4,5:1 pour le texte courant et 3:1 pour le
texte de grande taille. Le turquoise `#5fc8c2` plafonne à 1,99:1 avec du blanc :
aucun ajustement mineur ne le rendrait conforme, il faudrait assombrir la
couleur d'identité elle-même.

**Arbitrage retenu :** conserver la charte. Le choix est documenté plutôt que
subi. Une mise en conformité supposerait de redéfinir la couleur principale
(un turquoise assombri vers `#2d7d78` atteindrait 4,5:1 avec du blanc), ce qui
modifierait l'identité visuelle de l'application.

Les autres critères d'accessibilité sont satisfaits : structure des titres,
attributs `alt`, libellés de formulaires, rôles ARIA, navigation au clavier,
lien d'évitement vers le contenu principal, cibles tactiles.

---

## Reproduire les mesures

1. Ouvrir https://pagespeed.web.dev
2. Saisir l'URL à auditer
3. Le rapport couvre mobile et desktop ; l'export HTML se fait depuis le menu
   en haut à droite du rapport

Les mesures doivent porter sur le site déployé, pas sur `localhost` : le serveur
de développement n'est pas optimisé et les scores obtenus en local n'ont aucune
valeur comparative.
