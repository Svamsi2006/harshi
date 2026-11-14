import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Search, User, ShoppingBag, Menu } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { useStore } from '../../context/StoreContext';
import { MobileNavigation } from './MobileNavigation';

const NAV_ITEMS = [
  { label: 'Shop All', to: '/shop' },
  { label: 'Sketches', to: '/shop/sketches' },
  { label: 'Handicrafts', to: '/shop/handicrafts' },
  { label: 'Paintings', to: '/shop/paintings' },
  { label: 'Artist Story', to: '/artist-story' },
];

export const Navbar: React.FC = () => {
  const { cartCount, openCartDrawer, openSearch, user, isAdmin } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/92 backdrop-blur-md border-b border-[#EAE3D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Left: Mobile menu toggle + Brand wordmark */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 text-[#2B2623] hover:text-[#C86D51] rounded-lg transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <BrandLogo to="/" />
          </div>

          {/* Center: Clean single-line editorial navigation */}
          <nav
            aria-label="Primary navigation"
            className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#6E655F]"
          >
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/shop'}
                className={({ isActive }) =>
                  `relative py-1 whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-[#2B2623] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#C86D51] rounded-sm ${
                    isActive ? 'text-[#2B2623] font-semibold' : ''
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{item.label}</span>
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute left-0 right-0 -bottom-0.5 h-[2px] rounded-full bg-[#C86D51]"
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right: Search, Admin/Account, Cart */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-xl bg-[#C86D51] hover:bg-[#B2593E] text-white text-xs font-medium transition-colors"
              >
                Admin Studio
              </Link>
            )}

            <button
              type="button"
              onClick={openSearch}
              className="p-2.5 text-[#2B2623] hover:text-[#C86D51] hover:bg-[#F3EDE2]/70 rounded-xl transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[#C86D51]"
              aria-label="Search artworks"
            >
              <Search className="w-[19px] h-[19px]" strokeWidth={1.75} />
            </button>

            <Link
              to={isAdmin ? '/admin' : user ? '/account' : '/login'}
              className="p-2.5 text-[#2B2623] hover:text-[#C86D51] hover:bg-[#F3EDE2]/70 rounded-xl transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[#C86D51]"
              aria-label={isAdmin ? 'Admin studio dashboard' : user ? 'Customer account' : 'Sign in to account'}
              title={isAdmin ? 'Admin Studio Dashboard' : user ? user.fullName : 'Sign in'}
            >
              <User className="w-[19px] h-[19px]" strokeWidth={1.75} />
            </Link>

            <button
              type="button"
              onClick={openCartDrawer}
              className="relative p-2.5 text-[#2B2623] hover:text-[#C86D51] hover:bg-[#F3EDE2]/70 rounded-xl transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[#C86D51]"
              aria-label={`Shopping bag with ${cartCount} items`}
            >
              <ShoppingBag className="w-[19px] h-[19px]" strokeWidth={1.75} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#C86D51] text-white text-[11px] font-semibold leading-[18px] text-center tabular-nums">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <MobileNavigation isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
};
