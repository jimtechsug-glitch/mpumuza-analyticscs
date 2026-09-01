import React from 'react';
import {
  BarChart3,
  Award,
  CheckCircle2,
  FileSpreadsheet,
  Printer,
  ShieldCheck,
  Users,
  ArrowRight,
  Sparkles,
  Lock,
  Zap,
  MessageSquare
} from 'lucide-react';

export default function LandingPage({ onGoToSignIn }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950 relative overflow-x-hidden">

      {/* Subtle Mesh Gradient Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-amber-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] bg-sky-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-indigo-400/8 rounded-full blur-3xl" />
      </div>

      {/* Sticky Top Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">

          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-slate-900 font-outfit block leading-none">
                Mpumuza Analytics
              </span>
              <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">
                Uganda School Report Engine
              </span>
            </div>
          </div>

          {/* Nav CTA */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onGoToSignIn}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-black px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-all flex items-center space-x-2 active:scale-95"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Portal Sign In</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 relative z-10">

        {/* Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28 text-center space-y-8">

          {/* Top Badge */}
          <div className="inline-flex items-center space-x-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-1.5 rounded-full text-xs font-extrabold shadow-sm">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Official UNEB PLE, UCE &amp; UACE National Grading Architecture</span>
          </div>

          {/* Headline */}
          <div className="max-w-4xl mx-auto space-y-5">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight font-outfit text-slate-900 leading-tight">
              The Smart Academic &amp; Report{' '}
              <span className="relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500">
                  Management System
                </span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full opacity-40" />
              </span>{' '}
              for Ugandan Schools
            </h1>

            <p className="text-slate-500 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Automate mark processing, Excel uploads, UNEB aggregate calculations,
              printable PDF report cards, parent SMS delivery &amp; dedicated parent access portal.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onGoToSignIn}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-2xl shadow-xl shadow-amber-400/25 hover:shadow-amber-400/40 transition-all text-base flex items-center justify-center space-x-2.5 active:scale-95 group"
            >
              <span>Launch Portal Sign In</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onGoToSignIn}
              className="w-full sm:w-auto px-7 py-4 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-bold rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-sm flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Explore Demo Instantly</span>
            </button>
          </div>

          {/* UNEB Level Support Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 pt-2">
            <div className="flex items-center space-x-2 bg-white border border-slate-200 shadow-xs px-4 py-2 rounded-xl text-xs font-semibold text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Primary (PLE 4 Core Aggregates)</span>
            </div>
            <div className="flex items-center space-x-2 bg-white border border-slate-200 shadow-xs px-4 py-2 rounded-xl text-xs font-semibold text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
              <span>O-Level (UCE Best 8 &amp; NCDC 20/80 AoI)</span>
            </div>
            <div className="flex items-center space-x-2 bg-white border border-slate-200 shadow-xs px-4 py-2 rounded-xl text-xs font-semibold text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
              <span>A-Level (UACE 20 Points Scale)</span>
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            <div className="group bg-white border border-slate-200 hover:border-amber-300 p-6 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-all text-left">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white group-hover:border-amber-500 transition-all">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-outfit">Excel Bulk Mark Upload</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Download pre-structured templates, input scores offline, and parse hundreds of student marks in seconds with built-in validation.
              </p>
            </div>

            <div className="group bg-white border border-slate-200 hover:border-sky-300 p-6 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-all text-left">
              <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center group-hover:bg-sky-500 group-hover:text-white group-hover:border-sky-500 transition-all">
                <Printer className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-outfit">Batch PDF Report Cards</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Generate A4 report cards with 1-click batch export, complete with digital stamps, teacher remarks, and class positions.
              </p>
            </div>

            <div className="group bg-white border border-slate-200 hover:border-emerald-300 p-6 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-all text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-all">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-outfit">Fees Clearance Lock</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Automatically lock report cards for learners with outstanding fee balances until cleared by the bursar.
              </p>
            </div>

            <div className="group bg-white border border-slate-200 hover:border-indigo-300 p-6 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-all text-left">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white group-hover:border-indigo-500 transition-all">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-outfit">Multi-Role Access Control</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Separate portals for Super Admin, School Admin, Teachers, and Parents — each with scoped permissions.
              </p>
            </div>

            <div className="group bg-white border border-slate-200 hover:border-rose-300 p-6 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-all text-left">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white group-hover:border-rose-500 transition-all">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-outfit">Parent SMS Notifications</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Broadcast academic results and fee reminders via SMS to parents using GSM-7 optimized message templates.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-amber-500 to-yellow-400 border border-amber-400 p-6 rounded-3xl space-y-4 shadow-md hover:shadow-lg hover:shadow-amber-300/30 transition-all text-left">
              <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-950 font-outfit">Instant UNEB Grading Engine</h3>
              <p className="text-sm text-slate-900/70 leading-relaxed">
                Auto-calculates UNEB aggregates, divisions, subject grades, and rankings — PLE, UCE, and UACE all supported.
              </p>
              <button
                onClick={onGoToSignIn}
                className="inline-flex items-center space-x-1.5 text-xs font-black text-slate-950 hover:underline"
              >
                <span>Try Demo →</span>
              </button>
            </div>

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium">
          <div>
            &copy; 2026 Mpumuza Analytics &bull; Multitenant Ugandan School Management
          </div>
          <div className="flex items-center space-x-4 text-slate-500">
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


