import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { Product } from '../../types';
import { useStore } from '../../context/StoreContext';
import { STUDIO_MEDIA } from '../../data/studioImages';
import { BotanicalSprig, SketchUnderline } from '../common/BotanicalDecorations';
import { ResilientImage } from '../common/ResilientImage';

interface HeroCardItem {
  id: string;
  slug: string;
  name: string;
  image: string;
}

const FALLBACK_CARDS: HeroCardItem[] = [
  {
    id: 'fallback-1',
    slug: 'pressed-rose-resin-coaster-set',
    name: 'pressed petals & gold leaf',
    image: STUDIO_MEDIA.resinFloralKeepsake,
  },
  {
    id: 'fallback-2',
    slug: 'velvet-tulip-pipe-cleaner-bouquet',
    name: 'everlasting chenille blooms ♡',
    image: STUDIO_MEDIA.clayPipecleanerBouquet,
  },
  {
    id: 'fallback-3',
    slug: 'warm-glow-led-memory-frame',
    name: 'warm LED memory frames',
    image: STUDIO_MEDIA.ledMemoryFrame,
  },
];

function pickRandomThreeProducts(products: Product[]): HeroCardItem[] {
  const valid = products.filter(
    (p) => p.isPublished !== false && Array.isArray(p.images) && Boolean(p.images[0])
  );
  if (valid.length === 0) return FALLBACK_CARDS;

  // Fisher-Yates shuffle so every page reload picks 3 fresh random creations from catalog
  const pool = [...valid];
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const picked: HeroCardItem[] = pool.slice(0, 3).map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    image: p.images[0],
  }));

  while (picked.length < 3) {
    picked.push(FALLBACK_CARDS[picked.length]);
  }
  return picked;
}

