// src/lib/email.ts
// ============================================================================
// Service d'envoi d'email - Hotel Booking Bloc 3
// Utilise Nodemailer avec Gmail SMTP
//
// Différence Angular → Next.js :
// - Angular : Service séparé côté backend Express
// - Next.js : Fonction utilitaire appelée depuis les API Routes
// ============================================================================

import nodemailer from "nodemailer";

// ============================================================================
// CONFIGURATION GMAIL
// ============================================================================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// ============================================================================
// TYPES
// ============================================================================
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// ============================================================================
// FONCTION D'ENVOI D'EMAIL
// ============================================================================
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const mailOptions = {
      from: `"Hotel Booking" <${process.env.GMAIL_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || "",
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email envoyé:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Erreur envoi email:", error);
    return false;
  }
}

// ============================================================================
// EMAIL DE BIENVENUE (inscription)
// ============================================================================
export async function sendWelcomeEmail(
  to: string,
  prenom: string
): Promise<boolean> {
  const subject = "Bienvenue sur Hotel Booking ! 🎉";

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #06b6d4, #0891b2);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: #f9f9f9;
          padding: 30px;
          border: 1px solid #ddd;
          border-top: none;
        }
        .button {
          display: inline-block;
          background: #06b6d4;
          color: white !important;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        }
        .features {
          background: white;
          border: 1px solid #ddd;
          border-radius: 10px;
          padding: 20px;
          margin: 20px 0;
        }
        .features ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .features li {
          padding: 10px 0;
          border-bottom: 1px solid #eee;
        }
        .features li:last-child {
          border-bottom: none;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #666;
          font-size: 12px;
          border: 1px solid #ddd;
          border-top: none;
          border-radius: 0 0 10px 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🏨 Bienvenue sur Hotel Booking !</h1>
        <p>Votre compte a été créé avec succès</p>
      </div>
      
      <div class="content">
        <p>Bonjour <strong>${prenom}</strong>,</p>
        
        <p>Nous sommes ravis de vous accueillir sur Hotel Booking !</p>
        
        <p>Votre compte est maintenant actif et vous pouvez dès à présent :</p>
        
        <div class="features">
          <ul>
            <li>🔍 Rechercher parmi plus de 100 hôtels</li>
            <li>💰 Profiter de nos meilleures offres</li>
            <li>📅 Réserver en quelques clics</li>
            <li>⭐ Consulter les avis clients</li>
            <li>📋 Gérer vos réservations facilement</li>
          </ul>
        </div>
        
        <p style="text-align: center;">
          <a href="${baseUrl}/fr/hotels" class="button">Découvrir nos hôtels</a>
        </p>
        
        <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
        
        <p>À bientôt sur Hotel Booking !</p>
      </div>
      
      <div class="footer">
        <p>© ${new Date().getFullYear()} Hotel Booking - Tous droits réservés</p>
        <p>Cet email a été envoyé automatiquement suite à votre inscription.</p>
      </div>
    </body>
    </html>
  `;

  const text = `
    Bonjour ${prenom},

    Bienvenue sur Hotel Booking !

    Votre compte a été créé avec succès et vous pouvez dès à présent :
    - Rechercher parmi plus de 100 hôtels
    - Profiter de nos meilleures offres
    - Réserver en quelques clics
    - Consulter les avis clients
    - Gérer vos réservations facilement

    Découvrez nos hôtels : ${baseUrl}/fr/hotels

    À bientôt sur Hotel Booking !
  `;

  return sendEmail({ to, subject, html, text });
}

