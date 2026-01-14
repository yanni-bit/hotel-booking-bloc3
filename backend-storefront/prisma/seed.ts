import { PrismaClient } from '@prisma/client'

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

async function main() {
  console.log("🚀 Début du seed images...")

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

  // Récupérer toutes les chambres avec leur hôtel
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
      // Ville non trouvée, utiliser une image par défaut
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
    
    // Générer 2-3 images par chambre en variant les numéros
    // Utiliser l'ID chambre modulo nombre d'images pour varier
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

  // Insérer toutes les images en batch
  await prisma.imgChambre.createMany({
    data: imagesToCreate
  })

  console.log(`✅ ${totalImages} images chambres créées pour ${chambres.length} chambres`)

  // ============================================================
  // RÉSUMÉ
  // ============================================================
  console.log("\n" + "=".repeat(50))
  console.log("✅ SEED TERMINÉ AVEC SUCCÈS")
  console.log("=".repeat(50))
  console.log(`• ${hotelsToFix.length} URLs hôtels corrigées`)
  console.log(`• ${totalImages} images chambres créées`)
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