import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Clock } from 'lucide-react';
import { PRODUCTS } from '../../data/products';
import { useStore } from '../../context/StoreContext';
import { formatINR } from '../../utils/format';
import { ResilientImage } from '../common/ResilientImage';

const POPULAR_CATEGORIES = [
  { label: 'Pencil Sketches', to: '/shop/sketches' },
  { label: 'Terracotta & Clay', to: '/shop/handicrafts' },
  { label: 'Original Paintings', to: '/shop/paintings' },
  { label: 'Watercolor Prints', to: '/shop/prints' },
];

export const SearchOverlay: React.FC = () => {
  const { isSearchOpen, closeSearch, recentSearches, addRecentSearch, clearRecentSearches } =
    useStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isSearchOpen) {
      window.setTimeout(() => inputRef.current?.focus(), 60);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (!isSearchOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSearch();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isSearchOpen, closeSearch]);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q) ||
        p.medium.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    addRecentSearch(trimmed);
    closeSearch();
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handlePickProduct = (slug: string, name: string) => {
    addRecentSearch(name);
    closeSearch();
    navigate(`/product/${slug}`);
  };

  const handlePickRecent = (term: string) => {
    addRecentSearch(term);
    closeSearch();
    navigate(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-[#2B2623]/35 backdrop-blur-sm"
            onClick={closeSearch}
            aria-hidden="true"
          />

          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Search studio artworks"
            className="relative w-full max-w-2xl bg-[#FAF7F2] border border-[#EAE3D5] rounded-2xl shadow-warm overflow-hidden"
          >
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-3 px-5 py-4 bg-white border-b border-[#EAE3D5]"
            >
              <Search className="w-5 h-5 text-[#C86D51] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sketches, terracotta idols, watercolor prints..."
                className="flex-1 bg-transparent text-[#2B2623] placeholder:text-[#6E655F]/75 text-sm sm:text-base focus:outline-none"
                aria-label="Search query"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="text-xs font-medium text-[#6E655F] hover:text-[#2B2623] px-2 py-1 rounded-md"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={closeSearch}
                className="p-1.5 text-[#6E655F] hover:text-[#2B2623] rounded-lg"
                aria-label="Close search"
              >
                <X className="w-4 h-4" />
              </button>
            </form>

            <div className="p-5 max-h-[65vh] overflow-y-auto space-y-6">
              {query.trim() ? (
                suggestions.length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-medium text-[#6E655F]">
                        Matching works ({suggestions.length})
                      </p>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        className="text-xs font-medium text-[#C86D51] hover:text-[#B2593E] inline-flex items-center gap-1"
                      >
                        <span>View all results</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <ul className="divide-y divide-[#EAE3D5]">
                      {suggestions.map((item) => (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() => handlePickProduct(item.slug, item.name)}
                            className="w-full flex items-center gap-4 py-2.5 px-2 -mx-2 rounded-xl hover:bg-[#F3EDE2]/70 transition-colors text-left"
                          >
                            <ResilientImage
                              src={item.images[0]}
                              alt={item.name}
                              className="w-12 h-12 rounded-lg object-cover shrink-0 border border-[#EAE3D5]"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-[#2B2623] truncate">
                                {item.name}
                              </p>
                              <p className="text-xs text-[#6E655F] truncate">
                                {item.medium} · {item.dimensions}
                              </p>
                            </div>
                            <span className="text-sm font-semibold text-[#2B2623] tabular-nums shrink-0">
                              {formatINR(item.price)}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="font-display text-lg text-[#2B2623]">
                      No artworks matched &ldquo;{query}&rdquo;
                    </p>
                    <p className="text-sm text-[#6E655F] mt-1">
                      Try searching for charcoal, terracotta, ganesha, or watercolor.
                    </p>
                  </div>
                )
              ) : (
                <>
                  {recentSearches.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <p className="text-xs font-medium text-[#6E655F]">Recent searches</p>
                        <button
                          type="button"
                          onClick={clearRecentSearches}
                          className="text-xs text-[#6E655F] hover:text-[#C86D51] transition-colors"
                        >
                          Clear history
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => handlePickRecent(term)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#EAE3D5] text-xs font-medium text-[#2B2623] hover:border-[#C86D51] transition-colors"
                          >
                            <Clock className="w-3 h-3 text-[#6E655F]" />
                            <span>{term}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-medium text-[#6E655F] mb-2.5">
                      Explore by craft & medium
                    </p>
                    <div className="grid grid-cols-2 gap-2.5">
                      {POPULAR_CATEGORIES.map((cat) => (
                        <button
                          key={cat.to}
                          type="button"
                          onClick={() => {
                            closeSearch();
                            navigate(cat.to);
                          }}
                          className="flex items-center justify-between px-4 py-3 rounded-xl bg-white border border-[#EAE3D5] text-sm font-medium text-[#2B2623] hover:border-[#C86D51] hover:text-[#C86D51] transition-colors text-left"
                        >
                          <span>{cat.label}</span>
                          <ArrowRight className="w-4 h-4 opacity-50" />
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
