import { NextResponse } from 'next/server'
import { detectCurrency } from '@/lib/supabase-credits'

export async function GET() {
  try {
    const detection = await detectCurrency()
    return NextResponse.json(detection)
  } catch (error) {
    console.error('Currency detect error:', error)
    return NextResponse.json({
      currencyCode: 'EUR',
      countryCode: 'FR',
      countryName: 'France',
      source: 'fallback',
      supported: true,
    })
  }
}
