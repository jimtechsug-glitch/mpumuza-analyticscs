import React, { useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { exportElementToPDF } from '../../utils/pdfExport';
import { Printer, Download, ArrowLeft, Users, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import ReportCardView from './ReportCardView';

export default function BatchReportCardView({ classId, term = 'COMBINED', onBack }) {
  const { students } = useAuth();
  const printRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0 });
  const [exportDone, setExportDone] = useState(false);

  // Get all students for the selected class
  const classStudents = students.filter(s => s.classId === classId);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    if (!printRef.current || isExporting) return;
    setIsExporting(true);
    setExportDone(false);
    setExportProgress({ current: 0, total: classStudents.length });
    try {
      const filename = `Batch_Report_Class_${classId}_${term}.pdf`;
      await exportElementToPDF(
        printRef.current,
        filename,
        (current, total) => setExportProgress({ current, total })
      );
      setExportDone(true);
      setTimeout(() => setExportDone(false), 4000);
    } catch (err) {
      console.error('Batch PDF Export Error:', err);
      alert('Failed to generate batch PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (classStudents.length === 0) {
    return (
      <div className="p-10 text-center space-y-4 bg-white rounded-2xl border border-slate-200">
        <div className="flex items-center justify-center w-16 h-16 bg-slate-100 rounded-2xl mx-auto">
          <Users className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-slate-700 font-bold text-lg">No Students Found</p>
        <p className="text-slate-500 text-sm">No students are enrolled in this class yet.</p>
        <button
          onClick={onBack}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Sticky Top Action Bar */}
      <div className="sticky top-0 z-20 print:hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-slate-900 border border-slate-800 p-3.5 sm:p-4 rounded-2xl shadow-xl gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-slate-300 hover:text-white px-3.5 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold transition-colors shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <div>
              <div className="text-white font-bold text-sm font-outfit">
                Batch Reports — Class {classId}
              </div>
              <div className="text-slate-400 text-xs">
                {classStudents.length} student{classStudents.length !== 1 ? 's' : ''} · Term: {term}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Done Banner */}
            {exportDone && (
              <div className="flex items-center space-x-1.5 text-emerald-400 text-xs font-bold bg-emerald-900/30 border border-emerald-800 px-3 py-2 rounded-xl shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>PDF Downloaded!</span>
              </div>
            )}

            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none btn-amber bg-white text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow hover:bg-slate-100 transition-all flex items-center justify-center space-x-2 text-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print All</span>
            </button>

            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex-1 sm:flex-none bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-yellow-400 transition-all flex items-center justify-center space-x-2 text-xs disabled:opacity-60 disabled:cursor-not-allowed min-w-[160px]"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {exportProgress.total > 0
                      ? `${exportProgress.current} / ${exportProgress.total} Reports`
                      : 'Generating PDF...'}
                  </span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Download PDF ({classStudents.length})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Export Progress Bar */}
        {isExporting && exportProgress.total > 0 && (
          <div className="mt-2 bg-slate-800 rounded-xl overflow-hidden h-1.5">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-300"
              style={{ width: `${(exportProgress.current / exportProgress.total) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Report Count Badge */}
      <div className="print:hidden flex items-center space-x-2 px-1">
        <div className="flex items-center space-x-2 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-xl text-xs font-bold">
          <Users className="w-3.5 h-3.5" />
          <span>{classStudents.length} Report Cards Ready for Print / Export</span>
        </div>
        <div className="text-xs text-slate-400 font-medium">
          Print optimized for A4 · Each report on separate page
        </div>
      </div>

      {/* Printable Area */}
      <div ref={printRef} className="bg-white print:bg-transparent">
        {classStudents.map((student, index) => (
          <div
            key={student.id}
            className={index > 0 ? 'mt-12 pt-12 border-t-2 border-slate-200 print:mt-0 print:pt-0 print:border-none print:break-before-page' : ''}
          >
            <ReportCardView
              studentId={student.id}
              term={term}
              onBack={onBack}
              isBatchMode={true}
            />
          </div>
        ))}
      </div>

    </div>
  );
}

