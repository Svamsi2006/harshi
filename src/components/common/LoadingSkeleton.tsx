import React from 'react';

export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white border border-[#E7C7CC] rounded-2xl p-3 animate-pulse"
          aria-hidden="true"
        >
          <div className="aspect-[4/3] w-full rounded-xl bg-[#F8EFEA]" />
          <div className="mt-3 space-y-2 px-1">
            <div className="h-3 w-2/3 rounded bg-[#F8EFEA]" />
            <div className="h-4 w-4/5 rounded bg-[#E7C7CC]" />
            <div className="flex items-center justify-between pt-2">
              <div className="h-4 w-16 rounded bg-[#F8EFEA]" />
              <div className="h-8 w-20 rounded-lg bg-[#F8EFEA]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
