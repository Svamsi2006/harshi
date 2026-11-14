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
            <Boxes className="w-4 h-4 text-[#6E655F] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search inventory..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#EAE3D5] text-sm text-[#2B2623] focus:outline-none focus:border-[#C86D51]"
            />
          </div>
          <span className="text-xs text-[#6E655F] tabular-nums">
            {products.length} active catalog items
          </span>
        </div>

        <div className="bg-white border border-[#EAE3D5] rounded-2xl shadow-warm/40 overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#EAE3D5] bg-[#FAF7F2]/50 text-xs text-[#6E655F]">
                <th className="py-3.5 px-4 font-medium">Artwork</th>
                <th className="py-3.5 px-4 font-medium">Type</th>
                <th className="py-3.5 px-4 font-medium">Current Stock</th>
                <th className="py-3.5 px-4 font-medium">Status</th>
                <th className="py-3.5 px-4 font-medium text-right">Stock Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAE3D5]">
              {filtered.map((prod) => (
                <tr key={prod.id} className="hover:bg-[#FAF7F2]/60">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <ResilientImage
                        src={prod.images[0]}
                        alt={prod.name}
                        className="w-12 h-12 rounded-lg object-cover border border-[#EAE3D5] shrink-0"
                      />
                      <div>
                        <p className="font-medium text-[#2B2623]">{prod.name}</p>
                        <p className="text-xs text-[#6E655F]">{prod.medium}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-xs text-[#6E655F]">{prod.productType}</td>
                  <td className="py-3.5 px-4 font-semibold text-[#2B2623] tabular-nums">
                    {prod.stock}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        prod.stock <= 1
                          ? 'bg-[#B94F45]/15 text-[#B94F45]'
                          : 'bg-[#7A9178]/15 text-[#7A9178]'
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
                        className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#EAE3D5] flex items-center justify-center text-[#2B2623] hover:border-[#C86D51]"
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
                        className="w-8 h-8 rounded-lg bg-[#FAF7F2] border border-[#EAE3D5] flex items-center justify-center text-[#2B2623] hover:border-[#C86D51]"
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
