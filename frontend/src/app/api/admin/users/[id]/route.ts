// src/app/api/admin/users/[id]/route.ts
// ============================================================================
// API Admin: GET, PUT, DELETE /api/admin/users/:id
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

// GET - Détail d'un utilisateur avec ses réservations
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    if (!await isAdminAuthorized(request)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401, headers: corsHeaders })
    }

    const { id } = await params
    const user = await prisma.utilisateur.findUnique({
      where: { id_user: parseInt(id) },
      include: {
        role: true,
        adresse: true,
        reservations: {
          orderBy: { date_reservation: 'desc' },
          include: {
            hotel: { select: { id_hotel: true, nom_hotel: true, ville_hotel: true } },
            chambre: { select: { type_room: true } },
            statut: true,
          }
        },
        avis: {
          orderBy: { date_avis: 'desc' },
          take: 10,
          include: {
            hotel: { select: { nom_hotel: true } }
          }
        },
        _count: { select: { reservations: true, avis: true } }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404, headers: corsHeaders })
    }

    // Ne pas exposer le mot de passe
    const { mot_de_passe, ...safeUser } = user

    // Récupérer les rôles disponibles
    const roles = await prisma.role.findMany()

    return NextResponse.json({ user: safeUser, roles }, { headers: corsHeaders })
  } catch (error) {
    console.error('Admin user GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500, headers: corsHeaders })
  }
}

// PUT - Modifier un utilisateur
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    if (!await isAdminAuthorized(request)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401, headers: corsHeaders })
    }

    const { id } = await params
    const data = await request.json()

    // Construire l'objet de mise à jour dynamiquement
    const updateData: Record<string, unknown> = {}

    if (data.nom_user !== undefined) updateData.nom_user = data.nom_user
    if (data.prenom_user !== undefined) updateData.prenom_user = data.prenom_user
    if (data.email_user !== undefined) updateData.email_user = data.email_user
    if (data.tel_user !== undefined) updateData.tel_user = data.tel_user
    if (data.id_role !== undefined) updateData.id_role = data.id_role
    if (data.actif !== undefined) updateData.actif = data.actif
    if (data.email_verifie !== undefined) updateData.email_verifie = data.email_verifie

    const user = await prisma.utilisateur.update({
      where: { id_user: parseInt(id) },
      data: updateData,
      include: {
        role: true,
      }
    })

    const { mot_de_passe, ...safeUser } = user

    return NextResponse.json({ user: safeUser }, { headers: corsHeaders })
  } catch (error) {
    console.error('Admin user PUT error:', error)
    return NextResponse.json({ error: 'Erreur modification' }, { status: 500, headers: corsHeaders })
  }
}

// DELETE - Supprimer un utilisateur
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    if (!await isAdminAuthorized(request)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401, headers: corsHeaders })
    }

    const { id } = await params

    await prisma.utilisateur.delete({
      where: { id_user: parseInt(id) }
    })

    return NextResponse.json({ success: true }, { headers: corsHeaders })
  } catch (error) {
    console.error('Admin user DELETE error:', error)
    return NextResponse.json({ error: 'Erreur suppression' }, { status: 500, headers: corsHeaders })
  }
}