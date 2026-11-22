import 'dotenv/config';
import express from 'express';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT =
  process.env.NODE_ENV === 'production' ? Number(process.env.PORT || 3000) : 3000;

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

// Strictly public anon/publishable key for browser Supabase Google OAuth (never secret/service-role keys)
const resolvedPublicAnonKey = pickEnvVar([
  'SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'VITE_SUPABASE_ANON_KEY',
  'SUPABASE_PUBLISHABLE_KEY',
  'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  'VITE_SUPABASE_PUBLISHABLE_KEY',
  'SUPERBASE_ANON_KEY',
]);

const resolvedDbUrl = pickEnvVar(['DATABASE_URL', 'POSTGRES_URL', 'POSTGRES_PRISMA_URL']);

const supabaseUrl = resolvedUrl.value;
const supabaseSecretKey = resolvedKey.value;
const supabasePublicAnonKey =
  resolvedPublicAnonKey.value &&
  !resolvedPublicAnonKey.value.startsWith('sb_secret_') &&
  resolvedPublicAnonKey.value !== process.env.SUPABASE_SECRET_KEY &&
  resolvedPublicAnonKey.value !== process.env.SUPABASE_SERVICE_ROLE_KEY
    ? resolvedPublicAnonKey.value
    : '';

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
  razorpayKeyId: string;
  razorpayKeySecret: string;
  studioOriginState: string;
  shippingZones?: Array<{
    id: string;
    name: string;
    description: string;
    fee: number;
    eta: string;
    states?: string[];
  }>;
  freeShippingCoupons?: Array<{
    id: string;
    code: string;
    discountType: 'free_shipping';
    discountValue: number;
    minimumOrder: number;
    isActive: boolean;
    autoApply?: boolean;
    expiresAt?: string;
  }>;
  gaMeasurementId: string;
  googleSiteVerification: string;
  adminPinHash?: string;
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
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
  studioOriginState: 'Maharashtra',
  freeShippingCoupons: [
    {
      id: 'coup-freeship-1000',
      code: 'FREESHIP1000',
      discountType: 'free_shipping',
      discountValue: 100,
      minimumOrder: 1000,
      isActive: true,
      autoApply: true,
    },
  ],
  gaMeasurementId: process.env.GA_MEASUREMENT_ID || process.env.VITE_GA_MEASUREMENT_ID || '',
  googleSiteVerification: process.env.GOOGLE_SITE_VERIFICATION || '',
};

let memoryExtendedConfig: ExtendedStudioConfig = { ...DEFAULT_EXTENDED_CONFIG };
const chatLogs: ChatLogEntry[] = [];

function getEffectiveRazorpayCredentials(cfg: ExtendedStudioConfig): {
  keyId: string;
  keySecret: string;
  mode: 'live' | 'test' | 'unconfigured';
} {
  const keyId = (cfg.razorpayKeyId || process.env.RAZORPAY_KEY_ID || '').trim();
  const keySecret = (cfg.razorpayKeySecret || process.env.RAZORPAY_KEY_SECRET || '').trim();
  const configured = Boolean(keyId && keySecret);
  const mode: 'live' | 'test' | 'unconfigured' = !configured
    ? 'unconfigured'
    : keyId.startsWith('rzp_live_')
      ? 'live'
      : 'test';
  return { keyId, keySecret, mode };
}

function maskApiKey(key: string): string {
  const clean = key.trim();
  if (!clean) return '';
  if (clean.length <= 10) return '••••••';
  return `${clean.slice(0, 7)}••••${clean.slice(-4)}`;
}

// Admin allowlist & salted scrypt PIN / recovery verification (strictly server-side)
const DEFAULT_ADMIN_EMAILS = [
  'seelamvamsisivaganesh@gmail.com',
  'seelamharshi27@gmail.com',
];

const DEFAULT_ADMIN_PIN_SCRYPT =
  'scrypt$561ec8b3c3d06208a625cc168f1415ba$318670eea130f144dafe03ee59c037318b516fed9034746a7241d281a53e7a0c';
const DEFAULT_ADMIN_PET_SCRYPT =
  'scrypt$7efe5ba566eaa194e435389e84c165c1$3c9d767ad32002d7908f15c27c0d2ca294b0903db158fb02a669e707927bba45';

const ADMIN_TOKEN_SIGNING_KEY =
  process.env.ADMIN_SESSION_SECRET || crypto.randomBytes(32).toString('hex');

