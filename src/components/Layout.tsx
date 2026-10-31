import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Building2,
  Users,
  Settings,
  CheckCircle2,
  Info,
  AlertCircle,
  MapPin,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useApp, NavigationTab } from '../context/AppContext';
import { TopHeaderBar } from './TopHeaderBar';
import { KriyaaLogo } from './KriyaaLogo';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    activeTab,
    setActiveTab,
    settings,
    selectedProject,
    toasts,
    logout,
  } = useApp();

  const navItems: { id: NavigationTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects', icon: MapPin },
    { id: 'properties', label: 'Properties', icon: Building2 },
    { id: 'hotspot-simulator', label: 'Plot Management', icon: Sparkles },
    { id: 'leads', label: 'Leads', icon: Users },
  ];

  return (
    <div className="flex h-screen w-full max-w-full min-w-0 overflow-x-hidden box-border bg-[#F8FAFC] dark:bg-[#0B1811] text-slate-900 dark:text-slate-100 selection:bg-[#15803D] selection:text-white transition-colors duration-200">
      {/* ─────────────────────────────────────────────────────────────
          1. DESKTOP SIDEBAR (Deep Forest Green #113B24)
          ───────────────────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 h-full bg-[#113B24] border-r border-[#1E5D32] justify-between z-40 text-slate-200 select-none transition-colors">
        <div>
          {/* Brand Header */}
          <div className="p-5 border-b border-[#1E5D32]">
            <div className="flex items-center gap-3">
              {/* Logo Icon Box */}
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-[#EAB308]/60 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                <img src={settings.logoUrl || '/kriyaa-logo.jpg'} alt={settings.companyName} className="w-full h-full object-contain" />
              </div>
              <div className="overflow-hidden min-w-0">
                <h1 className="text-sm font-black tracking-wider text-white uppercase truncate">
                  KRIYAA PROMOTERS
                </h1>
                <p className="text-[10px] text-[#EAB308] font-medium truncate mt-0.5">
                  {selectedProject
                    ? `${selectedProject.name} · ${selectedProject.dtcpNumber}`
                    : `${settings.mainProject} · ${settings.dtcpNumber}`}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3.5 space-y-1.5" aria-label="Desktop Sidebar">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full min-h-[46px] px-3.5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-3 transition-all cursor-pointer text-left relative ${
                    isActive
                      ? 'bg-[#15803D] text-white shadow-sm font-bold border-l-4 border-[#EAB308]'
                      : 'text-emerald-100/70 hover:text-white hover:bg-[#164329]'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      isActive ? 'text-[#EAB308]' : 'text-emerald-200/70'
                    }`}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="sidebarActiveIndicator"
                      className="ml-auto w-1.5 h-4 bg-[#EAB308] rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Desktop Sidebar Bottom: View Public Site & Logout Action */}
        <div className="p-4 border-t border-[#1E5D32] mt-auto space-y-1.5">
          <button
            onClick={() => {
              const { setCurrentMode } = (window as any).appCtx || {};
              // Switch to public mode
              logout();
            }}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-[#EAB308] hover:bg-[#0B2516] border border-[#EAB308]/30 transition-colors font-bold text-xs cursor-pointer"
            title="Return to Public Customer Website"
          >
            <Building2 className="w-4 h-4 shrink-0 text-[#EAB308]" />
            <span>Public Customer Website</span>
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-emerald-200/70 hover:text-rose-300 hover:bg-rose-500/15 transition-colors font-medium text-sm cursor-pointer"
            title="Sign Out of Admin Portal"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Logout</span>
          </button>
        </div>
      </aside>


      {/* ─────────────────────────────────────────────────────────────
          2. MAIN CONTENT WRAPPER WITH EXACT SPEC TOP HEADER
          ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 h-full flex flex-col overflow-hidden">
        {/* Top Header Bar (matches exact layout, alignment, and styling requested) */}
        <TopHeaderBar />

        {/* Main Scrollable Content Area */}
        <main className="w-full min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 sm:px-6 md:px-8 pb-24 md:pb-8">
          <div className="max-w-7xl mx-auto w-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. MOBILE BOTTOM NAVIGATION (< 768px, Fixed Bottom)
          Equally divided into 5 equal parts across the screen
          ───────────────────────────────────────────────────────────── */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="grid grid-cols-5 md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#113B24] border-t border-[#1E5D32] px-1 py-2 items-center select-none shadow-2xl text-slate-300 w-full"
      >
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="relative flex flex-col items-center justify-center py-1 px-1 cursor-pointer focus:outline-none transition-colors w-full"
            >
              {isActive && (
                <motion.div
                  layoutId="mobileActiveTabPill"
                  className="absolute inset-0 bg-[#0B2516] border border-[#EAB308]/40 rounded-xl"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <div className="relative z-10 flex flex-col items-center w-full">
                <Icon
                  className={`w-5 h-5 transition-transform duration-150 ${
                    isActive ? 'text-[#EAB308] scale-110' : 'text-slate-300'
                  }`}
                />
                <span
                  className={`text-[10px] tracking-tight mt-0.5 font-semibold transition-colors truncate max-w-full text-center ${
                    isActive ? 'text-[#EAB308] font-bold' : 'text-slate-300'
                  }`}
                >
                  {item.label}
                </span>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Toast Notification Stack */}
      <aside aria-label="Notifications" className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="pointer-events-auto bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2.5 max-w-sm"
            >
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-[#EAB308] shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              <span>{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </aside>
    </div>
  );
};
