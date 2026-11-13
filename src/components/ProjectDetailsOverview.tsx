import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  Building2,
  Bus,
  Camera,
  CheckCircle2,
  Clock,
  Droplet,
  Eye,
  EyeOff,
  FileCheck2,
  FileText,
  GraduationCap,
  Hospital,
  Image as ImageIcon,
  Landmark,
  LayoutGrid,
  Lightbulb,
  MapPin,
  Navigation,
  Pencil,
  Plane,
  Plus,
  Save,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Train,
  Trash2,
  TreePine,
  Upload,
  X,
  Zap,
} from 'lucide-react';
import {
  Project,
  ProjectApprovalItem,
  ProjectFacilityItem,
  ProjectFeaturedSection,
  ProjectGalleryItem,
  ProjectLegalTitle,
  ProjectNearbyItem,
} from '../types';
import {
  updateProjectDetailsInSupabase,
  uploadProjectAssetToSupabase,
} from '../services/supabaseDataService';

interface ProjectDetailsOverviewProps {
  project: Project;
  totalPlots: number;
  availablePlots: number;
  soldPlots: number;
  onSaveProject: (updated: Project) => void;
  onOpenMasterLayout: () => void;
  onDeleteProject: () => void;
  onNotify: (message: string, type?: 'success' | 'info' | 'error') => void;
}

type ActiveModal =
  | null
  | 'cover'
  | 'info'
  | 'approvals'
  | 'legal'
  | 'infrastructure'
  | 'nearby'
  | 'gallery'
  | 'featured'
  | 'preview';

const PREDEFINED_FACILITIES: { name: string; description: string; icon: string }[] = [
  { name: 'Well-laid roads', description: 'Blacktop tar internal road network', icon: 'road' },
  { name: '24/7 electricity', description: 'Three-phase EB supply lines', icon: 'zap' },
  { name: 'Groundwater facility', description: 'Potable sweet water source', icon: 'droplet' },
  { name: 'Gated community', description: 'Secured perimeter & entrance arch', icon: 'shield' },
  { name: 'Street lighting', description: 'LED avenue illumination', icon: 'lightbulb' },
  { name: 'Drainage system', description: 'Storm-water drainage culverts', icon: 'droplet' },
  { name: 'Water supply', description: 'Dedicated water line network', icon: 'droplet' },
  { name: "Parks and children's play areas", description: 'Landscaped OSR park & play lawn', icon: 'park' },
  { name: 'Security facilities', description: '24/7 gated watch & surveillance', icon: 'shield' },
];

const NEARBY_CATEGORIES = [
  'Hospitals',
  'Schools and colleges',
  'Bus stands',
  'Railway stations',
  'Shopping centres',
  'Main road access',
  'Banks',
  'Airports',
];

const FACILITY_ICONS: Record<string, React.FC<{ className?: string }>> = {
  road: Navigation,
  zap: Zap,
  droplet: Droplet,
  shield: ShieldCheck,
  lightbulb: Lightbulb,
  park: TreePine,
  building: Building2,
};

const NEARBY_ICONS: Record<string, React.FC<{ className?: string }>> = {
  Hospitals: Hospital,
  'Schools and colleges': GraduationCap,
  'Bus stands': Bus,
  'Railway stations': Train,
  'Shopping centres': ShoppingBag,
  'Main road access': Navigation,
  Banks: Landmark,
  Airports: Plane,
};

