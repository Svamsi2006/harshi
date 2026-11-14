import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, CheckCircle2, Sparkles, X } from 'lucide-react';
import { STUDIO_MEDIA } from '../../data/studioImages';
import { storeService } from '../../services/storeService';
import { useStore } from '../../context/StoreContext';
import { PageTransition } from '../../components/common/PageTransition';
import { ResilientImage } from '../../components/common/ResilientImage';

const COMMISSION_EXAMPLES = [
  {
    title: 'Heritage Home & Courtyard Sketch',
    style: 'Graphite & Sepia Ink',
    timeline: '10–12 days',
    image: STUDIO_MEDIA.sketchVillageLife,
  },
  {
    title: 'Expressive Charcoal Portrait',
    style: 'Sanguine & Charcoal',
    timeline: '12–15 days',
    image: STUDIO_MEDIA.sketchPortraitStudy,
  },
  {
    title: 'Custom Landscape on Wood Panel',
    style: 'Acrylic / Oil Impasto',
    timeline: '14–18 days',
    image: STUDIO_MEDIA.paintingSunsetGhat,
  },
];

export const CommissionPage: React.FC = () => {
  const { user, addToast } = useStore();
  const [customerName, setCustomerName] = useState(user?.fullName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [artworkType, setArtworkType] = useState('Pencil / Charcoal Sketch');
  const [preferredStyle, setPreferredStyle] = useState('Detailed Realism');
  const [approximateSize, setApproximateSize] = useState('11 × 14 inches');
  const [budgetRange, setBudgetRange] = useState('₹2,500 – ₹5,000');
  const [description, setDescription] = useState('');
  const [referenceName, setReferenceName] = useState<string>('');
  const [referencePreview, setReferencePreview] = useState<string>('');
  const [error, setError] = useState('');
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setReferenceName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setReferencePreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !email.trim() || !phone.trim() || !description.trim()) {
      setError('Please fill in your contact details and tell us about your desired artwork.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setError('');
    const reqId = `COM-${Math.floor(1000 + Math.random() * 8999)}`;
    storeService.saveCommissionRequest({
      id: reqId,
      customerName: customerName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      artworkType,
      preferredStyle,
      approximateSize,
      budgetRange,
      referenceImageName: referenceName || undefined,
      description: description.trim(),
      submittedAt: new Date().toISOString(),
    });
    setSubmittedId(reqId);
    addToast('Commission request received', 'We will reply within 24–48 hours.', 'success');
  };

  const inputClass =
    'w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE3D5] text-sm text-[#2B2623] focus:outline-none focus:border-[#C86D51]';

  return (
    <PageTransition className="py-10 sm:py-14">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Hero */}
        <section className="text-center max-w-3xl mx-auto space-y-4">
          <p className="font-handwritten text-2xl text-[#C86D51]">Bespoke Studio Works</p>
          <h1 className="font-display text-3xl sm:text-5xl font-medium text-[#2B2623] text-balance">
            Commission a Piece Made Just for You
          </h1>
          <p className="text-sm sm:text-base text-[#6E655F] leading-relaxed">
            Whether it&apos;s a charcoal portrait of a loved one, a watercolor of your ancestral
            home, or a custom clay centerpiece—share your vision and we&apos;ll bring it to life
            on paper or clay.
          </p>
        </section>

        {/* Commission Examples */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {COMMISSION_EXAMPLES.map((ex) => (
            <div
              key={ex.title}
              className="bg-white border border-[#EAE3D5] rounded-2xl p-3 shadow-warm/40"
            >
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#F3EDE2]">
                <ResilientImage
                  src={ex.image}
                  alt={ex.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="pt-3 px-1 pb-1">
                <p className="text-xs text-[#7A9178] font-medium">
                  {ex.style} · {ex.timeline}
                </p>
                <h2 className="font-display text-base font-medium text-[#2B2623] mt-0.5">
                  {ex.title}
                </h2>
              </div>
            </div>
          ))}
        </section>

        {/* Process + Request Form */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Process Explanation */}
          <div className="lg:col-span-5 space-y-6 bg-[#F3EDE2]/75 border border-[#EAE3D5] rounded-2xl p-6 sm:p-7">
            <div>
              <h2 className="font-display text-2xl font-medium text-[#2B2623]">
                How Commissions Work
              </h2>
              <p className="text-sm text-[#6E655F] mt-1">
                Collaborative, transparent, and personal from sketch to parcel.
              </p>
            </div>

            <ol className="space-y-4 text-sm">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-[#C86D51] text-white text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <p className="font-medium text-[#2B2623]">Share your idea &amp; reference</p>
                  <p className="text-xs text-[#6E655F] mt-0.5 leading-relaxed">
                    Upload a favorite photo or describe the mood, colors, and dimensions you have
                    in mind.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-[#C86D51] text-white text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <p className="font-medium text-[#2B2623]">Composition sketch &amp; quote</p>
                  <p className="text-xs text-[#6E655F] mt-0.5 leading-relaxed">
                    Within 48 hours we send a confirmed timeline, exact pricing, and initial layout
                    notes.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-[#C86D51] text-white text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <p className="font-medium text-[#2B2623]">Studio progress check-in</p>
                  <p className="text-xs text-[#6E655F] mt-0.5 leading-relaxed">
                    We share daylight studio photos of your artwork before final sealing and gift
                    wrapping.
                  </p>
                </div>
              </li>
            </ol>
          </div>

          {/* Right Form */}
          <div className="lg:col-span-7 bg-white border border-[#EAE3D5] rounded-2xl p-6 sm:p-8 shadow-warm">
            {submittedId ? (
              <div className="py-10 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-[#7A9178]/15 text-[#7A9178] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <p className="font-handwritten text-2xl text-[#C86D51]">Thank you ♡</p>
                <h2 className="font-display text-2xl sm:text-3xl font-medium text-[#2B2623]">
                  Commission Request Received
                </h2>
                <p className="text-sm text-[#6E655F] max-w-md mx-auto leading-relaxed">
                  Reference ID <strong>{submittedId}</strong> has been noted by our studio. Varnika
                  will review your inspiration notes and reach out at <strong>{email}</strong>{' '}
                  within 24–48 hours.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedId(null);
                      setDescription('');
                      setReferenceName('');
                      setReferencePreview('');
                    }}
                    className="px-5 py-2.5 rounded-xl border border-[#EAE3D5] text-sm font-medium text-[#2B2623] hover:border-[#C86D51]"
                  >
                    Submit Another Request
                  </button>
                  <Link
                    to="/shop"
                    className="px-5 py-2.5 rounded-xl bg-[#C86D51] hover:bg-[#B2593E] text-white text-sm font-medium"
                  >
                    Browse Ready-to-Ship Works
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-[#EAE3D5]">
                  <Sparkles className="w-4 h-4 text-[#C86D51]" />
                  <h2 className="font-display text-xl font-medium text-[#2B2623]">
                    Custom Artwork Request Form
                  </h2>
                </div>

                {error && (
                  <p className="text-xs text-[#B2593E] bg-[#C86D51]/10 border border-[#C86D51]/25 rounded-xl px-4 py-3">
                    {error}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#6E655F] mb-1.5">
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
                    <label className="block text-xs font-medium text-[#6E655F] mb-1.5">
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
                    <label className="block text-xs font-medium text-[#6E655F] mb-1.5">
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
                    <label className="block text-xs font-medium text-[#6E655F] mb-1.5">
                      Artwork Type
                    </label>
                    <select
                      value={artworkType}
                      onChange={(e) => setArtworkType(e.target.value)}
                      className={inputClass}
                    >
                      <option>Pencil / Charcoal Sketch</option>
                      <option>Watercolor Landscape / Home</option>
                      <option>Oil / Acrylic Canvas Painting</option>
                      <option>Custom Terracotta Sculpture</option>
                      <option>Botanical Clay Planter Set</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#6E655F] mb-1.5">
                      Preferred Style
                    </label>
                    <select
                      value={preferredStyle}
                      onChange={(e) => setPreferredStyle(e.target.value)}
                      className={inputClass}
                    >
                      <option>Detailed Realism</option>
                      <option>Loose Expressive Charcoal</option>
                      <option>Soft Pastel Watercolor</option>
                      <option>Earthy Rustic Clay</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#6E655F] mb-1.5">
                      Approximate Size
                    </label>
                    <select
                      value={approximateSize}
                      onChange={(e) => setApproximateSize(e.target.value)}
                      className={inputClass}
                    >
                      <option>8 × 10 inches</option>
                      <option>11 × 14 inches</option>
                      <option>16 × 20 inches</option>
                      <option>18 × 24 inches</option>
                      <option>Sculpture (6–10 in tall)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#6E655F] mb-1.5">
                      Budget Range
                    </label>
                    <select
                      value={budgetRange}
                      onChange={(e) => setBudgetRange(e.target.value)}
                      className={inputClass}
                    >
                      <option>₹1,500 – ₹2,500</option>
                      <option>₹2,500 – ₹5,000</option>
                      <option>₹5,000 – ₹10,000</option>
                      <option>Above ₹10,000</option>
                    </select>
                  </div>
                </div>

                {/* Reference Image Upload UI */}
                <div>
                  <label className="block text-xs font-medium text-[#6E655F] mb-1.5">
                    Reference Image (Optional)
                  </label>
                  {referencePreview ? (
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-[#FAF7F2] border border-[#EAE3D5]">
                      <img
                        src={referencePreview}
                        alt="Uploaded reference preview"
                        className="w-16 h-16 rounded-lg object-cover border border-[#EAE3D5]"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-[#2B2623] truncate">
                          {referenceName}
                        </p>
                        <p className="text-[11px] text-[#7A9178]">Reference image attached</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setReferenceName('');
                          setReferencePreview('');
                        }}
                        className="p-1.5 text-[#6E655F] hover:text-[#B2593E]"
                        aria-label="Remove reference image"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-1.5 p-5 rounded-xl border border-dashed border-[#C86D51]/50 bg-[#FAF7F2] hover:bg-[#F3EDE2]/60 cursor-pointer transition-colors text-center">
                      <Upload className="w-5 h-5 text-[#C86D51]" />
                      <span className="text-xs font-medium text-[#2B2623]">
                        Click to attach a photo or sketch reference
                      </span>
                      <span className="text-[11px] text-[#6E655F]">PNG, JPG up to 10 MB</span>
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
                  <label className="block text-xs font-medium text-[#6E655F] mb-1.5">
                    Description &amp; Special Notes *
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className={inputClass}
                    placeholder="Tell us about the subject, desired framing or gift date, color mood, or any special inscription..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-[#C86D51] hover:bg-[#B2593E] text-white text-sm font-medium shadow-warm transition-colors"
                >
                  Submit Commission Request
                </button>
              </form>
            )}
          </div>
        </section>
      </div>
    </PageTransition>
  );
};
