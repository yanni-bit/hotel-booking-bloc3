// src/app/[countryCode]/(main)/hotels/loading.tsx
// ============================================================================
// Loading state pour la page liste hôtels
// ============================================================================

export default function HotelsLoading() {
  return (
    <section className="hotels-list-section py-8 min-h-screen bg-gray-50">
      <div className="content-container">
        
        {/* Skeleton titre */}
        <div className="mb-6">
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mt-2"></div>
        </div>

        {/* Skeleton grille */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Image skeleton */}
              <div className="h-48 bg-gray-200 animate-pulse"></div>
              
              {/* Content skeleton */}
              <div className="p-5 space-y-3">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
                <div className="h-10 bg-gray-200 rounded-full animate-pulse mt-4"></div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
