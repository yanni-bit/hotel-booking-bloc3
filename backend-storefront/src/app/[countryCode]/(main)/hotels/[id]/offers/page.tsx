// src/app/[countryCode]/(main)/hotels/[id]/offers/page.tsx
// ============================================================================
// Onglet Chambres & Offres
// Équivalent de hotel-offers.component Angular
// ============================================================================

import { notFound } from "next/navigation"
import { getHotelById } from "@lib/hotels"
import Link from "next/link"
import { 
  FaTag, 
  FaUsers, 
  FaChild, 
  FaExpand, 
  FaBed,
  FaEye
} from "react-icons/fa"

interface OffersPageProps {
  params: Promise<{ id: string; countryCode: string }>
}

export default async function OffersPage({ params }: OffersPageProps) {
  const { id, countryCode } = await params
  const hotelId = parseInt(id)
  
  if (isNaN(hotelId)) {
    notFound()
  }
  
  const hotel = await getHotelById(hotelId)
  
  if (!hotel) {
    notFound()
  }

  const chambres = hotel.chambres || []

  return (
    <div className="hotel-offers">
      
      {/* Titre section */}
      <h2 className="text-xl font-semibold mb-4 pb-2 border-b text-gray-700 flex items-center">
        <FaTag className="mr-3 text-turquoise" />
        Chambres & Offres
      </h2>
      
      {/* Aucune chambre */}
      {chambres.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-lg">
          <p className="flex items-center">
            <span className="mr-2">ℹ️</span>
            Aucune chambre disponible pour le moment.
          </p>
        </div>
      )}
      
      {/* Liste des chambres */}
      <div className="space-y-4">
        {chambres.map((chambre) => {
          // Récupérer la meilleure offre (prix le plus bas)
          const meilleureOffre = chambre.offres?.[0]
          const prixMinimum = meilleureOffre?.prix_actuel
          
          return (
            <div 
              key={chambre.id_chambre} 
              className="chambre-card bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-12">
                
                {/* Image chambre (4/12) */}
                <div className="md:col-span-4">
                  <img 
                    src={chambre.images?.[0]?.url_img || "/images/default-room.jpg"}
                    alt={chambre.type_room}
                    className="w-full h-48 md:h-full object-cover"
                    loading="lazy"
                  />
                </div>
                
                {/* Contenu (8/12) */}
                <div className="md:col-span-8 p-5">
                  
                  {/* Titre chambre */}
                  <h3 className="text-lg font-bold text-gray-800 mb-1">
                    {chambre.type_room}
                    {chambre.cat_room && (
                      <span className="text-gray-500 font-normal"> - {chambre.cat_room}</span>
                    )}
                  </h3>
                  
                  {/* Type de lit */}
                  {chambre.type_lit && (
                    <p className="text-sm text-gray-500 mb-3">
                      <FaBed className="inline mr-2" />
                      {chambre.type_lit}
                    </p>
                  )}
                  
                  {/* Description courte */}
                  {chambre.description_room && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {chambre.description_room}
                    </p>
                  )}
                  
                  {/* Caractéristiques */}
                  <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                    
                    {/* Adultes max */}
                    <div className="text-gray-500">
                      <FaUsers className="inline mr-2 text-turquoise" />
                      <strong className="text-gray-700">{chambre.nbre_adults_max || 2}</strong> adultes max
                    </div>
                    
                    {/* Enfants max */}
                    {chambre.nbre_children_max > 0 && (
                      <div className="text-gray-500">
                        <FaChild className="inline mr-2 text-turquoise" />
                        <strong className="text-gray-700">{chambre.nbre_children_max}</strong> enfants max
                      </div>
                    )}
                    
                    {/* Surface */}
                    {chambre.surface_m2 && (
                      <div className="text-gray-500">
                        <FaExpand className="inline mr-2 text-turquoise" />
                        <strong className="text-gray-700">{chambre.surface_m2}</strong> m²
                      </div>
                    )}
                    
                    {/* Nombre de lits */}
                    {chambre.nbre_lit && (
                      <div className="text-gray-500">
                        <FaBed className="inline mr-2 text-turquoise" />
                        <strong className="text-gray-700">{chambre.nbre_lit}</strong> lit(s)
                      </div>
                    )}
                    
                  </div>
                  
                  <hr className="my-3" />
                  
                  {/* Prix et bouton */}
                  <div className="flex items-center justify-between">
                    
                    {/* Badges offres */}
                    <div>
                      {chambre.offres && chambre.offres.length > 0 ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          {chambre.offres.length} offre(s) disponible(s)
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                          Pas d&apos;offre active
                        </span>
                      )}
                    </div>
                    
                    {/* Prix */}
                    <div className="text-right">
                      {prixMinimum && (
                        <div>
                          <span className="text-xs text-gray-500 block">À partir de</span>
                          <span className="text-2xl font-bold text-turquoise">
                            {Number(prixMinimum).toFixed(0)} €
                          </span>
                          <span className="text-xs text-gray-500"> /nuit</span>
                        </div>
                      )}
                    </div>
                    
                  </div>
                  
                  {/* Bouton voir détails */}
                  <div className="mt-4">
                    <Link 
                      href={`/${countryCode}/hotels/${hotelId}/rooms/${chambre.id_chambre}`}
                      className="w-full flex items-center justify-center px-4 py-2 bg-turquoise text-white rounded-lg hover:bg-turquoise-dark transition-colors"
                    >
                      <FaEye className="mr-2" />
                      Voir les offres détaillées
                    </Link>
                  </div>
                  
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
    </div>
  )
}
