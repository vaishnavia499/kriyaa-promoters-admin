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
  ShieldCheck,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Lead, LeadStatus, LeadPreferredAction } from '../types';

export const Dashboard: React.FC = () => {
  const {
    stats,
    filteredLeads,
    filteredProperties,
    selectedProject,
    selectedProjectId,
    setSelectedProjectId,
    settings,
    openAddPropertyModal,
    setActiveTab,
    openLeadDrawer,
    openPropertyDrawer,
  } = useApp();

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
          1. LARGE HERO CARD (RICH FOREST GRADIENT)
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-b from-[#1E4D2B] to-[#122D1A] rounded-3xl p-5 sm:p-6 border border-[#1E5D32] shadow-sm relative overflow-hidden text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          {/* Inner Top: Gold-tinted shield label */}
          <div className="flex items-center gap-2 text-xs font-semibold text-[#EAB308] flex-wrap">
            <ShieldCheck className="w-4 h-4 text-[#EAB308]" />
            <span className="uppercase tracking-wider font-black">
              {settings.companyName || 'KRIYAA PROMOTERS'} • DTCP Layouts
            </span>
          </div>

          {/* Main Title: Bold, crisp white text */}
          <h2 className="text-xl md:text-2xl font-black text-white mt-1.5">
            {selectedProject ? selectedProject.name : 'All Projects & Layouts'}
          </h2>

          {/* Body: Subtitle and "Managed by Rajesh RTR." highlight in metallic yellow-gold */}
          <p className="text-xs md:text-sm text-slate-200 mt-1 max-w-xl leading-relaxed">
            {selectedProject
              ? `${selectedProject.description} Located in ${selectedProject.location}, ${selectedProject.district}. `
              : `Promotions, Residential & Commercial layouts across ${settings.locationsServed}. `}
            <span className="text-[#EAB308] font-semibold underline">
              Managed by {settings.ownerName || 'Rajesh RTR'}.
            </span>
          </p>
        </div>

        {/* Dark Badge Pods: Dual background pills at the bottom with a subtle orange alert/active indicator */}
        <div className="flex items-center gap-2.5 shrink-0 pt-2 md:pt-0">
          <div className="relative px-3.5 py-2 bg-[#0B2516]/90 border border-[#1E5D32] rounded-2xl text-xs shadow-xs">
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#EAB308] ring-2 ring-[#0B2516]" />
            <span className="text-[#76B084] block text-[10px] uppercase font-bold tracking-wider">
              DTCP APPROVAL
            </span>
            <span className="font-bold text-[#EAB308]">
              {selectedProject ? selectedProject.dtcpNumber : (settings.dtcpNumber || 'DTCP No. 182/2023')}
            </span>
          </div>

          <div className="px-3.5 py-2 bg-[#0B2516]/90 border border-[#1E5D32] rounded-2xl text-xs shadow-xs">
            <span className="text-[#76B084] block text-[10px] uppercase font-bold tracking-wider">
              TOTAL INVENTORY
            </span>
            <span className="font-bold text-white">₹{stats.totalValueLakhs} Lakhs</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. UNIFORM METRIC CARDS (Simple, Clean, Same Base Color)
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

        {/* Action 2: View Recent Leads */}
        <button
          type="button"
          onClick={() => setActiveTab('leads')}
          className="group w-full min-h-[66px] p-4 sm:p-4.5 bg-[#15803D] hover:bg-[#11652E] active:scale-[0.99] border border-[#1E5C31] text-white rounded-2xl shadow-sm flex items-center justify-between transition-all cursor-pointer text-left"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-[#113B24] border border-[#EAB308]/30 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-xs">
              <Users className="w-6 h-6 text-[#EAB308] stroke-[2]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-tight">
                View Recent Leads
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-0.5">
                Customer pipeline & visits
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

          <button
            type="button"
            onClick={() => setActiveTab('leads')}
            className="text-xs font-bold text-[#15803D] hover:text-[#166534] flex items-center gap-1 cursor-pointer"
          >
            <span>View All Leads</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
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
