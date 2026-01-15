"use client";

// ============================================================================
// ROOM DETAIL COMPONENT - Affichage détail chambre + offres
// ============================================================================

import Link from "next/link";
import { FiUsers, FiUser, FiMaximize, FiMoon, FiCoffee, FiCheck, FiX, FiCalendar, FiArrowLeft, FiInfo } from "react-icons/fi";
import { Chambre, Offre } from "@lib/chambres";

interface RoomDetailProps {
  chambre: Chambre;
  hotelId: number;
  countryCode: string;
}

// Map des labels de pension
const PENSION_LABELS: Record<string, string> = {
  none: "Sans repas",
  breakfast: "Petit-déjeuner",
  half_board: "Demi-pension",
  full_board: "Pension complète",
  all_inclusive: "Tout inclus"
};

// Formatage du prix
function formatPrice(price: number, devise: string = "EUR"): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: devise,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

export default function RoomDetail({ chambre, hotelId, countryCode }: RoomDetailProps) {
  
  // Calculer le prix minimum
  const prixMinimum = chambre.offres.length > 0
    ? Math.min(...chambre.offres.map((o: Offre) => o.prix_nuit))
    : 0;

  return (
    <div className="bg-ui-bg-subtle min-h-[60vh] py-0">
      <div className="content-container">

        {/* GRILLE RESPONSIVE avec flex pour order mobile */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
          
          {/* ========================================
               BLOC 1 - PRIX MINIMUM (mobile: 1er, desktop: sidebar)
               ======================================== */}
          <div className="order-1 lg:order-2 lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-4 text-center">
              <p className="text-gray-500 mb-2">À partir de</p>
              <p className="text-4xl font-bold text-[#5fc8c2] mb-1">
                {formatPrice(prixMinimum)}
              </p>
              <p className="text-gray-500 text-sm">par nuit</p>
              
              <div className="mt-4 bg-[#e8f8f7] border border-[#5fc8c2] rounded-md p-3">
                <p className="text-sm text-gray-600">
                  <FiInfo className="inline mr-1 text-[#5fc8c2]" />
                  Prix pour {chambre.nbre_adults_max || 2} adulte(s)
                </p>
              </div>
            </div>
          </div>

          {/* ========================================
               BLOC 2 - HEADER CHAMBRE + INFOS (mobile: 2ème, desktop: main)
               ======================================== */}
          <div className="order-2 lg:order-1 lg:col-span-9">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-2xl font-bold text-[#5fc8c2] mb-4">
                {chambre.type_room} - {chambre.cat_room}
              </h1>
              
              {/* Caractéristiques */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-gray-100 rounded-md px-4 py-2 flex items-center gap-2">
                  <FiUsers className="text-[#5fc8c2]" />
                  <span className="text-gray-600">
                    <strong>{chambre.nbre_adults_max || 2}</strong> adultes
                  </span>
                </div>
                
                {(chambre.nbre_children_max ?? 0) > 0 && (
                  <div className="bg-gray-100 rounded-md px-4 py-2 flex items-center gap-2">
                    <FiUser className="text-[#5fc8c2]" />
                    <span className="text-gray-600">
                      <strong>{chambre.nbre_children_max}</strong> enfants
                    </span>
                  </div>
                )}
                
                {chambre.surface_m2 && (
                  <div className="bg-gray-100 rounded-md px-4 py-2 flex items-center gap-2">
                    <FiMaximize className="text-[#5fc8c2]" />
                    <span className="text-gray-600">
                      <strong>{chambre.surface_m2}</strong> m²
                    </span>
                  </div>
                )}
                
                {chambre.nbre_lit && (
                  <div className="bg-gray-100 rounded-md px-4 py-2 flex items-center gap-2">
                    <FiMoon className="text-[#5fc8c2]" />
                    <span className="text-gray-600">
                      <strong>{chambre.nbre_lit}</strong> lit(s)
                    </span>
                  </div>
                )}
              </div>
              
              {/* Description */}
              {chambre.description_room && (
                <div className="bg-gray-50 rounded-md p-4 mb-4">
                  <p className="text-gray-600">{chambre.description_room}</p>
                </div>
              )}

              {/* Informations complémentaires */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Informations</h3>
                <div className="flex flex-wrap gap-4">
                  {chambre.type_lit && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiMoon className="text-[#5fc8c2]" />
                      <span>{chambre.type_lit}</span>
                    </div>
                  )}
                  
                  {chambre.vue && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiMaximize className="text-[#5fc8c2]" />
                      <span>{chambre.vue}</span>
                    </div>
                  )}
                </div>
                
                <Link 
                  href={`/${countryCode}/hotels/${hotelId}?tab=offers`}
                  className="flex items-center gap-2 text-sm text-[#5fc8c2] hover:underline mt-4"
                >
                  <FiArrowLeft />
                  Retour aux chambres
                </Link>
              </div>
            </div>
          </div>

          {/* ========================================
               BLOC 3 - OFFRES DISPONIBLES (mobile: 3ème, desktop: main)
               ======================================== */}
          <div className="order-3 lg:order-3 lg:col-span-12">
            
            {/* Titre */}
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-xl font-bold text-[#5fc8c2]">
                Offres disponibles
              </h2>
              <span className="bg-[#5fc8c2] text-white text-sm px-3 py-1 rounded-full">
                {chambre.offres.length}
              </span>
            </div>

            {/* Aucune offre */}
            {chambre.offres.length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
                <FiInfo className="inline mr-2" />
                Aucune offre disponible pour cette chambre actuellement.
              </div>
            )}

            {/* Liste des offres */}
            <div className="space-y-4">
              {chambre.offres.map((offre: Offre) => (
                <OffreCard 
                  key={offre.id_offre} 
                  offre={offre} 
                  countryCode={countryCode}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPOSANT CARTE OFFRE
// ============================================================================

function OffreCard({ offre, countryCode }: { offre: Offre; countryCode: string }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-700">
            {offre.nom_offre || "Offre standard"}
          </h3>
          {offre.description_offre && (
            <p className="text-gray-500 text-sm mt-1">{offre.description_offre}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold text-[#5fc8c2]">
            {formatPrice(offre.prix_nuit, offre.devise)}
          </p>
          <p className="text-gray-500 text-sm">par nuit</p>
        </div>
      </div>
      
      <hr className="my-4" />
      
      {/* Détails */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        
        {/* Pension */}
        <div className="flex items-center gap-2 text-gray-600">
          <FiCoffee className="text-[#5fc8c2]" />
          <span>
            <strong>Pension :</strong> {(offre.pension && PENSION_LABELS[offre.pension]) || offre.pension || "Non spécifié"}
          </span>
        </div>
        
        {/* Petit-déjeuner */}
        {offre.petit_dejeuner_inclus && (
          <div className="flex items-center gap-2 text-gray-600">
            <FiCheck className="text-[#5fc8c2]" />
            <strong>Petit-déjeuner inclus</strong>
          </div>
        )}
        
        {/* Remboursable */}
        <div className="flex items-center gap-2 text-gray-600">
          {offre.remboursable ? (
            <>
              <FiCheck className="text-[#5fc8c2]" />
              <strong>Remboursable</strong>
            </>
          ) : (
            <>
              <FiX className="text-red-400" />
              <strong>Non remboursable</strong>
            </>
          )}
        </div>
      </div>
      
      {/* Bouton réserver */}
      <div className="text-right">
        <Link 
          href={`/${countryCode}/booking/${offre.id_offre}`}
          className="inline-flex items-center gap-2 bg-[#5fc8c2] hover:bg-[#4eb8b2] text-white font-medium px-6 py-3 rounded-lg transition-colors"
        >
          <FiCalendar />
          Réserver cette offre
        </Link>
      </div>
    </div>
  );
}