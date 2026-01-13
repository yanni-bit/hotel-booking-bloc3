"use client"

import Link from "next/link"
import { FaBuilding, FaPlane } from "react-icons/fa"

const destinations = [
  { id: 1, title: "Paris", pays: "France", nombrehotels: "12", prix: 190, image: "/images/paris.jpg", badge: "PROMO" },
  { id: 2, title: "Amsterdam", pays: "Netherlands", nombrehotels: "8", prix: 180, image: "/images/amsterdam.jpg", badge: "" },
  { id: 3, title: "St Petersburg", pays: "Russia", nombrehotels: "5", prix: 180, image: "/images/saint-petersburg.jpg", badge: "" },
  { id: 4, title: "Prague", pays: "Czech Republic", nombrehotels: "7", prix: 190, image: "/images/prague.jpg", badge: "" },
  { id: 5, title: "Tahiti", pays: "French Polynesia", nombrehotels: "4", prix: 1190, image: "/images/offre-4.jpg", badge: "NOUVEAU" },
  { id: 6, title: "Zanzibar", pays: "Tanzania", nombrehotels: "3", prix: 1180, image: "/images/zanzibar.webp", badge: "" },
  { id: 7, title: "Maldives", pays: "Maldives", nombrehotels: "6", prix: 2320, image: "/images/maldives.jpg", badge: "" },
  { id: 8, title: "Cancun", pays: "Mexico", nombrehotels: "9", prix: 1590, image: "/images/cancun.jpg", badge: "" },
  { id: 9, title: "Dubai", pays: "United Arab Emirates", nombrehotels: "15", prix: 310, image: "/images/dubai.jpg", badge: "" },
  { id: 10, title: "Bali", pays: "Indonesia", nombrehotels: "11", prix: 1680, image: "/images/bali.jpg", badge: "" },
  { id: 11, title: "New York", pays: "United States", nombrehotels: "20", prix: 760, image: "/images/new-york.webp", badge: "" },
  { id: 12, title: "Tokyo", pays: "Japan", nombrehotels: "10", prix: 980, image: "/images/tokyo.jpg", badge: "" }
]

const Destinations = () => {
  return (
    <section className="destinations-section">
      <div className="max-w-[1200px] mx-auto px-4">
        
        {/* En-tête */}
        <div className="section-header">
          <h2 className="section-title">Meilleures Destinations Autour du Monde</h2>
          <p className="section-subtitle">Explorez nos destinations les plus populaires</p>
        </div>

        {/* Grille des destinations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((dest) => (
            <div key={dest.id} className="destination-card">
              <div className="destination-card-image">
                <img src={dest.image} alt={dest.title} />
                {dest.badge && <span className="offre-badge">{dest.badge}</span>}
                <div className="destination-overlay">
                  <div className="destination-info">
                    <h3 className="destination-name">{dest.title}</h3>
                    <p className="destination-country">{dest.pays}</p>
                    <div className="destination-stats">
                      <span className="flex items-center gap-1">
                        <FaBuilding /> {dest.nombrehotels} hôtels
                      </span>
                      <span className="flex items-center gap-1">
                        <FaPlane /> À partir de {dest.prix}€
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="destination-card-footer">
                <Link href={`/hotels/${dest.title}`} className="btn-destination">
                  Voir les hôtels →
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

export default Destinations