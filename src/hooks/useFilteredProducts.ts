import { useMemo } from 'react';
import type { FilterState, Product } from '../types';
import { useStore } from '../context/StoreContext';

export function useFilteredProducts(
  filters: FilterState,
  routeCategorySlug?: string
): Product[] {
  const { products } = useStore();

  return useMemo(() => {
    let list = [...products].filter((p) => p.isPublished !== false);

    if (routeCategorySlug) {
      list = list.filter(
        (p) => p.routeGroup === routeCategorySlug || p.category === routeCategorySlug
      );
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

    if (filters.workType === 'handmade') {
      list = list.filter((p) => p.productType === 'Handmade Keepsake');
    } else if (filters.workType === 'custom') {
      list = list.filter((p) => p.productType === 'Custom Made');
    } else if (filters.workType === 'original') {
      list = list.filter((p) => p.productType === 'Original Artwork');
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
  }, [filters, products, routeCategorySlug]);
}
