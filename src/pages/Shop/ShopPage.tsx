import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { FilterState } from '../../types';
import { useStore } from '../../context/StoreContext';
import { useFilteredProducts } from '../../hooks/useFilteredProducts';
import { PageTransition } from '../../components/common/PageTransition';
import { CategoryPills } from '../../components/product/CategoryPills';
import { FilterBar } from '../../components/product/FilterBar';
import { ProductGrid } from '../../components/product/ProductGrid';

interface ShopPageProps {
  routeGroup?: string;
}

export const ShopPage: React.FC<ShopPageProps> = ({ routeGroup }) => {
  const { slug } = useParams<{ slug?: string }>();
  const activeRouteSlug = slug ?? routeGroup;
  const { categories } = useStore();

  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    priceRange: 'all',
    availability: 'all',
    workType: 'all',
    sortBy: 'newest',
  });

  useEffect(() => {
    setFilters((prev) => ({ ...prev, category: 'all' }));
  }, [activeRouteSlug]);

  const products = useFilteredProducts(filters, activeRouteSlug);
  const matchedCat = activeRouteSlug
    ? categories.find((c) => c.slug === activeRouteSlug)
    : undefined;

  const title = matchedCat ? matchedCat.label : 'Shop All Works';
  const subtitle = matchedCat
    ? matchedCat.subtitle
    : 'Resin keepsakes, clay & pipe cleaner florals, LED frames, paper keepsakes, textile embroidery, personalized accessories, and art & portraits.';
  const note = matchedCat
    ? 'Handmade • Heartmade • Heartfelt — crafted in small studio batches.'
    : 'Crafted with thought, gifted with heart.';

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
          <nav aria-label="Breadcrumb" className="text-xs text-[#7A655C] flex items-center gap-2">
            <Link to="/" className="hover:text-[#6D1836]">
              Home Studio
            </Link>
            <span aria-hidden="true">/</span>
            <Link to="/shop" className="hover:text-[#6D1836]">
              Shop All Works
            </Link>
            {activeRouteSlug && (
              <>
                <span aria-hidden="true">/</span>
                <span className="text-[#3E2F27]">{matchedCat?.label ?? activeRouteSlug}</span>
              </>
            )}
          </nav>

          <div className="max-w-2xl">
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium text-[#3E2F27] text-balance">
              {title}
            </h1>
            <p className="text-sm sm:text-base text-[#7A655C] mt-2 leading-relaxed">{subtitle}</p>
            <p className="font-handwritten text-xl text-[#6D1836] mt-1">{note}</p>
          </div>
        </div>

        {/* Category Pills on full shop */}
        {!activeRouteSlug && (
          <CategoryPills
            activeCategory={filters.category}
            onSelect={(category) => setFilters((prev) => ({ ...prev, category }))}
          />
        )}

        <FilterBar
          filters={filters}
          onChange={setFilters}
          totalCount={products.length}
          showCategorySelect={!activeRouteSlug}
        />

        <ProductGrid products={products} columns={4} onResetFilters={resetFilters} />
      </div>
    </PageTransition>
  );
};
