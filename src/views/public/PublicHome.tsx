import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Building2,
  FileCheck2,
  Landmark,
  Award,
  Star,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Play,
  Maximize2,
  X,
  ChevronDown,
  Box,
} from 'lucide-react';
import { PublicFooter } from '../../components/public/PublicFooter';
import { PUBLIC_GALLERY } from '../../data/publicData';
import { PublicTab } from '../../types';

/* ─────────────────────────────────────────────────────────── */
/* 4 PILLARS DATA */
/* ─────────────────────────────────────────────────────────── */
const TRUST_PILLARS = [
  {
    id: 'pillar-title',
    badge: '100% BANKABLE',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    title: '100% Clear Title & Individual Patta',
    subTag: 'VERIFIED BY TOP LEGAL EXPERTS',
    desc: '30-year parent document scrutiny and clear sub-divided individual Patta registered directly to your name upon registration.',
    icon: 'ShieldCheck',
  },
  {
    id: 'pillar-dtcp',
    badge: 'GOVT APPROVED',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    title: 'DTCP Sanctioned Layouts',
    subTag: null,
    desc: 'Legally sanctioned by Directorate of Town & Country Planning (DTCP No. 182/2023). Complete compliance with road width and public OSR park reserves.',
    icon: 'FileCheck2',
  },
  {
    id: 'pillar-bank',
    badge: '5+ TOP BANKS',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
    title: 'Up to 80% Bank Loan Approved',
    subTag: null,
    desc: 'Pre-sanctioned tie-ups with SBI, HDFC Bank, Indian Bank, and Canara Bank ensuring seamless processing, zero processing delays, and lowest home loan interest rates.',
    icon: 'Landmark',
  },
  {
    id: 'pillar-trust',
    badge: 'VERIFIED',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    title: '12+ Years of Solid Trust & 1,200+ Families',
    subTag: null,
    desc: 'Managed personally by Rajesh RTR with zero broker middlemen. Consistent on-time infrastructure handover and rapid security demarcation on every plot.',
    icon: 'Award',
  },
];

/* ─────────────────────────────────────────────────────────── */
/* VERIFIED TESTIMONIALS DATA */
/* ─────────────────────────────────────────────────────────── */
const TESTIMONIALS = [
  {
    id: 'rev-1',
    name: 'Dr. K. Venkatraman',
    role: 'Senior Physician, Cuddalore GH',
    plotBadge: 'PLOT #42 & #43',
    initials: 'KV',
    quote:
      'We booked our villa plot in Golden City within 24 hours. DTCP documentation was crystal clear with individual Patta. Bank loan sanction within 4 days. Rajesh RTR personally ensured our registration went smooth.',
  },
  {
    id: 'rev-2',
    name: 'Anitha Ramakrishnan',
    role: 'IT Architect, Pondicherry',
    plotBadge: 'PLOT #18 · GOLDEN CITY',
    initials: 'AR',
    quote:
      'The 40ft wide roads and individual EB line were ready on day one. Clean legal scrutiny. Rajesh RTR walked us through the site and helped us register without any broker fees.',
  },
  {
    id: 'rev-3',
    name: 'S. Balasubramaniam',
    role: 'Retired High School Headmaster, Chidambaram',
    plotBadge: 'PLOT #07 · GOLDEN CITY',
    initials: 'SB',
    quote:
      'Rajesh RTR provided all parent deeds going back 32 years for our advocate verification without hesitation. Sweet potable ground water and peaceful residential surroundings.',
  },
];

/* ─────────────────────────────────────────────────────────── */
/* STANDALONE MEDIA & DRONE VIDEO CARD */
/* ─────────────────────────────────────────────────────────── */
interface HeroMediaCardProps {
  onOpenDroneVideo: () => void;
  onTabChange: (tab: PublicTab) => void;
}

