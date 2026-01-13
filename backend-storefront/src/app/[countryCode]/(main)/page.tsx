import { Metadata } from "next"
import Hero from "@modules/home/components/hero"
import Offres from "@modules/home/components/offres"
import Destinations from "@modules/home/components/destinations"
import Criteres from "@modules/home/components/criteres"
import Separator from "@modules/home/components/separator"

export const metadata: Metadata = {
  title: "Book Your Travel - Réservation d'hôtels",
  description: "Réservez votre hôtel parmi les meilleures destinations du monde",
}

export default function Home() {
  return (
    <>
      <Hero />
      <Offres />
      <Separator />
      <Destinations />
      <Separator />
      <Criteres />
    </>
  )
}