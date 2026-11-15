import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  value: number;
  max: number;
  min?: number;
  onChange: (next: number) => void;
  size?: 'sm' | 'md';
}

export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  value,
  max,
  min = 1,
  onChange,
  size = 'md',
}) => {
  const btnSize = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const textSize = size === 'sm' ? 'w-8 text-xs' : 'w-10 text-sm';

  return (
    <div
      className="inline-flex items-center rounded-xl border border-[#E7C7CC] bg-white overflow-hidden"
      role="group"
      aria-label="Quantity selector"
    >
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={`${btnSize} flex items-center justify-center text-[#3E2F27] hover:bg-[#F8EFEA] disabled:opacity-35 disabled:cursor-not-allowed transition-colors`}
        aria-label="Decrease quantity"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span
        className={`${textSize} text-center font-medium text-[#3E2F27] tabular-nums select-none`}
        aria-live="polite"
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={`${btnSize} flex items-center justify-center text-[#3E2F27] hover:bg-[#F8EFEA] disabled:opacity-35 disabled:cursor-not-allowed transition-colors`}
        aria-label="Increase quantity"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
