import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Building2,
  MapPin,
  ShieldCheck,
  Sparkles,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  TreePine,
  Car,
  Heart,
  BookmarkCheck,
  MessageCircle,
  ExternalLink,
  Eye,
  Award,
  Clock,
  Landmark,
  X,
  Box,
  ChevronLeft,
  ChevronRight,
  Camera,
  FileText,
  Download,
  Droplet,
  Navigation,
  Train,
  Plane,
  GraduationCap,
  HeartPulse,
  ShoppingBag,
  FolderOpen,
  Compass,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Project, Property, LayoutDisplayMode, PropertyStatus, PublicTab } from '../../types';
import { MasterLayoutViewer } from '../../components/public/MasterLayoutViewer';
import { PlotInspectorCard } from '../../components/public/PlotInspectorCard';
import { PlotDetailsModal } from '../../components/public/PlotDetailsModal';
import { PublicFooter } from '../../components/public/PublicFooter';

interface PublicProjectsProps {
  onTabChange: (tab: PublicTab) => void;
  onOpenConsultation: (prefillPlot?: Property) => void;
  onOpenCabBooking: (prefillPlot?: Property) => void;
  onOpenAdminLogin: () => void;
  initialViewingProjectId?: string | null;
}

export const PublicProjects: React.FC<PublicProjectsProps> = ({
  onTabChange,
  onOpenConsultation,
  onOpenCabBooking,
  onOpenAdminLogin,
  initialViewingProjectId,
}) => {
  const {
    projects,
    properties,
    savedPlotIds,
    toggleSavePlot,
    isPlotSaved,
    settings,
    showToast,
    isLoadingBackend,
    backendError,
    refreshBackendData,
  } = useApp();

  // Full-screen project view state (null = catalog list, string = specific project full screen)
  const [activeProjectId, setActiveProjectId] = useState<string | null>(
    initialViewingProjectId || null
  );

  // Top tab switcher inside full screen project view:
  // Tab 1: 'details' (Plot Details & Full Project Overview Showcase)
  // Tab 2: 'layout' (Interactive Master Layout)
  // Tab 3: 'table' (Plot Inventory Table & Filter)
  const [projectSubTab, setProjectSubTab] = useState<'details' | 'layout' | 'table'>('details');

  // Hero Media Card Carousel slide index
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);

  // Plot Details Modal state
  const [isPlotModalOpen, setIsPlotModalOpen] = useState(false);

  // Master Layout Display Mode (topdown | blueprint | isometric | satellite)
  const [displayMode, setDisplayMode] = useState<LayoutDisplayMode>('topdown');

  // Currently inspected plot in the project view
  const [inspectedPlotId, setInspectedPlotId] = useState<string | null>(null);

  // Table filter controls for Tab 3
  const [tableSearchQuery, setTableSearchQuery] = useState('');
  const [tableStatusFilter, setTableStatusFilter] = useState<string>('All');
  const [tableFacingFilter, setTableFacingFilter] = useState<string>('All');

  // Catalog Search, Location, and Status Filter Controls
  const [projectSearchQuery, setProjectSearchQuery] = useState('');
  const [projectLocationFilter, setProjectLocationFilter] = useState<string>('All Locations');
  const [projectStatusFilter, setProjectStatusFilter] = useState<string>('All');

  // Filtered published projects for the Catalog View
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Must be published on public website
      if (project.isPublished === false) return false;
      // 1. Search Query
      if (projectSearchQuery.trim()) {
        const q = projectSearchQuery.toLowerCase().trim();
        const matchName = project.name?.toLowerCase().includes(q);
        const matchLoc = project.location?.toLowerCase().includes(q);
        const matchDist = project.district?.toLowerCase().includes(q);
        const matchDtcp = project.dtcpNumber?.toLowerCase().includes(q);
        const matchRera = project.reraNumber?.toLowerCase().includes(q);
        const matchDesc = project.description?.toLowerCase().includes(q);
        if (!matchName && !matchLoc && !matchDist && !matchDtcp && !matchRera && !matchDesc) {
          return false;
        }
      }

      // 2. Location Filter
      if (projectLocationFilter !== 'All Locations') {
        const fullLoc = `${project.location} ${project.district || ''}`.toLowerCase();
        if (projectLocationFilter === 'Cuddalore') {
          if (!fullLoc.includes('cuddalore')) return false;
        } else if (projectLocationFilter === 'Chidambaram') {
          if (!fullLoc.includes('chidambaram')) return false;
        } else if (projectLocationFilter === 'Pondy / ECR') {
          if (!fullLoc.includes('pondy') && !fullLoc.includes('ecr') && !fullLoc.includes('puducherry')) {
            return false;
          }
        }
      }

      // 3. Status Filter
      if (projectStatusFilter !== 'All') {
        if (project.status !== projectStatusFilter) return false;
      }

      return true;
    });
  }, [projects, projectSearchQuery, projectLocationFilter, projectStatusFilter]);

  // Lookup active project
  const viewingProject = useMemo(() => {
    if (!activeProjectId) return null;
    return projects.find((p) => p.id === activeProjectId) || projects[0];
  }, [projects, activeProjectId]);

  // Plots belonging to the viewing project
  const projectPlots = useMemo(() => {
    if (!viewingProject) return [];
    return properties.filter((p) => p.projectId === viewingProject.id);
  }, [properties, viewingProject]);

  // The active inspected plot object
  const inspectedPlot = useMemo(() => {
    if (!projectPlots.length) return null;
    if (inspectedPlotId) {
      const found = projectPlots.find((p) => p.id === inspectedPlotId);
      if (found) return found;
    }
    // Default to the first available plot or first plot
    return projectPlots.find((p) => p.status === 'Available') || projectPlots[0];
  }, [projectPlots, inspectedPlotId]);

  // Filtered plots for Tab 3 Inventory Table
  const filteredTablePlots = useMemo(() => {
    return projectPlots.filter((p) => {
      if (tableStatusFilter !== 'All' && p.status !== tableStatusFilter) return false;
      if (tableFacingFilter !== 'All' && p.facing !== tableFacingFilter) return false;
      if (tableSearchQuery.trim()) {
        const q = tableSearchQuery.toLowerCase().trim();
        const matchNum = p.plotNumber.toLowerCase().includes(q);
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchDim = p.plotDimensions.toLowerCase().includes(q);
        if (!matchNum && !matchTitle && !matchDim) return false;
      }
      return true;
    });
  }, [projectPlots, tableStatusFilter, tableFacingFilter, tableSearchQuery]);

  const handleWhatsAppInquiry = (plot: Property) => {
    const text =
      `🏡 *${settings.companyName} · ${plot.projectName || 'Layout'}*\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `📍 *Plot #${plot.plotNumber} · ${plot.title}*\n` +
      `📐 Dimensions: *${plot.plotDimensions}*\n` +
      `📏 Extent: *${plot.areaSqFt} Sq.Ft* (${plot.areaCents} Cents)\n` +
      `🧭 Facing: *${plot.facing} Facing*\n` +
      `🛣️ Road: *${plot.roadWidth} Road*\n` +
      `💰 Total Price: *₹${(plot.totalPrice / 100000).toFixed(2)} Lakhs* (₹${plot.pricePerSqFt}/sq.ft)\n` +
      `✅ Approvals: *${plot.approvals.join(', ')}*\n` +
      `📞 Customer Inquiry for MD Rajesh RTR`;

    window.open(`https://wa.me/919443278899?text=${encodeURIComponent(text)}`, '_blank');
  };

  const getProjectCardStats = (projectId: string) => {
    const pPlots = properties.filter((p) => p.projectId === projectId);
    const available = pPlots.filter((p) => p.status === 'Available').length;
    const reserved = pPlots.filter((p) => p.status === 'Reserved').length;
    const sold = pPlots.filter((p) => p.status === 'Sold').length;
    const lowestPrice = pPlots.reduce(
      (min, p) => (p.totalPrice < min ? p.totalPrice : min),
      pPlots[0]?.totalPrice || 2500000
    );

    return {
      total: pPlots.length,
      available,
      reserved,
      sold,
      startingLakhs: (lowestPrice / 100000).toFixed(1),
    };
  };

  const heroMediaImages = useMemo(() => [
    viewingProject?.masterPlanImage || 'https://images.unsplash.com/photo-1524813686514-a57563d77d61?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=85',
  ], [viewingProject]);

  const handleDownloadBrochure = () => {
    showToast('Downloading Golden City Master Brochure PDF & Sanctioned Map...', 'info');
    setTimeout(() => {
      window.open('/golden-city-layout.jpg', '_blank');
    }, 500);
  };

  // ─────────────────────────────────────────────────────────────
  // 1. IMMERSIVE FULL-SCREEN PROJECT VIEW
  // ─────────────────────────────────────────────────────────────
  if (viewingProject) {
    return (
      <div className="w-full min-h-screen bg-[#F8FAFC] dark:bg-[#081B10] text-slate-900 dark:text-slate-100 flex flex-col justify-between select-none">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6">
          {/* Top Bar: Back Button + Project Identity */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#1E5D32]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveProjectId(null)}
                className="min-h-[44px] min-w-[44px] rounded-2xl bg-white dark:bg-[#112F1C] border border-slate-200 dark:border-[#1E5D32] hover:bg-slate-100 dark:hover:bg-[#184428] text-slate-800 dark:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm group"
                title="Back to All Projects"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
              </button>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {viewingProject.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#15803D] text-white text-xs font-bold shadow-xs">
                    {viewingProject.dtcpNumber}
                  </span>
                  {viewingProject.reraNumber && (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#0B2516] text-[#EAB308] border border-[#EAB308]/40 text-xs font-bold">
                      {viewingProject.reraNumber}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {viewingProject.location}, {viewingProject.district} · {viewingProject.totalAreaExtent || '12.5 Acres'}
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => onOpenConsultation(inspectedPlot || undefined)}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#15803D] hover:bg-[#113B24] text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <Sparkles className="w-4 h-4 text-[#EAB308]" />
                <span>Book Free Site Visit</span>
              </button>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              1. TOP 3-TAB SEGMENTED NAVIGATION BAR (Sticky, Clean & Responsive)
              ───────────────────────────────────────────────────────────── */}
          <div className="sticky top-2 z-40 w-full max-w-xl mx-auto px-2">
            <div className="bg-white/95 dark:bg-[#07170E]/95 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/90 dark:border-[#1E5D32] flex items-center justify-between gap-1 shadow-lg">
              {/* Tab 1: Plot Details */}
              <button
                type="button"
                onClick={() => setProjectSubTab('details')}
                className={`flex-1 min-h-[42px] px-3 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  projectSubTab === 'details'
                    ? 'bg-[#15803D] dark:bg-[#113B24] text-white border border-[#EAB308]/40 shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <FolderOpen className="w-4 h-4 text-[#EAB308]" />
                <span>Plot Details</span>
              </button>

              {/* Tab 2: Master Layout */}
              <button
                type="button"
                onClick={() => setProjectSubTab('layout')}
                className={`flex-1 min-h-[42px] px-3 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  projectSubTab === 'layout'
                    ? 'bg-[#15803D] dark:bg-[#113B24] text-white border border-[#EAB308]/40 shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Master Layout</span>
              </button>

              {/* Tab 3: Inventory (45) */}
              <button
                type="button"
                onClick={() => setProjectSubTab('table')}
                className={`flex-1 min-h-[42px] px-3 py-2 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  projectSubTab === 'table'
                    ? 'bg-[#15803D] dark:bg-[#113B24] text-white border border-[#EAB308]/40 shadow-md'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Layers className="w-4 h-4 text-[#EAB308]" />
                <span>Inventory ({projectPlots.length})</span>
              </button>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              TAB 1 CONTENT: "PLOT DETAILS" TAB VIEW (EXACT REPLICATION)
              ───────────────────────────────────────────────────────────── */}
          {projectSubTab === 'details' && (
            <div className="space-y-5 max-w-3xl mx-auto">
              {/* A. HERO MEDIA CARD */}
              <div className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-[#1E5D32] shadow-xl aspect-[16/10] sm:aspect-[21/10] bg-slate-950 group select-none">
                {/* Top Badges Overlay */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 z-20 pointer-events-none">
                  <div className="px-3 py-1.5 rounded-full bg-[#CA8A04] text-white text-[10px] sm:text-[11px] font-black shadow-lg flex items-center gap-1.5 backdrop-blur-xs">
                    <span>⭐ GRAND A PLATTED COLONY</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-full bg-black/60 text-white text-[10px] sm:text-[11px] font-bold shadow-lg border border-white/20 flex items-center gap-1.5 backdrop-blur-xs">
                    <MapPin className="w-3.5 h-3.5 text-[#EAB308]" />
                    <span>{viewingProject.totalAreaExtent || '12.5 Gated Acres'}</span>
                  </div>
                </div>

                {/* Hero Drone/Site Image */}
                <img
                  src={heroMediaImages[currentHeroSlide]}
                  alt="Golden City Showcase"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />

                {/* Left/Right Carousel Navigation Arrows */}
                <button
                  type="button"
                  onClick={() =>
                    setCurrentHeroSlide((prev) =>
                      prev === 0 ? heroMediaImages.length - 1 : prev - 1
                    )
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg z-20 backdrop-blur-xs active:scale-90"
                  title="Previous Photo"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentHeroSlide((prev) =>
                      prev === heroMediaImages.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-all cursor-pointer shadow-lg z-20 backdrop-blur-xs active:scale-90"
                  title="Next Photo"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Pagination Indicators (Bottom Left Badge & Bottom Right Dots) */}
                <div className="absolute bottom-20 sm:bottom-24 left-4 z-20">
                  <div className="px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-xs text-white text-[10px] sm:text-xs font-bold flex items-center gap-1.5 shadow-md">
                    <Camera className="w-3.5 h-3.5 text-[#EAB308]" />
                    <span>
                      {currentHeroSlide + 1}/{heroMediaImages.length} · Photos & Video
                    </span>
                  </div>
                </div>

                <div className="absolute bottom-20 sm:bottom-24 right-4 z-20 flex items-center gap-1.5">
                  {heroMediaImages.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentHeroSlide(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        idx === currentHeroSlide
                          ? 'w-5 bg-[#EAB308]'
                          : 'w-2 bg-white/60 hover:bg-white'
                      }`}
                      title={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>

                {/* Bottom Gradient Overlay */}
                <div className="absolute bottom-0 inset-x-0 p-4 sm:p-5 bg-gradient-to-t from-black/95 via-black/75 to-transparent flex items-end justify-between gap-4 text-white z-10">
                  <div>
                    <span className="text-[10px] font-black text-[#EAB308] tracking-widest uppercase block">
                      PRIME LOCATION
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                      {viewingProject.name === 'Golden City' ? 'Golden City Enclave' : viewingProject.name}
                    </h2>
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#CA8A04] shrink-0" />
                      <span>
                        {viewingProject.location === 'Cuddalore'
                          ? 'Vandipalayam Main Road, Cuddalore'
                          : `${viewingProject.location}, ${viewingProject.district}`}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[9px] font-black text-[#EAB308] tracking-widest uppercase block">
                      AVAILABLE SIZES
                    </span>
                    <div className="text-base sm:text-xl font-black text-white">
                      800 – 2,400 <span className="text-xs text-slate-300 font-normal">sq.ft</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* B. PROJECT OVERVIEW CARD */}
              <div className="bg-white dark:bg-[#0B2516] rounded-3xl border border-slate-200 dark:border-[#1E5D32] p-5 sm:p-6 shadow-md space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-[#CA8A04] flex items-center justify-center shrink-0">
                      <FolderOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                        Project Overview
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        KRIYAA PROMOTERS FLAGSHIP COLONY
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold shrink-0">
                    Phase 1: ACTIVE
                  </span>
                </div>

                {/* 2x2 Clean Metric Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#112F1C]/70 border border-slate-100 dark:border-[#1E5D32]/50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      TOTAL PLOTS
                    </span>
                    <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5 block">
                      45 Demarcated Plots
                    </span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">
                      Phase 1 (Limited Units)
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#112F1C]/70 border border-slate-100 dark:border-[#1E5D32]/50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      BASE PRICE
                    </span>
                    <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5 block">
                      ₹1,200 / Sq.Ft
                    </span>
                    <span className="text-[11px] text-amber-600 dark:text-[#EAB308] font-bold block mt-0.5">
                      Approved Govt Valuation
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#112F1C]/70 border border-slate-100 dark:border-[#1E5D32]/50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      TOTAL LAYOUT AREA
                    </span>
                    <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5 block">
                      12.5 Gated Acres
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block mt-0.5">
                      Wide tar roads & green resv
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#112F1C]/70 border border-slate-100 dark:border-[#1E5D32]/50">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      PLOT SIZES AVAILABLE
                    </span>
                    <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5 block">
                      800 – 2,400 Sq.Ft
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block mt-0.5">
                      1.8 – 5.5 Cents Units
                    </span>
                  </div>
                </div>

                {/* Bottom Strip */}
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-center gap-2.5 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 dark:text-[#EAB308] shrink-0" />
                  <span>Project Type: DTCP & RERA Approved Residential Plotted Colony</span>
                </div>
              </div>

              {/* C. MASTER BROCHURE DOWNLOAD CARD */}
              <div className="bg-gradient-to-br from-[#081B10] via-[#0B2516] to-[#04140B] rounded-3xl p-5 border border-[#CA8A04]/40 shadow-xl text-white space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-[#CA8A04]/20 border border-[#CA8A04]/50 flex items-center justify-center text-[#EAB308] shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm sm:text-base font-black text-white">
                        {viewingProject.name} Master Brochure
                      </h4>
                      <span className="px-1.5 py-0.5 rounded bg-[#EAB308] text-slate-950 font-black text-[9px]">
                        PDF
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Includes Sanctioned Layout Map, DTCP Copies & Price Schedule
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-emerald-900/50">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Verified Document · 4.8 MB</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownloadBrochure}
                    className="px-4 py-2.5 rounded-xl bg-[#EAB308] hover:bg-[#ca8a04] text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Brochure 📥</span>
                  </button>
                </div>
              </div>

              {/* D. TOWNSHIP INFRASTRUCTURE CARD */}
              <div className="bg-white dark:bg-[#0B2516] rounded-3xl border border-slate-200 dark:border-[#1E5D32] p-5 sm:p-6 shadow-md space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Township Infrastructure
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                    FULLY COMPLETED
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      title: '40ft & 30ft Heavy Tar Roads',
                      desc: 'Storm water drain culverts, kerb stones & LED lighting.',
                      icon: Car,
                    },
                    {
                      title: 'Tested Potable Sweet Water (28ft)',
                      desc: 'TDS tested underground sweet drinking water vein.',
                      icon: Droplet,
                    },
                    {
                      title: '10,000 Sq.Ft OSR Park & Track',
                      desc: 'Children play lawn, reflexology pathway & native grove.',
                      icon: TreePine,
                    },
                    {
                      title: '100% Clear Title & Immediate Patta',
                      desc: '30 year lawyer encumbrance verified, instant registration.',
                      icon: ShieldCheck,
                    },
                  ].map((infra, idx) => {
                    const Icon = infra.icon;
                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#112F1C]/70 border border-slate-100 dark:border-[#1E5D32]/50 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-[#113B24] border border-[#1E5D32] text-emerald-400 flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                              {infra.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {infra.desc}
                            </p>
                          </div>
                        </div>
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* E. NEARBY LANDMARKS & CONNECTIVITY */}
              <div className="bg-white dark:bg-[#0B2516] rounded-3xl border border-slate-200 dark:border-[#1E5D32] p-5 sm:p-6 shadow-md space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Nearby Landmarks
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                    KEY HUBS
                  </span>
                </div>

                <div className="space-y-2.5">
                  {[
                    {
                      name: 'NH-45A / ECR Coastal Corridor',
                      sub: 'Rapid seamless access to arterial highway connecting Puducherry & Chidambaram',
                      dist: '400 m (1 min)',
                      isAmber: false,
                      icon: Navigation,
                    },
                    {
                      name: 'Cuddalore Port Junction Rwy Station',
                      sub: 'Main Southern Railway junction with express trains to Chennai & Tiruchirappalli',
                      dist: '4.2 km (8 mins)',
                      isAmber: true,
                      icon: Train,
                    },
                    {
                      name: 'Airport Connectivity',
                      sub: 'Pondicherry Airport = 24 km (35 mins) & Chennai International Airport = 180 km',
                      dist: '24 km (35 mins)',
                      isAmber: false,
                      icon: Plane,
                    },
                    {
                      name: 'Schools & Premier Colleges',
                      sub: "St. Joseph's Hr. Sec., Krishnasamy Memorial School & Periyar Arts College (2.5 km)",
                      dist: '1.0 km (2 mins)',
                      isAmber: false,
                      icon: GraduationCap,
                    },
                    {
                      name: 'Hospitals & Healthcare',
                      sub: 'Government General Hospital, Krishna Hospital & 24x7 Multi-Specialty Clinics',
                      dist: '3.5 km (6 mins)',
                      isAmber: false,
                      icon: HeartPulse,
                    },
                    {
                      name: 'Shopping Malls & Commercial Hub',
                      sub: 'AR Shopping Mall, Imperial Road Daily Produce Market & Banking Hubs',
                      dist: '3.8 km (7 mins)',
                      isAmber: true,
                      icon: ShoppingBag,
                    },
                  ].map((landmark, idx) => {
                    const Icon = landmark.icon;
                    return (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-[#112F1C]/70 border border-slate-100 dark:border-[#1E5D32]/50 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-[#113B24] text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-900 dark:text-white">
                              {landmark.name}
                            </h4>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                              {landmark.sub}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black shrink-0 ${
                            landmark.isAmber
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                              : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          }`}
                        >
                          {landmark.dist}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* F. PRE-APPROVED BANK LOANS CARD */}
              <div className="bg-white dark:bg-[#0B2516] rounded-3xl border border-slate-200 dark:border-[#1E5D32] p-5 sm:p-6 shadow-md space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Landmark className="w-4 h-4" />
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      Pre-Approved Bank Loans
                    </h3>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                    Up to 80% Funding
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Instant spot loan approvals, zero hidden fees, and preferential interest rates from verified lending partners.
                </p>

                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#112F1C]/70 border border-slate-200 dark:border-[#1E5D32]/60 text-center">
                    <span className="text-sm font-black text-slate-900 dark:text-white block">
                      SBI
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block mt-0.5">
                      Home Finance
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#112F1C]/70 border border-slate-200 dark:border-[#1E5D32]/60 text-center">
                    <span className="text-sm font-black text-slate-900 dark:text-white block">
                      HDFC
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block mt-0.5">
                      Bank Ltd
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#112F1C]/70 border border-slate-200 dark:border-[#1E5D32]/60 text-center">
                    <span className="text-sm font-black text-slate-900 dark:text-white block">
                      CANARA
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block mt-0.5">
                      Priority Loan
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 2 CONTENT: INTERACTIVE MASTER LAYOUT (FULL SCREEN EDGE-TO-EDGE)
              ───────────────────────────────────────────────────────────── */}
          {projectSubTab === 'layout' && (
            <div
              className="relative w-screen h-[calc(100vh-125px)] min-h-[85vh] overflow-hidden -my-6"
              style={{
                width: '100vw',
                marginLeft: 'calc(-50vw + 50%)',
              }}
            >
              {/* Interactive Master Layout Viewer with 4 modes & full-bleed canvas */}
              <MasterLayoutViewer
                project={viewingProject}
                plots={projectPlots}
                selectedPlot={inspectedPlot}
                onSelectPlot={(p) => {
                  setInspectedPlotId(p.id);
                  setIsPlotModalOpen(true);
                }}
                displayMode={displayMode}
                onModeChange={(m) => setDisplayMode(m)}
                onOpenConsultation={() => onOpenConsultation(inspectedPlot || undefined)}
                onWhatsAppInquiry={() => {
                  if (inspectedPlot) {
                    handleWhatsAppInquiry(inspectedPlot);
                  } else {
                    window.open(
                      'https://wa.me/919443278899?text=Hello%20Kriyaa%20Promoters,%20I%20am%20exploring%20the%20Golden%20City%20layout',
                      '_blank'
                    );
                  }
                }}
              />
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              TAB 3 CONTENT: PLOT INVENTORY TABLE & FILTER
              ───────────────────────────────────────────────────────────── */}
          {projectSubTab === 'table' && (
            <div className="space-y-4">
              {/* Filter Controls Bar */}
              <div className="bg-white dark:bg-[#0B2516] rounded-2xl border border-slate-200 dark:border-[#1E5D32] p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
                {/* Search */}
                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={tableSearchQuery}
                    onChange={(e) => setTableSearchQuery(e.target.value)}
                    placeholder="Search plot #, size, facing..."
                    className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#112F1C] border border-slate-300 dark:border-[#1E5D32] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                  />
                </div>

                {/* Status & Facing Filters */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="font-bold text-slate-500">Status:</span>
                    <select
                      value={tableStatusFilter}
                      onChange={(e) => setTableStatusFilter(e.target.value)}
                      className="text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#112F1C] border border-slate-300 dark:border-[#1E5D32] text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="All">All Status ({projectPlots.length})</option>
                      <option value="Available">Available</option>
                      <option value="Reserved">Reserved</option>
                      <option value="Sold">Sold</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="font-bold text-slate-500">Facing:</span>
                    <select
                      value={tableFacingFilter}
                      onChange={(e) => setTableFacingFilter(e.target.value)}
                      className="text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#112F1C] border border-slate-300 dark:border-[#1E5D32] text-slate-900 dark:text-white focus:outline-none"
                    >
                      <option value="All">All Facings</option>
                      <option value="East">East Facing</option>
                      <option value="North">North Facing</option>
                      <option value="North-East">North-East Facing</option>
                      <option value="South">South Facing</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Responsive Table */}
              <div className="bg-white dark:bg-[#0B2516] rounded-2xl border border-slate-200 dark:border-[#1E5D32] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#113B24] text-white uppercase text-[10px] tracking-wider font-mono">
                      <tr>
                        <th className="py-3 px-4">Plot #</th>
                        <th className="py-3 px-4">Dimensions</th>
                        <th className="py-3 px-4">Area Extent</th>
                        <th className="py-3 px-4">Facing & Road</th>
                        <th className="py-3 px-4">Total Price</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#1E5D32]">
                      {filteredTablePlots.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-400">
                            No plots found matching current filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredTablePlots.map((plot) => {
                          const isSaved = isPlotSaved(plot.id);
                          return (
                            <tr
                              key={plot.id}
                              onClick={() => {
                                setInspectedPlotId(plot.id);
                                setIsPlotModalOpen(true);
                              }}
                              className="hover:bg-emerald-50/50 dark:hover:bg-[#112F1C] cursor-pointer transition-colors"
                            >
                              <td className="py-3 px-4 font-black text-sm text-[#113B24] dark:text-[#EAB308]">
                                #{plot.plotNumber}
                              </td>
                              <td className="py-3 px-4 font-mono font-bold">
                                {plot.plotDimensions}
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-bold">{plot.areaSqFt} Sq.Ft</span>{' '}
                                <span className="text-[10px] text-slate-400">({plot.areaCents} Cts)</span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-semibold">{plot.facing}</span> · {plot.roadWidth}
                              </td>
                              <td className="py-3 px-4 font-black text-[#15803D] dark:text-emerald-400">
                                ₹{(plot.totalPrice / 100000).toFixed(2)}L
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                    plot.status === 'Available'
                                      ? 'bg-emerald-100 text-[#15803D]'
                                      : plot.status === 'Reserved'
                                      ? 'bg-amber-100 text-[#CA8A04]'
                                      : 'bg-red-100 text-[#991B1B] line-through'
                                  }`}
                                >
                                  {plot.status}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div
                                  className="flex items-center justify-end gap-1.5"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    type="button"
                                    onClick={() => toggleSavePlot(plot.id)}
                                    className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                                      isSaved
                                        ? 'bg-emerald-50 border-emerald-400 text-[#15803D] dark:bg-[#113B24] dark:text-[#EAB308]'
                                        : 'bg-slate-100 dark:bg-[#112F1C] border-slate-200 dark:border-[#1E5D32] text-slate-500 hover:text-slate-900'
                                    }`}
                                    title={isSaved ? 'In My Plots' : 'Add to My Plots'}
                                  >
                                    <BookmarkCheck className={`w-3.5 h-3.5 ${isSaved ? 'text-[#15803D] dark:text-[#EAB308]' : ''}`} />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleWhatsAppInquiry(plot)}
                                    className="p-2 rounded-xl bg-[#25D366] text-white hover:bg-[#20bd5a] transition-colors cursor-pointer"
                                    title="WhatsApp MD Rajesh RTR"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Plot Details Popup Modal (Triggered on layout parcel click or inventory table row click) */}
          <PlotDetailsModal
            isOpen={isPlotModalOpen}
            onClose={() => setIsPlotModalOpen(false)}
            plot={inspectedPlot}
            project={viewingProject}
            isSaved={inspectedPlot ? isPlotSaved(inspectedPlot.id) : false}
            onToggleSave={(id) => toggleSavePlot(id)}
            onBookConsultation={(plot) => {
              setIsPlotModalOpen(false);
              onOpenConsultation(plot);
            }}
            onWhatsAppInquiry={(plot) => handleWhatsAppInquiry(plot)}
          />
        </main>

        {/* Project Footer at bottom of Full-Screen View */}
        <PublicFooter
          onTabChange={onTabChange}
          onOpenConsultation={onOpenConsultation}
          onOpenAdminLogin={onOpenAdminLogin}
        />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // 2. PROJECT CATALOG CARDS VIEW
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] dark:bg-[#081B10] text-slate-900 dark:text-slate-100 flex flex-col justify-between select-none">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full space-y-6 sm:space-y-8">
        {/* ─────────────────────────────────────────────────────────────
            1. CLEAN HEADER (Title Only - No Subtitle)
            ───────────────────────────────────────────────────────────── */}
        <div className="text-center max-w-4xl mx-auto pt-2">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Ready to Find Your Ideal{' '}
            <span className="text-[#CA8A04] dark:text-[#EAB308]">Vastu-Compliant Plot?</span>
          </h1>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            2. RESPONSIVE SEARCH & FILTER CONTROL BAR
            ───────────────────────────────────────────────────────────── */}
        <div className="w-full max-w-4xl mx-auto space-y-3.5">
          {/* Full-width Search Input */}
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-400 dark:text-emerald-400" />
            </div>
            <input
              type="text"
              value={projectSearchQuery}
              onChange={(e) => setProjectSearchQuery(e.target.value)}
              placeholder="Search by project name, layout, or DTCP number..."
              className="w-full min-h-[50px] pl-11 pr-11 py-3 text-sm sm:text-base rounded-2xl bg-white dark:bg-[#0B2516] border-2 border-slate-200 dark:border-[#1E5D32] text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 shadow-xs focus:outline-none focus:border-[#15803D] dark:focus:border-[#EAB308] focus:ring-4 focus:ring-emerald-500/10 transition-all"
            />
            {projectSearchQuery && (
              <button
                type="button"
                onClick={() => setProjectSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                aria-label="Clear search"
              >
                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <X className="w-3.5 h-3.5" />
                </div>
              </button>
            )}
          </div>

          {/* Filter Rows: Location Pills & Status Pills (Mobile-first with horizontal scroll & 44px tap targets) */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
            {/* Location Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar touch-pan-x">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
                Location:
              </span>
              {['All Locations', 'Cuddalore', 'Chidambaram', 'Pondy / ECR'].map((loc) => {
                const isActive = projectLocationFilter === loc;
                return (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setProjectLocationFilter(loc)}
                    className={`min-h-[44px] px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center justify-center border active:scale-95 ${
                      isActive
                        ? 'bg-[#113B24] dark:bg-[#15803D] text-[#EAB308] dark:text-white border-[#EAB308]/60 dark:border-emerald-500 shadow-sm'
                        : 'bg-white dark:bg-[#0B2516] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#1E5D32] hover:bg-slate-50 dark:hover:bg-[#133A23]'
                    }`}
                  >
                    <span>{loc}</span>
                  </button>
                );
              })}
            </div>

            {/* Status Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 no-scrollbar touch-pan-x">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
                Status:
              </span>
              {['All', 'Active', 'Upcoming', 'Completed'].map((st) => {
                const isActive = projectStatusFilter === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setProjectStatusFilter(st)}
                    className={`min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center justify-center border active:scale-95 ${
                      isActive
                        ? 'bg-[#EAB308] text-slate-950 border-[#CA8A04] shadow-sm font-black'
                        : 'bg-white dark:bg-[#0B2516] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[#1E5D32] hover:bg-slate-50 dark:hover:bg-[#133A23]'
                    }`}
                  >
                    <span>{st}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Loading Indicator */}
        {isLoadingBackend && (
          <div className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 text-[#15803D] dark:text-emerald-400 text-xs font-bold max-w-md mx-auto">
            <span className="w-2 h-2 rounded-full bg-[#15803D] animate-ping" />
            <span>Syncing published plot data with promoter backend...</span>
          </div>
        )}

        {/* Backend Error Alert with Retry */}
        {backendError && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex flex-col sm:flex-row items-center justify-between gap-3 max-w-xl mx-auto shadow-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span>Offline cache active. Connect to promoter backend for latest plot releases.</span>
            </div>
            <button
              type="button"
              onClick={() => refreshBackendData()}
              className="px-3 py-1.5 rounded-lg bg-amber-200 dark:bg-amber-900/60 text-amber-950 dark:text-amber-100 font-bold text-xs hover:brightness-105 cursor-pointer whitespace-nowrap"
            >
              Retry Sync
            </button>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────
            3. PROJECT CARDS GRID (Filtered)
            ───────────────────────────────────────────────────────────── */}
        {filteredProjects.length === 0 ? (
          <div className="bg-white dark:bg-[#0B2516] rounded-3xl border border-slate-200 dark:border-[#1E5D32] p-8 sm:p-12 text-center max-w-md mx-auto space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-[#CA8A04] dark:text-[#EAB308] flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
              No matching layouts found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Try adjusting your search keywords or switching location and status filters to view all available layouts.
            </p>
            <button
              type="button"
              onClick={() => {
                setProjectSearchQuery('');
                setProjectLocationFilter('All Locations');
                setProjectStatusFilter('All');
              }}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#113B24] dark:bg-[#15803D] text-[#EAB308] dark:text-white text-xs font-bold transition-all cursor-pointer hover:brightness-110 shadow-sm"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
            const stats = getProjectCardStats(project.id);
            return (
              <div
                key={project.id}
                className="bg-white dark:bg-[#0B2516] rounded-3xl border border-slate-200 dark:border-[#1E5D32] overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Thumbnail Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                  <img
                    src={project.masterPlanImage}
                    alt={project.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-[#113B24] text-[#EAB308] border border-[#EAB308]/40 text-xs font-black shadow-md flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{project.dtcpNumber}</span>
                    </span>

                    <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-black uppercase">
                      {project.status}
                    </span>
                  </div>

                  {/* Bottom Title on Image */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="text-lg font-black">{project.name}</h3>
                    <p className="text-xs text-[#EAB308] font-semibold flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{project.location}, {project.district}</span>
                    </p>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 dark:border-[#1E5D32] text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Extent</span>
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {project.totalAreaExtent || '12.5 Acres'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Available</span>
                      <span className="text-xs font-black text-[#15803D] dark:text-emerald-400">
                        {stats.available} Plots
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Starts At</span>
                      <span className="text-xs font-black text-[#CA8A04] dark:text-[#EAB308]">
                        ₹{stats.startingLakhs}L
                      </span>
                    </div>
                  </div>

                  {/* "View More" triggers Full-Screen Project View */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveProjectId(project.id);
                      setProjectSubTab('details');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="w-full min-h-[46px] rounded-xl bg-[#15803D] hover:bg-[#113B24] active:scale-[0.99] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                  >
                    <span>View More & Explore Layout</span>
                    <Sparkles className="w-4 h-4 text-[#EAB308]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
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
