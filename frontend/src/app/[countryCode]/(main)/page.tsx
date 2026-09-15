// app/[countryCode]/(main)/page.tsx

import Hero from "@modules/home/components/hero/hero"
import Offres from "@modules/home/components/offres/offres"
import Destinations from "@modules/home/components/destinations/destinations"
import Criteres from "@modules/home/components/criteres/criteres"
import Separator from "@modules/home/components/separator/separator"
import { getDestinations } from "@lib/hotels" // 1. On importe ta fonction

export default async function Home() {
  // 2. On récupère les vraies données de PostgreSQL (limité à 8 par exemple)
  const realDestinations = await getDestinations()

  return (
    <>
      <Hero />
      <Offres />
      <Separator />
      {/* 3. On envoie les données au composant destinations */}
      <Destinations destinations={realDestinations} /> 
      <Separator />
      <Criteres />
    </>
  )
}