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
          <Users className="w-4 h-4 text-[#6D1836]" />
          <span className="text-xs font-medium text-[#7A655C]">1 active studio patron profile</span>
        </div>

        <div className="bg-white border border-[#E7C7CC] rounded-2xl shadow-warm/40 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#E7C7CC] bg-[#FFF9F5]/50 text-xs text-[#7A655C]">
                <th className="py-3.5 px-4 font-medium">Customer Name</th>
                <th className="py-3.5 px-4 font-medium">Email</th>
                <th className="py-3.5 px-4 font-medium">Phone</th>
                <th className="py-3.5 px-4 font-medium">Member Since</th>
                <th className="py-3.5 px-4 font-medium">Orders</th>
                <th className="py-3.5 px-4 font-medium text-right">Total Spend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7C7CC]">
              <tr className="hover:bg-[#FFF9F5]/60">
                <td className="py-3.5 px-4 font-medium text-[#3E2F27]">
                  {DEMO_CUSTOMER.fullName}
                </td>
                <td className="py-3.5 px-4 text-xs text-[#7A655C]">{DEMO_CUSTOMER.email}</td>
                <td className="py-3.5 px-4 text-xs text-[#7A655C]">{DEMO_CUSTOMER.phone}</td>
                <td className="py-3.5 px-4 text-xs text-[#7A655C]">{DEMO_CUSTOMER.joinedAt}</td>
                <td className="py-3.5 px-4 tabular-nums font-semibold">{customerOrdersCount}</td>
                <td className="py-3.5 px-4 text-right font-semibold text-[#3E2F27] tabular-nums">
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
