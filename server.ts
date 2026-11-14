import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || '';

const supabase: SupabaseClient | null =
  supabaseUrl && supabaseSecretKey
    ? createClient(supabaseUrl, supabaseSecretKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
    : null;

const REQUIRED_TABLES = [
  'studio_users',
  'products',
  'orders',
  'commissions',
  'coupons',
  'store_settings',
] as const;

function mapDbProductToApp(row: Record<string, any>) {
  return {
    id: row.id,
    slug: row.slug,
    sku: row.sku ?? undefined,
    name: row.name,
    subtitle: row.subtitle ?? '',
    description: row.description,
    story: row.story ?? '',
    artistNote: row.artist_note ?? '',
    category: row.category,
    categoryLabel: row.category_label,
    routeGroup: row.route_group,
    price: Number(row.price),
    originalPrice: row.original_price != null ? Number(row.original_price) : undefined,
    images: Array.isArray(row.images) ? row.images : [],
    medium: row.medium ?? '',
    dimensions: row.dimensions ?? '',
    stock: Number(row.stock ?? 0),
    productType: row.product_type,
    availabilityLabel: row.availability_label,
    badge: row.badge ?? undefined,
    isBestseller: Boolean(row.is_bestseller),
    isPublished: row.is_published !== false,
    specifications: row.specifications ?? {},
    createdAt: row.created_at ? String(row.created_at).slice(0, 10) : undefined,
  };
}

function mapAppProductToDb(p: Record<string, any>) {
  return {
    id: p.id,
    slug: p.slug,
    sku: p.sku ?? null,
    name: p.name,
    subtitle: p.subtitle ?? '',
    description: p.description ?? '',
    story: p.story ?? '',
    artist_note: p.artistNote ?? '',
    category: p.category,
    category_label: p.categoryLabel ?? p.category,
    route_group: p.routeGroup ?? 'sketches',
    price: Number(p.price),
    original_price: p.originalPrice != null ? Number(p.originalPrice) : null,
    images: Array.isArray(p.images) ? p.images : [],
    medium: p.medium ?? '',
    dimensions: p.dimensions ?? '',
    stock: Number(p.stock ?? 0),
    product_type: p.productType ?? 'Original 1-of-1',
    availability_label: p.availabilityLabel ?? 'In Stock',
    badge: p.badge ?? null,
    is_bestseller: Boolean(p.isBestseller),
    is_published: p.isPublished !== false,
    specifications: p.specifications ?? {},
    updated_at: new Date().toISOString(),
  };
}

function mapDbOrderToApp(row: Record<string, any>) {
  return {
    id: row.id,
    orderNumber: row.order_number,
    customerId: row.customer_id,
    customerName: row.customer_name ?? undefined,
    customerEmail: row.customer_email ?? undefined,
    date: String(row.date).slice(0, 10),
    items: Array.isArray(row.items) ? row.items : [],
    subtotal: Number(row.subtotal),
    shippingFee: Number(row.shipping_fee ?? 0),
    discount: Number(row.discount ?? 0),
    total: Number(row.total),
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    orderStatus: row.order_status,
    shippingAddress: row.shipping_address,
    trackingCode: row.tracking_code ?? undefined,
    courierName: row.courier_name ?? undefined,
    estimatedDelivery: row.estimated_delivery ?? undefined,
  };
}

function mapAppOrderToDb(o: Record<string, any>) {
  return {
    id: o.id,
    order_number: o.orderNumber,
    customer_id: o.customerId,
    customer_name: o.customerName ?? null,
    customer_email: o.customerEmail ?? null,
    date: o.date,
    items: o.items ?? [],
    subtotal: Number(o.subtotal),
    shipping_fee: Number(o.shippingFee ?? 0),
    discount: Number(o.discount ?? 0),
    total: Number(o.total),
    payment_method: o.paymentMethod,
    payment_status: o.paymentStatus ?? 'Paid',
    order_status: o.orderStatus ?? 'Pending',
    shipping_address: o.shippingAddress,
    tracking_code: o.trackingCode ?? null,
    courier_name: o.courierName ?? null,
    estimated_delivery: o.estimatedDelivery ?? null,
  };
}

function mapDbCommissionToApp(row: Record<string, any>) {
  return {
    id: row.id,
    customerName: row.customer_name,
    email: row.email,
    phone: row.phone,
    artworkType: row.artwork_type,
    preferredStyle: row.preferred_style,
    approximateSize: row.approximate_size,
    budgetRange: row.budget_range,
    referenceImageName: row.reference_image_name ?? undefined,
    description: row.description,
    status: row.status,
    quotedPrice: row.quoted_price != null ? Number(row.quoted_price) : undefined,
    internalNotes: row.internal_notes ?? undefined,
    submittedAt: row.submitted_at,
  };
}

function mapDbCouponToApp(row: Record<string, any>) {
  return {
    id: row.id,
    code: row.code,
    discountType: row.discount_type,
    discountValue: Number(row.discount_value),
    minimumOrder: Number(row.minimum_order ?? 0),
    expiresAt: row.expires_at ?? undefined,
    isActive: Boolean(row.is_active),
  };
}

function mapDbSettingsToApp(row: Record<string, any>) {
  return {
    storeName: row.store_name,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    currency: row.currency,
    freeShippingThreshold: Number(row.free_shipping_threshold),
    defaultShippingFee: Number(row.default_shipping_fee),
    announcementText: row.announcement_text,
  };
}

async function checkSupabaseTables() {
  if (!supabase) {
    return { configured: false, tablesReady: false, missingTables: [...REQUIRED_TABLES] };
  }
  const missingTables: string[] = [];
  for (const table of REQUIRED_TABLES) {
    const { error } = await supabase.from(table).select('id').limit(1);
    if (error && (error.code === 'PGRST205' || error.code === '42P01' || error.message?.includes('schema cache'))) {
      missingTables.push(table);
    }
  }
  return {
    configured: true,
    tablesReady: missingTables.length === 0,
    missingTables,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, supabaseConfigured: Boolean(supabase) });
  });

  app.get('/api/supabase/status', async (_req, res) => {
    try {
      const status = await checkSupabaseTables();
      res.json(status);
    } catch (err: any) {
      res.json({ configured: Boolean(supabase), tablesReady: false, missingTables: [...REQUIRED_TABLES], error: err?.message });
    }
  });

  // Bootstrap all store data from Supabase if tables are ready
  app.get('/api/bootstrap', async (_req, res) => {
    if (!supabase) {
      return res.json({ synced: false, reason: 'not_configured' });
    }
    try {
      const status = await checkSupabaseTables();
      if (!status.tablesReady) {
        return res.json({ synced: false, reason: 'tables_missing', missingTables: status.missingTables });
      }

      const [productsRes, ordersRes, commissionsRes, couponsRes, settingsRes] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('commissions').select('*').order('submitted_at', { ascending: false }),
        supabase.from('coupons').select('*').order('created_at', { ascending: true }),
        supabase.from('store_settings').select('*').eq('id', 'default').maybeSingle(),
      ]);

      res.json({
        synced: true,
        products: (productsRes.data ?? []).map(mapDbProductToApp),
        orders: (ordersRes.data ?? []).map(mapDbOrderToApp),
        commissions: (commissionsRes.data ?? []).map(mapDbCommissionToApp),
        coupons: (couponsRes.data ?? []).map(mapDbCouponToApp),
        settings: settingsRes.data ? mapDbSettingsToApp(settingsRes.data) : null,
      });
    } catch (err: any) {
      res.status(500).json({ synced: false, error: err?.message || 'Supabase bootstrap failed' });
    }
  });

  // Seed initial products when Supabase products table is empty
  app.post('/api/products/seed', async (req, res) => {
    if (!supabase) return res.json({ seeded: false });
    try {
      const { products } = req.body as { products?: Record<string, any>[] };
      if (!Array.isArray(products) || products.length === 0) {
        return res.json({ seeded: false });
      }
      const { data: existing } = await supabase.from('products').select('id').limit(1);
      if (existing && existing.length > 0) {
        return res.json({ seeded: false, reason: 'already_populated' });
      }
      const rows = products.map(mapAppProductToDb);
      const { error } = await supabase.from('products').upsert(rows, { onConflict: 'id' });
      if (error) return res.status(400).json({ seeded: false, error: error.message });
      return res.json({ seeded: true, count: rows.length });
    } catch (err: any) {
      return res.status(500).json({ seeded: false, error: err?.message });
    }
  });

  // Auth Login against studio_users
  app.post('/api/auth/login', async (req, res) => {
    if (!supabase) return res.json({ handled: false });
    try {
      const { email, password } = req.body as { email?: string; password?: string };
      if (!email || !password) return res.status(400).json({ ok: false, error: 'Missing credentials' });

      const { data, error } = await supabase
        .from('studio_users')
        .select('*')
        .ilike('email', email.trim())
        .maybeSingle();

      if (error) return res.json({ handled: false });
      if (!data) return res.json({ handled: true, ok: false, error: 'No account found with that email address.' });
      if (data.password_hash !== password) {
        return res.json({ handled: true, ok: false, error: 'Incorrect password. Please try again.' });
      }
      return res.json({
        handled: true,
        ok: true,
        user: {
          id: data.id,
          fullName: data.full_name,
          email: data.email,
          phone: data.phone ?? '',
          joinedAt: String(data.joined_at).slice(0, 10),
          role: data.role,
        },
      });
    } catch {
      return res.json({ handled: false });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    if (!supabase) return res.json({ handled: false });
    try {
      const { id, fullName, email, phone, password, joinedAt } = req.body;
      const { error } = await supabase.from('studio_users').insert({
        id,
        full_name: fullName,
        email: String(email).toLowerCase(),
        phone: phone ?? '',
        password_hash: password,
        role: 'customer',
        joined_at: joinedAt,
      });
      if (error) return res.json({ handled: false, error: error.message });
      return res.json({ handled: true, ok: true });
    } catch {
      return res.json({ handled: false });
    }
  });

  // Products CRUD
  app.post('/api/products', async (req, res) => {
    if (!supabase) return res.json({ synced: false });
    try {
      const row = mapAppProductToDb(req.body);
      const { error } = await supabase.from('products').upsert(row, { onConflict: 'id' });
      if (error) return res.status(400).json({ synced: false, error: error.message });
      return res.json({ synced: true });
    } catch (err: any) {
      return res.status(500).json({ synced: false, error: err?.message });
    }
  });

  app.put('/api/products/:id', async (req, res) => {
    if (!supabase) return res.json({ synced: false });
    try {
      const row = mapAppProductToDb({ ...req.body, id: req.params.id });
      const { error } = await supabase.from('products').upsert(row, { onConflict: 'id' });
      if (error) return res.status(400).json({ synced: false, error: error.message });
      return res.json({ synced: true });
    } catch (err: any) {
      return res.status(500).json({ synced: false, error: err?.message });
    }
  });

  app.delete('/api/products/:id', async (req, res) => {
    if (!supabase) return res.json({ synced: false });
    try {
      const { error } = await supabase.from('products').delete().eq('id', req.params.id);
      if (error) return res.status(400).json({ synced: false, error: error.message });
      return res.json({ synced: true });
    } catch (err: any) {
      return res.status(500).json({ synced: false, error: err?.message });
    }
  });

  // Orders
  app.post('/api/orders', async (req, res) => {
    if (!supabase) return res.json({ synced: false });
    try {
      const row = mapAppOrderToDb(req.body);
      const { error } = await supabase.from('orders').upsert(row, { onConflict: 'id' });
      if (error) return res.status(400).json({ synced: false, error: error.message });
      return res.json({ synced: true });
    } catch (err: any) {
      return res.status(500).json({ synced: false, error: err?.message });
    }
  });

  app.patch('/api/orders/:id', async (req, res) => {
    if (!supabase) return res.json({ synced: false });
    try {
      const { orderStatus, trackingCode } = req.body;
      const patch: Record<string, any> = { order_status: orderStatus };
      if (trackingCode !== undefined) patch.tracking_code = trackingCode;
      const { error } = await supabase.from('orders').update(patch).eq('id', req.params.id);
      if (error) return res.status(400).json({ synced: false, error: error.message });
      return res.json({ synced: true });
    } catch (err: any) {
      return res.status(500).json({ synced: false, error: err?.message });
    }
  });

  // Commissions
  app.post('/api/commissions', async (req, res) => {
    if (!supabase) return res.json({ synced: false });
    try {
      const c = req.body;
      const { error } = await supabase.from('commissions').upsert({
        id: c.id,
        customer_name: c.customerName,
        email: c.email,
        phone: c.phone,
        artwork_type: c.artworkType,
        preferred_style: c.preferredStyle,
        approximate_size: c.approximateSize,
        budget_range: c.budgetRange,
        reference_image_name: c.referenceImageName ?? null,
        description: c.description,
        status: c.status ?? 'New',
        quoted_price: c.quotedPrice ?? null,
        internal_notes: c.internalNotes ?? null,
        submitted_at: c.submittedAt ?? new Date().toISOString(),
      });
      if (error) return res.status(400).json({ synced: false, error: error.message });
      return res.json({ synced: true });
    } catch (err: any) {
      return res.status(500).json({ synced: false, error: err?.message });
    }
  });

  app.patch('/api/commissions/:id', async (req, res) => {
    if (!supabase) return res.json({ synced: false });
    try {
      const { status, quotedPrice, internalNotes } = req.body;
      const patch: Record<string, any> = { status };
      if (quotedPrice !== undefined) patch.quoted_price = quotedPrice;
      if (internalNotes !== undefined) patch.internal_notes = internalNotes;
      const { error } = await supabase.from('commissions').update(patch).eq('id', req.params.id);
      if (error) return res.status(400).json({ synced: false, error: error.message });
      return res.json({ synced: true });
    } catch (err: any) {
      return res.status(500).json({ synced: false, error: err?.message });
    }
  });

  // Coupons
  app.put('/api/coupons', async (req, res) => {
    if (!supabase) return res.json({ synced: false });
    try {
      const coupons = Array.isArray(req.body?.coupons) ? req.body.coupons : [];
      await supabase.from('coupons').delete().neq('id', '__none__');
      if (coupons.length > 0) {
        const rows = coupons.map((c: any) => ({
          id: c.id,
          code: String(c.code).toUpperCase(),
          discount_type: c.discountType,
          discount_value: Number(c.discountValue),
          minimum_order: Number(c.minimumOrder ?? 0),
          expires_at: c.expiresAt || null,
          is_active: Boolean(c.isActive),
        }));
        const { error } = await supabase.from('coupons').upsert(rows, { onConflict: 'id' });
        if (error) return res.status(400).json({ synced: false, error: error.message });
      }
      return res.json({ synced: true });
    } catch (err: any) {
      return res.status(500).json({ synced: false, error: err?.message });
    }
  });

  // Store Settings
  app.put('/api/settings', async (req, res) => {
    if (!supabase) return res.json({ synced: false });
    try {
      const s = req.body;
      const { error } = await supabase.from('store_settings').upsert({
        id: 'default',
        store_name: s.storeName,
        contact_email: s.contactEmail,
        contact_phone: s.contactPhone,
        currency: s.currency ?? 'INR',
        free_shipping_threshold: Number(s.freeShippingThreshold),
        default_shipping_fee: Number(s.defaultShippingFee),
        announcement_text: s.announcementText,
        updated_at: new Date().toISOString(),
      });
      if (error) return res.status(400).json({ synced: false, error: error.message });
      return res.json({ synced: true });
    } catch (err: any) {
      return res.status(500).json({ synced: false, error: err?.message });
    }
  });

  // Vite dev middleware or production static build
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`varniks_atelier server listening on http://localhost:${PORT}`);
  });
}

startServer();
