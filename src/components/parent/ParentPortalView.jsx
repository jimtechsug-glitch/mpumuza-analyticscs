import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import ReportCardView from '../reports/ReportCardView';
import { ShieldAlert, CheckCircle2, Lock, DollarSign, Calendar, LogOut, Download, Award, MessageCircle, PhoneCall, CreditCard, ChevronRight } from 'lucide-react';

export default function ParentPortalView() {
  const { currentUser, currentSchool, students, logout } = useAuth();
  const [selectedTerm, setSelectedTerm] = useState('COMBINED');

  const student = students.find(s => s.id === currentUser?.studentId);

  if (!student) {
    return (
      <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 max-w-lg mx-auto mt-12">
        <ShieldAlert className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800">No Student Profile Found</h3>
        <p className="text-xs text-slate-500 mt-1">We could not match this session with an active student record. Please verify your LIN and PIN.</p>
        <button onClick={logout} className="mt-5 px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-sm hover:bg-emerald-700 transition-colors">
          Back to Login
        </button>
      </div>
    );
  }

  const isCleared = student.feeBalanceUGX <= 0 || student.feeOverride;
  const feeRequired = Number(student.feeRequiredUGX || 1200000);
  const feePaid = Number(student.feePaidUGX || 0);
  const feeBalance = Number(student.feeBalanceUGX || 0);

  const handleShareWhatsApp = () => {
    const parentPhone = (student.parentPhone || student.parentContact || '').replace(/[^0-9+]/g, '');
    const schoolName = currentSchool?.name || 'Mpumuza Analytics';
    const balanceText = feeBalance > 0
      ? `Outstanding Fees: UGX ${feeBalance.toLocaleString()}`
      : 'Fees Status: Fully Cleared';

    const portalUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/p/${student.lin}`
      : `https://mpumuza.ac.ug/p/${student.lin}`;

    const text = `*${schoolName} — Parent Portal*
━━━━━━━━━━━━━━━━━
Student: *${student.name}* (LIN: ${student.lin})
${balanceText}
Next Term Opens: 14/09/2026

Digital Report Card:
${portalUrl}`;

    const encoded = encodeURIComponent(text);
    const waUrl = parentPhone
      ? `https://wa.me/${parentPhone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;

    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-8 text-left max-w-5xl mx-auto py-6 px-4">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-blue-800 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div>
            <span className="bg-white/20 text-white border border-white/30 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider backdrop-blur-sm">
              Parent &amp; Student Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit mt-2">
              {currentSchool?.name}
            </h1>
            <p className="text-sky-100 text-xs sm:text-sm mt-1">
              Online Term Performance Report Card &amp; School Pay Clearance
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareWhatsApp}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Share WhatsApp</span>
            </button>
            <button
              onClick={logout}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 border border-slate-800 shrink-0"
            >
              <LogOut className="w-4 h-4 text-sky-400" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Student Profile & Quick Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Student Particulars */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Learner Profile</span>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 font-outfit">{student.name}</h3>
            <span className="font-mono text-emerald-800 font-bold text-xs">LIN: {student.lin}</span>
          </div>
          <div className="text-xs text-slate-600 pt-2 border-t border-slate-200 space-y-1.5">
            <div className="flex justify-between"><span className="text-slate-400">Stream:</span> <span className="font-bold text-slate-800">{student.stream || 'A'}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Gender:</span> <span className="font-bold text-slate-800">{student.gender === 'M' ? 'Male' : 'Female'}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">House:</span> <span className="font-bold text-slate-800">{student.house || 'General'}</span></div>
          </div>
        </div>

        {/* Financial Status Card */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Fees &amp; Dues Status</span>
            <div className={`p-2 rounded-xl border ${
              isCleared ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'
            }`}>
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className={`text-2xl font-black font-outfit ${feeBalance <= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              UGX {feeBalance.toLocaleString()}
            </div>
            <span className="text-xs text-slate-500">{feeBalance <= 0 ? 'Fully Cleared' : 'Outstanding Balance'}</span>
          </div>

          <div className="pt-2 border-t border-slate-200 text-xs space-y-1 text-slate-600">
            <div className="flex justify-between">
              <span>Required:</span>
              <span className="font-mono font-bold">UGX {feeRequired.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Paid to Date:</span>
              <span className="font-mono font-bold text-emerald-700">UGX {feePaid.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Attendance Metric */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Term Attendance</span>
            <div className="p-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="text-2xl font-black text-slate-900 font-outfit">
              {student.daysPresent || 90} / {student.totalSchoolDays || 90}
            </div>
            <span className="text-xs text-slate-500">School Days Attended</span>
          </div>

          <div className="pt-2 border-t border-slate-200 text-xs font-semibold text-blue-700">
            {(((student.daysPresent || 90) / (student.totalSchoolDays || 90)) * 100).toFixed(1)}% Regularity Rate
          </div>
        </div>

      </div>

      {/* School Pay Payment Instructions Box (If balance remains) */}
      {!isCleared && (
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-50/60 border border-emerald-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center space-x-2 text-emerald-950 font-bold text-sm">
            <CreditCard className="w-4 h-4 text-emerald-700" />
            <span>School Pay &amp; Mobile Money Payment Guidelines</span>
          </div>
          <p className="text-xs text-emerald-950">
            To clear outstanding fees, pay using <strong>SchoolPay</strong>, <strong>MTN MoMo (*165#)</strong> or <strong>Airtel Money (*185#)</strong> using student payment code: <strong className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-950 font-bold">{student.lin.replace(/[^0-9]/g, '') || '987654'}</strong>.
          </p>
        </div>
      )}

      {/* Report Card Viewing Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-outfit">Official Published Report Card</h3>
            <p className="text-xs text-slate-500">End of Term Performance Report &amp; UNEB Assessment</p>
          </div>

          {/* Interactive Term Selection Buttons */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {['BOT', 'MOT', 'EOT', 'COMBINED'].map(t => (
              <button
                key={t}
                onClick={() => setSelectedTerm(t)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  selectedTerm === t
                    ? 'bg-emerald-600 text-white shadow-xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {!isCleared ? (
          <div className="p-10 text-center bg-rose-50 border-2 border-rose-200 rounded-2xl space-y-4">
            <div className="h-16 w-16 bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center mx-auto border border-rose-300">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xl font-extrabold text-rose-900 font-outfit">Report Card Access Restricted</h4>
              <p className="text-xs text-rose-700 max-w-lg mx-auto mt-1 font-medium">
                Full report card details for {student.name} are locked due to an outstanding fee balance of <strong className="font-bold">UGX {feeBalance.toLocaleString()}</strong>.
              </p>
            </div>
            <p className="text-xs text-slate-600 italic">
              Please contact the school bursar or complete payment using the instructions above to unlock full access.
            </p>
          </div>
        ) : (
          <ReportCardView
            studentId={student.id}
            term={selectedTerm}
            onBack={() => {}}
          />
        )}

      </div>

    </div>
  );
}

