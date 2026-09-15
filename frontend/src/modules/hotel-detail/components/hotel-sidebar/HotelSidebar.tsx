// src/modules/hotel-detail/components/hotel-sidebar/HotelSidebar.tsx
// ============================================================================
// Sidebar avec navigation par onglets
// Équivalent de hotel-sidebar.component Angular avec routerLinkActive
// ============================================================================

"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  FaFileAlt, 
  FaTag, 
  FaStar, 
  FaComments, 
  FaMapMarkerAlt 
} from "react-icons/fa"

interface HotelSidebarProps {
  hotelId: number
  countryCode: string
}

// Configuration des onglets (comme ton routerLink Angular)
const tabs = [
  { 
    id: "description", 
    label: "Description", 
    icon: FaFileAlt 
  },
  { 
    id: "offers", 
    label: "Chambres & Offres", 
    icon: FaTag 
  },
  { 
    id: "amenities", 
    label: "Équipements", 
    icon: FaStar 
  },
  { 
    id: "reviews", 
    label: "Avis clients", 
    icon: FaComments 
  },
  { 
    id: "location", 
    label: "Localisation", 
    icon: FaMapMarkerAlt 
  },
]

export default function HotelSidebar({ hotelId, countryCode }: HotelSidebarProps) {
  // Équivalent de ActivatedRoute Angular
  const pathname = usePathname()
  
  return (
    <aside className="sidebar-nav-container mb-4">
      <nav className="bg-white rounded-lg shadow-sm overflow-hidden">
        {tabs.map((tab) => {
          const href = `/${countryCode}/hotels/${hotelId}/${tab.id}`
          // Équivalent de routerLinkActive Angular
          const isActive = pathname?.includes(`/${tab.id}`)
          const Icon = tab.icon
          
          return (
            <Link
              key={tab.id}
              href={href}
              className={`
                flex items-center px-4 py-3 border-b border-gray-100 last:border-b-0
                transition-all duration-200
                ${isActive 
                  ? "bg-turquoise text-white border-l-4 border-l-turquoise-dark" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-turquoise"
                }
              `}
            >
              <Icon className={`mr-3 ${isActive ? "text-white" : "text-turquoise"}`} />
              <span className="font-medium">{tab.label}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
