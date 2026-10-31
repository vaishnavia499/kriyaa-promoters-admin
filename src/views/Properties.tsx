import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Building2,
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Sparkles,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  ExternalLink,
  Phone,
  MessageCircle,
  FileText,
  AlertTriangle,
  User,
  Calendar,
  Layers,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Property, PropertyStatus, Project, Lead } from '../types';

export const Properties: React.FC = () => {
  const {
    properties,
    projects,
    leads,
    selectedProjectId,
    setSelectedProjectId,
    openEditProjectModal,
    openNewProjectWizard,
    openEditPropertyModal,
    updatePropertyStatus,
    deleteProperty,
    settings,
  } = useApp();

  // In-page inspection detail view
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatusTab, setActiveStatusTab] = useState<'All' | 'Sold' | 'Reserved' | 'Visited' | 'Available'>('All');
  const [filterProjectId, setFilterProjectId] = useState<string>('all');

  // Match plot with linked lead (by project + plot number)
  const getLinkedLead = (prop: Property): Lead | undefined => {
    return leads.find((l) => {
      const matchProject = !l.projectId || l.projectId === prop.projectId;
      const targetPlotStr = `plot #${prop.plotNumber}`.toLowerCase();
      const targetPlotNumOnly = prop.plotNumber.toLowerCase();
      const poi = (l.propertyOfInterest || '').toLowerCase();
      return matchProject && (poi.includes(targetPlotStr) || poi.includes(`plot ${targetPlotNumOnly}`) || poi.includes(`#${targetPlotNumOnly}`));
    });
  };

  // Status Counts
  const soldCount = properties.filter((p) => p.status === 'Sold').length;
  const resCount = properties.filter((p) => p.status === 'Reserved').length;
  const availCount = properties.filter((p) => p.status === 'Available').length;
  const visitedLeadsCount = properties.filter((p) => {
    const lead = getLinkedLead(p);
    return lead !== undefined;
  }).length;

  // Filtered properties for the master inventory table
  const filteredProperties = useMemo(() => {
    return properties.filter((prop) => {
      // Project filter
      if (filterProjectId !== 'all' && prop.projectId !== filterProjectId) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = prop.title.toLowerCase().includes(q);
        const matchPlot = prop.plotNumber.toLowerCase().includes(q);
        const matchAddress = prop.address.toLowerCase().includes(q);
        const matchProject = (prop.projectName || '').toLowerCase().includes(q);
        const lead = getLinkedLead(prop);
        const matchLead = lead ? lead.customerName.toLowerCase().includes(q) || lead.phone.includes(q) : false;
        if (!matchTitle && !matchPlot && !matchAddress && !matchProject && !matchLead) return false;
      }

      // Categorized status tabs
      if (activeStatusTab === 'Sold') return prop.status === 'Sold';
      if (activeStatusTab === 'Reserved') return prop.status === 'Reserved';
      if (activeStatusTab === 'Available') return prop.status === 'Available';
      if (activeStatusTab === 'Visited') {
        const lead = getLinkedLead(prop);
        return lead !== undefined || prop.status === 'Reserved' || prop.status === 'Sold';
      }

      return true;
    });
  }, [properties, searchQuery, activeStatusTab, filterProjectId, leads]);

  // Active property for detail view
  const activeProperty = useMemo(() => {
    if (!selectedPropertyId) return null;
    return properties.find((p) => p.id === selectedPropertyId) || null;
  }, [properties, selectedPropertyId]);

  const handleDeleteProperty = (property: Property) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${property.title}" (Plot #${property.plotNumber})?\n\nThis action cannot be undone.`
    );
    if (confirmed) {
      deleteProperty(property.id);
      setSelectedPropertyId(null);
    }
  };

  const getStatusBadgeClass = (status: PropertyStatus) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-50 border border-emerald-500/40 text-[#15803D] dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700';
      case 'Reserved':
        return 'bg-amber-50 border border-amber-500/40 text-[#CA8A04] dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700';
      case 'Sold':
        return 'bg-red-50 border border-red-500/40 text-[#991B1B] dark:bg-red-950/60 dark:text-red-300 dark:border-red-700';
    }
  };

  // ─────────────────────────────────────────────────────────────
  // FULL-SCREEN IN-PAGE DETAIL VIEW
  // ─────────────────────────────────────────────────────────────
  if (selectedPropertyId !== null) {
    if (!activeProperty) {
      return (
        <div className="p-8 text-center bg-white dark:bg-[#0B2516] rounded-2xl border border-slate-200 dark:border-[#1E5D32] shadow-sm max-w-xl mx-auto my-8">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">Property not found or deleted.</p>
          <button
            type="button"
            onClick={() => setSelectedPropertyId(null)}
            className="mt-4 px-4 py-2 bg-[#15803D] text-white rounded-xl text-xs font-bold hover:bg-[#166534] transition-colors"
          >
            Back to Inventory List
          </button>
        </div>
      );
    }

    const linkedLead = getLinkedLead(activeProperty);

    return (
      <div className="w-full space-y-5 animate-in fade-in duration-200">
        {/* Top Back Navigation Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-[#0B2516] p-4 rounded-2xl border border-slate-200 dark:border-[#1E5D32] shadow-sm">
          <button
            type="button"
            onClick={() => setSelectedPropertyId(null)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-[#112F1C] dark:hover:bg-[#164329] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Inventory Table</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openEditPropertyModal(activeProperty)}
              className="px-3.5 py-2 text-xs font-bold rounded-xl bg-[#15803D] hover:bg-[#166534] text-white flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5 text-[#EAB308]" />
              <span>Edit Plot Specs</span>
            </button>
            <button
              type="button"
              onClick={() => handleDeleteProperty(activeProperty)}
              className="p-2 text-xs font-bold rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 transition-all cursor-pointer"
              title="Delete Plot"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Plot Details Card */}
        <div className="bg-white dark:bg-[#0B2516] rounded-3xl border border-slate-200 dark:border-[#1E5D32] p-6 shadow-md space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-[#1E5D32]">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-[#15803D]/10 text-[#15803D] dark:text-emerald-400 border border-[#15803D]/30">
                  {activeProperty.projectName}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${getStatusBadgeClass(activeProperty.status)}`}>
                  {activeProperty.status}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2">
                Plot #{activeProperty.plotNumber} · {activeProperty.title}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{activeProperty.address}</span>
              </p>
            </div>

            <div className="text-left md:text-right">
              <span className="text-[10px] font-black uppercase text-slate-400 block">Total Investment</span>
              <span className="text-2xl sm:text-3xl font-black text-[#15803D] dark:text-emerald-400 block">
                ₹{(activeProperty.totalPrice / 100000).toFixed(2)} Lakhs
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                ₹{activeProperty.pricePerSqFt} / sq.ft
              </span>
            </div>
          </div>

          {/* Key Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#112F1C] border border-slate-200 dark:border-[#1E5D32]/60">
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Dimensions</span>
              <span className="font-extrabold text-slate-900 dark:text-white text-sm mt-0.5 block">{activeProperty.plotDimensions}</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#112F1C] border border-slate-200 dark:border-[#1E5D32]/60">
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Area Extent</span>
              <span className="font-extrabold text-slate-900 dark:text-white text-sm mt-0.5 block">
                {activeProperty.areaSqFt} sq.ft <span className="text-xs font-normal text-slate-500">({activeProperty.areaCents} Cts)</span>
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#112F1C] border border-slate-200 dark:border-[#1E5D32]/60">
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Facing</span>
              <span className="font-extrabold text-slate-900 dark:text-white text-sm mt-0.5 block">{activeProperty.facing} Facing</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#112F1C] border border-slate-200 dark:border-[#1E5D32]/60">
              <span className="text-slate-400 font-bold uppercase text-[10px] block">Road Width</span>
              <span className="font-extrabold text-slate-900 dark:text-white text-sm mt-0.5 block">{activeProperty.roadWidth}</span>
            </div>
          </div>

          {/* Linked Lead / Buyer Section if present */}
          {linkedLead && (
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-900 dark:text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-amber-600" />
                  Linked Buyer / Inquiring Lead
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-white">
                  {linkedLead.status}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <p className="font-extrabold text-slate-900 dark:text-white text-sm">{linkedLead.customerName}</p>
                  <p className="text-slate-600 dark:text-slate-300 font-mono mt-0.5">{linkedLead.phone}</p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${linkedLead.phone}`}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 hover:bg-emerald-700"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call
                  </a>
                  <a
                    href={`https://wa.me/${linkedLead.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 hover:bg-emerald-800"
                  >
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {activeProperty.description && (
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Property Notes</h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-[#112F1C] p-3.5 rounded-xl border border-slate-200 dark:border-[#1E5D32]">
                {activeProperty.description}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // PROPERTIES & MASTER INVENTORY VIEW
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="w-full max-w-full space-y-6 select-none">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER & REGISTER NEW PROJECT CTA
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0B2516] rounded-3xl border border-slate-200 dark:border-[#1E5D32] p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#15803D]/10 text-[#15803D] dark:text-emerald-400">
              <Building2 className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Properties &amp; Plot Inventory
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Master inventory records, status management, buyer assignments, and lead inquiries.
          </p>
        </div>

        {/* Top Right Action: Register New Project CTA */}
        <button
          type="button"
          onClick={openNewProjectWizard}
          className="min-h-[44px] px-5 py-2.5 bg-gradient-to-r from-[#15803D] via-[#166534] to-[#113B24] hover:brightness-110 active:scale-[0.98] text-white text-xs sm:text-sm font-black rounded-xl flex items-center justify-center gap-2 shadow-md border border-[#EAB308]/40 transition-all cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4 text-[#EAB308]" />
          <span>+ Register New Project</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. PROJECT CARDS (With "Edit Details" - metadata/pricing only)
          ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#15803D]" />
            Registered Projects ({projects.length})
          </h2>
          <span className="text-[11px] text-slate-400">Click "Edit Details" to modify metadata and text specs</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((proj) => {
            const projPlots = properties.filter((p) => p.projectId === proj.id);
            const pSold = projPlots.filter((p) => p.status === 'Sold').length;
            const pRes = projPlots.filter((p) => p.status === 'Reserved').length;
            const pAvail = projPlots.filter((p) => p.status === 'Available').length;
            const isFilterActive = filterProjectId === proj.id;

            return (
              <div
                key={proj.id}
                className={`p-4 rounded-2xl border transition-all bg-white dark:bg-[#0B2516] shadow-sm flex flex-col justify-between gap-3 ${
                  isFilterActive
                    ? 'border-[#15803D] ring-2 ring-[#15803D]/20 shadow-md'
                    : 'border-slate-200 dark:border-[#1E5D32] hover:border-slate-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                        {proj.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>{proj.location}</span>
                      </p>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-100 dark:bg-[#112F1C] text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-[#1E5D32]">
                      {proj.dtcpNumber || 'DTCP Approved'}
                    </span>
                  </div>

                  {/* Stats Pill Row */}
                  <div className="grid grid-cols-3 gap-1.5 py-2 px-2.5 rounded-xl bg-slate-50 dark:bg-[#112F1C] text-center text-[10px]">
                    <div>
                      <span className="text-slate-400 block font-bold">Total</span>
                      <span className="font-black text-slate-900 dark:text-white text-xs">{projPlots.length}</span>
                    </div>
                    <div>
                      <span className="text-emerald-600 font-bold block">Available</span>
                      <span className="font-black text-emerald-700 dark:text-emerald-400 text-xs">{pAvail}</span>
                    </div>
                    <div>
                      <span className="text-rose-600 font-bold block">Sold/Hold</span>
                      <span className="font-black text-rose-700 dark:text-rose-400 text-xs">{pSold + pRes}</span>
                    </div>
                  </div>
                </div>

                {/* Project Card Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-[#1E5D32]/60">
                  <button
                    type="button"
                    onClick={() => openEditProjectModal(proj)}
                    className="flex-1 min-h-[36px] px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#112F1C] dark:hover:bg-[#164329] text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5 text-[#EAB308]" />
                    <span>Edit Details</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFilterProjectId(isFilterActive ? 'all' : proj.id)}
                    className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      isFilterActive
                        ? 'bg-[#15803D] text-white shadow-sm'
                        : 'bg-emerald-50 text-[#15803D] hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300'
                    }`}
                  >
                    {isFilterActive ? 'Viewing Plots ✓' : 'Filter Plots'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. MASTER INVENTORY & ACTIVITY BREAKDOWN TABLE
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0B2516] rounded-3xl border border-slate-200 dark:border-[#1E5D32] p-5 sm:p-6 shadow-sm space-y-4">
        {/* Filter Controls Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-[#1E5D32]/60">
          {/* Status Tabs: All, Sold Out, Reserved / Hold, Visited / Inquired, Available */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar flex-nowrap text-xs">
            {[
              { id: 'All', label: 'All Plots', count: properties.length },
              { id: 'Sold', label: 'Sold Out', count: soldCount, color: 'text-rose-600' },
              { id: 'Reserved', label: 'Reserved / Hold', count: resCount, color: 'text-amber-600' },
              { id: 'Visited', label: 'Visited / Inquired Leads', count: visitedLeadsCount, color: 'text-purple-600' },
              { id: 'Available', label: 'Available', count: availCount, color: 'text-emerald-600' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveStatusTab(tab.id as any)}
                className={`min-h-[38px] px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeStatusTab === tab.id
                    ? 'bg-[#15803D] text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-[#112F1C] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#164329]'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    activeStatusTab === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search & Project Filter on Right */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Project Filter Select */}
            <select
              value={filterProjectId}
              onChange={(e) => setFilterProjectId(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#112F1C] border border-slate-200 dark:border-[#1E5D32] text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Projects ({projects.length})</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search plot #, buyer, area..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 dark:bg-[#112F1C] border border-slate-200 dark:border-[#1E5D32] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Master Inventory Table */}
        {filteredProperties.length === 0 ? (
          <div className="p-12 text-center bg-slate-50 dark:bg-[#112F1C]/40 rounded-2xl border border-slate-200 dark:border-[#1E5D32]">
            <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No plots found</h3>
            <p className="text-xs text-slate-500 mt-1">
              No plot records match the selected status tab or search filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-[#1E5D32]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#113B24] text-white uppercase text-[10px] font-mono tracking-wider">
                <tr>
                  <th className="py-3 px-4">Project &amp; Plot #</th>
                  <th className="py-3 px-4">Dimensions &amp; Area</th>
                  <th className="py-3 px-4">Facing &amp; Road</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Buyer / Inquirer Contact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#1E5D32] bg-white dark:bg-[#0B2516]">
                {filteredProperties.map((prop) => {
                  const linkedLead = getLinkedLead(prop);

                  return (
                    <tr
                      key={prop.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-[#112F1C]/60 transition-colors"
                    >
                      {/* 1. Project & Plot # */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-lg bg-emerald-100 text-[#15803D] dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-black text-xs shrink-0">
                            #{prop.plotNumber}
                          </span>
                          <div>
                            <span className="font-extrabold text-slate-900 dark:text-white block text-xs">
                              {prop.title}
                            </span>
                            <span className="text-[10px] text-slate-400 block font-medium">
                              {prop.projectName}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Dimensions & Area */}
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block">
                          {prop.plotDimensions}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                          {prop.areaSqFt} sq.ft ({prop.areaCents} Cts)
                        </span>
                      </td>

                      {/* 3. Facing & Road */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                          {prop.facing} Facing
                        </span>
                        <span className="text-[10px] text-slate-400 block">{prop.roadWidth}</span>
                      </td>

                      {/* 4. Price */}
                      <td className="py-3 px-4">
                        <span className="font-black text-[#15803D] dark:text-emerald-400 block">
                          ₹{(prop.totalPrice / 100000).toFixed(2)} Lakhs
                        </span>
                        <span className="text-[10px] text-slate-400 block">₹{prop.pricePerSqFt}/sq.ft</span>
                      </td>

                      {/* 5. Buyer / Inquirer Contact */}
                      <td className="py-3 px-4">
                        {linkedLead ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-extrabold text-slate-900 dark:text-white block text-xs">
                                {linkedLead.customerName}
                              </span>
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                                {linkedLead.status}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-500 font-mono">{linkedLead.phone}</span>
                              <a
                                href={`tel:${linkedLead.phone}`}
                                title="Call Buyer"
                                className="p-1 rounded bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700"
                              >
                                <Phone className="w-3 h-3" />
                              </a>
                              <a
                                href={`https://wa.me/${linkedLead.phone.replace(/[^0-9]/g, '')}`}
                                target="_blank"
                                rel="noreferrer"
                                title="WhatsApp Buyer"
                                className="p-1 rounded bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700"
                              >
                                <MessageCircle className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">No buyer assigned</span>
                        )}
                      </td>

                      {/* 6. Status with Direct Live Toggle */}
                      <td className="py-3 px-4">
                        <select
                          value={prop.status}
                          onChange={(e) => updatePropertyStatus(prop.id, e.target.value as PropertyStatus)}
                          className={`px-2.5 py-1 rounded-xl text-[11px] font-black border cursor-pointer focus:outline-none ${getStatusBadgeClass(
                            prop.status
                          )}`}
                        >
                          <option value="Available">Available</option>
                          <option value="Reserved">Reserved</option>
                          <option value="Sold">Sold</option>
                        </select>
                      </td>

                      {/* 7. Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedPropertyId(prop.id)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-[#112F1C] dark:hover:bg-[#164329] dark:text-slate-200 cursor-pointer"
                            title="View Plot Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditPropertyModal(prop)}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:hover:bg-emerald-900 dark:text-emerald-300 cursor-pointer"
                            title="Edit Plot Specifications"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProperty(prop)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950 dark:hover:bg-rose-900 dark:text-rose-300 cursor-pointer"
                            title="Delete Plot Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