export const ProjectDetailsOverview: React.FC<ProjectDetailsOverviewProps> = ({
  project,
  totalPlots,
  availablePlots,
  soldPlots,
  onSaveProject,
  onOpenMasterLayout,
  onDeleteProject,
  onNotify,
}) => {
  // Local working draft synced when switching projects
  const [draft, setDraft] = useState<Project>(project);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setDraft(project);
  }, [project]);

  const approvals: ProjectApprovalItem[] = useMemo(() => {
    if (draft.approvals) return draft.approvals;
    const list: ProjectApprovalItem[] = [];
    if (draft.dtcpNumber) {
      list.push({
        id: 'app-dtcp',
        authority: 'DTCP',
        number: draft.dtcpNumber,
        description: 'Directorate of Town & Country Planning layout sanction.',
        verified: false,
        visible: true,
      });
    }
    if (draft.reraNumber) {
      list.push({
        id: 'app-rera',
        authority: 'RERA',
        number: draft.reraNumber,
        description: 'Tamil Nadu Real Estate Regulatory Authority registration.',
        verified: false,
        visible: true,
      });
    }
    return list;
  }, [draft.approvals, draft.dtcpNumber, draft.reraNumber]);

  const legalTitle: ProjectLegalTitle = useMemo(
    () =>
      draft.legalTitle || {
        title: 'Clear Title & Encumbrance Verification',
        description: 'Legal title verification details have not been added yet.',
        verificationDetails: 'Pending admin verification',
        verified: false,
        visible: true,
      },
    [draft.legalTitle]
  );

  const infrastructure = useMemo(
    () => [...(draft.infrastructure || [])].sort((a, b) => a.order - b.order),
    [draft.infrastructure]
  );

  const nearbyPlaces = useMemo(
    () => [...(draft.nearbyPlaces || [])].sort((a, b) => a.order - b.order),
    [draft.nearbyPlaces]
  );

  const gallery = useMemo(
    () => [...(draft.gallery || [])].sort((a, b) => a.order - b.order),
    [draft.gallery]
  );

  const featuredSection: ProjectFeaturedSection = useMemo(
    () =>
      draft.featuredSection || {
        enabled: false,
        heading: `Invest in ${draft.name}`,
        description: draft.description || 'DTCP approved residential plots with clear documentation.',
        bannerImage: draft.masterPlanImage,
      },
    [draft.featuredSection, draft.name, draft.description, draft.masterPlanImage]
  );

  // Modal temporary states
  const [coverUrlInput, setCoverUrlInput] = useState('');
  const [infoForm, setInfoForm] = useState({
    name: '',
    location: '',
    district: '',
    status: 'Active' as Project['status'],
    totalAreaExtent: '',
    description: '',
  });
  const [infoError, setInfoError] = useState('');

  const [approvalsForm, setApprovalsForm] = useState<ProjectApprovalItem[]>([]);
  const [legalForm, setLegalForm] = useState<ProjectLegalTitle>(legalTitle);
  const [infraForm, setInfraForm] = useState<ProjectFacilityItem[]>([]);
  const [customInfraName, setCustomInfraName] = useState('');
  const [customInfraDesc, setCustomInfraDesc] = useState('');
  const [customInfraIcon, setCustomInfraIcon] = useState('building');

  const [nearbyForm, setNearbyForm] = useState<ProjectNearbyItem[]>([]);
  const [newNearby, setNewNearby] = useState({
    name: '',
    category: 'Hospitals',
    distance: '',
    description: '',
  });
  const [nearbyError, setNearbyError] = useState('');

  const [galleryForm, setGalleryForm] = useState<ProjectGalleryItem[]>([]);
  const [featuredForm, setFeaturedForm] = useState<ProjectFeaturedSection>(featuredSection);

  const persistProject = async (nextDraft: Project, publish?: boolean) => {
    const updated: Project = {
      ...nextDraft,
      isPublished: publish !== undefined ? publish : nextDraft.isPublished,
      hasDraftChanges: publish === true ? false : publish === false ? true : nextDraft.hasDraftChanges,
      updatedAt: new Date().toISOString(),
    };
    setDraft(updated);
    onSaveProject(updated);
    await updateProjectDetailsInSupabase(updated);
  };

  // Open individual section modals
  const openCoverModal = () => {
    setCoverUrlInput(draft.masterPlanImage || '');
    setActiveModal('cover');
  };

  const openInfoModal = () => {
    setInfoForm({
      name: draft.name,
      location: draft.location,
      district: draft.district,
      status: draft.status,
      totalAreaExtent: draft.totalAreaExtent || '',
      description: draft.description || '',
    });
    setInfoError('');
    setActiveModal('info');
  };

  const openApprovalsModal = () => {
    setApprovalsForm(approvals.map((a) => ({ ...a })));
    setActiveModal('approvals');
  };

  const openLegalModal = () => {
    setLegalForm({ ...legalTitle });
    setActiveModal('legal');
  };

  const openInfraModal = () => {
    setInfraForm(infrastructure.map((f) => ({ ...f })));
    setCustomInfraName('');
    setCustomInfraDesc('');
    setActiveModal('infrastructure');
  };

  const openNearbyModal = () => {
    setNearbyForm(nearbyPlaces.map((n) => ({ ...n })));
    setNewNearby({ name: '', category: 'Hospitals', distance: '', description: '' });
    setNearbyError('');
    setActiveModal('nearby');
  };

  const openGalleryModal = () => {
    setGalleryForm(gallery.map((g) => ({ ...g })));
    setActiveModal('gallery');
  };

  const openFeaturedModal = () => {
    setFeaturedForm({ ...featuredSection });
    setActiveModal('featured');
  };

  // Upload handlers using Supabase Storage
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const { url } = await uploadProjectAssetToSupabase(draft.id, file, 'cover');
      setCoverUrlInput(url);
      onNotify('Cover image uploaded', 'success');
    } catch {
      onNotify('Failed to upload cover image', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleApprovalDocUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const { url, fileName } = await uploadProjectAssetToSupabase(draft.id, file, 'approvals');
      setApprovalsForm((prev) =>
        prev.map((item) => (item.id === id ? { ...item, documentUrl: url, documentName: fileName } : item))
      );
      onNotify(`Uploaded ${fileName}`, 'success');
    } catch {
      onNotify('Failed to upload approval document', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLegalDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const { url, fileName } = await uploadProjectAssetToSupabase(draft.id, file, 'legal');
      setLegalForm((prev) => ({ ...prev, documentUrl: url, documentName: fileName }));
      onNotify(`Uploaded ${fileName}`, 'success');
    } catch {
      onNotify('Failed to upload legal document', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsUploading(true);
    try {
      const uploaded: ProjectGalleryItem[] = [];
      for (let i = 0; i < files.length; i++) {
        const { url, fileName } = await uploadProjectAssetToSupabase(draft.id, files[i], 'gallery');
        uploaded.push({
          id: `gal-${Date.now()}-${i}`,
          url,
          caption: fileName.replace(/\.[^/.]+$/, ''),
          featured: galleryForm.length === 0 && i === 0,
          order: galleryForm.length + i + 1,
          visible: true,
        });
      }
      setGalleryForm((prev) => [...prev, ...uploaded]);
      onNotify(`${uploaded.length} image(s) uploaded`, 'success');
    } catch {
      onNotify('Gallery upload failed', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFeaturedBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const { url } = await uploadProjectAssetToSupabase(draft.id, file, 'featured');
      setFeaturedForm((prev) => ({ ...prev, bannerImage: url }));
      onNotify('Featured banner image uploaded', 'success');
    } catch {
      onNotify('Failed to upload banner image', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  // Helper to reorder items
  const moveItem = <T extends { order: number }>(items: T[], idx: number, dir: -1 | 1): T[] => {
    const target = idx + dir;
    if (target < 0 || target >= items.length) return items;
    const copy = [...items];
    const [removed] = copy.splice(idx, 1);
    copy.splice(target, 0, removed);
    return copy.map((item, i) => ({ ...item, order: i + 1 }));
  };

  const getStatusChipClass = (status: Project['status']) => {
    if (status === 'Active') return 'bg-[#edf4ee] text-[#15803D] border-[#15803D]/25';
    if (status === 'Inactive') return 'bg-slate-100 text-slate-600 border-slate-300';
    return 'bg-[#fff6df] text-[#98751f] border-[#CA8A04]/30';
  };

  // Filtered public items for Preview Modal
  const previewApprovals = approvals.filter((a) => a.visible);
  const previewFacilities = infrastructure.filter((f) => f.enabled);
  const previewNearby = nearbyPlaces.filter((n) => n.visible);
  const previewGallery = gallery.filter((g) => g.visible);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
      {/* 1. COVER IMAGE & MAIN PROJECT INFO */}
      <section className="bg-white">
        <div className="relative h-60 sm:h-80 w-full bg-[#113B24]">
          <img
            src={draft.masterPlanImage}
            alt={draft.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/25 pointer-events-none" />

          <div className="absolute top-4 left-4 flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-[#113B24]/90 text-white text-[11px] font-bold border border-white/20">
              {draft.isPublished ? 'Published Live' : 'Draft Mode'}
            </span>
            <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${getStatusChipClass(draft.status)}`}>
              {draft.status}
            </span>
          </div>

          <button
            type="button"
            onClick={openCoverModal}
            className="absolute bottom-4 right-4 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#113B24] text-xs font-bold inline-flex items-center gap-1.5 shadow-md border border-slate-200 cursor-pointer transition-colors"
          >
            <Camera className="w-3.5 h-3.5 text-[#15803D]" />
            <span>Change Cover</span>
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5 bg-white">
          <div className="space-y-4">
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#113B24]">{draft.name}</h2>
                <button
                  type="button"
                  onClick={openInfoModal}
                  aria-label="Edit project name and details"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-[#15803D] hover:bg-[#edf4ee] transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#15803D] shrink-0" />
                <span>
                  {draft.location}, {draft.district}
                </span>
              </p>
              {draft.description && (
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1 max-w-3xl">
                  {draft.description}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={openInfoModal}
              className="w-full py-2.5 px-4 rounded-xl bg-[#fff6df] hover:bg-[#fef0c7] text-[#8b6a1a] border border-[#CA8A04]/30 text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Pencil className="w-4 h-4" />
              <span>Edit Project Info</span>
            </button>
          </div>

          {/* Live Dynamic Plot Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#edf4ee] text-[#15803D] flex items-center justify-center shrink-0">
                <LayoutGrid className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block">Total Plots</span>
                <strong className="text-lg font-extrabold text-[#113B24] tabular-nums">{totalPlots}</strong>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#edf4ee] text-[#15803D] flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block">Available</span>
                <strong className="text-lg font-extrabold text-[#15803D] tabular-nums">{availablePlots}</strong>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#fff6df] text-[#98751f] flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block">Sold Plots</span>
                <strong className="text-lg font-extrabold text-[#113B24] tabular-nums">{soldPlots}</strong>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#fff6df] text-[#98751f] flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block">Total Extent</span>
                <strong className="text-sm sm:text-base font-extrabold text-[#113B24]">
                  {draft.totalAreaExtent || 'Not set'}
                </strong>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenMasterLayout}
            className="w-full py-3 px-4 rounded-xl bg-[#113B24] hover:bg-[#15803D] text-white text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LayoutGrid className="w-4 h-4 text-[#EAB308]" />
            <span>Open Interactive Master Layout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 2. GOVERNMENT APPROVALS */}
      <section className="p-5 sm:p-6 bg-white space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-[#edf4ee] text-[#15803D] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-[#113B24]">
              Government Approvals
            </h3>
          </div>
          <button
            type="button"
            onClick={openApprovalsModal}
            className="px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-xs font-bold text-[#113B24] inline-flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Pencil className="w-3.5 h-3.5 text-[#113B24]" />
            <span>Edit</span>
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Verified approvals displayed on customer portal &amp; brochure.
        </p>

        {approvals.length === 0 ? (
          <p className="text-xs text-slate-500 py-2">
            No government approvals added yet. Click Edit to add DTCP, CMDA, or RERA approvals.
          </p>
        ) : (
          <div className="space-y-3">
            {approvals.map((app) => (
              <div
                key={app.id}
                className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
                  app.verified
                    ? 'bg-[#edf4ee]/45 border-[#15803D]/25'
                    : 'bg-slate-50/70 border-slate-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#113B24]">
                      {app.authority} APPROVAL
                    </span>
                    {!app.visible && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                        Hidden on Public
                      </span>
                    )}
                  </div>
                  <strong className="text-xs sm:text-sm font-extrabold text-slate-900 block">
                    {app.number}
                  </strong>
                  <span
                    className={`text-[11px] font-semibold block ${
                      app.verified ? 'text-[#15803D]' : 'text-slate-500'
                    }`}
                  >
                    {app.verified ? 'Approved & Clear' : app.description || 'Pending Verification'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
          <span className="text-slate-600 font-medium inline-flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#15803D]" />
            <span>
              {approvals.filter((a) => Boolean(a.documentUrl)).length} Certificates Attached
            </span>
          </span>
          <button
            type="button"
            onClick={openApprovalsModal}
            className="font-bold text-[#113B24] underline hover:text-[#15803D] cursor-pointer"
          >
            Upload More
          </button>
        </div>
      </section>

      {/* 3. LEGAL TITLE */}
      <section className="p-5 sm:p-6 bg-white space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-[#edf4ee] text-[#15803D] flex items-center justify-center shrink-0">
              <FileCheck2 className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-[#113B24]">
              Legal Title
            </h3>
          </div>
          <button
            type="button"
            onClick={openLegalModal}
            className="px-2.5 py-1.5 rounded-lg hover:bg-slate-50 text-xs font-bold text-[#113B24] inline-flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Pencil className="w-3.5 h-3.5 text-[#113B24]" />
            <span>Edit</span>
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-[#edf4ee]/45 border border-[#15803D]/25 flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#113B24]">
                TITLE VERIFICATION
              </span>
              {!legalTitle.visible && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                  Hidden on Public
                </span>
              )}
            </div>
            <strong className="text-xs sm:text-sm font-extrabold text-slate-900 block">
              {legalTitle.title}
            </strong>
            <p className="text-xs text-slate-600 leading-relaxed">
              {legalTitle.description}
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs">
          <span className="text-slate-600 font-medium truncate">
            {legalTitle.verificationDetails}
          </span>
          {legalTitle.documentUrl ? (
            <a
              href={legalTitle.documentUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold shrink-0"
            >
              Preview Letter
            </a>
          ) : (
            <button
              type="button"
              onClick={openLegalModal}
              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold shrink-0 cursor-pointer"
            >
              Preview Letter
            </button>
          )}
        </div>
      </section>

      {/* 4. TOWNSHIP INFRASTRUCTURE (Admin-Controlled, No Hardcoded Facilities) */}
      <section className="p-5 sm:p-6 bg-white space-y-4">
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-[#edf4ee] text-[#15803D] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-[#113B24]">
              Township Infrastructure
            </h3>
          </div>
          <button
            type="button"
            onClick={openInfraModal}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#edf4ee] border border-slate-200 text-xs font-bold text-[#113B24] inline-flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Pencil className="w-3.5 h-3.5 text-[#CA8A04]" />
            <span>Edit</span>
          </button>
        </div>

        {infrastructure.length === 0 ? (
          <p className="text-xs text-slate-500 py-3">
            No infrastructure facilities selected yet. Click Edit to choose or add facilities.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {infrastructure.map((fac) => {
              const Icon = FACILITY_ICONS[fac.icon] || CheckCircle2;
              return (
                <div
                  key={fac.id}
                  className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                    fac.enabled ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-[#edf4ee] text-[#15803D] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <strong className="text-xs sm:text-sm font-bold text-[#113B24] block truncate">
                      {fac.name}
                    </strong>
                    {fac.description && (
                      <p className="text-[11px] text-slate-500 mt-0.5">{fac.description}</p>
                    )}
                    <span className="text-[10px] font-bold text-[#15803D] block mt-1">
                      {fac.enabled ? 'Visible on Public' : 'Disabled'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. NEARBY PLACES (Admin-Controlled, Never Invented) */}
      <section className="p-5 sm:p-6 bg-white space-y-4">
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-[#fff6df] text-[#98751f] flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-[#113B24]">
              Nearby Places
            </h3>
          </div>
          <button
            type="button"
            onClick={openNearbyModal}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#edf4ee] border border-slate-200 text-xs font-bold text-[#113B24] inline-flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Pencil className="w-3.5 h-3.5 text-[#CA8A04]" />
            <span>Edit</span>
          </button>
        </div>

        {nearbyPlaces.length === 0 ? (
          <p className="text-xs text-slate-500 py-3">
            No nearby places added yet. Click Edit to manually add verified distances.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {nearbyPlaces.map((place) => {
              const Icon = NEARBY_ICONS[place.category] || MapPin;
              return (
                <div
                  key={place.id}
                  className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                    place.visible ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-[#fff6df] text-[#98751f] flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <strong className="text-xs sm:text-sm font-bold text-[#113B24] block truncate">
                      {place.name}
                    </strong>
                    <span className="text-[11px] font-semibold text-[#15803D] block">
                      {place.category} · {place.distance}
                    </span>
                    {place.description && (
                      <p className="text-[11px] text-slate-500 mt-0.5">{place.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 6. PROJECT GALLERY */}
      <section className="p-5 sm:p-6 bg-white space-y-4">
        <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-[#edf4ee] text-[#15803D] flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-[#113B24]">
              Project Gallery
            </h3>
          </div>
          <button
            type="button"
            onClick={openGalleryModal}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#edf4ee] border border-slate-200 text-xs font-bold text-[#113B24] inline-flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-[#CA8A04]" />
            <span>Manage</span>
          </button>
        </div>

        {gallery.length === 0 ? (
          <p className="text-xs text-slate-500 py-3">
            No gallery images uploaded yet. Click Manage to upload project photos.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {gallery.map((img) => (
              <div
                key={img.id}
                className="rounded-xl overflow-hidden border border-slate-200 bg-white relative group"
              >
                <img src={img.url} alt={img.caption || draft.name} className="w-full h-28 object-cover" />
                {img.featured && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-[#113B24] text-[#EAB308] text-[10px] font-bold">
                    Featured
                  </span>
                )}
                {!img.visible && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/70 text-white text-[10px] font-bold">
                    Hidden
                  </span>
                )}
                {img.caption && (
                  <p className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 truncate">
                    {img.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 7. PUBLISHING ACTION BAR (Discard / Save & Publish / Delete) */}
      <section className="p-5 sm:p-6 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              draft.isPublished ? 'bg-[#15803D]' : 'bg-[#CA8A04]'
            }`}
          />
          <span className="font-bold text-[#113B24]">
            {draft.hasDraftChanges
              ? 'Draft changes saved locally'
              : draft.isPublished
              ? 'Live on public website'
              : 'Unpublished draft'}
          </span>
        </div>

        <div className="grid grid-cols-3 sm:flex sm:items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              setDraft(project);
              onNotify('Changes discarded', 'info');
            }}
            className="h-10 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Discard</span>
          </button>

          <button
            type="button"
            onClick={() => {
              persistProject(draft, true);
              onNotify('Project saved and published to public website', 'success');
            }}
            className="h-10 px-4 sm:px-5 rounded-xl bg-[#113B24] hover:bg-[#15803D] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#EAB308]" />
            <span>Save &amp; Publish</span>
          </button>

          <button
            type="button"
            onClick={onDeleteProject}
            className="h-10 px-3.5 rounded-xl bg-white hover:bg-red-50 border border-red-200 text-xs font-bold text-red-700 inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </section>

      {/* ═════════════════════════════════════════════════════════════
          INDIVIDUAL SECTION EDIT MODALS
          ═════════════════════════════════════════════════════════════ */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="w-full max-w-xl max-h-[88vh] overflow-y-auto rounded-2xl bg-white border border-slate-200 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* COVER IMAGE MODAL */}
            {activeModal === 'cover' && (
              <div className="p-5 space-y-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-sm font-extrabold text-[#113B24]">Edit Cover Image</h4>
                  <button type="button" onClick={() => setActiveModal(null)} className="p-1 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {coverUrlInput && (
                  <img src={coverUrlInput} alt="Cover preview" className="w-full h-44 rounded-xl object-cover border border-slate-200" />
                )}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Upload Image (Supabase Storage)</label>
                  <input type="file" accept="image/*" onChange={handleCoverUpload} className="block w-full text-xs" />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Or Image URL</label>
                  <input
                    type="text"
                    value={coverUrlInput}
                    onChange={(e) => setCoverUrlInput(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button type="button" onClick={() => setActiveModal(null)} className="h-9 px-4 rounded-xl bg-slate-100 font-bold cursor-pointer">
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => {
                      if (!coverUrlInput.trim()) return;
                      persistProject({ ...draft, masterPlanImage: coverUrlInput.trim() });
                      setActiveModal(null);
                      onNotify('Cover image updated', 'success');
                    }}
                    className="h-9 px-4 rounded-xl bg-[#113B24] text-white font-bold cursor-pointer disabled:opacity-50"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            {/* PROJECT INFO MODAL */}
            {activeModal === 'info' && (
              <div className="p-5 space-y-3.5 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-sm font-extrabold text-[#113B24]">Edit Project Information</h4>
                  <button type="button" onClick={() => setActiveModal(null)} className="p-1 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {infoError && <div className="p-2.5 rounded-xl bg-red-50 text-red-700 font-bold">{infoError}</div>}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Project Name *</label>
                  <input
                    type="text"
                    value={infoForm.name}
                    onChange={(e) => setInfoForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Location / Address *</label>
                    <input
                      type="text"
                      value={infoForm.location}
                      onChange={(e) => setInfoForm((p) => ({ ...p, location: e.target.value }))}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">District</label>
                    <input
                      type="text"
                      value={infoForm.district}
                      onChange={(e) => setInfoForm((p) => ({ ...p, district: e.target.value }))}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Project Status</label>
                    <select
                      value={infoForm.status}
                      onChange={(e) => setInfoForm((p) => ({ ...p, status: e.target.value as Project['status'] }))}
                      className="w-full h-10 px-3 rounded-xl border border-slate-200"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Upcoming">Upcoming</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Total Land Extent</label>
                    <input
                      type="text"
                      value={infoForm.totalAreaExtent}
                      onChange={(e) => setInfoForm((p) => ({ ...p, totalAreaExtent: e.target.value }))}
                      placeholder="e.g. 12.5 Acres"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={infoForm.description}
                    onChange={(e) => setInfoForm((p) => ({ ...p, description: e.target.value }))}
                    className="w-full p-3 rounded-xl border border-slate-200"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button type="button" onClick={() => setActiveModal(null)} className="h-9 px-4 rounded-xl bg-slate-100 font-bold cursor-pointer">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!infoForm.name.trim() || !infoForm.location.trim()) {
                        setInfoError('Project name and location are required.');
                        return;
                      }
                      persistProject({
                        ...draft,
                        name: infoForm.name.trim(),
                        location: infoForm.location.trim(),
                        district: infoForm.district.trim(),
                        status: infoForm.status,
                        totalAreaExtent: infoForm.totalAreaExtent.trim(),
                        description: infoForm.description.trim(),
                      });
                      setActiveModal(null);
                      onNotify('Project information saved', 'success');
                    }}
                    className="h-9 px-4 rounded-xl bg-[#113B24] text-white font-bold cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            {/* GOVERNMENT APPROVALS MODAL */}
            {activeModal === 'approvals' && (
              <div className="p-5 space-y-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-sm font-extrabold text-[#113B24]">Manage Government Approvals</h4>
                  <button type="button" onClick={() => setActiveModal(null)} className="p-1 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  {approvalsForm.map((app) => (
                    <div key={app.id} className="p-3.5 rounded-xl border border-slate-200 space-y-2.5 bg-slate-50/60">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={app.authority}
                          onChange={(e) =>
                            setApprovalsForm((prev) =>
                              prev.map((x) => (x.id === app.id ? { ...x, authority: e.target.value } : x))
                            )
                          }
                          placeholder="Authority (DTCP / CMDA / RERA)"
                          className="h-9 px-2.5 rounded-lg border border-slate-200 bg-white font-bold"
                        />
                        <input
                          type="text"
                          value={app.number}
                          onChange={(e) =>
                            setApprovalsForm((prev) =>
                              prev.map((x) => (x.id === app.id ? { ...x, number: e.target.value } : x))
                            )
                          }
                          placeholder="Approval Number"
                          className="h-9 px-2.5 rounded-lg border border-slate-200 bg-white"
                        />
                      </div>
                      <input
                        type="text"
                        value={app.description}
                        onChange={(e) =>
                          setApprovalsForm((prev) =>
                            prev.map((x) => (x.id === app.id ? { ...x, description: e.target.value } : x))
                          )
                        }
                        placeholder="Description"
                        className="w-full h-9 px-2.5 rounded-lg border border-slate-200 bg-white"
                      />
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <label className="inline-flex items-center gap-1.5 font-bold text-[#113B24] cursor-pointer">
                          <input
                            type="checkbox"
                            checked={app.verified}
                            onChange={(e) =>
                              setApprovalsForm((prev) =>
                                prev.map((x) => (x.id === app.id ? { ...x, verified: e.target.checked } : x))
                              )
                            }
                          />
                          <span>Verified</span>
                        </label>
                        <label className="inline-flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={app.visible}
                            onChange={(e) =>
                              setApprovalsForm((prev) =>
                                prev.map((x) => (x.id === app.id ? { ...x, visible: e.target.checked } : x))
                              )
                            }
                          />
                          <span>Show on Public</span>
                        </label>
                        <label className="text-[#15803D] font-bold cursor-pointer underline">
                          <span>{app.documentName ? `Doc: ${app.documentName}` : 'Upload Certificate'}</span>
                          <input
                            type="file"
                            accept=".pdf,image/*"
                            onChange={(e) => handleApprovalDocUpload(app.id, e)}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setApprovalsForm((prev) => prev.filter((x) => x.id !== app.id))}
                          className="text-red-600 font-bold cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setApprovalsForm((prev) => [
                      ...prev,
                      {
                        id: `app-${Date.now()}`,
                        authority: 'DTCP',
                        number: '',
                        description: '',
                        verified: false,
                        visible: true,
                      },
                    ])
                  }
                  className="w-full h-9 rounded-xl border border-dashed border-[#15803D] text-[#15803D] font-bold inline-flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Approval</span>
                </button>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button type="button" onClick={() => setActiveModal(null)} className="h-9 px-4 rounded-xl bg-slate-100 font-bold cursor-pointer">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      persistProject({
                        ...draft,
                        approvals: approvalsForm.filter((a) => a.authority.trim() && a.number.trim()),
                      });
                      setActiveModal(null);
                      onNotify('Government approvals saved', 'success');
                    }}
                    className="h-9 px-4 rounded-xl bg-[#113B24] text-white font-bold cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            {/* LEGAL TITLE MODAL */}
            {activeModal === 'legal' && (
              <div className="p-5 space-y-3.5 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-sm font-extrabold text-[#113B24]">Edit Legal Title</h4>
                  <button type="button" onClick={() => setActiveModal(null)} className="p-1 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={legalForm.title}
                    onChange={(e) => setLegalForm((p) => ({ ...p, title: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={legalForm.description}
                    onChange={(e) => setLegalForm((p) => ({ ...p, description: e.target.value }))}
                    className="w-full p-3 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Document Verification Details</label>
                  <input
                    type="text"
                    value={legalForm.verificationDetails}
                    onChange={(e) => setLegalForm((p) => ({ ...p, verificationDetails: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Upload Legal Document</label>
                  <input type="file" accept=".pdf,image/*" onChange={handleLegalDocUpload} className="block w-full text-xs" />
                  {legalForm.documentName && <span className="text-[#15803D] font-semibold mt-1 block">{legalForm.documentName}</span>}
                </div>
                <div className="flex items-center gap-4 pt-1">
                  <label className="inline-flex items-center gap-1.5 font-bold text-[#113B24] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={legalForm.verified}
                      onChange={(e) => setLegalForm((p) => ({ ...p, verified: e.target.checked }))}
                    />
                    <span>Verified</span>
                  </label>
                  <label className="inline-flex items-center gap-1.5 font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={legalForm.visible}
                      onChange={(e) => setLegalForm((p) => ({ ...p, visible: e.target.checked }))}
                    />
                    <span>Show on Public Website</span>
                  </label>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button type="button" onClick={() => setActiveModal(null)} className="h-9 px-4 rounded-xl bg-slate-100 font-bold cursor-pointer">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!legalForm.title.trim()) return;
                      persistProject({ ...draft, legalTitle: legalForm });
                      setActiveModal(null);
                      onNotify('Legal title updated', 'success');
                    }}
                    className="h-9 px-4 rounded-xl bg-[#113B24] text-white font-bold cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            {/* TOWNSHIP INFRASTRUCTURE MODAL */}
            {activeModal === 'infrastructure' && (
              <div className="p-5 space-y-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-sm font-extrabold text-[#113B24]">Township Infrastructure</h4>
                  <button type="button" onClick={() => setActiveModal(null)} className="p-1 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <span className="font-bold text-slate-700 block mb-1.5">Quick-Add Predefined Facilities</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PREDEFINED_FACILITIES.map((preset) => {
                      const exists = infraForm.some((f) => f.name.toLowerCase() === preset.name.toLowerCase());
                      return (
                        <button
                          key={preset.name}
                          type="button"
                          disabled={exists}
                          onClick={() =>
                            setInfraForm((prev) => [
                              ...prev,
                              {
                                id: `fac-${Date.now()}-${prev.length}`,
                                name: preset.name,
                                description: preset.description,
                                icon: preset.icon,
                                order: prev.length + 1,
                                enabled: true,
                              },
                            ])
                          }
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-bold cursor-pointer ${
                            exists
                              ? 'bg-[#edf4ee] text-[#15803D] border-[#15803D]/30 opacity-60'
                              : 'bg-white hover:bg-[#edf4ee] border-slate-200 text-slate-700'
                          }`}
                        >
                          {exists ? `✓ ${preset.name}` : preset.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-bold text-[#113B24] block">Add Custom Facility</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={customInfraName}
                      onChange={(e) => setCustomInfraName(e.target.value)}
                      placeholder="Facility name"
                      className="h-9 px-2.5 rounded-lg border border-slate-200 bg-white"
                    />
                    <select
                      value={customInfraIcon}
                      onChange={(e) => setCustomInfraIcon(e.target.value)}
                      className="h-9 px-2.5 rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="road">Roads Icon</option>
                      <option value="zap">Electricity Icon</option>
                      <option value="droplet">Water Icon</option>
                      <option value="shield">Security Icon</option>
                      <option value="lightbulb">Lighting Icon</option>
                      <option value="park">Park Icon</option>
                      <option value="building">General Icon</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customInfraDesc}
                      onChange={(e) => setCustomInfraDesc(e.target.value)}
                      placeholder="Description"
                      className="flex-1 h-9 px-2.5 rounded-lg border border-slate-200 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!customInfraName.trim()) return;
                        setInfraForm((prev) => [
                          ...prev,
                          {
                            id: `fac-${Date.now()}`,
                            name: customInfraName.trim(),
                            description: customInfraDesc.trim(),
                            icon: customInfraIcon,
                            order: prev.length + 1,
                            enabled: true,
                          },
                        ]);
                        setCustomInfraName('');
                        setCustomInfraDesc('');
                      }}
                      className="h-9 px-3 rounded-lg bg-[#113B24] text-white font-bold cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {infraForm.map((fac, idx) => (
                    <div key={fac.id} className="p-3 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={fac.name}
                          onChange={(e) =>
                            setInfraForm((prev) =>
                              prev.map((x) => (x.id === fac.id ? { ...x, name: e.target.value } : x))
                            )
                          }
                          className="flex-1 h-8 px-2.5 rounded-lg border border-slate-200 font-bold"
                        />
                        <button type="button" onClick={() => setInfraForm((p) => moveItem(p, idx, -1))} className="p-1 cursor-pointer">
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => setInfraForm((p) => moveItem(p, idx, 1))} className="p-1 cursor-pointer">
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setInfraForm((prev) =>
                              prev.map((x) => (x.id === fac.id ? { ...x, enabled: !x.enabled } : x))
                            )
                          }
                          className="p-1 cursor-pointer text-[#15803D]"
                          title="Toggle visibility"
                        >
                          {fac.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setInfraForm((prev) => prev.filter((x) => x.id !== fac.id))}
                          className="p-1 text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={fac.description}
                        onChange={(e) =>
                          setInfraForm((prev) =>
                            prev.map((x) => (x.id === fac.id ? { ...x, description: e.target.value } : x))
                          )
                        }
                        placeholder="Description"
                        className="w-full h-8 px-2.5 rounded-lg border border-slate-200"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button type="button" onClick={() => setActiveModal(null)} className="h-9 px-4 rounded-xl bg-slate-100 font-bold cursor-pointer">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      persistProject({ ...draft, infrastructure: infraForm });
                      setActiveModal(null);
                      onNotify('Township infrastructure updated', 'success');
                    }}
                    className="h-9 px-4 rounded-xl bg-[#113B24] text-white font-bold cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            {/* NEARBY PLACES MODAL */}
            {activeModal === 'nearby' && (
              <div className="p-5 space-y-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-sm font-extrabold text-[#113B24]">Nearby Places</h4>
                  <button type="button" onClick={() => setActiveModal(null)} className="p-1 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {nearbyError && <div className="p-2.5 rounded-xl bg-red-50 text-red-700 font-bold">{nearbyError}</div>}

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-bold text-[#113B24] block">Add Nearby Place</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newNearby.name}
                      onChange={(e) => setNewNearby((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Place name *"
                      className="h-9 px-2.5 rounded-lg border border-slate-200 bg-white"
                    />
                    <select
                      value={newNearby.category}
                      onChange={(e) => setNewNearby((p) => ({ ...p, category: e.target.value }))}
                      className="h-9 px-2.5 rounded-lg border border-slate-200 bg-white"
                    >
                      {NEARBY_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newNearby.distance}
                      onChange={(e) => setNewNearby((p) => ({ ...p, distance: e.target.value }))}
                      placeholder="Distance (e.g. 2.5 km) *"
                      className="h-9 px-2.5 rounded-lg border border-slate-200 bg-white"
                    />
                    <input
                      type="text"
                      value={newNearby.description}
                      onChange={(e) => setNewNearby((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Optional description"
                      className="h-9 px-2.5 rounded-lg border border-slate-200 bg-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newNearby.name.trim() || !newNearby.distance.trim()) {
                        setNearbyError('Place name and distance are required.');
                        return;
                      }
                      setNearbyError('');
                      setNearbyForm((prev) => [
                        ...prev,
                        {
                          id: `near-${Date.now()}`,
                          name: newNearby.name.trim(),
                          category: newNearby.category,
                          distance: newNearby.distance.trim(),
                          description: newNearby.description.trim() || undefined,
                          icon: newNearby.category,
                          order: prev.length + 1,
                          visible: true,
                        },
                      ]);
                      setNewNearby({ name: '', category: 'Hospitals', distance: '', description: '' });
                    }}
                    className="h-9 px-4 rounded-lg bg-[#113B24] text-white font-bold cursor-pointer"
                  >
                    Add Place
                  </button>
                </div>

                <div className="space-y-2">
                  {nearbyForm.map((place, idx) => (
                    <div key={place.id} className="p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <strong className="text-[#113B24] block truncate">{place.name}</strong>
                        <span className="text-slate-500">
                          {place.category} · {place.distance}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button type="button" onClick={() => setNearbyForm((p) => moveItem(p, idx, -1))} className="p-1 cursor-pointer">
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" onClick={() => setNearbyForm((p) => moveItem(p, idx, 1))} className="p-1 cursor-pointer">
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setNearbyForm((prev) =>
                              prev.map((x) => (x.id === place.id ? { ...x, visible: !x.visible } : x))
                            )
                          }
                          className="p-1 cursor-pointer text-[#15803D]"
                        >
                          {place.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => setNearbyForm((prev) => prev.filter((x) => x.id !== place.id))}
                          className="p-1 text-red-600 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button type="button" onClick={() => setActiveModal(null)} className="h-9 px-4 rounded-xl bg-slate-100 font-bold cursor-pointer">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      let finalNearby = nearbyForm;
                      if (newNearby.name.trim() || newNearby.distance.trim()) {
                        if (!newNearby.name.trim() || !newNearby.distance.trim()) {
                          setNearbyError('Place name and distance are required.');
                          return;
                        }
                        finalNearby = [
                          ...nearbyForm,
                          {
                            id: `near-${Date.now()}`,
                            name: newNearby.name.trim(),
                            category: newNearby.category,
                            distance: newNearby.distance.trim(),
                            description: newNearby.description.trim() || undefined,
                            icon: newNearby.category,
                            order: nearbyForm.length + 1,
                            visible: true,
                          },
                        ];
                        setNewNearby({ name: '', category: 'Hospitals', distance: '', description: '' });
                        setNearbyError('');
                      }
                      persistProject({ ...draft, nearbyPlaces: finalNearby });
                      setActiveModal(null);
                      onNotify('Nearby places saved', 'success');
                    }}
                    className="h-9 px-4 rounded-xl bg-[#113B24] text-white font-bold cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            {/* PROJECT GALLERY MODAL */}
            {activeModal === 'gallery' && (
              <div className="p-5 space-y-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-sm font-extrabold text-[#113B24]">Project Gallery</h4>
                  <button type="button" onClick={() => setActiveModal(null)} className="p-1 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <label className="block p-4 rounded-xl border border-dashed border-[#15803D] bg-[#edf4ee]/50 text-center font-bold text-[#113B24] cursor-pointer">
                  <span>{isUploading ? 'Uploading...' : 'Click to upload multiple project images'}</span>
                  <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />
                </label>

                <div className="space-y-2.5">
                  {galleryForm.map((img, idx) => (
                    <div key={img.id} className="p-2.5 rounded-xl border border-slate-200 flex items-center gap-3">
                      <img src={img.url} alt="" className="w-16 h-12 rounded-lg object-cover shrink-0" />
                      <input
                        type="text"
                        value={img.caption || ''}
                        onChange={(e) =>
                          setGalleryForm((prev) =>
                            prev.map((x) => (x.id === img.id ? { ...x, caption: e.target.value } : x))
                          )
                        }
                        placeholder="Image caption"
                        className="flex-1 h-8 px-2.5 rounded-lg border border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setGalleryForm((prev) =>
                            prev.map((x) => ({ ...x, featured: x.id === img.id }))
                          )
                        }
                        title="Set as featured"
                        className={`p-1 cursor-pointer ${img.featured ? 'text-[#CA8A04]' : 'text-slate-400'}`}
                      >
                        <Star className="w-4 h-4" />
                      </button>
                      <button type="button" onClick={() => setGalleryForm((p) => moveItem(p, idx, -1))} className="p-1 cursor-pointer">
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" onClick={() => setGalleryForm((p) => moveItem(p, idx, 1))} className="p-1 cursor-pointer">
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setGalleryForm((prev) =>
                            prev.map((x) => (x.id === img.id ? { ...x, visible: !x.visible } : x))
                          )
                        }
                        className="p-1 cursor-pointer text-[#15803D]"
                      >
                        {img.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => setGalleryForm((prev) => prev.filter((x) => x.id !== img.id))}
                        className="p-1 text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button type="button" onClick={() => setActiveModal(null)} className="h-9 px-4 rounded-xl bg-slate-100 font-bold cursor-pointer">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      persistProject({ ...draft, gallery: galleryForm });
                      setActiveModal(null);
                      onNotify('Project gallery updated', 'success');
                    }}
                    className="h-9 px-4 rounded-xl bg-[#113B24] text-white font-bold cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            {/* FEATURED SECTION MODAL */}
            {activeModal === 'featured' && (
              <div className="p-5 space-y-3.5 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="text-sm font-extrabold text-[#113B24]">Edit Featured Banner</h4>
                  <button type="button" onClick={() => setActiveModal(null)} className="p-1 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <label className="inline-flex items-center gap-2 font-bold text-[#113B24] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featuredForm.enabled}
                    onChange={(e) => setFeaturedForm((p) => ({ ...p, enabled: e.target.checked }))}
                  />
                  <span>Enable Featured Section on Public Website</span>
                </label>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Heading *</label>
                  <input
                    type="text"
                    value={featuredForm.heading}
                    onChange={(e) => setFeaturedForm((p) => ({ ...p, heading: e.target.value }))}
                    className="w-full h-10 px-3 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={featuredForm.description}
                    onChange={(e) => setFeaturedForm((p) => ({ ...p, description: e.target.value }))}
                    className="w-full p-3 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Banner Image</label>
                  <input type="file" accept="image/*" onChange={handleFeaturedBannerUpload} className="block w-full text-xs" />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button type="button" onClick={() => setActiveModal(null)} className="h-9 px-4 rounded-xl bg-slate-100 font-bold cursor-pointer">
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!featuredForm.heading.trim()) return;
                      persistProject({ ...draft, featuredSection: featuredForm });
                      setActiveModal(null);
                      onNotify('Featured section saved', 'success');
                    }}
                    className="h-9 px-4 rounded-xl bg-[#113B24] text-white font-bold cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            {/* PUBLIC WEBSITE PREVIEW MODAL */}
            {activeModal === 'preview' && (
              <div className="p-5 space-y-5 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h4 className="text-sm font-extrabold text-[#113B24]">Public Website Preview</h4>
                    <span className="text-[11px] text-slate-500">Only visible/enabled items are shown below</span>
                  </div>
                  <button type="button" onClick={() => setActiveModal(null)} className="p-1 cursor-pointer">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <img src={draft.masterPlanImage} alt={draft.name} className="w-full h-44 rounded-xl object-cover" />
                <div>
                  <h5 className="text-lg font-extrabold text-[#113B24]">{draft.name}</h5>
                  <p className="text-slate-600">{draft.location}, {draft.district}</p>
                </div>

                {previewApprovals.length > 0 && (
                  <div className="space-y-1.5">
                    <strong className="text-[#113B24] block">Government Approvals</strong>
                    <ul className="space-y-1">
                      {previewApprovals.map((a) => (
                        <li key={a.id}>• {a.authority}: {a.number} {a.verified ? '(Verified)' : ''}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {legalTitle.visible && (
                  <div className="space-y-1">
                    <strong className="text-[#113B24] block">Legal Title</strong>
                    <p className="text-slate-600">• {legalTitle.title} — {legalTitle.description}</p>
                  </div>
                )}

                {previewFacilities.length > 0 && (
                  <div className="space-y-1">
                    <strong className="text-[#113B24] block">Township Infrastructure</strong>
                    <ul className="space-y-1">
                      {previewFacilities.map((f) => (
                        <li key={f.id}>• {f.name}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {previewNearby.length > 0 && (
                  <div className="space-y-1">
                    <strong className="text-[#113B24] block">Nearby Places</strong>
                    <ul className="space-y-1">
                      {previewNearby.map((n) => (
                        <li key={n.id}>• {n.name} ({n.category} · {n.distance})</li>
                      ))}
                    </ul>
                  </div>
                )}

                {previewGallery.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {previewGallery.map((g) => (
                      <img key={g.id} src={g.url} alt={g.caption || ''} className="w-full h-20 rounded-lg object-cover" />
                    ))}
                  </div>
                )}

                {featuredSection.enabled && (
                  <div className="p-4 rounded-xl bg-[#113B24] text-white">
                    <strong className="block text-sm text-[#EAB308]">{featuredSection.heading}</strong>
                    <p className="text-slate-200 mt-1">{featuredSection.description}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

