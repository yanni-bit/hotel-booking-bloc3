// Next.js déclare les modules CSS (*.module.css, *.module.scss) dans
// node_modules/next/types/global.d.ts, mais pas les feuilles de style importées
// pour leur seul effet de bord. Cette déclaration complète le manque et évite
// que l'éditeur signale `import "./globals.css"` comme module introuvable.
declare module "*.css";