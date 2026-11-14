import React from 'react';
import { PenTool } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { AdminLayout } from '../../components/admin/AdminLayout';

export const AdminCommissionsPage: React.FC = () => {
  const { commissions, updateCommissionStatus } = useStore();

  return (
    <AdminLayout title="Custom Artwork Commissions">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <PenTool className="w-4 h-4 text-[#C86D51]" />
          <span className="text-xs font-medium text-[#6E655F]">
            {commissions.length} commission requests submitted
          </span>
        </div>

        <div className="bg-white border border-[#EAE3D5] rounded-2xl shadow-warm/40 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#EAE3D5] bg-[#FAF7F2]/50 text-xs text-[#6E655F]">
                <th className="py-3.5 px-4 font-medium">Request ID</th>
                <th className="py-3.5 px-4 font-medium">Customer</th>
                <th className="py-3.5 px-4 font-medium">Artwork Type</th>
                <th className="py-3.5 px-4 font-medium">Budget Range</th>
                <th className="py-3.5 px-4 font-medium">Description</th>
                <th className="py-3.5 px-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE3D5]">
              {commissions.map((comm) => (
                <tr key={comm.id} className="hover:bg-[#FAF7F2]/60">
                  <td className="py-3.5 px-4 font-semibold text-[#2B2623]">{comm.id}</td>
                  <td className="py-3.5 px-4">
                    <p className="font-medium text-[#2B2623]">{comm.customerName}</p>
                    <p className="text-xs text-[#6E655F]">{comm.email}</p>
                  </td>
                  <td className="py-3.5 px-4 text-xs font-medium text-[#7A9178]">
                    {comm.artworkType}
                  </td>
                  <td className="py-3.5 px-4 text-xs tabular-nums">{comm.budgetRange}</td>
                  <td className="py-3.5 px-4 text-xs text-[#6E655F] max-w-xs truncate">
                    {comm.description}
                  </td>
                  <td className="py-3.5 px-4">
                    <select
                      value={comm.status}
                      onChange={(e) =>
                        updateCommissionStatus(comm.id, e.target.value as any)
                      }
                      aria-label="Update commission status"
                      className="px-3 py-1.5 rounded-lg bg-white border border-[#EAE3D5] text-xs font-medium text-[#2B2623] focus:outline-none focus:border-[#C86D51]"
                    >
                      <option value="New">New</option>
                      <option value="Reviewing">Reviewing</option>
                      <option value="Quoted">Quoted</option>
                      <option value="Accepted">Accepted</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                      <option value="Rejected">Rejected</option>
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
