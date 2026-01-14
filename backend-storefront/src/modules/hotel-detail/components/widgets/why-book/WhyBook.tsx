// src/modules/hotel-detail/components/widgets/why-book/WhyBook.tsx
// ============================================================================
// Widget "Pourquoi réserver chez nous"
// Équivalent de why-book.component Angular
// ============================================================================

import { 
  FaShieldAlt, 
  FaCreditCard, 
  FaHeadset, 
  FaPercent,
  FaCheck
} from "react-icons/fa"

const reasons = [
  {
    icon: FaPercent,
    title: "Meilleur prix garanti",
    description: "Nous alignons les prix si vous trouvez moins cher"
  },
  {
    icon: FaShieldAlt,
    title: "Paiement sécurisé",
    description: "Vos données sont protégées"
  },
  {
    icon: FaCreditCard,
    title: "Annulation gratuite",
    description: "Sur la plupart des offres"
  },
  {
    icon: FaHeadset,
    title: "Support 24/7",
    description: "Une équipe à votre écoute"
  },
]

export default function WhyBook() {
  return (
    <div className="why-book bg-white rounded-lg shadow-sm p-5">
      
      {/* En-tête */}
      <h3 className="text-lg font-bold text-gray-800 mb-4 pb-3 border-b">
        Pourquoi réserver chez nous ?
      </h3>
      
      {/* Liste des avantages */}
      <ul className="space-y-4">
        {reasons.map((reason, index) => {
          const Icon = reason.icon
          return (
            <li key={index} className="flex items-start">
              <div className="flex-shrink-0 w-10 h-10 bg-turquoise/10 rounded-full flex items-center justify-center mr-3">
                <Icon className="text-turquoise" />
              </div>
              <div>
                <h4 className="font-medium text-gray-800 text-sm">
                  {reason.title}
                </h4>
                <p className="text-xs text-gray-500">
                  {reason.description}
                </p>
              </div>
            </li>
          )
        })}
      </ul>
      
      {/* Badge de confiance */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center text-green-600 text-sm">
          <FaCheck className="mr-2" />
          <span>Réservation confirmée instantanément</span>
        </div>
      </div>
      
    </div>
  )
}
