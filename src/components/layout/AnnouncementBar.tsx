import React, { useState } from 'react';
import { Truck, X } from 'lucide-react';

interface AnnouncementBarProps {
  message?: string;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  message = 'Handmade • Heartmade • Heartfelt — Free studio shipping on orders above ₹999',
}) => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="bg-[#6D1836] border-b border-[#541129] text-[#FFF9F5] text-xs px-4 py-2 relative z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 pr-7">
        <Truck className="w-3.5 h-3.5 text-[#C9A66B] shrink-0" aria-hidden="true" />
        <p className="truncate font-medium tracking-[0.01em]">{message}</p>
      </div>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#E7C7CC] hover:text-[#FFF9F5] rounded-md transition-colors"
        aria-label="Dismiss announcement"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
