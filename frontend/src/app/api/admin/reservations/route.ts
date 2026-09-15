// src/app/api/admin/reservations/route.ts
// ============================================================================
// API Admin: GET /api/admin/reservations (liste)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@lib/prisma'
import { getCurrentUser } from '@lib/auth'

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

// GET - Liste toutes les réservations
export async function GET(request: NextRequest) {
  try {
    if (!await isAdminAuthorized(request)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401, headers: corsHeaders })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const statut = searchParams.get('statut') || ''
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (statut && statut !== 'all') {
      where.id_statut = parseInt(statut)
    }

    if (search) {
      where.OR = [
        { num_confirmation: { contains: search, mode: 'insensitive' } },
        { user: { nom_user: { contains: search, mode: 'insensitive' } } },
        { user: { email_user: { contains: search, mode: 'insensitive' } } },
        { hotel: { nom_hotel: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const [reservations, total, statuts] = await Promise.all([
      prisma.reservation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date_reservation: 'desc' },
        include: {
          user: { select: { id_user: true, nom_user: true, prenom_user: true, email_user: true } },
          hotel: { select: { id_hotel: true, nom_hotel: true, ville_hotel: true } },
          chambre: { select: { id_chambre: true, type_room: true } },
          statut: true,
        }
      }),
      prisma.reservation.count({ where }),
      prisma.statut.findMany()
    ])

    return NextResponse.json({
      reservations,
      statuts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }, { headers: corsHeaders })
  } catch (error) {
    console.error('Admin reservations GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500, headers: corsHeaders })
  }
}