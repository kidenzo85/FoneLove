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
