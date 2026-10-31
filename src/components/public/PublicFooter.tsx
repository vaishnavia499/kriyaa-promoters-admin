import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { KriyaaLogo } from '../KriyaaLogo';
import { PublicTab } from '../../types';

interface PublicFooterProps {
  onTabChange?: (tab: PublicTab) => void;
  onOpenConsultation?: () => void;
  onOpenAdminLogin?: () => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = () => {
  return (
    <footer className="w-full bg-[#06180D] border-t border-emerald-950/80 text-slate-200 select-none pt-10 pb-16 px-4">
      <div className="max-w-md mx-auto flex flex-col items-center">
        {/* 1. Official Kriyaa Triangle Logo */}
        <div className="w-16 h-16 rounded-2xl bg-white border-2 border-[#EAB308] p-2 flex items-center justify-center shadow-xl shadow-black/40 overflow-hidden">
          <KriyaaLogo className="w-full h-full object-contain" />
        </div>

        {/* 2. Brand Name & Slogan */}
        <h3 className="text-xl font-black tracking-wide text-white uppercase mt-3.5">
          KRIYAA PROMOTERS
        </h3>
        <p className="italic text-xs font-semibold text-[#EAB308] mt-1">
          &ldquo;Your dream, our priority&rdquo;
        </p>

        {/* 3. Four Contact Info Cards */}
        <div className="w-full space-y-3 mt-6">
          {/* Card 1: Direct Mobile / WhatsApp */}
          <div className="w-full bg-[#04170D] border border-emerald-800/60 rounded-2xl p-3.5 flex items-center gap-3.5 text-left shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-[#061F12] border border-emerald-700/60 flex items-center justify-center text-[#EAB308] shrink-0">
              <Phone className="w-5 h-5 fill-current" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-black text-[#34D399] tracking-wider uppercase block">
                DIRECT MOBILE / WHATSAPP
              </span>
              <a
                href="tel:+919443278899"
                className="text-base font-black text-white hover:text-[#EAB308] transition-colors block leading-tight mt-0.5"
              >
                +91 94432 78899
              </a>
              <a
                href="tel:+919443275727"
                className="text-xs font-bold text-white/90 hover:text-[#EAB308] transition-colors block leading-tight mt-0.5"
              >
                +91 94432 75727
              </a>
            </div>
          </div>

          {/* Card 2: Official Business Email */}
          <div className="w-full bg-[#04170D] border border-emerald-800/60 rounded-2xl p-3.5 flex items-center gap-3.5 text-left shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-[#061F12] border border-emerald-700/60 flex items-center justify-center text-[#EAB308] shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-black text-[#34D399] tracking-wider uppercase block">
                OFFICIAL BUSINESS EMAIL
              </span>
              <a
                href="mailto:rajesh@kriyaapromoters.com"
                className="text-xs sm:text-sm font-black text-white hover:text-[#EAB308] transition-colors block truncate leading-tight mt-0.5"
              >
                rajesh@kriyaapromoters.com
              </a>
              <a
                href="mailto:kriyaapromoters@gmail.com"
                className="text-xs font-semibold text-white/80 hover:text-[#EAB308] transition-colors block truncate leading-tight mt-0.5"
              >
                kriyaapromoters@gmail.com
              </a>
            </div>
          </div>

          {/* Card 3: Registered Office */}
          <div className="w-full bg-[#04170D] border border-emerald-800/60 rounded-2xl p-3.5 flex items-center gap-3.5 text-left shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-[#061F12] border border-emerald-700/60 flex items-center justify-center text-[#EAB308] shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-black text-[#34D399] tracking-wider uppercase block">
                REGISTERED OFFICE
              </span>
              <p className="text-xs font-bold text-white leading-snug mt-0.5">
                No. 7, Kamaraj Salai, Cuddalore, Tamil Nadu 607001 (Opposite Town Hall)
              </p>
            </div>
          </div>

          {/* Card 4: Consultation Support Hours */}
          <div className="w-full bg-[#04170D] border border-emerald-800/60 rounded-2xl p-3.5 flex items-center gap-3.5 text-left shadow-md">
            <div className="w-12 h-12 rounded-2xl bg-[#061F12] border border-emerald-700/60 flex items-center justify-center text-[#EAB308] shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-black text-[#34D399] tracking-wider uppercase block">
                CONSULTATION SUPPORT HOURS
              </span>
              <p className="text-xs sm:text-sm font-black text-white leading-tight mt-0.5">
                Monday to Sunday · 8:00 AM – 8:00 PM
              </p>
            </div>
          </div>
        </div>

        {/* 4. Subtle Divider Line */}
        <div className="w-full h-px bg-emerald-900/60 my-5" />

        {/* 5. Pill Badges (2 rows) */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center justify-center gap-2.5">
            <span className="inline-flex items-center gap-1 px-3.5 py-1 rounded-full bg-[#04170D] border border-[#EAB308]/60 text-[#EAB308] text-xs font-black shadow-xs">
              ✓ DTCP Approved
            </span>
            <span className="inline-flex items-center gap-1 px-3.5 py-1 rounded-full bg-[#04170D] border border-[#EAB308]/60 text-[#EAB308] text-xs font-black shadow-xs">
              ✓ Patta Ready
            </span>
          </div>
          <span className="inline-flex items-center gap-1 px-3.5 py-1 rounded-full bg-[#04170D] border border-[#EAB308]/60 text-[#EAB308] text-xs font-black shadow-xs">
            ✓ RERA Registered
          </span>
        </div>

        {/* 6. Footer Copyright */}
        <div className="mt-5 text-center text-xs text-slate-400 space-y-1">
          <p>© 2026 Kriyaa Promoters. All rights reserved.</p>
          <p className="text-slate-300">
            Managed by <span className="text-[#EAB308] font-bold">Rajesh RTR</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
