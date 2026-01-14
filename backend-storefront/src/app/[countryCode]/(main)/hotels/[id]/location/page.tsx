// src/app/[countryCode]/(main)/hotels/[id]/location/page.tsx
// ============================================================================
// Onglet Localisation
// Équivalent de hotel-location.component Angular
// ============================================================================

import { notFound } from "next/navigation"
import { getHotelById } from "@lib/hotels"
import { 
  FaMapMarkerAlt,
  FaMap,
  FaDirections,
  FaPhone,
  FaEnvelope,
  FaGlobe
} from "react-icons/fa"

interface LocationPageProps {
  params: Promise<{ id: string }>
}

export default async function LocationPage({ params }: LocationPageProps) {
  const { id } = await params
  const hotelId = parseInt(id)
  
  if (isNaN(hotelId)) {
    notFound()
  }
  
  const hotel = await getHotelById(hotelId)
  
  if (!hotel) {
    notFound()
  }

  // Construire l'adresse complète
  const adresseComplete = [
    hotel.rue_hotel,
    hotel.code_postal_hotel,
    hotel.ville_hotel,
    hotel.pays_hotel
  ].filter(Boolean).join(", ")

  // URL Google Maps
  const googleMapsUrl = hotel.latitude && hotel.longitude
    ? `https://www.google.com/maps?q=${hotel.latitude},${hotel.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(adresseComplete)}`

  return (
    <div className="hotel-location">
      
      {/* Titre section */}
      <h2 className="text-xl font-semibold mb-4 pb-2 border-b text-gray-700 flex items-center">
        <FaMapMarkerAlt className="mr-3 text-turquoise" />
        Localisation
      </h2>
      
      {/* Carte */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        
        {/* Map iframe ou placeholder */}
        <div className="h-[400px] bg-gray-200 relative">
          {hotel.latitude && hotel.longitude ? (
            <iframe
              src={`https://maps.google.com/maps?q=${hotel.latitude},${hotel.longitude}&z=15&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Carte de ${hotel.nom_hotel}`}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <FaMap className="text-4xl mb-3 mx-auto text-gray-400" />
                <p>Coordonnées GPS non disponibles</p>
              </div>
            </div>
          )}
        </div>
        
      </div>
      
      {/* Informations de localisation */}
      <div className="bg-white p-5 rounded-lg shadow-sm">
        
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Adresse & Contact
        </h3>
        
        <div className="space-y-4">
          
          {/* Adresse */}
          <div className="flex items-start">
            <FaMapMarkerAlt className="text-turquoise mr-4 mt-1 text-lg flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-700 mb-1">Adresse</h4>
              <p className="text-gray-600">
                {hotel.rue_hotel && <>{hotel.rue_hotel}<br /></>}
                {hotel.code_postal_hotel} {hotel.ville_hotel}<br />
                {hotel.pays_hotel}
              </p>
            </div>
          </div>
          
          {/* Coordonnées GPS */}
          {hotel.latitude && hotel.longitude && (
            <div className="flex items-start">
              <FaMap className="text-turquoise mr-4 mt-1 text-lg flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Coordonnées GPS</h4>
                <p className="text-gray-600 text-sm">
                  Latitude: {Number(hotel.latitude).toFixed(6)}<br />
                  Longitude: {Number(hotel.longitude).toFixed(6)}
                </p>
              </div>
            </div>
          )}
          
          {/* Téléphone */}
          {hotel.tel_hotel && (
            <div className="flex items-start">
              <FaPhone className="text-turquoise mr-4 mt-1 text-lg flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Téléphone</h4>
                <a 
                  href={`tel:${hotel.tel_hotel}`}
                  className="text-turquoise hover:underline"
                >
                  {hotel.tel_hotel}
                </a>
              </div>
            </div>
          )}
          
          {/* Email */}
          {hotel.email_hotel && (
            <div className="flex items-start">
              <FaEnvelope className="text-turquoise mr-4 mt-1 text-lg flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Email</h4>
                <a 
                  href={`mailto:${hotel.email_hotel}`}
                  className="text-turquoise hover:underline"
                >
                  {hotel.email_hotel}
                </a>
              </div>
            </div>
          )}
          
          {/* Site web */}
          {hotel.site_web_hotel && (
            <div className="flex items-start">
              <FaGlobe className="text-turquoise mr-4 mt-1 text-lg flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Site web</h4>
                <a 
                  href={hotel.site_web_hotel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-turquoise hover:underline"
                >
                  Visiter le site officiel
                </a>
              </div>
            </div>
          )}
          
        </div>
        
        {/* Bouton itinéraire */}
        <div className="mt-6 pt-4 border-t">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-turquoise text-white rounded-lg hover:bg-turquoise-dark transition-colors"
          >
            <FaDirections className="mr-2" />
            Obtenir l&apos;itinéraire
          </a>
        </div>
        
      </div>
      
    </div>
  )
}
