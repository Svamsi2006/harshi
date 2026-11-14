import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, PenTool } from 'lucide-react';
import { STUDIO_MEDIA } from '../../data/studioImages';
import { BotanicalSprig, SketchUnderline } from '../common/BotanicalDecorations';
import { ResilientImage } from '../common/ResilientImage';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 lg:pt-16 lg:pb-20">
      {/* Subtle botanical illustrations behind collage */}
      <BotanicalSprig className="hidden lg:block absolute right-12 top-6 w-32 h-36 text-[#7A9178]/35 rotate-12" />
      <BotanicalSprig className="hidden md:block absolute left-6 bottom-6 w-24 h-28 text-[#C86D51]/25 -rotate-12" />

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
              <p className="text-xs sm:text-sm font-medium tracking-[0.06em] uppercase text-[#7A9178]">
                Independent Art & Handicraft Studio
              </p>

              <h1
                className="font-display text-[clamp(2.5rem,5vw,4.15rem)] font-medium leading-[1.08] tracking-tight text-[#2B2623] text-balance"
              >
                Art that Feels{' '}
                <span className="relative inline-block text-[#C86D51] italic font-normal">
                  Handmade
                  <SketchUnderline className="absolute -bottom-1.5 left-0 w-full h-3.5 text-[#C86D51]/75" />
                </span>
              </h1>

              <p className="font-handwritten text-2xl sm:text-[1.75rem] text-[#6E655F] leading-snug pt-1">
                Sketches, Crafts &amp; More... from our little studio ♡
              </p>

              <p className="text-sm sm:text-base text-[#6E655F] max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Original graphite and charcoal drawings, raw riverbank terracotta sculptures,
                botanical watercolor prints, and woven home pieces crafted slowly by hand.
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
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#C86D51] hover:bg-[#B2593E] text-white text-sm font-medium shadow-warm transition-colors whitespace-nowrap"
              >
                <span>Explore the Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/commission"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-[#F3EDE2] text-[#2B2623] border border-[#EAE3D5] text-sm font-medium transition-colors whitespace-nowrap"
              >
                <PenTool className="w-4 h-4 text-[#C86D51]" />
                <span>Commission Custom Art</span>
              </Link>
            </motion.div>
          </div>

          {/* Right Polaroid Collage */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-[520px] h-[360px] sm:h-[430px]">
              {/* Polaroid 1 — Pencil Sketch */}
              <motion.div
                initial={{ opacity: 0, y: 18, rotate: -6 }}
                animate={{ opacity: 1, y: 0, rotate: -3.5 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-2 sm:left-4 top-3 w-[48%] sm:w-[235px] bg-white p-2.5 pb-4 rounded-sm border border-[#EAE3D5] shadow-polaroid z-10 hover:z-30 hover:scale-[1.02] transition-transform duration-200"
              >
                <Link to="/product/village-life-sketch" className="block">
                  <div className="aspect-[3/4] overflow-hidden bg-[#F3EDE2]">
                    <ResilientImage
                      src={STUDIO_MEDIA.sketchVillageLife}
                      alt="Village Life graphite pencil sketch"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="font-handwritten text-base sm:text-lg text-[#2B2623] mt-2 text-center leading-none">
                    charcoal &amp; quiet mornings
                  </p>
                </Link>
              </motion.div>

              {/* Polaroid 2 — Terracotta Sculpture */}
              <motion.div
                initial={{ opacity: 0, y: 18, rotate: 6 }}
                animate={{ opacity: 1, y: 0, rotate: 3 }}
                transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="absolute right-2 sm:right-3 top-0 w-[50%] sm:w-[250px] bg-white p-2.5 pb-4 rounded-sm border border-[#EAE3D5] shadow-polaroid z-20 hover:z-30 hover:scale-[1.02] transition-transform duration-200"
              >
                <Link to="/product/terracotta-ganesha" className="block">
                  <div className="aspect-[4/3] overflow-hidden bg-[#F3EDE2]">
                    <ResilientImage
                      src={STUDIO_MEDIA.terracottaGanesha}
                      alt="Hand-sculpted terracotta Ganesha"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="font-handwritten text-base sm:text-lg text-[#2B2623] mt-2 text-center leading-none">
                    raw riverbank clay ♡
                  </p>
                </Link>
              </motion.div>

              {/* Polaroid 3 — Watercolor Landscape */}
              <motion.div
                initial={{ opacity: 0, y: 20, rotate: -2 }}
                animate={{ opacity: 1, y: 0, rotate: -1.5 }}
                transition={{ duration: 0.5, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
                className="absolute right-8 sm:right-14 bottom-1 w-[54%] sm:w-[265px] bg-white p-2.5 pb-4 rounded-sm border border-[#EAE3D5] shadow-polaroid z-20 hover:z-30 hover:scale-[1.02] transition-transform duration-200"
              >
                <Link to="/product/serene-lake-print" className="block">
                  <div className="aspect-[4/3] overflow-hidden bg-[#F3EDE2]">
                    <ResilientImage
                      src={STUDIO_MEDIA.watercolorSereneLake}
                      alt="Serene Lake watercolor painting"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="font-handwritten text-base sm:text-lg text-[#2B2623] mt-2 text-center leading-none">
                    cotton rag watercolor
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
