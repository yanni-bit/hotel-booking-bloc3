import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"
import { AuthProvider } from "@modules/auth/components/AuthProvider"

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="fr" data-mode="light">
      <body>
        <AuthProvider>
          <main className="relative">{props.children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}