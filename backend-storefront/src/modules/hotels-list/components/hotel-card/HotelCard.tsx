// src/modules/hotels-list/components/hotel-card/HotelCard.tsx
// ============================================================================
// Carte hôtel pour la grille de liste
// Équivalent de la carte dans hotels-list.html Angular
// ============================================================================

import Link from "next/link"
import { FaStar, FaMapMarkerAlt, FaEye } from "react-icons/fa"

interface HotelCardProps {
  hotel: {
    id_hotel: number
    nom_hotel: string
    description_hotel: string | null
    img_hotel: string | null
    ville_hotel: string
    pays_hotel: string
    nbre_etoile_hotel: number | null
    note_moy_hotel: any
    nbre_avis_hotel: number
  }
  countryCode: string
}

export default function HotelCard({ hotel, countryCode }: HotelCardProps) {
  // Déterminer le label de la note
  const getNoteLabel = (note: number): string => {
    if (note >= 9) return "Exceptionnel"
    if (note >= 8) return "Excellent"
    if (note >= 7) return "Très bien"
    if (note >= 6) return "Bien"
    return "Correct"
  }

  return (
    <div className="hotel-card bg-white rounded-lg shadow-sm overflow-hidden h-full flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      
      {/* Image de l'hôtel */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={hotel.img_hotel || "/images/default-room.jpg"}
          alt={hotel.nom_hotel}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          loading="lazy"
        />
        
        {/* Badge note */}
        {hotel.note_moy_hotel && (
          <div className="absolute top-3 right-3 bg-turquoise text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
            {Number(hotel.note_moy_hotel).toFixed(1)}/10
          </div>
        )}
      </div>

      {/* Corps de la carte */}
      <div className="p-5 flex flex-col flex-1">
        
        {/* Titre */}
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">
          {hotel.nom_hotel}
        </h3>
        
        {/* Étoiles */}
        {hotel.nbre_etoile_hotel && (
          <div className="flex items-center mb-2">
            {[...Array(hotel.nbre_etoile_hotel)].map((_, i) => (
              <FaStar key={i} className="text-yellow-400 text-sm" />
            ))}
          </div>
        )}

        {/* Description */}
        {hotel.description_hotel && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-3 flex-1">
            {hotel.description_hotel}
          </p>
        )}

        {/* Localisation */}
        <p className="text-gray-500 text-sm mb-3 flex items-center">
          <FaMapMarkerAlt className="text-turquoise mr-2 flex-shrink-0" />
          {hotel.ville_hotel}, {hotel.pays_hotel}
        </p>

        {/* Note et avis */}
        {hotel.note_moy_hotel && (
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-turquoise text-white px-3 py-1 rounded text-sm font-bold">
              {Number(hotel.note_moy_hotel).toFixed(1)}/10
            </span>
            <span className="text-gray-600 text-sm">
              {getNoteLabel(Number(hotel.note_moy_hotel))}
            </span>
            {hotel.nbre_avis_hotel > 0 && (
              <span className="text-gray-400 text-xs">
                ({hotel.nbre_avis_hotel} avis)
              </span>
            )}
          </div>
        )}

        {/* Bouton voir détails */}
        <Link 
          href={`/${countryCode}/hotels/${hotel.id_hotel}`}
          className="mt-auto w-full flex items-center justify-center px-4 py-3 bg-turquoise text-white rounded-full font-semibold hover:bg-turquoise-dark transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
        >
          <FaEye className="mr-2" />
          Voir les chambres
        </Link>

      </div>
    </div>
  )
}
