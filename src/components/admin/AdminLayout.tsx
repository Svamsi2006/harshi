import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  Boxes,
  ShoppingCart,
  Users,
  Sparkles,
  BarChart3,
  Tag,
  FileText,
  Settings,
  LogOut,
  Store,
  ChevronRight,
} from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { useStore } from '../../context/StoreContext';

const ADMIN_NAV = [
  { label: 'Dashboard', to: '/admin', icon: <LayoutDashboard className="w-4 h-4" />, end: true },
  { label: 'Products', to: '/admin/products', icon: <Package className="w-4 h-4" /> },
  { label: 'Categories', to: '/admin/categories', icon: <Layers className="w-4 h-4" /> },
  { label: 'Inventory', to: '/admin/inventory', icon: <Boxes className="w-4 h-4" /> },
  { label: 'Orders', to: '/admin/orders', icon: <ShoppingCart className="w-4 h-4" /> },
  { label: 'Customers', to: '/admin/customers', icon: <Users className="w-4 h-4" /> },
  { label: 'Custom Orders', to: '/admin/commissions', icon: <Sparkles className="w-4 h-4" /> },
  { label: 'Analytics', to: '/admin/analytics', icon: <BarChart3 className="w-4 h-4" /> },
  { label: 'Discounts', to: '/admin/discounts', icon: <Tag className="w-4 h-4" /> },
  { label: 'Store Content', to: '/admin/content', icon: <FileText className="w-4 h-4" /> },
  { label: 'Settings', to: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
];

export const AdminLayout: React.FC<{ children: React.ReactNode; title: string }> = ({
  children,
  title,
}) => {
  const { user, logout, allOrders, products, commissions, supabaseStatus } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const pendingOrdersCount = allOrders.filter((o) => o.orderStatus === 'Pending').length;
  const lowStockCount = products.filter((p) => p.stock <= 2).length;
  const waitingCustomCount = commissions.filter((c) => !c.adminApproved && !c.orderCreated).length;

  return (
    <div className="min-h-screen bg-[#FFF9F5] text-[#3E2F27] flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-72 bg-[#F8EFEA] border-r border-[#E7C7CC] flex flex-col shrink-0">
        <div className="p-6 border-b border-[#E7C7CC] flex items-center justify-between">
          <BrandLogo to="/admin" />
          <span className="px-2.5 py-0.5 rounded-md bg-[#6D1836] text-[#FFF9F5] text-[10px] font-semibold tracking-wider uppercase">
            Admin
          </span>
        </div>

        <nav aria-label="Admin navigation" className="flex-1 p-4 space-y-1 overflow-y-auto">
          {ADMIN_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#6D1836] text-[#FFF9F5] shadow-xs'
                    : 'text-[#7A655C] hover:bg-[#FFF9F5] hover:text-[#3E2F27]'
                }`
              }
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.label === 'Orders' && pendingOrdersCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#C9A66B] text-[#3E2F27] text-xs font-semibold tabular-nums">
                  {pendingOrdersCount}
                </span>
              )}
              {item.label === 'Custom Orders' && waitingCustomCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#E7C7CC] text-[#6D1836] text-xs font-semibold tabular-nums">
                  {waitingCustomCount}
                </span>
              )}
              {item.label === 'Inventory' && lowStockCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#6D1836]/15 text-[#6D1836] text-xs font-semibold tabular-nums">
                  {lowStockCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[#E7C7CC] bg-[#FFF9F5]/60 space-y-2">
          <Link
            to="/"
            className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-[#E7C7CC] text-xs font-medium text-[#3E2F27] hover:bg-white transition-colors"
          >
            <span className="inline-flex items-center gap-2">
              <Store className="w-4 h-4 text-[#6D1836]" />
              <span>View Storefront</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </Link>

          <div className="flex items-center justify-between pt-2 px-1 gap-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#3E2F27] truncate">
                {user?.fullName ?? 'Studio Owner'}
              </p>
              <p className="text-[11px] text-[#7A655C] truncate">{user?.email}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-[#FFF9F5] text-xs font-semibold transition-colors"
            title="Sign out of Admin Studio"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-[#FFF9F5]/92 backdrop-blur-md border-b border-[#E7C7CC] px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-[#7A655C]">varniks_atelier studio manager</p>
            <h1 className="font-display text-xl sm:text-2xl font-medium text-[#3E2F27]">
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              to="/admin/settings"
              className={`hidden sm:inline-block text-xs font-medium px-3 py-1.5 rounded-xl border ${
                supabaseStatus.tablesReady
                  ? 'text-[#8C6B3F] bg-[#C9A66B]/15 border-[#C9A66B]/45'
                  : 'text-[#6D1836] bg-[#E7C7CC]/35 border-[#E7C7CC]'
              }`}
            >
              {supabaseStatus.tablesReady
                ? 'Supabase PostgreSQL Synced'
                : 'Local Mode • Setup Supabase SQL'}
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#E7C7CC] bg-white hover:border-[#6D1836] hover:text-[#6D1836] text-xs font-semibold text-[#3E2F27] transition-colors"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};
