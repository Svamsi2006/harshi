import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Truck, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { FREE_SHIPPING_THRESHOLD, formatINR } from '../../utils/format';
import { CartItemRow } from './CartItem';

export const CartDrawer: React.FC = () => {
  const {
    user,
    cart,
    cartCount,
    cartSubtotal,
    shippingFee,
    isCartDrawerOpen,
    closeCartDrawer,
  } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isCartDrawerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCartDrawer();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isCartDrawerOpen, closeCartDrawer]);

  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - cartSubtotal);
  const progressPercent = Math.min(100, Math.round((cartSubtotal / FREE_SHIPPING_THRESHOLD) * 100));

  return (
    <AnimatePresence>
      {isCartDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={closeCartDrawer}
            className="fixed inset-0 bg-[#3E2F27]/35 backdrop-blur-xs"
            aria-hidden="true"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            role="dialog"
            aria-modal="true"
            aria-label="Shopping bag"
            className="relative w-full sm:w-[430px] h-full bg-[#FFF9F5] border-l border-[#E7C7CC] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="px-5 py-4 bg-white border-b border-[#E7C7CC] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-[#6D1836]" strokeWidth={1.75} />
                <h2 className="font-display text-lg font-medium text-[#3E2F27]">
                  Your Studio Bag ({cartCount})
                </h2>
              </div>
              <button
                type="button"
                onClick={closeCartDrawer}
                className="p-2 text-[#7A655C] hover:text-[#3E2F27] rounded-lg transition-colors"
                aria-label="Close bag"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free shipping meter */}
            {cart.length > 0 && (
              <div className="px-5 py-3 bg-[#F8EFEA]/80 border-b border-[#E7C7CC]">
                <div className="flex items-center gap-2 text-xs text-[#3E2F27] mb-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#C9A66B] shrink-0" />
                  {remainingForFreeShipping === 0 ? (
                    <span>You&apos;ve unlocked complimentary studio shipping ♡</span>
                  ) : (
                    <span>
                      Add <strong>{formatINR(remainingForFreeShipping)}</strong> more for free
                      shipping
                    </span>
                  )}
                </div>
                <div className="h-1.5 w-full rounded-full bg-[#E7C7CC] overflow-hidden">
                  <div
                    className="h-full bg-[#C9A66B] transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                  <div className="w-16 h-16 rounded-full bg-[#F8EFEA] text-[#6D1836] flex items-center justify-center mb-4">
                    <ShoppingBag className="w-7 h-7" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-display text-xl text-[#3E2F27]">Your bag is empty</h3>
                  <p className="text-sm text-[#7A655C] mt-2 max-w-xs leading-relaxed">
                    Explore original pencil sketches, hand-sculpted terracotta, and archival prints
                    from our studio.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      closeCartDrawer();
                      navigate('/shop');
                    }}
                    className="mt-6 px-6 py-2.5 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-white text-sm font-medium transition-colors"
                  >
                    Explore the Collection
                  </button>
                </div>
              ) : (
                <div className="py-2">
                  {cart.map((item) => (
                    <CartItemRow
                      key={item.productId}
                      item={item}
                      compact
                      onNavigate={closeCartDrawer}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer totals & CTA */}
            {cart.length > 0 && (
              <div className="p-5 bg-white border-t border-[#E7C7CC] space-y-3">
                <div className="space-y-1.5 text-sm">
                  <div className="flex items-center justify-between text-[#7A655C]">
                    <span>Subtotal</span>
                    <span className="tabular-nums font-medium text-[#3E2F27]">
                      {formatINR(cartSubtotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[#7A655C]">
                    <span>Studio packing & shipping</span>
                    <span className="tabular-nums font-medium text-[#C9A66B]">
                      {shippingFee === 0 ? 'Free' : formatINR(shippingFee)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      closeCartDrawer();
                      if (!user) {
                        navigate('/login?redirect=%2Fcheckout', { state: { from: '/checkout' } });
                      } else {
                        navigate('/checkout');
                      }
                    }}
                    className="w-full py-3 px-5 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-white text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors"
                  >
                    <span>{user ? 'Proceed to Checkout' : 'Sign In & Checkout'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  {!user && (
                    <p className="text-[11px] text-center text-[#7A655C]">
                      Sign in is required to enter your address &amp; track your order.
                    </p>
                  )}
                  <div className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={closeCartDrawer}
                      className="flex-1 py-2.5 px-3 rounded-xl border border-[#E7C7CC] text-xs font-medium text-[#3E2F27] hover:bg-[#FFF9F5] transition-colors"
                    >
                      Continue Shopping
                    </button>
                    <Link
                      to="/cart"
                      onClick={closeCartDrawer}
                      className="flex-1 py-2.5 px-3 rounded-xl border border-[#E7C7CC] text-xs font-medium text-center text-[#3E2F27] hover:bg-[#FFF9F5] transition-colors"
                    >
                      View Full Bag
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
