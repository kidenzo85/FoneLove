/**
 * ConnectPhone — Cron Endpoint: Daily Reset
 *
 * Endpoint sécurisé pour déclencher les tâches quotidiennes:
 *   1. reset_daily_flags()        — Réinitialise les flags quotidiens
 *   2. cleanup_expired_data()     — Nettoie les données expirées
 *   3. ensure_weekly_challenges() — Crée les défis de la semaine
 *   4. Edge Function daily-reset  — Rafraîchit les taux de change
 *
 * Appelable par:
 *   - pg_cron (via pg_net)
 *   - cron-job.org ou tout scheduler externe
 *   - Manuellement via GET /api/cron/daily-reset?secret=xxx
 *
 * Sécurité: Vérifie le CRON_SECRET pour empêcher les appels non autorisés.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

const CRON_SECRET = process.env.CRON_SECRET || 'connectphone-daily-reset-2026'

export async function GET(req: NextRequest) {
  return POST(req)
}

export async function POST(req: NextRequest) {
  try {
    // Vérification d'autorisation
    const urlSecret = req.nextUrl.searchParams.get('secret')
    const authHeader = req.headers.get('authorization')
    const bearerToken = authHeader?.replace('Bearer ', '')

    if (urlSecret !== CRON_SECRET && bearerToken !== CRON_SECRET) {
      return NextResponse.json(
        { error: 'Non autorisé. Fournissez ?secret=CRON_SECRET ou Authorization: Bearer CRON_SECRET' },
        { status: 401 }
      )
    }

    const supabase = createAdminClient()
    const results: Record<string, unknown> = {}

    // ===== 1. Réinitialiser les flags quotidiens =====
    const { data: resetData, error: resetError } = await supabase.rpc('reset_daily_flags')
    if (resetError) {
      console.error('reset_daily_flags error:', resetError)
      results.resetDailyFlags = { error: resetError.message }
    } else {
      results.resetDailyFlags = { walletsReset: resetData }
    }

    // ===== 2. Nettoyer les données expirées =====
    const { data: cleanupData, error: cleanupError } = await supabase.rpc('cleanup_expired_data')
    if (cleanupError) {
      console.error('cleanup_expired_data error:', cleanupError)
      results.cleanupExpiredData = { error: cleanupError.message }
    } else {
      results.cleanupExpiredData = { itemsProcessed: cleanupData }
    }

    // ===== 3. S'assurer que les défis hebdomadaires existent =====
    const { error: challengesError } = await supabase.rpc('ensure_weekly_challenges')
    if (challengesError) {
      console.error('ensure_weekly_challenges error:', challengesError)
      results.ensureWeeklyChallenges = { error: challengesError.message }
    } else {
      results.ensureWeeklyChallenges = { success: true }
    }

    // ===== 4. Invoquer l'Edge Function daily-reset (refresh des taux) =====
    try {
      const { data: edgeData, error: edgeError } = await supabase.functions.invoke('daily-reset', {
        method: 'POST',
        headers: { Authorization: `Bearer ${CRON_SECRET}` },
      })
      if (edgeError) {
        results.dailyResetEdgeFunction = { error: edgeError.message }
      } else {
        results.dailyResetEdgeFunction = edgeData
      }
    } catch (edgeErr) {
      // Non-critique: les taux seront rafraîchis à la prochaine demande
      results.dailyResetEdgeFunction = { error: String(edgeErr), note: 'Non-critique' }
    }

    const success = !resetError && !cleanupError && !challengesError

    return NextResponse.json({
      success,
      timestamp: new Date().toISOString(),
      results,
    })
  } catch (error) {
    console.error('Cron daily-reset error:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur', details: String(error) },
      { status: 500 }
    )
  }
}
