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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-400 selection:text-slate-950 relative overflow-x-hidden">

      {/* Subtle Mesh Gradient Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-emerald-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] bg-teal-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-green-400/8 rounded-full blur-3xl" />
      </div>

      {/* Sticky Top Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">

          {/* Brand */}
          <div className="flex items-center space-x-3">
            <img
              src="/mpumuza-logo.jpg"
              alt="Mpumuza Analytics - School Report Management System"
              className="h-10 sm:h-12 w-auto object-contain rounded-xl shadow-xs"
            />
          </div>

          {/* Nav CTA */}
          <div className="flex items-center space-x-3">
            <button
              onClick={onGoToSignIn}
              className="bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-500 hover:to-green-600 text-white font-black px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center space-x-2 active:scale-95"
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
          <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-1.5 rounded-full text-xs font-extrabold shadow-sm">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Official UNEB PLE, UCE &amp; UACE National Grading Architecture</span>
          </div>

          {/* Headline */}
          <div className="max-w-4xl mx-auto space-y-5">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight font-outfit text-slate-900 leading-tight">
              The Smart Academic &amp; Report{' '}
              <span className="relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600">
                  Management System
                </span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full opacity-40" />
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
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black rounded-2xl shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all text-base flex items-center justify-center space-x-2.5 active:scale-95 group"
            >
              <span>Launch Portal Sign In</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onGoToSignIn}
              className="w-full sm:w-auto px-7 py-4 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 font-bold rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all text-sm flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
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
              <CheckCircle2 className="w-4 h-4 text-teal-500 shrink-0" />
              <span>O-Level (UCE Best 8 &amp; NCDC 20/80 AoI)</span>
            </div>
            <div className="flex items-center space-x-2 bg-white border border-slate-200 shadow-xs px-4 py-2 rounded-xl text-xs font-semibold text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
              <span>A-Level (UACE 20 Points Scale)</span>
            </div>
          </div>
        </section>

        {/* Feature Cards */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            <div className="group bg-white border border-slate-200 hover:border-emerald-300 p-6 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-all text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-outfit">Excel Bulk Mark Upload</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Download pre-structured templates, input scores offline, and parse hundreds of student marks in seconds with built-in validation.
              </p>
            </div>

            <div className="group bg-white border border-slate-200 hover:border-teal-300 p-6 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-all text-left">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600 transition-all">
                <Printer className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-outfit">Batch PDF Report Cards</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Generate A4 report cards with 1-click batch export, complete with digital stamps, teacher remarks, and class positions.
              </p>
            </div>

            <div className="group bg-white border border-slate-200 hover:border-green-300 p-6 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-all text-left">
              <div className="w-12 h-12 rounded-2xl bg-green-50 border border-green-200 text-green-700 flex items-center justify-center group-hover:bg-green-600 group-hover:text-white group-hover:border-green-600 transition-all">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-outfit">Fees Clearance Lock</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Automatically lock report cards for learners with outstanding fee balances until cleared by the bursar.
              </p>
            </div>

            <div className="group bg-white border border-slate-200 hover:border-emerald-300 p-6 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-all text-left">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-outfit">Multi-Role Access Control</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Separate portals for Super Admin, School Admin, Teachers, and Parents — each with scoped permissions.
              </p>
            </div>

            <div className="group bg-white border border-slate-200 hover:border-teal-300 p-6 rounded-3xl space-y-4 shadow-sm hover:shadow-md transition-all text-left">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white group-hover:border-teal-600 transition-all">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-outfit">Parent SMS Notifications</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Broadcast academic results and fee reminders via SMS to parents using GSM-7 optimized message templates.
              </p>
            </div>

            <div className="group bg-gradient-to-br from-emerald-600 to-green-700 border border-emerald-600 p-6 rounded-3xl space-y-4 shadow-md hover:shadow-lg hover:shadow-emerald-500/25 transition-all text-left">
              <div className="w-12 h-12 rounded-2xl bg-white/20 text-white flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white font-outfit">Instant UNEB Grading Engine</h3>
              <p className="text-sm text-emerald-100 leading-relaxed">
                Auto-calculates UNEB aggregates, divisions, subject grades, and rankings — PLE, UCE, and UACE all supported.
              </p>
              <button
                onClick={onGoToSignIn}
                className="inline-flex items-center space-x-1.5 text-xs font-black text-white hover:underline"
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


