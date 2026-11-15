import React, { useCallback, useEffect, useState } from 'react';
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
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { BrandMarkGlyph } from '../../components/common/BrandLogo';
import { uploadStudioPhoto } from '../../utils/imageUpload';

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

const OPENROUTER_MODEL_PRESETS = [
  'openai/gpt-4o-mini',
  'google/gemini-2.0-flash-001',
  'anthropic/claude-3.5-haiku',
  'meta-llama/llama-3.3-70b-instruct:free',
];

export const AdminSettingsPage: React.FC = () => {
  const { storeSettings, saveStoreSettings, supabaseStatus, refreshSupabaseSync, addToast } =
    useStore();

  const [form, setForm] = useState(storeSettings);
  const [openrouterKeyInput, setOpenrouterKeyInput] = useState('');
  const [clearKeyFlag, setClearKeyFlag] = useState(false);
  const [checking, setChecking] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [savingAll, setSavingAll] = useState(false);
  const [testingChat, setTestingChat] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [chatLogs, setChatLogs] = useState<ChatLogItem[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      ...storeSettings,
    }));
  }, [storeSettings]);

  const fetchChatLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch('/api/chat/logs');
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.logs)) {
          setChatLogs(json.logs);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAll(true);
    try {
      await saveStoreSettings({
        ...form,
        freeShippingThreshold: Number(form.freeShippingThreshold),
        defaultShippingFee: Number(form.defaultShippingFee),
        openrouterApiKey: clearKeyFlag
          ? '__CLEAR__'
          : openrouterKeyInput.trim() || undefined,
      });
      setOpenrouterKeyInput('');
      setClearKeyFlag(false);
      await fetchChatLogs();
    } finally {
      setSavingAll(false);
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
      await saveStoreSettings(updated);
    } catch {
      addToast('Logo upload failed', 'Please try another PNG or JPG file.', 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleResetLogo = async () => {
    const updated = { ...form, logoUrl: '' };
    setForm(updated);
    await saveStoreSettings(updated);
  };

  const handleReplayIntro = () => {
    window.dispatchEvent(new CustomEvent('varniks:replay-intro'));
  };

  const handleTestOpenRouter = async () => {
    setTestingChat(true);
    setTestResult(null);
    try {
      // Save any newly typed key/model first
      if (openrouterKeyInput.trim() || form.openrouterModel !== storeSettings.openrouterModel) {
        await saveStoreSettings({
          ...form,
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
          text: json.error || 'OpenRouter connection test failed.',
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

  const inputClass =
    'w-full px-3.5 py-2.5 rounded-xl bg-[#FFF9F5] border border-[#E7C7CC] text-sm text-[#3E2F27] focus:outline-none focus:border-[#6D1836]';

  return (
    <AdminLayout title="Store Settings, Custom Logo & Chatbot">
      <div className="max-w-4xl space-y-8">
        {/* Supabase Sync Card */}
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
                <p className="font-semibold text-[#8C6B3F]">All Supabase tables are active &amp; synced</p>
                <p className="mt-0.5 text-[#7A655C]">
                  Categories, products, orders, custom orders, uploaded photos, custom logo, and settings persist in Supabase.
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
                    {supabaseStatus.error}. Confirm the Vercel deployment includes the API function and redeploy after changing environment variables.
                  </p>
                )}
                {supabaseStatus.missingTables.length > 0 && (
                  <p className="mt-1 text-[#7A655C]">
                    Missing tables: <span className="font-mono">{supabaseStatus.missingTables.join(', ')}</span>.
                    Run <span className="font-mono">supabase/schema.sql</span> in your Supabase SQL Editor, then click &ldquo;Verify Tables&rdquo;.
                  </p>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Custom Brand Logo Upload & Animated Startup Reveal */}
        <section className="bg-white border border-[#E7C7CC] rounded-2xl p-6 sm:p-8 shadow-warm/40 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E7C7CC]">
            <div>
              <h2 className="font-display text-lg font-medium text-[#3E2F27]">
                Studio Brand Logo &amp; Startup Card Animation
              </h2>
              <p className="text-xs text-[#7A655C]">
                Upload your custom logo image here. It replaces the placeholder mark in the Navbar, Footer, and full-page refresh reveal animation.
              </p>
            </div>
            <button
              type="button"
              onClick={handleReplayIntro}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F8EFEA] border border-[#E7C7CC] hover:border-[#6D1836] text-xs font-semibold text-[#6D1836] transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Replay Refresh Animation</span>
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

        {/* OpenRouter Cute Chatbot Configuration & Live Logs */}
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
                No chat activity recorded yet. Send a message in the storefront chatbot or click &ldquo;Test OpenRouter Connection&rdquo; above.
              </p>
            ) : (
              <div className="max-h-56 overflow-y-auto border border-[#E7C7CC]/70 rounded-xl divide-y divide-[#E7C7CC]/50 bg-[#FFF9F5]">
                {chatLogs.slice(0, 12).map((log) => (
                  <div key={log.id} className="p-3 text-xs space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-[11px] text-[#7A655C]">
                        {new Date(log.timestamp).toLocaleTimeString()} · {log.model} · {log.latencyMs}ms
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

        {/* General Store Configuration */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[#E7C7CC] rounded-2xl p-6 sm:p-8 shadow-warm/40 space-y-5"
        >
          <div className="flex items-center gap-2 pb-3 border-b border-[#E7C7CC]">
            <Settings className="w-4 h-4 text-[#6D1836]" />
            <h2 className="font-display text-lg font-medium text-[#3E2F27]">General Studio Details</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-[#7A655C] mb-1.5">Store Name</label>
              <input
                type="text"
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A655C] mb-1.5">Currency</label>
              <input
                type="text"
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A655C] mb-1.5">Contact Email</label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A655C] mb-1.5">Contact Phone</label>
              <input
                type="text"
                value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
                Free Shipping Threshold (₹)
              </label>
              <input
                type="number"
                value={form.freeShippingThreshold}
                onChange={(e) => setForm({ ...form, freeShippingThreshold: Number(e.target.value) })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
                Default Shipping Fee (₹)
              </label>
              <input
                type="number"
                value={form.defaultShippingFee}
                onChange={(e) => setForm({ ...form, defaultShippingFee: Number(e.target.value) })}
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
              value={form.announcementText}
              onChange={(e) => setForm({ ...form, announcementText: e.target.value })}
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            disabled={savingAll}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6D1836] hover:bg-[#541129] disabled:opacity-60 text-white text-sm font-medium transition-colors"
          >
            {savingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{savingAll ? 'Saving...' : 'Save Studio, Logo & OpenRouter Settings'}</span>
          </button>
        </form>
      </div>
    </AdminLayout>
  );
};
