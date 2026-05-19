// ============================================================
// ConnectPhone — Edge Function: daily-reset
// Fonction cron quotidienne pour:
// 1. [SETUP mode] Configurer pg_cron au premier appel
// 2. Réinitialiser les flags quotidiens (dailyFreeClaimed, etc.)
// 3. Nettoyer les données expirées (défis, promos)
// 4. Rafraîchir les taux de change si périmés
// 5. S'assurer que les défis hebdomadaires existent
//
// Modes d'appel:
// - GET/POST ?secret=xxx             → Exécution quotidienne normale
// - GET/POST ?secret=xxx&setup=true  → Configure pg_cron + exécution quotidienne
// ============================================================

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const CRON_SECRET = Deno.env.get('CRON_SECRET') || 'connectphone-daily-reset-2026'

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS })
  }

  try {
    // Vérification d'autorisation
    const authHeader = req.headers.get('authorization')
    const bearerToken = authHeader?.replace('Bearer ', '')
    const url = new URL(req.url)
    const urlSecret = url.searchParams.get('secret')
    const isSetup = url.searchParams.get('setup') === 'true'

    if (bearerToken !== CRON_SECRET && urlSecret !== CRON_SECRET) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 401, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const results: Record<string, unknown> = {}

    // ===== SETUP: Configurer pg_cron au premier appel =====
    if (isSetup) {
      // Activer les extensions pg_cron et pg_net via RPC
      // Note: Les extensions doivent être activées via le Dashboard ou SQL Editor
      // si elles ne sont pas encore disponibles.
      // On essaie de planifier les cron jobs via la fonction invoke

      const cronJobs = [
        {
          name: 'connectphone-reset-daily-flags',
          schedule: '5 0 * * *',
          command: 'SELECT reset_daily_flags();',
        },
        {
          name: 'connectphone-cleanup-expired',
          schedule: '10 0 * * *',
          command: 'SELECT cleanup_expired_data();',
        },
        {
          name: 'connectphone-ensure-weekly-challenges',
          schedule: '15 0 * * *',
          command: 'SELECT ensure_weekly_challenges();',
        },
        {
          name: 'connectphone-daily-reset-edge-function',
          schedule: '30 0 * * *',
          command: `SELECT net.http_post(url := '${supabaseUrl}/functions/v1/daily-reset?secret=${CRON_SECRET}', headers := '{"Content-Type":"application/json","Authorization":"Bearer ${CRON_SECRET}"}'::jsonb, body := '{}'::jsonb);`,
        },
      ]

      const setupResults: Record<string, unknown> = {}

      for (const job of cronJobs) {
        try {
          // Utiliser la fonction RPC pour planifier via cron.schedule
          // Note: Ceci nécessite que pg_cron soit activé au préalable
          const { data, error } = await supabase.rpc('cron_schedule_if_available', {
            p_job_name: job.name,
            p_schedule: job.schedule,
            p_command: job.command,
          })
          if (error) {
            setupResults[job.name] = { error: error.message, note: 'pg_cron peut ne pas être activé. Activez-le via Dashboard > Database > Extensions' }
          } else {
            setupResults[job.name] = { success: true, data }
          }
        } catch (err) {
          setupResults[job.name] = { error: String(err) }
        }
      }

      results.pgCronSetup = setupResults
    }

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

    // ===== 3. Rafraîchir les taux de change périmés =====
    const CACHE_TTL_MS = 24 * 60 * 60 * 1000
    const staleThreshold = new Date(Date.now() - CACHE_TTL_MS).toISOString()

    const { data: staleRates } = await supabase
      .from('exchange_rates')
      .select('target_currency')
      .lt('fetched_at', staleThreshold)
      .neq('source', 'fallback')

    let ratesRefreshed = 0
    if (staleRates && staleRates.length > 0) {
      const currencies = staleRates.map((r: { target_currency: string }) => r.target_currency)

      for (let i = 0; i < currencies.length; i += 10) {
        const batch = currencies.slice(i, i + 10)
        try {
          const controller = new AbortController()
          setTimeout(() => controller.abort(), 10000)
          const response = await fetch(
            `https://api.frankfurter.app/latest?from=EUR&to=${batch.join(',')}`,
            { signal: controller.signal }
          )
          if (response.ok) {
            const data = await response.json()
            for (const [currency, rate] of Object.entries(data.rates || {})) {
              await supabase
                .from('exchange_rates')
                .upsert({
                  base_currency: 'EUR',
                  target_currency: currency,
                  rate: rate as number,
                  source: 'frankfurter',
                  fetched_at: new Date().toISOString(),
                }, { onConflict: 'base_currency,target_currency' })
              ratesRefreshed++
            }
          }
        } catch (err) {
          console.warn(`Failed to refresh batch starting at ${i}:`, err)
        }
      }
    }
    results.exchangeRatesRefreshed = ratesRefreshed

    // ===== 4. S'assurer que les défis hebdomadaires existent =====
    const { error: challengesError } = await supabase.rpc('ensure_weekly_challenges')
    if (challengesError) {
      console.error('ensure_weekly_challenges error:', challengesError)
      results.ensureWeeklyChallenges = { error: challengesError.message }
    } else {
      results.ensureWeeklyChallenges = { success: true }
    }

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        results,
      }),
      { headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('daily-reset error:', error)
    return new Response(
      JSON.stringify({ error: 'Erreur interne du serveur', details: String(error) }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )
  }
})
