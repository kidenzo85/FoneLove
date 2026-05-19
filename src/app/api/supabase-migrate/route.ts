/**
 * API Route: GET/POST /api/supabase-migrate
 * 
 * GET: Vérifie le statut de la migration (quelles tables/RPC existent)
 * POST: Instructions pour appliquer les migrations
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

function getAdminClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function GET() {
  const supabase = getAdminClient()

  const tables = [
    'wallets', 'transactions', 'daily_streaks', 'challenges',
    'challenge_progress', 'promo_offers', 'user_promos',
    'cosmetic_items', 'exchange_rates',
  ]

  const status: Record<string, boolean> = {}
  for (const table of tables) {
    const { error } = await supabase.from(table).select('id').limit(1)
    status[table] = !error || !error.message.includes('does not exist')
  }

  // Vérifier les fonctions RPC critiques
  const rpcFunctions = [
    'ensure_wallet', 'claim_daily_free', 'spend_credits',
    'purchase_pack', 'check_in_streak', 'claim_challenge',
    'get_user_balance',
  ]

  const rpcStatus: Record<string, boolean> = {}
  for (const fn of rpcFunctions) {
    try {
      const { error } = await supabase.rpc(fn, {})
      rpcStatus[fn] = error ? !error.message.includes('Could not find') : true
    } catch {
      rpcStatus[fn] = false
    }
  }

  const allTablesReady = Object.values(status).every(Boolean)
  const allRpcReady = Object.values(rpcStatus).every(Boolean)

  return NextResponse.json({
    ready: allTablesReady && allRpcReady,
    tables: status,
    rpcFunctions: rpcStatus,
    sqlEditorUrl: `https://supabase.com/dashboard/project/ldjfngzeikjmromaoqkl/sql`,
  })
}

export async function POST(req: NextRequest) {
  return NextResponse.json({
    message: 'Les migrations DDL doivent être appliquées via le SQL Editor Supabase.',
    sqlEditorUrl: `https://supabase.com/dashboard/project/ldjfngzeikjmromaoqkl/sql`,
    consolidatedFile: 'supabase/consolidated_migration.sql',
    instructions: [
      '1. Allez sur le SQL Editor Supabase (URL ci-dessus)',
      '2. Ouvrez le fichier supabase/consolidated_migration.sql du projet',
      '3. Copiez-collez tout le contenu dans l\'éditeur SQL',
      '4. Cliquez sur "Run" pour exécuter',
      '5. Vérifiez via GET /api/supabase-migrate que tout est OK',
    ],
  })
}
