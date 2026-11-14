import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PenTool } from 'lucide-react';
import { STUDIO_IMAGES } from '../../data/products';
import { PageTransition } from '../../components/common/PageTransition';
import { ResilientImage } from '../../components/common/ResilientImage';
import { BotanicalSprig, OrganicDivider } from '../../components/common/BotanicalDecorations';

export const ArtistStoryPage: React.FC = () => {
  return (
    <PageTransition className="py-10 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20">
        {/* 1. Artist Introduction */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <p className="font-handwritten text-2xl text-[#C86D51]">Inside varniks_atelier</p>
            <h1 className="font-display text-4xl sm:text-5xl font-medium text-[#2B2623] leading-[1.1] text-balance">
              A sunlit corner where paper, clay &amp; quiet mornings meet.
            </h1>
            <p className="text-base text-[#6E655F] leading-relaxed">
              Hello, I&apos;m Varnika — an illustrator, ceramicist, and quiet collector of everyday
              textures. `varniks_atelier` began with a single teak desk by a north-facing window,
              a bundle of willow charcoal, and a desire to make objects that carry the warmth of
              human hands into modern homes.
            </p>
            <p className="font-handwritten text-2xl text-[#2B2623]">
              “Nothing leaves the studio until it feels peaceful to hold.”
            </p>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="bg-white p-3 pb-6 rounded-sm border border-[#EAE3D5] shadow-polaroid rotate-1">
              <div className="aspect-[16/10] overflow-hidden bg-[#F3EDE2]">
                <ResilientImage
                  src={STUDIO_IMAGES.studioDesk}
                  alt="Varnika working at the sunlit studio workbench"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="font-handwritten text-xl text-[#2B2623] mt-3 text-center">
                Morning light across our studio workbench
              </p>
            </div>
            <BotanicalSprig className="hidden sm:block absolute -right-8 -bottom-8 w-24 h-28 text-[#7A9178]/40 rotate-12" />
          </div>
        </section>

        <OrganicDivider />

        {/* 2. How the studio started & Inspiration */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="bg-white p-3 pb-6 rounded-sm border border-[#EAE3D5] shadow-polaroid -rotate-2">
              <div className="aspect-[4/3] overflow-hidden bg-[#F3EDE2]">
                <ResilientImage
                  src={STUDIO_IMAGES.artistHands}
                  alt="Artist hands sketching botanical leaves on cotton paper"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="font-handwritten text-xl text-[#2B2623] mt-3 text-center">
                Botanical study on 300 GSM cotton rag
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
            <div className="space-y-3">
              <h2 className="font-display text-2xl sm:text-3xl font-medium text-[#2B2623]">
                How the Studio Started
              </h2>
              <p className="text-sm sm:text-base text-[#6E655F] leading-relaxed">
                After years of sketching architectural courtyards and village pottery markets in
                spiral notebooks, friends began asking for framed pieces for their living rooms.
                In 2024, those travel sketchbooks grew into a full independent craft room—pairing
                graphite drawing with small-batch terracotta firing and collaborations with local
                woodcarvers and jute weavers.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="font-display text-2xl sm:text-3xl font-medium text-[#2B2623]">
                What Inspires Every Piece
              </h2>
              <p className="text-sm sm:text-base text-[#6E655F] leading-relaxed">
                Monsoon rain on red-oxide verandahs, wild marigolds wrapped in newspaper, clay
                kulhads cooling by roadside tea stalls, and the unhurried rhythm of traditional
                Indian craft. Rather than chasing seasonal trends, every collection is built around
                earthy pigments, raw unbleached fibers, and honest materials that age gracefully.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Handmade Philosophy & Creative Process */}
        <section className="bg-[#F3EDE2]/75 border border-[#EAE3D5] rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="max-w-2xl">
            <p className="font-handwritten text-2xl text-[#C86D51]">Our Philosophy</p>
            <h2 className="font-display text-3xl font-medium text-[#2B2623] mt-1">
              Slow Craft Over Mass Production
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <span className="text-xs font-semibold tracking-wider text-[#C86D51]">
                01. Archival Materials
              </span>
              <h3 className="font-display text-xl font-medium text-[#2B2623]">
                Cotton Rag &amp; River Clay
              </h3>
              <p className="text-sm text-[#6E655F] leading-relaxed">
                We draw exclusively on acid-free 300+ GSM cotton paper and sculpt with unrefined
                alluvial clay so artworks last for decades without yellowing or flaking.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold tracking-wider text-[#C86D51]">
                02. Unhurried Editions
              </span>
              <h3 className="font-display text-xl font-medium text-[#2B2623]">
                1-of-1 &amp; Small Batches
              </h3>
              <p className="text-sm text-[#6E655F] leading-relaxed">
                Originals are truly singular. Even our prints and woven homeware are released in
                numbered studio runs—never warehoused in bulk.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold tracking-wider text-[#C86D51]">
                03. Conscious Wrapping
              </span>
              <h3 className="font-display text-xl font-medium text-[#2B2623]">
                Zero Plastic Cushioning
              </h3>
              <p className="text-sm text-[#6E655F] leading-relaxed">
                Every parcel leaves in recycled kraft boxes, honeycomb paper sleeves, jute twine,
                and a wax-stamped studio care card.
              </p>
            </div>
          </div>
        </section>

        {/* 4. CTA */}
        <section className="text-center space-y-5 py-4">
          <h2 className="font-display text-3xl sm:text-4xl font-medium text-[#2B2623]">
            Bring a piece of the studio home
          </h2>
          <p className="text-sm sm:text-base text-[#6E655F] max-w-lg mx-auto">
            Browse available original sketches and sculptures, or collaborate with Varnika on a
            bespoke piece for your space.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#C86D51] hover:bg-[#B2593E] text-white text-sm font-medium transition-colors"
            >
              <span>Explore the Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/commission"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-[#EAE3D5] hover:border-[#C86D51] text-sm font-medium text-[#2B2623] transition-colors"
            >
              <PenTool className="w-4 h-4 text-[#C86D51]" />
              <span>Request a Commission</span>
            </Link>
          </div>
        </section>
      </div>
    </PageTransition>
  );
};
