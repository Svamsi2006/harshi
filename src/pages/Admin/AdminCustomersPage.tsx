import React from 'react';
import { Users } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatINR } from '../../utils/format';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { DEMO_CUSTOMER } from '../../data/mockAccount';

export const AdminCustomersPage: React.FC = () => {
  const { allOrders } = useStore();

  const customerOrdersCount = allOrders.filter(
    (o) => o.customerId === DEMO_CUSTOMER.id
  ).length;

  const customerSpend = allOrders
    .filter((o) => o.customerId === DEMO_CUSTOMER.id)
    .reduce((s, o) => s + o.total, 0);

  return (
    <AdminLayout title="Registered Customers">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-[#C86D51]" />
          <span className="text-xs font-medium text-[#6E655F]">1 active studio patron profile</span>
        </div>

        <div className="bg-white border border-[#EAE3D5] rounded-2xl shadow-warm/40 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#EAE3D5] bg-[#FAF7F2]/50 text-xs text-[#6E655F]">
                <th className="py-3.5 px-4 font-medium">Customer Name</th>
                <th className="py-3.5 px-4 font-medium">Email</th>
                <th className="py-3.5 px-4 font-medium">Phone</th>
                <th className="py-3.5 px-4 font-medium">Member Since</th>
                <th className="py-3.5 px-4 font-medium">Orders</th>
                <th className="py-3.5 px-4 font-medium text-right">Total Spend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE3D5]">
              <tr className="hover:bg-[#FAF7F2]/60">
                <td className="py-3.5 px-4 font-medium text-[#2B2623]">
                  {DEMO_CUSTOMER.fullName}
                </td>
                <td className="py-3.5 px-4 text-xs text-[#6E655F]">{DEMO_CUSTOMER.email}</td>
                <td className="py-3.5 px-4 text-xs text-[#6E655F]">{DEMO_CUSTOMER.phone}</td>
                <td className="py-3.5 px-4 text-xs text-[#6E655F]">{DEMO_CUSTOMER.joinedAt}</td>
                <td className="py-3.5 px-4 tabular-nums font-semibold">{customerOrdersCount}</td>
                <td className="py-3.5 px-4 text-right font-semibold text-[#2B2623] tabular-nums">
                  {formatINR(customerSpend)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};
