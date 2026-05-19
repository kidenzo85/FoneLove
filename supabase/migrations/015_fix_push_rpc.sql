-- ============================================================
-- Migration 015: Fix Push Notification RPC functions
-- Align RPC functions with actual table schemas
-- ============================================================

-- Drop old functions that have wrong column references
DROP FUNCTION IF EXISTS get_notification_prefs(UUID);
DROP FUNCTION IF EXISTS update_notification_prefs(UUID, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, TIME, TIME);
DROP FUNCTION IF EXISTS create_campaign(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, TEXT, TIMESTAMPTZ, UUID);

-- Recreate get_notification_prefs to match actual table schema
CREATE OR REPLACE FUNCTION get_notification_prefs(p_user_id UUID)
RETURNS TABLE (
  user_id UUID,
  push_enabled BOOLEAN,
  request_received BOOLEAN,
  request_accepted BOOLEAN,
  request_declined BOOLEAN,
  message_received BOOLEAN,
  match_notif BOOLEAN,
  connection_established BOOLEAN,
  boost_expired BOOLEAN,
  credit_updates BOOLEAN,
  streak_milestones BOOLEAN,
  challenge_completed BOOLEAN,
  promo_available BOOLEAN,
  profile_liked BOOLEAN,
  profile_visited BOOLEAN,
  new_moment BOOLEAN,
  marketing BOOLEAN,
  system_notif BOOLEAN,
  quiet_hours_enabled BOOLEAN,
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  quiet_hours_timezone TEXT,
  digest_enabled BOOLEAN,
  digest_frequency TEXT
) AS $$
BEGIN
  -- Auto-create if not exists
  INSERT INTO notification_preferences (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN QUERY
  SELECT 
    np.user_id,
    np.push_enabled,
    np.request_received,
    np.request_accepted,
    np.request_declined,
    np.message_received,
    np.match,
    np.connection_established,
    np.boost_expired,
    np.credit_updates,
    np.streak_milestones,
    np.challenge_completed,
    np.promo_available,
    np.profile_liked,
    np.profile_visited,
    np.new_moment,
    np.marketing,
    np.system,
    np.quiet_hours_enabled,
    np.quiet_hours_start,
    np.quiet_hours_end,
    np.quiet_hours_timezone,
    np.digest_enabled,
    np.digest_frequency
  FROM notification_preferences np
  WHERE np.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate update_notification_prefs to match actual table schema
CREATE OR REPLACE FUNCTION update_notification_prefs(
  p_user_id UUID,
  p_push_enabled BOOLEAN DEFAULT NULL,
  p_request_received BOOLEAN DEFAULT NULL,
  p_request_accepted BOOLEAN DEFAULT NULL,
  p_request_declined BOOLEAN DEFAULT NULL,
  p_message_received BOOLEAN DEFAULT NULL,
  p_match BOOLEAN DEFAULT NULL,
  p_connection_established BOOLEAN DEFAULT NULL,
  p_boost_expired BOOLEAN DEFAULT NULL,
  p_credit_updates BOOLEAN DEFAULT NULL,
  p_streak_milestones BOOLEAN DEFAULT NULL,
  p_challenge_completed BOOLEAN DEFAULT NULL,
  p_promo_available BOOLEAN DEFAULT NULL,
  p_profile_liked BOOLEAN DEFAULT NULL,
  p_profile_visited BOOLEAN DEFAULT NULL,
  p_new_moment BOOLEAN DEFAULT NULL,
  p_marketing BOOLEAN DEFAULT NULL,
  p_system BOOLEAN DEFAULT NULL,
  p_quiet_hours_enabled BOOLEAN DEFAULT NULL,
  p_quiet_hours_start TIME DEFAULT NULL,
  p_quiet_hours_end TIME DEFAULT NULL,
  p_quiet_hours_timezone TEXT DEFAULT NULL,
  p_digest_enabled BOOLEAN DEFAULT NULL,
  p_digest_frequency TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO notification_preferences (
    user_id, push_enabled, request_received, request_accepted, request_declined,
    message_received, match, connection_established, boost_expired, credit_updates,
    streak_milestones, challenge_completed, promo_available, profile_liked,
    profile_visited, new_moment, marketing, system, quiet_hours_enabled,
    quiet_hours_start, quiet_hours_end, quiet_hours_timezone, digest_enabled, digest_frequency
  )
  VALUES (
    p_user_id,
    COALESCE(p_push_enabled, true),
    COALESCE(p_request_received, true),
    COALESCE(p_request_accepted, true),
    COALESCE(p_request_declined, true),
    COALESCE(p_message_received, true),
    COALESCE(p_match, true),
    COALESCE(p_connection_established, true),
    COALESCE(p_boost_expired, true),
    COALESCE(p_credit_updates, true),
    COALESCE(p_streak_milestones, true),
    COALESCE(p_challenge_completed, true),
    COALESCE(p_promo_available, true),
    COALESCE(p_profile_liked, true),
    COALESCE(p_profile_visited, true),
    COALESCE(p_new_moment, true),
    COALESCE(p_marketing, false),
    COALESCE(p_system, true),
    COALESCE(p_quiet_hours_enabled, false),
    p_quiet_hours_start,
    p_quiet_hours_end,
    p_quiet_hours_timezone,
    COALESCE(p_digest_enabled, false),
    COALESCE(p_digest_frequency, 'daily')
  )
  ON CONFLICT (user_id) DO UPDATE SET
    push_enabled = COALESCE(p_push_enabled, notification_preferences.push_enabled),
    request_received = COALESCE(p_request_received, notification_preferences.request_received),
    request_accepted = COALESCE(p_request_accepted, notification_preferences.request_accepted),
    request_declined = COALESCE(p_request_declined, notification_preferences.request_declined),
    message_received = COALESCE(p_message_received, notification_preferences.message_received),
    match = COALESCE(p_match, notification_preferences.match),
    connection_established = COALESCE(p_connection_established, notification_preferences.connection_established),
    boost_expired = COALESCE(p_boost_expired, notification_preferences.boost_expired),
    credit_updates = COALESCE(p_credit_updates, notification_preferences.credit_updates),
    streak_milestones = COALESCE(p_streak_milestones, notification_preferences.streak_milestones),
    challenge_completed = COALESCE(p_challenge_completed, notification_preferences.challenge_completed),
    promo_available = COALESCE(p_promo_available, notification_preferences.promo_available),
    profile_liked = COALESCE(p_profile_liked, notification_preferences.profile_liked),
    profile_visited = COALESCE(p_profile_visited, notification_preferences.profile_visited),
    new_moment = COALESCE(p_new_moment, notification_preferences.new_moment),
    marketing = COALESCE(p_marketing, notification_preferences.marketing),
    system = COALESCE(p_system, notification_preferences.system),
    quiet_hours_enabled = COALESCE(p_quiet_hours_enabled, notification_preferences.quiet_hours_enabled),
    quiet_hours_start = COALESCE(p_quiet_hours_start, notification_preferences.quiet_hours_start),
    quiet_hours_end = COALESCE(p_quiet_hours_end, notification_preferences.quiet_hours_end),
    quiet_hours_timezone = COALESCE(p_quiet_hours_timezone, notification_preferences.quiet_hours_timezone),
    digest_enabled = COALESCE(p_digest_enabled, notification_preferences.digest_enabled),
    digest_frequency = COALESCE(p_digest_frequency, notification_preferences.digest_frequency),
    updated_at = now();
    
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate create_campaign to match actual table schema
CREATE OR REPLACE FUNCTION create_campaign(
  p_name TEXT,
  p_title_fr TEXT,
  p_body_fr TEXT,
  p_title_en TEXT DEFAULT NULL,
  p_body_en TEXT DEFAULT NULL,
  p_image_url TEXT DEFAULT NULL,
  p_action_url TEXT DEFAULT '/',
  p_action_text_fr TEXT DEFAULT 'Ouvrir',
  p_action_text_en TEXT DEFAULT 'Open',
  p_category TEXT DEFAULT 'info',
  p_target_audience JSONB DEFAULT '"all"'::jsonb,
  p_scheduled_at TIMESTAMPTZ DEFAULT NULL,
  p_created_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_campaign_id UUID;
BEGIN
  INSERT INTO notification_campaigns (
    name, title_fr, body_fr, title_en, body_en,
    image_url, action_url, action_text_fr, action_text_en,
    category, target_audience, scheduled_at, created_by, status
  )
  VALUES (
    p_name, p_title_fr, p_body_fr, p_title_en, p_body_en,
    p_image_url, p_action_url, p_action_text_fr, p_action_text_en,
    p_category, p_target_audience, p_scheduled_at, p_created_by,
    CASE WHEN p_scheduled_at IS NOT NULL THEN 'scheduled' ELSE 'draft' END
  )
  RETURNING id INTO v_campaign_id;
  
  RETURN v_campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
