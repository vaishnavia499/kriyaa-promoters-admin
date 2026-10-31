import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Building2,
  LayoutGrid,
  MapPin,
  ShieldCheck,
  ExternalLink,
  Sparkles,
  Compass,
  CheckCircle2,
  Clock,
  Check,
  Plus,
  Pencil,
  PhoneCall,
  MessageSquare,
  Search,
  Maximize2,
  Share2,
  Layers,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Project, Property, PropertyStatus } from '../types';

export const ProjectDetailDrawer: React.FC = () => {
  const {
    viewingProject,
    isProjectDetailOpen,
    projectDetailInitialMode,
    closeProjectDetail,
    properties,
    openEditProjectModal,
    openAddPropertyModal,
    openEditPropertyModal,
    openPropertyDrawer,
    updatePropertyStatus,
    setSelectedProjectId,
    selectedProjectId,
    settings,
    showToast,
  } = useApp();

  // Dual-Mode View Switcher ('overview' | 'grid')
  const [activeMode, setActiveMode] = useState<'overview' | 'grid'>('overview');

  // Master Layout Grid State
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [gridSearchQuery, setGridSearchQuery] = useState<string>('');
  const [activePlotForQuickAction, setActivePlotForQuickAction] = useState<Property | null>(null);
  const [previewPlanImage, setPreviewPlanImage] = useState<string | null>(null);

  // Sync mode whenever drawer opens
  useEffect(() => {
    if (isProjectDetailOpen) {
      setActiveMode(projectDetailInitialMode || 'overview');
      setStatusFilter('All');
      setGridSearchQuery('');
      setActivePlotForQuickAction(null);
      setPreviewPlanImage(null);
    }
  }, [isProjectDetailOpen, projectDetailInitialMode, viewingProject?.id]);

  // Keep activePlotForQuickAction updated if its status or data changes in global state
  useEffect(() => {
    if (activePlotForQuickAction) {
      const refreshed = properties.find((p) => p.id === activePlotForQuickAction.id);
      if (refreshed) {
        setActivePlotForQuickAction(refreshed);
      }
    }
  }, [properties, activePlotForQuickAction]);

  if (!viewingProject) return null;

  // Filter properties belonging to this project
  const projectPlots = properties.filter((p) => p.projectId === viewingProject.id);

  // Status counts for Master Layout Grid
  const countAll = projectPlots.length;
  const countAvailable = projectPlots.filter((p) => p.status === 'Available').length;
  const countReserved = projectPlots.filter((p) => p.status === 'Reserved').length;
  const countSold = projectPlots.filter((p) => p.status === 'Sold').length;

  // Natural sorting for plots (numbers, C-01, etc.)
  const sortedPlots = [...projectPlots].sort((a, b) => {
    const numA = parseInt(a.plotNumber.replace(/\D/g, ''), 10);
    const numB = parseInt(b.plotNumber.replace(/\D/g, ''), 10);
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    return a.plotNumber.localeCompare(b.plotNumber, undefined, { numeric: true, sensitivity: 'base' });
  });

  // Filtered plots based on grid filter pills and plot search
  const filteredGridPlots = sortedPlots.filter((plot) => {
    if (statusFilter !== 'All' && plot.status !== statusFilter) {
      return false;
    }
    if (gridSearchQuery.trim()) {
      const q = gridSearchQuery.toLowerCase().trim();
      const matchNum = plot.plotNumber.toLowerCase().includes(q);
      const matchTitle = plot.title.toLowerCase().includes(q);
      const matchDim = plot.plotDimensions.toLowerCase().includes(q);
      if (!matchNum && !matchTitle && !matchDim) return false;
    }
    return true;
  });

  // Format dimensions (e.g. "30x40 ft" -> "30 × 40")
  const formatDimensions = (dim: string) => {
    return dim.replace(/ft/gi, '').replace(/x/gi, ' × ').trim();
  };

  const handleQuickStatusChange = (plot: Property, newStatus: PropertyStatus) => {
    updatePropertyStatus(plot.id, newStatus);
    showToast(`Plot #${plot.plotNumber} updated to ${newStatus}`, 'success');
  };

  const handleSharePlotWhatsApp = (plot: Property) => {
    const text =
      `🏡 *${settings.companyName} · ${viewingProject.name}*\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `📍 *Plot #${plot.plotNumber} · ${plot.title}*\n` +
      `📐 Dimensions: *${plot.plotDimensions}*\n` +
      `📏 Extent: *${plot.areaSqFt} Sq.Ft* (${plot.areaCents} Cents)\n` +
      `🧭 Facing: *${plot.facing} Facing*\n` +
      `🛣️ Road: *${plot.roadWidth} Road*\n` +
      `💰 Total Price: *₹${(plot.totalPrice / 100000).toFixed(2)} Lakhs* (₹${plot.pricePerSqFt}/sq.ft)\n` +
      `✅ DTCP Approval: *${viewingProject.dtcpNumber}*\n` +
      `📍 Location: ${plot.address}\n` +
      `📞 Contact: ${settings.ownerName} (${settings.contactNumber})`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const isContextActive = selectedProjectId === viewingProject.id;

  return (
    <AnimatePresence>
      {isProjectDetailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeProjectDetail}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
          />

          {/* Main Modal Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 14 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10"
          >
            {/* ─────────────────────────────────────────────────────────────
                1. TOP HEADER & DUAL-MODE SWITCHER
                ───────────────────────────────────────────────────────────── */}
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                      {viewingProject.name}
                    </h2>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300">
                      {viewingProject.dtcpNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="truncate">{viewingProject.location} · {viewingProject.district}</span>
                  </div>
                </div>
              </div>

              {/* Action Cluster & Close */}
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                {/* Dual-Mode View Switcher Segmented Control */}
                <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    onClick={() => setActiveMode('overview')}
                    className={`min-h-[32px] px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeMode === 'overview'
                        ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Overview & Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveMode('grid')}
                    className={`min-h-[32px] px-3 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeMode === 'grid'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Master Layout Grid</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      activeMode === 'grid' ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {countAll}
                    </span>
                  </button>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={closeProjectDetail}
                  className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
                  title="Close Project Details"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ─────────────────────────────────────────────────────────────
                2. TAB CONTENT AREA (Scrollable)
                ───────────────────────────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              {/* ─────────────────────────────────────────────────────────
                  MODE A: OVERVIEW & DETAILS
                  ───────────────────────────────────────────────────────── */}
              {activeMode === 'overview' && (
                <div className="space-y-6">
                  {/* Hero Banner with Layout Blueprint */}
                  <div className="relative rounded-3xl overflow-hidden h-52 sm:h-64 bg-slate-900 border border-slate-200 dark:border-slate-800 group shadow-sm">
                    <img
                      src={viewingProject.masterPlanImage}
                      alt={viewingProject.name}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-black/30" />

                    {/* Top Image Badges */}
                    <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
                      <span className="px-3 py-1 rounded-xl bg-emerald-500 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-sm">
                        {viewingProject.status} Scheme
                      </span>

                      <button
                        type="button"
                        onClick={() => setPreviewPlanImage(viewingProject.masterPlanImage)}
                        className="px-3 py-1.5 rounded-xl bg-black/60 hover:bg-black/85 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-xs transition-colors cursor-pointer"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                        <span>Zoom Layout Blueprint</span>
                      </button>
                    </div>

                    {/* Bottom Image Overlay Details */}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                        <div>
                          <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight drop-shadow-sm">
                            {viewingProject.name}
                          </h1>
                          <p className="text-xs sm:text-sm text-emerald-300 font-semibold flex items-center gap-1.5 mt-0.5 drop-shadow-sm">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span>{viewingProject.location}, {viewingProject.district}</span>
                          </p>
                        </div>

                        {/* Direct Jump to Grid Button */}
                        <button
                          type="button"
                          onClick={() => setActiveMode('grid')}
                          className="h-10 px-4 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg transition-all cursor-pointer whitespace-nowrap"
                        >
                          <LayoutGrid className="w-4 h-4" />
                          <span>Open Master Layout Grid ({countAll} Plots)</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Key Specs & Approval Highlights */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                        Total Extent
                      </span>
                      <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5 block">
                        {viewingProject.totalAreaExtent || '12.5 Acres'}
                      </span>
                      <span className="text-[10px] text-slate-400">Township Boundary</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                      <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                        Available Plots
                      </span>
                      <span className="text-lg font-black text-emerald-700 dark:text-emerald-400 mt-0.5 block tabular-nums">
                        {countAvailable} Units
                      </span>
                      <span className="text-[10px] text-emerald-600/80">Ready for booking</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                      <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
                        Reserved / Sold
                      </span>
                      <span className="text-lg font-black text-amber-700 dark:text-amber-400 mt-0.5 block tabular-nums">
                        {countReserved + countSold} Units
                      </span>
                      <span className="text-[10px] text-amber-600/80">Under deal / registered</span>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                        Launch Year
                      </span>
                      <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5 block">
                        {viewingProject.launchYear || 2023}
                      </span>
                      <span className="text-[10px] text-slate-400">Development started</span>
                    </div>
                  </div>

                  {/* Statutory & Legal Approvals */}
                  <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-3">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Statutory Approvals & Compliance</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">DTCP Layout Approval</span>
                        <span className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm mt-0.5 block">
                          {viewingProject.dtcpNumber}
                        </span>
                        <span className="text-[10px] text-slate-500">Sanctioned layout plan</span>
                      </div>

                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">RERA Registration</span>
                        <span className="font-extrabold text-[#CA8A04] dark:text-[#EAB308] text-sm mt-0.5 block">
                          {viewingProject.reraNumber || 'TN/RERA/0428/2024'}
                        </span>
                        <span className="text-[10px] text-slate-500">Real estate authority registered</span>
                      </div>

                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Title & Encumbrance</span>
                        <span className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm mt-0.5 block flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>100% Clear Title</span>
                        </span>
                        <span className="text-[10px] text-slate-500">Patta & Sub-Registrar verified</span>
                      </div>
                    </div>
                  </div>

                  {/* Location & Description */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-3">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Site Location & Geo Coordinates</span>
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {viewingProject.location}, {viewingProject.district}, Tamil Nadu. Situated along key national highway connectors with immediate access to bus stops, schools, and healthcare facilities.
                      </p>
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(
                          `${viewingProject.name} ${viewingProject.location}`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Open Layout in Google Maps</span>
                      </a>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 space-y-3">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Township Scope & Amenities</span>
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {viewingProject.description}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {['40ft/60ft Avenue Roads', 'Sweet Potable Water', 'Underground Power', 'Avenue Tree Plantation', 'Gated Archway'].map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[10px] font-bold"
                          >
                            ✓ {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Project Management Action Bar */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => setSelectedProjectId(isContextActive ? 'all' : viewingProject.id)}
                        className={`min-h-[40px] px-3.5 text-xs font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 w-full sm:w-auto ${
                          isContextActive
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                            : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{isContextActive ? 'Active in Top Header Context' : 'Set as Top Header Active Layout'}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => {
                          closeProjectDetail();
                          openEditProjectModal(viewingProject);
                        }}
                        className="flex-1 sm:flex-none min-h-[40px] px-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit Project Info</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          openAddPropertyModal(viewingProject.id);
                        }}
                        className="flex-1 sm:flex-none min-h-[40px] px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Plot to this Project</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ─────────────────────────────────────────────────────────
                  MODE B: MASTER LAYOUT GRID (Interactive Plot Boxes)
                  ───────────────────────────────────────────────────────── */}
              {activeMode === 'grid' && (
                <div className="space-y-4">
                  {/* Status Filter Bar on top of the grid */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                    {/* Status Filter Pills with Live Count Badges */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setStatusFilter('All')}
                        className={`min-h-[34px] px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          statusFilter === 'All'
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <span>All Plots</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full font-extrabold bg-slate-200/60 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                          {countAll}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setStatusFilter('Available')}
                        className={`min-h-[34px] px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          statusFilter === 'Available'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                        <span>Available</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full font-extrabold bg-emerald-700/20 text-emerald-900 dark:text-emerald-200">
                          {countAvailable}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setStatusFilter('Reserved')}
                        className={`min-h-[34px] px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          statusFilter === 'Reserved'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                        <span>Reserved</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full font-extrabold bg-amber-700/20 text-amber-900 dark:text-amber-200">
                          {countReserved}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setStatusFilter('Sold')}
                        className={`min-h-[34px] px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          statusFilter === 'Sold'
                            ? 'bg-slate-700 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-slate-400 inline-block" />
                        <span>Sold</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full font-extrabold bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                          {countSold}
                        </span>
                      </button>
                    </div>

                    {/* Plot Search & Add Plot */}
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1 sm:w-48">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Find Plot #..."
                          value={gridSearchQuery}
                          onChange={(e) => setGridSearchQuery(e.target.value)}
                          className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => openAddPropertyModal(viewingProject.id)}
                        className="h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap"
                        title="Add Plot"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Plot</span>
                      </button>
                    </div>
                  </div>

                  {/* Interactive Site Layout Grid (Interactive Plot Boxes) */}
                  {filteredGridPlots.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {filteredGridPlots.map((plot) => {
                        const isAvailable = plot.status === 'Available';
                        const isReserved = plot.status === 'Reserved';
                        const isSold = plot.status === 'Sold';

                        return (
                          <div
                            key={plot.id}
                            onClick={() => setActivePlotForQuickAction(plot)}
                            className={`p-3 rounded-2xl border-2 transition-all duration-150 cursor-pointer flex flex-col justify-between select-none relative group min-h-[120px] ${
                              isAvailable
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600 text-emerald-900 dark:text-emerald-200 hover:border-emerald-500 hover:shadow-md hover:-translate-y-0.5'
                                : isReserved
                                ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600 text-amber-900 dark:text-amber-200 hover:border-amber-500 hover:shadow-md hover:-translate-y-0.5'
                                : 'bg-slate-100 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-400 opacity-85 hover:-translate-y-0.5'
                            }`}
                          >
                            {/* Top: Plot Number + Corner Badge */}
                            <div className="flex items-start justify-between gap-1">
                              <span
                                className={`text-base font-black tracking-tight leading-none ${
                                  isSold ? 'line-through text-slate-500' : ''
                                }`}
                              >
                                #{plot.plotNumber}
                              </span>

                              {plot.isCornerPlot && (
                                <span className="px-1.5 py-0.5 rounded bg-amber-500 text-white text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-0.5 shadow-xs">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  <span>Corner</span>
                                </span>
                              )}
                            </div>

                            {/* Middle: Dimensions & Facing */}
                            <div className="my-1.5 space-y-0.5">
                              <div className="font-extrabold text-xs tracking-tight">
                                {formatDimensions(plot.plotDimensions)}
                              </div>
                              <div className="text-[10px] opacity-80 truncate">
                                {plot.areaSqFt} sqft · {plot.facing}
                              </div>
                            </div>

                            {/* Bottom: Price Tag & Status Pill */}
                            <div className="pt-1.5 border-t border-black/5 dark:border-white/5 flex items-center justify-between gap-1 text-[11px]">
                              <span className="font-black tabular-nums">
                                ₹{(plot.totalPrice / 100000).toFixed(2)}L
                              </span>

                              <span
                                className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                                  isAvailable
                                    ? 'bg-emerald-600 text-white'
                                    : isReserved
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-slate-600 text-white line-through'
                                }`}
                              >
                                {plot.status}
                              </span>
                            </div>

                            {/* Tap Hint Overlay on Hover */}
                            <div className="absolute inset-x-0 bottom-0 py-1 bg-black/70 text-white text-[9px] font-bold text-center rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              Tap to Update & Details
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 space-y-2">
                      <LayoutGrid className="w-8 h-8 text-slate-400 mx-auto" />
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        No plots match "{statusFilter}"
                      </h4>
                      <p className="text-xs text-slate-500">
                        Try changing the status filter pill or search query.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setStatusFilter('All');
                          setGridSearchQuery('');
                        }}
                        className="mt-2 px-3 py-1.5 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl cursor-pointer"
                      >
                        Reset Filter
                      </button>
                    </div>
                  )}

                  {/* Master Grid Legend Footnote */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Plot Legend:</span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-md bg-emerald-50 border-2 border-emerald-400 inline-block" />
                        <span>Available for booking</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-md bg-amber-50 border-2 border-amber-400 inline-block" />
                        <span>Reserved / Token</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-md bg-slate-100 border-2 border-slate-300 inline-block" />
                        <span className="line-through">Sold / Deeded</span>
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400">
                      Tap any plot box for 1-tap status switch & quick quotes.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ─────────────────────────────────────────────────────────────
                3. QUICK PLOT ACTION MODAL / BOTTOM SHEET
                (Tapping any plot box opens this compact drawer)
                ───────────────────────────────────────────────────────────── */}
            <AnimatePresence>
              {activePlotForQuickAction && (
                <div className="absolute inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs">
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                    className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 sm:p-5 space-y-4 max-h-[85vh] overflow-y-auto"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white font-extrabold text-xs">
                            Plot #{activePlotForQuickAction.plotNumber}
                          </span>
                          {activePlotForQuickAction.isCornerPlot && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white font-bold text-[10px] flex items-center gap-0.5">
                              <Sparkles className="w-2.5 h-2.5" />
                              Corner Plot
                            </span>
                          )}
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                            {activePlotForQuickAction.category}
                          </span>
                        </div>
                        <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mt-1 leading-snug">
                          {activePlotForQuickAction.title}
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActivePlotForQuickAction(null)}
                        className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 flex items-center justify-center cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Price & Rate */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Price</span>
                        <span className="text-lg font-black text-slate-900 dark:text-white">
                          ₹{(activePlotForQuickAction.totalPrice / 100000).toFixed(2)} Lakhs
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Unit Rate</span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          ₹{activePlotForQuickAction.pricePerSqFt} / sq.ft
                        </span>
                      </div>
                    </div>

                    {/* Specs Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Dimensions</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {activePlotForQuickAction.plotDimensions}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Area Extent</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {activePlotForQuickAction.areaSqFt} sq.ft ({activePlotForQuickAction.areaCents} Cts)
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Facing</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {activePlotForQuickAction.facing} Facing
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                        <span className="text-slate-400 text-[10px] uppercase font-bold block">Frontage Road</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {activePlotForQuickAction.roadWidth}
                        </span>
                      </div>
                    </div>

                    {/* Quick 1-Tap Status Updater */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide block">
                        Quick Real-Time Status Update
                      </span>
                      <div className="grid grid-cols-3 gap-2">
                        {(['Available', 'Reserved', 'Sold'] as PropertyStatus[]).map((st) => {
                          const isActive = activePlotForQuickAction.status === st;
                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleQuickStatusChange(activePlotForQuickAction, st)}
                              className={`py-2 px-2 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                                st === 'Available'
                                  ? isActive
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 hover:bg-emerald-100'
                                  : st === 'Reserved'
                                  ? isActive
                                    ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 hover:bg-amber-100'
                                  : isActive
                                  ? 'bg-slate-700 text-white border-slate-700 shadow-sm'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 hover:bg-slate-200'
                              }`}
                            >
                              <span className="flex items-center gap-1">
                                {isActive && <Check className="w-3 h-3" />}
                                {st}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Action Buttons: Edit, View Drawer, WhatsApp */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const plot = activePlotForQuickAction;
                            setActivePlotForQuickAction(null);
                            openEditPropertyModal(plot);
                          }}
                          className="flex-1 min-h-[40px] px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>Edit Plot Details</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const plot = activePlotForQuickAction;
                            setActivePlotForQuickAction(null);
                            openPropertyDrawer(plot);
                          }}
                          className="flex-1 min-h-[40px] px-3 bg-slate-900 hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <span>Full Property View</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleSharePlotWhatsApp(activePlotForQuickAction)}
                          className="flex-1 min-h-[38px] px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          <span>WhatsApp Quote</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            window.location.href = `tel:${settings.contactNumber.replace(/\D/g, '')}`;
                          }}
                          className="min-h-[38px] px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <PhoneCall className="w-3.5 h-3.5 text-slate-500" />
                          <span>Call</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Fullscreen Master Plan Lightbox */}
          <AnimatePresence>
            {previewPlanImage && (
              <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => setPreviewPlanImage(null)}
                  className="absolute top-4 right-4 text-white hover:text-slate-300 p-2.5 rounded-full bg-black/50 cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-6 h-6" />
                </button>
                <img
                  src={previewPlanImage}
                  alt="Full Layout Blueprint"
                  className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
                />
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
};
