import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Plus, Check } from 'lucide-react';
import type { Product } from '../../types';
import { formatINR } from '../../utils/format';
import { useStore } from '../../context/StoreContext';
import { ResilientImage } from '../common/ResilientImage';
import { ProductBadge } from './ProductBadge';
import { WishlistButton } from './WishlistButton';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useStore();
  const [justAdded, setJustAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const ok = addToCart(product.id, 1, false);
    if (ok) {
      setJustAdded(true);
      window.setTimeout(() => setJustAdded(false), 1100);
    }
  };

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className="group flex flex-col bg-white border border-[#E7C7CC]/80 rounded-2xl p-2.5 sm:p-3 shadow-warm/40 hover:shadow-warm transition-shadow duration-200"
    >
      {/* Visual Container */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#F8EFEA]">
        <Link
          to={`/product/${product.slug}`}
          className="block w-full h-full focus-visible:outline-2 focus-visible:outline-[#6D1836]"
          aria-label={`View ${product.name}`}
        >
          <ResilientImage
            src={product.images[0]}
            alt={product.name}
            fallbackTitle={product.name}
            className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          />
          {product.images[1] && (
            <ResilientImage
              src={product.images[1]}
              alt={`${product.name} studio detail`}
              fallbackTitle={product.name}
              className="hidden sm:block absolute inset-0 w-full h-full object-cover opacity-0 transition-all duration-300 ease-out group-hover:opacity-100 group-hover:scale-[1.03]"
            />
          )}
        </Link>

        {/* Top-left single badge */}
        {product.badge && (
          <div className="absolute top-2.5 left-2.5 pointer-events-none">
            <ProductBadge badge={product.badge} />
          </div>
        )}

        {/* Top-right wishlist */}
        <div className="absolute top-2.5 right-2.5">
          <WishlistButton productId={product.id} productName={product.name} />
        </div>

        {/* Desktop hover quick-add */}
        <div className="hidden sm:block absolute inset-x-3 bottom-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
          <motion.button
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={handleQuickAdd}
            disabled={product.stock <= 0}
            className={`w-full py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 shadow-sm transition-colors ${
              justAdded
                ? 'bg-[#C9A66B] text-[#3E2F27]'
                : 'bg-[#FFF9F5]/95 hover:bg-[#6D1836] text-[#3E2F27] hover:text-[#FFF9F5] border border-[#E7C7CC] hover:border-[#6D1836]'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Added to Bag</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Quick Add</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Product Metadata & Actions */}
      <div className="flex flex-col flex-1 pt-3 px-1 pb-1">
        <p className="text-[11px] sm:text-xs text-[#7A655C] truncate">
          {product.categoryLabel} <span aria-hidden="true">·</span> {product.dimensions}
        </p>

        <Link
          to={`/product/${product.slug}`}
          className="mt-1 font-display text-sm sm:text-base font-medium text-[#3E2F27] hover:text-[#6D1836] transition-colors line-clamp-1"
        >
          {product.name}
        </Link>

        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm sm:text-[15px] font-semibold text-[#3E2F27] tabular-nums">
              {formatINR(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-[#7A655C] line-through tabular-nums">
                {formatINR(product.originalPrice)}
              </span>
            )}
          </div>

          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={handleQuickAdd}
            disabled={product.stock <= 0}
            aria-label={`Add ${product.name} to cart`}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              justAdded
                ? 'bg-[#C9A66B] text-[#3E2F27]'
                : 'bg-[#6D1836] hover:bg-[#541129] text-[#FFF9F5]'
            }`}
          >
            {justAdded ? 'Added' : 'Add'}
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
};
