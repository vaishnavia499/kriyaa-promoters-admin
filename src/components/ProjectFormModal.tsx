import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  MapPin,
  Upload,
  Image as ImageIcon,
  Trash2,
  Sparkles,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Project } from '../types';

const SAMPLE_MASTER_PLANS = [
  'https://images.unsplash.com/photo-1524813686514-a57563d77d61?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
];

export const ProjectFormModal: React.FC = () => {
  const {
    isProjectModalOpen,
    closeProjectModal,
    editingProject,
    saveProject,
  } = useApp();

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [district, setDistrict] = useState('');
  const [dtcpNumber, setDtcpNumber] = useState('');
  const [reraNumber, setReraNumber] = useState('');
  const [totalAreaExtent, setTotalAreaExtent] = useState('10.0 Acres');
  const [launchYear, setLaunchYear] = useState<number>(2024);
  const [status, setStatus] = useState<'Active' | 'Upcoming' | 'Completed'>('Active');
  const [masterPlanImage, setMasterPlanImage] = useState('');
  const [description, setDescription] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingProject) {
      setName(editingProject.name);
      setLocation(editingProject.location);
      setDistrict(editingProject.district);
      setDtcpNumber(editingProject.dtcpNumber);
      setReraNumber(editingProject.reraNumber || '');
      setTotalAreaExtent(editingProject.totalAreaExtent || '10.0 Acres');
      setLaunchYear(editingProject.launchYear || 2024);
      setStatus(editingProject.status);
      setMasterPlanImage(editingProject.masterPlanImage || SAMPLE_MASTER_PLANS[0]);
      setDescription(editingProject.description);
    } else {
      setName('');
      setLocation('Cuddalore');
      setDistrict('Cuddalore District');
      setDtcpNumber('DTCP No. ');
      setReraNumber('');
      setTotalAreaExtent('10.0 Acres');
      setLaunchYear(new Date().getFullYear());
      setStatus('Active');
      setMasterPlanImage(SAMPLE_MASTER_PLANS[0]);
      setDescription('');
    }
  }, [editingProject, isProjectModalOpen]);

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setMasterPlanImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !location.trim() || !dtcpNumber.trim()) return;

    saveProject({
      id: editingProject?.id,
      name: name.trim(),
      location: location.trim(),
      district: district.trim() || location.trim(),
      dtcpNumber: dtcpNumber.trim(),
      reraNumber: reraNumber.trim() || undefined,
      totalAreaExtent: totalAreaExtent.trim(),
      launchYear: Number(launchYear) || 2024,
      status,
      masterPlanImage: masterPlanImage || SAMPLE_MASTER_PLANS[0],
      description: description.trim() || `${name} township layout scheme in ${location}.`,
    });
  };

  if (!isProjectModalOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeProjectModal}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18 }}
          className="relative z-10 w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 text-slate-900 dark:text-slate-100 max-h-[92vh] flex flex-col"
        >
          {/* Header: Deep Forest Green matching brand theme */}
          <div className="px-6 py-4 bg-[#113B24] text-white flex items-center justify-between border-b border-[#1E5D32] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {editingProject ? 'Edit Layout / Project' : 'Register New Project Layout'}
                </h3>
                <p className="text-[11px] text-emerald-400 font-medium">
                  Kriyaa Promoters Township Scheme Management
                </p>
              </div>
            </div>

            <button
              onClick={closeProjectModal}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
            {/* Project Name & Status */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Project / Layout Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Golden City"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Location & District */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Location / Area *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cuddalore NH Bypass"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  District
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cuddalore District"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                />
              </div>
            </div>

            {/* DTCP & RERA Approvals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Specific DTCP Approval Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DTCP No. 182/2023"
                  value={dtcpNumber}
                  onChange={(e) => setDtcpNumber(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-emerald-600 dark:text-emerald-400"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  RERA Registration No. (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. TN/RERA/0428/2024"
                  value={reraNumber}
                  onChange={(e) => setReraNumber(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>
            </div>

            {/* Total Extent & Launch Year */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Total Layout Extent
                </label>
                <input
                  type="text"
                  placeholder="e.g. 12.5 Acres"
                  value={totalAreaExtent}
                  onChange={(e) => setTotalAreaExtent(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Launch Year
                </label>
                <input
                  type="number"
                  placeholder="2024"
                  value={launchYear}
                  onChange={(e) => setLaunchYear(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-semibold"
                />
              </div>
            </div>

            {/* Master Plan Layout Image Upload & Presets */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                Layout Master Plan Blueprint / Thumbnail
              </label>

              <div className="flex flex-col sm:flex-row gap-3 items-center">
                {/* Live Preview */}
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shrink-0 relative group">
                  <img
                    src={masterPlanImage || SAMPLE_MASTER_PLANS[0]}
                    alt="Master Plan Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                    Preview
                  </div>
                </div>

                {/* Drop Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`flex-1 w-full border-2 border-dashed rounded-2xl p-3 text-center transition-all cursor-pointer ${
                    isDragging
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
                      : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/40'
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                  <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
                  <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                    Click to upload master plan photo
                  </p>
                  <p className="text-[10px] text-slate-400">
                    PNG, JPG, WebP supported
                  </p>
                </div>
              </div>

              {/* Quick Preset Selector */}
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold">
                  Or select sample layout imagery:
                </span>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {SAMPLE_MASTER_PLANS.map((img, idx) => (
                    <button
                      key={img}
                      type="button"
                      onClick={() => setMasterPlanImage(img)}
                      className={`h-11 w-16 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                        masterPlanImage === img
                          ? 'border-emerald-500 scale-105 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300">
                Layout Overview & Amenities
              </label>
              <textarea
                rows={2}
                placeholder="Mention road widths, water supply, security features, connectivity..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

            {/* Submit / Cancel Buttons */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={closeProjectModal}
                className="min-h-[44px] px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="min-h-[44px] px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{editingProject ? 'Save Changes' : 'Create Project'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
