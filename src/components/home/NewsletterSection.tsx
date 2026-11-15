import React, { useState } from 'react';
import { Check, Sparkles } from 'lucide-react';
import { BotanicalSprig } from '../common/BotanicalDecorations';

export const NewsletterSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = email.trim();
    if (!cleaned || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setSubmitted(true);
    setEmail('');
  };

  return (
    <section className="py-16 sm:py-20 bg-[#FFF9F5]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-white border border-[#E7C7CC] rounded-3xl p-8 sm:p-12 text-center shadow-warm overflow-hidden">
          <BotanicalSprig className="hidden sm:block absolute -left-3 -bottom-4 w-24 h-28 text-[#C9A66B]/30" />
          <BotanicalSprig className="hidden sm:block absolute -right-3 -top-4 w-24 h-28 text-[#6D1836]/15 rotate-180" />

          <div className="relative max-w-xl mx-auto space-y-4">
            <p className="font-handwritten text-2xl text-[#6D1836]">Studio Dispatch</p>
            <h2 className="font-display text-3xl sm:text-4xl font-medium text-[#3E2F27] text-balance">
              Join our heartmade circle!
            </h2>
            <p className="text-sm sm:text-base text-[#7A655C] leading-relaxed">
              First access when fresh resin pours, handmade bouquets, embroidered hoops, and custom
              order slots open in the studio.
            </p>

            {submitted ? (
              <div className="mt-6 inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#F8EFEA] border border-[#C9A66B]/60 text-sm font-medium text-[#3E2F27]">
                <Check className="w-4 h-4 text-[#6D1836]" />
                <span>Thank you for joining! Watch your inbox for our next studio letter ♡</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError('');
                    }}
                    placeholder="Enter your email address"
                    aria-label="Email address for creative circle newsletter"
                    className="flex-1 px-4 py-3 rounded-xl bg-[#FFF9F5] border border-[#E7C7CC] text-sm text-[#3E2F27] placeholder:text-[#7A655C]/75 focus:outline-none focus:border-[#6D1836]"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-[#FFF9F5] text-sm font-medium transition-colors whitespace-nowrap inline-flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-[#C9A66B]" />
                    <span>Subscribe</span>
                  </button>
                </div>
                {error && <p className="mt-2 text-xs text-[#6D1836] text-left">{error}</p>}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
