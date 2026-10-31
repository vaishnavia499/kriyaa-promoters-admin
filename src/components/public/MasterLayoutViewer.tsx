import React, { useState, useRef, useMemo } from 'react';
import {
  Compass,
  Layers,
  Sliders,
  ZoomIn,
  ZoomOut,
  RefreshCw,
} from 'lucide-react';
import { Property, LayoutDisplayMode, Project } from '../../types';
import { SatelliteMapView } from './SatelliteMapView';

interface MasterLayoutViewerProps {
  project: Project;
  plots: Property[];
  selectedPlot: Property | null;
  onSelectPlot: (plot: Property) => void;
  displayMode: LayoutDisplayMode;
  onModeChange: (mode: LayoutDisplayMode) => void;
  onOpenConsultation?: () => void;
  onWhatsAppInquiry?: () => void;
}

// ─────────────────────────────────────────────────────────────────
// Status-based color palette (Green: Available, Amber: Reserved, Red: Sold)
// ─────────────────────────────────────────────────────────────────
function getStatusColors(status: string, isSelected: boolean) {
  if (isSelected) {
    return {
      fill: 'rgba(250, 204, 21, 0.45)',
      stroke: '#FACC15',
      strokeWidth: 2.8,
      textFill: '#FFFFFF',
      cadFill: 'rgba(250, 204, 21, 0.35)',
      cadStroke: '#FACC15',
      cadText: '#FEF08A',
    };
  }
  if (status === 'Sold') {
    return {
      fill: 'rgba(239, 68, 68, 0.28)',
      stroke: '#EF4444',
      strokeWidth: 1.6,
      textFill: '#FEE2E2',
      cadFill: 'rgba(239, 68, 68, 0.22)',
      cadStroke: '#EF4444',
      cadText: '#FCA5A5',
    };
  }
  if (status === 'Reserved') {
    return {
      fill: 'rgba(245, 158, 11, 0.28)',
      stroke: '#F59E0B',
      strokeWidth: 1.6,
      textFill: '#FEF9C3',
      cadFill: 'rgba(245, 158, 11, 0.22)',
      cadStroke: '#F59E0B',
      cadText: '#FDE047',
    };
  }
  // Available
  return {
    fill: 'rgba(16, 185, 129, 0.24)',
    stroke: '#10B981',
    strokeWidth: 1.5,
    textFill: '#D1FAE5',
    cadFill: 'rgba(16, 185, 129, 0.18)',
    cadStroke: '#10B981',
    cadText: '#6EE7B7',
  };
}

