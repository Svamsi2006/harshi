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

const MOBILE_LINKS = [
  { label: 'Home Studio', to: '/' },
  { label: 'Shop All Works', to: '/shop' },
  { label: 'Pencil & Charcoal Sketches', to: '/shop/sketches' },
  { label: 'Handicrafts & Clay', to: '/shop/handicrafts' },
  { label: 'Original Paintings', to: '/shop/paintings' },
  { label: 'Watercolor Prints', to: '/shop/prints' },
  { label: 'Artist Story', to: '/artist-story' },
  { label: 'Custom Commission', to: '/commission' },
];

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ isOpen, onClose }) => {
  const { user, cartCount, openCartDrawer } = useStore();

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-[#2B2623]/30 backdrop-blur-xs"
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed top-0 left-0 bottom-0 w-[86vw] max-w-sm bg-[#FAF7F2] border-r border-[#EAE3D5] shadow-warm flex flex-col justify-between overflow-y-auto"
            aria-label="Mobile menu"
          >
            <div>
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#EAE3D5]">
                <BrandLogo to="/" size="sm" />
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 text-[#6E655F] hover:text-[#2B2623] rounded-lg min-w-[40px] min-h-[40px] flex items-center justify-center"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="p-5 space-y-1">
                {MOBILE_LINKS.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/' || link.to === '/shop'}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[#F3EDE2] text-[#C86D51]'
                          : 'text-[#2B2623] hover:bg-[#F3EDE2]/60'
                      }`
                    }
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="w-4 h-4 opacity-40" />
                  </NavLink>
                ))}
              </nav>
            </div>

            <div className="p-5 border-t border-[#EAE3D5] bg-[#F3EDE2]/60 space-y-3">
              <div className="flex items-center gap-2.5">
                <Link
                  to={user ? '/account' : '/login'}
                  onClick={onClose}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#EAE3D5] text-sm font-medium text-[#2B2623] hover:border-[#C86D51] transition-colors"
                >
                  <User className="w-4 h-4 text-[#C86D51]" />
                  <span>{user ? 'My Account' : 'Sign In'}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    openCartDrawer();
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#C86D51] text-white text-sm font-medium hover:bg-[#B2593E] transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Bag ({cartCount})</span>
                </button>
              </div>
              <div className="flex items-center justify-center gap-4 text-xs text-[#6E655F] pt-1">
                <Link to="/contact" onClick={onClose} className="hover:text-[#2B2623]">
                  Contact
                </Link>
                <span aria-hidden="true">·</span>
                <Link to="/faq" onClick={onClose} className="hover:text-[#2B2623]">
                  FAQ
                </Link>
                <span aria-hidden="true">·</span>
                <Link to="/policies/shipping" onClick={onClose} className="hover:text-[#2B2623]">
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
