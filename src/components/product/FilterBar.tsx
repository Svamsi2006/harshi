import React from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import type { FilterState } from '../../types';

interface FilterBarProps {
  filters: FilterState;
  onChange: (next: FilterState) => void;
  totalCount: number;
  showCategorySelect?: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChange,
  totalCount,
  showCategorySelect = false,
}) => {
  const hasActiveFilters =
    filters.category !== 'all' ||
    filters.priceRange !== 'all' ||
    filters.availability !== 'all' ||
    filters.workType !== 'all';

  const resetAll = () =>
    onChange({
      category: 'all',
      priceRange: 'all',
      availability: 'all',
      workType: 'all',
      sortBy: 'newest',
    });

  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 py-3.5 px-4 bg-[#FAF7F2] border border-[#EAE3D5] rounded-2xl">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6E655F] mr-1">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#C86D51]" />
          <span>Filter:</span>
        </span>

        {showCategorySelect && (
          <select
            aria-label="Filter by category"
            value={filters.category}
            onChange={(e) =>
              onChange({ ...filters, category: e.target.value as FilterState['category'] })
            }
            className="px-3 py-2 rounded-xl bg-white border border-[#EAE3D5] text-xs font-medium text-[#2B2623] focus:outline-none focus:border-[#C86D51]"
          >
            <option value="all">All Categories</option>
            <option value="sketches">Pencil & Charcoal</option>
            <option value="clay-terracotta">Clay & Terracotta</option>
            <option value="wood-woven">Wood & Woven</option>
            <option value="paintings">Original Paintings</option>
            <option value="prints">Watercolor Prints</option>
          </select>
        )}

        <select
          aria-label="Filter by price range"
          value={filters.priceRange}
          onChange={(e) =>
            onChange({ ...filters, priceRange: e.target.value as FilterState['priceRange'] })
          }
          className="px-3 py-2 rounded-xl bg-white border border-[#EAE3D5] text-xs font-medium text-[#2B2623] focus:outline-none focus:border-[#C86D51]"
        >
          <option value="all">Any Price</option>
          <option value="under-1200">Under ₹1,200</option>
          <option value="1200-2500">₹1,200 – ₹2,500</option>
          <option value="above-2500">Above ₹2,500</option>
        </select>

        <select
          aria-label="Filter by availability"
          value={filters.availability}
          onChange={(e) =>
            onChange({
              ...filters,
              availability: e.target.value as FilterState['availability'],
            })
          }
          className="px-3 py-2 rounded-xl bg-white border border-[#EAE3D5] text-xs font-medium text-[#2B2623] focus:outline-none focus:border-[#C86D51]"
        >
          <option value="all">All Availability</option>
          <option value="in-stock">In Stock (Multiples)</option>
          <option value="last-piece">Only 1 Left</option>
        </select>

        <select
          aria-label="Filter by work type"
          value={filters.workType}
          onChange={(e) =>
            onChange({ ...filters, workType: e.target.value as FilterState['workType'] })
          }
          className="px-3 py-2 rounded-xl bg-white border border-[#EAE3D5] text-xs font-medium text-[#2B2623] focus:outline-none focus:border-[#C86D51]"
        >
          <option value="all">Original & Prints</option>
          <option value="original">Original 1-of-1</option>
          <option value="prints">Watercolor Prints</option>
          <option value="craft">Handmade Crafts</option>
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-[#C86D51] hover:bg-[#F3EDE2] transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#EAE3D5]">
        <span className="text-xs text-[#6E655F] tabular-nums">
          {totalCount} {totalCount === 1 ? 'work' : 'works'}
        </span>
        <select
          aria-label="Sort works"
          value={filters.sortBy}
          onChange={(e) =>
            onChange({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })
          }
          className="px-3 py-2 rounded-xl bg-white border border-[#EAE3D5] text-xs font-medium text-[#2B2623] focus:outline-none focus:border-[#C86D51]"
        >
          <option value="newest">Sort: Newest</option>
          <option value="bestselling">Sort: Bestselling</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
        </select>
      </div>
    </div>
  );
};
