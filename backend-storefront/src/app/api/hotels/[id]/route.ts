// app/api/hotels/[id]/route.ts
// ============================================================================
// API Route: GET /api/hotels/:id
// Détail d'un hôtel par son ID
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { getHotelById } from '@lib/hotels'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const hotelId = parseInt(id)
    
    if (isNaN(hotelId)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      )
    }

    const hotel = await getHotelById(hotelId)
    
    if (!hotel) {
      return NextResponse.json(
        { error: 'Hôtel non trouvé' },
        { status: 404 }
      )
    }

    return NextResponse.json(hotel)
  } catch (error) {
    console.error('Error fetching hotel:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'hôtel' },
      { status: 500 }
    )
  }
}
