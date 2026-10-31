import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Users,
  PhoneCall,
  MessageSquare,
  Building2,
  Calendar,
  Clock,
  Plus,
  Save,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LeadStatus } from '../types';

export const LeadDetailDrawer: React.FC = () => {
  const {
    selectedLead,
    isLeadModalOpen,
    closeLeadDrawer,
    updateLeadStatus,
    addLeadNote,
    deleteLead,
    settings,
  } = useApp();

  const [newNote, setNewNote] = useState('');

  if (!selectedLead) return null;

  const pipelineStages: LeadStatus[] = ['New', 'Contacted', 'Site Visited', 'Closed'];

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    addLeadNote(selectedLead.id, newNote.trim());
    setNewNote('');
  };

  const handleCall = () => {
    window.location.href = `tel:${selectedLead.phone.replace(/\D/g, '')}`;
  };

  const handleWhatsApp = () => {
    const cleanPhone = selectedLead.phone.replace(/\D/g, '');
    const message = `Hello ${selectedLead.customerName}, Vanakkam from ${settings.companyName}! Regarding your inquiry for ${selectedLead.propertyOfInterest}, we are happy to share plot dimensions, DTCP approval papers, or schedule a field visit with Rajesh RTR.`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <AnimatePresence>
      {isLeadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLeadDrawer}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Drawer / Modal Container */}
          <motion.div
            initial={{ y: '100%', opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="relative z-10 w-full max-w-xl bg-white rounded-t-3xl md:rounded-2xl shadow-2xl max-h-[92vh] overflow-hidden flex flex-col"
          >
            {/* Mobile Drag Handle */}
            <div className="md:hidden w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2.5 shrink-0" />

            {/* Header: Deep Forest Green matching brand standard */}
            <div className="px-5 py-4 bg-[#113B24] text-white flex items-center justify-between gap-3 border-b border-[#1E5D32] shrink-0">
              <div className="min-w-0">
                <span className="text-xs font-bold text-emerald-400 block uppercase tracking-wider">
                  Lead Customer Profile · {selectedLead.preferredAction}
                </span>
                <h3 className="text-base font-bold text-white truncate">
                  {selectedLead.customerName}
                </h3>
              </div>

              <button
                onClick={closeLeadDrawer}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
              {/* Contact Information & Action Bar */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-900">{selectedLead.customerName}</p>
                  <p className="font-mono text-slate-600 font-semibold">{selectedLead.phone}</p>
                  {selectedLead.email && (
                    <p className="text-slate-500">{selectedLead.email}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCall}
                    className="min-h-[44px] px-3.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Call Now</span>
                  </button>
                  <button
                    onClick={handleWhatsApp}
                    className="min-h-[44px] px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>

              {/* Property of Interest Box */}
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-emerald-800 uppercase font-bold block">
                    Property of Interest
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {selectedLead.propertyOfInterest}
                  </span>
                </div>
                {selectedLead.budgetLakhs && (
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">
                      Target Budget
                    </span>
                    <span className="text-sm font-bold text-emerald-800">
                      ₹{selectedLead.budgetLakhs} Lakhs
                    </span>
                  </div>
                )}
              </div>

              {/* Status Pipeline Selector */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 uppercase tracking-wide block">
                  Interactive Status Pipeline
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {pipelineStages.map((stage) => {
                    const isCurrent = selectedLead.status === stage;
                    return (
                      <button
                        key={stage}
                        onClick={() => updateLeadStatus(selectedLead.id, stage)}
                        className={`min-h-[44px] py-2.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1 text-center ${
                          isCurrent
                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        {isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        <span>{stage}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Interaction Log & Notes Area */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 uppercase tracking-wide block">
                    Interaction Log & Site Visit Notes
                  </label>
                  <span className="text-slate-400 text-[11px]">
                    {selectedLead.notes.length} {selectedLead.notes.length === 1 ? 'Entry' : 'Entries'}
                  </span>
                </div>

                {/* Log Entry Input Form */}
                <form onSubmit={handleAddNoteSubmit} className="space-y-2">
                  <textarea
                    rows={2}
                    placeholder="Log visit details (e.g. Customer visited Golden City on Sunday; interested in plot #42)..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                  <button
                    type="submit"
                    disabled={!newNote.trim()}
                    className="min-h-[44px] px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
                  >
                    <Save className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Save Note</span>
                  </button>
                </form>

                {/* History Notes Feed */}
                <div className="space-y-2 pt-1 max-h-48 overflow-y-auto">
                  {selectedLead.notes.map((note, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-700 leading-relaxed font-medium"
                    >
                      {note}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Bar: Deep Forest Green matching top bar */}
            <div className="p-4 bg-[#113B24] border-t border-[#1E5D32] shrink-0 flex items-center justify-between">
              <button
                onClick={() => {
                  if (window.confirm(`Archive/delete lead for ${selectedLead.customerName}?`)) {
                    deleteLead(selectedLead.id);
                  }
                }}
                className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Archive Lead</span>
              </button>

              <button
                onClick={closeLeadDrawer}
                className="min-h-[44px] px-5 py-2 bg-[#15803D] hover:bg-[#166534] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer shadow-xs border border-[#1E5C31]"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
