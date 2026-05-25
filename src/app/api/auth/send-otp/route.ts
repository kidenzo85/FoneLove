import { NextRequest, NextResponse } from 'next/server'
import { storeOtp, canRequestOtp } from '@/lib/token-store'

/**
 * POST /api/auth/send-otp
 * Generates a 6-digit OTP code and sends it via Resend (or Nodemailer fallback).
 */
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()

    // Rate limiting: max 1 OTP per 60 seconds per email
    if (!canRequestOtp(normalizedEmail)) {
      return NextResponse.json({
        error: 'Attends un moment avant de demander un nouveau code',
        retryAfter: 60,
      }, { status: 429 })
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // Store OTP (30 minute expiry)
    storeOtp(normalizedEmail, otp)

    // Build email HTML
    const emailHtml = buildOtpEmailHtml(otp)

    // Try Resend first, fallback to Nodemailer
    const resendKey = process.env.RESEND_API_KEY
    if (resendKey) {
      await sendWithResend(resendKey, normalizedEmail, otp, emailHtml)
    } else {
      await sendWithNodemailer(normalizedEmail, otp, emailHtml)
    }

    console.log(`[OTP] Code sent to ${normalizedEmail}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json({ error: "Erreur lors de l'envoi du code" }, { status: 500 })
  }
}

// ─── Resend sender ──────────────────────────────────────
async function sendWithResend(apiKey: string, to: string, otp: string, html: string) {
  const { Resend } = await import('resend')
  const resend = new Resend(apiKey)

  const fromDomain = process.env.RESEND_FROM_DOMAIN
  const from = fromDomain
    ? `Fonelove <noreply@${fromDomain}>`
    : 'Fonelove <onboarding@resend.dev>'

  await resend.emails.send({
    from,
    to,
    subject: `${otp} — Ton code Fonelove`,
    html,
  })
}

// ─── Nodemailer fallback ─────────────────────────────────
async function sendWithNodemailer(to: string, otp: string, html: string) {
  const nodemailer = await import('nodemailer')
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })

  await transporter.sendMail({
    from: {
      name: 'Fonelove 💕',
      address: process.env.GMAIL_USER || 'noreply@fonelove.fr',
    },
    to,
    subject: `${otp} — Ton code Fonelove`,
    html,
  })
}

// ─── Email HTML template with inline SVG logo ───────────
function buildOtpEmailHtml(otp: string): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://fonelove.fr'
  // Split OTP into individual digits for styled display
  const digits = otp.split('')
  const digitBoxes = digits.map(d =>
    `<td style="width:44px;height:52px;background:rgba(236,72,153,0.08);border:2px solid rgba(236,72,153,0.3);border-radius:12px;text-align:center;vertical-align:middle;font-size:28px;font-weight:800;color:#ffffff;font-family:'Courier New',monospace;letter-spacing:0;">${d}</td>`
  ).join('<td style="width:6px;"></td>')

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code Fonelove</title>
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

          <!-- Logo: SVG inline — combiné téléphone + cœur -->
          <tr>
            <td align="center" style="padding:36px 32px 20px;">
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="width:56px;height:56px;text-align:center;vertical-align:middle;">
                    <img src="${appUrl}/logo.png" alt="Fonelove" width="56" height="56" style="border-radius:16px;display:block;" />
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
              <h2 style="margin:0;font-size:20px;font-weight:800;color:#ffffff;line-height:1.3;">
                Ton code de connexion
              </h2>
            </td>
          </tr>
          <tr>
            <td style="padding:4px 32px 24px;text-align:center;">
              <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.5);line-height:1.5;">
                Entre ce code dans l'application<br>pour te connecter à Fonelove
              </p>
            </td>
          </tr>

          <!-- OTP Code — individual digit boxes -->
          <tr>
            <td align="center" style="padding:0 24px 8px;">
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  ${digitBoxes}
                </tr>
              </table>
            </td>
          </tr>

          <!-- Expiry -->
          <tr>
            <td align="center" style="padding:16px 32px 28px;">
              <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.35);line-height:1.5;">
                Ce code expire dans <span style="color:#ec4899;font-weight:600;">30 minutes</span> ⏱️<br>
                Si tu n'as pas demandé ce code, ignore cet email.
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
                © ${new Date().getFullYear()} Fonelove — L'amour au bout du fil<br>
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
