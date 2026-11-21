import React from 'react';
import { getProductById } from '../../data/products';
import { useStore } from '../../context/StoreContext';
import { formatINR } from '../../utils/format';
import { ResilientImage } from '../common/ResilientImage';

interface OrderSummaryProps {
  discount?: number;
  shippingFeeOverride?: number;
  shippingZoneLabel?: string;
  freeDeliveryCouponCode?: string | null;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  discount = 0,
  shippingFeeOverride,
  shippingZoneLabel,
  freeDeliveryCouponCode,
}) => {
  const { cart, products, cartSubtotal, shippingFee } = useStore();
  const effectiveShipping =
    typeof shippingFeeOverride === 'number' ? shippingFeeOverride : shippingFee;
  const total = Math.max(0, cartSubtotal + effectiveShipping - discount);

  return (
    <aside className="bg-white border border-[#E7C7CC] rounded-2xl p-5 sm:p-6 shadow-warm/40">
      <h2 className="font-display text-lg font-medium text-[#3E2F27] pb-3 border-b border-[#E7C7CC]">
        Order Summary
      </h2>

      <ul className="divide-y divide-[#E7C7CC] my-2 max-h-72 overflow-y-auto">
        {cart.map((item) => {
          const product =
            products.find((p) => p.id === item.productId) ?? getProductById(item.productId);
          if (!product) return null;
          return (
            <li key={item.productId} className="py-3 flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#E7C7CC] bg-[#F8EFEA] shrink-0">
                <ResilientImage
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#3E2F27] truncate">{product.name}</p>
                <p className="text-xs text-[#7A655C]">Qty {item.quantity}</p>
              </div>
              <span className="text-sm font-semibold text-[#3E2F27] tabular-nums shrink-0">
                {formatINR(product.price * item.quantity)}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="pt-4 border-t border-[#E7C7CC] space-y-2 text-sm">
        <div className="flex justify-between text-[#7A655C]">
          <span>Subtotal</span>
          <span className="tabular-nums text-[#3E2F27]">{formatINR(cartSubtotal)}</span>
        </div>
        <div className="flex justify-between items-start gap-3 text-[#7A655C]">
          <span className="leading-snug">
            {shippingZoneLabel ? `Delivery (${shippingZoneLabel})` : 'Studio Packing & Shipping'}
          </span>
          <span className="tabular-nums text-[#C9A66B] font-medium shrink-0 text-right">
            {effectiveShipping === 0
              ? freeDeliveryCouponCode
                ? `Free (${freeDeliveryCouponCode})`
                : 'Free'
              : formatINR(effectiveShipping)}
          </span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-[#C9A66B]">
            <span>Studio Promo Discount</span>
            <span className="tabular-nums">-{formatINR(discount)}</span>
          </div>
        )}
        <div className="flex justify-between pt-3 border-t border-[#E7C7CC] text-base font-semibold text-[#3E2F27]">
          <span>Total</span>
          <span className="tabular-nums">{formatINR(total)}</span>
        </div>
      </div>
    </aside>
  );
};
