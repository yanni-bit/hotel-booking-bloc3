// app/api/hotels/route.ts
// ============================================================================
// API Route: GET /api/hotels
// Liste des hôtels avec pagination et filtres
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { getHotels } from '@lib/hotels'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const city = searchParams.get('city') || undefined
    const country = searchParams.get('country') || undefined
    const minStars = searchParams.get('minStars') 
      ? parseInt(searchParams.get('minStars')!) 
      : undefined

    const result = await getHotels({ page, limit, city, country, minStars })
    
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching hotels:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des hôtels' },
      { status: 500 }
    )
  }
}
