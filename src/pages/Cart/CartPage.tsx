import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Tag, Check } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatINR } from '../../utils/format';
import { PageTransition } from '../../components/common/PageTransition';
import { EmptyState } from '../../components/common/EmptyState';
import { CartItemRow } from '../../components/cart/CartItem';
import { ProductGrid } from '../../components/product/ProductGrid';

export const CartPage: React.FC = () => {
  const { products, coupons, cart, cartCount, cartSubtotal, shippingFee, addToast } = useStore();
  const navigate = useNavigate();

  const [promoCode, setPromoCode] = useState('');
  const [appliedCode, setAppliedCode] = useState<string | null>(null);

  const matchedCoupon = coupons.find((c) => c.code === appliedCode && c.isActive);
  const discount = matchedCoupon
    ? matchedCoupon.discountType === 'percentage'
      ? Math.round((cartSubtotal * matchedCoupon.discountValue) / 100)
      : matchedCoupon.discountValue
    : appliedCode === 'STUDIO10'
      ? Math.round(cartSubtotal * 0.1)
      : 0;
  const finalTotal = Math.max(0, cartSubtotal + shippingFee - discount);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = promoCode.trim().toUpperCase();
    if (!cleaned) return;
    const found = coupons.find((c) => c.code.toUpperCase() === cleaned && c.isActive);
    if (found) {
      if (cartSubtotal < found.minimumOrder) {
        addToast('Minimum order not met', `Spend at least ${formatINR(found.minimumOrder)} to apply ${found.code}.`, 'info');
        return;
      }
      setAppliedCode(found.code);
      addToast('Studio promo applied', `${found.code} discount added`, 'success');
    } else if (cleaned === 'STUDIO10' || cleaned === 'VARNIKS10') {
      setAppliedCode('STUDIO10');
      addToast('Studio promo applied', '10% welcome discount added', 'success');
    } else {
      addToast('Invalid code', 'Try STUDIO10 for a 10% studio welcome gift.', 'info');
    }
  };

  const suggested = products.filter(
    (p) => !cart.some((c) => c.productId === p.id)
  ).slice(0, 4);

  return (
    <PageTransition className="py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        <div className="flex items-end justify-between border-b border-[#E7C7CC] pb-5">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-medium text-[#3E2F27]">
              Your Studio Bag
            </h1>
            <p className="text-sm text-[#7A655C] mt-1 tabular-nums">
              {cartCount} {cartCount === 1 ? 'artwork' : 'artworks'} selected
            </p>
          </div>
          <Link to="/shop" className="text-sm font-medium text-[#6D1836] hover:text-[#541129]">
            Continue Shopping
          </Link>
        </div>

        {cart.length === 0 ? (
          <EmptyState
            title="Your studio bag is currently empty"
            description="Every drawing, sculpture, and print is packed by hand in plastic-free archival wrapping. Browse our shelf to start collecting."
            actionLabel="Explore the Collection"
            actionTo="/shop"
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-8 bg-white border border-[#E7C7CC] rounded-2xl p-5 sm:p-6 shadow-warm/40">
              {cart.map((item) => (
                <CartItemRow key={item.productId} item={item} />
              ))}
            </div>

            {/* Summary Panel */}
            <aside className="lg:col-span-4 bg-white border border-[#E7C7CC] rounded-2xl p-6 shadow-warm space-y-5">
              <h2 className="font-display text-xl font-medium text-[#3E2F27]">Bag Summary</h2>

              {/* Discount Code UI */}
              <form onSubmit={handleApplyPromo} className="space-y-2">
                <label className="block text-xs font-medium text-[#7A655C]">
                  Studio Gift / Discount Code
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-[#7A655C] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Try STUDIO10"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#FFF9F5] border border-[#E7C7CC] text-xs text-[#3E2F27] uppercase focus:outline-none focus:border-[#6D1836]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-[#F8EFEA] hover:bg-[#E7C7CC] text-xs font-medium text-[#3E2F27] transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {appliedCode && (
                  <p className="inline-flex items-center gap-1 text-xs text-[#C9A66B] font-medium">
                    <Check className="w-3.5 h-3.5" />
                    <span>{appliedCode} applied (-{formatINR(discount)})</span>
                  </p>
                )}
              </form>

              <div className="space-y-2.5 pt-3 border-t border-[#E7C7CC] text-sm">
                <div className="flex justify-between text-[#7A655C]">
                  <span>Subtotal</span>
                  <span className="tabular-nums text-[#3E2F27]">{formatINR(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-[#7A655C]">
                  <span>Shipping Estimate</span>
                  <span className="tabular-nums text-[#C9A66B] font-medium">
                    {shippingFee === 0 ? 'Free' : formatINR(shippingFee)}
                  </span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#C9A66B]">
                    <span>Discount</span>
                    <span className="tabular-nums">-{formatINR(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-3 border-t border-[#E7C7CC] text-base font-semibold text-[#3E2F27]">
                  <span>Final Total</span>
                  <span className="tabular-nums">{formatINR(finalTotal)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/checkout', { state: { discount } })}
                className="w-full py-3.5 px-6 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-white text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </aside>
          </div>
        )}

        {/* Suggested Products */}
        <section className="pt-8 border-t border-[#E7C7CC] space-y-6">
          <h2 className="font-display text-2xl font-medium text-[#3E2F27]">
            Pair With Your Collection
          </h2>
          <ProductGrid products={suggested} columns={4} />
        </section>
      </div>
    </PageTransition>
  );
};
