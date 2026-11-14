import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { FilterState, RouteCategorySlug } from '../../types';
import { useFilteredProducts } from '../../hooks/useFilteredProducts';
import { PageTransition } from '../../components/common/PageTransition';
import { CategoryPills } from '../../components/product/CategoryPills';
import { FilterBar } from '../../components/product/FilterBar';
import { ProductGrid } from '../../components/product/ProductGrid';

interface ShopPageProps {
  routeGroup?: RouteCategorySlug;
}

const COLLECTION_COPY: Record<
  'all' | RouteCategorySlug,
  { title: string; subtitle: string; note: string }
> = {
  all: {
    title: 'Complete Studio Collection',
    subtitle: 'Original sketches, clay sculptures, paintings & archival prints',
    note: 'Every piece is made in small batches or as a singular 1-of-1 artwork.',
  },
  sketches: {
    title: 'Pencil & Charcoal Sketches',
    subtitle: 'Original graphite, charcoal, and sanguine drawings on cotton rag',
    note: 'Signed, fixed with archival matte spray, and packed flat between rigid boards.',
  },
  handicrafts: {
    title: 'Handicrafts, Clay & Woven',
    subtitle: 'Raw riverbank terracotta, hand-carved sheesham wood, and natural jute',
    note: 'Tactile objects shaped slowly without industrial molds.',
  },
  paintings: {
    title: 'Original Paintings',
    subtitle: 'One-of-a-kind oil, acrylic, and gouache works on linen & birch panel',
    note: 'Delivered ready to display with signed certificate of originality.',
  },
  prints: {
    title: 'Watercolor Art Prints',
    subtitle: 'Museum-grade archival giclee editions on 310 GSM cotton paper',
    note: 'Deckle-edged prints stamped and numbered by our studio.',
  },
};

export const ShopPage: React.FC<ShopPageProps> = ({ routeGroup }) => {
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    priceRange: 'all',
    availability: 'all',
    workType: 'all',
    sortBy: 'newest',
  });

  useEffect(() => {
    setFilters((prev) => ({ ...prev, category: 'all' }));
  }, [routeGroup]);

  const products = useFilteredProducts(filters, routeGroup);
  const copy = COLLECTION_COPY[routeGroup ?? 'all'];

  const resetFilters = () =>
    setFilters({
      category: 'all',
      priceRange: 'all',
      availability: 'all',
      workType: 'all',
      sortBy: 'newest',
    });

  return (
    <PageTransition className="py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb & Header */}
        <div className="space-y-3">
          <nav aria-label="Breadcrumb" className="text-xs text-[#6E655F] flex items-center gap-2">
            <Link to="/" className="hover:text-[#C86D51]">
              Home
            </Link>
            <span aria-hidden="true">/</span>
            <Link to="/shop" className="hover:text-[#C86D51]">
              Shop
            </Link>
            {routeGroup && (
              <>
                <span aria-hidden="true">/</span>
                <span className="text-[#2B2623] capitalize">{routeGroup}</span>
              </>
            )}
          </nav>

          <div className="max-w-2xl">
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium text-[#2B2623] text-balance">
              {copy.title}
            </h1>
            <p className="text-sm sm:text-base text-[#6E655F] mt-2 leading-relaxed">
              {copy.subtitle}
            </p>
            <p className="font-handwritten text-xl text-[#C86D51] mt-1">{copy.note}</p>
          </div>
        </div>

        {/* Category Pills on full shop */}
        {!routeGroup && (
          <CategoryPills
            activeCategory={filters.category}
            onSelect={(category) => setFilters((prev) => ({ ...prev, category }))}
          />
        )}

        <FilterBar
          filters={filters}
          onChange={setFilters}
          totalCount={products.length}
          showCategorySelect={!routeGroup}
        />

        <ProductGrid products={products} columns={4} onResetFilters={resetFilters} />
      </div>
    </PageTransition>
  );
};
