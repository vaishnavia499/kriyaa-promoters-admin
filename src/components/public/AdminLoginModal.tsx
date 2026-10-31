import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, UserCheck, KeyRound } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { KriyaaLogo } from '../KriyaaLogo';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { login, settings, showToast } = useApp();
  const [email, setEmail] = useState('rajesh@kriyaapromoters.com');
  const [password, setPassword] = useState('superadmin');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      login(email);
      setIsLoading(false);
      onClose();
      onSuccess();
    }, 400);
  };

  const handleQuickSuperAdmin = () => {
    setIsLoading(true);
    setTimeout(() => {
      login('rajesh@kriyaapromoters.com');
      setIsLoading(false);
      onClose();
      onSuccess();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white dark:bg-[#0B2516] border-2 border-[#1E5D32] rounded-3xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100"
      >
        {/* Header */}
        <div className="bg-[#113B24] p-5 text-white flex items-center justify-between border-b border-[#1E5D32]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#EAB308]/60 p-1 flex items-center justify-center overflow-hidden">
              <KriyaaLogo className="w-full h-full" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-black tracking-wide text-white">
                  ADMIN & STAFF PORTAL
                </h3>
                <span className="p-0.5 rounded bg-[#EAB308] text-slate-950">
                  <Lock className="w-3 h-3" />
                </span>
              </div>
              <p className="text-[10.5px] text-[#EAB308] font-bold">
                Restricted Workspace · Rajesh RTR
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-5">
          <div className="text-center sm:text-left space-y-1">
            <h4 className="text-base font-black text-slate-900 dark:text-white">
              Sign In to Management Console
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Real-time plot status toggling, layout hotspot simulator, and customer inquiry CRM.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Official Staff Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rajesh@kriyaapromoters.com"
                  className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#112F1C] border border-slate-300 dark:border-[#1E5D32] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <span className="text-[10px] text-[#15803D] dark:text-emerald-400 font-bold">
                  Demo: superadmin
                </span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#112F1C] border border-slate-300 dark:border-[#1E5D32] text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#15803D]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full min-h-[46px] rounded-xl bg-[#15803D] hover:bg-[#113B24] active:scale-[0.99] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer mt-2"
            >
              {isLoading ? (
                <span>Authenticating Credentials...</span>
              ) : (
                <>
                  <span>Sign In as Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Tap Access for Rajesh RTR */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold uppercase tracking-wider">
              <span>Quick Demo Access</span>
              <span className="text-[#15803D] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified
              </span>
            </div>

            <button
              type="button"
              onClick={handleQuickSuperAdmin}
              disabled={isLoading}
              className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-[#0B2516] hover:bg-[#164329] border border-[#EAB308]/50 text-[#EAB308] text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-sm"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                KP
              </div>
              <span>1-Tap Sign In as Rajesh RTR (Super Admin)</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