// ============================================================================
// EMAIL DE RÉINITIALISATION MOT DE PASSE
// ============================================================================
export async function sendPasswordResetEmail(
  to: string,
  prenom: string,
  resetLink: string
): Promise<boolean> {
  const subject = "Réinitialisation de votre mot de passe - Hotel Booking";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #06b6d4, #0891b2);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: #f9f9f9;
          padding: 30px;
          border: 1px solid #ddd;
          border-top: none;
        }
        .button {
          display: inline-block;
          background: #06b6d4;
          color: white !important;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        }
        .button:hover {
          background: #0891b2;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #666;
          font-size: 12px;
          border: 1px solid #ddd;
          border-top: none;
          border-radius: 0 0 10px 10px;
        }
        .warning {
          background: #fff3cd;
          border: 1px solid #ffc107;
          padding: 15px;
          border-radius: 5px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🔐 Hotel Booking</h1>
        <p>Réinitialisation de mot de passe</p>
      </div>
      
      <div class="content">
        <p>Bonjour <strong>${prenom}</strong>,</p>
        
        <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
        
        <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
        
        <p style="text-align: center;">
          <a href="${resetLink}" class="button">Réinitialiser mon mot de passe</a>
        </p>
        
        <p>Ou copiez ce lien dans votre navigateur :</p>
        <p style="word-break: break-all; background: #e9e9e9; padding: 10px; border-radius: 5px;">
          ${resetLink}
        </p>
        
        <div class="warning">
          <strong>⚠️ Important :</strong>
          <ul>
            <li>Ce lien expire dans <strong>1 heure</strong></li>
            <li>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email</li>
          </ul>
        </div>
      </div>
      
      <div class="footer">
        <p>© ${new Date().getFullYear()} Hotel Booking - Tous droits réservés</p>
        <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
      </div>
    </body>
    </html>
  `;

  const text = `
    Bonjour ${prenom},

    Vous avez demandé la réinitialisation de votre mot de passe.

    Cliquez sur ce lien pour créer un nouveau mot de passe :
    ${resetLink}

    Ce lien expire dans 1 heure.

    Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.

    Hotel Booking
  `;

  return sendEmail({ to, subject, html, text });
}

// ============================================================================
// EMAIL DE CONFIRMATION DE RÉSERVATION
// ============================================================================
export async function sendReservationConfirmationEmail(
  to: string,
  prenom: string,
  reservation: {
    numConfirmation: string;
    hotelName: string;
    roomType: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    adults: number;
    children: number;
    totalPrice: number;
  }
): Promise<boolean> {
  const subject = `Confirmation de réservation #${reservation.numConfirmation} - Hotel Booking`;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #06b6d4, #0891b2);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: #f9f9f9;
          padding: 30px;
          border: 1px solid #ddd;
          border-top: none;
        }
        .reservation-box {
          background: white;
          border: 2px solid #06b6d4;
          border-radius: 10px;
          padding: 20px;
          margin: 20px 0;
        }
        .reservation-box h3 {
          margin-top: 0;
          color: #0891b2;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          color: #666;
        }
        .detail-value {
          font-weight: bold;
        }
        .total-row {
          background: #06b6d4;
          color: white;
          padding: 15px;
          border-radius: 5px;
          margin-top: 15px;
          display: flex;
          justify-content: space-between;
        }
        .button {
          display: inline-block;
          background: #06b6d4;
          color: white !important;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #666;
          font-size: 12px;
          border: 1px solid #ddd;
          border-top: none;
          border-radius: 0 0 10px 10px;
        }
        .confirmation-number {
          background: #e0f7fa;
          border: 2px dashed #06b6d4;
          padding: 15px;
          text-align: center;
          border-radius: 10px;
          margin: 20px 0;
        }
        .confirmation-number span {
          font-size: 24px;
          font-weight: bold;
          color: #0891b2;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>✅ Réservation confirmée !</h1>
        <p>Merci pour votre confiance</p>
      </div>
      
      <div class="content">
        <p>Bonjour <strong>${prenom}</strong>,</p>
        
        <p>Votre réservation a été confirmée avec succès. Voici le récapitulatif :</p>
        
        <div class="confirmation-number">
          <p style="margin: 0; color: #666;">Numéro de confirmation</p>
          <span>${reservation.numConfirmation}</span>
        </div>
        
        <div class="reservation-box">
          <h3>📍 ${reservation.hotelName}</h3>
          <p style="color: #666; margin-top: 0;">${reservation.roomType}</p>
          
          <div class="detail-row">
            <span class="detail-label">📅 Arrivée</span>
            <span class="detail-value">${reservation.checkIn}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">📅 Départ</span>
            <span class="detail-value">${reservation.checkOut}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">🌙 Durée</span>
            <span class="detail-value">${reservation.nights} nuit${reservation.nights > 1 ? "s" : ""}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">👥 Voyageurs</span>
            <span class="detail-value">${reservation.adults} adulte${reservation.adults > 1 ? "s" : ""}${reservation.children > 0 ? `, ${reservation.children} enfant${reservation.children > 1 ? "s" : ""}` : ""}</span>
          </div>
          
          <div class="total-row">
            <span>Total payé</span>
            <span>${reservation.totalPrice.toFixed(2)} €</span>
          </div>
        </div>
        
        <p style="text-align: center;">
          <a href="${baseUrl}/fr/mes-reservations" class="button">Voir mes réservations</a>
        </p>
        
        <p>Conservez cet email, il vous servira de justificatif.</p>
        
        <p>Nous vous souhaitons un excellent séjour !</p>
      </div>
      
      <div class="footer">
        <p>© ${new Date().getFullYear()} Hotel Booking - Tous droits réservés</p>
        <p>Besoin d'aide ? Contactez-nous à support@hotelbooking.com</p>
      </div>
    </body>
    </html>
  `;

  const text = `
    Bonjour ${prenom},

    Votre réservation a été confirmée !

    Numéro de confirmation : ${reservation.numConfirmation}

    Hôtel : ${reservation.hotelName}
    Chambre : ${reservation.roomType}
    Arrivée : ${reservation.checkIn}
    Départ : ${reservation.checkOut}
    Durée : ${reservation.nights} nuit(s)
    Voyageurs : ${reservation.adults} adulte(s)${reservation.children > 0 ? `, ${reservation.children} enfant(s)` : ""}
    
    Total payé : ${reservation.totalPrice.toFixed(2)} €

    Voir mes réservations : ${baseUrl}/fr/mes-reservations

    Conservez cet email, il vous servira de justificatif.

    Nous vous souhaitons un excellent séjour !

    Hotel Booking
  `;

  return sendEmail({ to, subject, html, text });
}

// ============================================================================
// EMAIL DE CONFIRMATION DE SUPPRESSION DE COMPTE
// ============================================================================
export async function sendAccountDeletionEmail(
  to: string,
  prenom: string
): Promise<boolean> {
  const subject = "Confirmation de suppression de compte - Hotel Booking";

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: #f9f9f9;
          padding: 30px;
          border: 1px solid #ddd;
          border-top: none;
        }
        .info-box {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 10px;
          padding: 20px;
          margin: 20px 0;
        }
        .info-box ul {
          margin: 10px 0 0 0;
          padding-left: 20px;
        }
        .info-box li {
          padding: 5px 0;
        }
        .button {
          display: inline-block;
          background: #06b6d4;
          color: white !important;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #666;
          font-size: 12px;
          border: 1px solid #ddd;
          border-top: none;
          border-radius: 0 0 10px 10px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>👋 Au revoir ${prenom}</h1>
        <p>Votre compte a été supprimé</p>
      </div>
      
      <div class="content">
        <p>Bonjour <strong>${prenom}</strong>,</p>
        
        <p>Nous vous confirmons que votre compte Hotel Booking a bien été supprimé conformément à votre demande.</p>
        
        <div class="info-box">
          <strong>📋 Ce qui a été fait :</strong>
          <ul>
            <li>Vos informations personnelles ont été effacées</li>
            <li>Votre adresse email a été libérée</li>
            <li>Vos données de connexion ont été supprimées</li>
          </ul>
        </div>
        
        <p>Si vous avez des réservations passées, celles-ci restent conservées dans notre système à des fins comptables, mais ne sont plus associées à vos informations personnelles.</p>
        
        <p>Nous sommes désolés de vous voir partir. Si vous changez d'avis, vous êtes toujours le bienvenu pour créer un nouveau compte :</p>
        
        <p style="text-align: center;">
          <a href="${baseUrl}/fr/register" class="button">Créer un nouveau compte</a>
        </p>
        
        <p>Merci d'avoir utilisé Hotel Booking. Nous espérons vous revoir bientôt !</p>
      </div>
      
      <div class="footer">
        <p>© ${new Date().getFullYear()} Hotel Booking - Tous droits réservés</p>
        <p>Cet email a été envoyé automatiquement suite à la suppression de votre compte.</p>
      </div>
    </body>
    </html>
  `;

  const text = `
    Bonjour ${prenom},

    Nous vous confirmons que votre compte Hotel Booking a bien été supprimé conformément à votre demande.

    Ce qui a été fait :
    - Vos informations personnelles ont été effacées
    - Votre adresse email a été libérée
    - Vos données de connexion ont été supprimées

    Si vous avez des réservations passées, celles-ci restent conservées dans notre système à des fins comptables, mais ne sont plus associées à vos informations personnelles.

    Si vous changez d'avis, vous pouvez créer un nouveau compte : ${baseUrl}/fr/register

    Merci d'avoir utilisé Hotel Booking. Nous espérons vous revoir bientôt !

    Hotel Booking
  `;

  return sendEmail({ to, subject, html, text });
}

