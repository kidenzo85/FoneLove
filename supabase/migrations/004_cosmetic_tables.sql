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
