import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Pencil, Copy, Trash2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatINR } from '../../utils/format';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ResilientImage } from '../../components/common/ResilientImage';

export const AdminProductsPage: React.FC = () => {
  const { products, categories, deleteProduct, duplicateProduct } = useStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = products.filter((p) => {
    const matchQuery =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.medium.toLowerCase().includes(search.toLowerCase()) ||
      p.categoryLabel.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || p.category === filterCat;
    return matchQuery && matchCat;
  });

  return (
    <AdminLayout title="Product Catalog Management">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-lg">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#7A655C] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products by name, category, or medium..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E7C7CC] text-sm text-[#3E2F27] focus:outline-none focus:border-[#6D1836]"
              />
            </div>
            <select
              value={filterCat}
              onChange={(e) => setFilterCat(e.target.value)}
              aria-label="Filter by category"
              className="px-3.5 py-2.5 rounded-xl bg-white border border-[#E7C7CC] text-sm text-[#3E2F27] focus:outline-none focus:border-[#6D1836]"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <Link
            to="/admin/products/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-[#FFF9F5] text-sm font-medium transition-colors shadow-warm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
        </div>

        <div className="bg-white border border-[#E7C7CC] rounded-2xl shadow-warm/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E7C7CC]/60 bg-[#F8EFEA]/50 text-xs text-[#7A655C]">
                  <th className="py-3.5 px-4 font-medium">Creation</th>
                  <th className="py-3.5 px-4 font-medium">Category</th>
                  <th className="py-3.5 px-4 font-medium">Type</th>
                  <th className="py-3.5 px-4 font-medium">Price</th>
                  <th className="py-3.5 px-4 font-medium">Stock</th>
                  <th className="py-3.5 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7C7CC]/50">
                {filtered.map((prod) => (
                  <tr key={prod.id} className="hover:bg-[#FFF9F5]">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <ResilientImage
                          src={prod.images[0]}
                          alt={prod.name}
                          className="w-12 h-12 rounded-lg object-cover border border-[#E7C7CC] shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-medium text-[#3E2F27] truncate">{prod.name}</p>
                          <p className="text-xs text-[#7A655C] truncate">{prod.subtitle}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#7A655C]">{prod.categoryLabel}</td>
                    <td className="py-3.5 px-4 text-xs">
                      <span className="px-2.5 py-1 rounded-md bg-[#F8EFEA] text-[#3E2F27] font-medium">
                        {prod.productType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#3E2F27] tabular-nums">
                      {formatINR(prod.price)}
                    </td>
                    <td className="py-3.5 px-4 tabular-nums">
                      <span
                        className={
                          prod.stock <= 1
                            ? 'text-[#6D1836] font-semibold'
                            : 'text-[#8C6B3F] font-medium'
                        }
                      >
                        {prod.stock} {prod.stock === 1 ? 'unit' : 'units'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1 justify-end">
                        {confirmDeleteId === prod.id ? (
                          <div className="inline-flex items-center gap-1.5 bg-[#FFF9F5] border border-[#6D1836]/30 rounded-xl px-2 py-1">
                            <span className="text-[11px] font-medium text-[#6D1836] px-1">
                              Delete?
                            </span>
                            <button
                              type="button"
                              disabled={deletingId === prod.id}
                              onClick={async () => {
                                setDeletingId(prod.id);
                                await deleteProduct(prod.id);
                                setDeletingId(null);
                                setConfirmDeleteId(null);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#6D1836] hover:bg-[#541129] text-[#FFF9F5] text-[11px] font-semibold transition-colors disabled:opacity-60"
                            >
                              {deletingId === prod.id ? 'Removing...' : 'Confirm'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(null)}
                              className="px-2 py-1 rounded-lg border border-[#E7C7CC] text-[#7A655C] hover:text-[#3E2F27] text-[11px] font-medium transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => navigate(`/admin/products/${prod.id}/edit`)}
                              className="p-2 text-[#7A655C] hover:text-[#6D1836] rounded-lg transition-colors"
                              title="Edit / Replace product"
                              aria-label={`Edit ${prod.name}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                void duplicateProduct(prod.id);
                              }}
                              className="p-2 text-[#7A655C] hover:text-[#3E2F27] rounded-lg transition-colors"
                              title="Duplicate product"
                              aria-label={`Duplicate ${prod.name}`}
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(prod.id)}
                              className="p-2 text-[#7A655C] hover:text-[#6D1836] rounded-lg transition-colors"
                              title="Remove product"
                              aria-label={`Remove ${prod.name}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
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
