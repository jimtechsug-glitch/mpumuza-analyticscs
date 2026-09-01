import React from 'react';
import {
  BarChart3,
  Award,
  CheckCircle2,
  FileSpreadsheet,
  Printer,
  ShieldCheck,
  School,
  Users,
  ArrowRight,
  Sparkles,
  Lock,
  Calendar,
  Send,
  Zap,
  Building2
} from 'lucide-react';

export default function LandingPage({ onGoToSignIn }) {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950 relative overflow-x-hidden">
      
      {/* Background Lighting Gradients */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 py-4 px-4 sm:px-8 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 shadow-md">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white font-outfit block leading-none">
                Mpumuza Analytics
              </span>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                Uganda School Report Engine
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onGoToSignIn}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center space-x-2 active:scale-95"
            >
              <Lock className="w-4 h-4" />
              <span>Portal Sign In</span>
            </button>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col justify-center space-y-16">
        
        {/* Main Hero Showcase */}
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          
          <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-4 py-1.5 rounded-full text-xs font-extrabold text-amber-300">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Official UNEB PLE, UCE &amp; UACE National Grading Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight font-outfit text-white leading-tight">
            The Smart Academic &amp; Report Management System for <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500">Ugandan Schools</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-xl max-w-3xl mx-auto leading-relaxed">
            Empower your school with automated mark processing, bulk Excel uploads, instantaneous UNEB aggregate calculations, printable PDF report cards, and a dedicated parent access portal.
          </p>

          {/* Action Call to Action */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <button
              onClick={onGoToSignIn}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-2xl shadow-xl hover:shadow-amber-500/25 transition-all text-base flex items-center justify-center space-x-2.5 active:scale-95 group"
            >
              <span>Launch Portal Sign In</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onGoToSignIn}
              className="w-full sm:w-auto px-7 py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl border border-slate-700 transition-all text-sm flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Explore Instant Demo</span>
            </button>
          </div>

          {/* UNEB Level Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 pt-4">
            <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/80 px-4 py-2 rounded-xl text-xs font-semibold text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Primary (PLE 4 Core Aggregates)</span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/80 px-4 py-2 rounded-xl text-xs font-semibold text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              <span>O-Level (UCE Best 8 &amp; NCDC 20/80 AoI)</span>
            </div>
            <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/80 px-4 py-2 rounded-xl text-xs font-semibold text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>A-Level (UACE 20 Points Scale)</span>
            </div>
          </div>

        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          
          <div className="bg-slate-950/70 border border-slate-800 p-6 rounded-3xl space-y-3 hover:border-amber-500/50 transition-all text-left">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-outfit">Excel Bulk Mark Upload</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Download pre-structured templates, input scores offline, and parse hundreds of student marks in seconds with validation.
            </p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-6 rounded-3xl space-y-3 hover:border-amber-500/50 transition-all text-left">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <Printer className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-outfit">Batch PDF Report Cards</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Generate pixel-perfect A4 report cards with 1-click batch PDF export, complete with digital stamps and teacher remarks.
            </p>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 p-6 rounded-3xl space-y-3 hover:border-amber-500/50 transition-all text-left">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-outfit">Fees Clearance Lock</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Protect school revenue by automatically locking report cards for learners with outstanding balances until cleared by the bursar.
            </p>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            &copy; 2026 Mpumuza Analytics &bull; Multitenant Ugandan School Management
          </div>
          <div className="flex space-x-4 text-slate-400 font-medium">
            <span>Primary (PLE)</span>
            <span>&bull;</span>
            <span>O-Level (UCE)</span>
            <span>&bull;</span>
            <span>A-Level (UACE)</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
