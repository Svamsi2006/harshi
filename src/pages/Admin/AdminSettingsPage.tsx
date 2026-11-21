import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Settings,
  Save,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Loader2,
  Play,
  RotateCcw,
  Bot,
  KeyRound,
  Activity,
  ShieldCheck,
  Copy,
  Check,
  CreditCard,
  Truck,
  Globe,
  BarChart3,
} from 'lucide-react';
import type { ShippingZone } from '../../types';
import { useStore } from '../../context/StoreContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { BrandMarkGlyph } from '../../components/common/BrandLogo';
import { uploadStudioPhoto } from '../../utils/imageUpload';
import {
  DEFAULT_STUDIO_ORIGIN_STATE,
  resolveShippingZones,
} from '../../utils/shipping';

interface ChatLogItem {
  id: string;
  timestamp: string;
  model: string;
  userMessage: string;
  replyPreview: string;
  status: 'ok' | 'fallback' | 'error';
  latencyMs: number;
  errorDetail?: string;
}

function readableError(error: unknown, fallback: string): string {
  if (typeof error === 'string' && error.trim()) return error;
  if (error && typeof error === 'object' && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
}

const OPENROUTER_MODEL_PRESETS = [
  'openai/gpt-4o-mini',
  'google/gemini-2.0-flash-001',
  'anthropic/claude-3.5-haiku',
  'meta-llama/llama-3.3-70b-instruct:free',
];

const INDIAN_STATES = [
  'Maharashtra',
  'Andhra Pradesh',
  'Telangana',
  'Karnataka',
  'Tamil Nadu',
  'Kerala',
  'Gujarat',
  'Delhi',
  'Uttar Pradesh',
  'West Bengal',
  'Rajasthan',
  'Madhya Pradesh',
  'Punjab',
  'Haryana',
  'Bihar',
  'Odisha',
  'Assam',
];

function safeLogTime(raw: string): string {
  const dt = new Date(raw);
  return Number.isNaN(dt.getTime()) ? '—' : dt.toLocaleTimeString();
}

function sanitizeChatLog(raw: unknown, idx: number): ChatLogItem {
  const item = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const statusRaw = String(item.status ?? 'ok');
  const status: ChatLogItem['status'] =
    statusRaw === 'ok' || statusRaw === 'fallback' || statusRaw === 'error' ? statusRaw : 'ok';
  const latency = Number(item.latencyMs);
  return {
    id: typeof item.id === 'string' && item.id ? item.id : `log-${idx}`,
    timestamp: typeof item.timestamp === 'string' ? item.timestamp : '',
    model: typeof item.model === 'string' ? item.model : 'unknown',
    userMessage: typeof item.userMessage === 'string' ? item.userMessage : '',
    replyPreview: typeof item.replyPreview === 'string' ? item.replyPreview : '',
    status,
    latencyMs: Number.isFinite(latency) ? latency : 0,
    errorDetail: typeof item.errorDetail === 'string' ? item.errorDetail : undefined,
  };
}

export const AdminSettingsPage: React.FC = () => {
  const {
    storeSettings,
    saveStoreSettings,
    supabaseStatus,
    refreshSupabaseSync,
    googleAuthAvailable,
    addToast,
  } = useStore();

  const [form, setForm] = useState(storeSettings);
  const [zones, setZones] = useState<ShippingZone[]>(() =>
    resolveShippingZones(storeSettings.shippingZones)
  );
  const [openrouterKeyInput, setOpenrouterKeyInput] = useState('');
  const [clearKeyFlag, setClearKeyFlag] = useState(false);

  // Razorpay Live API Key & Secret Key state (Secret is never stored in localStorage or echoed back)
  const [razorpayKeyIdInput, setRazorpayKeyIdInput] = useState(storeSettings.razorpayKeyId ?? '');
  const [razorpaySecretInput, setRazorpaySecretInput] = useState('');
  const [clearRazorpaySecretFlag, setClearRazorpaySecretFlag] = useState(false);
  const [testingRazorpay, setTestingRazorpay] = useState(false);
  const [razorpayTestResult, setRazorpayTestResult] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  const [checking, setChecking] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [savingAll, setSavingAll] = useState(false);
  const [testingChat, setTestingChat] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [chatLogs, setChatLogs] = useState<ChatLogItem[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const authCallbackUrl = origin ? `${origin}/login` : '/login';
  const sitemapUrl = origin ? `${origin}/sitemap.xml` : '/sitemap.xml';
  const robotsUrl = origin ? `${origin}/robots.txt` : '/robots.txt';

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      ...storeSettings,
    }));
    setZones(resolveShippingZones(storeSettings.shippingZones));
    if (storeSettings.razorpayKeyId) {
      setRazorpayKeyIdInput((prev) => prev || storeSettings.razorpayKeyId || '');
    }
  }, [storeSettings]);

  const copyText = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1800);
    } catch {
      // ignore
    }
  };

  const fetchChatLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch('/api/chat/logs', {
        headers: { Accept: 'application/json' },
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const json = await res.json();
        if (Array.isArray(json?.logs)) {
          setChatLogs(json.logs.map((entry: unknown, idx: number) => sanitizeChatLog(entry, idx)));
        }
      }
    } catch {
      // ignore
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    void fetchChatLogs();
  }, [fetchChatLogs]);

  const persistAllSettings = async () => {
    await saveStoreSettings({
      ...form,
      freeShippingThreshold: Number(form.freeShippingThreshold) || 1000,
      defaultShippingFee: Number(form.defaultShippingFee) || 99,
      studioOriginState: form.studioOriginState || DEFAULT_STUDIO_ORIGIN_STATE,
      shippingZones: zones,
      razorpayKeyId: razorpayKeyIdInput.trim(),
      razorpayKeySecret: clearRazorpaySecretFlag
        ? '__CLEAR__'
        : razorpaySecretInput.trim() || undefined,
      openrouterApiKey: clearKeyFlag
        ? '__CLEAR__'
        : openrouterKeyInput.trim() || undefined,
      gaMeasurementId: (form.gaMeasurementId ?? '').trim(),
      googleSiteVerification: (form.googleSiteVerification ?? '').trim(),
    });
    setOpenrouterKeyInput('');
    setClearKeyFlag(false);
    setRazorpaySecretInput('');
    setClearRazorpaySecretFlag(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAll(true);
    try {
      await persistAllSettings();
      await fetchChatLogs();
    } finally {
      setSavingAll(false);
    }
  };

  const handleTestRazorpay = async () => {
    setTestingRazorpay(true);
    setRazorpayTestResult(null);
    try {
      if (razorpayKeyIdInput.trim() || razorpaySecretInput.trim()) {
        await persistAllSettings();
      }
      const res = await fetch('/api/razorpay/test', { method: 'POST' });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json?.ok) {
        setRazorpayTestResult({
          ok: true,
          text: String(json.message || 'Razorpay credentials verified!'),
        });
      } else {
        setRazorpayTestResult({
          ok: false,
          text: readableError(json?.error, 'Razorpay verification failed.'),
        });
      }
    } catch {
      setRazorpayTestResult({ ok: false, text: 'Could not reach Razorpay verification endpoint.' });
    } finally {
      setTestingRazorpay(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const { url } = await uploadStudioPhoto(file, 'products');
      const updated = { ...form, logoUrl: url };
      setForm(updated);
      await saveStoreSettings({ ...updated, shippingZones: zones });
    } catch {
      addToast('Logo upload failed', 'Please try another PNG or JPG file.', 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleResetLogo = async () => {
    const updated = { ...form, logoUrl: '' };
    setForm(updated);
    await saveStoreSettings({ ...updated, shippingZones: zones });
  };

  const handleReplayIntro = () => {
    window.dispatchEvent(new CustomEvent('varniks:replay-intro'));
  };

  const handleTestOpenRouter = async () => {
    setTestingChat(true);
    setTestResult(null);
    try {
      if (openrouterKeyInput.trim() || form.openrouterModel !== storeSettings.openrouterModel) {
        await saveStoreSettings({
          ...form,
          shippingZones: zones,
          openrouterApiKey: openrouterKeyInput.trim() || undefined,
        });
        setOpenrouterKeyInput('');
      }
      const res = await fetch('/api/chat/test', { method: 'POST' });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        setTestResult({
          ok: true,
          text: `Connected (${json.latencyMs}ms): "${json.reply}"`,
        });
      } else {
        setTestResult({
          ok: false,
          text: readableError(json.error, 'OpenRouter connection test failed.'),
        });
      }
      await fetchChatLogs();
    } catch {
      setTestResult({ ok: false, text: 'Could not reach server chat endpoint.' });
    } finally {
      setTestingChat(false);
    }
  };

  const handleRecheck = async () => {
    setChecking(true);
    await refreshSupabaseSync();
    setChecking(false);
  };

  const updateZone = (id: string, patch: Partial<ShippingZone>) => {
    setZones((prev) => prev.map((z) => (z.id === id ? { ...z, ...patch } : z)));
  };

  const inputClass =
    'w-full px-3.5 py-2.5 rounded-xl bg-[#FFF9F5] border border-[#E7C7CC] text-sm text-[#3E2F27] focus:outline-none focus:border-[#6D1836]';

  return (
    <AdminLayout title="Store Settings, Razorpay, Delivery Zones & SEO">
      <div className="max-w-4xl space-y-8">
        {/* 1. Razorpay Live Payment Gateway Configuration */}
        <section className="bg-white border border-[#E7C7CC] rounded-2xl p-6 sm:p-8 shadow-warm/40 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E7C7CC]">
            <div className="flex items-center gap-2.5">
              <CreditCard className="w-5 h-5 text-[#6D1836]" />
              <div>
                <h2 className="font-display text-lg font-medium text-[#3E2F27]">
                  Razorpay Live Payment Gateway
                </h2>
                <p className="text-xs text-[#7A655C]">
                  Enter your Razorpay Live API Key ID &amp; Live Secret Key (stored server-side only; also supports <span className="font-mono">RAZORPAY_KEY_ID</span> / <span className="font-mono">RAZORPAY_KEY_SECRET</span> env vars).
                </p>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                storeSettings.razorpayMode === 'live'
                  ? 'bg-[#C9A66B]/25 text-[#3E2F27]'
                  : storeSettings.razorpayMode === 'test'
                    ? 'bg-[#F8EFEA] text-[#6D1836] border border-[#E7C7CC]'
                    : 'bg-[#F8EFEA] text-[#7A655C] border border-[#E7C7CC]'
              }`}
            >
              {storeSettings.razorpayMode === 'live'
                ? 'Live Mode Active ✓'
                : storeSettings.razorpayMode === 'test'
                  ? 'Test Mode Active'
                  : 'Keys Needed'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
                Razorpay Live API Key ID *
              </label>
              <input
                type="text"
                value={razorpayKeyIdInput}
                onChange={(e) => setRazorpayKeyIdInput(e.target.value)}
                placeholder="rzp_live_xxxxxxxxxxxxxx"
                className={`${inputClass} font-mono text-xs`}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
                Razorpay Live Secret Key *{' '}
                {storeSettings.hasRazorpayKey && !clearRazorpaySecretFlag && (
                  <span className="text-[#8C6B3F] font-semibold">
                    (Saved: {storeSettings.razorpaySecretMasked})
                  </span>
                )}
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <KeyRound className="w-4 h-4 text-[#7A655C] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={razorpaySecretInput}
                    onChange={(e) => {
                      setRazorpaySecretInput(e.target.value);
                      setClearRazorpaySecretFlag(false);
                    }}
                    placeholder={
                      storeSettings.hasRazorpayKey && !clearRazorpaySecretFlag
                        ? 'Paste new live secret to replace...'
                        : 'Enter Razorpay Live Secret Key'
                    }
                    className={`${inputClass} pl-9`}
                  />
                </div>
                {storeSettings.hasRazorpayKey && (
                  <button
                    type="button"
                    onClick={() => {
                      setClearRazorpaySecretFlag(true);
                      setRazorpaySecretInput('');
                    }}
                    className="px-3 py-2.5 rounded-xl border border-[#E7C7CC] text-xs font-medium text-[#6D1836] hover:bg-[#FFF9F5]"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void handleTestRazorpay()}
              disabled={testingRazorpay}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-[#FFF9F5] text-xs font-semibold transition-colors disabled:opacity-60"
            >
              {testingRazorpay ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5" />
              )}
              <span>
                {testingRazorpay ? 'Verifying Razorpay...' : 'Save & Verify Razorpay Live Keys'}
              </span>
            </button>

            {razorpayTestResult && (
              <span
                className={`text-xs font-medium ${
                  razorpayTestResult.ok ? 'text-[#8C6B3F]' : 'text-[#6D1836]'
                }`}
              >
                {razorpayTestResult.text}
              </span>
            )}
          </div>
        </section>

        {/* 2. Location-Based Delivery Charges & Free Delivery Above ₹1,000 */}
        <section className="bg-white border border-[#E7C7CC] rounded-2xl p-6 sm:p-8 shadow-warm/40 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E7C7CC]">
            <div className="flex items-center gap-2.5">
              <Truck className="w-5 h-5 text-[#6D1836]" />
              <div>
                <h2 className="font-display text-lg font-medium text-[#3E2F27]">
                  Location-Based Delivery Charges (E-Commerce Zones)
                </h2>
                <p className="text-xs text-[#7A655C]">
                  Automatically calculates shipping by customer State, City &amp; 6-digit PIN code. Free delivery above ₹1,000 is controlled via coupon in Discounts.
                </p>
              </div>
            </div>
            <Link
              to="/admin/discounts"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F8EFEA] border border-[#E7C7CC] hover:border-[#6D1836] text-xs font-semibold text-[#6D1836] transition-colors"
            >
              <span>Customize Free Delivery Coupon →</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
                Studio Dispatch Origin State (Local Rate Hub)
              </label>
              <select
                value={form.studioOriginState || DEFAULT_STUDIO_ORIGIN_STATE}
                onChange={(e) => setForm({ ...form, studioOriginState: e.target.value })}
                className={inputClass}
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
                Fallback Free Delivery Threshold (₹)
              </label>
              <input
                type="number"
                min={0}
                value={
                  Number.isFinite(Number(form.freeShippingThreshold))
                    ? Number(form.freeShippingThreshold)
                    : 1000
                }
                onChange={(e) =>
                  setForm({ ...form, freeShippingThreshold: Number(e.target.value) })
                }
                className={inputClass}
              />
            </div>
          </div>

          <div className="space-y-3">
            {zones.map((zone) => (
              <div
                key={zone.id}
                className="p-4 rounded-xl bg-[#FFF9F5] border border-[#E7C7CC] grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
              >
                <div className="sm:col-span-6">
                  <p className="text-sm font-semibold text-[#3E2F27]">{zone.name}</p>
                  <p className="text-xs text-[#7A655C] mt-0.5">{zone.description}</p>
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-medium text-[#7A655C] mb-1">
                    Delivery Charge (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={zone.fee}
                    onChange={(e) => updateZone(zone.id, { fee: Math.max(0, Number(e.target.value)) })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#E7C7CC] text-xs font-semibold text-[#3E2F27]"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-medium text-[#7A655C] mb-1">
                    Estimated ETA
                  </label>
                  <input
                    type="text"
                    value={zone.eta}
                    onChange={(e) => updateZone(zone.id, { eta: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-[#E7C7CC] text-xs text-[#3E2F27]"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. SEO, Google Search Console & Google Analytics 4 */}
        <section className="bg-white border border-[#E7C7CC] rounded-2xl p-6 sm:p-8 shadow-warm/40 space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#E7C7CC]">
            <BarChart3 className="w-5 h-5 text-[#6D1836]" />
            <div>
              <h2 className="font-display text-lg font-medium text-[#3E2F27]">
                Google Analytics 4 &amp; Google Search SEO
              </h2>
              <p className="text-xs text-[#7A655C]">
                Connect Google Analytics 4 for live traffic tracking and submit your dynamic sitemap to Google Search Console for top search ranking.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
                Google Analytics 4 Measurement ID
              </label>
              <input
                type="text"
                value={form.gaMeasurementId ?? ''}
                onChange={(e) => setForm({ ...form, gaMeasurementId: e.target.value })}
                placeholder="G-XXXXXXXXXX"
                className={`${inputClass} font-mono text-xs`}
              />
              <p className="text-[11px] text-[#7A655C] mt-1">
                Found in Google Analytics → Admin → Data Streams → Web Stream.
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
                Google Search Console Verification Code
              </label>
              <input
                type="text"
                value={form.googleSiteVerification ?? ''}
                onChange={(e) => setForm({ ...form, googleSiteVerification: e.target.value })}
                placeholder="Paste HTML tag content value..."
                className={`${inputClass} font-mono text-xs`}
              />
              <p className="text-[11px] text-[#7A655C] mt-1">
                Injects <span className="font-mono">&lt;meta name=&quot;google-site-verification&quot;&gt;</span> automatically.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-[#FFF9F5] border border-[#E7C7CC] space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-[#3E2F27]">
                <span className="inline-flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#6D1836]" />
                  <span>Dynamic Sitemap XML</span>
                </span>
                <button
                  type="button"
                  onClick={() => void copyText('sitemap', sitemapUrl)}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-[#6D1836]"
                >
                  {copiedKey === 'sitemap' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'sitemap' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <code className="block text-[11px] font-mono text-[#7A655C] truncate">
                {sitemapUrl}
              </code>
            </div>

            <div className="p-3 rounded-xl bg-[#FFF9F5] border border-[#E7C7CC] space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-[#3E2F27]">
                <span className="inline-flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#6D1836]" />
                  <span>Crawler Robots.txt</span>
                </span>
                <button
                  type="button"
                  onClick={() => void copyText('robots', robotsUrl)}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-[#6D1836]"
                >
                  {copiedKey === 'robots' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'robots' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <code className="block text-[11px] font-mono text-[#7A655C] truncate">
                {robotsUrl}
              </code>
            </div>
          </div>
        </section>

        {/* 4. Supabase Sync & Google Auth Card */}
        <section className="bg-white border border-[#E7C7CC] rounded-2xl p-6 shadow-warm/40 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Database className="w-5 h-5 text-[#6D1836]" />
              <div>
                <h2 className="font-display text-lg font-medium text-[#3E2F27]">
                  Supabase PostgreSQL &amp; Storage Connection
                </h2>
                <p className="text-xs text-[#7A655C]">
                  Live database synchronization for products, orders, custom orders &amp; studio media
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRecheck}
              disabled={checking}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E7C7CC] text-xs font-medium text-[#3E2F27] hover:border-[#6D1836] transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
              <span>Verify Tables</span>
            </button>
          </div>

          {supabaseStatus.tablesReady ? (
            <div className="flex items-start gap-2.5 p-4 rounded-xl bg-[#C9A66B]/10 border border-[#C9A66B]/30 text-xs text-[#3E2F27]">
              <CheckCircle2 className="w-4 h-4 text-[#C9A66B] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#8C6B3F]">
                  All Supabase tables are active &amp; synced
                </p>
                <p className="mt-0.5 text-[#7A655C]">
                  Categories, products, orders, custom orders, uploaded photos, custom logo, Razorpay config, delivery zones, and SEO settings persist in Supabase.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 p-4 rounded-xl bg-[#C9A66B]/15 border border-[#C9A66B]/40 text-xs text-[#3E2F27]">
              <AlertTriangle className="w-4 h-4 text-[#6D1836] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">
                  {supabaseStatus.error
                    ? 'Supabase API unavailable'
                    : supabaseStatus.configured
                      ? 'Supabase connected — waiting for SQL tables'
                      : 'Running in Studio Local Storage Mode'}
                </p>
                {supabaseStatus.error && (
                  <p className="mt-1 text-[#7A655C]">
                    {readableError(supabaseStatus.error, 'Supabase status request failed')}
                  </p>
                )}
                {supabaseStatus.diagnostics && (
                  <p className="mt-1 text-[#7A655C] font-mono text-[11px]">
                    URL: {supabaseStatus.diagnostics.hasUrl ? `ok (${supabaseStatus.diagnostics.urlSource})` : 'missing'} ·
                    Key: {supabaseStatus.diagnostics.hasKey ? `ok (${supabaseStatus.diagnostics.keySource})` : 'missing'} ·
                    DB URL: {supabaseStatus.diagnostics.hasDatabaseUrl ? 'present' : 'not set'}
                  </p>
                )}
                {supabaseStatus.missingTables.length > 0 && (
                  <p className="mt-1 text-[#7A655C]">
                    Missing tables: <span className="font-mono">{supabaseStatus.missingTables.join(', ')}</span>.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Supabase Google Authentication Readiness */}
          <div className="pt-3 border-t border-[#E7C7CC]/70 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#6D1836]" />
                <p className="text-xs font-semibold text-[#3E2F27]">
                  Supabase Google Authentication (Mandatory Customer Login)
                </p>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${
                  googleAuthAvailable
                    ? 'bg-[#C9A66B]/25 text-[#3E2F27]'
                    : 'bg-[#F8EFEA] text-[#6D1836] border border-[#E7C7CC]'
                }`}
              >
                {googleAuthAvailable ? 'Google OAuth Ready ✓' : 'Needs SUPABASE_ANON_KEY'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 rounded-xl bg-[#FFF9F5] border border-[#E7C7CC] text-xs font-mono text-[#3E2F27] truncate">
                {authCallbackUrl}
              </code>
              <button
                type="button"
                onClick={() => void copyText('oauth', authCallbackUrl)}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-[#E7C7CC] hover:border-[#6D1836] text-xs font-medium text-[#3E2F27]"
              >
                {copiedKey === 'oauth' ? (
                  <Check className="w-3.5 h-3.5 text-[#C9A66B]" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copiedKey === 'oauth' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        </section>

        {/* 5. Custom Brand Logo Upload & Logo-Only Reload Reveal */}
        <section className="bg-white border border-[#E7C7CC] rounded-2xl p-6 sm:p-8 shadow-warm/40 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E7C7CC]">
            <div>
              <h2 className="font-display text-lg font-medium text-[#3E2F27]">
                Studio Brand Logo &amp; Logo-Only Reload Animation
              </h2>
              <p className="text-xs text-[#7A655C]">
                Upload your custom logo image here. On reload, only your animated logo appears cleanly on screen.
              </p>
            </div>
            <button
              type="button"
              onClick={handleReplayIntro}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F8EFEA] border border-[#E7C7CC] hover:border-[#6D1836] text-xs font-semibold text-[#6D1836] transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Replay Logo Animation</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="w-24 h-24 rounded-2xl bg-[#FFF9F5] border border-[#E7C7CC] flex items-center justify-center shrink-0 p-2">
              <BrandMarkGlyph
                logoUrl={form.logoUrl}
                className="w-18 h-18"
                storeName={form.storeName}
              />
            </div>

            <div className="flex-1 w-full space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-[#FFF9F5] text-xs font-medium cursor-pointer transition-colors">
                  {uploadingLogo ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Upload className="w-3.5 h-3.5" />
                  )}
                  <span>{uploadingLogo ? 'Uploading Logo...' : 'Upload Custom Logo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="sr-only"
                    disabled={uploadingLogo}
                  />
                </label>

                {form.logoUrl && (
                  <button
                    type="button"
                    onClick={handleResetLogo}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E7C7CC] hover:border-[#6D1836] text-xs font-medium text-[#7A655C] hover:text-[#3E2F27]"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Use Default Mark</span>
                  </button>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#7A655C] mb-1">
                  Or Paste Logo Image URL
                </label>
                <input
                  type="text"
                  value={form.logoUrl ?? ''}
                  onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                  placeholder="https://... (leave empty to use handcrafted studio emblem)"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </section>

        {/* 6. OpenRouter Cute Chatbot Configuration & Live Logs */}
        <section className="bg-white border border-[#E7C7CC] rounded-2xl p-6 sm:p-8 shadow-warm/40 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E7C7CC]">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-[#6D1836]" />
              <div>
                <h2 className="font-display text-lg font-medium text-[#3E2F27]">
                  Varni Studio Chatbot (OpenRouter API)
                </h2>
                <p className="text-xs text-[#7A655C]">
                  Paste your OpenRouter API key here (stored server-side, never exposed to storefront visitors).
                </p>
              </div>
            </div>

            <label className="inline-flex items-center gap-2 text-xs font-medium text-[#3E2F27] cursor-pointer">
              <input
                type="checkbox"
                checked={form.chatbotEnabled !== false}
                onChange={(e) => setForm({ ...form, chatbotEnabled: e.target.checked })}
                className="rounded border-[#E7C7CC] text-[#6D1836]"
              />
              <span>Show Chatbot on Storefront</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
                OpenRouter API Key{' '}
                {storeSettings.hasOpenrouterKey && !clearKeyFlag && (
                  <span className="text-[#8C6B3F] font-semibold">
                    (Active: {storeSettings.openrouterKeyMasked})
                  </span>
                )}
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <KeyRound className="w-4 h-4 text-[#7A655C] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={openrouterKeyInput}
                    onChange={(e) => {
                      setOpenrouterKeyInput(e.target.value);
                      setClearKeyFlag(false);
                    }}
                    placeholder={
                      storeSettings.hasOpenrouterKey && !clearKeyFlag
                        ? 'Paste new key to replace existing...'
                        : 'sk-or-v1-...'
                    }
                    className={`${inputClass} pl-9`}
                  />
                </div>
                {storeSettings.hasOpenrouterKey && (
                  <button
                    type="button"
                    onClick={() => {
                      setClearKeyFlag(true);
                      setOpenrouterKeyInput('');
                    }}
                    className="px-3 py-2.5 rounded-xl border border-[#E7C7CC] text-xs font-medium text-[#6D1836] hover:bg-[#FFF9F5]"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
                OpenRouter Model Slug
              </label>
              <input
                type="text"
                list="openrouter-models"
                value={form.openrouterModel || 'openai/gpt-4o-mini'}
                onChange={(e) => setForm({ ...form, openrouterModel: e.target.value })}
                className={inputClass}
                placeholder="openai/gpt-4o-mini"
              />
              <datalist id="openrouter-models">
                {OPENROUTER_MODEL_PRESETS.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleTestOpenRouter}
              disabled={testingChat}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#F8EFEA] border border-[#E7C7CC] hover:border-[#6D1836] text-xs font-semibold text-[#3E2F27] transition-colors"
            >
              {testingChat ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6D1836]" />
              ) : (
                <Activity className="w-3.5 h-3.5 text-[#6D1836]" />
              )}
              <span>{testingChat ? 'Testing...' : 'Test OpenRouter Connection'}</span>
            </button>

            {testResult && (
              <span
                className={`text-xs font-medium ${
                  testResult.ok ? 'text-[#8C6B3F]' : 'text-[#6D1836]'
                }`}
              >
                {testResult.text}
              </span>
            )}
          </div>

          {/* Chatbot Request Logs */}
          <div className="pt-3 border-t border-[#E7C7CC]/70 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-[#3E2F27]">
                Recent Chatbot Interaction Logs ({chatLogs.length})
              </p>
              <button
                type="button"
                onClick={() => void fetchChatLogs()}
                disabled={loadingLogs}
                className="inline-flex items-center gap-1 text-xs font-medium text-[#6D1836] hover:underline"
              >
                <RefreshCw className={`w-3 h-3 ${loadingLogs ? 'animate-spin' : ''}`} />
                <span>Refresh Logs</span>
              </button>
            </div>

            {chatLogs.length === 0 ? (
              <p className="text-xs text-[#7A655C] bg-[#FFF9F5] border border-[#E7C7CC]/70 rounded-xl p-3">
                No chat activity recorded yet.
              </p>
            ) : (
              <div className="max-h-56 overflow-y-auto border border-[#E7C7CC]/70 rounded-xl divide-y divide-[#E7C7CC]/50 bg-[#FFF9F5]">
                {chatLogs.slice(0, 12).map((log) => (
                  <div key={log.id} className="p-3 text-xs space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-[11px] text-[#7A655C]">
                        {safeLogTime(log.timestamp)} · {log.model} · {log.latencyMs}ms
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          log.status === 'ok'
                            ? 'bg-[#C9A66B]/25 text-[#3E2F27]'
                            : log.status === 'fallback'
                              ? 'bg-[#F8EFEA] text-[#7A655C]'
                              : 'bg-[#6D1836]/15 text-[#6D1836]'
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                    <p className="text-[#3E2F27] font-medium truncate">Q: {log.userMessage}</p>
                    <p className="text-[#7A655C] truncate">A: {log.replyPreview}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 7. General Store Configuration & Save All Button */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[#E7C7CC] rounded-2xl p-6 sm:p-8 shadow-warm/40 space-y-5"
        >
          <div className="flex items-center gap-2 pb-3 border-b border-[#E7C7CC]">
            <Settings className="w-4 h-4 text-[#6D1836]" />
            <h2 className="font-display text-lg font-medium text-[#3E2F27]">
              General Studio Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-[#7A655C] mb-1.5">Store Name</label>
              <input
                type="text"
                value={form.storeName ?? ''}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A655C] mb-1.5">Currency</label>
              <input
                type="text"
                value={form.currency ?? 'INR'}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
                Contact Email
              </label>
              <input
                type="email"
                value={form.contactEmail ?? ''}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
                Contact Phone
              </label>
              <input
                type="text"
                value={form.contactPhone ?? ''}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
              Top Announcement Banner Text
            </label>
            <input
              type="text"
              value={form.announcementText ?? ''}
              onChange={(e) => setForm({ ...form, announcementText: e.target.value })}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={savingAll}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#6D1836] hover:bg-[#541129] disabled:opacity-60 text-white text-sm font-medium transition-colors"
          >
            {savingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>
              {savingAll
                ? 'Saving All Settings...'
                : 'Save All Studio, Razorpay, Delivery & SEO Settings'}
            </span>
          </button>
        </form>
      </div>
    </AdminLayout>
  );
};
