"use client"

import { useState } from "react"
import Link from "next/link"
import { FaFacebookF, FaYoutube, FaLinkedinIn, FaPinterestP, FaVimeoV } from "react-icons/fa"
import { FaXTwitter } from "react-icons/fa6"

const supportLinks = [
  { href: "/faq", label: "FAQ" },
  { href: "/how-to-book", label: "Comment réserver" },
  { href: "/payment-options", label: "Options de paiement" },
  { href: "/booking-tips", label: "Conseils de réservation" },
]

const legalLinks = [
  { href: "/about", label: "À propos" },
  { href: "/contact", label: "Contact" },
  { href: "/partners", label: "Partenaires" },
  { href: "/customer-service", label: "Service client" },
  { href: "/faq", label: "FAQ" },
  { href: "/careers", label: "Carrières" },
  { href: "/terms", label: "CGV" },
  { href: "/privacy", label: "Confidentialité" },
]

const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState("")

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newsletterEmail.trim()) {
      console.log("Newsletter inscription:", newsletterEmail)
      setNewsletterEmail("")
    }
  }

  return (
    <div>
      <footer className="footer-main">
        <div className="footer-grid">
          
          <div className="footer-section">
            <h2 className="footer-title">Book Your Travel</h2>
            <p className="footer-text">1234 Rue de la Paix</p>
            <p className="footer-text">75001 Paris, France</p>
            <p className="footer-text">
              <em className="text-turquoise not-italic font-bold">P:</em> 1-555-555-5555
            </p>
            <p className="footer-text">
              <em className="text-turquoise not-italic font-bold">E:</em>{" "}
              <a href="mailto:booking@mail.com" className="footer-link">booking@mail.com</a>
            </p>
          </div>

          <div className="footer-section">
            <h2 className="footer-title">Support</h2>
            <ul className="footer-list">
              {supportLinks.map((link) => (
                <li key={link.href} className="footer-list-item">
                  <Link href={link.href} className="footer-link">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-section">
            <h2 className="footer-title">Suivez-nous</h2>
            <ul className="flex flex-wrap gap-2.5 mt-3">
              <li>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="social-icon">
                  <FaFacebookF />
                </a>
              </li>
              <li>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="social-icon">
                  <FaYoutube />
                </a>
              </li>
              <li>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="social-icon">
                  <FaLinkedinIn />
                </a>
              </li>
              <li>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="social-icon">
                  <FaXTwitter />
                </a>
              </li>
              <li>
                <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" aria-label="Pinterest" className="social-icon">
                  <FaPinterestP />
                </a>
              </li>
              <li>
                <a href="https://vimeo.com" target="_blank" rel="noopener noreferrer" aria-label="Vimeo" className="social-icon">
                  <FaVimeoV />
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-section">
            <h2 className="footer-title">Newsletter</h2>
            <p className="footer-text mb-3">Inscrivez-vous pour recevoir nos offres exclusives</p>
            <form onSubmit={handleNewsletterSubmit}>
              <label htmlFor="newsletter-email" className="sr-only">Votre email</label>
              <div className="flex">
                <input
                  type="email"
                  id="newsletter-email"
                  className="newsletter-input"
                  placeholder="Votre email"
                  required
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                />
                <button type="submit" className="newsletter-btn">OK</button>
              </div>
            </form>
          </div>

        </div>
      </footer>

      <div className="footer-bottom">
        <p className="text-center mb-2">© {new Date().getFullYear()} Book Your Travel. Tous droits réservés.</p>
        <nav>
          <ul className="flex flex-wrap justify-center gap-0">
            {legalLinks.map((link, index) => (
              <li key={link.href + index} className={`px-3 ${index !== 0 ? "border-l border-gray-300" : ""}`}>
                <Link href={link.href} className="footer-bottom-link">{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}

export default Footer