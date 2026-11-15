import React, { useState } from 'react';
import { FileText, Save } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { AdminLayout } from '../../components/admin/AdminLayout';

export const AdminContentPage: React.FC = () => {
  const { storeSettings, saveStoreSettings } = useStore();
  const [announcementText, setAnnouncementText] = useState(storeSettings.announcementText);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoreSettings({
      ...storeSettings,
      announcementText: announcementText.trim(),
    });
  };

  return (
    <AdminLayout title="Storefront Content & Copy">
      <div className="max-w-3xl space-y-6">
        <form
          onSubmit={handleSave}
          className="bg-white border border-[#E7C7CC] rounded-2xl p-6 sm:p-8 shadow-warm/40 space-y-5"
        >
          <div className="flex items-center gap-2 pb-3 border-b border-[#E7C7CC]">
            <FileText className="w-4 h-4 text-[#6D1836]" />
            <h2 className="font-display text-lg font-medium text-[#3E2F27]">
              Top Announcement Strip
            </h2>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
              Announcement Message
            </label>
            <input
              type="text"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFF9F5] border border-[#E7C7CC] text-sm text-[#3E2F27] focus:outline-none focus:border-[#6D1836]"
            />
            <p className="text-xs text-[#7A655C] mt-1.5">
              Displayed across the top of every customer storefront page.
            </p>
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-white text-sm font-medium transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Content Changes</span>
          </button>
        </form>
      </div>
    </AdminLayout>
  );
};
