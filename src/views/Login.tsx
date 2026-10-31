import { KriyaaLogo } from '../components/KriyaaLogo';
import React, { useState } from 'react';
import {
  ShieldCheck,
  Compass,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Login: React.FC = () => {
  const { login, settings } = useApp();
  const [email, setEmail] = useState('rajesh@kriyaapromoters.com');
  const [password, setPassword] = useState('••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      login(email);
      setIsLoading(false);
    }, 400);
  };

  const handleQuickAdminLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      login('rajesh@kriyaapromoters.com');
      setIsLoading(false);
    }, 300);
  };

  return (
    <div className="min-h-screen w-screen bg-[#0A0F1D] text-slate-100 flex flex-col justify-between p-4 sm:p-6 md:p-8 select-none relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-800/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Brand */}
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-200/80 p-1.5 flex items-center justify-center shrink-0">
            <KriyaaLogo className="w-full h-full" />
          </div>
          <div>
            <span className="text-sm font-black tracking-tight text-white block">
              {settings.companyName || 'KRIYAA PROMOTERS'}
            </span>
            <span className="text-[10.5px] text-[#EAB308] font-bold tracking-tight block">
              Your dream, our priority
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>DTCP No. 182/2023 · RERA Registered</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-auto z-10 py-6">
        <div className="bg-[#113B24] border border-[#1E5D32] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Card Header */}
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Admin & Promoter Portal</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Sign In to Your Workspace
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Manage Golden City layouts, plots inventory, customer inquiries, and DTCP approvals.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="promoter@kriyaapromoters.com"
                  className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-bold text-slate-300">Password</label>
                <span className="text-[11px] text-emerald-400 hover:underline cursor-pointer">
                  Default: superadmin
                </span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
                />
                <span>Remember this workstation</span>
              </label>
              <span className="text-slate-500 text-[11px]">Secure 256-bit AES</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full min-h-[46px] px-4 py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer mt-2"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Admin Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="pt-4 border-t border-slate-800/80 space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center">
              Quick 1-Tap Access
            </span>
            <button
              type="button"
              onClick={handleQuickAdminLogin}
              disabled={isLoading}
              className="w-full min-h-[42px] px-4 py-2.5 bg-[#0B2516] hover:bg-[#164329] border border-[#EAB308]/40 text-[#EAB308] text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                KP
              </div>
              <span>Sign in as Rajesh RTR (Super Admin)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Credentials Info */}
      <div className="max-w-md mx-auto w-full text-center text-xs text-slate-500 z-10 space-y-1">
        <p className="font-semibold text-slate-400">
          Kriyaa Promoters · No. 7, Kamaraj Salai, Cuddalore
        </p>
        <p className="text-[11px] text-slate-600">
          Promoter Phone: 9443275727 · DTCP Sanctioned Layouts
        </p>
      </div>
    </div>
  );
};
