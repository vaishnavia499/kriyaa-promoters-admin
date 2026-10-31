import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Maximize2,
  ShieldCheck,
  X,
  Camera,
} from 'lucide-react';
import { PUBLIC_GALLERY } from '../../data/publicData';

interface MediaGalleryProps {
  onOpenDroneVideo: () => void;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({ onOpenDroneVideo }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const total = PUBLIC_GALLERY.length;
  const currentItem = PUBLIC_GALLERY[activeIndex];

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % total);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  };

  return (
    <div className="w-full bg-white dark:bg-[#0B2516] rounded-3xl border border-slate-200 dark:border-[#1E5D32] p-4 sm:p-6 shadow-xl select-none">
      {/* Standalone Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#15803D]/10 text-[#15803D] dark:text-emerald-400">
              <Camera className="w-4 h-4" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-[#15803D] dark:text-emerald-400">
              Infrastructure & Site Renders
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
            Golden City Master Infrastructure Showcase
          </h3>
        </div>

        {/* Watch 4K Drone Video Trigger */}
        <button
          type="button"
          onClick={onOpenDroneVideo}
          className="min-h-[42px] px-4 py-2 rounded-2xl bg-[#991B1B] hover:bg-[#7f1616] active:scale-95 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
            <Play className="w-3 h-3 fill-current ml-0.5" />
          </div>
          <span>Watch 4K Drone Video</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          STANDALONE CAROUSEL DISPLAY (With embedded left/right arrows)
          ───────────────────────────────────────────────────────────── */}
      <div className="relative aspect-video sm:aspect-[21/9] w-full rounded-2xl overflow-hidden bg-slate-900 shadow-inner group">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentItem.id}
            src={currentItem.imageUrl}
            alt={currentItem.title}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full h-full object-cover select-none"
          />
        </AnimatePresence>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-2 z-10">
          <span className="px-3 py-1 rounded-full bg-[#113B24]/90 backdrop-blur-md text-[#EAB308] border border-[#EAB308]/50 text-xs font-black shadow-md flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{currentItem.badge}</span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-mono">
            {activeIndex + 1} / {total}
          </span>
        </div>

        {/* Top Right: Fullscreen Action */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
          <button
            type="button"
            onClick={() => setIsFullScreen(true)}
            className="w-9 h-9 rounded-xl bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer"
            title="Expand Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Overlaid Left / Right Navigation Arrows */}
        <button
          type="button"
          onClick={handlePrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/50 hover:bg-black/80 text-white shadow-xl flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs border border-white/20 active:scale-95 z-10"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-black/50 hover:bg-black/80 text-white shadow-xl flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs border border-white/20 active:scale-95 z-10"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Bottom Scrim Caption */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 sm:p-5 text-white z-10 flex flex-col justify-end">
          <div className="max-w-2xl">
            <h4 className="text-sm sm:text-base font-black text-white drop-shadow-sm">
              {currentItem.title}
            </h4>
            <p className="text-xs text-[#EAB308] font-bold mt-0.5">
              {currentItem.subtitle}
            </p>
            <p className="hidden sm:block text-xs text-slate-300 mt-1 leading-relaxed">
              {currentItem.description}
            </p>
          </div>
        </div>
      </div>

      {/* Embedded Slide Indicator Dots */}
      <div className="pt-3 flex items-center justify-center gap-1.5">
        {PUBLIC_GALLERY.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveIndex(idx)}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${
              idx === activeIndex
                ? 'w-6 bg-[#15803D]'
                : 'w-2 bg-slate-200 dark:bg-emerald-950 hover:bg-slate-300'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

      {/* Fullscreen Modal View */}
      {isFullScreen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-between p-4 sm:p-6">
          <div className="w-full max-w-5xl flex items-center justify-between text-white">
            <h4 className="text-sm sm:text-base font-bold">{currentItem.title}</h4>
            <button
              type="button"
              onClick={() => setIsFullScreen(false)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="max-w-5xl w-full max-h-[80vh] flex items-center justify-center my-auto">
            <img
              src={currentItem.imageUrl}
              alt={currentItem.title}
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl"
            />
          </div>

          <div className="text-center text-xs text-slate-400">
            {currentItem.description}
          </div>
        </div>
      )}
    </div>
  );
};
