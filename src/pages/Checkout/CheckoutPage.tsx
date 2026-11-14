import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, CreditCard, AlertCircle, Loader2, ArrowLeft, Check } from 'lucide-react';
import type { PaymentMethod } from '../../types';
import { useStore } from '../../context/StoreContext';
import { formatINR } from '../../utils/format';
import { PageTransition } from '../../components/common/PageTransition';
import { EmptyState } from '../../components/common/EmptyState';
import { CheckoutStepper } from '../../components/checkout/CheckoutStepper';
import { OrderSummary } from '../../components/checkout/OrderSummary';

export const CheckoutPage: React.FC = () => {
  const { user, cart, cartSubtotal, shippingFee, addresses, placeOrder } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const discountFromCart = (location.state as { discount?: number } | null)?.discount ?? 0;

  const defaultAddr = addresses.find((a) => a.isDefault) ?? addresses[0];

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedAddrId, setSelectedAddrId] = useState<string>(defaultAddr?.id ?? 'new');

  const [fullName, setFullName] = useState(defaultAddr?.fullName ?? user?.fullName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(defaultAddr?.phone ?? user?.phone ?? '');
  const [addressLine, setAddressLine] = useState(defaultAddr?.addressLine ?? '');
  const [city, setCity] = useState(defaultAddr?.city ?? '');
  const [stateName, setStateName] = useState(defaultAddr?.state ?? '');
  const [postalCode, setPostalCode] = useState(defaultAddr?.postalCode ?? '');
  const [country, setCountry] = useState(defaultAddr?.country ?? 'India');
  const [formError, setFormError] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay');
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [simulateFailure, setSimulateFailure] = useState(false);

  if (cart.length === 0) {
    return (
      <PageTransition className="py-16 px-4 max-w-3xl mx-auto">
        <EmptyState
          title="Nothing in your bag to check out"
          description="Add a sketch, terracotta piece, or print before proceeding to checkout."
          actionLabel="Explore the Collection"
          actionTo="/shop"
        />
      </PageTransition>
    );
  }

  const handleSelectSavedAddress = (id: string) => {
    setSelectedAddrId(id);
    const addr = addresses.find((a) => a.id === id);
    if (addr) {
      setFullName(addr.fullName);
      setPhone(addr.phone);
      setAddressLine(addr.addressLine);
      setCity(addr.city);
      setStateName(addr.state);
      setPostalCode(addr.postalCode);
      setCountry(addr.country);
      setFormError('');
    }
  };

  const handleContinueToSummary = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !fullName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !addressLine.trim() ||
      !city.trim() ||
      !stateName.trim() ||
      !postalCode.trim()
    ) {
      setFormError('Please complete all required shipping details.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError('Please enter a valid email address for order updates.');
      return;
    }
    setFormError('');
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePayNow = () => {
    setPaymentError('');
    setProcessing(true);

    window.setTimeout(() => {
      if (simulateFailure) {
        setProcessing(false);
        setPaymentError(
          'Payment authorization declined by bank simulator. Uncheck the failure test option or try another payment method.'
        );
        return;
      }

      const order = placeOrder({
        shippingAddress: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          addressLine: addressLine.trim(),
          city: city.trim(),
          state: stateName.trim(),
          postalCode: postalCode.trim(),
          country: country.trim() || 'India',
        },
        paymentMethod,
        discount: discountFromCart,
      });

      setProcessing(false);
      navigate('/order-success', { state: { order } });
    }, 1100);
  };

  const totalPayable = Math.max(0, cartSubtotal + shippingFee - discountFromCart);
  const inputClass =
    'w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE3D5] text-sm text-[#2B2623] focus:outline-none focus:border-[#C86D51]';

  return (
    <PageTransition className="py-10 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-3xl sm:text-4xl font-medium text-[#2B2623]">
            Studio Checkout
          </h1>
          <Link
            to="/cart"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#6E655F] hover:text-[#C86D51]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Bag</span>
          </Link>
        </div>

        <CheckoutStepper currentStep={step} onStepClick={setStep} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Active Step Panel */}
          <div className="lg:col-span-7 bg-white border border-[#EAE3D5] rounded-2xl p-6 sm:p-8 shadow-warm/40">
            {step === 1 && (
              <form onSubmit={handleContinueToSummary} className="space-y-5">
                <h2 className="font-display text-xl font-medium text-[#2B2623]">
                  Step 1: Shipping Details
                </h2>

                {addresses.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-[#6E655F]">Saved Addresses</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {addresses.map((addr) => {
                        const active = selectedAddrId === addr.id;
                        return (
                          <button
                            key={addr.id}
                            type="button"
                            onClick={() => handleSelectSavedAddress(addr.id)}
                            className={`p-3.5 rounded-xl border text-left transition-colors ${
                              active
                                ? 'bg-[#FAF7F2] border-[#C86D51]'
                                : 'bg-white border-[#EAE3D5] hover:border-[#C86D51]/50'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold text-[#2B2623]">
                                {addr.fullName}
                              </span>
                              {active && <Check className="w-3.5 h-3.5 text-[#C86D51]" />}
                            </div>
                            <p className="text-xs text-[#6E655F] mt-1 line-clamp-2">
                              {addr.addressLine}, {addr.city} {addr.postalCode}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {formError && (
                  <p className="text-xs text-[#B2593E] bg-[#C86D51]/10 border border-[#C86D51]/25 rounded-xl px-4 py-3">
                    {formError}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#6E655F] mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className={inputClass}
                      placeholder="Ananya Deshmukh"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#6E655F] mb-1.5">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={inputClass}
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#6E655F] mb-1.5">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className={inputClass}
                      placeholder="+91 98204 51120"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#6E655F] mb-1.5">
                      Country *
                    </label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#6E655F] mb-1.5">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    className={inputClass}
                    placeholder="14 Gulmohar Lane, Koregaon Park"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#6E655F] mb-1.5">
                      City *
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#6E655F] mb-1.5">
                      State *
                    </label>
                    <input
                      type="text"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#6E655F] mb-1.5">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-[#C86D51] hover:bg-[#B2593E] text-white text-sm font-medium transition-colors"
                >
                  Review Order Summary
                </button>
              </form>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="font-display text-xl font-medium text-[#2B2623]">
                  Step 2: Confirm Shipping &amp; Artworks
                </h2>

                <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EAE3D5] flex items-start justify-between gap-4">
                  <div className="text-sm space-y-1">
                    <p className="font-semibold text-[#2B2623]">{fullName}</p>
                    <p className="text-xs text-[#6E655F]">
                      {addressLine}, {city}, {stateName} {postalCode}, {country}
                    </p>
                    <p className="text-xs text-[#6E655F]">
                      {email} · {phone}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-medium text-[#C86D51] hover:text-[#B2593E] shrink-0"
                  >
                    Edit
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-[#F3EDE2]/60 border border-[#EAE3D5] text-xs text-[#6E655F] leading-relaxed">
                  Your pieces will be packed in archival plastic-free gift wrap and dispatched
                  within 2–5 business days with insured tracking.
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="sm:w-1/3 py-3 px-5 rounded-xl border border-[#EAE3D5] text-sm font-medium text-[#2B2623] hover:bg-[#FAF7F2] transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(3);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex-1 py-3 px-6 rounded-xl bg-[#C86D51] hover:bg-[#B2593E] text-white text-sm font-medium transition-colors"
                  >
                    Continue to Payment
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-xl font-medium text-[#2B2623]">
                    Step 3: Select Payment Method
                  </h2>
                  <p className="text-xs text-[#6E655F] mt-1">
                    Frontend checkout preview — live gateway processing connects in backend phase.
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-colors ${
                      paymentMethod === 'razorpay'
                        ? 'bg-[#FAF7F2] border-[#C86D51]'
                        : 'bg-white border-[#EAE3D5] hover:border-[#C86D51]/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                      className="mt-1 text-[#C86D51] focus:ring-[#C86D51]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-[#2B2623]">
                          Razorpay (UPI, Cards, NetBanking)
                        </span>
                        <CreditCard className="w-4 h-4 text-[#C86D51]" />
                      </div>
                      <p className="text-xs text-[#6E655F] mt-1">
                        Instant UPI (GPay, PhonePe), Indian debit/credit cards &amp; wallets in INR.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-colors ${
                      paymentMethod === 'stripe'
                        ? 'bg-[#FAF7F2] border-[#C86D51]'
                        : 'bg-white border-[#EAE3D5] hover:border-[#C86D51]/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'stripe'}
                      onChange={() => setPaymentMethod('stripe')}
                      className="mt-1 text-[#C86D51] focus:ring-[#C86D51]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-[#2B2623]">
                          Stripe (International Cards &amp; Apple Pay)
                        </span>
                        <CreditCard className="w-4 h-4 text-[#7A9178]" />
                      </div>
                      <p className="text-xs text-[#6E655F] mt-1">
                        Visa, Mastercard, Amex &amp; global collector payments with 3D Secure.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Prototype test option for error state verification */}
                <label className="inline-flex items-center gap-2 text-xs text-[#6E655F] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simulateFailure}
                    onChange={(e) => setSimulateFailure(e.target.checked)}
                    className="rounded border-[#EAE3D5] text-[#C86D51]"
                  />
                  <span>Simulate payment decline state (prototype preview)</span>
                </label>

                {paymentError && (
                  <div className="flex items-start gap-2.5 p-4 rounded-xl bg-[#C86D51]/10 border border-[#C86D51]/30 text-xs text-[#B2593E]">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{paymentError}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-[#7A9178]">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>256-bit SSL encrypted checkout · Verified studio order protection</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    disabled={processing}
                    onClick={() => setStep(2)}
                    className="sm:w-1/3 py-3 px-5 rounded-xl border border-[#EAE3D5] text-sm font-medium text-[#2B2623] hover:bg-[#FAF7F2] disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={processing}
                    onClick={handlePayNow}
                    className="flex-1 py-3.5 px-6 rounded-xl bg-[#C86D51] hover:bg-[#B2593E] text-white text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-75"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Authorizing {paymentMethod === 'razorpay' ? 'Razorpay' : 'Stripe'}...</span>
                      </>
                    ) : (
                      <span>Pay {formatINR(totalPayable)}</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Sticky Order Summary */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <OrderSummary discount={discountFromCart} />
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
