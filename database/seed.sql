-- Seed packages for Walk With Me
-- ON CONFLICT DO NOTHING: safe to re-run — skips rows that already exist
INSERT INTO packages (id, slug, title, short_description, long_description, category, images, base_price_cents, currency, inclusions, duration_hours, min_guests, max_guests, is_featured, is_active) VALUES
  (uuid_generate_v4(), 'romantic-dinner-date', 'Romantic Dinner Experience', 'An intimate candlelit dinner in an exclusive setting', 'Our signature romantic dinner package includes a private chef, premium wines, and a beautifully curated ambiance. Perfect for anniversaries, proposals, or simply celebrating love.', 'date', ARRAY['https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800'], 2500000, 'GHS', '[{"item": "Private chef"}, {"item": "3-course dinner"}, {"item": "Wine pairing"}, {"item": "Floral arrangement"}]'::jsonb, 4, 2, 4, true, true),
  (uuid_generate_v4(), 'birthday-celebration', 'Luxury Birthday Celebration', 'Make your special day unforgettable', 'A complete birthday package with decor, cake, catering, and entertainment. We handle every detail so you can enjoy the moment.', 'birthday', ARRAY['https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800'], 1500000, 'GHS', '[{"item": "Themed decor"}, {"item": "Birthday cake"}, {"item": "Catering for 20"}, {"item": "DJ or live music"}]'::jsonb, 6, 5, 50, true, true),
  (uuid_generate_v4(), 'proposal-package', 'Dream Proposal Package', 'Say yes in the perfect setting', 'We orchestrate your perfect proposal moment: location scouting, floral setup, photographer, and champagne toast.', 'proposal', ARRAY['https://images.unsplash.com/photo-1519741497674-611481863552?w=800'], 3500000, 'GHS', '[{"item": "Private venue"}, {"item": "Floral & decor"}, {"item": "Professional photographer"}, {"item": "Champagne celebration"}]'::jsonb, 3, 2, 10, true, true),
  (uuid_generate_v4(), 'weekend-getaway', 'Luxury Weekend Trip', 'Escape to a curated retreat', 'A fully planned weekend including accommodation, activities, and dining. Destinations across Ghana''s finest locations.', 'trip', ARRAY['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'], 5000000, 'GHS', '[{"item": "2-night accommodation"}, {"item": "All meals"}, {"item": "Guided activities"}, {"item": "Private transport"}]'::jsonb, 48, 2, 6, false, true),
  (uuid_generate_v4(), 'elegant-party', 'Elegant Party Package', 'Sophisticated celebrations', 'From corporate events to private soirées. Full event planning with premium catering and ambiance.', 'party', ARRAY['https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800'], 2000000, 'GHS', '[{"item": "Venue setup"}, {"item": "Premium catering"}, {"item": "Bar service"}, {"item": "Event coordination"}]'::jsonb, 5, 10, 100, false, true)
ON CONFLICT (slug) DO NOTHING;

-- Vendors Table
CREATE TABLE vendors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('USER', 'VENDOR')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Packages Table
CREATE TABLE packages (
    id SERIAL PRIMARY KEY,
    vendor_id INT NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
    location VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    images TEXT[],
    availability TIMESTAMP,
    status VARCHAR(50) NOT NULL CHECK (status IN ('draft', 'published')),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
