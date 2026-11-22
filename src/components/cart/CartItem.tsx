import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Bookmark, AlertCircle } from 'lucide-react';
import type { CartItem as CartItemType } from '../../types';
import { getProductById } from '../../data/products';
import { formatINR } from '../../utils/format';
import { useStore } from '../../context/StoreContext';
import { ResilientImage } from '../common/ResilientImage';
import { QuantitySelector } from '../product/QuantitySelector';

interface CartItemProps {
  item: CartItemType;
  compact?: boolean;
  onNavigate?: () => void;
}

export const CartItemRow: React.FC<CartItemProps> = ({ item, compact = false, onNavigate }) => {
  const { products, updateCartQuantity, removeFromCart, saveCartItemForLater } = useStore();
  const product =
    products.find((p) => p.id === item.productId) ?? getProductById(item.productId);

  if (!product) {
    return (
      <div className="flex items-center justify-between gap-3 py-4 border-b border-[#E7C7CC] last:border-b-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-14 h-14 rounded-xl border border-[#E7C7CC] bg-[#F8EFEA] flex items-center justify-center shrink-0 text-[#7A655C]">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-[#3E2F27] truncate">
              Unavailable Studio Item
            </p>
            <p className="text-xs text-[#7A655C]">
              Qty {item.quantity} · This creation is no longer listed.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => removeFromCart(item.productId)}
          className="inline-flex items-center gap-1 text-xs font-medium text-[#6D1836] hover:text-[#541129] px-2.5 py-1.5 rounded-lg border border-[#E7C7CC] shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Remove</span>
        </button>
      </div>
    );
  }

  const maxAllowed = Math.max(item.quantity, product.stock > 0 ? product.stock : 1);
  const lineTotal = product.price * item.quantity;

  return (
    <div className="flex gap-3.5 py-4 border-b border-[#E7C7CC] last:border-b-0">
      <Link
        to={`/product/${product.slug}`}
        onClick={onNavigate}
        className={`${compact ? 'w-20 h-20' : 'w-24 h-24'} rounded-xl overflow-hidden border border-[#E7C7CC] bg-[#F8EFEA] shrink-0`}
      >
        <ResilientImage
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </Link>

      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <Link
              to={`/product/${product.slug}`}
              onClick={onNavigate}
              className="font-display text-sm sm:text-base font-medium text-[#3E2F27] hover:text-[#6D1836] transition-colors line-clamp-2"
            >
              {product.name}
            </Link>
            <span className="text-sm font-semibold text-[#3E2F27] tabular-nums shrink-0">
              {formatINR(lineTotal)}
            </span>
          </div>
          <p className="text-xs text-[#7A655C] mt-0.5 truncate">
            {product.medium ? `${product.medium} · ` : ''}
            {formatINR(product.price)} × {item.quantity}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
          <div className="flex items-center gap-2">
            <QuantitySelector
              value={item.quantity}
              min={0}
              max={maxAllowed}
              size="sm"
              onChange={(qty) => updateCartQuantity(product.id, qty)}
            />
            {product.stock > 0 && item.quantity >= product.stock && (
              <span className="text-[11px] text-[#8C6B3F]">
                Max stock ({product.stock})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!compact && (
              <button
                type="button"
                onClick={() => saveCartItemForLater(product.id)}
                className="inline-flex items-center gap-1 text-xs text-[#7A655C] hover:text-[#6D1836] px-2 py-1 rounded-md transition-colors"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Save for later</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => removeFromCart(product.id)}
              className="inline-flex items-center gap-1 text-xs text-[#7A655C] hover:text-[#541129] px-2 py-1 rounded-md transition-colors"
              aria-label={`Remove ${product.name} from bag`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
