// tri-commentaires.mjs
// Retire les blocs de commentaire « Différence Angular → … » qui ne font que
// traduire une syntaxe d'un framework à l'autre. Conserve les quatre blocs qui
// documentent un choix technique réel (liste GARDER ci-dessous).
//
// Usage : node tri-commentaires.mjs [--ecrire]
// Sans --ecrire, affiche seulement ce qui serait retiré.

import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs"
import { join, relative } from "node:path"

const RACINE = "src"
const ECRIRE = process.argv.includes("--ecrire")

// Un bloc contenant l'une de ces phrases est conservé
const GARDER = [
  "vulnérable XSS",            // lib/auth.ts — justification du cookie HttpOnly
  "matcher excluant /api",     // api/reservations/route.ts — pourquoi chaque route vérifie la session
  "AdminGuard (CanActivate)",  // lib/admin.ts — raison d'être de requireAdmin()
  "Context + Hook useAuth()",  // AuthProvider.tsx — mécanisme de session côté client
]

const MARQUEUR = /Différence Angular/

function fichiers(dir) {
  const out = []
  for (const e of readdirSync(dir)) {
    const p = join(dir, e)
    if (statSync(p).isDirectory()) out.push(...fichiers(p))
    else if (/\.tsx?$/.test(p)) out.push(p)
  }
  return out
}

/** Contenu d'une ligne de commentaire, ou null si ce n'en est pas une. */
function contenuCommentaire(ligne) {
  const t = ligne.trim()
  let m
  if ((m = t.match(/^\{\/\*\s?(.*?)\s*\*\/\}$/))) return m[1]
  if ((m = t.match(/^\/\/\s?(.*)$/))) return m[1]
  if ((m = t.match(/^\*\s?(.*)$/))) return m[1]
  return null
}

/** La ligne prolonge-t-elle le bloc en cours ? */
function prolonge(ligne) {
  const c = contenuCommentaire(ligne)
  if (c === null) return false
  if (/^=+$/.test(c.trim())) return false          // séparateur : on s'arrête
  if (/Angular|React|Next\.js/.test(c)) return true
  if (/^\s{2,}\S/.test(c)) return true             // continuation indentée
  if (/^-\s/.test(c.trim())) return true           // puce
  return false
}

let blocsRetires = 0
let blocsGardes = 0
const rapport = []

for (const f of fichiers(RACINE)) {
  const chemin = relative(".", f).replace(/\\/g, "/")
  const lignes = readFileSync(f, "utf8").split("\n")
  const sortie = []
  let modifie = false

  for (let i = 0; i < lignes.length; i++) {
    const c = contenuCommentaire(lignes[i])

    if (c === null || !MARQUEUR.test(c)) {
      sortie.push(lignes[i])
      continue
    }

    // Délimiter le bloc
    let fin = i + 1
    while (fin < lignes.length && prolonge(lignes[fin])) fin++
    const bloc = lignes.slice(i, fin)
    const texte = bloc.join("\n")

    if (GARDER.some((p) => texte.includes(p))) {
      blocsGardes++
      sortie.push(...bloc)
      i = fin - 1
      continue
    }

    rapport.push(`${chemin}:${i + 1}  (${bloc.length} lignes)\n` +
      bloc.map((l) => `    ${l.trim()}`).join("\n"))
    blocsRetires++
    modifie = true

    // Retirer aussi une ligne de commentaire vide laissée juste avant ou après
    if (sortie.length && /^(\/\/|\*|)\s*$/.test(contenuCommentaire(sortie[sortie.length - 1]) ?? "x")) {
      const precedent = contenuCommentaire(sortie[sortie.length - 1])
      if (precedent !== null && precedent.trim() === "") sortie.pop()
    }
    i = fin - 1
  }

  if (modifie && ECRIRE) writeFileSync(f, sortie.join("\n"), "utf8")
}

console.log(rapport.join("\n\n"))
console.log(`\n${blocsRetires} bloc(s) ${ECRIRE ? "retirés" : "à retirer"}, ${blocsGardes} conservé(s).`)
if (!ECRIRE) console.log("Relancer avec --ecrire pour appliquer.")
