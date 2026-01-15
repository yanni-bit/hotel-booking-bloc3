// src/app/[countryCode]/(main)/booking/[offreId]/loading.tsx
// ============================================================================
// Loading state pour la page de réservation
// ============================================================================

export default function BookingLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb skeleton */}
        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mb-6" />

        {/* Titre skeleton */}
        <div className="h-8 w-80 bg-gray-200 rounded animate-pulse mb-6" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulaire skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card 1 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="h-12 bg-gray-200 rounded animate-pulse" />
                <div className="h-12 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-12 w-32 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-12 bg-gray-200 rounded animate-pulse" />
                <div className="h-12 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="h-12 bg-gray-200 rounded animate-pulse" />
                <div className="h-12 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="h-12 bg-gray-200 rounded animate-pulse" />
                <div className="h-12 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="h-24 bg-gray-200 rounded animate-pulse" />
            </div>

            {/* Card 3 - Services */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-24 bg-gray-200 rounded animate-pulse"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Résumé skeleton */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="h-40 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="h-6 w-full bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="space-y-2 mb-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-4 bg-gray-200 rounded animate-pulse"
                  />
                ))}
              </div>
              <div className="h-20 bg-gray-200 rounded animate-pulse mb-4" />
              <div className="h-12 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}