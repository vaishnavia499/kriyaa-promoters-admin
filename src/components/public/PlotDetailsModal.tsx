import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Compass,
  Heart,
  ShieldCheck,
  Landmark,
  MessageCircle,
} from 'lucide-react';
import { Property, Project } from '../../types';

interface PlotDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  plot: Property | null;
  project: Project;
  isSaved: boolean;
  onToggleSave: (plotId: string) => void;
  onBookConsultation: (plot: Property) => void;
  onWhatsAppInquiry?: (plot: Property) => void;
}

export const PlotDetailsModal: React.FC<PlotDetailsModalProps> = ({
  isOpen,
  onClose,
  plot,
  project,
  isSaved,
  onToggleSave,
  onBookConsultation,
  onWhatsAppInquiry,
}) => {
  // ─────────────────────────────────────────────────────────────────
  // Accessibility: 'Esc' key to dismiss & Background scroll lock
  // ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Prevent background scrolling while modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  // Format dimensions (e.g. "30x50" or "30 x 50" -> "30 × 50")
  const rawDim = (plot?.plotDimensions || '')
    .replace(/ft/gi, '')
    .trim();
  const formattedDimensions = rawDim.includes('x')
    ? rawDim.replace(/\s*x\s*/gi, ' × ')
    : rawDim.includes('X')
    ? rawDim.replace(/\s*X\s*/gi, ' × ')
    : rawDim;

  // Status Badge Styling (Available: Emerald, Reserved: Amber, Sold: Red)
  let statusBadgeConfig = {
    label: 'Available',
    classes: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/40',
  };
  if (plot?.status === 'Reserved') {
    statusBadgeConfig = {
      label: 'On Hold / Reserved',
      classes: 'bg-amber-500/15 text-amber-700 dark:text-[#EAB308] border-amber-500/40',
    };
  } else if (plot?.status === 'Sold') {
    statusBadgeConfig = {
      label: 'Sold Out',
      classes: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/40',
    };
  }

  // Estimated Monthly EMI (~8.5% p.a. for 20 years: ~₹790 per Lakh)
  const estimatedEmi = plot ? Math.round((plot.totalPrice / 100000) * 790) : 14200;

  // Road & Facing Tag
  const directionFacing = plot?.facing || 'East';
  const roadWidthStr = plot?.roadWidth || '40ft Main Road';

  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && plot && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm select-none">
          {/* Backdrop tap to dismiss */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 cursor-pointer"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal Dialog Card (Centered max-w-md on desktop, bottom-sheet on mobile) */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: 'spring', damping: 26, stiffness: 340 }}
            className="relative w-full max-w-md bg-white dark:bg-[#0B2516] rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-[#1E5D32] shadow-2xl p-5 sm:p-6 z-10 max-h-[92vh] overflow-y-auto space-y-4"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="plot-modal-heading"
          >
            {/* ─────────────────────────────────────────────────────────────
                1. TOP HEADER & ACCESSIBLE CLOSE (✕)
                ───────────────────────────────────────────────────────────── */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-[#1E5D32]/80 pb-3">
              <div>
                {/* Heading & Status Badge */}
                <div className="flex items-center gap-2 flex-wrap">
                  <h3
                    id="plot-modal-heading"
                    className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white"
                  >
                    Plot #{plot.plotNumber}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border ${statusBadgeConfig.classes}`}
                  >
                    {statusBadgeConfig.label}
                  </span>
                </div>

                {/* Compass Direction Tag */}
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-[#EAB308] mt-1.5 bg-slate-100 dark:bg-[#112F1C] px-2.5 py-1 rounded-xl border border-slate-200 dark:border-[#1E5D32] w-fit">
                  <Compass className="w-3.5 h-3.5 text-[#CA8A04] shrink-0" />
                  <span>🧭 {directionFacing} Facing · {roadWidthStr}</span>
                </div>
              </div>

              {/* Top-Right Accessible Close Icon (44x44px Tap Target) */}
              <button
                type="button"
                onClick={onClose}
                className="min-w-[44px] min-h-[44px] w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-[#112F1C] dark:hover:bg-[#184428] text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 border border-slate-200/80 dark:border-[#1E5D32]"
                title="Close (Esc)"
                aria-label="Close dialog"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* ─────────────────────────────────────────────────────────────
                2. PLOT SPECIFICATIONS GRID (Clean 2x2 & Highlight Rows)
                ───────────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* 1. Dimensions */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#112F1C] border border-slate-100 dark:border-[#1E5D32]/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Dimensions
                </span>
                <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5 block font-mono">
                  {formattedDimensions ? `${formattedDimensions} ft` : '30 × 50 ft'}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block mt-0.5">
                  Standard Parcel
                </span>
              </div>

              {/* 2. Total Area */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#112F1C] border border-slate-100 dark:border-[#1E5D32]/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Area
                </span>
                <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5 block">
                  {plot.areaSqFt?.toLocaleString('en-IN')} sq.ft
                </span>
                <span className="text-[10px] text-amber-600 dark:text-[#EAB308] font-bold block mt-0.5">
                  ({plot.areaCents} Cents)
                </span>
              </div>

              {/* 3. Price per Sq.Ft */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#112F1C] border border-slate-100 dark:border-[#1E5D32]/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Price per Sq.Ft
                </span>
                <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5 block">
                  ₹{plot.pricePerSqFt?.toLocaleString('en-IN') || '1,200'} / sq.ft
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">
                  Govt Sanctioned
                </span>
              </div>

              {/* 4. Total Investment */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#112F1C] border border-slate-100 dark:border-[#1E5D32]/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Investment
                </span>
                <span className="text-sm sm:text-base font-black text-[#15803D] dark:text-emerald-400 mt-0.5 block">
                  ₹{plot.totalPrice?.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block mt-0.5">
                  ₹{(plot.totalPrice / 100000).toFixed(2)} Lakhs
                </span>
              </div>
            </div>

            {/* 5. Estimated EMI Banner */}
            <div className="p-3 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#113B24] border border-[#EAB308]/60 flex items-center justify-center text-[#EAB308] shrink-0">
                  <Landmark className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                    Estimated EMI
                  </span>
                  <span className="text-sm font-black text-slate-900 dark:text-white">
                    ₹{estimatedEmi.toLocaleString('en-IN')} / month
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-extrabold text-[#15803D] dark:text-emerald-300 text-right">
                Pre-approved by SBI / HDFC
              </span>
            </div>

            {/* 6. Legal Approval Tag */}
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-[#112F1C] border border-slate-100 dark:border-[#1E5D32]/60 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-bold text-[11px]">
                  {project.dtcpNumber || 'DTCP No. 182/2023'} · Clear Patta Ready
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-[#113B24] text-[#EAB308] text-[9px] font-black border border-[#EAB308]/30 shrink-0">
                RERA READY
              </span>
            </div>

            {/* ─────────────────────────────────────────────────────────────
                3. ACTION BUTTONS (Footer of the Pop-up)
                ───────────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {/* Button 1: "♥ Add to Favourite" (or "Saved" toggle) */}
              <button
                type="button"
                onClick={() => onToggleSave(plot.id)}
                className={`min-h-[46px] px-3.5 py-2.5 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center gap-2 border transition-all cursor-pointer active:scale-95 ${
                  isSaved
                    ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 shadow-sm'
                    : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-[#112F1C] dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#184428]'
                }`}
              >
                <Heart
                  className={`w-4 h-4 transition-transform ${
                    isSaved
                      ? 'fill-rose-500 text-rose-500 scale-110'
                      : 'text-slate-500 dark:text-slate-300'
                  }`}
                />
                <span>{isSaved ? '♥ Added to Favourites' : '♥ Add to Favourite'}</span>
              </button>

              {/* Button 2: "Book Consultation →" (Primary Metallic Gold CTA) */}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onBookConsultation(plot);
                }}
                className="min-h-[46px] px-3.5 py-2.5 rounded-2xl bg-[#EAB308] hover:bg-[#CA8A04] text-[#0B2516] font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer"
              >
                <span>Book Consultation →</span>
              </button>
            </div>

            {/* Secondary WhatsApp Direct Inquire */}
            {onWhatsAppInquiry && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onWhatsAppInquiry(plot);
                }}
                className="w-full py-1.5 text-center text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>Or WhatsApp directly with MD Rajesh RTR</span>
              </button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
