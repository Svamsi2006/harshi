import React, { useState } from 'react';
import { ChevronDown, ChevronUp, RotateCcw, MapPin, PackageCheck } from 'lucide-react';
import type { Order } from '../../types';
import { formatDate, formatINR } from '../../utils/format';
import { useStore } from '../../context/StoreContext';
import { ResilientImage } from '../common/ResilientImage';
import { OrderTracker } from './OrderTracker';

interface OrderCardProps {
  order: Order;
}

export const OrderCard: React.FC<OrderCardProps> = ({ order }) => {
  const [expanded, setExpanded] = useState(false);
  const { addToCart, openCartDrawer } = useStore();

  const handleReorder = () => {
    let added = false;
    order.items.forEach((item) => {
      if (addToCart(item.productId, item.quantity, false)) {
        added = true;
      }
    });
    if (added) openCartDrawer();
  };

  return (
    <article className="bg-white border border-[#E7C7CC] rounded-2xl p-5 shadow-warm/40">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E7C7CC]">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#7A655C]">
            <span className="font-semibold text-[#3E2F27]">Order #{order.orderNumber}</span>
            {order.isCustomOrder && (
              <span className="px-2 py-0.5 rounded bg-[#E7C7CC]/60 text-[#6D1836] text-[10px] font-semibold">
                Custom Order
              </span>
            )}
            <span aria-hidden="true">·</span>
            <span>Placed {formatDate(order.date)}</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#8C6B3F] font-medium">Payment: {order.paymentStatus}</span>
          </div>
          <p className="mt-1.5 text-sm text-[#3E2F27] font-medium">
            {order.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')}
          </p>
          <p className="text-xs text-[#7A655C] mt-0.5">
            Deliver to <strong className="text-[#3E2F27]">{order.shippingAddress.fullName}</strong> (
            {order.shippingAddress.city}, {order.shippingAddress.postalCode}) · Total{' '}
            <span className="tabular-nums font-semibold text-[#3E2F27]">
              {formatINR(order.total)}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {!order.isCustomOrder && (
            <button
              type="button"
              onClick={handleReorder}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E7C7CC] text-xs font-medium text-[#3E2F27] hover:border-[#6D1836] hover:text-[#6D1836] transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reorder</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FFF9F5] border border-[#E7C7CC] text-xs font-medium text-[#3E2F27] hover:bg-[#F8EFEA] transition-colors whitespace-nowrap"
          >
            <span>{expanded ? 'Hide Details' : 'View Full Receipt'}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Product thumbnails & Status tracker */}
      <div className="pt-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-5 flex items-center gap-2.5 overflow-x-auto">
          {order.items.map((item) => (
            <div
              key={item.productId}
              className="w-14 h-14 rounded-lg overflow-hidden border border-[#E7C7CC] bg-[#F8EFEA] shrink-0"
              title={item.name}
            >
              <ResilientImage
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        <div className="md:col-span-7">
          <OrderTracker currentStatus={order.orderStatus} />
        </div>
      </div>

      {/* Expanded Receipt & Shipping Details */}
      {expanded && (
        <div className="mt-5 pt-5 border-t border-[#E7C7CC] grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-display text-sm font-semibold text-[#3E2F27] mb-3">
              Itemized Receipt
            </h4>
            <ul className="space-y-2.5">
              {order.items.map((item) => (
                <li
                  key={item.productId}
                  className="flex items-center justify-between gap-2 text-xs sm:text-sm"
                >
                  <span className="text-[#3E2F27]">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="tabular-nums font-medium text-[#3E2F27]">
                    {formatINR(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 pt-3 border-t border-[#E7C7CC] space-y-1 text-xs text-[#7A655C]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatINR(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
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
              <div className="flex justify-between font-semibold text-[#3E2F27] pt-1 text-sm">
                <span>Total Paid ({order.paymentMethod === 'razorpay' ? 'Razorpay' : 'Stripe'})</span>
                <span className="tabular-nums">{formatINR(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-[#FFF9F5] border border-[#E7C7CC] rounded-xl p-4">
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3E2F27] mb-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#6D1836]" />
                <span>Shipping Address</span>
              </p>
              <p className="text-xs text-[#7A655C] leading-relaxed">
                {order.shippingAddress.fullName}
                <br />
                {order.shippingAddress.addressLine}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.postalCode}
                <br />
                {order.shippingAddress.country} · {order.shippingAddress.phone}
              </p>
            </div>

            <div className="bg-[#FFF9F5] border border-[#E7C7CC] rounded-xl p-4">
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3E2F27] mb-1">
                <PackageCheck className="w-3.5 h-3.5 text-[#C9A66B]" />
                <span>Tracking &amp; Delivery</span>
              </p>
              <p className="text-xs text-[#7A655C]">
                Tracking ID:{' '}
                <span className="font-medium text-[#3E2F27]">{order.trackingCode || 'Assigned upon dispatch'}</span>
              </p>
              <p className="text-xs text-[#7A655C] mt-0.5">
                Estimated Delivery: <span className="text-[#3E2F27]">{order.estimatedDelivery}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};
