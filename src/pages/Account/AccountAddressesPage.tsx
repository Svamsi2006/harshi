import React, { useState } from 'react';
import { Plus, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import type { Address } from '../../types';
import { useStore } from '../../context/StoreContext';
import { PageTransition } from '../../components/common/PageTransition';
import { EmptyState } from '../../components/common/EmptyState';
import { AccountSidebar } from '../../components/account/AccountSidebar';
import { AddressForm } from '../../components/account/AddressForm';

export const AccountAddressesPage: React.FC = () => {
  const {
    user,
    addresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    loginAsDemoCustomer,
  } = useStore();

  const [adding, setAdding] = useState(false);
  const [editingAddr, setEditingAddr] = useState<Address | null>(null);

  if (!user) {
    return (
      <PageTransition className="py-14 px-4 max-w-2xl mx-auto">
        <EmptyState
          title="Sign in to manage saved addresses"
          description="Keep your delivery addresses ready for quicker studio checkout."
          actionLabel="Sign In"
          actionTo="/login"
        />
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={loginAsDemoCustomer}
            className="text-sm font-medium text-[#C86D51]"
          >
            Sign in with Demo Collector Account →
          </button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="font-handwritten text-2xl text-[#C86D51]">Delivery Book</p>
            <h1 className="font-display text-3xl sm:text-4xl font-medium text-[#2B2623]">
              Saved Addresses
            </h1>
          </div>
          {!adding && !editingAddr && (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#C86D51] hover:bg-[#B2593E] text-white text-sm font-medium transition-colors self-start"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Address</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-3">
            <AccountSidebar />
          </div>

          <div className="lg:col-span-9 space-y-6">
            {adding && (
              <div className="bg-white border border-[#EAE3D5] rounded-2xl p-6 shadow-warm">
                <h2 className="font-display text-lg font-medium text-[#2B2623] mb-4">
                  Add Shipping Address
                </h2>
                <AddressForm
                  onSave={(data) => {
                    addAddress(data);
                    setAdding(false);
                  }}
                  onCancel={() => setAdding(false)}
                />
              </div>
            )}

            {editingAddr && (
              <div className="bg-white border border-[#EAE3D5] rounded-2xl p-6 shadow-warm">
                <h2 className="font-display text-lg font-medium text-[#2B2623] mb-4">
                  Edit Shipping Address
                </h2>
                <AddressForm
                  initial={editingAddr}
                  submitLabel="Update Address"
                  onSave={(data) => {
                    updateAddress({ ...data, id: editingAddr.id });
                    setEditingAddr(null);
                  }}
                  onCancel={() => setEditingAddr(null)}
                />
              </div>
            )}

            {addresses.length === 0 && !adding ? (
              <EmptyState
                title="No saved addresses yet"
                description="Add your home or studio delivery address so checkout takes only a click."
                actionLabel="Add Address"
                onAction={() => setAdding(true)}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <article
                    key={addr.id}
                    className={`bg-white border rounded-2xl p-5 flex flex-col justify-between gap-4 ${
                      addr.isDefault ? 'border-[#C86D51]' : 'border-[#EAE3D5]'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-display text-base font-medium text-[#2B2623]">
                          {addr.fullName}
                        </h3>
                        {addr.isDefault && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-[#7A9178]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Default</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-[#6E655F] leading-relaxed">
                        {addr.addressLine}
                        <br />
                        {addr.city}, {addr.state} {addr.postalCode}
                        <br />
                        {addr.country}
                      </p>
                      <p className="text-xs text-[#6E655F] pt-1">Phone: {addr.phone}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#EAE3D5] text-xs">
                      {!addr.isDefault && (
                        <button
                          type="button"
                          onClick={() => setDefaultAddress(addr.id)}
                          className="font-medium text-[#C86D51] hover:text-[#B2593E]"
                        >
                          Set as Default
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setAdding(false);
                          setEditingAddr(addr);
                        }}
                        className="inline-flex items-center gap-1 font-medium text-[#2B2623] hover:text-[#C86D51]"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteAddress(addr.id)}
                        className="inline-flex items-center gap-1 font-medium text-[#6E655F] hover:text-[#B2593E] ml-auto"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
