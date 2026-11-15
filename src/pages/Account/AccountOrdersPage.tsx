import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, FileCheck2, FileX2, ShieldCheck, Sparkles } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatINR } from '../../utils/format';
import { PageTransition } from '../../components/common/PageTransition';
import { EmptyState } from '../../components/common/EmptyState';
import { ProductGridSkeleton } from '../../components/common/LoadingSkeleton';
import { AccountSidebar } from '../../components/account/AccountSidebar';
import { OrderCard } from '../../components/account/OrderCard';

export const AccountOrdersPage: React.FC = () => {
  const {
    user,
    orders,
    commissions,
    loginAsDemoCustomer,
  } = useStore();
  const [loadingPreview, setLoadingPreview] = useState(false);

  const myCustomRequests = useMemo(() => {
    if (!user) return [];
    return commissions.filter(
      (c) =>
        c.customerId === user.id ||
        c.email.toLowerCase() === user.email.toLowerCase() ||
        c.customerId === 'guest'
    );
  }, [commissions, user]);

  if (!user) {
    return (
      <PageTransition className="py-14 px-4 max-w-2xl mx-auto">
        <EmptyState
          title="Sign in to view your orders"
          description="Track your shipped parcels, check custom order waiting list approvals, and view itemized studio receipts."
          actionLabel="Sign In"
          actionTo="/login"
        />
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={loginAsDemoCustomer}
            className="text-sm font-medium text-[#6D1836] hover:text-[#541129]"
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
            <p className="font-handwritten text-2xl text-[#6D1836]">Order Tracking</p>
            <h1 className="font-display text-3xl sm:text-4xl font-medium text-[#3E2F27]">
              My Orders &amp; Custom Waiting List
            </h1>
          </div>
          <button
            type="button"
            onClick={() => {
              setLoadingPreview(true);
              window.setTimeout(() => setLoadingPreview(false), 650);
            }}
            className="self-start text-xs font-medium text-[#7A655C] hover:text-[#6D1836] underline underline-offset-4"
          >
            Refresh Order Status
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-3">
            <AccountSidebar />
          </div>

          <div className="lg:col-span-9 space-y-6">
            {/* Custom Orders Waiting List Tracker */}
            {myCustomRequests.length > 0 && (
              <div className="bg-[#F8EFEA] border border-[#E7C7CC] rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#6D1836]" />
                    <h2 className="font-display text-lg font-medium text-[#3E2F27]">
                      Custom Orders Waiting List ({myCustomRequests.length})
                    </h2>
                  </div>
                  <Link
                    to="/custom-orders"
                    className="text-xs font-semibold text-[#6D1836] hover:text-[#541129]"
                  >
                    + New Custom Order
                  </Link>
                </div>

                <div className="space-y-3">
                  {myCustomRequests.map((req) => (
                    <div
                      key={req.id}
                      className="bg-white border border-[#E7C7CC] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono text-[#7A655C]">{req.id}</span>
                          <span className="font-medium text-sm text-[#3E2F27]">
                            {req.customIdea || req.artworkType}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-[11px]">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border ${
                              req.hasUploadedFile
                                ? 'bg-[#FFF9F5] border-[#C9A66B] text-[#3E2F27]'
                                : 'bg-[#F8EFEA] border-[#E7C7CC] text-[#7A655C]'
                            }`}
                          >
                            {req.hasUploadedFile ? (
                              <FileCheck2 className="w-3 h-3 text-[#C9A66B]" />
                            ) : (
                              <FileX2 className="w-3 h-3" />
                            )}
                            <span>{req.hasUploadedFile ? 'File Uploaded ✓' : 'No File'}</span>
                          </span>

                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border ${
                              req.adminApproved
                                ? 'bg-[#6D1836]/10 border-[#6D1836]/30 text-[#6D1836]'
                                : 'bg-[#F8EFEA] border-[#E7C7CC] text-[#7A655C]'
                            }`}
                          >
                            {req.adminApproved ? (
                              <ShieldCheck className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            <span>
                              {req.adminApproved ? 'Admin Approved ✓' : 'Pending Admin Approval'}
                            </span>
                          </span>

                          <span className="text-[#3E2F27] font-semibold tabular-nums">
                            {formatINR(req.quotedPrice ?? req.predictedPrice ?? 1499)}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {req.orderCreated ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C9A66B]/25 text-[#3E2F27] text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#6D1836]" />
                            <span>Order Created</span>
                          </span>
                        ) : req.adminApproved ? (
                          <Link
                            to={`/checkout?customRequestId=${encodeURIComponent(req.id)}`}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-[#FFF9F5] text-xs font-medium transition-colors"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve &amp; Enter Address/Payment</span>
                          </Link>
                        ) : (
                          <span className="text-xs text-[#7A655C]">In Waiting List</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {loadingPreview ? (
              <ProductGridSkeleton count={2} />
            ) : orders.length === 0 ? (
              <EmptyState
                title="No orders placed yet"
                description="Once you place an order at varniks_atelier, your tracking timeline and itemized receipt will appear here."
                actionLabel="Shop All Works"
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
