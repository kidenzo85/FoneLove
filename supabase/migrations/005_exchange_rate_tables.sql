-- ============================================================
-- ConnectPhone — Migration 005: Exchange Rate Table
-- Remplace le modèle Prisma: ExchangeRate
-- ============================================================

-- ===== EXCHANGE RATES =====
-- Cache des taux de change EUR → XXX (source: BCE via Frankfurter.app)
CREATE TABLE IF NOT EXISTS public.exchange_rates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency   TEXT NOT NULL DEFAULT 'EUR',
  target_currency TEXT NOT NULL,
  rate            NUMERIC(18,6) NOT NULL CHECK (rate > 0),
  source          TEXT NOT NULL DEFAULT 'fallback' CHECK (source IN ('frankfurter', 'fallback', 'manual')),
  fetched_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT unique_currency_pair UNIQUE(base_currency, target_currency)
);

CREATE INDEX IF NOT EXISTS idx_exchange_rates_target ON public.exchange_rates(target_currency);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_fetched ON public.exchange_rates(fetched_at);

COMMENT ON TABLE public.exchange_rates IS 'Cache des taux de change EUR vers autres devises (source BCE/Frankfurter)';
