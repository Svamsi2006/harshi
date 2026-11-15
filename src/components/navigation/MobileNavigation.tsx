import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Link, NavLink } from 'react-router-dom';
import { X, ArrowRight, User, ShoppingBag } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { useStore } from '../../context/StoreContext';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ isOpen, onClose }) => {
  const { user, cartCount, openCartDrawer, categories } = useStore();

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const primaryLinks = [
    { label: 'Home Studio', to: '/' },
    { label: 'Shop All Works', to: '/shop' },
    { label: 'About Us', to: '/about-us' },
    { label: 'Custom Orders', to: '/custom-orders' },
    { label: 'Contact', to: '/contact' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-[#3E2F27]/35 backdrop-blur-xs"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed top-0 left-0 bottom-0 w-[86vw] max-w-sm bg-[#FFF9F5] border-r border-[#E7C7CC] shadow-warm flex flex-col justify-between overflow-y-auto"
            aria-label="Mobile menu"
          >
            <div>
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#E7C7CC]/70">
                <BrandLogo to="/" size="sm" />
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 text-[#7A655C] hover:text-[#3E2F27] rounded-lg min-w-[40px] min-h-[40px] flex items-center justify-center"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="p-5 space-y-1">
                {primaryLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/' || link.to === '/shop'}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[#E7C7CC]/40 text-[#6D1836] font-semibold'
                          : 'text-[#3E2F27] hover:bg-[#F8EFEA]'
                      }`
                    }
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="w-4 h-4 opacity-40" />
                  </NavLink>
                ))}

                <div className="pt-4 mt-3 border-t border-[#E7C7CC]/60">
                  <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7A655C]">
                    Craft Categories
                  </p>
                  {categories.map((cat) => (
                    <NavLink
                      key={cat.id}
                      to={`/shop/category/${cat.slug}`}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors ${
                          isActive
                            ? 'bg-[#E7C7CC]/40 text-[#6D1836] font-semibold'
                            : 'text-[#7A655C] hover:text-[#3E2F27] hover:bg-[#F8EFEA]'
                        }`
                      }
                    >
                      <span className="truncate pr-2">{cat.label}</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
                    </NavLink>
                  ))}
                </div>
              </nav>
            </div>

            <div className="p-5 border-t border-[#E7C7CC]/70 bg-[#F8EFEA] space-y-3">
              <div className="flex items-center gap-2.5">
                <Link
                  to={user ? '/account' : '/login'}
                  onClick={onClose}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFF9F5] border border-[#E7C7CC] text-sm font-medium text-[#3E2F27] hover:border-[#6D1836] transition-colors"
                >
                  <User className="w-4 h-4 text-[#6D1836]" />
                  <span>{user ? 'My Account' : 'Sign In'}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openCartDrawer();
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#6D1836] text-[#FFF9F5] text-sm font-medium hover:bg-[#541129] transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Bag ({cartCount})</span>
                </button>
              </div>
              <div className="flex items-center justify-center gap-4 text-xs text-[#7A655C] pt-1">
                <Link to="/contact" onClick={onClose} className="hover:text-[#6D1836]">
                  Contact
                </Link>
                <span aria-hidden="true">·</span>
                <Link to="/faq" onClick={onClose} className="hover:text-[#6D1836]">
                  FAQ
                </Link>
                <span aria-hidden="true">·</span>
                <Link to="/policies/shipping" onClick={onClose} className="hover:text-[#6D1836]">
                  Shipping
                </Link>
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};
