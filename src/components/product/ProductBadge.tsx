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
      ? 'bg-[#C9A66B]/25 text-[#3E2F27] border-[#C9A66B]/55'
      : badge === 'Only 1 Left'
        ? 'bg-[#6D1836]/15 text-[#6D1836] border-[#6D1836]/35'
        : 'bg-[#E7C7CC]/60 text-[#3E2F27] border-[#E7C7CC]';

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md border text-[11px] font-medium tracking-[0.01em] whitespace-nowrap ${toneClass} ${className}`}
    >
      {badge}
    </span>
  );
};
