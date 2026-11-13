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
  ChevronDown,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LayoutDisplayMode, Project, Property, PropertyStatus } from '../types';
import { ProjectDetailsOverview } from '../components/ProjectDetailsOverview';
import { MasterLayoutViewer } from '../components/public/MasterLayoutViewer';

export const Projects: React.FC = () => {
  const {
    projects,
    selectedProjectId: headerContextProjectId,
    setSelectedProjectId: setHeaderContextProjectId,
    setActiveTab,
    openAddProjectModal,
    openEditProjectModal,
    saveProject,
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
  const [masterLayoutSubTab, setMasterLayoutSubTab] = useState<'user-view' | 'plot-edit'>('user-view');
  const [layoutDisplayMode, setLayoutDisplayMode] = useState<LayoutDisplayMode>('topdown');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [gridSearchInput, setGridSearchInput] = useState<string>('');
  const [gridSearchQuery, setGridSearchQuery] = useState<string>('');
  const [activePlotForQuickAction, setActivePlotForQuickAction] = useState<Property | null>(null);

  // Catalog search & filter
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<string>('All Locations');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Listen for browser Back button on laptop & mobile to exit admin project layout or close quick action panel
  React.useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (activePlotForQuickAction) {
        setActivePlotForQuickAction(null);
        e.stopImmediatePropagation?.();
        return;
      }
      if (selectedProjectId) {
        setSelectedProjectId(null);
        e.stopImmediatePropagation?.();
        return;
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activePlotForQuickAction, selectedProjectId]);

  // Completed projects (incomplete drafts are kept in Add Project until all details are finished)
  const completedProjects = useMemo(() => {
    return projects.filter((p) => !p.isIncomplete);
  }, [projects]);

  // Filter completed projects by search query, location, and status for the catalog view
  const filteredProjects = useMemo(() => {
    return completedProjects.filter((proj) => {
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
  }, [completedProjects, searchQuery, selectedLocation, selectedStatus]);

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

  // Lookup the currently selected project for full-page rendering (must be completed)
  const viewingProject = useMemo(() => {
    if (!selectedProjectId) return null;
    return completedProjects.find((p) => p.id === selectedProjectId) || null;
  }, [completedProjects, selectedProjectId]);

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
    setActivePlotForQuickAction({ ...plot, status: newStatus });
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
              1. MINIMAL TOP BAR (Back button + Add Plot)
              ───────────────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => {
                setSelectedProjectId(null);
                setActivePlotForQuickAction(null);
              }}
              className="h-10 px-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#113B24] transition-colors cursor-pointer shadow-xs"
              title="Back to Projects"
              aria-label="Back to Projects"
            >
              <ArrowRight className="w-4 h-4 text-[#15803D] rotate-180 stroke-[2.5]" />
              <span>Back to Projects</span>
            </button>

            <button
              type="button"
              onClick={() => openAddPropertyModal(viewingProject.id)}
              className="min-h-[40px] px-4 py-2 text-xs sm:text-sm font-bold rounded-xl bg-[#15803D] hover:bg-[#166534] text-white flex items-center gap-1.5 transition cursor-pointer shadow-xs whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Add Plot</span>
            </button>
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
            <ProjectDetailsOverview
              project={viewingProject}
              totalPlots={countAll}
              availablePlots={countAvailable}
              soldPlots={countSold}
              onSaveProject={saveProject}
              onOpenMasterLayout={() => setDetailActiveMode('grid')}
              onDeleteProject={() => {
                deleteProject(viewingProject.id);
                setSelectedProjectId(null);
              }}
              onNotify={showToast}
            />
          )}

          {/* ─────────────────────────────────────────────────────────────
              3. MAIN CONTENT: TAB B: REALISTIC MASTER LAYOUT WITH ROADS & PLOT BLOCKS
              ───────────────────────────────────────────────────────────── */}
          {detailActiveMode === 'grid' && (
            <div className="flex flex-col gap-5 w-full">
              {/* Master Layout Sub-Tabs: User Website View vs Plot Edit Section */}
              <div className="bg-white rounded-2xl border border-slate-200 p-1.5 shadow-xs grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setMasterLayoutSubTab('user-view')}
                  className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    masterLayoutSubTab === 'user-view'
                      ? 'bg-[#113B24] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Eye className="w-4 h-4 text-[#EAB308]" />
                  <span>User Website View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMasterLayoutSubTab('plot-edit')}
                  className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    masterLayoutSubTab === 'plot-edit'
                      ? 'bg-[#113B24] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Pencil className="w-4 h-4 text-[#EAB308]" />
                  <span>Plot Edit Section ({countAll})</span>
                </button>
              </div>

              {/* SUB-TAB 1: USER WEBSITE VIEW */}
              {masterLayoutSubTab === 'user-view' && (
                <div className="space-y-4">
                  <div className="relative w-full h-[520px] sm:h-[620px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
                    <MasterLayoutViewer
                      project={viewingProject}
                      plots={viewingProjectPlots}
                      selectedPlot={activePlotForQuickAction}
                      onSelectPlot={(p) => setActivePlotForQuickAction(p)}
                      displayMode={layoutDisplayMode}
                      onModeChange={setLayoutDisplayMode}
                    />
                  </div>
                </div>
              )}

              {/* SUB-TAB 2: PLOT EDIT SECTION */}
              {masterLayoutSubTab === 'plot-edit' && (
                <div className="space-y-4">
                  {/* Search + Dropdown Filter Below Search */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm flex flex-col gap-3 w-full">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        setGridSearchQuery(gridSearchInput);
                      }}
                      className="flex items-center gap-2 w-full"
                    >
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Search plot # (e.g. 42), facing (e.g. North), or dimensions..."
                          value={gridSearchInput}
                          onChange={(e) => {
                            const val = e.target.value;
                            setGridSearchInput(val);
                            if (!val.trim()) setGridSearchQuery('');
                          }}
                          className="w-full h-10 pl-9 pr-3 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                        />
                      </div>
                      <button
                        type="submit"
                        className="h-10 px-4 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold inline-flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Search</span>
                      </button>
                    </form>

                    <div className="relative w-full">
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        aria-label="Filter plots by status"
                        className="w-full appearance-none pl-3.5 pr-9 py-2.5 text-xs sm:text-sm font-bold text-[#113B24] rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#15803D] cursor-pointer"
                      >
                        <option value="All">All Plots ({countAll})</option>
                        <option value="Available">Available ({countAvailable})</option>
                        <option value="Reserved">Reserved ({countReserved})</option>
                        <option value="Sold">Sold ({countSold})</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* All Plots Grid (Card Style) */}
                  <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm">
                    {filteredGridPlots.length === 0 ? (
                      <div className="p-8 text-center text-xs text-slate-500">
                        No plots match the current search or status filter.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 w-full">
                        {filteredGridPlots.map((plot) => renderPlotBox(plot))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PLOT EDIT PANEL (Centered Modal above bottom nav) */}
              {activePlotForQuickAction && (
                <div
                  className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 pb-28 sm:pb-6"
                  onClick={() => setActivePlotForQuickAction(null)}
                >
                  <div
                    className="w-full max-w-lg max-h-[85vh] overflow-y-auto p-5 bg-white rounded-3xl border-2 border-[#15803D] shadow-2xl space-y-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-1 rounded-lg bg-[#113B24] text-white text-xs font-bold uppercase tracking-wider">
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
                      Close ✕
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
                      <span className="text-[10px] text-slate-400 block font-bold uppercase">Facing &amp; Road</span>
                      <strong className="text-slate-900 dark:text-white">
                        {activePlotForQuickAction.facing} · {activePlotForQuickAction.roadWidth}
                      </strong>
                    </div>
                  </div>

                  {/* Plot Status Edit Options: Available / Sold / Reserved */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                      Update Plot Status
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Available', 'Sold', 'Reserved'] as PropertyStatus[]).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleQuickStatusChange(activePlotForQuickAction, st)}
                          className={`min-h-[38px] px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                            activePlotForQuickAction.status === st
                              ? st === 'Sold'
                                ? 'bg-red-600 text-white border-red-600 shadow-xs'
                                : st === 'Reserved'
                                ? 'bg-[#CA8A04] text-white border-[#CA8A04] shadow-xs'
                                : 'bg-[#15803D] text-white border-[#15803D] shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    <button
                      type="button"
                      onClick={() => openEditPropertyModal(activePlotForQuickAction)}
                      className="flex-1 min-h-[38px] px-3 py-1.5 bg-[#113B24] hover:bg-[#15803D] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5 text-[#EAB308]" />
                      <span>Edit Full Plot</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => openPropertyDrawer(activePlotForQuickAction)}
                      className="min-h-[38px] px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Details</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSharePlotWhatsApp(activePlotForQuickAction)}
                      className="min-h-[38px] px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share</span>
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
            {completedProjects.length}
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Townships registered</p>
        </div>

        <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-300 dark:border-emerald-700 shadow-xs">
          <span className="text-[10px] sm:text-xs font-bold text-[#15803D] dark:text-emerald-300 uppercase tracking-wide block">
            Active Layouts
          </span>
          <div className="text-xl sm:text-2xl font-black text-[#15803D] dark:text-emerald-400 mt-1 tabular-nums">
            {completedProjects.filter((p) => p.status === 'Active').length}
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
          {/* Search Box + Search Button */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSearchQuery(searchInput);
            }}
            className="flex items-center gap-2 w-full sm:w-96"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by project name, layout, or DTCP number..."
                value={searchInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchInput(val);
                  if (!val.trim()) setSearchQuery('');
                }}
                className="w-full min-h-[44px] pl-10 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#15803D]"
              />
            </div>
            <button
              type="submit"
              className="min-h-[44px] px-4 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold inline-flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>
          </form>

          {/* Dropdown Filters in the Same Row */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Location Dropdown */}
            <div className="relative flex-1 sm:w-44">
              <MapPin className="w-3.5 h-3.5 text-[#15803D] dark:text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full min-h-[44px] pl-8 pr-8 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#15803D] appearance-none cursor-pointer"
              >
                <option value="All Locations">All Locations</option>
                <option value="Cuddalore">Cuddalore</option>
                <option value="Chidambaram">Chidambaram</option>
                <option value="Pondy / ECR">Pondy / ECR</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Status Dropdown */}
            <div className="relative flex-1 sm:w-40">
              <Filter className="w-3.5 h-3.5 text-[#CA8A04] dark:text-[#EAB308] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full min-h-[44px] pl-8 pr-8 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#15803D] appearance-none cursor-pointer"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Upcoming">Upcoming</option>
                <option value="Completed">Completed</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Register New Project Button (Positioned on the Right, navigates to Add Projects) */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('hotspot-simulator');
            openNewProjectWizard();
          }}
          className="min-h-[42px] px-4 py-2 bg-[#15803D] hover:bg-[#166534] active:scale-[0.98] text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm border border-[#CA8A04]/40 hover:border-[#EAB308] transition-all cursor-pointer shrink-0 whitespace-nowrap self-stretch sm:self-auto"
        >
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
              <div className="p-4 pt-0">
                {/* View More button opens full-page screen */}
                <button
                  type="button"
                  onClick={() => {
                    try { window.history.pushState({ subView: 'admin-project', id: proj.id }, ''); } catch {}
                    setSelectedProjectId(proj.id);
                    setDetailActiveMode('overview');
                  }}
                  className="w-full min-h-[42px] px-3 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs border border-[#1E5C31]"
                >
                  <Eye className="w-3.5 h-3.5 text-white" />
                  <span>View More</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
