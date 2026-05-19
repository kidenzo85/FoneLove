-- ============================================================
-- ConnectPhone — Migration Consolidée
-- Ce fichier contient TOUTES les migrations dans l'ordre
-- À exécuter en une seule fois dans le SQL Editor Supabase
-- ============================================================

-- >>> 001_credit_tables.sql <<<

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


-- >>> 002_challenge_tables.sql <<<

-- ============================================================
-- ConnectPhone — Migration 002: Challenge Tables
-- Remplace les modèles Prisma: Challenge, ChallengeProgress
-- ============================================================

-- ===== CHALLENGES =====
-- Défis hebdomadaires renouvelés chaque lundi
CREATE TABLE IF NOT EXISTS public.challenges (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type         TEXT NOT NULL CHECK (type IN ('sociable', 'audacieux', 'complet', 'actif', 'curieux')),
  title        TEXT NOT NULL,
  description  TEXT NOT NULL,
  target_count INTEGER NOT NULL CHECK (target_count > 0),
  reward       INTEGER NOT NULL CHECK (reward > 0), -- CC reward
  resets_at    TIMESTAMPTZ NOT NULL, -- Date de fin de la semaine en cours

  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pour retrouver les défis de la semaine en cours
CREATE INDEX IF NOT EXISTS idx_challenges_resets_at ON public.challenges(resets_at);
CREATE INDEX IF NOT EXISTS idx_challenges_type ON public.challenges(type);

COMMENT ON TABLE public.challenges IS 'Défis hebdomadaires ConnectCoin (renouvelés chaque lundi)';

-- ===== CHALLENGE PROGRESS =====
-- Progression de chaque utilisateur sur chaque défi
CREATE TABLE IF NOT EXISTS public.challenge_progress (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  progress     INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0),
  completed    BOOLEAN NOT NULL DEFAULT FALSE,
  claimed      BOOLEAN NOT NULL DEFAULT FALSE,

  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT unique_user_challenge UNIQUE(user_id, challenge_id)
);

CREATE INDEX IF NOT EXISTS idx_challenge_progress_user_id ON public.challenge_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_challenge_progress_challenge_id ON public.challenge_progress(challenge_id);

COMMENT ON TABLE public.challenge_progress IS 'Progression utilisateur sur les défis hebdomadaires';


-- >>> 003_promo_tables.sql <<<

-- ============================================================
-- ConnectPhone — Migration 003: Promo Tables
-- Remplace les modèles Prisma: PromoOffer, UserPromo
-- ============================================================

-- ===== PROMO OFFERS =====
-- Offres promotionnelles gérées par l'admin
CREATE TABLE IF NOT EXISTS public.promo_offers (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type             TEXT NOT NULL CHECK (type IN (
    'happy_hour', 'match_pack', 'birthday', 'streak_reward',
    'first_purchase', 'flash_sale', 'seasonal', 'custom'
  )),
  title            TEXT NOT NULL,
  description      TEXT NOT NULL,
  discount_percent INTEGER CHECK (discount_percent IS NULL OR (discount_percent > 0 AND discount_percent <= 100)),
  bonus_cc         INTEGER CHECK (bonus_cc IS NULL OR bonus_cc > 0),
  bonus_action     TEXT,         -- Action gratuite offerte: 'boost', 'rose_connect', 'theme_flame'
  pack_type        TEXT,         -- Si la promo s'applique à un pack spécifique
  starts_at        TIMESTAMPTZ NOT NULL,
  expires_at       TIMESTAMPTZ NOT NULL,
  is_active        BOOLEAN NOT NULL DEFAULT TRUE,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_promo_offers_active ON public.promo_offers(is_active, starts_at, expires_at);
CREATE INDEX IF NOT EXISTS idx_promo_offers_type ON public.promo_offers(type);

COMMENT ON TABLE public.promo_offers IS 'Offres promotionnelles (happy hour, anniversaire, flash sale, etc.)';

-- ===== USER PROMOS =====
-- Suivi des promos utilisées par chaque utilisateur
CREATE TABLE IF NOT EXISTS public.user_promos (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  promo_id   UUID NOT NULL REFERENCES public.promo_offers(id) ON DELETE CASCADE,
  used       BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT unique_user_promo UNIQUE(user_id, promo_id)
);

CREATE INDEX IF NOT EXISTS idx_user_promos_user_id ON public.user_promos(user_id);
CREATE INDEX IF NOT EXISTS idx_user_promos_unused ON public.user_promos(user_id, used) WHERE used = FALSE;

COMMENT ON TABLE public.user_promos IS 'Promos réclamées/utilisées par utilisateur';


-- >>> 004_cosmetic_tables.sql <<<

-- ============================================================
-- ConnectPhone — Migration 004: Cosmetic Items
-- Remplace le modèle Prisma: CosmeticItem
-- ============================================================

-- ===== COSMETIC ITEMS =====
-- Items cosmétiques achetés ou gagnés par l'utilisateur
CREATE TABLE IF NOT EXISTS public.cosmetic_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN (
    'theme_flame', 'theme_star', 'theme_aura', 'theme_legende',
    'custom_badge', 'request_animation', 'profile_frame',
    'emoji_pack', 'chat_theme'
  )),
  is_active    BOOLEAN NOT NULL DEFAULT FALSE,
  custom_text  TEXT CHECK (custom_text IS NULL OR length(custom_text) <= 20),
  color_choice TEXT,

  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cosmetic_items_user_id ON public.cosmetic_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cosmetic_items_user_type_active ON public.cosmetic_items(user_id, type, is_active);

COMMENT ON TABLE public.cosmetic_items IS 'Items cosmétiques (thèmes, badges, animations) achetés ou gagnés';


-- >>> 005_exchange_rate_tables.sql <<<

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


-- >>> 006_rls_policies.sql <<<

-- ============================================================
-- ConnectPhone — Migration 006: Row Level Security Policies
-- Sécurité row-level pour toutes les tables du système de crédits
--
-- Principe: L'utilisateur ne peut lire/modifier QUE ses propres données.
-- Les fonctions RPC (SECURITY DEFINER) contournent les RLS pour les opérations atomiques.
-- Le service_role key bypass entièrement les RLS (pour les opérations admin).
-- ============================================================

-- ===== Helper: Activer RLS sur toutes les tables =====
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_promos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cosmetic_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- WALLETS — L'utilisateur peut lire et mettre à jour SON portefeuille
-- Les INSERT sont gérés par le trigger on_auth_user_created ou ensure_wallet()
-- Les UPDATE directs sont limités (les opérations atomiques passent par RPC)
-- ===================================================================

-- Lecture de son propre portefeuille
CREATE POLICY "users_read_own_wallet" ON public.wallets
  FOR SELECT USING (auth.uid() = user_id);

-- Mise à jour limitée de son portefeuille (le RPC fait les vraies opérations)
CREATE POLICY "users_update_own_wallet" ON public.wallets
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insertion via trigger/auth uniquement (pas d'insert direct par l'utilisateur)
CREATE POLICY "service_role_insert_wallet" ON public.wallets
  FOR INSERT WITH CHECK (true); -- Le trigger/RPC gère la sécurité

-- ===================================================================
-- TRANSACTIONS — Lecture seule pour l'utilisateur, écriture via RPC
-- ===================================================================

-- Lecture de ses propres transactions
CREATE POLICY "users_read_own_transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Insertion via RPC uniquement (SECURITY DEFINER bypass RLS)
CREATE POLICY "service_role_insert_transaction" ON public.transactions
  FOR INSERT WITH CHECK (true);

-- Pas de UPDATE/DELETE pour les transactions (immutabilité)
-- Aucune politique UPDATE ou DELETE = impossible pour les utilisateurs non-service

