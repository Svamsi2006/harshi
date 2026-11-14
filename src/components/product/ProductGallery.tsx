import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Maximize2, ZoomIn, ZoomOut, X } from 'lucide-react';
import { ResilientImage } from '../common/ResilientImage';

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ images, productName }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
    setZoomed(false);
  }, [productName]);

  useEffect(() => {
    if (!fullscreen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreen(false);
      if (e.key === 'ArrowRight') setActiveIndex((i) => (i + 1) % images.length);
      if (e.key === 'ArrowLeft') setActiveIndex((i) => (i - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [fullscreen, images.length]);

  const prev = () => setActiveIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setActiveIndex((i) => (i + 1) % images.length);

  return (
    <div className="space-y-4">
      {/* Main Image Frame */}
      <div className="relative aspect-[4/3] sm:aspect-square lg:aspect-[4/3] w-full overflow-hidden rounded-2xl bg-white border border-[#EAE3D5] shadow-warm">
        <AnimatePresence mode="wait">
          <motion.div
            key={images[activeIndex]}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.5 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full overflow-hidden cursor-zoom-in"
            onClick={() => setZoomed((z) => !z)}
          >
            <ResilientImage
              src={images[activeIndex]}
              alt={`${productName} — view ${activeIndex + 1}`}
              fallbackTitle={productName}
              className={`w-full h-full object-cover transition-transform duration-300 ease-out ${
                zoomed ? 'scale-150 cursor-zoom-out' : 'scale-100'
              }`}
            />
          </motion.div>
        </AnimatePresence>

        {/* Controls */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setZoomed((z) => !z)}
            className="p-2.5 rounded-xl bg-white/90 backdrop-blur-xs border border-[#EAE3D5] text-[#2B2623] hover:border-[#C86D51] transition-colors"
            aria-label={zoomed ? 'Zoom out image' : 'Zoom in image'}
          >
            {zoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={() => setFullscreen(true)}
            className="p-2.5 rounded-xl bg-white/90 backdrop-blur-xs border border-[#EAE3D5] text-[#2B2623] hover:border-[#C86D51] transition-colors"
            aria-label="Open fullscreen viewer"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-[#EAE3D5] flex items-center justify-center text-[#2B2623] hover:border-[#C86D51] transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 border border-[#EAE3D5] flex items-center justify-center text-[#2B2623] hover:border-[#C86D51] transition-colors"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {images.map((img, idx) => {
            const active = idx === activeIndex;
            return (
              <button
                key={`${img}-${idx}`}
                type="button"
                onClick={() => {
                  setActiveIndex(idx);
                  setZoomed(false);
                }}
                className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                  active
                    ? 'border-[#C86D51] shadow-xs'
                    : 'border-[#EAE3D5] opacity-75 hover:opacity-100'
                }`}
                aria-label={`View image ${idx + 1} of ${productName}`}
              >
                <ResilientImage
                  src={img}
                  alt={`${productName} thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Fullscreen Lightbox */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-[#2B2623]/92 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-label={`Fullscreen view of ${productName}`}
          >
            <button
              type="button"
              onClick={() => setFullscreen(false)}
              className="absolute top-5 right-5 p-3 rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors"
              aria-label="Close fullscreen viewer"
            >
              <X className="w-5 h-5" />
            </button>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            <div className="max-w-4xl max-h-[85vh] w-full flex flex-col items-center">
              <ResilientImage
                src={images[activeIndex]}
                alt={productName}
                className="max-h-[78vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
              />
              <p className="mt-3 text-sm text-[#FAF7F2]/80">
                {productName} · {activeIndex + 1} / {images.length}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
