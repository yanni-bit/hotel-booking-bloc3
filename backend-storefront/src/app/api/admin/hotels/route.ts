// src/app/api/admin/hotels/route.ts
// ============================================================================
// API Admin: GET /api/admin/hotels (liste) + POST (créer)
// Auth: Cookie admin OU header X-Admin-Key (pour appels depuis Medusa)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@lib/prisma'
import { getCurrentUser } from '@lib/auth'

// ============================================================================
// CORS Headers pour Medusa Admin (port 9000)
// ============================================================================
const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:9000',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-admin-key',
}

// OPTIONS - Preflight CORS
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// ============================================================================
// Helper: Vérifier accès admin
// ============================================================================
async function isAdminAuthorized(request: NextRequest): Promise<boolean> {
  // Option 1: API Key (appels depuis Medusa)
  const apiKey = request.headers.get('x-admin-key')
  if (apiKey && apiKey === process.env.ADMIN_API_KEY) {
    return true
  }

  // Option 2: Cookie auth (utilisateur connecté sur Next.js)
  const user = await getCurrentUser()
  if (user && user.role === 'admin') {
    return true
  }

  return false
}

// GET - Liste tous les hôtels (avec pagination)
export async function GET(request: NextRequest) {
  try {
    // Vérifier auth admin
    if (!await isAdminAuthorized(request)) {
      return NextResponse.json(
        { error: 'Non autorisé' }, 
        { status: 401, headers: corsHeaders }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    const where = search ? {
      OR: [
        { nom_hotel: { contains: search, mode: 'insensitive' as const } },
        { ville_hotel: { contains: search, mode: 'insensitive' as const } },
      ]
    } : {}

    const [hotels, total] = await Promise.all([
      prisma.hotel.findMany({
        where,
        skip,
        take: limit,
        orderBy: { id_hotel: 'desc' },
        include: {
          _count: { select: { chambres: true, reservations: true } }
        }
      }),
      prisma.hotel.count({ where })
    ])

    return NextResponse.json({
      hotels,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }, { headers: corsHeaders })
  } catch (error) {
    console.error('Admin hotels GET error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' }, 
      { status: 500, headers: corsHeaders }
    )
  }
}

// POST - Créer un hôtel
export async function POST(request: NextRequest) {
  try {
    if (!await isAdminAuthorized(request)) {
      return NextResponse.json(
        { error: 'Non autorisé' }, 
        { status: 401, headers: corsHeaders }
      )
    }

    const data = await request.json()

    const hotel = await prisma.hotel.create({
      data: {
        nom_hotel: data.nom_hotel,
        description_hotel: data.description_hotel,
        rue_hotel: data.rue_hotel,
        code_postal_hotel: data.code_postal_hotel,
        ville_hotel: data.ville_hotel,
        pays_hotel: data.pays_hotel,
        tel_hotel: data.tel_hotel,
        email_hotel: data.email_hotel,
        nbre_etoile_hotel: data.nbre_etoile_hotel,
        img_hotel: data.img_hotel,
      }
    })

    return NextResponse.json({ hotel }, { status: 201, headers: corsHeaders })
  } catch (error) {
    console.error('Admin hotels POST error:', error)
    return NextResponse.json(
      { error: 'Erreur création' }, 
      { status: 500, headers: corsHeaders }
    )
  }
}