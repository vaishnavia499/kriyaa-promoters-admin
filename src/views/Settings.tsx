import React, { useState, useRef } from 'react';
import {
  Settings as SettingsIcon,
  ShieldCheck,
  Save,
  Building2,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Upload,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BusinessSettings } from '../types';

export const Settings: React.FC = () => {
  const { settings, updateSettings, showToast } = useApp();
  const [formData, setFormData] = useState<BusinessSettings>(settings);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof BusinessSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please upload a valid image file (PNG, JPG, SVG, WebP)', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        handleChange('logoUrl', e.target.result as string);
        showToast('Company logo uploaded successfully', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveLogo = () => {
    handleChange('logoUrl', undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
    showToast('Company logo removed', 'info');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden">
      {/* Unified Single-Page Settings Container (Not fragmented cards) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 md:p-8 shadow-sm space-y-8 divide-y divide-slate-100 dark:divide-slate-800">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <SettingsIcon className="w-5 h-5 text-[#15803D]" />
              <span>Business Profile & App Settings</span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Manage promoter branding, contact numbers, official DTCP approvals, and company details.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#15803D] dark:text-emerald-400 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Active Portal</span>
            </span>
          </div>
        </div>

        {/* Section 1: Official Company Brand Logo */}
        <div className="pt-6 space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-[#15803D]" />
              <span>Company Brand Logo</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Upload your official promoter logo for app navigation, header displays, and allotment receipts.
            </p>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
            {/* Live Dual Thumbnail Preview: Square & Circular */}
            <div className="md:col-span-5 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-around gap-4">
              {/* Square Preview */}
              <div className="text-center space-y-1.5">
                <div className="w-16 h-16 rounded-xl bg-[#113B24] border-2 border-[#1E5D32] flex items-center justify-center overflow-hidden mx-auto shadow-sm">
                  {formData.logoUrl ? (
                    <img
                      src={formData.logoUrl}
                      alt="Company Logo Square Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-black text-[#EAB308]">KP</span>
                  )}
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">Square Card</span>
              </div>

              {/* Circular Preview */}
              <div className="text-center space-y-1.5">
                <div className="w-16 h-16 rounded-full bg-[#113B24] border-2 border-[#EAB308]/40 flex items-center justify-center overflow-hidden mx-auto shadow-sm">
                  {formData.logoUrl ? (
                    <img
                      src={formData.logoUrl}
                      alt="Company Logo Circular Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-base font-black text-white">KP</span>
                  )}
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">Circular Header</span>
              </div>
            </div>

            {/* Drag & Drop Upload Zone + Actions */}
            <div className="md:col-span-7 space-y-3">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-4 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-[#15803D] bg-emerald-50/60 dark:bg-emerald-950/30'
                    : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-50'
                }`}
              >
                <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Click or drag & drop logo here
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Supports PNG, JPG, WebP, SVG (Max 5MB)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 min-h-[40px] px-3.5 bg-[#15803D] hover:bg-[#166534] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#1E5C31]"
                >
                  <Upload className="w-3.5 h-3.5 text-white" />
                  <span>{formData.logoUrl ? 'Replace Logo' : 'Choose File'}</span>
                </button>
                {formData.logoUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="min-h-[40px] px-3.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer border border-red-200"
                    title="Remove Logo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Corporate & Statutory Information Form */}
        <form onSubmit={handleSubmit} className="pt-6 space-y-6 text-xs">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#15803D]" />
              <span>Corporate & Statutory Information</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Update promoter identities, contact lines, locations, and layout sanction numbers.
            </p>
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Company Name */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Company Name *</label>
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#15803D] font-bold text-slate-900 dark:text-white"
              />
            </div>

            {/* Owner / Promoter Name */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Owner / Promoter Name *</label>
              <input
                type="text"
                required
                value={formData.ownerName}
                onChange={(e) => handleChange('ownerName', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#15803D] font-bold text-slate-900 dark:text-white"
              />
            </div>

            {/* Contact Phone */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Contact / WhatsApp Number *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="tel"
                  required
                  value={formData.contactNumber}
                  onChange={(e) => handleChange('contactNumber', e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#15803D] font-semibold text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Business Email */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Business Email *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={formData.businessEmail}
                  onChange={(e) => handleChange('businessEmail', e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#15803D] font-medium text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Locations Served */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-bold text-slate-700 dark:text-slate-300">Locations / Cities Served</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={formData.locationsServed}
                  onChange={(e) => handleChange('locationsServed', e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#15803D] font-medium text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Year Established */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Year Established</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="number"
                  value={formData.yearStarted}
                  onChange={(e) => handleChange('yearStarted', Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#15803D] font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Main Flagship Project */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 dark:text-slate-300">Main Flagship Project</label>
              <input
                type="text"
                value={formData.mainProject}
                onChange={(e) => handleChange('mainProject', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#15803D] font-bold text-[#15803D]"
              />
            </div>

            {/* DTCP Approval Number */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-bold text-slate-700 dark:text-slate-300">DTCP Approval Number</label>
              <input
                type="text"
                value={formData.dtcpNumber}
                onChange={(e) => handleChange('dtcpNumber', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#15803D] font-medium text-slate-900 dark:text-white"
              />
            </div>

            {/* Core Services */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-bold text-slate-700 dark:text-slate-300">Core Services & Business Highlights</label>
              <textarea
                rows={3}
                value={formData.coreServices}
                onChange={(e) => handleChange('coreServices', e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#15803D] font-medium text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Save Action Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="min-h-[44px] px-6 bg-[#15803D] hover:bg-[#166534] text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer text-xs sm:text-sm"
            >
              <Save className="w-4 h-4 text-[#EAB308]" />
              <span>Save Business Profile</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
