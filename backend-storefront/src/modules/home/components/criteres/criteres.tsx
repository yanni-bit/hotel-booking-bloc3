"use client"

const criteres = [
  {
    id: 1,
    title: "Hôtels Sélectionnés",
    text: "Tous les hôtels Book Your Travel répondent à des critères de sélection stricts.\nChaque hôtel est choisi individuellement et son inclusion ne peut être achetée."
  },
  {
    id: 2,
    title: "Descriptions Détaillées",
    text: "Afin de vous donner une impression précise de l'hôtel, nous nous efforçons de publier des descriptions transparentes, équilibrées et précises des hôtels."
  },
  {
    id: 3,
    title: "Connaissance Exclusive",
    text: "Nous avons fait nos recherches.\nNos éclaireurs sont toujours occupés à en apprendre davantage sur nos hôtels, les environs et les activités proposées à proximité."
  },
  {
    id: 4,
    title: "Service Passionné",
    text: "L'équipe de Book Your Travel répondra à vos demandes spéciales.\nNous offrons des conseils experts et passionnés pour trouver le bon hôtel."
  },
  {
    id: 5,
    title: "Meilleur Prix Garanti",
    text: "Nous offrons les meilleurs hôtels aux meilleurs prix.\nSi vous trouvez la même catégorie de chambre aux mêmes dates moins chère ailleurs, nous vous rembourserons la différence.\nGaranti, et rapidement."
  },
  {
    id: 6,
    title: "Réservation Sécurisée",
    text: "Le système de réservation de Book Your Travel est sécurisé et votre carte de crédit ainsi que vos informations personnelles sont cryptées.\nNous travaillons selon des normes élevées et garantissons votre confidentialité."
  },
  {
    id: 7,
    title: "Avantages Hôteliers",
    text: "Nous fournissons un modèle rentable, un réseau de plus de 5000 partenaires et un service de gestion de compte personnalisé pour vous aider à optimiser vos revenus."
  },
  {
    id: 8,
    title: "Des Questions ?",
    text: "Appelez-nous au 1-555-555-555 pour des conseils personnalisés et sur mesure pour votre séjour parfait ou envoyez-nous un message avec votre demande de réservation d'hôtel."
  }
]

const Criteres = () => {
  return (
    <section className="criteres-section">
      <div className="max-w-[1200px] mx-auto px-4">

        {/* Grille des critères */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {criteres.map((critere) => (
            <div key={critere.id} className="info-card">
              <div className="info-card-body">
                <h3 className="info-card-title">{critere.title}</h3>
                <p className="info-card-text">{critere.text}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

export default Criteres