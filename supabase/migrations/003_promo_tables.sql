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
