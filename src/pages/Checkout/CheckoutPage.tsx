import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ShieldCheck,
  CreditCard,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Check,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import type { PaymentMethod } from '../../types';
import { useStore } from '../../context/StoreContext';
import { formatINR } from '../../utils/format';
import { STUDIO_MEDIA } from '../../data/studioImages';
import { PageTransition } from '../../components/common/PageTransition';
import { EmptyState } from '../../components/common/EmptyState';
import { ResilientImage } from '../../components/common/ResilientImage';
import { CheckoutStepper } from '../../components/checkout/CheckoutStepper';
import { OrderSummary } from '../../components/checkout/OrderSummary';

export const CheckoutPage: React.FC = () => {
  const {
    user,
    cart,
    cartSubtotal,
    shippingFee,
    addresses,
    addAddress,
    commissions,
    storeSettings,
    placeOrder,
    approveCustomOrderByCustomerAndCreateOrder,
  } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const customRequestId = searchParams.get('customRequestId');
  const customRequest = customRequestId
    ? commissions.find((c) => c.id === customRequestId)
    : undefined;

  const discountFromCart = (location.state as { discount?: number } | null)?.discount ?? 0;
  const defaultAddr = addresses.find((a) => a.isDefault) ?? addresses[0];

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedAddrId, setSelectedAddrId] = useState<string>(defaultAddr?.id ?? 'new');

  const [fullName, setFullName] = useState(
    defaultAddr?.fullName ?? customRequest?.customerName ?? user?.fullName ?? ''
  );
  const [email, setEmail] = useState(customRequest?.email ?? user?.email ?? '');
  const [phone, setPhone] = useState(
    defaultAddr?.phone ?? customRequest?.phone ?? user?.phone ?? ''
  );
  const [addressLine, setAddressLine] = useState(defaultAddr?.addressLine ?? '');
  const [city, setCity] = useState(defaultAddr?.city ?? '');
  const [stateName, setStateName] = useState(defaultAddr?.state ?? '');
  const [postalCode, setPostalCode] = useState(defaultAddr?.postalCode ?? '');
  const [country, setCountry] = useState(defaultAddr?.country ?? 'India');
  const [saveNewAddress, setSaveNewAddress] = useState(true);
  const [formError, setFormError] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('razorpay');
  const [paymentRefInput, setPaymentRefInput] = useState('');
  const [verifyConfirmed, setVerifyConfirmed] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [simulateFailure, setSimulateFailure] = useState(false);

  // Sync custom request contact details if loaded asynchronously
  useEffect(() => {
    if (customRequest) {
      if (!fullName) setFullName(customRequest.customerName);
      if (!email) setEmail(customRequest.email);
      if (!phone) setPhone(customRequest.phone);
    }
  }, [customRequest, email, fullName, phone]);

  const isCustomCheckout = Boolean(customRequestId);

  if (isCustomCheckout && !customRequest) {
    return (
      <PageTransition className="py-16 px-4 max-w-3xl mx-auto">
        <EmptyState
          title="Custom order request not found"
          description="This custom order link could not be found. Return to Custom Orders to pick your approved request."
          actionLabel="View Custom Orders"
          actionTo="/custom-orders"
        />
      </PageTransition>
    );
  }

  if (customRequest?.orderCreated) {
    return (
      <PageTransition className="py-16 px-4 max-w-2xl mx-auto">
        <div className="bg-white border border-[#E7C7CC] rounded-3xl p-8 text-center space-y-4 shadow-warm">
          <div className="w-14 h-14 rounded-full bg-[#C9A66B]/20 text-[#6D1836] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-medium text-[#3E2F27]">
            Custom Order Already Placed
          </h1>
          <p className="text-sm text-[#7A655C]">
            Request <strong>{customRequest.id}</strong> already has a confirmed order with delivery
            &amp; payment details on file.
          </p>
          <div className="pt-2">
            <Link
              to="/account/orders"
              className="inline-flex items-center px-5 py-2.5 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-[#FFF9F5] text-sm font-medium"
            >
              View Order in My Orders →
            </Link>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!isCustomCheckout && cart.length === 0) {
    return (
      <PageTransition className="py-16 px-4 max-w-3xl mx-auto">
        <EmptyState
          title="Nothing in your bag to check out"
          description="Add a creation to your studio bag or approve a custom order before proceeding to checkout."
          actionLabel="Explore the Collection"
          actionTo="/shop"
        />
      </PageTransition>
    );
  }

  const customSubtotal = customRequest
    ? customRequest.quotedPrice ?? customRequest.predictedPrice ?? 1499
    : 0;
  const customShipping =
    customRequest && customSubtotal < storeSettings.freeShippingThreshold
      ? storeSettings.defaultShippingFee
      : 0;

  const activeSubtotal = customRequest ? customSubtotal : cartSubtotal;
  const activeShippingFee = customRequest ? customShipping : shippingFee;
  const activeDiscount = customRequest ? 0 : discountFromCart;
  const totalPayable = Math.max(0, activeSubtotal + activeShippingFee - activeDiscount);

  const handleSelectSavedAddress = (id: string) => {
    setSelectedAddrId(id);
    if (id === 'new') {
      setAddressLine('');
      setCity('');
      setStateName('');
      setPostalCode('');
      setFormError('');
      return;
    }
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
      setFormError(
        'All delivery fields (Full Name, Email, Phone, Street Address, City, State & Postal Code) must be filled to place an order.'
      );
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setFormError('Please enter a valid email address for order confirmation & tracking.');
      return;
    }
    if (phone.replace(/\D/g, '').length < 8) {
      setFormError('Please enter a valid contact phone / WhatsApp number.');
      return;
    }

    // Persist newly typed address into user's address database if not already saved
    if (user && saveNewAddress) {
      const alreadyExists = addresses.some(
        (a) =>
          a.addressLine.trim().toLowerCase() === addressLine.trim().toLowerCase() &&
          a.postalCode.trim() === postalCode.trim()
      );
      if (!alreadyExists) {
        addAddress({
          fullName: fullName.trim(),
          phone: phone.trim(),
          addressLine: addressLine.trim(),
          city: city.trim(),
          state: stateName.trim(),
          postalCode: postalCode.trim(),
          country: country.trim() || 'India',
          isDefault: addresses.length === 0,
        });
      }
    }

    setFormError('');
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePayNow = () => {
    if (!verifyConfirmed) {
      setPaymentError('Please confirm your delivery address and authorize payment to continue.');
      return;
    }
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

      const cleanAddress = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        addressLine: addressLine.trim(),
        city: city.trim(),
        state: stateName.trim(),
        postalCode: postalCode.trim(),
        country: country.trim() || 'India',
      };
      const generatedRef =
        paymentRefInput.trim() ||
        `${paymentMethod.toUpperCase()}-${Math.floor(100000 + Math.random() * 899999)}`;

      if (customRequest) {
        const order = approveCustomOrderByCustomerAndCreateOrder(customRequest.id, {
          shippingAddress: cleanAddress,
          customerEmail: email.trim(),
          customerName: fullName.trim(),
          paymentMethod,
          paymentReference: generatedRef,
        });
        setProcessing(false);
        if (order) {
          navigate('/order-success', { state: { order } });
        } else {
          setStep(1);
          setFormError('Please ensure all shipping details are filled in.');
        }
        return;
      }

      const order = placeOrder({
        shippingAddress: cleanAddress,
        paymentMethod,
        customerEmail: email.trim(),
        customerName: fullName.trim(),
        paymentReference: generatedRef,
        discount: discountFromCart,
      });

      setProcessing(false);
      navigate('/order-success', { state: { order } });
    }, 950);
  };

  const inputClass =
    'w-full px-3.5 py-2.5 rounded-xl bg-[#FFF9F5] border border-[#E7C7CC] text-sm text-[#3E2F27] focus:outline-none focus:border-[#6D1836]';

  return (
    <PageTransition className="py-10 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            {customRequest && (
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#6D1836] mb-1">
                <Sparkles className="w-3.5 h-3.5 text-[#C9A66B]" />
                <span>Custom Order Checkout · {customRequest.id}</span>
              </p>
            )}
            <h1 className="font-display text-3xl sm:text-4xl font-medium text-[#3E2F27]">
              {customRequest ? 'Confirm Custom Order & Delivery' : 'Studio Checkout'}
            </h1>
          </div>
          <Link
            to={customRequest ? '/custom-orders' : '/cart'}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#7A655C] hover:text-[#6D1836]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{customRequest ? 'Back to Custom Orders' : 'Back to Bag'}</span>
          </Link>
        </div>

        <CheckoutStepper currentStep={step} onStepClick={setStep} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Active Step Panel */}
          <div className="lg:col-span-7 bg-white border border-[#E7C7CC] rounded-2xl p-6 sm:p-8 shadow-warm/40">
            {step === 1 && (
              <form noValidate onSubmit={handleContinueToSummary} className="space-y-5">
                <div>
                  <h2 className="font-display text-xl font-medium text-[#3E2F27]">
                    Step 1: Contact &amp; Delivery Address
                  </h2>
                  <p className="text-xs text-[#7A655C] mt-1">
                    Complete contact &amp; shipping details are required before any studio or custom order can be placed.
                  </p>
                </div>

                {addresses.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-[#7A655C]">Saved Addresses</p>
                      <button
                        type="button"
                        onClick={() => handleSelectSavedAddress('new')}
                        className="text-xs font-medium text-[#6D1836] hover:underline"
                      >
                        + Use a new address
                      </button>
                    </div>
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
                                ? 'bg-[#FFF9F5] border-[#6D1836]'
                                : 'bg-white border-[#E7C7CC] hover:border-[#6D1836]/50'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-semibold text-[#3E2F27]">
                                {addr.fullName}
                              </span>
                              {active && <Check className="w-3.5 h-3.5 text-[#6D1836]" />}
                            </div>
                            <p className="text-xs text-[#7A655C] mt-1 line-clamp-2">
                              {addr.addressLine}, {addr.city} {addr.postalCode}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {formError && (
                  <p className="text-xs font-medium text-[#541129] bg-[#6D1836]/10 border border-[#6D1836]/25 rounded-xl px-4 py-3">
                    {formError}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
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
                    <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
                      Email Address *
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
                    <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
                      Phone / WhatsApp *
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
                    <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
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
                  <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
                    Street Address / Landmark *
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
                    <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
                      City *
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={inputClass}
                      placeholder="Pune"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
                      State *
                    </label>
                    <input
                      type="text"
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className={inputClass}
                      placeholder="Maharashtra"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
                      PIN / Postal Code *
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className={inputClass}
                      placeholder="411001"
                    />
                  </div>
                </div>

                {user && (
                  <label className="inline-flex items-center gap-2 text-xs text-[#7A655C] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={saveNewAddress}
                      onChange={(e) => setSaveNewAddress(e.target.checked)}
                      className="rounded border-[#E7C7CC] text-[#6D1836]"
                    />
                    <span>Save this shipping address to my studio profile</span>
                  </label>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-white text-sm font-medium transition-colors"
                >
                  Review Order Preview →
                </button>
              </form>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h2 className="font-display text-xl font-medium text-[#3E2F27]">
                  Step 2: Detailed Order Preview
                </h2>

                <div className="p-4 rounded-xl bg-[#FFF9F5] border border-[#E7C7CC] flex items-start justify-between gap-4">
                  <div className="text-sm space-y-1">
                    <p className="font-semibold text-[#3E2F27]">{fullName}</p>
                    <p className="text-xs text-[#7A655C]">
                      {addressLine}, {city}, {stateName} {postalCode}, {country}
                    </p>
                    <p className="text-xs text-[#7A655C]">
                      {email} · {phone}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-medium text-[#6D1836] hover:text-[#541129] shrink-0"
                  >
                    Edit Address
                  </button>
                </div>

                {customRequest && (
                  <div className="p-4 rounded-xl bg-white border border-[#E7C7CC] flex items-start gap-4">
                    <ResilientImage
                      src={customRequest.referenceImageData || STUDIO_MEDIA.artPortraitKeepsake}
                      alt={customRequest.customIdea}
                      className="w-20 h-20 rounded-xl object-cover border border-[#E7C7CC] shrink-0"
                    />
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs font-semibold text-[#6D1836]">
                        {customRequest.categoryLabel} · {customRequest.approximateSize}
                      </p>
                      <h3 className="font-display text-base font-medium text-[#3E2F27]">
                        {customRequest.customIdea}
                      </h3>
                      <p className="text-xs text-[#7A655C]">{customRequest.description}</p>
                    </div>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-[#F8EFEA]/60 border border-[#E7C7CC] text-xs text-[#7A655C] leading-relaxed">
                  Your pieces will be packed in archival plastic-free gift wrap and dispatched
                  within {customRequest ? '5–8' : '2–5'} business days with insured tracking.
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="sm:w-1/3 py-3 px-5 rounded-xl border border-[#E7C7CC] text-sm font-medium text-[#3E2F27] hover:bg-[#FFF9F5] transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(3);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="flex-1 py-3 px-6 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-white text-sm font-medium transition-colors"
                  >
                    Continue to Payment &amp; Verification →
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-display text-xl font-medium text-[#3E2F27]">
                    Step 3: Payment Method &amp; Verification
                  </h2>
                  <p className="text-xs text-[#7A655C] mt-1">
                    Select your payment method and confirm billing details to place your order.
                  </p>
                </div>

                <div className="space-y-3">
                  <label
                    className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-colors ${
                      paymentMethod === 'razorpay'
                        ? 'bg-[#FFF9F5] border-[#6D1836]'
                        : 'bg-white border-[#E7C7CC] hover:border-[#6D1836]/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'razorpay'}
                      onChange={() => setPaymentMethod('razorpay')}
                      className="mt-1 text-[#6D1836] focus:ring-[#6D1836]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-[#3E2F27]">
                          Razorpay (UPI, Cards, NetBanking)
                        </span>
                        <CreditCard className="w-4 h-4 text-[#6D1836]" />
                      </div>
                      <p className="text-xs text-[#7A655C] mt-1">
                        Instant UPI (GPay, PhonePe), Indian debit/credit cards &amp; wallets in INR.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-colors ${
                      paymentMethod === 'stripe'
                        ? 'bg-[#FFF9F5] border-[#6D1836]'
                        : 'bg-white border-[#E7C7CC] hover:border-[#6D1836]/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'stripe'}
                      onChange={() => setPaymentMethod('stripe')}
                      className="mt-1 text-[#6D1836] focus:ring-[#6D1836]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-[#3E2F27]">
                          Stripe (International Cards &amp; Apple Pay)
                        </span>
                        <CreditCard className="w-4 h-4 text-[#C9A66B]" />
                      </div>
                      <p className="text-xs text-[#7A655C] mt-1">
                        Visa, Mastercard, Amex &amp; global collector payments with 3D Secure.
                      </p>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
                    UPI ID / Transaction Reference (Optional Verification Note)
                  </label>
                  <input
                    type="text"
                    value={paymentRefInput}
                    onChange={(e) => setPaymentRefInput(e.target.value)}
                    className={inputClass}
                    placeholder="e.g. ananya@okaxis or UTR / last 4 digits"
                  />
                </div>

                <label className="flex items-start gap-2.5 text-xs text-[#3E2F27] cursor-pointer bg-[#FFF9F5] border border-[#E7C7CC] rounded-xl p-3.5">
                  <input
                    type="checkbox"
                    checked={verifyConfirmed}
                    onChange={(e) => setVerifyConfirmed(e.target.checked)}
                    className="mt-0.5 rounded border-[#E7C7CC] text-[#6D1836]"
                  />
                  <span>
                    I verify my delivery address (<strong>{addressLine}, {city} {postalCode}</strong>) and authorize{' '}
                    <strong>{formatINR(totalPayable)}</strong> via{' '}
                    <strong>{paymentMethod === 'razorpay' ? 'Razorpay' : 'Stripe'}</strong>.
                  </span>
                </label>

                <label className="inline-flex items-center gap-2 text-xs text-[#7A655C] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simulateFailure}
                    onChange={(e) => setSimulateFailure(e.target.checked)}
                    className="rounded border-[#E7C7CC] text-[#6D1836]"
                  />
                  <span>Simulate payment decline state (prototype preview)</span>
                </label>

                {paymentError && (
                  <div className="flex items-start gap-2.5 p-4 rounded-xl bg-[#6D1836]/10 border border-[#6D1836]/30 text-xs text-[#541129]">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{paymentError}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-[#8C6B3F]">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>256-bit encrypted checkout · Complete address &amp; payment verified</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    disabled={processing}
                    onClick={() => setStep(2)}
                    className="sm:w-1/3 py-3 px-5 rounded-xl border border-[#E7C7CC] text-sm font-medium text-[#3E2F27] hover:bg-[#FFF9F5] disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={processing}
                    onClick={handlePayNow}
                    className="flex-1 py-3.5 px-6 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-white text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors disabled:opacity-75"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Authorizing {paymentMethod === 'razorpay' ? 'Razorpay' : 'Stripe'}...</span>
                      </>
                    ) : (
                      <span>Pay {formatINR(totalPayable)} &amp; Place Order</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Sticky Order Summary */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            {customRequest ? (
              <div className="bg-white border border-[#E7C7CC] rounded-2xl p-6 shadow-warm/40 space-y-5">
                <div className="flex items-center justify-between border-b border-[#E7C7CC] pb-3">
                  <h2 className="font-display text-xl font-medium text-[#3E2F27]">
                    Custom Order Summary
                  </h2>
                  <span className="text-xs font-mono text-[#6D1836]">{customRequest.id}</span>
                </div>

                <div className="flex items-start gap-3">
                  <ResilientImage
                    src={customRequest.referenceImageData || STUDIO_MEDIA.artPortraitKeepsake}
                    alt={customRequest.customIdea}
                    className="w-16 h-16 rounded-xl object-cover border border-[#E7C7CC] shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#3E2F27]">
                      Custom: {customRequest.customIdea}
                    </p>
                    <p className="text-xs text-[#7A655C] mt-0.5">
                      {customRequest.categoryLabel} · {customRequest.approximateSize}
                    </p>
                  </div>
                </div>

                <div className="border-t border-[#E7C7CC] pt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-[#7A655C]">
                    <span>Approved Custom Quote</span>
                    <span className="tabular-nums font-medium text-[#3E2F27]">
                      {formatINR(customSubtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#7A655C]">
                    <span>Insured Packaging &amp; Delivery</span>
                    <span className="tabular-nums font-medium text-[#3E2F27]">
                      {customShipping === 0 ? 'Complimentary' : formatINR(customShipping)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-base text-[#3E2F27] pt-2 border-t border-[#E7C7CC]">
                    <span>Total Payable</span>
                    <span className="tabular-nums text-[#6D1836]">{formatINR(totalPayable)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <OrderSummary discount={discountFromCart} />
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
