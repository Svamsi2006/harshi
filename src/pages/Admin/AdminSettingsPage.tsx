import React, { useState } from 'react';
import { Settings, Save, Database, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { AdminLayout } from '../../components/admin/AdminLayout';

export const AdminSettingsPage: React.FC = () => {
  const { storeSettings, saveStoreSettings, supabaseStatus, refreshSupabaseSync } = useStore();
  const [form, setForm] = useState(storeSettings);
  const [checking, setChecking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoreSettings({
      ...form,
      freeShippingThreshold: Number(form.freeShippingThreshold),
      defaultShippingFee: Number(form.defaultShippingFee),
    });
  };

  const handleRecheck = async () => {
    setChecking(true);
    await refreshSupabaseSync();
    setChecking(false);
  };

  const inputClass =
    'w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE3D5] text-sm text-[#2B2623] focus:outline-none focus:border-[#C86D51]';

  return (
    <AdminLayout title="Store Settings & Supabase Sync">
      <div className="max-w-4xl space-y-8">
        {/* Supabase Sync Card */}
        <section className="bg-white border border-[#EAE3D5] rounded-2xl p-6 shadow-warm/40 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Database className="w-5 h-5 text-[#C86D51]" />
              <div>
                <h2 className="font-display text-lg font-medium text-[#2B2623]">
                  Supabase PostgreSQL Connection
                </h2>
                <p className="text-xs text-[#6E655F]">
                  Live database synchronization status for products, orders &amp; commissions
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRecheck}
              disabled={checking}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#EAE3D5] text-xs font-medium text-[#2B2623] hover:border-[#C86D51] transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
              <span>Verify Tables</span>
            </button>
          </div>

          {supabaseStatus.tablesReady ? (
            <div className="flex items-start gap-2.5 p-4 rounded-xl bg-[#7A9178]/10 border border-[#7A9178]/30 text-xs text-[#2B2623]">
              <CheckCircle2 className="w-4 h-4 text-[#7A9178] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[#495B47]">All Supabase tables are active &amp; synced</p>
                <p className="mt-0.5 text-[#6E655F]">
                  Products, orders, commissions, coupons, and settings are persisted directly in your
                  Supabase database.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 p-4 rounded-xl bg-[#E6B86A]/15 border border-[#E6B86A]/40 text-xs text-[#2B2623]">
              <AlertTriangle className="w-4 h-4 text-[#C86D51] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">
                  {supabaseStatus.configured
                    ? 'Supabase connected — waiting for SQL tables'
                    : 'Running in Studio Local Storage Mode'}
                </p>
                {supabaseStatus.missingTables.length > 0 && (
                  <p className="mt-1 text-[#6E655F]">
                    Missing tables: <span className="font-mono">{supabaseStatus.missingTables.join(', ')}</span>.
                    Run <span className="font-mono">supabase/schema.sql</span> in your Supabase SQL Editor, then click &ldquo;Verify Tables&rdquo;.
                  </p>
                )}
              </div>
            </div>
          )}
        </section>

        {/* General Store Configuration */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-[#EAE3D5] rounded-2xl p-6 sm:p-8 shadow-warm/40 space-y-5"
        >
          <div className="flex items-center gap-2 pb-3 border-b border-[#EAE3D5]">
            <Settings className="w-4 h-4 text-[#C86D51]" />
            <h2 className="font-display text-lg font-medium text-[#2B2623]">General Studio Details</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-[#6E655F] mb-1.5">Store Name</label>
              <input
                type="text"
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6E655F] mb-1.5">Currency</label>
              <input
                type="text"
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6E655F] mb-1.5">Contact Email</label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6E655F] mb-1.5">Contact Phone</label>
              <input
                type="text"
                value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6E655F] mb-1.5">
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
              <label className="block text-xs font-medium text-[#6E655F] mb-1.5">
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

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C86D51] hover:bg-[#B2593E] text-white text-sm font-medium transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Studio Settings</span>
          </button>
        </form>
      </div>
    </AdminLayout>
  );
};
