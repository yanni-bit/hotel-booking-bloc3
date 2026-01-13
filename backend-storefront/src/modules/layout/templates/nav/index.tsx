"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import styles from "./nav.module.css"

const Nav = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Rediriger vers la page de recherche
      window.location.href = `/hotels?search=${encodeURIComponent(searchQuery)}`
    }
  }

  const handleSearchKeyup = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <>
      {/* LIEN D'ÉVITEMENT (Accessibilité) */}
      <a href="#main-content" className={styles.skipLink}>
        Aller au contenu principal
      </a>

      {/* HEADER PRINCIPAL */}
      <header className={styles.baseHeader}>
        <div className={styles.headerContainer}>
          <div className={styles.headerTop}>

            {/* LOGO */}
            <div className={styles.headerLogo}>
              <Link href="/" className={styles.logoLink}>
                <img 
                  src="/images/logo.png" 
                  alt="Book Your Travel" 
                  className={styles.logoImg}
                />
              </Link>
            </div>

            {/* BOUTON DYSLEXIE */}
            <div className={styles.headerDyslexie}>
              <button 
                id="toggle-dyslexie" 
                className={styles.btnDyslexie}
                aria-label="Activer la police adaptée aux personnes dyslexiques"
                aria-pressed="false"
                title="Police pour dyslexie"
              >
                <span className={styles.dyslexieIcon}>♿</span>
                <span className={styles.dyslexieText}>Dyslexie</span>
              </button>
            </div>

            {/* BLOC CONTACT 24/7 */}
            <div className={styles.headerContact}>
              <div className={styles.blocContact}>
                <div className={styles.blocContactIco}>
                  <span>📞</span>
                </div>
                <div className={styles.textContact}>
                  <div className={styles.blocContactLabel}>Support 24/7</div>
                  <div className={styles.blocContactNumber}>1-555-555-555</div>
                </div>
              </div>
            </div>

            {/* BLOC RECHERCHE */}
            <div className={styles.headerSearch}>
              <div className={styles.blocSearch}>
                <input
                  type="search"
                  className={styles.blocSearchInput}
                  placeholder="Rechercher..."
                  aria-label="Rechercher sur le site"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyUp={handleSearchKeyup}
                />
                <button 
                  type="button" 
                  className={styles.blocSearchBtn}
                  onClick={handleSearch}
                  aria-label="Lancer la recherche"
                >
                  <span className={styles.blocSearchIco}>🔍</span>
                </button>
              </div>
            </div>

            {/* RUBAN TURQUOISE */}
            <div className={styles.ribbon}>
              <nav className={styles.ribbonNav}>
                
                {/* Connexion */}
                <div className={styles.ribbonItem}>
                  <Link href="/account" className={styles.ribbonBtn}>
                    👤 CONNEXION
                  </Link>
                </div>

                {/* Langue */}
                <div className={styles.ribbonItem}>
                  <button className={styles.ribbonBtn}>
                    Français FR ▾
                  </button>
                </div>

                {/* Devise */}
                <div className={styles.ribbonItem}>
                  <button className={styles.ribbonBtn}>
                    € EUR ▾
                  </button>
                </div>

              </nav>
            </div>

          </div>
        </div>
      </header>

      {/* NAVIGATION PRINCIPALE (Barre marron) */}
      <nav className={styles.navbar}>
        <div className={styles.navbarContainer}>
          
          {/* Bouton hamburger (mobile) */}
          <span className={styles.navbarBrand}>Menu</span>
          <button 
            className={styles.navbarToggler}
            type="button"
            onClick={toggleMenu}
            aria-label="Ouvrir le menu"
            aria-expanded={menuOpen}
          >
            <span className={styles.navbarTogglerIcon}>☰</span>
          </button>

          {/* Menu de navigation */}
          <div className={`${styles.navbarCollapse} ${menuOpen ? styles.show : ""}`}>
            <ul className={styles.navbarNav}>
              <li className={styles.navItem}>
                <Link href="/" className={styles.navLink}>
                  Accueil
                </Link>
              </li>
              <li className={styles.navItem}>
                <Link href="/hotels" className={styles.navLink}>
                  Hôtels
                </Link>
              </li>
              <li className={styles.navItem}>
                <Link href="/contact" className={styles.navLink}>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

        </div>
      </nav>
    </>
  )
}

export default Nav