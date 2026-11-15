import React from 'react';
import type { ProductSpecification } from '../../types';

interface ProductSpecificationsProps {
  specs: ProductSpecification;
}

export const ProductSpecifications: React.FC<ProductSpecificationsProps> = ({ specs }) => {
  const rows = [
    { label: 'Medium', value: specs.medium },
    { label: 'Dimensions', value: specs.dimensions },
    { label: 'Material', value: specs.material },
    { label: 'Availability', value: specs.availability },
    { label: 'Care', value: specs.care },
    { label: 'Shipping', value: specs.shipping },
  ];

  return (
    <div className="bg-[#FFF9F5] border border-[#E7C7CC] rounded-2xl p-5">
      <h3 className="font-display text-base font-medium text-[#3E2F27] mb-3">
        Craft Specifications
      </h3>
      <dl className="divide-y divide-[#E7C7CC]/60 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="py-2.5 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4">
            <dt className="text-[#7A655C] font-medium">{row.label}</dt>
            <dd className="sm:col-span-2 text-[#3E2F27]">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};
