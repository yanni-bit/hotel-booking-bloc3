import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "./globals.css"
import { AuthProvider } from "@modules/auth/components/AuthProvider"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
  title: {
    default: "Hotel Booking",
    template: "%s | Hotel Booking",
  },
  description: "Réservez votre hôtel en ligne parmi plus de 100 établissements.",
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          {/* id + tabIndex : cible du lien d'évitement (.skip-link) du header */}
          <main id="main-content" tabIndex={-1} className="relative outline-none">
            {props.children}
          </main>
        </AuthProvider>
      </body>
    </html>
  )
}
