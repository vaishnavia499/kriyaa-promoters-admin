import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Award } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => onComplete(), 3400);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className="fixed inset-0 z-[100] w-screen h-screen bg-[#03150B] flex flex-col items-center justify-center p-6 select-none overflow-hidden"
    >
      {/* ─────────────────────────────────────────────────────────────
          1. TECHNICAL GRID BACKGROUND & RADIAL GLOW
          ───────────────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(22, 163, 74, 0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(22, 163, 74, 0.35) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />

      {/* Ambient Radial Golden-Emerald Core Glow */}
      <div className="absolute w-[380px] h-[380px] bg-[#15803D]/25 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute w-[240px] h-[240px] bg-[#EAB308]/15 rounded-full blur-[90px] pointer-events-none" />

      {/* ─────────────────────────────────────────────────────────────
          2. CENTER BRAND IDENTITY CLUSTER (EXACT REPLICATION)
          ───────────────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm w-full space-y-6">
        {/* Animated Rounded White Logo Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative group"
        >
          {/* Subtle Outer Card Glow */}
          <div className="absolute -inset-2 bg-[#EAB308]/30 rounded-[32px] blur-xl opacity-75" />

          {/* White Card matching user screenshot */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-[28px] bg-white shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-2 border-white/80 p-3 sm:p-4 flex items-center justify-center overflow-hidden">
            <motion.img
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              src="/kriyaa-logo.jpg"
              alt="Kriyaa Promoters Logo"
              className="w-full h-full object-contain"
              draggable={false}
            />
          </div>
        </motion.div>

        {/* Company Title & Gold Tagline */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.25 }}
          className="space-y-2.5"
        >
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-[0.22em] drop-shadow-md">
            KRIYAA PROMOTERS
          </h1>

          {/* Tagline with subtle side accents */}
          <div className="flex items-center justify-center gap-2.5">
            <span className="w-6 h-px bg-gradient-to-r from-transparent to-[#EAB308]/60" />
            <p className="text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] text-[#EAB308] drop-shadow-sm">
              YOUR DREAM, OUR PRIORITY
            </p>
            <span className="w-6 h-px bg-gradient-to-l from-transparent to-[#EAB308]/60" />
          </div>
        </motion.div>

        {/* DTCP & RERA Approval Badge Pill */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.45 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#072414]/90 border border-[#166534] shadow-lg text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-emerald-300"
        >
          <Award className="w-3.5 h-3.5 text-[#EAB308] shrink-0" />
          <span>DTCP & RERA APPROVED TOWNSHIPS</span>
        </motion.div>

        {/* Sleek Animated Loading Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="pt-2 w-48 sm:w-56"
        >
          <div className="h-1 w-full bg-slate-900/80 rounded-full overflow-hidden border border-white/10 relative p-0.5">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 2.6, ease: [0.25, 1, 0.5, 1], delay: 0.65 }}
              style={{ transformOrigin: 'left' }}
              className="h-full w-full bg-gradient-to-r from-[#EAB308] via-[#22C55E] to-[#15803D] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.6)]"
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};
