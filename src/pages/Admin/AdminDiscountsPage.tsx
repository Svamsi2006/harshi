import React, { useState } from 'react';
import { Tag, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import type { Coupon } from '../../types';
import { useStore } from '../../context/StoreContext';
import { formatINR } from '../../utils/format';
import { AdminLayout } from '../../components/admin/AdminLayout';

export const AdminDiscountsPage: React.FC = () => {
  const { coupons, saveCoupons } = useStore();
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState(10);
  const [minimumOrder, setMinimumOrder] = useState(999);
  const [expiresAt, setExpiresAt] = useState('');

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = code.trim().toUpperCase();
    if (!cleaned || discountValue <= 0) return;

    const newCoupon: Coupon = {
      id: `coup-${Date.now()}`,
      code: cleaned,
      discountType,
      discountValue: Number(discountValue),
      minimumOrder: Number(minimumOrder),
      expiresAt: expiresAt || undefined,
      isActive: true,
    };
    saveCoupons([newCoupon, ...coupons]);
    setCode('');
  };

  const toggleActive = (id: string) => {
    saveCoupons(coupons.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)));
  };

  const removeCoupon = (id: string) => {
    saveCoupons(coupons.filter((c) => c.id !== id));
  };

  const inputClass =
    'w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EAE3D5] text-sm text-[#2B2623] focus:outline-none focus:border-[#C86D51]';

  return (
    <AdminLayout title="Discounts & Studio Coupons">
      <div className="space-y-8 max-w-5xl">
        <form
          onSubmit={handleAddCoupon}
          className="bg-white border border-[#EAE3D5] rounded-2xl p-6 shadow-warm/40 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#C86D51]" />
            <h2 className="font-display text-lg font-medium text-[#2B2623]">Create Promo Code</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#6E655F] mb-1">Code *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="FESTIVE15"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6E655F] mb-1">Type</label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                className={inputClass}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6E655F] mb-1">Value</label>
              <input
                type="number"
                min={1}
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6E655F] mb-1">Min Order (₹)</label>
              <input
                type="number"
                min={0}
                value={minimumOrder}
                onChange={(e) => setMinimumOrder(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6E655F] mb-1">Expires (Opt)</label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C86D51] hover:bg-[#B2593E] text-white text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Coupon</span>
            </button>
          </div>
        </form>

        <div className="bg-white border border-[#EAE3D5] rounded-2xl shadow-warm/40 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#EAE3D5] bg-[#FAF7F2]/50 text-xs text-[#6E655F]">
                <th className="py-3.5 px-4 font-medium">Promo Code</th>
                <th className="py-3.5 px-4 font-medium">Discount</th>
                <th className="py-3.5 px-4 font-medium">Min Order</th>
                <th className="py-3.5 px-4 font-medium">Status</th>
                <th className="py-3.5 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE3D5]">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-[#FAF7F2]/60">
                  <td className="py-3.5 px-4 font-semibold text-[#2B2623]">{c.code}</td>
                  <td className="py-3.5 px-4 tabular-nums">
                    {c.discountType === 'percentage'
                      ? `${c.discountValue}% off`
                      : `${formatINR(c.discountValue)} off`}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-[#6E655F] tabular-nums">
                    {formatINR(c.minimumOrder)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        c.isActive
                          ? 'bg-[#7A9178]/15 text-[#7A9178]'
                          : 'bg-[#EAE3D5] text-[#6E655F]'
                      }`}
                    >
                      {c.isActive ? 'Active' : 'Paused'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleActive(c.id)}
                        className="p-1.5 text-[#6E655F] hover:text-[#C86D51]"
                        title={c.isActive ? 'Pause coupon' : 'Activate coupon'}
                      >
                        {c.isActive ? (
                          <ToggleRight className="w-5 h-5 text-[#7A9178]" />
                        ) : (
                          <ToggleLeft className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeCoupon(c.id)}
                        className="p-1.5 text-[#6E655F] hover:text-[#B94F45]"
                        title="Delete coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};
