import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useStore } from '../../context/StoreContext';
import { BrandMarkGlyph } from './BrandLogo';

interface StudioSplashIntroProps {
  replayTrigger?: number;
}

/**
 * Logo-only full-screen animated reveal on page reload.
 * Strictly displays the animated studio logo — no extra text, cards, or bars.
 */
export const StudioSplashIntro: React.FC<StudioSplashIntroProps> = ({ replayTrigger = 0 }) => {
  const { storeSettings } = useStore();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    const tEnd = window.setTimeout(() => setVisible(false), 1650);
    return () => {
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
            scale: 1.06,
            transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#FFF9F5] select-none"
          aria-hidden="true"
        >
          {/* Animated Logo Only */}
          <motion.div
            initial={{ opacity: 0, scale: 0.55, rotate: -10 }}
            animate={{
              opacity: 1,
              scale: [0.55, 1.08, 1],
              rotate: [-10, 3, 0],
            }}
            transition={{
              duration: 1.05,
              times: [0, 0.65, 1],
              ease: [0.16, 1, 0.3, 1],
            }}
            className="relative flex items-center justify-center"
          >
            {/* Soft breathing glow behind logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: [0, 0.7, 0.4], scale: [0.7, 1.18, 1.04] }}
              transition={{ duration: 1.4, ease: 'easeOut' }}
              className="absolute w-52 h-52 sm:w-64 sm:h-64 rounded-full pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle, rgba(201,166,107,0.28) 0%, rgba(231,199,204,0.18) 45%, rgba(255,249,245,0) 72%)',
              }}
            />

            {/* Delicate animated gold halo ring around logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
              animate={{ opacity: 0.85, scale: 1, rotate: 120 }}
              transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
              className="absolute w-40 h-40 sm:w-48 sm:h-48 rounded-full border border-dashed border-[#C9A66B]/70 pointer-events-none"
            />

            {/* Large crisp studio logo */}
            <motion.div
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 1.4, ease: 'easeInOut' }}
              className="relative z-10 flex items-center justify-center"
            >
              <BrandMarkGlyph
                logoUrl={storeSettings.logoUrl}
                className="w-28 h-28 sm:w-36 sm:h-36 drop-shadow-[0_14px_28px_rgba(109,24,54,0.16)]"
                storeName={storeSettings.storeName}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
