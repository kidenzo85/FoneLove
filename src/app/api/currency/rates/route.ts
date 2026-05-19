import { NextRequest, NextResponse } from 'next/server'
import { fetchExchangeRate, fetchBulkRates } from '@/lib/supabase-credits'

export async function GET(req: NextRequest) {
  try {
    const currency = req.nextUrl.searchParams.get('currency') || 'EUR'
    const rateInfo = await fetchExchangeRate(currency)
    return NextResponse.json(rateInfo)
  } catch (error) {
    console.error('Exchange rate error:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des taux' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const currencies: string[] = body.currencies || []
    if (currencies.length === 0) {
      return NextResponse.json({ error: 'Liste de devises requise' }, { status: 400 })
    }
    const rates = await fetchBulkRates(currencies)
    return NextResponse.json({ rates, fetchedAt: new Date().toISOString() })
  } catch (error) {
    console.error('Bulk rates error:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des taux' }, { status: 500 })
  }
}
