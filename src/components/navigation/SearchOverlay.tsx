import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Clock } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatINR } from '../../utils/format';
import { ResilientImage } from '../common/ResilientImage';

export const SearchOverlay: React.FC = () => {
  const {
    products,
    categories,
    isSearchOpen,
    closeSearch,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
  } = useStore();
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
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.categoryLabel.toLowerCase().includes(q) ||
          p.medium.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [products, query]);

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
            className="fixed inset-0 bg-[#3E2F27]/35 backdrop-blur-sm"
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
            aria-label="Search handmade creations"
            className="relative w-full max-w-2xl bg-[#FFF9F5] border border-[#E7C7CC] rounded-2xl shadow-warm overflow-hidden"
          >
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-3 px-5 py-4 bg-white border-b border-[#E7C7CC]/70"
            >
              <Search className="w-5 h-5 text-[#6D1836] shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search resin keepsakes, pipe cleaner bouquets, LED frames, portraits..."
                className="flex-1 bg-transparent text-[#3E2F27] placeholder:text-[#7A655C]/75 text-sm sm:text-base focus:outline-none"
                aria-label="Search query"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="text-xs font-medium text-[#7A655C] hover:text-[#3E2F27] px-2 py-1 rounded-md"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={closeSearch}
                className="p-1.5 text-[#7A655C] hover:text-[#3E2F27] rounded-lg"
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
                      <p className="text-xs font-medium text-[#7A655C]">
                        Matching creations ({suggestions.length})
                      </p>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        className="text-xs font-medium text-[#6D1836] hover:text-[#541129] inline-flex items-center gap-1"
                      >
                        <span>View all results</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <ul className="divide-y divide-[#E7C7CC]/50">
                      {suggestions.map((item) => (
                        <li key={item.id}>
                          <button
                            type="button"
                            onClick={() => handlePickProduct(item.slug, item.name)}
                            className="w-full flex items-center gap-4 py-2.5 px-2 -mx-2 rounded-xl hover:bg-[#F8EFEA] transition-colors text-left"
                          >
                            <ResilientImage
                              src={item.images[0]}
                              alt={item.name}
                              className="w-12 h-12 rounded-lg object-cover shrink-0 border border-[#E7C7CC]"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-[#3E2F27] truncate">
                                {item.name}
                              </p>
                              <p className="text-xs text-[#7A655C] truncate">
                                {item.medium} · {item.dimensions}
                              </p>
                            </div>
                            <span className="text-sm font-semibold text-[#3E2F27] tabular-nums shrink-0">
                              {formatINR(item.price)}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="font-display text-lg text-[#3E2F27]">
                      No creations matched &ldquo;{query}&rdquo;
                    </p>
                    <p className="text-sm text-[#7A655C] mt-1">
                      Try searching for resin, LED frame, embroidery, keychain, or portrait.
                    </p>
                  </div>
                )
              ) : (
                <>
                  {recentSearches.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <p className="text-xs font-medium text-[#7A655C]">Recent searches</p>
                        <button
                          type="button"
                          onClick={clearRecentSearches}
                          className="text-xs text-[#7A655C] hover:text-[#6D1836] transition-colors"
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
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E7C7CC] text-xs font-medium text-[#3E2F27] hover:border-[#6D1836] transition-colors"
                          >
                            <Clock className="w-3 h-3 text-[#7A655C]" />
                            <span>{term}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-xs font-medium text-[#7A655C] mb-2.5">
                      Explore by craft category
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {categories.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => {
                            closeSearch();
                            navigate(`/shop/category/${cat.slug}`);
                          }}
                          className="flex items-center justify-between px-4 py-3 rounded-xl bg-white border border-[#E7C7CC] text-sm font-medium text-[#3E2F27] hover:border-[#6D1836] hover:text-[#6D1836] transition-colors text-left"
                        >
                          <span className="truncate pr-2">{cat.label}</span>
                          <ArrowRight className="w-4 h-4 opacity-50 shrink-0" />
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
