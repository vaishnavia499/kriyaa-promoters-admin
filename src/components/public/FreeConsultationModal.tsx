import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, CheckCircle2, ShieldCheck, Phone, User, MessageCircle, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Property } from '../../types';

interface FreeConsultationModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefillPlot?: Property | null;
}

export const FreeConsultationModal: React.FC<FreeConsultationModalProps> = ({
  isOpen,
  onClose,
  prefillPlot,
}) => {
  const { saveLead, showToast, settings } = useApp();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredPlot, setPreferredPlot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (prefillPlot) {
      setPreferredPlot(
        `Plot #${prefillPlot.plotNumber} (${prefillPlot.plotDimensions} · ${prefillPlot.projectName || 'Golden City'})`
      );
    } else {
      setPreferredPlot('Golden City DTCP Plots');
    }
  }, [prefillPlot, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim()) {
      showToast('Please enter your Name and WhatsApp Mobile', 'error');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // Save lead to application state
      saveLead({
        customerName: fullName.trim(),
        phone: phone.trim(),
        propertyOfInterest: preferredPlot,
        preferredAction: 'WhatsApp',
        status: 'New',
        notes: [`Web Consultation inquiry submitted for ${preferredPlot}`],
      });

      setIsSubmitting(false);
      setIsSuccess(true);
      showToast('Consultation request sent to Rajesh RTR!', 'success');

      // Also trigger optional direct WhatsApp notification
      setTimeout(() => {
        const text = `Hello Rajesh RTR, I just requested a consultation on Kriyaa Promoters website:\nName: ${fullName}\nPhone: ${phone}\nInterested in: ${preferredPlot}`;
        window.open(`https://wa.me/919443278899?text=${encodeURIComponent(text)}`, '_blank');
      }, 700);
    }, 400);
  };

  const handleResetAndClose = () => {
    setIsSuccess(false);
    setFullName('');
    setPhone('');
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
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-wide text-white">
                Get Free Consultation
              </h3>
              <p className="text-[11px] text-[#EAB308] font-semibold">
                Direct with Promoter Rajesh RTR
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
                  Consultation Request Received!
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xs mx-auto leading-relaxed">
                  Vanakkam <span className="font-bold text-[#15803D]">{fullName}</span>. MD Rajesh RTR has received your details and will connect with you via WhatsApp / Call.
                </p>
              </div>

              <div className="pt-2 flex flex-col gap-2">
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-[11px] text-[#113B24] dark:text-emerald-300 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
                <p>
                  100% Free · No obligation · Clear Title documents, Vastu consultation, and DTCP sanction copy shared instantly.
                </p>
              </div>

              {/* Field 1: Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                  Your Full Name <span className="text-[#991B1B]">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. S. Murugan"
                    className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#112F1C] border border-slate-300 dark:border-[#1E5D32] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                  />
                </div>
              </div>

              {/* Field 2: WhatsApp Mobile */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                  WhatsApp Mobile Number <span className="text-[#991B1B]">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98400 12345"
                    className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#112F1C] border border-slate-300 dark:border-[#1E5D32] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                  />
                </div>
              </div>

              {/* Optional Field: Preferred Layout / Plot */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block">
                  Property or Scheme of Interest
                </label>
                <input
                  type="text"
                  value={preferredPlot}
                  onChange={(e) => setPreferredPlot(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[#112F1C] border border-slate-300 dark:border-[#1E5D32] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[46px] rounded-xl bg-[#15803D] hover:bg-[#113B24] active:scale-[0.99] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer mt-2"
              >
                {isSubmitting ? (
                  <span>Connecting with Rajesh RTR...</span>
                ) : (
                  <>
                    <span>Submit & Connect on WhatsApp</span>
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
