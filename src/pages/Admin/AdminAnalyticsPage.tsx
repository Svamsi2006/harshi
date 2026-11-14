import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, DollarSign, ShoppingCart, Users } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useStore } from '../../context/StoreContext';
import { formatINR } from '../../utils/format';
import { AdminLayout } from '../../components/admin/AdminLayout';

export const AdminAnalyticsPage: React.FC = () => {
  const { allOrders, products } = useStore();

  const totalRevenue = useMemo(
    () => allOrders.reduce((sum, o) => (o.paymentStatus === 'Paid' ? sum + o.total : sum), 0),
    [allOrders]
  );

  const data = [
    { category: 'Sketches', sales: 4200 },
    { category: 'Terracotta', sales: 6800 },
    { category: 'Paintings', sales: 11200 },
    { category: 'Prints', sales: 3400 },
  ];

  return (
    <AdminLayout title="Sales & Revenue Analytics">
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white border border-[#EAE3D5] rounded-2xl p-5 shadow-warm/40 space-y-2">
            <div className="flex items-center justify-between text-[#6E655F]">
              <span className="text-xs font-medium">Gross Recognized Revenue</span>
              <DollarSign className="w-4 h-4 text-[#7A9178]" />
            </div>
            <p className="text-2xl font-semibold text-[#2B2623] tabular-nums">
              {formatINR(totalRevenue)}
            </p>
            <p className="text-xs text-[#7A9178] flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Verified paid orders only</span>
            </p>
          </div>

          <div className="bg-white border border-[#EAE3D5] rounded-2xl p-5 shadow-warm/40 space-y-2">
            <div className="flex items-center justify-between text-[#6E655F]">
              <span className="text-xs font-medium">Total Catalog Works</span>
              <ShoppingCart className="w-4 h-4 text-[#C86D51]" />
            </div>
            <p className="text-2xl font-semibold text-[#2B2623] tabular-nums">{products.length}</p>
            <p className="text-xs text-[#6E655F]">Active studio listings</p>
          </div>

          <div className="bg-white border border-[#EAE3D5] rounded-2xl p-5 shadow-warm/40 space-y-2">
            <div className="flex items-center justify-between text-[#6E655F]">
              <span className="text-xs font-medium">Customer Patronage</span>
              <Users className="w-4 h-4 text-[#E6B86A]" />
            </div>
            <p className="text-2xl font-semibold text-[#2B2623] tabular-nums">1</p>
            <p className="text-xs text-[#6E655F]">Active collector profile</p>
          </div>
        </div>

        <div className="bg-white border border-[#EAE3D5] rounded-2xl p-6 shadow-warm/40 space-y-4">
          <h2 className="font-display text-lg font-medium text-[#2B2623] inline-flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#C86D51]" />
            <span>Category Revenue Breakdown (₹ INR)</span>
          </h2>

          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="category" stroke="#6E655F" fontSize={12} tickLine={false} />
                <YAxis stroke="#6E655F" fontSize={12} tickLine={false} />
                <Tooltip
                  formatter={(value: any) => [formatINR(Number(value)), 'Sales']}
                  contentStyle={{
                    backgroundColor: '#FAF7F2',
                    borderColor: '#EAE3D5',
                    borderRadius: '12px',
                  }}
                />
                <Bar dataKey="sales" fill="#C86D51" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
