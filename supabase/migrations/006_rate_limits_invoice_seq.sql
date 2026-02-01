-- Rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  window_start BIGINT NOT NULL,
  window_ms BIGINT NOT NULL DEFAULT 60000
);

CREATE INDEX idx_rate_limits_window ON rate_limits(window_start);

-- RPC function for atomic rate limit check
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_key TEXT,
  p_window_ms BIGINT DEFAULT 60000,
  p_max_requests INTEGER DEFAULT 60
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_now BIGINT;
  v_window_start BIGINT;
  v_count INTEGER;
  v_allowed BOOLEAN;
  v_remaining INTEGER;
  v_reset_at BIGINT;
BEGIN
  v_now := (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;
  v_window_start := v_now - p_window_ms;

  -- Try to insert or update atomically
  INSERT INTO rate_limits (key, count, window_start, window_ms)
  VALUES (p_key, 1, v_now, p_window_ms)
  ON CONFLICT (key) DO UPDATE SET
    count = CASE
      WHEN rate_limits.window_start < v_window_start THEN 1
      ELSE rate_limits.count + 1
    END,
    window_start = CASE
      WHEN rate_limits.window_start < v_window_start THEN v_now
      ELSE rate_limits.window_start
    END,
    window_ms = p_window_ms
  RETURNING count, window_start + window_ms INTO v_count, v_reset_at;

  v_allowed := v_count <= p_max_requests;
  v_remaining := GREATEST(0, p_max_requests - v_count);

  RETURN json_build_object(
    'allowed', v_allowed,
    'remaining', v_remaining,
    'reset_at', v_reset_at
  );
END;
$$;

-- Invoice number sequence
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

-- RPC function for atomic invoice number generation
CREATE OR REPLACE FUNCTION next_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_year_month TEXT;
  v_seq INTEGER;
BEGIN
  v_year_month := TO_CHAR(NOW(), 'YYYYMM');
  v_seq := nextval('invoice_number_seq');
  RETURN 'SMC-' || v_year_month || '-' || LPAD(v_seq::TEXT, 4, '0');
END;
$$;

-- Atomic payment processing RPC
CREATE OR REPLACE FUNCTION add_payment_to_booking(
  p_booking_id UUID,
  p_amount NUMERIC,
  p_stripe_pi_id TEXT
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_booking RECORD;
  v_new_paid NUMERIC;
  v_payment_status TEXT;
BEGIN
  -- Lock the booking row for update
  SELECT total_amount, amount_paid INTO v_booking
  FROM bookings WHERE id = p_booking_id FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Booking not found');
  END IF;

  v_new_paid := COALESCE(v_booking.amount_paid, 0) + p_amount;
  v_payment_status := CASE
    WHEN v_new_paid >= v_booking.total_amount THEN 'paid'
    ELSE 'partial'
  END;

  -- Update booking atomically
  UPDATE bookings
  SET amount_paid = v_new_paid, payment_status = v_payment_status
  WHERE id = p_booking_id;

  -- Update related invoice
  UPDATE invoices
  SET status = 'paid', paid_at = NOW()
  WHERE booking_id = p_booking_id AND status = 'sent';

  -- Update payment transaction
  UPDATE payment_transactions
  SET status = 'succeeded',
      receipt_url = NULL,
      payment_method_type = 'card'
  WHERE stripe_payment_intent_id = p_stripe_pi_id;

  RETURN json_build_object(
    'new_paid', v_new_paid,
    'payment_status', v_payment_status
  );
END;
$$;
