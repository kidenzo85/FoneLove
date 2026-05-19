import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import prisma from '@/lib/prisma'
import { verifyMagicToken, createRedeemToken } from '@/lib/token-store'

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token')

    if (!token) {
      return buildErrorPage('Lien invalide', 'Ce lien de connexion est incomplet.')
    }

    // Verify the magic token
    const result = verifyMagicToken(token)
    if (!result.valid || !result.email) {
      return buildErrorPage(
        'Lien expiré ou déjà utilisé',
        'Ce lien n\'est plus valide. Retourne sur Fonelove pour en recevoir un nouveau.'
      )
    }

    const email = result.email

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      // New user — create account
      const phone = `+336${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`
      const firstName = email.split('@')[0] || 'Utilisateur'

      user = await prisma.user.create({
        data: {
          email,
          phone,
          password: `magic_${Date.now()}`,
          firstName,
          isVerified: true,
          profileScore: 10,
          isActive: true,
          profile: {
            create: {
              onboardingStep: 0,
              onboardingDone: false,
            },
          },
          wallet: {
            create: {},
          },
        },
      })
    } else {
      // Existing user — update last active
      await prisma.user.update({
        where: { id: user.id },
        data: { lastActiveAt: new Date() },
      })
    }

    // Generate a one-time redeem code
    const redeemCode = randomUUID()
    createRedeemToken(redeemCode, user.id, email)

    // Redirect to app with redeem code
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    return NextResponse.redirect(`${baseUrl}?redeem=${redeemCode}`)
  } catch (error) {
    console.error('Verify error:', error)
    return buildErrorPage(
      'Erreur',
      'Une erreur est survenue. Retourne sur Fonelove pour réessayer.'
    )
  }
}

function buildErrorPage(title: string, message: string): NextResponse {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Fonelove</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Segoe UI', Roboto, sans-serif;
      background: #0a0a12;
      color: white;
      padding: 24px;
    }
    .card {
      max-width: 380px;
      text-align: center;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(236,72,153,0.2);
      border-radius: 24px;
      padding: 40px 32px;
      backdrop-filter: blur(20px);
    }
    .icon { font-size: 48px; margin-bottom: 16px; }
    h1 { font-size: 22px; font-weight: 800; margin-bottom: 12px; }
    p { font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.6; margin-bottom: 24px; }
    a {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #ec4899, #f43f5e, #f59e0b);
      color: white;
      text-decoration: none;
      font-weight: 700;
      border-radius: 14px;
      font-size: 15px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">😕</div>
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="${baseUrl}">Retour à Fonelove 💕</a>
  </div>
</body>
</html>`

  return new NextResponse(html, {
    status: 400,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
