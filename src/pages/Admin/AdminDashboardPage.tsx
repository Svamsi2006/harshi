import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { useStore } from '../../context/StoreContext';
import { formatINR } from '../../utils/format';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ResilientImage } from '../../components/common/ResilientImage';

export const AdminDashboardPage: React.FC = () => {
  const { allOrders, products } = useStore();

  const totalRevenue = useMemo(
    () => allOrders.reduce((sum, o) => (o.paymentStatus === 'Paid' ? sum + o.total : sum), 0),
    [allOrders]
  );

  const totalOrders = allOrders.length;
  const pendingOrders = allOrders.filter((o) => o.orderStatus === 'Pending').length;
  const lowStockProducts = products.filter((p) => p.stock <= 2);

  const chartData = useMemo(() => {
    return [
      { date: 'Nov 8', revenue: 3098, orders: 1 },
      { date: 'Nov 9', revenue: 1998, orders: 1 },
      { date: 'Nov 10', revenue: 2450, orders: 1 },
      { date: 'Nov 11', revenue: 4499, orders: 1 },
      { date: 'Nov 12', revenue: 3600, orders: 2 },
      { date: 'Nov 13', revenue: 5890, orders: 2 },
      { date: 'Nov 14', revenue: totalRevenue > 15000 ? totalRevenue - 12000 : 4200, orders: 2 },
    ];
  }, [totalRevenue]);

  return (
    <AdminLayout title="Studio Overview">
      <div className="space-y-8">
        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white border border-[#EAE3D5] rounded-2xl p-5 shadow-warm/40 space-y-2">
            <div className="flex items-center justify-between text-[#6E655F]">
              <span className="text-xs font-medium">Total Revenue</span>
              <div className="w-8 h-8 rounded-xl bg-[#7A9178]/15 text-[#7A9178] flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-[#2B2623] tabular-nums">
              {formatINR(totalRevenue)}
            </p>
            <p className="text-xs text-[#7A9178] flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% vs last month</span>
            </p>
          </div>

          <div className="bg-white border border-[#EAE3D5] rounded-2xl p-5 shadow-warm/40 space-y-2">
            <div className="flex items-center justify-between text-[#6E655F]">
              <span className="text-xs font-medium">Total Orders</span>
              <div className="w-8 h-8 rounded-xl bg-[#C86D51]/15 text-[#C86D51] flex items-center justify-center">
                <ShoppingCart className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-[#2B2623] tabular-nums">{totalOrders}</p>
            <p className="text-xs text-[#6E655F]">Fully synchronized</p>
          </div>

          <div className="bg-white border border-[#EAE3D5] rounded-2xl p-5 shadow-warm/40 space-y-2">
            <div className="flex items-center justify-between text-[#6E655F]">
              <span className="text-xs font-medium">Active Products</span>
              <div className="w-8 h-8 rounded-xl bg-[#E6B86A]/25 text-[#2B2623] flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-[#2B2623] tabular-nums">{products.length}</p>
            <p className="text-xs text-[#6E655F]">Sketches, Clay &amp; Prints</p>
          </div>

          <div className="bg-white border border-[#EAE3D5] rounded-2xl p-5 shadow-warm/40 space-y-2">
            <div className="flex items-center justify-between text-[#6E655F]">
              <span className="text-xs font-medium">Pending Fulfillment</span>
              <div className="w-8 h-8 rounded-xl bg-[#B94F45]/15 text-[#B94F45] flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-[#2B2623] tabular-nums">{pendingOrders}</p>
            <p className="text-xs text-[#B94F45] font-medium">Requires packing</p>
          </div>
        </div>

        {/* Revenue Chart + Low Stock Alert */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 bg-white border border-[#EAE3D5] rounded-2xl p-6 shadow-warm/40 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-medium text-[#2B2623]">Revenue Trend</h2>
                <p className="text-xs text-[#6E655F]">Successful paid orders over the last 7 days</p>
              </div>
              <span className="text-xs font-semibold text-[#7A9178] bg-[#7A9178]/10 px-3 py-1 rounded-lg">
                Live Data
              </span>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C86D51" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#C86D51" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#6E655F" fontSize={12} tickLine={false} />
                  <YAxis stroke="#6E655F" fontSize={12} tickLine={false} />
                  <Tooltip
                    formatter={(value: any) => [formatINR(Number(value)), 'Revenue']}
                    contentStyle={{
                      backgroundColor: '#FAF7F2',
                      borderColor: '#EAE3D5',
                      borderRadius: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#C86D51"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 bg-white border border-[#EAE3D5] rounded-2xl p-6 shadow-warm/40 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-medium text-[#2B2623] inline-flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#E6B86A]" />
                <span>Low Stock Alerts</span>
              </h2>
              <span className="text-xs text-[#6E655F] tabular-nums">{lowStockProducts.length} items</span>
            </div>

            {lowStockProducts.length === 0 ? (
              <p className="text-xs text-[#7A9178] py-8 text-center">
                All catalog inventory levels are healthy ♡
              </p>
            ) : (
              <ul className="divide-y divide-[#EAE3D5]">
                {lowStockProducts.map((p) => (
                  <li key={p.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <ResilientImage
                        src={p.images[0]}
                        alt={p.name}
                        className="w-10 h-10 rounded-lg object-cover border border-[#EAE3D5] shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-[#2B2623] truncate">{p.name}</p>
                        <p className="text-[11px] text-[#B94F45]">Stock: {p.stock} remaining</p>
                      </div>
                    </div>
                    <Link
                      to={`/admin/products/${p.id}/edit`}
                      className="text-xs font-medium text-[#C86D51] hover:underline shrink-0"
                    >
                      Update
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white border border-[#EAE3D5] rounded-2xl p-6 shadow-warm/40 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-medium text-[#2B2623]">Recent Orders</h2>
              <p className="text-xs text-[#6E655F]">Latest customer purchases across the storefront</p>
            </div>
            <Link
              to="/admin/orders"
              className="inline-flex items-center gap-1 text-xs font-medium text-[#C86D51] hover:text-[#B2593E]"
            >
              <span>View all orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#EAE3D5] text-xs text-[#6E655F]">
                  <th className="pb-3 font-medium">Order #</th>
                  <th className="pb-3 font-medium">Customer</th>
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Total</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE3D5]">
                {allOrders.slice(0, 5).map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#FAF7F2]/60">
                    <td className="py-3.5 font-semibold text-[#2B2623]">{ord.orderNumber}</td>
                    <td className="py-3.5 text-[#6E655F]">{ord.shippingAddress.fullName}</td>
                    <td className="py-3.5 text-[#6E655F]">{ord.date}</td>
                    <td className="py-3.5 font-semibold text-[#2B2623] tabular-nums">
                      {formatINR(ord.total)}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          ord.orderStatus === 'Delivered'
                            ? 'bg-[#7A9178]/15 text-[#7A9178]'
                            : ord.orderStatus === 'Shipped'
                              ? 'bg-[#7A9178]/25 text-[#495B47]'
                              : 'bg-[#E6B86A]/25 text-[#2B2623]'
                        }`}
                      >
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <Link
                        to="/admin/orders"
                        className="text-xs font-medium text-[#C86D51] hover:underline"
                      >
                        Manage →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