const HeroMediaCard: React.FC<HeroMediaCardProps> = ({ onOpenDroneVideo, onTabChange }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const total = PUBLIC_GALLERY.length;
  const current = PUBLIC_GALLERY[activeIndex];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((p) => (p - 1 + total) % total);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((p) => (p + 1) % total);
  };

  return (
    <>
      <div className="w-full h-full flex flex-col bg-[#071A0F] rounded-[26px] border border-emerald-800/50 shadow-2xl overflow-hidden select-none relative group">
        {/* Media Viewport */}
        <div className="relative aspect-[16/10] sm:aspect-video md:aspect-auto md:flex-1 w-full overflow-hidden bg-slate-950 min-h-[260px] md:min-h-[340px]">
          <AnimatePresence mode="wait">
            <motion.img
              key={current.id}
              src={current.imageUrl}
              alt={current.title}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="w-full h-full object-cover select-none"
              draggable={false}
            />
          </AnimatePresence>

          {/* Top-left Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-1 max-w-[70%]">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#071A0F]/90 backdrop-blur-sm text-[#EAB308] border border-[#EAB308]/60 text-[9px] font-black tracking-wide">
              • DTCP SANCTIONED • 40FT BLACKTOP ROADS •
            </span>
            <div className="bg-[#071A0F]/85 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-emerald-800/40">
              <h4 className="text-xs font-black text-white leading-tight">GOLDEN CITY – CUDDALORE</h4>
              <p className="text-[9px] text-[#EAB308] font-bold">DTCP No. 182/2023 · RERA Registered</p>
            </div>
          </div>

          {/* Top-right Slide Counter & Fullscreen */}
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-sm text-white text-[10px] font-mono border border-white/10">
              {activeIndex + 1} / {total}
            </span>
            <button
              type="button"
              onClick={() => setIsFullscreen(true)}
              className="w-7 h-7 rounded-lg bg-black/70 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-sm border border-white/10 transition cursor-pointer"
              title="Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Left Arrow */}
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/55 hover:bg-black/80 text-white border border-white/20 flex items-center justify-center transition active:scale-90 cursor-pointer backdrop-blur-xs"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Right Arrow */}
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/55 hover:bg-black/80 text-white border border-white/20 flex items-center justify-center transition active:scale-90 cursor-pointer backdrop-blur-xs"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Centered Pulse Play Video Button */}
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <button
              type="button"
              onClick={onOpenDroneVideo}
              className="pointer-events-auto w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-white/20 hover:bg-white/30 border-2 border-white flex items-center justify-center backdrop-blur-xs shadow-2xl transition active:scale-90 cursor-pointer group/play"
              title="Watch 4K Drone Tour"
            >
              <span className="absolute w-13 h-13 sm:w-14 sm:h-14 rounded-full border-2 border-white/40 animate-ping opacity-60" />
              <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white fill-white ml-0.5 group-hover/play:scale-110 transition-transform" />
            </button>
          </div>

          {/* Bottom Overlay Bar */}
          <div className="absolute bottom-0 inset-x-0 z-10 bg-gradient-to-t from-black/95 via-black/75 to-transparent pt-10 pb-3 px-3.5 flex items-end justify-between gap-2">
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-black text-white leading-tight">
                Golden City –<br />Cuddalore
              </h3>
              <p className="text-[10px] text-[#EAB308] font-bold mt-0.5">DTCP No. 182/2023 · RERA Registered</p>
              <p className="text-[9.5px] text-slate-300">100% Clear Parent Documents</p>
              <p className="text-xs text-[#EAB308] font-black mt-0.5">₹2,100 / sq.ft</p>
            </div>

            <button
              type="button"
              onClick={() => onTabChange('projects')}
              className="shrink-0 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white hover:bg-slate-100 text-slate-950 font-black text-xs flex items-center gap-1 shadow-xl active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <span>View Layout</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Dot Indicators */}
        <div className="px-4 py-2.5 flex items-center justify-center gap-1.5 bg-[#071A0F]">
          {PUBLIC_GALLERY.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === activeIndex ? 'w-5 bg-[#EAB308]' : 'w-1.5 bg-emerald-950 border border-emerald-800'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Fullscreen Overlay */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/97 flex flex-col items-center justify-between p-4"
          >
            <div className="w-full max-w-5xl flex items-center justify-between text-white pb-3">
              <h4 className="text-sm font-bold">{current.title}</h4>
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-w-5xl w-full flex-1 flex items-center justify-center">
              <img
                src={current.imageUrl}
                alt={current.title}
                className="max-h-[78vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl"
              />
            </div>
            <div className="flex items-center gap-4 pt-4">
              <button
                onClick={handlePrev}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white cursor-pointer hover:bg-white/20"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-white/60 text-xs font-mono">
                {activeIndex + 1} / {total}
              </span>
              <button
                onClick={handleNext}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white cursor-pointer hover:bg-white/20"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

/* ─────────────────────────────────────────────────────────── */
/* MAIN PUBLIC HOME VIEW COMPONENT */
/* ─────────────────────────────────────────────────────────── */
interface PublicHomeProps {
  onTabChange: (tab: PublicTab) => void;
  onOpenConsultation: () => void;
  onOpenCabBooking: () => void;
  onOpenDroneVideo: () => void;
  onOpenAdminLogin: () => void;
}

export const PublicHome: React.FC<PublicHomeProps> = ({
  onTabChange,
  onOpenConsultation,
  onOpenDroneVideo,
}) => {
  const [showAllReviews, setShowAllReviews] = useState(false);
  const visibleReviews = showAllReviews ? TESTIMONIALS : TESTIMONIALS.slice(0, 2);

  return (
    <div className="w-full flex flex-col min-h-screen bg-[#F1F5F9] dark:bg-[#06140B] text-slate-900 dark:text-slate-100 select-none pb-8">
      {/* Responsive Container: Preserves exact mobile layout on < md, expands to full-width real-estate desktop experience on md/lg/xl */}
      <div className="w-full max-w-md md:max-w-7xl mx-auto px-3 sm:px-4 md:px-8 pt-3 md:pt-6 space-y-4 md:space-y-8">

        {/* ════════════════════════════════════════════════════════════
            1 & 2. HERO + 4K DRONE MEDIA HERO (Mobile: Stacked, Desktop: 2-Column Grid)
            ════════════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 lg:gap-8 items-stretch">
          {/* Left Column: Hero Card with Value Proposition & CTA */}
          <div className="md:col-span-7 lg:col-span-7 flex flex-col">
            <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-b from-[#092615] via-[#071F11] to-[#04140B] text-white p-6 sm:p-7 md:p-8 lg:p-10 text-center md:text-left shadow-2xl border border-emerald-900/60 flex-1 flex flex-col justify-between">
              {/* Subtle Ambient Glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#15803D]/20 rounded-full blur-[70px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#EAB308]/15 rounded-full blur-[70px] pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center md:items-start flex-1 justify-between">
                <div>
                  {/* Top Green Welcome Text */}
                  <p className="text-xs sm:text-sm font-black text-[#34D399] tracking-widest uppercase">
                    WELCOME TO KRIYAA PROMOTERS
                  </p>

                  {/* Sub-label with bullet points */}
                  <p className="text-[11px] sm:text-xs font-black text-[#FACC15] tracking-wider uppercase mt-1 flex items-center justify-center md:justify-start gap-1.5">
                    <span>●</span>
                    <span>YOUR DREAM</span>
                    <span>●</span>
                    <span>OUR HIGHEST PRIORITY</span>
                  </p>

                  {/* Main Title */}
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight mt-3 md:mt-4">
                    <span className="text-white block">Your Dream Plot,</span>
                    <span className="text-[#FACC15] block">Our Highest Priority</span>
                  </h1>

                  {/* Subtitle description */}
                  <p className="text-xs sm:text-[13px] md:text-sm lg:text-base text-slate-200/90 leading-relaxed max-w-sm md:max-w-xl mx-auto md:mx-0 mt-3 md:mt-4">
                    DTCP sanctioned villa plots with 100% clear titles, 40ft blacktop roads, potable sweet water, and guaranteed bank loans across Cuddalore &amp; Pondicherry. Personally guided by{' '}
                    <strong className="text-white font-bold">Rajesh RTR</strong>.
                  </p>
                </div>

                <div className="w-full mt-4 md:mt-6">
                  {/* Subtle Divider */}
                  <div className="w-full h-px bg-emerald-900/50 mb-4" />

                  {/* 3 Quick Stat Badges */}
                  <div className="grid grid-cols-3 gap-2.5 md:gap-3.5 w-full">
                    <div className="bg-[#04170D] border border-emerald-800/70 rounded-xl py-3 px-1 text-center shadow-xs">
                      <div className="text-base sm:text-lg md:text-xl font-black text-[#FACC15]">100%</div>
                      <div className="text-[10px] sm:text-xs text-white font-medium mt-0.5">Clear Title</div>
                    </div>
                    <div className="bg-[#04170D] border border-emerald-800/70 rounded-xl py-3 px-1 text-center shadow-xs">
                      <div className="text-base sm:text-lg md:text-xl font-black text-[#FACC15]">DTCP</div>
                      <div className="text-[10px] sm:text-xs text-white font-medium mt-0.5">Approved</div>
                    </div>
                    <div className="bg-[#04170D] border border-emerald-800/70 rounded-xl py-3 px-1 text-center shadow-xs">
                      <div className="text-base sm:text-lg md:text-xl font-black text-[#FACC15]">Up to 80%</div>
                      <div className="text-[10px] sm:text-xs text-white font-medium mt-0.5">Bank Loan</div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row w-full gap-2.5 md:gap-3.5 mt-4">
                    <button
                      type="button"
                      id="btn-get-free-consultation"
                      onClick={onOpenConsultation}
                      className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#D97706] via-[#EAB308] to-[#CA8A04] hover:brightness-105 active:scale-95 text-slate-950 font-black text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 transition cursor-pointer whitespace-nowrap"
                    >
                      <span>GET FREE CONSULTATION</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </button>

                    <button
                      type="button"
                      id="btn-explore-master-plan"
                      onClick={() => onTabChange('projects')}
                      className="flex-1 py-3 px-4 rounded-xl bg-[#051A0E] hover:bg-[#072414] border border-emerald-800/80 text-[#FACC15] font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition cursor-pointer whitespace-nowrap"
                    >
                      <Box className="w-4 h-4 text-[#FACC15]" />
                      <span>Explore 2D / 3D Master Layout</span>
                      <ChevronDown className="w-4 h-4 text-[#FACC15]" />
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Standalone Media & 4K Drone Tour Card */}
          <div className="md:col-span-5 lg:col-span-5 flex flex-col">
            <HeroMediaCard onOpenDroneVideo={onOpenDroneVideo} onTabChange={onTabChange} />
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════
            3. "4 PILLARS OF ABSOLUTE TRUST" SECTION (Responsive Grid)
            ════════════════════════════════════════════════════════════ */}
        <section className="bg-white dark:bg-[#0B2516] rounded-[28px] border border-slate-100 dark:border-emerald-900/40 p-5 sm:p-6 md:p-8 lg:p-10 shadow-xl space-y-4 md:space-y-6 text-center">
          {/* Header */}
          <div className="space-y-1.5 flex flex-col items-center">
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#0B2516] border border-[#EAB308]/60 text-[#EAB308] text-[9.5px] font-black uppercase tracking-wider">
              <Star className="w-3 h-3 fill-current" />
              <span>STATUTORY CREDIBILITY</span>
              <Star className="w-3 h-3 fill-current" />
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              4 Pillars of Absolute Trust
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
              Over 1,200+ families across Cuddalore and Pondicherry choose Rajesh RTR for their dream home plots
            </p>
          </div>

          {/* 4 Cards: Mobile Vertical, Desktop 4-Column Grid */}
          <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-4 lg:gap-5 pt-1 text-left">
            {TRUST_PILLARS.map((pillar) => (
              <div
                key={pillar.id}
                className="bg-white dark:bg-[#081B10] border border-slate-200/80 dark:border-emerald-800/50 rounded-2xl p-4 md:p-5 shadow-xs space-y-2 hover:border-[#EAB308]/50 transition-colors flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-[#0B2516] border border-[#EAB308]/40 flex items-center justify-center text-[#EAB308] shrink-0 font-black">
                        {pillar.icon === 'ShieldCheck' && <ShieldCheck className="w-5 h-5" />}
                        {pillar.icon === 'FileCheck2' && <FileCheck2 className="w-5 h-5" />}
                        {pillar.icon === 'Landmark' && <Landmark className="w-5 h-5" />}
                        {pillar.icon === 'Award' && <Award className="w-5 h-5" />}
                      </div>
                      <div>
                        <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight">
                          {pillar.title}
                        </h3>
                        {pillar.subTag && (
                          <span className="text-[8.5px] font-bold text-slate-400 dark:text-slate-500 tracking-wide">
                            {pillar.subTag}
                          </span>
                        )}
                      </div>
                    </div>

                    <span
                      className={`text-[8.5px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider shrink-0 ${pillar.badgeColor}`}
                    >
                      {pillar.badge}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1 border-t border-slate-100 dark:border-emerald-950">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            4. "1,200+ HAPPY FAMILIES" REVIEWS (Responsive Grid)
            ════════════════════════════════════════════════════════════ */}
        <section className="bg-white dark:bg-[#0B2516] rounded-[28px] border border-slate-100 dark:border-emerald-900/40 p-5 sm:p-6 md:p-8 lg:p-10 shadow-xl space-y-4 md:space-y-6 text-center">
          {/* Header */}
          <div className="space-y-1.5 flex flex-col items-center">
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FEF08A]/60 dark:bg-amber-950/40 border border-[#CA8A04]/40 text-[#854D0E] dark:text-[#EAB308] text-[9.5px] font-black uppercase tracking-wider">
              <Star className="w-3 h-3 fill-current" />
              <span>Verified Buyer Testimonials</span>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              1,200+ Happy Families in Cuddalore &amp; Pondy
            </h2>

            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
              Real experiences from verified homeowners who acquired plots with confidence
            </p>
          </div>

          {/* Review Cards: Mobile Vertical, Desktop 3-Column Grid */}
          <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-3 md:gap-5 pt-1 text-left">
            {(showAllReviews ? TESTIMONIALS : TESTIMONIALS).map((rev, idx) => (
              <div
                key={rev.id}
                className={`bg-white dark:bg-[#081B10] border border-slate-200/80 dark:border-emerald-800/50 rounded-2xl p-4 md:p-5 shadow-xs space-y-2.5 flex flex-col justify-between ${
                  !showAllReviews && idx >= 2 ? 'hidden md:flex' : 'flex'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-[#EAB308] text-[#EAB308]" />
                      ))}
                    </div>
                    <span className="text-[8.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                      VERIFIED PLOT BUYER
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-200 italic leading-relaxed">
                    "{rev.quote}"
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-emerald-950 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#0B2516] border border-[#EAB308]/50 text-[#EAB308] font-black text-xs flex items-center justify-center shrink-0">
                      {rev.initials}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">
                        {rev.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{rev.role}</p>
                    </div>
                  </div>

                  <span className="text-[8.5px] font-black text-[#15803D] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full shrink-0">
                    {rev.plotBadge}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* View More Link (Mobile Only toggle) */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setShowAllReviews(!showAllReviews)}
              className="text-xs font-bold text-[#854D0E] dark:text-[#EAB308] hover:underline cursor-pointer pt-1"
            >
              {showAllReviews ? 'Show Less Reviews ▴' : 'View More Reviews →'}
            </button>
          </div>
        </section>

      </div>

      {/* ════════════════════════════════════════════════════════════
          5. FOOTER
          ════════════════════════════════════════════════════════════ */}
      <div className="mt-8">
        <PublicFooter onTabChange={onTabChange} onOpenConsultation={onOpenConsultation} />
      </div>
    </div>
  );
};
