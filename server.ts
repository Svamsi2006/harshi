import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);

function pickEnvVar(names: string[]): { value: string; source?: string } {
  for (const name of names) {
    const raw = process.env[name];
    if (typeof raw === 'string') {
      const cleaned = raw.trim().replace(/^["']|["']$/g, '');
      if (cleaned) {
        return { value: cleaned, source: name };
      }
    }
  }
  return { value: '' };
}

const resolvedUrl = pickEnvVar([
  'SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_URL',
  'VITE_SUPABASE_URL',
  'SUPERBASE_URL',
  'NEXT_PUBLIC_SUPERBASE_URL',
  'VITE_SUPERBASE_URL',
]);

const resolvedKey = pickEnvVar([
  'SUPABASE_SECRET_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_SERVICE_KEY',
  'SUPERBASE_SECRET_KEY',
  'SUPERBASE_SERVICE_ROLE_KEY',
  'SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'VITE_SUPABASE_ANON_KEY',
]);

const resolvedDbUrl = pickEnvVar(['DATABASE_URL', 'POSTGRES_URL', 'POSTGRES_PRISMA_URL']);

const supabaseUrl = resolvedUrl.value;
const supabaseSecretKey = resolvedKey.value;

let supabaseInitError = '';
let supabase: SupabaseClient | null = null;
if (supabaseUrl && supabaseSecretKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseSecretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  } catch (err: any) {
    supabaseInitError = err?.message || 'Failed to initialize Supabase client';
    supabase = null;
  }
}

const REQUIRED_TABLES = [
  'studio_users',
  'categories',
  'products',
  'orders',
  'commissions',
  'coupons',
  'store_settings',
] as const;

function mapDbCategoryToApp(row: Record<string, any>) {
  return {
    id: row.id,
    slug: row.slug,
    label: row.label,
    subtitle: row.subtitle ?? '',
    isDefault: Boolean(row.is_default),
  };
}

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
    createdAt: row.created_at ? String(row.created_at).slice(0, 10) : '',
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
    route_group: p.routeGroup ?? p.category,
    price: Number(p.price),
    original_price: p.originalPrice != null ? Number(p.originalPrice) : null,
    images: Array.isArray(p.images) ? p.images : [],
    medium: p.medium ?? '',
    dimensions: p.dimensions ?? '',
    stock: Number(p.stock ?? 0),
    product_type: p.productType ?? 'Handmade Keepsake',
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
    isCustomOrder: Boolean(row.is_custom_order),
    customRequestId: row.custom_request_id ?? undefined,
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
    is_custom_order: Boolean(o.isCustomOrder),
    custom_request_id: o.customRequestId ?? null,
  };
}

function mapDbCommissionToApp(row: Record<string, any>) {
  return {
    id: row.id,
    customerId: row.customer_id ?? undefined,
    customerName: row.customer_name,
    email: row.email,
    phone: row.phone,
    categorySlug: row.category_slug ?? 'resin-creations',
    categoryLabel: row.category_label ?? row.artwork_type ?? 'Resin Creations',
    customIdea: row.custom_idea ?? row.artwork_type ?? '',
    artworkType: row.artwork_type,
    preferredStyle: row.preferred_style,
    approximateSize: row.approximate_size,
    budgetRange: row.budget_range,
    isCustomPrice: Boolean(row.is_custom_price),
    predictedPrice: row.predicted_price != null ? Number(row.predicted_price) : undefined,
    hasUploadedFile: Boolean(row.has_uploaded_file),
    referenceImageName: row.reference_image_name ?? undefined,
    referenceImageData: row.reference_image_data ?? undefined,
    description: row.description,
    status: row.status,
    adminApproved: Boolean(row.admin_approved),
    customerApproved: Boolean(row.customer_approved),
    orderCreated: Boolean(row.order_created),
    linkedOrderId: row.linked_order_id ?? undefined,
    quotedPrice: row.quoted_price != null ? Number(row.quoted_price) : undefined,
    internalNotes: row.internal_notes ?? undefined,
    submittedAt: row.submitted_at,
  };
}

