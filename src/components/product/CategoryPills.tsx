import React from 'react';
import { CATEGORY_TABS } from '../../data/products';
import type { CategoryKey } from '../../types';

interface CategoryPillsProps {
  activeCategory: CategoryKey;
  onSelect: (cat: CategoryKey) => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({ activeCategory, onSelect }) => {
  return (
    <div
      role="tablist"
      aria-label="Artwork categories"
      className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1"
    >
      {CATEGORY_TABS.map((tab) => {
        const isActive = activeCategory === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(tab.key)}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 transition-all duration-150 border ${
              isActive
                ? 'bg-[#C86D51] text-white border-[#C86D51] shadow-xs'
                : 'bg-[#F3EDE2] text-[#2B2623] border-[#EAE3D5] hover:border-[#C86D51]/50 hover:bg-[#EAE3D5]/70'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
