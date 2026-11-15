import React from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
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
  const { categories } = useStore();

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
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 py-3.5 px-4 bg-[#FFF9F5] border border-[#E7C7CC] rounded-2xl">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#7A655C] mr-1">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#6D1836]" />
          <span>Filter:</span>
        </span>

        {showCategorySelect && (
          <select
            aria-label="Filter by category"
            value={filters.category}
            onChange={(e) =>
              onChange({ ...filters, category: e.target.value as FilterState['category'] })
            }
            className="px-3 py-2 rounded-xl bg-white border border-[#E7C7CC] text-xs font-medium text-[#3E2F27] focus:outline-none focus:border-[#6D1836]"
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.label}
              </option>
            ))}
          </select>
        )}

        <select
          aria-label="Filter by price range"
          value={filters.priceRange}
          onChange={(e) =>
            onChange({ ...filters, priceRange: e.target.value as FilterState['priceRange'] })
          }
          className="px-3 py-2 rounded-xl bg-white border border-[#E7C7CC] text-xs font-medium text-[#3E2F27] focus:outline-none focus:border-[#6D1836]"
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
          className="px-3 py-2 rounded-xl bg-white border border-[#E7C7CC] text-xs font-medium text-[#3E2F27] focus:outline-none focus:border-[#6D1836]"
        >
          <option value="all">All Availability</option>
          <option value="in-stock">In Stock</option>
          <option value="last-piece">Only 1 Left</option>
        </select>

        <select
          aria-label="Filter by creation style"
          value={filters.workType}
          onChange={(e) =>
            onChange({ ...filters, workType: e.target.value as FilterState['workType'] })
          }
          className="px-3 py-2 rounded-xl bg-white border border-[#E7C7CC] text-xs font-medium text-[#3E2F27] focus:outline-none focus:border-[#6D1836]"
        >
          <option value="all">All Creations</option>
          <option value="handmade">Handmade Keepsake</option>
          <option value="custom">Custom Made</option>
          <option value="original">Original Artwork</option>
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-[#6D1836] hover:bg-[#F8EFEA] transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#E7C7CC]/60">
        <span className="text-xs text-[#7A655C] tabular-nums">
          {totalCount} {totalCount === 1 ? 'creation' : 'creations'}
        </span>
        <select
          aria-label="Sort creations"
          value={filters.sortBy}
          onChange={(e) =>
            onChange({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })
          }
          className="px-3 py-2 rounded-xl bg-white border border-[#E7C7CC] text-xs font-medium text-[#3E2F27] focus:outline-none focus:border-[#6D1836]"
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
