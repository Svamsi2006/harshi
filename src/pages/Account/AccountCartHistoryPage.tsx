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
    tone: 'text-[#C86D51] bg-[#C86D51]/10 border-[#C86D51]/25',
  },
  removed: {
    label: 'Previously Removed',
    icon: <Trash2 className="w-3.5 h-3.5" />,
    tone: 'text-[#6E655F] bg-[#F3EDE2] border-[#EAE3D5]',
  },
  checked_out: {
    label: 'Checked Out',
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    tone: 'text-[#495B47] bg-[#7A9178]/15 border-[#7A9178]/30',
  },
};

export const AccountCartHistoryPage: React.FC = () => {
  const { user, cartHistory, addToCart, loginAsDemoCustomer } = useStore();

  if (!user) {
    return (
      <PageTransition className="py-14 px-4 max-w-2xl mx-auto">
        <EmptyState
          title="Sign in to view cart history"
          description="Your saved-for-later pieces and past bag activity are private to your account."
          actionLabel="Sign In"
          actionTo="/login"
        />
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={loginAsDemoCustomer}
            className="text-sm font-medium text-[#C86D51]"
          >
            Sign in with Demo Collector Account →
          </button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="font-handwritten text-2xl text-[#C86D51]">Past Studio Activity</p>
          <h1 className="font-display text-3xl sm:text-4xl font-medium text-[#2B2623]">
            Cart History
          </h1>
          <p className="text-sm text-[#6E655F] mt-1">
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
              <div className="bg-white border border-[#EAE3D5] rounded-2xl divide-y divide-[#EAE3D5] shadow-warm/40">
                {cartHistory.map((entry) => {
                  const product = getProductById(entry.productId);
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
                          className="w-16 h-16 rounded-xl overflow-hidden border border-[#EAE3D5] bg-[#F3EDE2] shrink-0"
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
                            className="block font-display text-base font-medium text-[#2B2623] hover:text-[#C86D51] truncate"
                          >
                            {product.name}
                          </Link>
                          <p className="text-xs text-[#6E655F]">
                            {formatINR(entry.priceAtEvent)} · Qty {entry.quantity} ·{' '}
                            {formatDate(entry.timestamp)}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => addToCart(product.id, 1, true)}
                        disabled={product.stock <= 0}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#C86D51] text-[#2B2623] hover:text-white border border-[#EAE3D5] hover:border-[#C86D51] text-xs font-medium transition-colors whitespace-nowrap shrink-0"
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
