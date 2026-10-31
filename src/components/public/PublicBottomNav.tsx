import React from 'react';
import { motion } from 'motion/react';
import { Home, MapPin, BookmarkCheck, PhoneCall } from 'lucide-react';
import { PublicTab } from '../../types';

interface PublicBottomNavProps {
  activeTab: PublicTab;
  onTabChange: (tab: PublicTab) => void;
  savedCount: number;
}

export const PublicBottomNav: React.FC<PublicBottomNavProps> = ({
  activeTab,
  onTabChange,
  savedCount,
}) => {
  const tabs: {
    id: PublicTab;
    label: string;
    icon: React.FC<{ className?: string }>;
  }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'projects', label: 'Projects', icon: MapPin },
    { id: 'saved', label: 'My Plots', icon: BookmarkCheck },
    { id: 'contact', label: 'Contact', icon: PhoneCall },
  ];

  const handleTabClick = (tab: PublicTab) => {
    onTabChange(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#113B24] border-t border-[#1E5D32] shadow-2xl safe-area-bottom select-none"
    >
      <div className="grid grid-cols-4 h-16 max-w-md mx-auto px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              className="min-h-[44px] flex flex-col items-center justify-center relative py-1 transition-colors cursor-pointer"
            >
              {/* Active Indicator Top Pill */}
              {isActive && (
                <motion.div
                  layoutId="mobileBottomNavActive"
                  className="absolute top-0 w-8 h-1 bg-[#EAB308] rounded-b-full shadow-sm"
                />
              )}

              {/* Icon Container with Badge */}
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive
                      ? 'text-[#EAB308] scale-110'
                      : 'text-emerald-200/70 hover:text-white'
                  } ${tab.id === 'saved' && savedCount > 0 && isActive ? 'fill-[#EAB308]' : ''}`}
                />

                {tab.id === 'saved' && savedCount > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-[#991B1B] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white/40 shadow-xs">
                    {savedCount}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] mt-1 font-bold tracking-tight ${
                  isActive ? 'text-[#EAB308]' : 'text-emerald-200/70'
                }`}
              >
                {tab.id === 'saved' && savedCount > 0 ? `My Plots (${savedCount})` : tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
