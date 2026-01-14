// src/modules/hotel-detail/components/hotel-header/HotelHeader.tsx
// ============================================================================
// Header de l'hôtel avec image principale
// Équivalent de hotel-header.component Angular
// ============================================================================

import { FaStar, FaMapMarkerAlt } from "react-icons/fa"

interface HotelHeaderProps {
  hotel: {
    nom_hotel: string
    img_hotel: string | null
    nbre_etoile_hotel: number | null
    note_moy_hotel: any
    nbre_avis_hotel: number
    ville_hotel: string
    pays_hotel: string
  }
}

export default function HotelHeader({ hotel }: HotelHeaderProps) {
  return (
    <div className="hotel-header">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        
        {/* Image principale */}
        <div className="relative h-[400px]">
          <img
            src={hotel.img_hotel || "/images/placeholder-hotel.jpg"}
            alt={hotel.nom_hotel}
            className="w-full h-full object-cover"
          />
          
          {/* Badge étoiles */}
          {hotel.nbre_etoile_hotel && (
            <div className="absolute top-4 left-4 bg-white px-3 py-2 rounded-full flex items-center shadow-md">
              {[...Array(hotel.nbre_etoile_hotel)].map((_, i) => (
                <FaStar key={i} className="text-yellow-400 text-sm" />
              ))}
            </div>
          )}
          
          {/* Badge note */}
          {hotel.note_moy_hotel && (
            <div className="absolute top-4 right-4 bg-turquoise text-white px-4 py-2 rounded-full font-bold shadow-md">
              {Number(hotel.note_moy_hotel).toFixed(1)}/10
            </div>
          )}
        </div>
        
        {/* Infos hôtel */}
        <div className="p-5">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {hotel.nom_hotel}
          </h1>
          
          <div className="flex items-center justify-between">
            <p className="text-gray-500 flex items-center">
              <FaMapMarkerAlt className="mr-2 text-turquoise" />
              {hotel.ville_hotel}, {hotel.pays_hotel}
            </p>
            
            {hotel.nbre_avis_hotel > 0 && (
              <p className="text-sm text-gray-400">
                {hotel.nbre_avis_hotel} avis
              </p>
            )}
          </div>
        </div>
        
      </div>
    </div>
  )
}
