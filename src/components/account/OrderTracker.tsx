import React from 'react';
import { Clock, Package, Truck, CheckCircle2 } from 'lucide-react';
import type { OrderStatus } from '../../types';

const STAGES: { status: OrderStatus; label: string; icon: React.ReactNode }[] = [
  { status: 'Pending', label: 'Pending', icon: <Clock className="w-3.5 h-3.5" /> },
  { status: 'Packed', label: 'Packed', icon: <Package className="w-3.5 h-3.5" /> },
  { status: 'Shipped', label: 'Shipped', icon: <Truck className="w-3.5 h-3.5" /> },
  { status: 'Delivered', label: 'Delivered', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
];

export const OrderTracker: React.FC<{ currentStatus: OrderStatus }> = ({ currentStatus }) => {
  const activeIdx = STAGES.findIndex((s) => s.status === currentStatus);

  return (
    <div className="py-3" aria-label={`Order status: ${currentStatus}`}>
      <div className="grid grid-cols-4 gap-2 relative">
        {STAGES.map((stage, idx) => {
          const completed = idx <= activeIdx;
          const isCurrent = idx === activeIdx;
          return (
            <div key={stage.status} className="flex flex-col items-center text-center relative">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border transition-colors ${
                  completed
                    ? isCurrent
                      ? 'bg-[#C86D51] border-[#C86D51] text-white'
                      : 'bg-[#7A9178] border-[#7A9178] text-white'
                    : 'bg-[#FAF7F2] border-[#EAE3D5] text-[#6E655F]'
                }`}
              >
                {stage.icon}
              </div>
              <span
                className={`mt-1.5 text-[11px] sm:text-xs font-medium ${
                  completed ? 'text-[#2B2623]' : 'text-[#6E655F]'
                }`}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
