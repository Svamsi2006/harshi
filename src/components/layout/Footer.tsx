import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Youtube, Share2, ArrowRight, Check } from 'lucide-react';
import { BrandLogo } from '../common/BrandLogo';
import { BotanicalSprig } from '../common/BotanicalDecorations';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleFooterNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="relative bg-[#F3EDE2] border-t border-[#EAE3D5] text-[#2B2623] overflow-hidden">
      {/* Subtle botanical corner line art */}
      <BotanicalSprig className="hidden md:block absolute -left-4 bottom-2 w-28 h-32 text-[#7A9178]/25 -rotate-12" />
      <BotanicalSprig className="hidden md:block absolute -right-4 top-6 w-28 h-32 text-[#C86D51]/20 rotate-12" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-4">
            <BrandLogo to="/" size="lg" />
            <p className="text-sm text-[#6E655F] leading-relaxed max-w-sm">
              An independent studio celebrating slow, tactile craftsmanship — original charcoal
              sketches, raw terracotta sculptures, paintings, and archival prints made by hand.
            </p>
            <p className="font-handwritten text-xl text-[#C86D51]">
              Art · Craft · Inspiration
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-white border border-[#EAE3D5] flex items-center justify-center text-[#6E655F] hover:text-[#C86D51] hover:border-[#C86D51] transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Pinterest"
                className="w-9 h-9 rounded-full bg-white border border-[#EAE3D5] flex items-center justify-center text-[#6E655F] hover:text-[#C86D51] hover:border-[#C86D51] transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-full bg-white border border-[#EAE3D5] flex items-center justify-center text-[#6E655F] hover:text-[#C86D51] hover:border-[#C86D51] transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Explore Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-display text-sm font-semibold text-[#2B2623]">Explore</h4>
            <ul className="space-y-2.5 text-sm text-[#6E655F]">
              <li>
                <Link to="/shop" className="hover:text-[#C86D51] transition-colors">
                  Shop All
                </Link>
              </li>
              <li>
                <Link to="/artist-story" className="hover:text-[#C86D51] transition-colors">
                  Artist Story
                </Link>
              </li>
              <li>
                <Link to="/commission" className="hover:text-[#C86D51] transition-colors">
                  Custom Commission
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#C86D51] transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-[#C86D51] transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-display text-sm font-semibold text-[#2B2623]">Studio Care & Policies</h4>
            <ul className="space-y-2.5 text-sm text-[#6E655F]">
              <li>
                <Link to="/policies/shipping" className="hover:text-[#C86D51] transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/policies/returns" className="hover:text-[#C86D51] transition-colors">
                  Return & Damage Policy
                </Link>
              </li>
              <li>
                <Link to="/policies/privacy" className="hover:text-[#C86D51] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/policies/terms" className="hover:text-[#C86D51] transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Compact Studio Note / Newsletter Entry */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-display text-sm font-semibold text-[#2B2623]">Studio Letters</h4>
            <p className="text-xs text-[#6E655F] leading-relaxed">
              Occasional notes when new sketches leave the easel or kiln batches open.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white border border-[#7A9178]/40 text-xs text-[#2B2623]">
                <Check className="w-4 h-4 text-[#7A9178] shrink-0" />
                <span>You&apos;re in the studio circle!</span>
              </div>
            ) : (
              <form onSubmit={handleFooterNewsletter} className="flex items-center gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  aria-label="Email for studio letters"
                  className="min-w-0 flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-[#EAE3D5] text-xs text-[#2B2623] placeholder:text-[#6E655F]/70 focus:outline-none focus:border-[#C86D51]"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="px-3.5 py-2.5 rounded-xl bg-[#C86D51] hover:bg-[#B2593E] text-white transition-colors shrink-0"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#EAE3D5] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6E655F]">
          <p>© {new Date().getFullYear()} varniks_atelier. All rights reserved.</p>
          <p className="font-handwritten text-base text-[#6E655F]">
            Made with love for art lovers ♡
          </p>
        </div>
      </div>
    </footer>
  );
};
