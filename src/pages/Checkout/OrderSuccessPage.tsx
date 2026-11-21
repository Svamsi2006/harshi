import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { CheckCircle2, Package, ArrowRight } from 'lucide-react';
import type { Order } from '../../types';
import { useStore } from '../../context/StoreContext';
import { formatINR } from '../../utils/format';
import { PageTransition } from '../../components/common/PageTransition';
import { ResilientImage } from '../../components/common/ResilientImage';
import { BotanicalSprig } from '../../components/common/BotanicalDecorations';

export const OrderSuccessPage: React.FC = () => {
  const { lastPlacedOrder, orders } = useStore();
  const location = useLocation();
  const stateOrder = (location.state as { order?: Order } | null)?.order;
  const order = stateOrder ?? lastPlacedOrder ?? orders[0];

  return (
    <PageTransition className="py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-white border border-[#E7C7CC] rounded-3xl p-7 sm:p-10 shadow-warm overflow-hidden">
          <BotanicalSprig className="hidden sm:block absolute -right-4 -top-4 w-24 h-28 text-[#C9A66B]/25 rotate-12" />

          {/* Hand-drawn celebration badge */}
          <div className="text-center space-y-3 pb-8 border-b border-[#E7C7CC]">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className="w-16 h-16 rounded-full bg-[#C9A66B]/15 text-[#C9A66B] flex items-center justify-center mx-auto"
            >
              <CheckCircle2 className="w-9 h-9" />
            </motion.div>

            <p className="font-handwritten text-2xl text-[#6D1836]">
              Packed with love from our studio ♡
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-medium text-[#3E2F27]">
              Thank You for Your Order!
            </h1>
            {order ? (
              <p className="text-sm text-[#7A655C]">
                Order <strong className="text-[#3E2F27]">#{order.orderNumber}</strong> · Status:{' '}
                <strong className="text-[#6D1836]">
                  {order.orderStatus === 'Pending'
                    ? 'Pending Studio Confirmation'
                    : order.orderStatus}
                </strong>{' '}
                · Payment via{' '}
                <span className="capitalize font-medium text-[#3E2F27]">
                  {order.paymentMethod}
                </span>{' '}
                ({order.paymentStatus})
              </p>
            ) : (
              <p className="text-sm text-[#7A655C]">
                Your order details have been recorded under your account.
              </p>
            )}
          </div>

          {order && (
            <div className="py-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#FFF9F5] border border-[#E7C7CC] text-sm">
                <div className="flex items-center gap-2.5">
                  <Package className="w-5 h-5 text-[#6D1836]" />
                  <div>
                    <p className="font-medium text-[#3E2F27]">Estimated Studio Delivery</p>
                    <p className="text-xs text-[#7A655C]">
                      Expected arrival by {order.estimatedDelivery}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium text-[#C9A66B]">
                  Tracking: {order.trackingCode}
                </span>
              </div>

              {order.shippingAddress && (
                <div className="p-4 rounded-xl bg-[#F8EFEA]/60 border border-[#E7C7CC] text-xs text-[#3E2F27] space-y-1">
                  <p className="font-semibold text-[#6D1836] uppercase tracking-wider text-[11px]">
                    Delivering To
                  </p>
                  <p className="font-medium">{order.shippingAddress.fullName}</p>
                  <p className="text-[#7A655C]">
                    {order.shippingAddress.addressLine}, {order.shippingAddress.city},{' '}
                    {order.shippingAddress.state} {order.shippingAddress.postalCode},{' '}
                    {order.shippingAddress.country}
                  </p>
                  <p className="text-[#7A655C]">
                    {order.customerEmail} · {order.shippingAddress.phone}
                  </p>
                </div>
              )}

              <div>
                <h2 className="font-display text-lg font-medium text-[#3E2F27] mb-3">
                  Purchased Artworks
                </h2>
                <ul className="divide-y divide-[#E7C7CC]">
                  {order.items.map((item) => (
                    <li key={item.productId} className="py-3 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-lg overflow-hidden border border-[#E7C7CC] bg-[#F8EFEA] shrink-0">
                        <ResilientImage
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[#3E2F27] truncate">{item.name}</p>
                        <p className="text-xs text-[#7A655C]">Quantity: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold text-[#3E2F27] tabular-nums">
                        {formatINR(item.price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-[#E7C7CC] space-y-1.5 text-sm">
                <div className="flex justify-between text-[#7A655C]">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatINR(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#7A655C]">
                  <span>Shipping</span>
                  <span className="tabular-nums">
                    {order.shippingFee === 0 ? 'Free' : formatINR(order.shippingFee)}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-[#C9A66B]">
                    <span>Discount</span>
                    <span className="tabular-nums">-{formatINR(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 text-base font-semibold text-[#3E2F27]">
                  <span>Total Paid</span>
                  <span className="tabular-nums">{formatINR(order.total)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/account/orders"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-white text-sm font-medium text-center transition-colors"
            >
              View My Orders
            </Link>
            <Link
              to="/shop"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-[#E7C7CC] hover:border-[#6D1836] text-sm font-medium text-[#3E2F27] inline-flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
