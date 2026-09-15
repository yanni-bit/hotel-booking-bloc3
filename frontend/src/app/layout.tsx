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
          <main className="relative">{props.children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}