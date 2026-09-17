// src/app/[countryCode]/(main)/a-propos/page.tsx
// ============================================================================
// Page "À propos du projet" : site de démonstration (Bloc 3 – Framework).
// Sert de mode d'emploi pour le jury et de page d'information pour tout
// visiteur (comptes de test, carte Stripe, FAQ, mentions légales).
// Server Component statique : aucune donnée, aucun état.
// ============================================================================

import { Metadata } from "next"
import Link from "next/link"
import { FaGraduationCap, FaFlask, FaQuestionCircle, FaBalanceScale, FaExternalLinkAlt } from "react-icons/fa"

export const metadata: Metadata = {
  title: "À propos du projet",
  description:
    "Book Your Travel est un site de démonstration réalisé dans le cadre d'une certification Développeur Web (Bloc 3 – Framework). Aucune réservation réelle.",
}

const DEMO_ACCOUNTS = [
  { role: "Client", email: "demo.client@bookyourtravel.fr" },
  { role: "Administrateur", email: "demo.admin@bookyourtravel.fr" },
]
const DEMO_PASSWORD = "Demo2026!"

const FAQ = [
  {
    q: "Les réservations sont-elles réelles ?",
    a: "Non. Les hôtels, les prix et les avis sont des données fictives ; aucun hôtel ne recevra votre réservation et aucun paiement réel n'est effectué.",
  },
  {
    q: "Comment fonctionne le paiement ?",
    a: "Le paiement passe par Stripe en mode test. Seules les cartes de test Stripe sont acceptées (voir « Comment tester »). Aucune donnée bancaire ne transite par nos serveurs.",
  },
  {
    q: "Puis-je annuler une réservation ?",
    a: "Oui, depuis « Mes réservations », tant que la date limite d'annulation gratuite n'est pas dépassée. Un email de confirmation d'annulation est envoyé.",
  },
  {
    q: "Vais-je recevoir des emails ?",
    a: "Oui : bienvenue à l'inscription, confirmation et annulation de réservation, réinitialisation de mot de passe. Ils sont envoyés depuis une adresse de test.",
  },
  {
    q: "Que deviennent mes données ?",
    a: "Elles servent uniquement au fonctionnement de la démonstration et peuvent être effacées à tout moment lors d'une réinitialisation de la base. Vous pouvez supprimer votre compte depuis votre profil.",
  },
]

const SECTIONS = [
  ["#projet", "Le projet"],
  ["#tester", "Comment tester"],
  ["#faq", "Questions fréquentes"],
  ["#mentions", "Mentions légales"],
]

interface AProposPageProps {
  params: Promise<{ countryCode: string }>
}

