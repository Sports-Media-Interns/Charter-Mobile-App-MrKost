-- Migration 005: JSONB filtering views, notification queue

-- ============================================================
-- VIEWS hiding sensitive fields from non-admins
-- ============================================================

-- Safe user view: hides phone/push_token for non-admin viewers
CREATE OR REPLACE VIEW safe_users AS
SELECT
  u.id,
  u.email,
  u.full_name,
  u.role,
  u.organization_id,
  u.avatar_url,
  u.created_at,
  CASE
    WHEN u.id = auth.uid() OR EXISTS (
      SELECT 1 FROM users viewer WHERE viewer.id = auth.uid()
        AND viewer.role IN ('support', 'team_admin')
    )
    THEN u.phone
    ELSE NULL
  END AS phone
FROM users u;

-- Safe booking view: hides full billing details from non-admin roles
CREATE OR REPLACE VIEW safe_bookings AS
SELECT
  b.id,
  b.quote_id,
  b.request_id,
  b.organization_id,
  b.status,
  b.confirmation_number,
  b.payment_status,
  b.total_amount,
  b.amount_paid,
  b.manifest_submitted,
  b.created_at,
  b.updated_at
FROM bookings b;

-- ============================================================
-- NOTIFICATION QUEUE TABLE
-- ============================================================

CREATE TABLE notification_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  max_attempts INTEGER NOT NULL DEFAULT 3,
  last_error TEXT,
  scheduled_for TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notification_queue_status ON notification_queue(status, scheduled_for);
CREATE INDEX idx_notification_queue_event ON notification_queue(event);

ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;
-- Service role only — no user access
