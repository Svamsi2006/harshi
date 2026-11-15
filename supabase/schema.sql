-- ============================================================================
-- VARNIKS_ATELIER — Supabase PostgreSQL Schema
-- Run this script in Supabase Dashboard -> SQL Editor -> New Query
-- ============================================================================

-- 1. Studio Users (Customers & Studio Owner/Admin)
CREATE TABLE IF NOT EXISTS public.studio_users (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT DEFAULT '',
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'owner')),
  joined_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Dynamic Product Categories (7 Core + Admin Custom Categories)
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Products Catalog
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  sku TEXT,
  name TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL,
  story TEXT NOT NULL DEFAULT '',
  artist_note TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL,
  category_label TEXT NOT NULL,
  route_group TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  original_price INTEGER,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  medium TEXT NOT NULL DEFAULT '',
  dimensions TEXT NOT NULL DEFAULT '',
  stock INTEGER NOT NULL DEFAULT 1 CHECK (stock >= 0),
  product_type TEXT NOT NULL DEFAULT 'Handmade Keepsake',
  availability_label TEXT NOT NULL DEFAULT 'In Stock',
  badge TEXT,
  is_bestseller BOOLEAN NOT NULL DEFAULT FALSE,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  specifications JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Customer Orders & Continuous Custom Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id TEXT PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_id TEXT NOT NULL,
  customer_name TEXT,
  customer_email TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
  shipping_fee INTEGER NOT NULL DEFAULT 0,
  discount INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL CHECK (total >= 0),
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'Paid',
  order_status TEXT NOT NULL DEFAULT 'Pending',
  shipping_address JSONB NOT NULL,
  tracking_code TEXT,
  courier_name TEXT,
  estimated_delivery TEXT,
  is_custom_order BOOLEAN NOT NULL DEFAULT FALSE,
  custom_request_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Custom Order Requests & Waiting List Approval Flow
