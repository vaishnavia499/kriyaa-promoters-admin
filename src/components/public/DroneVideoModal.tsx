import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Play, Pause, Volume2, VolumeX, Maximize2, Sparkles, MapPin, ShieldCheck } from 'lucide-react';

interface DroneVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName?: string;
}

export const DroneVideoModal: React.FC<DroneVideoModalProps> = ({
  isOpen,
  onClose,
  projectName = 'Golden City',
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [activeTimestamp, setActiveTimestamp] = useState('0:45');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-4xl bg-slate-950 border border-emerald-500/30 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Top Header */}
        <div className="bg-[#113B24] p-4 text-white flex items-center justify-between border-b border-[#1E5D32]">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs font-black uppercase tracking-wider text-white">
              4K Aerial Drone Flyover · {projectName}
            </span>
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-[#EAB308] text-slate-950">
              Live Verified
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Canvas Container */}
        <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden group">
          {/* High-res layout video background */}
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=85"
            alt="Drone Flyover"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Cinematic Overlay Scanlines & Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

          {/* Drone Telemetry HUD */}
          <div className="absolute top-4 left-4 font-mono text-[11px] text-emerald-400 space-y-0.5 bg-black/60 backdrop-blur-md px-3 py-2 rounded-xl border border-emerald-500/20">
            <div className="flex items-center gap-2">
              <span className="text-[#EAB308]">ALT: 120m</span>
              <span>·</span>
              <span>GPS: 11.7480° N, 79.7714° E</span>
            </div>
            <div className="text-[10px] text-slate-300">
              Corridor: Cuddalore NH Bypass Link
            </div>
          </div>

          {/* Interactive Landmark Pins on the Flyover */}
          <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center animate-bounce">
            <span className="px-2 py-0.5 rounded bg-[#15803D] text-white text-[10px] font-bold shadow-lg border border-white/20">
              40ft Avenue Road
            </span>
            <div className="w-2 h-2 bg-[#EAB308] rounded-full mt-0.5" />
          </div>

          <div className="absolute top-1/2 right-1/4 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <span className="px-2 py-0.5 rounded bg-[#991B1B] text-white text-[10px] font-bold shadow-lg border border-white/20">
              Grand Entrance Arch
            </span>
            <div className="w-2 h-2 bg-[#EAB308] rounded-full mt-0.5" />
          </div>

          {/* Center Play / Pause Indicator */}
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-16 h-16 rounded-full bg-[#15803D]/90 hover:bg-[#15803D] text-white flex items-center justify-center shadow-2xl transition-transform hover:scale-110 cursor-pointer backdrop-blur-xs border-2 border-white/40"
          >
            {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
          </button>

          {/* Bottom Bar Controls */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs z-10 bg-black/60 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="hover:text-[#EAB308] cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="hover:text-[#EAB308] cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <span className="text-[11px] font-mono text-slate-300">
                01:24 / 03:50 · 4K 60FPS
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-[11px] text-[#EAB308] font-semibold">
                Captured by Rajesh RTR Field Team
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Information Footer */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#15803D] shrink-0" />
            <span>DTCP No. 182/2023 Sanctioned layout ground progress as of 2025.</span>
          </div>

          <a
            href="https://wa.me/919443278899?text=Hello%20Rajesh%20RTR,%20please%20send%20me%20the%20full%20drone%20video%20for%20Golden%20City."
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-1.5 rounded-xl bg-[#25D366] text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#20bd5a] transition-colors"
          >
            <span>Request Full Video on WhatsApp</span>
          </a>
        </div>
      </motion.div>
    </div>
  );
};