const pinRateLimiter = new Map<string, { attempts: number; resetAt: number }>();

function getAllowedAdminEmails(): Set<string> {
  const allowed = new Set<string>(DEFAULT_ADMIN_EMAILS);
  const rawList = [process.env.ADMIN_EMAILS || '', process.env.STUDIO_OWNER_EMAIL || '']
    .join(',')
    .split(',');
  for (const entry of rawList) {
    const cleaned = entry.trim().toLowerCase();
    if (cleaned) allowed.add(cleaned);
  }
  return allowed;
}

function isAllowedAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return getAllowedAdminEmails().has(email.trim().toLowerCase());
}

function hashAdminSecret(plain: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(plain, salt, 32).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

function verifyScryptHash(plain: string, stored: string): boolean {
  const parts = stored.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const [, salt, expectedHex] = parts;
  if (!salt || !expectedHex) return false;
  try {
    const derived = crypto.scryptSync(plain, salt, 32);
    const expected = Buffer.from(expectedHex, 'hex');
    return derived.length === expected.length && crypto.timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

function constantTimeEquals(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

function checkPinRateLimit(ip: string): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const entry = pinRateLimiter.get(ip);
  if (!entry || now > entry.resetAt) {
    pinRateLimiter.set(ip, { attempts: 0, resetAt: now + 10 * 60 * 1000 });
    return { allowed: true };
  }
  if (entry.attempts >= 10) {
    return { allowed: false, retryAfterSec: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)) };
  }
  return { allowed: true };
}

function recordPinFailure(ip: string): void {
  const now = Date.now();
  const entry = pinRateLimiter.get(ip);
  if (!entry || now > entry.resetAt) {
    pinRateLimiter.set(ip, { attempts: 1, resetAt: now + 10 * 60 * 1000 });
  } else {
    entry.attempts += 1;
  }
}

function clearPinFailures(ip: string): void {
  pinRateLimiter.delete(ip);
}

function issueAdminUnlockToken(email: string): string {
  const payload = Buffer.from(
    JSON.stringify({ email: email.trim().toLowerCase(), iat: Date.now() })
  ).toString('base64url');
  const sig = crypto
    .createHmac('sha256', ADMIN_TOKEN_SIGNING_KEY)
    .update(payload)
    .digest('base64url');
  return `${payload}.${sig}`;
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
  const rzp = getEffectiveRazorpayCredentials(cfg);
  return {
    storeName: row.store_name,
    contactEmail: row.contact_email,
    contactPhone: row.contact_phone,
    currency: row.currency,
    freeShippingThreshold: Number(row.free_shipping_threshold ?? 1000),
    defaultShippingFee: Number(row.default_shipping_fee ?? 99),
    announcementText: row.announcement_text,
    logoUrl: row.logo_url ?? cfg.logoUrl ?? '',
    chatbotEnabled: row.chatbot_enabled !== undefined ? Boolean(row.chatbot_enabled) : cfg.chatbotEnabled,
    openrouterModel: row.openrouter_model || cfg.openrouterModel || 'openai/gpt-4o-mini',
    hasOpenrouterKey: Boolean(cfg.openrouterApiKey),
    openrouterKeyMasked: maskApiKey(cfg.openrouterApiKey),
    studioOriginState: cfg.studioOriginState || 'Maharashtra',
    shippingZones: Array.isArray(cfg.shippingZones) ? cfg.shippingZones : undefined,
    razorpayKeyId: rzp.keyId,
    hasRazorpayKey: Boolean(rzp.keyId && rzp.keySecret),
    razorpaySecretMasked: maskApiKey(rzp.keySecret),
    razorpayMode: rzp.mode,
    gaMeasurementId: cfg.gaMeasurementId || process.env.GA_MEASUREMENT_ID || '',
    googleSiteVerification: cfg.googleSiteVerification || process.env.GOOGLE_SITE_VERIFICATION || '',
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
      hasSupabaseAnonKey: Boolean(supabasePublicAnonKey),
      hasDatabaseUrl: Boolean(resolvedDbUrl.value),
      urlSource: resolvedUrl.source ?? null,
      keySource: resolvedKey.source ?? null,
      vercel: process.env.VERCEL === '1',
    });
  });

  // Public auth config for Supabase Google OAuth in the browser (never exposes secret/service keys)
  app.get('/api/auth/config', (_req, res) => {
    res.json({
      url: supabaseUrl,
      anonKey: supabasePublicAnonKey,
      googleAuthEnabled: Boolean(supabaseUrl && supabasePublicAnonKey),
    });
  });

  // Verify Supabase Auth JWT from browser and sync user into studio_users
  app.post('/api/auth/supabase-sync', async (req, res) => {
    const authHeader = String(req.headers.authorization || '');
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (!token) {
      return res.status(401).json({ ok: false, error: 'Missing authentication token.' });
    }
    if (!supabase) {
      return res.status(503).json({ ok: false, error: 'Supabase is not configured on the server.' });
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser(token);
      if (authError || !authData?.user) {
        return res.status(401).json({ ok: false, error: authError?.message || 'Invalid Supabase session token.' });
      }

      const authUser = authData.user;
      const email = (authUser.email || '').trim().toLowerCase();
      if (!email) {
        return res.status(400).json({ ok: false, error: 'Google account did not provide an email address.' });
      }

      const meta = (authUser.user_metadata || {}) as Record<string, any>;
      const fullName =
        String(meta.full_name || meta.name || email.split('@')[0] || 'Studio Collector').trim();
      const phone = String(authUser.phone || meta.phone || '').trim();
      const joinedAt = authUser.created_at
        ? String(authUser.created_at).slice(0, 10)
        : new Date().toISOString().split('T')[0];

      // Determine role strictly on server (never trust client-supplied role)
      let role: 'customer' | 'owner' = isAllowedAdminEmail(email) ? 'owner' : 'customer';

      try {
        const { data: existing } = await supabase
          .from('studio_users')
          .select('id, role, phone, full_name')
          .eq('email', email)
          .maybeSingle();

        if (existing?.role === 'owner') {
          role = 'owner';
        }

        const userId = existing?.id || `sb-${authUser.id}`;
        const finalPhone = phone || existing?.phone || '';
        const finalName = fullName || existing?.full_name || 'Studio Collector';

        await supabase.from('studio_users').upsert(
          {
            id: userId,
            full_name: finalName,
            email,
            phone: finalPhone,
            role,
            joined_at: joinedAt,
          },
          { onConflict: 'email' }
        );

        return res.json({
          ok: true,
          user: {
            id: userId,
            fullName: finalName,
            email,
            phone: finalPhone,
            joinedAt,
            role,
          },
        });
      } catch {
        // Fallback if studio_users table hasn't been created yet — user is still verified by Supabase Auth
        return res.json({
          ok: true,
          user: {
            id: `sb-${authUser.id}`,
            fullName,
            email,
            phone,
            joinedAt,
            role,
          },
        });
      }
    } catch (err: any) {
      return res.status(500).json({ ok: false, error: err?.message || 'Failed to verify Google login.' });
    }
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

      const dbCoupons = (couponsRes.data ?? []).map(mapDbCouponToApp);
      const extraFreeShipCoupons = Array.isArray(extCfg.freeShippingCoupons)
        ? extCfg.freeShippingCoupons
        : [];
      const seenCodes = new Set(dbCoupons.map((c) => String(c.code).toUpperCase()));
      const mergedCoupons = [
        ...dbCoupons,
        ...extraFreeShipCoupons.filter((c) => !seenCodes.has(String(c.code).toUpperCase())),
      ];
      const rzp = getEffectiveRazorpayCredentials(extCfg);

      res.json({
        synced: true,
        categories: (categoriesRes.data ?? []).map(mapDbCategoryToApp),
        products: (productsRes.data ?? []).map(mapDbProductToApp),
        orders: (ordersRes.data ?? []).map(mapDbOrderToApp),
        commissions: (commissionsRes.data ?? []).map(mapDbCommissionToApp),
        coupons: mergedCoupons,
        settings: settingsRes.data
          ? mapDbSettingsToApp(settingsRes.data, extCfg)
          : {
              storeName: 'varniks_atelier',
              contactEmail: 'hello@varniksatelier.studio',
              contactPhone: '+91 98204 51120',
              currency: 'INR',
              freeShippingThreshold: 1000,
              defaultShippingFee: 99,
              announcementText:
                'Handmade • Heartmade • Heartfelt — Free delivery on orders above ₹1,000 (Code: FREESHIP1000)',
              logoUrl: extCfg.logoUrl || '',
              chatbotEnabled: extCfg.chatbotEnabled,
              openrouterModel: extCfg.openrouterModel,
              hasOpenrouterKey: Boolean(extCfg.openrouterApiKey),
              openrouterKeyMasked: maskApiKey(extCfg.openrouterApiKey),
              studioOriginState: extCfg.studioOriginState || 'Maharashtra',
              shippingZones: extCfg.shippingZones,
              razorpayKeyId: rzp.keyId,
              hasRazorpayKey: Boolean(rzp.keyId && rzp.keySecret),
              razorpaySecretMasked: maskApiKey(rzp.keySecret),
              razorpayMode: rzp.mode,
              gaMeasurementId: extCfg.gaMeasurementId || '',
              googleSiteVerification: extCfg.googleSiteVerification || '',
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
    const body = (req.body && typeof req.body === 'object' ? req.body : {}) as Record<string, any>;
    const customerId = String(body.customerId || '').trim();
    const customerEmail = String(body.customerEmail || '').trim();
    const addr = body.shippingAddress as Record<string, any> | undefined;

    if (!customerId || customerId === 'guest') {
      return res.status(401).json({
        synced: false,
        error: 'Login is required before placing or confirming an order.',
      });
    }

    if (
      !customerEmail ||
      !addr ||
      !String(addr.fullName || '').trim() ||
      !String(addr.phone || '').trim() ||
      !String(addr.addressLine || '').trim() ||
      !String(addr.city || '').trim() ||
      !String(addr.state || '').trim() ||
      !String(addr.postalCode || '').trim()
    ) {
      return res.status(400).json({
        synced: false,
        error: 'Complete shipping address, phone number, and email are required before confirming an order.',
      });
    }

    if (!supabase) return res.json({ synced: false });
    try {
      const row = mapAppOrderToDb(body);
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

  // Coupons (persists percentage/fixed in Supabase table & free_shipping coupons in extended studio config)
  app.put('/api/coupons', async (req, res) => {
    try {
      const coupons = Array.isArray(req.body?.coupons) ? req.body.coupons : [];
      const freeShipCoupons = coupons
        .filter((c: any) => c.discountType === 'free_shipping')
        .map((c: any) => ({
          id: String(c.id || `coup-fs-${Date.now()}`),
          code: String(c.code).toUpperCase(),
          discountType: 'free_shipping' as const,
          discountValue: Number(c.discountValue || 100),
          minimumOrder: Number(c.minimumOrder ?? 1000),
          isActive: Boolean(c.isActive),
          autoApply: Boolean(c.autoApply),
          expiresAt: c.expiresAt || undefined,
        }));

      await saveExtendedConfig({ freeShippingCoupons: freeShipCoupons });

      if (!supabase) return res.json({ synced: false });

      const standardCoupons = coupons.filter((c: any) => c.discountType !== 'free_shipping');
      await supabase.from('coupons').delete().neq('id', '__none__');
      if (standardCoupons.length > 0) {
        const rows = standardCoupons.map((c: any) => ({
          id: c.id,
          code: String(c.code).toUpperCase(),
          discount_type: c.discountType === 'fixed' ? 'fixed' : 'percentage',
          discount_value: Math.max(1, Number(c.discountValue || 1)),
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

  // Store Settings (including custom Logo, OpenRouter, Razorpay Live Keys, Shipping Zones & GA4/SEO)
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
      if (typeof s.razorpayKeyId === 'string') {
        extPatch.razorpayKeyId = s.razorpayKeyId.trim();
      }
      if (typeof s.razorpayKeySecret === 'string') {
        if (s.razorpayKeySecret === '__CLEAR__') {
          extPatch.razorpayKeySecret = '';
        } else if (s.razorpayKeySecret.trim()) {
          extPatch.razorpayKeySecret = s.razorpayKeySecret.trim();
        }
      }
      if (typeof s.studioOriginState === 'string' && s.studioOriginState.trim()) {
        extPatch.studioOriginState = s.studioOriginState.trim();
      }
      if (Array.isArray(s.shippingZones)) {
        extPatch.shippingZones = s.shippingZones.map((z: any) => ({
          id: String(z.id || ''),
          name: String(z.name || ''),
          description: String(z.description || ''),
          fee: Math.max(0, Number(z.fee || 0)),
          eta: String(z.eta || ''),
          states: Array.isArray(z.states) ? z.states.map(String) : undefined,
        }));
      }
      if (typeof s.gaMeasurementId === 'string') {
        extPatch.gaMeasurementId = s.gaMeasurementId.trim();
      }
      if (typeof s.googleSiteVerification === 'string') {
        extPatch.googleSiteVerification = s.googleSiteVerification.trim();
      }

      const savedExt = await saveExtendedConfig(extPatch);
      const rzp = getEffectiveRazorpayCredentials(savedExt);

      const safeSummary = {
        hasOpenrouterKey: Boolean(savedExt.openrouterApiKey),
        openrouterKeyMasked: maskApiKey(savedExt.openrouterApiKey),
        logoUrl: savedExt.logoUrl,
        razorpayKeyId: rzp.keyId,
        hasRazorpayKey: Boolean(rzp.keyId && rzp.keySecret),
        razorpaySecretMasked: maskApiKey(rzp.keySecret),
        razorpayMode: rzp.mode,
        studioOriginState: savedExt.studioOriginState,
        shippingZones: savedExt.shippingZones,
        gaMeasurementId: savedExt.gaMeasurementId,
        googleSiteVerification: savedExt.googleSiteVerification,
      };

      if (!supabase) {
        return res.json({ synced: false, ...safeSummary });
      }

      const { error } = await supabase.from('store_settings').upsert({
        id: 'default',
        store_name: s.storeName,
        contact_email: s.contactEmail,
        contact_phone: s.contactPhone,
        currency: s.currency ?? 'INR',
        free_shipping_threshold: Number(s.freeShippingThreshold ?? 1000),
        default_shipping_fee: Number(s.defaultShippingFee ?? 99),
        announcement_text: s.announcementText,
        updated_at: new Date().toISOString(),
      });
      if (error) return res.status(400).json({ synced: false, error: error.message, ...safeSummary });

      return res.json({ synced: true, ...safeSummary });
    } catch (err: any) {
      return res.status(500).json({ synced: false, error: err?.message });
    }
  });

  // Razorpay Live Payment Gateway Endpoints (Secret stays strictly on server)
  app.get('/api/razorpay/config', async (_req, res) => {
    const ext = await loadExtendedConfig();
    const rzp = getEffectiveRazorpayCredentials(ext);
    return res.json({
      configured: Boolean(rzp.keyId && rzp.keySecret),
      keyId: rzp.keyId,
      mode: rzp.mode,
    });
  });

  app.post('/api/razorpay/test', async (_req, res) => {
    const ext = await loadExtendedConfig();
    const rzp = getEffectiveRazorpayCredentials(ext);
    if (!rzp.keyId || !rzp.keySecret) {
      return res.status(400).json({
        ok: false,
        error: 'Enter both Razorpay Live Key ID (rzp_live_...) and Live Secret Key first.',
      });
    }
    try {
      const auth = Buffer.from(`${rzp.keyId}:${rzp.keySecret}`).toString('base64');
      const r = await fetch('https://api.razorpay.com/v1/orders?count=1', {
        method: 'GET',
        headers: { Authorization: `Basic ${auth}` },
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        const msg =
          data?.error?.description ||
          data?.error?.message ||
          `Razorpay rejected credentials (HTTP ${r.status})`;
        return res.status(400).json({ ok: false, error: msg });
      }
      return res.json({
        ok: true,
        mode: rzp.mode,
        message: `Connected to Razorpay (${rzp.mode.toUpperCase()} mode verified).`,
      });
    } catch (err: any) {
      return res.status(500).json({
        ok: false,
        error: err?.message || 'Unable to reach Razorpay API.',
      });
    }
  });

  app.post('/api/razorpay/create-order', async (req, res) => {
    const ext = await loadExtendedConfig();
    const rzp = getEffectiveRazorpayCredentials(ext);
    if (!rzp.keyId || !rzp.keySecret) {
      return res.status(400).json({
        ok: false,
        error:
          'Razorpay is not configured yet. Studio Owner can add Live Key ID & Secret Key in Admin → Settings.',
      });
    }

    const amountInr = Number(req.body?.amountInr);
    if (!Number.isFinite(amountInr) || amountInr <= 0 || amountInr > 500000) {
      return res.status(400).json({ ok: false, error: 'Invalid payment amount in INR.' });
    }

    const amountPaise = Math.round(amountInr * 100);
    const receipt = String(req.body?.receipt || `va_${Date.now()}`).slice(0, 40);
    const notesRaw = req.body?.notes && typeof req.body.notes === 'object' ? req.body.notes : {};
    const notes: Record<string, string> = {};
    for (const [k, v] of Object.entries(notesRaw).slice(0, 5)) {
      if (typeof v === 'string' && v.trim()) notes[k] = v.trim().slice(0, 120);
    }

    try {
      const auth = Buffer.from(`${rzp.keyId}:${rzp.keySecret}`).toString('base64');
      const r = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountPaise,
          currency: 'INR',
          receipt,
          notes,
        }),
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok || !json?.id) {
        return res.status(400).json({
          ok: false,
          error:
            json?.error?.description ||
            json?.error?.message ||
            `Razorpay order creation failed (HTTP ${r.status})`,
        });
      }

      return res.json({
        ok: true,
        orderId: json.id,
        amount: json.amount,
        currency: json.currency || 'INR',
        keyId: rzp.keyId,
        mode: rzp.mode,
      });
    } catch (err: any) {
      return res.status(500).json({
        ok: false,
        error: err?.message || 'Failed to create Razorpay order.',
      });
    }
  });

  app.post('/api/razorpay/verify', async (req, res) => {
    const ext = await loadExtendedConfig();
    const rzp = getEffectiveRazorpayCredentials(ext);
    if (!rzp.keySecret) {
      return res.status(400).json({ verified: false, error: 'Razorpay secret is not configured.' });
    }

    const orderId = String(req.body?.razorpay_order_id || '').trim();
    const paymentId = String(req.body?.razorpay_payment_id || '').trim();
    const signature = String(req.body?.razorpay_signature || '').trim();

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({
        verified: false,
        error: 'Missing Razorpay order ID, payment ID, or signature.',
      });
    }

    const expected = crypto
      .createHmac('sha256', rzp.keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    const expectedBuf = Buffer.from(expected, 'utf8');
    const actualBuf = Buffer.from(signature, 'utf8');
    const verified =
      expectedBuf.length === actualBuf.length &&
      crypto.timingSafeEqual(expectedBuf, actualBuf);

    if (!verified) {
      return res.status(400).json({
        verified: false,
        error: 'Invalid Razorpay payment signature.',
      });
    }

    return res.json({ verified: true, orderId, paymentId });
  });

  // Admin Portal PIN Gate & Forgot PIN Recovery (strictly server-side verification)
  app.get('/api/admin/pin/status', async (_req, res) => {
    const extCfg = await loadExtendedConfig();
    return res.json({
      pinRequired: true,
      hasCustomPin: Boolean(extCfg.adminPinHash || process.env.ADMIN_PORTAL_PIN),
      securityQuestion: "What is your pet's name?",
    });
  });

  app.post('/api/admin/pin/verify', async (req, res) => {
    const clientIp =
      String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown')
        .split(',')[0]
        .trim();
    const limit = checkPinRateLimit(clientIp);
    if (!limit.allowed) {
      return res.status(429).json({
        ok: false,
        error: `Too many incorrect PIN attempts. Please try again in ${limit.retryAfterSec} seconds.`,
      });
    }

    const email = String(req.body?.email || '').trim().toLowerCase();
    const pin = String(req.body?.pin || '').trim();

    if (email && !isAllowedAdminEmail(email)) {
      return res.status(403).json({
        ok: false,
        error: 'This email does not have Studio Admin privileges.',
      });
    }

    if (!pin || pin.length < 4 || pin.length > 16) {
      return res.status(400).json({ ok: false, error: 'Please enter a valid Admin PIN.' });
    }

    const extCfg = await loadExtendedConfig();
    const envPin = (process.env.ADMIN_PORTAL_PIN || '').trim();

    let matched = false;
    if (extCfg.adminPinHash) {
      matched = verifyScryptHash(pin, extCfg.adminPinHash);
    } else if (envPin) {
      matched = constantTimeEquals(pin, envPin);
    } else {
      matched = verifyScryptHash(pin, DEFAULT_ADMIN_PIN_SCRYPT);
    }

    if (!matched) {
      recordPinFailure(clientIp);
      return res.status(401).json({
        ok: false,
        error: 'Incorrect Admin PIN. Try again or use "Forgot PIN?" below.',
      });
    }

    clearPinFailures(clientIp);
    const unlockToken = issueAdminUnlockToken(email || 'studio-admin');
    return res.json({ ok: true, unlockToken });
  });

  app.post('/api/admin/pin/reset', async (req, res) => {
    const clientIp =
      String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown')
        .split(',')[0]
        .trim();
    const limit = checkPinRateLimit(clientIp);
    if (!limit.allowed) {
      return res.status(429).json({
        ok: false,
        error: `Too many recovery attempts. Please wait ${limit.retryAfterSec} seconds.`,
      });
    }

    const email = String(req.body?.email || '').trim().toLowerCase();
    const petName = String(req.body?.petName || '').trim().toLowerCase();
    const newPin = String(req.body?.newPin || '').trim();

    if (email && !isAllowedAdminEmail(email)) {
      return res.status(403).json({
        ok: false,
        error: 'Only authorized Studio Admin accounts can reset the Admin PIN.',
      });
    }

    if (!petName) {
      return res.status(400).json({ ok: false, error: 'Please enter your pet name answer.' });
    }

    if (!/^\d{4,8}$/.test(newPin)) {
      return res.status(400).json({
        ok: false,
        error: 'New PIN must be 4 to 8 digits (numbers only).',
      });
    }

    const envPetAnswer = (process.env.ADMIN_RECOVERY_PET_NAME || '').trim().toLowerCase();
    const petMatched = envPetAnswer
      ? constantTimeEquals(petName, envPetAnswer)
      : verifyScryptHash(petName, DEFAULT_ADMIN_PET_SCRYPT);

    if (!petMatched) {
      recordPinFailure(clientIp);
      return res.status(401).json({
        ok: false,
        error: 'Incorrect pet name answer. Please try again.',
      });
    }

    clearPinFailures(clientIp);
    const nextHash = hashAdminSecret(newPin);
    await saveExtendedConfig({ adminPinHash: nextHash });
    const unlockToken = issueAdminUnlockToken(email || 'studio-admin');
    return res.json({
      ok: true,
      unlockToken,
      message: 'Admin PIN updated and portal unlocked.',
    });
  });

  // SEO Crawling Support: robots.txt & dynamic sitemap.xml
  app.get(['/robots.txt', '/api/robots.txt'], (req, res) => {
    const host = req.get('x-forwarded-host') || req.get('host') || 'localhost:3000';
    const proto = req.get('x-forwarded-proto') || req.protocol || 'https';
    const baseUrl = (process.env.APP_URL || `${proto}://${host}`).replace(/\/$/, '');
    res.type('text/plain').send(
      [
        'User-agent: *',
        'Allow: /',
        'Disallow: /admin',
        'Disallow: /admin/*',
        'Disallow: /checkout',
        'Disallow: /account',
        '',
        `Sitemap: ${baseUrl}/sitemap.xml`,
      ].join('\n')
    );
  });

  app.get(['/sitemap.xml', '/api/sitemap.xml'], async (req, res) => {
    const host = req.get('x-forwarded-host') || req.get('host') || 'localhost:3000';
    const proto = req.get('x-forwarded-proto') || req.protocol || 'https';
    const baseUrl = (process.env.APP_URL || `${proto}://${host}`).replace(/\/$/, '');
    const today = new Date().toISOString().split('T')[0];

    const staticPaths = [
      { path: '/', priority: '1.0', freq: 'daily' },
      { path: '/shop', priority: '0.9', freq: 'daily' },
      { path: '/custom-orders', priority: '0.9', freq: 'weekly' },
      { path: '/about-us', priority: '0.7', freq: 'monthly' },
      { path: '/faq', priority: '0.6', freq: 'monthly' },
      { path: '/contact', priority: '0.6', freq: 'monthly' },
    ];

    const dynamicUrls: Array<{ path: string; priority: string; freq: string }> = [];
    if (supabase) {
      try {
        const [{ data: cats }, { data: prods }] = await Promise.all([
          supabase.from('categories').select('slug'),
          supabase.from('products').select('slug').eq('is_published', true),
        ]);
        for (const c of cats ?? []) {
          if (c?.slug) {
            dynamicUrls.push({
              path: `/shop/category/${encodeURIComponent(c.slug)}`,
              priority: '0.8',
              freq: 'weekly',
            });
          }
        }
        for (const p of prods ?? []) {
          if (p?.slug) {
            dynamicUrls.push({
              path: `/product/${encodeURIComponent(p.slug)}`,
              priority: '0.8',
              freq: 'weekly',
            });
          }
        }
      } catch {
        // Fallback to static paths if DB unavailable
      }
    }

    const allUrls = [...staticPaths, ...dynamicUrls];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (u) => `  <url>
    <loc>${baseUrl}${u.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
    res.type('application/xml').send(xml);
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
