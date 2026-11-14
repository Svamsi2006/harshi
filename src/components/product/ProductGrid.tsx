import React from 'react';
import type { Product } from '../../types';
import { ProductCard } from './ProductCard';
import { EmptyState } from '../common/EmptyState';

interface ProductGridProps {
  products: Product[];
  columns?: 3 | 4;
  onResetFilters?: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  columns = 4,
  onResetFilters,
}) => {
  if (products.length === 0) {
    return (
      <EmptyState
        title="No artworks match these filters"
        description="Try clearing a filter or exploring another medium from our little studio."
        actionLabel={onResetFilters ? 'Show All Works' : 'Browse Full Collection'}
        actionTo={onResetFilters ? undefined : '/shop'}
        onAction={onResetFilters}
      />
    );
  }

  const gridCols =
    columns === 3
      ? 'grid-cols-2 md:grid-cols-3'
      : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';

  return (
    <div className={`grid ${gridCols} gap-4 sm:gap-6`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
