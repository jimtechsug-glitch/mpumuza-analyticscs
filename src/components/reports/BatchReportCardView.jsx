import React, { useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { exportElementToPDF } from '../../utils/pdfExport';
import { Printer, Download, ArrowLeft } from 'lucide-react';
import ReportCardView from './ReportCardView';

export default function BatchReportCardView({ classId, term = 'COMBINED', onBack }) {
  const { students } = useAuth();
  const printRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0 });

  // Get all students for the selected class
  const classStudents = students.filter(s => s.classId === classId);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    if (!printRef.current) return;
    setIsExporting(true);
    setExportProgress({ current: 0, total: classStudents.length });
    try {
      const filename = `Batch_Report_Class_${classId}_${term}.pdf`;
      await exportElementToPDF(
        printRef.current,
        filename,
        (current, total) => setExportProgress({ current, total })
      );
    } catch (err) {
      console.error('Batch PDF Export Error:', err);
      alert('Failed to generate batch PDF. Please try again.');
    } finally {
      setIsExporting(false);
      setExportProgress({ current: 0, total: 0 });
    }
  };

  if (classStudents.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-600 mb-4">No students found for this class.</p>
        <button onClick={onBack} className="px-4 py-2 bg-slate-800 text-white rounded-xl">Go Back</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg print:hidden">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-300 hover:text-white px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboards</span>
        </button>

        <div className="flex items-center space-x-3">
          <button
            onClick={handlePrint}
            className="btn-amber bg-white text-slate-950 font-bold px-6 py-2.5 rounded-xl shadow hover:bg-slate-100 transition-all flex items-center space-x-2 text-sm"
          >
            <Printer className="w-4 h-4" />
            <span>Print All Reports</span>
          </button>
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-yellow-400 transition-all flex items-center space-x-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExporting ? (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>
              {isExporting
                ? exportProgress.total > 0
                  ? `Generating ${exportProgress.current} / ${exportProgress.total} Reports...`
                  : 'Generating Batch PDF...'
                : 'Download Batch PDF'
              }
            </span>
          </button>
        </div>
      </div>

      {/* Printable Area containing all report cards */}
      <div ref={printRef} className="bg-white print:bg-transparent">
        {classStudents.map((student, index) => (
          <div key={student.id} className={index > 0 ? "mt-12 pt-12 border-t-2 border-slate-200 print:mt-0 print:pt-0 print:border-none print:break-before-page" : ""}>
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
