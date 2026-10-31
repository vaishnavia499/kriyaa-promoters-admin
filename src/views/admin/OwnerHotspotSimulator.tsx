import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Upload,
  FileSpreadsheet,
  Layers,
  Save,
  CheckCircle2,
  Trash2,
  Eye,
  Plus,
  RefreshCw,
  Compass,
  Building2,
  ShieldCheck,
  MousePointer,
  AlertTriangle,
  Globe,
  FileText,
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  Sliders,
  Video,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Property, PropertyStatus, Project } from '../../types';
import { parseCsvText, ParsedPlotRow } from '../../utils/spreadsheetParser';
import { MasterLayoutViewer } from '../../components/public/MasterLayoutViewer';

export const OwnerHotspotSimulator: React.FC = () => {
  const {
    projects,
    selectedProjectId,
    setSelectedProjectId,
    properties,
    showToast,
    publishProject,
    unpublishProject,
    uploadProjectLayout,
    importSpreadsheetPlots,
    savePlotBoundaries,
    saveProject,
    updatePropertyStatus,
    newProjectWizardActive,
    openNewProjectWizard,
    closeNewProjectWizard,
    plotManagementMode,
    setPlotManagementMode,
    visualizeProjectId,
    openVisualizeProject,
    closeVisualizeProject,
  } = useApp();

  // Active project being visualized or edited
  const activeProject = useMemo(() => {
    const targetId = plotManagementMode === 'visualize' ? visualizeProjectId : selectedProjectId;
    return projects.find((p) => p.id === targetId) || projects[0];
  }, [projects, selectedProjectId, visualizeProjectId, plotManagementMode]);

  // Plots belonging to active project
  const currentPlots = useMemo(() => {
    if (!activeProject) return [];
    return properties.filter((p) => p.projectId === activeProject.id);
  }, [properties, activeProject]);

  // Selected plot for boundary adjustment
  const [selectedPlotId, setSelectedPlotId] = useState<string | null>(null);
  const activePlot = useMemo(() => {
    return currentPlots.find((p) => p.id === selectedPlotId) || currentPlots[0] || null;
  }, [currentPlots, selectedPlotId]);

  // Local boundary state for active project
  const [localBoundaries, setLocalBoundaries] = useState<
    Record<string, { x: number; y: number; width: number; height: number; points?: [number, number][] }>
  >({});

  // Sync initial boundaries from properties
  useEffect(() => {
    const map: Record<string, { x: number; y: number; width: number; height: number; points?: [number, number][] }> = {};
    currentPlots.forEach((p) => {
      if (p.boundary) {
        map[p.id] = { ...p.boundary };
      }
    });
    setLocalBoundaries(map);
    if (currentPlots.length > 0 && !selectedPlotId) {
      setSelectedPlotId(currentPlots[0].id);
    }
  }, [currentPlots]);

  // Boundary Health Diagnostics
  const unmappedPlots = useMemo(() => {
    return currentPlots.filter((p) => {
      const b = localBoundaries[p.id] || p.boundary;
      return !b || typeof b.x !== 'number' || typeof b.y !== 'number' || b.width <= 0 || b.height <= 0;
    });
  }, [currentPlots, localBoundaries]);

  const duplicateBoundaries = useMemo(() => {
    const coordsMap = new Map<string, string[]>();
    currentPlots.forEach((p) => {
      const b = localBoundaries[p.id] || p.boundary;
      if (b && typeof b.x === 'number' && typeof b.y === 'number') {
        const key = `${Math.round(b.x * 10) / 10}_${Math.round(b.y * 10) / 10}`;
        const existing = coordsMap.get(key) || [];
        coordsMap.set(key, [...existing, p.plotNumber]);
      }
    });
    const dupes: { coord: string; plotNumbers: string[] }[] = [];
    coordsMap.forEach((plotNumbers, coord) => {
      if (plotNumbers.length > 1) {
        dupes.push({ coord, plotNumbers });
      }
    });
    return dupes;
  }, [currentPlots, localBoundaries]);

  // Layout image upload state
  const [isUploadingLayout, setIsUploadingLayout] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Spreadsheet upload state & validation
  const spreadsheetInputRef = useRef<HTMLInputElement>(null);
  const [isSpreadsheetModalOpen, setIsSpreadsheetModalOpen] = useState(false);
  const [spreadsheetText, setSpreadsheetText] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedPlotRow[]>([]);
  const [spreadsheetErrors, setSpreadsheetErrors] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  // Drawing state
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Customer Preview Modal state
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  // Publish confirmation modal state
  const [isPublishConfirmOpen, setIsPublishConfirmOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // ── UNIFIED 3-STEP NEW PROJECT REGISTRATION WIZARD STATE ──
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  // Step 1: Project Metadata & Plot Inventory
  const [wizProjName, setWizProjName] = useState('');
  const [wizProjLocation, setWizProjLocation] = useState('');
  const [wizProjDistrict, setWizProjDistrict] = useState('Cuddalore');
  const [wizProjDtcp, setWizProjDtcp] = useState('');
  const [wizProjRera, setWizProjRera] = useState('');
  const [wizProjArea, setWizProjArea] = useState('10.0 Acres');
  const [wizProjYear, setWizProjYear] = useState(new Date().getFullYear().toString());
  const [wizProjStatus, setWizProjStatus] = useState<'Active' | 'Upcoming' | 'Completed'>('Active');
  const [wizProjDesc, setWizProjDesc] = useState('');
  const [wizBasePricePerSqFt, setWizBasePricePerSqFt] = useState('1200');
  const [wizTotalPlotsEstimate, setWizTotalPlotsEstimate] = useState('45');
  const [wizNewProjectId, setWizNewProjectId] = useState<string | null>(null);

  // Step 2: Media & Walkthroughs
  const [wizPhotos, setWizPhotos] = useState<string[]>([]);
  const [wizPhotoUrlInput, setWizPhotoUrlInput] = useState('');
  const [wizVideoUrl, setWizVideoUrl] = useState('');
  const [wizBrochureUrl, setWizBrochureUrl] = useState('');
  const wizPhotoFileRef = useRef<HTMLInputElement>(null);
  const wizVideoFileRef = useRef<HTMLInputElement>(null);

  // Step 3: Blueprint & Layout Visualization
  const [wizLayoutUrl, setWizLayoutUrl] = useState('');
  const [wizLayoutUploading, setWizLayoutUploading] = useState(false);
  const wizLayoutFileRef = useRef<HTMLInputElement>(null);

  // Reset wizard on trigger
  useEffect(() => {
    if (newProjectWizardActive) {
      setWizardStep(1);
      setWizProjName('');
      setWizProjLocation('');
      setWizProjDistrict('Cuddalore');
      setWizProjDtcp('');
      setWizProjRera('');
      setWizProjArea('10.0 Acres');
      setWizProjYear(new Date().getFullYear().toString());
      setWizProjStatus('Active');
      setWizProjDesc('');
      setWizBasePricePerSqFt('1200');
      setWizTotalPlotsEstimate('45');
      setWizNewProjectId(null);
      setWizPhotos([]);
      setWizPhotoUrlInput('');
      setWizVideoUrl('');
      setWizBrochureUrl('');
      setWizLayoutUrl('');
    }
  }, [newProjectWizardActive]);

  // Canvas click to position boundary box
  const handleCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current || !activePlot) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    const currentB = localBoundaries[activePlot.id] || { width: 6.7, height: 8 };
    const newX = Math.max(0, Math.min(100 - currentB.width, Math.round((clickX - currentB.width / 2) * 10) / 10));
    const newY = Math.max(0, Math.min(100 - currentB.height, Math.round((clickY - currentB.height / 2) * 10) / 10));

    setLocalBoundaries((prev) => ({
      ...prev,
      [activePlot.id]: {
        ...currentB,
        x: newX,
        y: newY,
      },
    }));

    if (isDrawingMode) {
      setIsDrawingMode(false);
      showToast(`Positioned boundary for Plot #${activePlot.plotNumber}`, 'success');
    }
  };

  // Save all boundary coordinates
  const handleSaveAllBoundaries = async () => {
    if (!activeProject) return;

    const payload = Object.entries(localBoundaries).map(([plotId, b]) => {
      const plot = currentPlots.find((p) => p.id === plotId);
      return {
        plotId,
        plotNumber: plot?.plotNumber,
        x: b.x,
        y: b.y,
        width: b.width,
        height: b.height,
        points: b.points,
      };
    });

    await savePlotBoundaries(activeProject.id, payload);
  };

  // Layout file upload
  const handleLayoutFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeProject) return;

    setIsUploadingLayout(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        await uploadProjectLayout(activeProject.id, dataUrl);
      }
      setIsUploadingLayout(false);
    };

    reader.onerror = () => {
      showToast('Failed to read file', 'error');
      setIsUploadingLayout(false);
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Spreadsheet CSV import
  const handleSpreadsheetFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setSpreadsheetText(content);
        const { rows, fatalError } = parseCsvText(content);
        if (fatalError) {
          setSpreadsheetErrors([fatalError]);
          setParsedRows([]);
        } else {
          setParsedRows(rows);
          const allErrors = rows.flatMap((r) => r.errors);
          setSpreadsheetErrors(allErrors);
        }
        setIsSpreadsheetModalOpen(true);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExecuteImport = async () => {
    if (!activeProject || parsedRows.length === 0) return;

    setIsImporting(true);
    try {
      await importSpreadsheetPlots(activeProject.id, parsedRows);
      setIsSpreadsheetModalOpen(false);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsImporting(false);
    }
  };

  // Publish / Unpublish
  const handleConfirmPublish = async () => {
    if (!activeProject) return;
    setIsPublishing(true);
    await publishProject(activeProject.id);
    setIsPublishing(false);
    setIsPublishConfirmOpen(false);
  };

  const handleUnpublish = async () => {
    if (!activeProject) return;
    await unpublishProject(activeProject.id);
  };

  // ── WIZARD HANDLERS ──
  const handleWizSaveStep1 = () => {
    if (!wizProjName.trim()) {
      showToast('Project name is required', 'error');
      return;
    }
    if (!wizProjLocation.trim()) {
      showToast('Location is required', 'error');
      return;
    }

    const newId = `proj-${Date.now()}`;
    saveProject({
      id: newId,
      name: wizProjName.trim(),
      location: wizProjLocation.trim(),
      district: wizProjDistrict.trim(),
      dtcpNumber: wizProjDtcp.trim() || 'DTCP Sanctioned',
      reraNumber: wizProjRera.trim() || undefined,
      totalAreaExtent: wizProjArea.trim() || '10.0 Acres',
      launchYear: parseInt(wizProjYear) || new Date().getFullYear(),
      status: wizProjStatus,
      description: wizProjDesc.trim(),
      masterPlanImage: '/golden-city-layout.jpg',
      layoutImageUrl: '/golden-city-layout.jpg',
      isPublished: false,
    });

    setWizNewProjectId(newId);
    setWizardStep(2);
    showToast(`Step 1 Complete: Project "${wizProjName}" registered! Now attach media.`, 'success');
  };

  const handleWizAddPhotoUrl = () => {
    if (!wizPhotoUrlInput.trim()) return;
    setWizPhotos((prev) => [...prev, wizPhotoUrlInput.trim()]);
    setWizPhotoUrlInput('');
    showToast('Photo added', 'success');
  };

  const handleWizPhotoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        if (result) setWizPhotos((prev) => [...prev, result]);
      };
      reader.readAsDataURL(file);
    });
    showToast(`${files.length} photo(s) attached`, 'success');
    e.target.value = '';
  };

  const handleWizVideoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setWizVideoUrl(URL.createObjectURL(file));
    showToast(`Video selected: ${file.name}`, 'success');
    e.target.value = '';
  };

  const handleWizLayoutFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const targetProjId = wizNewProjectId || selectedProjectId;
    setWizLayoutUploading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      if (dataUrl) {
        setWizLayoutUrl(dataUrl);
        await uploadProjectLayout(targetProjId, dataUrl);
        showToast('Blueprint uploaded successfully', 'success');
      }
      setWizLayoutUploading(false);
    };
    reader.onerror = () => {
      setWizLayoutUploading(false);
      showToast('Failed to read blueprint file', 'error');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleWizLayoutUrlSave = async () => {
    if (!wizLayoutUrl.trim()) {
      showToast('Please enter a blueprint image URL', 'error');
      return;
    }
    const targetProjId = wizNewProjectId || selectedProjectId;
    setWizLayoutUploading(true);
    await uploadProjectLayout(targetProjId, wizLayoutUrl.trim());
    setWizLayoutUploading(false);
    showToast('Blueprint URL saved', 'success');
  };

  // Step 3 Finish: Automatically transition admin into the visual boundary studio for this new project
  const handleWizFinishAndOpenStudio = () => {
    const targetId = wizNewProjectId || selectedProjectId;
    closeNewProjectWizard();
    openVisualizeProject(targetId);
    showToast('Project registered! Now map physical plot parcels on the blueprint below.', 'success');
  };

  const handleWizSaveAndPublish = async () => {
    const targetId = wizNewProjectId || selectedProjectId;
    await publishProject(targetId);
    closeNewProjectWizard();
    openVisualizeProject(targetId);
    showToast('Project live published to website! Coordinate studio ready.', 'success');
  };

  return (
    <div className="w-full min-h-screen bg-[#F8FAFC] dark:bg-[#081B10] text-slate-900 dark:text-slate-100 flex flex-col p-4 sm:p-6 lg:p-8 space-y-6 select-none">
      {/* ═══════════════════════════════════════════════════════════
          UNIFIED 3-STEP NEW PROJECT REGISTRATION WIZARD OVERLAY
          Triggered by "+ Register New Project" CTA
          ═══════════════════════════════════════════════════════════ */}
      {newProjectWizardActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#0B2516] rounded-3xl border border-slate-200 dark:border-[#1E5D32] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100 dark:border-[#1E5D32]/60">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#EAB308]" />
                  New Project Registration Wizard
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Complete 3 steps to set up inventory, media, and spatial plot visualization
                </p>
              </div>
              <button
                type="button"
                onClick={closeNewProjectWizard}
                className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#164329] text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center gap-0 px-6 pt-5 pb-2">
              {[
                { n: 1, label: 'Info & Inventory' },
                { n: 2, label: 'Media & Tours' },
                { n: 3, label: 'Layout Visualization' },
              ].map(({ n, label }, idx) => (
                <React.Fragment key={n}>
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
                        wizardStep > n
                          ? 'bg-[#15803D] border-[#15803D] text-white'
                          : wizardStep === n
                          ? 'bg-[#15803D] border-[#15803D] text-white shadow-lg scale-110'
                          : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500'
                      }`}
                    >
                      {wizardStep > n ? <Check className="w-4 h-4" /> : n}
                    </div>
                    <span
                      className={`text-[10px] font-bold whitespace-nowrap ${
                        wizardStep === n ? 'text-[#15803D] dark:text-emerald-400 font-extrabold' : 'text-slate-400'
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {idx < 2 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 mb-4 rounded-full transition-all ${
                        wizardStep > n ? 'bg-[#15803D]' : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* ── STEP 1: PROJECT DETAILS & PLOT INVENTORY ── */}
            {wizardStep === 1 && (
              <div className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Layout / Project Name *</label>
                    <input
                      type="text"
                      value={wizProjName}
                      onChange={(e) => setWizProjName(e.target.value)}
                      placeholder="e.g. Golden City Phase 2"
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#112F1C] text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Location / Village *</label>
                    <input
                      type="text"
                      value={wizProjLocation}
                      onChange={(e) => setWizProjLocation(e.target.value)}
                      placeholder="e.g. Vandipalayam Main Road"
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#112F1C] text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">District</label>
                    <input
                      type="text"
                      value={wizProjDistrict}
                      onChange={(e) => setWizProjDistrict(e.target.value)}
                      placeholder="e.g. Cuddalore"
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#112F1C] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">DTCP Approval Number</label>
                    <input
                      type="text"
                      value={wizProjDtcp}
                      onChange={(e) => setWizProjDtcp(e.target.value)}
                      placeholder="e.g. LP/CDL/182/2023"
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#112F1C] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">RERA Registration ID</label>
                    <input
                      type="text"
                      value={wizProjRera}
                      onChange={(e) => setWizProjRera(e.target.value)}
                      placeholder="e.g. TN/01/Layout/0032/2023"
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#112F1C] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Total Acreage Extent</label>
                    <input
                      type="text"
                      value={wizProjArea}
                      onChange={(e) => setWizProjArea(e.target.value)}
                      placeholder="e.g. 12.5 Acres"
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#112F1C] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Launch Year</label>
                    <input
                      type="number"
                      value={wizProjYear}
                      onChange={(e) => setWizProjYear(e.target.value)}
                      min="2000"
                      max="2035"
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#112F1C] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Plot Inventory Parameters */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Base Price (₹/sq.ft)</label>
                    <input
                      type="number"
                      value={wizBasePricePerSqFt}
                      onChange={(e) => setWizBasePricePerSqFt(e.target.value)}
                      placeholder="e.g. 1200"
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#112F1C] text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Estimated Total Plots</label>
                    <input
                      type="number"
                      value={wizTotalPlotsEstimate}
                      onChange={(e) => setWizTotalPlotsEstimate(e.target.value)}
                      placeholder="e.g. 45"
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#112F1C] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Layout Description</label>
                    <textarea
                      rows={2}
                      value={wizProjDesc}
                      onChange={(e) => setWizProjDesc(e.target.value)}
                      placeholder="Key highlights, sweet water depth, road widths, gated security..."
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#112F1C] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeNewProjectWizard}
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleWizSaveStep1}
                    className="px-6 py-2.5 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-xs font-black flex items-center gap-2 shadow-md cursor-pointer"
                  >
                    Save &amp; Continue to Media
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2: MEDIA & WALKTHROUGHS ── */}
            {wizardStep === 2 && (
              <div className="p-6 space-y-5">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Attach site photos, entrance gate renders, drone tour video, and brochure.
                </p>

                {/* Photo URLs / Device Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Site Photos &amp; Renders</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={wizPhotoUrlInput}
                      onChange={(e) => setWizPhotoUrlInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleWizAddPhotoUrl()}
                      placeholder="https://... (photo URL)"
                      className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#112F1C] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={handleWizAddPhotoUrl}
                      className="px-4 py-2.5 rounded-xl bg-[#15803D] text-white text-xs font-bold cursor-pointer hover:bg-[#166534]"
                    >
                      Add
                    </button>
                  </div>

                  <input
                    ref={wizPhotoFileRef}
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleWizPhotoFile}
                  />
                  <button
                    type="button"
                    onClick={() => wizPhotoFileRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-emerald-500 transition-colors cursor-pointer text-xs font-bold"
                  >
                    <Upload className="w-4 h-4" />
                    Upload site photos from device
                  </button>
                </div>

                {wizPhotos.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {wizPhotos.map((url, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200">
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setWizPhotos((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Drone Tour Video */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Drone Tour / Video Walkthrough</label>
                  <input
                    type="url"
                    value={wizVideoUrl}
                    onChange={(e) => setWizVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=... or MP4 URL"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#112F1C] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <input
                    ref={wizVideoFileRef}
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={handleWizVideoFile}
                  />
                  <button
                    type="button"
                    onClick={() => wizVideoFileRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-slate-300 text-slate-500 text-xs font-bold hover:text-emerald-600 cursor-pointer"
                  >
                    <Video className="w-4 h-4" />
                    Upload video file
                  </button>
                </div>

                {/* Master Brochure PDF */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Brochure PDF Link (Optional)</label>
                  <input
                    type="url"
                    value={wizBrochureUrl}
                    onChange={(e) => setWizBrochureUrl(e.target.value)}
                    placeholder="https://... brochure PDF URL"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#112F1C] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setWizardStep(3)}
                    className="px-6 py-2.5 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-xs font-black flex items-center gap-2 shadow-md cursor-pointer"
                  >
                    Next: Blueprint &amp; Layout
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: BLUEPRINT & LAYOUT VISUALIZATION ── */}
            {wizardStep === 3 && (
              <div className="p-6 space-y-5">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Upload the official sanctioned master plan blueprint image (JPG or PNG). You will immediately be transitioned into the visual placement studio to calibrate plot coordinates.
                </p>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Sanctioned Master Plan Blueprint</label>
                  <input
                    ref={wizLayoutFileRef}
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={handleWizLayoutFileUpload}
                  />
                  <button
                    type="button"
                    onClick={() => wizLayoutFileRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 p-5 rounded-xl border-2 border-dashed border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors cursor-pointer text-xs font-bold"
                  >
                    {wizLayoutUploading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                    <span>{wizLayoutUploading ? 'Uploading blueprint...' : 'Select blueprint image file (JPG, PNG)'}</span>
                  </button>
                </div>

                <div className="text-xs text-slate-400 text-center">— or paste direct image URL —</div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={wizLayoutUrl}
                    onChange={(e) => setWizLayoutUrl(e.target.value)}
                    placeholder="https://... (direct blueprint image link)"
                    className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#112F1C] text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={handleWizLayoutUrlSave}
                    disabled={wizLayoutUploading}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold cursor-pointer hover:bg-slate-700 disabled:opacity-50"
                  >
                    Save URL
                  </button>
                </div>

                {wizLayoutUrl && (
                  <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-40">
                    <img src={wizLayoutUrl} alt="Blueprint preview" className="w-full h-full object-contain bg-slate-100 dark:bg-slate-900" />
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-[#1E5D32]/60">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    ← Back
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleWizFinishAndOpenStudio}
                      className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#113B24] hover:bg-[#164329] text-white text-xs font-black flex items-center justify-center gap-2 shadow-sm border border-[#EAB308]/60 cursor-pointer"
                    >
                      <Layers className="w-4 h-4 text-[#EAB308]" />
                      <span>Open Boundary Studio</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleWizSaveAndPublish}
                      className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#15803D] to-[#113B24] text-white text-xs font-black flex items-center justify-center gap-2 shadow-md cursor-pointer hover:brightness-110"
                    >
                      <Globe className="w-4 h-4 text-[#EAB308]" />
                      <span>Save &amp; Publish Live</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MODE A: DEFAULT LANDING — PROJECTS VISUALIZATION LIST
          ═══════════════════════════════════════════════════════════ */}
      {plotManagementMode === 'list' && (
        <div className="space-y-6">
          {/* Top Command Action Bar */}
          <div className="bg-white dark:bg-[#0B2516] rounded-3xl border border-slate-200 dark:border-[#1E5D32] p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-[#15803D]/10 text-[#15803D] dark:text-emerald-400">
                  <Sliders className="w-5 h-5" />
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  Plot Management · Visualization Command Center
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Spatial command center for layout blueprints, boundary calibration, CAD schematics, and live parcel publishing.
              </p>
            </div>

            {/* Top Action Bar: Prominent "+ Register New Project" CTA */}
            <button
              type="button"
              onClick={openNewProjectWizard}
              className="min-h-[44px] px-5 py-2.5 bg-gradient-to-r from-[#15803D] via-[#166534] to-[#113B24] hover:brightness-110 active:scale-[0.98] text-white text-xs sm:text-sm font-black rounded-xl flex items-center justify-center gap-2 shadow-md border border-[#EAB308]/40 transition-all cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 text-[#EAB308]" />
              <span>+ Register New Project</span>
            </button>
          </div>

          {/* List / Grid of All Registered Projects */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#15803D]" />
                All Layout Projects ({projects.length})
              </h2>
              <span className="text-[11px] text-slate-400">Select "Edit Visualization" to calibrate master plan boundaries</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((proj) => {
                const projPlots = properties.filter((p) => p.projectId === proj.id);
                const mappedPlotsCount = projPlots.filter(
                  (p) =>
                    p.boundary &&
                    typeof p.boundary.x === 'number' &&
                    typeof p.boundary.y === 'number' &&
                    p.boundary.width > 0 &&
                    p.boundary.height > 0
                ).length;
                const totalPlotsCount = projPlots.length;
                const percentMapped = totalPlotsCount > 0 ? Math.round((mappedPlotsCount / totalPlotsCount) * 100) : 0;
                const isFullyMapped = totalPlotsCount > 0 && mappedPlotsCount === totalPlotsCount;

                return (
                  <div
                    key={proj.id}
                    className="bg-white dark:bg-[#0B2516] rounded-3xl border border-slate-200 dark:border-[#1E5D32] p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-3">
                      {/* Blueprint Thumbnail */}
                      <div className="w-full h-36 rounded-2xl overflow-hidden bg-slate-100 dark:bg-[#112F1C] border border-slate-200 dark:border-[#1E5D32] relative group">
                        {proj.layoutImageUrl || proj.masterPlanImage ? (
                          <img
                            src={proj.layoutImageUrl || proj.masterPlanImage}
                            alt={proj.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                            No blueprint image uploaded
                          </div>
                        )}

                        {/* Status Badge */}
                        <div className="absolute top-2.5 right-2.5">
                          {proj.isPublished ? (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 backdrop-blur-md text-emerald-300 border border-emerald-500/50 text-[10px] font-black flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                              LIVE PUBLISHED
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-amber-950/80 backdrop-blur-md text-amber-300 border border-amber-500/50 text-[10px] font-black">
                              DRAFT
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Title & Location */}
                      <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white">
                          {proj.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{proj.location} · {proj.dtcpNumber || 'DTCP Sanctioned'}</span>
                        </p>
                      </div>

                      {/* Mapping Health Indicator */}
                      <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#112F1C] border border-slate-200/60 dark:border-[#1E5D32]/60 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-600 dark:text-slate-300">Mapping Health:</span>
                          <span
                            className={`font-black ${
                              isFullyMapped
                                ? 'text-[#15803D] dark:text-emerald-400'
                                : mappedPlotsCount > 0
                                ? 'text-[#CA8A04] dark:text-[#EAB308]'
                                : 'text-slate-400'
                            }`}
                          >
                            {mappedPlotsCount} / {totalPlotsCount} Plots Mapped ({percentMapped}%)
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isFullyMapped
                                ? 'bg-[#15803D]'
                                : mappedPlotsCount > 0
                                ? 'bg-amber-500'
                                : 'bg-slate-400'
                            }`}
                            style={{ width: `${percentMapped}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Primary Action Button: "Edit Visualization" */}
                    <button
                      type="button"
                      onClick={() => openVisualizeProject(proj.id)}
                      className="w-full min-h-[42px] px-4 py-2.5 rounded-xl bg-[#15803D] hover:bg-[#166534] active:scale-[0.98] text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer border border-[#CA8A04]/40"
                    >
                      <Layers className="w-4 h-4 text-[#EAB308]" />
                      <span>Edit Visualization</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-80" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MODE B: 2D BOUNDARY STUDIO & HOTSPOT CALIBRATION CANVAS
          Activated when "Edit Visualization" is clicked on a project
          ═══════════════════════════════════════════════════════════ */}
      {plotManagementMode === 'visualize' && activeProject && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Bar with "← Back to Projects" Navigation */}
          <div className="bg-white dark:bg-[#0B2516] rounded-3xl border border-slate-200 dark:border-[#1E5D32] p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={closeVisualizeProject}
                className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#112F1C] dark:hover:bg-[#164329] text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Back to All Projects"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to All Projects</span>
              </button>

              <div>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{activeProject.name}</span>
                  <span className="text-xs font-bold text-slate-400">· Boundary Studio</span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {currentPlots.length} plot parcels recorded · Aspect ratio calibrated to master plan blueprint
                </p>
              </div>
            </div>

            {/* Status & Preview Controls */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {activeProject.isPublished ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-xs font-black">
                  <span className="w-2 h-2 rounded-full bg-[#15803D] animate-ping" />
                  <span>LIVE PUBLISHED</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-[#EAB308] border border-amber-300 dark:border-amber-700 text-xs font-black">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>UNPUBLISHED DRAFT</span>
                </span>
              )}

              <button
                type="button"
                onClick={() => setIsPreviewModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#112F1C] text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-[#EAB308]" />
                <span>Customer Preview</span>
              </button>

              {activeProject.isPublished ? (
                <button
                  type="button"
                  onClick={handleUnpublish}
                  className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-rose-100 text-slate-700 hover:text-rose-700 text-xs font-bold cursor-pointer"
                >
                  Unpublish
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsPublishConfirmOpen(true)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#15803D] to-[#113B24] hover:brightness-110 active:scale-95 text-white text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Globe className="w-3.5 h-3.5 text-[#EAB308]" />
                  <span>Publish Live</span>
                </button>
              )}
            </div>
          </div>

          {/* Action Ribbon: Blueprint Upload, CSV Import, Boundary Sync */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Action 1: Upload Blueprint */}
            <div className="bg-white dark:bg-[#0B2516] rounded-2xl border border-slate-200 dark:border-[#1E5D32] p-4 flex items-center justify-between shadow-sm">
              <div className="space-y-0.5">
                <span className="text-[11px] font-black uppercase text-[#15803D] dark:text-emerald-400">Blueprint</span>
                <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">Master Plan Image</h4>
                <p className="text-[10px] text-slate-400">JPG or PNG layout file</p>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleLayoutFileSelect}
                accept="image/*,application/pdf"
                className="hidden"
              />

              <button
                type="button"
                disabled={isUploadingLayout}
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-[#15803D] hover:bg-[#113B24] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploadingLayout ? 'Uploading...' : 'Upload Image'}</span>
              </button>
            </div>

            {/* Action 2: Import Spreadsheet */}
            <div className="bg-white dark:bg-[#0B2516] rounded-2xl border border-slate-200 dark:border-[#1E5D32] p-4 flex items-center justify-between shadow-sm">
              <div className="space-y-0.5">
                <span className="text-[11px] font-black uppercase text-[#CA8A04] dark:text-[#EAB308]">Spreadsheet</span>
                <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">Import CSV Plots</h4>
                <p className="text-[10px] text-slate-400">{currentPlots.length} plots recorded</p>
              </div>

              <input
                type="file"
                ref={spreadsheetInputRef}
                onChange={handleSpreadsheetFileSelect}
                accept=".csv,.txt,.tsv"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => spreadsheetInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#EAB308] to-[#CA8A04] text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm hover:brightness-105"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Import CSV</span>
              </button>
            </div>

            {/* Action 3: Save Boundaries */}
            <div className="bg-white dark:bg-[#0B2516] rounded-2xl border border-slate-200 dark:border-[#1E5D32] p-4 flex items-center justify-between shadow-sm">
              <div className="space-y-0.5">
                <span className="text-[11px] font-black uppercase text-sky-600 dark:text-sky-400">Database</span>
                <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">Save Coordinates</h4>
                <p className="text-[10px] text-slate-400">Sync boundaries to Supabase</p>
              </div>

              <button
                type="button"
                onClick={handleSaveAllBoundaries}
                className="px-4 py-2 rounded-xl bg-[#113B24] hover:bg-[#164329] border border-[#EAB308]/60 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Save className="w-3.5 h-3.5 text-[#EAB308]" />
                <span>Save Coordinates</span>
              </button>
            </div>
          </div>

          {/* Diagnostic Warning Banner (if any plots unmapped or duplicate coords) */}
          {(unmappedPlots.length > 0 || duplicateBoundaries.length > 0) && (
            <div className="space-y-2">
              {unmappedPlots.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>{unmappedPlots.length} plot(s) unmapped:</strong> Plots #{unmappedPlots.map((p) => p.plotNumber).slice(0, 8).join(', ')}{unmappedPlots.length > 8 ? '…' : ''} lack boundary coordinates. Click them in the list and position them on the layout.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPlotId(unmappedPlots[0].id)}
                    className="px-3 py-1 rounded-lg bg-amber-200 dark:bg-amber-800 text-amber-950 dark:text-white font-bold text-[11px] cursor-pointer"
                  >
                    Map Plot #{unmappedPlots[0].plotNumber}
                  </button>
                </div>
              )}

              {duplicateBoundaries.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700 text-rose-900 dark:text-rose-200 text-xs flex items-center gap-2 shadow-sm">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    <strong>Overlapping boundary coordinates detected:</strong> Plots{' '}
                    {duplicateBoundaries.map((d, i) => (
                      <span key={i} className="font-bold underline mr-2">
                        #{d.plotNumbers.join(' & #')}
                      </span>
                    ))}
                    share identical coordinates. Please adjust their boundaries.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Main 2-Column Visual Calibration Studio */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (8 cols): Blueprint Visual Canvas */}
            <div className="lg:col-span-8 bg-white dark:bg-[#0B2516] rounded-3xl border border-slate-200 dark:border-[#1E5D32] p-4 sm:p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-[#1E5D32]/60">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    Interactive Boundary Calibration Canvas
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Click anywhere on the blueprint image to position or adjust the boundary for Plot #{activePlot?.plotNumber || ''}.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDrawingMode(!isDrawingMode)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer ${
                    isDrawingMode
                      ? 'bg-[#EAB308] text-slate-950 font-black shadow-md'
                      : 'bg-slate-100 dark:bg-[#112F1C] text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                  }`}
                >
                  <MousePointer className="w-3.5 h-3.5" />
                  <span>{isDrawingMode ? 'Click Blueprint to Place' : 'Mark Boundary'}</span>
                </button>
              </div>

              {/* Blueprint Viewport */}
              <div
                ref={canvasRef}
                onClick={handleCanvasClick}
                className="relative w-full aspect-[975/735] bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-[#1E5D32] cursor-crosshair shadow-inner"
              >
                {/* Master Plan Blueprint Image */}
                <img
                  src={activeProject.layoutImageUrl || activeProject.masterPlanImage || '/golden-city-layout.jpg'}
                  alt={activeProject.name}
                  className="w-full h-full object-fill select-none pointer-events-none"
                  draggable={false}
                />

                {/* Overlaid Plot Boundaries */}
                {currentPlots.map((plot) => {
                  const b = localBoundaries[plot.id] || plot.boundary || { x: 20, y: 20, width: 6.7, height: 8 };
                  const isSelected = activePlot?.id === plot.id;

                  const statusColor =
                    plot.status === 'Sold'
                      ? 'border-red-500 bg-red-500/25 text-red-200'
                      : plot.status === 'Reserved'
                      ? 'border-amber-400 bg-amber-400/25 text-amber-200'
                      : 'border-emerald-400 bg-emerald-400/25 text-emerald-100';

                  return (
                    <div
                      key={plot.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlotId(plot.id);
                      }}
                      style={{
                        left: `${b.x}%`,
                        top: `${b.y}%`,
                        width: `${b.width}%`,
                        height: `${b.height}%`,
                      }}
                      className={`absolute rounded-xs border transition-all cursor-pointer flex flex-col items-center justify-center p-0.5 text-center font-bold select-none ${statusColor} ${
                        isSelected ? 'ring-2 ring-white scale-105 z-20 shadow-xl' : 'hover:scale-102 z-10'
                      }`}
                    >
                      <span className="text-[9px] sm:text-[10px] font-black drop-shadow">
                        #{plot.plotNumber}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column (4 cols): Active Plot Inspector & Tuning */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white dark:bg-[#0B2516] rounded-3xl border border-slate-200 dark:border-[#1E5D32] p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1E5D32]/60">
                  <div>
                    <span className="text-[10px] font-black uppercase text-[#15803D] dark:text-emerald-400">
                      Plot Boundary Inspector
                    </span>
                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      Plot #{activePlot?.plotNumber || '—'}
                    </h3>
                  </div>

                  {/* Status Dropdown */}
                  {activePlot && (
                    <select
                      value={activePlot.status}
                      onChange={async (e) => {
                        const status = e.target.value as PropertyStatus;
                        await updatePropertyStatus(activePlot.id, status);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-[#112F1C] border border-slate-200 dark:border-[#1E5D32] text-xs font-bold text-slate-900 dark:text-white cursor-pointer"
                    >
                      <option value="Available">Available</option>
                      <option value="Reserved">Reserved</option>
                      <option value="Sold">Sold</option>
                    </select>
                  )}
                </div>

                {activePlot ? (
                  <div className="space-y-3 text-xs">
                    {/* Dimension Details */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#112F1C]">
                        <span className="text-[9.5px] text-slate-400 block uppercase font-bold">Dimensions</span>
                        <span className="font-bold text-slate-900 dark:text-white">{activePlot.plotDimensions}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#112F1C]">
                        <span className="text-[9.5px] text-slate-400 block uppercase font-bold">Area</span>
                        <span className="font-bold text-slate-900 dark:text-white">{activePlot.areaSqFt} sq.ft</span>
                      </div>
                    </div>

                    {/* Boundary Dimensions Tuning (Width & Height %) */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-[#1E5D32]/60">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Boundary Box Size (Aspect %)
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400">Width (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            min="2"
                            max="30"
                            value={localBoundaries[activePlot.id]?.width || 6.7}
                            onChange={(e) => {
                              const w = Number(e.target.value);
                              setLocalBoundaries((prev) => ({
                                ...prev,
                                [activePlot.id]: {
                                  ...(prev[activePlot.id] || { x: 20, y: 20, height: 8 }),
                                  width: w,
                                },
                              }));
                            }}
                            className="w-full px-2 py-1 rounded bg-slate-50 dark:bg-[#112F1C] border border-slate-300 dark:border-[#1E5D32] text-xs font-bold"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400">Height (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            min="2"
                            max="30"
                            value={localBoundaries[activePlot.id]?.height || 8}
                            onChange={(e) => {
                              const h = Number(e.target.value);
                              setLocalBoundaries((prev) => ({
                                ...prev,
                                [activePlot.id]: {
                                  ...(prev[activePlot.id] || { x: 20, y: 20, width: 6.7 }),
                                  height: h,
                                },
                              }));
                            }}
                            className="w-full px-2 py-1 rounded bg-slate-50 dark:bg-[#112F1C] border border-slate-300 dark:border-[#1E5D32] text-xs font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Plot Switcher List */}
                    <div className="pt-2 border-t border-slate-100 dark:border-[#1E5D32]/60 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">
                        Plots in {activeProject.name} ({currentPlots.length})
                      </span>
                      <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                        {currentPlots.map((plot) => {
                          const isMapped =
                            plot.boundary &&
                            typeof plot.boundary.x === 'number' &&
                            plot.boundary.width > 0;
                          return (
                            <button
                              key={plot.id}
                              type="button"
                              onClick={() => setSelectedPlotId(plot.id)}
                              className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                                activePlot?.id === plot.id
                                  ? 'bg-[#15803D] text-white font-bold'
                                  : 'bg-slate-50 dark:bg-[#112F1C] hover:bg-slate-100 dark:hover:bg-[#164329] text-slate-700 dark:text-slate-200'
                              }`}
                            >
                              <div className="flex items-center gap-1.5 truncate">
                                <span className={`w-2 h-2 rounded-full ${isMapped ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                                <span>Plot #{plot.plotNumber} · {plot.facing}</span>
                              </div>
                              <span className="text-[10px] opacity-80">₹{(plot.totalPrice / 100000).toFixed(1)}L</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-6 text-center">No plots recorded in this project yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SPREADSHEET VALIDATION & IMPORT MODAL
          ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isSpreadsheetModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-4xl bg-white dark:bg-[#0B2516] rounded-3xl border border-slate-200 dark:border-[#1E5D32] shadow-2xl p-6 space-y-5 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E5D32]/60">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Spreadsheet Validation &amp; Plot Import
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Target Project: <span className="font-bold text-[#15803D] dark:text-emerald-400">{activeProject?.name}</span> · {parsedRows.length} rows parsed
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSpreadsheetModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#112F1C] flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {spreadsheetErrors.length > 0 && (
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Spreadsheet Validation Warnings:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-0.5">
                    {spreadsheetErrors.slice(0, 5).map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex-1 overflow-auto rounded-2xl border border-slate-200 dark:border-[#1E5D32]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#113B24] text-white uppercase text-[10px] font-mono sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Dimensions</th>
                      <th className="py-2.5 px-3">Area (Sq.Ft)</th>
                      <th className="py-2.5 px-3">Facing</th>
                      <th className="py-2.5 px-3">Road</th>
                      <th className="py-2.5 px-3">Price/Sq.Ft</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#1E5D32]">
                    {parsedRows.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-[#112F1C]">
                        <td className="py-2 px-3 font-bold">#{r.plotNumber}</td>
                        <td className="py-2 px-3">{r.plotDimensions}</td>
                        <td className="py-2 px-3">{r.areaSqFt}</td>
                        <td className="py-2 px-3">{r.facing}</td>
                        <td className="py-2 px-3">{r.roadWidth}</td>
                        <td className="py-2 px-3">₹{r.pricePerSqFt}</td>
                        <td className="py-2 px-3 font-bold text-emerald-600">{r.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSpreadsheetModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isImporting}
                  onClick={handleExecuteImport}
                  className="px-6 py-2.5 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <Check className="w-4 h-4 text-[#EAB308]" />
                  <span>{isImporting ? 'Importing...' : `Import ${parsedRows.length} Plots`}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
          PUBLISH CONFIRMATION MODAL
          ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isPublishConfirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-[#0B2516] rounded-3xl border border-slate-200 dark:border-[#1E5D32] shadow-2xl p-6 space-y-4 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-[#15803D] mx-auto flex items-center justify-center">
                <Globe className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Publish "{activeProject?.name}" to Website?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  This will make the master plan layout, CAD diagram, and all {currentPlots.length} plot specifications visible to customers.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPublishConfirmOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isPublishing}
                  onClick={handleConfirmPublish}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#15803D] to-[#113B24] text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer hover:brightness-110"
                >
                  <Check className="w-4 h-4 text-[#EAB308]" />
                  <span>{isPublishing ? 'Publishing...' : 'Yes, Publish Live'}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
          LIVE CUSTOMER PREVIEW MODAL
          ───────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isPreviewModalOpen && activeProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-5xl bg-white dark:bg-[#081B10] rounded-3xl border border-slate-200 dark:border-[#1E5D32] shadow-2xl p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1E5D32]">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-[#15803D] text-xs font-black">
                    Live Customer Simulation View
                  </span>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {activeProject.name} — Interactive Plot Explorer
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#112F1C] flex items-center justify-center text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <MasterLayoutViewer
                project={activeProject}
                plots={currentPlots}
                selectedPlot={activePlot}
                onSelectPlot={(p) => setSelectedPlotId(p.id)}
                displayMode="topdown"
                onModeChange={() => {}}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