function mapAppCommissionToDb(c: Record<string, any>) {
  return {
    id: c.id,
    customer_id: c.customerId ?? null,
    customer_name: c.customerName,
    email: c.email,
    phone: c.phone,
    category_slug: c.categorySlug ?? 'resin-creations',
    category_label: c.categoryLabel ?? 'Resin Creations',
    custom_idea: c.customIdea ?? c.artworkType ?? '',
    artwork_type: c.artworkType ?? c.categoryLabel ?? 'Custom Creation',
    preferred_style: c.preferredStyle ?? '',
    approximate_size: c.approximateSize ?? '',
    budget_range: c.budgetRange ?? '',
    is_custom_price: Boolean(c.isCustomPrice),
    predicted_price: c.predictedPrice != null ? Number(c.predictedPrice) : null,
    has_uploaded_file: Boolean(c.hasUploadedFile),
    reference_image_name: c.referenceImageName ?? null,
    reference_image_data: c.referenceImageData ?? null,
    description: c.description ?? '',
    status: c.status ?? 'Waiting List',
    admin_approved: Boolean(c.adminApproved),
    customer_approved: Boolean(c.customerApproved),
    order_created: Boolean(c.orderCreated),
    linked_order_id: c.linkedOrderId ?? null,
    quoted_price: c.quotedPrice != null ? Number(c.quotedPrice) : null,
    internal_notes: c.internalNotes ?? null,
    submitted_at: c.submittedAt ?? new Date().toISOString(),
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

interface ExtendedStudioConfig {
  logoUrl?: string;
  chatbotEnabled: boolean;
  openrouterModel: string;
  openrouterApiKey: string;
}

interface ChatLogEntry {
  id: string;
  timestamp: string;
  model: string;
  userMessage: string;
  replyPreview: string;
  status: 'ok' | 'fallback' | 'error';
  latencyMs: number;
  errorDetail?: string;
}

const DEFAULT_EXTENDED_CONFIG: ExtendedStudioConfig = {
  logoUrl: '',
  chatbotEnabled: true,
  openrouterModel: 'openai/gpt-4o-mini',
  openrouterApiKey: process.env.OPENROUTER_API_KEY || '',
};

let memoryExtendedConfig: ExtendedStudioConfig = { ...DEFAULT_EXTENDED_CONFIG };
const chatLogs: ChatLogEntry[] = [];

function maskApiKey(key: string): string {
  const clean = key.trim();
  if (!clean) return '';
  if (clean.length <= 10) return '••••••';
  return `${clean.slice(0, 7)}••••${clean.slice(-4)}`;
}

async function ensureStudioBucket() {
  if (!supabase) return;
  const bucketName = 'studio-media';
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((b) => b.name === bucketName)) {
    await supabase.storage.createBucket(bucketName, { public: true });
  }
}

async function loadExtendedConfig(): Promise<ExtendedStudioConfig> {
  if (!supabase) return memoryExtendedConfig;
  try {
    const { data, error } = await supabase.storage
      .from('studio-media')
      .download('config/studio-config.json');
    if (!error && data) {
      const text = await data.text();
      const parsed = JSON.parse(text) as Partial<ExtendedStudioConfig>;
      memoryExtendedConfig = {
        ...DEFAULT_EXTENDED_CONFIG,
        ...parsed,
        openrouterApiKey:
          parsed.openrouterApiKey !== undefined
            ? parsed.openrouterApiKey
            : memoryExtendedConfig.openrouterApiKey,
      };
    }
  } catch {
    // Keep memory config
  }
  return memoryExtendedConfig;
}

async function saveExtendedConfig(patch: Partial<ExtendedStudioConfig>): Promise<ExtendedStudioConfig> {
  const current = await loadExtendedConfig();
  const next: ExtendedStudioConfig = {
    ...current,
    ...patch,
  };
  memoryExtendedConfig = next;

  if (supabase) {
    try {
      await ensureStudioBucket();
      await supabase.storage
        .from('studio-media')
        .upload('config/studio-config.json', Buffer.from(JSON.stringify(next, null, 2)), {
          contentType: 'application/json',
          upsert: true,
        });
    } catch {
      // Non-fatal fallback to memory
    }
  }
  return next;
}

function recordChatLog(entry: ChatLogEntry) {
  chatLogs.unshift(entry);
  if (chatLogs.length > 40) chatLogs.length = 40;
}

function mapDbSettingsToApp(row: Record<string, any>, ext?: ExtendedStudioConfig) {
  const cfg = ext ?? memoryExtendedConfig;
  return {
    storeName: row.store_name,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    currency: row.currency,
    freeShippingThreshold: Number(row.free_shipping_threshold),
    defaultShippingFee: Number(row.default_shipping_fee),
    announcementText: row.announcement_text,
    logoUrl: row.logo_url ?? cfg.logoUrl ?? '',
    chatbotEnabled: row.chatbot_enabled !== undefined ? Boolean(row.chatbot_enabled) : cfg.chatbotEnabled,
    openrouterModel: row.openrouter_model || cfg.openrouterModel || 'openai/gpt-4o-mini',
    hasOpenrouterKey: Boolean(cfg.openrouterApiKey),
    openrouterKeyMasked: maskApiKey(cfg.openrouterApiKey),
  };
}

async function checkSupabaseTables() {
  const diagnostics = {
    hasUrl: Boolean(supabaseUrl),
    hasKey: Boolean(supabaseSecretKey),
    hasDatabaseUrl: Boolean(resolvedDbUrl.value),
    urlSource: resolvedUrl.source ?? null,
    keySource: resolvedKey.source ?? null,
    vercel: process.env.VERCEL === '1',
  };

  if (!supabase) {
    let reason: string | undefined;
    if (supabaseInitError) {
      reason = supabaseInitError;
    } else if (!supabaseUrl && !supabaseSecretKey && diagnostics.hasDatabaseUrl) {
      reason = 'Found DATABASE_URL, but SUPABASE_URL and SUPABASE_SECRET_KEY are missing';
    } else if (supabaseUrl && !supabaseSecretKey) {
      reason = 'Found Supabase URL, but SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) is missing';
    } else if (!supabaseUrl && supabaseSecretKey) {
      reason = 'Found Supabase key, but SUPABASE_URL is missing';
    }
    return {
      configured: false,
      tablesReady: false,
      missingTables: [...REQUIRED_TABLES],
      error: reason,
      diagnostics,
    };
  }

  const missingTables: string[] = [];
  for (const table of REQUIRED_TABLES) {
    const { error } = await supabase.from(table).select('id').limit(1);
    if (error) {
      if (error.code === 'PGRST205' || error.code === '42P01' || error.message?.includes('schema cache')) {
        missingTables.push(table);
      } else {
        return {
          configured: true,
          tablesReady: false,
          missingTables: [],
          error: error.message || 'Supabase query failed (verify URL and secret/service-role key)',
          diagnostics,
        };
      }
    }
  }
  return {
    configured: true,
    tablesReady: missingTables.length === 0,
    missingTables,
    diagnostics,
  };
}

export function createApp() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use((req, _res, next) => {
    if (process.env.VERCEL === '1' && !req.url.startsWith('/api/')) {
      req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
    }
    next();
  });

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      supabaseConfigured: Boolean(supabase),
      hasSupabaseUrl: Boolean(supabaseUrl),
      hasSupabaseSecretKey: Boolean(supabaseSecretKey),
      hasDatabaseUrl: Boolean(resolvedDbUrl.value),
      urlSource: resolvedUrl.source ?? null,
      keySource: resolvedKey.source ?? null,
      vercel: process.env.VERCEL === '1',
    });
  });

  app.get('/api/supabase/status', async (_req, res) => {
    try {
      const status = await checkSupabaseTables();
      res.json(status);
    } catch (err: any) {
      res.json({
        configured: Boolean(supabase),
        tablesReady: false,
        missingTables: [...REQUIRED_TABLES],
        error: err?.message || 'Unable to verify Supabase connection',
      });
    }
  });

  app.get('/api/bootstrap', async (_req, res) => {
    if (!supabase) {
      return res.json({ synced: false, reason: 'not_configured' });
    }
    try {
      const status = await checkSupabaseTables();
      if (!status.tablesReady) {
        return res.json({ synced: false, reason: 'tables_missing', missingTables: status.missingTables });
      }

      const [categoriesRes, productsRes, ordersRes, commissionsRes, couponsRes, settingsRes, extCfg] =
        await Promise.all([
          supabase.from('categories').select('*').order('created_at', { ascending: true }),
          supabase.from('products').select('*').order('created_at', { ascending: false }),
          supabase.from('orders').select('*').order('created_at', { ascending: false }),
          supabase.from('commissions').select('*').order('submitted_at', { ascending: false }),
          supabase.from('coupons').select('*').order('created_at', { ascending: true }),
          supabase.from('store_settings').select('*').eq('id', 'default').maybeSingle(),
          loadExtendedConfig(),
        ]);

      res.json({
        synced: true,
        categories: (categoriesRes.data ?? []).map(mapDbCategoryToApp),
        products: (productsRes.data ?? []).map(mapDbProductToApp),
        orders: (ordersRes.data ?? []).map(mapDbOrderToApp),
        commissions: (commissionsRes.data ?? []).map(mapDbCommissionToApp),
        coupons: (couponsRes.data ?? []).map(mapDbCouponToApp),
        settings: settingsRes.data
          ? mapDbSettingsToApp(settingsRes.data, extCfg)
          : {
              storeName: 'varniks_atelier',
              contactEmail: 'hello@varniksatelier.studio',
              contactPhone: '+91 98204 51120',
              currency: 'INR',
              freeShippingThreshold: 999,
              defaultShippingFee: 95,
              announcementText: 'Handmade • Heartmade • Heartfelt — Free shipping on orders above ₹999',
              logoUrl: extCfg.logoUrl || '',
              chatbotEnabled: extCfg.chatbotEnabled,
              openrouterModel: extCfg.openrouterModel,
              hasOpenrouterKey: Boolean(extCfg.openrouterApiKey),
              openrouterKeyMasked: maskApiKey(extCfg.openrouterApiKey),
            },
      });
    } catch (err: any) {
      res.status(500).json({ synced: false, error: err?.message || 'Supabase bootstrap failed' });
    }
  });

  // Categories CRUD
  app.post('/api/categories', async (req, res) => {
    if (!supabase) return res.json({ synced: false });
    try {
      const c = req.body;
      const { error } = await supabase.from('categories').upsert({
        id: c.id,
        slug: c.slug,
        label: c.label,
        subtitle: c.subtitle ?? '',
        is_default: Boolean(c.isDefault),
      });
      if (error) return res.status(400).json({ synced: false, error: error.message });
      return res.json({ synced: true });
    } catch (err: any) {
      return res.status(500).json({ synced: false, error: err?.message });
    }
  });

  app.delete('/api/categories/:id', async (req, res) => {
    if (!supabase) return res.json({ synced: false });
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .or(`id.eq.${req.params.id},slug.eq.${req.params.id}`);
      if (error) return res.status(400).json({ synced: false, error: error.message });
      return res.json({ synced: true });
    } catch (err: any) {
      return res.status(500).json({ synced: false, error: err?.message });
    }
  });

  // Upload Photo to Supabase Storage (bucket: studio-media)
  app.post('/api/uploads/photo', async (req, res) => {
    if (!supabase) {
      return res.json({ ok: false, reason: 'supabase_not_configured' });
    }
    try {
      const { fileName, dataUrl, folder } = req.body as {
        fileName?: string;
        dataUrl?: string;
        folder?: string;
      };
      if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
        return res.status(400).json({ ok: false, error: 'Invalid image payload' });
      }

      const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
      if (!match) {
        return res.status(400).json({ ok: false, error: 'Malformed base64 image' });
      }
      const mimeType = match[1];
      const buffer = Buffer.from(match[2], 'base64');
      const ext = mimeType.split('/')[1]?.replace(/[^a-z0-9]/gi, '') || 'jpg';
      const safeName = (fileName || 'photo')
        .replace(/\.[^.]+$/, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, 40);
      const safeFolder = folder === 'products' ? 'products' : 'custom-orders';
      const objectPath = `${safeFolder}/${Date.now()}-${safeName || 'upload'}.${ext}`;

      const bucketName = 'studio-media';
      const { data: buckets } = await supabase.storage.listBuckets();
      if (!buckets?.some((b) => b.name === bucketName)) {
        await supabase.storage.createBucket(bucketName, { public: true });
      }

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(objectPath, buffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (uploadError) {
        return res.status(400).json({ ok: false, error: uploadError.message });
      }

      const { data: publicData } = supabase.storage.from(bucketName).getPublicUrl(objectPath);
      return res.json({ ok: true, url: publicData.publicUrl, path: objectPath });
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: err?.message || 'Upload failed' });
    }
  });

  // Seed initial products when empty
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

  async function ensureUniqueProductSlug(desiredSlug: string, currentId: string): Promise<string> {
    if (!supabase) return desiredSlug;
    const clean = desiredSlug || `creation-${currentId.slice(-4)}`;
    const { data: conflict } = await supabase
      .from('products')
      .select('id')
      .eq('slug', clean)
      .neq('id', currentId)
      .limit(1);
    if (conflict && conflict.length > 0) {
      return `${clean}-${currentId.slice(-4)}`;
    }
    return clean;
  }

  // Products CRUD
  app.post('/api/products', async (req, res) => {
    if (!supabase) return res.json({ synced: false });
    try {
      const row = mapAppProductToDb(req.body);
      row.slug = await ensureUniqueProductSlug(row.slug, row.id);
      const { data, error } = await supabase
        .from('products')
        .upsert(row, { onConflict: 'id' })
        .select()
        .single();
      if (error) return res.status(400).json({ synced: false, error: error.message });
      return res.json({ synced: true, product: data ? mapDbProductToApp(data) : undefined });
    } catch (err: any) {
      return res.status(500).json({ synced: false, error: err?.message });
    }
  });

  app.put('/api/products/:id', async (req, res) => {
    if (!supabase) return res.json({ synced: false });
    try {
      const targetId = req.params.id;
      const row = mapAppProductToDb({ ...req.body, id: targetId });
      row.slug = await ensureUniqueProductSlug(row.slug, targetId);

      // Try explicit UPDATE first, and if product wasn't in DB yet, UPSERT it
      const { data: updatedRows, error: updateError } = await supabase
        .from('products')
        .update(row)
        .eq('id', targetId)
        .select();

      if (updateError) {
        return res.status(400).json({ synced: false, error: updateError.message });
      }

      if (!updatedRows || updatedRows.length === 0) {
        const { data: upserted, error: upsertError } = await supabase
          .from('products')
          .upsert(row, { onConflict: 'id' })
          .select()
          .single();
        if (upsertError) {
          return res.status(400).json({ synced: false, error: upsertError.message });
        }
        return res.json({ synced: true, product: upserted ? mapDbProductToApp(upserted) : undefined });
      }

      return res.json({ synced: true, product: mapDbProductToApp(updatedRows[0]) });
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

  // Custom Order Requests / Commissions
  app.post('/api/commissions', async (req, res) => {
    if (!supabase) return res.json({ synced: false });
    try {
      const row = mapAppCommissionToDb(req.body);
      const { error } = await supabase.from('commissions').upsert(row, { onConflict: 'id' });
      if (error) return res.status(400).json({ synced: false, error: error.message });
      return res.json({ synced: true });
    } catch (err: any) {
      return res.status(500).json({ synced: false, error: err?.message });
    }
  });

  app.put('/api/commissions/:id', async (req, res) => {
    if (!supabase) return res.json({ synced: false });
    try {
      const row = mapAppCommissionToDb({ ...req.body, id: req.params.id });
      const { error } = await supabase.from('commissions').upsert(row, { onConflict: 'id' });
      if (error) return res.status(400).json({ synced: false, error: error.message });
      return res.json({ synced: true });
    } catch (err: any) {
      return res.status(500).json({ synced: false, error: err?.message });
    }
  });

  app.patch('/api/commissions/:id', async (req, res) => {
    if (!supabase) return res.json({ synced: false });
    try {
      const { status, quotedPrice, internalNotes, adminApproved, customerApproved, orderCreated, linkedOrderId } = req.body;
      const patch: Record<string, any> = {};
      if (status !== undefined) patch.status = status;
      if (quotedPrice !== undefined) patch.quoted_price = quotedPrice;
      if (internalNotes !== undefined) patch.internal_notes = internalNotes;
      if (adminApproved !== undefined) patch.admin_approved = adminApproved;
      if (customerApproved !== undefined) patch.customer_approved = customerApproved;
      if (orderCreated !== undefined) patch.order_created = orderCreated;
      if (linkedOrderId !== undefined) patch.linked_order_id = linkedOrderId;
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

  // Store Settings (including custom Logo URL & OpenRouter key stored server-side)
  app.put('/api/settings', async (req, res) => {
    try {
      const s = req.body as Record<string, any>;
      const extPatch: Partial<ExtendedStudioConfig> = {};
      if (s.logoUrl !== undefined) extPatch.logoUrl = String(s.logoUrl || '');
      if (s.chatbotEnabled !== undefined) extPatch.chatbotEnabled = Boolean(s.chatbotEnabled);
      if (s.openrouterModel !== undefined) {
        extPatch.openrouterModel = String(s.openrouterModel || 'openai/gpt-4o-mini').trim();
      }
      if (typeof s.openrouterApiKey === 'string') {
        if (s.openrouterApiKey === '__CLEAR__') {
          extPatch.openrouterApiKey = '';
        } else if (s.openrouterApiKey.trim()) {
          extPatch.openrouterApiKey = s.openrouterApiKey.trim();
        }
      }

      const savedExt = await saveExtendedConfig(extPatch);

      if (!supabase) {
        return res.json({
          synced: false,
          hasOpenrouterKey: Boolean(savedExt.openrouterApiKey),
          openrouterKeyMasked: maskApiKey(savedExt.openrouterApiKey),
          logoUrl: savedExt.logoUrl,
        });
      }

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

      return res.json({
        synced: true,
        hasOpenrouterKey: Boolean(savedExt.openrouterApiKey),
        openrouterKeyMasked: maskApiKey(savedExt.openrouterApiKey),
        logoUrl: savedExt.logoUrl,
      });
    } catch (err: any) {
      return res.status(500).json({ synced: false, error: err?.message });
    }
  });

  // OpenRouter Studio Chatbot Proxy + Admin Logs
  app.get('/api/chat/logs', async (_req, res) => {
    const ext = await loadExtendedConfig();
    res.json({
      hasOpenrouterKey: Boolean(ext.openrouterApiKey),
      openrouterKeyMasked: maskApiKey(ext.openrouterApiKey),
      openrouterModel: ext.openrouterModel,
      chatbotEnabled: ext.chatbotEnabled,
      logs: chatLogs,
    });
  });

  app.post('/api/chat/test', async (_req, res) => {
    const started = Date.now();
    const ext = await loadExtendedConfig();
    if (!ext.openrouterApiKey) {
      return res.status(400).json({ ok: false, error: 'No OpenRouter API key configured yet.' });
    }
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ext.openrouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
          'X-Title': 'varniks_atelier Studio Assistant',
        },
        body: JSON.stringify({
          model: ext.openrouterModel || 'openai/gpt-4o-mini',
          messages: [
            { role: 'system', content: 'Reply in one warm sentence as Varni, studio companion.' },
            { role: 'user', content: 'Say hello to the studio owner!' },
          ],
          max_tokens: 80,
        }),
      });
      const json = await response.json().catch(() => ({}));
      const latencyMs = Date.now() - started;
      if (!response.ok) {
        const msg = json?.error?.message || `OpenRouter HTTP ${response.status}`;
        recordChatLog({
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          model: ext.openrouterModel,
          userMessage: '[Admin Connection Test]',
          replyPreview: msg,
          status: 'error',
          latencyMs,
          errorDetail: msg,
        });
        return res.status(400).json({ ok: false, error: msg });
      }
      const reply = json?.choices?.[0]?.message?.content || 'Connected to OpenRouter cleanly!';
      recordChatLog({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        model: ext.openrouterModel,
        userMessage: '[Admin Connection Test]',
        replyPreview: reply.slice(0, 120),
        status: 'ok',
        latencyMs,
      });
      return res.json({ ok: true, reply, model: ext.openrouterModel, latencyMs });
    } catch (err: any) {
      const latencyMs = Date.now() - started;
      return res.status(500).json({ ok: false, error: err?.message || 'Connection test failed', latencyMs });
    }
  });

  app.post('/api/chat', async (req, res) => {
    const started = Date.now();
    const ext = await loadExtendedConfig();
    const { messages, catalogSummary } = req.body as {
      messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
      catalogSummary?: string;
    };

    const userMsgList = Array.isArray(messages) ? messages.slice(-10) : [];
    const latestUserText = userMsgList[userMsgList.length - 1]?.content ?? '';

    const systemPrompt = `You are Varni, the cute, warm, helpful handmade studio companion for varniks_atelier ("Handmade • Heartmade • Heartfelt — Crafted with thought, gifted with heart.").
Help visitors pick gifts across our 7 categories: Resin Creations, Clay & Pipe Cleaner Creations, Frames & LED Frames, Paper & Photo Keepsakes, Textile Art & Embroidery, Personalized Accessories, and Art & Portraits.
Explain our Custom Orders workflow clearly:
1) Go to Custom Orders, pick a craft category, write a custom idea, upload a reference photo, and select a predicted price range or enter a custom price budget.
2) Studio Admin reviews and approves the request in the Waiting List.
3) Customer clicks Approve & Order and completes shipping address + payment method to create the continuous order!
Shipping is complimentary on orders above ₹999 (₹95 flat below ₹999). Be friendly, concise, helpful, and avoid inventing fake order statuses.
${catalogSummary ? `\nLive studio creations:\n${catalogSummary}` : ''}`;

    if (!ext.openrouterApiKey) {
      const lower = latestUserText.toLowerCase();
      let reply =
        'Hello from varniks_atelier! I can help you explore Resin Creations, LED Memory Frames, Pipe Cleaner Bouquets, Paper Keepsakes, Embroidery Hoops, Personalized Accessories, and Art Portraits. Ask me about gift ideas, prices, or Custom Orders!';
      if (lower.includes('custom')) {
        reply =
          'For a Custom Order, head to our Custom Orders page, choose a craft category, share your idea + upload a reference photo, and pick a price estimate or enter your own budget. Once our studio admin approves it, you can complete your delivery address and payment method right at checkout!';
      } else if (lower.includes('ship') || lower.includes('deliver')) {
        reply =
          'Orders ship within 2–5 business days with insured tracking. Delivery is complimentary across India on orders ₹999+ (otherwise a flat ₹95 packing & courier fee applies).';
      } else if (lower.includes('price') || lower.includes('under') || lower.includes('gift')) {
        reply =
          'We have thoughtful handmade keepsakes starting from ₹599–₹999 (personalized charms, pocket keepsakes) up to ₹1,299–₹2,999+ (botanical resin trays, glowing LED photo frames, and custom bouquets).';
      }
      const latencyMs = Date.now() - started;
      recordChatLog({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        model: 'studio-fallback (no OpenRouter key)',
        userMessage: latestUserText.slice(0, 80),
        replyPreview: reply.slice(0, 110),
        status: 'fallback',
        latencyMs,
      });
      return res.json({ ok: true, reply, provider: 'studio-guide' });
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${ext.openrouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
          'X-Title': 'varniks_atelier Studio Assistant',
        },
        body: JSON.stringify({
          model: ext.openrouterModel || 'openai/gpt-4o-mini',
          messages: [{ role: 'system', content: systemPrompt }, ...userMsgList],
          max_tokens: 350,
          temperature: 0.7,
        }),
      });
      const json = await response.json().catch(() => ({}));
      const latencyMs = Date.now() - started;

      if (!response.ok) {
        const errMsg = json?.error?.message || `OpenRouter HTTP ${response.status}`;
        recordChatLog({
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          model: ext.openrouterModel,
          userMessage: latestUserText.slice(0, 80),
          replyPreview: errMsg.slice(0, 110),
          status: 'error',
          latencyMs,
          errorDetail: errMsg,
        });
        return res.status(502).json({ ok: false, error: errMsg });
      }

      const reply =
        json?.choices?.[0]?.message?.content?.trim() ||
        'I would love to help you find something handmade at varniks_atelier!';
      recordChatLog({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        model: json?.model || ext.openrouterModel,
        userMessage: latestUserText.slice(0, 80),
        replyPreview: reply.slice(0, 110),
        status: 'ok',
        latencyMs,
      });
      return res.json({ ok: true, reply, provider: 'openrouter', model: json?.model || ext.openrouterModel });
    } catch (err: any) {
      const latencyMs = Date.now() - started;
      recordChatLog({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        model: ext.openrouterModel,
        userMessage: latestUserText.slice(0, 80),
        replyPreview: err?.message || 'Network error',
        status: 'error',
        latencyMs,
        errorDetail: err?.message,
      });
      return res.status(500).json({ ok: false, error: err?.message || 'Chat request failed' });
    }
  });

  return app;
}

async function startServer() {
  const app = createApp();

  if (process.env.NODE_ENV !== 'production') {
    const vitePkg = ['vi', 'te'].join('');
    const { createServer: createViteServer } = await import(/* @vite-ignore */ vitePkg);
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

if (process.env.VERCEL !== '1') {
  startServer();
}
