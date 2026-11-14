import React, { useState } from 'react';
import { Mail, MapPin, Clock, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { PageTransition } from '../../components/common/PageTransition';

export const ContactPage: React.FC = () => {
  const { addToast } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Order or Artwork Inquiry');
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
    'w-full px-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE3D5] text-sm text-[#2B2623] focus:outline-none focus:border-[#C86D51]';

  return (
    <PageTransition className="py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <p className="font-handwritten text-2xl text-[#C86D51]">Say Hello</p>
          <h1 className="font-display text-3xl sm:text-4xl font-medium text-[#2B2623]">
            Contact the Studio
          </h1>
          <p className="text-sm sm:text-base text-[#6E655F]">
            Questions about framing, custom sizes, bulk gifting, or an existing parcel? Write to
            us directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-[#EAE3D5] rounded-2xl p-6 space-y-5">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#C86D51] shrink-0 mt-0.5" />
                <div>
                  <h2 className="font-display text-base font-medium text-[#2B2623]">
                    Studio Location
                  </h2>
                  <p className="text-xs sm:text-sm text-[#6E655F] mt-1 leading-relaxed">
                    varniks_atelier
                    <br />
                    24 Banyan Courtyard, Lane 6<br />
                    Koregaon Park, Pune 411001
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#C86D51] shrink-0 mt-0.5" />
                <div>
                  <h2 className="font-display text-base font-medium text-[#2B2623]">Studio Email</h2>
                  <p className="text-xs sm:text-sm text-[#6E655F] mt-1">
                    hello@varniksatelier.studio
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#7A9178] shrink-0 mt-0.5" />
                <div>
                  <h2 className="font-display text-base font-medium text-[#2B2623]">
                    Studio Hours
                  </h2>
                  <p className="text-xs sm:text-sm text-[#6E655F] mt-1">
                    Tuesday – Saturday · 10:30 AM to 6:30 PM IST
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white border border-[#EAE3D5] rounded-2xl p-6 sm:p-8 shadow-warm/40">
            {sent ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#7A9178]/15 text-[#7A9178] flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h2 className="font-display text-2xl font-medium text-[#2B2623]">
                  Note Received!
                </h2>
                <p className="text-sm text-[#6E655F] max-w-md mx-auto">
                  Thank you, {name}. We&apos;ll get back to you at <strong>{email}</strong> shortly.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSent(false);
                    setMessage('');
                  }}
                  className="mt-2 px-5 py-2.5 rounded-xl border border-[#EAE3D5] text-xs font-medium text-[#2B2623] hover:border-[#C86D51]"
                >
                  Send Another Note
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
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
                      value={name}
                      onChange={(e) => setName(e.target.value)}
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

                <div>
                  <label className="block text-xs font-medium text-[#6E655F] mb-1.5">
                    Subject
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className={inputClass}
                  >
                    <option>Order or Artwork Inquiry</option>
                    <option>Framing &amp; Sizing Question</option>
                    <option>Corporate / Wedding Gifting</option>
                    <option>Press &amp; Collaborations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#6E655F] mb-1.5">
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
                  className="w-full py-3 px-6 rounded-xl bg-[#C86D51] hover:bg-[#B2593E] text-white text-sm font-medium transition-colors"
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
