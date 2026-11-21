import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { Search, User, ShoppingBag, Menu, LogOut } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { useStore } from '../../context/StoreContext';
import { MobileNavigation } from './MobileNavigation';

const NAV_ITEMS = [
  { label: 'Home Studio', to: '/' },
  { label: 'Shop All Works', to: '/shop' },
  { label: 'About Us', to: '/about-us' },
  { label: 'Custom Orders', to: '/custom-orders' },
  { label: 'Contact', to: '/contact' },
];

export const Navbar: React.FC = () => {
  const { cartCount, openCartDrawer, openSearch, user, isAdmin, logout } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FFF9F5]/94 backdrop-blur-md border-b border-[#E7C7CC]/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          {/* Left: Mobile menu toggle + Brand wordmark */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 -ml-2 text-[#3E2F27] hover:text-[#6D1836] rounded-lg transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <BrandLogo to="/" />
          </div>

          {/* Center: Clean single-line editorial navigation */}
          <nav
            aria-label="Primary navigation"
            className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#7A655C]"
          >
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/' || item.to === '/shop'}
                className={({ isActive }) =>
                  `relative py-1 whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-[#6D1836] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6D1836] rounded-sm ${
                    isActive ? 'text-[#6D1836] font-semibold' : ''
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span>{item.label}</span>
                    {isActive && (
                      <span
                        aria-hidden="true"
                        className="absolute left-0 right-0 -bottom-0.5 h-[2px] rounded-full bg-[#6D1836]"
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
                className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-[#FFF9F5] text-xs font-medium transition-colors"
              >
                Admin Studio
              </Link>
            )}

            <button
              type="button"
              onClick={openSearch}
              className="p-2.5 text-[#3E2F27] hover:text-[#6D1836] hover:bg-[#F8EFEA] rounded-xl transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[#6D1836]"
              aria-label="Search creations"
            >
              <Search className="w-[19px] h-[19px]" strokeWidth={1.75} />
            </button>

            <Link
              to={isAdmin ? '/admin' : user ? '/account' : '/login'}
              className="p-2.5 text-[#3E2F27] hover:text-[#6D1836] hover:bg-[#F8EFEA] rounded-xl transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[#6D1836]"
              aria-label={isAdmin ? 'Admin studio dashboard' : user ? 'Customer account' : 'Sign in to account'}
              title={isAdmin ? 'Admin Studio Dashboard' : user ? user.fullName : 'Sign in'}
            >
              <User className="w-[19px] h-[19px]" strokeWidth={1.75} />
            </Link>

            {user && (
              <button
                type="button"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="p-2.5 text-[#7A655C] hover:text-[#6D1836] hover:bg-[#F8EFEA] rounded-xl transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[#6D1836]"
                aria-label="Sign out"
                title="Logout"
              >
                <LogOut className="w-[18px] h-[18px]" strokeWidth={1.75} />
              </button>
            )}

            <button
              type="button"
              onClick={openCartDrawer}
              className="relative p-2.5 text-[#3E2F27] hover:text-[#6D1836] hover:bg-[#F8EFEA] rounded-xl transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center focus-visible:outline-2 focus-visible:outline-[#6D1836]"
              aria-label={`Shopping bag with ${cartCount} items`}
            >
              <ShoppingBag className="w-[19px] h-[19px]" strokeWidth={1.75} />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#6D1836] text-[#FFF9F5] text-[11px] font-semibold leading-[18px] text-center tabular-nums">
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
