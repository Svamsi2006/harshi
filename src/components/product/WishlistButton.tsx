import React from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface WishlistButtonProps {
  productId: string;
  productName: string;
  variant?: 'icon' | 'full';
  className?: string;
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({
  productId,
  productName,
  variant = 'icon',
  className = '',
}) => {
  const { isWishlisted, toggleWishlist } = useStore();
  const saved = isWishlisted(productId);

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={() => toggleWishlist(productId)}
        aria-pressed={saved}
        className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border text-sm font-medium transition-colors whitespace-nowrap ${
          saved
            ? 'bg-[#C86D51]/10 border-[#C86D51]/40 text-[#B2593E]'
            : 'bg-white border-[#EAE3D5] text-[#2B2623] hover:border-[#C86D51]'
        } ${className}`}
      >
        <Heart className={`w-4 h-4 ${saved ? 'fill-[#C86D51] text-[#C86D51]' : ''}`} />
        <span>{saved ? 'Saved in Wishlist' : 'Save to Wishlist'}</span>
      </button>
    );
  }

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.85 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(productId);
      }}
      aria-label={saved ? `Remove ${productName} from wishlist` : `Save ${productName} to wishlist`}
      aria-pressed={saved}
      className={`w-9 h-9 rounded-full bg-white/95 backdrop-blur-xs border border-[#EAE3D5] flex items-center justify-center text-[#2B2623] hover:border-[#C86D51] transition-colors shadow-xs ${className}`}
    >
      <Heart
        className={`w-4 h-4 transition-colors ${
          saved ? 'fill-[#C86D51] text-[#C86D51]' : 'text-[#6E655F]'
        }`}
      />
    </motion.button>
  );
};
