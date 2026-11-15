import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useStore } from '../../context/StoreContext';
import { BrandMarkGlyph } from './BrandLogo';

interface StudioSplashIntroProps {
  replayTrigger?: number;
}

export const StudioSplashIntro: React.FC<StudioSplashIntroProps> = ({ replayTrigger = 0 }) => {
  const { storeSettings } = useStore();
  const [visible, setVisible] = useState(true);
  const [cardStage, setCardStage] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    setVisible(true);
    setCardStage(0);

    const t1 = window.setTimeout(() => setCardStage(1), 360);
    const t2 = window.setTimeout(() => setCardStage(2), 780);
    const tEnd = window.setTimeout(() => setVisible(false), 2050);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(tEnd);
    };
  }, [replayTrigger]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={`splash-${replayTrigger}`}
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.04,
            transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#FFF9F5] select-none"
          aria-hidden="true"
        >
          {/* Ambient radial atelier glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 50% 42%, rgba(231,199,204,0.45) 0%, rgba(201,166,107,0.14) 38%, rgba(255,249,245,0.98) 76%)',
            }}
          />

          {/* Orbiting Gold Wax Ring */}
          <motion.div
            initial={{ opacity: 0, scale: 0.72, rotate: -18 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-[340px] sm:w-[410px] h-[420px] sm:h-[460px] flex items-center justify-center"
          >
            {/* Back Card 1 — Blush Craft Layer */}
            <motion.div
              initial={{ opacity: 0, y: 50, rotate: -14, scale: 0.84 }}
              animate={{
                opacity: cardStage >= 0 ? 0.9 : 0,
                y: cardStage >= 0 ? 12 : 50,
                x: -18,
                rotate: -7,
                scale: 0.94,
              }}
              transition={{ type: 'spring', stiffness: 190, damping: 20 }}
              className="absolute inset-x-6 top-8 bottom-8 rounded-3xl bg-[#E7C7CC]/75 border border-[#C9A66B]/45 shadow-warm"
            />

            {/* Back Card 2 — Warm Gold Foil Accent Layer */}
            <motion.div
              initial={{ opacity: 0, y: 60, rotate: 16, scale: 0.84 }}
              animate={{
                opacity: cardStage >= 1 ? 0.95 : 0,
                y: cardStage >= 1 ? 4 : 60,
                x: 16,
                rotate: 5.5,
                scale: 0.97,
              }}
              transition={{ type: 'spring', stiffness: 200, damping: 21 }}
              className="absolute inset-x-5 top-6 bottom-6 rounded-3xl bg-[#F8EFEA] border border-[#C9A66B]/70 shadow-warm"
            />

            {/* Front Spotlight Card — Displays Uploaded Custom Logo */}
            <motion.div
              initial={{ opacity: 0, y: 72, scale: 0.82, rotateX: 18 }}
              animate={{
                opacity: cardStage >= 1 ? 1 : 0.65,
                y: cardStage >= 2 ? 0 : 18,
                scale: cardStage >= 2 ? 1.02 : 0.95,
                rotateX: 0,
              }}
              transition={{ type: 'spring', stiffness: 185, damping: 18 }}
              className="relative z-10 w-72 sm:w-80 rounded-3xl bg-white border border-[#C9A66B]/70 px-7 py-9 shadow-[0_24px_60px_-15px_rgba(109,24,54,0.22)] flex flex-col items-center text-center overflow-hidden"
            >
              {/* Subtle Gold Shimmer Sweep */}
              <motion.div
                initial={{ x: '-130%' }}
                animate={{ x: '160%' }}
                transition={{ duration: 1.05, delay: 0.55, ease: 'easeInOut' }}
                className="absolute inset-y-0 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-[#C9A66B]/22 to-transparent pointer-events-none"
              />

              {/* Outer spinning filigree seal around logo */}
              <div className="relative flex items-center justify-center mb-5">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  className="w-28 h-28 rounded-full border border-dashed border-[#C9A66B]/80 flex items-center justify-center"
                />
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.25 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <BrandMarkGlyph
                    logoUrl={storeSettings.logoUrl}
                    className="w-20 h-20"
                    storeName={storeSettings.storeName}
                  />
                </motion.div>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
                className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6D1836]"
              >
                Handmade • Heartmade • Heartfelt
              </motion.p>

              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.52 }}
                className="font-display text-3xl font-semibold text-[#3E2F27] mt-2 tracking-tight"
              >
                {storeSettings.storeName || 'varniks_atelier'}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.45, delay: 0.72 }}
                className="font-handwritten text-xl text-[#8C6B3F] mt-1.5"
              >
                Crafted with thought, gifted with heart ♡
              </motion.p>

              {/* Progress ribbon bar */}
              <div className="w-32 h-1 rounded-full bg-[#F8EFEA] overflow-hidden mt-6">
                <motion.div
                  initial={{ x: '-100%' }}
                  animate={{ x: '0%' }}
                  transition={{ duration: 1.65, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full w-full bg-gradient-to-r from-[#6D1836] via-[#C9A66B] to-[#6D1836]"
                />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
