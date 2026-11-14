import React, { useState } from 'react';
import { ShoppingCart, CheckCircle2, Truck, Package, Clock } from 'lucide-react';
import type { OrderStatus } from '../../types';
import { useStore } from '../../context/StoreContext';
import { formatINR } from '../../utils/format';
import { AdminLayout } from '../../components/admin/AdminLayout';

const STATUS_OPTIONS: OrderStatus[] = [
  'Pending',
  'Confirmed',
  'Processing',
  'Packed',
  'Shipped',
  'Delivered',
  'Cancelled',
  'Refunded',
];

export const AdminOrdersPage: React.FC = () => {
  const { allOrders, updateOrderStatus } = useStore();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filtered = allOrders.filter(
    (o) => filterStatus === 'all' || o.orderStatus === filterStatus
  );

  return (
    <AdminLayout title="Order Fulfillment Management">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-[#C86D51]" />
            <span className="text-xs font-medium text-[#6E655F]">
              {allOrders.length} total orders recorded
            </span>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            aria-label="Filter orders by status"
            className="px-3.5 py-2.5 rounded-xl bg-white border border-[#EAE3D5] text-sm text-[#2B2623] focus:outline-none focus:border-[#C86D51]"
          >
            <option value="all">All Order Statuses</option>
            {STATUS_OPTIONS.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white border border-[#EAE3D5] rounded-2xl shadow-warm/40 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#EAE3D5] bg-[#FAF7F2]/50 text-xs text-[#6E655F]">
                <th className="py-3.5 px-4 font-medium">Order #</th>
                <th className="py-3.5 px-4 font-medium">Customer</th>
                <th className="py-3.5 px-4 font-medium">Date</th>
                <th className="py-3.5 px-4 font-medium">Total</th>
                <th className="py-3.5 px-4 font-medium">Payment</th>
                <th className="py-3.5 px-4 font-medium">Fulfillment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE3D5]">
              {filtered.map((ord) => (
                <tr key={ord.id} className="hover:bg-[#FAF7F2]/60">
                  <td className="py-3.5 px-4 font-semibold text-[#2B2623]">{ord.orderNumber}</td>
                  <td className="py-3.5 px-4">
                    <p className="font-medium text-[#2B2623]">{ord.shippingAddress.fullName}</p>
                    <p className="text-xs text-[#6E655F]">{ord.shippingAddress.city}</p>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-[#6E655F]">{ord.date}</td>
                  <td className="py-3.5 px-4 font-semibold text-[#2B2623] tabular-nums">
                    {formatINR(ord.total)}
                  </td>
                  <td className="py-3.5 px-4 text-xs">
                    <span className="px-2.5 py-1 rounded-md bg-[#7A9178]/15 text-[#7A9178] font-medium">
                      {ord.paymentStatus} ({ord.paymentMethod})
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <select
                      value={ord.orderStatus}
                      onChange={(e) =>
                        updateOrderStatus(ord.id, e.target.value as OrderStatus)
                      }
                      aria-label="Update order fulfillment status"
                      className="px-3 py-1.5 rounded-lg bg-white border border-[#EAE3D5] text-xs font-medium text-[#2B2623] focus:outline-none focus:border-[#C86D51]"
                    >
                      {STATUS_OPTIONS.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};
