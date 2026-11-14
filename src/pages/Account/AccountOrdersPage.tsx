import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { PageTransition } from '../../components/common/PageTransition';
import { EmptyState } from '../../components/common/EmptyState';
import { ProductGridSkeleton } from '../../components/common/LoadingSkeleton';
import { AccountSidebar } from '../../components/account/AccountSidebar';
import { OrderCard } from '../../components/account/OrderCard';

export const AccountOrdersPage: React.FC = () => {
  const { user, orders, loginAsDemoCustomer } = useStore();
  const [loadingPreview, setLoadingPreview] = useState(false);

  if (!user) {
    return (
      <PageTransition className="py-14 px-4 max-w-2xl mx-auto">
        <EmptyState
          title="Sign in to view your orders"
          description="Track your shipped parcels, view itemized studio receipts, and reorder prints."
          actionLabel="Sign In"
          actionTo="/login"
        />
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={loginAsDemoCustomer}
            className="text-sm font-medium text-[#C86D51] hover:text-[#B2593E]"
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
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="font-handwritten text-2xl text-[#C86D51]">Order Tracking</p>
            <h1 className="font-display text-3xl sm:text-4xl font-medium text-[#2B2623]">
              My Orders
            </h1>
          </div>
          <button
            type="button"
            onClick={() => {
              setLoadingPreview(true);
              window.setTimeout(() => setLoadingPreview(false), 650);
            }}
            className="self-start text-xs font-medium text-[#6E655F] hover:text-[#C86D51] underline underline-offset-4"
          >
            Refresh Order Status
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-3">
            <AccountSidebar />
          </div>

          <div className="lg:col-span-9 space-y-5">
            {loadingPreview ? (
              <ProductGridSkeleton count={2} />
            ) : orders.length === 0 ? (
              <EmptyState
                title="No orders placed yet"
                description="Once you place an order at varniks_atelier, your tracking timeline and itemized receipt will appear here."
                actionLabel="Explore the Collection"
                actionTo="/shop"
              />
            ) : (
              orders.map((order) => <OrderCard key={order.id} order={order} />)
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
