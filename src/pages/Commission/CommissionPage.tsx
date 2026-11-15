import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Upload,
  CheckCircle2,
  Sparkles,
  X,
  Clock,
  ShieldCheck,
  FileCheck2,
  FileX2,
  ArrowRight,
  ShoppingBag,
  Eye,
  Loader2,
} from 'lucide-react';
import { STUDIO_MEDIA } from '../../data/studioImages';
import { useStore } from '../../context/StoreContext';
import { formatINR } from '../../utils/format';
import { uploadStudioPhoto } from '../../utils/imageUpload';
import { PageTransition } from '../../components/common/PageTransition';
import { ResilientImage } from '../../components/common/ResilientImage';

const CUSTOM_INSPIRATIONS = [
  {
    title: 'Floral Resin Photo Keepsake',
    category: 'Resin Creations',
    timeline: '5–7 days',
    image: STUDIO_MEDIA.resinFloralKeepsake,
  },
  {
    title: 'Glowing LED Memory Frame',
    category: 'Frames & LED Frames',
    timeline: '4–6 days',
    image: STUDIO_MEDIA.ledMemoryFrame,
  },
  {
    title: 'Custom Portrait & Embroidery Gift',
    category: 'Art & Portraits',
    timeline: '7–10 days',
    image: STUDIO_MEDIA.artPortraitKeepsake,
  },
];

const PREDICTED_RANGES = [
  { label: '₹699 – ₹1,199 (Petite Keepsake)', estimate: 999 },
  { label: '₹1,200 – ₹1,999 (Classic Gift)', estimate: 1599 },
  { label: '₹2,000 – ₹3,499 (Deluxe Frame / Set)', estimate: 2499 },
  { label: '₹3,500+ (Heirloom Hamper / Portrait)', estimate: 3800 },
];

