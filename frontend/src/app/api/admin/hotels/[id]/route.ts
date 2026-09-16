// src/app/api/admin/hotels/[id]/route.ts
// ============================================================================
// API Admin: GET, PUT, DELETE /api/admin/hotels/:id
// Auth : cookie JWT + rôle admin (voir @lib/admin)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import prisma from '@lib/prisma'
import { requireAdmin, unauthorized } from '@lib/admin'

interface RouteParams {
  params: Promise<{ id: string }>
}

// Champs modifiables par l'admin (liste blanche : tout autre champ envoyé est ignoré)
const EDITABLE_FIELDS = [
  'nom_hotel',
  'description_hotel',
  'rue_hotel',
  'code_postal_hotel',
  'ville_hotel',
  'pays_hotel',
  'tel_hotel',
  'email_hotel',
  'site_web_hotel',
  'nbre_etoile_hotel',
  'img_hotel',
] as const

type EditableField = (typeof EDITABLE_FIELDS)[number]

function parseId(id: string): number | null {
  const n = parseInt(id, 10)
  return Number.isInteger(n) && n > 0 ? n : null
}

// GET - Détail d'un hôtel (chambres, équipements, images, compteurs)
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    if (!(await requireAdmin())) return unauthorized()

    const { id } = await params
    const hotelId = parseId(id)
    if (!hotelId) return NextResponse.json({ error: 'Identifiant invalide' }, { status: 400 })

    const hotel = await prisma.hotel.findUnique({
      where: { id_hotel: hotelId },
      include: {
        chambres: { orderBy: { id_chambre: 'asc' } },
        amenities: true,
        images: { orderBy: { ordre: 'asc' } },
        _count: { select: { reservations: true, avis: true } },
      },
    })

    if (!hotel) {
      return NextResponse.json({ error: 'Hôtel non trouvé' }, { status: 404 })
    }

    return NextResponse.json({ hotel })
  } catch (error) {
    console.error('Admin hotel GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT - Modifier un hôtel
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    if (!(await requireAdmin())) return unauthorized()

    const { id } = await params
    const hotelId = parseId(id)
    if (!hotelId) return NextResponse.json({ error: 'Identifiant invalide' }, { status: 400 })

    const body = await request.json()

    // Ne garder que les champs autorisés
    const data: Partial<Record<EditableField, unknown>> = {}
    for (const field of EDITABLE_FIELDS) {
      if (field in body) data[field] = body[field]
    }

    // Validation minimale
    if (typeof data.nom_hotel === 'string' && data.nom_hotel.trim() === '') {
      return NextResponse.json({ error: 'Le nom est obligatoire' }, { status: 400 })
    }
    if (data.nbre_etoile_hotel !== undefined && data.nbre_etoile_hotel !== null) {
      const stars = Number(data.nbre_etoile_hotel)
      if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
        return NextResponse.json({ error: 'Les étoiles doivent être entre 1 et 5' }, { status: 400 })
      }
      data.nbre_etoile_hotel = stars
    }

    const hotel = await prisma.hotel.update({
      where: { id_hotel: hotelId },
      data: data as Prisma.HotelUpdateInput,
    })

    return NextResponse.json({ hotel })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Hôtel non trouvé' }, { status: 404 })
    }
    console.error('Admin hotel PUT error:', error)
    return NextResponse.json({ error: 'Erreur modification' }, { status: 500 })
  }
}

// DELETE - Supprimer un hôtel
// Refusé si des réservations y sont rattachées (contrainte Restrict en base) :
// on renvoie un 409 explicite plutôt qu'une erreur serveur.
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    if (!(await requireAdmin())) return unauthorized()

    const { id } = await params
    const hotelId = parseId(id)
    if (!hotelId) return NextResponse.json({ error: 'Identifiant invalide' }, { status: 400 })

    const reservations = await prisma.reservation.count({ where: { id_hotel: hotelId } })
    if (reservations > 0) {
      return NextResponse.json(
        { error: `Suppression impossible : ${reservations} réservation(s) rattachée(s) à cet hôtel` },
        { status: 409 }
      )
    }

    await prisma.hotel.delete({ where: { id_hotel: hotelId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Hôtel non trouvé' }, { status: 404 })
    }
    console.error('Admin hotel DELETE error:', error)
    return NextResponse.json({ error: 'Erreur suppression' }, { status: 500 })
  }
}
