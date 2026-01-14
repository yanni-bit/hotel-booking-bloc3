// src/app/[countryCode]/(main)/hotels/[id]/reviews/page.tsx
// ============================================================================
// Onglet Avis clients
// Équivalent de hotel-reviews.component Angular
// ============================================================================

import { notFound } from "next/navigation"
import { getHotelById } from "@lib/hotels"
import { 
  FaComments,
  FaCalendarAlt,
  FaUser,
  FaFlag,
  FaShieldAlt,
  FaInfoCircle
} from "react-icons/fa"

interface ReviewsPageProps {
  params: Promise<{ id: string }>
}

// Labels des types de voyageurs
const typesVoyageurLabels: Record<string, string> = {
  couple: "Voyage en couple",
  famille: "Voyage en famille",
  solo: "Voyage solo",
  business: "Voyage d'affaires",
  groupe: "Voyage en groupe",
  autre: "Autre",
}

export default async function ReviewsPage({ params }: ReviewsPageProps) {
  const { id } = await params
  const hotelId = parseInt(id)
  
  if (isNaN(hotelId)) {
    notFound()
  }
  
  const hotel = await getHotelById(hotelId)
  
  if (!hotel) {
    notFound()
  }

  const avis = hotel.avis || []
  const noteMoyenne = hotel.note_moy_hotel 
    ? Number(hotel.note_moy_hotel).toFixed(1) 
    : null

  return (
    <div className="hotel-reviews">
      
      {/* Titre section */}
      <h2 className="text-xl font-semibold mb-4 pb-2 border-b text-gray-700 flex items-center">
        <FaComments className="mr-3 text-turquoise" />
        Avis clients
      </h2>
      
      {/* Aucun avis */}
      {avis.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-lg">
          <p className="flex items-center">
            <FaInfoCircle className="mr-2" />
            Aucun avis disponible pour cet hôtel.
          </p>
        </div>
      )}
      
      {/* Contenu si avis présents */}
      {avis.length > 0 && (
        <>
          {/* Statistiques */}
          <div className="bg-white p-5 rounded-lg shadow-sm mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-500 mb-2">Note globale</h3>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-turquoise">
                    {noteMoyenne}
                  </span>
                  <span className="text-2xl text-turquoise">/10</span>
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  Basé sur {avis.length} avis
                </p>
              </div>
              <div className="text-right text-gray-500">
                <p className="flex items-center">
                  <FaShieldAlt className="mr-2 text-turquoise" />
                  Avis vérifiés
                </p>
              </div>
            </div>
          </div>
          
          {/* Liste des avis */}
          <div className="space-y-4">
            {avis.map((review) => (
              <div 
                key={review.id_avis} 
                className="bg-white p-5 rounded-lg shadow-sm"
              >
                
                {/* En-tête avis */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-gray-700">
                      {review.user?.prenom_user || "Utilisateur anonyme"}
                    </h4>
                    <p className="text-sm text-gray-400 flex items-center mt-1">
                      <FaCalendarAlt className="mr-2" />
                      {new Date(review.date_avis).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </p>
                  </div>
                  <div className="bg-turquoise text-white px-3 py-1 rounded-full font-bold">
                    {Number(review.note).toFixed(1)}/10
                  </div>
                </div>
                
                {/* Titre avis */}
                {review.titre_avis && (
                  <h5 className="text-turquoise font-medium mb-2">
                    &quot;{review.titre_avis}&quot;
                  </h5>
                )}
                
                {/* Commentaire */}
                {review.commentaire && (
                  <p className="text-gray-600 mb-4">
                    {review.commentaire}
                  </p>
                )}
                
                {/* Infos supplémentaires */}
                <div className="pt-3 border-t text-sm text-gray-400 flex justify-between">
                  <span className="flex items-center">
                    <FaUser className="mr-2" />
                    {typesVoyageurLabels[review.type_voyageur] || "Non spécifié"}
                  </span>
                  {review.pays_origine && (
                    <span className="flex items-center">
                      <FaFlag className="mr-2" />
                      {review.pays_origine}
                    </span>
                  )}
                </div>
                
              </div>
            ))}
          </div>
          
          {/* Note de bas de page */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-500">
            <FaShieldAlt className="inline mr-2" />
            Tous les avis proviennent de clients ayant séjourné dans cet établissement.
          </div>
        </>
      )}
      
    </div>
  )
}
