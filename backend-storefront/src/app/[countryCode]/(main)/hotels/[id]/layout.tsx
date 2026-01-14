// src/app/[countryCode]/(main)/hotels/[id]/layout.tsx
// ============================================================================
// Layout partagé pour la page détail hôtel
// Équivalent du <router-outlet> Angular avec hotel-detail.component
// ============================================================================

import { notFound } from "next/navigation"
import { getHotelById } from "@lib/hotels"
import HotelHeader from "@modules/hotel-detail/components/hotel-header/HotelHeader"
import HotelSidebar from "@modules/hotel-detail/components/hotel-sidebar/HotelSidebar"
import HotelInfoCard from "@modules/hotel-detail/components/widgets/hotel-info-card/HotelInfoCard"
import WhyBook from "@modules/hotel-detail/components/widgets/why-book/WhyBook"
import HelpContact from "@modules/hotel-detail/components/widgets/help-contact/HelpContact"
import Link from "next/link"

// Types pour les props
interface HotelLayoutProps {
  children: React.ReactNode
  params: Promise<{ id: string; countryCode: string }>
}

// Metadata dynamique pour le SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const hotelId = parseInt(id)
  
  if (isNaN(hotelId)) return { title: "Hôtel non trouvé" }
  
  const hotel = await getHotelById(hotelId)
  
  if (!hotel) return { title: "Hôtel non trouvé" }
  
  return {
    title: `${hotel.nom_hotel} - ${hotel.ville_hotel} | Hotel Booking`,
    description: hotel.description_hotel?.slice(0, 160) || `Réservez ${hotel.nom_hotel} à ${hotel.ville_hotel}`,
  }
}

export default async function HotelLayout({ children, params }: HotelLayoutProps) {
  const { id, countryCode } = await params
  const hotelId = parseInt(id)

  // Validation de l'ID
  if (isNaN(hotelId)) {
    notFound()
  }

  // Récupération des données (UNE SEULE FOIS pour tout le layout)
  const hotel = await getHotelById(hotelId)

  if (!hotel) {
    notFound()
  }

  return (
    <main className="pb-5 hotel-detail-page bg-gray-50 min-h-screen">
      <div className="content-container py-6">
        
        {/* BREADCRUMB */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href={`/${countryCode}`} className="text-turquoise hover:underline">
                Accueil
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link 
                href={`/${countryCode}/hotels?city=${hotel.ville_hotel}`} 
                className="text-turquoise hover:underline"
              >
                {hotel.ville_hotel}
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-600 truncate max-w-[200px]">
              {hotel.nom_hotel}
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* ========================================
               COLONNE PRINCIPALE (9/12)
               ======================================== */}
          <div className="lg:col-span-9">
            
            {/* Header avec image */}
            <HotelHeader hotel={hotel} />
            
            {/* Système d'onglets */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-6">
              
              {/* Sidebar onglets + Aide (3/12) */}
              <div className="md:col-span-3">
                <HotelSidebar hotelId={hotelId} countryCode={countryCode} />
                <HelpContact />
              </div>
              
              {/* Contenu des onglets (9/12) - Équivalent {children} = router-outlet */}
              <div className="md:col-span-9">
                {children}
              </div>
              
            </div>
          </div>
          
          {/* ========================================
               COLONNE DROITE - WIDGETS (3/12)
               ======================================== */}
          <div className="lg:col-span-3 space-y-4">
            <HotelInfoCard hotel={hotel} />
            <WhyBook />
          </div>
          
        </div>
      </div>
    </main>
  )
}
