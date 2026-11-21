import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Tag, Check, MapPin, Truck, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatINR } from '../../utils/format';
import { calculateLocationShipping } from '../../utils/shipping';
import { PageTransition } from '../../components/common/PageTransition';
import { EmptyState } from '../../components/common/EmptyState';
import { CartItemRow } from '../../components/cart/CartItem';
import { ProductGrid } from '../../components/product/ProductGrid';

const POPULAR_INDIAN_STATES = [
  'Maharashtra',
  'Delhi',
  'Karnataka',
  'Telangana',
  'Tamil Nadu',
  'Gujarat',
  'West Bengal',
  'Rajasthan',
  'Uttar Pradesh',
  'Kerala',
  'Madhya Pradesh',
  'Andhra Pradesh',
  'Punjab',
  'Assam',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'International',
];

export const CartPage: React.FC = () => {
  const { user, products, coupons, storeSettings, addresses, cart, cartCount, cartSubtotal, addToast } =
    useStore();
  const navigate = useNavigate();

  const defaultAddr = addresses.find((a) => a.isDefault) ?? addresses[0];
  const [estimateState, setEstimateState] = useState<string>(
    defaultAddr?.state || storeSettings.studioOriginState || 'Maharashtra'
  );
  const [estimatePin, setEstimatePin] = useState<string>(defaultAddr?.postalCode || '');

  const [promoCode, setPromoCode] = useState('');
  const [appliedCode, setAppliedCode] = useState<string | null>(null);

  const locationShipping = useMemo(
    () =>
      calculateLocationShipping({
        country: estimateState === 'International' ? 'International' : 'India',
        state: estimateState === 'International' ? '' : estimateState,
        postalCode: estimatePin,
        subtotal: cartSubtotal,
        zones: storeSettings.shippingZones,
        originState: storeSettings.studioOriginState,
        freeShippingThreshold: storeSettings.freeShippingThreshold,
        coupons,
        appliedCouponCode: appliedCode,
      }),
    [
      estimateState,
      estimatePin,
      cartSubtotal,
      storeSettings.shippingZones,
      storeSettings.studioOriginState,
      storeSettings.freeShippingThreshold,
      coupons,
      appliedCode,
    ]
  );

  const primaryFreeShipCoupon = useMemo(
    () =>
      coupons
        .filter((c) => c.isActive && c.discountType === 'free_shipping')
        .sort((a, b) => a.minimumOrder - b.minimumOrder)[0] ?? null,
    [coupons]
  );

  const matchedCoupon = coupons.find((c) => c.code === appliedCode && c.isActive);
  const discount = matchedCoupon
    ? matchedCoupon.discountType === 'free_shipping'
      ? 0
      : matchedCoupon.discountType === 'percentage'
        ? Math.round((cartSubtotal * matchedCoupon.discountValue) / 100)
        : matchedCoupon.discountValue
    : appliedCode === 'STUDIO10'
      ? Math.round(cartSubtotal * 0.1)
      : 0;

  const effectiveShippingFee = locationShipping.finalFee;
  const finalTotal = Math.max(0, cartSubtotal + effectiveShippingFee - discount);

  const handleProceedToCheckout = () => {
    const activeCouponToCarry = appliedCode || locationShipping.freeDeliveryCoupon?.code || '';
    try {
      if (discount > 0) {
        sessionStorage.setItem('varniks_checkout_discount', String(discount));
      } else {
        sessionStorage.removeItem('varniks_checkout_discount');
      }
      if (activeCouponToCarry) {
        sessionStorage.setItem('varniks_checkout_coupon', activeCouponToCarry);
      } else {
        sessionStorage.removeItem('varniks_checkout_coupon');
      }
    } catch {
      // ignore
    }

    if (!user) {
      addToast(
        'Sign in required for checkout',
        'Log in with Google or email to enter your address & track your order.',
        'info'
      );
      navigate('/login?redirect=%2Fcheckout', {
        state: { from: '/checkout', discount, couponCode: activeCouponToCarry || undefined },
      });
      return;
    }

    navigate('/checkout', {
      state: { discount, couponCode: activeCouponToCarry || undefined },
    });
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = promoCode.trim().toUpperCase();
    if (!cleaned) return;
    const found = coupons.find((c) => c.code.toUpperCase() === cleaned && c.isActive);
    if (found) {
      if (cartSubtotal < found.minimumOrder) {
        addToast(
          'Minimum order not met',
          `Spend at least ${formatINR(found.minimumOrder)} to apply ${found.code}.`,
          'info'
        );
        return;
      }
      setAppliedCode(found.code);
      if (found.discountType === 'free_shipping') {
        addToast('Free delivery coupon applied', `${found.code} waives your delivery charge.`, 'success');
      } else {
        addToast('Studio promo applied', `${found.code} discount added`, 'success');
      }
    } else if (cleaned === 'STUDIO10' || cleaned === 'VARNIKS10') {
      setAppliedCode('STUDIO10');
      addToast('Studio promo applied', '10% welcome discount added', 'success');
    } else {
      addToast(
        'Invalid code',
        `Try ${primaryFreeShipCoupon?.code || 'FREESHIP1000'} (orders ₹${primaryFreeShipCoupon?.minimumOrder ?? 1000}+) or STUDIO10.`,
        'info'
      );
    }
  };

  const suggested = products
    .filter((p) => !cart.some((c) => c.productId === p.id))
    .slice(0, 4);

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

              {/* Free Delivery Progress / Coupon Notice */}
              {locationShipping.zone.id !== 'international' && (
                <div className="rounded-xl bg-[#FFF9F5] border border-[#E7C7CC] p-3.5 space-y-2">
                  {locationShipping.freeDeliveryApplied ? (
                    <div className="flex items-start gap-2 text-xs text-[#3E2F27]">
                      <Truck className="w-4 h-4 text-[#6D1836] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-[#6D1836]">
                          Free Delivery Unlocked!
                          {locationShipping.freeDeliveryCoupon && (
                            <span className="ml-1.5 font-mono text-[11px] bg-[#6D1836]/10 px-1.5 py-0.5 rounded">
                              {locationShipping.freeDeliveryCoupon.code}
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] text-[#7A655C] mt-0.5">
                          You saved {formatINR(locationShipping.baseFee)} on {locationShipping.zone.name}.
                        </p>
                      </div>
                    </div>
                  ) : locationShipping.eligibleFreeDeliveryCoupon ? (
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-start gap-2 text-[#3E2F27]">
                        <Sparkles className="w-4 h-4 text-[#C9A66B] shrink-0 mt-0.5" />
                        <span>
                          Eligible for Free Delivery with{' '}
                          <strong className="font-mono text-[#6D1836]">
                            {locationShipping.eligibleFreeDeliveryCoupon.code}
                          </strong>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const code = locationShipping.eligibleFreeDeliveryCoupon!.code;
                          setPromoCode(code);
                          setAppliedCode(code);
                          addToast('Free delivery applied', `${code} waived shipping.`, 'success');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-[#6D1836] text-white text-[11px] font-medium shrink-0 hover:bg-[#541129]"
                      >
                        Apply
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 text-xs text-[#7A655C]">
                      <Truck className="w-4 h-4 text-[#C9A66B] shrink-0 mt-0.5" />
                      <span>
                        Add <strong className="text-[#3E2F27]">{formatINR(locationShipping.amountNeededForFreeDelivery)}</strong> more to unlock{' '}
                        <strong className="text-[#6D1836]">Free Delivery</strong>
                        {primaryFreeShipCoupon ? ` (Code: ${primaryFreeShipCoupon.code})` : ''}.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Location-Based Delivery Estimator */}
              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-1.5 text-xs font-medium text-[#7A655C]">
                  <MapPin className="w-3.5 h-3.5 text-[#6D1836]" />
                  <span>Estimate Delivery by Location</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={estimateState}
                    onChange={(e) => setEstimateState(e.target.value)}
                    aria-label="Delivery state"
                    className="w-full px-2.5 py-2 rounded-xl bg-[#FFF9F5] border border-[#E7C7CC] text-xs text-[#3E2F27] focus:outline-none focus:border-[#6D1836]"
                  >
                    {POPULAR_INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={estimatePin}
                    onChange={(e) => setEstimatePin(e.target.value)}
                    maxLength={8}
                    placeholder="PIN (e.g. 411001)"
                    className="w-full px-2.5 py-2 rounded-xl bg-[#FFF9F5] border border-[#E7C7CC] text-xs text-[#3E2F27] focus:outline-none focus:border-[#6D1836]"
                  />
                </div>
                <p className="text-[11px] text-[#7A655C]">
                  Zone: <strong className="text-[#3E2F27]">{locationShipping.zone.name}</strong> · ETA{' '}
                  {locationShipping.eta}
                </p>
              </div>

              {/* Discount / Free Delivery Coupon UI */}
              <form onSubmit={handleApplyPromo} className="space-y-2">
                <label className="block text-xs font-medium text-[#7A655C]">
                  Studio Gift / Free Delivery Coupon
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-[#7A655C] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder={primaryFreeShipCoupon?.code || 'FREESHIP1000 or STUDIO10'}
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
                    <span>
                      {matchedCoupon?.discountType === 'free_shipping'
                        ? `${appliedCode} applied (Free Delivery)`
                        : `${appliedCode} applied (-${formatINR(discount)})`}
                    </span>
                  </p>
                )}
              </form>

              <div className="space-y-2.5 pt-3 border-t border-[#E7C7CC] text-sm">
                <div className="flex justify-between text-[#7A655C]">
                  <span>Subtotal</span>
                  <span className="tabular-nums text-[#3E2F27]">{formatINR(cartSubtotal)}</span>
                </div>
                <div className="flex justify-between text-[#7A655C] gap-2">
                  <span className="truncate">Delivery ({locationShipping.zone.name})</span>
                  <span className="tabular-nums text-[#C9A66B] font-medium shrink-0">
                    {effectiveShippingFee === 0 ? 'Free' : formatINR(effectiveShippingFee)}
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

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-white text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors"
                >
                  <span>{user ? 'Proceed to Checkout' : 'Sign In & Proceed to Checkout'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                {!user && (
                  <p className="text-[11px] text-center text-[#7A655C] leading-relaxed">
                    Sign in is required to enter your delivery address &amp; track your order. Your bag items stay saved automatically.
                  </p>
                )}
              </div>
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
