import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Bookmark, Trash2, CheckCircle2 } from 'lucide-react';
import { getProductById } from '../../data/products';
import { formatDate, formatINR } from '../../utils/format';
import { useStore } from '../../context/StoreContext';
import { PageTransition } from '../../components/common/PageTransition';
import { EmptyState } from '../../components/common/EmptyState';
import { ResilientImage } from '../../components/common/ResilientImage';
import { AccountSidebar } from '../../components/account/AccountSidebar';

const ACTION_META = {
  saved: {
    label: 'Saved from Bag',
    icon: <Bookmark className="w-3.5 h-3.5" />,
    tone: 'text-[#6D1836] bg-[#6D1836]/10 border-[#6D1836]/25',
  },
  removed: {
    label: 'Previously Removed',
    icon: <Trash2 className="w-3.5 h-3.5" />,
    tone: 'text-[#7A655C] bg-[#F8EFEA] border-[#E7C7CC]',
  },
  checked_out: {
    label: 'Checked Out',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    tone: 'text-[#8C6B3F] bg-[#C9A66B]/15 border-[#C9A66B]/30',
  },
};

export const AccountCartHistoryPage: React.FC = () => {
  const { user, products, cartHistory, addToCart } = useStore();

  if (!user) {
    return (
      <PageTransition className="py-14 px-4 max-w-2xl mx-auto">
        <EmptyState
          title="Sign in to view cart history"
          description="Your saved-for-later pieces and past bag activity are private to your account."
          actionLabel="Sign In"
          actionTo="/login"
        />
      </PageTransition>
    );
  }

  return (
    <PageTransition className="py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="font-handwritten text-2xl text-[#6D1836]">Past Studio Activity</p>
          <h1 className="font-display text-3xl sm:text-4xl font-medium text-[#3E2F27]">
            Cart History
          </h1>
          <p className="text-sm text-[#7A655C] mt-1">
            Items saved for later, removed, or previously checked out — separate from your current
            active studio bag.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-3">
            <AccountSidebar />
          </div>

          <div className="lg:col-span-9">
            {cartHistory.length === 0 ? (
              <EmptyState
                title="No past bag activity yet"
                description="Items you save for later, remove, or check out will appear here for easy re-discovery."
                actionLabel="Browse Collection"
                actionTo="/shop"
              />
            ) : (
              <div className="bg-white border border-[#E7C7CC] rounded-2xl divide-y divide-[#E7C7CC] shadow-warm/40">
                {cartHistory.map((entry) => {
                  const product =
                    products.find((p) => p.id === entry.productId) ??
                    getProductById(entry.productId);
                  if (!product) return null;
                  const meta = ACTION_META[entry.action];

                  return (
                    <div
                      key={entry.id}
                      className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <Link
                          to={`/product/${product.slug}`}
                          className="w-16 h-16 rounded-xl overflow-hidden border border-[#E7C7CC] bg-[#F8EFEA] shrink-0"
                        >
                          <ResilientImage
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </Link>
                        <div className="min-w-0 space-y-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md border text-[11px] font-medium ${meta.tone}`}
                          >
                            {meta.icon}
                            <span>{meta.label}</span>
                          </span>
                          <Link
                            to={`/product/${product.slug}`}
                            className="block font-display text-base font-medium text-[#3E2F27] hover:text-[#6D1836] truncate"
                          >
                            {product.name}
                          </Link>
                          <p className="text-xs text-[#7A655C]">
                            {formatINR(entry.priceAtEvent)} · Qty {entry.quantity} ·{' '}
                            {formatDate(entry.timestamp)}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => addToCart(product.id, 1, true)}
                        disabled={product.stock <= 0}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FFF9F5] hover:bg-[#6D1836] text-[#3E2F27] hover:text-white border border-[#E7C7CC] hover:border-[#6D1836] text-xs font-medium transition-colors whitespace-nowrap shrink-0"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Re-add to Cart</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
