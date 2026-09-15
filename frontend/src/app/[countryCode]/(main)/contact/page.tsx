// ============================================================================
// PAGE CONTACT - Next.js 15
// Équivalent de contact.ts + contact.html Angular
// ============================================================================
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FiPhone, FiMail, FiSend, FiCheck, FiAlertTriangle } from 'react-icons/fi'

// ============================================================================
// TYPES
// ============================================================================
interface FormData {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

interface FormErrors {
  name?: string
  email?: string
  subject?: string
  message?: string
}

// ============================================================================
// COMPOSANT PRINCIPAL
// ============================================================================
export default function ContactPage() {
  // ──────────────────────────────────────────────────────────────────────────
  // STATE - Équivalent Angular: FormGroup + propriétés du composant
  // Angular: this.contactForm = this.fb.group({...})
  // React: useState pour chaque état
  // ──────────────────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // ──────────────────────────────────────────────────────────────────────────
  // VALIDATION - Équivalent Angular: Validators.required, Validators.email, etc.
  // Angular: Validators intégrés dans FormBuilder
  // React: Fonction de validation manuelle
  // ──────────────────────────────────────────────────────────────────────────
  const validate = (): FormErrors => {
    const newErrors: FormErrors = {}

    // Nom: requis, min 2 caractères
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Le nom doit contenir au moins 2 caractères'
    }

    // Email: requis, format valide
    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "L'email n'est pas valide"
    }

    // Sujet: requis
    if (!formData.subject) {
      newErrors.subject = 'Veuillez sélectionner un sujet'
    }

    // Message: requis, min 10 caractères
    if (!formData.message.trim()) {
      newErrors.message = 'Le message est requis'
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Le message doit contenir au moins 10 caractères'
    }

