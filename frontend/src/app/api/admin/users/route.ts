// src/app/api/admin/users/route.ts
// ============================================================================
// API Admin: GET /api/admin/users (liste)
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

// GET - Liste tous les utilisateurs
export async function GET(request: NextRequest) {
  try {
    if (!await isAdminAuthorized(request)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401, headers: corsHeaders })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    
    if (search) {
      where.OR = [
        { nom_user: { contains: search, mode: 'insensitive' } },
        { prenom_user: { contains: search, mode: 'insensitive' } },
        { email_user: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (role) {
      where.id_role = parseInt(role)
    }

    const [users, total] = await Promise.all([
      prisma.utilisateur.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date_inscription: 'desc' },
        include: {
          role: { select: { id_role: true, code_role: true, nom_role: true } },
          _count: { select: { reservations: true, avis: true } }
        }
      }),
      prisma.utilisateur.count({ where })
    ])

    // Ne pas exposer les mots de passe
    const safeUsers = users.map(({ mot_de_passe, ...user }) => user)

    return NextResponse.json({
      users: safeUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }, { headers: corsHeaders })
  } catch (error) {
    console.error('Admin users GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500, headers: corsHeaders })
  }
}