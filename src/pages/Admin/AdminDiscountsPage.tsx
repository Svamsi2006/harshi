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
    'w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E7C7CC] text-sm text-[#3E2F27] focus:outline-none focus:border-[#6D1836]';

  return (
    <AdminLayout title="Discounts & Studio Coupons">
      <div className="space-y-8 max-w-5xl">
        <form
          onSubmit={handleAddCoupon}
          className="bg-white border border-[#E7C7CC] rounded-2xl p-6 shadow-warm/40 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#6D1836]" />
            <h2 className="font-display text-lg font-medium text-[#3E2F27]">Create Promo Code</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#7A655C] mb-1">Code *</label>
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
              <label className="block text-xs font-medium text-[#7A655C] mb-1">Type</label>
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
              <label className="block text-xs font-medium text-[#7A655C] mb-1">Value</label>
              <input
                type="number"
                min={1}
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A655C] mb-1">Min Order (₹)</label>
              <input
                type="number"
                min={0}
                value={minimumOrder}
                onChange={(e) => setMinimumOrder(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A655C] mb-1">Expires (Opt)</label>
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-white text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Coupon</span>
            </button>
          </div>
        </form>

        <div className="bg-white border border-[#E7C7CC] rounded-2xl shadow-warm/40 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#E7C7CC] bg-[#FFF9F5]/50 text-xs text-[#7A655C]">
                <th className="py-3.5 px-4 font-medium">Promo Code</th>
                <th className="py-3.5 px-4 font-medium">Discount</th>
                <th className="py-3.5 px-4 font-medium">Min Order</th>
                <th className="py-3.5 px-4 font-medium">Status</th>
                <th className="py-3.5 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7C7CC]">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-[#FFF9F5]/60">
                  <td className="py-3.5 px-4 font-semibold text-[#3E2F27]">{c.code}</td>
                  <td className="py-3.5 px-4 tabular-nums">
                    {c.discountType === 'percentage'
                      ? `${c.discountValue}% off`
                      : `${formatINR(c.discountValue)} off`}
                  </td>
                  <td className="py-3.5 px-4 text-xs text-[#7A655C] tabular-nums">
                    {formatINR(c.minimumOrder)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        c.isActive
                          ? 'bg-[#C9A66B]/15 text-[#C9A66B]'
                          : 'bg-[#E7C7CC] text-[#7A655C]'
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
                        className="p-1.5 text-[#7A655C] hover:text-[#6D1836]"
                        title={c.isActive ? 'Pause coupon' : 'Activate coupon'}
                      >
                        {c.isActive ? (
                          <ToggleRight className="w-5 h-5 text-[#C9A66B]" />
                        ) : (
                          <ToggleLeft className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeCoupon(c.id)}
                        className="p-1.5 text-[#7A655C] hover:text-[#6D1836]"
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