// ============================================================================
// EMAIL DE CONFIRMATION D'ANNULATION DE RÉSERVATION
// ============================================================================
export async function sendReservationCancellationEmail(
  to: string,
  prenom: string,
  reservation: {
    numConfirmation: string;
    hotelName: string;
    roomType: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    totalPrice: number;
  }
): Promise<boolean> {
  const subject = `Confirmation d'annulation #${reservation.numConfirmation} - Hotel Booking`;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:8000";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #f97316, #ea580c);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          background: #f9f9f9;
          padding: 30px;
          border: 1px solid #ddd;
          border-top: none;
        }
        .reservation-box {
          background: white;
          border: 2px solid #f97316;
          border-radius: 10px;
          padding: 20px;
          margin: 20px 0;
        }
        .reservation-box h3 {
          margin-top: 0;
          color: #ea580c;
          text-decoration: line-through;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }
        .detail-row:last-child {
          border-bottom: none;
        }
        .detail-label {
          color: #666;
        }
        .detail-value {
          font-weight: bold;
          color: #999;
        }
        .cancelled-badge {
          background: #fee2e2;
          color: #dc2626;
          padding: 10px 20px;
          border-radius: 5px;
          display: inline-block;
          font-weight: bold;
          margin: 15px 0;
        }
        .button {
          display: inline-block;
          background: #06b6d4;
          color: white !important;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #666;
          font-size: 12px;
          border: 1px solid #ddd;
          border-top: none;
          border-radius: 0 0 10px 10px;
        }
        .info-box {
          background: #fef3c7;
          border: 1px solid #fbbf24;
          border-radius: 10px;
          padding: 15px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>❌ Réservation annulée</h1>
        <p>Confirmation d'annulation</p>
      </div>
      
      <div class="content">
        <p>Bonjour <strong>${prenom}</strong>,</p>
        
        <p>Nous confirmons l'annulation de votre réservation. Voici le récapitulatif :</p>
        
        <div style="text-align: center;">
          <span class="cancelled-badge">ANNULÉE</span>
        </div>
        
        <div class="reservation-box">
          <h3>📍 ${reservation.hotelName}</h3>
          <p style="color: #999; margin-top: 0;">${reservation.roomType}</p>
          
          <div class="detail-row">
            <span class="detail-label">📅 Arrivée prévue</span>
            <span class="detail-value">${reservation.checkIn}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">📅 Départ prévu</span>
            <span class="detail-value">${reservation.checkOut}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">🌙 Durée</span>
            <span class="detail-value">${reservation.nights} nuit${reservation.nights > 1 ? "s" : ""}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">N° confirmation</span>
            <span class="detail-value">${reservation.numConfirmation}</span>
          </div>
        </div>
        
        <div class="info-box">
          <strong>💳 Remboursement :</strong>
          <p style="margin: 10px 0 0 0;">
            Si votre réservation était prépayée et éligible au remboursement, 
            celui-ci sera effectué sous 5 à 10 jours ouvrés sur votre moyen de paiement initial.
          </p>
        </div>
        
        <p>Nous espérons vous revoir bientôt pour une prochaine réservation !</p>
        
        <p style="text-align: center;">
          <a href="${baseUrl}/fr/hotels" class="button">Rechercher un nouvel hôtel</a>
        </p>
      </div>
      
      <div class="footer">
        <p>© ${new Date().getFullYear()} Hotel Booking - Tous droits réservés</p>
        <p>Besoin d'aide ? Contactez-nous à support@hotelbooking.com</p>
      </div>
    </body>
    </html>
  `;

  const text = `
    Bonjour ${prenom},

    Nous confirmons l'annulation de votre réservation.

    RÉSERVATION ANNULÉE
    
    Numéro de confirmation : ${reservation.numConfirmation}
    Hôtel : ${reservation.hotelName}
    Chambre : ${reservation.roomType}
    Arrivée prévue : ${reservation.checkIn}
    Départ prévu : ${reservation.checkOut}
    Durée : ${reservation.nights} nuit(s)

    REMBOURSEMENT :
    Si votre réservation était prépayée et éligible au remboursement, 
    celui-ci sera effectué sous 5 à 10 jours ouvrés sur votre moyen de paiement initial.

    Nous espérons vous revoir bientôt !

    Rechercher un nouvel hôtel : ${baseUrl}/fr/hotels

    Hotel Booking
  `;

  return sendEmail({ to, subject, html, text });
}