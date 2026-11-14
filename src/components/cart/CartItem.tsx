import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Bookmark } from 'lucide-react';
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
  const { updateCartQuantity, removeFromCart, saveCartItemForLater } = useStore();
  const product = getProductById(item.productId);

  if (!product) return null;

  return (
    <div className="flex gap-3.5 py-4 border-b border-[#EAE3D5] last:border-b-0">
      <Link
        to={`/product/${product.slug}`}
        onClick={onNavigate}
        className={`${compact ? 'w-20 h-20' : 'w-24 h-24'} rounded-xl overflow-hidden border border-[#EAE3D5] bg-[#F3EDE2] shrink-0`}
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
              className="font-display text-sm sm:text-base font-medium text-[#2B2623] hover:text-[#C86D51] transition-colors truncate"
            >
              {product.name}
            </Link>
            <span className="text-sm font-semibold text-[#2B2623] tabular-nums shrink-0">
              {formatINR(product.price * item.quantity)}
            </span>
          </div>
          <p className="text-xs text-[#6E655F] mt-0.5 truncate">
            {product.medium} · {formatINR(product.price)} each
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
          <QuantitySelector
            value={item.quantity}
            max={product.stock}
            size="sm"
            onChange={(qty) => updateCartQuantity(product.id, qty)}
          />

          <div className="flex items-center gap-2">
            {!compact && (
              <button
                type="button"
                onClick={() => saveCartItemForLater(product.id)}
                className="inline-flex items-center gap-1 text-xs text-[#6E655F] hover:text-[#C86D51] px-2 py-1 rounded-md transition-colors"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Save for later</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => removeFromCart(product.id)}
              className="inline-flex items-center gap-1 text-xs text-[#6E655F] hover:text-[#B2593E] px-2 py-1 rounded-md transition-colors"
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
