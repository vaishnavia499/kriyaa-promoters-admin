import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PublicTab, Property } from '../../types';
import { PublicHeader } from '../../components/public/PublicHeader';
import { PublicBottomNav } from '../../components/public/PublicBottomNav';
import { PublicQuickActions } from '../../components/public/PublicQuickActions';
import { PublicHome } from './PublicHome';
import { PublicProjects } from './PublicProjects';
import { PublicSaved } from './PublicSaved';
import { PublicContact } from './PublicContact';
import { FreeConsultationModal } from '../../components/public/FreeConsultationModal';
import { FreeCabModal } from '../../components/public/FreeCabModal';
import { DroneVideoModal } from '../../components/public/DroneVideoModal';
import { AdminLoginModal } from '../../components/public/AdminLoginModal';

export const PublicWebsite: React.FC = () => {
  const {
    savedPlotIds,
    publicTab,
    setPublicTab,
    setIsAuthenticated,
    setCurrentMode,
  } = useApp();

  // Modals state
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [isCabBookingOpen, setIsCabBookingOpen] = useState(false);
  const [isDroneVideoOpen, setIsDroneVideoOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [prefillPlot, setPrefillPlot] = useState<Property | null>(null);
  const [prefillPlotNumbers, setPrefillPlotNumbers] = useState<string | undefined>(undefined);

  const openConsultation = (plot?: Property) => {
    setPrefillPlot(plot || null);
    setIsConsultationOpen(true);
  };

  const openCabBooking = (plot?: Property, plotNumbersStr?: string) => {
    setPrefillPlot(plot || null);
    setPrefillPlotNumbers(plotNumbersStr);
    setIsCabBookingOpen(true);
  };

  const handleAdminLoginSuccess = () => {
    setCurrentMode('admin');
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#081B10] text-slate-900 dark:text-slate-100 overflow-x-hidden min-w-0 box-border">
      {/* ─────────────────────────────────────────────────────────────
          1. PUBLIC HEADER (Deep Forest Green #113B24)
          ───────────────────────────────────────────────────────────── */}
      <PublicHeader
        activeTab={publicTab}
        onTabChange={(tab) => setPublicTab(tab)}
        savedCount={savedPlotIds.length}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onOpenConsultation={() => openConsultation()}
      />

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN TAB CONTENT WITH SAFE BOTTOM CLEARANCE
          ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 w-full pb-20 md:pb-0">
        {publicTab === 'home' && (
          <PublicHome
            onTabChange={(tab) => setPublicTab(tab)}
            onOpenConsultation={openConsultation}
            onOpenCabBooking={openCabBooking}
            onOpenDroneVideo={() => setIsDroneVideoOpen(true)}
            onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
          />
        )}

        {publicTab === 'projects' && (
          <PublicProjects
            onTabChange={(tab) => setPublicTab(tab)}
            onOpenConsultation={openConsultation}
            onOpenCabBooking={openCabBooking}
            onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
          />
        )}

        {publicTab === 'saved' && (
          <PublicSaved
            onTabChange={(tab) => setPublicTab(tab)}
            onOpenConsultation={openConsultation}
            onOpenCabBooking={openCabBooking}
            onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
          />
        )}

        {publicTab === 'contact' && (
          <PublicContact
            onTabChange={(tab) => setPublicTab(tab)}
            onOpenConsultation={openConsultation}
            onOpenCabBooking={openCabBooking}
            onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
          />
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. PERSISTENT QUICK ACTIONS & BOT CLUSTER
          ───────────────────────────────────────────────────────────── */}
      <PublicQuickActions
        onOpenConsultation={() => openConsultation()}
        onOpenCabBooking={() => openCabBooking()}
        onNavigateToProjects={() => setPublicTab('projects')}
      />

      {/* ─────────────────────────────────────────────────────────────
          4. STICKY BOTTOM NAV (<768px Mobile Devices)
          ───────────────────────────────────────────────────────────── */}
      <PublicBottomNav
        activeTab={publicTab}
        onTabChange={(tab) => setPublicTab(tab)}
        savedCount={savedPlotIds.length}
      />

      {/* ─────────────────────────────────────────────────────────────
          5. GLOBAL PUBLIC MODALS
          ───────────────────────────────────────────────────────────── */}
      <FreeConsultationModal
        isOpen={isConsultationOpen}
        onClose={() => setIsConsultationOpen(false)}
        prefillPlot={prefillPlot}
      />

      <FreeCabModal
        isOpen={isCabBookingOpen}
        onClose={() => setIsCabBookingOpen(false)}
        prefillPlot={prefillPlot}
        prefillPlotNumbers={prefillPlotNumbers}
      />

      <DroneVideoModal
        isOpen={isDroneVideoOpen}
        onClose={() => setIsDroneVideoOpen(false)}
      />

      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleAdminLoginSuccess}
      />
    </div>
  );
};