-- ===================================================================
-- DAILY STREAKS — Lecture et check-in via RPC
-- ===================================================================

CREATE POLICY "users_read_own_streak" ON public.daily_streaks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_update_own_streak" ON public.daily_streaks
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "service_role_insert_streak" ON public.daily_streaks
  FOR INSERT WITH CHECK (true);

-- ===================================================================
-- CHALLENGES — Lecture publique (tous voient les défis), écriture admin
-- ===================================================================

-- Tout le monde peut lire les défis actifs
CREATE POLICY "anyone_read_challenges" ON public.challenges
  FOR SELECT USING (true);

-- Seul le service_role peut créer/modifier les défis
CREATE POLICY "service_role_manage_challenges" ON public.challenges
  FOR INSERT WITH CHECK (true);

CREATE POLICY "service_role_update_challenges" ON public.challenges
  FOR UPDATE USING (true);

-- ===================================================================
-- CHALLENGE PROGRESS — Lecture de sa progression, claim via RPC
-- ===================================================================

CREATE POLICY "users_read_own_progress" ON public.challenge_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_update_own_progress" ON public.challenge_progress
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "service_role_insert_progress" ON public.challenge_progress
  FOR INSERT WITH CHECK (true);

-- ===================================================================
-- PROMO OFFERS — Lecture publique, écriture admin
-- ===================================================================

CREATE POLICY "anyone_read_promos" ON public.promo_offers
  FOR SELECT USING (is_active = true AND starts_at <= now() AND expires_at >= now());

-- Admin peut tout voir
CREATE POLICY "service_role_full_promos" ON public.promo_offers
  FOR ALL USING (true);

-- ===================================================================
-- USER PROMOS — Lecture de ses propres promos, claim via RPC
-- ===================================================================

CREATE POLICY "users_read_own_user_promos" ON public.user_promos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "service_role_manage_user_promos" ON public.user_promos
  FOR INSERT WITH CHECK (true);

CREATE POLICY "users_update_own_user_promos" ON public.user_promos
  FOR UPDATE USING (auth.uid() = user_id);

-- ===================================================================
-- COSMETIC ITEMS — CRUD sur ses propres items
-- ===================================================================

CREATE POLICY "users_read_own_cosmetics" ON public.cosmetic_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_cosmetics" ON public.cosmetic_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_cosmetics" ON public.cosmetic_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "users_delete_own_cosmetics" ON public.cosmetic_items
  FOR DELETE USING (auth.uid() = user_id);

-- ===================================================================
-- EXCHANGE RATES — Lecture publique, écriture via Edge Function (service_role)
-- ===================================================================

CREATE POLICY "anyone_read_exchange_rates" ON public.exchange_rates
  FOR SELECT USING (true);

-- Seul le service_role peut écrire les taux
-- Pas de politique INSERT/UPDATE = impossible pour les utilisateurs anonymes


-- >>> 007_rpc_functions.sql <<<

-- ============================================================
-- ConnectPhone — Migration 007: PostgreSQL RPC Functions
-- Fonctions atomiques pour toutes les opérations du système de crédits
-- Toutes sont SECURITY DEFINER → s'exécutent avec les droits du créateur
-- et contournent les politiques RLS pour les opérations nécessitant atomicité.
-- ============================================================

