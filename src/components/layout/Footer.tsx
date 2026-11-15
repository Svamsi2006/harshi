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
    <footer className="relative bg-[#F8EFEA] border-t border-[#E7C7CC]/70 text-[#3E2F27] overflow-hidden">
      <BotanicalSprig className="hidden md:block absolute -left-4 bottom-2 w-28 h-32 text-[#C9A66B]/30 -rotate-12" />
      <BotanicalSprig className="hidden md:block absolute -right-4 top-6 w-28 h-32 text-[#6D1836]/15 rotate-12" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-4">
            <BrandLogo to="/" size="lg" />
            <p className="text-sm text-[#7A655C] leading-relaxed max-w-sm">
              A warm, Pinterest-inspired handmade studio crafting resin keepsakes, clay &amp; pipe
              cleaner bouquets, LED memory frames, paper keepsakes, textile embroidery, and custom
              portraits.
            </p>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6D1836]">
                Handmade • Heartmade • Heartfelt
              </p>
              <p className="font-handwritten text-xl text-[#3E2F27]">
                Crafted with thought, gifted with heart.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full bg-[#FFF9F5] border border-[#E7C7CC] flex items-center justify-center text-[#7A655C] hover:text-[#6D1836] hover:border-[#6D1836] transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="https://pinterest.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Pinterest"
                className="w-9 h-9 rounded-full bg-[#FFF9F5] border border-[#E7C7CC] flex items-center justify-center text-[#7A655C] hover:text-[#6D1836] hover:border-[#6D1836] transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-full bg-[#FFF9F5] border border-[#E7C7CC] flex items-center justify-center text-[#7A655C] hover:text-[#6D1836] hover:border-[#6D1836] transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Explore Links */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="font-display text-sm font-semibold text-[#3E2F27]">Explore</h4>
            <ul className="space-y-2.5 text-sm text-[#7A655C]">
              <li>
                <Link to="/shop" className="hover:text-[#6D1836] transition-colors">
                  Shop All Works
                </Link>
              </li>
              <li>
                <Link to="/about-us" className="hover:text-[#6D1836] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/custom-orders" className="hover:text-[#6D1836] transition-colors">
                  Custom Orders
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#6D1836] transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-[#6D1836] transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-display text-sm font-semibold text-[#3E2F27]">Studio Care &amp; Policies</h4>
            <ul className="space-y-2.5 text-sm text-[#7A655C]">
              <li>
                <Link to="/policies/shipping" className="hover:text-[#6D1836] transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link to="/policies/returns" className="hover:text-[#6D1836] transition-colors">
                  Return &amp; Damage Policy
                </Link>
              </li>
              <li>
                <Link to="/policies/privacy" className="hover:text-[#6D1836] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/policies/terms" className="hover:text-[#6D1836] transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Studio Letters */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-display text-sm font-semibold text-[#3E2F27]">Studio Letters</h4>
            <p className="text-xs text-[#7A655C] leading-relaxed">
              Occasional notes when fresh resin batches cure, embroidery hoops finish, or custom
              slots open.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#FFF9F5] border border-[#C9A66B]/60 text-xs text-[#3E2F27]">
                <Check className="w-4 h-4 text-[#6D1836] shrink-0" />
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
                  className="min-w-0 flex-1 px-3.5 py-2.5 rounded-xl bg-[#FFF9F5] border border-[#E7C7CC] text-xs text-[#3E2F27] placeholder:text-[#7A655C]/70 focus:outline-none focus:border-[#6D1836]"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="px-3.5 py-2.5 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-[#FFF9F5] transition-colors shrink-0"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#E7C7CC]/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7A655C]">
          <div className="flex items-center gap-4">
            <p>© {new Date().getFullYear()} varniks_atelier. All rights reserved.</p>
            <Link
              to="/admin/login"
              className="text-[#7A655C] hover:text-[#6D1836] underline underline-offset-4 transition-colors"
            >
              Studio Admin
            </Link>
          </div>
          <p className="font-handwritten text-base text-[#6D1836]">
            Crafted with thought, gifted with heart ♡
          </p>
        </div>
      </div>
    </footer>
  );
};
