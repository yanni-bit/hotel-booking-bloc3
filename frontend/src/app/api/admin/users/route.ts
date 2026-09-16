// src/app/api/admin/users/route.ts
// ============================================================================
// API Admin: GET /api/admin/users (liste paginée, recherche, filtre rôle)
// Auth : cookie JWT + rôle admin (voir @lib/admin)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import prisma from '@lib/prisma'
import { requireAdmin, unauthorized } from '@lib/admin'

export async function GET(request: NextRequest) {
  try {
    if (!(await requireAdmin())) return unauthorized()

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const search = searchParams.get('search')?.trim() || ''
    const role = searchParams.get('role') || ''

    const skip = (page - 1) * limit

    const where: Prisma.UtilisateurWhereInput = {}

    if (search) {
      where.OR = [
        { nom_user: { contains: search, mode: 'insensitive' } },
        { prenom_user: { contains: search, mode: 'insensitive' } },
        { email_user: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (role && role !== 'all') {
      const idRole = parseInt(role)
      if (Number.isInteger(idRole)) where.id_role = idRole
    }

    const [users, total, roles] = await Promise.all([
      prisma.utilisateur.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date_inscription: 'desc' },
        // Le hash du mot de passe ne quitte jamais le serveur
        omit: { mot_de_passe: true },
        include: {
          role: { select: { id_role: true, code_role: true, nom_role: true } },
          _count: { select: { reservations: true, avis: true } },
        },
      }),
      prisma.utilisateur.count({ where }),
      prisma.role.findMany({ orderBy: { id_role: 'asc' } }),
    ])

    return NextResponse.json({
      users,
      roles,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Admin users GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
