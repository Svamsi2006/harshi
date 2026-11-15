import React from 'react';
import { useStore } from '../../context/StoreContext';
import type { CategoryKey } from '../../types';

interface CategoryPillsProps {
  activeCategory: CategoryKey;
  onSelect: (cat: CategoryKey) => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({ activeCategory, onSelect }) => {
  const { categories } = useStore();

  const tabs = [
    { key: 'all', label: 'All Creations' },
    ...categories.map((c) => ({ key: c.slug, label: c.label })),
  ];

  return (
    <div
      role="tablist"
      aria-label="Creation categories"
      className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1"
    >
      {tabs.map((tab) => {
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
                ? 'bg-[#6D1836] text-[#FFF9F5] border-[#6D1836] shadow-xs'
                : 'bg-[#F8EFEA] text-[#3E2F27] border-[#E7C7CC] hover:border-[#6D1836]/60 hover:bg-[#E7C7CC]/35'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
