import { PrismaClient, TypeService } from '@prisma/client'

const prisma = new PrismaClient()

// Mapping ville BDD → dossier images
const villeToFolder: Record<string, string> = {
  "Paris": "Paris",
  "Amsterdam": "Amsterdam",
  "St Petersburg": "StPetersburg",
  "Prague": "Prague",
  "Tahiti": "Tahiti",
  "Zanzibar": "Zanzibar",
  "Maldives": "Maldives",
  "Cancun": "Cancun",
  "Dubai": "Dubai",
  "Bali": "Bali",
  "New York": "NewYork",
  "Tokyo": "Tokyo",
}

// Extensions des images par ville
const imageExtensions: Record<string, string[]> = {
  "Paris": ["webp", "jpg", "jpg", "jpg", "webp", "webp", "jpg", "webp", "jpeg", "jpg"],
  "Amsterdam": ["jpg", "jpg", "jpg", "webp", "jpg", "jpg", "webp", "jpg", "jpg"],
  "StPetersburg": ["jpg", "jpg", "webp", "webp", "jpg", "jpg", "jpg", "jpg"],
  "Prague": ["webp", "jpg", "webp", "jpg", "jpg", "jpg", "jpg", "jpg"],
  "Tahiti": ["jpg", "jpg", "jpg", "webp", "jpg", "webp", "jpg", "jpg"],
  "Zanzibar": ["jpg", "jpeg", "jpg", "jpg", "jpg", "jpg", "jpg", "jpg"],
  "Maldives": ["jpg", "webp", "png", "jpg", "jpg", "jpg", "jpg", "jpg"],
  "Cancun": ["jpg", "webp", "jpg", "webp", "webp", "jpg", "jpg", "jpg", "jpg"],
  "Dubai": ["webp", "jpg", "webp", "jpg", "webp", "jpg", "jpg", "webp", "jpg"],
  "Bali": ["jpg", "jpg", "jpg", "jpg", "jpg", "jpg", "jpg", "jpg"],
  "NewYork": ["jpg", "jpg", "jpg", "jpg", "webp", "jpg", "jpg", "webp", "webp"],
  "Tokyo": ["jpg", "jpg", "webp", "webp", "jpg", "jpg", "jpg", "jpg", "jpg"],
}

// SERVICES ADDITIONNELS (catalogue)
const servicesAdditionnels = [
  {
    id_service: 1,
    nom_service: 'Parking privé',
    description_service: 'Place de parking sécurisée',
    type_service: 'journalier' as TypeService,
    icone_service: 'bi-p-circle',
    actif: true,
  },
  {
    id_service: 2,
    nom_service: 'Petit-déjeuner',
    description_service: 'Buffet continental par personne',
    type_service: 'par_personne' as TypeService,
    icone_service: 'bi-cup-hot',
    actif: true,
  },
  {
    id_service: 3,
    nom_service: 'Accès spa',
    description_service: 'Accès illimité au spa et jacuzzi',
    type_service: 'sejour' as TypeService,
    icone_service: 'bi-droplet',
    actif: true,
  },
  {
    id_service: 4,
    nom_service: 'Transfert aéroport',
    description_service: "Aller simple depuis/vers l'aéroport",
    type_service: 'unitaire' as TypeService,
    icone_service: 'bi-taxi-front',
    actif: true,
  },
  {
    id_service: 5,
    nom_service: 'Départ tardif',
    description_service: "Check-out jusqu'à 18h au lieu de 11h",
    type_service: 'unitaire' as TypeService,
    icone_service: 'bi-clock-history',
    actif: true,
  },
]

// ============================================================
// DESTINATIONS (page d'accueil) — nom_ville doit être identique
// à hotel.ville_hotel : le composant compte les hôtels par ville.
// ============================================================
const destinations = [
  { nom_ville: "Paris",         url_image: "/images/paris.jpg",            ordre: 1 },
  { nom_ville: "Tokyo",         url_image: "/images/tokyo.jpg",            ordre: 2 },
  { nom_ville: "New York",      url_image: "/images/new-york.webp",        ordre: 3 },
  { nom_ville: "Dubai",         url_image: "/images/dubai.jpg",            ordre: 4 },
  { nom_ville: "Bali",          url_image: "/images/bali.jpg",             ordre: 5 },
  { nom_ville: "Maldives",     url_image: "/images/maldives.jpg",         ordre: 6 },
  { nom_ville: "Cancun",        url_image: "/images/cancun.jpg",           ordre: 7 },
  { nom_ville: "Tahiti",        url_image: "/images/tahiti.jpg",           ordre: 8 },
  { nom_ville: "Zanzibar",      url_image: "/images/zanzibar.webp",        ordre: 9 },
  { nom_ville: "Amsterdam",     url_image: "/images/amsterdam.jpg",        ordre: 10 },
  { nom_ville: "Prague",        url_image: "/images/prague.jpg",           ordre: 11 },
  { nom_ville: "St Petersburg", url_image: "/images/saint-petersburg.jpg", ordre: 12 },
]

