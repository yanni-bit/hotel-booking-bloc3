// src/app/api/admin/reservations/[id]/route.ts
// ============================================================================
// API Admin: GET, PUT /api/admin/reservations/:id
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@lib/prisma'
import { getCurrentUser } from '@lib/auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

// CORS Headers
const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:9000',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-admin-key',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

// Helper: Vérifier accès admin
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

// GET - Détail d'une réservation
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    if (!await isAdminAuthorized(request)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401, headers: corsHeaders })
    }

    const { id } = await params
    const reservation = await prisma.reservation.findUnique({
      where: { id_reservation: parseInt(id) },
      include: {
        user: { select: { id_user: true, nom_user: true, prenom_user: true, email_user: true, tel_user: true } },
        hotel: { select: { id_hotel: true, nom_hotel: true, ville_hotel: true, pays_hotel: true } },
        chambre: { select: { id_chambre: true, type_room: true, nbre_adults_max: true } },
        offre: true,
        statut: true,
        paiement: true,
        services: {
          include: {
            hotel_service: {
              include: { service: true }
            }
          }
        }
      }
    })

    if (!reservation) {
      return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404, headers: corsHeaders })
    }

    return NextResponse.json({ reservation }, { headers: corsHeaders })
  } catch (error) {
    console.error('Admin reservation GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500, headers: corsHeaders })
  }
}

// PUT - Modifier le statut d'une réservation
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    if (!await isAdminAuthorized(request)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401, headers: corsHeaders })
    }

    const { id } = await params
    const data = await request.json()

    const reservation = await prisma.reservation.update({
      where: { id_reservation: parseInt(id) },
      data: {
        id_statut: data.id_statut,
      },
      include: {
        statut: true,
      }
    })

    return NextResponse.json({ reservation }, { headers: corsHeaders })
  } catch (error) {
    console.error('Admin reservation PUT error:', error)
    return NextResponse.json({ error: 'Erreur modification' }, { status: 500, headers: corsHeaders })
  }
}