import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Pencil, Check, Heart } from 'lucide-react';
import { PRODUCTS } from '../../data/products';
import { useStore } from '../../context/StoreContext';
import { PageTransition } from '../../components/common/PageTransition';
import { EmptyState } from '../../components/common/EmptyState';
import { AccountSidebar } from '../../components/account/AccountSidebar';
import { ProductGrid } from '../../components/product/ProductGrid';

export const AccountPage: React.FC = () => {
  const { user, updateProfile, wishlist, loginAsDemoCustomer } = useStore();
  const [searchParams] = useSearchParams();
  const isSettingsTab = searchParams.get('tab') === 'settings';

  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [studioNewsletter, setStudioNewsletter] = useState(true);
  const [orderSmsUpdates, setOrderSmsUpdates] = useState(true);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setEmail(user.email);
      setPhone(user.phone);
    }
  }, [user]);

  if (!user) {
    return (
      <PageTransition className="py-14 px-4 max-w-2xl mx-auto">
        <EmptyState
          title="Sign in to your studio account"
          description="Access your saved orders, cart history, addresses, and wishlist isolated privately to your collector account."
          actionLabel="Sign In"
          actionTo="/login"
        />
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={loginAsDemoCustomer}
            className="text-sm font-medium text-[#C86D51] hover:text-[#B2593E]"
          >
            Or explore immediately with the Demo Collector Account →
          </button>
        </div>
      </PageTransition>
    );
  }

  const savedProducts = PRODUCTS.filter((p) => wishlist.includes(p.id));

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) return;
    updateProfile({ fullName, email, phone });
    setEditing(false);
  };

  return (
    <PageTransition className="py-10 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="font-handwritten text-2xl text-[#C86D51]">Customer Portal</p>
          <h1 className="font-display text-3xl sm:text-4xl font-medium text-[#2B2623]">
            {isSettingsTab ? 'Account Settings' : 'My Profile & Saved Art'}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-3">
            <AccountSidebar activeTab={isSettingsTab ? 'settings' : 'profile'} />
          </div>

          <div className="lg:col-span-9 space-y-8">
            {isSettingsTab ? (
              <section className="bg-white border border-[#EAE3D5] rounded-2xl p-6 sm:p-7 shadow-warm/40 space-y-5">
                <h2 className="font-display text-xl font-medium text-[#2B2623]">
                  Studio Communication Preferences
                </h2>
                <div className="space-y-4">
                  <label className="flex items-start justify-between gap-4 p-4 rounded-xl bg-[#FAF7F2] border border-[#EAE3D5] cursor-pointer">
                    <div>
                      <p className="text-sm font-medium text-[#2B2623]">
                        New Sketch &amp; Kiln Release Letters
                      </p>
                      <p className="text-xs text-[#6E655F] mt-0.5">
                        Receive occasional notes when new 1-of-1 drawings or clay batches open.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={studioNewsletter}
                      onChange={(e) => setStudioNewsletter(e.target.checked)}
                      className="mt-1 rounded border-[#EAE3D5] text-[#C86D51]"
                    />
                  </label>

                  <label className="flex items-start justify-between gap-4 p-4 rounded-xl bg-[#FAF7F2] border border-[#EAE3D5] cursor-pointer">
                    <div>
                      <p className="text-sm font-medium text-[#2B2623]">
                        Order Dispatch &amp; Packing Notifications
                      </p>
                      <p className="text-xs text-[#6E655F] mt-0.5">
                        SMS &amp; email updates when your parcel moves from studio to courier.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={orderSmsUpdates}
                      onChange={(e) => setOrderSmsUpdates(e.target.checked)}
                      className="mt-1 rounded border-[#EAE3D5] text-[#C86D51]"
                    />
                  </label>
                </div>
              </section>
            ) : (
              <>
                {/* Profile Info Card */}
                <section className="bg-white border border-[#EAE3D5] rounded-2xl p-6 sm:p-7 shadow-warm/40">
                  <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#EAE3D5]">
                    <h2 className="font-display text-xl font-medium text-[#2B2623]">
                      Collector Details
                    </h2>
                    {!editing && (
                      <button
                        type="button"
                        onClick={() => setEditing(true)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#EAE3D5] text-xs font-medium text-[#2B2623] hover:border-[#C86D51] transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit Profile</span>
                      </button>
                    )}
                  </div>

                  {editing ? (
                    <form onSubmit={handleSaveProfile} className="pt-5 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-[#6E655F] mb-1.5">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE3D5] text-sm text-[#2B2623]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[#6E655F] mb-1.5">
                            Email
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE3D5] text-sm text-[#2B2623]"
                          />
                        </div>
                      </div>
                      <div className="sm:w-1/2">
                        <label className="block text-xs font-medium text-[#6E655F] mb-1.5">
                          Phone
                        </label>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE3D5] text-sm text-[#2B2623]"
                        />
                      </div>
                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#C86D51] hover:bg-[#B2593E] text-white text-sm font-medium"
                        >
                          <Check className="w-4 h-4" />
                          <span>Save Changes</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditing(false)}
                          className="px-5 py-2.5 rounded-xl border border-[#EAE3D5] text-sm font-medium text-[#6E655F]"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <dl className="pt-5 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
                      <div>
                        <dt className="text-xs text-[#6E655F]">Full Name</dt>
                        <dd className="font-medium text-[#2B2623] mt-1">{user.fullName}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-[#6E655F]">Email Address</dt>
                        <dd className="font-medium text-[#2B2623] mt-1">{user.email}</dd>
                      </div>
                      <div>
                        <dt className="text-xs text-[#6E655F]">Phone Number</dt>
                        <dd className="font-medium text-[#2B2623] mt-1">{user.phone || 'Not set'}</dd>
                      </div>
                    </dl>
                  )}
                </section>

                {/* Saved Wishlist */}
                <section className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-2xl font-medium text-[#2B2623] inline-flex items-center gap-2">
                      <Heart className="w-5 h-5 text-[#C86D51]" />
                      <span>Saved Wishlist ({savedProducts.length})</span>
                    </h2>
                    <Link
                      to="/shop"
                      className="text-xs font-medium text-[#C86D51] hover:text-[#B2593E]"
                    >
                      Explore More →
                    </Link>
                  </div>
                  {savedProducts.length === 0 ? (
                    <EmptyState
                      title="No saved artworks yet"
                      description="Tap the heart icon on any sketch, sculpture, or painting to keep it in your collector wishlist."
                      actionLabel="Browse Artworks"
                      actionTo="/shop"
                    />
                  ) : (
                    <ProductGrid products={savedProducts} columns={3} />
                  )}
                </section>
              </>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
