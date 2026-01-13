"use client"

import { useState, useEffect } from "react"
import styles from "./hero.module.css"

// Images du carrousel (depuis public/images/)
const slides = [
  {
    image: "/images/slide-1.jpg",
    alt: "Hôtel de luxe 1"
  },
  {
    image: "/images/slide-2.jpg",
    alt: "Hôtel de luxe 2"
  },
  {
    image: "/images/slide-3.jpg",
    alt: "Hôtel de luxe 3"
  }
]

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  // Auto-advancement du carrousel (toutes les 5 secondes)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const previousSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  return (
    <div className={styles.hotelCarousel}>
      {/* Slides */}
      <div className={styles.slidesContainer}>
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`${styles.hotelSlide} ${currentSlide === index ? styles.active : ""}`}
          >
            <img src={slide.image} alt={slide.alt} />
          </div>
        ))}
      </div>

      {/* Boutons de navigation */}
      <button 
        className={`${styles.navBtn} ${styles.prev}`} 
        onClick={previousSlide} 
        aria-label="Image précédente"
      >
        &#10094;
      </button>
      <button 
        className={`${styles.navBtn} ${styles.next}`} 
        onClick={nextSlide} 
        aria-label="Image suivante"
      >
        &#10095;
      </button>

      {/* Indicateurs (dots) */}
      <div className={styles.dots}>
        {slides.map((_, index) => (
          <span
            key={index}
            className={`${styles.dot} ${currentSlide === index ? styles.active : ""}`}
            onClick={() => goToSlide(index)}
            role="button"
            tabIndex={0}
            aria-label={`Aller à l'image ${index + 1}`}
            onKeyDown={(e) => e.key === 'Enter' && goToSlide(index)}
          />
        ))}
      </div>

      {/* Overlay du formulaire de recherche */}
      <div className={styles.searchOverlay}>
        <div className={styles.searchContent}>
          <h2>Trouvez votre hôtel idéal</h2>
          <p className={styles.searchSubtitle}>Formulaire de recherche - Phase 2</p>
          
          {/* Placeholder pour les 4 colonnes du formulaire */}
          <div className={styles.searchPlaceholder}>
            <div className={styles.searchColumn}>
              <span className={styles.columnNumber}>01</span>
              <span>Quoi ?</span>
            </div>
            <div className={styles.searchColumn}>
              <span className={styles.columnNumber}>02</span>
              <span>Où ?</span>
            </div>
            <div className={styles.searchColumn}>
              <span className={styles.columnNumber}>03</span>
              <span>Quand ?</span>
            </div>
            <div className={styles.searchColumn}>
              <span className={styles.columnNumber}>04</span>
              <span>Qui ?</span>
            </div>
          </div>

          <button className={styles.searchButton}>
            Rechercher
          </button>
        </div>
      </div>
    </div>
  )
}

export default Hero