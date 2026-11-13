import React, { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  CheckCircle2,
  Clock,
  PhoneCall,
  MessageSquare,
  Eye,
  Plus,
  TrendingUp,
  MapPin,
  CalendarCheck,
  LayoutGrid,
  KeyRound,
  IndianRupee,
  Download,
  Users,
  Wallet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Lead, LeadPreferredAction, LeadStatus } from '../types';
import { downloadDashboardPdfReport, ReportBucketRow } from '../utils/pdfReport';

function useCountUp(target: number, disabled: boolean, durationMs = 450): number {
  const [display, setDisplay] = useState(target);

  useEffect(() => {
    if (disabled) {
      setDisplay(target);
      return;
    }
    const startVal = display;
    if (startVal === target) return;

    let rafId = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(startVal + (target - startVal) * eased));
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, disabled, durationMs]);

  return display;
}

export const Dashboard: React.FC = () => {
  const {
    stats,
    projects,
    filteredProperties,
    filteredLeads,
    selectedProject,
    selectedProjectId,
    setSelectedProjectId,
    openAddPropertyModal,
    openLeadDrawer,
  } = useApp();

  const prefersReducedMotion = Boolean(useReducedMotion());
  const [graphMode, setGraphMode] = useState<'day' | 'month'>('month');

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning, Admin';
    if (hour < 17) return 'Good afternoon, Admin';
    return 'Good evening, Admin';
  }, []);

  const formatShortDate = (iso?: string, fallbackYear?: number) => {
    if (iso) {
      const d = new Date(iso);
      if (!Number.isNaN(d.getTime())) {
        return d.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
      }
    }
    return fallbackYear ? `Launch ${fallbackYear}` : '—';
  };

  const formatTimeOnly = (iso?: string) => {
    if (!iso) return 'Scheduled Today';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return 'Scheduled Today';
    return d.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatRupeesCompact = (lakhs: number) => {
    if (lakhs >= 100) {
      return `₹${(lakhs / 100).toFixed(2)} Cr`;
    }
    return `₹${lakhs} L`;
  };

  // Real inventory breakdown for the active scope
  const inventoryBreakdown = useMemo(() => {
    const total = filteredProperties.length;
    const available = filteredProperties.filter((p) => p.status === 'Available').length;
    const reserved = filteredProperties.filter((p) => p.status === 'Reserved').length;
    const sold = filteredProperties.filter((p) => p.status === 'Sold').length;

    const availablePct = total > 0 ? Math.round((available / total) * 100) : 0;
    const availableRatio = total > 0 ? available / total : 0;
    const reservedRatio = total > 0 ? reserved / total : 0;
    const soldRatio = total > 0 ? sold / total : 0;

    return {
      total,
      available,
      reserved,
      sold,
      availablePct,
      availableRatio,
      reservedRatio,
      soldRatio,
    };
  }, [filteredProperties]);

  // Animated KPI display values
  const animTotal = useCountUp(inventoryBreakdown.total, prefersReducedMotion);
  const animAvailable = useCountUp(inventoryBreakdown.available, prefersReducedMotion);
  const animReserved = useCountUp(inventoryBreakdown.reserved, prefersReducedMotion);
  const animSold = useCountUp(inventoryBreakdown.sold, prefersReducedMotion);
  const animEnquiries = useCountUp(filteredLeads.length, prefersReducedMotion);
  const animValueLakhs = useCountUp(stats.totalValueLakhs, prefersReducedMotion);

  // Real enquiry source breakdown from filteredLeads
  const enquiryChannels = useMemo(() => {
    const total = filteredLeads.length;
    const counts: Record<LeadPreferredAction, number> = {
      WhatsApp: 0,
      Callback: 0,
      'Site Visit': 0,
    };
    filteredLeads.forEach((l) => {
      if (l.preferredAction in counts) {
        counts[l.preferredAction] += 1;
      }
    });

    const rows = [
      { label: 'WhatsApp', count: counts.WhatsApp, barClass: 'bg-[#1d5a40]' },
      { label: 'Phone Callbacks', count: counts.Callback, barClass: 'bg-[#789a83]' },
      { label: 'Site Visit Requests', count: counts['Site Visit'], barClass: 'bg-[#c9a33a]' },
    ].sort((a, b) => b.count - a.count);

    return {
      total,
      rows: rows.map((r) => ({
        ...r,
        pct: total > 0 ? Math.round((r.count / total) * 100) : 0,
      })),
    };
  }, [filteredLeads]);

  // Compute both Day-wise (7 days) and Month-wise (6 months) buckets for graph & PDF export
  const { dayBuckets, monthBuckets } = useMemo(() => {
    const now = new Date();

    const days: (ReportBucketRow & { key: string; shortLabel: string; isLatest: boolean })[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const shortLabel = d.toLocaleDateString('en-IN', { weekday: 'short' });
      const label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
      days.push({ key, shortLabel, label, enquiries: 0, plotUpdates: 0, total: 0, isLatest: i === 0 });
    }
    const dayMap = new Map(days.map((item) => [item.key, item]));

    const months: (ReportBucketRow & { key: string; shortLabel: string; isLatest: boolean })[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const shortLabel = d.toLocaleDateString('en-IN', { month: 'short' });
      const label = d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      months.push({ key, shortLabel, label, enquiries: 0, plotUpdates: 0, total: 0, isLatest: i === 0 });
    }
    const monthMap = new Map(months.map((item) => [item.key, item]));

    filteredLeads.forEach((lead) => {
      if (!lead.timestamp) return;
      const d = new Date(lead.timestamp);
      if (Number.isNaN(d.getTime())) return;
      const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayBucket = dayMap.get(dayKey);
      if (dayBucket) {
        dayBucket.enquiries += 1;
        dayBucket.total += 1;
      }
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthBucket = monthMap.get(monthKey);
      if (monthBucket) {
        monthBucket.enquiries += 1;
        monthBucket.total += 1;
      }
    });

    filteredProperties.forEach((prop) => {
      const iso = prop.updatedAt || prop.createdAt;
      if (!iso) return;
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return;
      const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayBucket = dayMap.get(dayKey);
      if (dayBucket) {
        dayBucket.plotUpdates += 1;
        dayBucket.total += 1;
      }
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthBucket = monthMap.get(monthKey);
      if (monthBucket) {
        monthBucket.plotUpdates += 1;
        monthBucket.total += 1;
      }
    });

    return { dayBuckets: days, monthBuckets: months };
  }, [filteredLeads, filteredProperties]);

  const activityGraph = useMemo(() => {
    const active = graphMode === 'day' ? dayBuckets : monthBuckets;
    const max = Math.max(...active.map((b) => b.total), 1);
    const totalActivity = active.reduce((sum, b) => sum + b.total, 0);

    return {
      totalLabel: graphMode === 'day' ? '7-day activity' : '6-month activity',
      totalValue: `${totalActivity} updates`,
      bars: active.map((b) => ({
        key: b.key,
        label: b.shortLabel,
        count: b.total,
        isLatest: b.isLatest,
        heightPct: b.total === 0 ? 10 : Math.max(18, Math.round((b.total / max) * 100)),
      })),
    };
  }, [graphMode, dayBuckets, monthBuckets]);

  // Upcoming site visits: ONLY today's events
  const todaySiteVisits = useMemo(() => {
    const now = new Date();
    return filteredLeads.filter((lead) => {
      if (lead.preferredAction !== 'Site Visit' || lead.status === 'Closed') return false;
      if (!lead.timestamp) return false;
      const d = new Date(lead.timestamp);
      if (Number.isNaN(d.getTime())) return false;
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    });
  }, [filteredLeads]);

  // Recent leads: strictly most recent 5 leads sorted by timestamp desc
  const recentLeads = useMemo(() => {
    return [...filteredLeads]
      .sort((a, b) => {
        const ta = new Date(a.timestamp || 0).getTime();
        const tb = new Date(b.timestamp || 0).getTime();
        return tb - ta;
      })
      .slice(0, 5);
  }, [filteredLeads]);

  const handleExportPdf = () => {
    downloadDashboardPdfReport({
      scopeName: selectedProject ? selectedProject.name : 'All Projects',
      generatedAt: new Date(),
      totalPlots: inventoryBreakdown.total,
      availablePlots: inventoryBreakdown.available,
      reservedPlots: inventoryBreakdown.reserved,
      soldPlots: inventoryBreakdown.sold,
      totalEnquiries: filteredLeads.length,
      totalValueText: formatRupeesCompact(stats.totalValueLakhs),
      dayRows: dayBuckets.map(({ label, enquiries, plotUpdates, total }) => ({
        label,
        enquiries,
        plotUpdates,
        total,
      })),
      monthRows: monthBuckets.map(({ label, enquiries, plotUpdates, total }) => ({
        label,
        enquiries,
        plotUpdates,
        total,
      })),
    });
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'KP';

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case 'New':
        return 'bg-emerald-50 text-[#15803D] border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
      case 'Contacted':
        return 'bg-[#fff6df] text-[#8b6a1a] border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800';
      case 'Site Visited':
        return 'bg-[#edf4ee] text-[#123d2d] border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
      case 'Closed':
        return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  const handleCall = (phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `tel:${phone.replace(/\D/g, '')}`;
  };

  const handleWhatsApp = (phone: string, customerName: string, property: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanPhone = phone.replace(/\D/g, '');
    const message = `Hello ${customerName}, Vanakkam from Kriyaa Promoters! Regarding your inquiry for ${property}, our team is available for a site visit or to share the layout details.`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const topChannel = enquiryChannels.rows[0];

  // SVG Donut ring geometry
  const ringRadius = 52;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const availableLen = inventoryBreakdown.availableRatio * ringCircumference;
  const reservedLen = inventoryBreakdown.reservedRatio * ringCircumference;
  const soldLen = inventoryBreakdown.soldRatio * ringCircumference;

  const enterTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.32, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div className="space-y-6">
      {/* 1. WELCOME & CONTEXT BANNER */}
      <motion.section
        initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={enterTransition}
        className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-[#123d2d] via-[#194c36] to-[#0d3022] px-5 py-6 sm:px-7 sm:py-7 text-white shadow-[0_14px_34px_rgba(18,61,45,0.18)] border border-[#24684a]"
      >
        <motion.div
          aria-hidden="true"
          animate={
            prefersReducedMotion
              ? undefined
              : { scale: [1, 1.04, 1], opacity: [0.85, 1, 0.85] }
          }
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="pointer-events-none absolute -top-44 right-[14%] w-72 h-72 rounded-full border border-white/10 shadow-[0_0_0_35px_rgba(255,255,255,0.03),0_0_0_70px_rgba(255,255,255,0.02)]"
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-bold tracking-[0.14em] uppercase text-[#e4c66e]">
              <span>
                {selectedProject
                  ? `${selectedProject.location} · ${selectedProject.dtcpNumber}`
                  : `All Projects · ${projects.length} Active Layouts`}
              </span>
            </div>
            <h1 className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-white leading-tight pt-1">
              {greeting}
            </h1>
          </div>

          {/* Aligned controls */}
          <div className="w-full lg:w-auto flex flex-col sm:flex-row sm:items-center gap-2.5 shrink-0">
            <label className="sr-only" htmlFor="dashboard-project-select">
              Filter dashboard by project
            </label>
            <select
              id="dashboard-project-select"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="w-full sm:w-52 h-11 rounded-xl border border-white/25 bg-white/10 hover:bg-white/15 px-3.5 text-xs font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-[#dfc77d] transition-colors cursor-pointer"
            >
              <option value="all" className="text-[#183d2d]">
                All Projects
              </option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id} className="text-[#183d2d]">
                  {proj.name}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => openAddPropertyModal(selectedProjectId !== 'all' ? selectedProjectId : undefined)}
                className="h-11 px-4 rounded-xl bg-[#c9a33a] hover:bg-[#d6b249] active:scale-[0.98] text-[#17291e] text-xs font-extrabold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white shadow-sm whitespace-nowrap"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add Plot</span>
              </button>

              <button
                type="button"
                onClick={handleExportPdf}
                className="h-11 px-4 rounded-xl border border-white/25 bg-white/10 hover:bg-white/15 active:scale-[0.98] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#dfc77d] whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* 2. BUSINESS OVERVIEW — 6 KPI CARDS */}
      <section aria-label="Business Overview">
        <div className="flex items-center gap-2.5 mb-3 px-0.5">
          <span className="w-1.5 h-5 rounded-full bg-[#123d2d] dark:bg-[#e4c66e]" />
          <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-[#123d2d] dark:text-white">
            Business overview
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {/* Total Plots */}
          <article className="bg-white dark:bg-slate-900 border border-[#e9eee9] dark:border-slate-800 hover:border-[#1d5a40]/35 rounded-[17px] p-4 shadow-[0_8px_28px_rgba(24,54,38,0.055)] hover:shadow-[0_12px_32px_rgba(18,61,45,0.09)] transition-all duration-200 flex flex-col justify-between min-h-[120px]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-[#758078] dark:text-slate-400 uppercase tracking-wider">
                Total Plots
              </span>
              <span className="w-8 h-8 rounded-[10px] bg-[#edf4ee] dark:bg-emerald-950/60 text-[#1d5a40] dark:text-emerald-400 flex items-center justify-center shrink-0">
                <LayoutGrid className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-[27px] font-extrabold tracking-tight text-[#123d2d] dark:text-white tabular-nums">
                {animTotal}
              </div>
              <p className="text-[11px] text-[#758078] dark:text-slate-400 mt-0.5 truncate">
                {selectedProject ? selectedProject.name : `${projects.length} active layouts`}
              </p>
            </div>
          </article>

          {/* Available */}
          <article className="bg-white dark:bg-slate-900 border border-[#e9eee9] dark:border-slate-800 hover:border-[#1d5a40]/35 rounded-[17px] p-4 shadow-[0_8px_28px_rgba(24,54,38,0.055)] hover:shadow-[0_12px_32px_rgba(18,61,45,0.09)] transition-all duration-200 flex flex-col justify-between min-h-[120px]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-[#758078] dark:text-slate-400 uppercase tracking-wider">
                Available
              </span>
              <span className="w-8 h-8 rounded-[10px] bg-[#edf4ee] dark:bg-emerald-950/60 text-[#1d5a40] dark:text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-[27px] font-extrabold tracking-tight text-[#123d2d] dark:text-white tabular-nums">
                {animAvailable}
              </div>
              <p className="text-[11px] text-[#1d5a40] dark:text-emerald-400 font-semibold mt-0.5 truncate">
                {inventoryBreakdown.availablePct}% of inventory
              </p>
            </div>
          </article>

          {/* Reserved */}
          <article className="bg-white dark:bg-slate-900 border border-[#e9eee9] dark:border-slate-800 hover:border-[#c9a33a]/50 rounded-[17px] p-4 shadow-[0_8px_28px_rgba(24,54,38,0.055)] hover:shadow-[0_12px_32px_rgba(18,61,45,0.09)] transition-all duration-200 flex flex-col justify-between min-h-[120px]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-[#758078] dark:text-slate-400 uppercase tracking-wider">
                Reserved
              </span>
              <span className="w-8 h-8 rounded-[10px] bg-[#fff6df] dark:bg-amber-950/60 text-[#98751f] dark:text-amber-400 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-[27px] font-extrabold tracking-tight text-[#123d2d] dark:text-white tabular-nums">
                {animReserved}
              </div>
              <p className="text-[11px] text-[#758078] dark:text-slate-400 mt-0.5 truncate">
                Token on hold
              </p>
            </div>
          </article>

          {/* Sold */}
          <article className="bg-white dark:bg-slate-900 border border-[#e9eee9] dark:border-slate-800 hover:border-[#1d5a40]/35 rounded-[17px] p-4 shadow-[0_8px_28px_rgba(24,54,38,0.055)] hover:shadow-[0_12px_32px_rgba(18,61,45,0.09)] transition-all duration-200 flex flex-col justify-between min-h-[120px]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-[#758078] dark:text-slate-400 uppercase tracking-wider">
                Sold
              </span>
              <span className="w-8 h-8 rounded-[10px] bg-[#edf4ee] dark:bg-emerald-950/60 text-[#1d5a40] dark:text-emerald-400 flex items-center justify-center shrink-0">
                <KeyRound className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-[27px] font-extrabold tracking-tight text-[#123d2d] dark:text-white tabular-nums">
                {animSold}
              </div>
              <p className="text-[11px] text-[#758078] dark:text-slate-400 mt-0.5 truncate">
                Registered plots
              </p>
            </div>
          </article>

          {/* Enquiries */}
          <article className="bg-white dark:bg-slate-900 border border-[#e9eee9] dark:border-slate-800 hover:border-[#1d5a40]/35 rounded-[17px] p-4 shadow-[0_8px_28px_rgba(24,54,38,0.055)] hover:shadow-[0_12px_32px_rgba(18,61,45,0.09)] transition-all duration-200 flex flex-col justify-between min-h-[120px]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-[#758078] dark:text-slate-400 uppercase tracking-wider">
                Enquiries
              </span>
              <span className="w-8 h-8 rounded-[10px] bg-[#edf4ee] dark:bg-emerald-950/60 text-[#1d5a40] dark:text-emerald-400 flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-[27px] font-extrabold tracking-tight text-[#123d2d] dark:text-white tabular-nums">
                {animEnquiries}
              </div>
              <p className="text-[11px] text-[#758078] dark:text-slate-400 mt-0.5 truncate">
                {stats.activeLeads} active in pipeline
              </p>
            </div>
          </article>

          {/* Inventory Value (Featured Forest Green Card) */}
          <article className="bg-gradient-to-br from-[#123d2d] to-[#0f3325] border border-[#1d5a40] rounded-[17px] p-4 shadow-[0_10px_28px_rgba(18,61,45,0.22)] hover:shadow-[0_14px_34px_rgba(18,61,45,0.28)] transition-all duration-200 flex flex-col justify-between min-h-[120px] text-white">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-[#c7d9ce] uppercase tracking-wider">
                Total Value
              </span>
              <span className="w-8 h-8 rounded-[10px] bg-white/10 text-[#c9a33a] flex items-center justify-center shrink-0">
                <IndianRupee className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-3">
              <div className="text-2xl sm:text-[27px] font-extrabold tracking-tight text-[#e4c66e] tabular-nums">
                {formatRupeesCompact(animValueLakhs)}
              </div>
              <p className="text-[11px] text-[#c7d9ce] mt-0.5 truncate">
                Inventory valuation
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* 3. UPCOMING SITE VISITS (TODAY ONLY) & RECENT 5 ENQUIRIES — MOVED AFTER BUSINESS OVERVIEW */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Upcoming Site Visits (Today Only: Client Name, Plot, Timing) */}
        <article className="bg-white dark:bg-slate-900 border border-[#e9eee9] dark:border-slate-800 rounded-[17px] overflow-hidden shadow-[0_8px_28px_rgba(24,54,38,0.055)]">
          <div className="px-5 py-3.5 bg-[#f2f6f2] dark:bg-slate-800/80 border-b border-[#e2eae2] dark:border-slate-700 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#123d2d] to-[#1d5a40] text-[#e4c66e] flex items-center justify-center shadow-xs shrink-0">
                <CalendarCheck className="w-4.5 h-4.5" />
              </div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#123d2d] dark:text-white">
                Upcoming site visits
              </h3>
            </div>
            <span className="text-[11px] font-extrabold text-[#123d2d] dark:text-emerald-300 bg-white dark:bg-slate-900 border border-[#dce6dc] dark:border-slate-700 px-2.5 py-1 rounded-full shrink-0">
              {todaySiteVisits.length} today
            </span>
          </div>

          <div className="p-5">
            {todaySiteVisits.length === 0 ? (
              <div className="py-8 text-center rounded-2xl bg-[#f7f9f6] dark:bg-slate-800/40 border border-dashed border-[#dce6dc] dark:border-slate-700">
                <p className="text-xs font-bold text-[#123d2d] dark:text-slate-300">
                  No schedule today
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {todaySiteVisits.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => openLeadDrawer(lead)}
                    className="p-3.5 rounded-2xl bg-[#f7f9f6] dark:bg-slate-800/50 border border-[#e9eee9] dark:border-slate-700/70 hover:border-[#1d5a40]/40 cursor-pointer transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#123d2d] text-[#e4c66e] flex items-center justify-center text-xs font-extrabold shrink-0 shadow-xs">
                        {getInitials(lead.customerName)}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <strong className="block text-xs sm:text-sm font-extrabold text-[#123d2d] dark:text-white truncate">
                          {lead.customerName}
                        </strong>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1d5a40] dark:text-emerald-300 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-[#e9eee9] dark:border-slate-700">
                          <MapPin className="w-3 h-3 text-[#c9a33a]" />
                          {lead.propertyOfInterest}
                        </span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#123d2d] dark:text-emerald-300 bg-[#edf4ee] dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl whitespace-nowrap shrink-0">
                      <Clock className="w-3.5 h-3.5 text-[#1d5a40]" />
                      {formatTimeOnly(lead.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </article>

        {/* Recent Customer Enquiries (Strictly Recent 5 Leads) */}
        <article className="bg-white dark:bg-slate-900 border border-[#e9eee9] dark:border-slate-800 rounded-[17px] overflow-hidden shadow-[0_8px_28px_rgba(24,54,38,0.055)]">
          <div className="px-5 py-3.5 bg-[#f2f6f2] dark:bg-slate-800/80 border-b border-[#e2eae2] dark:border-slate-700 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c9a33a] to-[#b58d26] text-[#123d2d] flex items-center justify-center shadow-xs shrink-0">
                <Users className="w-4.5 h-4.5 stroke-[2.2]" />
              </div>
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#123d2d] dark:text-white">
                Recent enquiries
              </h3>
            </div>
            <span className="text-[11px] font-extrabold text-[#896a19] dark:text-amber-300 bg-[#fff6df] dark:bg-amber-950/50 border border-amber-200/70 dark:border-amber-800 px-2.5 py-1 rounded-full shrink-0">
              Latest {recentLeads.length}
            </span>
          </div>

          <div className="p-5">
            {recentLeads.length === 0 ? (
              <div className="py-8 text-center rounded-2xl bg-[#f7f9f6] dark:bg-slate-800/40 border border-dashed border-[#dce6dc] dark:border-slate-700">
                <p className="text-xs font-bold text-[#123d2d] dark:text-slate-300">
                  No recent enquiries
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recentLeads.map((lead: Lead) => (
                  <div
                    key={lead.id}
                    onClick={() => openLeadDrawer(lead)}
                    className="p-3 rounded-2xl bg-[#f7f9f6] dark:bg-slate-800/50 border border-[#e9eee9] dark:border-slate-700/70 hover:border-[#1d5a40]/40 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-[#edf4ee] dark:bg-emerald-950/60 text-[#123d2d] dark:text-emerald-300 border border-[#1d5a40]/20 flex items-center justify-center text-xs font-extrabold shrink-0">
                        {getInitials(lead.customerName)}
                      </div>
                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <strong className="text-xs sm:text-sm font-extrabold text-[#123d2d] dark:text-white">
                            {lead.customerName}
                          </strong>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getStatusBadge(
                              lead.status
                            )}`}
                          >
                            {lead.status}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-[#e9eee9] dark:border-slate-700 text-[#1d5a40] dark:text-emerald-300">
                            {lead.preferredAction}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap text-[11px]">
                          <span className="font-bold text-[#1d5a40] dark:text-emerald-300 truncate max-w-[200px]">
                            {lead.propertyOfInterest}
                          </span>
                          <span className="inline-flex items-center gap-1 font-bold text-[#123d2d] dark:text-slate-200 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-[#e9eee9] dark:border-slate-700">
                            <PhoneCall className="w-3 h-3 text-[#1d5a40]" />
                            {lead.phone}
                          </span>
                          {lead.budgetLakhs && (
                            <span className="inline-flex items-center gap-1 font-extrabold text-[#896a19] dark:text-amber-300 bg-[#fff6df] dark:bg-amber-950/50 px-2 py-0.5 rounded-md">
                              <Wallet className="w-3 h-3" />
                              ₹{lead.budgetLakhs}L
                            </span>
                          )}
                          {lead.timestamp && (
                            <span className="text-[10px] font-semibold text-[#758078] dark:text-slate-400">
                              {formatShortDate(lead.timestamp)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 pl-13 sm:pl-0">
                      <button
                        type="button"
                        onClick={(e) => handleCall(lead.phone, e)}
                        aria-label={`Call ${lead.customerName}`}
                        title={`Call ${lead.customerName}`}
                        className="w-8 h-8 rounded-[9px] border border-[#e9eee9] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#123d2d] dark:text-emerald-300 hover:bg-[#edf4ee] active:scale-95 flex items-center justify-center transition-all cursor-pointer"
                      >
                        <PhoneCall className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleWhatsApp(lead.phone, lead.customerName, lead.propertyOfInterest, e)}
                        aria-label={`WhatsApp ${lead.customerName}`}
                        title="Send WhatsApp Message"
                        className="w-8 h-8 rounded-[9px] border border-[#e9eee9] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#123d2d] dark:text-emerald-300 hover:bg-[#edf4ee] active:scale-95 flex items-center justify-center transition-all cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openLeadDrawer(lead);
                        }}
                        aria-label={`View details for ${lead.customerName}`}
                        title="View Details"
                        className="w-8 h-8 rounded-[9px] border border-[#e9eee9] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#123d2d] dark:text-emerald-300 hover:bg-[#edf4ee] active:scale-95 flex items-center justify-center transition-all cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </article>
      </section>

      {/* 4. PERFORMANCE INSIGHTS — 3 ANALYTICS PANELS */}
      <section aria-label="Performance Insights">
        <div className="flex items-center gap-2.5 mb-3 px-0.5">
          <span className="w-1.5 h-5 rounded-full bg-[#123d2d] dark:bg-[#e4c66e]" />
          <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-[#123d2d] dark:text-white">
            Performance insights
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Panel 1: Animated SVG Plot Availability Donut */}
          <article className="bg-white dark:bg-slate-900 border border-[#e9eee9] dark:border-slate-800 hover:border-[#1d5a40]/30 rounded-[17px] overflow-hidden shadow-[0_8px_28px_rgba(24,54,38,0.055)] transition-colors flex flex-col justify-between">
            <div className="px-5 py-3.5 bg-[#f2f6f2] dark:bg-slate-800/80 border-b border-[#e2eae2] dark:border-slate-700 flex items-center justify-between gap-2">
              <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#123d2d] dark:text-white">
                Plot availability
              </h3>
              <span className="text-[11px] font-bold text-[#1d5a40] dark:text-emerald-300 bg-white dark:bg-slate-900 border border-[#dce6dc] dark:border-slate-700 px-2.5 py-1 rounded-full whitespace-nowrap">
                {inventoryBreakdown.total} plots
              </span>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div className="h-[175px] grid place-items-center relative my-1">
                <svg viewBox="0 0 132 132" className="w-[152px] h-[152px] -rotate-90" aria-hidden="true">
                  <circle
                    cx="66"
                    cy="66"
                    r={ringRadius}
                    fill="none"
                    stroke="#edf1ed"
                    className="dark:stroke-slate-800"
                    strokeWidth="18"
                  />
                  {inventoryBreakdown.total > 0 && (
                    <>
                      <motion.circle
                        cx="66"
                        cy="66"
                        r={ringRadius}
                        fill="none"
                        stroke="#b8c8bc"
                        strokeWidth="18"
                        strokeDashoffset={-(availableLen + reservedLen)}
                        initial={prefersReducedMotion ? false : { strokeDasharray: `0 ${ringCircumference}` }}
                        animate={{ strokeDasharray: `${soldLen} ${ringCircumference}` }}
                        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                      />
                      <motion.circle
                        cx="66"
                        cy="66"
                        r={ringRadius}
                        fill="none"
                        stroke="#c9a33a"
                        strokeWidth="18"
                        strokeDashoffset={-availableLen}
                        initial={prefersReducedMotion ? false : { strokeDasharray: `0 ${ringCircumference}` }}
                        animate={{ strokeDasharray: `${reservedLen} ${ringCircumference}` }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      />
                      <motion.circle
                        cx="66"
                        cy="66"
                        r={ringRadius}
                        fill="none"
                        stroke="#1d5a40"
                        strokeWidth="18"
                        strokeDashoffset={0}
                        initial={prefersReducedMotion ? false : { strokeDasharray: `0 ${ringCircumference}` }}
                        animate={{ strokeDasharray: `${availableLen} ${ringCircumference}` }}
                        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </>
                  )}
                </svg>
                <div className="absolute text-center">
                  <strong className="block text-2xl font-extrabold text-[#123d2d] dark:text-white tabular-nums">
                    {inventoryBreakdown.availablePct}%
                  </strong>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#758078] dark:text-slate-400">
                    Available
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-[#e9eee9] dark:border-slate-800 pt-3">
                <div className="text-center bg-[#f7f9f6] dark:bg-slate-800/60 rounded-[10px] py-2 px-1">
                  <div className="text-[10px] font-bold text-[#758078] dark:text-slate-400 flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#1d5a40]" />
                    <span>Available</span>
                  </div>
                  <strong className="block text-base font-extrabold text-[#123d2d] dark:text-white mt-0.5 tabular-nums">
                    {inventoryBreakdown.available}
                  </strong>
                </div>
                <div className="text-center bg-[#f7f9f6] dark:bg-slate-800/60 rounded-[10px] py-2 px-1">
                  <div className="text-[10px] font-bold text-[#758078] dark:text-slate-400 flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c9a33a]" />
                    <span>Reserved</span>
                  </div>
                  <strong className="block text-base font-extrabold text-[#123d2d] dark:text-white mt-0.5 tabular-nums">
                    {inventoryBreakdown.reserved}
                  </strong>
                </div>
                <div className="text-center bg-[#f7f9f6] dark:bg-slate-800/60 rounded-[10px] py-2 px-1">
                  <div className="text-[10px] font-bold text-[#758078] dark:text-slate-400 flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#b8c8bc]" />
                    <span>Sold</span>
                  </div>
                  <strong className="block text-base font-extrabold text-[#123d2d] dark:text-white mt-0.5 tabular-nums">
                    {inventoryBreakdown.sold}
                  </strong>
                </div>
              </div>
            </div>
          </article>

          {/* Panel 2: Animated Enquiry Sources */}
          <article className="bg-white dark:bg-slate-900 border border-[#e9eee9] dark:border-slate-800 hover:border-[#1d5a40]/30 rounded-[17px] overflow-hidden shadow-[0_8px_28px_rgba(24,54,38,0.055)] transition-colors flex flex-col justify-between">
            <div className="px-5 py-3.5 bg-[#f2f6f2] dark:bg-slate-800/80 border-b border-[#e2eae2] dark:border-slate-700 flex items-center justify-between gap-2">
              <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#123d2d] dark:text-white">
                Enquiry sources
              </h3>
              <span className="text-[11px] font-bold text-[#1d5a40] dark:text-emerald-300 bg-white dark:bg-slate-900 border border-[#dce6dc] dark:border-slate-700 px-2.5 py-1 rounded-full whitespace-nowrap">
                {enquiryChannels.total} total
              </span>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div className="space-y-4 my-3">
                {enquiryChannels.rows.map((channel, idx) => (
                  <div key={channel.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#1e2b24] dark:text-slate-200">{channel.label}</span>
                      <span className="font-bold text-[#758078] dark:text-slate-400 tabular-nums">
                        {channel.count} · {channel.pct}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[#edf1ed] dark:bg-slate-800 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${channel.barClass}`}
                        initial={prefersReducedMotion ? false : { width: '0%' }}
                        animate={{ width: `${channel.pct}%` }}
                        transition={{
                          duration: prefersReducedMotion ? 0 : 0.55,
                          delay: prefersReducedMotion ? 0 : idx * 0.06,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-[#edf4ee] dark:bg-emerald-950/40 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-xs mt-4">
                <span className="text-[#758078] dark:text-slate-300 font-medium">Top channel</span>
                <strong className="text-[#123d2d] dark:text-emerald-300 font-extrabold">
                  {topChannel && topChannel.count > 0 ? `${topChannel.label} · ${topChannel.pct}%` : 'No enquiries yet'}
                </strong>
              </div>
            </div>
          </article>

          {/* Panel 3: Day / Month Activity Graph */}
          <article className="bg-white dark:bg-slate-900 border border-[#e9eee9] dark:border-slate-800 hover:border-[#1d5a40]/30 rounded-[17px] overflow-hidden shadow-[0_8px_28px_rgba(24,54,38,0.055)] transition-colors flex flex-col justify-between md:col-span-2 xl:col-span-1">
            <div className="px-5 py-3 bg-[#f2f6f2] dark:bg-slate-800/80 border-b border-[#e2eae2] dark:border-slate-700 flex items-center justify-between gap-2">
              <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#123d2d] dark:text-white">
                Activity trend
              </h3>

              {/* Day / Month Selector */}
              <div
                role="tablist"
                aria-label="Graph timeframe"
                className="inline-flex items-center p-0.5 rounded-xl bg-white dark:bg-slate-900 border border-[#dce6dc] dark:border-slate-700 shrink-0"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={graphMode === 'day'}
                  onClick={() => setGraphMode('day')}
                  className={`px-2.5 py-1 rounded-[9px] text-[11px] font-bold transition-all cursor-pointer ${
                    graphMode === 'day'
                      ? 'bg-[#123d2d] text-white shadow-xs'
                      : 'text-[#758078] dark:text-slate-300 hover:text-[#123d2d]'
                  }`}
                >
                  Day
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={graphMode === 'month'}
                  onClick={() => setGraphMode('month')}
                  className={`px-2.5 py-1 rounded-[9px] text-[11px] font-bold transition-all cursor-pointer ${
                    graphMode === 'month'
                      ? 'bg-[#123d2d] text-white shadow-xs'
                      : 'text-[#758078] dark:text-slate-300 hover:text-[#123d2d]'
                  }`}
                >
                  Month
                </button>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div className="h-[170px] flex items-end justify-around gap-2 pt-4 px-1 border-b border-[#e9eee9] dark:border-slate-800">
                {activityGraph.bars.map((bar, idx) => (
                  <div
                    key={`${graphMode}-${bar.key}`}
                    className="h-full flex-1 flex flex-col items-center justify-end gap-1.5 min-w-0 group"
                  >
                    <span className="text-[11px] font-extrabold text-[#758078] dark:text-slate-400 group-hover:text-[#123d2d] dark:group-hover:text-white transition-colors tabular-nums">
                      {bar.count}
                    </span>
                    <motion.div
                      className={`w-7 sm:w-8 max-w-full rounded-t-[7px] rounded-b-[2px] ${
                        bar.isLatest
                          ? 'bg-gradient-to-b from-[#d6b95d] to-[#123d2d]'
                          : 'bg-[#c8d7cb] dark:bg-emerald-900/70 group-hover:bg-[#789a83] transition-colors'
                      }`}
                      initial={prefersReducedMotion ? false : { height: '0%' }}
                      animate={{ height: `${bar.heightPct}%` }}
                      transition={{
                        duration: prefersReducedMotion ? 0 : 0.45,
                        delay: prefersReducedMotion ? 0 : idx * 0.04,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      title={`${bar.label}: ${bar.count} activities`}
                    />
                    <span className="text-[10px] font-bold text-[#758078] dark:text-slate-400 truncate max-w-full pb-1.5">
                      {bar.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-3.5">
                <div>
                  <span className="block text-[11px] text-[#758078] dark:text-slate-400">
                    {activityGraph.totalLabel}
                  </span>
                  <strong className="text-lg font-extrabold text-[#123d2d] dark:text-white tabular-nums">
                    {activityGraph.totalValue}
                  </strong>
                </div>
                <span className="text-[11px] font-bold text-[#1d5a40] dark:text-emerald-300 bg-[#edf4ee] dark:bg-emerald-950/60 px-2.5 py-1.5 rounded-[9px] inline-flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{graphMode === 'day' ? 'Daily view' : 'Monthly view'}</span>
                </span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
};
