"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@modules/auth/components/AuthProvider"
import { FiUser, FiLogOut, FiCalendar, FiSettings, FiChevronDown } from "react-icons/fi"

const Nav = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const { user, isAuthenticated, isLoading, logout } = useAuth()

  // Fermer le menu utilisateur si clic en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/hotels?search=${encodeURIComponent(searchQuery)}`
    }
  }

  const handleSearchKeyup = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch()
  }

  const handleLogout = async () => {
    await logout()
    setUserMenuOpen(false)
    window.location.href = "/fr"
  }

  return (
    <>
      {/* Skip Link */}
      <a href="#main-content" className="skip-link">
        Aller au contenu principal
      </a>

      {/* Header */}
      <header className="header-base">
        <div className="header-container">
          <div className="header-grid">

            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="block">
                <img src="/images/logo.png" alt="Book Your Travel" className="h-auto max-h-[60px] w-auto max-md:max-h-[50px]" />
              </Link>
            </div>

            {/* Bouton Dyslexie */}
            <div className="flex items-center justify-center max-lg:hidden max-md:flex max-md:justify-center max-md:self-center">
              <button
                id="toggle-dyslexie"
                className="flex items-center gap-1.5 bg-transparent border border-gray-300 rounded py-2 px-3 cursor-pointer text-sm text-gris-fonce transition-all duration-200 hover:border-turquoise hover:text-turquoise"
                aria-label="Activer la police adaptée aux personnes dyslexiques"
                aria-pressed="false"
                title="Police pour dyslexie"
              >
                <span className="text-lg">♿</span>
                <span className="hidden lg:inline">Dyslexie</span>
              </button>
            </div>

            {/* Contact */}
            <div className="flex items-center justify-center max-lg:justify-start max-md:justify-start">
              <div className="flex items-center gap-2.5">
                <div className="contact-icon">
                  <span>📞</span>
                </div>
                <div className="text-left">
                  <div className="text-sm text-gris-moyen max-md:text-xs">Support 24/7</div>
                  <div className="text-[15px] font-bold text-gris-fonce max-md:text-xs">1-555-555-555</div>
                </div>
              </div>
            </div>

            {/* Recherche */}
            <div className="flex items-center justify-end max-lg:justify-start max-lg:col-span-2 max-md:justify-start max-md:w-full">
              <div className="relative w-full max-w-[300px] max-lg:max-w-full">
                <input
                  type="search"
                  className="search-bar-input"
                  placeholder="Rechercher..."
                  aria-label="Rechercher sur le site"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyUp={handleSearchKeyup}
                />
                <button
                  type="button"
                  className="absolute right-0 top-0 h-full bg-transparent border-none px-3.5 cursor-pointer flex items-center justify-center group"
                  onClick={handleSearch}
                  aria-label="Lancer la recherche"
                >
                  <span className="text-lg text-gray-400 transition-colors duration-200 group-hover:text-turquoise">🔍</span>
                </button>
              </div>
            </div>

            {/* Ruban */}
            <div className="ribbon ribbon-triangle">
              <nav className="ribbon-nav">
                
                {/* Bouton Auth dynamique */}
                <div className="ribbon-item relative" ref={userMenuRef}>
                  {isLoading ? (
                    <span className="ribbon-btn opacity-50">...</span>
                  ) : isAuthenticated && user ? (
                    <>
                      <button
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="ribbon-btn flex items-center gap-1"
                      >
                        <FiUser className="w-4 h-4" />
                        <span className="max-w-[100px] truncate">{user.prenom}</span>
                        <FiChevronDown className={`w-3 h-3 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                      </button>
                      
                      {/* Menu déroulant */}
                      {userMenuOpen && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                          <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900 truncate">{user.prenom} {user.nom}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                          
                          <Link
                            href="/fr/profil"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <FiUser className="w-4 h-4" />
                            Mon profil
                          </Link>
                          
                          <Link
                            href="/fr/mes-reservations"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            <FiCalendar className="w-4 h-4" />
                            Mes réservations
                          </Link>
                          
                          {user.role === "admin" && (
                            <Link
                              href="/fr/admin"
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              onClick={() => setUserMenuOpen(false)}
                            >
                              <FiSettings className="w-4 h-4" />
                              Administration
                            </Link>
                          )}
                          
                          <div className="border-t border-gray-100 mt-2 pt-2">
                            <button
                              onClick={handleLogout}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              <FiLogOut className="w-4 h-4" />
                              Déconnexion
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <Link href="/fr/login" className="ribbon-btn flex items-center gap-1">
                      <FiUser className="w-4 h-4" />
                      CONNEXION
                    </Link>
                  )}
                </div>

                <div className="ribbon-item">
                  <button className="ribbon-btn">Français FR ▾</button>
                </div>
                <div className="ribbon-item">
                  <button className="ribbon-btn">€ EUR ▾</button>
                </div>
              </nav>
            </div>

          </div>
        </div>
      </header>

      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-container">
          <span className="hidden max-md:block text-white font-bold text-sm uppercase py-3 px-4">Menu</span>
          <button
            className="hidden max-md:block bg-transparent border-none py-2.5 px-4 cursor-pointer absolute right-4 top-1/2 -translate-y-1/2"
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Ouvrir le menu"
            aria-expanded={menuOpen}
          >
            <span className="text-white text-2xl">☰</span>
          </button>

          <div className={`flex max-md:hidden max-md:absolute max-md:top-full max-md:left-0 max-md:right-0 max-md:bg-turquoise max-md:z-[100] ${menuOpen ? "max-md:!block" : ""}`}>
            <ul className="flex list-none m-0 p-0 max-md:flex-col">
              <li><Link href="/" className="navbar-link">Accueil</Link></li>
              <li><Link href="/hotels" className="navbar-link">Hôtels</Link></li>
              <li><Link href="/contact" className="navbar-link">Contact</Link></li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Nav