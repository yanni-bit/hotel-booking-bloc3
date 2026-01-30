// src/app/api/admin/hotels/[id]/route.ts
// ============================================================================
// API Admin: GET, PUT, DELETE /api/admin/hotels/:id
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@lib/prisma'
import { getCurrentUser } from '@lib/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

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
  const apiKey = request.headers.get('x-admin-key')
  if (apiKey && apiKey === process.env.ADMIN_API_KEY) {
    return true
  }

  const user = await getCurrentUser()
  if (user && user.role === 'admin') {
    return true
  }

  return false
}

// GET - Détail d'un hôtel
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    if (!await isAdminAuthorized(request)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401, headers: corsHeaders })
    }

    const { id } = await params
    const hotel = await prisma.hotel.findUnique({
      where: { id_hotel: parseInt(id) },
      include: {
        chambres: true,
        amenities: true,
        images: { orderBy: { ordre: 'asc' } },
        _count: { select: { reservations: true, avis: true } }
      }
    })

    if (!hotel) {
      return NextResponse.json({ error: 'Hôtel non trouvé' }, { status: 404, headers: corsHeaders })
    }

    return NextResponse.json({ hotel }, { headers: corsHeaders })
  } catch (error) {
    console.error('Admin hotel GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500, headers: corsHeaders })
  }
}

// PUT - Modifier un hôtel
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    if (!await isAdminAuthorized(request)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401, headers: corsHeaders })
    }

    const { id } = await params
    const data = await request.json()

    const hotel = await prisma.hotel.update({
      where: { id_hotel: parseInt(id) },
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

    return NextResponse.json({ hotel }, { headers: corsHeaders })
  } catch (error) {
    console.error('Admin hotel PUT error:', error)
    return NextResponse.json({ error: 'Erreur modification' }, { status: 500, headers: corsHeaders })
  }
}

// DELETE - Supprimer un hôtel
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    if (!await isAdminAuthorized(request)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401, headers: corsHeaders })
    }

    const { id } = await params

    await prisma.hotel.delete({
      where: { id_hotel: parseInt(id) }
    })

    return NextResponse.json({ success: true }, { headers: corsHeaders })
  } catch (error) {
    console.error('Admin hotel DELETE error:', error)
    return NextResponse.json({ error: 'Erreur suppression' }, { status: 500, headers: corsHeaders })
  }
}