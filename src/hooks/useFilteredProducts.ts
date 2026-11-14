import { useMemo } from 'react';
import { PRODUCTS } from '../data/products';
import type { FilterState, Product } from '../types';

export function useFilteredProducts(
  filters: FilterState,
  routeGroup?: Product['routeGroup']
): Product[] {
  return useMemo(() => {
    let list = [...PRODUCTS];

    if (routeGroup) {
      list = list.filter((p) => p.routeGroup === routeGroup);
    }

    if (filters.category !== 'all') {
      list = list.filter((p) => p.category === filters.category);
    }

    if (filters.priceRange === 'under-1200') {
      list = list.filter((p) => p.price < 1200);
    } else if (filters.priceRange === '1200-2500') {
      list = list.filter((p) => p.price >= 1200 && p.price <= 2500);
    } else if (filters.priceRange === 'above-2500') {
      list = list.filter((p) => p.price > 2500);
    }

    if (filters.availability === 'in-stock') {
      list = list.filter((p) => p.stock > 1);
    } else if (filters.availability === 'last-piece') {
      list = list.filter((p) => p.stock === 1);
    }

    if (filters.workType === 'original') {
      list = list.filter((p) => p.productType === 'Original 1-of-1');
    } else if (filters.workType === 'prints') {
      list = list.filter((p) => p.productType === 'Limited Edition Print');
    } else if (filters.workType === 'craft') {
      list = list.filter((p) => p.productType === 'Handmade Craft');
    }

    switch (filters.sortBy) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'bestselling':
        list.sort((a, b) => Number(Boolean(b.isBestseller)) - Number(Boolean(a.isBestseller)));
        break;
      case 'newest':
      default:
        list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        break;
    }

    return list;
  }, [filters, routeGroup]);
}
