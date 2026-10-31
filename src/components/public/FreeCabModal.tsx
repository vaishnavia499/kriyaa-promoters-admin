import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Car, CheckCircle2, ShieldCheck, Phone, User, MapPin, Calendar, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Property } from '../../types';

interface FreeCabModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillPlot?: Property | null;
  prefillPlotNumbers?: string;
}

export const FreeCabModal: React.FC<FreeCabModalProps> = ({
  isOpen,
  onClose,
  prefillPlot,
  prefillPlotNumbers,
}) => {
  const { saveLead, showToast } = useApp();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [pickupCity, setPickupCity] = useState('Cuddalore');
  const [pickupAddress, setPickupAddress] = useState('');
  const [visitDate, setVisitDate] = useState('This Sunday');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const targetDescription = prefillPlotNumbers
    ? `Selected Plots: ${prefillPlotNumbers} (${prefillPlot?.projectName || 'Golden City'})`
    : prefillPlot
    ? `Plot #${prefillPlot.plotNumber} (${prefillPlot.projectName || 'Golden City'})`
    : 'Golden City Township Site Visit';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !pickupAddress.trim()) {
      showToast('Please fill all required booking fields', 'error');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      saveLead({
        customerName: fullName.trim(),
        phone: phone.trim(),
        propertyOfInterest: `Site Visit: ${targetDescription}`,
        preferredAction: 'Site Visit',
        status: 'New',
        notes: [
          `Free Site Visit Booking: In ${pickupCity} (${pickupAddress}) on ${visitDate}. Target inspection: ${targetDescription}`,
        ],
      });

      setIsSubmitting(false);
      setIsSuccess(true);
      showToast('Free Site Visit booked successfully! Visit details will be sent.', 'success');

      setTimeout(() => {
        const text = `🚖 *Free Site Visit Cab Booking Request*\nName: ${fullName}\nPhone: ${phone}\nPickup: ${pickupAddress}, ${pickupCity}\nPreferred Date: ${visitDate}\nDestination / Plots to Inspect: ${targetDescription}\nService: Doorstep AC Cab Pickup`;
        window.open(`https://wa.me/919443278899?text=${encodeURIComponent(text)}`, '_blank');
      }, 700);
    }, 400);
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setFullName('');
    setPhone('');
    setPickupAddress('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white dark:bg-[#0B2516] border-2 border-[#1E5D32] rounded-3xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100"
      >
        {/* Header */}
        <div className="bg-[#113B24] p-5 text-white flex items-center justify-between border-b border-[#1E5D32]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0B2516] border border-[#EAB308]/60 flex items-center justify-center text-[#EAB308]">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-wide text-white">
                Book Free Site Visit
              </h3>
              <p className="text-[11px] text-[#EAB308] font-semibold">
                Guided On-Site Inspection · 100% Free
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {isSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[#15803D] dark:text-emerald-400 flex items-center justify-center border-2 border-emerald-400 shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-black text-slate-900 dark:text-white">
                  Cab Confirmed for {fullName}!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xs mx-auto leading-relaxed">
                  Our chauffeur will pick you and your family up from <span className="font-bold text-[#15803D]">{pickupCity}</span> for a guided on-site walkthrough of Golden City with Rajesh RTR.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="w-full min-h-[46px] rounded-xl bg-[#15803D] hover:bg-[#113B24] text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {(prefillPlotNumbers || prefillPlot) && (
                <div className="bg-[#113B24] border border-[#EAB308]/60 p-3 rounded-2xl flex items-center justify-between text-xs text-white shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">📍</span>
                    <div>
                      <span className="text-[10px] text-emerald-200/90 uppercase font-black block tracking-wider">
                        Pre-Selected For Inspection
                      </span>
                      <span className="font-black text-[#EAB308]">
                        {prefillPlotNumbers ? `Plots ${prefillPlotNumbers}` : `Plot #${prefillPlot?.plotNumber} (${prefillPlot?.projectName || 'Golden City'})`}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-[#EAB308] text-slate-950 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                    Site Visit
                  </span>
                </div>
              )}

              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-[11px] text-[#113B24] dark:text-emerald-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#15803D] shrink-0" />
                <span>Complimentary AC cab service with family seating.</span>
              </div>

              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                  Full Name <span className="text-[#991B1B]">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. K. Venkat"
                    className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#112F1C] border border-slate-300 dark:border-[#1E5D32] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                  WhatsApp Contact <span className="text-[#991B1B]">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 94432..."
                    className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#112F1C] border border-slate-300 dark:border-[#1E5D32] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                  />
                </div>
              </div>

              {/* City & Address */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                    Pickup Region
                  </label>
                  <select
                    value={pickupCity}
                    onChange={(e) => setPickupCity(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#112F1C] border border-slate-300 dark:border-[#1E5D32] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                  >
                    <option value="Cuddalore">Cuddalore</option>
                    <option value="Pondicherry">Pondicherry</option>
                    <option value="Neyveli">Neyveli</option>
                    <option value="Chidambaram">Chidambaram</option>
                    <option value="Panruti">Panruti</option>
                    <option value="Villupuram">Villupuram</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                    Preferred Day
                  </label>
                  <select
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-[#112F1C] border border-slate-300 dark:border-[#1E5D32] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                  >
                    <option value="Today">Today</option>
                    <option value="Tomorrow">Tomorrow</option>
                    <option value="This Saturday">This Saturday</option>
                    <option value="This Sunday">This Sunday</option>
                    <option value="Next Week">Next Week</option>
                  </select>
                </div>
              </div>

              {/* Exact Doorstep Address */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                  Pickup Street / Landmark <span className="text-[#991B1B]">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    placeholder="e.g. Near Bus Stand / Colony Road"
                    className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#112F1C] border border-slate-300 dark:border-[#1E5D32] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[46px] rounded-xl bg-[#15803D] hover:bg-[#113B24] active:scale-[0.99] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer mt-2"
              >
                {isSubmitting ? (
                  <span>Scheduling Site Visit...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#EAB308]" />
                    <span>Confirm Free Site Visit</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
