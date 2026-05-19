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
