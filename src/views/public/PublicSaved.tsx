import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  BookmarkCheck,
  MessageCircle,
  Car,
  Compass,
  ArrowRight,
  Building2,
  Trash2,
  Eye,
  Sparkles,
  FileText,
  MapPin,
  CheckCircle2,
  Download,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Property, PublicTab } from '../../types';
import { PublicFooter } from '../../components/public/PublicFooter';
import { PlotDetailsModal } from '../../components/public/PlotDetailsModal';

interface PublicSavedProps {
  onTabChange: (tab: PublicTab) => void;
  onOpenConsultation: (prefillPlot?: Property) => void;
  onOpenCabBooking: (prefillPlot?: Property, plotNumbersStr?: string) => void;
  onOpenAdminLogin: () => void;
  onInspectPlotInProject?: (plot: Property) => void;
}

export const PublicSaved: React.FC<PublicSavedProps> = ({
  onTabChange,
  onOpenConsultation,
  onOpenCabBooking,
  onOpenAdminLogin,
  onInspectPlotInProject,
}) => {
  const { properties, projects, savedPlotIds, toggleSavePlot, isPlotSaved, settings, showToast } = useApp();
  const [modalPlot, setModalPlot] = useState<Property | null>(null);

  // Selected properties
  const savedPlots = properties.filter((p) => savedPlotIds.includes(p.id));

  // Combined total calculations
  const totalSelectedPrice = savedPlots.reduce((sum, p) => sum + p.totalPrice, 0);
  const totalSelectedSqFt = savedPlots.reduce((sum, p) => sum + p.areaSqFt, 0);
  const plotNumbersSummary = savedPlots.map((p) => `#${p.plotNumber}`).join(', ');

  const handleDownloadBrochure = (plot: Property) => {
    const content = `
========================================================================
             KRIYAA PROMOTERS · GOLDEN CITY PROJECT
                 OFFICIAL PLOT SPECIFICATION SHEET
========================================================================

PLOT IDENTIFICATION:
• Plot Number: #${plot.plotNumber}
• Title: ${plot.title}
• Project Name: ${plot.projectName || 'Golden City'}
• Status: Available

PLOT DIMENSIONS & EXTENT:
• Dimensions: ${plot.plotDimensions}
• Extent: ${plot.areaSqFt} Sq.Ft (${plot.areaCents} Cents)
• Facing: ${plot.facing}
• Frontage Road Width: ${plot.roadWidth}

FINANCIAL OVERVIEW:
• Price per Sq.Ft: ₹${plot.pricePerSqFt}
• Total Plot Price: ₹${(plot.totalPrice / 100000).toFixed(2)} Lakhs (₹${plot.totalPrice.toLocaleString('en-IN')})
• Bank Loan Eligibility: Pre-approved up to 80% with Top Banks (SBI, HDFC, Indian Bank)

LEGAL & STATUTORY APPROVALS:
• DTCP Sanctioned Layout (Sanction No. 182/2023)
• Sub-divided Individual Patta Ready for immediate transfer
• 100% Clear 30-Year Parent Document Title Scrutiny
• RERA Registered

LAYOUT HIGHLIGHTS & INFRASTRUCTURE:
• 40ft & 60ft Heavy Tar Roads with Paver Walkways
• Sweet Potable Ground Water
• Individual Electricity (EB) Line Connection
• Gated Avenue with 24/7 Security & OSR Park Greenery

CONTACT & DIRECT GUIDANCE:
• Managing Director: Rajesh RTR
• Mobile / WhatsApp: +91 94432 78899 / +91 94432 75727
• Email: rajesh@kriyaapromoters.com
• Office Address: No. 7, Kamaraj Salai, Cuddalore, Tamil Nadu 607001
========================================================================
Generated on ${new Date().toLocaleDateString('en-IN')} via Kriyaa Promoters Portal
    `.trim();

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Kriyaa_Promoters_Plot_${plot.plotNumber}_Brochure.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Brochure for Plot #${plot.plotNumber} downloaded!`, 'success');
  };

  const handleCombinedQuotation = () => {
    if (!savedPlots.length) return;

    const plotListText = savedPlots
      .map(
        (p, idx) =>
          `${idx + 1}. *Plot #${p.plotNumber} · ${p.title}*\n` +
          `   • Layout: ${p.projectName || 'Golden City'}\n` +
          `   • Dimensions: ${p.plotDimensions} | Extent: ${p.areaSqFt} sq.ft (${p.areaCents} Cts)\n` +
          `   • Facing: ${p.facing} | Road Width: ${p.roadWidth}\n` +
          `   • Pricing: ₹${(p.totalPrice / 100000).toFixed(2)} Lakhs (₹${p.pricePerSqFt}/sq.ft)\n` +
          `   • Approvals: ${p.approvals.join(', ')}`
      )
      .join('\n\n');

    const totalLakhs = (totalSelectedPrice / 100000).toFixed(2);

    const message =
      `📋 *${settings.companyName.toUpperCase()} · COMBINED PLOT QUOTATION REQUEST*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `👤 *Customer Selected Plots (${savedPlots.length} Units)*:\n\n` +
      `${plotListText}\n\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `💰 *Total Estimated Investment: ₹${totalLakhs} Lakhs*\n` +
      `📜 *100% Clear Title · Sub-divided Individual Patta Ready*\n` +
      `🏛️ *DTCP Sanctioned & Pre-Approved by 5+ Top Banks (Up to 80% Loan)*\n` +
      `🚗 *Free Doorstep Cab Site Inspection Requested*\n` +
      `📞 Sent direct to MD Rajesh RTR (+91 94432 78899)`;

    window.open(`https://wa.me/919443278899?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleIndividualWhatsApp = (plot: Property) => {
    const text =
      `🏡 *${settings.companyName} · Selected Plot Inquiry*\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `📍 *Plot #${plot.plotNumber} · ${plot.title}*\n` +
      `📐 Dimensions: *${plot.plotDimensions}*\n` +
      `📏 Extent: *${plot.areaSqFt} sq.ft (${plot.areaCents} Cts)*\n` +
      `🧭 Facing: *${plot.facing}*\n` +
      `🛣️ Road Width: *${plot.roadWidth}*\n` +
      `💰 Total Price: *₹${(plot.totalPrice / 100000).toFixed(2)} Lakhs*\n` +
      `📞 Promoter Contact: Rajesh RTR (+91 94432 78899)\n` +
      `I would like to schedule a free site visit or check parent document clearance.`;

    window.open(`https://wa.me/919443278899?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] dark:bg-[#081B10] text-slate-900 dark:text-slate-100 flex flex-col justify-between select-none">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-10 w-full space-y-6 sm:space-y-8">
        {/* ─────────────────────────────────────────────────────────────
            1. TOP TITLE
            ───────────────────────────────────────────────────────────── */}
        <div className="text-center max-w-3xl mx-auto py-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            My Favourite plot
          </h1>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            2. ACTION-DRIVEN SUMMARY CARD (When plots > 0)
            ───────────────────────────────────────────────────────────── */}
        {savedPlots.length > 0 && (
          <div className="w-full max-w-md mx-auto rounded-[28px] bg-gradient-to-b from-[#092615] via-[#061F11] to-[#04140B] border border-emerald-900/60 p-5 sm:p-6 shadow-2xl text-left space-y-4 text-white">
            {/* Top Indicator */}
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308] shadow-[0_0_8px_#EAB308]" />
              <span className="text-xs font-black text-[#34D399] tracking-wider uppercase">
                DIRECT SITE INSPECTION
              </span>
            </div>

            {/* Shortlisted Pill */}
            <div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#072413] border border-[#EAB308]/60 text-[#EAB308] text-[11px] font-black shadow-xs">
                <span>★</span>
                <span>{savedPlots.length} PLOT{savedPlots.length > 1 ? 'S' : ''} SHORTLISTED</span>
              </span>
            </div>

            {/* Total Estimated Investment */}
            <div className="pt-1">
              <span className="text-[11px] font-black text-[#34D399] tracking-wider uppercase block">
                TOTAL ESTIMATED INVESTMENT
              </span>
              <div className="text-3xl sm:text-4xl font-black text-[#FACC15] tracking-tight mt-1">
                ₹{(totalSelectedPrice / 100000).toFixed(2)} Lakhs
              </div>
              <div className="mt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#052112] border border-emerald-700/60 text-[#34D399] text-xs font-bold shadow-xs">
                  <span>●</span>
                  <span>{totalSelectedSqFt.toLocaleString('en-IN')} Sq.Ft Total Extent</span>
                </span>
              </div>
            </div>

            {/* VIP Doorstep Site Visit Concierge Box */}
            <div className="bg-[#03130A] border border-emerald-900/80 rounded-2xl p-4 flex items-center gap-3.5 shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-[#061A0E] border border-[#EAB308] flex items-center justify-center text-[#EAB308] shrink-0 shadow-sm">
                <Car className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-[#EAB308] uppercase tracking-wide">
                    VIP SITE VISIT CONCIERGE
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mt-1">
                  Complimentary guided site inspection across{' '}
                  <strong className="text-[#EAB308] font-bold">Cuddalore &amp; Pondicherry</strong>{' '}
                  personally arranged by <strong className="text-white font-bold">MD Rajesh RTR</strong>.
                </p>
              </div>
            </div>

            {/* Proceed to Free Site Visit Button */}
            <button
              type="button"
              id="btn-proceed-site-visit"
              onClick={() => onOpenCabBooking(savedPlots[0], plotNumbersSummary)}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#D97706] via-[#EAB308] to-[#CA8A04] hover:brightness-105 active:scale-95 text-slate-950 font-black shadow-xl shadow-amber-500/10 transition-all cursor-pointer flex items-center justify-center gap-3"
            >
              <Car className="w-5 h-5 text-slate-950 shrink-0" />
              <div className="flex flex-col items-center">
                <span className="text-xs sm:text-sm font-black tracking-wider uppercase">
                  PROCEED TO FREE SITE VISIT ({savedPlots.length} PLOT{savedPlots.length > 1 ? 'S' : ''})
                </span>
                <span className="text-sm font-black leading-none mt-0.5">→</span>
              </div>
            </button>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            3. SELECTED PLOTS GRID OR EMPTY STATE
            ───────────────────────────────────────────────────────────── */}
        {savedPlots.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-16 px-6 bg-white dark:bg-[#0B2516] rounded-3xl border border-slate-200 dark:border-[#1E5D32] shadow-sm space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#15803D] dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
              <BookmarkCheck className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                No plots selected yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Browse our DTCP-sanctioned layouts and bookmark plots to review measurements, road widths, and arrange a complimentary cab site visit.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onTabChange('projects')}
              className="min-h-[46px] px-6 py-2.5 rounded-xl bg-[#15803D] hover:bg-[#113B24] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 mx-auto shadow-md transition-all cursor-pointer active:scale-95"
            >
              <Building2 className="w-4 h-4" />
              <span>Browse Master Plans &amp; Plots</span>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedPlots.map((plot) => (
                <motion.div
                  key={plot.id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="bg-white dark:bg-[#0B2516] rounded-3xl border border-slate-200 dark:border-[#1E5D32] overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  {/* Image & Plot Badge */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                    <img
                      src={plot.images[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80'}
                      alt={plot.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-[#113B24] text-[#EAB308] border border-[#EAB308]/40 text-xs font-black shadow-md flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#EAB308]" />
                        <span>Plot #{plot.plotNumber}</span>
                      </span>

                      <button
                        type="button"
                        onClick={() => toggleSavePlot(plot.id)}
                        className="w-9 h-9 rounded-full bg-black/60 hover:bg-rose-950 text-slate-300 hover:text-rose-400 flex items-center justify-center backdrop-blur-md transition-colors cursor-pointer border border-white/20"
                        title="Remove Plot from Selected List"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Bottom Title on Image */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3 className="text-base font-black truncate">{plot.title}</h3>
                      <p className="text-[11px] text-[#EAB308] font-semibold">{plot.projectName || 'Golden City'}</p>
                    </div>
                  </div>

                  {/* Specs Body */}
                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#112F1C] border border-slate-100 dark:border-[#1E5D32]/50">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Dimensions</span>
                        <span className="font-black text-slate-900 dark:text-white mt-0.5 block font-mono">
                          {plot.plotDimensions}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#112F1C] border border-slate-100 dark:border-[#1E5D32]/50">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Extent</span>
                        <span className="font-black text-slate-900 dark:text-white mt-0.5 block">
                          {plot.areaSqFt} Sq.Ft ({plot.areaCents} Cts)
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#112F1C] border border-slate-100 dark:border-[#1E5D32]/50">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Facing</span>
                        <span className="font-black text-slate-900 dark:text-white mt-0.5 block flex items-center gap-1">
                          <Compass className="w-3.5 h-3.5 text-[#CA8A04] dark:text-[#EAB308]" />
                          <span>{plot.facing}</span>
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#112F1C] border border-slate-100 dark:border-[#1E5D32]/50">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Road Width</span>
                        <span className="font-black text-slate-900 dark:text-white mt-0.5 block">
                          {plot.roadWidth} Road
                        </span>
                      </div>
                    </div>

                    {/* Price Banner */}
                    <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-[#15803D] dark:text-emerald-400 uppercase block">Total Price</span>
                        <span className="text-base font-black text-[#15803D] dark:text-emerald-300">
                          ₹{(plot.totalPrice / 100000).toFixed(2)} Lakhs
                        </span>
                      </div>
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        ₹{plot.pricePerSqFt}/sq.ft
                      </span>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-2 flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => handleDownloadBrochure(plot)}
                        className="w-full min-h-[42px] rounded-xl bg-gradient-to-r from-[#15803D] to-[#113B24] hover:brightness-110 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95 border border-emerald-600/40"
                      >
                        <Download className="w-4 h-4 text-[#EAB308]" />
                        <span>Download Brochure</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleIndividualWhatsApp(plot)}
                        className="w-full min-h-[44px] rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer active:scale-95"
                      >
                        <MessageCircle className="w-4 h-4 fill-white" />
                        <span>1-Tap WhatsApp Consultation</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setModalPlot(plot)}
                        className="w-full min-h-[40px] rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#112F1C] dark:hover:bg-[#184428] text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        <span>View Plot Details & Specs</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Bottom Checkout CTA Reminder (If more than 1 plot) */}
            {savedPlots.length > 1 && (
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => onOpenCabBooking(savedPlots[0], plotNumbersSummary)}
                  className="w-full sm:w-auto min-h-[50px] px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#EAB308] via-[#FACC15] to-[#CA8A04] hover:brightness-110 active:scale-95 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-[#EAB308]/25 transition-all cursor-pointer"
                >
                  <Car className="w-4 h-4 shrink-0" />
                  <span>Proceed to Free Site Visit ({savedPlots.length} Plots) →</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Interactive Plot Details Popup Modal */}
        {modalPlot && (
          <PlotDetailsModal
            isOpen={modalPlot !== null}
            onClose={() => setModalPlot(null)}
            plot={modalPlot}
            project={projects.find((p) => p.id === modalPlot.projectId) || projects[0]}
            isSaved={isPlotSaved(modalPlot.id)}
            onToggleSave={(id) => toggleSavePlot(id)}
            onBookConsultation={(plot) => {
              setModalPlot(null);
              onOpenConsultation(plot);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <PublicFooter
        onTabChange={onTabChange}
        onOpenConsultation={onOpenConsultation}
        onOpenAdminLogin={onOpenAdminLogin}
      />
    </div>
  );
};
