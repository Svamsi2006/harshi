import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Clock, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PageTransition } from '../../components/common/PageTransition';

export const ContactPage: React.FC = () => {
  const { addToast } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Custom Order or Idea Inquiry');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please enter your name, email, and message.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setSent(true);
    addToast('Message sent to studio', 'We reply within 1–2 business days.', 'success');
  };

  const inputClass =
    'w-full px-3.5 py-2.5 rounded-xl bg-[#FFF9F5] border border-[#E7C7CC] text-sm text-[#3E2F27] focus:outline-none focus:border-[#6D1836]';

  return (
    <PageTransition className="py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <p className="font-handwritten text-2xl text-[#6D1836]">Say Hello</p>
          <h1 className="font-display text-3xl sm:text-4xl font-medium text-[#3E2F27]">
            Contact &amp; Custom Orders
          </h1>
          <p className="text-sm sm:text-base text-[#7A655C]">
            Questions about personalized resin hampers, LED frames, custom sizes, bulk gifting, or
            an existing parcel? Write to us directly or start a custom order.
          </p>
        </div>

        {/* Custom Orders Highlight Banner */}
        <div className="bg-[#F8EFEA] border border-[#E7C7CC] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#6D1836] shrink-0 mt-0.5" />
            <div>
              <h2 className="font-display text-lg font-medium text-[#3E2F27]">
                Looking to place a Custom Order with your own photo &amp; idea?
              </h2>
              <p className="text-xs sm:text-sm text-[#7A655C] mt-0.5">
                Upload a photograph, choose a price prediction or custom price, and join our live
                waiting list for approval.
              </p>
            </div>
          </div>
          <Link
            to="/custom-orders"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-[#FFF9F5] text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0"
          >
            <span>Open Custom Orders</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-[#E7C7CC] rounded-2xl p-6 space-y-5">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#6D1836] shrink-0 mt-0.5" />
                <div>
                  <h2 className="font-display text-base font-medium text-[#3E2F27]">
                    Studio Location
                  </h2>
                  <p className="text-xs sm:text-sm text-[#7A655C] mt-1 leading-relaxed">
                    varniks_atelier
                    <br />
                    24 Banyan Courtyard, Lane 6<br />
                    Koregaon Park, Pune 411001
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#6D1836] shrink-0 mt-0.5" />
                <div>
                  <h2 className="font-display text-base font-medium text-[#3E2F27]">Studio Email</h2>
                  <p className="text-xs sm:text-sm text-[#7A655C] mt-1">
                    hello@varniksatelier.studio
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#C9A66B] shrink-0 mt-0.5" />
                <div>
                  <h2 className="font-display text-base font-medium text-[#3E2F27]">
                    Studio Hours
                  </h2>
                  <p className="text-xs sm:text-sm text-[#7A655C] mt-1">
                    Tuesday – Saturday · 10:30 AM to 6:30 PM IST
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white border border-[#E7C7CC] rounded-2xl p-6 sm:p-8 shadow-warm/40">
            {sent ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#C9A66B]/20 text-[#6D1836] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h2 className="font-display text-2xl font-medium text-[#3E2F27]">
                  Note Received!
                </h2>
                <p className="text-sm text-[#7A655C] max-w-md mx-auto">
                  Thank you, {name}. We&apos;ll get back to you at <strong>{email}</strong> shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                    setMessage('');
                  }}
                  className="mt-2 px-5 py-2.5 rounded-xl border border-[#E7C7CC] text-xs font-medium text-[#3E2F27] hover:border-[#6D1836]"
                >
                  Send Another Note
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
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
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={inputClass}
                      placeholder="Ananya Deshmukh"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
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

                <div>
                  <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
                    Subject
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className={inputClass}
                  >
                    <option>Custom Order or Idea Inquiry</option>
                    <option>Order Status &amp; Tracking</option>
                    <option>Bulk / Return Gift Hampers</option>
                    <option>Press &amp; Collaborations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#7A655C] mb-1.5">
                    Message *
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className={inputClass}
                    placeholder="How can we help?"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-[#FFF9F5] text-sm font-medium transition-colors"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
