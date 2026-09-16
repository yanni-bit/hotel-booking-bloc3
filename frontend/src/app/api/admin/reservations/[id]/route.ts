// src/app/api/admin/reservations/[id]/route.ts
// ============================================================================
// API Admin: GET (détail) et PUT (changement de statut) /api/admin/reservations/:id
// Auth : cookie JWT + rôle admin (voir @lib/admin)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import prisma from '@lib/prisma'
import { requireAdmin, unauthorized } from '@lib/admin'

interface RouteParams {
  params: Promise<{ id: string }>
}

function parseId(id: string): number | null {
  const n = parseInt(id, 10)
  return Number.isInteger(n) && n > 0 ? n : null
}

// GET - Détail complet + liste des statuts possibles (pour le sélecteur)
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    if (!(await requireAdmin())) return unauthorized()

    const { id } = await params
    const reservationId = parseId(id)
    if (!reservationId) return NextResponse.json({ error: 'Identifiant invalide' }, { status: 400 })

    const [reservation, statuts] = await Promise.all([
      prisma.reservation.findUnique({
        where: { id_reservation: reservationId },
        include: {
          user: { select: { id_user: true, nom_user: true, prenom_user: true, email_user: true, tel_user: true } },
          hotel: { select: { id_hotel: true, nom_hotel: true, ville_hotel: true, pays_hotel: true } },
          chambre: { select: { id_chambre: true, type_room: true, nbre_adults_max: true } },
          offre: { select: { id_offre: true, nom_offre: true, remboursable: true, petit_dejeuner_inclus: true } },
          statut: true,
          paiement: true,
          services: {
            include: { hotel_service: { include: { service: true } } },
          },
        },
      }),
      prisma.statut.findMany({ orderBy: { id_statut: 'asc' } }),
    ])

    if (!reservation) {
      return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 })
    }

    return NextResponse.json({ reservation, statuts })
  } catch (error) {
    console.error('Admin reservation GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT - Changer le statut (seul champ modifiable par l'admin)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    if (!(await requireAdmin())) return unauthorized()

    const { id } = await params
    const reservationId = parseId(id)
    if (!reservationId) return NextResponse.json({ error: 'Identifiant invalide' }, { status: 400 })

    const body = await request.json()
    const idStatut = Number(body.id_statut)
    if (!Number.isInteger(idStatut)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
    }

    // Le statut doit exister en base
    const statutExiste = await prisma.statut.findUnique({ where: { id_statut: idStatut } })
    if (!statutExiste) {
      return NextResponse.json({ error: 'Statut inconnu' }, { status: 400 })
    }

    const reservation = await prisma.reservation.update({
      where: { id_reservation: reservationId },
      data: { id_statut: idStatut },
      include: { statut: true },
    })

    return NextResponse.json({ reservation })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Réservation non trouvée' }, { status: 404 })
    }
    console.error('Admin reservation PUT error:', error)
    return NextResponse.json({ error: 'Erreur modification' }, { status: 500 })
  }
}
