-- Sports Media Charter Database Schema
-- Initial migration for charter aviation platform

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table (teams, leagues, brokers)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('team', 'league', 'broker')),
  logo_url TEXT,
  sport TEXT,
  league_id UUID REFERENCES organizations(id),
  home_airport TEXT,
  billing_address JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('team_admin', 'travel_coordinator', 'league_admin', 'broker', 'support')),
  organization_id UUID REFERENCES organizations(id),
  avatar_url TEXT,
  biometric_enabled BOOLEAN DEFAULT FALSE,
  push_token TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Charter requests table
CREATE TABLE charter_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  requester_id UUID NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'quoting', 'quoted', 'approved', 'booked', 'completed', 'cancelled')),
  trip_type TEXT NOT NULL CHECK (trip_type IN ('one_way', 'round_trip', 'multi_leg')),
  passenger_count INTEGER NOT NULL CHECK (passenger_count > 0),
  baggage_notes TEXT,
  special_requirements TEXT,
  urgency TEXT NOT NULL DEFAULT 'standard' CHECK (urgency IN ('standard', 'urgent', 'emergency')),
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Flight legs table
CREATE TABLE flight_legs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES charter_requests(id) ON DELETE CASCADE,
  leg_number INTEGER NOT NULL,
  departure_airport TEXT NOT NULL,
  arrival_airport TEXT NOT NULL,
  departure_date DATE NOT NULL,
  departure_time TEXT NOT NULL,
  flexibility_hours INTEGER DEFAULT 2,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(request_id, leg_number)
);

-- Quotes table
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES charter_requests(id) ON DELETE CASCADE,
  broker_id UUID NOT NULL REFERENCES users(id),
  operator_name TEXT NOT NULL,
  aircraft_type TEXT NOT NULL,
  aircraft_category TEXT CHECK (aircraft_category IN ('light', 'midsize', 'super_midsize', 'heavy', 'ultra_long_range')),
  tail_number TEXT,
  base_price DECIMAL(12,2) NOT NULL,
  taxes_fees DECIMAL(12,2) NOT NULL DEFAULT 0,
  total_price DECIMAL(12,2) NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  safety_rating TEXT,
  amenities TEXT[],
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'presented', 'accepted', 'rejected', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL REFERENCES quotes(id),
  request_id UUID NOT NULL REFERENCES charter_requests(id),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'in_progress', 'completed', 'cancelled')),
  confirmation_number TEXT UNIQUE NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
  total_amount DECIMAL(12,2) NOT NULL,
  amount_paid DECIMAL(12,2) DEFAULT 0,
  manifest_submitted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Passengers table
CREATE TABLE passengers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,
  weight_lbs INTEGER,
  seat_preference TEXT,
  dietary_restrictions TEXT,
  emergency_contact JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table (for request communication)
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID NOT NULL REFERENCES charter_requests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  attachments TEXT[],
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL,
  data JSONB,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX idx_charter_requests_org ON charter_requests(organization_id);
CREATE INDEX idx_charter_requests_status ON charter_requests(status);
CREATE INDEX idx_charter_requests_requester ON charter_requests(requester_id);
CREATE INDEX idx_flight_legs_request ON flight_legs(request_id);
CREATE INDEX idx_quotes_request ON quotes(request_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_bookings_org ON bookings(organization_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_passengers_booking ON passengers(booking_id);
CREATE INDEX idx_messages_request ON messages(request_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_charter_requests_updated_at BEFORE UPDATE ON charter_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE charter_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE flight_legs ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Users can view their organization
CREATE POLICY "Users can view their organization" ON organizations FOR SELECT USING (
  id IN (SELECT organization_id FROM users WHERE id = auth.uid())
  OR league_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
);

-- Charter requests policies
CREATE POLICY "Users can view org requests" ON charter_requests FOR SELECT USING (
  organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
  OR requester_id = auth.uid()
);

CREATE POLICY "Users can create requests" ON charter_requests FOR INSERT WITH CHECK (
  organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
);

CREATE POLICY "Users can update own requests" ON charter_requests FOR UPDATE USING (
  requester_id = auth.uid() OR
  organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
);

-- Flight legs follow request policies
CREATE POLICY "Users can view flight legs" ON flight_legs FOR SELECT USING (
  request_id IN (SELECT id FROM charter_requests WHERE organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()))
);

CREATE POLICY "Users can create flight legs" ON flight_legs FOR INSERT WITH CHECK (
  request_id IN (SELECT id FROM charter_requests WHERE requester_id = auth.uid())
);

-- Quotes policies
CREATE POLICY "Users can view quotes for their requests" ON quotes FOR SELECT USING (
  request_id IN (SELECT id FROM charter_requests WHERE organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()))
  OR broker_id = auth.uid()
);

-- Bookings policies
CREATE POLICY "Users can view org bookings" ON bookings FOR SELECT USING (
  organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid())
);

-- Passengers follow booking policies
CREATE POLICY "Users can view passengers" ON passengers FOR SELECT USING (
  booking_id IN (SELECT id FROM bookings WHERE organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()))
);

CREATE POLICY "Users can manage passengers" ON passengers FOR ALL USING (
  booking_id IN (SELECT id FROM bookings WHERE organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()))
);

-- Messages policies
CREATE POLICY "Users can view request messages" ON messages FOR SELECT USING (
  request_id IN (SELECT id FROM charter_requests WHERE organization_id IN (SELECT organization_id FROM users WHERE id = auth.uid()))
  OR sender_id = auth.uid()
);

CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (
  sender_id = auth.uid()
);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());
