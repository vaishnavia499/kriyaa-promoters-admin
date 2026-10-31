import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Search,
  Eye,
  LayoutGrid,
  Sparkles,
  Compass,
  Check,
  PhoneCall,
  MessageSquare,
  Share2,
  ExternalLink,
  Layers,
  ArrowRight,
  Maximize2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Project, Property, PropertyStatus } from '../types';

export const Projects: React.FC = () => {
  const {
    projects,
    selectedProjectId: headerContextProjectId,
    setSelectedProjectId: setHeaderContextProjectId,
    setActiveTab,
    openAddProjectModal,
    openEditProjectModal,
    openNewProjectWizard,
    openVisualizeProject,
    deleteProject,
    properties,
    updatePropertyStatus,
    openAddPropertyModal,
    openEditPropertyModal,
    settings,
    showToast,
    openPropertyDrawer,
  } = useApp();

  // Full-page screen transition state (null = catalog view, string = dedicated full-page view)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Full-page view mode ('overview' | 'grid')
  const [detailActiveMode, setDetailActiveMode] = useState<'overview' | 'grid'>('overview');

  // Master Layout Grid controls
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [gridSearchQuery, setGridSearchQuery] = useState<string>('');
  const [activePlotForQuickAction, setActivePlotForQuickAction] = useState<Property | null>(null);

  // Catalog search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('All Locations');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Filter projects by search query, location, and status for the catalog view
  const filteredProjects = useMemo(() => {
    return projects.filter((proj) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = proj.name?.toLowerCase().includes(q);
        const matchLoc = proj.location?.toLowerCase().includes(q);
        const matchDist = proj.district?.toLowerCase().includes(q);
        const matchDtcp = proj.dtcpNumber?.toLowerCase().includes(q);
        if (!matchName && !matchLoc && !matchDist && !matchDtcp) return false;
      }
      if (selectedLocation !== 'All Locations') {
        const fullLoc = `${proj.location} ${proj.district || ''}`.toLowerCase();
        if (selectedLocation === 'Cuddalore' && !fullLoc.includes('cuddalore')) return false;
        if (selectedLocation === 'Chidambaram' && !fullLoc.includes('chidambaram')) return false;
        if (selectedLocation === 'Pondy / ECR' && !fullLoc.includes('pondy') && !fullLoc.includes('ecr') && !fullLoc.includes('puducherry')) return false;
      }
      if (selectedStatus !== 'All' && proj.status !== selectedStatus) {
        return false;
      }
      return true;
    });
  }, [projects, searchQuery, selectedLocation, selectedStatus]);

  const getProjectStats = (projectId: string) => {
    const projProps = properties.filter((p) => p.projectId === projectId);
    const available = projProps.filter((p) => p.status === 'Available').length;
    const reservedSold = projProps.filter((p) => p.status === 'Reserved' || p.status === 'Sold').length;
    const total = projProps.length;
    const percentAvailable = total > 0 ? Math.round((available / total) * 100) : 0;
    return {
      total,
      available,
      reservedSold,
      percentAvailable,
    };
  };

  // Lookup the currently selected project for full-page rendering
  const viewingProject = useMemo(() => {
    if (!selectedProjectId) return null;
    return projects.find((p) => p.id === selectedProjectId) || null;
  }, [projects, selectedProjectId]);

  // Plots belonging to the viewing project
  const viewingProjectPlots = useMemo(() => {
    if (!viewingProject) return [];
    return properties.filter((p) => p.projectId === viewingProject.id);
  }, [properties, viewingProject]);

  // Natural sorting for layout grid plots
  const sortedPlots = useMemo(() => {
    return [...viewingProjectPlots].sort((a, b) => {
      const numA = parseInt(a.plotNumber.replace(/\D/g, ''), 10);
      const numB = parseInt(b.plotNumber.replace(/\D/g, ''), 10);
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      return a.plotNumber.localeCompare(b.plotNumber, undefined, { numeric: true, sensitivity: 'base' });
    });
  }, [viewingProjectPlots]);

  // Filtered plots based on grid filter pills and plot search
  const filteredGridPlots = useMemo(() => {
    return sortedPlots.filter((plot) => {
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
  }, [sortedPlots, statusFilter, gridSearchQuery]);

  // Separate commercial plots and regular residential plots for realistic layout sectors
  const commercialPlots = useMemo(() => {
    return filteredGridPlots.filter(
      (p) => p.category === 'Commercial' || p.plotNumber.toUpperCase().startsWith('C')
    );
  }, [filteredGridPlots]);

  const regularPlots = useMemo(() => {
    return filteredGridPlots.filter(
      (p) => !(p.category === 'Commercial' || p.plotNumber.toUpperCase().startsWith('C'))
    );
  }, [filteredGridPlots]);

  // Partition regular plots into Sector A (North Block) and Sector B (South Block)
  const { northBlockPlots, southBlockPlots } = useMemo(() => {
    const half = Math.ceil(regularPlots.length / 2);
    return {
      northBlockPlots: regularPlots.slice(0, half),
      southBlockPlots: regularPlots.slice(half),
    };
  }, [regularPlots]);

  // Status counts for the viewing project
  const countAll = viewingProjectPlots.length;
  const countAvailable = viewingProjectPlots.filter((p) => p.status === 'Available').length;
  const countReserved = viewingProjectPlots.filter((p) => p.status === 'Reserved').length;
  const countSold = viewingProjectPlots.filter((p) => p.status === 'Sold').length;

  const handleQuickStatusChange = (plot: Property, newStatus: PropertyStatus) => {
    updatePropertyStatus(plot.id, newStatus);
    showToast(`Plot #${plot.plotNumber} updated to ${newStatus}`, 'success');
  };

  const handleSharePlotWhatsApp = (plot: Property) => {
    if (!viewingProject) return;
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

  // Helper to render proportional rectangular plot unit cards
  const renderPlotBox = (plot: Property) => {
    const isSelected = activePlotForQuickAction?.id === plot.id;
    const formattedDimensions = plot.plotDimensions
      .replace(/ft/gi, '')
      .replace(/\s*x\s*/gi, '×')
      .trim();

    let statusBoxStyles =
      'bg-emerald-50 border-[#15803D]/40 text-[#15803D] dark:bg-emerald-950/40 dark:border-emerald-700 dark:text-emerald-200';
    if (plot.status === 'Reserved') {
      statusBoxStyles =
        'bg-amber-50 border-[#EAB308]/60 text-[#CA8A04] dark:bg-amber-950/40 dark:border-amber-700 dark:text-amber-200';
    } else if (plot.status === 'Sold') {
      statusBoxStyles =
        'bg-red-50/70 border-red-200 text-[#991B1B] dark:bg-red-950/40 dark:border-red-900/60 dark:text-red-300';
    }

    return (
      <div
        key={plot.id}
        onClick={() => {
          setActivePlotForQuickAction(plot);
        }}
        className={`relative p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between select-none ${statusBoxStyles} ${
          isSelected
            ? 'ring-3 ring-emerald-500 shadow-md scale-[1.02]'
            : 'hover:shadow-md hover:scale-[1.01]'
        }`}
      >
        {/* Top Row: Plot Number + Corner Badge + Direct Details Drawer Icon */}
        <div className="flex items-center justify-between gap-1">
          <span
            className={`text-base font-black ${
              plot.status === 'Sold' ? 'line-through opacity-75' : ''
            }`}
          >
            #{plot.plotNumber}
          </span>
          <div className="flex items-center gap-1">
            {plot.isCornerPlot && (
              <span
                className="p-1 rounded-md bg-amber-500 text-white shrink-0"
                title="Corner Plot"
              >
                <Sparkles className="w-2.5 h-2.5" />
              </span>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openPropertyDrawer(plot);
              }}
              className="p-1 rounded-md hover:bg-black/10 dark:hover:bg-white/20 text-slate-600 dark:text-slate-300 transition-colors"
              title="Open Property Spec Drawer"
            >
              <Eye className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Middle: Facing & Dimensions */}
        <div className="py-2 space-y-0.5">
          <span className="block text-xs font-bold leading-tight font-mono">
            {plot.facing || 'North'} • {formattedDimensions}
          </span>
          <span className="block text-[10px] opacity-75">
            {plot.areaSqFt} sq.ft
          </span>
        </div>

        {/* Bottom: Price & Status Pill */}
        <div className="pt-2 border-t border-black/10 dark:border-white/10 flex items-center justify-between text-[10px]">
          <span className="font-extrabold tabular-nums">
            ₹{(plot.totalPrice / 100000).toFixed(1)}L
          </span>
          <span
            className={`px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider ${
              plot.status === 'Available'
                ? 'bg-emerald-50 border border-emerald-400 text-emerald-900 font-semibold'
                : plot.status === 'Reserved'
                ? 'bg-amber-50 border border-amber-400 text-amber-900 font-semibold'
                : 'bg-slate-100 border border-slate-300 text-slate-500 line-through'
            }`}
          >
            {plot.status}
          </span>
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────
  // DEDICATED FULL-PAGE SCREEN TRANSITION (selectedProjectId !== null)
  // Single-Column Vertical Flow (max-w-5xl mx-auto), Zero Overlay Modals
  // ─────────────────────────────────────────────────────────────
  if (selectedProjectId !== null) {
    if (!viewingProject) {
      return (
        <div className="w-full max-w-full p-0 sm:p-2 min-h-screen bg-[#F8FAFC] dark:bg-slate-950 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => {
                setSelectedProjectId(null);
                setActivePlotForQuickAction(null);
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer shadow-xs"
            >
              ← Back to Projects
            </button>
          </div>
          <div className="p-8 sm:p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <Building2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Project Not Found</h3>
            <p className="text-xs text-slate-500 mt-1">The requested project layout does not exist or was deleted.</p>
          </div>
        </div>
      );
    }

    const isContextActive = headerContextProjectId === viewingProject.id;
    const contactPhone = settings.contactNumber || '9443275727';
    const cleanPhone = contactPhone.replace(/[^0-9]/g, '');

    return (
      <div className="w-full max-w-full p-0 sm:p-2 min-h-screen bg-[#F8FAFC] dark:bg-slate-950">
        <div className="flex flex-col gap-6 w-full max-w-5xl mx-auto">
          {/* ─────────────────────────────────────────────────────────────
              1. HEADER BAR (Back button, project title, DTCP badge, quick edit actions)
              ───────────────────────────────────────────────────────────── */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 md:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              {/* Back Arrow Button Only */}
              <button
                type="button"
                onClick={() => {
                  setSelectedProjectId(null);
                  setActivePlotForQuickAction(null);
                }}
                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shadow-xs shrink-0"
                title="Back to Projects"
                aria-label="Back to Projects"
              >
                <ArrowRight className="w-5 h-5 text-[#15803D] dark:text-emerald-400 rotate-180 stroke-[2.5]" />
              </button>

              {/* Properly Aligned Actions: Edit Project & Add Plot */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditProjectModal(viewingProject)}
                  className="min-h-[38px] px-3.5 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5 transition cursor-pointer shadow-xs whitespace-nowrap"
                >
                  <Pencil className="w-3.5 h-3.5 text-[#CA8A04]" />
                  <span>Edit Project</span>
                </button>

                <button
                  type="button"
                  onClick={() => openAddPropertyModal(viewingProject.id)}
                  className="min-h-[38px] px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#15803D] hover:bg-[#166534] text-white flex items-center gap-1.5 transition cursor-pointer shadow-xs whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Plot</span>
                </button>
              </div>
            </div>

            {/* Title & Badges */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                    {viewingProject.status} Layout
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    {viewingProject.dtcpNumber}
                  </span>
                  {viewingProject.reraNumber && (
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-semibold">
                      {viewingProject.reraNumber}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-2">
                  {viewingProject.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1 flex-wrap">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {viewingProject.location} · {viewingProject.district}
                  </span>
                  {viewingProject.totalAreaExtent && (
                    <>
                      <span>•</span>
                      <span>
                        Extent: <strong>{viewingProject.totalAreaExtent}</strong>
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              2. MODE TOGGLE TAB ("Project Overview" vs "Master Layout")
              ───────────────────────────────────────────────────────────── */}
          <div className="flex items-center p-1.5 bg-slate-200/70 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <button
              type="button"
              onClick={() => setDetailActiveMode('overview')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                detailActiveMode === 'overview'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>Project Overview</span>
            </button>
            <button
              type="button"
              onClick={() => setDetailActiveMode('grid')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                detailActiveMode === 'grid'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-4 h-4 text-emerald-600" />
              <span>Master Layout ({viewingProjectPlots.length} Plots)</span>
            </button>
          </div>

          {/* ─────────────────────────────────────────────────────────────
              3. MAIN CONTENT CONTAINER: SINGLE CARD UNIFIED OVERVIEW
              ───────────────────────────────────────────────────────────── */}
          {detailActiveMode === 'overview' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800 w-full">
              {/* 1. Master Plan Layout Blueprint Image & Call Action */}
              <div>
                <div className="relative h-72 sm:h-96 w-full bg-slate-900">
                  <img
                    src={viewingProject.masterPlanImage}
                    alt={viewingProject.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />

                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-xs text-white text-xs font-bold border border-white/20">
                      Master Layout Blueprint
                    </span>
                    <span className="px-3 py-1.5 rounded-xl bg-[#15803D] text-white text-xs font-bold shadow-sm">
                      DTCP Approved Plan
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <p className="text-xs text-slate-300">Sanctioned Township Layout</p>
                    <p className="text-xl font-bold drop-shadow">{viewingProject.name}</p>
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => setDetailActiveMode('grid')}
                    className="text-[#15803D] dark:text-emerald-400 font-bold hover:underline flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Explore Master Layout Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <a
                    href={`tel:${contactPhone}`}
                    className="min-h-[38px] px-4 py-2 bg-[#15803D] hover:bg-[#166534] active:scale-[0.98] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Call</span>
                  </a>
                </div>
              </div>

              {/* 2. Plot Inventory Summary & Allocation */}
              <div className="p-5 md:p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Inventory Status & Plot Allocation
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Real-time availability for {viewingProject.name}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-center border border-slate-100 dark:border-slate-700/60">
                    <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Total Plots</span>
                    <strong className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 block">
                      {countAll}
                    </strong>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-center border border-emerald-200 dark:border-emerald-800">
                    <span className="text-xs text-emerald-800 dark:text-emerald-300 block font-medium">Available Units</span>
                    <strong className="text-2xl sm:text-3xl font-black text-[#15803D] dark:text-emerald-400 mt-1 block">
                      {countAvailable}
                    </strong>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-center border border-amber-200 dark:border-amber-800">
                    <span className="text-xs text-amber-800 dark:text-amber-300 block font-medium">Sold / Reserved</span>
                    <strong className="text-2xl sm:text-3xl font-black text-[#CA8A04] dark:text-amber-400 mt-1 block">
                      {countReserved + countSold}
                    </strong>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setDetailActiveMode('grid')}
                  className="w-full py-3 px-4 bg-[#15803D] hover:bg-[#11652E] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm border border-[#1E5C31]"
                >
                  <LayoutGrid className="w-4 h-4 text-[#EAB308]" />
                  <span>View Architectural Master Layout with Roads & Plot Blocks</span>
                </button>
              </div>

              {/* 3. Township Overview & Strategic Location */}
              <div className="p-5 md:p-6 space-y-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#15803D]" />
                  <span>Township Overview & Strategic Location</span>
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {viewingProject.description}
                </p>
              </div>

              {/* 4. Government Approvals & Legal Title */}
              <div className="p-5 md:p-6 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <ShieldCheck className="w-5 h-5 text-[#15803D]" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Government Approvals & Legal Title
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 block">
                        DTCP Approval
                      </span>
                      <strong className="text-xs text-slate-900 dark:text-white">
                        {viewingProject.dtcpNumber}
                      </strong>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block mt-0.5">Approved & Clear</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-800 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#CA8A04] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-300 block">
                        RERA Registration
                      </span>
                      <strong className="text-xs text-slate-900 dark:text-white">
                        {viewingProject.reraNumber || 'TN/RERA/0428/2024'}
                      </strong>
                      <span className="text-[10px] text-[#CA8A04] dark:text-amber-400 block mt-0.5">Registered Layout</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 block">
                        Patta Transfer
                      </span>
                      <strong className="text-xs text-slate-900 dark:text-white">Subdivided Patta</strong>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block mt-0.5">Immediate Registry</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Township Infrastructure & Highlights */}
              <div className="p-5 md:p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Township Infrastructure & Highlights
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 dark:text-white block font-bold">
                        Blacktop Tar Roads
                      </strong>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">40ft & 30ft wide internal network roads</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 dark:text-white block font-bold">
                        Three-Phase Electricity
                      </strong>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">EB line pillars and solar avenue street lights</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 dark:text-white block font-bold">
                        Potable Groundwater
                      </strong>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">Sweet drinking water at 30-40ft depth</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900 dark:text-white block font-bold">
                        Secured Gated Layout
                      </strong>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">Perimeter compound fencing & entrance arch</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 6. Danger Zone: Delete Project (Inside single card at bottom) */}
              <div className="p-5 md:p-6 bg-red-50/40 dark:bg-red-950/20 space-y-2.5">
                <span className="text-[11px] uppercase font-bold text-[#991B1B] dark:text-red-400 block">
                  Danger Zone
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Permanently delete this project layout and all associated data.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const confirmed = window.confirm(`Are you sure you want to delete "${viewingProject.name}"?\n\nThis will remove the project and its records. This cannot be undone.`);
                    if (confirmed) {
                      deleteProject(viewingProject.id);
                      setSelectedProjectId(null);
                    }
                  }}
                  className="min-h-[42px] px-4 py-2 bg-[#991B1B] hover:bg-red-800 active:scale-[0.99] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Project</span>
                </button>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────────────────
              3. MAIN CONTENT: TAB B: REALISTIC MASTER LAYOUT WITH ROADS & PLOT BLOCKS
              ───────────────────────────────────────────────────────────── */}
          {detailActiveMode === 'grid' && (
            <div className="flex flex-col gap-6 w-full">
              {/* Control Bar: Full-Width Search Input & Status Filter Pills */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm flex flex-col gap-3 w-full">
                {/* Row 1: Full-Width Plot Search */}
                <div className="relative w-full">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search plot # (e.g. 42), facing (e.g. North), or dimensions..."
                    value={gridSearchQuery}
                    onChange={(e) => setGridSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Row 2: Filter Pills with Counts Below Search */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar flex-wrap text-xs">
                  {[
                    { id: 'All', label: 'All Units', count: countAll },
                    { id: 'Available', label: 'Available', count: countAvailable },
                    { id: 'Reserved', label: 'Reserved', count: countReserved },
                    { id: 'Sold', label: 'Sold', count: countSold },
                  ].map((pill) => (
                    <button
                      key={pill.id}
                      type="button"
                      onClick={() => setStatusFilter(pill.id)}
                      className={`min-h-[36px] px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                        statusFilter === pill.id
                          ? 'bg-[#15803D] text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      <span>{pill.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          statusFilter === pill.id
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {pill.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Architectural Site Plan Container */}
              <div className="bg-white dark:bg-slate-900/90 rounded-3xl border-2 border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm space-y-6">
                {/* Blueprint Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>DTCP Sanctioned Site Layout Plan</span>
                    </span>
                    <span className="text-slate-500 font-mono font-bold">
                      {viewingProject.dtcpNumber}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-medium">
                    <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                      <Compass className="w-3.5 h-3.5 text-emerald-600" />
                      <strong>North Facing Layout (Vastu Aligned)</strong>
                    </span>
                  </div>
                </div>

                {/* ─────────────────────────────────────────────────────────
                    ZONE 1: COMMERCIAL ZONE & RETAIL FRONTAGE
                    ───────────────────────────────────────────────────────── */}
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border-2 border-dashed border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 select-none shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 text-base font-bold">
                        🏪
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100">
                            Approved Frontage
                          </span>
                          <span className="text-xs font-black uppercase tracking-wider text-amber-950 dark:text-amber-100">
                            Commercial Zone & Retail Boulevard
                          </span>
                        </div>
                        <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                          Designated for Supermarket, Diagnostic Clinic, Pharmacy, and Banking ATM
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-amber-800 dark:text-amber-200 bg-white/80 dark:bg-slate-900/80 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-800 self-start sm:self-auto">
                      60 Ft Main Road Visibility
                    </span>
                  </div>

                  {commercialPlots.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full pt-1">
                      {commercialPlots.map((plot) => renderPlotBox(plot))}
                    </div>
                  )}
                </div>

                {/* ─────────────────────────────────────────────────────────
                    ROAD 1: 40 FT MAIN ACCESS ROAD
                    ───────────────────────────────────────────────────────── */}
                <div className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold py-2 px-3 rounded flex items-center justify-center tracking-wider uppercase select-none shadow-xs">
                  🛣️ 40 Ft Main Road · Main Entrance Boulevard
                </div>

                {/* ─────────────────────────────────────────────────────────
                    BLOCK 1: SECTOR A (NORTH BLOCK PLOTS)
                    ───────────────────────────────────────────────────────── */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        Sector A · North Block Plots (Along 40 Ft Boulevard)
                      </h4>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      {northBlockPlots.length} Plots
                    </span>
                  </div>

                  {northBlockPlots.length === 0 ? (
                    <div className="p-4 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500 border border-slate-100 dark:border-slate-800">
                      No plots match the current filter in North Block.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
                      {northBlockPlots.map((plot) => renderPlotBox(plot))}
                    </div>
                  )}
                </div>

                {/* ─────────────────────────────────────────────────────────
                    ROAD 2: 30 FT CROSS STREET - NORTH
                    ───────────────────────────────────────────────────────── */}
                <div className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold py-2 px-3 rounded flex items-center justify-center tracking-wider uppercase select-none">
                  🛣️ 30 Ft Cross Street · North Sector Pathway
                </div>

                {/* ─────────────────────────────────────────────────────────
                    ZONE 2: OSR / PARK AREA (Green Tint)
                    ───────────────────────────────────────────────────────── */}
                <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border-2 border-dashed border-emerald-400 dark:border-emerald-700 flex flex-col sm:flex-row items-center justify-between gap-3 text-emerald-900 dark:text-emerald-200 select-none shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 text-xl font-bold">
                      🌳
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-emerald-200/80 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100">
                          DTCP Mandated 10% Reserve
                        </span>
                        <span className="text-xs font-black uppercase tracking-wider text-emerald-950 dark:text-emerald-100">
                          OSR / Park & Recreational Green Area
                        </span>
                      </div>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                        Landscaped Children Park · Jogging Track · Tree-Lined Buffer Avenue
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-200 bg-white/80 dark:bg-slate-900/80 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                      Public Utility Handover Deed
                    </span>
                  </div>
                </div>

                {/* ─────────────────────────────────────────────────────────
                    ROAD 3: 30 FT CENTRAL AVENUE
                    ───────────────────────────────────────────────────────── */}
                <div className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold py-2 px-3 rounded flex items-center justify-center tracking-wider uppercase select-none">
                  🛣️ 30 Ft Central Avenue · East-West Connector
                </div>

                {/* ─────────────────────────────────────────────────────────
                    BLOCK 2: SECTOR B (SOUTH BLOCK PLOTS)
                    ───────────────────────────────────────────────────────── */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308]" />
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        Sector B · South Block Plots (Adjoining Park & South Gate)
                      </h4>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      {southBlockPlots.length} Plots
                    </span>
                  </div>

                  {southBlockPlots.length === 0 ? (
                    <div className="p-4 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-500 border border-slate-100 dark:border-slate-800">
                      No plots match the current filter in South Block.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full">
                      {southBlockPlots.map((plot) => renderPlotBox(plot))}
                    </div>
                  )}
                </div>

                {/* ─────────────────────────────────────────────────────────
                    ROAD 4: 30 FT CROSS STREET - SOUTH
                    ───────────────────────────────────────────────────────── */}
                <div className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold py-2 px-3 rounded flex items-center justify-center tracking-wider uppercase select-none">
                  🛣️ 30 Ft Cross Street · South Corridor
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────
                  INLINE PLOT QUICK ACTION & PRICE BREAKDOWN PANEL
                  ───────────────────────────────────────────────────────── */}
              {activePlotForQuickAction && (
                <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-2xl border-2 border-emerald-500 shadow-md space-y-4 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-xs font-bold uppercase tracking-wider">
                        Plot #{activePlotForQuickAction.plotNumber}
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {activePlotForQuickAction.title}
                      </span>
                      {activePlotForQuickAction.isCornerPlot && (
                        <span className="px-2 py-0.5 rounded bg-amber-500 text-white text-[10px] font-bold">
                          Corner Unit
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setActivePlotForQuickAction(null)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 self-end sm:self-auto cursor-pointer"
                    >
                      Close Panel ✕
                    </button>
                  </div>

                  {/* Specs Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Dimensions</span>
                      <strong className="text-slate-900 dark:text-white font-mono">
                        {activePlotForQuickAction.plotDimensions}
                      </strong>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Extent Area</span>
                      <strong className="text-slate-900 dark:text-white">
                        {activePlotForQuickAction.areaSqFt} sq.ft ({activePlotForQuickAction.areaCents} Cts)
                      </strong>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Price Breakdown</span>
                      <strong className="text-emerald-700 dark:text-emerald-400">
                        ₹{(activePlotForQuickAction.totalPrice / 100000).toFixed(2)} Lakhs
                      </strong>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Facing & Road</span>
                      <strong className="text-slate-900 dark:text-white">
                        {activePlotForQuickAction.facing} · {activePlotForQuickAction.roadWidth}
                      </strong>
                    </div>
                  </div>

                  {/* Quick 1-Tap Status Updater & Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Set Status:</span>
                      {(['Available', 'Reserved', 'Sold'] as PropertyStatus[]).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleQuickStatusChange(activePlotForQuickAction, st)}
                          className={`min-h-[34px] px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                            activePlotForQuickAction.status === st
                              ? 'bg-[#15803D] text-white border-[#15803D] shadow-xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => openPropertyDrawer(activePlotForQuickAction)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        <span>View Details Drawer</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditPropertyModal(activePlotForQuickAction)}
                        className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit Plot</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSharePlotWhatsApp(activePlotForQuickAction)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>WhatsApp Share</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // STANDARD CATALOG VIEW (When selectedProjectId === null)
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* ─────────────────────────────────────────────────────────────
          1. SUMMARY METRIC STRIP (First: Compact Cards)
          ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide block">
            Total Layouts
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">
            {projects.length}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Townships registered</p>
        </div>

        <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-700 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-[#15803D] dark:text-emerald-300 uppercase tracking-wide block">
            Active Layouts
          </span>
          <div className="text-xl sm:text-2xl font-black text-[#15803D] dark:text-emerald-400 mt-1 tabular-nums">
            {projects.filter((p) => p.status === 'Active').length}
          </div>
          <p className="text-[10px] text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">Currently selling</p>
        </div>

        <div className="bg-amber-50/50 dark:bg-amber-950/20 p-3.5 rounded-xl border border-amber-200 dark:border-amber-800/80 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wide block">
            Total Inventory Plots
          </span>
          <div className="text-xl sm:text-2xl font-black text-amber-900 dark:text-amber-300 mt-1 tabular-nums">
            {properties.length}
          </div>
          <p className="text-[10px] text-amber-800/80 dark:text-amber-300/80 mt-0.5">Across all layouts</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide block">
            Available Plots
          </span>
          <div className="text-xl sm:text-2xl font-black text-[#15803D] dark:text-emerald-400 mt-1 tabular-nums">
            {properties.filter((p) => p.status === 'Available').length}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Ready for booking</p>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. SEARCH, FILTER & REGISTER BUTTON ON RIGHT
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex flex-col lg:flex-row gap-3.5 items-stretch lg:items-center justify-between">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto flex-1 flex-wrap">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by project name, layout, or DTCP number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full min-h-[44px] pl-10 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#15803D]"
            />
          </div>

          {/* Location Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 flex-nowrap no-scrollbar text-xs">
            {['All Locations', 'Cuddalore', 'Chidambaram', 'Pondy / ECR'].map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setSelectedLocation(loc)}
                className={`min-h-[44px] px-3.5 font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center justify-center border ${
                  selectedLocation === loc
                    ? 'bg-[#15803D] text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 flex-nowrap no-scrollbar text-xs">
            {['All', 'Active', 'Upcoming', 'Completed'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatus(st)}
                className={`min-h-[44px] px-3.5 font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center justify-center border ${
                  selectedStatus === st
                    ? 'bg-[#EAB308] text-slate-950 border-[#CA8A04] shadow-xs font-black'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Register New Project Button (Positioned on the Right, clean without extra +) */}
        <button
          type="button"
          onClick={openNewProjectWizard}
          className="min-h-[42px] px-4 py-2 bg-[#15803D] hover:bg-[#166534] active:scale-[0.98] text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm border border-[#CA8A04]/40 hover:border-[#EAB308] transition-all cursor-pointer shrink-0 whitespace-nowrap self-stretch sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#EAB308]" />
          <span>Register New Project</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. PROJECT CARDS GRID
          ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map((proj) => {
          const stats = getProjectStats(proj.id);
          const isContextActive = headerContextProjectId === proj.id;

          return (
            <div
              key={proj.id}
              className={`bg-white dark:bg-slate-900 rounded-3xl border transition-all duration-200 overflow-hidden shadow-sm flex flex-col justify-between ${
                isContextActive
                  ? 'ring-2 ring-emerald-500 border-emerald-500 dark:border-emerald-500 shadow-md'
                  : 'border-slate-200 dark:border-slate-800 hover:shadow-md'
              }`}
            >
              <div>
                {/* Master Plan Thumbnail (Click opens dedicated full-page screen) */}
                <div
                  onClick={() => {
                    setSelectedProjectId(proj.id);
                    setDetailActiveMode('overview');
                  }}
                  className="relative h-44 sm:h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden group cursor-pointer"
                >
                  <img
                    src={proj.masterPlanImage}
                    alt={proj.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider shadow-sm ${
                        proj.status === 'Active'
                          ? 'bg-emerald-500 text-white'
                          : proj.status === 'Upcoming'
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-700 text-white'
                      }`}
                    >
                      {proj.status} Layout
                    </span>

                    {/* Extent Badge */}
                    {proj.totalAreaExtent && (
                      <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold">
                        {proj.totalAreaExtent}
                      </span>
                    )}
                  </div>

                  {/* Bottom Image Overlay: Project Name & District */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="text-lg font-black tracking-tight leading-tight drop-shadow-sm">
                      {proj.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-semibold mt-0.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{proj.location} · {proj.district}</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3.5">
                  {/* Approvals: DTCP & RERA */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-300 text-[11px] font-extrabold flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{proj.dtcpNumber}</span>
                    </div>
                    {proj.reraNumber && (
                      <span className="px-2 py-1 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                        {proj.reraNumber}
                      </span>
                    )}
                  </div>

                  {/* Plot Statistics Bar */}
                  <div
                    onClick={() => {
                      setSelectedProjectId(proj.id);
                      setDetailActiveMode('grid');
                    }}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/50 dark:hover:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2 cursor-pointer transition-colors"
                    title="Click to view Master Layout Grid"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
                        <LayoutGrid className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        <span>Inventory Allocation</span>
                      </span>
                      <span className="font-extrabold text-slate-900 dark:text-white tabular-nums">
                        {stats.total} Total Plots
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex">
                      <div
                        style={{ width: `${stats.percentAvailable}%` }}
                        className="bg-emerald-500 h-full rounded-full transition-all"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-0.5">
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                        {stats.available} Available
                      </span>
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        {stats.reservedSold} Reserved / Sold
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {proj.description}
                  </p>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 pt-0 space-y-2">
                <div className="flex items-center gap-2">
                  {/* View More button opens full-page screen */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProjectId(proj.id);
                      setDetailActiveMode('overview');
                    }}
                    className="flex-1 min-h-[42px] px-3 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs border border-[#1E5C31]"
                  >
                    <Eye className="w-3.5 h-3.5 text-white" />
                    <span>View More</span>
                  </button>

                  {/* Layout Grid button opens full-page grid view directly */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProjectId(proj.id);
                      setDetailActiveMode('grid');
                    }}
                    className="min-h-[42px] px-3 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="Open Master Layout Grid"
                  >
                    <LayoutGrid className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="hidden sm:inline">Layout Grid</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      openVisualizeProject(proj.id);
                    }}
                    className="min-h-[42px] px-3 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="Open Plot Management Studio"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span className="hidden sm:inline">Plot Studio</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditProjectModal(proj)}
                    className="min-h-[42px] min-w-[42px] p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                    title="Edit Layout Details"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete project "${proj.name}"? Associated plots will remain in catalog.`)) {
                        deleteProject(proj.id);
                      }
                    }}
                    className="min-h-[42px] min-w-[42px] p-2 bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/40 text-slate-500 hover:text-red-600 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                    title="Delete Layout"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Quick Context Filter Toggle */}
                <button
                  type="button"
                  onClick={() => setHeaderContextProjectId(isContextActive ? 'all' : proj.id)}
                  className={`w-full min-h-[34px] px-3 py-1.5 text-[11px] font-bold rounded-xl border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    isContextActive
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{isContextActive ? 'Active in Top Header (Click to Clear)' : 'Set as Active Header Context'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
