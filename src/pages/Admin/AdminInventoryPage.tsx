import React, { useState } from 'react';
import { Boxes, Plus, Minus } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ResilientImage } from '../../components/common/ResilientImage';

export const AdminInventoryPage: React.FC = () => {
  const { products, updateProduct } = useStore();
  const [search, setSearch] = useState('');

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleAdjustStock = (id: string, delta: number) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    const nextStock = Math.max(0, product.stock + delta);
    updateProduct({ ...product, stock: nextStock });
  };

  return (
    <AdminLayout title="Inventory Control Center">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Boxes className="w-4 h-4 text-[#7A655C] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search inventory..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E7C7CC] text-sm text-[#3E2F27] focus:outline-none focus:border-[#6D1836]"
            />
          </div>
          <span className="text-xs text-[#7A655C] tabular-nums">
            {products.length} active catalog items
          </span>
        </div>

        <div className="bg-white border border-[#E7C7CC] rounded-2xl shadow-warm/40 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#E7C7CC] bg-[#FFF9F5]/50 text-xs text-[#7A655C]">
                <th className="py-3.5 px-4 font-medium">Artwork</th>
                <th className="py-3.5 px-4 font-medium">Type</th>
                <th className="py-3.5 px-4 font-medium">Current Stock</th>
                <th className="py-3.5 px-4 font-medium">Status</th>
                <th className="py-3.5 px-4 font-medium text-right">Stock Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7C7CC]">
              {filtered.map((prod) => (
                <tr key={prod.id} className="hover:bg-[#FFF9F5]/60">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <ResilientImage
                        src={prod.images[0]}
                        alt={prod.name}
                        className="w-12 h-12 rounded-lg object-cover border border-[#E7C7CC] shrink-0"
                      />
                      <div>
                        <p className="font-medium text-[#3E2F27]">{prod.name}</p>
                        <p className="text-xs text-[#7A655C]">{prod.medium}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-[#7A655C]">{prod.productType}</td>
                  <td className="py-3.5 px-4 font-semibold text-[#3E2F27] tabular-nums">
                    {prod.stock}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        prod.stock <= 1
                          ? 'bg-[#6D1836]/15 text-[#6D1836]'
                          : 'bg-[#C9A66B]/15 text-[#C9A66B]'
                      }`}
                    >
                      {prod.stock <= 1 ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAdjustStock(prod.id, -1)}
                        className="w-8 h-8 rounded-lg bg-[#FFF9F5] border border-[#E7C7CC] flex items-center justify-center text-[#3E2F27] hover:border-[#6D1836]"
                        title="Decrease stock"
                        aria-label={`Decrease stock for ${prod.name}`}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold tabular-nums">
                        {prod.stock}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAdjustStock(prod.id, 1)}
                        className="w-8 h-8 rounded-lg bg-[#FFF9F5] border border-[#E7C7CC] flex items-center justify-center text-[#3E2F27] hover:border-[#6D1836]"
                        title="Increase stock"
                        aria-label={`Increase stock for ${prod.name}`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
