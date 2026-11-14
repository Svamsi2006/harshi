import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { User, Package, History, MapPin, Settings, LogOut } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

const ACCOUNT_LINKS = [
  { label: 'Profile', to: '/account', icon: <User className="w-4 h-4" />, end: true },
  { label: 'My Orders', to: '/account/orders', icon: <Package className="w-4 h-4" /> },
  { label: 'Cart History', to: '/account/cart-history', icon: <History className="w-4 h-4" /> },
  { label: 'Saved Addresses', to: '/account/addresses', icon: <MapPin className="w-4 h-4" /> },
  {
    label: 'Account Settings',
    to: '/account?tab=settings',
    icon: <Settings className="w-4 h-4" />,
    isSettings: true,
  },
];

interface AccountSidebarProps {
  activeTab?: 'profile' | 'settings';
}

export const AccountSidebar: React.FC<AccountSidebarProps> = ({ activeTab }) => {
  const { user, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="bg-white border border-[#EAE3D5] rounded-2xl p-4 sm:p-5 shadow-warm/40">
      {user && (
        <div className="pb-4 mb-4 border-b border-[#EAE3D5]">
          <p className="font-handwritten text-xl text-[#C86D51] leading-none">Studio Patron</p>
          <p className="font-display text-lg font-medium text-[#2B2623] mt-1 truncate">
            {user.fullName}
          </p>
          <p className="text-xs text-[#6E655F] truncate">{user.email}</p>
        </div>
      )}

      <nav aria-label="Account sections" className="flex lg:flex-col gap-1.5 overflow-x-auto no-scrollbar">
        {ACCOUNT_LINKS.map((item) => {
          if (item.isSettings) {
            const isSettingsActive = activeTab === 'settings';
            return (
              <NavLink
                key={item.label}
                to={item.to}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                  isSettingsActive
                    ? 'bg-[#C86D51] text-white'
                    : 'text-[#6E655F] hover:bg-[#FAF7F2] hover:text-[#2B2623]'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => {
                const active = item.end ? isActive && activeTab !== 'settings' : isActive;
                return `flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-[#C86D51] text-white'
                    : 'text-[#6E655F] hover:bg-[#FAF7F2] hover:text-[#2B2623]'
                }`;
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#B2593E] hover:bg-[#C86D51]/10 transition-colors whitespace-nowrap lg:mt-2 lg:border-t lg:border-[#EAE3D5] lg:pt-3"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </nav>
    </aside>
  );
};
