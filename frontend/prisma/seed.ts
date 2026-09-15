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
  "Male": "Maldives",
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

// ============================================================
// SERVICES ADDITIONNELS (catalogue)
// ============================================================
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

async function main() {
  console.log("🚀 Début du seed...")

  // ============================================================
  // 1. CORRIGER LES URLs DES IMAGES HÔTEL (ajouter le / au début)
  // ============================================================
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

  // ============================================================
  // 2. SUPPRIMER LES ANCIENNES IMAGES CHAMBRE
  // ============================================================
  console.log("🗑️ Nettoyage des anciennes images chambres...")
  await prisma.imgChambre.deleteMany()

  // ============================================================
  // 3. GÉNÉRER LES IMAGES POUR CHAQUE CHAMBRE
  // ============================================================
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

  // ============================================================
  // 4. CRÉER LES SERVICES ADDITIONNELS (catalogue)
  // ============================================================
  console.log("🛎️ Création des services additionnels...")

  // Supprimer les anciens services
  await prisma.hotelServices.deleteMany()
  await prisma.servicesAdditionnels.deleteMany()

  // Créer les services du catalogue
  for (const service of servicesAdditionnels) {
    await prisma.servicesAdditionnels.create({
      data: service
    })
  }
  console.log(`✅ ${servicesAdditionnels.length} services additionnels créés`)

  // ============================================================
  // 5. CRÉER LES HOTEL_SERVICES (services par hôtel)
  // ============================================================
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

  // ============================================================
  // RÉSUMÉ
  // ============================================================
  console.log("\n" + "=".repeat(50))
  console.log("✅ SEED TERMINÉ AVEC SUCCÈS")
  console.log("=".repeat(50))
  console.log(`• ${hotelsToFix.length} URLs hôtels corrigées`)
  console.log(`• ${totalImages} images chambres créées`)
  console.log(`• ${servicesAdditionnels.length} services additionnels créés`)
  console.log(`• ${hotelServicesToCreate.length} services hôtel créés`)
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