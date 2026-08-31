import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, School, Users, ArrowRight, BarChart3, CheckCircle2, FileSpreadsheet, Printer, Award, Lock } from 'lucide-react';

export default function LandingLoginPage() {
  const { login, parentLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [parentLin, setParentLin] = useState('LIN-2026-S01');
  const [parentPin, setParentPin] = useState('1234');
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('quick'); // 'quick' or 'credentials'

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    const result = login(email, password);
    if (!result.success) {
      setError(result.message);
    }
  };

  const handleQuickLogin = (demoEmail, demoPass) => {
    login(demoEmail, demoPass);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-amber-500 selection:text-white">
      
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 py-4 px-6 shadow-xs sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-sm">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 font-outfit">
                Mpumuza Analytics
              </span>
              <span className="text-[10px] text-amber-700 font-bold block uppercase tracking-wider -mt-1">
                Uganda School Report Engine
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 rounded-full font-bold">
              System Online v1.0
            </span>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col justify-center">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Branding & Value Proposition */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            <div className="inline-flex items-center space-x-2 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full text-xs font-extrabold text-amber-900">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Official UNEB PLE, UCE & UACE Grading Standard</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight font-outfit leading-tight">
              Mpumuza Analytics <br />
              <span className="text-amber-600">Multitenant School Report Engine</span>
            </h1>

            <p className="text-slate-600 text-base sm:text-lg max-w-2xl leading-relaxed">
              A comprehensive academic management system built for Uganda's Primary, O'Level, and A'Level institutions. Manage subjects, teachers, student rosters, bulk Excel mark uploads, and generate printable PDF report cards.
            </p>

            {/* Level Standards Pills */}
            <div className="flex flex-wrap gap-3 pt-2">
              <div className="flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-800">Primary (PLE 4 Core Aggregates)</span>
              </div>
              <div className="flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-800">O-Level (UCE Best 8 & New NCDC)</span>
              </div>
              <div className="flex items-center space-x-2 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-slate-800">A-Level (UACE 20 Points Scale)</span>
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600 border border-amber-200 shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase">Excel Bulk Upload</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">Download template & parse student marks</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600 border border-blue-200 shrink-0">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase">Printable PDF Reports</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">BOT, MOT, EOT & Combined reports</p>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: Dedicated Login Portal Box */}
          <div className="lg:col-span-5">
            
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl text-left space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 font-outfit">Portal Sign In</h3>
                  <p className="text-xs text-slate-500">Sign in to access your school dashboard</p>
                </div>
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-200">
                  <Lock className="w-5 h-5" />
                </div>
              </div>

              {/* Login Mode Selector Tabs */}
              <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('quick')}
                  className={`py-2 rounded-lg transition-all ${
                    activeTab === 'quick' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Quick Demo
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('credentials')}
                  className={`py-2 rounded-lg transition-all ${
                    activeTab === 'credentials' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Staff Login
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('parent')}
                  className={`py-2 rounded-lg transition-all ${
                    activeTab === 'parent' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Parent Portal
                </button>
              </div>

              {/* Tab 1: Quick Role Launcher */}
              {activeTab === 'quick' && (
                <div className="space-y-3">
                  <label className="block text-[11px] font-extrabold uppercase text-amber-800 font-outfit tracking-wider">
                    Select Portal Role to Launch Demo:
                  </label>

                  <div className="space-y-2.5 text-xs">

                    <button
                      type="button"
                      onClick={() => handleQuickLogin('admin.kitende@uneb.go.ug', 'admin123')}
                      className="w-full p-3 bg-slate-50 border border-slate-200 hover:border-amber-500 rounded-xl text-left transition-all group flex items-center justify-between shadow-xs hover:shadow-sm"
                    >
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-amber-800 flex items-center space-x-2">
                          <School className="w-4 h-4 text-blue-600" />
                          <span>Secondary School Admin</span>
                        </div>
                        <span className="text-[10px] text-slate-500">Kitende Secondary (O & A Level Combined)</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-transform group-hover:translate-x-1" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickLogin('tr.mukasa@kitende.edu.ug', 'teacher123')}
                      className="w-full p-3 bg-slate-50 border border-slate-200 hover:border-amber-500 rounded-xl text-left transition-all group flex items-center justify-between shadow-xs hover:shadow-sm"
                    >
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-amber-800 flex items-center space-x-2">
                          <Users className="w-4 h-4 text-indigo-600" />
                          <span>Teacher Subject Portal</span>
                        </div>
                        <span className="text-[10px] text-slate-500">Tr. Mukasa (Physics & Mathematics)</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-transform group-hover:translate-x-1" />
                    </button>

                  </div>
                </div>
              )}

              {/* Tab 2: Standard Credentials Form */}
              {activeTab === 'credentials' && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-rose-100 border border-rose-300 text-rose-800 rounded-xl text-xs font-semibold">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="user@school.edu.ug"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md transition-all text-sm"
                  >
                    Sign In to Staff Portal
                  </button>
                </form>
              )}

              {/* Tab 3: Parent & Student Portal Form */}
              {activeTab === 'parent' && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  setError(null);
                  const result = parentLogin(parentLin, parentPin);
                  if (!result.success) {
                    setError(result.message);
                  }
                }} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-rose-100 border border-rose-300 text-rose-800 rounded-xl text-xs font-semibold">
                      {error}
                    </div>
                  )}

                  <div className="bg-sky-50/70 border border-sky-200 p-3 rounded-xl text-xs text-sky-900">
                    <p className="font-bold">Parent & Student Access</p>
                    <p className="text-[11px] text-sky-700 mt-0.5">
                      Use the Learner LIN and Secret PIN assigned by the school administration. You will strictly access only your child's performance report card.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Student LIN Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. LIN-2026-S01"
                      value={parentLin}
                      onChange={(e) => setParentLin(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Parent Access PIN *</label>
                    <input
                      type="password"
                      required
                      placeholder="e.g. 1234"
                      value={parentPin}
                      onChange={(e) => setParentPin(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md transition-all text-sm"
                  >
                    Access Learner's Report Card
                  </button>
                </form>
              )}

            </div>

          </div>

        </div>

      </main>

      {/* Landing Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            &copy; 2026 Mpumuza Analytics &bull; Multitenant School Report Engine
          </div>
          <div className="flex space-x-4 text-slate-600 font-medium">
            <span>PLE Primary</span>
            <span>&bull;</span>
            <span>UCE O-Level</span>
            <span>&bull;</span>
            <span>UACE A-Level</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
