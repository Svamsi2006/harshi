import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { STUDIO_MEDIA } from '../../data/studioImages';
import { PageTransition } from '../../components/common/PageTransition';
import { ResilientImage } from '../../components/common/ResilientImage';
import { BotanicalSprig, OrganicDivider } from '../../components/common/BotanicalDecorations';

export const ArtistStoryPage: React.FC = () => {
  return (
    <PageTransition className="py-10 sm:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20">
        {/* 1. About Us Introduction */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6D1836]">
              Handmade • Heartmade • Heartfelt
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-medium text-[#3E2F27] leading-[1.1] text-balance">
              Crafted with thought, gifted with heart.
            </h1>
            <p className="text-base text-[#7A655C] leading-relaxed">
              Welcome to <strong className="font-medium text-[#3E2F27]">varniks_atelier</strong> —
              a warm, Pinterest-inspired handmade studio dedicated to turning meaningful memories
              into tangible keepsakes. From pressed-flower resin art and soft pipe-cleaner
              bouquets to glowing LED memory frames, layered paper keepsakes, hand-stitched
              embroidery, personalized accessories, and custom portraits, every piece is shaped
              slowly with care.
            </p>
            <p className="font-handwritten text-2xl text-[#6D1836]">
              “The best gifts hold a memory you can hold in your hands.”
            </p>
          </div>

          <div className="lg:col-span-6 relative">
            <div className="bg-white p-3 pb-6 rounded-sm border border-[#E7C7CC] shadow-polaroid rotate-1">
              <div className="aspect-[16/10] overflow-hidden bg-[#F8EFEA]">
                <ResilientImage
                  src={STUDIO_MEDIA.artistStudioDesk}
                  alt="varniks_atelier handmade crafting desk"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="font-handwritten text-xl text-[#3E2F27] mt-3 text-center">
                Inside the studio workbench
              </p>
            </div>
            <BotanicalSprig className="hidden sm:block absolute -right-8 -bottom-8 w-24 h-28 text-[#C9A66B]/45 rotate-12" />
          </div>
        </section>

        <OrganicDivider />

        {/* 2. Our Craft & Purpose */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="bg-white p-3 pb-6 rounded-sm border border-[#E7C7CC] shadow-polaroid -rotate-2">
              <div className="aspect-[4/3] overflow-hidden bg-[#F8EFEA]">
                <ResilientImage
                  src={STUDIO_MEDIA.resinFloralKeepsake}
                  alt="Pressed botanical resin keepsake craftsmanship"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="font-handwritten text-xl text-[#3E2F27] mt-3 text-center">
                Real pressed blooms &amp; golden details
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
            <div className="space-y-3">
              <h2 className="font-display text-2xl sm:text-3xl font-medium text-[#3E2F27]">
                About Us &amp; Our Studio
              </h2>
              <p className="text-sm sm:text-base text-[#7A655C] leading-relaxed">
                What started as handmade birthday hampers and keepsake frames for close friends grew
                into varniks_atelier—a cozy studio where thoughtful gifting replaces rushed,
                mass-made items. Every resin pour cures over 48 hours, every pipe-cleaner tulip is
                hand-twisted petal by petal, and every portrait or photo frame is styled around
                your story.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="font-display text-2xl sm:text-3xl font-medium text-[#3E2F27]">
                Designed for Personal Moments
              </h2>
              <p className="text-sm sm:text-base text-[#7A655C] leading-relaxed">
                Whether you are celebrating an anniversary, graduation, housewarming, or simply
                sending love from afar, our seven signature craft categories bring warmth, blush
                tones, gold accents, and heartfelt detail to every gift box.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Studio Pillars */}
        <section className="bg-[#F8EFEA] border border-[#E7C7CC] rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="max-w-2xl">
            <p className="font-handwritten text-2xl text-[#6D1836]">Our Promise</p>
            <h2 className="font-display text-3xl font-medium text-[#3E2F27] mt-1">
              Premium, Minimal &amp; Heartmade
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <span className="text-xs font-semibold tracking-wider text-[#6D1836]">
                01. Curated Materials
              </span>
              <h3 className="font-display text-xl font-medium text-[#3E2F27]">
                Crystal Resin &amp; Fine Fibers
              </h3>
              <p className="text-sm text-[#7A655C] leading-relaxed">
                We use non-yellowing UV-resistant resin, soft velvet chenille stems, warm LED
                accents, archival cotton paper, and natural linen threads.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold tracking-wider text-[#6D1836]">
                02. Collaborative Custom Orders
              </span>
              <h3 className="font-display text-xl font-medium text-[#3E2F27]">
                Your Idea + Photo
              </h3>
              <p className="text-sm text-[#7A655C] leading-relaxed">
                Share your idea, attach a photo, choose your predicted budget or enter a custom
                price, and approve the studio quote before your order is placed.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold tracking-wider text-[#6D1836]">
                03. Gift-Ready Unboxing
              </span>
              <h3 className="font-display text-xl font-medium text-[#3E2F27]">
                Tucked With Ribbon &amp; Note
              </h3>
              <p className="text-sm text-[#7A655C] leading-relaxed">
                Every parcel arrives wrapped in blush tissue, protective cushioning, and a
                handwritten message card ready to hand straight to someone special.
              </p>
            </div>
          </div>
        </section>

        {/* 4. CTA */}
        <section className="text-center space-y-5 py-4">
          <h2 className="font-display text-3xl sm:text-4xl font-medium text-[#3E2F27]">
            Explore ready creations or customize your own
          </h2>
          <p className="text-sm sm:text-base text-[#7A655C] max-w-lg mx-auto">
            Browse our seven handmade categories or send your custom idea &amp; reference photo to
            our studio waiting list.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#6D1836] hover:bg-[#541129] text-[#FFF9F5] text-sm font-medium transition-colors"
            >
              <span>Shop All Works</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/custom-orders"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-[#E7C7CC] hover:border-[#6D1836] text-sm font-medium text-[#3E2F27] transition-colors"
            >
              <Sparkles className="w-4 h-4 text-[#C9A66B]" />
              <span>Create Custom Order</span>
            </Link>
          </div>
        </section>
      </div>
    </PageTransition>
  );
};
