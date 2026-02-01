-- Migration 003: Broker RLS, League Admin RLS, Composite Indexes, Webhook Events
-- Covers: Phase 2 security hardening

-- ============================================================
-- BROKER RLS: INSERT/UPDATE on quotes for broker role
-- ============================================================

CREATE POLICY "Brokers can insert quotes" ON quotes FOR INSERT WITH CHECK (
  broker_id = auth.uid()
  AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'broker')
);

CREATE POLICY "Brokers can update own quotes" ON quotes FOR UPDATE USING (
  broker_id = auth.uid()
  AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'broker')
);

-- Brokers can view requests assigned to them (via org or direct)
CREATE POLICY "Brokers can view assigned requests" ON charter_requests FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'broker'
    AND organization_id = charter_requests.organization_id
  )
);

-- ============================================================
-- LEAGUE ADMIN RLS: Cross-org SELECT scoped to league_id
-- ============================================================

-- League admins can see orgs in their league
CREATE POLICY "League admins can view league orgs" ON organizations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN organizations o ON u.organization_id = o.id
    WHERE u.id = auth.uid()
      AND u.role = 'league_admin'
      AND (organizations.league_id = o.id OR organizations.id = o.id)
  )
);

-- League admins can view requests from league orgs
CREATE POLICY "League admins can view league requests" ON charter_requests FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN organizations o ON u.organization_id = o.id
    WHERE u.id = auth.uid()
      AND u.role = 'league_admin'
      AND charter_requests.organization_id IN (
        SELECT id FROM organizations WHERE league_id = o.id
      )
  )
);

-- League admins can view bookings from league orgs
CREATE POLICY "League admins can view league bookings" ON bookings FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users u
    JOIN organizations o ON u.organization_id = o.id
    WHERE u.id = auth.uid()
      AND u.role = 'league_admin'
      AND bookings.organization_id IN (
        SELECT id FROM organizations WHERE league_id = o.id
      )
  )
);

-- ============================================================
-- SUPPORT ROLE: Full read access
-- ============================================================

CREATE POLICY "Support can view all requests" ON charter_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'support')
);

CREATE POLICY "Support can view all quotes" ON quotes FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'support')
);

CREATE POLICY "Support can view all bookings" ON bookings FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'support')
);

-- ============================================================
-- COMPOSITE INDEXES for common query patterns
-- ============================================================

CREATE INDEX idx_requests_org_status ON charter_requests(organization_id, status);
CREATE INDEX idx_quotes_request_status ON quotes(request_id, status);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id) WHERE read_at IS NULL;
CREATE INDEX idx_bookings_org_status ON bookings(organization_id, status);
CREATE INDEX idx_bookings_payment_status ON bookings(organization_id, payment_status);

-- ============================================================
-- WEBHOOK EVENTS TABLE (idempotency)
-- ============================================================

CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_webhook_events_event_id ON webhook_events(event_id);
CREATE INDEX idx_webhook_events_type ON webhook_events(event_type);

-- No RLS on webhook_events — only service_role writes
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
