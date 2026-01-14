// app/api/hotels/search/route.ts
// ============================================================================
// API Route: GET /api/hotels/search
// Recherche d'hôtels avec critères multiples
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { searchHotels } from '@lib/hotels'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const query = searchParams.get('q') || undefined
    const city = searchParams.get('city') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const guests = searchParams.get('guests') 
      ? parseInt(searchParams.get('guests')!) 
      : undefined
    const stars = searchParams.get('stars')
      ? searchParams.get('stars')!.split(',').map(Number)
      : undefined

    const result = await searchHotels({
      query,
      city,
      page,
      limit,
      guests,
      stars,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error searching hotels:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la recherche' },
      { status: 500 }
    )
  }
}
