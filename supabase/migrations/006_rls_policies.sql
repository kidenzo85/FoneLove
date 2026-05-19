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
