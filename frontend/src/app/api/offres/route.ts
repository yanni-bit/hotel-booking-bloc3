// app/api/offres/route.ts
// ============================================================================
// API Route: GET /api/offres
// Meilleures offres du moment
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { getOffres } from '@lib/hotels'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '6')

    const offres = await getOffres(limit)
    
    return NextResponse.json(offres)
  } catch (error) {
    console.error('Error fetching offres:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des offres' },
      { status: 500 }
    )
  }
}
