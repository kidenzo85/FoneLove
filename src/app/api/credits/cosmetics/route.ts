import { NextRequest, NextResponse } from 'next/server'
import { getCosmetics } from '@/lib/supabase-credits'

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ error: 'userId est requis' }, { status: 400 })
    }
    const cosmetics = await getCosmetics(userId)
    return NextResponse.json({ cosmetics })
  } catch (error) {
    console.error('Cosmetics fetch error:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des cosmétiques' }, { status: 500 })
  }
}