-- ===================================================================
-- 1. ENSURE_WALLET — Crée un portefeuille si inexistant
-- Appelé automatiquement par le trigger ou manuellement par les RPC
-- ===================================================================
CREATE OR REPLACE FUNCTION public.ensure_wallet(p_user_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_wallet_id UUID;
BEGIN
  -- Tenter de créer le wallet
  INSERT INTO public.wallets (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING
  RETURNING id INTO v_wallet_id;

  -- Si déjà existant, récupérer l'ID
  IF v_wallet_id IS NULL THEN
    SELECT id INTO v_wallet_id FROM public.wallets WHERE user_id = p_user_id;
  END IF;

  RETURN v_wallet_id;
END;
$$;

COMMENT ON FUNCTION public.ensure_wallet IS 'Crée un portefeuille ConnectCoin si inexistant, retourne son ID';

-- ===================================================================
-- 2. CLAIM_DAILY_FREE — Réclamation atomique des CC quotidiens
-- Remplace: POST /api/credits/daily-free (avec Prisma $transaction)
-- Logique: BASE=3, streakBonus=max(streak-1, 0) capped at 5, absolute cap=9
-- ===================================================================
CREATE OR REPLACE FUNCTION public.claim_daily_free(p_user_id UUID)
RETURNS TABLE(
  success BOOLEAN,
  amount INTEGER,
  new_balance INTEGER,
  streak_days INTEGER,
  base_cc INTEGER,
  streak_bonus INTEGER,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_wallet_id UUID;
  v_balance INTEGER;
  v_daily_free_streak INTEGER;
  v_last_free_claim_at TIMESTAMPTZ;
  v_today DATE := CURRENT_DATE;
  v_base_cc INTEGER := 3;
  v_streak_bonus INTEGER := 0;
  v_total_cc INTEGER;
  v_max_streak_bonus INTEGER := 5;
  v_cap INTEGER := 9;
  v_new_streak INTEGER;
BEGIN
  -- S'assurer que le wallet existe
  v_wallet_id := ensure_wallet(p_user_id);

  -- Verrouiller le wallet pour la transaction
  SELECT balance, daily_free_streak, last_free_claim_at
  INTO v_balance, v_daily_free_streak, v_last_free_claim_at
  FROM public.wallets
  WHERE id = v_wallet_id
  FOR UPDATE;

  -- Vérifier si déjà réclamé aujourd'hui
  IF v_last_free_claim_at IS NOT NULL AND v_last_free_claim_at::DATE = v_today THEN
    RETURN QUERY SELECT
      false,
      0,
      v_balance,
      v_daily_free_streak,
      v_base_cc,
      0,
      'CC quotidiens déjà réclamés aujourd''hui'::TEXT;
    RETURN;
  END IF;

  -- Calculer le streak
  IF v_last_free_claim_at IS NOT NULL THEN
    IF v_last_free_claim_at::DATE = v_today - 1 THEN
      -- Jour consécutif
      v_new_streak := v_daily_free_streak + 1;
    ELSIF v_last_free_claim_at::DATE < v_today - 1 THEN
      -- Streak cassé
      v_new_streak := 1;
    ELSE
      v_new_streak := GREATEST(v_daily_free_streak, 1);
    END IF;
  ELSE
    -- Première réclamation
    v_new_streak := 1;
  END IF;

  -- Calculer le bonus (1 CC par jour de streak au-delà du 1er, max 5)
  v_streak_bonus := LEAST(GREATEST(v_new_streak - 1, 0), v_max_streak_bonus);

  -- Total avec cap absolu
  v_total_cc := LEAST(v_base_cc + v_streak_bonus, v_cap);

  -- Mettre à jour le wallet
  UPDATE public.wallets SET
    balance = balance + v_total_cc,
    total_earned = total_earned + v_total_cc,
    daily_free_claimed = TRUE,
    daily_free_streak = v_new_streak,
    last_free_claim_at = now(),
    updated_at = now()
  WHERE id = v_wallet_id;

  -- Mettre à jour le daily_streak
  INSERT INTO public.daily_streaks (user_id, current_streak, longest_streak, last_check_in, today_bonus_claimed)
  VALUES (p_user_id, v_new_streak, v_new_streak, now(), TRUE)
  ON CONFLICT (user_id) DO UPDATE SET
    current_streak = v_new_streak,
    longest_streak = GREATEST(public.daily_streaks.longest_streak, v_new_streak),
    last_check_in = now(),
    today_bonus_claimed = TRUE,
    updated_at = now();

  -- Créer la transaction
  INSERT INTO public.transactions (wallet_id, user_id, type, amount, action, description, metadata)
  VALUES (
    v_wallet_id,
    p_user_id,
    CASE WHEN v_new_streak > 1 THEN 'earn_streak' ELSE 'earn_free' END,
    v_total_cc,
    'daily_free',
    'CC quotidiens gratuits: ' || v_base_cc || ' CC de base' ||
    CASE WHEN v_streak_bonus > 0 THEN ' + ' || v_streak_bonus || ' CC bonus streak (' || v_new_streak || ' jours)' ELSE '' END,
    jsonb_build_object(
      'baseAmount', v_base_cc,
      'streakBonus', v_streak_bonus,
      'streakDays', v_new_streak,
      'capped', (v_total_cc < v_base_cc + v_streak_bonus)
    )
  );

  RETURN QUERY SELECT
    true,
    v_total_cc,
    v_balance + v_total_cc,
    v_new_streak,
    v_base_cc,
    v_streak_bonus,
    'Vous avez reçu ' || v_total_cc || ' CC !'::TEXT;
END;
$$;

COMMENT ON FUNCTION public.claim_daily_free IS 'Réclamation atomique des CC quotidiens gratuits (base 3 + streak bonus, cap 9)';

-- ===================================================================
-- 3. SPEND_CREDITS — Dépense atomique de CC pour une action premium
-- Remplace: POST /api/credits/spend (avec Prisma $transaction)
-- Inclut la gestion des cosmétiques (désactivation anciens, création nouveau)
-- ===================================================================
CREATE OR REPLACE FUNCTION public.spend_credits(
  p_user_id UUID,
  p_action TEXT,
  p_amount INTEGER,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS TABLE(
  success BOOLEAN,
  transaction_id UUID,
  amount INTEGER,
  new_balance INTEGER,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_wallet_id UUID;
  v_balance INTEGER;
  v_tx_id UUID;
  v_custom_text TEXT;
  v_color_choice TEXT;
  v_cosmetic_types TEXT[] := ARRAY['theme_flame','theme_star','theme_aura','custom_badge','request_animation'];
BEGIN
  -- Valider l'action
  IF p_amount <= 0 THEN
    RETURN QUERY SELECT false, NULL::UUID, 0, 0, 'Montant invalide'::TEXT;
    RETURN;
  END IF;

  -- S'assurer que le wallet existe
  v_wallet_id := ensure_wallet(p_user_id);

  -- Verrouiller le wallet
  SELECT balance INTO v_balance
  FROM public.wallets
  WHERE id = v_wallet_id
  FOR UPDATE;

  -- Vérifier le solde
  IF v_balance < p_amount THEN
    RETURN QUERY SELECT
      false,
      NULL::UUID,
      p_amount,
      v_balance,
      'Solde insuffisant. Requis: ' || p_amount || ' CC, Disponible: ' || v_balance || ' CC'::TEXT;
    RETURN;
  END IF;

  -- Créer la transaction (montant négatif)
  INSERT INTO public.transactions (wallet_id, user_id, type, amount, action, description, metadata)
  VALUES (
    v_wallet_id,
    p_user_id,
    'spend',
    -p_amount,
    p_action,
    p_action || ' - ' || p_amount || ' CC',
    p_metadata
  )
  RETURNING id INTO v_tx_id;

  -- Gestion des cosmétiques
  IF p_action = ANY(v_cosmetic_types) THEN
    -- Extraire custom_text et color_choice du metadata
    v_custom_text := p_metadata->>'customText';
    v_color_choice := p_metadata->>'colorChoice';

    -- Désactiver les anciens items du même type
    UPDATE public.cosmetic_items
    SET is_active = FALSE
    WHERE user_id = p_user_id AND type = p_action AND is_active = TRUE;

    -- Créer le nouveau cosmétique
    INSERT INTO public.cosmetic_items (user_id, type, is_active, custom_text, color_choice)
    VALUES (
      p_user_id,
      p_action,
      TRUE,
      CASE WHEN p_action = 'custom_badge' AND v_custom_text IS NOT NULL
           THEN SUBSTRING(v_custom_text FROM 1 FOR 20)
           ELSE NULL END,
      CASE WHEN p_action = 'theme_aura' AND v_color_choice IS NOT NULL
           THEN v_color_choice
           ELSE NULL END
    );
  END IF;

  -- Mettre à jour le wallet atomiquement
  UPDATE public.wallets SET
    balance = balance - p_amount,
    total_spent = total_spent + p_amount,
    updated_at = now()
  WHERE id = v_wallet_id
  RETURNING balance INTO v_balance;

  RETURN QUERY SELECT
    true,
    v_tx_id,
    -p_amount,
    v_balance,
    'Dépense de ' || p_amount || ' CC pour ' || p_action::TEXT;
END;
$$;

COMMENT ON FUNCTION public.spend_credits IS 'Dépense atomique de CC pour une action premium (double-spend prevention)';

-- ===================================================================
-- 4. PURCHASE_PACK — Achat atomique d'un pack ConnectCoin
-- Remplace: POST /api/credits/purchase (avec Prisma $transaction)
-- Gère: première commande bonus, promos actives, items gratuits (roses, thèmes)
-- ===================================================================
CREATE OR REPLACE FUNCTION public.purchase_pack(
  p_user_id UUID,
  p_pack_type TEXT,
  p_pack_cc INTEGER,
  p_pack_bonus_cc INTEGER,
  p_pack_price_eur NUMERIC,
  p_pack_free_rose INTEGER DEFAULT 0,
  p_pack_free_theme BOOLEAN DEFAULT FALSE,
  p_currency_code TEXT DEFAULT 'EUR',
  p_country_code TEXT DEFAULT 'FR',
  p_ppp_group TEXT DEFAULT 'high',
  p_ppp_multiplier NUMERIC DEFAULT 1.0,
  p_price_local NUMERIC DEFAULT NULL
)
RETURNS TABLE(
  success BOOLEAN,
  transaction_id UUID,
  total_cc INTEGER,
  effective_price NUMERIC,
  first_purchase_bonus INTEGER,
  promo_bonus_cc INTEGER,
  promo_discount_percent INTEGER,
  new_balance INTEGER,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_wallet_id UUID;
  v_balance INTEGER;
  v_tx_id UUID;
  v_is_first_purchase BOOLEAN;
  v_first_purchase_bonus INTEGER := 20;
  v_promo_bonus_cc INTEGER := 0;
  v_promo_discount_percent INTEGER := 0;
  v_total_cc INTEGER;
  v_effective_price NUMERIC;
  v_applied_promos JSONB := '[]'::JSONB;
  v_promo_record RECORD;
  v_user_promo_id UUID;
BEGIN
  -- S'assurer que le wallet existe
  v_wallet_id := ensure_wallet(p_user_id);

  -- Verrouiller le wallet
  SELECT balance INTO v_balance
  FROM public.wallets
  WHERE id = v_wallet_id
  FOR UPDATE;

  -- Vérifier si c'est la première commande
  SELECT NOT EXISTS (
    SELECT 1 FROM public.transactions
    WHERE wallet_id = v_wallet_id AND type = 'purchase'
  ) INTO v_is_first_purchase;

  -- Appliquer les promos utilisateur non utilisées
  FOR v_promo_record IN
    SELECT up.id, up.promo_id, po.type, po.title, po.discount_percent, po.bonus_cc, po.pack_type
    FROM public.user_promos up
    JOIN public.promo_offers po ON po.id = up.promo_id
    WHERE up.user_id = p_user_id
      AND up.used = FALSE
      AND po.is_active = TRUE
      AND po.starts_at <= now()
      AND po.expires_at >= now()
  LOOP
    -- Vérifier si la promo s'applique à ce pack
    IF v_promo_record.pack_type IS NOT NULL AND v_promo_record.pack_type != p_pack_type THEN
      CONTINUE;
    END IF;

    -- Appliquer le bonus CC
    IF v_promo_record.bonus_cc IS NOT NULL THEN
      v_promo_bonus_cc := v_promo_bonus_cc + v_promo_record.bonus_cc;
    END IF;

    -- Appliquer la réduction (prendre la plus grande)
    IF v_promo_record.discount_percent IS NOT NULL THEN
      v_promo_discount_percent := GREATEST(v_promo_discount_percent, v_promo_record.discount_percent);
    END IF;

    -- Marquer la promo comme utilisée
    UPDATE public.user_promos SET used = TRUE WHERE id = v_promo_record.id;

    -- Ajouter aux promos appliquées
    v_applied_promos := v_applied_promos || jsonb_build_object(
      'type', v_promo_record.type,
      'title', v_promo_record.title,
      'bonusCC', COALESCE(v_promo_record.bonus_cc, 0)
    );
  END LOOP;

  -- Calculer le total CC
  v_total_cc := p_pack_cc + p_pack_bonus_cc;
  IF v_is_first_purchase THEN
    v_total_cc := v_total_cc + v_first_purchase_bonus;
  END IF;
  v_total_cc := v_total_cc + v_promo_bonus_cc;

  -- Calculer le prix effectif après réduction
  v_effective_price := p_pack_price_eur * (1 - v_promo_discount_percent / 100.0);
  v_effective_price := ROUND(v_effective_price * 100) / 100;

  -- Créer la transaction principale
  INSERT INTO public.transactions (wallet_id, user_id, type, amount, action, pack_type, description, metadata)
  VALUES (
    v_wallet_id,
    p_user_id,
    'purchase',
    v_total_cc,
    NULL,
    p_pack_type,
    p_pack_type || ' - ' || v_total_cc || ' CC' ||
    CASE WHEN v_is_first_purchase THEN ' (+' || v_first_purchase_bonus || ' CC bonus 1ère commande)' ELSE '' END ||
    CASE WHEN v_promo_bonus_cc > 0 THEN ' | Promos: ' || (SELECT string_agg(title, ', ') FROM jsonb_to_recordset(v_applied_promos) AS x(title TEXT)) ELSE '' END,
    jsonb_build_object(
      'packType', p_pack_type,
      'baseCC', p_pack_cc,
      'bonusCC', p_pack_bonus_cc,
      'firstPurchaseBonus', CASE WHEN v_is_first_purchase THEN v_first_purchase_bonus ELSE 0 END,
      'promoBonusCC', v_promo_bonus_cc,
      'promoDiscountPercent', v_promo_discount_percent,
      'effectivePrice', v_effective_price,
      'freeRose', p_pack_free_rose,
      'freeTheme', p_pack_free_theme,
      'appliedPromos', v_applied_promos,
      'currencyCode', p_currency_code,
      'countryCode', p_country_code,
      'priceEUR', p_pack_price_eur,
      'pppGroup', p_ppp_group,
      'pppMultiplier', p_ppp_multiplier,
      'priceLocal', p_price_local
    )
  )
  RETURNING id INTO v_tx_id;

  -- Transaction rose gratuite
  IF p_pack_free_rose > 0 THEN
    INSERT INTO public.transactions (wallet_id, user_id, type, amount, action, description, metadata)
    VALUES (
      v_wallet_id, p_user_id, 'earn_bonus', 0, 'rose_connect',
      p_pack_free_rose || ' Rose(s) Connect offerte(s)',
      jsonb_build_object('freeCount', p_pack_free_rose, 'fromPack', p_pack_type)
    );
  END IF;

  -- Transaction thème gratuit
  IF p_pack_free_theme THEN
    INSERT INTO public.transactions (wallet_id, user_id, type, amount, action, description, metadata)
    VALUES (
      v_wallet_id, p_user_id, 'earn_bonus', 0, 'theme_flame',
      'Thème Flamme offert',
      jsonb_build_object('freeTheme', TRUE, 'fromPack', p_pack_type)
    );
  END IF;

  -- Transaction bonus première commande
  IF v_is_first_purchase THEN
    INSERT INTO public.transactions (wallet_id, user_id, type, amount, description, metadata)
    VALUES (
      v_wallet_id, p_user_id, 'earn_bonus', v_first_purchase_bonus,
      'Bonus première commande +' || v_first_purchase_bonus || ' CC',
      jsonb_build_object('firstPurchase', TRUE)
    );
  END IF;

  -- Transaction bonus promo
  IF v_promo_bonus_cc > 0 THEN
    INSERT INTO public.transactions (wallet_id, user_id, type, amount, description, metadata)
    VALUES (
      v_wallet_id, p_user_id, 'earn_promo', v_promo_bonus_cc,
      'Bonus promo +' || v_promo_bonus_cc || ' CC',
      jsonb_build_object('appliedPromos', v_applied_promos)
    );
  END IF;

  -- Mettre à jour le wallet
  UPDATE public.wallets SET
    balance = balance + v_total_cc,
    total_earned = total_earned + v_total_cc,
    first_purchase_made = TRUE,
    updated_at = now()
  WHERE id = v_wallet_id
  RETURNING balance INTO v_balance;

  RETURN QUERY SELECT
    true,
    v_tx_id,
    v_total_cc,
    v_effective_price,
    CASE WHEN v_is_first_purchase THEN v_first_purchase_bonus ELSE 0 END,
    v_promo_bonus_cc,
    v_promo_discount_percent,
    v_balance,
    'Pack ' || p_pack_type || ' acheté: +' || v_total_cc || ' CC'::TEXT;
END;
$$;

COMMENT ON FUNCTION public.purchase_pack IS 'Achat atomique de pack ConnectCoin avec gestion des promos et bonus';

-- ===================================================================
-- 5. CHECK_IN_STREAK — Check-in quotidien avec récompenses de milestone
-- Remplace: POST /api/credits/streak
-- ===================================================================
CREATE OR REPLACE FUNCTION public.check_in_streak(p_user_id UUID)
RETURNS TABLE(
  success BOOLEAN,
  current_streak INTEGER,
  longest_streak INTEGER,
  streak_continued BOOLEAN,
  milestone_day INTEGER,
  milestone_bonus_cc INTEGER,
  milestone_reward TEXT,
  new_balance INTEGER,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_wallet_id UUID;
  v_balance INTEGER;
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
  v_last_check_in TIMESTAMPTZ;
  v_new_streak INTEGER;
  v_streak_continued BOOLEAN;
  v_milestone_day INTEGER := NULL;
  v_milestone_bonus_cc INTEGER := 0;
  v_milestone_reward TEXT := NULL;
BEGIN
  -- S'assurer que le wallet existe
  v_wallet_id := ensure_wallet(p_user_id);

  -- Récupérer ou créer le streak
  SELECT current_streak, longest_streak, last_check_in
  INTO v_current_streak, v_longest_streak, v_last_check_in
  FROM public.daily_streaks
  WHERE user_id = p_user_id;

  IF NOT FOUND THEN
    INSERT INTO public.daily_streaks (user_id, current_streak, longest_streak, last_check_in, today_bonus_claimed)
    VALUES (p_user_id, 0, 0, NULL, FALSE)
    RETURNING current_streak, longest_streak, last_check_in
    INTO v_current_streak, v_longest_streak, v_last_check_in;
  END IF;

  -- Vérifier si déjà check-in aujourd'hui
  IF v_last_check_in IS NOT NULL AND v_last_check_in::DATE = CURRENT_DATE THEN
    RETURN QUERY SELECT
      false,
      v_current_streak,
      v_longest_streak,
      false,
      NULL::INTEGER,
      0,
      NULL::TEXT,
      0,
      'Check-in déjà effectué aujourd''hui'::TEXT;
    RETURN;
  END IF;

  -- Calculer le nouveau streak
  IF v_last_check_in IS NOT NULL THEN
    IF v_last_check_in::DATE = CURRENT_DATE - 1 THEN
      v_new_streak := v_current_streak + 1;
      v_streak_continued := TRUE;
    ELSIF v_last_check_in::DATE < CURRENT_DATE - 1 THEN
      v_new_streak := 1;
      v_streak_continued := FALSE;
    ELSE
      RETURN QUERY SELECT
        false,
        v_current_streak,
        v_longest_streak,
        false,
        NULL::INTEGER,
        0,
        NULL::TEXT,
        0,
        'Check-in déjà effectué aujourd''hui'::TEXT;
      RETURN;
    END IF;
  ELSE
    v_new_streak := 1;
    v_streak_continued := FALSE;
  END IF;

  -- Mettre à jour le streak
  UPDATE public.daily_streaks SET
    current_streak = v_new_streak,
    longest_streak = GREATEST(longest_streak, v_new_streak),
    last_check_in = now(),
    today_bonus_claimed = TRUE,
    updated_at = now()
  WHERE user_id = p_user_id;

  -- Vérifier les milestones
  -- Jour 5: +2 CC
  IF v_new_streak = 5 THEN
    v_milestone_day := 5;
    v_milestone_bonus_cc := 2;
    v_milestone_reward := 'bonus_cc';
  -- Jour 7: +3 CC + Boost gratuit
  ELSIF v_new_streak = 7 THEN
    v_milestone_day := 7;
    v_milestone_bonus_cc := 3;
    v_milestone_reward := 'free_boost';
  -- Jour 14: +4 CC + Rose Connect gratuite
  ELSIF v_new_streak = 14 THEN
    v_milestone_day := 14;
    v_milestone_bonus_cc := 4;
    v_milestone_reward := 'free_rose';
  -- Jour 30: +5 CC + Thème Légende
  ELSIF v_new_streak = 30 THEN
    v_milestone_day := 30;
    v_milestone_bonus_cc := 5;
    v_milestone_reward := 'theme_legende';
  END IF;

  -- Appliquer les récompenses de milestone
  IF v_milestone_bonus_cc > 0 THEN
    -- Créditer les CC bonus
    UPDATE public.wallets SET
      balance = balance + v_milestone_bonus_cc,
      total_earned = total_earned + v_milestone_bonus_cc,
      updated_at = now()
    WHERE id = v_wallet_id
    RETURNING balance INTO v_balance;

    -- Transaction pour le bonus
    INSERT INTO public.transactions (wallet_id, user_id, type, amount, description, metadata)
    VALUES (
      v_wallet_id, p_user_id, 'earn_streak', v_milestone_bonus_cc,
      'Milestone streak Jour ' || v_new_streak || ': +' || v_milestone_bonus_cc || ' CC',
      jsonb_build_object('streakDay', v_new_streak, 'reward', v_milestone_reward)
    );

    -- Récompenses spéciales
    IF v_milestone_reward = 'free_boost' THEN
      INSERT INTO public.transactions (wallet_id, user_id, type, amount, action, description, metadata)
      VALUES (
        v_wallet_id, p_user_id, 'earn_bonus', 0, 'boost',
        'Boost gratuit - Récompense streak 7 jours',
        jsonb_build_object('streakDay', 7, 'freeBoost', TRUE)
      );
    ELSIF v_milestone_reward = 'free_rose' THEN
      INSERT INTO public.transactions (wallet_id, user_id, type, amount, action, description, metadata)
      VALUES (
        v_wallet_id, p_user_id, 'earn_bonus', 0, 'rose_connect',
        'Rose Connect gratuite - Récompense streak 14 jours',
        jsonb_build_object('streakDay', 14, 'freeRose', TRUE)
      );
    ELSIF v_milestone_reward = 'theme_legende' THEN
      -- Désactiver les anciens thèmes
      UPDATE public.cosmetic_items SET is_active = FALSE
      WHERE user_id = p_user_id AND type = 'theme_flame' AND is_active = TRUE;

      -- Créer le thème Légende
      INSERT INTO public.cosmetic_items (user_id, type, is_active, custom_text)
      VALUES (p_user_id, 'theme_flame', TRUE, 'Légende');

      INSERT INTO public.transactions (wallet_id, user_id, type, amount, action, description, metadata)
      VALUES (
        v_wallet_id, p_user_id, 'earn_bonus', 0, 'theme_flame',
        'Thème Légende - Récompense streak 30 jours',
        jsonb_build_object('streakDay', 30, 'themeLegende', TRUE)
      );
    END IF;
  ELSE
    SELECT balance INTO v_balance FROM public.wallets WHERE id = v_wallet_id;
  END IF;

  RETURN QUERY SELECT
    true,
    v_new_streak,
    GREATEST(v_longest_streak, v_new_streak),
    v_streak_continued,
    v_milestone_day,
    v_milestone_bonus_cc,
    v_milestone_reward,
    v_balance,
    'Check-in réussi ! Streak: ' || v_new_streak || ' jours'::TEXT;
END;
$$;

COMMENT ON FUNCTION public.check_in_streak IS 'Check-in quotidien avec récompenses de milestone (jours 5, 7, 14, 30)';

-- ===================================================================
-- 6. CLAIM_CHALLENGE — Réclamation atomique d'une récompense de défi
-- Remplace: POST /api/credits/challenges/claim
-- ===================================================================
CREATE OR REPLACE FUNCTION public.claim_challenge(p_user_id UUID, p_challenge_id UUID)
RETURNS TABLE(
  success BOOLEAN,
  reward INTEGER,
  new_balance INTEGER,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_wallet_id UUID;
  v_balance INTEGER;
  v_progress RECORD;
  v_reward INTEGER;
BEGIN
  -- Vérifier la progression du défi
  SELECT cp.completed, cp.claimed, c.reward, c.type, c.title
  INTO v_progress
  FROM public.challenge_progress cp
  JOIN public.challenges c ON c.id = cp.challenge_id
  WHERE cp.user_id = p_user_id AND cp.challenge_id = p_challenge_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, 0, 0, 'Défi non trouvé'::TEXT;
    RETURN;
  END IF;

  IF NOT v_progress.completed THEN
    RETURN QUERY SELECT false, 0, 0, 'Défi non encore terminé'::TEXT;
    RETURN;
  END IF;

  IF v_progress.claimed THEN
    RETURN QUERY SELECT false, 0, 0, 'Récompense déjà réclamée'::TEXT;
    RETURN;
  END IF;

  v_reward := v_progress.reward;

  -- S'assurer que le wallet existe
  v_wallet_id := ensure_wallet(p_user_id);

  -- Verrouiller le wallet
  SELECT balance INTO v_balance
  FROM public.wallets
  WHERE id = v_wallet_id
  FOR UPDATE;

  -- Marquer comme réclamé
  UPDATE public.challenge_progress
  SET claimed = TRUE, updated_at = now()
  WHERE user_id = p_user_id AND challenge_id = p_challenge_id;

  -- Créditer la récompense
  UPDATE public.wallets SET
    balance = balance + v_reward,
    total_earned = total_earned + v_reward,
    updated_at = now()
  WHERE id = v_wallet_id
  RETURNING balance INTO v_balance;

  -- Créer la transaction
  INSERT INTO public.transactions (wallet_id, user_id, type, amount, action, description, metadata)
  VALUES (
    v_wallet_id, p_user_id, 'earn_challenge', v_reward,
    'challenge_' || v_progress.type,
    'Défi "' || v_progress.title || '" accompli : +' || v_reward || ' CC',
    jsonb_build_object('challengeId', p_challenge_id, 'challengeType', v_progress.type, 'reward', v_reward)
  );

  RETURN QUERY SELECT
    true,
    v_reward,
    v_balance,
    'Défi "' || v_progress.title || '" : +' || v_reward || ' CC'::TEXT;
END;
$$;

COMMENT ON FUNCTION public.claim_challenge IS 'Réclamation atomique de la récompense d''un défi accompli';

-- ===================================================================
-- 7. GET_USER_BALANCE — Récupère le solde complet avec infos de niveau
-- Remplace: GET /api/credits/balance
-- ===================================================================
CREATE OR REPLACE FUNCTION public.get_user_balance(p_user_id UUID)
RETURNS TABLE(
  balance INTEGER,
  total_earned INTEGER,
  total_spent INTEGER,
  daily_free_claimed BOOLEAN,
  daily_free_streak INTEGER,
  free_boost_claimed BOOLEAN,
  first_purchase_made BOOLEAN,
  current_streak INTEGER,
  longest_streak INTEGER,
  today_bonus_claimed BOOLEAN,
  level_index INTEGER,
  level_name TEXT,
  next_threshold INTEGER,
  progress INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_wallet RECORD;
  v_streak RECORD;
  v_total_spent INTEGER;
  v_level_idx INTEGER;
  v_level_name TEXT;
  v_next_threshold INTEGER;
  v_progress INTEGER;
  v_daily_free_claimed BOOLEAN;
  v_thresholds INTEGER[] := ARRAY[0, 50, 200, 500, 1500];
  v_names TEXT[] := ARRAY['Bronze', 'Argent', 'Or', 'Platine', 'Diamant'];
  v_next_thresholds INTEGER[] := ARRAY[50, 200, 500, 1500, NULL::INTEGER];
BEGIN
  -- S'assurer que le wallet existe
  PERFORM ensure_wallet(p_user_id);

  -- Récupérer le wallet
  SELECT * INTO v_wallet FROM public.wallets WHERE user_id = p_user_id;

  -- Calculer dailyFreeClaimed correctement (basé sur la date)
  IF v_wallet.last_free_claim_at IS NOT NULL AND v_wallet.last_free_claim_at::DATE = CURRENT_DATE THEN
    v_daily_free_claimed := TRUE;
  ELSE
    v_daily_free_claimed := FALSE;
    -- Réinitialiser le flag si périmé
    IF v_wallet.daily_free_claimed AND NOT v_daily_free_claimed THEN
      UPDATE public.wallets SET daily_free_claimed = FALSE WHERE id = v_wallet.id;
    END IF;
  END IF;

  -- Récupérer le streak
  SELECT * INTO v_streak FROM public.daily_streaks WHERE user_id = p_user_id;

  -- Calculer le niveau
  v_total_spent := v_wallet.total_spent;
  v_level_idx := 0;
  FOR i IN REVERSE 4..0 LOOP
    IF v_total_spent >= v_thresholds[i+1] THEN
      v_level_idx := i;
      EXIT;
    END IF;
  END LOOP;

  v_level_name := v_names[v_level_idx + 1];
  v_next_threshold := v_next_thresholds[v_level_idx + 1];

  IF v_next_threshold IS NOT NULL THEN
    v_progress := LEAST(100, ROUND(((v_total_spent - v_thresholds[v_level_idx + 1])::NUMERIC /
                   (v_next_threshold - v_thresholds[v_level_idx + 1])::NUMERIC) * 100));
  ELSE
    v_progress := 100;
  END IF;

  RETURN QUERY SELECT
    v_wallet.balance,
    v_wallet.total_earned,
    v_wallet.total_spent,
    v_daily_free_claimed,
    v_wallet.daily_free_streak,
    v_wallet.free_boost_claimed,
    v_wallet.first_purchase_made,
    COALESCE(v_streak.current_streak, 0),
    COALESCE(v_streak.longest_streak, 0),
    COALESCE(v_streak.today_bonus_claimed, FALSE),
    v_level_idx,
    v_level_name,
    v_next_threshold,
    v_progress;
END;
$$;

COMMENT ON FUNCTION public.get_user_balance IS 'Récupère le solde complet avec infos de niveau et streak';

-- ===================================================================
-- 8. ENSURE_WEEKLY_CHALLENGES — Crée les défis hebdomadaires si inexistants
-- Remplace: ensureWeeklyChallenges() dans challenges/route.ts
-- ===================================================================
CREATE OR REPLACE FUNCTION public.ensure_weekly_challenges()
RETURNS SETOF public.challenges
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_week_start TIMESTAMPTZ;
  v_week_end TIMESTAMPTZ;
  v_existing_count INTEGER;
  v_template RECORD;
  v_challenge public.challenges%ROWTYPE;
BEGIN
  -- Calculer le début et fin de semaine (lundi → dimanche)
  v_week_start := date_trunc('week', CURRENT_DATE)::TIMESTAMPTZ;
  v_week_end := v_week_start + INTERVAL '7 days';

  -- Compter les défis existants pour cette semaine
  SELECT COUNT(*) INTO v_existing_count
  FROM public.challenges
  WHERE resets_at >= v_week_start;

  -- Si tous les défis existent, les retourner
  IF v_existing_count >= 5 THEN
    RETURN QUERY SELECT * FROM public.challenges WHERE resets_at >= v_week_start;
    RETURN;
  END IF;

  -- Templates de défis
  FOR v_template IN
    SELECT * FROM (VALUES
      ('sociable',  'Sociable',   'Envoie 5 likes cette semaine',       5,  5),
      ('audacieux', 'Audacieux',  'Envoie 2 demandes de numéro',        2,  8),
      ('complet',   'Complet',    'Ajoute 3 photos + 1 prompt',         4,  6),
      ('actif',     'Actif',      'Connecte-toi 5 jours sur 7',         5,  4),
      ('curieux',   'Curieux',    'Visite 20 profils cette semaine',    20,  3)
    ) AS t(type, title, description, target_count, reward)
  LOOP
    -- Vérifier si ce type existe déjà
    SELECT * INTO v_challenge
    FROM public.challenges
    WHERE type = v_template.type AND resets_at >= v_week_start;

    IF NOT FOUND THEN
      INSERT INTO public.challenges (type, title, description, target_count, reward, resets_at)
      VALUES (v_template.type, v_template.title, v_template.description, v_template.target_count, v_template.reward, v_week_end)
      RETURNING * INTO v_challenge;
    END IF;

    v_challenge := v_challenge;
  END LOOP;

  -- Retourner tous les défis de la semaine
  RETURN QUERY SELECT * FROM public.challenges WHERE resets_at >= v_week_start;
END;
$$;

COMMENT ON FUNCTION public.ensure_weekly_challenges IS 'Crée les 5 défis hebdomadaires s''ils n''existent pas encore';

-- ===================================================================
-- 9. INCREMENT_CHALLENGE_PROGRESS — Met à jour la progression d'un défi
-- Appelé quand l'utilisateur effectue une action qui contribue à un défi
-- ===================================================================
CREATE OR REPLACE FUNCTION public.increment_challenge_progress(
  p_user_id UUID,
  p_challenge_type TEXT,
  p_increment INTEGER DEFAULT 1
)
RETURNS TABLE(
  success BOOLEAN,
  challenge_id UUID,
  progress INTEGER,
  target_count INTEGER,
  completed BOOLEAN,
  message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_challenge RECORD;
  v_progress RECORD;
  v_new_progress INTEGER;
BEGIN
  -- Trouver le défi actif de ce type
  SELECT * INTO v_challenge
  FROM public.challenges
  WHERE type = p_challenge_type
    AND resets_at >= date_trunc('week', CURRENT_DATE)::TIMESTAMPTZ
  ORDER BY created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::UUID, 0, 0, false, 'Aucun défi actif de type ' || p_challenge_type::TEXT;
    RETURN;
  END IF;

  -- Récupérer ou créer la progression
  SELECT * INTO v_progress
  FROM public.challenge_progress
  WHERE user_id = p_user_id AND challenge_id = v_challenge.id;

  IF NOT FOUND THEN
    INSERT INTO public.challenge_progress (user_id, challenge_id, progress, completed, claimed)
    VALUES (p_user_id, v_challenge.id, 0, FALSE, FALSE)
    RETURNING * INTO v_progress;
  END IF;

  -- Ne pas dépasser la cible
  IF v_progress.completed THEN
    RETURN QUERY SELECT
      true, v_challenge.id, v_progress.progress, v_challenge.target_count, true,
      'Défi déjà complété'::TEXT;
    RETURN;
  END IF;

  -- Incrémenter
  v_new_progress := LEAST(v_progress.progress + p_increment, v_challenge.target_count);

  UPDATE public.challenge_progress
  SET
    progress = v_new_progress,
    completed = (v_new_progress >= v_challenge.target_count),
    updated_at = now()
  WHERE user_id = p_user_id AND challenge_id = v_challenge.id;

  RETURN QUERY SELECT
    true,
    v_challenge.id,
    v_new_progress,
    v_challenge.target_count,
    (v_new_progress >= v_challenge.target_count),
    CASE WHEN v_new_progress >= v_challenge.target_count
         THEN 'Défi complété ! Réclamez votre récompense.'::TEXT
         ELSE 'Progression mise à jour: ' || v_new_progress || '/' || v_challenge.target_count::TEXT
    END;
END;
$$;

COMMENT ON FUNCTION public.increment_challenge_progress IS 'Incrémente la progression d''un défi pour un utilisateur';

-- ===================================================================
-- 10. GET_COMPUTED_PROMOS — Calcule les promos dynamiques
-- Remplace la logique complexe de GET /api/credits/promos
-- ===================================================================
CREATE OR REPLACE FUNCTION public.get_computed_promos(p_user_id UUID)
RETURNS TABLE(
  type TEXT,
  title TEXT,
  description TEXT,
  discount_percent INTEGER,
  bonus_cc INTEGER,
  bonus_action TEXT,
  pack_type TEXT,
  is_active BOOLEAN,
  expires_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_has_purchased BOOLEAN;
  v_wallet_exists BOOLEAN;
  v_day_of_week INTEGER;
  v_hour INTEGER;
  v_has_mutual_match BOOLEAN;
  v_user_birth_month INTEGER;
  v_current_streak INTEGER;
BEGIN
  v_day_of_week := EXTRACT(DOW FROM now())::INTEGER; -- 0=Dim, 5=Ven
  v_hour := EXTRACT(HOUR FROM now())::INTEGER;

  -- 1. Promo première commande
  SELECT EXISTS (
    SELECT 1 FROM public.wallets w
    JOIN public.transactions t ON t.wallet_id = w.id AND t.type = 'purchase'
    WHERE w.user_id = p_user_id
  ) INTO v_has_purchased;

  IF NOT v_has_purchased THEN
    -- Vérifier si le wallet existe mais sans achats
    SELECT EXISTS (SELECT 1 FROM public.wallets WHERE user_id = p_user_id) INTO v_wallet_exists;
    IF NOT v_wallet_exists OR NOT v_has_purchased THEN
      RETURN QUERY SELECT
        'first_purchase'::TEXT,
        'Première commande'::TEXT,
        'Reçois +20 CC bonus sur ta première commande !'::TEXT,
        NULL::INTEGER,
        20,
        NULL::TEXT,
        NULL::TEXT,
        true,
        NULL::TIMESTAMPTZ;
    END IF;
  END IF;

  -- 2. Happy Hour (Ven/Dim 20:00-23:00)
  IF (v_day_of_week = 5 OR v_day_of_week = 0) AND v_hour >= 20 AND v_hour < 23 THEN
    RETURN QUERY SELECT
      'happy_hour'::TEXT,
      'Happy Hour'::TEXT,
      'Profite de +30% CC sur tous les packs ! Valide vendredi et dimanche de 20h à 23h.'::TEXT,
      30,
      NULL::INTEGER,
      NULL::TEXT,
      NULL::TEXT,
      true,
      (CURRENT_DATE + TIME '23:00:00')::TIMESTAMPTZ;
  END IF;

  -- 3. Promo Match (si l'utilisateur a un match mutuel dans les likes)
  -- Note: Cette promo requiert la table likes qui est dans le schéma social existant
  -- On vérifie si la table public.likes existe
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'likes') THEN
    SELECT EXISTS (
      SELECT 1 FROM public.likes
      WHERE is_mutual = TRUE AND (sender_id = p_user_id OR receiver_id = p_user_id)
    ) INTO v_has_mutual_match;

    IF v_has_mutual_match THEN
      RETURN QUERY SELECT
        'match_pack'::TEXT,
        'Pack Match'::TEXT,
        'Tu as un match ! Pack Tendance à -30%.'::TEXT,
        30,
        NULL::INTEGER,
        NULL::TEXT,
        'tendance'::TEXT,
        true,
        NULL::TIMESTAMPTZ;
    END IF;
  END IF;

  -- 4. Promo Anniversaire (si le mois de naissance = mois actuel)
  -- Note: Requiert la table users du schéma social
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    SELECT EXTRACT(MONTH FROM birth_date)::INTEGER INTO v_user_birth_month
    FROM public.users WHERE id = p_user_id AND birth_date IS NOT NULL;

    IF v_user_birth_month = EXTRACT(MONTH FROM now())::INTEGER THEN
      RETURN QUERY SELECT
        'birthday'::TEXT,
        'Anniversaire'::TEXT,
        'C''est ton mois ! Pack Passion à -25% + Rose Connect gratuite.'::TEXT,
        25,
        NULL::INTEGER,
        'rose_connect'::TEXT,
        'passion'::TEXT,
        true,
        NULL::TIMESTAMPTZ;
    END IF;
  END IF;

  -- 5. Promo Streak Reward (7 jours de streak)
  SELECT current_streak INTO v_current_streak
  FROM public.daily_streaks WHERE user_id = p_user_id;

  IF v_current_streak >= 7 THEN
    -- Vérifier si déjà réclamé dans les 7 derniers jours
    IF NOT EXISTS (
      SELECT 1 FROM public.user_promos up
      JOIN public.promo_offers po ON po.id = up.promo_id
      WHERE up.user_id = p_user_id
        AND po.type = 'streak_reward'
        AND up.used = TRUE
        AND up.created_at >= now() - INTERVAL '7 days'
    ) THEN
      RETURN QUERY SELECT
        'streak_reward'::TEXT,
        'Récompense Streak'::TEXT,
        '7 jours de streak ! 5 CC + Boost gratuit.'::TEXT,
        NULL::INTEGER,
        5,
        'boost'::TEXT,
        NULL::TEXT,
        true,
        NULL::TIMESTAMPTZ;
    END IF;
  END IF;

  -- 6. Promos de la base de données
  RETURN QUERY
  SELECT
    po.type,
    po.title,
    po.description,
    po.discount_percent,
    po.bonus_cc,
    po.bonus_action,
    po.pack_type,
    po.is_active,
    po.expires_at
  FROM public.promo_offers po
  WHERE po.is_active = TRUE
    AND po.starts_at <= now()
    AND po.expires_at >= now()
    AND NOT EXISTS (
      SELECT 1 FROM public.user_promos up
      WHERE up.promo_id = po.id AND up.user_id = p_user_id AND up.used = TRUE
    )
    AND NOT EXISTS (
      SELECT 1 FROM (SELECT type FROM public.get_computed_promos(p_user_id)) AS computed
      WHERE computed.type = po.type
    );
END;
$$;

COMMENT ON FUNCTION public.get_computed_promos IS 'Calcule les promotions dynamiques (happy hour, anniversaire, première commande, match, streak)';

-- ===================================================================
-- 11. GIFT_CREDITS — Admin: Offrir des CC à un utilisateur
-- ===================================================================
CREATE OR REPLACE FUNCTION public.gift_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT DEFAULT 'Cadeau administrateur'
)
RETURNS TABLE(success BOOLEAN, new_balance INTEGER, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_wallet_id UUID;
  v_balance INTEGER;
BEGIN
  IF p_amount <= 0 THEN
    RETURN QUERY SELECT false, 0, 'Montant invalide'::TEXT;
    RETURN;
  END IF;

  v_wallet_id := ensure_wallet(p_user_id);

  UPDATE public.wallets SET
    balance = balance + p_amount,
    total_earned = total_earned + p_amount,
    updated_at = now()
  WHERE id = v_wallet_id
  RETURNING balance INTO v_balance;

  INSERT INTO public.transactions (wallet_id, user_id, type, amount, description, metadata)
  VALUES (
    v_wallet_id, p_user_id, 'earn_gift', p_amount, p_reason,
    jsonb_build_object('giftAmount', p_amount, 'reason', p_reason, 'giftedBy', 'admin')
  );

  RETURN QUERY SELECT true, v_balance, p_amount || ' CC offerts !'::TEXT;
END;
$$;

COMMENT ON FUNCTION public.gift_credits IS 'Fonction admin pour offrir des CC à un utilisateur';


-- >>> 008_triggers.sql <<<

-- ============================================================
-- ConnectPhone — Migration 008: PostgreSQL Triggers
-- Triggers automatiques pour la gestion du cycle de vie
-- ============================================================

-- ===================================================================
-- 1. AUTO_CREATE_WALLET — Crée automatiquement un wallet à l'inscription
-- Trigger AFTER INSERT sur auth.users
-- ===================================================================

-- Fonction du trigger
CREATE OR REPLACE FUNCTION public.auto_create_wallet()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Créer le wallet pour le nouvel utilisateur
  INSERT INTO public.wallets (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Créer aussi le daily_streak
  INSERT INTO public.daily_streaks (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.auto_create_wallet IS 'Trigger: crée automatiquement un wallet et un streak à l''inscription d''un utilisateur';

-- Attacher le trigger à auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_wallet();

-- ===================================================================
-- 2. AUTO_UPDATE_UPDATED_AT — Met à jour updated_at automatiquement
-- Trigger BEFORE UPDATE sur toutes les tables avec updated_at
-- ===================================================================

CREATE OR REPLACE FUNCTION public.auto_update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.auto_update_updated_at IS 'Trigger: met à jour le champ updated_at automatiquement';

-- Attacher aux tables concernées
DROP TRIGGER IF EXISTS set_updated_at ON public.wallets;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.wallets
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.daily_streaks;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.daily_streaks
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.challenge_progress;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.challenge_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_update_updated_at();

-- ===================================================================
-- 3. RESET_DAILY_FLAGS — Réinitialise les flags quotidiens à minuit
-- Note: En production, ceci devrait être appelé par un cron (pg_cron)
-- ou par une Edge Function Supabase scheduled.
-- Pour la migration initiale, on crée la fonction de nettoyage.
-- ===================================================================

CREATE OR REPLACE FUNCTION public.reset_daily_flags()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Réinitialiser dailyFreeClaimed pour les wallets qui n'ont pas réclamé aujourd'hui
  UPDATE public.wallets
  SET
    daily_free_claimed = FALSE,
    free_boost_claimed = FALSE,
    updated_at = now()
  WHERE (daily_free_claimed = TRUE OR free_boost_claimed = TRUE)
    AND (last_free_claim_at IS NULL OR last_free_claim_at::DATE < CURRENT_DATE);

  GET DIAGNOSTICS v_count = ROW_COUNT;

  -- Réinitialiser todayBonusClaimed pour les streaks
  UPDATE public.daily_streaks
  SET
    today_bonus_claimed = FALSE,
    updated_at = now()
  WHERE today_bonus_claimed = TRUE
    AND (last_check_in IS NULL OR last_check_in::DATE < CURRENT_DATE);

  RETURN v_count;
END;
$$;

COMMENT ON FUNCTION public.reset_daily_flags IS 'Réinitialise les flags quotidiens (à exécuter chaque jour à minuit via pg_cron)';

-- ===================================================================
-- 4. CLEANUP_EXPIRED_DATA — Nettoyage des données expirées
-- Supprime les défis de semaines précédentes, les promos expirées
-- ===================================================================

CREATE OR REPLACE FUNCTION public.cleanup_expired_data()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_deleted_challenges INTEGER;
  v_deactivated_promos INTEGER;
BEGIN
  -- Supprimer les progressions de défis expirés (plus de 2 semaines)
  DELETE FROM public.challenge_progress
  WHERE challenge_id IN (
    SELECT id FROM public.challenges
    WHERE resets_at < now() - INTERVAL '14 days'
  );

  -- Supprimer les défis expirés (plus de 2 semaines)
  DELETE FROM public.challenges
  WHERE resets_at < now() - INTERVAL '14 days';

  GET DIAGNOSTICS v_deleted_challenges = ROW_COUNT;

  -- Désactiver les promos expirées
  UPDATE public.promo_offers
  SET is_active = FALSE
  WHERE is_active = TRUE AND expires_at < now();

  GET DIAGNOSTICS v_deactivated_promos = ROW_COUNT;

  RETURN v_deleted_challenges + v_deactivated_promos;
END;
$$;

COMMENT ON FUNCTION public.cleanup_expired_data IS 'Nettoyage des données expirées (défis anciens, promos expirées). À exécuter quotidiennement via pg_cron';

-- ===================================================================
-- 5. ON_SPEND_INCREMENT_CHALLENGE — Met à jour la progression de défi
-- quand l'utilisateur effectue une action qui contribue à un défi
-- Trigger AFTER INSERT sur transactions
-- ===================================================================

CREATE OR REPLACE FUNCTION public.on_transaction_check_challenge()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Ne traiter que les dépenses et certaines actions
  IF NEW.type = 'spend' AND NEW.action IS NOT NULL THEN
    -- Mapper les actions aux types de défis
    CASE NEW.action
      WHEN 'super_request', 'rose_connect' THEN
        PERFORM public.increment_challenge_progress(NEW.user_id, 'audacieux', 1);
      ELSE
        NULL;
    END CASE;
  END IF;

  -- Vérifier les défis liés aux likes (si l'action est un like)
  -- Note: Les likes sont gérés dans le schéma social, pas ici
  -- On pourrait ajouter un trigger sur la table likes si nécessaire

  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.on_transaction_check_challenge IS 'Trigger: met à jour la progression des défis quand une transaction pertinente est créée';

-- Attacher le trigger
DROP TRIGGER IF EXISTS on_transaction_created ON public.transactions;
CREATE TRIGGER on_transaction_created
  AFTER INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.on_transaction_check_challenge();


-- >>> 009_seed_data.sql <<<

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