export default async function AProposPage({ params }: AProposPageProps) {
  const { countryCode } = await params

  return (
    <div className="content-container py-10 max-w-4xl">
      {/* En-tête */}
      <header className="mb-10">
        <p className="inline-block px-3 py-1 rounded-full bg-turquoise-light text-turquoise text-sm font-medium mb-3">
          Site de démonstration
        </p>
        <h1 className="text-3xl font-bold text-gris-fonce mb-3">À propos du projet</h1>
        <p className="text-gris-moyen">
          Book Your Travel est une application de réservation d&apos;hôtels réalisée dans le cadre d&apos;une
          certification Développeur Web. Rien ici n&apos;est réel : ni les hôtels, ni les prix, ni les paiements.
        </p>
      </header>

      {/* Navigation interne */}
      <nav aria-label="Sections de la page" className="flex flex-wrap gap-2 mb-10 text-sm">
        {SECTIONS.map(([href, label]) => (
          <a
            key={href}
            href={href}
            className="px-3 py-1.5 rounded-rounded border border-gray-200 bg-white hover:border-turquoise hover:text-turquoise"
          >
            {label}
          </a>
        ))}
      </nav>

      {/* 1. Le projet */}
      <section id="projet" className="mb-12 scroll-mt-24">
        <h2 className="flex items-center gap-3 text-xl font-semibold text-gris-fonce mb-4">
          <FaGraduationCap className="text-turquoise" aria-hidden="true" /> Le projet
        </h2>
        <div className="bg-white rounded-rounded border border-gray-200 p-5 space-y-3 text-gris-fonce">
          <p>
            Ce site est le livrable du <strong>Bloc 3 – Framework</strong> d&apos;une certification Développeur Web
            (Ilaria Digital School). Il reprend le périmètre fonctionnel du projet des blocs précédents et le
            réimplémente avec un framework React full-stack.
          </p>
          <p>
            <strong>Stack :</strong> Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Prisma,
            PostgreSQL, Stripe (mode test), Nodemailer. Hébergé sur Vercel, base de données sur Neon.
          </p>
          <p>
            <strong>Données :</strong> 102 hôtels dans 12 destinations, 408 chambres, 1 320 offres, 472 avis,
            toutes fictives.
          </p>
          <p>
            <a
              href="https://github.com/yanni-bit/hotel-booking-bloc3"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-turquoise hover:underline"
            >
              Code source sur GitHub <FaExternalLinkAlt className="w-3 h-3" aria-hidden="true" />
            </a>
          </p>
        </div>
      </section>

      {/* 2. Comment tester */}
      <section id="tester" className="mb-12 scroll-mt-24">
        <h2 className="flex items-center gap-3 text-xl font-semibold text-gris-fonce mb-4">
          <FaFlask className="text-turquoise" aria-hidden="true" /> Comment tester
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-rounded border border-gray-200 p-5">
            <h3 className="font-semibold text-gris-fonce mb-3">Comptes de démonstration</h3>
            <ul className="space-y-2 text-sm">
              {DEMO_ACCOUNTS.map((a) => (
                <li key={a.email}>
                  <span className="font-medium text-gris-fonce">{a.role}</span>
                  <span className="block font-mono text-xs text-gris-moyen">{a.email}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm text-gris-moyen">
              Mot de passe : <span className="font-mono text-gris-fonce">{DEMO_PASSWORD}</span>
            </p>
            <Link
              href={`/${countryCode}/login`}
              className="inline-block mt-4 px-4 py-2 rounded-rounded bg-turquoise text-white text-sm hover:bg-turquoise-hover"
            >
              Se connecter
            </Link>
          </div>
          <div className="bg-white rounded-rounded border border-gray-200 p-5">
            <h3 className="font-semibold text-gris-fonce mb-3">Carte bancaire de test</h3>
            <p className="text-sm text-gris-moyen mb-2">Paiement Stripe en mode test, aucune carte réelle acceptée :</p>
            <dl className="text-sm space-y-1">
              <div className="flex justify-between"><dt className="text-gris-moyen">Numéro</dt><dd className="font-mono">4242 4242 4242 4242</dd></div>
              <div className="flex justify-between"><dt className="text-gris-moyen">Expiration</dt><dd className="font-mono">toute date future</dd></div>
              <div className="flex justify-between"><dt className="text-gris-moyen">CVC</dt><dd className="font-mono">3 chiffres</dd></div>
            </dl>
            <p className="mt-3 text-xs text-gris-moyen">
              Pour simuler un refus : <span className="font-mono">4000 0000 0000 0002</span>
            </p>
          </div>
        </div>
        <div className="mt-4 bg-white rounded-rounded border border-gray-200 p-5">
          <h3 className="font-semibold text-gris-fonce mb-3">Parcours conseillé</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gris-fonce">
            <li>Rechercher une destination depuis l&apos;accueil, ouvrir un hôtel et ses onglets</li>
            <li>Choisir une chambre, une offre et des services additionnels</li>
            <li>Se connecter avec le compte client, payer avec la carte de test, recevoir la confirmation</li>
            <li>Retrouver la réservation dans « Mes réservations »</li>
            <li>Se connecter avec le compte administrateur : tableau de bord, hôtels, réservations, utilisateurs</li>
          </ol>
        </div>
      </section>

      {/* 3. FAQ */}
      <section id="faq" className="mb-12 scroll-mt-24">
        <h2 className="flex items-center gap-3 text-xl font-semibold text-gris-fonce mb-4">
          <FaQuestionCircle className="text-turquoise" aria-hidden="true" /> Questions fréquentes
        </h2>
        <div className="bg-white rounded-rounded border border-gray-200 divide-y divide-gray-100">
          {FAQ.map((item) => (
            <details key={item.q} className="group p-5">
              <summary className="cursor-pointer font-medium text-gris-fonce list-none flex justify-between items-center">
                {item.q}
                <span className="text-turquoise transition-transform group-open:rotate-45" aria-hidden="true">+</span>
              </summary>
              <p className="mt-3 text-sm text-gris-moyen">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* 4. Mentions légales */}
      <section id="mentions" className="scroll-mt-24">
        <h2 className="flex items-center gap-3 text-xl font-semibold text-gris-fonce mb-4">
          <FaBalanceScale className="text-turquoise" aria-hidden="true" /> Mentions légales &amp; données
        </h2>
        <div className="bg-white rounded-rounded border border-gray-200 p-5 space-y-3 text-sm text-gris-fonce">
          <p>
            <strong>Éditeur :</strong> projet pédagogique, sans activité commerciale. Aucun service de réservation
            n&apos;est réellement fourni.
          </p>
          <p>
            <strong>Hébergement :</strong> Vercel Inc. (application) et Neon Inc. (base de données, région UE –
            Francfort).
          </p>
          <p>
            <strong>Données personnelles :</strong> les informations saisies (nom, email, réservations) ne servent
            qu&apos;au fonctionnement de la démonstration, ne sont ni vendues ni transmises, et peuvent être supprimées
            à tout moment depuis votre profil ou par réinitialisation de la base. Les mots de passe sont stockés
            hachés (bcrypt).
          </p>
          <p>
            <strong>Paiements :</strong> Stripe en mode test uniquement ; aucune donnée bancaire n&apos;est traitée ni
            conservée par ce site.
          </p>
          <p>
            <strong>Contenus :</strong> noms d&apos;hôtels, descriptions et avis sont fictifs ; les photos sont utilisées
            à des fins d&apos;illustration.
          </p>
        </div>
      </section>
    </div>
  )
}
