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
    <section className="py-16 sm:py-20 bg-[#FAF7F2]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-white border border-[#EAE3D5] rounded-3xl p-8 sm:p-12 text-center shadow-warm overflow-hidden">
          <BotanicalSprig className="hidden sm:block absolute -left-3 -bottom-4 w-24 h-28 text-[#7A9178]/25" />
          <BotanicalSprig className="hidden sm:block absolute -right-3 -top-4 w-24 h-28 text-[#C86D51]/20 rotate-180" />

          <div className="relative max-w-xl mx-auto space-y-4">
            <p className="font-handwritten text-2xl text-[#C86D51]">Studio Dispatch</p>
            <h2 className="font-display text-3xl sm:text-4xl font-medium text-[#2B2623] text-balance">
              Join our creative circle!
            </h2>
            <p className="text-sm sm:text-base text-[#6E655F] leading-relaxed">
              Get updates on new art, special offers &amp; more. First access when original
              sketches and small-batch terracotta firings release.
            </p>

            {submitted ? (
              <div className="mt-6 inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#7A9178]/15 border border-[#7A9178]/40 text-sm font-medium text-[#2B2623]">
                <Check className="w-4 h-4 text-[#7A9178]" />
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
                    className="flex-1 px-4 py-3 rounded-xl bg-[#FAF7F2] border border-[#EAE3D5] text-sm text-[#2B2623] placeholder:text-[#6E655F]/75 focus:outline-none focus:border-[#C86D51]"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-[#C86D51] hover:bg-[#B2593E] text-white text-sm font-medium transition-colors whitespace-nowrap inline-flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Subscribe</span>
                  </button>
                </div>
                {error && <p className="mt-2 text-xs text-[#B2593E] text-left">{error}</p>}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