export const MasterLayoutViewer: React.FC<MasterLayoutViewerProps> = ({
  project,
  plots,
  selectedPlot,
  onSelectPlot,
  displayMode,
  onModeChange,
}) => {
  // Zoom & Pan state
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  // panRef tracks pointer state between events.
  // pointerId + element are stored so we can call setPointerCapture LAZILY
  // (only once drag threshold is crossed) — never on a plain tap.
  // KEY INSIGHT: calling setPointerCapture on pointerdown reroutes pointerup to
  // the outer div, which prevents the browser click event from reaching child
  // SVG <g> elements. Lazy capture fixes this completely.
  const panRef = useRef({
    startClientX: 0,
    startClientY: 0,
    startPanX: 0,
    startPanY: 0,
    moved: false,
    isDown: false,
    pointerId: -1,
    element: null as HTMLElement | null,
  });
  const DRAG_THRESHOLD = 6; // px — below this, treat as a tap not a drag

  // Natural dimensions of the master plan image for pixel-perfect SVG viewBox alignment
  const [imageSize, setImageSize] = useState<{ width: number; height: number }>({
    width: 975,
    height: 735,
  });

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalWidth > 0 && naturalHeight > 0) {
      setImageSize({ width: naturalWidth, height: naturalHeight });
    }
  };

  // Verified mapped plots (boundary coordinates must be defined and non-zero)
  const mappedPlots = useMemo(
    () =>
      plots.filter(
        (p) =>
          p.boundary &&
          typeof p.boundary.x === 'number' &&
          typeof p.boundary.y === 'number' &&
          p.boundary.width > 0 &&
          p.boundary.height > 0
      ),
    [plots]
  );

  const unmappedCount = plots.length - mappedPlots.length;

  // Real-time status counts from database
  const availCount = plots.filter((p) => p.status === 'Available').length;
  const resCount = plots.filter((p) => p.status === 'Reserved').length;
  const soldCount = plots.filter((p) => p.status === 'Sold').length;

  const layoutImageSrc = project.layoutImageUrl || project.masterPlanImage || '';

  // ─── POINTER HANDLERS ─────────────────────────────────────────────────────
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return; // left button only
    panRef.current = {
      startClientX: e.clientX,
      startClientY: e.clientY,
      startPanX: pan.x,
      startPanY: pan.y,
      moved: false,
      isDown: true,
      pointerId: e.pointerId,
      element: e.currentTarget,
      // ⚠️ DO NOT call setPointerCapture here.
      // Calling it immediately routes pointerup to this div before the child
      // SVG onClick fires, so the click event never reaches the plot polygon.
      // We capture lazily in handlePointerMove once drag threshold is crossed.
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!panRef.current.isDown) return; // ignore hover
    const dx = e.clientX - panRef.current.startClientX;
    const dy = e.clientY - panRef.current.startClientY;
    if (Math.sqrt(dx * dx + dy * dy) < DRAG_THRESHOLD) return; // still within tap zone
    // First frame past threshold — lock pointer capture so panning is smooth
    if (!panRef.current.moved) {
      panRef.current.moved = true;
      try { panRef.current.element?.setPointerCapture(panRef.current.pointerId); } catch {}
      setIsDragging(true);
    }
    setPan({ x: panRef.current.startPanX + dx, y: panRef.current.startPanY + dy });
  };

  const handlePointerUp = () => {
    panRef.current.isDown = false;
    panRef.current.moved = false;
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.12 : 0.12;
    setZoom((z) => Math.min(3.5, Math.max(0.7, parseFloat((z + delta).toFixed(2)))));
  };

  const resetView = () => {
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  const zoomIn = () => setZoom((z) => Math.min(3.5, parseFloat((z + 0.25).toFixed(2))));
  const zoomOut = () => setZoom((z) => Math.max(0.7, parseFloat((z - 0.25).toFixed(2))));

  const zoomStyle: React.CSSProperties = {
    transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${zoom})`,
    transformOrigin: 'center center',
    transition: isDragging ? 'none' : 'transform 0.15s ease-out',
  };

  return (
    <div className="relative w-full h-full min-h-[85vh] overflow-hidden bg-[#020905] select-none text-white">
      {/* ── SUBTLE BLURRED BACKDROP ── */}
      {layoutImageSrc && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <img
            src={layoutImageSrc}
            alt=""
            className="w-full h-full object-cover blur-2xl opacity-20 scale-110"
            draggable={false}
          />
          <div className="absolute inset-0 bg-[#020905]/85" />
        </div>
      )}

      {/* ── TOP-LEFT HUD BADGE ── */}
      <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0B2516] to-[#04140B] border border-[#EAB308] text-[#EAB308] text-[9px] sm:text-[10px] font-black shadow-xl flex items-center gap-1.5 pointer-events-none z-30 backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-[#EAB308] animate-ping" />
        <span className="hidden sm:inline">MAIN ENTRANCE (60-FT ROAD)</span>
        <span className="sm:hidden">60-FT ENTRY</span>
      </div>

      {/* ── VIEW MODE SWITCHER PILL ── */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 p-1 bg-black/85 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl max-w-[92vw]">
        {([
          { mode: 'topdown', label: '2D Master Plan', short: '2D Plan', Icon: Layers },
          { mode: 'blueprint', label: '2D CAD', short: '2D CAD', Icon: Sliders },
          { mode: 'satellite', label: 'Satellite', short: 'Sat', Icon: Compass },
        ] as { mode: LayoutDisplayMode; label: string; short: string; Icon: React.FC<{ className?: string }> }[]).map(
          ({ mode, label, short, Icon }) => (
            <button
              key={mode}
              type="button"
              onClick={() => onModeChange(mode)}
              className={`min-h-[34px] px-3.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                displayMode === mode
                  ? 'bg-[#15803D] text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{short}</span>
            </button>
          )
        )}
      </div>

      {/* ── TOP-RIGHT COMPASS ── */}
      <div className="absolute top-3 right-3 p-1.5 sm:p-2 rounded-xl bg-black/85 backdrop-blur-md border border-[#CA8A04]/60 shadow-xl flex flex-col items-center pointer-events-none z-30">
        <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-[#EAB308] animate-pulse" />
        <span className="text-[8px] font-black text-[#EAB308]">N</span>
      </div>

      {/* ── BOTTOM-RIGHT ZOOM CONTROLS ── */}
      {(displayMode === 'topdown' || displayMode === 'blueprint') && (
        <div className="absolute right-3 bottom-14 sm:bottom-12 z-30 flex flex-col gap-1.5 p-1 bg-black/85 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
          <button
            type="button"
            onClick={zoomIn}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-200 hover:text-[#EAB308] hover:bg-white/10 transition-colors cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={zoomOut}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-200 hover:text-[#EAB308] hover:bg-white/10 transition-colors cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={resetView}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-200 hover:text-[#EAB308] hover:bg-white/10 transition-colors cursor-pointer"
            title="Reset View"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ── BOTTOM-LEFT STATUS LEGEND (Live Counts) ── */}
      <div className="absolute left-3 bottom-14 sm:bottom-12 z-30 px-3.5 py-1.5 rounded-2xl bg-black/85 backdrop-blur-md border border-white/20 text-[10px] sm:text-[11px] font-bold text-white shadow-xl flex items-center gap-2.5">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]" />
          Avail: {availCount}
        </span>
        <span className="flex items-center gap-1.5 text-amber-400">
          <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.7)]" />
          Hold: {resCount}
        </span>
        <span className="flex items-center gap-1.5 text-red-400">
          <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
          Sold: {soldCount}
        </span>
      </div>

      {/* ── BOTTOM-CENTER PROMPT ── */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 rounded-full bg-black/85 backdrop-blur-md border border-[#CA8A04]/50 text-[#EAB308] text-[10px] sm:text-xs font-bold shadow-2xl flex items-center gap-2 pointer-events-none whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] animate-ping" />
        <span>{project.name} · Sanctioned Layout · Click any plot parcel to inspect</span>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          MAIN VIEWPORT CANVAS
          ══════════════════════════════════════════════════════════════ */}
      <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
        {/* ── MODE 1: 2D MASTER PLAN VIEW ──────────────────────────── */}
        {displayMode === 'topdown' && (
          <div
            className={`w-full h-full flex items-center justify-center overflow-hidden ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onWheel={handleWheel}
          >
            {/* The container preserves the exact aspect ratio of the layout image */}
            <div
              className="relative shadow-2xl"
              style={{
                ...zoomStyle,
                aspectRatio: `${imageSize.width} / ${imageSize.height}`,
                width: '100%',
                maxWidth: '1200px',
                maxHeight: '85vh',
              }}
            >
              {/* Actual uploaded master plan image as background */}
              {layoutImageSrc ? (
                <img
                  src={layoutImageSrc}
                  alt={project.name}
                  onLoad={handleImageLoad}
                  className="w-full h-full object-fill select-none pointer-events-none block"
                  draggable={false}
                />
              ) : (
                <div className="w-full h-full bg-[#0B2516] flex items-center justify-center text-slate-400 text-sm">
                  No layout image uploaded for this project
                </div>
              )}

              {/* Exact SVG Overlay positioned 1:1 on the image */}
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox={`0 0 ${imageSize.width} ${imageSize.height}`}
                preserveAspectRatio="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {mappedPlots.map((plot) => {
                  const b = plot.boundary!;
                  const isSelected = selectedPlot?.id === plot.id;
                  const colors = getStatusColors(plot.status, isSelected);

                  const hasPoints = Array.isArray(b.points) && b.points.length >= 3;

                  // Convert coordinates to SVG viewBox units
                  let pointsStr = '';
                  let cx = 0;
                  let cy = 0;
                  let w = (b.width / 100) * imageSize.width;
                  let h = (b.height / 100) * imageSize.height;
                  const x = (b.x / 100) * imageSize.width;
                  const y = (b.y / 100) * imageSize.height;

                  if (hasPoints) {
                    pointsStr = b.points!
                      .map(
                        ([px, py]) =>
                          `${(px / 100) * imageSize.width},${(py / 100) * imageSize.height}`
                      )
                      .join(' ');
                    cx =
                      b.points!.reduce((acc, p) => acc + (p[0] / 100) * imageSize.width, 0) /
                      b.points!.length;
                    cy =
                      b.points!.reduce((acc, p) => acc + (p[1] / 100) * imageSize.height, 0) /
                      b.points!.length;
                  } else {
                    cx = x + w / 2;
                    cy = y + h / 2;
                  }

                  const numFontSize = Math.min(13, Math.max(7, Math.min(w * 0.28, h * 0.28)));
                  const dimFontSize = Math.max(6, numFontSize - 3);
                  const showDim = h > 50 && w > 38;

                  return (
                    <g
                      key={`plot-layer-${plot.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPlot(plot);
                      }}
                      className="cursor-pointer group"
                      role="button"
                      aria-label={`Plot ${plot.plotNumber} — ${plot.status}`}
                    >
                      <title>{`Plot #${plot.plotNumber} · ${plot.plotDimensions} · ${plot.facing} Facing · ${plot.status} · ₹${(plot.totalPrice / 100000).toFixed(1)}L`}</title>

                      {hasPoints ? (
                        <polygon
                          points={pointsStr}
                          fill={colors.fill}
                          stroke={colors.stroke}
                          strokeWidth={isSelected ? 2.8 : colors.strokeWidth}
                          strokeDasharray={isSelected ? '4 2' : 'none'}
                          style={{ transition: 'fill 0.2s, stroke 0.2s' }}
                        />
                      ) : (
                        <rect
                          x={x}
                          y={y}
                          width={w}
                          height={h}
                          fill={colors.fill}
                          stroke={colors.stroke}
                          strokeWidth={isSelected ? 2.8 : colors.strokeWidth}
                          strokeDasharray={isSelected ? '4 2' : 'none'}
                          rx="2"
                          style={{ transition: 'fill 0.2s, stroke 0.2s' }}
                        />
                      )}

                      {/* Selection Glow Indicator */}
                      {isSelected && (
                        <rect
                          x={x - 2}
                          y={y - 2}
                          width={w + 4}
                          height={h + 4}
                          fill="none"
                          stroke="#FBBF24"
                          strokeWidth="1.2"
                          strokeDasharray="3 3"
                          rx="4"
                          opacity="0.8"
                        />
                      )}

                      {/* Plot Number Label Centered Inside Polygon/Rect */}
                      <text
                        x={cx}
                        y={showDim ? cy - dimFontSize * 0.7 : cy}
                        fill={colors.textFill}
                        fontSize={numFontSize}
                        fontWeight="900"
                        fontFamily="'Inter', system-ui, sans-serif"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="pointer-events-none select-none"
                        style={{
                          textShadow: '0 1px 3px rgba(0,0,0,0.95), 0 0 2px rgba(0,0,0,0.9)',
                          letterSpacing: '-0.3px',
                        }}
                      >
                        #{plot.plotNumber}
                      </text>

                      {/* Dimensions Sub-label if space permits */}
                      {showDim && (
                        <text
                          x={cx}
                          y={cy + numFontSize * 0.8}
                          fill={colors.textFill}
                          fontSize={dimFontSize}
                          fontWeight="600"
                          fontFamily="'Inter', system-ui, sans-serif"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          opacity="0.8"
                          className="pointer-events-none select-none"
                        >
                          {plot.plotDimensions}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Informational state when boundaries are not yet calibrated */}
              {unmappedCount > 0 && mappedPlots.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                  <div className="bg-[#04140B]/90 backdrop-blur-md border border-[#EAB308]/40 rounded-2xl px-6 py-4 text-center max-w-xs mx-4 shadow-2xl">
                    <div className="text-[#EAB308] text-2xl mb-2">✦</div>
                    <p className="text-white font-black text-sm">Layout Blueprint Uploaded</p>
                    <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                      Plot boundary coordinates are currently being mapped in the studio. Explore all plot specifications in the inventory table.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── MODE 2: 2D CAD SCHEMATIC VIEW ────────────────────────── */}
        {displayMode === 'blueprint' && (
          <div
            className={`w-full h-full flex items-center justify-center bg-[#040D1A] overflow-hidden relative ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onWheel={handleWheel}
          >
            {/* CSS Blueprint Grid */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(to right,#0284C7 1px,transparent 1px),linear-gradient(to bottom,#0284C7 1px,transparent 1px)',
                backgroundSize: '30px 30px',
              }}
            />

            {mappedPlots.length === 0 ? (
              <div className="relative z-20 flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto bg-[#07172A]/90 backdrop-blur-md border border-cyan-800/60 rounded-3xl space-y-4 shadow-2xl">
                <div className="w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-500/40 text-cyan-400 flex items-center justify-center mx-auto">
                  <Sliders className="w-6 h-6" />
                </div>
                <h4 className="text-base font-black text-white">No CAD Boundaries Configured</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Plot boundary coordinates have not yet been calibrated for {project.name}. Configure plot boundaries in the Promoter Boundary Studio.
                </p>
              </div>
            ) : (
              <div
                style={{
                  ...zoomStyle,
                  aspectRatio: `${imageSize.width} / ${imageSize.height}`,
                  width: '100%',
                  maxWidth: '1200px',
                  maxHeight: '85vh',
                }}
              >
                <svg
                  viewBox={`0 0 ${imageSize.width} ${imageSize.height}`}
                  className="w-full h-full drop-shadow-[0_10px_35px_rgba(0,0,0,0.9)]"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <pattern id="cadGridSmall" width="20" height="20" patternUnits="userSpaceOnUse">
                      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(2,132,199,0.08)" strokeWidth="0.8" />
                    </pattern>
                  </defs>

                  {/* CAD background */}
                  <rect x="0" y="0" width={imageSize.width} height={imageSize.height} fill="#040D1A" />
                  <rect x="0" y="0" width={imageSize.width} height={imageSize.height} fill="url(#cadGridSmall)" />
                  <rect
                    x="20"
                    y="20"
                    width={imageSize.width - 40}
                    height={imageSize.height - 40}
                    fill="none"
                    stroke="#0284C7"
                    strokeWidth="1.5"
                    strokeDasharray="6 3"
                  />

                  {/* ── ROADS & AVENUES ── */}
                  {/* Stellar Way (Central Horizontal) */}
                  <rect x="25" y="275" width="925" height="88" fill="#07192E" stroke="#0369A1" strokeWidth="1" />
                  <line x1="25" y1="319" x2="950" y2="319" stroke="#EAB308" strokeWidth="1.2" strokeDasharray="8 6" opacity="0.85" />
                  <text x="487" y="323" fill="#38BDF8" fontSize="10" fontWeight="900" letterSpacing="4" textAnchor="middle">
                    ◄ STELLAR WAY (40-FT CENTRAL BOULEVARD) ►
                  </text>

                  {/* Phoenix Avenue (Top) */}
                  <rect x="295" y="80" width="52" height="195" fill="#07192E" stroke="#0369A1" strokeWidth="0.8" />
                  <line x1="321" y1="80" x2="321" y2="275" stroke="#38BDF8" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.5" />
                  <text x="321" y="180" fill="#38BDF8" fontSize="8" fontWeight="800" textAnchor="middle" transform="rotate(-90 321 180)" letterSpacing="2">
                    PHOENIX AVE
                  </text>

                  {/* Galaxy Avenue (Top) */}
                  <rect x="495" y="80" width="55" height="195" fill="#07192E" stroke="#0369A1" strokeWidth="0.8" />
                  <line x1="522" y1="80" x2="522" y2="275" stroke="#38BDF8" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.5" />
                  <text x="522" y="180" fill="#38BDF8" fontSize="8" fontWeight="800" textAnchor="middle" transform="rotate(-90 522 180)" letterSpacing="2">
                    GALAXY AVE
                  </text>

                  {/* Infinity Avenue (Top) */}
                  <rect x="702" y="80" width="55" height="195" fill="#07192E" stroke="#0369A1" strokeWidth="0.8" />
                  <line x1="729" y1="80" x2="729" y2="275" stroke="#38BDF8" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.5" />
                  <text x="729" y="180" fill="#38BDF8" fontSize="8" fontWeight="800" textAnchor="middle" transform="rotate(-90 729 180)" letterSpacing="2">
                    INFINITY AVE
                  </text>

                  {/* Earth Club / OSR Park */}
                  <rect x="760" y="130" width="160" height="135" fill="rgba(16,185,129,0.1)" stroke="#10B981" strokeWidth="1" strokeDasharray="3 3" rx="4" />
                  <text x="840" y="197" fill="#34D399" fontSize="9" fontWeight="900" textAnchor="middle">
                    EARTH CLUB
                  </text>
                  <text x="840" y="210" fill="#6EE7B7" fontSize="7" fontWeight="700" textAnchor="middle">
                    OSR PARK
                  </text>

                  {/* Aquarius Avenue (Bottom) */}
                  <rect x="295" y="363" width="52" height="350" fill="#07192E" stroke="#0369A1" strokeWidth="0.8" />
                  <line x1="321" y1="363" x2="321" y2="713" stroke="#38BDF8" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.5" />
                  <text x="321" y="540" fill="#38BDF8" fontSize="8" fontWeight="800" textAnchor="middle" transform="rotate(-90 321 540)" letterSpacing="2">
                    AQUARIUS AVE
                  </text>

                  {/* Zodiac Avenue (Bottom) */}
                  <rect x="495" y="363" width="55" height="350" fill="#07192E" stroke="#0369A1" strokeWidth="0.8" />
                  <line x1="522" y1="363" x2="522" y2="713" stroke="#38BDF8" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.5" />
                  <text x="522" y="540" fill="#38BDF8" fontSize="8" fontWeight="800" textAnchor="middle" transform="rotate(-90 522 540)" letterSpacing="2">
                    ZODIAC AVE
                  </text>

                  {/* Aurora Avenue (Bottom) */}
                  <rect x="702" y="363" width="55" height="350" fill="#07192E" stroke="#0369A1" strokeWidth="0.8" />
                  <line x1="729" y1="363" x2="729" y2="713" stroke="#38BDF8" strokeWidth="0.8" strokeDasharray="4 4" opacity="0.5" />
                  <text x="729" y="540" fill="#38BDF8" fontSize="8" fontWeight="800" textAnchor="middle" transform="rotate(-90 729 540)" letterSpacing="2">
                    AURORA AVE
                  </text>

                  {/* ── PLOTS RENDERED FROM REAL DATABASE BOUNDARIES ── */}
                  {mappedPlots.map((plot) => {
                    const b = plot.boundary!;
                    const x = (b.x / 100) * imageSize.width;
                    const y = (b.y / 100) * imageSize.height;
                    const w = (b.width / 100) * imageSize.width;
                    const h = (b.height / 100) * imageSize.height;
                    const cx = x + w / 2;
                    const cy = y + h / 2;

                    const isSelected = selectedPlot?.id === plot.id;
                    const colors = getStatusColors(plot.status, isSelected);
                    const numFontSize = Math.min(12, Math.max(7, Math.min(w * 0.28, h * 0.28)));
                    const dimFontSize = Math.max(6, numFontSize - 3);
                    const showDim = h > 50 && w > 38;

                    return (
                      <g
                        key={`cad-${plot.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPlot(plot);
                        }}
                        className="cursor-pointer"
                      >
                        <title>{`Plot #${plot.plotNumber} · ${plot.plotDimensions} · ${plot.facing} Facing · ${plot.status} · ₹${(plot.totalPrice / 100000).toFixed(1)}L`}</title>
                        <rect
                          x={x}
                          y={y}
                          width={w}
                          height={h}
                          fill={colors.cadFill}
                          stroke={colors.cadStroke}
                          strokeWidth={isSelected ? 2.5 : 1.2}
                          rx="2"
                        />
                        <text
                          x={cx}
                          y={showDim ? cy - dimFontSize * 0.7 : cy}
                          fill={colors.cadText}
                          fontSize={numFontSize}
                          fontWeight="900"
                          fontFamily="monospace"
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="pointer-events-none select-none"
                        >
                          #{plot.plotNumber}
                        </text>
                        {showDim && (
                          <text
                            x={cx}
                            y={cy + numFontSize * 0.9}
                            fill="#94A3B8"
                            fontSize={dimFontSize}
                            fontWeight="600"
                            fontFamily="monospace"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            opacity="0.8"
                            className="pointer-events-none select-none"
                          >
                            {plot.plotDimensions}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
            )}
          </div>
        )}

        {/* ── MODE 3: SATELLITE VIEW (Interactive Leaflet Map) ─────── */}
        {displayMode === 'satellite' && (
          <div className="w-full h-full min-h-[85vh]">
            <SatelliteMapView project={project} />
          </div>
        )}
      </div>
    </div>
  );
};
