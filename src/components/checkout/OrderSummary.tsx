import React from 'react';
import { getProductById } from '../../data/products';
import { useStore } from '../../context/StoreContext';
import { formatINR } from '../../utils/format';
import { ResilientImage } from '../common/ResilientImage';

interface OrderSummaryProps {
  discount?: number;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({ discount = 0 }) => {
  const { cart, cartSubtotal, shippingFee } = useStore();
  const total = Math.max(0, cartSubtotal + shippingFee - discount);

  return (
    <aside className="bg-white border border-[#EAE3D5] rounded-2xl p-5 sm:p-6 shadow-warm/40">
      <h2 className="font-display text-lg font-medium text-[#2B2623] pb-3 border-b border-[#EAE3D5]">
        Order Summary
      </h2>

      <ul className="divide-y divide-[#EAE3D5] my-2 max-h-72 overflow-y-auto">
        {cart.map((item) => {
          const product = getProductById(item.productId);
          if (!product) return null;
          return (
            <li key={item.productId} className="py-3 flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#EAE3D5] bg-[#F3EDE2] shrink-0">
                <ResilientImage
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-[#2B2623] truncate">{product.name}</p>
                <p className="text-xs text-[#6E655F]">Qty {item.quantity}</p>
              </div>
              <span className="text-sm font-semibold text-[#2B2623] tabular-nums shrink-0">
                {formatINR(product.price * item.quantity)}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="pt-4 border-t border-[#EAE3D5] space-y-2 text-sm">
        <div className="flex justify-between text-[#6E655F]">
          <span>Subtotal</span>
          <span className="tabular-nums text-[#2B2623]">{formatINR(cartSubtotal)}</span>
        </div>
        <div className="flex justify-between text-[#6E655F]">
          <span>Studio Packing &amp; Shipping</span>
          <span className="tabular-nums text-[#7A9178] font-medium">
            {shippingFee === 0 ? 'Free' : formatINR(shippingFee)}
          </span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-[#7A9178]">
            <span>Studio Promo Discount</span>
            <span className="tabular-nums">-{formatINR(discount)}</span>
          </div>
        )}
        <div className="flex justify-between pt-3 border-t border-[#EAE3D5] text-base font-semibold text-[#2B2623]">
          <span>Total</span>
          <span className="tabular-nums">{formatINR(total)}</span>
        </div>
      </div>
    </aside>
  );
};
