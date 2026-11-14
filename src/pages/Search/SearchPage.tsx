import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PageTransition } from '../../components/common/PageTransition';
import { ProductGrid } from '../../components/product/ProductGrid';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') ?? '';
  const [input, setInput] = useState(initialQuery);
  const { products, addRecentSearch } = useStore();

  const activeQuery = (searchParams.get('q') ?? '').trim();

  const results = useMemo(() => {
    if (!activeQuery) return products;
    const q = activeQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q) ||
        p.medium.toLowerCase().includes(q)
    );
  }, [activeQuery, products]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = input.trim();
    if (cleaned) {
      addRecentSearch(cleaned);
      setSearchParams({ q: cleaned });
    } else {
      setSearchParams({});
    }
  };

  return (
    <PageTransition className="py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="max-w-2xl space-y-4">
          <h1 className="font-display text-3xl sm:text-4xl font-medium text-[#2B2623]">
            {activeQuery ? `Results for “${activeQuery}”` : 'Search the Studio'}
          </h1>

          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#6E655F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Search sketches, clay, watercolor prints..."
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-white border border-[#EAE3D5] text-sm text-[#2B2623] focus:outline-none focus:border-[#C86D51]"
              />
              {input && (
                <button
                  type="button"
                  onClick={() => {
                    setInput('');
                    setSearchParams({});
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6E655F] hover:text-[#2B2623]"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-5 py-3 rounded-xl bg-[#C86D51] hover:bg-[#B2593E] text-white text-sm font-medium transition-colors"
            >
              Search
            </button>
          </form>

          <p className="text-xs text-[#6E655F] tabular-nums">
            Showing {results.length} {results.length === 1 ? 'artwork' : 'artworks'}
          </p>
        </div>

        <ProductGrid
          products={results}
          columns={4}
          onResetFilters={() => {
            setInput('');
            setSearchParams({});
          }}
        />
      </div>
    </PageTransition>
  );
};
