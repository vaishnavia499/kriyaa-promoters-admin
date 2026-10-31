import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Building2,
  Plus,
  Sparkles,
  Check,
  Upload,
  Image as ImageIcon,
  Trash2,
  Layers,
  MapPin,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Property, PropertyCategory, PropertyStatus } from '../types';

export const PropertyFormModal: React.FC = () => {
  const {
    isPropertyModalOpen,
    closePropertyModal,
    editingProperty,
    saveProperty,
    showToast,
    projects,
    selectedProjectId,
  } = useApp();

  const [projectId, setProjectId] = useState('');
  const [title, setTitle] = useState('');
  const [plotNumber, setPlotNumber] = useState('');
  const [category, setCategory] = useState<PropertyCategory>('Land/Plots');
  const [status, setStatus] = useState<PropertyStatus>('Available');
  const [totalPrice, setTotalPrice] = useState<number>(2500000);
  const [pricePerSqFt, setPricePerSqFt] = useState<number>(2000);
  const [plotDimensions, setPlotDimensions] = useState('30x40 ft');
  const [areaSqFt, setAreaSqFt] = useState<number>(1200);
  const [facing, setFacing] = useState<'North' | 'East' | 'South' | 'West' | 'North-East' | 'North-West'>('North');
  const [roadWidth, setRoadWidth] = useState('40 ft');
  const [approvals, setApprovals] = useState<string[]>(['DTCP', 'RERA', 'Patta']);
  const [isGatedCommunity, setIsGatedCommunity] = useState(true);
  const [isCornerPlot, setIsCornerPlot] = useState(false);
  const [address, setAddress] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingProperty) {
      setProjectId(editingProperty.projectId || projects[0]?.id || 'proj-golden-city');
      setTitle(editingProperty.title);
      setPlotNumber(editingProperty.plotNumber);
      setCategory(editingProperty.category);
      setStatus(editingProperty.status);
      setTotalPrice(editingProperty.totalPrice);
      setPricePerSqFt(editingProperty.pricePerSqFt);
      setPlotDimensions(editingProperty.plotDimensions);
      setAreaSqFt(editingProperty.areaSqFt);
      setFacing(editingProperty.facing);
      setRoadWidth(editingProperty.roadWidth);
      setApprovals(editingProperty.approvals);
      setIsGatedCommunity(editingProperty.isGatedCommunity);
      setIsCornerPlot(editingProperty.isCornerPlot);
      setAddress(editingProperty.address);
      setGoogleMapsUrl(editingProperty.googleMapsUrl);
      setImages(editingProperty.images && editingProperty.images.length > 0 ? editingProperty.images : [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80'
      ]);
      setDescription(editingProperty.description);
    } else {
      const targetProjId = selectedProjectId !== 'all' ? selectedProjectId : (projects[0]?.id || 'proj-golden-city');
      setProjectId(targetProjId);
      const matched = projects.find((p) => p.id === targetProjId);
      const projName = matched?.name || 'Golden City';
      const randomNum = Math.floor(Math.random() * 80) + 1;
      setTitle(`${projName} Plot #${randomNum} · Prime Plotted Layout`);
      setPlotNumber(String(randomNum));
      setCategory('Land/Plots');
      setStatus('Available');
      setTotalPrice(2640000);
      setPricePerSqFt(2200);
      setPlotDimensions('30x40 ft');
      setAreaSqFt(1200);
      setFacing('North');
      setRoadWidth('40 ft');
      setApprovals(['DTCP', 'RERA', 'Patta']);
      setIsGatedCommunity(true);
      setIsCornerPlot(false);
      setAddress(matched ? `${matched.name}, ${matched.location}` : 'Sector B, Golden City, NH Bypass Corridor, Cuddalore');
      setGoogleMapsUrl('https://maps.google.com/?q=11.7480,79.7714');
      setImages([
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
      ]);
      setDescription(`Prime DTCP approved residential plot in ${projName} with avenue plantation, sweet potable water pipeline, and blacktop tar road.`);
    }
    setCustomUrlInput('');
    setErrorMsg('');
  }, [editingProperty, isPropertyModalOpen, projects, selectedProjectId]);

  // Recalculate price when sqft or rate changes
  const handleSqFtChange = (sqft: number) => {
    setAreaSqFt(sqft);
    setTotalPrice(sqft * pricePerSqFt);
  };

  const handleRateChange = (rate: number) => {
    setPricePerSqFt(rate);
    setTotalPrice(areaSqFt * rate);
  };

  const toggleApproval = (appr: string) => {
    setApprovals((prev) =>
      prev.includes(appr) ? prev.filter((a) => a !== appr) : [...prev, appr]
    );
  };

  // Multi-Image Upload Logic
  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newImagePromises: Promise<string>[] = [];

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        showToast(`Skipped ${file.name} (not an image)`, 'info');
        return;
      }

      const promise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) resolve(e.target.result as string);
        };
        reader.readAsDataURL(file);
      });
      newImagePromises.push(promise);
    });

    Promise.all(newImagePromises).then((loadedUrls) => {
      if (loadedUrls.length > 0) {
        setImages((prev) => [...prev, ...loadedUrls]);
        showToast(`Added ${loadedUrls.length} new image(s)`, 'success');
      }
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFilesSelected(e.target.files);
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
    handleFilesSelected(e.dataTransfer.files);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleAddCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    setImages((prev) => [...prev, customUrlInput.trim()]);
    setCustomUrlInput('');
    showToast('Image URL added', 'success');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a property title');
      return;
    }
    if (!plotNumber.trim()) {
      setErrorMsg('Please enter a plot number');
      return;
    }

    const cents = Number((areaSqFt / 435.6).toFixed(2));
    const finalImages =
      images.length > 0
        ? images
        : ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80'];

    const matchedProj = projects.find((p) => p.id === projectId);
    saveProperty({
      id: editingProperty?.id,
      projectId,
      projectName: matchedProj?.name || 'Golden City',
      title: title.trim(),
      plotNumber: plotNumber.trim(),
      category,
      status,
      totalPrice: Number(totalPrice),
      pricePerSqFt: Number(pricePerSqFt),
      plotDimensions: plotDimensions.trim(),
      areaSqFt: Number(areaSqFt),
      areaCents: cents,
      facing,
      roadWidth,
      approvals,
      isGatedCommunity,
      isCornerPlot,
      address: address.trim() || (matchedProj ? `${matchedProj.name}, ${matchedProj.location}` : 'Golden City, Cuddalore'),
      googleMapsUrl: googleMapsUrl.trim() || 'https://maps.google.com/?q=11.7480,79.7714',
      images: finalImages,
      description: description.trim() || `Plotted development in ${matchedProj?.name || 'Golden City'} by Kriyaa Promoters.`,
    });
  };

  return (
    <AnimatePresence>
      {isPropertyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePropertyModal}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="relative z-10 w-full max-w-2xl bg-white dark:bg-[#0B2516] rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-[#1E5D32] my-auto max-h-[90vh] flex flex-col"
          >
            {/* Header: Deep Forest Green matching brand theme */}
            <div className="px-5 py-4 bg-[#113B24] text-white flex items-center justify-between border-b border-[#1E5D32] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-[#EAB308]">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingProperty ? 'Edit Property Details' : 'Add New Property Unit'}
                  </h3>
                  <p className="text-xs text-emerald-400">
                    Kriyaa Promoters Inventory System
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closePropertyModal}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg font-medium">
                  {errorMsg}
                </div>
              )}

              {/* Project / Layout Scheme Selector */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Project / Township Layout *</label>
                <select
                  value={projectId}
                  onChange={(e) => {
                    const newId = e.target.value;
                    setProjectId(newId);
                    const matched = projects.find((p) => p.id === newId);
                    if (matched && !editingProperty) {
                      setTitle(`${matched.name} Plot #${plotNumber || '01'}`);
                      setAddress(`${matched.name}, ${matched.location}`);
                    }
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-900 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {projects.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.name} ({proj.location} · {proj.dtcpNumber})
                    </option>
                  ))}
                </select>
              </div>

              {/* Title & Plot Number */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-700">Property Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Plot # *</label>
                  <input
                    type="text"
                    required
                    value={plotNumber}
                    onChange={(e) => setPlotNumber(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as PropertyCategory)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white cursor-pointer font-medium"
                  >
                    <option value="Land/Plots">Land/Plots</option>
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as PropertyStatus)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white cursor-pointer font-bold text-emerald-800"
                  >
                    <option value="Available">Available</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Sold">Sold</option>
                  </select>
                </div>
              </div>

              {/* Pricing: Price per SqFt & Total Price */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Rate per Sq.Ft (₹)</label>
                  <input
                    type="number"
                    step="50"
                    value={pricePerSqFt}
                    onChange={(e) => handleRateChange(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Total Price (₹)</label>
                  <input
                    type="number"
                    value={totalPrice}
                    onChange={(e) => setTotalPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-white font-extrabold text-emerald-700"
                  />
                  <span className="block text-[10px] text-slate-500 font-medium">
                    = ₹{(totalPrice / 100000).toFixed(2)} Lakhs
                  </span>
                </div>
              </div>

              {/* Dimensions, Area & Facing */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Dimensions</label>
                  <input
                    type="text"
                    value={plotDimensions}
                    onChange={(e) => setPlotDimensions(e.target.value)}
                    placeholder="e.g. 30x40 ft"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Area Sq.Ft</label>
                  <input
                    type="number"
                    value={areaSqFt}
                    onChange={(e) => handleSqFtChange(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Facing</label>
                  <select
                    value={facing}
                    onChange={(e) => setFacing(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white cursor-pointer font-medium"
                  >
                    <option value="North">North</option>
                    <option value="East">East</option>
                    <option value="South">South</option>
                    <option value="West">West</option>
                    <option value="North-East">North-East</option>
                    <option value="North-West">North-West</option>
                  </select>
                </div>
              </div>

              {/* Road & Flags */}
              <div className="grid grid-cols-3 gap-3 items-center pt-1">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Road Width</label>
                  <input
                    type="text"
                    value={roadWidth}
                    onChange={(e) => setRoadWidth(e.target.value)}
                    placeholder="e.g. 40 ft"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-medium"
                  />
                </div>

                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer mt-5">
                  <input
                    type="checkbox"
                    checked={isCornerPlot}
                    onChange={(e) => setIsCornerPlot(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className="font-bold text-slate-800">Corner Plot</span>
                </label>

                <label className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer mt-5">
                  <input
                    type="checkbox"
                    checked={isGatedCommunity}
                    onChange={(e) => setIsGatedCommunity(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className="font-bold text-slate-800">Gated Community</span>
                </label>
              </div>

              {/* Approvals Checkboxes */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block">Statutory Approvals</label>
                <div className="flex items-center gap-3">
                  {['DTCP', 'RERA', 'Patta'].map((appr) => (
                    <button
                      key={appr}
                      type="button"
                      onClick={() => toggleApproval(appr)}
                      className={`min-h-[38px] px-3.5 py-1.5 rounded-lg border font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        approvals.includes(appr)
                          ? 'bg-emerald-50 border-[#15803D] text-[#15803D]'
                          : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      {approvals.includes(appr) && <Check className="w-3.5 h-3.5 text-[#15803D]" />}
                      <span>{appr}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────────────
                  MULTI-IMAGE UPLOAD COMPONENT (Photos, Floor Plans, Layouts)
                  ───────────────────────────────────────────────────────────── */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    <span>Property Photos, Floor Plans & Site Layouts</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {images.length} {images.length === 1 ? 'Image' : 'Images'} Uploaded
                  </span>
                </div>

                {/* Hidden Multi-file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />

                {/* Drag and Drop Box */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`p-4 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-emerald-500 bg-emerald-50/60'
                      : 'border-slate-300 hover:border-slate-400 bg-slate-50/60'
                  }`}
                >
                  <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                  <p className="text-xs font-bold text-slate-800">
                    Upload Property Photos, Floor Plans & Site Layouts
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Click to browse or drag & drop multiple image files
                  </p>
                </div>

                {/* Or paste image URL */}
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    placeholder="Or paste an image / layout URL (https://...)"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    className="flex-1 p-2 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomUrl}
                    className="min-h-[38px] px-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 text-xs transition-colors cursor-pointer"
                  >
                    Add URL
                  </button>
                </div>

                {/* Removable Thumbnail Previews Grid */}
                {images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                    {images.map((imgUrl, index) => (
                      <div
                        key={index}
                        className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-100 h-24 shadow-sm"
                      >
                        <img
                          src={imgUrl}
                          alt={`Upload Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {/* Index & Cover Badge */}
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-slate-900/80 text-white text-[9px] font-bold">
                          {index === 0 ? 'Cover' : `#${index + 1}`}
                        </span>

                        {/* Remove Image Button */}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-md transition-colors cursor-pointer"
                          title="Remove image"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Location Address */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Site Location Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Sector A, Golden City, NH Bypass, Cuddalore"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white font-medium"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-200">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 font-medium"
                />
              </div>

              {/* Sticky Bottom Action Footer (Always Visible & Clickable) */}
              <div className="sticky bottom-0 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 p-4 sm:px-6 bg-white/95 dark:bg-[#0B2516]/95 backdrop-blur-md border-t border-slate-200 dark:border-[#1E5D32] flex items-center justify-between gap-3 shrink-0 z-30 shadow-lg mt-4">
                <button
                  type="button"
                  onClick={closePropertyModal}
                  className="min-h-[46px] px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 sm:flex-initial min-h-[46px] px-6 py-2.5 bg-[#15803D] hover:bg-[#113B24] text-white font-black rounded-xl shadow-lg shadow-emerald-950/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer text-xs sm:text-sm"
                >
                  <Plus className="w-4 h-4 text-[#EAB308]" />
                  <span>{editingProperty ? 'Save Property Changes' : 'Add Property to Inventory'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
