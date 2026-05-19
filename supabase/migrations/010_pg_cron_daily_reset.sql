-- ============================================================
-- ConnectPhone — Migration 010: pg_cron Daily Reset
--
-- À exécuter dans le Supabase SQL Editor:
-- https://supabase.com/dashboard/project/ldjfngzeikjmromaoqkl/sql
--
-- Tâches planifiées (tous les jours, minuit UTC):
--   00:05  reset_daily_flags()        — Réinitialise dailyFreeClaimed, freeBoostClaimed, todayBonusClaimed
--   00:10  cleanup_expired_data()     — Supprime défis expirés, promos expirées, taux périmés
--   00:15  ensure_weekly_challenges() — Crée les défis de la semaine si inexistants
--   00:30  daily-reset Edge Function  — Rafraîchit les taux de change via Frankfurter
-- ============================================================

-- ===== Étape 0: Fonction utilitaire pour planifier via RPC =====
-- Permet à l'Edge Function daily-reset de planifier les jobs via REST API

CREATE OR REPLACE FUNCTION cron_schedule_if_available(
  p_job_name text,
  p_schedule text,
  p_command text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  existing_jobid bigint;
  new_jobid bigint;
BEGIN
  -- Vérifier si pg_cron est disponible
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'pg_cron extension not enabled. Enable it in Dashboard > Database > Extensions'
    );
  END IF;

  -- Vérifier si le job existe déjà
  SELECT jobid INTO existing_jobid FROM cron.job WHERE jobname = p_job_name;

  IF existing_jobid IS NOT NULL THEN
    -- Mettre à jour le job existant
    PERFORM cron.unschedule(p_job_name);
  END IF;

  -- Créer le nouveau job
  SELECT schedule INTO new_jobid FROM cron.schedule(p_job_name, p_schedule, p_command);

  RETURN jsonb_build_object(
    'success', true,
    'job_name', p_job_name,
    'schedule', p_schedule,
    'job_id', new_jobid,
    'action', CASE WHEN existing_jobid IS NOT NULL THEN 'updated' ELSE 'created' END
  );
END;
$$;

-- ===== Étape 1: Activer les extensions =====

-- pg_cron: Planificateur de tâches PostgreSQL (indispensable)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- pg_net: Client HTTP asynchrone pour appeler les Edge Functions depuis SQL
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- ===== Étape 2: Planifier les 3 tâches SQL quotidiennes =====

-- Tâche 1: Réinitialiser les flags quotidiens (00:05 UTC)
SELECT cron.schedule(
  'connectphone-reset-daily-flags',
  '5 0 * * *',
  $$
  SELECT reset_daily_flags();
  $$
);

-- Tâche 2: Nettoyer les données expirées (00:10 UTC)
SELECT cron.schedule(
  'connectphone-cleanup-expired',
  '10 0 * * *',
  $$
  SELECT cleanup_expired_data();
  $$
);

-- Tâche 3: S'assurer que les défis hebdomadaires existent (00:15 UTC)
SELECT cron.schedule(
  'connectphone-ensure-weekly-challenges',
  '15 0 * * *',
  $$
  SELECT ensure_weekly_challenges();
  $$
);

-- ===== Étape 3: Créer la fonction wrapper pour invoquer l'Edge Function =====

CREATE OR REPLACE FUNCTION invoke_daily_reset_edge_function()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  project_url text := 'https://ldjfngzeikjmromaoqkl.supabase.co';
  cron_secret text := 'connectphone-daily-reset-2026';
  response_id bigint;
BEGIN
  SELECT INTO response_id net.http_post(
    url := project_url || '/functions/v1/daily-reset?secret=' || cron_secret,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || cron_secret
    ),
    body := '{}'::jsonb
  );
END;
$$;

-- Tâche 4: Appeler l'Edge Function daily-reset (00:30 UTC)
SELECT cron.schedule(
  'connectphone-daily-reset-edge-function',
  '30 0 * * *',
  $$
  SELECT invoke_daily_reset_edge_function();
  $$
);

-- ===== Vérification =====
-- Lister les tâches planifiées:
-- SELECT jobid, jobname, schedule, command FROM cron.job WHERE jobname LIKE 'connectphone-%' ORDER BY jobid;

-- Voir les résultats des dernières exécutions:
-- SELECT jobid, runid, jobname, status, return_result, start_time, end_time
-- FROM cron.job_run_details
-- WHERE jobid IN (SELECT jobid FROM cron.job WHERE jobname LIKE 'connectphone-%')
-- ORDER BY start_time DESC LIMIT 20;
