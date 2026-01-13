"use client"

import Link from "next/link"

const offres = [
  {
    id: 1,
    title: "Escapades Hivernales à la Plage",
    description: "Profitez de plages ensoleillées avec des réductions hivernales exclusives",
    image: "/images/offre-1.jpg",
    badge: "30% OFF",
    ville: "Cancun",
    hotelId: 65
  },
  {
    id: 2,
    title: "Passez le Réveillon à Paris",
    description: "Vivez la magie de Paris pendant les fêtes",
    image: "/images/paris.jpg",
    badge: "PROMO",
    ville: "Paris",
    hotelId: 1
  },
  {
    id: 3,
    title: "Une Nuit de Noces Paradisiaque",
    description: "Nuit de Noces aux Maldives, luxe total face à l'océan",
    image: "/images/nuit_de_noces.jpg",
    badge: "HOT DEAL",
    ville: "Maldives",
    hotelId: 52
  },
  {
    id: 4,
    title: "Notre Meilleure Offre de la Semaine : Tahiti",
    description: "Découvrez le paradis à des prix imbattables",
    image: "/images/offre-4.jpg",
    badge: "NOUVEAU",
    ville: "Tahiti",
    hotelId: 35
  }
]

const Offres = () => {
  return (
    <section className="offres-section">
      <div className="max-w-[1200px] mx-auto px-4">
        
        {/* En-tête */}
        <div className="section-header">
          <h2 className="section-title">Nos Dernières Offres</h2>
          <p className="section-subtitle">Découvrez nos meilleures promotions du moment</p>
        </div>

        {/* Grille des offres */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {offres.map((offre) => (
            <div key={offre.id} className="offre-card">
              <div className="offre-card-image">
                <img src={offre.image} alt={offre.title} />
                <span className="offre-badge">{offre.badge}</span>
              </div>
              <div className="offre-card-body">
                <h3 className="offre-card-title">{offre.title}</h3>
                <p className="offre-card-text">{offre.description}</p>
                <Link href={`/hotels/${offre.ville}/${offre.hotelId}`} className="btn-offre">
                  Réserver
                </Link>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

export default Offres