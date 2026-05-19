-- ============================================================
-- Migration 014: Push Notifications System
-- Tables: push_subscriptions, notification_campaigns, notification_logs
-- ============================================================

-- Push subscription storage (one per device/browser)
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  user_agent TEXT,
  device_type TEXT DEFAULT 'unknown', -- mobile, desktop, tablet, unknown
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  CONSTRAINT unique_endpoint UNIQUE (endpoint)
);

-- Index for fast lookup by user
CREATE INDEX IF NOT EXISTS idx_push_subs_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subs_active ON push_subscriptions(is_active) WHERE is_active = true;

-- Notification campaigns (admin-created, including marketing)
CREATE TABLE IF NOT EXISTS notification_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image_url TEXT, -- optional image attachment
  icon_url TEXT DEFAULT '/icons/icon-192x192.png',
  url TEXT DEFAULT '/', -- click-through URL
  tag TEXT, -- notification tag for grouping
  type TEXT NOT NULL DEFAULT 'info', -- info, marketing, alert, match, message, request
  actions JSONB, -- [{action: 'open', title: 'Ouvrir'}, ...]
  target_audience TEXT DEFAULT 'all', -- all, premium, free, new_users, inactive
  scheduled_at TIMESTAMPTZ, -- for scheduled sending
  sent_at TIMESTAMPTZ,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled')),
  total_sent INTEGER DEFAULT 0,
  total_delivered INTEGER DEFAULT 0,
  total_clicked INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notif_campaigns_status ON notification_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_notif_campaigns_scheduled ON notification_campaigns(scheduled_at) WHERE status = 'scheduled';

-- Notification delivery log (individual delivery tracking)
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES notification_campaigns(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES push_subscriptions(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image_url TEXT,
  type TEXT DEFAULT 'info',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'clicked')),
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notif_logs_user ON notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notif_logs_campaign ON notification_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_notif_logs_status ON notification_logs(status);

-- User notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  match_notifs BOOLEAN DEFAULT true,
  message_notifs BOOLEAN DEFAULT true,
  request_notifs BOOLEAN DEFAULT true,
  marketing_notifs BOOLEAN DEFAULT false,
  sound_enabled BOOLEAN DEFAULT true,
  quiet_hours_start TIME, -- e.g., '22:00'
  quiet_hours_end TIME,   -- e.g., '08:00'
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- RLS Policies
-- ============================================================

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Push subscriptions: users can only manage their own
CREATE POLICY "Users can view own subscriptions" ON push_subscriptions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscriptions" ON push_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscriptions" ON push_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own subscriptions" ON push_subscriptions
  FOR DELETE USING (auth.uid() = user_id);

-- Campaigns: only admins (service role) can manage
CREATE POLICY "Anyone can view published campaigns" ON notification_campaigns
  FOR SELECT USING (status IN ('sent', 'scheduled'));
CREATE POLICY "Service role manages campaigns" ON notification_campaigns
  FOR ALL USING (auth.role() = 'service_role');

-- Logs: users can see their own
CREATE POLICY "Users can view own logs" ON notification_logs
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role manages logs" ON notification_logs
  FOR ALL USING (auth.role() = 'service_role');

-- Preferences: users manage their own
CREATE POLICY "Users can view own preferences" ON notification_preferences
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upsert own preferences" ON notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own preferences" ON notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- RPC Functions
-- ============================================================

-- Subscribe a user to push notifications
CREATE OR REPLACE FUNCTION subscribe_push(
  p_user_id UUID,
  p_endpoint TEXT,
  p_p256dh TEXT,
  p_auth_key TEXT,
  p_user_agent TEXT DEFAULT NULL,
  p_device_type TEXT DEFAULT 'unknown'
)
RETURNS UUID AS $$
DECLARE
  v_sub_id UUID;
BEGIN
  INSERT INTO push_subscriptions (user_id, endpoint, p256dh_key, auth_key, user_agent, device_type)
  VALUES (p_user_id, p_endpoint, p_p256dh, p_auth_key, p_user_agent, p_device_type)
  ON CONFLICT (endpoint) 
  DO UPDATE SET 
    p256dh_key = EXCLUDED.p256dh_key,
    auth_key = EXCLUDED.auth_key,
    user_agent = EXCLUDED.user_agent,
    device_type = EXCLUDED.device_type,
    is_active = true,
    updated_at = now()
  RETURNING id INTO v_sub_id;
  
  RETURN v_sub_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Unsubscribe a user from push notifications
