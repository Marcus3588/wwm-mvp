-- Migration 001: Production-critical features for WWM MVP
-- Run: psql -U postgres -d wwm -f database/migrations/001_production_features.sql
-- Purpose: Pricing/commission, vendor matching, trust layer, logistics, notifications, analytics

-- ============================================================
-- 1. PRICING & COMMISSION MODEL
-- ============================================================

-- Platform configuration (commission %, fees, cancellation penalties)
CREATE TABLE IF NOT EXISTS platform_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(64) UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_platform_config_key ON platform_config(key);

-- Default platform config seed
INSERT INTO platform_config (key, value, description) VALUES
  ('commission', '{"percentage": 15, "min_cents": 5000}'::jsonb, 'Platform commission % on each booking'),
  ('service_fee', '{"percentage": 2.5, "flat_cents": 0}'::jsonb, 'Service fee added to customer total'),
  ('cancellation', '{"within_24h_penalty_pct": 100, "within_48h_penalty_pct": 50, "within_7d_penalty_pct": 25, "refund_window_days": 14}'::jsonb, 'Cancellation penalty tiers and refund window'),
  ('vendor_matching', '{"mode": "manual", "auto_assign_categories": []}'::jsonb, 'manual or auto, categories for auto-assign'),
  ('buffer_minutes', '60'::jsonb, 'Buffer time between vendor bookings (minutes)'),
  ('sla_response_hours', '24'::jsonb, 'Vendor SLA: respond to booking within hours')
ON CONFLICT (key) DO NOTHING;

-- Add commission breakdown to payments
ALTER TABLE payments ADD COLUMN IF NOT EXISTS platform_commission_cents BIGINT DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS service_fee_cents BIGINT DEFAULT 0;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS vendor_payout_cents BIGINT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS refund_amount_cents BIGINT;
ALTER TABLE payments ADD COLUMN IF NOT EXISTS cancellation_penalty_cents BIGINT;

-- ============================================================
-- 2. TRUST LAYER - Identity verification, ratings
-- ============================================================

-- User verification status (email/phone verified)
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- Vendor ratings (simple MVP)
CREATE TABLE IF NOT EXISTS vendor_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(booking_id, customer_id)
);

CREATE INDEX IF NOT EXISTS idx_vendor_ratings_vendor ON vendor_ratings(vendor_id);

-- Service guarantees / SLA placeholders (for future use)
CREATE TABLE IF NOT EXISTS sla_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(128) NOT NULL,
  description TEXT,
  response_hours INTEGER DEFAULT 24,
  completion_hours INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 3. LOGISTICS & SCHEDULING
-- ============================================================

-- Link packages to required service types (for vendor capability matching)
ALTER TABLE packages ADD COLUMN IF NOT EXISTS required_services TEXT[] DEFAULT '{}';

-- Vendor service capabilities (which services they offer)
-- vendors.services_offered already exists
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS location_city VARCHAR(128);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS location_region VARCHAR(128);
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS buffer_minutes INTEGER DEFAULT 60;

-- Vendor booking slots (prevents double-booking, includes buffer)
CREATE TABLE IF NOT EXISTS vendor_booking_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  slot_start TIMESTAMPTZ NOT NULL,
  slot_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vendor_booking_slots_vendor ON vendor_booking_slots(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_booking_slots_slot ON vendor_booking_slots(slot_start, slot_end);

-- Emergency / fallback vendor flags
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS is_fallback BOOLEAN DEFAULT false;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(32);

-- ============================================================
-- 4. NOTIFICATION SYSTEM
-- ============================================================

-- Extend notifications table
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS status VARCHAR(32) DEFAULT 'pending';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS external_id VARCHAR(128);
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS error_message TEXT;

CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

-- Notification templates
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key VARCHAR(64) UNIQUE NOT NULL,
  subject VARCHAR(255),
  body_text TEXT,
  body_html TEXT,
  sms_body TEXT,
  whatsapp_body TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. DISPUTE RESOLUTION
-- ============================================================

ALTER TABLE disputes ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES users(id);
ALTER TABLE disputes ADD COLUMN IF NOT EXISTS priority VARCHAR(32) DEFAULT 'medium';

-- ============================================================
-- 6. ANALYTICS - Event tracking for BI
-- ============================================================

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(64) NOT NULL,
  entity_type VARCHAR(64),
  entity_id UUID,
  user_id UUID REFERENCES users(id),
  payload JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_entity ON analytics_events(entity_type, entity_id);

-- Trigger for platform_config updated_at
DROP TRIGGER IF EXISTS platform_config_updated_at ON platform_config;
CREATE TRIGGER platform_config_updated_at BEFORE UPDATE ON platform_config
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
