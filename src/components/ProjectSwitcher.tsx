import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  ChevronDown,
  Plus,
  Check,
  Layers,
  Building2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ProjectSwitcherProps {
  variant?: 'desktop' | 'mobile';
}

export const ProjectSwitcher: React.FC<ProjectSwitcherProps> = ({ variant = 'desktop' }) => {
  const {
    projects,
    selectedProjectId,
    selectedProject,
    setSelectedProjectId,
    openAddProjectModal,
    properties,
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const getProjectPlotStats = (projectId: string) => {
    const projProps = properties.filter((p) => p.projectId === projectId);
    const available = projProps.filter((p) => p.status === 'Available').length;
    return {
      total: projProps.length,
      available,
    };
  };

  const displayText = selectedProject
    ? `${selectedProject.name} - ${selectedProject.location}`
    : 'All Projects';

  const shortDisplayText = selectedProject ? selectedProject.name : 'All Projects';

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      {/* Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Switch Layout / Project"
        className={`group transition-all cursor-pointer inline-flex items-center gap-2 rounded-lg border shadow-xs select-none shrink-0 ${
          variant === 'mobile'
            ? 'px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/90 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700/80 text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[150px] sm:max-w-[200px]'
            : 'h-8.5 px-3 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold'
        }`}
      >
        <MapPin className="w-3.5 h-3.5 text-[#166534] dark:text-[#EAB308] shrink-0" />

        <span className="truncate">
          {variant === 'mobile' ? shortDisplayText : displayText}
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform duration-150 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 mt-2 w-80 sm:w-88 max-w-[calc(100vw-24px)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden text-slate-900 dark:text-slate-100"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  Select Layout / Project
                </span>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                {projects.length} Layouts
              </span>
            </div>

            {/* Project List */}
            <div className="p-2 max-h-72 overflow-y-auto space-y-1">
              {/* Option: All Projects */}
              <button
                type="button"
                onClick={() => {
                  setSelectedProjectId('all');
                  setIsOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                  selectedProjectId === 'all'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      selectedProjectId === 'all'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      All Projects
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Combined across Cuddalore, Chidambaram & Pondy
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                    {properties.length} Plots
                  </span>
                  {selectedProjectId === 'all' && (
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              </button>

              <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

              {/* Individual Layouts */}
              {projects.map((proj) => {
                const isSelected = selectedProjectId === proj.id;
                const stats = getProjectPlotStats(proj.id);

                return (
                  <button
                    key={proj.id}
                    type="button"
                    onClick={() => {
                      setSelectedProjectId(proj.id);
                      setIsOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Master Plan Thumbnail */}
                      <div className="w-9 h-9 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700 relative">
                        <img
                          src={proj.masterPlanImage}
                          alt={proj.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {proj.name}
                          </p>
                          <span className="text-[10px] text-slate-400">•</span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {proj.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
                            {proj.dtcpNumber}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right">
                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block tabular-nums">
                          {stats.total} Plots
                        </span>
                        <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 block tabular-nums">
                          {stats.available} Available
                        </span>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Action: + Add New Project / Layout */}
            <div className="p-2 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  openAddProjectModal();
                }}
                className="w-full min-h-[40px] px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Project / Layout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
