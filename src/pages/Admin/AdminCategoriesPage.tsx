import React, { useState } from 'react';
import { Layers, Plus, Trash2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { AdminLayout } from '../../components/admin/AdminLayout';

export const AdminCategoriesPage: React.FC = () => {
  const { categories, products, addCategory, deleteCategory } = useStore();
  const [label, setLabel] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [error, setError] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) {
      setError('Please enter a category name.');
      return;
    }
    if (categories.some((c) => c.label.toLowerCase() === label.trim().toLowerCase())) {
      setError('A category with this name already exists.');
      return;
    }
    setError('');
    addCategory({ label: label.trim(), subtitle: subtitle.trim() });
    setLabel('');
    setSubtitle('');
  };

  return (
    <AdminLayout title="Categories Management">
      <div className="max-w-5xl space-y-8">
        {/* Add Custom Category Card */}
        <form
          onSubmit={handleAdd}
          className="bg-white border border-[#E7C7CC] rounded-2xl p-6 shadow-warm/40 space-y-4"
        >
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#6D1836]" />
            <h2 className="font-display text-lg font-medium text-[#3E2F27]">
              Add Custom Category
            </h2>
          </div>
          <p className="text-xs text-[#7A655C]">
            New categories immediately appear on the storefront filter pills, search drawer, custom
            orders form, and product creator.
          </p>

          {error && (
            <p className="text-xs text-[#6D1836] bg-[#6D1836]/10 border border-[#6D1836]/25 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
            <div className="sm:col-span-5">
              <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
                Category Name *
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Memory Scrapbooks & Hampers"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF9F5] border border-[#E7C7CC] text-sm text-[#3E2F27] focus:outline-none focus:border-[#6D1836]"
              />
            </div>

            <div className="sm:col-span-5">
              <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
                Short Subtitle
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Handbound gift boxes & keepsakes"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF9F5] border border-[#E7C7CC] text-sm text-[#3E2F27] focus:outline-none focus:border-[#6D1836]"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-[#FFF9F5] text-sm font-medium transition-colors whitespace-nowrap"
              >
                Add Category
              </button>
            </div>
          </div>
        </form>

        {/* Active Categories Table */}
        <div className="bg-white border border-[#E7C7CC] rounded-2xl shadow-warm/40 overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E7C7CC]/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#6D1836]" />
              <h2 className="font-display text-lg font-medium text-[#3E2F27]">
                Active Storefront Categories ({categories.length})
              </h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#E7C7CC]/60 bg-[#F8EFEA]/60 text-xs text-[#7A655C]">
                  <th className="py-3 px-4 font-medium">Category Label</th>
                  <th className="py-3 px-4 font-medium">URL Slug</th>
                  <th className="py-3 px-4 font-medium">Subtitle</th>
                  <th className="py-3 px-4 font-medium">Products</th>
                  <th className="py-3 px-4 font-medium text-right">Remove</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7C7CC]/50">
                {categories.map((cat) => {
                  const count = products.filter((p) => p.category === cat.slug).length;
                  return (
                    <tr key={cat.id} className="hover:bg-[#FFF9F5]">
                      <td className="py-3.5 px-4 font-medium text-[#3E2F27]">{cat.label}</td>
                      <td className="py-3.5 px-4 text-xs font-mono text-[#7A655C]">{cat.slug}</td>
                      <td className="py-3.5 px-4 text-xs text-[#7A655C] max-w-xs truncate">
                        {cat.subtitle}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-[#6D1836] tabular-nums">
                        {count}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {confirmDeleteId === cat.id ? (
                          <div className="inline-flex items-center gap-1.5 bg-[#FFF9F5] border border-[#6D1836]/30 rounded-xl px-2 py-1">
                            <span className="text-[11px] font-medium text-[#6D1836] px-1">
                              Delete?
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                deleteCategory(cat.id);
                                setConfirmDeleteId(null);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-[#6D1836] hover:bg-[#541129] text-[#FFF9F5] text-[11px] font-semibold transition-colors"
                            >
                              Confirm
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
                          <button
                            type="button"
                            onClick={() => {
                              if (categories.length <= 1) return;
                              setConfirmDeleteId(cat.id);
                            }}
                            disabled={categories.length <= 1}
                            className="p-2 text-[#7A655C] hover:text-[#6D1836] rounded-lg transition-colors disabled:opacity-35"
                            title="Remove category"
                            aria-label={`Remove ${cat.label}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
