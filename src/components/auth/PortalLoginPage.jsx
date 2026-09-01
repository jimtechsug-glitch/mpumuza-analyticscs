import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  School,
  Users,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Lock,
  ArrowLeft,
  KeyRound,
  UserCheck,
  Sparkles,
  Award,
  Eye,
  EyeOff,
  Building2,
  BookOpen
} from 'lucide-react';

export default function PortalLoginPage({ onBackToHome }) {
  const { login, parentLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [parentLin, setParentLin] = useState('LIN-2026-S01');
  const [parentPin, setParentPin] = useState('1234');
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('quick'); // 'quick', 'staff', 'parent'

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleStaffSubmit = (e) => {
    e.preventDefault();
    setError(null);
    const result = login(email, password);
    if (!result?.success) {
      setError(result?.message || 'Invalid email or password.');
    }
  };

  const handleParentSubmit = (e) => {
    e.preventDefault();
    setError(null);
    const result = parentLogin(parentLin, parentPin);
    if (!result?.success) {
      setError(result?.message || 'Invalid LIN or PIN.');
    }
  };

  const handleQuickLogin = (demoEmail, demoPass) => {
    setError(null);
    login(demoEmail, demoPass);
  };

  const handleQuickParent = (demoLin, demoPin) => {
    setError(null);
    parentLogin(demoLin, demoPin);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 relative overflow-x-hidden">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md py-4 px-4 sm:px-8 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBackToHome}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center space-x-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Back to Showcase</span>
            </button>

            <div className="flex items-center space-x-2.5">
              <div className="h-9 w-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 shadow-md">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-base sm:text-lg tracking-tight font-outfit text-white block leading-none">
                  Mpumuza Analytics
                </span>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  Secure Access Gateway
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1.5 bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-[11px] px-3 py-1 rounded-full font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Portal Online</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Standout Sign-In Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl relative z-10 text-left space-y-6">
          
          {/* Header Title Section */}
          <div className="text-center space-y-2 pb-2">
            <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs px-3.5 py-1 rounded-full font-bold mb-1">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Unified Authentication Portal</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-outfit text-white tracking-tight">
              Sign In to Your Portal
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">
              Select your user role or enter assigned credentials to access Uganda's standard PLE, UCE &amp; UACE school management engine.
            </p>
          </div>

          {/* Standout Role Selector Tabs */}
          <div className="grid grid-cols-3 gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setActiveTab('quick'); setError(null); }}
              className={`py-2.5 px-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'quick'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">1-Click Demo</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('staff'); setError(null); }}
              className={`py-2.5 px-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'staff'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Staff Login</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('parent'); setError(null); }}
              className={`py-2.5 px-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'parent'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Parent Portal</span>
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-2xl text-xs font-semibold flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: 1-Click Quick Demo Launcher */}
          {activeTab === 'quick' && (
            <div className="space-y-3 pt-1">
              <span className="text-[11px] font-extrabold uppercase text-amber-400 tracking-wider block">
                Select an Instant Role to Launch:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                
                {/* Secondary School Admin */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin.kitende@uneb.go.ug', 'admin123')}
                  className="p-3.5 bg-slate-950/70 border border-slate-800 hover:border-amber-500/70 rounded-2xl text-left transition-all group flex items-center justify-between shadow-xs hover:bg-slate-800/60"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-white group-hover:text-amber-400 flex items-center space-x-2 text-xs">
                      <School className="w-4 h-4 text-blue-400 shrink-0" />
                      <span className="truncate">Secondary Admin</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate mt-0.5">Kitende Secondary (O &amp; A Level)</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-transform group-hover:translate-x-1 shrink-0" />
                </button>

                {/* Primary School Admin */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin.namagunga@uneb.go.ug', 'admin123')}
                  className="p-3.5 bg-slate-950/70 border border-slate-800 hover:border-amber-500/70 rounded-2xl text-left transition-all group flex items-center justify-between shadow-xs hover:bg-slate-800/60"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-white group-hover:text-amber-400 flex items-center space-x-2 text-xs">
                      <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span className="truncate">Primary Admin</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate mt-0.5">Namagunga Primary (PLE Engine)</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-transform group-hover:translate-x-1 shrink-0" />
                </button>

                {/* Teacher Subject Portal */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('tr.mukasa@kitende.edu.ug', 'teacher123')}
                  className="p-3.5 bg-slate-950/70 border border-slate-800 hover:border-amber-500/70 rounded-2xl text-left transition-all group flex items-center justify-between shadow-xs hover:bg-slate-800/60"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-white group-hover:text-amber-400 flex items-center space-x-2 text-xs">
                      <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span className="truncate">Teacher Marks Portal</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate mt-0.5">Tr. Mukasa (Physics &amp; Math)</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-transform group-hover:translate-x-1 shrink-0" />
                </button>

                {/* Parent Learner Portal */}
                <button
                  type="button"
                  onClick={() => handleQuickParent('LIN-2026-S01', '1234')}
                  className="p-3.5 bg-slate-950/70 border border-slate-800 hover:border-amber-500/70 rounded-2xl text-left transition-all group flex items-center justify-between shadow-xs hover:bg-slate-800/60"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-white group-hover:text-amber-400 flex items-center space-x-2 text-xs">
                      <UserCheck className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="truncate">Parent &amp; Student Portal</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block truncate mt-0.5">Mugisha Ivan (LIN-2026-S01)</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-transform group-hover:translate-x-1 shrink-0" />
                </button>

              </div>
            </div>
          )}

          {/* TAB 2: Staff Email & Password Form */}
          {activeTab === 'staff' && (
            <form onSubmit={handleStaffSubmit} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Institutional Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin.kitende@uneb.go.ug"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors placeholder:text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors placeholder:text-slate-600 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span className="text-[11px] text-amber-400/80">Demo: admin123 / teacher123</span>
                <span className="text-[11px]">256-bit Encrypted Session</span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-2xl shadow-xl transition-all text-sm active:scale-98"
              >
                Sign In to Staff Portal
              </button>
            </form>
          )}

          {/* TAB 3: Parent & Student LIN + PIN Form */}
          {activeTab === 'parent' && (
            <form onSubmit={handleParentSubmit} className="space-y-4 pt-1">
              <div className="bg-sky-950/40 border border-sky-800/60 p-3.5 rounded-2xl text-xs text-sky-200">
                <p className="font-bold flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-sky-400" />
                  <span>Student &amp; Parent Verification</span>
                </p>
                <p className="text-[11px] text-sky-300/80 mt-1">
                  Enter the Learner Identification Number (LIN) and 4-digit PIN provided on the student's admission or previous report card.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Student LIN Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LIN-2026-S01"
                  value={parentLin}
                  onChange={(e) => setParentLin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Parent Access PIN
                </label>
                <input
                  type="password"
                  required
                  maxLength={6}
                  placeholder="e.g. 1234"
                  value={parentPin}
                  onChange={(e) => setParentPin(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-2xl shadow-xl transition-all text-sm active:scale-98"
              >
                Access Learner's Report Card
              </button>
            </form>
          )}

          {/* Footer Security Badges */}
          <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
            <div className="flex items-center space-x-1.5 text-slate-400">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Official UNEB Grading Architecture</span>
            </div>
            <div>
              &copy; 2026 Mpumuza Analytics &bull; Multitenant Cloud
            </div>
          </div>

        </div>
      </main>

    </div>
  );
}
