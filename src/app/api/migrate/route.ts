import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function POST() {
  try {
    const supabase = createAdminClient()

    // Check if tables already exist by trying to select from users
    const { error: checkError } = await supabase
      .from('users')
      .select('id')
      .limit(1)

    if (!checkError) {
      return NextResponse.json({
        success: true,
        message: 'Les tables existent déjà dans Supabase. Aucune migration nécessaire.',
      })
    }

    // Tables don't exist yet - we need to create them via SQL
    // Since we can't execute DDL via the REST API, return instructions
    return NextResponse.json({
      success: false,
      message: 'Les tables n\'existent pas encore dans Supabase. Veuillez exécuter le script SQL dans le Supabase SQL Editor.',
      instructions: [
        '1. Allez sur https://app.supabase.com/project/ldjfngzeikjmromaoqkl/sql',
        '2. Cliquez sur "New Query"',
        '3. Copiez-collez le contenu du fichier supabase-migration.sql',
        '4. Cliquez sur "Run" pour exécuter la migration',
        '5. Revenez ici et rechargez la page',
      ],
      sqlFile: '/supabase-migration.sql',
    }, { status: 400 })
  } catch (error) {
    console.error('Migration check error:', error)
    return NextResponse.json({ error: 'Erreur lors de la vérification de la migration' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = createAdminClient()

    // Check which tables exist
    const tables = [
      'users', 'profiles', 'photos', 'prompts', 'moments',
      'number_requests', 'messages', 'connections', 'likes',
      'profile_visits', 'reports', 'badges', 'event_signups',
    ]

    const results: Record<string, boolean> = {}

    for (const table of tables) {
      const { error } = await supabase.from(table).select('id').limit(1)
      results[table] = !error
    }

    const allExist = Object.values(results).every(Boolean)

    return NextResponse.json({
      allTablesExist: allExist,
      tables: results,
      message: allExist
        ? 'Toutes les tables sont prêtes !'
        : 'Certaines tables manquent. Exécutez la migration SQL.',
    })
  } catch (error) {
    console.error('Migration status error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
