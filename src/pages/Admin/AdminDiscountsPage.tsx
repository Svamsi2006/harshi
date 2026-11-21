import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tag, Plus, Trash2, ToggleLeft, ToggleRight, Truck, Pencil, Check, X } from 'lucide-react';
import type { Coupon } from '../../types';
import { useStore } from '../../context/StoreContext';
import { formatINR } from '../../utils/format';
import { AdminLayout } from '../../components/admin/AdminLayout';

export const AdminDiscountsPage: React.FC = () => {
  const { coupons, saveCoupons } = useStore();
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed' | 'free_shipping'>(
    'free_shipping'
  );
  const [discountValue, setDiscountValue] = useState(10);
  const [minimumOrder, setMinimumOrder] = useState(1000);
  const [autoApply, setAutoApply] = useState(true);
  const [expiresAt, setExpiresAt] = useState('');

  // Inline edit state so Admin can customize FREESHIP1000 or any coupon anytime
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<Coupon>>({});

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = code.trim().toUpperCase();
    if (!cleaned) return;
    if (discountType !== 'free_shipping' && discountValue <= 0) return;

    const newCoupon: Coupon = {
      id: `coup-${Date.now()}`,
      code: cleaned,
      discountType,
      discountValue: discountType === 'free_shipping' ? 100 : Number(discountValue),
      minimumOrder: Math.max(0, Number(minimumOrder)),
      autoApply: discountType === 'free_shipping' ? autoApply : false,
      expiresAt: expiresAt || undefined,
      isActive: true,
    };
    saveCoupons([newCoupon, ...coupons.filter((c) => c.code.toUpperCase() !== cleaned)]);
    setCode('');
  };

  const startEdit = (coupon: Coupon) => {
    setEditingId(coupon.id);
    setEditDraft({ ...coupon });
  };

  const commitEdit = () => {
    if (!editingId) return;
    const cleanedCode = String(editDraft.code || '').trim().toUpperCase();
    if (!cleanedCode) return;
    saveCoupons(
      coupons.map((c) =>
        c.id === editingId
          ? {
              ...c,
              code: cleanedCode,
              discountType: editDraft.discountType ?? c.discountType,
              discountValue:
                (editDraft.discountType ?? c.discountType) === 'free_shipping'
                  ? 100
                  : Math.max(1, Number(editDraft.discountValue ?? c.discountValue)),
              minimumOrder: Math.max(0, Number(editDraft.minimumOrder ?? c.minimumOrder)),
              autoApply:
                (editDraft.discountType ?? c.discountType) === 'free_shipping'
                  ? Boolean(editDraft.autoApply)
                  : false,
            }
          : c
      )
    );
    setEditingId(null);
    setEditDraft({});
  };

  const toggleActive = (id: string) => {
    saveCoupons(coupons.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c)));
  };

  const removeCoupon = (id: string) => {
    saveCoupons(coupons.filter((c) => c.id !== id));
  };

  const inputClass =
    'w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E7C7CC] text-sm text-[#3E2F27] focus:outline-none focus:border-[#6D1836]';

  const freeShipCoupon = coupons.find((c) => c.discountType === 'free_shipping');

  return (
    <AdminLayout title="Discounts & Free Delivery Coupons">
      <div className="space-y-8 max-w-5xl">
        {/* Highlight Banner for Customizable Free Delivery Above ₹1,000 Coupon */}
        <section className="bg-[#FFF9F5] border border-[#C9A66B]/60 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6D1836] text-[#FFF9F5] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#3E2F27]">
                Free Delivery Coupon ({freeShipCoupon?.code ?? 'FREESHIP1000'})
              </p>
              <p className="text-xs text-[#7A655C] mt-0.5 leading-relaxed">
                Waives location-based delivery charges on orders above{' '}
                <strong>{formatINR(freeShipCoupon?.minimumOrder ?? 1000)}</strong>. Click the pencil
                icon below to customize the code, minimum cart amount, or auto-apply behavior.
              </p>
            </div>
          </div>
          <Link
            to="/admin/settings"
            className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#E7C7CC] hover:border-[#6D1836] text-xs font-semibold text-[#6D1836] transition-colors"
          >
            <span>Edit Location Delivery Rates →</span>
          </Link>
        </section>

        <form
          onSubmit={handleAddCoupon}
          className="bg-white border border-[#E7C7CC] rounded-2xl p-6 shadow-warm/40 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-[#6D1836]" />
            <h2 className="font-display text-lg font-medium text-[#3E2F27]">
              Create Promo or Free Delivery Coupon
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#7A655C] mb-1">Code *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder={discountType === 'free_shipping' ? 'FREESHIP1000' : 'FESTIVE15'}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A655C] mb-1">Coupon Type</label>
              <select
                value={discountType}
                onChange={(e) =>
                  setDiscountType(e.target.value as 'percentage' | 'fixed' | 'free_shipping')
                }
                className={inputClass}
              >
                <option value="free_shipping">Free Delivery (₹0 Shipping)</option>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A655C] mb-1">
                {discountType === 'free_shipping' ? 'Shipping Waiver' : 'Value'}
              </label>
              {discountType === 'free_shipping' ? (
                <input
                  type="text"
                  disabled
                  value="100% Free Delivery"
                  className={`${inputClass} bg-[#F8EFEA] text-[#7A655C]`}
                />
              ) : (
                <input
                  type="number"
                  min={1}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  className={inputClass}
                />
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A655C] mb-1">
                Min Order (₹)
              </label>
              <input
                type="number"
                min={0}
                value={minimumOrder}
                onChange={(e) => setMinimumOrder(Number(e.target.value))}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A655C] mb-1">
                Expires (Opt)
              </label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {discountType === 'free_shipping' ? (
              <label className="inline-flex items-center gap-2 text-xs text-[#3E2F27] cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoApply}
                  onChange={(e) => setAutoApply(e.target.checked)}
                  className="rounded border-[#E7C7CC] text-[#6D1836]"
                />
                <span>Auto-apply this free delivery coupon when cart reaches minimum order</span>
              </label>
            ) : (
              <span />
            )}

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-white text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Coupon</span>
            </button>
          </div>
        </form>

        <div className="bg-white border border-[#E7C7CC] rounded-2xl shadow-warm/40 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#E7C7CC] bg-[#FFF9F5]/50 text-xs text-[#7A655C]">
                <th className="py-3.5 px-4 font-medium">Promo Code</th>
                <th className="py-3.5 px-4 font-medium">Benefit</th>
                <th className="py-3.5 px-4 font-medium">Min Order</th>
                <th className="py-3.5 px-4 font-medium">Status</th>
                <th className="py-3.5 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7C7CC]">
              {coupons.map((c) => {
                const isEditing = editingId === c.id;
                return (
                  <tr key={c.id} className="hover:bg-[#FFF9F5]/60">
                    <td className="py-3.5 px-4 font-semibold text-[#3E2F27]">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editDraft.code ?? ''}
                          onChange={(e) =>
                            setEditDraft({ ...editDraft, code: e.target.value.toUpperCase() })
                          }
                          className="px-2.5 py-1.5 rounded-lg border border-[#6D1836] text-xs w-36"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>{c.code}</span>
                          {c.discountType === 'free_shipping' && c.autoApply && (
                            <span className="px-2 py-0.5 rounded bg-[#C9A66B]/20 text-[#8C6B3F] text-[10px] font-semibold">
                              Auto-Apply
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 tabular-nums">
                      {isEditing ? (
                        <div className="flex items-center gap-2">
                          {editDraft.discountType === 'free_shipping' ? (
                            <label className="inline-flex items-center gap-1.5 text-xs">
                              <input
                                type="checkbox"
                                checked={Boolean(editDraft.autoApply)}
                                onChange={(e) =>
                                  setEditDraft({ ...editDraft, autoApply: e.target.checked })
                                }
                              />
                              <span>Auto-apply Free Delivery</span>
                            </label>
                          ) : (
                            <input
                              type="number"
                              min={1}
                              value={editDraft.discountValue ?? 10}
                              onChange={(e) =>
                                setEditDraft({
                                  ...editDraft,
                                  discountValue: Number(e.target.value),
                                })
                              }
                              className="px-2.5 py-1.5 rounded-lg border border-[#E7C7CC] text-xs w-24"
                            />
                          )}
                        </div>
                      ) : c.discountType === 'free_shipping' ? (
                        <span className="inline-flex items-center gap-1 text-[#6D1836] font-medium">
                          <Truck className="w-3.5 h-3.5" />
                          <span>Free Delivery (₹0 Shipping)</span>
                        </span>
                      ) : c.discountType === 'percentage' ? (
                        `${c.discountValue}% off`
                      ) : (
                        `${formatINR(c.discountValue)} off`
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#7A655C] tabular-nums">
                      {isEditing ? (
                        <input
                          type="number"
                          min={0}
                          value={editDraft.minimumOrder ?? 0}
                          onChange={(e) =>
                            setEditDraft({
                              ...editDraft,
                              minimumOrder: Number(e.target.value),
                            })
                          }
                          className="px-2.5 py-1.5 rounded-lg border border-[#E7C7CC] text-xs w-28"
                        />
                      ) : (
                        formatINR(c.minimumOrder)
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          c.isActive
                            ? 'bg-[#C9A66B]/15 text-[#8C6B3F]'
                            : 'bg-[#E7C7CC] text-[#7A655C]'
                        }`}
                      >
                        {c.isActive ? 'Active' : 'Paused'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={commitEdit}
                              className="p-1.5 text-[#6D1836] hover:bg-[#F8EFEA] rounded-lg"
                              title="Save coupon changes"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingId(null);
                                setEditDraft({});
                              }}
                              className="p-1.5 text-[#7A655C] hover:bg-[#F8EFEA] rounded-lg"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => startEdit(c)}
                              className="p-1.5 text-[#7A655C] hover:text-[#6D1836]"
                              title="Customize coupon"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
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
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};
