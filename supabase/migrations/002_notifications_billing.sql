-- Notifications & Billing Migration
-- Adds notification preferences, payment transactions, invoices, email log
-- Plus triggers for three-party notification routing via pg_net

-- Enable pg_net for HTTP calls from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- ============================================================
-- NEW TABLES
-- ============================================================

-- Notification preferences per user per category
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN (
    'request_updates', 'quotes', 'bookings', 'payments', 'messages', 'system', 'marketing'
  )),
  push_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  email_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  sms_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category)
);

-- Payment transactions
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'succeeded', 'failed', 'refunded'
  )),
  payment_method_type TEXT,
  receipt_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  invoice_number TEXT UNIQUE NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  tax DECIMAL(12,2) NOT NULL DEFAULT 0,
  total DECIMAL(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'sent', 'paid', 'overdue', 'cancelled'
  )),
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  pdf_url TEXT,
  line_items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email log
CREATE TABLE email_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  to_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  template TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN (
    'queued', 'sent', 'delivered', 'failed', 'bounced'
  )),
  provider_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_notification_preferences_user ON notification_preferences(user_id);
CREATE INDEX idx_payment_transactions_booking ON payment_transactions(booking_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX idx_payment_transactions_stripe ON payment_transactions(stripe_payment_intent_id);
CREATE INDEX idx_invoices_booking ON invoices(booking_id);
CREATE INDEX idx_invoices_org ON invoices(organization_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_email_log_status ON email_log(status);
CREATE INDEX idx_notifications_read ON notifications(user_id, read_at);

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;

-- Notification preferences: users manage their own
CREATE POLICY "Users can view own notification preferences"
  ON notification_preferences FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notification preferences"
  ON notification_preferences FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can insert own notification preferences"
  ON notification_preferences FOR INSERT WITH CHECK (user_id = auth.uid());

-- Payment transactions: visible to org members
CREATE POLICY "Users can view org payment transactions"
  ON payment_transactions FOR SELECT USING (
    booking_id IN (
      SELECT id FROM bookings
      WHERE organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
    )
  );

-- Invoices: visible to org members
CREATE POLICY "Users can view org invoices"
  ON invoices FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
  );

-- Email log: only service role (no user access)
-- No policies = no user access, only service_role can read/write

-- ============================================================
-- UPDATED_AT TRIGGERS
-- ============================================================

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- AUTO-CREATE NOTIFICATION PREFERENCES ON USER INSERT
-- ============================================================

CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
DECLARE
  cat TEXT;
BEGIN
  FOREACH cat IN ARRAY ARRAY[
    'request_updates', 'quotes', 'bookings', 'payments', 'messages', 'system', 'marketing'
  ] LOOP
    INSERT INTO notification_preferences (user_id, category, push_enabled, email_enabled, sms_enabled)
    VALUES (NEW.id, cat, TRUE, TRUE, FALSE);
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_notification_prefs_on_user_insert
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION create_default_notification_preferences();

-- ============================================================
-- NOTIFICATION DISPATCH TRIGGERS (via pg_net)
-- ============================================================

-- Helper: call the notify edge function
CREATE OR REPLACE FUNCTION call_notify_function(event_name TEXT, payload JSONB)
RETURNS VOID AS $$
BEGIN
  PERFORM net.http_post(
    url := current_setting('app.settings.supabase_url', true) || '/functions/v1/notify',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object(
      'event', event_name,
      'payload', payload
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- On charter_request submitted
CREATE OR REPLACE FUNCTION on_charter_request_submitted()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'submitted' AND (OLD IS NULL OR OLD.status != 'submitted') THEN
    PERFORM call_notify_function('request_submitted', jsonb_build_object(
      'request_id', NEW.id,
      'requester_id', NEW.requester_id,
      'organization_id', NEW.organization_id
    ));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER notify_on_request_submitted
  AFTER INSERT OR UPDATE ON charter_requests
  FOR EACH ROW EXECUTE FUNCTION on_charter_request_submitted();

-- On quote created
CREATE OR REPLACE FUNCTION on_quote_created()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM call_notify_function('quote_received', jsonb_build_object(
    'quote_id', NEW.id,
    'request_id', NEW.request_id,
    'broker_id', NEW.broker_id,
    'total_price', NEW.total_price
  ));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER notify_on_quote_created
  AFTER INSERT ON quotes
  FOR EACH ROW EXECUTE FUNCTION on_quote_created();

-- On quote accepted
CREATE OR REPLACE FUNCTION on_quote_accepted()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    PERFORM call_notify_function('quote_accepted', jsonb_build_object(
      'quote_id', NEW.id,
      'request_id', NEW.request_id,
      'broker_id', NEW.broker_id,
      'total_price', NEW.total_price
    ));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER notify_on_quote_accepted
  AFTER UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION on_quote_accepted();

-- On booking created → notify + generate invoice
CREATE OR REPLACE FUNCTION on_booking_created()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM call_notify_function('booking_confirmed', jsonb_build_object(
    'booking_id', NEW.id,
    'request_id', NEW.request_id,
    'organization_id', NEW.organization_id,
    'confirmation_number', NEW.confirmation_number,
    'total_amount', NEW.total_amount
  ));
  -- Also trigger invoice generation
  PERFORM net.http_post(
    url := current_setting('app.settings.supabase_url', true) || '/functions/v1/generate-invoice',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key', true)
    ),
    body := jsonb_build_object('booking_id', NEW.id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER notify_on_booking_created
  AFTER INSERT ON bookings
  FOR EACH ROW EXECUTE FUNCTION on_booking_created();

-- On payment succeeded
CREATE OR REPLACE FUNCTION on_payment_succeeded()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'succeeded' AND OLD.status != 'succeeded' THEN
    PERFORM call_notify_function('payment_received', jsonb_build_object(
      'transaction_id', NEW.id,
      'booking_id', NEW.booking_id,
      'amount', NEW.amount
    ));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER notify_on_payment_succeeded
  AFTER UPDATE ON payment_transactions
  FOR EACH ROW EXECUTE FUNCTION on_payment_succeeded();

-- On message created
CREATE OR REPLACE FUNCTION on_message_created()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM call_notify_function('message_received', jsonb_build_object(
    'message_id', NEW.id,
    'request_id', NEW.request_id,
    'sender_id', NEW.sender_id
  ));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER notify_on_message_created
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION on_message_created();
