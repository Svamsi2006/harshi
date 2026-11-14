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
        <div className="relative bg-white border border-[#EAE3D5] rounded-3xl p-7 sm:p-10 shadow-warm overflow-hidden">
          <BotanicalSprig className="hidden sm:block absolute -right-4 -top-4 w-24 h-28 text-[#7A9178]/25 rotate-12" />

          {/* Hand-drawn celebration badge */}
          <div className="text-center space-y-3 pb-8 border-b border-[#EAE3D5]">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className="w-16 h-16 rounded-full bg-[#7A9178]/15 text-[#7A9178] flex items-center justify-center mx-auto"
            >
              <CheckCircle2 className="w-9 h-9" />
            </motion.div>

            <p className="font-handwritten text-2xl text-[#C86D51]">
              Packed with love from our studio ♡
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-medium text-[#2B2623]">
              Thank You for Your Order!
            </h1>
            {order ? (
              <p className="text-sm text-[#6E655F]">
                Order <strong className="text-[#2B2623]">#{order.orderNumber}</strong> confirmed ·
                Payment via{' '}
                <span className="capitalize font-medium text-[#2B2623]">
                  {order.paymentMethod}
                </span>{' '}
                ({order.paymentStatus})
              </p>
            ) : (
              <p className="text-sm text-[#6E655F]">
                Your order confirmation details have been recorded.
              </p>
            )}
          </div>

          {order && (
            <div className="py-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#FAF7F2] border border-[#EAE3D5] text-sm">
                <div className="flex items-center gap-2.5">
                  <Package className="w-5 h-5 text-[#C86D51]" />
                  <div>
                    <p className="font-medium text-[#2B2623]">Estimated Studio Delivery</p>
                    <p className="text-xs text-[#6E655F]">
                      Expected arrival by {order.estimatedDelivery}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-medium text-[#7A9178]">
                  Tracking: {order.trackingCode}
                </span>
              </div>

              <div>
                <h2 className="font-display text-lg font-medium text-[#2B2623] mb-3">
                  Purchased Artworks
                </h2>
                <ul className="divide-y divide-[#EAE3D5]">
                  {order.items.map((item) => (
                    <li key={item.productId} className="py-3 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-lg overflow-hidden border border-[#EAE3D5] bg-[#F3EDE2] shrink-0">
                        <ResilientImage
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[#2B2623] truncate">{item.name}</p>
                        <p className="text-xs text-[#6E655F]">Quantity: {item.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold text-[#2B2623] tabular-nums">
                        {formatINR(item.price * item.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-[#EAE3D5] space-y-1.5 text-sm">
                <div className="flex justify-between text-[#6E655F]">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatINR(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#6E655F]">
                  <span>Shipping</span>
                  <span className="tabular-nums">
                    {order.shippingFee === 0 ? 'Free' : formatINR(order.shippingFee)}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-[#7A9178]">
                    <span>Discount</span>
                    <span className="tabular-nums">-{formatINR(order.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 text-base font-semibold text-[#2B2623]">
                  <span>Total Paid</span>
                  <span className="tabular-nums">{formatINR(order.total)}</span>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/account/orders"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#C86D51] hover:bg-[#B2593E] text-white text-sm font-medium text-center transition-colors"
            >
              View My Orders
            </Link>
            <Link
              to="/shop"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-[#EAE3D5] hover:border-[#C86D51] text-sm font-medium text-[#2B2623] inline-flex items-center justify-center gap-1.5 transition-colors"
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
