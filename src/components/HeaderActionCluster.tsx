import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sun,
  Moon,
  User,
  Settings as SettingsIcon,
  LogOut,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface HeaderActionClusterProps {
  variant?: 'mobile' | 'desktop';
}

export const HeaderActionCluster: React.FC<HeaderActionClusterProps> = ({ variant = 'desktop' }) => {
  const { setActiveTab, settings, showToast, logout } = useApp();

  // 1. THEME MODE STATE & PERSISTENCE
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('kriyaa_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('kriyaa_theme', theme);
    } catch (e) {
      console.error('Failed to persist theme:', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    showToast(`Switched to ${nextTheme === 'dark' ? 'Dark' : 'Light'} Mode`, 'info');
  };

  // 2. PROFILE MENU STATE
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    setIsProfileOpen(false);
    logout();
  };

  // Click Outside Listener
  const clusterRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (clusterRef.current && !clusterRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div ref={clusterRef} className="relative flex items-center gap-1.5 sm:gap-2">
      {/* ─────────────────────────────────────────────────────────────
          1. THEME MODE TOGGLE (Sun / Moon)
          ───────────────────────────────────────────────────────────── */}
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        className="w-9 h-9 rounded-lg flex items-center justify-center border transition-all duration-200 shrink-0 cursor-pointer shadow-xs active:scale-95 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-amber-500 dark:text-amber-400"
      >
        <AnimatePresence mode="wait" initial={false}>
          {theme === 'dark' ? (
            <motion.div
              key="sun"
              initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Sun className="w-4 h-4 text-amber-400 fill-amber-400/20" />
            </motion.div>
          ) : (
            <motion.div
              key="moon"
              initial={{ rotate: 90, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -90, scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Moon className="w-4 h-4 text-slate-700 dark:text-slate-100 fill-slate-200/20" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* ─────────────────────────────────────────────────────────────
          2. PROFILE AVATAR & DROPDOWN MENU
          ───────────────────────────────────────────────────────────── */}
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setIsProfileOpen(!isProfileOpen);
          }}
          aria-label="Admin Profile Menu"
          aria-expanded={isProfileOpen}
          title="Profile Menu"
          className={`h-9 w-9 rounded-full flex items-center justify-center transition-all cursor-pointer relative shrink-0 ring-2 ring-[#166534]/50 dark:ring-emerald-500/40 bg-white dark:bg-slate-800 text-[#166534] dark:text-emerald-300 font-extrabold text-xs shadow-xs border border-slate-200 dark:border-slate-700 select-none ${
            isProfileOpen ? 'ring-[#166534] scale-105' : 'hover:ring-[#166534]'
          }`}
        >
          {/* Circular user avatar with admin initials "KP" or photo */}
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt={settings.companyName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-[11px] font-black tracking-tight text-emerald-300">KP</span>
          )}
        </button>

        {/* Profile Dropdown Menu */}
        <AnimatePresence>
          {isProfileOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.16 }}
              className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-24px)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden text-slate-900 dark:text-slate-100"
            >
              {/* Profile Card Header */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-slate-800 border-2 border-emerald-500/60 flex items-center justify-center text-emerald-300 font-extrabold text-sm shrink-0 shadow-sm overflow-hidden">
                  {settings.logoUrl ? (
                    <img
                      src={settings.logoUrl}
                      alt={settings.companyName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>KP</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      Rajesh RTR
                    </h4>
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Super Admin
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1">
                    {settings.businessEmail || 'kriyaapromoters@gmail.com'}
                  </p>
                </div>
              </div>

              {/* Menu Options */}
              <div className="p-2 space-y-1">
                {/* Direct Link to Settings */}
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    setActiveTab('settings');
                  }}
                  className="w-full min-h-[42px] px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <SettingsIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>Business & App Settings</span>
                </button>

                {/* Quick Link to Leads / CRM */}
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    setActiveTab('leads');
                  }}
                  className="w-full min-h-[42px] px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <User className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                  <span>Lead Pipeline & Inquiries</span>
                </button>

                {/* View Public Customer Website */}
                <button
                  type="button"
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                  className="w-full min-h-[42px] px-3 py-2 rounded-xl text-xs font-semibold text-[#CA8A04] dark:text-[#EAB308] hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Public Customer Website</span>
                </button>
              </div>

              {/* Logout Footer */}
              <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full min-h-[40px] px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4 text-red-500" />
                  <span>Quick Logout</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
