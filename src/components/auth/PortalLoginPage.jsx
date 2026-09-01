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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-400 selection:text-slate-950 relative overflow-x-hidden">
      
      {/* Subtle Mesh Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-emerald-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 -right-32 w-[500px] h-[500px] bg-teal-400/10 rounded-full blur-3xl" />
      </div>

      {/* Top Header Bar */}
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md py-3.5 px-4 sm:px-8 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBackToHome}
              className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-950 hover:bg-slate-200 transition-all flex items-center space-x-1.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Back to Showcase</span>
            </button>

            <div className="flex items-center space-x-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-base sm:text-lg tracking-tight font-outfit text-slate-900 block leading-none">
                  Mpumuza Analytics
                </span>
                <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
                  Secure Access Gateway
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] px-3 py-1 rounded-full font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Portal Online</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Standout Sign-In Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">
        <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xl text-left space-y-6">
          
          {/* Header Title Section */}
          <div className="text-center space-y-2 pb-2">
            <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-3.5 py-1 rounded-full font-bold mb-1">
              <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
              <span>Unified Authentication Portal</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-outfit text-slate-900 tracking-tight">
              Sign In to Your Portal
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
              Select your user role or enter assigned credentials to access Uganda's standard PLE, UCE &amp; UACE school management engine.
            </p>
          </div>

          {/* Standout Role Selector Tabs */}
          <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setActiveTab('quick'); setError(null); }}
              className={`py-2.5 px-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'quick'
                  ? 'bg-gradient-to-r from-emerald-600 to-green-700 text-white font-black shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
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
                  ? 'bg-gradient-to-r from-emerald-600 to-green-700 text-white font-black shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
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
                  ? 'bg-gradient-to-r from-emerald-600 to-green-700 text-white font-black shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Parent Portal</span>
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs font-semibold flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* TAB 1: 1-Click Quick Demo Launcher */}
          {activeTab === 'quick' && (
            <div className="space-y-3 pt-1">
              <span className="text-[11px] font-extrabold uppercase text-emerald-800 tracking-wider block">
                Select an Instant Role to Launch:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                
                {/* Secondary School Admin */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin.kitende@uneb.go.ug', 'admin123')}
                  className="p-3.5 bg-slate-50 border border-slate-200 hover:border-emerald-500 rounded-2xl text-left transition-all group flex items-center justify-between shadow-xs hover:bg-emerald-50/40"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-slate-900 group-hover:text-emerald-800 flex items-center space-x-2 text-xs">
                      <School className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="truncate">Secondary Admin</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block truncate mt-0.5">Kitende Secondary (O &amp; A Level)</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-1 shrink-0" />
                </button>

                {/* Primary School Admin */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin.namagunga@uneb.go.ug', 'admin123')}
                  className="p-3.5 bg-slate-50 border border-slate-200 hover:border-emerald-500 rounded-2xl text-left transition-all group flex items-center justify-between shadow-xs hover:bg-emerald-50/40"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-slate-900 group-hover:text-emerald-800 flex items-center space-x-2 text-xs">
                      <Building2 className="w-4 h-4 text-teal-600 shrink-0" />
                      <span className="truncate">Primary Admin</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block truncate mt-0.5">Namagunga Primary (PLE Engine)</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-1 shrink-0" />
                </button>

                {/* Teacher Subject Portal */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin('tr.mukasa@kitende.edu.ug', 'teacher123')}
                  className="p-3.5 bg-slate-50 border border-slate-200 hover:border-emerald-500 rounded-2xl text-left transition-all group flex items-center justify-between shadow-xs hover:bg-emerald-50/40"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-slate-900 group-hover:text-emerald-800 flex items-center space-x-2 text-xs">
                      <BookOpen className="w-4 h-4 text-green-600 shrink-0" />
                      <span className="truncate">Teacher Marks Portal</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block truncate mt-0.5">Tr. Mukasa (Physics &amp; Math)</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-1 shrink-0" />
                </button>

                {/* Parent Learner Portal */}
                <button
                  type="button"
                  onClick={() => handleQuickParent('LIN-2026-S01', '1234')}
                  className="p-3.5 bg-slate-50 border border-slate-200 hover:border-emerald-500 rounded-2xl text-left transition-all group flex items-center justify-between shadow-xs hover:bg-emerald-50/40"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-slate-900 group-hover:text-emerald-800 flex items-center space-x-2 text-xs">
                      <UserCheck className="w-4 h-4 text-teal-600 shrink-0" />
                      <span className="truncate">Parent &amp; Student Portal</span>
                    </div>
                    <span className="text-[10px] text-slate-500 block truncate mt-0.5">Mugisha Ivan (LIN-2026-S01)</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-1 shrink-0" />
                </button>

              </div>
            </div>
          )}

          {/* TAB 2: Staff Email & Password Form */}
          {activeTab === 'staff' && (
            <form onSubmit={handleStaffSubmit} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Institutional Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="admin.kitende@uneb.go.ug"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-400 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span className="text-[11px] text-emerald-700 font-semibold">Demo: admin123 / teacher123</span>
                <span className="text-[11px]">256-bit Encrypted Session</span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white font-bold rounded-2xl shadow-md transition-all text-sm active:scale-98"
              >
                Sign In to Staff Portal
              </button>
            </form>
          )}

          {/* TAB 3: Parent & Student LIN + PIN Form */}
          {activeTab === 'parent' && (
            <form onSubmit={handleParentSubmit} className="space-y-4 pt-1">
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-xs text-emerald-900">
                <p className="font-bold flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Student &amp; Parent Verification</span>
                </p>
                <p className="text-[11px] text-emerald-700 mt-1">
                  Enter the Learner Identification Number (LIN) and 4-digit PIN provided on the student's admission or previous report card.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Student LIN Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LIN-2026-S01"
                  value={parentLin}
                  onChange={(e) => setParentLin(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Parent Access PIN
                </label>
                <input
                  type="password"
                  required
                  maxLength={6}
                  placeholder="e.g. 1234"
                  value={parentPin}
                  onChange={(e) => setParentPin(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-2xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white font-bold rounded-2xl shadow-md transition-all text-sm active:scale-98"
              >
                Access Learner's Report Card
              </button>
            </form>
          )}

          {/* Footer Security Badges */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
            <div className="flex items-center space-x-1.5 text-slate-600">
              <Award className="w-4 h-4 text-emerald-600" />
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
