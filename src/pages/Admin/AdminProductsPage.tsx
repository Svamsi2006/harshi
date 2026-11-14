import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Pencil, Copy, Trash2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatINR } from '../../utils/format';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ResilientImage } from '../../components/common/ResilientImage';

export const AdminProductsPage: React.FC = () => {
  const { products, deleteProduct, duplicateProduct } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');

  const filtered = products.filter((p) => {
    const matchQuery =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.medium.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || p.category === filterCat;
    return matchQuery && matchCat;
  });

  return (
    <AdminLayout title="Product Catalog Management">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#6E655F] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products by name or medium..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#EAE3D5] text-sm text-[#2B2623] focus:outline-none focus:border-[#C86D51]"
              />
            </div>
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              aria-label="Filter by category"
              className="px-3.5 py-2.5 rounded-xl bg-white border border-[#EAE3D5] text-sm text-[#2B2623] focus:outline-none focus:border-[#C86D51]"
            >
              <option value="all">All Categories</option>
              <option value="sketches">Sketches</option>
              <option value="clay-terracotta">Clay &amp; Terracotta</option>
              <option value="wood-woven">Wood &amp; Woven</option>
              <option value="paintings">Paintings</option>
              <option value="prints">Prints</option>
            </select>
          </div>

          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C86D51] hover:bg-[#B2593E] text-white text-sm font-medium transition-colors shadow-warm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>

        <div className="bg-white border border-[#EAE3D5] rounded-2xl shadow-warm/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#EAE3D5] bg-[#FAF7F2]/50 text-xs text-[#6E655F]">
                  <th className="py-3.5 px-4 font-medium">Artwork</th>
                  <th className="py-3.5 px-4 font-medium">Category</th>
                  <th className="py-3.5 px-4 font-medium">Type</th>
                  <th className="py-3.5 px-4 font-medium">Price</th>
                  <th className="py-3.5 px-4 font-medium">Stock</th>
                  <th className="py-3.5 px-4 font-medium text-right">Actions</th>
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
                        <div className="min-w-0">
                          <p className="font-medium text-[#2B2623] truncate">{prod.name}</p>
                          <p className="text-xs text-[#6E655F] truncate">{prod.subtitle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#6E655F]">{prod.categoryLabel}</td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="px-2.5 py-1 rounded-md bg-[#F3EDE2] text-[#2B2623] font-medium">
                        {prod.productType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#2B2623] tabular-nums">
                      {formatINR(prod.price)}
                    </td>
                    <td className="py-3.5 px-4 tabular-nums">
                      <span
                        className={
                          prod.stock <= 1
                            ? 'text-[#B94F45] font-semibold'
                            : 'text-[#7A9178] font-medium'
                        }
                      >
                        {prod.stock} {prod.stock === 1 ? 'unit' : 'units'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => navigate(`/admin/products/${prod.id}/edit`)}
                          className="p-2 text-[#6E655F] hover:text-[#C86D51] rounded-lg transition-colors"
                          title="Edit / Replace product"
                          aria-label={`Edit ${prod.name}`}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => duplicateProduct(prod.id)}
                          className="p-2 text-[#6E655F] hover:text-[#2B2623] rounded-lg transition-colors"
                          title="Duplicate product"
                          aria-label={`Duplicate ${prod.name}`}
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to remove ${prod.name}?`)) {
                              deleteProduct(prod.id);
                            }
                          }}
                          className="p-2 text-[#6E655F] hover:text-[#B94F45] rounded-lg transition-colors"
                          title="Remove product"
                          aria-label={`Remove ${prod.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
