import React from 'react';
import type { ProductBadgeType } from '../../types';

interface ProductBadgeProps {
  badge?: ProductBadgeType;
  className?: string;
}

export const ProductBadge: React.FC<ProductBadgeProps> = ({ badge, className = '' }) => {
  if (!badge) return null;

  const toneClass =
    badge === 'Bestseller' || badge === 'Limited Run'
      ? 'bg-[#E6B86A]/25 text-[#2B2623] border-[#E6B86A]/50'
      : badge === 'Only 1 Left'
        ? 'bg-[#C86D51]/15 text-[#B2593E] border-[#C86D51]/35'
        : 'bg-[#7A9178]/15 text-[#495B47] border-[#7A9178]/35';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md border text-[11px] font-medium tracking-[0.01em] whitespace-nowrap ${toneClass} ${className}`}
    >
      {badge}
    </span>
  );
};
