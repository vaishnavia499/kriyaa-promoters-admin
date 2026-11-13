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
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Lead, LeadStatus, LeadPreferredAction } from '../types';

export const Leads: React.FC = () => {
  const {
    filteredLeads: contextFilteredLeads,
    projects,
    selectedProject,
    selectedProjectId,
    setSelectedProjectId,
    openLeadDrawer,
    deleteLead,
    settings,
    saveLead,
  } = useApp();

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('All Leads');

  // Manual Lead Entry Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [leadProjectId, setLeadProjectId] = useState<string>(
    selectedProjectId !== 'all' ? selectedProjectId : projects[0]?.id || ''
  );
  const [propertyOfInterest, setPropertyOfInterest] = useState('');
  const [preferredAction, setPreferredAction] = useState<LeadPreferredAction>('Site Visit');
  const [status, setStatus] = useState<LeadStatus>('New');
  const [budgetLakhs, setBudgetLakhs] = useState('');
  const [noteText, setNoteText] = useState('');
  const [formError, setFormError] = useState('');

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

  const openAddLeadModal = () => {
    setCustomerName('');
    setPhone('');
    setEmail('');
    setLeadProjectId(selectedProjectId !== 'all' ? selectedProjectId : projects[0]?.id || '');
    setPropertyOfInterest('');
    setPreferredAction('Site Visit');
    setStatus('New');
    setBudgetLakhs('');
    setNoteText('');
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setFormError('Please enter the customer name.');
      return;
    }
    if (!phone.trim()) {
      setFormError('Please enter the customer phone number.');
      return;
    }

    const chosenProject = projects.find((p) => p.id === leadProjectId);
    const interest =
      propertyOfInterest.trim() || (chosenProject ? `${chosenProject.name} Enquiry` : 'General Plot Enquiry');

    saveLead({
      projectId: leadProjectId || undefined,
      customerName: customerName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      propertyOfInterest: interest,
      preferredAction,
      status,
      budgetLakhs: budgetLakhs ? Number(budgetLakhs) : undefined,
      notes: noteText.trim() ? [noteText.trim()] : [],
    });

    setIsAddModalOpen(false);
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
          {/* Row 1: Search Input + Search Button */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSearchQuery(searchInput);
            }}
            className="flex items-center gap-2 w-full"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search leads by customer name, mobile, or property..."
                value={searchInput}
                onChange={(e) => {
                  const val = e.target.value;
                  setSearchInput(val);
                  if (!val.trim()) setSearchQuery('');
                }}
                className="w-full h-10 text-xs sm:text-sm pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
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

          {/* Row 2: Status Filter Dropdown + Log New Lead */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full">
            <div className="w-full sm:w-56">
              <label htmlFor="lead-status-filter" className="sr-only">
                Filter leads by status
              </label>
              <select
                id="lead-status-filter"
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {filterTabs.map((tab) => (
                  <option key={tab} value={tab}>
                    {tab}
                  </option>
                ))}
              </select>
            </div>

            {/* Log New Lead Button Below Search on the Right */}
            <button
              type="button"
              onClick={openAddLeadModal}
              className="min-h-[40px] px-4 py-2 bg-[#15803D] hover:bg-[#166534] active:scale-[0.98] text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm border border-[#CA8A04]/40 hover:border-[#EAB308] transition-all cursor-pointer whitespace-nowrap shrink-0 self-stretch sm:self-auto"
            >
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

      {/* Manual Lead Entry Modal */}
      {isAddModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#0B2516] border border-slate-200 dark:border-[#1E5D32] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 bg-[#113B24] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#EAB308]" />
                <h3 className="text-sm font-bold">Add New Lead Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                aria-label="Close modal"
                className="p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="p-5 space-y-3.5 text-xs">
              {formError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 font-semibold">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Customer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Karthik Sundaram"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-[#1E5D32] bg-slate-50 dark:bg-[#112F1C] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98400 12345"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-[#1E5D32] bg-slate-50 dark:bg-[#112F1C] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-[#1E5D32] bg-slate-50 dark:bg-[#112F1C] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Project / Layout
                  </label>
                  <select
                    value={leadProjectId}
                    onChange={(e) => setLeadProjectId(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-[#1E5D32] bg-slate-50 dark:bg-[#112F1C] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Property / Plot of Interest
                  </label>
                  <input
                    type="text"
                    value={propertyOfInterest}
                    onChange={(e) => setPropertyOfInterest(e.target.value)}
                    placeholder="e.g. Golden City Plot #14"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-[#1E5D32] bg-slate-50 dark:bg-[#112F1C] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Budget (₹ Lakhs)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={budgetLakhs}
                    onChange={(e) => setBudgetLakhs(e.target.value)}
                    placeholder="e.g. 28"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-[#1E5D32] bg-slate-50 dark:bg-[#112F1C] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Preferred Action
                  </label>
                  <select
                    value={preferredAction}
                    onChange={(e) => setPreferredAction(e.target.value as LeadPreferredAction)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-[#1E5D32] bg-slate-50 dark:bg-[#112F1C] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Site Visit">Site Visit</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Callback">Callback</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Lead Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as LeadStatus)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-[#1E5D32] bg-slate-50 dark:bg-[#112F1C] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Site Visited">Site Visited</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Notes / Requirement
                </label>
                <textarea
                  rows={2}
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Enter follow-up notes or plot preferences..."
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-[#1E5D32] bg-slate-50 dark:bg-[#112F1C] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-[#1E5D32]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="h-10 px-4 rounded-xl bg-slate-100 dark:bg-[#112F1C] text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white font-bold shadow-sm cursor-pointer"
                >
                  Save Lead
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
