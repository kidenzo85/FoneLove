import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { randomUUID } from 'crypto'
import { createMagicToken } from '@/lib/token-store'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

function buildMagicLinkEmail(verifyUrl: string): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Connexion Fonelove</title>
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;background-color:#0a0a12;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#0a0a12;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:420px;background:linear-gradient(145deg,#1a1a2e 0%,#16162a 100%);border-radius:24px;overflow:hidden;border:1px solid rgba(236,72,153,0.2);">
          <!-- Header gradient bar -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg,#ec4899,#f43f5e,#f59e0b);"></td>
          </tr>

          <!-- Logo -->
          <tr>
            <td align="center" style="padding:36px 32px 20px;">
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="width:48px;height:48px;text-align:center;vertical-align:middle;">
                    <img src="${process.env.NEXT_PUBLIC_APP_URL || 'https://fonelove.fr'}/logo.png" alt="Fonelove" width="48" height="48" style="border-radius:12px;display:block;" />
                  </td>
                  <td style="padding-left:12px;">
                    <span style="font-size:24px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;">Fonelove</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 32px;">
              <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(236,72,153,0.3),transparent);"></div>
            </td>
          </tr>

          <!-- Message -->
          <tr>
            <td style="padding:28px 32px 12px;text-align:center;">
              <h2 style="margin:0;font-size:22px;font-weight:800;color:#ffffff;line-height:1.3;">
                Salut ! 👋
              </h2>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 28px;text-align:center;">
              <p style="margin:0;font-size:15px;color:rgba(255,255,255,0.6);line-height:1.6;">
                Quelqu'un de spécial t'attend<br>sur Fonelove 💕
              </p>
              <p style="margin:16px 0 0;font-size:15px;color:rgba(255,255,255,0.5);line-height:1.6;">
                Appuie sur le bouton<br>pour te connecter :
              </p>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td align="center" style="padding:0 32px 32px;">
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="border-radius:16px;background:linear-gradient(135deg,#ec4899 0%,#f43f5e 50%,#f59e0b 100%);box-shadow:0 8px 32px rgba(236,72,153,0.4);">
                    <a href="${verifyUrl}" target="_blank" style="display:inline-block;padding:16px 48px;font-size:17px;font-weight:800;color:#ffffff;text-decoration:none;letter-spacing:0.3px;">
                      💕 Me connecter
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Expiry notice -->
          <tr>
            <td align="center" style="padding:0 32px 28px;">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.3);line-height:1.5;">
                Ce lien expire dans 15 minutes ⏱️<br>
                Si tu n'as pas demandé cette connexion,<br>ignore simplement cet email.
              </p>
            </td>
          </tr>

          <!-- Footer gradient bar -->
          <tr>
            <td style="height:1px;background:linear-gradient(90deg,transparent,rgba(236,72,153,0.2),transparent);"></td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:20px 32px;">
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.2);line-height:1.5;">
                © 2026 Fonelove — L'amour au bout du fil<br>
                Envoyé avec 💕 depuis Fonelove
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }

    // Generate magic link token
    const token = randomUUID()
    createMagicToken(token, email.trim().toLowerCase())

    // Build verify URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const verifyUrl = `${baseUrl}/api/auth/verify?token=${token}`

    // Send email
    await transporter.sendMail({
      from: {
        name: 'Fonelove 💕',
        address: process.env.GMAIL_USER || 'noreply@fonelove.fr',
      },
      to: email.trim(),
      subject: '💕 Ta connexion Fonelove t\'attend !',
      html: buildMagicLinkEmail(verifyUrl),
    })

    return NextResponse.json({ success: true, message: 'Lien magique envoyé !' })
  } catch (error) {
    console.error('Magic link error:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'envoi de l\'email' }, { status: 500 })
  }
}