export const CommissionPage: React.FC = () => {
  const {
    user,
    categories,
    commissions,
    createCustomOrderRequest,
    allOrders,
  } = useStore();

  const [customerName, setCustomerName] = useState(user?.fullName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [categorySlug, setCategorySlug] = useState(categories[0]?.slug ?? 'resin-creations');
  const [customIdea, setCustomIdea] = useState('');
  const [approximateSize, setApproximateSize] = useState('Standard Gift Size (6–8 in)');
  const [priceMode, setPriceMode] = useState<'range' | 'custom'>('range');
  const [selectedRange, setSelectedRange] = useState(PREDICTED_RANGES[1].label);
  const [customPriceInput, setCustomPriceInput] = useState('1800');
  const [description, setDescription] = useState('');
  const [referenceName, setReferenceName] = useState('');
  const [referencePreview, setReferencePreview] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [storedInSupabase, setStoredInSupabase] = useState(false);
  const [previewModal, setPreviewModal] = useState<{
    url: string;
    title: string;
    fileName?: string;
  } | null>(null);
  const [error, setError] = useState('');
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const selectedCategoryObj = categories.find((c) => c.slug === categorySlug) ?? categories[0];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReferenceName(file.name);
    setUploadingPhoto(true);
    setError('');
    try {
      const { url, storedInSupabase: synced } = await uploadStudioPhoto(file, 'custom-orders');
      setReferencePreview(url);
      setStoredInSupabase(synced);
    } catch {
      setError('Could not read the selected photograph. Please try a PNG or JPG image.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const predictedNumber = useMemo(() => {
    if (priceMode === 'custom') {
      const parsed = Number(customPriceInput);
      return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed) : 0;
    }
    return PREDICTED_RANGES.find((r) => r.label === selectedRange)?.estimate ?? 1599;
  }, [customPriceInput, priceMode, selectedRange]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !email.trim() || !phone.trim() || !customIdea.trim()) {
      setError('Please fill in your contact details and your custom idea.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (priceMode === 'custom' && predictedNumber <= 0) {
      setError('Please enter a valid custom price amount in ₹.');
      return;
    }

    setError('');
    const created = createCustomOrderRequest({
      customerId: user?.id ?? 'guest',
      customerName: customerName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      categorySlug: selectedCategoryObj?.slug ?? categorySlug,
      categoryLabel: selectedCategoryObj?.label ?? 'Custom Creation',
      customIdea: customIdea.trim(),
      artworkType: selectedCategoryObj?.label ?? 'Custom Creation',
      preferredStyle: customIdea.trim(),
      approximateSize,
      budgetRange:
        priceMode === 'custom' ? `Custom Price: ${formatINR(predictedNumber)}` : selectedRange,
      isCustomPrice: priceMode === 'custom',
      predictedPrice: predictedNumber,
      hasUploadedFile: Boolean(referenceName || referencePreview),
      referenceImageName: referenceName || undefined,
      referenceImageData: referencePreview || undefined,
      description: description.trim() || customIdea.trim(),
    });

    setSubmittedId(created.id);
  };

  // Show user's custom requests (or all demo/guest requests in waiting list view)
  const visibleRequests = useMemo(() => {
    if (!user) return commissions;
    const mine = commissions.filter(
      (c) =>
        c.customerId === user.id ||
        c.email.toLowerCase() === user.email.toLowerCase() ||
        c.customerId === 'guest'
    );
    return mine.length > 0 ? mine : commissions;
  }, [commissions, user]);

  const inputClass =
    'w-full px-3.5 py-2.5 rounded-xl bg-[#FFF9F5] border border-[#E7C7CC] text-sm text-[#3E2F27] focus:outline-none focus:border-[#6D1836]';

  return (
    <PageTransition className="py-10 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Hero */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6D1836]">
            Handmade • Heartmade • Heartfelt
          </p>
          <h1 className="font-display text-3xl sm:text-5xl font-medium text-[#3E2F27] text-balance">
            Custom Orders Made Around Your Memory
          </h1>
          <p className="text-sm sm:text-base text-[#7A655C] leading-relaxed">
            Pick a craft category, share your custom idea + upload a photograph, and choose a
            predicted price range or enter your own custom price. Once our studio approves your
            request in the waiting list, you can approve &amp; place your continuous order.
          </p>
        </section>

        {/* Inspirations */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CUSTOM_INSPIRATIONS.map((ex) => (
            <div
              key={ex.title}
              className="bg-white border border-[#E7C7CC] rounded-2xl p-3 shadow-warm/40"
            >
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#F8EFEA]">
                <ResilientImage
                  src={ex.image}
                  alt={ex.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="pt-3 px-1 pb-1">
                <p className="text-xs text-[#6D1836] font-medium">
                  {ex.category} · {ex.timeline}
                </p>
                <h2 className="font-display text-base font-medium text-[#3E2F27] mt-0.5">
                  {ex.title}
                </h2>
              </div>
            </div>
          ))}
        </section>

        {/* Workflow + Form */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Explanation */}
          <div className="lg:col-span-5 space-y-6 bg-[#F8EFEA] border border-[#E7C7CC] rounded-2xl p-6 sm:p-7">
            <div>
              <h2 className="font-display text-2xl font-medium text-[#3E2F27]">
                How Custom Orders Work
              </h2>
              <p className="text-sm text-[#7A655C] mt-1">
                Transparent waiting list, studio verification, and instant order placement.
              </p>
            </div>

            <ol className="space-y-4 text-sm">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-[#6D1836] text-[#FFF9F5] text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <p className="font-medium text-[#3E2F27]">Idea + Photo + Price Prediction</p>
                  <p className="text-xs text-[#7A655C] mt-0.5 leading-relaxed">
                    Select your category, share your custom idea, attach a reference photo, and
                    pick a predicted price range or enter your custom budget.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-[#6D1836] text-[#FFF9F5] text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <p className="font-medium text-[#3E2F27]">Waiting List &amp; Admin Approval</p>
                  <p className="text-xs text-[#7A655C] mt-0.5 leading-relaxed">
                    Your request joins the studio waiting list. Our maker verifies your uploaded
                    file and approves the final quote.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-[#C9A66B] text-[#3E2F27] text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <p className="font-medium text-[#3E2F27]">
                    Customer Approval &amp; Continuous Order
                  </p>
                  <p className="text-xs text-[#7A655C] mt-0.5 leading-relaxed">
                    Once admin approves, click &ldquo;Approve &amp; Place Order&rdquo; right below
                    to convert it straight into your active order!
                  </p>
                </div>
              </li>
            </ol>
          </div>

          {/* Right Form */}
          <div className="lg:col-span-7 bg-white border border-[#E7C7CC] rounded-2xl p-6 sm:p-8 shadow-warm">
            {submittedId ? (
              <div className="py-10 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#C9A66B]/20 text-[#6D1836] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <p className="font-handwritten text-2xl text-[#6D1836]">Added to Waiting List ♡</p>
                <h2 className="font-display text-2xl sm:text-3xl font-medium text-[#3E2F27]">
                  Custom Order Request Submitted
                </h2>
                <p className="text-sm text-[#7A655C] max-w-md mx-auto leading-relaxed">
                  Request ID <strong>{submittedId}</strong> is now in our Waiting List. Once the
                  studio admin approves it, you can approve and place your continuous order directly
                  in the tracker below.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedId(null);
                      setCustomIdea('');
                      setDescription('');
                      setReferenceName('');
                      setReferencePreview('');
                    }}
                    className="px-5 py-2.5 rounded-xl border border-[#E7C7CC] text-sm font-medium text-[#3E2F27] hover:border-[#6D1836]"
                  >
                    Submit Another Custom Idea
                  </button>
                  <a
                    href="#waiting-list"
                    className="px-5 py-2.5 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-[#FFF9F5] text-sm font-medium"
                  >
                    View Waiting List ↓
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-[#E7C7CC]/70">
                  <Sparkles className="w-4 h-4 text-[#C9A66B]" />
                  <h2 className="font-display text-xl font-medium text-[#3E2F27]">
                    Custom Order Request
                  </h2>
                </div>

                {error && (
                  <p className="text-xs text-[#6D1836] bg-[#6D1836]/10 border border-[#6D1836]/25 rounded-xl px-4 py-3">
                    {error}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
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
                      Craft Category *
                    </label>
                    <select
                      value={categorySlug}
                      onChange={(e) => setCategorySlug(e.target.value)}
                      className={inputClass}
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.slug}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
                      Your Custom Idea *
                    </label>
                    <input
                      type="text"
                      value={customIdea}
                      onChange={(e) => setCustomIdea(e.target.value)}
                      className={inputClass}
                      placeholder="e.g. Resin frame with wedding rose & date"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
                      Preferred Size / Format
                    </label>
                    <select
                      value={approximateSize}
                      onChange={(e) => setApproximateSize(e.target.value)}
                      className={inputClass}
                    >
                      <option>Pocket / Keychain Size</option>
                      <option>Standard Gift Size (6–8 in)</option>
                      <option>Medium Display (8 × 10 in)</option>
                      <option>Large Statement (11 × 14 in+)</option>
                    </select>
                  </div>
                </div>

                {/* Predicted Price Range OR Custom Price Input */}
                <div className="bg-[#FFF9F5] border border-[#E7C7CC] rounded-2xl p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-[#3E2F27]">
                      Predicted Price Estimate
                    </span>
                    <div className="inline-flex rounded-xl bg-[#F8EFEA] p-0.5 border border-[#E7C7CC]">
                      <button
                        type="button"
                        onClick={() => setPriceMode('range')}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          priceMode === 'range'
                            ? 'bg-[#6D1836] text-[#FFF9F5]'
                            : 'text-[#7A655C] hover:text-[#3E2F27]'
                        }`}
                      >
                        Price Range
                      </button>
                      <button
                        type="button"
                        onClick={() => setPriceMode('custom')}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          priceMode === 'custom'
                            ? 'bg-[#6D1836] text-[#FFF9F5]'
                            : 'text-[#7A655C] hover:text-[#3E2F27]'
                        }`}
                      >
                        Enter Custom Price
                      </button>
                    </div>
                  </div>

                  {priceMode === 'range' ? (
                    <select
                      value={selectedRange}
                      onChange={(e) => setSelectedRange(e.target.value)}
                      className={inputClass}
                    >
                      {PREDICTED_RANGES.map((r) => (
                        <option key={r.label} value={r.label}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="block text-xs text-[#7A655C]">
                        Enter your custom price budget (₹)
                      </label>
                      <input
                        type="number"
                        min={100}
                        step={50}
                        value={customPriceInput}
                        onChange={(e) => setCustomPriceInput(e.target.value)}
                        className={inputClass}
                        placeholder="1800"
                      />
                    </div>
                  )}

                  <p className="text-xs text-[#7A655C] flex items-center justify-between">
                    <span>Estimated custom order price:</span>
                    <strong className="text-sm text-[#6D1836] tabular-nums">
                      {formatINR(predictedNumber)}
                    </strong>
                  </p>
                </div>

                {/* Reference Photo Upload UI */}
                <div>
                  <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
                    Upload Reference Photograph (Saved for Studio Preview)
                  </label>
                  {uploadingPhoto ? (
                    <div className="flex items-center justify-center gap-2.5 p-5 rounded-xl border border-dashed border-[#6D1836]/40 bg-[#FFF9F5] text-xs font-medium text-[#6D1836]">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Compressing &amp; uploading photograph...</span>
                    </div>
                  ) : referencePreview ? (
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-[#FFF9F5] border border-[#C9A66B]">
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewModal({
                            url: referencePreview,
                            title: customIdea.trim() || 'Uploaded Reference Photo',
                            fileName: referenceName,
                          })
                        }
                        className="relative group shrink-0 rounded-lg overflow-hidden border border-[#E7C7CC]"
                        title="Click to inspect full photo"
                      >
                        <img
                          src={referencePreview}
                          alt="Uploaded reference preview"
                          className="w-16 h-16 object-cover"
                        />
                        <span className="absolute inset-0 bg-[#3E2F27]/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Eye className="w-4 h-4" />
                        </span>
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-[#3E2F27] truncate">
                          {referenceName}
                        </p>
                        <p className="text-[11px] text-[#8C6B3F] font-medium">
                          {storedInSupabase
                            ? 'Uploaded to Supabase Storage ✓'
                            : 'Photo compressed & attached ✓'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setReferenceName('');
                          setReferencePreview('');
                          setStoredInSupabase(false);
                        }}
                        className="p-1.5 text-[#7A655C] hover:text-[#6D1836]"
                        aria-label="Remove reference image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-1.5 p-5 rounded-xl border border-dashed border-[#6D1836]/40 bg-[#FFF9F5] hover:bg-[#F8EFEA] cursor-pointer transition-colors text-center">
                      <Upload className="w-5 h-5 text-[#6D1836]" />
                      <span className="text-xs font-medium text-[#3E2F27]">
                        Click to upload a reference photo or inspiration shot
                      </span>
                      <span className="text-[11px] text-[#7A655C]">PNG, JPG up to 10 MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
                    Personalization Notes, Names &amp; Colors
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={inputClass}
                    placeholder="Share names, dates, color theme, gift occasion, or anything special..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-[#FFF9F5] text-sm font-medium shadow-warm transition-colors"
                >
                  Submit to Custom Order Waiting List
                </button>
              </form>
            )}
          </div>
        </section>

        {/* Live Custom Order Waiting List & Approval Tracker */}
        <section id="waiting-list" className="space-y-5 pt-4 border-t border-[#E7C7CC]/70">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <p className="font-handwritten text-2xl text-[#6D1836]">Live Studio Queue</p>
              <h2 className="font-display text-2xl sm:text-3xl font-medium text-[#3E2F27]">
                Custom Order Waiting List &amp; Approvals
              </h2>
              <p className="text-sm text-[#7A655C] mt-1">
                Track whether your reference photo is uploaded, whether the studio admin has
                approved your design, and confirm to create your continuous order.
              </p>
            </div>
            <Link
              to="/account/orders"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6D1836] hover:text-[#541129] whitespace-nowrap"
            >
              <span>View My Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {visibleRequests.map((req) => {
              const linkedOrder = req.linkedOrderId
                ? allOrders.find((o) => o.id === req.linkedOrderId)
                : undefined;

              return (
                <div
                  key={req.id}
                  className="bg-white border border-[#E7C7CC] rounded-2xl p-5 space-y-4 shadow-warm/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-mono text-[#7A655C]">{req.id}</p>
                      <h3 className="font-display text-lg font-medium text-[#3E2F27]">
                        {req.customIdea || req.artworkType}
                      </h3>
                      <p className="text-xs text-[#7A655C]">
                        {req.categoryLabel} · {req.customerName}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap ${
                        req.orderCreated
                          ? 'bg-[#C9A66B]/25 text-[#3E2F27]'
                          : req.adminApproved
                            ? 'bg-[#6D1836] text-[#FFF9F5]'
                            : 'bg-[#F8EFEA] text-[#6D1836] border border-[#E7C7CC]'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  {/* Tracking Flags */}
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
                        req.hasUploadedFile
                          ? 'bg-[#FFF9F5] border-[#C9A66B] text-[#3E2F27]'
                          : 'bg-[#F8EFEA] border-[#E7C7CC] text-[#7A655C]'
                      }`}
                    >
                      {req.hasUploadedFile ? (
                        <FileCheck2 className="w-4 h-4 text-[#C9A66B] shrink-0" />
                      ) : (
                        <FileX2 className="w-4 h-4 text-[#7A655C] shrink-0" />
                      )}
                      <span className="truncate font-medium">
                        {req.hasUploadedFile ? 'File Uploaded ✓' : 'No File Uploaded'}
                      </span>
                    </div>

                    <div
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
                        req.adminApproved
                          ? 'bg-[#6D1836]/10 border-[#6D1836]/30 text-[#6D1836]'
                          : 'bg-[#F8EFEA] border-[#E7C7CC] text-[#7A655C]'
                      }`}
                    >
                      {req.adminApproved ? (
                        <ShieldCheck className="w-4 h-4 text-[#6D1836] shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-[#7A655C] shrink-0" />
                      )}
                      <span className="truncate font-medium">
                        {req.adminApproved ? 'Admin Approved ✓' : 'Waiting Admin Review'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-[#7A655C] leading-relaxed">{req.description}</p>

                  {req.referenceImageData && (
                    <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#FFF9F5] border border-[#E7C7CC]">
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewModal({
                            url: req.referenceImageData!,
                            title: req.customIdea || req.artworkType,
                            fileName: req.referenceImageName,
                          })
                        }
                        className="relative group shrink-0 rounded-lg overflow-hidden border border-[#E7C7CC]"
                        title="Open photo preview"
                      >
                        <ResilientImage
                          src={req.referenceImageData}
                          alt={req.referenceImageName || req.customIdea}
                          className="w-14 h-14 object-cover"
                        />
                        <span className="absolute inset-0 bg-[#3E2F27]/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Eye className="w-4 h-4" />
                        </span>
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-[#3E2F27] truncate">
                          {req.referenceImageName || 'Reference Photo'}
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewModal({
                              url: req.referenceImageData!,
                              title: req.customIdea || req.artworkType,
                              fileName: req.referenceImageName,
                            })
                          }
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#6D1836] hover:underline mt-0.5"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Preview Uploaded Photo</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {req.internalNotes && (
                    <div className="px-3 py-2 rounded-xl bg-[#F8EFEA] border border-[#E7C7CC] text-xs text-[#3E2F27]">
                      <span className="font-semibold text-[#6D1836]">Studio Note:</span>{' '}
                      {req.internalNotes}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E7C7CC]/60">
                    <div className="text-xs">
                      <span className="text-[#7A655C]">
                        {req.quotedPrice ? 'Studio Quote: ' : 'Predicted Price: '}
                      </span>
                      <strong className="text-sm text-[#3E2F27] tabular-nums">
                        {formatINR(req.quotedPrice ?? req.predictedPrice ?? 1499)}
                      </strong>
                    </div>

                    {req.orderCreated ? (
                      <Link
                        to="/account/orders"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#C9A66B]/25 text-[#3E2F27] text-xs font-semibold hover:bg-[#C9A66B]/40 transition-colors"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-[#6D1836]" />
                        <span>
                          Order Created ({linkedOrder?.orderNumber ?? req.linkedOrderId})
                        </span>
                      </Link>
                    ) : req.adminApproved ? (
                      <Link
                        to={`/checkout?customRequestId=${encodeURIComponent(req.id)}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-[#FFF9F5] text-xs font-medium transition-colors"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve &amp; Complete Checkout →</span>
                      </Link>
                    ) : (
                      <span className="text-[11px] text-[#7A655C]">
                        In Waiting List — awaiting admin quote approval
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Reference Photo Lightbox Modal */}
      {previewModal && (
        <div
          className="fixed inset-0 z-50 bg-[#3E2F27]/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewModal(null)}
        >
          <div
            className="bg-[#FFF9F5] border border-[#E7C7CC] rounded-3xl max-w-2xl w-full p-4 sm:p-6 space-y-4 shadow-warm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#6D1836]">
                  Reference Photograph
                </p>
                <h3 className="font-display text-lg font-medium text-[#3E2F27] truncate">
                  {previewModal.title}
                </h3>
                {previewModal.fileName && (
                  <p className="text-xs text-[#7A655C] truncate">{previewModal.fileName}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setPreviewModal(null)}
                className="p-2 rounded-full bg-white border border-[#E7C7CC] text-[#3E2F27] hover:border-[#6D1836]"
                aria-label="Close preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden bg-white border border-[#E7C7CC] max-h-[70vh] flex items-center justify-center">
              <img
                src={previewModal.url}
                alt={previewModal.title}
                className="max-h-[68vh] w-auto max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
};
