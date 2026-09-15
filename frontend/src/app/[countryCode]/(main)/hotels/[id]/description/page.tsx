// src/app/[countryCode]/(main)/hotels/[id]/description/page.tsx
// ============================================================================
// Onglet Description de l'hôtel
// Équivalent de hotel-description.component Angular
// ============================================================================

import { notFound } from "next/navigation"
import { getHotelById } from "@lib/hotels"
import { 
  FaFileAlt, 
  FaMapMarkerAlt, 
  FaStar, 
  FaDoorOpen, 
  FaThumbsUp,
  FaEnvelope,
  FaPhone
} from "react-icons/fa"

interface DescriptionPageProps {
  params: Promise<{ id: string }>
}

export default async function DescriptionPage({ params }: DescriptionPageProps) {
  const { id } = await params
  const hotelId = parseInt(id)
  
  if (isNaN(hotelId)) {
    notFound()
  }
  
  const hotel = await getHotelById(hotelId)
  
  if (!hotel) {
    notFound()
  }

  return (
    <div className="hotel-description">
      
      {/* Titre section */}
      <h2 className="text-xl font-semibold mb-4 pb-2 border-b text-gray-700 flex items-center">
        <FaFileAlt className="mr-3 text-turquoise" />
        Description
      </h2>
      
      <div className="bg-white p-6 rounded-lg shadow-sm">
        
        {/* Informations principales */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            {hotel.nom_hotel}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Localisation */}
            <p className="flex items-center text-gray-600">
              <FaMapMarkerAlt className="text-turquoise mr-3" />
              <span>
                <strong className="text-gray-700">Localisation :</strong>{" "}
                {hotel.ville_hotel}, {hotel.pays_hotel}
              </span>
            </p>
            
            {/* Catégorie */}
            {hotel.nbre_etoile_hotel && (
              <p className="flex items-center text-gray-600">
                <FaStar className="text-yellow-400 mr-3" />
                <span>
                  <strong className="text-gray-700">Catégorie :</strong>{" "}
                  {hotel.nbre_etoile_hotel} étoiles
                </span>
              </p>
            )}
            
            {/* Nombre de chambres */}
            {hotel.chambres && hotel.chambres.length > 0 && (
              <p className="flex items-center text-gray-600">
                <FaDoorOpen className="text-turquoise mr-3" />
                <span>
                  <strong className="text-gray-700">Chambres :</strong>{" "}
                  {hotel.chambres.length} types disponibles
                </span>
              </p>
            )}
            
            {/* Note moyenne */}
            {hotel.note_moy_hotel && (
              <p className="flex items-center text-gray-600">
                <FaThumbsUp className="text-turquoise mr-3" />
                <span>
                  <strong className="text-gray-700">Note moyenne :</strong>{" "}
                  {Number(hotel.note_moy_hotel).toFixed(1)}/10
                </span>
              </p>
            )}
            
          </div>
        </div>
        
        <hr className="my-6" />
        
        {/* Description texte */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-700 mb-3">
            À propos de cet établissement
          </h4>
          
          {hotel.description_hotel ? (
            <p className="text-gray-600 leading-relaxed">
              {hotel.description_hotel}
            </p>
          ) : (
            <p className="text-gray-400 italic">
              Aucune description disponible pour cet établissement.
            </p>
          )}
        </div>
        
        {/* Informations complémentaires */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            
            {/* Email */}
            <div className="flex items-center text-gray-500">
              <FaEnvelope className="text-turquoise mr-3" />
              {hotel.email_hotel || "Non renseigné"}
            </div>
            
            {/* Téléphone */}
            <div className="flex items-center text-gray-500">
              <FaPhone className="text-turquoise mr-3" />
              {hotel.tel_hotel || "Non renseigné"}
            </div>
            
          </div>
        </div>
        
      </div>
    </div>
  )
}