CREATE OR REPLACE FUNCTION unsubscribe_push(
  p_user_id UUID,
  p_endpoint TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE push_subscriptions 
  SET is_active = false, updated_at = now()
  WHERE user_id = p_user_id AND endpoint = p_endpoint;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get active subscriptions for a user (or all users)
CREATE OR REPLACE FUNCTION get_push_subscriptions(
  p_user_id UUID DEFAULT NULL,
  p_target_audience TEXT DEFAULT 'all'
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  endpoint TEXT,
  p256dh_key TEXT,
  auth_key TEXT,
  device_type TEXT
) AS $$
BEGIN
  IF p_user_id IS NOT NULL THEN
    RETURN QUERY
    SELECT ps.id, ps.user_id, ps.endpoint, ps.p256dh_key, ps.auth_key, ps.device_type
    FROM push_subscriptions ps
    WHERE ps.user_id = p_user_id AND ps.is_active = true;
  ELSE
    -- Target audience filtering
    IF p_target_audience = 'premium' THEN
      RETURN QUERY
      SELECT ps.id, ps.user_id, ps.endpoint, ps.p256dh_key, ps.auth_key, ps.device_type
      FROM push_subscriptions ps
      JOIN auth.users u ON u.id = ps.user_id
      WHERE ps.is_active = true AND u.raw_user_meta_data->>'is_premium' = 'true';
    ELSIF p_target_audience = 'free' THEN
      RETURN QUERY
      SELECT ps.id, ps.user_id, ps.endpoint, ps.p256dh_key, ps.auth_key, ps.device_type
      FROM push_subscriptions ps
      JOIN auth.users u ON u.id = ps.user_id
      WHERE ps.is_active = true AND COALESCE(u.raw_user_meta_data->>'is_premium', 'false') = 'false';
    ELSIF p_target_audience = 'new_users' THEN
      RETURN QUERY
      SELECT ps.id, ps.user_id, ps.endpoint, ps.p256dh_key, ps.auth_key, ps.device_type
      FROM push_subscriptions ps
      JOIN auth.users u ON u.id = ps.user_id
      WHERE ps.is_active = true AND u.created_at > now() - interval '7 days';
    ELSIF p_target_audience = 'inactive' THEN
      RETURN QUERY
      SELECT ps.id, ps.user_id, ps.endpoint, ps.p256dh_key, ps.auth_key, ps.device_type
      FROM push_subscriptions ps
      JOIN auth.users u ON u.id = ps.user_id
      WHERE ps.is_active = true AND u.last_sign_in_at < now() - interval '14 days';
    ELSE
      -- 'all'
      RETURN QUERY
      SELECT ps.id, ps.user_id, ps.endpoint, ps.p256dh_key, ps.auth_key, ps.device_type
      FROM push_subscriptions ps
      WHERE ps.is_active = true;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Log a notification delivery
CREATE OR REPLACE FUNCTION log_notification(
  p_user_id UUID,
  p_title TEXT,
  p_body TEXT,
  p_campaign_id UUID DEFAULT NULL,
  p_subscription_id UUID DEFAULT NULL,
  p_image_url TEXT DEFAULT NULL,
  p_type TEXT DEFAULT 'info',
  p_status TEXT DEFAULT 'pending'
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO notification_logs (campaign_id, user_id, subscription_id, title, body, image_url, type, status)
  VALUES (p_campaign_id, p_user_id, p_subscription_id, p_title, p_body, p_image_url, p_type, p_status)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update notification log status
CREATE OR REPLACE FUNCTION update_notification_status(
  p_log_id UUID,
  p_status TEXT,
  p_error_message TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notification_logs
  SET 
    status = p_status,
    error_message = p_error_message,
    sent_at = CASE WHEN p_status = 'sent' THEN now() ELSE sent_at END,
    delivered_at = CASE WHEN p_status = 'delivered' THEN now() ELSE delivered_at END,
    clicked_at = CASE WHEN p_status = 'clicked' THEN now() ELSE clicked_at END
  WHERE id = p_log_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create notification campaign
CREATE OR REPLACE FUNCTION create_campaign(
  p_title TEXT,
  p_body TEXT,
  p_image_url TEXT DEFAULT NULL,
  p_icon_url TEXT DEFAULT '/icons/icon-192x192.png',
  p_url TEXT DEFAULT '/',
  p_tag TEXT DEFAULT NULL,
  p_type TEXT DEFAULT 'info',
  p_actions JSONB DEFAULT NULL,
  p_target_audience TEXT DEFAULT 'all',
  p_scheduled_at TIMESTAMPTZ DEFAULT NULL,
  p_created_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_campaign_id UUID;
BEGIN
  INSERT INTO notification_campaigns (title, body, image_url, icon_url, url, tag, type, actions, target_audience, scheduled_at, created_by)
  VALUES (p_title, p_body, p_image_url, p_icon_url, p_url, p_tag, p_type, p_actions, p_target_audience, p_scheduled_at, p_created_by)
  RETURNING id INTO v_campaign_id;
  
  RETURN v_campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get campaign stats
CREATE OR REPLACE FUNCTION get_campaign_stats(p_campaign_id UUID)
RETURNS TABLE (
  campaign_id UUID,
  title TEXT,
  status TEXT,
  total_sent BIGINT,
  total_delivered BIGINT,
  total_clicked BIGINT,
  total_failed BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    nc.id AS campaign_id,
    nc.title,
    nc.status,
    COALESCE(SUM(CASE WHEN nl.status = 'sent' THEN 1 ELSE 0 END), 0) AS total_sent,
    COALESCE(SUM(CASE WHEN nl.status = 'delivered' THEN 1 ELSE 0 END), 0) AS total_delivered,
    COALESCE(SUM(CASE WHEN nl.status = 'clicked' THEN 1 ELSE 0 END), 0) AS total_clicked,
    COALESCE(SUM(CASE WHEN nl.status = 'failed' THEN 1 ELSE 0 END), 0) AS total_failed
  FROM notification_campaigns nc
  LEFT JOIN notification_logs nl ON nl.campaign_id = nc.id
  WHERE nc.id = p_campaign_id
  GROUP BY nc.id, nc.title, nc.status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get or create notification preferences for a user
CREATE OR REPLACE FUNCTION get_notification_prefs(p_user_id UUID)
RETURNS TABLE (
  user_id UUID,
  match_notifs BOOLEAN,
  message_notifs BOOLEAN,
  request_notifs BOOLEAN,
  marketing_notifs BOOLEAN,
  sound_enabled BOOLEAN,
  quiet_hours_start TIME,
  quiet_hours_end TIME
) AS $$
BEGIN
  -- Auto-create if not exists
  INSERT INTO notification_preferences (user_id)
  VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN QUERY
  SELECT np.user_id, np.match_notifs, np.message_notifs, np.request_notifs, 
         np.marketing_notifs, np.sound_enabled, np.quiet_hours_start, np.quiet_hours_end
  FROM notification_preferences np
  WHERE np.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update notification preferences
CREATE OR REPLACE FUNCTION update_notification_prefs(
  p_user_id UUID,
  p_match_notifs BOOLEAN DEFAULT NULL,
  p_message_notifs BOOLEAN DEFAULT NULL,
  p_request_notifs BOOLEAN DEFAULT NULL,
  p_marketing_notifs BOOLEAN DEFAULT NULL,
  p_sound_enabled BOOLEAN DEFAULT NULL,
  p_quiet_hours_start TIME DEFAULT NULL,
  p_quiet_hours_end TIME DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO notification_preferences (user_id, match_notifs, message_notifs, request_notifs, marketing_notifs, sound_enabled, quiet_hours_start, quiet_hours_end)
  VALUES (p_user_id, 
    COALESCE(p_match_notifs, true),
    COALESCE(p_message_notifs, true),
    COALESCE(p_request_notifs, true),
    COALESCE(p_marketing_notifs, false),
    COALESCE(p_sound_enabled, true),
    p_quiet_hours_start,
    p_quiet_hours_end)
  ON CONFLICT (user_id) DO UPDATE SET
    match_notifs = COALESCE(p_match_notifs, notification_preferences.match_notifs),
    message_notifs = COALESCE(p_message_notifs, notification_preferences.message_notifs),
    request_notifs = COALESCE(p_request_notifs, notification_preferences.request_notifs),
    marketing_notifs = COALESCE(p_marketing_notifs, notification_preferences.marketing_notifs),
    sound_enabled = COALESCE(p_sound_enabled, notification_preferences.sound_enabled),
    quiet_hours_start = COALESCE(p_quiet_hours_start, notification_preferences.quiet_hours_start),
    quiet_hours_end = COALESCE(p_quiet_hours_end, notification_preferences.quiet_hours_end),
    updated_at = now();
    
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Mark campaign as sent
CREATE OR REPLACE FUNCTION mark_campaign_sent(p_campaign_id UUID, p_total_sent INTEGER DEFAULT 0)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notification_campaigns
  SET status = 'sent', sent_at = now(), total_sent = p_total_sent
  WHERE id = p_campaign_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
