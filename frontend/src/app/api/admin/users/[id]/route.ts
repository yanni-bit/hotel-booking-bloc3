// src/app/api/admin/users/[id]/route.ts
// ============================================================================
// API Admin: GET, PUT, DELETE /api/admin/users/:id
// Auth : cookie JWT + rôle admin (voir @lib/admin)
//
// Garde-fous :
// - un admin ne peut ni se rétrograder, ni se désactiver, ni se supprimer
// - un utilisateur ayant des réservations ne peut pas être supprimé (409) ;
//   on le désactive à la place
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

// GET - Détail d'un utilisateur avec ses réservations et avis
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    if (!(await requireAdmin())) return unauthorized()

    const { id } = await params
    const userId = parseId(id)
    if (!userId) return NextResponse.json({ error: 'Identifiant invalide' }, { status: 400 })

    const [user, roles] = await Promise.all([
      prisma.utilisateur.findUnique({
        where: { id_user: userId },
        omit: { mot_de_passe: true },
        include: {
          role: true,
          adresse: true,
          reservations: {
            orderBy: { date_reservation: 'desc' },
            include: {
              hotel: { select: { id_hotel: true, nom_hotel: true, ville_hotel: true } },
              chambre: { select: { type_room: true } },
              statut: true,
            },
          },
          avis: {
            orderBy: { date_avis: 'desc' },
            take: 10,
            include: { hotel: { select: { id_hotel: true, nom_hotel: true } } },
          },
          _count: { select: { reservations: true, avis: true } },
        },
      }),
      prisma.role.findMany({ orderBy: { id_role: 'asc' } }),
    ])

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    return NextResponse.json({ user, roles })
  } catch (error) {
    console.error('Admin user GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT - Modifier un utilisateur (rôle, activation, coordonnées)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const admin = await requireAdmin()
    if (!admin) return unauthorized()

    const { id } = await params
    const userId = parseId(id)
    if (!userId) return NextResponse.json({ error: 'Identifiant invalide' }, { status: 400 })

    const data = await request.json()
    const updateData: Prisma.UtilisateurUpdateInput = {}

    if (typeof data.nom_user === 'string' && data.nom_user.trim()) updateData.nom_user = data.nom_user.trim()
    if (typeof data.prenom_user === 'string' && data.prenom_user.trim()) updateData.prenom_user = data.prenom_user.trim()
    if (typeof data.email_user === 'string' && data.email_user.trim()) updateData.email_user = data.email_user.trim()
    if (data.tel_user !== undefined) updateData.tel_user = data.tel_user || null
    if (typeof data.actif === 'boolean') updateData.actif = data.actif
    if (typeof data.email_verifie === 'boolean') updateData.email_verifie = data.email_verifie

    if (data.id_role !== undefined) {
      const idRole = Number(data.id_role)
      const roleExiste = Number.isInteger(idRole) && (await prisma.role.findUnique({ where: { id_role: idRole } }))
      if (!roleExiste) return NextResponse.json({ error: 'Rôle inconnu' }, { status: 400 })
      updateData.role = { connect: { id_role: idRole } }
    }

    // Un admin ne peut pas se retirer ses propres droits ni se désactiver
    const isSelf = admin.id_user === userId
    if (isSelf && updateData.role && Number(data.id_role) !== 1) {
      return NextResponse.json({ error: 'Vous ne pouvez pas modifier votre propre rôle' }, { status: 403 })
    }
    if (isSelf && updateData.actif === false) {
      return NextResponse.json({ error: 'Vous ne pouvez pas désactiver votre propre compte' }, { status: 403 })
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Aucune modification' }, { status: 400 })
    }

    const user = await prisma.utilisateur.update({
      where: { id_user: userId },
      data: updateData,
      omit: { mot_de_passe: true },
      include: { role: true },
    })

    return NextResponse.json({ user })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
      if (error.code === 'P2002') return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 409 })
    }
    console.error('Admin user PUT error:', error)
    return NextResponse.json({ error: 'Erreur modification' }, { status: 500 })
  }
}

// DELETE - Supprimer un utilisateur
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const admin = await requireAdmin()
    if (!admin) return unauthorized()

    const { id } = await params
    const userId = parseId(id)
    if (!userId) return NextResponse.json({ error: 'Identifiant invalide' }, { status: 400 })

    if (admin.id_user === userId) {
      return NextResponse.json({ error: 'Vous ne pouvez pas supprimer votre propre compte' }, { status: 403 })
    }

    const reservations = await prisma.reservation.count({ where: { id_user: userId } })
    if (reservations > 0) {
      return NextResponse.json(
        { error: `Suppression impossible : ${reservations} réservation(s) liée(s). Désactivez le compte à la place.` },
        { status: 409 }
      )
    }

    await prisma.utilisateur.delete({ where: { id_user: userId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }
    console.error('Admin user DELETE error:', error)
    return NextResponse.json({ error: 'Erreur suppression' }, { status: 500 })
  }
}