export const HeroSection: React.FC = () => {
  const { products } = useStore();
  const [heroCards, setHeroCards] = useState<HeroCardItem[]>(() =>
    pickRandomThreeProducts(products)
  );
  const lastCatalogSignatureRef = useRef<string>(
    products.map((p) => p.id).sort().join('|')
  );

  // Refresh random pick cleanly once remote Supabase products hydrate after initial mount
  useEffect(() => {
    const signature = products.map((p) => p.id).sort().join('|');
    if (signature && signature !== lastCatalogSignatureRef.current) {
      lastCatalogSignatureRef.current = signature;
      setHeroCards(pickRandomThreeProducts(products));
    }
  }, [products]);

  const [card1, card2, card3] = heroCards;

  return (
    <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-16 lg:pb-20">
      <BotanicalSprig className="hidden lg:block absolute right-12 top-6 w-32 h-36 text-[#C9A66B]/40 rotate-12" />
      <BotanicalSprig className="hidden md:block absolute left-6 bottom-6 w-24 h-28 text-[#6D1836]/20 -rotate-12" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          {/* Left Editorial Column */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              <p className="text-xs sm:text-sm font-semibold tracking-[0.14em] uppercase text-[#6D1836]">
                Handmade • Heartmade • Heartfelt
              </p>

              <h1 className="font-display text-[clamp(2.4rem,4.9vw,4.05rem)] font-medium leading-[1.08] tracking-tight text-[#3E2F27] text-balance">
                We Create What You{' '}
                <span className="relative inline-block text-[#6D1836] italic font-normal">
                  Imagine
                  <SketchUnderline className="absolute -bottom-1.5 left-0 w-full h-3.5 text-[#C9A66B]" />
                </span>
              </h1>

              <p className="font-handwritten text-2xl sm:text-[1.75rem] text-[#7A655C] leading-snug pt-1">
                We turn your cherished memories into keepsakes you can feel in your hands ♡
              </p>

              <p className="text-sm sm:text-base text-[#7A655C] max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Every creation is lovingly handcrafted in our studio so the moments closest to your
                heart live on—made with warmth, honesty, and timeless artistry you can trust.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 pt-1"
            >
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-[#FFF9F5] text-sm font-medium shadow-warm transition-colors whitespace-nowrap"
              >
                <span>Shop All Works</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/custom-orders"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-[#F8EFEA] text-[#3E2F27] border border-[#E7C7CC] text-sm font-medium transition-colors whitespace-nowrap"
              >
                <Sparkles className="w-4 h-4 text-[#C9A66B]" />
                <span>Create Custom Order</span>
              </Link>
            </motion.div>
          </div>

          {/* Right Vintage Polaroid Collage — 3 Random Products Refreshed on Every Reload */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-[520px] h-[360px] sm:h-[430px]">
              {/* Polaroid 1 */}
              <motion.div
                initial={{ opacity: 0, y: 18, rotate: -6 }}
                animate={{ opacity: 1, y: 0, rotate: -3.5 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="vintage-polaroid absolute left-2 sm:left-4 top-3 w-[48%] sm:w-[235px] bg-[#FFF9F5] p-2.5 pb-4 rounded-[2px] border border-[#E7C7CC] shadow-polaroid z-10 hover:z-30 hover:scale-[1.02] transition-transform duration-200"
              >
                <span
                  aria-hidden="true"
                  className="vintage-tape -top-2.5 left-1/2 -translate-x-1/2 -rotate-2"
                />
                <Link to={`/product/${card1.slug}`} className="block">
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#F8EFEA] ring-1 ring-inset ring-[#3E2F27]/12">
                    <ResilientImage
                      src={card1.image}
                      alt={card1.name}
                      className="vintage-photo w-full h-full object-cover"
                    />
                    <div aria-hidden="true" className="vintage-vignette" />
                  </div>
                  <p className="font-handwritten text-base sm:text-lg text-[#3E2F27] mt-2 text-center leading-none truncate px-1">
                    {card1.name}
                  </p>
                </Link>
              </motion.div>

              {/* Polaroid 2 */}
              <motion.div
                initial={{ opacity: 0, y: 18, rotate: 6 }}
                animate={{ opacity: 1, y: 0, rotate: 3 }}
                transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="vintage-polaroid absolute right-2 sm:right-3 top-0 w-[50%] sm:w-[250px] bg-[#FFF9F5] p-2.5 pb-4 rounded-[2px] border border-[#E7C7CC] shadow-polaroid z-20 hover:z-30 hover:scale-[1.02] transition-transform duration-200"
              >
                <span
                  aria-hidden="true"
                  className="vintage-tape -top-2.5 left-1/2 -translate-x-1/2 rotate-3"
                />
                <Link to={`/product/${card2.slug}`} className="block">
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#F8EFEA] ring-1 ring-inset ring-[#3E2F27]/12">
                    <ResilientImage
                      src={card2.image}
                      alt={card2.name}
                      className="vintage-photo w-full h-full object-cover"
                    />
                    <div aria-hidden="true" className="vintage-vignette" />
                  </div>
                  <p className="font-handwritten text-base sm:text-lg text-[#3E2F27] mt-2 text-center leading-none truncate px-1">
                    {card2.name}
                  </p>
                </Link>
              </motion.div>

              {/* Polaroid 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20, rotate: -2 }}
                animate={{ opacity: 1, y: 0, rotate: -1.5 }}
                transition={{ duration: 0.5, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
                className="vintage-polaroid absolute right-8 sm:right-14 bottom-1 w-[54%] sm:w-[265px] bg-[#FFF9F5] p-2.5 pb-4 rounded-[2px] border border-[#E7C7CC] shadow-polaroid z-20 hover:z-30 hover:scale-[1.02] transition-transform duration-200"
              >
                <span
                  aria-hidden="true"
                  className="vintage-tape -top-2.5 left-1/2 -translate-x-1/2 -rotate-1"
                />
                <Link to={`/product/${card3.slug}`} className="block">
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#F8EFEA] ring-1 ring-inset ring-[#3E2F27]/12">
                    <ResilientImage
                      src={card3.image}
                      alt={card3.name}
                      className="vintage-photo w-full h-full object-cover"
                    />
                    <div aria-hidden="true" className="vintage-vignette" />
                  </div>
                  <p className="font-handwritten text-base sm:text-lg text-[#3E2F27] mt-2 text-center leading-none truncate px-1">
                    {card3.name}
                  </p>
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
