import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Compass,
  CheckCircle2,
  Clock,
  Check,
  Sparkles,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Share2,
  Pencil,
  Trash2,
  PhoneCall,
  MessageSquare,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PropertyStatus } from '../types';

export const PropertyDetailDrawer: React.FC = () => {
  const {
    selectedProperty,
    isPropertyDrawerOpen,
    closePropertyDrawer,
    openEditPropertyModal,
    updatePropertyStatus,
    deleteProperty,
    settings,
  } = useApp();

  const [activeImageIndex, setActiveImageIndex] = React.useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  // Reset active image index and confirmation prompt when selectedProperty changes or drawer closes
  React.useEffect(() => {
    setActiveImageIndex(0);
    setShowDeleteConfirm(false);
  }, [selectedProperty?.id, isPropertyDrawerOpen]);

  if (!selectedProperty) return null;

  const currentImage =
    selectedProperty.images && selectedProperty.images.length > 0
      ? selectedProperty.images[activeImageIndex] || selectedProperty.images[0]
      : 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80';

  const handleCall = () => {
    window.location.href = `tel:${settings.contactNumber.replace(/\D/g, '')}`;
  };

  const handleWhatsAppContact = () => {
    const cleanPhone = settings.contactNumber.replace(/\D/g, '');
    const message = `Hello ${settings.ownerName}, I am inquiring about ${selectedProperty.title} (Plot #${selectedProperty.plotNumber}, ${selectedProperty.plotDimensions}, ₹${(selectedProperty.totalPrice / 100000).toFixed(2)}L). Please share further details, DTCP documents, and site visit schedule.`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleShareWhatsApp = () => {
    const text = `🏡 *${settings.companyName} · Property Details*\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `📍 *${selectedProperty.title}*\n` +
      `📐 Dimensions: *${selectedProperty.plotDimensions}*\n` +
      `📏 Area: *${selectedProperty.areaSqFt} Sq.Ft* (${selectedProperty.areaCents} Cents)\n` +
      `🧭 Facing: *${selectedProperty.facing} Facing*\n` +
      `🛣️ Road: *${selectedProperty.roadWidth} Tar Road*\n` +
      `💰 Total Price: *₹${(selectedProperty.totalPrice / 100000).toFixed(2)} Lakhs* (₹${selectedProperty.pricePerSqFt}/sq.ft)\n` +
      `✅ Approvals: *${selectedProperty.approvals.join(', ')}*\n` +
      `📍 Location: ${selectedProperty.address}\n` +
      `📞 Contact: ${settings.ownerName} (${settings.contactNumber})\n` +
      `Email: ${settings.businessEmail}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const getStatusBadge = (status: PropertyStatus) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-50 border border-emerald-400 text-emerald-900 font-semibold';
      case 'Reserved':
        return 'bg-amber-50 border border-amber-400 text-amber-900 font-semibold';
      case 'Sold':
        return 'bg-slate-100 border border-slate-300 text-slate-500 line-through';
    }
  };

  return (
    <AnimatePresence>
      {isPropertyDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePropertyDrawer}
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
            {/* Mobile Drag Indicator */}
            <div className="md:hidden w-12 h-1.5 bg-slate-300 rounded-full mx-auto my-2.5 shrink-0" />

            {/* Header: Deep Forest Green matching brand standard */}
            <div className="px-5 py-4 bg-[#113B24] text-white flex items-center justify-between gap-3 border-b border-[#1E5D32] shrink-0">
              <div className="min-w-0">
                <span className="text-xs font-bold text-emerald-400 block uppercase tracking-wider">
                  Plot #{selectedProperty.plotNumber} · {selectedProperty.category}
                </span>
                <h3 className="text-base font-bold text-white truncate">
                  {selectedProperty.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    closePropertyDrawer();
                    openEditPropertyModal(selectedProperty);
                  }}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                  title="Edit Property"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={closePropertyDrawer}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* Image Gallery */}
              <div className="space-y-2">
                <div className="relative h-48 sm:h-56 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img
                    src={currentImage}
                    alt={selectedProperty.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-all duration-200"
                  />
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-lg text-xs font-bold border shadow-sm ${getStatusBadge(
                        selectedProperty.status
                      )}`}
                    >
                      {selectedProperty.status}
                    </span>
                    {selectedProperty.isCornerPlot && (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-3 h-3" /> Corner Plot
                      </span>
                    )}
                  </div>

                  {selectedProperty.images && selectedProperty.images.length > 1 && (
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold">
                      {activeImageIndex + 1} / {selectedProperty.images.length}
                    </span>
                  )}
                </div>

                {/* Multiple Thumbnail Strip */}
                {selectedProperty.images && selectedProperty.images.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {selectedProperty.images.map((imgUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-16 h-12 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                          activeImageIndex === idx
                            ? 'border-emerald-600 ring-2 ring-emerald-500/30'
                            : 'border-slate-200 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Price & Rate Callout */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">
                    Total Consideration
                  </span>
                  <span className="text-2xl font-black text-slate-900 tabular-nums">
                    ₹{(selectedProperty.totalPrice / 100000).toFixed(2)}{' '}
                    <span className="text-sm font-semibold text-slate-500">Lakhs</span>
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">
                    Base Rate
                  </span>
                  <span className="text-base font-bold text-emerald-700 tabular-nums">
                    ₹{selectedProperty.pricePerSqFt} <span className="text-xs font-normal text-slate-500">/ sq.ft</span>
                  </span>
                </div>
              </div>

              {/* Technical Specifications Grid */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Land Specifications & Approvals
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-bold">DIMENSIONS</span>
                    <span className="font-bold text-slate-800">{selectedProperty.plotDimensions}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-bold">AREA SQ.FT</span>
                    <span className="font-bold text-slate-800 tabular-nums">{selectedProperty.areaSqFt} sqft</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-bold">CENTS EXTENT</span>
                    <span className="font-bold text-slate-800 tabular-nums">{selectedProperty.areaCents} Cts</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px] font-bold">FACING</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-emerald-600" />
                      {selectedProperty.facing}
                    </span>
                  </div>
                </div>

                {/* Additional Badges: Approvals, Road, Gated */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="px-3 py-1 bg-slate-100 rounded-lg font-semibold text-slate-700">
                    Road: {selectedProperty.roadWidth}
                  </span>
                  {selectedProperty.isGatedCommunity && (
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Gated Community
                    </span>
                  )}
                  {selectedProperty.approvals.map((appr) => (
                    <span key={appr} className="px-3 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded-lg font-bold">
                      {appr} Approved
                    </span>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1 text-xs text-slate-600 leading-relaxed">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Overview & Layout Highlights
                </h4>
                <p className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {selectedProperty.description}
                </p>
              </div>

              {/* Dedicated Location & Map Section */}
              <div className="space-y-2 text-xs">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Location & Map</span>
                </h4>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">
                        Property Address
                      </span>
                      <p className="text-xs font-semibold text-slate-800 leading-snug">
                        {selectedProperty.address}
                      </p>
                    </div>
                  </div>

                  <a
                    href={selectedProperty.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(selectedProperty.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="min-h-[44px] px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl flex items-center justify-center gap-2 shrink-0 transition-colors border border-emerald-200"
                  >
                    <MapPin className="w-4 h-4 text-emerald-700" />
                    <span>Open in Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
                  </a>
                </div>
              </div>

              {/* Status Update Quick Toggles */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-700 block">
                  Change Operational Status
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(['Available', 'Reserved', 'Sold'] as PropertyStatus[]).map((st) => (
                    <button
                      key={st}
                      onClick={() => updatePropertyStatus(selectedProperty.id, st)}
                      className={`min-h-[44px] py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        selectedProperty.status === st
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Danger Zone / Remove Property Option */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500 font-medium">Inventory Removal</span>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="min-h-[44px] px-3.5 py-2 text-xs font-bold rounded-xl text-red-600 hover:bg-red-50 border border-red-200 bg-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                  <span>Delete Property</span>
                </button>
              </div>
            </div>

            {/* Bottom Actions Bar: Deep Forest Green matching top bar */}
            <div className="p-4 bg-[#113B24] border-t border-[#1E5D32] shrink-0 space-y-2.5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCall}
                  className="flex-1 min-h-[44px] px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <PhoneCall className="w-4 h-4 text-emerald-700" />
                  <span>Call Promoter</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppContact}
                  className="flex-1 min-h-[44px] px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="min-h-[44px] px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="Share WhatsApp Brochure"
                >
                  <Share2 className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline">Share</span>
                </button>
              </div>

              {/* Explicit Delete Property Button */}
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full min-h-[44px] px-4 py-2 text-xs font-bold rounded-xl text-red-600 hover:bg-red-50 border border-red-200 bg-white flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
                <span>Delete Property</span>
              </button>
            </div>
          </motion.div>

          {/* Confirmation Prompt / Modal */}
          <AnimatePresence>
            {showDeleteConfirm && (
              <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                {/* Modal Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowDeleteConfirm(false)}
                  className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
                />

                {/* Modal Dialog Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="relative z-10 w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 sm:p-6 space-y-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-11 h-11 rounded-full bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        Are you sure you want to delete this property?
                      </h3>
                      <p className="text-xs text-red-600 font-semibold">
                        This action cannot be undone.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
                    <p className="font-bold text-slate-900">
                      {selectedProperty.title} · Plot #{selectedProperty.plotNumber}
                    </p>
                    <p className="text-slate-500 truncate">
                      {selectedProperty.address}
                    </p>
                  </div>

                  {/* Action Buttons: Cancel and Confirm Delete */}
                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="min-h-[44px] px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        deleteProperty(selectedProperty.id);
                        setShowDeleteConfirm(false);
                        closePropertyDrawer();
                      }}
                      className="min-h-[44px] px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Confirm Delete</span>
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
};
