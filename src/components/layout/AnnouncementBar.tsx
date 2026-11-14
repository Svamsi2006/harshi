import React, { useState } from 'react';
import { Truck, X } from 'lucide-react';

interface AnnouncementBarProps {
  message?: string;
}

export const AnnouncementBar: React.FC<AnnouncementBarProps> = ({
  message = 'Free shipping on orders above ₹999 • Every piece is packed with love ♡',
}) => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="bg-[#F3EDE2] border-b border-[#EAE3D5] text-[#2B2623] text-xs px-4 py-2 relative z-40">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 pr-7">
        <Truck className="w-3.5 h-3.5 text-[#C86D51] shrink-0" aria-hidden="true" />
        <p className="truncate font-medium tracking-[0.01em]">{message}</p>
      </div>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#6E655F] hover:text-[#2B2623] rounded-md transition-colors"
        aria-label="Dismiss announcement"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
