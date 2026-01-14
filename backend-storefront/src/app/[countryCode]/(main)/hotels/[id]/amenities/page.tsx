// src/app/[countryCode]/(main)/hotels/[id]/amenities/page.tsx
// ============================================================================
// Onglet Équipements de l'hôtel
// Équivalent de hotel-amenities.component Angular
// ============================================================================

import { notFound } from "next/navigation"
import { getHotelById } from "@lib/hotels"
import { 
  FaStar,
  FaParking,
  FaUtensils,
  FaSnowflake,
  FaSmokingBan,
  FaPaw,
  FaWifi,
  FaTv,
  FaGlassMartini,
  FaLock,
  FaSwimmingPool,
  FaSpa,
  FaDumbbell,
  FaInfoCircle,
  FaCheck,
  FaTimes
} from "react-icons/fa"

interface AmenitiesPageProps {
  params: Promise<{ id: string }>
}

// Configuration des équipements avec leurs icônes
const amenitiesConfig = {
  general: [
    { key: "parking", label: "Parking", icon: FaParking },
    { key: "restaurant", label: "Restaurant", icon: FaUtensils },
    { key: "climatisation", label: "Climatisation", icon: FaSnowflake },
    { key: "non_fumeur", label: "Chambres non-fumeur", icon: FaSmokingBan },
    { key: "pet_allowed", label: "Animaux acceptés", icon: FaPaw },
    { key: "wi_fi", label: "Wi-Fi gratuit", icon: FaWifi },
  ],
  room: [
    { key: "television", label: "Télévision", icon: FaTv },
    { key: "mini_bar", label: "Mini-bar", icon: FaGlassMartini },
    { key: "coffre_fort", label: "Coffre-fort", icon: FaLock },
  ],
  leisure: [
    { key: "piscine", label: "Piscine", icon: FaSwimmingPool },
    { key: "spa", label: "Spa & Bien-être", icon: FaSpa },
    { key: "salle_sport", label: "Salle de sport", icon: FaDumbbell },
  ],
}

export default async function AmenitiesPage({ params }: AmenitiesPageProps) {
  const { id } = await params
  const hotelId = parseInt(id)
  
  if (isNaN(hotelId)) {
    notFound()
  }
  
  const hotel = await getHotelById(hotelId)
  
  if (!hotel) {
    notFound()
  }

  const amenities = hotel.amenities

  // Fonction pour afficher un équipement
  const renderAmenity = (config: { key: string; label: string; icon: React.ComponentType<{ className?: string }> }) => {
    const Icon = config.icon
    const isAvailable = amenities?.[config.key as keyof typeof amenities] ?? false
    
    return (
      <div 
        key={config.key}
        className={`flex items-center p-3 rounded-lg ${
          isAvailable ? "bg-green-50" : "bg-gray-50"
        }`}
      >
        <Icon className={`mr-3 ${isAvailable ? "text-green-600" : "text-gray-400"}`} />
        <span className={isAvailable ? "text-gray-700" : "text-gray-400"}>
          {config.label}
        </span>
        <span className="ml-auto">
          {isAvailable ? (
            <FaCheck className="text-green-600" />
          ) : (
            <FaTimes className="text-gray-300" />
          )}
        </span>
      </div>
    )
  }

  return (
    <div className="hotel-amenities">
      
      {/* Titre section */}
      <h2 className="text-xl font-semibold mb-4 pb-2 border-b text-gray-700 flex items-center">
        <FaStar className="mr-3 text-turquoise" />
        Équipements & Services
      </h2>
      
      {/* Info hôtel */}
      <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-lg mb-6">
        <p className="flex items-center">
          <FaInfoCircle className="mr-2" />
          <strong>{hotel.nom_hotel}</strong>
          <span className="mx-2">-</span>
          {hotel.nbre_etoile_hotel} étoiles
        </p>
      </div>
      
      {!amenities ? (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg">
          <p>Informations sur les équipements non disponibles.</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Équipements généraux */}
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <FaParking className="mr-2 text-turquoise" />
              Équipements généraux
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {amenitiesConfig.general.map(renderAmenity)}
            </div>
          </div>
          
          {/* Équipements chambre */}
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <FaTv className="mr-2 text-turquoise" />
              Équipements en chambre
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {amenitiesConfig.room.map(renderAmenity)}
            </div>
          </div>
          
          {/* Loisirs */}
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
              <FaSwimmingPool className="mr-2 text-turquoise" />
              Sport & Loisirs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {amenitiesConfig.leisure.map(renderAmenity)}
            </div>
          </div>
          
        </div>
      )}
      
      {/* Note de bas de page */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-500">
        <FaInfoCircle className="inline mr-2" />
        Les équipements peuvent varier selon le type de chambre. 
        Veuillez vérifier les détails lors de votre réservation.
      </div>
      
    </div>
  )
}