CREATE TABLE IF NOT EXISTS public.commissions (
  id TEXT PRIMARY KEY,
  customer_id TEXT,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  category_slug TEXT NOT NULL DEFAULT 'resin-creations',
  category_label TEXT NOT NULL DEFAULT 'Resin Creations',
  custom_idea TEXT NOT NULL DEFAULT '',
  artwork_type TEXT NOT NULL,
  preferred_style TEXT NOT NULL,
  approximate_size TEXT NOT NULL,
  budget_range TEXT NOT NULL,
  is_custom_price BOOLEAN NOT NULL DEFAULT FALSE,
  predicted_price INTEGER,
  has_uploaded_file BOOLEAN NOT NULL DEFAULT FALSE,
  reference_image_name TEXT,
  reference_image_data TEXT,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Waiting List',
  admin_approved BOOLEAN NOT NULL DEFAULT FALSE,
  customer_approved BOOLEAN NOT NULL DEFAULT FALSE,
  order_created BOOLEAN NOT NULL DEFAULT FALSE,
  linked_order_id TEXT,
  quoted_price INTEGER,
  internal_notes TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Discount Coupons
CREATE TABLE IF NOT EXISTS public.coupons (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value INTEGER NOT NULL CHECK (discount_value > 0),
  minimum_order INTEGER NOT NULL DEFAULT 0,
  expires_at DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Store Settings & Content
CREATE TABLE IF NOT EXISTS public.store_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  store_name TEXT NOT NULL DEFAULT 'varniks_atelier',
  contact_email TEXT NOT NULL DEFAULT 'hello@varniksatelier.studio',
  contact_phone TEXT NOT NULL DEFAULT '+91 98204 51120',
  currency TEXT NOT NULL DEFAULT 'INR',
  free_shipping_threshold INTEGER NOT NULL DEFAULT 999,
  default_shipping_fee INTEGER NOT NULL DEFAULT 95,
  announcement_text TEXT NOT NULL DEFAULT 'Handmade • Heartmade • Heartfelt — Free shipping on orders above ₹999',
  logo_url TEXT,
  chatbot_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  openrouter_model TEXT DEFAULT 'openai/gpt-4o-mini',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS chatbot_enabled BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE public.store_settings ADD COLUMN IF NOT EXISTS openrouter_model TEXT DEFAULT 'openai/gpt-4o-mini';

-- Helpful Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_products_published ON public.products (is_published);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders (customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders (order_status);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON public.commissions (status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.studio_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
DROP POLICY IF EXISTS "Public can read categories" ON public.categories;
CREATE POLICY "Public can read categories"
  ON public.categories FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Public can read published products" ON public.products;
CREATE POLICY "Public can read published products"
  ON public.products FOR SELECT
  USING (is_published = TRUE);

DROP POLICY IF EXISTS "Public can read store settings" ON public.store_settings;
CREATE POLICY "Public can read store settings"
  ON public.store_settings FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Public can read active coupons" ON public.coupons;
CREATE POLICY "Public can read active coupons"
  ON public.coupons FOR SELECT
  USING (is_active = TRUE);

-- Seed 7 Default Categories
INSERT INTO public.categories (id, slug, label, subtitle, is_default)
VALUES
  ('cat-resin', 'resin-creations', 'Resin Creations', 'Pressed floral coasters, bookmarked memories & crystal resin keepsakes', TRUE),
  ('cat-clay-pipe', 'clay-pipe-cleaner', 'Clay & Pipe Cleaner Creations', 'Hand-twisted fuzzy blooms, forever bouquets & polymer clay charms', TRUE),
  ('cat-frames-led', 'frames-led', 'Frames & LED Frames', 'Warm glowing fairy-light frames & dried-botanical shadow boxes', TRUE),
  ('cat-paper-photo', 'paper-photo-keepsakes', 'Paper & Photo Keepsakes', 'Handmade cotton scrapbooks, Polaroid memory boxes & love letters', TRUE),
  ('cat-textile-embroidery', 'textile-embroidery', 'Textile Art & Embroidery', 'Hand-stitched floral hoops, linen wall art & textured thread keepsakes', TRUE),
  ('cat-accessories', 'personalized-accessories', 'Personalized Accessories', 'Initial resin keychains, pearl bag charms & custom-stamped pendants', TRUE),
  ('cat-art-portraits', 'art-portraits', 'Art & Portraits', 'Hand-illustrated couple portraits, keepsake line art & custom paintings', TRUE)
ON CONFLICT (slug) DO UPDATE SET label = EXCLUDED.label;

-- Seed Default Store Owner & Demo Customer
INSERT INTO public.studio_users (id, full_name, email, phone, password_hash, role, joined_at)
VALUES
  ('owner-varniks-01', 'Varnika Studio Owner', 'owner@varniksatelier.studio', '+91 98204 99999', 'owner123', 'owner', '2025-01-01'),
  ('cust-ananya-01', 'Ananya Deshmukh', 'ananya@example.com', '+91 98204 51120', 'studio123', 'customer', '2026-06-14')
ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role;

-- Seed Default Store Settings
INSERT INTO public.store_settings (id, store_name, contact_email, contact_phone, currency, free_shipping_threshold, default_shipping_fee, announcement_text)
VALUES
  ('default', 'varniks_atelier', 'hello@varniksatelier.studio', '+91 98204 51120', 'INR', 999, 95, 'Handmade • Heartmade • Heartfelt — Free shipping on orders above ₹999')
ON CONFLICT (id) DO NOTHING;

-- Seed Default Coupons
INSERT INTO public.coupons (id, code, discount_type, discount_value, minimum_order, is_active)
VALUES
  ('coup-1', 'STUDIO10', 'percentage', 10, 999, TRUE),
  ('coup-2', 'HEARTMADE15', 'percentage', 15, 2500, TRUE)
ON CONFLICT (code) DO NOTHING;
