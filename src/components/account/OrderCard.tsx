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
    <article className="bg-white border border-[#EAE3D5] rounded-2xl p-5 shadow-warm/40">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE3D5]">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#6E655F]">
            <span className="font-semibold text-[#2B2623]">Order #{order.orderNumber}</span>
            <span aria-hidden="true">·</span>
            <span>Placed {formatDate(order.date)}</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#7A9178] font-medium">Payment: {order.paymentStatus}</span>
          </div>
          <p className="mt-1.5 text-sm text-[#2B2623] font-medium">
            {order.items.length} {order.items.length === 1 ? 'artwork' : 'artworks'} · Total{' '}
            <span className="tabular-nums font-semibold">{formatINR(order.total)}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleReorder}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#EAE3D5] text-xs font-medium text-[#2B2623] hover:border-[#C86D51] hover:text-[#C86D51] transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reorder</span>
          </button>
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            aria-expanded={expanded}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#FAF7F2] border border-[#EAE3D5] text-xs font-medium text-[#2B2623] hover:bg-[#F3EDE2] transition-colors whitespace-nowrap"
          >
            <span>{expanded ? 'Hide Details' : 'View Details'}</span>
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
              className="w-14 h-14 rounded-lg overflow-hidden border border-[#EAE3D5] bg-[#F3EDE2] shrink-0"
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
        <div className="mt-5 pt-5 border-t border-[#EAE3D5] grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-display text-sm font-semibold text-[#2B2623] mb-3">
              Itemized Receipt
            </h4>
            <ul className="space-y-2.5">
              {order.items.map((item) => (
                <li
                  key={item.productId}
                  className="flex items-center justify-between gap-2 text-xs sm:text-sm"
                >
                  <span className="text-[#2B2623]">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="tabular-nums font-medium text-[#2B2623]">
                    {formatINR(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-3 pt-3 border-t border-[#EAE3D5] space-y-1 text-xs text-[#6E655F]">
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
                <div className="flex justify-between text-[#7A9178]">
                  <span>Discount</span>
                  <span className="tabular-nums">-{formatINR(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-[#2B2623] pt-1 text-sm">
                <span>Total Paid ({order.paymentMethod === 'razorpay' ? 'Razorpay' : 'Stripe'})</span>
                <span className="tabular-nums">{formatINR(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-[#FAF7F2] border border-[#EAE3D5] rounded-xl p-4">
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2B2623] mb-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C86D51]" />
                <span>Shipping Address</span>
              </p>
              <p className="text-xs text-[#6E655F] leading-relaxed">
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

            <div className="bg-[#FAF7F2] border border-[#EAE3D5] rounded-xl p-4">
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2B2623] mb-1">
                <PackageCheck className="w-3.5 h-3.5 text-[#7A9178]" />
                <span>Tracking &amp; Delivery</span>
              </p>
              <p className="text-xs text-[#6E655F]">
                Tracking ID:{' '}
                <span className="font-medium text-[#2B2623]">{order.trackingCode || 'Assigned upon dispatch'}</span>
              </p>
              <p className="text-xs text-[#6E655F] mt-0.5">
                Estimated Delivery: <span className="text-[#2B2623]">{order.estimatedDelivery}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};
