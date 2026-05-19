-- ============================================================
-- ConnectPhone — Migration 001: Core Credit Tables
-- Remplace les modèles Prisma: Wallet, Transaction, DailyStreak
-- ============================================================

-- ===== WALLETS =====
-- Table principale du système de crédits ConnectCoin
CREATE TABLE IF NOT EXISTS public.wallets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance     INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  total_earned INTEGER NOT NULL DEFAULT 0 CHECK (total_earned >= 0),
  total_spent  INTEGER NOT NULL DEFAULT 0 CHECK (total_spent >= 0),

  -- Daily free CC tracking
  daily_free_claimed BOOLEAN NOT NULL DEFAULT FALSE,
  daily_free_streak  INTEGER NOT NULL DEFAULT 0,
  last_free_claim_at TIMESTAMPTZ,
  free_boost_claimed BOOLEAN NOT NULL DEFAULT FALSE,

  -- First purchase tracking
  first_purchase_made BOOLEAN NOT NULL DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT unique_user_wallet UNIQUE(user_id)
);

-- Index pour lookup rapide par user_id (déjà implicite via UNIQUE, mais explicite pour clarté)
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets(user_id);

-- Commentaire de documentation
COMMENT ON TABLE public.wallets IS 'Portefeuilles ConnectCoin - solde et tracking quotidien';
COMMENT ON COLUMN public.wallets.daily_free_streak IS 'Jours consécutifs de réclamation quotidienne';
COMMENT ON COLUMN public.wallets.last_free_claim_at IS 'Date/heure de la dernière réclamation quotidienne (NULL = jamais)';

-- ===== TRANSACTIONS =====
-- Journal complet de toutes les opérations ConnectCoin
CREATE TABLE IF NOT EXISTS public.transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id   UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Type d'opération
  type        TEXT NOT NULL CHECK (type IN (
    'earn_free',       -- CC gratuits quotidiens
    'earn_streak',     -- Bonus de streak
    'earn_bonus',      -- Bonus divers (première commande, rose offerte, etc.)
    'earn_challenge',  -- Récompense de défi accompli
    'earn_promo',      -- Bonus promotionnel
    'earn_gift',       -- CC offerts (admin)
    'spend',           -- Dépense pour action premium
    'purchase'         -- Achat de pack
  )),
  amount      INTEGER NOT NULL, -- Positif pour earn, négatif pour spend
  action      TEXT,             -- 'daily_free', 'super_request', 'boost', etc.
  pack_type   TEXT,             -- 'decouverte', 'tendance', 'passion', 'flamme'
  description TEXT NOT NULL,
  metadata    JSONB DEFAULT '{}',

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index composites pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON public.transactions(wallet_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_wallet_type ON public.transactions(wallet_id, type);

COMMENT ON TABLE public.transactions IS 'Journal de toutes les opérations ConnectCoin (crédits et débits)';
COMMENT ON COLUMN public.transactions.amount IS 'Montant en CC. Positif = crédit, Négatif = débit';
COMMENT ON COLUMN public.transactions.metadata IS 'Données additionnelles en JSON: streak info, pack details, promo info, currency info';

-- ===== DAILY STREAKS =====
-- Suivi des streaks quotidiens (distinct du daily_free_streak dans wallets)
CREATE TABLE IF NOT EXISTS public.daily_streaks (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak    INTEGER NOT NULL DEFAULT 0 CHECK (current_streak >= 0),
  longest_streak    INTEGER NOT NULL DEFAULT 0 CHECK (longest_streak >= 0),
  last_check_in     TIMESTAMPTZ,
  today_bonus_claimed BOOLEAN NOT NULL DEFAULT FALSE,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT unique_user_streak UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_daily_streaks_user_id ON public.daily_streaks(user_id);

COMMENT ON TABLE public.daily_streaks IS 'Suivi des streaks quotidiens de connexion';
