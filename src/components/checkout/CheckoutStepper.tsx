import React from 'react';
import { Check } from 'lucide-react';

interface CheckoutStepperProps {
  currentStep: 1 | 2 | 3;
  onStepClick?: (step: 1 | 2 | 3) => void;
}

const STEPS: { num: 1 | 2 | 3; label: string }[] = [
  { num: 1, label: 'Shipping Details' },
  { num: 2, label: 'Order Summary' },
  { num: 3, label: 'Payment' },
];

export const CheckoutStepper: React.FC<CheckoutStepperProps> = ({ currentStep, onStepClick }) => {
  return (
    <nav aria-label="Checkout progress" className="mb-8">
      <ol className="grid grid-cols-3 gap-2 sm:gap-4">
        {STEPS.map((step) => {
          const isDone = step.num < currentStep;
          const isCurrent = step.num === currentStep;
          const clickable = onStepClick && step.num < currentStep;

          return (
            <li key={step.num}>
              <button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onStepClick(step.num)}
                className={`w-full flex items-center gap-2.5 p-3 rounded-xl border text-left transition-colors ${
                  isCurrent
                    ? 'bg-white border-[#C86D51] shadow-xs'
                    : isDone
                      ? 'bg-[#F3EDE2]/70 border-[#7A9178]/40 hover:border-[#C86D51]'
                      : 'bg-[#FAF7F2] border-[#EAE3D5] opacity-70'
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 tabular-nums ${
                    isDone
                      ? 'bg-[#7A9178] text-white'
                      : isCurrent
                        ? 'bg-[#C86D51] text-white'
                        : 'bg-[#EAE3D5] text-[#6E655F]'
                  }`}
                >
                  {isDone ? <Check className="w-3.5 h-3.5" /> : step.num}
                </span>
                <span className="text-xs sm:text-sm font-medium text-[#2B2623] truncate">
                  {step.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
