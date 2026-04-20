-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE user_role AS ENUM ('customer', 'vendor', 'admin');
CREATE TYPE vendor_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE package_category AS ENUM ('date', 'party', 'birthday', 'proposal', 'trip', 'celebration', 'custom');
CREATE TYPE booking_status AS ENUM ('draft', 'pending_payment', 'paid', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded');
CREATE TYPE payment_status AS ENUM ('pending', 'hold', 'success', 'failed', 'refunded', 'released');
CREATE TYPE dispute_status AS ENUM ('open', 'in_review', 'resolved', 'closed');

-- Users (Firebase UID linked; profile data in our DB)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid VARCHAR(128) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(32),
  role user_role NOT NULL DEFAULT 'customer',
  full_name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Vendors (extends users)
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  business_description TEXT,
  verification_status vendor_status NOT NULL DEFAULT 'pending',
  bank_name VARCHAR(255),
  bank_account_number VARCHAR(64),
  bank_account_name VARCHAR(255),
  services_offered TEXT[] DEFAULT '{}',
  rejection_reason TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_vendors_user_id ON vendors(user_id);
CREATE INDEX idx_vendors_status ON vendors(verification_status);

-- Packages (curated experiences)
CREATE TABLE packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(128) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  short_description TEXT,
  long_description TEXT,
  category package_category NOT NULL,
  images TEXT[] DEFAULT '{}',
  base_price_cents BIGINT NOT NULL CHECK (base_price_cents >= 0),
  currency VARCHAR(3) DEFAULT 'GHS',
  inclusions JSONB DEFAULT '[]',
  duration_hours INTEGER,
  min_guests INTEGER DEFAULT 1,
  max_guests INTEGER,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_packages_category ON packages(category);
CREATE INDEX idx_packages_featured ON packages(is_featured) WHERE is_featured = true;
CREATE INDEX idx_packages_active ON packages(is_active) WHERE is_active = true;

-- Package tiers (optional pricing tiers)
CREATE TABLE package_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  name VARCHAR(128) NOT NULL,
  description TEXT,
  price_cents BIGINT NOT NULL CHECK (price_cents >= 0),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_package_tiers_package ON package_tiers(package_id);

-- Vendor availability
CREATE TABLE vendor_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendor_availability_vendor ON vendor_availability(vendor_id);

-- Vendor blocked dates
CREATE TABLE vendor_blocked_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  blocked_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(vendor_id, blocked_date)
);

CREATE INDEX idx_vendor_blocked_dates ON vendor_blocked_dates(vendor_id);

-- Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_reference VARCHAR(16) UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES users(id),
  package_id UUID NOT NULL REFERENCES packages(id),
  package_tier_id UUID REFERENCES package_tiers(id),
  vendor_id UUID REFERENCES vendors(id),
  status booking_status NOT NULL DEFAULT 'draft',
  event_date DATE NOT NULL,
  event_time TIME,
  event_location TEXT,
  guest_count INTEGER DEFAULT 1,
  customization_notes TEXT,
  total_amount_cents BIGINT NOT NULL CHECK (total_amount_cents >= 0),
  currency VARCHAR(3) DEFAULT 'GHS',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT
);

CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_bookings_vendor ON bookings(vendor_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_event_date ON bookings(event_date);
CREATE INDEX idx_bookings_reference ON bookings(booking_reference);

-- Payments (escrow-style: hold until completion)
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  paystack_reference VARCHAR(64) UNIQUE,
  paystack_authorization_url TEXT,
  amount_cents BIGINT NOT NULL CHECK (amount_cents >= 0),
  currency VARCHAR(3) DEFAULT 'GHS',
  status payment_status NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_paystack_ref ON payments(paystack_reference);
CREATE INDEX idx_payments_status ON payments(status);

-- Disputes
CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id),
  raised_by UUID NOT NULL REFERENCES users(id),
  reason TEXT NOT NULL,
  status dispute_status NOT NULL DEFAULT 'open',
  resolution_notes TEXT,
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_disputes_booking ON disputes(booking_id);

-- Activity logs (trust & safety)
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  entity_type VARCHAR(64) NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR(64) NOT NULL,
  payload JSONB DEFAULT '{}',
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at);

-- Notifications (for WhatsApp/email)
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(64) NOT NULL,
  title VARCHAR(255),
  body TEXT,
  data JSONB DEFAULT '{}',
  channel VARCHAR(32) DEFAULT 'email',
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER vendors_updated_at BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER packages_updated_at BEFORE UPDATE ON packages FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
CREATE TRIGGER disputes_updated_at BEFORE UPDATE ON disputes FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
