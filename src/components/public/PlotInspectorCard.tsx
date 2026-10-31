import React from 'react';
import { motion } from 'motion/react';
import {
  BookmarkCheck,
  Car,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  Compass,
  MapPin,
  CheckCircle2,
  Phone,
  ArrowRight,
  Share2,
} from 'lucide-react';
import { Property, Project } from '../../types';

interface PlotInspectorCardProps {
  plot: Property;
  project: Project;
  isSaved: boolean;
  onToggleSave: (plotId: string) => void;
  onBookCab: (plot: Property) => void;
  onWhatsAppInquiry: (plot: Property) => void;
}

export const PlotInspectorCard: React.FC<PlotInspectorCardProps> = ({
  plot,
  project,
  isSaved,
  onToggleSave,
  onBookCab,
  onWhatsAppInquiry,
}) => {
  const formattedDimensions = plot.plotDimensions
    .replace(/ft/gi, '')
    .replace(/\s*x\s*/gi, ' × ')
    .trim();

  let statusBadgeStyle = 'bg-emerald-100 text-[#15803D] border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300';
  if (plot.status === 'Reserved') {
    statusBadgeStyle = 'bg-amber-100 text-[#CA8A04] border-[#EAB308] dark:bg-amber-950/60 dark:text-amber-300';
  } else if (plot.status === 'Sold') {
    statusBadgeStyle = 'bg-red-100 text-[#991B1B] border-red-300 dark:bg-red-950/60 dark:text-red-300';
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${project.name} · Plot #${plot.plotNumber}`,
        text: `Check out Plot #${plot.plotNumber} in ${project.name} (${plot.plotDimensions}, ₹${(plot.totalPrice / 100000).toFixed(2)}L) by Kriyaa Promoters.`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      onWhatsAppInquiry(plot);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full bg-white dark:bg-[#0B2516] rounded-3xl border-2 border-[#1E5D32] p-5 sm:p-7 shadow-2xl space-y-6 select-none"
    >
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-[#1E5D32]">
        <div className="flex items-center gap-3">
          {/* Plot Number Badge */}
          <div className="w-14 h-14 rounded-2xl bg-[#113B24] border-2 border-[#EAB308] text-white flex flex-col items-center justify-center shadow-md shrink-0">
            <span className="text-[10px] font-bold text-[#EAB308] uppercase tracking-wider">PLOT</span>
            <span className="text-xl font-black leading-none">#{plot.plotNumber}</span>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {plot.title}
              </h3>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusBadgeStyle}`}>
                {plot.status}
              </span>
              {plot.isCornerPlot && (
                <span className="px-2 py-0.5 rounded-md bg-[#CA8A04] text-white text-[10px] font-black">
                  CORNER PLOT
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {project.name} · {project.dtcpNumber} · {plot.address}
            </p>
          </div>
        </div>

        {/* Action Buttons: Save (Heart) & Share */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => onToggleSave(plot.id)}
            className={`min-h-[44px] px-4 py-2 rounded-2xl font-bold text-xs flex items-center gap-2 border transition-all cursor-pointer ${
              isSaved
                ? 'bg-emerald-50 text-[#15803D] border-emerald-400 dark:bg-[#113B24] dark:text-[#EAB308] dark:border-[#EAB308]/60 shadow-sm'
                : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-[#112F1C] dark:text-slate-200 hover:bg-slate-200'
            }`}
            title={isSaved ? 'Remove from My Plots' : 'Add to My Plots'}
          >
            <BookmarkCheck className={`w-4 h-4 ${isSaved ? 'text-[#15803D] dark:text-[#EAB308]' : ''}`} />
            <span>{isSaved ? 'In My Plots' : 'Add to My Plots'}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-[#112F1C] border border-slate-200 dark:border-[#1E5D32] text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer"
            title="Share Plot Details"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid of Key Specifications */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Spec 1: Dimensions */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#112F1C] border border-slate-200 dark:border-[#1E5D32]">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Plot Dimensions
          </span>
          <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-1 block">
            {formattedDimensions} ft
          </span>
          <span className="text-[10px] text-[#15803D] dark:text-emerald-400 font-bold block mt-0.5">
            Standard Rectangular
          </span>
        </div>

        {/* Spec 2: Total Area */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#112F1C] border border-slate-200 dark:border-[#1E5D32]">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Area Extent
          </span>
          <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-1 block">
            {plot.areaSqFt} Sq.Ft
          </span>
          <span className="text-[10px] text-[#CA8A04] dark:text-[#EAB308] font-bold block mt-0.5">
            ({plot.areaCents} Cents)
          </span>
        </div>

        {/* Spec 3: Facing & Road */}
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#112F1C] border border-slate-200 dark:border-[#1E5D32]">
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Vastu Facing
          </span>
          <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-1 block flex items-center gap-1">
            <Compass className="w-4 h-4 text-[#CA8A04]" />
            <span>{plot.facing}</span>
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block mt-0.5">
            Fronting {plot.roadWidth} Road
          </span>
        </div>

        {/* Spec 4: Price Calculation */}
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
          <span className="text-[10px] font-bold text-[#15803D] dark:text-emerald-400 uppercase tracking-wider block">
            Total Price
          </span>
          <span className="text-sm sm:text-lg font-black text-[#15803D] dark:text-emerald-300 mt-0.5 block">
            ₹{(plot.totalPrice / 100000).toFixed(2)} Lakhs
          </span>
          <span className="text-[10px] text-slate-600 dark:text-slate-400 block mt-0.5 font-mono">
            ₹{plot.pricePerSqFt} / sq.ft
          </span>
        </div>
      </div>

      {/* Description & Legal Approval Strip */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#112F1C] border border-slate-200 dark:border-[#1E5D32] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <p className="text-slate-700 dark:text-slate-200 leading-relaxed flex-1">
          {plot.description}
        </p>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2.5 py-1 rounded-md bg-[#113B24] text-[#EAB308] font-bold text-[11px] border border-emerald-500/30 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>DTCP Approved</span>
          </span>
          <span className="px-2.5 py-1 rounded-md bg-[#15803D] text-white font-bold text-[11px]">
            Patta Ready
          </span>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {/* Button 1: Book Free Site Visit */}
        <button
          type="button"
          onClick={() => onBookCab(plot)}
          className="min-h-[48px] px-6 py-3 rounded-2xl bg-[#113B24] hover:bg-[#15803D] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg border border-[#EAB308]/40 transition-all cursor-pointer active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-[#EAB308]" />
          <span>Book Free Site Visit for Plot #{plot.plotNumber}</span>
        </button>

        {/* Button 2: Direct WhatsApp Inquiry to MD Rajesh RTR */}
        <button
          type="button"
          onClick={() => onWhatsAppInquiry(plot)}
          className="min-h-[48px] px-6 py-3 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-lg transition-all cursor-pointer active:scale-95"
        >
          <MessageCircle className="w-4 h-4 fill-white text-[#25D366]" />
          <span>Inquire on WhatsApp (Rajesh RTR)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
