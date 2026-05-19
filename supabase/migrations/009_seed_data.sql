-- ============================================================
-- ConnectPhone — Migration 009: Seed Data
-- Données initiales: exchange rates, première vague de défis
-- ============================================================

-- ===== Taux de change initiaux (fallback rates) =====
-- Sert de cache de secours si l'API Frankfurter est indisponible
INSERT INTO public.exchange_rates (base_currency, target_currency, rate, source, fetched_at) VALUES
  -- Europe
  ('EUR', 'GBP', 0.860000, 'fallback', now()),
  ('EUR', 'CHF', 0.940000, 'fallback', now()),
  ('EUR', 'NOK', 11.500000, 'fallback', now()),
  ('EUR', 'SEK', 11.400000, 'fallback', now()),
  ('EUR', 'DKK', 7.460000, 'fallback', now()),
  ('EUR', 'PLN', 4.310000, 'fallback', now()),
  ('EUR', 'CZK', 25.200000, 'fallback', now()),
  ('EUR', 'HUF', 395.000000, 'fallback', now()),
  ('EUR', 'RON', 4.970000, 'fallback', now()),
  ('EUR', 'BGN', 1.960000, 'fallback', now()),
  ('EUR', 'TRY', 36.500000, 'fallback', now()),
  ('EUR', 'RUB', 98.000000, 'fallback', now()),
  ('EUR', 'UAH', 42.000000, 'fallback', now()),
  -- Americas
  ('EUR', 'USD', 1.080000, 'fallback', now()),
  ('EUR', 'CAD', 1.470000, 'fallback', now()),
  ('EUR', 'MXN', 18.500000, 'fallback', now()),
  ('EUR', 'BRL', 6.050000, 'fallback', now()),
  ('EUR', 'ARS', 1100.000000, 'fallback', now()),
  ('EUR', 'COP', 4500.000000, 'fallback', now()),
  ('EUR', 'CLP', 980.000000, 'fallback', now()),
  ('EUR', 'PEN', 4.050000, 'fallback', now()),
  -- Africa
  ('EUR', 'XOF', 655.960000, 'fallback', now()),
  ('EUR', 'XAF', 655.960000, 'fallback', now()),
  ('EUR', 'NGN', 1750.000000, 'fallback', now()),
  ('EUR', 'ZAR', 20.200000, 'fallback', now()),
  ('EUR', 'EGP', 55.000000, 'fallback', now()),
  ('EUR', 'MAD', 10.800000, 'fallback', now()),
  ('EUR', 'DZD', 145.000000, 'fallback', now()),
  ('EUR', 'TND', 3.380000, 'fallback', now()),
  ('EUR', 'KES', 155.000000, 'fallback', now()),
  ('EUR', 'GHS', 15.500000, 'fallback', now()),
  ('EUR', 'CDF', 3150.000000, 'fallback', now()),
  -- Asia
  ('EUR', 'JPY', 163.000000, 'fallback', now()),
  ('EUR', 'CNY', 7.850000, 'fallback', now()),
  ('EUR', 'KRW', 1480.000000, 'fallback', now()),
  ('EUR', 'INR', 92.000000, 'fallback', now()),
  ('EUR', 'PKR', 300.000000, 'fallback', now()),
  ('EUR', 'BDT', 130.000000, 'fallback', now()),
  ('EUR', 'THB', 38.000000, 'fallback', now()),
  ('EUR', 'VND', 27500.000000, 'fallback', now()),
  ('EUR', 'IDR', 17800.000000, 'fallback', now()),
  ('EUR', 'PHP', 62.000000, 'fallback', now()),
  ('EUR', 'MYR', 5.000000, 'fallback', now()),
  ('EUR', 'SGD', 1.450000, 'fallback', now()),
  ('EUR', 'HKD', 8.450000, 'fallback', now()),
  ('EUR', 'TWD', 35.000000, 'fallback', now()),
  -- Middle East
  ('EUR', 'AED', 3.970000, 'fallback', now()),
  ('EUR', 'SAR', 4.050000, 'fallback', now()),
  ('EUR', 'QAR', 3.940000, 'fallback', now()),
  ('EUR', 'ILS', 3.950000, 'fallback', now()),
  ('EUR', 'KWD', 0.332000, 'fallback', now()),
  -- Oceania
  ('EUR', 'AUD', 1.680000, 'fallback', now()),
  ('EUR', 'NZD', 1.820000, 'fallback', now())
ON CONFLICT (base_currency, target_currency) DO NOTHING;

-- ===== Créer les défis de la semaine en cours =====
-- La fonction RPC ensure_weekly_challenges() gère cela,
-- mais on les crée aussi ici pour le seed initial
SELECT public.ensure_weekly_challenges();

-- ===== Promo Happy Hour par défaut (inactive, sert de template) =====
INSERT INTO public.promo_offers (type, title, description, discount_percent, starts_at, expires_at, is_active)
VALUES (
  'happy_hour',
  'Happy Hour',
  'Profite de +30% CC sur tous les packs ! Valide vendredi et dimanche de 20h à 23h.',
  30,
  now(),
  now() + INTERVAL '30 days',
  true
) ON CONFLICT DO NOTHING;
