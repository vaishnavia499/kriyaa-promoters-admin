import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Plus,
  PhoneCall,
  MessageSquare,
  Eye,
  Calendar,
  Clock,
  Compass,
  Building2,
  Trash2,
  MapPin,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Lead, LeadStatus, LeadPreferredAction } from '../types';

export const Leads: React.FC = () => {
  const {
    filteredLeads: contextFilteredLeads,
    selectedProject,
    selectedProjectId,
    setSelectedProjectId,
    openLeadDrawer,
    deleteLead,
    settings,
    saveLead,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('All Leads');

  // Filter tabs per prompt specifications
  const filterTabs = ['All Leads', 'New', 'Contacted', 'Site Visited', 'Closed'];

  const filteredLeads = useMemo(() => {
    return contextFilteredLeads.filter((lead) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = lead.customerName.toLowerCase().includes(q);
        const matchPhone = lead.phone.includes(q);
        const matchProp = lead.propertyOfInterest.toLowerCase().includes(q);
        const matchNotes = lead.notes.some((n) => n.toLowerCase().includes(q));
        if (!matchName && !matchPhone && !matchProp && !matchNotes) return false;
      }

      // Filter tab
      if (selectedFilter !== 'All Leads' && lead.status !== selectedFilter) {
        return false;
      }

      return true;
    });
  }, [contextFilteredLeads, searchQuery, selectedFilter]);

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
        return 'bg-emerald-100 text-emerald-800';
      case 'WhatsApp':
        return 'bg-emerald-50 text-emerald-700';
      case 'Callback':
        return 'bg-slate-100 text-slate-700';
    }
  };

  const handleCall = (phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `tel:${phone.replace(/\D/g, '')}`;
  };

  const handleWhatsApp = (phone: string, customerName: string, property: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanPhone = phone.replace(/\D/g, '');
    const message = `Hello ${customerName}, Greetings from ${settings.companyName}! Rajesh RTR here regarding your inquiry for ${property}. Would you like to schedule an on-site visit or discuss the DTCP layout plan?`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleQuickAddLead = () => {
    const randomId = Math.floor(Math.random() * 80) + 1;
    saveLead({
      customerName: 'New On-Site Visitor',
      phone: '+91 98400 ' + Math.floor(10000 + Math.random() * 90000),
      propertyOfInterest: `Golden City Plot #${randomId}`,
      preferredAction: 'Site Visit',
      status: 'New',
      budgetLakhs: 28,
      notes: [`Inquiry captured on-site at Golden City entrance office`],
    });
  };

  return (
    <div className="space-y-5">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER & FILTER TABS
          ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <span>
                {selectedProject ? `${selectedProject.name} · Client Inquiries` : 'Leads & Client Follow-Ups'}
              </span>
            </h2>
          </div>
        </div>

        {/* Active Context Filter Banner */}
        {selectedProject && (
          <div className="p-2.5 px-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="font-semibold text-emerald-900 dark:text-emerald-200 truncate">
                Active Layout Filter: <strong>{selectedProject.name}</strong> ({selectedProject.location})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedProjectId('all')}
              className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:underline shrink-0 cursor-pointer"
            >
              Show All Projects
            </button>
          </div>
        )}

        {/* Stacked Search & Status Filter Controls (Row 1: Search, Row 2: Pills in One Line + Log New Lead) */}
        <div className="flex flex-col gap-3 w-full pt-2 border-t border-slate-100">
          {/* Row 1: Full-Width Search Input */}
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search leads by customer name, mobile, or property..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Row 2: Status Filter Buttons / Pills Below the Search Bar in One Line + Log New Lead */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar flex-nowrap text-xs">
              {filterTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedFilter(tab)}
                  className={`min-h-[36px] px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                    selectedFilter === tab
                      ? 'bg-[#15803D] text-white shadow-sm border border-[#15803D]'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/60'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Log New Lead Button Below Search on the Right */}
            <button
              type="button"
              onClick={handleQuickAddLead}
              className="min-h-[40px] px-4 py-2 bg-[#15803D] hover:bg-[#166534] active:scale-[0.98] text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm border border-[#CA8A04]/40 hover:border-[#EAB308] transition-all cursor-pointer whitespace-nowrap shrink-0 self-stretch sm:self-auto"
            >
              <Plus className="w-4 h-4 text-[#EAB308]" />
              <span>Log New Lead</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. LEADS FEED (Card Stack on Mobile, Data Table on Laptop)
          ───────────────────────────────────────────────────────────── */}
      {filteredLeads.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
          <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800">No leads found</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search criteria or filter tab.
          </p>
        </div>
      ) : (
        <>
          {/* A. MOBILE VIEW (< 768px): Card Stack */}
          <div className="md:hidden space-y-3">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                onClick={() => openLeadDrawer(lead)}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:border-slate-300 transition-all cursor-pointer space-y-3"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full border-b border-slate-100 pb-2.5">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-bold text-slate-900 break-words">{lead.customerName}</h3>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
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
                </div>

                {/* Property & Note Preview */}
                <div className="space-y-1.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <span className="font-semibold text-emerald-900 break-words">
                      {lead.propertyOfInterest}
                    </span>
                    {lead.budgetLakhs && (
                      <span className="font-bold text-slate-800 shrink-0">
                        Budget ~₹{lead.budgetLakhs}L
                      </span>
                    )}
                  </div>

                  {lead.notes && lead.notes.length > 0 && (
                    <p className="text-[11px] text-slate-500 line-clamp-2 italic px-1 break-words">
                      "{lead.notes[0]}"
                    </p>
                  )}
                </div>

                {/* Action Buttons (Min 44x44px touch targets) */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={(e) => handleCall(lead.phone, e)}
                    className="flex-1 min-h-[44px] px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Call</span>
                  </button>

                  <button
                    onClick={(e) => handleWhatsApp(lead.phone, lead.customerName, lead.propertyOfInterest, e)}
                    className="flex-1 min-h-[44px] px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => openLeadDrawer(lead)}
                    className="min-h-[44px] px-3.5 bg-[#15803D] hover:bg-[#166534] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-colors cursor-pointer border border-[#1E5C31]"
                  >
                    <Eye className="w-4 h-4 text-white" />
                    <span>View</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* B. LAPTOP VIEW (≥ 768px): Structured Data Table */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase text-[11px] font-bold">
                <tr>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Property of Interest</th>
                  <th className="p-4 text-center">Preferred Action</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={() => openLeadDrawer(lead)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="p-4 font-bold text-slate-900 text-sm">
                      {lead.customerName}
                    </td>
                    <td className="p-4 font-medium text-emerald-800">
                      {lead.propertyOfInterest}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-block text-[11px] font-semibold px-2.5 py-1 rounded-full ${getActionBadge(
                          lead.preferredAction
                        )}`}
                      >
                        {lead.preferredAction}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`inline-block text-[11px] font-bold px-2.5 py-1 rounded-md border uppercase tracking-wider ${getStatusBadge(
                          lead.status
                        )}`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleCall(lead.phone, e)}
                          title="Call Phone"
                          className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors cursor-pointer"
                        >
                          <PhoneCall className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleWhatsApp(lead.phone, lead.customerName, lead.propertyOfInterest, e)}
                          title="WhatsApp Message"
                          className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openLeadDrawer(lead)}
                          title="View Details & Notes"
                          className="min-h-[38px] px-3 bg-[#15803D] hover:bg-[#166534] text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer border border-[#1E5C31]"
                        >
                          <Eye className="w-3.5 h-3.5 text-white" />
                          <span>View</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
