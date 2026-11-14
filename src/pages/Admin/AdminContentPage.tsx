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
          className="bg-white border border-[#EAE3D5] rounded-2xl p-6 sm:p-8 shadow-warm/40 space-y-5"
        >
          <div className="flex items-center gap-2 pb-3 border-b border-[#EAE3D5]">
            <FileText className="w-4 h-4 text-[#C86D51]" />
            <h2 className="font-display text-lg font-medium text-[#2B2623]">
              Top Announcement Strip
            </h2>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#6E655F] mb-1.5">
              Announcement Message
            </label>
            <input
              type="text"
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE3D5] text-sm text-[#2B2623] focus:outline-none focus:border-[#C86D51]"
            />
            <p className="text-xs text-[#6E655F] mt-1.5">
              Displayed across the top of every customer storefront page.
            </p>
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C86D51] hover:bg-[#B2593E] text-white text-sm font-medium transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Content Changes</span>
          </button>
        </form>
      </div>
    </AdminLayout>
  );
};
