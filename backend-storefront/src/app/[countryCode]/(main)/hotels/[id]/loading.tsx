// src/app/[countryCode]/(main)/hotels/[id]/loading.tsx
// ============================================================================
// Loading state - affiché pendant le chargement du layout
// Équivalent du *ngIf="loading" Angular
// ============================================================================

export default function HotelLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-turquoise mx-auto"></div>
        <p className="mt-4 text-gray-600">Chargement de l&apos;hôtel...</p>
      </div>
    </div>
  )
}