    return newErrors
  }

  // ──────────────────────────────────────────────────────────────────────────
  // HANDLERS - Équivalent Angular: formControlName binding
  // Angular: formControlName="name" (binding automatique)
  // React: onChange={(e) => setFormData({...})} (binding manuel)
  // ──────────────────────────────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Valider en temps réel si le champ a été touché
    if (touched[name]) {
      const newErrors = validate()
      setErrors(prev => ({ ...prev, [name]: newErrors[name as keyof FormErrors] }))
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // BLUR HANDLER - Équivalent Angular: touched state
  // Angular: f['name'].touched (automatique)
  // React: onBlur pour marquer comme touché
  // ──────────────────────────────────────────────────────────────────────────
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target
    setTouched(prev => ({ ...prev, [name]: true }))
    
    // Valider le champ
    const newErrors = validate()
    setErrors(prev => ({ ...prev, [name]: newErrors[name as keyof FormErrors] }))
  }

  // ──────────────────────────────────────────────────────────────────────────
  // SUBMIT - Équivalent Angular: (ngSubmit)="onSubmit()" + subscribe()
  // Angular: this.contactService.sendMessage().subscribe({ next, error })
  // React: async/await avec fetch + try/catch
  // ──────────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Marquer tous les champs comme touchés (Angular: markAllAsTouched())
    setTouched({
      name: true,
      email: true,
      subject: true,
      message: true
    })

    // Valider
    const newErrors = validate()
    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      return
    }

    setIsSubmitting(true)
    setShowSuccess(false)
    setShowError(false)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: formData.name,
          email: formData.email,
          telephone: formData.phone || null,
          sujet: formData.subject,
          message: formData.message
        })
      })

      const data = await response.json()

      if (data.success) {
        setShowSuccess(true)
        // Reset form
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
        setTouched({})
        setErrors({})
        
        // Masquer après 5 secondes
        setTimeout(() => setShowSuccess(false), 5000)
      } else {
        setShowError(true)
        setErrorMessage(data.message || 'Une erreur est survenue')
        setTimeout(() => setShowError(false), 5000)
      }
    } catch (error) {
      console.error('Erreur envoi message:', error)
      setShowError(true)
      setErrorMessage('Une erreur est survenue. Veuillez réessayer plus tard.')
      setTimeout(() => setShowError(false), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // HELPER - Classes pour les inputs
  // Angular: [class.is-invalid]="f['name'].touched && f['name'].invalid"
  // React: Fonction utilitaire pour construire les classes
  // ──────────────────────────────────────────────────────────────────────────
  const getInputClasses = (fieldName: keyof FormErrors) => {
    const baseClasses = 'w-full px-4 py-3 border-2 rounded-lg transition-all duration-200 focus:outline-none'
    
    if (touched[fieldName] && errors[fieldName]) {
      return `${baseClasses} border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200`
    }
    if (touched[fieldName] && !errors[fieldName]) {
      return `${baseClasses} border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-200`
    }
    return `${baseClasses} border-gray-200 focus:border-turquoise focus:ring-2 focus:ring-turquoise/20`
  }

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER - Équivalent Angular: Template HTML
  // Angular: *ngIf, {{ 'key' | translate }}, [class.xxx]
  // React: {condition && ...}, texte direct, className={...}
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <main className="pb-12 pt-8 bg-gray-50 min-h-[calc(100vh-200px)]">
      <div className="content-container">
        
        {/* ═══════════════════════════════════════════════════════════════════
            BREADCRUMB - Fil d'Ariane
            Angular: <nav aria-label="breadcrumb">
            ═══════════════════════════════════════════════════════════════════ */}
        <nav className="mb-4" aria-label="Fil d'Ariane">
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link href="/" className="text-turquoise hover:text-turquoise-dark hover:underline">
                Accueil
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-500">Contact</li>
          </ol>
        </nav>

        {/* ═══════════════════════════════════════════════════════════════════
            HEADER - En-tête de page
            Angular: {{ 'contact.title' | translate }}
            ═══════════════════════════════════════════════════════════════════ */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Contactez-nous</h1>
          <p className="text-gray-500 text-lg">
            Une question ? N&apos;hésitez pas à nous contacter
          </p>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            LAYOUT 2 COLONNES
            Angular: <div class="row g-4"> avec col-lg-7 et col-lg-5
            React/Tailwind: grid avec lg:grid-cols-12
            ═══════════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* ─────────────────────────────────────────────────────────────────
              COLONNE GAUCHE (7/12) - Map + Cartes info
              ───────────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Google Maps */}
            <div className="rounded-xl overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3105.2302828527404!2d-77.03495072365499!3d38.895848946794814!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89b7b797ef60a829%3A0x308f6aa1bf4c84c5!2s1400%20Pennsylvania%20Ave%20NW%2C%20Washington%2C%20DC%2020004%2C%20%C3%89tats-Unis!5e0!3m2!1sfr!2sfr!4v1764687652916!5m2!1sfr!2sfr"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localisation Book Your Travel"
                className="block"
              />
            </div>

            {/* Cartes Téléphone + Email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Carte Téléphone */}
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-turquoise/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiPhone className="w-6 h-6 text-turquoise" />
                  </div>
                  <h3 className="font-semibold text-gray-800">Téléphone</h3>
                </div>
                <p className="text-gray-500 text-sm mb-1">Du lundi au vendredi, 9h-18h</p>
                <a 
                  href="tel:+15555555555" 
                  className="text-turquoise font-semibold text-lg hover:text-turquoise-dark hover:underline"
                >
                  1-555-555-5555
                </a>
              </div>

              {/* Carte Email */}
              <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-turquoise/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <FiMail className="w-6 h-6 text-turquoise" />
                  </div>
                  <h3 className="font-semibold text-gray-800">Email</h3>
                </div>
                <p className="text-gray-500 text-sm mb-1">Réponse sous 24h</p>
                <a 
                  href="mailto:booking@mail.com" 
                  className="text-turquoise font-semibold text-lg hover:text-turquoise-dark hover:underline"
                >
                  booking@mail.com
                </a>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────────
              COLONNE DROITE (5/12) - Formulaire
              Angular: <form [formGroup]="contactForm" (ngSubmit)="onSubmit()">
              React: <form onSubmit={handleSubmit}>
              ───────────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-5">
            <div className="bg-white p-8 rounded-xl shadow-lg sticky top-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Envoyez-nous un message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* ═══════════════════════════════════════════════════════════
                    CHAMP NOM
                    Angular: formControlName="name" + [class.is-invalid]
                    React: name="name" value={} onChange={} + className dynamique
                    ═══════════════════════════════════════════════════════════ */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getInputClasses('name')}
                  />
                  {/* Angular: *ngIf="f['name'].touched && f['name'].errors" */}
                  {touched.name && errors.name && (
                    <p className="mt-1 text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                {/* CHAMP EMAIL */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getInputClasses('email')}
                  />
                  {touched.email && errors.email && (
                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                {/* CHAMP TÉLÉPHONE (optionnel) */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Ex: 06 12 34 56 78"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg transition-all duration-200 focus:outline-none focus:border-turquoise focus:ring-2 focus:ring-turquoise/20"
                  />
                </div>

                {/* ═══════════════════════════════════════════════════════════
                    CHAMP SUJET (select)
                    Angular: <select formControlName="subject">
                    React: <select name="subject" value={} onChange={}>
                    ═══════════════════════════════════════════════════════════ */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Sujet <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={getInputClasses('subject')}
                  >
                    <option value="">Sélectionnez un sujet</option>
                    <option value="reservation">Réservation</option>
                    <option value="information">Demande d&apos;information</option>
                    <option value="reclamation">Réclamation</option>
                    <option value="autre">Autre</option>
                  </select>
                  {touched.subject && errors.subject && (
                    <p className="mt-1 text-sm text-red-500">{errors.subject}</p>
                  )}
                </div>

                {/* CHAMP MESSAGE (textarea) */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`${getInputClasses('message')} resize-y min-h-[120px]`}
                  />
                  {touched.message && errors.message && (
                    <p className="mt-1 text-sm text-red-500">{errors.message}</p>
                  )}
                </div>

                {/* ═══════════════════════════════════════════════════════════
                    BOUTON SUBMIT
                    Angular: [disabled]="isSubmitting" + *ngIf pour spinner
                    React: disabled={isSubmitting} + {isSubmitting && ...}
                    ═══════════════════════════════════════════════════════════ */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-6 bg-turquoise text-white font-semibold rounded-lg hover:bg-turquoise-dark hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <FiSend className="w-5 h-5" />
                      Envoyer le message
                    </>
                  )}
                </button>

                {/* ═══════════════════════════════════════════════════════════
                    MESSAGES SUCCÈS / ERREUR
                    Angular: *ngIf="showSuccess" / *ngIf="showError"
                    React: {showSuccess && ...} / {showError && ...}
                    ═══════════════════════════════════════════════════════════ */}
                {showSuccess && (
                  <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-lg flex items-center gap-3">
                    <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <p className="text-green-700">
                      Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.
                    </p>
                  </div>
                )}

                {showError && (
                  <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-center gap-3">
                    <FiAlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <p className="text-red-700">{errorMessage}</p>
                  </div>
                )}

              </form>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}