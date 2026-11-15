import React, { useState } from 'react';
import type { Address } from '../../types';

interface AddressFormProps {
  initial?: Address;
  onSave: (data: Omit<Address, 'id'>) => void;
  onCancel?: () => void;
  submitLabel?: string;
}

export const AddressForm: React.FC<AddressFormProps> = ({
  initial,
  onSave,
  onCancel,
  submitLabel = 'Save Address',
}) => {
  const [fullName, setFullName] = useState(initial?.fullName ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [addressLine, setAddressLine] = useState(initial?.addressLine ?? '');
  const [city, setCity] = useState(initial?.city ?? '');
  const [state, setState] = useState(initial?.state ?? '');
  const [postalCode, setPostalCode] = useState(initial?.postalCode ?? '');
  const [country, setCountry] = useState(initial?.country ?? 'India');
  const [isDefault, setIsDefault] = useState(initial?.isDefault ?? false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !fullName.trim() ||
      !phone.trim() ||
      !addressLine.trim() ||
      !city.trim() ||
      !state.trim() ||
      !postalCode.trim()
    ) {
      setError('Please complete all required address fields.');
      return;
    }
    setError('');
    onSave({
      fullName: fullName.trim(),
      phone: phone.trim(),
      addressLine: addressLine.trim(),
      city: city.trim(),
      state: state.trim(),
      postalCode: postalCode.trim(),
      country: country.trim() || 'India',
      isDefault,
    });
  };

  const inputClass =
    'w-full px-3.5 py-2.5 rounded-xl bg-[#FFF9F5] border border-[#E7C7CC] text-sm text-[#3E2F27] focus:outline-none focus:border-[#6D1836]';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-xs text-[#541129] bg-[#6D1836]/10 border border-[#6D1836]/25 rounded-xl px-3.5 py-2.5">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#7A655C] mb-1.5">Full Name *</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
            placeholder="Ananya Deshmukh"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#7A655C] mb-1.5">Phone Number *</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
            placeholder="+91 98204 51120"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
          Street Address, Studio / Flat No. *
        </label>
        <input
          type="text"
          value={addressLine}
          onChange={(e) => setAddressLine(e.target.value)}
          className={inputClass}
          placeholder="14 Gulmohar Lane, Koregaon Park"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#7A655C] mb-1.5">City *</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={inputClass}
            placeholder="Pune"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#7A655C] mb-1.5">State *</label>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className={inputClass}
            placeholder="Maharashtra"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#7A655C] mb-1.5">Postal Code *</label>
          <input
            type="text"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            className={inputClass}
            placeholder="411001"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#7A655C] mb-1.5">Country *</label>
          <input
            type="text"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      <label className="inline-flex items-center gap-2 text-xs text-[#3E2F27] cursor-pointer">
        <input
          type="checkbox"
          checked={isDefault}
          onChange={(e) => setIsDefault(e.target.checked)}
          className="rounded border-[#E7C7CC] text-[#6D1836] focus:ring-[#6D1836]"
        />
        <span>Set as default shipping address</span>
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-white text-sm font-medium transition-colors"
        >
          {submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-[#E7C7CC] text-sm font-medium text-[#7A655C] hover:text-[#3E2F27] transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};
