"use client"

import Link from "next/link"
import { FaBuilding } from "react-icons/fa"

// 1. On définit la structure des données que le composant va recevoir
interface DestinationProps {
  destinations: {
    ville: string
    pays: string
    count: number
    image: string | null
  }[]
}

// 2. On ajoute { destinations } comme paramètre (prop)
const Destinations = ({ destinations }: DestinationProps) => {
  return (
    <section className="destinations-section">
      <div className="max-w-[1200px] mx-auto px-4">
        
        <div className="section-header">
          <h2 className="section-title">Meilleures Destinations Autour du Monde</h2>
          <p className="section-subtitle">Explorez nos destinations les plus populaires</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 3. On utilise .map() sur les données reçues de la BDD */}
          {destinations?.map((dest, index) => (
            <div key={index} className="destination-card">
              <div className="destination-card-image">
                <img src={dest.image || "/images/placeholder.jpg"} alt={dest.ville} />
                <div className="destination-overlay">
                  <div className="destination-info">
                    <h3 className="destination-name">{dest.ville}</h3>
                    <p className="destination-country">{dest.pays}</p>
                    <div className="destination-stats">
                      <span className="flex items-center gap-1">
                        <FaBuilding /> {dest.count} hôtels
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="destination-card-footer">
                <Link href={`/hotels?city=${dest.ville}`} className="btn-destination">
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