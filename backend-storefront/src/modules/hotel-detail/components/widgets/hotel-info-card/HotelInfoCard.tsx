// src/modules/hotel-detail/components/widgets/hotel-info-card/HotelInfoCard.tsx
// ============================================================================
// Widget carte info hôtel
// Équivalent de hotel-info-card.component Angular
// ============================================================================

import { 
  FaStar, 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaGlobe,
  FaBed,
  FaThumbsUp
} from "react-icons/fa"

interface HotelInfoCardProps {
  hotel: {
    nom_hotel: string
    nbre_etoile_hotel: number | null
    note_moy_hotel: any
    nbre_avis_hotel: number
    ville_hotel: string
    pays_hotel: string
    rue_hotel: string | null
    code_postal_hotel: string | null
    tel_hotel: string | null
    email_hotel: string | null
    site_web_hotel: string | null
    chambres?: any[]
  }
}

export default function HotelInfoCard({ hotel }: HotelInfoCardProps) {
  return (
    <div className="hotel-info-card bg-white rounded-lg shadow-sm p-5">
      
      {/* En-tête */}
      <h3 className="text-lg font-bold text-gray-800 mb-4 pb-3 border-b">
        Informations
      </h3>
      
      {/* Note moyenne */}
      {hotel.note_moy_hotel && (
        <div className="flex items-center justify-between mb-4 p-3 bg-turquoise/10 rounded-lg">
          <div className="flex items-center">
            <FaThumbsUp className="text-turquoise mr-2" />
            <span className="text-gray-600">Note moyenne</span>
          </div>
          <span className="text-xl font-bold text-turquoise">
            {Number(hotel.note_moy_hotel).toFixed(1)}/10
          </span>
        </div>
      )}
      
      {/* Infos liste */}
      <ul className="space-y-3 text-sm">
        
        {/* Étoiles */}
        {hotel.nbre_etoile_hotel && (
          <li className="flex items-center text-gray-600">
            <FaStar className="text-yellow-400 mr-3 flex-shrink-0" />
            <span>Hôtel {hotel.nbre_etoile_hotel} étoiles</span>
          </li>
        )}
        
        {/* Adresse */}
        <li className="flex items-start text-gray-600">
          <FaMapMarkerAlt className="text-turquoise mr-3 mt-1 flex-shrink-0" />
          <span>
            {hotel.rue_hotel && <>{hotel.rue_hotel}<br /></>}
            {hotel.code_postal_hotel} {hotel.ville_hotel}<br />
            {hotel.pays_hotel}
          </span>
        </li>
        
        {/* Chambres */}
        {hotel.chambres && hotel.chambres.length > 0 && (
          <li className="flex items-center text-gray-600">
            <FaBed className="text-turquoise mr-3 flex-shrink-0" />
            <span>{hotel.chambres.length} types de chambres</span>
          </li>
        )}
        
        {/* Avis */}
        {hotel.nbre_avis_hotel > 0 && (
          <li className="flex items-center text-gray-600">
            <FaThumbsUp className="text-turquoise mr-3 flex-shrink-0" />
            <span>{hotel.nbre_avis_hotel} avis clients</span>
          </li>
        )}
        
        {/* Téléphone */}
        {hotel.tel_hotel && (
          <li className="flex items-center text-gray-600">
            <FaPhone className="text-turquoise mr-3 flex-shrink-0" />
            <a href={`tel:${hotel.tel_hotel}`} className="hover:text-turquoise">
              {hotel.tel_hotel}
            </a>
          </li>
        )}
        
        {/* Email */}
        {hotel.email_hotel && (
          <li className="flex items-center text-gray-600">
            <FaEnvelope className="text-turquoise mr-3 flex-shrink-0" />
            <a href={`mailto:${hotel.email_hotel}`} className="hover:text-turquoise truncate">
              {hotel.email_hotel}
            </a>
          </li>
        )}
        
        {/* Site web */}
        {hotel.site_web_hotel && (
          <li className="flex items-center text-gray-600">
            <FaGlobe className="text-turquoise mr-3 flex-shrink-0" />
            <a 
              href={hotel.site_web_hotel} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-turquoise truncate"
            >
              Site officiel
            </a>
          </li>
        )}
        
      </ul>
      
    </div>
  )
}
