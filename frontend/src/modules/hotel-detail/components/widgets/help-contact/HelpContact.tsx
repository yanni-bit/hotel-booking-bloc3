// src/modules/hotel-detail/components/widgets/help-contact/HelpContact.tsx
// ============================================================================
// Widget "Besoin d'aide"
// Équivalent de help-contact.component Angular
// ============================================================================

import { FaHeadset, FaEnvelope, FaPhone } from "react-icons/fa"
import Link from "next/link"

export default function HelpContact() {
  return (
    <div className="help-contact bg-gradient-to-br from-turquoise to-turquoise-dark rounded-lg shadow-sm p-5 text-white mt-4">
      
      {/* Icône */}
      <div className="flex items-center mb-3">
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-3">
          <FaHeadset className="text-2xl" />
        </div>
        <div>
          <h3 className="font-bold">Besoin d&apos;aide ?</h3>
          <p className="text-sm text-white/80">Notre équipe est là pour vous</p>
        </div>
      </div>
      
      {/* Contact */}
      <div className="space-y-2 text-sm">
        <a 
          href="tel:+33123456789" 
          className="flex items-center hover:text-white/80 transition-colors"
        >
          <FaPhone className="mr-2" />
          +33 1 23 45 67 89
        </a>
        <a 
          href="mailto:contact@hotelbooking.com" 
          className="flex items-center hover:text-white/80 transition-colors"
        >
          <FaEnvelope className="mr-2" />
          contact@hotelbooking.com
        </a>
      </div>
      
      {/* Bouton contact */}
      <Link 
        href="/contact"
        className="mt-4 block w-full text-center bg-white text-turquoise font-medium py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors"
      >
        Nous contacter
      </Link>
      
    </div>
  )
}
