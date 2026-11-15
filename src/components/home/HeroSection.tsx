import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { STUDIO_MEDIA } from '../../data/studioImages';
import { BotanicalSprig, SketchUnderline } from '../common/BotanicalDecorations';
import { ResilientImage } from '../common/ResilientImage';

export const HeroSection: React.FC = () => {
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
                Crafted with Thought,{' '}
                <span className="relative inline-block text-[#6D1836] italic font-normal">
                  Gifted with Heart
                  <SketchUnderline className="absolute -bottom-1.5 left-0 w-full h-3.5 text-[#C9A66B]" />
                </span>
              </h1>

              <p className="font-handwritten text-2xl sm:text-[1.75rem] text-[#7A655C] leading-snug pt-1">
                Resin keepsakes, clay florals, LED frames &amp; portraits... from our little studio ♡
              </p>

              <p className="text-sm sm:text-base text-[#7A655C] max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Premium, warm, Pinterest-inspired handmade creations: botanical resin art, clay
                &amp; pipe cleaner bouquets, glowing LED memory frames, paper keepsakes, textile
                embroidery, personalized accessories, and hand-drawn portraits.
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

          {/* Right Polaroid Collage */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-[520px] h-[360px] sm:h-[430px]">
              {/* Polaroid 1 — Resin Creations */}
              <motion.div
                initial={{ opacity: 0, y: 18, rotate: -6 }}
                animate={{ opacity: 1, y: 0, rotate: -3.5 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-2 sm:left-4 top-3 w-[48%] sm:w-[235px] bg-white p-2.5 pb-4 rounded-sm border border-[#E7C7CC] shadow-polaroid z-10 hover:z-30 hover:scale-[1.02] transition-transform duration-200"
              >
                <Link to="/product/pressed-rose-resin-coaster-set" className="block">
                  <div className="aspect-[3/4] overflow-hidden bg-[#F8EFEA]">
                    <ResilientImage
                      src={STUDIO_MEDIA.resinFloralKeepsake}
                      alt="Pressed rose & gold-leaf resin coasters"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="font-handwritten text-base sm:text-lg text-[#3E2F27] mt-2 text-center leading-none">
                    pressed petals &amp; gold leaf
                  </p>
                </Link>
              </motion.div>

              {/* Polaroid 2 — Clay & Pipe Cleaner Creations */}
              <motion.div
                initial={{ opacity: 0, y: 18, rotate: 6 }}
                animate={{ opacity: 1, y: 0, rotate: 3 }}
                transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="absolute right-2 sm:right-3 top-0 w-[50%] sm:w-[250px] bg-white p-2.5 pb-4 rounded-sm border border-[#E7C7CC] shadow-polaroid z-20 hover:z-30 hover:scale-[1.02] transition-transform duration-200"
              >
                <Link to="/product/velvet-tulip-pipe-cleaner-bouquet" className="block">
                  <div className="aspect-[4/3] overflow-hidden bg-[#F8EFEA]">
                    <ResilientImage
                      src={STUDIO_MEDIA.clayPipecleanerBouquet}
                      alt="Everlasting clay and pipe cleaner tulip bouquet"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="font-handwritten text-base sm:text-lg text-[#3E2F27] mt-2 text-center leading-none">
                    everlasting chenille blooms ♡
                  </p>
                </Link>
              </motion.div>

              {/* Polaroid 3 — Frames & LED Frames */}
              <motion.div
                initial={{ opacity: 0, y: 20, rotate: -2 }}
                animate={{ opacity: 1, y: 0, rotate: -1.5 }}
                transition={{ duration: 0.5, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
                className="absolute right-8 sm:right-14 bottom-1 w-[54%] sm:w-[265px] bg-white p-2.5 pb-4 rounded-sm border border-[#E7C7CC] shadow-polaroid z-20 hover:z-30 hover:scale-[1.02] transition-transform duration-200"
              >
                <Link to="/product/warm-glow-led-memory-frame" className="block">
                  <div className="aspect-[4/3] overflow-hidden bg-[#F8EFEA]">
                    <ResilientImage
                      src={STUDIO_MEDIA.ledMemoryFrame}
                      alt="Warm glow botanical LED memory frame"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="font-handwritten text-base sm:text-lg text-[#3E2F27] mt-2 text-center leading-none">
                    warm LED memory frames
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
