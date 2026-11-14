import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { FilterState } from '../../types';
import { useFilteredProducts } from '../../hooks/useFilteredProducts';
import { PageTransition } from '../../components/common/PageTransition';
import { OrganicDivider } from '../../components/common/BotanicalDecorations';
import { HeroSection } from '../../components/home/HeroSection';
import { CategoryPills } from '../../components/product/CategoryPills';
import { FilterBar } from '../../components/product/FilterBar';
import { ProductGrid } from '../../components/product/ProductGrid';
import { ProcessTimeline } from '../../components/home/ProcessTimeline';
import { NewsletterSection } from '../../components/home/NewsletterSection';

export const HomePage: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    priceRange: 'all',
    availability: 'all',
    workType: 'all',
    sortBy: 'bestselling',
  });

  const filteredProducts = useFilteredProducts(filters);
  const displayedProducts = filteredProducts.slice(0, 8);

  const resetFilters = () =>
    setFilters({
      category: 'all',
      priceRange: 'all',
      availability: 'all',
      workType: 'all',
      sortBy: 'bestselling',
    });

  return (
    <PageTransition>
      <HeroSection />

      {/* Category Navigation & Our Collection */}
      <section className="pb-16 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <OrganicDivider />

          {/* Category Tabs */}
          <div className="pt-2">
            <CategoryPills
              activeCategory={filters.category}
              onSelect={(category) => setFilters((prev) => ({ ...prev, category }))}
            />
          </div>

          {/* Editorial Collection Header + Filter Bar */}
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl sm:text-4xl font-medium text-[#2B2623]">
                  Our Collection
                </h2>
                <p className="font-handwritten text-2xl text-[#6E655F] mt-1">
                  Timeless art, crafted with love and care.
                </p>
              </div>
              <Link
                to="/shop"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-[#C86D51] hover:text-[#B2593E] transition-colors whitespace-nowrap"
              >
                <span>View all {filteredProducts.length} works</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <FilterBar
              filters={filters}
              onChange={setFilters}
              totalCount={filteredProducts.length}
            />
          </div>

          {/* 4-column desktop / 2-column mobile grid */}
          <ProductGrid
            products={displayedProducts}
            columns={4}
            onResetFilters={resetFilters}
          />

          {filteredProducts.length > 8 && (
            <div className="pt-4 text-center">
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-white border border-[#EAE3D5] hover:border-[#C86D51] text-sm font-medium text-[#2B2623] hover:text-[#C86D51] transition-colors shadow-xs"
              >
                <span>Browse Complete Studio Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </section>

      <ProcessTimeline />
      <NewsletterSection />
    </PageTransition>
  );
};
