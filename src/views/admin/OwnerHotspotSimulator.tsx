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
  Search,
  Loader2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Property, PropertyStatus, Project, ProjectFacilityItem, ProjectNearbyItem } from '../../types';
import { parseCsvText, ParsedPlotRow } from '../../utils/spreadsheetParser';
import { MasterLayoutViewer } from '../../components/public/MasterLayoutViewer';
import { updateProjectDetailsInSupabase, uploadProjectAssetToSupabase } from '../../services/supabaseDataService';
import * as XLSX from 'xlsx';

const PREDEFINED_INFRA_OPTIONS = [
  'Well-laid roads',
  '24/7 electricity',
  'Groundwater facility',
  'Gated community',
  'Street lighting',
  'Drainage system',
  'Water supply',
  "Parks and children's play areas",
  'Security facilities',
];

const WIZ_NEARBY_CATEGORIES = [
  'Hospitals',
  'Schools and colleges',
  'Bus stands',
  'Railway stations',
  'Shopping centres',
  'Main road access',
  'Banks',
  'Airports',
];

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
    deleteProject,
    updatePropertyStatus,
    setActiveTab,
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
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
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

  // ── UNIFIED 4-STEP ADD PROJECT WIZARD STATE ──
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3 | 4>(1);
  // Step 1: Main Project Details
  const [wizProjName, setWizProjName] = useState('');
  const [wizProjLocation, setWizProjLocation] = useState('');
  const [wizProjDistrict, setWizProjDistrict] = useState('');
  const [wizProjDtcp, setWizProjDtcp] = useState('');
  const [wizProjRera, setWizProjRera] = useState('');
  const [wizProjArea, setWizProjArea] = useState('');
  const [wizSqFt, setWizSqFt] = useState('');
  const [wizProjYear, setWizProjYear] = useState(new Date().getFullYear().toString());
  const [wizProjStatus, setWizProjStatus] = useState<'Active' | 'Upcoming' | 'Completed'>('Active');
  const [wizProjDesc, setWizProjDesc] = useState('');
  const [wizBasePricePerSqFt, setWizBasePricePerSqFt] = useState('');
  const [wizTotalPlotsEstimate, setWizTotalPlotsEstimate] = useState('');
  const [wizLegalTitle, setWizLegalTitle] = useState('');
  const [wizLegalDetails, setWizLegalDetails] = useState('');
  const [wizLegalVerified, setWizLegalVerified] = useState(false);
  const [wizNewProjectId, setWizNewProjectId] = useState<string | null>(null);

  // Step 2: Media, Plot Detail Excel, 2D Image & Banner Image
  const [wizMainImage, setWizMainImage] = useState('');
  const [wizPhotos, setWizPhotos] = useState<string[]>([]);
  const [wizPhotoUrlInput, setWizPhotoUrlInput] = useState('');
  const [wizVideoUrl, setWizVideoUrl] = useState('');
  const [wizBrochureUrl, setWizBrochureUrl] = useState('');
  const [wizBannerImage, setWizBannerImage] = useState('');
  const [wizMediaUploading, setWizMediaUploading] = useState(false);
  const [wizExcelFileName, setWizExcelFileName] = useState('');
  const [wizExcelRowsCount, setWizExcelRowsCount] = useState(0);
  const [wizPendingExcelRows, setWizPendingExcelRows] = useState<ParsedPlotRow[]>([]);
  const wizMainImageFileRef = useRef<HTMLInputElement>(null);
  const wizPhotoFileRef = useRef<HTMLInputElement>(null);
  const wizVideoFileRef = useRef<HTMLInputElement>(null);
  const wizBannerFileRef = useRef<HTMLInputElement>(null);
  const wizExcelFileRef = useRef<HTMLInputElement>(null);

  // Step 2/3: 2D Blueprint & Layout Visualization
  const [wizLayoutUrl, setWizLayoutUrl] = useState('');
  const [wizLayoutUploading, setWizLayoutUploading] = useState(false);
  const wizLayoutFileRef = useRef<HTMLInputElement>(null);

  // Step 3: Nearby Places
  const [wizNearbyPlaces, setWizNearbyPlaces] = useState<ProjectNearbyItem[]>([]);
  const [wizNewNearby, setWizNewNearby] = useState({
    name: '',
    category: 'Hospitals',
    distance: '',
    description: '',
  });
  const [wizCustomNearbyCategory, setWizCustomNearbyCategory] = useState('');

  // Step 4: Township Infrastructure
  const [wizInfrastructure, setWizInfrastructure] = useState<ProjectFacilityItem[]>([]);
  const [wizCustomInfraName, setWizCustomInfraName] = useState('');
  const [wizCustomInfraDesc, setWizCustomInfraDesc] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);

  // Reset wizard on trigger (only when starting fresh without a resume ID)
  const [isResumingWizard, setIsResumingWizard] = useState(false);
  useEffect(() => {
    if (newProjectWizardActive && !isResumingWizard) {
      setWizardStep(1);
      setWizProjName('');
      setWizProjLocation('');
      setWizProjDistrict('');
      setWizProjDtcp('');
      setWizProjRera('');
      setWizProjArea('');
      setWizSqFt('');
      setWizProjYear(new Date().getFullYear().toString());
      setWizProjStatus('Active');
      setWizProjDesc('');
      setWizBasePricePerSqFt('');
      setWizTotalPlotsEstimate('');
      setWizLegalTitle('');
      setWizLegalDetails('');
      setWizLegalVerified(false);
      setWizNewProjectId(null);
      setWizMainImage('');
      setWizPhotos([]);
      setWizPhotoUrlInput('');
      setWizVideoUrl('');
      setWizBrochureUrl('');
      setWizBannerImage('');
      setWizExcelFileName('');
      setWizExcelRowsCount(0);
      setWizPendingExcelRows([]);
      setWizLayoutUrl('');
      setWizNearbyPlaces([]);
      setWizNewNearby({ name: '', category: 'Hospitals', distance: '', description: '' });
      setWizCustomNearbyCategory('');
      setWizInfrastructure([]);
      setWizCustomInfraName('');
      setWizCustomInfraDesc('');
    }
    if (!newProjectWizardActive) {
      setIsResumingWizard(false);
    }
  }, [newProjectWizardActive, isResumingWizard]);

  const resumeIncompleteProject = (proj: Project) => {
    setIsResumingWizard(true);
    const step = (proj.wizardStep && proj.wizardStep >= 1 && proj.wizardStep <= 4 ? proj.wizardStep : 1) as 1 | 2 | 3 | 4;
    setWizardStep(step);
    setWizNewProjectId(proj.id);
    setWizProjName(proj.name || '');
    setWizProjLocation(proj.location || '');
    setWizProjDistrict(proj.district || 'Cuddalore');
    setWizProjDtcp(proj.dtcpNumber || '');
    setWizProjRera(proj.reraNumber || '');
    setWizProjArea(proj.totalAreaExtent || '10.0 Acres');
    setWizSqFt(proj.defaultSqFt || '1200');
    setWizProjYear((proj.launchYear || new Date().getFullYear()).toString());
    setWizProjStatus((proj.status === 'Inactive' ? 'Active' : proj.status) || 'Active');
    setWizProjDesc(proj.description || '');
    setWizBasePricePerSqFt((proj.basePricePerSqFt || 1200).toString());
    setWizTotalPlotsEstimate((proj.totalPlots || 45).toString());
    setWizLegalTitle(proj.legalTitle?.title || 'Clear Title & Encumbrance Verified');
    setWizLegalDetails(proj.legalTitle?.verificationDetails || '30-year EC & Patta verified');
    setWizLegalVerified(Boolean(proj.legalTitle?.verified));
    setWizMainImage(proj.masterPlanImage || '');
    setWizPhotos((proj.gallery || []).map((g) => g.url));
    setWizVideoUrl(proj.videoUrl || '');
    setWizBannerImage(proj.bannerImage || proj.featuredSection?.bannerImage || '');
    setWizLayoutUrl(proj.layoutImageUrl || proj.masterPlanImage || '');
    setWizNearbyPlaces(proj.nearbyPlaces || []);
    setWizInfrastructure(proj.infrastructure || []);
    openNewProjectWizard();
  };

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

  // Spreadsheet CSV/Excel import
  const handleSpreadsheetFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const isExcel = /\.(xlsx|xls|ods)$/i.test(file.name);
      let content = '';
      if (isExcel) {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheet = workbook.SheetNames[0];
        content = XLSX.utils.sheet_to_csv(workbook.Sheets[firstSheet]);
      } else {
        content = await file.text();
      }

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
    } catch (err: any) {
      console.error('Error importing spreadsheet:', err);
      showToast(err?.message || 'Failed to read spreadsheet file', 'error');
    } finally {
      e.target.value = '';
    }
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

  // ── 4-STEP WIZARD HANDLERS ──
  const buildWizardProjectPayload = (
    projId: string,
    step: number,
    incomplete: boolean,
    publish: boolean
  ): Project => {
    const existing = projects.find((p) => p.id === projId);
    const totalPlotsNum = parseInt(wizTotalPlotsEstimate) || (wizPendingExcelRows.length > 0 ? wizPendingExcelRows.length : existing?.totalPlots || 0);
    const baseCostNum = parseInt(wizBasePricePerSqFt) || existing?.basePricePerSqFt || 0;
    const coverImg =
      wizMainImage.trim() ||
      wizBannerImage.trim() ||
      wizLayoutUrl.trim() ||
      existing?.masterPlanImage ||
      '';
    const layoutImg = wizLayoutUrl.trim() || existing?.layoutImageUrl || '';

    return {
      ...(existing || {}),
      id: projId,
      name: wizProjName.trim() || 'Untitled Project',
      location: wizProjLocation.trim() || '',
      district: wizProjDistrict.trim() || (wizProjLocation.trim() ? `${wizProjLocation.trim()} District` : ''),
      dtcpNumber: wizProjDtcp.trim() || '',
      reraNumber: wizProjRera.trim() || undefined,
      totalAreaExtent: wizProjArea.trim() || '',
      defaultSqFt: wizSqFt.trim() || '',
      basePricePerSqFt: baseCostNum,
      totalPlots: totalPlotsNum,
      launchYear: parseInt(wizProjYear) || new Date().getFullYear(),
      status: wizProjStatus,
      description: wizProjDesc.trim(),
      masterPlanImage: coverImg,
      layoutImageUrl: layoutImg,
      bannerImage: wizBannerImage || undefined,
      videoUrl: wizVideoUrl.trim() || undefined,
      approvals: [
        ...(wizProjDtcp.trim()
          ? [
              {
                id: 'app-dtcp',
                authority: 'DTCP',
                number: wizProjDtcp.trim(),
                description: 'Directorate of Town and Country Planning approval.',
                verified: false,
                visible: true,
              },
            ]
          : []),
        ...(wizProjRera.trim()
          ? [
              {
                id: 'app-rera',
                authority: 'RERA',
                number: wizProjRera.trim(),
                description: 'RERA registration.',
                verified: false,
                visible: true,
              },
            ]
          : []),
      ],
      legalTitle: wizLegalTitle.trim() || wizLegalDetails.trim()
        ? {
            title: wizLegalTitle.trim() || 'Clear Title',
            description: wizLegalDetails.trim() || 'Legal verification details.',
            verificationDetails: wizLegalDetails.trim() || '',
            verified: wizLegalVerified,
            visible: true,
          }
        : existing?.legalTitle,
      gallery: wizPhotos.map((url, idx) => ({
        id: `gal-${idx}-${Date.now()}`,
        url,
        caption: `${wizProjName.trim() || 'Project'} Photo ${idx + 1}`,
        featured: idx === 0,
        order: idx + 1,
        visible: true,
      })),
      nearbyPlaces: wizNearbyPlaces,
      infrastructure: wizInfrastructure,
      featuredSection: wizBannerImage
        ? {
            enabled: true,
            heading: `Invest in ${wizProjName.trim() || 'This Layout'}`,
            description: wizProjDesc.trim() || 'Approved residential plots.',
            bannerImage: wizBannerImage,
          }
        : existing?.featuredSection,
      isIncomplete: incomplete,
      wizardStep: step,
      isPublished: publish,
      updatedAt: new Date().toISOString(),
    };
  };

  const handleWizSaveStep1 = async () => {
    if (!wizProjName.trim()) {
      showToast('Project name is required', 'error');
      return;
    }
    if (!wizProjLocation.trim()) {
      showToast('Location is required', 'error');
      return;
    }
    const projId = wizNewProjectId || `proj-${Date.now()}`;
    const payload = buildWizardProjectPayload(projId, 2, true, false);
    saveProject(payload);
    await updateProjectDetailsInSupabase(payload);
    setWizNewProjectId(projId);
    setWizardStep(2);
    showToast('Step 1 saved! Now add images, video, plot Excel, 2D image & banner.', 'success');
  };

  const ensureWizProjectId = () => {
    if (wizNewProjectId) return wizNewProjectId;
    const generated = `proj-${Date.now()}`;
    setWizNewProjectId(generated);
    return generated;
  };

  const handleWizMainImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setWizMediaUploading(true);
    try {
      const projId = ensureWizProjectId();
      const uploaded = await uploadProjectAssetToSupabase(projId, file, 'cover');
      if (uploaded?.url) {
        setWizMainImage(uploaded.url);
        showToast('Main project image uploaded', 'success');
      }
    } finally {
      setWizMediaUploading(false);
      e.target.value = '';
    }
  };

  const handleWizBannerFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setWizMediaUploading(true);
    try {
      const projId = ensureWizProjectId();
      const uploaded = await uploadProjectAssetToSupabase(projId, file, 'featured');
      if (uploaded?.url) {
        setWizBannerImage(uploaded.url);
        showToast('Banner image attached', 'success');
      }
    } finally {
      setWizMediaUploading(false);
      e.target.value = '';
    }
  };

  const handleWizExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setWizExcelFileName(file.name);
    try {
      const isExcel = /\.(xlsx|xls|ods)$/i.test(file.name);
      let content = '';
      if (isExcel) {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheet = workbook.SheetNames[0];
        content = XLSX.utils.sheet_to_csv(workbook.Sheets[firstSheet]);
      } else {
        content = await file.text();
      }

      if (!content || !content.trim()) {
        showToast('Uploaded spreadsheet is empty', 'error');
        return;
      }

      const { rows, fatalError } = parseCsvText(content);
      if (fatalError) {
        showToast(fatalError, 'error');
        return;
      }
      setWizPendingExcelRows(rows);
      setWizExcelRowsCount(rows.length);
      if (rows.length > 0 && (!wizTotalPlotsEstimate || wizTotalPlotsEstimate === '0')) {
        setWizTotalPlotsEstimate(rows.length.toString());
      }
      showToast(`Parsed ${rows.length} plots from ${file.name}`, 'success');
    } catch (err: any) {
      console.error('Error processing spreadsheet upload:', err);
      showToast(err?.message || 'Failed to read spreadsheet file', 'error');
    } finally {
      e.target.value = '';
    }
  };

  const handleWizSaveStep2 = async () => {
    const projId = wizNewProjectId || `proj-${Date.now()}`;
    if (wizPendingExcelRows.length > 0) {
      await importSpreadsheetPlots(projId, wizPendingExcelRows);
      setWizPendingExcelRows([]);
    }
    const payload = buildWizardProjectPayload(projId, 3, true, false);
    saveProject(payload);
    await updateProjectDetailsInSupabase(payload);
    setWizNewProjectId(projId);
    setWizardStep(3);
    showToast('Step 2 saved! Now add nearby places.', 'success');
  };

  const handleWizSaveStep3 = async () => {
    let nextNearby = wizNearbyPlaces;
    if (wizNewNearby.name.trim() && wizNewNearby.distance.trim()) {
      const resolvedCategory =
        wizNewNearby.category === 'Custom'
          ? wizCustomNearbyCategory.trim() || 'Other'
          : wizNewNearby.category;
      nextNearby = [
        ...wizNearbyPlaces,
        {
          id: `near-${Date.now()}`,
          name: wizNewNearby.name.trim(),
          category: resolvedCategory,
          distance: wizNewNearby.distance.trim(),
          description: wizNewNearby.description.trim() || undefined,
          icon: resolvedCategory,
          order: wizNearbyPlaces.length + 1,
          visible: true,
        },
      ];
      setWizNearbyPlaces(nextNearby);
      setWizNewNearby({ name: '', category: 'Hospitals', distance: '', description: '' });
      setWizCustomNearbyCategory('');
    }
    const projId = wizNewProjectId || `proj-${Date.now()}`;
    const payload = {
      ...buildWizardProjectPayload(projId, 4, true, false),
      nearbyPlaces: nextNearby,
    };
    saveProject(payload);
    await updateProjectDetailsInSupabase(payload);
    setWizNewProjectId(projId);
    setWizardStep(4);
    showToast('Step 3 saved! Now select township infrastructure.', 'success');
  };

  const handleWizSaveIncomplete = async () => {
    if (!wizProjName.trim()) {
      closeNewProjectWizard();
      return;
    }
    const projId = wizNewProjectId || `proj-${Date.now()}`;
    const payload = buildWizardProjectPayload(projId, wizardStep, true, false);
    saveProject(payload);
    closeNewProjectWizard();
    showToast(`Saved "${wizProjName.trim()}" as Incomplete (Step ${wizardStep}/4).`, 'info');
    updateProjectDetailsInSupabase(payload).catch((err) =>
      console.warn('[handleWizSaveIncomplete] Supabase background note:', err)
    );
  };

  const handleWizCompleteAndPublish = async () => {
    if (isCompleting) return;
    setIsCompleting(true);

    try {
      const projId = ensureWizProjectId();

      // Include any custom infrastructure that was typed in the inputs
      let finalInfra = [...wizInfrastructure];
      if (wizCustomInfraName.trim()) {
        finalInfra.push({
          id: `fac-${Date.now()}`,
          name: wizCustomInfraName.trim(),
          description: wizCustomInfraDesc.trim(),
          icon: 'check',
          order: finalInfra.length + 1,
          enabled: true,
        });
        setWizInfrastructure(finalInfra);
        setWizCustomInfraName('');
        setWizCustomInfraDesc('');
      }

      // Import any pending spreadsheet plots
      if (wizPendingExcelRows.length > 0) {
        try {
          await importSpreadsheetPlots(projId, wizPendingExcelRows);
          setWizPendingExcelRows([]);
        } catch (plotErr) {
          console.warn('[handleWizCompleteAndPublish] Plot import note:', plotErr);
        }
      }

      const payload: Project = {
        ...buildWizardProjectPayload(projId, 4, false, true),
        infrastructure: finalInfra,
      };

      // 1. Immediately save locally to AppContext state and localStorage
      saveProject(payload);
      setSelectedProjectId(projId);

      // 2. Immediately close wizard and navigate to Projects tab
      closeNewProjectWizard();
      setActiveTab('projects');
      showToast(`Project "${payload.name}" published & added to website!`, 'success');

      // 3. Sync to Supabase & backend asynchronously in the background
      Promise.allSettled([
        updateProjectDetailsInSupabase(payload),
        publishProject(projId),
      ]).then(([dbRes, pubRes]) => {
        if (dbRes.status === 'fulfilled' && dbRes.value.success) {
          console.log('[handleWizCompleteAndPublish] Supabase sync completed');
        }
      });
    } catch (err: any) {
      console.error('[handleWizCompleteAndPublish] Error completing project:', err);
      // Fail-safe: ensure user isn't stuck
      const fallbackProjId = wizNewProjectId || `proj-${Date.now()}`;
      const fallbackPayload = buildWizardProjectPayload(fallbackProjId, 4, false, true);
      saveProject(fallbackPayload);
      closeNewProjectWizard();
      setActiveTab('projects');
      showToast('Project saved locally', 'info');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleWizAddPhotoUrl = () => {
    if (!wizPhotoUrlInput.trim()) return;
    setWizPhotos((prev) => [...prev, wizPhotoUrlInput.trim()]);
    setWizPhotoUrlInput('');
    showToast('Photo added', 'success');
  };

  const handleWizPhotoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setWizMediaUploading(true);
    try {
      const projId = ensureWizProjectId();
      const uploaded = await Promise.all(
        Array.from(files).map((file) => uploadProjectAssetToSupabase(projId, file, 'gallery'))
      );
      const urls = uploaded.map((u) => u.url).filter(Boolean);
      if (urls.length > 0) {
        setWizPhotos((prev) => [...prev, ...urls]);
        showToast(`${urls.length} image(s) uploaded`, 'success');
      }
    } finally {
      setWizMediaUploading(false);
      e.target.value = '';
    }
  };

  const handleWizVideoFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setWizMediaUploading(true);
    try {
      const projId = ensureWizProjectId();
      const uploaded = await uploadProjectAssetToSupabase(projId, file, 'video');
      if (uploaded?.url) {
        setWizVideoUrl(uploaded.url);
        showToast(`Video uploaded: ${file.name}`, 'success');
      }
    } finally {
      setWizMediaUploading(false);
      e.target.value = '';
    }
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
          ADD PROJECT FULL-PAGE MULTI-STEP FORM (Not a Pop-up)
          ═══════════════════════════════════════════════════════════ */}
      {newProjectWizardActive && (
        <div className="w-full max-w-4xl mx-auto space-y-4">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleWizSaveIncomplete}
              className="h-10 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-[#113B24] inline-flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-4 h-4 text-[#15803D]" />
              <span>Back to Projects</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm w-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-black text-[#113B24] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#EAB308]" />
                  {isResumingWizard || wizNewProjectId ? 'Setup Project' : 'Add New Project'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete all 4 steps to publish to the website, or save anytime as Incomplete
                </p>
              </div>
              <div className="flex items-center gap-2">
                {wizNewProjectId && (
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          `Are you sure you want to delete this incomplete draft "${wizProjName || 'Untitled Project'}"?`
                        )
                      ) {
                        deleteProject(wizNewProjectId);
                        closeNewProjectWizard();
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Delete Incomplete Draft"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Delete Draft</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleWizSaveIncomplete}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  title="Save as Incomplete & Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 4-Step Indicator */}
            <div className="flex items-center gap-0 px-6 pt-5 pb-2 overflow-x-auto">
              {[
                { n: 1, label: 'Main Details' },
                { n: 2, label: 'Media & 2D' },
                { n: 3, label: 'Nearby Places' },
                { n: 4, label: 'Infrastructure' },
              ].map(({ n, label }, idx) => (
                <React.Fragment key={n}>
                  <div className="flex flex-col items-center gap-1 shrink-0">
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
                  {idx < 3 && (
                    <div
                      className={`flex-1 min-w-[20px] h-0.5 mx-2 mb-4 rounded-full transition-all ${
                        wizardStep > n ? 'bg-[#15803D]' : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* ── STEP 1: MAIN PROJECT DETAILS ── */}
            {wizardStep === 1 && (
              <div className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Project Name *</label>
                    <input
                      type="text"
                      value={wizProjName}
                      onChange={(e) => setWizProjName(e.target.value)}
                      placeholder="e.g. Golden City Phase 2"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#112F1C] text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Location / Address *</label>
                    <input
                      type="text"
                      value={wizProjLocation}
                      onChange={(e) => setWizProjLocation(e.target.value)}
                      placeholder="e.g. Vandipalayam Main Road"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#112F1C] text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">District</label>
                    <input
                      type="text"
                      value={wizProjDistrict}
                      onChange={(e) => setWizProjDistrict(e.target.value)}
                      placeholder="e.g. Cuddalore"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#112F1C] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">No. of Plots</label>
                    <input
                      type="number"
                      value={wizTotalPlotsEstimate}
                      onChange={(e) => setWizTotalPlotsEstimate(e.target.value)}
                      placeholder="e.g. 45"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#112F1C] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Sq.Ft / Plot Size</label>
                    <input
                      type="text"
                      value={wizSqFt}
                      onChange={(e) => setWizSqFt(e.target.value)}
                      placeholder="e.g. 1200 sq.ft"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#112F1C] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Cost (₹ / Sq.Ft)</label>
                    <input
                      type="number"
                      value={wizBasePricePerSqFt}
                      onChange={(e) => setWizBasePricePerSqFt(e.target.value)}
                      placeholder="e.g. 1200"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#112F1C] text-slate-900 dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Total Land Extent</label>
                    <input
                      type="text"
                      value={wizProjArea}
                      onChange={(e) => setWizProjArea(e.target.value)}
                      placeholder="e.g. 12.5 Acres"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#112F1C] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Government Approval (DTCP)</label>
                    <input
                      type="text"
                      value={wizProjDtcp}
                      onChange={(e) => setWizProjDtcp(e.target.value)}
                      placeholder="e.g. DTCP No. 182/2023"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#112F1C] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">RERA Approval (Optional)</label>
                    <input
                      type="text"
                      value={wizProjRera}
                      onChange={(e) => setWizProjRera(e.target.value)}
                      placeholder="e.g. TN/01/Layout/0032/2023"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#112F1C] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Legal Title</label>
                    <input
                      type="text"
                      value={wizLegalTitle}
                      onChange={(e) => setWizLegalTitle(e.target.value)}
                      placeholder="e.g. Clear Title & Patta Ready"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#112F1C] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Legal Verification Details</label>
                    <input
                      type="text"
                      value={wizLegalDetails}
                      onChange={(e) => setWizLegalDetails(e.target.value)}
                      placeholder="e.g. 30-year EC & Patta verified"
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#112F1C] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-center gap-2">
                    <input
                      id="wiz-legal-verified"
                      type="checkbox"
                      checked={wizLegalVerified}
                      onChange={(e) => setWizLegalVerified(e.target.checked)}
                    />
                    <label htmlFor="wiz-legal-verified" className="font-bold text-slate-700 dark:text-slate-300">
                      Mark Legal Title as Admin Verified
                    </label>
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Project Description</label>
                    <textarea
                      rows={2}
                      value={wizProjDesc}
                      onChange={(e) => setWizProjDesc(e.target.value)}
                      placeholder="Key highlights, location advantages..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#112F1C] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                  <button
                    type="button"
                    onClick={handleWizSaveIncomplete}
                    className="order-2 sm:order-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs sm:text-sm font-bold hover:bg-slate-50 text-center cursor-pointer"
                  >
                    Save as Incomplete
                  </button>
                  <button
                    type="button"
                    onClick={handleWizSaveStep1}
                    className="order-1 sm:order-2 px-6 py-2.5 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
                  >
                    <span className="whitespace-nowrap">Next: Media, Excel &amp; 2D</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2: MAIN IMAGE, GALLERY IMAGES, VIDEO, PLOT EXCEL, 2D IMAGE & BANNER ── */}
            {wizardStep === 2 && (
              <div className="p-6 space-y-4 text-xs">
                {/* Main Project Image (Card Cover in Projects Area) */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Main Project Image <span className="text-slate-400 font-normal">(Displays on Project Card)</span>
                  </label>
                  <input ref={wizMainImageFileRef} type="file" accept="image/*" className="hidden" onChange={handleWizMainImageFile} />
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={wizMainImage}
                      onChange={(e) => setWizMainImage(e.target.value)}
                      placeholder="Main project cover image URL or upload"
                      className="flex-1 p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                    />
                    <button
                      type="button"
                      disabled={wizMediaUploading}
                      onClick={() => wizMainImageFileRef.current?.click()}
                      className="px-3.5 py-2.5 rounded-xl bg-[#15803D] text-white font-bold cursor-pointer disabled:opacity-60"
                    >
                      {wizMediaUploading ? 'Uploading...' : 'Upload Main Image'}
                    </button>
                  </div>
                  {wizMainImage && (
                    <img src={wizMainImage} alt="Main Project Cover" className="w-full h-32 rounded-xl object-cover border border-slate-200" />
                  )}
                </div>

                {/* Banner Image */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Featured Banner Image</label>
                  <input ref={wizBannerFileRef} type="file" accept="image/*" className="hidden" onChange={handleWizBannerFile} />
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={wizBannerImage}
                      onChange={(e) => setWizBannerImage(e.target.value)}
                      placeholder="Banner image URL or upload"
                      className="flex-1 p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                    />
                    <button
                      type="button"
                      disabled={wizMediaUploading}
                      onClick={() => wizBannerFileRef.current?.click()}
                      className="px-3.5 py-2.5 rounded-xl bg-[#113B24] text-white font-bold cursor-pointer disabled:opacity-60"
                    >
                      Upload Banner
                    </button>
                  </div>
                  {wizBannerImage && (
                    <img src={wizBannerImage} alt="Banner" className="w-full h-28 rounded-xl object-cover border border-slate-200" />
                  )}
                </div>

                {/* Project Images (Multiple) */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Plot & Project Gallery Images <span className="text-slate-400 font-normal">(Multiple images supported)</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={wizPhotoUrlInput}
                      onChange={(e) => setWizPhotoUrlInput(e.target.value)}
                      placeholder="https://... (photo URL)"
                      className="flex-1 p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                    />
                    <button
                      type="button"
                      onClick={handleWizAddPhotoUrl}
                      className="px-4 py-2.5 rounded-xl bg-[#15803D] text-white font-bold cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                  <input ref={wizPhotoFileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleWizPhotoFile} />
                  <button
                    type="button"
                    disabled={wizMediaUploading}
                    onClick={() => wizPhotoFileRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-slate-300 text-slate-600 font-bold hover:border-emerald-500 cursor-pointer disabled:opacity-60"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{wizMediaUploading ? 'Uploading images...' : 'Upload multiple plot/project images'}</span>
                  </button>
                  {wizPhotos.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 pt-1">
                      {wizPhotos.map((url, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setWizPhotos((prev) => prev.filter((_, i) => i !== idx))}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Plot / Project Video */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Plot / Project Video</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={wizVideoUrl}
                      onChange={(e) => setWizVideoUrl(e.target.value)}
                      placeholder="YouTube / MP4 video URL or upload"
                      className="flex-1 p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                    />
                    <input ref={wizVideoFileRef} type="file" accept="video/*" className="hidden" onChange={handleWizVideoFile} />
                    <button
                      type="button"
                      disabled={wizMediaUploading}
                      onClick={() => wizVideoFileRef.current?.click()}
                      className="px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-700 cursor-pointer disabled:opacity-60"
                    >
                      {wizMediaUploading ? 'Uploading...' : 'Upload Video'}
                    </button>
                  </div>
                  {wizVideoUrl && !wizVideoUrl.includes('youtube.com') && !wizVideoUrl.includes('youtu.be') && (
                    <video src={wizVideoUrl} controls className="w-full h-40 rounded-xl bg-black border border-slate-200" />
                  )}
                </div>

                {/* Plot Detail Excel / CSV */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Plot Detail Excel / CSV</label>
                  <input ref={wizExcelFileRef} type="file" accept=".csv,.txt,.tsv,.xlsx,.xls,.ods" className="hidden" onChange={handleWizExcelUpload} />
                  <button
                    type="button"
                    onClick={() => wizExcelFileRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-[#CA8A04] bg-[#fff6df]/60 text-[#8b6a1a] font-bold cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>
                      {wizExcelFileName
                        ? `${wizExcelFileName} (${wizExcelRowsCount} plots ready)`
                        : 'Upload Plot Details Spreadsheet (.csv / Excel)'}
                    </span>
                  </button>
                </div>

                {/* 2D Layout Image */}
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 dark:text-slate-300">2D Master Layout Image</label>
                  <input ref={wizLayoutFileRef} type="file" accept="image/*" className="hidden" onChange={handleWizLayoutFileUpload} />
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={wizLayoutUrl}
                      onChange={(e) => setWizLayoutUrl(e.target.value)}
                      placeholder="2D layout image URL or upload"
                      className="flex-1 p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                    />
                    <button
                      type="button"
                      onClick={() => wizLayoutFileRef.current?.click()}
                      className="px-3.5 py-2.5 rounded-xl bg-[#15803D] text-white font-bold cursor-pointer"
                    >
                      {wizLayoutUploading ? 'Uploading...' : 'Upload 2D'}
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setWizardStep(1)}
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 text-center cursor-pointer text-xs sm:text-sm"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={handleWizSaveIncomplete}
                      className="flex-1 sm:hidden px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 font-bold hover:bg-amber-100 text-center cursor-pointer text-xs"
                    >
                      Save Incomplete
                    </button>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleWizSaveIncomplete}
                      className="hidden sm:inline-flex px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 font-bold hover:bg-amber-100 cursor-pointer text-xs sm:text-sm"
                    >
                      Save Incomplete
                    </button>
                    <button
                      type="button"
                      onClick={handleWizSaveStep2}
                      className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white font-black flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all text-xs sm:text-sm"
                    >
                      <span className="whitespace-nowrap">Next: Nearby Places</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: NEARBY PLACES & DETAILS ── */}
            {wizardStep === 3 && (
              <div className="p-6 space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <span className="font-bold text-[#113B24] block">Add Nearby Place</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={wizNewNearby.name}
                      onChange={(e) => setWizNewNearby((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Place name *"
                      className="h-9 px-2.5 rounded-lg border border-slate-200 bg-white"
                    />
                    <select
                      value={wizNewNearby.category}
                      onChange={(e) => setWizNewNearby((p) => ({ ...p, category: e.target.value }))}
                      className="h-9 px-2.5 rounded-lg border border-slate-200 bg-white"
                    >
                      {WIZ_NEARBY_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                      <option value="Custom">Custom...</option>
                    </select>
                  </div>
                  {wizNewNearby.category === 'Custom' && (
                    <input
                      type="text"
                      value={wizCustomNearbyCategory}
                      onChange={(e) => setWizCustomNearbyCategory(e.target.value)}
                      placeholder="Enter custom category * (e.g. Temple, IT Park, Beach)"
                      className="w-full h-9 px-2.5 rounded-lg border border-emerald-300 bg-white"
                    />
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={wizNewNearby.distance}
                      onChange={(e) => setWizNewNearby((p) => ({ ...p, distance: e.target.value }))}
                      placeholder="Distance (e.g. 2.5 km) *"
                      className="h-9 px-2.5 rounded-lg border border-slate-200 bg-white"
                    />
                    <input
                      type="text"
                      value={wizNewNearby.description}
                      onChange={(e) => setWizNewNearby((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Details / description"
                      className="h-9 px-2.5 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!wizNewNearby.name.trim() || !wizNewNearby.distance.trim()) {
                        showToast('Place name and distance are required', 'error');
                        return;
                      }
                      if (wizNewNearby.category === 'Custom' && !wizCustomNearbyCategory.trim()) {
                        showToast('Please enter a custom category name', 'error');
                        return;
                      }
                      const resolvedCategory =
                        wizNewNearby.category === 'Custom'
                          ? wizCustomNearbyCategory.trim()
                          : wizNewNearby.category;
                      setWizNearbyPlaces((prev) => [
                        ...prev,
                        {
                          id: `near-${Date.now()}`,
                          name: wizNewNearby.name.trim(),
                          category: resolvedCategory,
                          distance: wizNewNearby.distance.trim(),
                          description: wizNewNearby.description.trim() || undefined,
                          icon: resolvedCategory,
                          order: prev.length + 1,
                          visible: true,
                        },
                      ]);
                      setWizNewNearby({ name: '', category: 'Hospitals', distance: '', description: '' });
                      setWizCustomNearbyCategory('');
                    }}
                    className="h-9 px-4 rounded-lg bg-[#113B24] text-white font-bold cursor-pointer"
                  >
                    + Add Place
                  </button>
                </div>

                {wizNearbyPlaces.length > 0 && (
                  <div className="space-y-2 max-h-44 overflow-y-auto">
                    {wizNearbyPlaces.map((pl) => (
                      <div key={pl.id} className="p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                        <div>
                          <strong className="text-[#113B24] block">{pl.name}</strong>
                          <span className="text-slate-500">
                            {pl.category} · {pl.distance}
                            {pl.description ? ` · ${pl.description}` : ''}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setWizNearbyPlaces((prev) => prev.filter((x) => x.id !== pl.id))}
                          className="p-1 text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setWizardStep(2)}
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 text-center cursor-pointer text-xs sm:text-sm"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={handleWizSaveIncomplete}
                      className="flex-1 sm:hidden px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 font-bold hover:bg-amber-100 text-center cursor-pointer text-xs"
                    >
                      Save Incomplete
                    </button>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleWizSaveIncomplete}
                      className="hidden sm:inline-flex px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 font-bold hover:bg-amber-100 cursor-pointer text-xs sm:text-sm"
                    >
                      Save Incomplete
                    </button>
                    <button
                      type="button"
                      onClick={handleWizSaveStep3}
                      className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white font-black flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all text-xs sm:text-sm"
                    >
                      <span className="whitespace-nowrap">Next: Infrastructure</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 4: TOWNSHIP INFRASTRUCTURE & PUBLISH ── */}
            {wizardStep === 4 && (
              <div className="p-6 space-y-4 text-xs">
                <div className="space-y-2">
                  <span className="font-bold text-[#113B24] block">Select Township Infrastructure</span>
                  <div className="flex flex-wrap gap-2">
                    {PREDEFINED_INFRA_OPTIONS.map((opt) => {
                      const exists = wizInfrastructure.some((f) => f.name.toLowerCase() === opt.toLowerCase());
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            if (exists) {
                              setWizInfrastructure((prev) =>
                                prev.filter((f) => f.name.toLowerCase() !== opt.toLowerCase())
                              );
                            } else {
                              setWizInfrastructure((prev) => [
                                ...prev,
                                {
                                  id: `fac-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                                  name: opt,
                                  description: '',
                                  icon: 'check',
                                  order: prev.length + 1,
                                  enabled: true,
                                },
                              ]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-full font-bold border cursor-pointer ${
                            exists
                              ? 'bg-[#113B24] text-white border-[#113B24]'
                              : 'bg-white text-[#113B24] border-slate-200 hover:border-[#15803D]'
                          }`}
                        >
                          {exists ? '✓ ' : '+ '}
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <span className="font-bold text-[#113B24] block">Add Custom Facility</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={wizCustomInfraName}
                      onChange={(e) => setWizCustomInfraName(e.target.value)}
                      placeholder="Facility name (e.g. Solar Street Lights)"
                      className="h-9 px-3 rounded-xl border border-slate-200 bg-white"
                    />
                    <input
                      type="text"
                      value={wizCustomInfraDesc}
                      onChange={(e) => setWizCustomInfraDesc(e.target.value)}
                      placeholder="Optional description"
                      className="h-9 px-3 rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!wizCustomInfraName.trim()) return;
                      setWizInfrastructure((prev) => [
                        ...prev,
                        {
                          id: `fac-${Date.now()}`,
                          name: wizCustomInfraName.trim(),
                          description: wizCustomInfraDesc.trim(),
                          icon: 'check',
                          order: prev.length + 1,
                          enabled: true,
                        },
                      ]);
                      setWizCustomInfraName('');
                      setWizCustomInfraDesc('');
                    }}
                    className="h-9 px-4 rounded-xl bg-[#113B24] hover:bg-[#15803D] text-white font-bold cursor-pointer transition-colors"
                  >
                    + Add Facility
                  </button>
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setWizardStep(3)}
                      disabled={isCompleting}
                      className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 text-center cursor-pointer text-xs sm:text-sm"
                    >
                      ← Back
                    </button>
                    <button
                      type="button"
                      onClick={handleWizSaveIncomplete}
                      disabled={isCompleting}
                      className="flex-1 sm:hidden px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 font-bold hover:bg-amber-100 text-center cursor-pointer text-xs"
                    >
                      Save Incomplete
                    </button>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleWizSaveIncomplete}
                      disabled={isCompleting}
                      className="hidden sm:inline-flex px-4 py-2.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-800 font-bold hover:bg-amber-100 cursor-pointer text-xs sm:text-sm"
                    >
                      Save Incomplete
                    </button>
                    <button
                      type="button"
                      onClick={handleWizCompleteAndPublish}
                      disabled={isCompleting}
                      className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-[#113B24] hover:bg-[#15803D] disabled:opacity-60 text-white font-black flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all text-xs sm:text-sm"
                    >
                      {isCompleting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#EAB308]" />
                          <span className="whitespace-nowrap">Publishing Project...</span>
                        </>
                      ) : (
                        <>
                          <Globe className="w-4 h-4 text-[#EAB308]" />
                          <span className="whitespace-nowrap">Complete &amp; Add to Website</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MODE A: DEFAULT LANDING — ADD PROJECT & EXISTING PROJECT CARDS
          ═══════════════════════════════════════════════════════════ */}
      {plotManagementMode === 'list' && !newProjectWizardActive && (
        <div className="space-y-5">
          {/* Top Action Bar: + Add Project */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-black text-[#113B24]">Projects</h2>
              <p className="text-xs text-slate-500">
                Existing projects and incomplete drafts
              </p>
            </div>
            <button
              type="button"
              onClick={openNewProjectWizard}
              className="min-h-[42px] px-5 py-2.5 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-xs sm:text-sm font-black inline-flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#EAB308]" />
              <span>Add Project</span>
            </button>
          </div>

          {/* Search Bar with Search Button + Enter */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
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
                  placeholder="Search project by name or address..."
                  value={searchInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchInput(val);
                    if (!val.trim()) setSearchQuery('');
                  }}
                  className="w-full h-10 text-xs sm:text-sm pl-10 pr-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="h-10 px-4 rounded-xl bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </form>
          </div>

          {/* Existing Projects: Each Project in Separate Card with Banner Image, Name & Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects
              .filter((p) => {
                if (!searchQuery.trim()) return true;
                const q = searchQuery.toLowerCase().trim();
                return (
                  p.name.toLowerCase().includes(q) ||
                  p.location.toLowerCase().includes(q) ||
                  p.district.toLowerCase().includes(q)
                );
              })
              .map((proj) => {
                const isIncomplete = Boolean(proj.isIncomplete) || !proj.isPublished;
                const cardBanner =
                  proj.bannerImage ||
                  proj.featuredSection?.bannerImage ||
                  proj.masterPlanImage ||
                  '/golden-city-layout.jpg';
                return (
                  <div
                    key={proj.id}
                    className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Project Banner Image */}
                      <div className="relative h-40 w-full bg-[#113B24] overflow-hidden">
                        <img
                          src={cardBanner}
                          alt={proj.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                          {isIncomplete ? (
                            <>
                              <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-black uppercase shadow-xs">
                                Incomplete{proj.wizardStep ? ` · Step ${proj.wizardStep}/4` : ''}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (
                                    window.confirm(
                                      `Are you sure you want to delete the incomplete project "${proj.name}"?`
                                    )
                                  ) {
                                    deleteProject(proj.id);
                                  }
                                }}
                                className="w-7 h-7 rounded-full bg-red-600/90 hover:bg-red-700 text-white flex items-center justify-center shadow-xs cursor-pointer transition-colors"
                                title="Delete Incomplete Project"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-[#113B24]/90 text-white border border-white/20 text-[10px] font-black uppercase shadow-xs">
                              Published
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Project Name & Address */}
                      <div className="p-4 space-y-1">
                        <h3 className="text-base font-extrabold text-[#113B24]">
                          {proj.name}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#15803D] shrink-0" />
                          <span>
                            {proj.location}, {proj.district}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      {isIncomplete ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => resumeIncompleteProject(proj)}
                            className="flex-1 h-10 px-4 rounded-xl bg-[#CA8A04] hover:bg-[#a16207] text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
                          >
                            Resume Setup
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Are you sure you want to delete the incomplete project "${proj.name}"?`
                                )
                              ) {
                                deleteProject(proj.id);
                              }
                            }}
                            className="h-10 px-3.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                            title="Delete Incomplete Project"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openVisualizeProject(proj.id)}
                          className="w-full h-10 px-4 rounded-xl bg-[#edf4ee] hover:bg-[#dceadd] text-[#113B24] text-xs font-bold cursor-pointer"
                        >
                          Open Studio
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
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
                accept=".csv,.txt,.tsv,.xlsx,.xls,.ods"
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
