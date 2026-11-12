import React from 'react';
import {
  Building2,
  Users,
  CheckCircle2,
  Clock,
  PhoneCall,
  MessageSquare,
  Eye,
  Plus,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  Calendar,
  FileText,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Lead, LeadStatus, LeadPreferredAction } from '../types';

export const Dashboard: React.FC = () => {
  const {
    stats,
    projects,
    properties,
    leads,
    filteredLeads,
    selectedProject,
    selectedProjectId,
    setSelectedProjectId,
    settings,
    openAddPropertyModal,
    openLeadDrawer,
  } = useApp();

  const formatShortDate = (iso?: string, fallbackYear?: number) => {
    if (iso) {
      const d = new Date(iso);
      if (!Number.isNaN(d.getTime())) {
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      }
    }
    return fallbackYear ? `Launch ${fallbackYear}` : '—';
  };

  const recentLeads = filteredLeads.slice(0, 5);

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'New':
        return 'bg-amber-50 text-[#CA8A04] border-amber-300 font-bold';
      case 'Contacted':
        return 'bg-emerald-50 text-[#15803D] border-emerald-300 font-bold';
      case 'Site Visited':
        return 'bg-[#15803D]/10 text-[#15803D] border-[#15803D]/30 font-bold';
      case 'Closed':
        return 'bg-red-50 text-[#991B1B] border-red-300 font-bold';
    }
  };

  const getActionBadge = (action: LeadPreferredAction) => {
    switch (action) {
      case 'Site Visit':
        return 'bg-emerald-100/80 text-emerald-900 border border-emerald-200';
      case 'WhatsApp':
        return 'bg-emerald-50 text-[#15803D] border border-emerald-200';
      case 'Callback':
        return 'bg-amber-50 text-amber-800 border border-amber-200';
    }
  };

  const handleCall = (phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `tel:${phone.replace(/\D/g, '')}`;
  };

  const handleWhatsApp = (phone: string, customerName: string, property: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanPhone = phone.replace(/\D/g, '');
    const message = `Hello ${customerName}, Vanakkam from ${settings.companyName}! Regarding your inquiry for ${property}, Rajesh RTR and our team are available for a site visit or to share the detailed plan brochure.`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-5">
      {/* ─────────────────────────────────────────────────────────────
          1. UNIFORM METRIC CARDS (Simple, Clean, Same Base Color)
          ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 w-full">
        {/* Total Units */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide">
              Total Units
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums">
              {stats.totalProperties}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 truncate font-medium">
              {selectedProject ? selectedProject.name : 'All Layouts'}
            </p>
          </div>
        </div>

        {/* Available Units */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide">
              Available
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[#15803D] dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums">
              {stats.availableUnits}
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 truncate">
              Immediate Booking
            </p>
          </div>
        </div>

        {/* Active Leads */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide">
              Active Leads
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-[#CA8A04] dark:text-amber-400 flex items-center justify-center">
              <Users className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums">
              {stats.activeLeads}
            </div>
            <p className="text-[11px] text-[#CA8A04] dark:text-amber-400 font-bold mt-0.5 truncate">
              Inquiry Pipeline
            </p>
          </div>
        </div>

        {/* Sold / Reserved */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide">
              Sold / Reserved
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-50 dark:bg-red-950/60 text-[#991B1B] dark:text-red-400 flex items-center justify-center">
              <Clock className="w-4 h-4 stroke-[2]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums">
              {stats.soldReservedUnits}
            </div>
            <p className="text-[11px] text-[#991B1B] dark:text-red-400 font-bold mt-0.5 truncate">
              Token or Registered
            </p>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CONSOLIDATED ALL-PROJECTS DATA & COUNT DETAILS (When 'all' selected)
          ───────────────────────────────────────────────────────────── */}
      {selectedProjectId === 'all' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="px-4 py-3.5 sm:px-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/70 dark:bg-slate-800/40">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#15803D]" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                All Projects — Consolidated Summary
              </h3>
            </div>
            <div className="flex items-center gap-2 flex-wrap text-[11px] font-bold">
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-[#15803D] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                {projects.length} Layouts
              </span>
              <span className="px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-[#CA8A04] dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                ₹{stats.totalValueLakhs} Lakhs Total Value
              </span>
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {projects.map((proj) => {
              const projProps = properties.filter((p) => p.projectId === proj.id);
              const totalCount = projProps.length;
              const availCount = projProps.filter((p) => p.status === 'Available').length;
              const reservedCount = projProps.filter((p) => p.status === 'Reserved').length;
              const soldCount = projProps.filter((p) => p.status === 'Sold').length;
              const projLeadsCount = leads.filter(
                (l) =>
                  l.projectId === proj.id ||
                  l.propertyOfInterest.toLowerCase().includes(proj.name.toLowerCase())
              ).length;
              const projValueLakhs = Math.round(
                projProps.reduce((acc, p) => acc + p.totalPrice, 0) / 100000
              );

              return (
                <button
                  key={proj.id}
                  type="button"
                  onClick={() => setSelectedProjectId(proj.id)}
                  className="w-full px-4 py-3.5 sm:px-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left flex flex-col lg:flex-row lg:items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {proj.name}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {proj.dtcpNumber}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#15803D]" />
                        {proj.location}, {proj.district}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Updated {formatShortDate(proj.updatedAt || proj.createdAt, proj.launchYear)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center shrink-0">
                    <div className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/70">
                      <span className="block text-[10px] font-semibold text-slate-400 uppercase">Plots</span>
                      <span className="text-xs font-black text-slate-900 dark:text-white tabular-nums">{totalCount}</span>
                    </div>
                    <div className="px-2.5 py-1.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40">
                      <span className="block text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase">Avail</span>
                      <span className="text-xs font-black text-[#15803D] dark:text-emerald-300 tabular-nums">{availCount}</span>
                    </div>
                    <div className="px-2.5 py-1.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/40">
                      <span className="block text-[10px] font-semibold text-amber-600 dark:text-amber-400 uppercase">Resv</span>
                      <span className="text-xs font-black text-[#CA8A04] dark:text-amber-300 tabular-nums">{reservedCount}</span>
                    </div>
                    <div className="px-2.5 py-1.5 rounded-xl bg-red-50/70 dark:bg-red-950/40">
                      <span className="block text-[10px] font-semibold text-red-600 dark:text-red-400 uppercase">Sold</span>
                      <span className="text-xs font-black text-[#991B1B] dark:text-red-300 tabular-nums">{soldCount}</span>
                    </div>
                    <div className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/70">
                      <span className="block text-[10px] font-semibold text-slate-400 uppercase">Leads</span>
                      <span className="text-xs font-black text-slate-900 dark:text-white tabular-nums">{projLeadsCount}</span>
                    </div>
                    <div className="px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/70">
                      <span className="block text-[10px] font-semibold text-slate-400 uppercase">Value</span>
                      <span className="text-xs font-black text-slate-900 dark:text-white tabular-nums">₹{projValueLakhs}L</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          3. QUICK ACTIONS BANNERS (BRAND FOREST GREEN)
          Rich, tactile Forest Green rows with circular dark green icons & gold pointers
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 w-full">
        {/* Action 1: Add New Property */}
        <button
          type="button"
          onClick={() => openAddPropertyModal()}
          className="group w-full min-h-[66px] p-4 sm:p-4.5 bg-[#15803D] hover:bg-[#11652E] active:scale-[0.99] border border-[#1E5C31] text-white rounded-2xl shadow-sm flex items-center justify-between transition-all cursor-pointer text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-[#113B24] border border-[#EAB308]/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <Plus className="w-6 h-6 text-[#EAB308] stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                Add New Property
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-0.5">
                Register plot to layout
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-5 h-5 text-[#EAB308] stroke-[2.5] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. RECENT LEAD INQUIRIES (Each Lead in its own Separate Card)
          ───────────────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {/* Section Header */}
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-[#15803D]" />
            <span>Recent Lead Inquiries</span>
          </h3>
        </div>

        {/* Separate Individual Cards for Each Lead */}
        <div className="space-y-2.5">
          {recentLeads.map((lead) => (
            <div
              key={lead.id}
              className="bg-white dark:bg-slate-900 rounded-xl p-3.5 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#15803D]/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              {/* Lead Info Body */}
              <div
                className="min-w-0 space-y-1.5 cursor-pointer flex-1"
                onClick={() => openLeadDrawer(lead)}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {lead.customerName}
                  </h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${getStatusBadge(
                      lead.status
                    )}`}
                  >
                    {lead.status}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getActionBadge(
                      lead.preferredAction
                    )}`}
                  >
                    {lead.preferredAction}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 flex-wrap">
                  <span className="font-semibold text-[#15803D] dark:text-emerald-400 truncate">
                    {lead.propertyOfInterest}
                  </span>
                  {lead.budgetLakhs && (
                    <>
                      <span>•</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        ₹{lead.budgetLakhs}L Budget
                      </span>
                    </>
                  )}
                  <span>•</span>
                  <span className="text-[11px] text-slate-400">{lead.phone}</span>
                  {lead.timestamp && (
                    <>
                      <span>•</span>
                      <span className="text-[11px] text-slate-400">{formatShortDate(lead.timestamp)}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 pt-1 md:pt-0">
                <button
                  type="button"
                  onClick={(e) => handleCall(lead.phone, e)}
                  className="min-h-[36px] px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-emerald-200"
                  title={`Call ${lead.customerName}`}
                >
                  <PhoneCall className="w-3.5 h-3.5 text-[#15803D]" />
                  <span>Call</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => handleWhatsApp(lead.phone, lead.customerName, lead.propertyOfInterest, e)}
                  className="min-h-[36px] px-3 bg-[#15803D] hover:bg-[#166534] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  title="Send WhatsApp Message"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
                <button
                  type="button"
                  onClick={() => openLeadDrawer(lead)}
                  className="min-h-[36px] px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  title="View Details"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