async function main() {
  console.log("🚀 Début du seed...")

  // ============================================================
  // 0. DESTINATIONS (upsert : relançable sans doublon)
  // ============================================================
  console.log("🌍 Destinations...")
  let destinationsCreees = 0
  for (const dest of destinations) {
    // Le pays est lu depuis les hôtels de la ville (source de vérité)
    const hotelDeLaVille = await prisma.hotel.findFirst({
      where: { ville_hotel: dest.nom_ville },
      select: { pays_hotel: true },
    })
    if (!hotelDeLaVille) {
      console.warn(`   ⚠️ Aucun hôtel pour "${dest.nom_ville}", destination ignorée`)
      continue
    }
    await prisma.destination.upsert({
      where: { nom_ville: dest.nom_ville },
      update: { nom_pays: hotelDeLaVille.pays_hotel, url_image: dest.url_image, ordre: dest.ordre },
      create: { ...dest, nom_pays: hotelDeLaVille.pays_hotel },
    })
    destinationsCreees++
  }
  console.log(`✅ ${destinationsCreees} destinations en place`)

    // 1. CORRIGER LES URLs DES IMAGES HÔTEL (ajouter le / au début)
    console.log("📸 Correction des URLs img_hotel...")
  
  const hotelsToFix = await prisma.hotel.findMany({
    where: {
      img_hotel: {
        not: null,
        startsWith: 'images/'  // Sans le /
      }
    }
  })

  for (const hotel of hotelsToFix) {
    await prisma.hotel.update({
      where: { id_hotel: hotel.id_hotel },
      data: { img_hotel: '/' + hotel.img_hotel }
    })
  }
  console.log(`✅ ${hotelsToFix.length} URLs hôtels corrigées`)

    // 2. SUPPRIMER LES ANCIENNES IMAGES CHAMBRE
    console.log("🗑️ Nettoyage des anciennes images chambres...")
  await prisma.imgChambre.deleteMany()

    // 3. GÉNÉRER LES IMAGES POUR CHAQUE CHAMBRE
    console.log("🖼️ Génération des images chambres...")

  const chambres = await prisma.chambre.findMany({
    include: {
      hotel: {
        select: { ville_hotel: true }
      }
    }
  })

  let totalImages = 0
  const imagesToCreate: { id_chambre: number; url_img: string; alt_img: string; ordre: number }[] = []

  for (const chambre of chambres) {
    const ville = chambre.hotel.ville_hotel
    const folder = villeToFolder[ville]
    
    if (!folder) {
      imagesToCreate.push({
        id_chambre: chambre.id_chambre,
        url_img: '/images/default-room.jpg',
        alt_img: `Chambre ${chambre.type_room}`,
        ordre: 1
      })
      totalImages++
      continue
    }

    const extensions = imageExtensions[folder] || ["jpg", "jpg", "jpg"]
    const startIndex = (chambre.id_chambre % (extensions.length - 2)) + 1
    
    for (let i = 0; i < 3; i++) {
      const imgIndex = ((startIndex + i - 1) % extensions.length) + 1
      const ext = extensions[imgIndex - 1] || "jpg"
      
      imagesToCreate.push({
        id_chambre: chambre.id_chambre,
        url_img: `/images/${folder}/${folder}-${imgIndex}.${ext}`,
        alt_img: `${chambre.type_room} - Vue ${i + 1}`,
        ordre: i + 1
      })
      totalImages++
    }
  }

  await prisma.imgChambre.createMany({
    data: imagesToCreate
  })

  console.log(`✅ ${totalImages} images chambres créées pour ${chambres.length} chambres`)

    // 4. CRÉER LES SERVICES ADDITIONNELS (catalogue)
    console.log("🛎️ Services additionnels...")

  // Si le catalogue existe déjà (import SQL), on ne touche à rien :
  // hotel_services est référencé par reservation_services (clé étrangère).
  const nbServicesExistants = await prisma.servicesAdditionnels.count()
  if (nbServicesExistants > 0) {
    console.log(`⏭️ ${nbServicesExistants} services déjà présents, étapes 4-5 ignorées`)
  } else {

  // Créer les services du catalogue
  for (const service of servicesAdditionnels) {
    await prisma.servicesAdditionnels.create({
      data: service
    })
  }
  console.log(`✅ ${servicesAdditionnels.length} services additionnels créés`)

    // 5. CRÉER LES HOTEL_SERVICES (services par hôtel)
    console.log("🏨 Génération des services par hôtel...")

  const hotels = await prisma.hotel.findMany({
    select: { id_hotel: true }
  })

  const hotelServicesToCreate: {
    id_hotel: number
    id_service: number
    prix: number
    disponible: boolean
  }[] = []

  // Prix de base par service (on variera +/- 20%)
  const prixBase: Record<number, number> = {
    1: 20,  // Parking
    2: 35,  // Petit-déjeuner
    3: 85,  // Spa
    4: 65,  // Transfert
    5: 40,  // Départ tardif
  }

  for (const hotel of hotels) {
    for (let idService = 1; idService <= 5; idService++) {
      // Varier le prix de +/- 50%
      const basePrix = prixBase[idService]
      const variation = 0.5 + Math.random() // Entre 0.5 et 1.5
      const prix = Math.round(basePrix * variation)

      hotelServicesToCreate.push({
        id_hotel: hotel.id_hotel,
        id_service: idService,
        prix: prix,
        disponible: true,
      })
    }
  }

  await prisma.hotelServices.createMany({
    data: hotelServicesToCreate
  })

  console.log(`✅ ${hotelServicesToCreate.length} services hôtel créés (${hotels.length} hôtels × 5 services)`)
  } // fin étapes 4-5

    // RÉSUMÉ
    console.log("\n" + "=".repeat(50))
  console.log("✅ SEED TERMINÉ AVEC SUCCÈS")
  console.log("=".repeat(50))
  console.log(`• ${hotelsToFix.length} URLs hôtels corrigées`)
  console.log(`• ${totalImages} images chambres créées`)
  console.log(`• ${destinationsCreees} destinations`)
  console.log(`• services additionnels : ${nbServicesExistants > 0 ? "déjà présents" : servicesAdditionnels.length + " créés"}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error("❌ Erreur:", e)
    await prisma.$disconnect()
    process.exit(1)
  })