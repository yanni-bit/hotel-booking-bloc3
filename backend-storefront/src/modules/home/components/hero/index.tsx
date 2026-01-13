"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

const slides = [
  { image: "/images/slide-1.jpg", alt: "Hôtel de luxe 1" },
  { image: "/images/slide-2.jpg", alt: "Hôtel de luxe 2" },
  { image: "/images/slide-3.jpg", alt: "Hôtel de luxe 3" },
]

const bookingTypes = [
  { id: "hotel", label: "Hôtel", enabled: true },
  { id: "vol", label: "Vol", enabled: false },
  { id: "vol-hotel", label: "Vol+Hôtel", enabled: false },
  { id: "studio", label: "Studio", enabled: false },
  { id: "croisiere", label: "Croisière", enabled: false },
  { id: "voiture", label: "Voiture", enabled: false },
]

const cities = [
  "Paris", "Amsterdam", "St Petersburg", "Prague",
  "Londres", "Rome", "Barcelone", "Vienne",
]

const Hero = () => {
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [bookingType, setBookingType] = useState("hotel")
  const [selectedCity, setSelectedCity] = useState("")
  const [checkinDate, setCheckinDate] = useState("")
  const [checkoutDate, setCheckoutDate] = useState("")
  const [rooms, setRooms] = useState(1)
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)

  const [errors, setErrors] = useState({ city: "", checkin: "", checkout: "", adults: "" })
  const [touched, setTouched] = useState({ city: false, checkin: false, checkout: false, adults: false })

  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  // Validation
  const validateCity = (value: string) => !value ? "Veuillez sélectionner une destination" : ""
  const validateCheckin = (value: string) => {
    if (!value) return "Veuillez sélectionner une date d'arrivée"
    if (value < today) return "La date ne peut pas être dans le passé"
    return ""
  }
  const validateCheckout = (checkin: string, checkout: string) => {
    if (!checkout) return "Veuillez sélectionner une date de départ"
    if (checkin && checkout <= checkin) return "La date de départ doit être après l'arrivée"
    return ""
  }
  const validateAdults = (value: number) => {
    if (!value || value < 1) return "Minimum 1 adulte requis"
    if (value > 20) return "Maximum 20 adultes"
    return ""
  }

  // Handlers
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setSelectedCity(value)
    setTouched((prev) => ({ ...prev, city: true }))
    setErrors((prev) => ({ ...prev, city: validateCity(value) }))
  }

  const handleCheckinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCheckinDate(value)
    setTouched((prev) => ({ ...prev, checkin: true }))
    setErrors((prev) => ({
      ...prev,
      checkin: validateCheckin(value),
      checkout: validateCheckout(value, checkoutDate),
    }))
  }

  const handleCheckoutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setCheckoutDate(value)
    setTouched((prev) => ({ ...prev, checkout: true }))
    setErrors((prev) => ({ ...prev, checkout: validateCheckout(checkinDate, value) }))
  }

  const handleAdultsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = Math.max(1, Math.min(20, parseInt(e.target.value) || 1))
    setAdults(value)
    setTouched((prev) => ({ ...prev, adults: true }))
    setErrors((prev) => ({ ...prev, adults: validateAdults(value) }))
  }

  const handleRoomsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRooms(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))
  }

  const handleChildrenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChildren(Math.max(0, Math.min(10, parseInt(e.target.value) || 0)))
  }

  const handleSearch = () => {
    setTouched({ city: true, checkin: true, checkout: true, adults: true })
    const newErrors = {
      city: validateCity(selectedCity),
      checkin: validateCheckin(checkinDate),
      checkout: validateCheckout(checkinDate, checkoutDate),
      adults: validateAdults(adults),
    }
    setErrors(newErrors)
    if (Object.values(newErrors).some((e) => e !== "")) return
    console.log("✅ Recherche:", { bookingType, selectedCity, checkinDate, checkoutDate, rooms, adults, children })
  }

  // Navigation
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const previousSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  const goToSlide = (index: number) => setCurrentSlide(index)

  const getValidationClass = (field: keyof typeof errors) => {
    if (!touched[field]) return ""
    return errors[field] ? "form-invalid" : "form-valid"
  }

  return (
    <div className="carousel-container">
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`carousel-slide ${currentSlide === index ? "opacity-100" : "opacity-0"}`}
          >
            <img src={slide.image} alt={slide.alt} className="w-full h-full object-cover" />
          </div>
        ))}
      </div>

      {/* Navigation */}
      <button className="carousel-nav-btn left-5" onClick={previousSlide} aria-label="Image précédente">
        &#10094;
      </button>
      <button className="carousel-nav-btn right-5" onClick={nextSlide} aria-label="Image suivante">
        &#10095;
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2.5 carousel-dots">
        {slides.map((_, index) => (
          <span
            key={index}
            className={`carousel-dot ${currentSlide === index ? "carousel-dot-active" : "carousel-dot-inactive"}`}
            onClick={() => goToSlide(index)}
            role="button"
            tabIndex={0}
            aria-label={`Aller à l'image ${index + 1}`}
            onKeyDown={(e) => e.key === "Enter" && goToSlide(index)}
          />
        ))}
      </div>

      {/* Formulaire de recherche */}
      <div className="search-overlay">
        <div className="search-content">
          <div className="search-grid">
            
            {/* COLONNE 1 : QUOI ? */}
            <div className="search-column">
              <h5 className="search-column-title">
                <em className="search-column-number">01</em> Quoi ?
              </h5>
              <div className="search-column-content">
                <fieldset className="border-none p-0 m-0">
                  <legend className="sr-only">Type de réservation</legend>
                  <div className="flex gap-4">
                    {[0, 3].map((start) => (
                      <div key={start} className="flex flex-col gap-2">
                        {bookingTypes.slice(start, start + 3).map((type) => (
                          <label
                            key={type.id}
                            className={`radio-label ${!type.enabled ? "radio-label-disabled" : ""}`}
                          >
                            <input
                              type="radio"
                              name="bookingType"
                              value={type.id}
                              checked={bookingType === type.id}
                              onChange={(e) => setBookingType(e.target.value)}
                              disabled={!type.enabled}
                              className="radio-input"
                            />
                            <span className={!type.enabled ? "line-through" : ""}>{type.label}</span>
                          </label>
                        ))}
                      </div>
                    ))}
                  </div>
                </fieldset>
              </div>
            </div>

            {/* COLONNE 2 : OÙ ? */}
            <div className="search-column">
              <h5 className="search-column-title">
                <em className="search-column-number">02</em> Où ?
              </h5>
              <div className="search-column-content">
                <label htmlFor="destination" className="form-label">Votre destination</label>
                <select
                  id="destination"
                  className={`form-input ${getValidationClass("city")}`}
                  value={selectedCity}
                  onChange={handleCityChange}
                  onBlur={() => setTouched((prev) => ({ ...prev, city: true }))}
                >
                  <option value="">Sélectionnez une ville</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {touched.city && errors.city && <div className="form-error">{errors.city}</div>}
              </div>
            </div>

            {/* COLONNE 3 : QUAND ? */}
            <div className="search-column border-r-0 md:border-r">
              <h5 className="search-column-title">
                <em className="search-column-number">03</em> Quand ?
              </h5>
              <div className="search-column-content">
                <div className="flex gap-1.5">
                  <div className="flex-1 min-w-0">
                    <label htmlFor="checkin" className="form-label">Arrivée</label>
                    <input
                      type="date"
                      id="checkin"
                      className={`form-input-date ${getValidationClass("checkin")}`}
                      value={checkinDate}
                      min={today}
                      onChange={handleCheckinChange}
                      onBlur={() => setTouched((prev) => ({ ...prev, checkin: true }))}
                    />
                    {touched.checkin && errors.checkin && <div className="form-error">{errors.checkin}</div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <label htmlFor="checkout" className="form-label">Départ</label>
                    <input
                      type="date"
                      id="checkout"
                      className={`form-input-date ${getValidationClass("checkout")}`}
                      value={checkoutDate}
                      min={checkinDate || today}
                      onChange={handleCheckoutChange}
                      onBlur={() => setTouched((prev) => ({ ...prev, checkout: true }))}
                    />
                    {touched.checkout && errors.checkout && <div className="form-error">{errors.checkout}</div>}
                  </div>
                </div>
              </div>
            </div>

            {/* COLONNE 4 : QUI ? */}
            <div>
              <h5 className="search-column-title">
                <em className="search-column-number">04</em> Qui ?
              </h5>
              <div className="search-column-content">
                <div className="flex gap-2.5">
                  <div className="flex-1">
                    <label htmlFor="rooms" className="form-label">Chambres</label>
                    <input type="number" id="rooms" className="form-input-number" value={rooms} min={1} max={10} onChange={handleRoomsChange} />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="adults" className="form-label">Adultes</label>
                    <input
                      type="number"
                      id="adults"
                      className={`form-input-number ${getValidationClass("adults")}`}
                      value={adults}
                      min={1}
                      max={20}
                      onChange={handleAdultsChange}
                      onBlur={() => setTouched((prev) => ({ ...prev, adults: true }))}
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="children" className="form-label">Enfants</label>
                    <input type="number" id="children" className="form-input-number" value={children} min={0} max={10} onChange={handleChildrenChange} />
                  </div>
                </div>
                {touched.adults && errors.adults && <div className="form-error">{errors.adults}</div>}
              </div>
            </div>
          </div>

          {/* Bouton */}
          <div className="pt-1 flex justify-center">
            <button type="button" className="btn-search" onClick={handleSearch}>
              Rechercher
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero