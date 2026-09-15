// ============================================================================
// API CONTACT - POST /api/contact
// ============================================================================
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@lib/prisma'
import { sendContactConfirmationEmail } from '@lib/email'

// ============================================================================
// POST - Envoyer un message de contact
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { nom, email, telephone, sujet, message } = body

    // ──────────────────────────────────────────────────────────────────────
    // VALIDATION côté serveur
    // ──────────────────────────────────────────────────────────────────────
    if (!nom || nom.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: 'Le nom doit contenir au moins 2 caractères' },
        { status: 400 }
      )
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Email invalide' },
        { status: 400 }
      )
    }

    if (!sujet) {
      return NextResponse.json(
        { success: false, message: 'Le sujet est requis' },
        { status: 400 }
      )
    }

    if (!message || message.trim().length < 10) {
      return NextResponse.json(
        { success: false, message: 'Le message doit contenir au moins 10 caractères' },
        { status: 400 }
      )
    }

    // ──────────────────────────────────────────────────────────────────────
    // INSERTION EN BDD
    // ──────────────────────────────────────────────────────────────────────
    const newMessage = await prisma.messagesContact.create({
      data: {
        nom: nom.trim(),
        email: email.trim().toLowerCase(),
        telephone: telephone?.trim() || null,
        sujet: sujet,
        message: message.trim(),
        lu: false,
        archive: false
      }
    })

    console.log('✅ Message contact enregistré:', newMessage.id_message)

    // Envoyer email de confirmation
    await sendContactConfirmationEmail(
      newMessage.email,
      newMessage.nom,
      newMessage.sujet || 'autre',
      newMessage.message
    )

    return NextResponse.json({
      success: true,
      message: 'Message envoyé avec succès',
      data: { id_message: newMessage.id_message }
    })

  } catch (error) {
    console.error('❌ Erreur API contact:', error)
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    )
  }
}