import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  Users,
  PenTool,
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
  { label: 'Inventory', to: '/admin/inventory', icon: <Boxes className="w-4 h-4" /> },
  { label: 'Orders', to: '/admin/orders', icon: <ShoppingCart className="w-4 h-4" /> },
  { label: 'Customers', to: '/admin/customers', icon: <Users className="w-4 h-4" /> },
  { label: 'Commissions', to: '/admin/commissions', icon: <PenTool className="w-4 h-4" /> },
  { label: 'Analytics', to: '/admin/analytics', icon: <BarChart3 className="w-4 h-4" /> },
  { label: 'Discounts', to: '/admin/discounts', icon: <Tag className="w-4 h-4" /> },
  { label: 'Store Content', to: '/admin/content', icon: <FileText className="w-4 h-4" /> },
  { label: 'Settings', to: '/admin/settings', icon: <Settings className="w-4 h-4" /> },
];

export const AdminLayout: React.FC<{ children: React.ReactNode; title: string }> = ({
  children,
  title,
}) => {
  const { user, logout, allOrders, products, supabaseStatus } = useStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const pendingOrdersCount = allOrders.filter((o) => o.orderStatus === 'Pending').length;
  const lowStockCount = products.filter((p) => p.stock <= 2).length;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2B2623] flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="w-full lg:w-72 bg-[#F3EDE2] border-r border-[#EAE3D5] flex flex-col shrink-0">
        <div className="p-6 border-b border-[#EAE3D5] flex items-center justify-between">
          <BrandLogo to="/admin" />
          <span className="px-2.5 py-0.5 rounded-md bg-[#C86D51] text-white text-[10px] font-semibold tracking-wider uppercase">
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
                    ? 'bg-[#C86D51] text-white shadow-xs'
                    : 'text-[#6E655F] hover:bg-[#FAF7F2] hover:text-[#2B2623]'
                }`
              }
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.label === 'Orders' && pendingOrdersCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#E6B86A] text-[#2B2623] text-xs font-semibold tabular-nums">
                  {pendingOrdersCount}
                </span>
              )}
              {item.label === 'Inventory' && lowStockCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#B94F45]/15 text-[#B94F45] text-xs font-semibold tabular-nums">
                  {lowStockCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[#EAE3D5] bg-[#FAF7F2]/50 space-y-2">
          <Link
            to="/"
            className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-[#EAE3D5] text-xs font-medium text-[#2B2623] hover:bg-white transition-colors"
          >
            <span className="inline-flex items-center gap-2">
              <Store className="w-4 h-4 text-[#C86D51]" />
              <span>View Storefront</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          </Link>

          <div className="flex items-center justify-between pt-2 px-1">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[#2B2623] truncate">
                {user?.fullName ?? 'Studio Owner'}
              </p>
              <p className="text-[11px] text-[#6E655F] truncate">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="p-2 text-[#6E655F] hover:text-[#B94F45] rounded-lg transition-colors"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#EAE3D5] px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-[#6E655F]">varniks_atelier studio manager</p>
            <h1 className="font-display text-xl sm:text-2xl font-medium text-[#2B2623]">
              {title}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/admin/settings"
              className={`hidden sm:inline-block text-xs font-medium px-3 py-1.5 rounded-xl border ${
                supabaseStatus.tablesReady
                  ? 'text-[#7A9178] bg-[#7A9178]/10 border-[#7A9178]/30'
                  : 'text-[#C86D51] bg-[#E6B86A]/15 border-[#E6B86A]/40'
              }`}
            >
              {supabaseStatus.tablesReady
                ? 'Supabase PostgreSQL Synced'
                : 'Local Mode • Setup Supabase SQL'}
            </Link>
          </div>
        </header>

        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};
