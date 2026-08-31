import React, { useRef, useState, useLayoutEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { exportElementToPDF } from '../../utils/pdfExport';
import {
  getPrimaryGrade,
  calculatePrimaryDivision,
  getOLevelClassicGrade,
  calculateOLevelClassicDivision,
  getOLevelNewCurriculumGrade,
  calculateOLevelLSCResult,
  getALevelSubjectGrade,
  calculateALevelPoints,
  calculateWeightedFinalScore,
  calculateNCDCContinuousAssessment
} from '../../utils/unebGrading';
import { Printer, Download, ArrowLeft, User, MessageCircle, Share2 } from 'lucide-react';

/**
 * A4ViewportScaler
 * Wraps the fixed-size 794×1123 A4 shell and applies a CSS scale() transform
 * so the card always fits within the available viewport width.
 * The outer container height is kept in sync so nothing overlaps below.
 */
function A4ViewportScaler({ a4Width, a4Height, children }) {
  const outerRef = React.useRef(null);
  const [vpScale, setVpScale] = React.useState(1);

  React.useLayoutEffect(() => {
    if (!outerRef.current) return;
    const calc = () => {
      const avail = outerRef.current.getBoundingClientRect().width || outerRef.current.offsetWidth;
      if (!avail) return;
      const s = Math.min(1, avail / a4Width);
      setVpScale(s);
    };
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(outerRef.current);
    return () => ro.disconnect();
  }, [a4Width]);

  return (
    <div
      ref={outerRef}
      style={{
        width: '100%',
        // Reserve the exact scaled height so the page doesn't collapse
        height: `${Math.round(a4Height * vpScale)}px`,
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          transformOrigin: 'top center',
          transform: `scale(${vpScale})`,
          width: `${a4Width}px`,
          height: `${a4Height}px`,
          flexShrink: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function ReportCardView({ studentId, term: initialTerm = 'COMBINED', onBack, isBatchMode = false }) {
  const { currentSchool, students, classes, subjects, marks, users } = useAuth();

  // Guard: school data may not have loaded yet
  if (!currentSchool) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-slate-400">
          <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  // All teachers for this school, indexed for quick lookup by subjectId
  const schoolTeachers = (users || []).filter(u => u.schoolId === currentSchool.id && u.role === 'TEACHER');
  const getTeacherForSubject = (subjectId) => {
    return schoolTeachers.find(t =>
      Array.isArray(t.assignedSubjects) && t.assignedSubjects.includes(subjectId)
    ) || null;
  };

  const printRef = useRef(null);   // outer A4 shell — captured for PDF
  const innerRef = useRef(null);   // inner content — measured for scaling
  const [selectedTerm, setSelectedTerm] = useState(initialTerm || 'COMBINED');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState({ current: 0, total: 0 });
  const [contentScale, setContentScale] = useState(1);

  // A4 shell dimensions (96 dpi)
  const A4_W = 794;
  const A4_H = 1123;

  const student = students.find(s => s.id === studentId);
  const studentClass = classes.find(c => c.id === student?.classId);

  if (!student) {
    return (
      <div className="p-8 text-center text-slate-400 bg-slate-900 rounded-2xl">
        <p>Student record not found.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-xl">Go Back</button>
      </div>
    );
  }

  // 1. Level Determination
  const classNameLower = (studentClass?.name || '').toLowerCase();
  const isALevelStudent = studentClass?.level === 'A-Level' ||
    ['s.5', 's.6', 'senior 5', 'senior 6', 'a-level'].some(lvl => classNameLower.includes(lvl));

  const isPrimaryStudent = currentSchool?.levelType === 'PRIMARY' ||
    studentClass?.level === 'Primary' ||
    ['p.1', 'p.2', 'p.3', 'p.4', 'p.5', 'p.6', 'p.7', 'primary'].some(lvl => classNameLower.includes(lvl));

  const isOLevelStudent = !isALevelStudent && !isPrimaryStudent;

  // 2. Student Marks
  const studentMarks = marks.filter(m => m.studentId === student.id);

  // Helper functions to identify GP and Submath
  const isGeneralPaper = (sub) => {
    const n = (sub?.name || '').toLowerCase();
    const c = (sub?.code || '').toLowerCase();
    return n.includes('general paper') || n.includes('gp') || c === 's101' || c === 'gp';
  };

  const isSubmath = (sub) => {
    const n = (sub?.name || '').toLowerCase();
    const c = (sub?.code || '').toLowerCase();
    return n.includes('submath') || n.includes('sub math') || n.includes('subsidiary math') || n.includes('subsidiary mathematics') || c === 's475' || c === 'submath';
  };

  // 3. Strict Subject Filtering (O-Level vs A-Level vs Primary separation) & Level-Specific Ordering
  const relevantSubjects = subjects.filter(sub => {
    if (sub.schoolId !== currentSchool.id) return false;

    if (isPrimaryStudent) {
      if (!(sub.category === 'Primary' || (!sub.category && !sub.isSubsidiary && !sub.code?.startsWith('P')))) return false;
    } else if (isALevelStudent) {
      const isALvlCode = sub.code?.startsWith('P') || sub.code?.startsWith('S') || sub.code?.toLowerCase().startsWith('uace');
      if (!(sub.category === 'A-Level' || sub.isSubsidiary || isALvlCode)) return false;
    } else if (isOLevelStudent) {
      const isALvlCode = sub.code?.startsWith('P') || sub.code?.startsWith('S');
      const isExplicitALevel = sub.category === 'A-Level' || sub.isSubsidiary || isALvlCode;
      const isExplicitPrimary = sub.category === 'Primary';
      if (isExplicitALevel || isExplicitPrimary) return false;
    }

    return true;
  }).sort((a, b) => {
    if (isALevelStudent) {
      const isSubA = a.isSubsidiary || isGeneralPaper(a) || isSubmath(a);
      const isSubB = b.isSubsidiary || isGeneralPaper(b) || isSubmath(b);
      if (!isSubA && isSubB) return -1;
      if (isSubA && !isSubB) return 1;
      if (isSubA && isSubB) {
        if (isGeneralPaper(a)) return -1;
        if (isGeneralPaper(b)) return 1;
        if (isSubmath(a)) return -1;
        if (isSubmath(b)) return 1;
      }
      return (a.name || '').localeCompare(b.name || '');
    }
    if (isOLevelStudent) {
      const getSubjectRank = (sub) => {
        const nameLower = (sub.name || '').toLowerCase();
        const codeLower = (sub.code || '').toLowerCase();

        // 1. English Language
        if (nameLower.includes('english') || codeLower === '112' || codeLower === 'eng') {
          return 1;
        }
        // 2. Mathematics
        if (nameLower.includes('math') || codeLower === '456' || codeLower === 'mtc' || codeLower === 'mat') {
          return 2;
        }
        // 3. Other Compulsory / Core Subjects
        const isCompulsory = [
          'physics', 'chemistry', 'biology', 'geography', 'history'
        ].some(k => nameLower.includes(k)) || sub.core === true;

        if (isCompulsory) {
          return 3;
        }
        // 4. Elective Subjects
        return 4;
      };

      const rankA = getSubjectRank(a);
      const rankB = getSubjectRank(b);
      if (rankA !== rankB) return rankA - rankB;
      return (a.name || '').localeCompare(b.name || '');
    }
    return 0;
  });

  const subjectBreakdown = relevantSubjects.map(sub => {
    const markRec = studentMarks.find(m => m.subjectId === sub.id) || {};

    const bot = markRec.bot !== undefined && markRec.bot !== null && markRec.bot !== '' ? Number(markRec.bot) : null;
    const mot = markRec.mot !== undefined && markRec.mot !== null && markRec.mot !== '' ? Number(markRec.mot) : null;
    const eot = markRec.eot !== undefined && markRec.eot !== null && markRec.eot !== '' ? Number(markRec.eot) : null;

    const bot1 = markRec.bot1 !== undefined && markRec.bot1 !== null && markRec.bot1 !== '' ? Number(markRec.bot1) : bot;
    const bot2 = markRec.bot2 !== undefined && markRec.bot2 !== null && markRec.bot2 !== '' ? Number(markRec.bot2) : bot;
    const mot1 = markRec.mot1 !== undefined && markRec.mot1 !== null && markRec.mot1 !== '' ? Number(markRec.mot1) : mot;
    const mot2 = markRec.mot2 !== undefined && markRec.mot2 !== null && markRec.mot2 !== '' ? Number(markRec.mot2) : mot;
    const eot1 = markRec.eot1 !== undefined && markRec.eot1 !== null && markRec.eot1 !== '' ? Number(markRec.eot1) : eot;
    const eot2 = markRec.eot2 !== undefined && markRec.eot2 !== null && markRec.eot2 !== '' ? Number(markRec.eot2) : eot;

    // Determine Final Score based on student level and active selectedTerm filter
    let calculatedScore = null;
    let frmtScore = null;
    let examScore = null;

    if (isOLevelStudent) {
      // O-Level: Formative (20) + Exam (80) = Total (100)
      const aois = [markRec.aoi1, markRec.aoi2, markRec.aoi3].filter(v => v !== '' && v !== undefined && v !== null);
      if (aois.length > 0 || (markRec.summative !== undefined && markRec.summative !== null && markRec.summative !== '')) {
        const ncdc = calculateNCDCContinuousAssessment(aois, markRec.summative ?? eot, true);
        frmtScore = ncdc.formative20Score;
        examScore = ncdc.summative80Score;
        calculatedScore = ncdc.compositeScore100;
      } else {
        // Raw formative component:
        let rawFrmt = null;
        if (selectedTerm === 'BOT') {
          rawFrmt = bot;
        } else if (selectedTerm === 'MOT') {
          rawFrmt = mot !== null ? mot : bot;
        } else {
          // COMBINED / EOT
          if (bot !== null && mot !== null) {
            rawFrmt = (bot + mot) / 2;
          } else {
            rawFrmt = bot !== null ? bot : mot;
          }
        }

        if (rawFrmt !== null) {
          frmtScore = rawFrmt <= 20 ? Math.round(rawFrmt * 10) / 10 : Math.round((rawFrmt * 0.20) * 10) / 10;
        }

        // Raw exam component (80%):
        let rawExam = (selectedTerm === 'BOT' || selectedTerm === 'MOT') ? null : eot;
        if (rawExam !== null) {
          examScore = rawExam <= 80 && markRec.isRaw80 ? Math.round(rawExam * 10) / 10 : Math.round((rawExam * 0.80) * 10) / 10;
        }

        if (frmtScore !== null && examScore !== null) {
          calculatedScore = Math.round((frmtScore + examScore) * 10) / 10;
        } else if (examScore !== null) {
          calculatedScore = rawExam !== null ? Math.round(rawExam * 10) / 10 : Math.round(((examScore / 80) * 100) * 10) / 10;
        } else if (frmtScore !== null) {
          calculatedScore = rawFrmt !== null && rawFrmt > 20 ? Math.round(rawFrmt * 10) / 10 : Math.round(((frmtScore / 20) * 100) * 10) / 10;
        }
      }
    } else {
      // Primary & A-Level: Weighted BOT/MOT/EOT
      if (selectedTerm === 'BOT') {
        calculatedScore = bot;
      } else if (selectedTerm === 'MOT') {
        calculatedScore = mot;
      } else if (selectedTerm === 'EOT') {
        calculatedScore = eot;
      } else {
        // COMBINED (weighted)
        calculatedScore = calculateWeightedFinalScore(bot, mot, eot, {
          bot: currentSchool.botWeight || 20,
          mot: currentSchool.motWeight || 20,
          eot: currentSchool.eotWeight || 60
        });
      }
    }

    let gradeObj = {
      grade: '-',
      aggregate: 9,
      points: 0,
      descriptorScore: '-',
      descriptor: 'No Mark',
      remark: 'No Mark'
    };

    if (calculatedScore !== null) {
      if (isPrimaryStudent) {
        const pGrade = getPrimaryGrade(calculatedScore);
        gradeObj = { ...pGrade, descriptorScore: '-', points: 0 };
      } else if (isALevelStudent) {
        const isSub = sub.isSubsidiary || isGeneralPaper(sub) || isSubmath(sub) || (sub.name && sub.name.toLowerCase().includes('subsidiary'));
        const aGrade = getALevelSubjectGrade(calculatedScore, isSub);
        gradeObj = {
          ...aGrade,
          descriptorScore: '-',
          aggregate: 9,
          descriptor: aGrade.remark || 'Pass',
          remark: aGrade.remark || 'Pass'
        };
      } else {
        // O-Level: Use New LSC (Lower Secondary Curriculum) Competency System
        const lscGrade = getOLevelNewCurriculumGrade(calculatedScore);
        gradeObj = {
          grade: lscGrade.grade,
          aggregate: lscGrade.descriptorScore,
          descriptorScore: lscGrade.descriptorScore,
          descriptor: lscGrade.descriptor,
          points: 0,
          remark: lscGrade.descriptor
        };
      }
    }

    // Brief concise remarks (Outstanding, Moderate, Basic, etc.) without elaborations
    const briefRemark = gradeObj.descriptor !== 'No Mark'
      ? gradeObj.descriptor
      : (gradeObj.remark !== 'No Mark' ? gradeObj.remark : '-');

    return {
      subject: sub,
      bot,
      mot,
      eot,
      bot1,
      bot2,
      mot1,
      mot2,
      eot1,
      eot2,
      frmtScore,
      examScore,
      finalScore: calculatedScore,
      grade: gradeObj.grade,
      aggregate: gradeObj.aggregate,
      descriptorScore: gradeObj.descriptorScore,
      descriptor: gradeObj.descriptor,
      points: gradeObj.points,
      remark: briefRemark
    };
  });

  // 4. Overall Division / LSC Competency Summary
  let summaryObj = {
    totalAggregate: 0,
    division: 'N/A',
    summaryText: 'N/A',
    lscResult: null,
    totalPoints: 0
  };

  if (isPrimaryStudent) {
    const coreItems = subjectBreakdown.map(i => ({
      subjectCode: i.subject.code,
      subjectName: i.subject.name,
      aggregate: i.aggregate
    }));
    const divResult = calculatePrimaryDivision(coreItems);
    summaryObj = {
      totalAggregate: divResult.totalAggregate,
      division: divResult.division,
      summaryText: divResult.summary
    };
  } else if (isALevelStudent) {
    const aItems = subjectBreakdown.map(i => ({
      subjectName: i.subject.name,
      code: i.subject.code,
      grade: i.grade,
      points: i.points,
      finalScore: i.finalScore,
      isSubsidiary: i.subject.isSubsidiary || isGeneralPaper(i.subject) || isSubmath(i.subject)
    }));
    const ptsResult = calculateALevelPoints(aItems);
    summaryObj = {
      totalPoints: ptsResult.totalPoints,
      division: `${ptsResult.principalPasses} Principal Pass${ptsResult.principalPasses === 1 ? '' : 'es'}`,
      summaryText: ptsResult.summary
    };
  } else {
    // O-Level: Grade using New LSC (Competency) System
    const lscItems = subjectBreakdown.map(i => ({
      grade: i.grade,
      descriptorScore: i.descriptorScore,
      descriptor: i.descriptor
    }));
    const lscResult = calculateOLevelLSCResult(lscItems);
    summaryObj = {
      totalAggregate: lscResult.averageScore3,
      division: lscResult.summary,
      summaryText: `Overall Competence: ${lscResult.descriptor} (Grade ${lscResult.overallGrade})`,
      lscResult
    };
  }

  // Calculate Overall Average Percentage
  const validScores = subjectBreakdown.filter(i => i.finalScore !== null).map(i => i.finalScore);
  const overallAvg = validScores.length > 0
    ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1)
    : '0.0';

  // 5. Position in Stream & Class Calculations (Toggleable via School Admin Settings)
  const showPositionRanking = currentSchool?.showPositionRanking === true || currentSchool?.showPositionRanking === undefined;

  const getOrdinal = (n) => {
    if (!n || isNaN(n)) return '-';
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const classStudents = (students || []).filter(s => s.classId === student.classId && s.schoolId === currentSchool.id);
  const streamStudents = classStudents.filter(s => s.stream === student.stream);

  const getStudentTermAverage = (stdId) => {
    const stdMarks = (marks || []).filter(m => m.studentId === stdId);
    const scores = stdMarks.map(m => {
      const b = m.bot !== undefined && m.bot !== null && m.bot !== '' ? Number(m.bot) : null;
      const mo = m.mot !== undefined && m.mot !== null && m.mot !== '' ? Number(m.mot) : null;
      const e = m.eot !== undefined && m.eot !== null && m.eot !== '' ? Number(m.eot) : null;
      if (selectedTerm === 'BOT') return b;
      if (selectedTerm === 'MOT') return mo;
      if (selectedTerm === 'EOT') return e;
      return calculateWeightedFinalScore(b, mo, e, {
        bot: currentSchool.botWeight || 20,
        mot: currentSchool.motWeight || 20,
        eot: currentSchool.eotWeight || 60,
      });
    }).filter(sc => sc !== null && !isNaN(sc));

    if (scores.length === 0) return 0;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  };

  const rankedClassStudents = [...classStudents].sort((a, b) => getStudentTermAverage(b.id) - getStudentTermAverage(a.id));
  const rankedStreamStudents = [...streamStudents].sort((a, b) => getStudentTermAverage(b.id) - getStudentTermAverage(a.id));

  const classRankIdx = rankedClassStudents.findIndex(s => s.id === student.id);
  const streamRankIdx = rankedStreamStudents.findIndex(s => s.id === student.id);

  const classPositionText = classRankIdx !== -1
    ? `${getOrdinal(classRankIdx + 1)} of ${rankedClassStudents.length}`
    : '-';
  const streamPositionText = streamRankIdx !== -1
    ? `${getOrdinal(streamRankIdx + 1)} of ${rankedStreamStudents.length}`
    : '-';

  const particularsColsCount = 5 + (showPositionRanking ? 2 : 0) + (isALevelStudent ? 1 : 0);

  // Automatically compute scale factor to guarantee the report card fits on exactly one A4 page
  useLayoutEffect(() => {
    if (!innerRef.current) return;
    const compute = () => {
      const ch = innerRef.current.scrollHeight || innerRef.current.offsetHeight;
      if (!ch) return;
      if (ch > A4_H) {
        // Shrink slightly so all padding and borders fit comfortably within A4
        const sy = (A4_H - 10) / ch;
        setContentScale(Math.min(sy, 1));
      } else {
        setContentScale(1);
      }
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(innerRef.current);
    return () => ro.disconnect();
  }, [selectedTerm, subjectBreakdown.length]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    if (!printRef.current) return;
    setIsExporting(true);
    setExportProgress({ current: 0, total: 1 });
    try {
      const filename = `${student.name.replace(/\s+/g, '_')}_${selectedTerm}_Report_Card.pdf`;
      await exportElementToPDF(
        printRef.current,
        filename,
        (current, total) => setExportProgress({ current, total })
      );
    } catch (err) {
      console.error('PDF Export Error:', err);
    } finally {
      setIsExporting(false);
      setExportProgress({ current: 0, total: 0 });
    }
  };

  const handleShareWhatsApp = () => {
    const parentPhone = (student.parentPhone || student.parentContact || '').replace(/[^0-9+]/g, '');
    const schoolName = currentSchool?.name || 'Mpumuza Analytics';
    const feeBal = Number(student.feesBalance || 0);
    const balanceText = feeBal > 0
      ? `Outstanding Fees: UGX ${feeBal.toLocaleString()}`
      : 'Fees Status: Fully Cleared';

    const portalUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/p/${student.lin}`
      : `https://mpumuza.ac.ug/p/${student.lin}`;

    const text = `*${schoolName}*
━━━━━━━━━━━━━━━━━
Dear Parent/Guardian,
Official Term Performance Report for *${student.name}* (LIN: ${student.lin}) is now available.

📊 *Class:* ${studentClass?.name || 'General'}
📜 *Result:* ${summaryResult.summary || summaryResult.division || 'Graded'}
💰 *${balanceText}*
📅 *Next Term Commences:* 14/09/2026

🔗 *View Full Digital Report Card:*
${portalUrl}

_Powered by Mpumuza Analytics Platform_`;

    const encoded = encodeURIComponent(text);
    const waUrl = parentPhone
      ? `https://wa.me/${parentPhone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;

    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  // Helper to clean subject name by stripping any level tags like (O-Level), (Principal A-Level), etc.
  const cleanSubjectTitle = (name) => {
    if (!name) return '';
    return name
      .replace(/\s*\((?:Principal\s+)?A-Level\)/gi, '')
      .replace(/\s*\((?:Principal\s+)?O-Level\)/gi, '')
      .replace(/\s*\(Primary\)/gi, '')
      .replace(/\s*\(A\s*level\)/gi, '')
      .replace(/\s*\(O\s*level\)/gi, '')
      .replace(/\s*\(PLE\)/gi, '')
      .replace(/\s*\(UCE\)/gi, '')
      .replace(/\s*\(UACE\)/gi, '')
      .replace(/\s*\(A-Level\s+GP\)/gi, '')
      .replace(/\s*\(A-Level\)/gi, '')
      .trim();
  };

  const getTermBadgeText = () => {
    switch (selectedTerm) {
      case 'BOT': return 'BEGINNING OF TERM (BOT) REPORT CARD - 2026';
      case 'MOT': return 'MID OF TERM (MOT) REPORT CARD - 2026';
      case 'EOT': return 'END OF TERM (EOT) REPORT CARD - 2026';
      default: return 'FULL TERM PERFORMANCE REPORT CARD - 2026';
    }
  };

  return (
    <div className="space-y-4 flex flex-col items-center">

      {/* Top Action Bar & Interactive Term Switcher (Screen Only) */}
      {!isBatchMode && (
        <div className="w-full max-w-[794px] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-2xl shadow-lg print:hidden">
          <button
            onClick={onBack}
            className="flex items-center space-x-1.5 text-slate-300 hover:text-white px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Roster</span>
          </button>

          {/* Term Filter Pills */}
          <div className="flex items-center space-x-1 bg-slate-800/90 p-1 rounded-xl border border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 px-1.5 uppercase">Term:</span>
            {['BOT', 'MOT', 'EOT', 'COMBINED'].map(t => (
              <button
                key={t}
                onClick={() => setSelectedTerm(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${selectedTerm === t
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
                  }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleShareWhatsApp}
              title="Share report summary and portal link directly via WhatsApp to parent"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl shadow transition-all flex items-center space-x-1.5 text-xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={handlePrint}
              className="bg-white text-slate-950 font-bold px-3.5 py-1.5 rounded-xl shadow hover:bg-slate-100 transition-all flex items-center space-x-1.5 text-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isExporting}
              className="bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold px-4 py-1.5 rounded-xl shadow-md hover:from-amber-400 hover:to-yellow-400 transition-all flex items-center space-x-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>
                {isExporting
                  ? exportProgress.total > 1
                    ? `Generating ${exportProgress.current}/${exportProgress.total}...`
                    : 'Generating PDF...'
                  : 'Download PDF'
                }
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ── Responsive viewport scaler — keeps the 794px card centred on any screen ── */}
      <A4ViewportScaler a4Width={A4_W} a4Height={A4_H}>
        {/* ── A4 Shell: fixed 794 × 1123 px — exactly one A4 portrait page ── */}
        <div
          ref={printRef}
          className="print-container"
          style={{
            position: 'relative',
            width: `${A4_W}px`,
            height: `${A4_H}px`,
            overflow: 'hidden',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
            border: '1px solid #cbd5e1',
            boxSizing: 'border-box',
            flexShrink: 0,
          }}
        >
          {/* ── Scaled content wrapper ── */}
          {/* The inner div renders at natural width; transform:scale() shrinks it to fit A4 */}
          <div
            ref={innerRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${A4_W}px`,          // constrain layout width to A4
              transformOrigin: 'top left',
              transform: `scale(${contentScale})`,
              zIndex: 1,
            }}
          >
            {/* Washed-out Centered School Logo Watermark Overlay */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '420px',
                height: '420px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                userSelect: 'none',
                zIndex: 25,
                opacity: 0.13,
                mixBlendMode: 'multiply',
                overflow: 'hidden',
              }}
            >
              <img
                src={currentSchool?.badgeUrl || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=200&q=80'}
                crossOrigin="anonymous"
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  filter: 'grayscale(0.15)',
                  pointerEvents: 'none',
                }}
              />
            </div>

            {/* Content Body */}
            <div style={{ padding: '18px 22px' }} className="space-y-2.5 text-slate-900">

              {/* School Official Header */}
              <div className="border-b-2 border-amber-600 pb-2" style={{ borderBottom: '2.5px solid #0859d3cb', paddingBottom: '8px' }}>
                <div className="flex items-center justify-between gap-3" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>

                  {/* School Badge */}
                  <div
                    className="h-20 w-20 rounded-xl bg-amber-50 border-2 border-amber-600/30 p-1 flex items-center justify-center shrink-0 shadow-xs"
                    style={{ width: '82px', height: '82px', borderRadius: '12px', backgroundColor: '#fffbeb', border: '2px solid rgba(217, 119, 6, 0.3)', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                  >
                    <img
                      src={currentSchool?.badgeUrl || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=200&q=80'}
                      crossOrigin="anonymous"
                      alt="School Badge"
                      className="h-full w-full object-cover rounded-lg"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=200&q=80'; }}
                    />
                  </div>

                  {/* School Info */}
                  <div className="text-center flex-1" style={{ textAlign: 'center', flex: '1 1 0%' }}>
                    <h1 className="text-2xl font-black uppercase text-slate-900 tracking-tight font-outfit leading-tight" style={{ fontSize: '22px', fontWeight: 900, textTransform: 'uppercase', color: '#093499ff', margin: 0, letterSpacing: '-0.02em' }}>
                      {currentSchool?.name}
                    </h1>
                    <p className="text-sm font-bold italic text-amber-700 mt-0.5" style={{ fontSize: '13px', fontWeight: 700, fontStyle: 'italic', color: '#b45309', marginTop: '2px', marginBottom: '2px' }}>
                      "{currentSchool?.motto || 'Education for Light, Faith and Character'}"
                    </p>
                    <p className="text-xs text-slate-600 font-medium" style={{ fontSize: '11.5px', color: '#475569', margin: 0, fontWeight: 600 }}>
                      {currentSchool?.address} &bull; Tel: {currentSchool?.contactPhone}
                    </p>
                    <div
                      className="mt-1 inline-block bg-slate-900 text-amber-400 font-extrabold px-3.5 py-0.5 rounded-full text-xs uppercase tracking-wider border border-amber-500/40 shadow-xs"
                      style={{ marginTop: '5px', display: 'inline-block', backgroundColor: '#0f172a', color: '#fbbf24', fontWeight: 800, padding: '3px 14px', borderRadius: '9999px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid rgba(245, 158, 11, 0.4)' }}
                    >
                      {getTermBadgeText()}
                    </div>
                  </div>

                  {/* Student Passport Photo */}
                  <div className="shrink-0 flex flex-col items-center" style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div
                      className="rounded-lg border-2 border-slate-300 bg-slate-100 p-0.5 shadow-xs overflow-hidden flex flex-col items-center justify-center relative"
                      style={{ width: '74px', height: '88px', borderRadius: '8px', border: '2px solid #cbd5e1', backgroundColor: '#f1f5f9', padding: '2px', overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {student.photoUrl || student.passportPhoto ? (
                        <img
                          src={student.photoUrl || student.passportPhoto}
                          crossOrigin="anonymous"
                          alt={student.name}
                          className="h-full w-full object-cover rounded-md"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }}
                        />
                      ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-0.5 text-center" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', color: '#94a3b8' }}>
                          <User className="w-8 h-8 text-slate-300 mb-0.5" style={{ width: '32px', height: '32px', color: '#cbd5e1' }} />
                          <span className="text-[8px] font-black uppercase text-slate-400 tracking-wider" style={{ fontSize: '8px', fontWeight: 900, textTransform: 'uppercase', color: '#94a3b8', letterSpacing: '0.05em' }}>
                            PASSPORT
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-[9.5px] font-black text-amber-800 uppercase mt-0.5 tracking-tight" style={{ fontSize: '9.5px', fontWeight: 900, color: '#92400e', textTransform: 'uppercase', marginTop: '3px' }}>
                      {isALevelStudent ? 'A-LEVEL' : isPrimaryStudent ? 'PLE PRIMARY' : 'O-LEVEL'}
                    </span>
                  </div>

                </div>
              </div>

              {/* Student Particulars Bar */}
              <div
                className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 gap-2"
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '10px',
                  padding: '8px 12px',
                  display: 'grid',
                  gridTemplateColumns: `3fr ${Array(particularsColsCount - 1).fill('1fr').join(' ')}`,
                  gap: '6px',
                  alignItems: 'start',
                }}
              >
                <div>
                  <span className="text-slate-500 block uppercase font-bold text-[9.5px] tracking-wide" style={{ color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 700, fontSize: '9.5px' }}>Student's Name</span>
                  <span className="font-extrabold text-slate-900 text-[13.5px] block leading-tight" style={{ fontWeight: 800, color: '#0f172a', fontSize: '13.5px', display: 'block', lineHeight: '1.2', wordBreak: 'break-word' }}>{student.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-bold text-[9.5px] tracking-wide" style={{ color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 700, fontSize: '9.5px' }}>LIN / Reg No.</span>
                  <span className="font-bold font-mono text-amber-800 text-[12.5px]" style={{ fontWeight: 700, fontFamily: 'monospace', color: '#92400e', fontSize: '12.5px', display: 'block' }}>{student.lin || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-bold text-[9.5px] tracking-wide" style={{ color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 700, fontSize: '9.5px' }}>Class</span>
                  <span className="font-bold text-slate-900 text-[12.5px]" style={{ fontWeight: 700, color: '#0f172a', fontSize: '12.5px', display: 'block' }}>{studentClass?.name || 'Class'} ({student.stream})</span>
                </div>

                {showPositionRanking && (
                  <>
                    <div>
                      <span className="text-slate-500 block uppercase font-bold text-[9.5px] tracking-wide" style={{ color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 700, fontSize: '9.5px' }}>Stream Pos.</span>
                      <span className="font-black text-amber-800 text-[12.5px]" style={{ fontWeight: 900, color: '#92400e', fontSize: '12.5px', display: 'block' }}>{streamPositionText}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase font-bold text-[9.5px] tracking-wide" style={{ color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 700, fontSize: '9.5px' }}>Class Pos.</span>
                      <span className="font-black text-blue-900 text-[12.5px]" style={{ fontWeight: 900, color: '#1e3a8a', fontSize: '12.5px', display: 'block' }}>{classPositionText}</span>
                    </div>
                  </>
                )}

                <div>
                  <span className="text-slate-500 block uppercase font-bold text-[9.5px] tracking-wide" style={{ color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 700, fontSize: '9.5px' }}>Term</span>
                  <span className="font-extrabold text-amber-900 text-[12.5px]" style={{ fontWeight: 800, color: '#78350f', fontSize: '12.5px', display: 'block' }}>
                    {selectedTerm === 'COMBINED' ? 'Term 1' : `Term 1 (${selectedTerm})`}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block uppercase font-bold text-[9.5px] tracking-wide" style={{ color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 700, fontSize: '9.5px' }}>Year</span>
                  <span className="font-extrabold text-slate-900 text-[12.5px]" style={{ fontWeight: 800, color: '#0f172a', fontSize: '12.5px', display: 'block' }}>2026</span>
                </div>
                {isALevelStudent && (
                  <div>
                    <span className="text-slate-500 block uppercase font-bold text-[9.5px] tracking-wide" style={{ color: '#64748b', display: 'block', textTransform: 'uppercase', fontWeight: 700, fontSize: '9.5px' }}>Subject Combination</span>
                    <span className="font-black text-indigo-900 bg-indigo-100/80 px-1.5 py-0.5 rounded border border-indigo-200 inline-block font-mono text-[11px]" style={{ fontWeight: 900, color: '#312e81', backgroundColor: '#e0e7ff', padding: '2px 6px', borderRadius: '4px', border: '1px solid #c7d2fe', display: 'inline-block', fontFamily: 'monospace', fontSize: '11px' }}>
                      {student.combination || 'PCM / ICT'}
                    </span>
                  </div>
                )}

              </div>

              {/* Academic Marks Breakdown Table */}
              <div className="w-full" style={{ width: '100%' }}>
                <table className="w-full border-collapse border border-blue-950" style={{ width: '100%', borderCollapse: 'collapse', border: '1.5px solid #0f172a', fontSize: '12px' }}>
                  <thead>
                    {isALevelStudent ? (
                      <>
                        <tr className="bg-slate-900 text-white font-outfit uppercase" style={{ backgroundColor: '#0f172a', color: '#ffffff', textTransform: 'uppercase' }}>
                          <th rowSpan={2} className="border border-blue-900 py-1.5 px-2.5 text-left text-xs w-44" style={{ border: '1px solid #1e3a8a', padding: '6px 10px', textAlign: 'left', fontSize: '12px', width: '170px', fontFamily: "'Cambria Math', Cambria, Georgia, serif", letterSpacing: '0.02em' }}>
                            SUBJECT
                          </th>

                          {(selectedTerm === 'COMBINED' || selectedTerm === 'BOT') && (
                            <th colSpan={2} className={`border border-blue-900 py-1 px-1 text-center text-xs ${selectedTerm === 'BOT' ? 'bg-amber-600 text-white font-extrabold' : ''}`} style={{ border: '1px solid #1e3a8a', padding: '4px 6px', textAlign: 'center', fontSize: '11px', backgroundColor: selectedTerm === 'BOT' ? '#d97706' : '#1e293b' }}>
                              BOT ({currentSchool.botWeight || 20}%)
                            </th>
                          )}
                          {(selectedTerm === 'COMBINED' || selectedTerm === 'MOT') && (
                            <th colSpan={2} className={`border border-blue-900 py-1 px-1 text-center text-xs ${selectedTerm === 'MOT' ? 'bg-amber-600 text-white font-extrabold' : ''}`} style={{ border: '1px solid #1e3a8a', padding: '4px 6px', textAlign: 'center', fontSize: '11px', backgroundColor: selectedTerm === 'MOT' ? '#d97706' : '#1e293b' }}>
                              MOT ({currentSchool.motWeight || 20}%)
                            </th>
                          )}
                          {(selectedTerm === 'COMBINED' || selectedTerm === 'EOT') && (
                            <th colSpan={2} className={`border border-blue-900 py-1 px-1 text-center text-xs ${selectedTerm === 'EOT' ? 'bg-amber-600 text-white font-extrabold' : ''}`} style={{ border: '1px solid #1e3a8a', padding: '4px 6px', textAlign: 'center', fontSize: '11px', backgroundColor: selectedTerm === 'EOT' ? '#d97706' : '#1e293b' }}>
                              EOT ({currentSchool.eotWeight || 60}%)
                            </th>
                          )}

                          <th rowSpan={2} className="border border-blue-900 py-1.5 px-2 text-center w-16 bg-slate-800 text-amber-300 text-xs font-bold" style={{ border: '1px solid #1e3a8a', padding: '6px 8px', textAlign: 'center', width: '56px', backgroundColor: '#1e293b', color: '#fcd34d', fontSize: '11.5px' }}>
                            {selectedTerm === 'COMBINED' ? 'Final %' : `${selectedTerm} %`}
                          </th>

                          <th rowSpan={2} className="border border-blue-900 py-1.5 px-2 text-center w-14 text-xs" style={{ border: '1px solid #1e3a8a', padding: '6px 8px', textAlign: 'center', width: '56px', fontSize: '11.5px' }}>
                            UNEB Grade
                          </th>
                          <th rowSpan={2} className="border border-blue-900 py-1.5 px-2.5 text-left w-24 text-xs" style={{ border: '1px solid #1e3a8a', padding: '6px 10px', textAlign: 'left', width: '100px', fontSize: '11.5px' }}>Remarks</th>
                          <th rowSpan={2} className="border border-blue-900 py-1.5 px-2.5 text-left w-28 text-xs" style={{ border: '1px solid #1e3a8a', padding: '6px 10px', textAlign: 'left', width: '110px', fontSize: '11.5px' }}>Teacher</th>
                        </tr>
                        <tr className="bg-slate-800 text-slate-200 text-[11px] font-bold font-outfit uppercase" style={{ backgroundColor: '#1e293b', color: '#f8fafc' }}>
                          {(selectedTerm === 'COMBINED' || selectedTerm === 'BOT') && (
                            <>
                              <th className="border border-blue-900 py-1 px-1 text-center w-7 text-[11px]" style={{ border: '1px solid #1e3a8a', padding: '3px 2px', textAlign: 'center', width: '28px' }}>1</th>
                              <th className="border border-blue-900 py-1 px-1 text-center w-7 text-[11px]" style={{ border: '1px solid #1e3a8a', padding: '3px 2px', textAlign: 'center', width: '28px' }}>2</th>
                            </>
                          )}
                          {(selectedTerm === 'COMBINED' || selectedTerm === 'MOT') && (
                            <>
                              <th className="border border-blue-900 py-1 px-1 text-center w-7 text-[11px]" style={{ border: '1px solid #1e3a8a', padding: '3px 2px', textAlign: 'center', width: '28px' }}>1</th>
                              <th className="border border-blue-900 py-1 px-1 text-center w-7 text-[11px]" style={{ border: '1px solid #1e3a8a', padding: '3px 2px', textAlign: 'center', width: '28px' }}>2</th>
                            </>
                          )}
                          {(selectedTerm === 'COMBINED' || selectedTerm === 'EOT') && (
                            <>
                              <th className="border border-blue-900 py-1 px-1 text-center w-7 text-[11px]" style={{ border: '1px solid #1e3a8a', padding: '3px 2px', textAlign: 'center', width: '28px' }}>1</th>
                              <th className="border border-blue-900 py-1 px-1 text-center w-7 text-[11px]" style={{ border: '1px solid #1e3a8a', padding: '3px 2px', textAlign: 'center', width: '28px' }}>2</th>
                            </>
                          )}
                        </tr>
                      </>
                    ) : isOLevelStudent ? (
                      <tr className="bg-slate-900 text-white font-outfit uppercase" style={{ backgroundColor: '#0f172a', color: '#ffffff', textTransform: 'uppercase' }}>
                        <th className="border border-blue-900 py-1.5 px-2.5 text-left text-xs w-44" style={{ border: '1px solid #1e3a8a', padding: '6px 10px', textAlign: 'left', fontSize: '12px', width: '175px', fontFamily: "'Cambria Math', Cambria, Georgia, serif", letterSpacing: '0.02em' }}>
                          SUBJECT
                        </th>

                        <th className="border border-blue-900 py-1.5 px-2 text-center w-16 bg-indigo-950 text-indigo-200 text-xs font-bold" style={{ border: '1px solid #1e3a8a', padding: '6px 8px', textAlign: 'center', width: '64px', backgroundColor: '#1e1b4b', color: '#c7d2fe', fontSize: '11.5px' }}>
                          Score (3.0)
                        </th>

                        <th className="border border-blue-900 py-1.5 px-2 text-center w-16 bg-emerald-950 text-emerald-300 text-xs font-bold" style={{ border: '1px solid #1e3a8a', padding: '6px 8px', textAlign: 'center', width: '64px', backgroundColor: '#064e3b', color: '#6ee7b7', fontSize: '11.5px' }}>
                          FRMT (20)
                        </th>

                        <th className="border border-blue-900 py-1.5 px-2 text-center w-16 bg-blue-950 text-blue-300 text-xs font-bold" style={{ border: '1px solid #1e3a8a', padding: '6px 8px', textAlign: 'center', width: '64px', backgroundColor: '#172554', color: '#93c5fd', fontSize: '11.5px' }}>
                          Exam (80)
                        </th>

                        <th className="border border-blue-900 py-1.5 px-2 text-center w-16 bg-slate-800 text-amber-300 text-xs font-bold" style={{ border: '1px solid #1e3a8a', padding: '6px 8px', textAlign: 'center', width: '64px', backgroundColor: '#1e293b', color: '#fcd34d', fontSize: '11.5px' }}>
                          Total (100)
                        </th>

                        <th className="border border-blue-900 py-1.5 px-2 text-center w-16 text-xs" style={{ border: '1px solid #1e3a8a', padding: '6px 8px', textAlign: 'center', width: '64px', fontSize: '11.5px' }}>
                          LSC Grade
                        </th>
                        <th className="border border-blue-900 py-1.5 px-2.5 text-left w-24 text-xs" style={{ border: '1px solid #1e3a8a', padding: '6px 10px', textAlign: 'left', width: '100px', fontSize: '11.5px' }}>Remarks</th>
                        <th className="border border-blue-900 py-1.5 px-2.5 text-left w-28 text-xs" style={{ border: '1px solid #1e3a8a', padding: '6px 10px', textAlign: 'left', width: '115px', fontSize: '11.5px' }}>Teacher</th>
                      </tr>
                    ) : (
                      <tr className="bg-slate-900 text-white font-outfit uppercase" style={{ backgroundColor: '#0f172a', color: '#ffffff', textTransform: 'uppercase' }}>
                        <th className="border border-blue-900 py-1.5 px-2.5 text-left text-xs w-44" style={{ border: '1px solid #1e3a8a', padding: '6px 10px', textAlign: 'left', fontSize: '12px', width: '180px', fontFamily: "'Cambria Math', Cambria, Georgia, serif", letterSpacing: '0.02em' }}>
                          SUBJECT
                        </th>

                        {(selectedTerm === 'COMBINED' || selectedTerm === 'BOT') && (
                          <th className={`border border-blue-900 py-1.5 px-2 text-center w-14 text-xs ${selectedTerm === 'BOT' ? 'bg-amber-600 text-white font-extrabold' : ''}`} style={{ border: '1px solid #1e3a8a', padding: '6px 8px', textAlign: 'center', width: '58px', fontSize: '11.5px', backgroundColor: selectedTerm === 'BOT' ? '#d97706' : 'transparent' }}>
                            BOT ({currentSchool.botWeight || 20}%)
                          </th>
                        )}
                        {(selectedTerm === 'COMBINED' || selectedTerm === 'MOT') && (
                          <th className={`border border-blue-900 py-1.5 px-2 text-center w-14 text-xs ${selectedTerm === 'MOT' ? 'bg-amber-600 text-white font-extrabold' : ''}`} style={{ border: '1px solid #1e3a8a', padding: '6px 8px', textAlign: 'center', width: '58px', fontSize: '11.5px', backgroundColor: selectedTerm === 'MOT' ? '#d97706' : 'transparent' }}>
                            MOT ({currentSchool.motWeight || 20}%)
                          </th>
                        )}
                        {(selectedTerm === 'COMBINED' || selectedTerm === 'EOT') && (
                          <th className={`border border-blue-900 py-1.5 px-2 text-center w-14 text-xs ${selectedTerm === 'EOT' ? 'bg-amber-600 text-white font-extrabold' : ''}`} style={{ border: '1px solid #1e3a8a', padding: '6px 8px', textAlign: 'center', width: '58px', fontSize: '11.5px', backgroundColor: selectedTerm === 'EOT' ? '#d97706' : 'transparent' }}>
                            EOT ({currentSchool.eotWeight || 60}%)
                          </th>
                        )}

                        <th className="border border-blue-900 py-1.5 px-2 text-center w-16 bg-slate-800 text-amber-300 text-xs font-bold" style={{ border: '1px solid #1e3a8a', padding: '6px 8px', textAlign: 'center', width: '60px', backgroundColor: '#1e293b', color: '#fcd34d', fontSize: '11.5px' }}>
                          {selectedTerm === 'COMBINED' ? 'Final %' : `${selectedTerm} %`}
                        </th>

                        <th className="border border-blue-900 py-1.5 px-2 text-center w-16 text-xs" style={{ border: '1px solid #1e3a8a', padding: '6px 8px', textAlign: 'center', width: '66px', fontSize: '11.5px' }}>
                          UNEB Grade
                        </th>
                        <th className="border border-blue-900 py-1.5 px-2.5 text-left w-24 text-xs" style={{ border: '1px solid #1e3a8a', padding: '6px 10px', textAlign: 'left', width: '100px', fontSize: '11.5px' }}>Remarks</th>
                        <th className="border border-blue-900 py-1.5 px-2.5 text-left w-28 text-xs" style={{ border: '1px solid #1e3a8a', padding: '6px 10px', textAlign: 'left', width: '115px', fontSize: '11.5px' }}>Teacher</th>
                      </tr>
                    )}
                  </thead>
                  <tbody>
                    {subjectBreakdown.map((row, idx) => {
                      const twoPapers = isALevelStudent && !isGeneralPaper(row.subject) && !isSubmath(row.subject);

                      return (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'} style={{ backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                          <td
                            className="border border-blue-900 py-1.5 px-2.5 font-bold text-slate-900 text-[12px] w-44"
                            style={{
                              border: '1px solid #1e3a8a',
                              padding: '4px 8px',
                              fontWeight: 700,
                              color: '#0f172a',
                              fontSize: '12px',
                              fontFamily: "'Cambria Math', Cambria, Georgia, serif"
                            }}
                            title={cleanSubjectTitle(row.subject.name)}
                          >
                            {cleanSubjectTitle(row.subject.name)}
                          </td>

                          {isALevelStudent ? (
                            <>
                              {/* BOT Columns */}
                              {(selectedTerm === 'COMBINED' || selectedTerm === 'BOT') && (
                                twoPapers ? (
                                  <>
                                    <td className="border border-blue-900 py-1 px-1 text-center text-slate-700 text-[12px]" style={{ border: '1px solid #1e3a8a', padding: '3px 2px', textAlign: 'center', color: '#040609ff', fontSize: '12px' }}>
                                      {row.bot1 !== null ? row.bot1 : '-'}
                                    </td>
                                    <td className="border border-blue-900 py-1 px-1 text-center text-slate-700 text-[12px]" style={{ border: '1px solid #1e3a8a', padding: '3px 2px', textAlign: 'center', color: '#030609ff', fontSize: '12px' }}>
                                      {row.bot2 !== null ? row.bot2 : '-'}
                                    </td>
                                  </>
                                ) : (
                                  <td colSpan={2} className="border border-blue-900 py-1 px-1 text-center text-slate-700 text-[12px] font-semibold" style={{ border: '1px solid #1e3a8a', padding: '3px 2px', textAlign: 'center', color: '#030609ff', fontSize: '12px' }}>
                                    {row.bot !== null ? row.bot : '-'}
                                  </td>
                                )
                              )}

                              {/* MOT Columns */}
                              {(selectedTerm === 'COMBINED' || selectedTerm === 'MOT') && (
                                twoPapers ? (
                                  <>
                                    <td className="border border-blue-900 py-1 px-1 text-center text-slate-700 text-[12px]" style={{ border: '1px solid #1e3a8a', padding: '3px 2px', textAlign: 'center', color: '#040a13ff', fontSize: '12px' }}>
                                      {row.mot1 !== null ? row.mot1 : '-'}
                                    </td>
                                    <td className="border border-blue-900 py-1 px-1 text-center text-slate-700 text-[12px]" style={{ border: '1px solid #1e3a8a', padding: '3px 2px', textAlign: 'center', color: '#020408ff', fontSize: '12px' }}>
                                      {row.mot2 !== null ? row.mot2 : '-'}
                                    </td>
                                  </>
                                ) : (
                                  <td colSpan={2} className="border border-blue-900 py-1 px-1 text-center text-slate-700 text-[12px] font-semibold" style={{ border: '1px solid #1e3a8a', padding: '3px 2px', textAlign: 'center', color: '#04070cff', fontSize: '12px' }}>
                                    {row.mot !== null ? row.mot : '-'}
                                  </td>
                                )
                              )}

                              {/* EOT Columns */}
                              {(selectedTerm === 'COMBINED' || selectedTerm === 'EOT') && (
                                twoPapers ? (
                                  <>
                                    <td className="border border-blue-900 py-1 px-1 text-center text-slate-700 text-[12px]" style={{ border: '1px solid #1e3a8a', padding: '3px 2px', textAlign: 'center', color: '#01050aff', fontSize: '12px' }}>
                                      {row.eot1 !== null ? row.eot1 : '-'}
                                    </td>
                                    <td className="border border-blue-900 py-1 px-1 text-center text-slate-700 text-[12px]" style={{ border: '1px solid #1e3a8a', padding: '3px 2px', textAlign: 'center', color: '#020408ff', fontSize: '12px' }}>
                                      {row.eot2 !== null ? row.eot2 : '-'}
                                    </td>
                                  </>
                                ) : (
                                  <td colSpan={2} className="border border-blue-900 py-1 px-1 text-center text-slate-700 text-[12px] font-semibold" style={{ border: '1px solid #1e3a8a', padding: '3px 2px', textAlign: 'center', color: '#040609ff', fontSize: '12px' }}>
                                    {row.eot !== null ? row.eot : '-'}
                                  </td>
                                )
                              )}

                              <td className="border border-blue-900 py-1.5 px-2 text-center font-black text-amber-950 bg-amber-50/50 text-[12.5px]" style={{ border: '1px solid #1e3a8a', padding: '4px 8px', textAlign: 'center', fontWeight: 900, color: '#78350f', backgroundColor: '#fffbeb', fontSize: '12.5px' }}>
                                {row.finalScore !== null ? `${row.finalScore}%` : '-'}
                              </td>
                            </>
                          ) : isOLevelStudent ? (
                            <>
                              {/* Score (3.0) */}
                              <td className="border border-blue-900 py-1.5 px-2 text-center font-mono font-black text-indigo-900 bg-indigo-50/40 text-[12.5px]" style={{ border: '1px solid #1e3a8a', padding: '4px 8px', textAlign: 'center', fontFamily: 'monospace', fontWeight: 900, color: '#312e81', backgroundColor: '#eef2ff', fontSize: '12.5px' }}>
                                {row.descriptorScore !== '-' ? `${row.descriptorScore}` : '-'}
                              </td>

                              {/* Formative (20) */}
                              <td className="border border-blue-900 py-1.5 px-2 text-center font-bold text-emerald-900 bg-emerald-50/40 text-[12.5px]" style={{ border: '1px solid #1e3a8a', padding: '4px 8px', textAlign: 'center', fontWeight: 700, color: '#065f46', backgroundColor: '#ecfdf5', fontSize: '12.5px' }}>
                                {row.frmtScore !== null && row.frmtScore !== undefined ? row.frmtScore : '-'}
                              </td>

                              {/* Exam (80) */}
                              <td className="border border-blue-900 py-1.5 px-2 text-center font-bold text-blue-900 bg-blue-50/40 text-[12.5px]" style={{ border: '1px solid #1e3a8a', padding: '4px 8px', textAlign: 'center', fontWeight: 700, color: '#1e40af', backgroundColor: '#eff6ff', fontSize: '12.5px' }}>
                                {row.examScore !== null && row.examScore !== undefined ? row.examScore : '-'}
                              </td>

                              {/* Total (100) */}
                              <td className="border border-blue-900 py-1.5 px-2 text-center font-black text-amber-950 bg-amber-50/50 text-[12.5px]" style={{ border: '1px solid #1e3a8a', padding: '4px 8px', textAlign: 'center', fontWeight: 900, color: '#78350f', backgroundColor: '#fffbeb', fontSize: '12.5px' }}>
                                {row.finalScore !== null ? `${row.finalScore}%` : '-'}
                              </td>
                            </>
                          ) : (
                            <>
                              {(selectedTerm === 'COMBINED' || selectedTerm === 'BOT') && (
                                <td className={`border border-blue-900 py-1.5 px-2 text-center text-slate-700 text-[12.5px] ${selectedTerm === 'BOT' ? 'font-bold bg-amber-50/40 text-amber-900' : ''}`} style={{ border: '1px solid #1e3a8a', padding: '4px 8px', textAlign: 'center', color: selectedTerm === 'BOT' ? '#78350f' : '#334155', fontSize: '12.5px', backgroundColor: selectedTerm === 'BOT' ? '#fffbeb' : 'transparent', fontWeight: selectedTerm === 'BOT' ? 700 : 500 }}>
                                  {row.bot !== null ? row.bot : '-'}
                                </td>
                              )}
                              {(selectedTerm === 'COMBINED' || selectedTerm === 'MOT') && (
                                <td className={`border border-blue-900 py-1.5 px-2 text-center text-slate-700 text-[12.5px] ${selectedTerm === 'MOT' ? 'font-bold bg-amber-50/40 text-amber-900' : ''}`} style={{ border: '1px solid #1e3a8a', padding: '4px 8px', textAlign: 'center', color: selectedTerm === 'MOT' ? '#78350f' : '#334155', fontSize: '12.5px', backgroundColor: selectedTerm === 'MOT' ? '#fffbeb' : 'transparent', fontWeight: selectedTerm === 'MOT' ? 700 : 500 }}>
                                  {row.mot !== null ? row.mot : '-'}
                                </td>
                              )}
                              {(selectedTerm === 'COMBINED' || selectedTerm === 'EOT') && (
                                <td className={`border border-blue-900 py-1.5 px-2 text-center text-slate-700 text-[12.5px] ${selectedTerm === 'EOT' ? 'font-bold bg-amber-50/40 text-amber-900' : ''}`} style={{ border: '1px solid #1e3a8a', padding: '4px 8px', textAlign: 'center', color: selectedTerm === 'EOT' ? '#78350f' : '#334155', fontSize: '12.5px', backgroundColor: selectedTerm === 'EOT' ? '#fffbeb' : 'transparent', fontWeight: selectedTerm === 'EOT' ? 700 : 500 }}>
                                  {row.eot !== null ? row.eot : '-'}
                                </td>
                              )}

                              <td className="border border-blue-900 py-1.5 px-2 text-center font-black text-amber-950 bg-amber-50/50 text-[12.5px]" style={{ border: '1px solid #1e3a8a', padding: '4px 8px', textAlign: 'center', fontWeight: 900, color: '#78350f', backgroundColor: '#fffbeb', fontSize: '12.5px' }}>
                                {row.finalScore !== null ? `${row.finalScore}%` : '-'}
                              </td>
                            </>
                          )}

                          <td className="border border-blue-900 py-1.5 px-2 text-center font-black text-[12.5px] text-slate-900" style={{ border: '1px solid #1e3a8a', padding: '4px 8px', textAlign: 'center', fontWeight: 900, fontSize: '12.5px', color: '#0f172a' }}>
                            <span
                              className={`px-2 py-0.5 rounded font-black ${row.grade === 'A' || row.grade === 'D1' || row.grade === 'D2'
                                ? 'text-emerald-800 bg-emerald-100'
                                : row.grade === 'B' || row.grade?.startsWith('C')
                                  ? 'text-blue-800 bg-blue-100'
                                  : row.grade === 'C' || row.grade?.startsWith('P')
                                    ? 'text-amber-800 bg-amber-100'
                                    : 'text-slate-700'
                                }`}
                              style={{
                                padding: '2px 7px',
                                borderRadius: '4px',
                                fontWeight: 900,
                                fontSize: '12.5px',
                                backgroundColor: row.grade === 'A' || row.grade === 'D1' || row.grade === 'D2' ? '#d1fae5' : row.grade === 'B' || row.grade?.startsWith('C') ? '#dbeafe' : '#fef3c7',
                                color: row.grade === 'A' || row.grade === 'D1' || row.grade === 'D2' ? '#065f46' : row.grade === 'B' || row.grade?.startsWith('C') ? '#1e40af' : '#92400e',
                                display: 'inline-block'
                              }}
                            >
                              {row.grade}
                            </span>
                          </td>

                          <td className="border border-blue-900 py-1.5 px-2.5 text-slate-800 text-[11.5px] font-semibold" style={{ border: '1px solid #1e3a8a', padding: '4px 10px', color: '#1e293b', fontSize: '11.5px', fontWeight: 600 }}>
                            {row.remark}
                          </td>

                          <td className="border border-blue-900 py-1.5 px-2.5 text-slate-700 text-[11.5px]" style={{ border: '1px solid #1e3a8a', padding: '4px 10px', color: '#334155', fontSize: '11.5px' }}>
                            {(() => {
                              const teacher = getTeacherForSubject(row.subject.id);
                              return teacher ? (
                                <span className="font-bold text-slate-900 block truncate" style={{ fontWeight: 700, color: '#0f172a', display: 'block', fontSize: '11.5px' }}>{teacher.name}</span>
                              ) : (
                                <span className="text-slate-400">—</span>
                              );
                            })()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Aggregate / Division / Result Summary Cards - 3 Columns & Compact */}
              <div className="grid grid-cols-3 gap-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '8px', width: '100%' }}>
                <div className="bg-amber-50 border border-amber-600/30 p-1.5 rounded-lg text-center" style={{ backgroundColor: '#fffbeb', border: '1px solid rgba(217, 119, 6, 0.35)', padding: '5px 8px', borderRadius: '8px', textAlign: 'center' }}>
                  <span className="text-[9.5px] font-extrabold uppercase text-amber-800 tracking-wide block" style={{ fontSize: '9.5px', fontWeight: 800, textTransform: 'uppercase', color: '#92400e', display: 'block' }}>
                    {selectedTerm} OVERALL AVERAGE
                  </span>
                  <div className="text-base font-black text-amber-900 font-outfit mt-0.5" style={{ fontSize: '15px', fontWeight: 900, color: '#78350f', marginTop: '1px' }}>{overallAvg}%</div>
                </div>

                <div className="bg-slate-900 text-white p-1.5 rounded-lg text-center" style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '5px 8px', borderRadius: '8px', textAlign: 'center' }}>
                  <span className="text-[9.5px] font-extrabold uppercase text-amber-400 tracking-wide block" style={{ fontSize: '9.5px', fontWeight: 800, textTransform: 'uppercase', color: '#fbbf24', display: 'block' }}>
                    {isOLevelStudent ? 'AVERAGE SCORE (3.0)' : isALevelStudent ? 'POINTS' : 'AGGREGATES'}
                  </span>
                  <div className="text-base font-black text-white font-outfit mt-0.5" style={{ fontSize: '15px', fontWeight: 900, color: '#ffffff', marginTop: '1px' }}>
                    {isOLevelStudent
                      ? `${summaryObj.totalAggregate} / 3.0`
                      : isALevelStudent
                        ? `${summaryObj.totalPoints} Pts`
                        : `${summaryObj.totalAggregate} Aggs`
                    }
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-600/30 p-1.5 rounded-lg text-center" style={{ backgroundColor: '#ecfdf5', border: '1px solid rgba(5, 150, 105, 0.35)', padding: '5px 8px', borderRadius: '8px', textAlign: 'center' }}>
                  <span className="text-[9.5px] font-extrabold uppercase text-emerald-800 tracking-wide block" style={{ fontSize: '9.5px', fontWeight: 800, textTransform: 'uppercase', color: '#065f46', display: 'block' }}>
                    {isOLevelStudent ? 'COMPETENCY' : 'RESULT'}
                  </span>
                  <div className="text-xs font-black text-emerald-900 font-outfit mt-0.5 truncate" style={{ fontSize: '12.5px', fontWeight: 900, color: '#064e3b', marginTop: '1px' }}>
                    {summaryObj.division}
                  </div>
                </div>
              </div>

              {/* Grading Scale Reference Guide (O-Level) */}
              {isOLevelStudent && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-700" style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '7px 10px', fontSize: '10px', color: '#334155' }}>
                  <span className="font-extrabold text-slate-900 uppercase block mb-1 text-[10.5px]" style={{ fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', display: 'block', marginBottom: '3px', fontSize: '14px' }}>
                    LSC Grading Scale Reference:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-calibri text-[13px]" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '6px', fontFamily: 'calibri', fontSize: '13px' }}>
                    <div className="bg-white px-2 py-1 rounded border border-slate-200" style={{ backgroundColor: '#ffffff', padding: '3px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                      <strong className="text-emerald-700" style={{ color: '#047857' }}>2.5 – 3.0: Grade A</strong> &bull; Outstanding
                    </div>
                    <div className="bg-white px-2 py-1 rounded border border-slate-200" style={{ backgroundColor: '#ffffff', padding: '3px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                      <strong className="text-blue-700" style={{ color: '#1d4ed8' }}>1.5 – 2.4: Grade B</strong> &bull; Moderate
                    </div>
                    <div className="bg-white px-2 py-1 rounded border border-slate-200" style={{ backgroundColor: '#ffffff', padding: '3px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                      <strong className="text-amber-700" style={{ color: '#b45309' }}>0.9 – 1.4: Grade C</strong> &bull; Basic
                    </div>
                    <div className="bg-white px-2 py-1 rounded border border-slate-200" style={{ backgroundColor: '#ffffff', padding: '3px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                      <strong className="text-rose-700" style={{ color: '#be123c' }}>0.0 – 0.8: Grade D</strong> &bull; Below Basic
                    </div>
                  </div>
                </div>
              )}

              {/* A-Level UACE Grading Scale Reference */}
              {isALevelStudent && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-700" style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '7px 10px', fontSize: '10px', color: '#334155' }}>
                  <span className="font-extrabold text-slate-900 uppercase block mb-1 text-[14px]" style={{ fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', display: 'block', marginBottom: '3px', fontSize: '14px' }}>
                    A-Level Grading Scale Reference:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 font-mono text-[13px] mb-0.5" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '5px', fontFamily: 'monospace', fontSize: '13px' }}>
                    <div className="bg-white px-2 py-0.5 rounded border border-slate-200" style={{ backgroundColor: '#ffffff', padding: '3px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                      <strong className="text-emerald-700" style={{ color: '#047857' }}>90 – 100% → A (5 pts)</strong> &bull; Principal Pass
                    </div>
                    <div className="bg-white px-2 py-0.5 rounded border border-slate-200" style={{ backgroundColor: '#ffffff', padding: '3px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                      <strong className="text-emerald-600" style={{ color: '#059669' }}>75 – 89% → B (4 pts)</strong> &bull; Principal Pass
                    </div>
                    <div className="bg-white px-2 py-0.5 rounded border border-slate-200" style={{ backgroundColor: '#ffffff', padding: '3px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                      <strong className="text-blue-700" style={{ color: '#1d4ed8' }}>60 – 74% → C (3 pts)</strong> &bull; Principal Pass
                    </div>
                    <div className="bg-white px-2 py-0.5 rounded border border-slate-200" style={{ backgroundColor: '#ffffff', padding: '3px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                      <strong className="text-amber-700" style={{ color: '#b45309' }}>50 – 59% → D (2 pts)</strong> &bull; Principal Pass
                    </div>
                    <div className="bg-white px-2 py-0.5 rounded border border-slate-200" style={{ backgroundColor: '#ffffff', padding: '3px 8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                      <strong className="text-orange-600" style={{ color: '#ea580c' }}>0 – 49% → E (1 pt)</strong> &bull; Pass E
                    </div>
                    <div className="bg-white px-2 py-0.5 rounded border border-indigo-200" style={{ backgroundColor: '#ffffff', padding: '3px 8px', borderRadius: '4px', border: '1px solid #c7d2fe' }}>
                      <strong className="text-indigo-700" style={{ color: '#4338ca' }}>Subsidiaries:</strong> A = Pass (≥50%), E = Fail (&lt;50%)
                    </div>
                  </div>
                </div>
              )}

              {/* Remarks & Official Signatures Section */}
              <div className="border border-slate-200 rounded-xl p-2.5 space-y-2 text-xs bg-slate-50/50" style={{ border: '1px solid #cbd5e1', borderRadius: '10px', padding: '9px 12px', backgroundColor: '#f8fafc', fontSize: '14px' }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '10px' }}>
                  <div>
                    <span className="font-bold text-slate-900 uppercase block mb-1 text-[14px] tracking-wide" style={{ fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', display: 'block', marginBottom: '3px', fontSize: '14px' }}>Class Teacher's Remark:</span>
                    <p className="p-2 bg-white border border-slate-200 rounded-md italic text-slate-800 leading-snug text-xs" style={{ padding: '6px 8px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', fontStyle: 'italic', color: '#1e293b', lineHeight: 1.35, margin: 0, fontSize: '13px' }}>
                      "{student.classTeacherRemark || `${student.name} is polite, disciplined, and very hard working. Demonstrates high engagement in class.`}"
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-slate-900 uppercase block mb-1 text-[14px] tracking-wide" style={{ fontWeight: 700, color: '#0f172a', textTransform: 'uppercase', display: 'block', marginBottom: '3px', fontSize: '14px' }}>Head Teacher's Comment:</span>
                    <p className="p-2 bg-white border border-slate-200 rounded-md italic text-slate-800 leading-snug text-xs" style={{ padding: '6px 8px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', fontStyle: 'italic', color: '#1e293b', lineHeight: 1.35, margin: 0, fontSize: '13px' }}>
                      "{student.headTeacherRemark || 'An encouraging performance recorded this term. Continued effort will ensure peak readiness.'}"
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 grid grid-cols-3 gap-3 items-end text-[11px]" style={{ paddingTop: '8px', borderTop: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px', alignItems: 'flex-end', fontSize: '11px' }}>
                  <div>
                    <span className="text-[9.5px] font-bold text-slate-500 uppercase block tracking-wider" style={{ fontSize: '9.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Director of Studies</span>
                    <div className="text-[12px] font-extrabold text-slate-900 font-outfit border-b border-dashed border-slate-400 pb-0.5 inline-block" style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', borderBottom: '1px dashed #94a3b8', paddingBottom: '2px', display: 'inline-block' }}>
                      {currentSchool?.dosSignature || currentSchool?.dosName || 'Director of Studies (DOS)'}
                    </div>
                  </div>

                  <div className="text-center" style={{ textAlign: 'center' }}>
                    <span className="text-[9.5px] font-bold text-slate-500 uppercase block tracking-wider" style={{ fontSize: '9.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Head Teacher Stamp</span>
                    <div className="text-[12px] font-extrabold text-amber-900 font-outfit border-b border-dashed border-slate-400 pb-0.5 inline-block" style={{ fontSize: '12px', fontWeight: 800, color: '#78350f', borderBottom: '1px dashed #94a3b8', paddingBottom: '2px', display: 'inline-block' }}>
                      {currentSchool?.headTeacherSignature || currentSchool?.headTeacher || 'Head Teacher'}
                    </div>
                  </div>

                  <div className="text-right" style={{ textAlign: 'right' }}>
                    <span className="text-[9.5px] font-bold text-slate-500 uppercase block tracking-wider" style={{ fontSize: '9.5px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Next Term Begins</span>
                    <div className="font-extrabold text-slate-900 text-[12px]" style={{ fontWeight: 800, color: '#0f172a', fontSize: '12px' }}>
                      {currentSchool?.nextTermBegins || currentSchool?.nextTermDate || 'Monday, 14th September 2026'}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>{/* end scaled content wrapper */}
        </div>{/* end A4 shell */}
      </A4ViewportScaler>
    </div>
  );
}
