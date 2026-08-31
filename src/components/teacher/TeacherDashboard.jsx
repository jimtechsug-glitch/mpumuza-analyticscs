import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getPrimaryGrade,
  getOLevelClassicGrade,
  getOLevelNewCurriculumGrade,
  getALevelSubjectGrade,
  calculateWeightedFinalScore,
  calculateNCDCContinuousAssessment,
  getNCDCCompetencyBand,
  generateSubjectRemark,
  generateClassTeacherRemark,
  generateHeadTeacherRemark
} from '../../utils/unebGrading';
import { downloadClassMarksTemplate, parseMarksSpreadsheet } from '../../utils/excelHandler';
import {
  Save,
  CheckCircle,
  BookOpen,
  Users,
  GraduationCap,
  BarChart3,
  Award,
  Layers,
  Sparkles,
  TrendingUp,
  FileSpreadsheet,
  HelpCircle,
  School,
  CheckCircle2,
  ListFilter,
  MessageSquareQuote,
  MessageSquare,
  Send,
  Edit3,
  Target,
  Sliders,
  Wand2,
  Download,
  Share2,
  Upload,
  FileUp,
  X,
  DownloadCloud
} from 'lucide-react';

export default function TeacherDashboard() {
  const { currentSchool, currentUser, classes, subjects, students, marks, saveMarks, updateStudent } = useAuth();

  const schoolClasses = classes.filter(c => c.schoolId === currentSchool.id);
  const schoolSubjects = subjects.filter(s => s.schoolId === currentSchool.id);

  const [activeTab, setActiveTab] = useState('marks'); // 'marks', 'remarks', 'analytics', 'roster', 'grading'
  const [selectedClassId, setSelectedClassId] = useState(schoolClasses[0]?.id || '');
  const [selectedStream, setSelectedStream] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState(schoolSubjects[0]?.id || '');
  const [analyticsSubjectId, setAnalyticsSubjectId] = useState(schoolSubjects[0]?.id || '');

  // Local grid marks state for fast tabular entry (keyed by subjectId for selected student)
  const [gridData, setGridData] = useState({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Remarks state (individual + bulk)
  const [remarksData, setRemarksData] = useState({});
  const [remarksSavedFeedback, setRemarksSavedFeedback] = useState(null);
  const [bulkRemarkText, setBulkRemarkText] = useState('Polite, hardworking, and disciplined. Demonstrates high engagement in class.');
  const [bulkRemarkType, setBulkRemarkType] = useState('classTeacher');

  // NCDC Continuous Assessment (AoI) State
  const [ncdcSubjectId, setNcdcSubjectId] = useState(schoolSubjects[0]?.id || '');
  const [ncdcData, setNcdcData] = useState({});
  const [ncdcSavedFeedback, setNcdcSavedFeedback] = useState(null);
  const [ncdcScaleMode, setNcdcScaleMode] = useState('3.0'); // '3.0' or '100'

  // Excel Bulk Mark Import State
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [excelParsedSummary, setExcelParsedSummary] = useState(null);
  const [isParsingExcel, setIsParsingExcel] = useState(false);
  const [excelUploadError, setExcelUploadError] = useState(null);

  const currentClass = schoolClasses.find(c => c.id === selectedClassId);
  const availableStreams = currentClass?.streams || ['A', 'B'];

  const isClassALevel = currentClass?.level === 'A-Level' ||
    ['s.5', 's.6', 'senior 5', 'senior 6', 'a-level'].some(l => (currentClass?.name || '').toLowerCase().includes(l));
  const isClassPrimary = currentSchool.levelType === 'PRIMARY' || currentClass?.level === 'Primary' ||
    ['p.1', 'p.2', 'p.3', 'p.4', 'p.5', 'p.6', 'p.7', 'primary'].some(l => (currentClass?.name || '').toLowerCase().includes(l));
  const isClassOLevel = !isClassALevel && !isClassPrimary;

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

  const availableSubjects = schoolSubjects.filter(sub => {
    if (isClassPrimary) {
      return sub.category === 'Primary' || (!sub.category && !sub.isSubsidiary && !sub.code?.startsWith('P'));
    } else if (isClassALevel) {
      const isALvlCode = sub.code?.startsWith('P') || sub.code?.startsWith('S') || sub.code?.toLowerCase().startsWith('uace');
      return sub.category === 'A-Level' || sub.isSubsidiary || isALvlCode;
    } else if (isClassOLevel) {
      const isALvlCode = sub.code?.startsWith('P') || sub.code?.startsWith('S');
      const isExplicitALevel = sub.category === 'A-Level' || sub.isSubsidiary || isALvlCode;
      const isExplicitPrimary = sub.category === 'Primary';
      return !(isExplicitALevel || isExplicitPrimary);
    }
    return true;
  }).sort((a, b) => {
    if (isClassALevel) {
      const isSubA = a.isSubsidiary || isGeneralPaper(a) || isSubmath(a);
      const isSubB = b.isSubsidiary || isGeneralPaper(b) || isSubmath(b);
      if (!isSubA && isSubB) return -1;
      if (isSubA && !isSubB) return 1;
    }
    return (a.name || '').localeCompare(b.name || '');
  });

  // Initialize selected stream & subject when class changes
  useEffect(() => {
    if (availableStreams.length > 0 && !availableStreams.includes(selectedStream)) {
      setSelectedStream(availableStreams[0]);
    }
  }, [selectedClassId]);

  useEffect(() => {
    if (availableSubjects.length > 0 && !availableSubjects.some(s => s.id === selectedSubjectId)) {
      setSelectedSubjectId(availableSubjects[0].id);
    }
  }, [selectedClassId, schoolSubjects]);

  // Filter students matching selected Class & Stream
  const enrolledStudents = students.filter(
    s => s.schoolId === currentSchool.id && s.classId === selectedClassId && (s.stream === selectedStream || !selectedStream)
  );

  // Auto-select first student when class/stream changes
  useEffect(() => {
    if (enrolledStudents.length > 0 && !enrolledStudents.some(s => s.id === selectedStudentId)) {
      setSelectedStudentId(enrolledStudents[0].id);
    }
  }, [selectedClassId, selectedStream, students]);

  const selectedStudent = enrolledStudents.find(s => s.id === selectedStudentId);

  // Helper: check if a subject needs Paper 1 & 2 entry (all A-Level subjects except GP and Submath)
  const isSubjectTwoPapers = (sub) => isClassALevel && !isGeneralPaper(sub) && !isSubmath(sub);

  // Active subject used only for analytics tab
  const activeSubject = schoolSubjects.find(s => s.id === analyticsSubjectId);

  // Load existing marks into local grid state (keyed by subjectId for selected student)
  useEffect(() => {
    if (!selectedStudentId) return;
    const newGrid = {};
    availableSubjects.forEach(sub => {
      const existing = marks.find(m => m.studentId === selectedStudentId && m.subjectId === sub.id) || {};
      newGrid[sub.id] = {
        bot:  existing.bot  !== undefined && existing.bot  !== null ? existing.bot  : '',
        mot:  existing.mot  !== undefined && existing.mot  !== null ? existing.mot  : '',
        eot:  existing.eot  !== undefined && existing.eot  !== null ? existing.eot  : '',
        bot1: existing.bot1 !== undefined && existing.bot1 !== null ? existing.bot1 : '',
        bot2: existing.bot2 !== undefined && existing.bot2 !== null ? existing.bot2 : '',
        mot1: existing.mot1 !== undefined && existing.mot1 !== null ? existing.mot1 : '',
        mot2: existing.mot2 !== undefined && existing.mot2 !== null ? existing.mot2 : '',
        eot1: existing.eot1 !== undefined && existing.eot1 !== null ? existing.eot1 : '',
        eot2: existing.eot2 !== undefined && existing.eot2 !== null ? existing.eot2 : '',
        comment: existing.comment || ''
      };
    });
    setGridData(newGrid);
    setSavedSuccess(false);
  }, [selectedClassId, selectedStream, selectedStudentId, students, marks]);

  // Load existing student remarks into local remarksData state
  useEffect(() => {
    const initialRemarks = {};
    enrolledStudents.forEach(std => {
      initialRemarks[std.id] = {
        classTeacherRemark: std.classTeacherRemark || '',
        headTeacherRemark: std.headTeacherRemark || ''
      };
    });
    setRemarksData(initialRemarks);
  }, [selectedClassId, selectedStream, students]);

  const handleRemarkFieldChange = (studentId, field, text) => {
    setRemarksData(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [field]: text
      }
    }));
  };

  const handleSaveSingleRemark = (studentId) => {
    const rem = remarksData[studentId] || {};
    updateStudent(studentId, {
      classTeacherRemark: rem.classTeacherRemark,
      headTeacherRemark: rem.headTeacherRemark
    });
    setRemarksSavedFeedback('Saved remark for student!');
    setTimeout(() => setRemarksSavedFeedback(null), 3000);
  };

  const handleSaveAllRemarks = () => {
    enrolledStudents.forEach(std => {
      const rem = remarksData[std.id];
      if (rem) {
        updateStudent(std.id, {
          classTeacherRemark: rem.classTeacherRemark,
          headTeacherRemark: rem.headTeacherRemark
        });
      }
    });
    setRemarksSavedFeedback(`Successfully saved remarks for all ${enrolledStudents.length} students!`);
    setTimeout(() => setRemarksSavedFeedback(null), 4000);
  };

  const handleApplyBulkRemark = (textToApply) => {
    const finalTxt = textToApply || bulkRemarkText;
    if (!finalTxt.trim()) return;
    const fieldKey = bulkRemarkType === 'classTeacher' ? 'classTeacherRemark' : 'headTeacherRemark';
    const updated = { ...remarksData };
    enrolledStudents.forEach(std => {
      updated[std.id] = {
        ...(updated[std.id] || {}),
        [fieldKey]: finalTxt
      };
      updateStudent(std.id, { [fieldKey]: finalTxt });
    });
    setRemarksData(updated);
    setRemarksSavedFeedback(`Applied bulk remark to all ${enrolledStudents.length} students in ${currentClass?.name} (${selectedStream || 'All'})!`);
    setTimeout(() => setRemarksSavedFeedback(null), 4000);
  };

  // 1-Click AI/Smart Auto-Generate Descriptors & Remarks for All Students
  const handleAutoGenerateAllRemarks = () => {
    const updated = { ...remarksData };

    enrolledStudents.forEach(std => {
      // Calculate student's marks across all subjects
      const stdMarks = marks.filter(m => m.studentId === std.id);
      let totalScore = 0;
      let count = 0;
      stdMarks.forEach(m => {
        const score = calculateWeightedFinalScore(m.bot, m.mot, m.eot, {
          bot: currentSchool.botWeight || 20,
          mot: currentSchool.motWeight || 20,
          eot: currentSchool.eotWeight || 60
        });
        if (score !== null) {
          totalScore += score;
          count++;
        }
      });

      const avgScore = count > 0 ? totalScore / count : 60;
      let simulatedDiv = 'Division II';
      let simulatedAgg = 20;

      if (avgScore >= 80) { simulatedDiv = 'Division I'; simulatedAgg = 10; }
      else if (avgScore >= 65) { simulatedDiv = 'Division I'; simulatedAgg = 14; }
      else if (avgScore >= 50) { simulatedDiv = 'Division II'; simulatedAgg = 22; }
      else if (avgScore >= 40) { simulatedDiv = 'Division III'; simulatedAgg = 28; }
      else { simulatedDiv = 'Division IV'; simulatedAgg = 32; }

      const generatedClassRemark = generateClassTeacherRemark(simulatedDiv, simulatedAgg, std.name);
      const generatedHeadRemark = generateHeadTeacherRemark(simulatedDiv, std.feesBalance || 0, std.nextTermFee || 0);

      updated[std.id] = {
        classTeacherRemark: generatedClassRemark,
        headTeacherRemark: generatedHeadRemark
      };

      updateStudent(std.id, {
        classTeacherRemark: generatedClassRemark,
        headTeacherRemark: generatedHeadRemark
      });
    });

    setRemarksData(updated);
    setRemarksSavedFeedback(`✨ Auto-generated customized performance remarks for all ${enrolledStudents.length} students based on score analytics!`);
    setTimeout(() => setRemarksSavedFeedback(null), 5000);
  };

  // 1-Click Auto-Fill Subject Teacher Remarks for Active Student Grid
  const handleAutoGenerateSubjectRemarks = () => {
    setGridData(prev => {
      const next = { ...prev };
      availableSubjects.forEach(sub => {
        const rec = next[sub.id] || {};
        const score = calculateWeightedFinalScore(rec.bot, rec.mot, rec.eot, {
          bot: currentSchool.botWeight || 20,
          mot: currentSchool.motWeight || 20,
          eot: currentSchool.eotWeight || 60
        });
        const smartRemark = generateSubjectRemark(score ?? 65, sub.name, currentClass?.level || 'O-Level');
        next[sub.id] = { ...rec, comment: smartRemark };
      });
      return next;
    });
    setSavedSuccess(false);
  };

  // NCDC Cell Change & Save
  const handleNCDCChange = (studentId, field, value) => {
    setNcdcData(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [field]: value
      }
    }));
  };

  const handleSaveNCDC = () => {
    // Save NCDC continuous assessment to marks
    const markEntries = enrolledStudents.map(std => {
      const record = ncdcData[std.id] || {};
      const aois = [record.aoi1, record.aoi2, record.aoi3].filter(v => v !== '' && v !== undefined && v !== null);
      const assessment = calculateNCDCContinuousAssessment(aois, record.summative, ncdcScaleMode === '3.0');

      return {
        studentId: std.id,
        subjectId: ncdcSubjectId,
        bot: assessment.formative20Score,
        mot: null,
        eot: record.summative ? Number(record.summative) : null,
        comment: assessment.descriptor || ''
      };
    });

    saveMarks(markEntries);
    setNcdcSavedFeedback(`Saved NCDC Continuous Assessment (20% Formative + 80% Summative) for ${enrolledStudents.length} students!`);
    setTimeout(() => setNcdcSavedFeedback(null), 4000);
  };

  // Excel Bulk Mark Actions
  const handleDownloadTemplate = () => {
    downloadClassMarksTemplate(
      currentClass?.name || 'Class',
      selectedStream || 'All',
      enrolledStudents,
      availableSubjects,
      activeTab === 'ncdc'
    );
  };

  const handleProcessExcelFile = async (file) => {
    if (!file) return;
    setIsParsingExcel(true);
    setExcelUploadError(null);
    setExcelParsedSummary(null);

    try {
      const result = await parseMarksSpreadsheet(file, enrolledStudents, availableSubjects);
      if (result.success) {
        setExcelParsedSummary(result);
      } else {
        setExcelUploadError(result.message || 'Failed to parse spreadsheet.');
      }
    } catch (err) {
      setExcelUploadError(err.message || 'An error occurred while reading the Excel file.');
    } finally {
      setIsParsingExcel(false);
    }
  };

  const handleApplyExcelMarks = () => {
    if (!excelParsedSummary || !excelParsedSummary.markEntries) return;
    saveMarks(excelParsedSummary.markEntries);
    setSavedSuccess(true);
    setIsExcelModalOpen(false);
    setExcelParsedSummary(null);
    setTimeout(() => setSavedSuccess(false), 5000);
  };

  const handleCellChange = (subjectId, field, value) => {
    let numVal = value;
    if (field !== 'comment') {
      if (value === '') {
        numVal = '';
      } else {
        const parsed = Number(value);
        if (isNaN(parsed)) return;
        numVal = Math.min(100, Math.max(0, parsed));
      }
    }
    setGridData(prev => ({
      ...prev,
      [subjectId]: { ...prev[subjectId], [field]: numVal }
    }));
    setSavedSuccess(false);
  };

  const handleSaveAll = () => {
    if (!selectedStudentId) return;
    const markEntries = availableSubjects.map(sub => {
      const record = gridData[sub.id] || {};
      if (isSubjectTwoPapers(sub)) {
        const b1 = record.bot1 !== '' && record.bot1 !== null && record.bot1 !== undefined ? Number(record.bot1) : null;
        const b2 = record.bot2 !== '' && record.bot2 !== null && record.bot2 !== undefined ? Number(record.bot2) : null;
        const m1 = record.mot1 !== '' && record.mot1 !== null && record.mot1 !== undefined ? Number(record.mot1) : null;
        const m2 = record.mot2 !== '' && record.mot2 !== null && record.mot2 !== undefined ? Number(record.mot2) : null;
        const e1 = record.eot1 !== '' && record.eot1 !== null && record.eot1 !== undefined ? Number(record.eot1) : null;
        const e2 = record.eot2 !== '' && record.eot2 !== null && record.eot2 !== undefined ? Number(record.eot2) : null;
        const computedBot = (b1 !== null && b2 !== null) ? Math.round(((b1 + b2) / 2) * 10) / 10 : (b1 ?? b2 ?? null);
        const computedMot = (m1 !== null && m2 !== null) ? Math.round(((m1 + m2) / 2) * 10) / 10 : (m1 ?? m2 ?? null);
        const computedEot = (e1 !== null && e2 !== null) ? Math.round(((e1 + e2) / 2) * 10) / 10 : (e1 ?? e2 ?? null);
        return { studentId: selectedStudentId, subjectId: sub.id, bot: computedBot, mot: computedMot, eot: computedEot, bot1: b1, bot2: b2, mot1: m1, mot2: m2, eot1: e1, eot2: e2, comment: record.comment || '' };
      } else {
        return { studentId: selectedStudentId, subjectId: sub.id, bot: record.bot === '' ? null : (record.bot ?? null), mot: record.mot === '' ? null : (record.mot ?? null), eot: record.eot === '' ? null : (record.eot ?? null), comment: record.comment || '' };
      }
    });
    saveMarks(markEntries);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  // Analytics: compute per-student scores for the analyticsSubjectId subject
  const studentScores = enrolledStudents.map(student => {
    const subjectMarks = marks.find(m => m.studentId === student.id && m.subjectId === analyticsSubjectId) || {};
    const botVal = subjectMarks.bot ?? null;
    const motVal = subjectMarks.mot ?? null;
    const eotVal = subjectMarks.eot ?? null;
    const finalScore = calculateWeightedFinalScore(botVal, motVal, eotVal, {
      bot: currentSchool.botWeight || 20, mot: currentSchool.motWeight || 20, eot: currentSchool.eotWeight || 60
    });
    let grade = '-';
    if (finalScore !== null) {
      if (currentSchool.levelType === 'PRIMARY' || isClassPrimary) {
        grade = getPrimaryGrade(finalScore).grade;
      } else if (isClassALevel || currentSchool.levelType === 'ALEVEL') {
        const isSub = activeSubject?.isSubsidiary || isGeneralPaper(activeSubject) || isSubmath(activeSubject);
        grade = getALevelSubjectGrade(finalScore, isSub).grade;
      } else {
        grade = currentSchool.useNewCurriculum
          ? getOLevelNewCurriculumGrade(botVal || 0, eotVal || finalScore).grade
          : getOLevelClassicGrade(finalScore).grade;
      }
    }
    return { student, finalScore, grade };
  });

  const scoredList = studentScores.filter(s => s.finalScore !== null);
  const classAvgScore = scoredList.length > 0
    ? Math.round(scoredList.reduce((acc, curr) => acc + curr.finalScore, 0) / scoredList.length)
    : 0;

  const distinctionsCount = studentScores.filter(s => ['D1', 'D2', 'A'].includes(s.grade)).length;
  const creditsCount = studentScores.filter(s => ['C3', 'C4', 'C5', 'C6', 'B', 'C'].includes(s.grade)).length;
  const passesCount = studentScores.filter(s => ['P7', 'P8', 'D', 'E', 'O'].includes(s.grade)).length;
  const failsCount = studentScores.filter(s => ['F9', 'F'].includes(s.grade)).length;

  return (
    <div className="space-y-8 text-left">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-800 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="p-2.5 bg-white/20 rounded-2xl text-white backdrop-blur-sm shadow-inner">
                <BookOpen className="w-7 h-7" />
              </span>
              <div>
                <span className="text-[11px] uppercase tracking-widest text-sky-200 font-bold block">Teacher Academic Portal</span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-outfit leading-none">
                  {currentUser?.name || 'Subject Teacher'} &mdash; {currentSchool?.name}
                </h1>
              </div>
            </div>
            <p className="text-sky-100 text-sm max-w-xl font-medium mt-1">
              Enter BOT, MOT, and EOT scores. Dynamic UNEB grading engines calculate weighted percentages and grades in real-time.
            </p>
          </div>

          {/* Quick Save Action Button */}
          <button
            onClick={handleSaveAll}
            className="bg-slate-900 hover:bg-slate-950 text-white font-bold px-7 py-3.5 rounded-2xl shadow-xl transition-all flex items-center space-x-2 shrink-0 text-sm border border-slate-800 hover:scale-105 active:scale-95"
          >
            <Save className="w-5 h-5 text-sky-400" />
            <span>Save Marks & Comments</span>
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {savedSuccess && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-800 p-4 rounded-2xl flex items-center space-x-3 text-sm font-bold shadow-sm animate-pulse">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Subject marks and remarks successfully saved to PostgreSQL database!</span>
        </div>
      )}

      {/* Responsive Mobile Tab Navigation Slider (Visible on mobile/tablet, hidden on desktop) */}
      <div className="lg:hidden bg-white border border-slate-200 rounded-2xl p-2 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase text-slate-400 px-2 tracking-wider">
            Quick Navigation:
          </span>
          <button
            onClick={handleSaveAll}
            className="px-3 py-1 bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1 shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Marks</span>
          </button>
        </div>
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar scroll-smooth">
          {[
            { id: 'marks', label: 'Marks Entry Grid', icon: FileSpreadsheet },
            { id: 'ncdc', label: 'NCDC Continuous Assessment (AoI)', icon: Target },
            { id: 'remarks', label: 'Class Remarks', icon: MessageSquareQuote },
            { id: 'analytics', label: 'Performance Analytics', icon: BarChart3 },
            { id: 'roster', label: 'Students Roster', icon: Users },
            { id: 'grading', label: 'Grading Scales', icon: HelpCircle }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-sm font-extrabold'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Two-Column Layout with Categorized Left Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sidebar Menu */}
        <aside className="hidden lg:block lg:col-span-3 space-y-4 lg:sticky lg:top-20">
          
          {/* Quick Action Panel in Sidebar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
              Quick Subject Actions
            </span>
            <button
              onClick={handleSaveAll}
              className="w-full px-3.5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-between shadow-sm group"
            >
              <div className="flex items-center space-x-2">
                <Save className="w-4 h-4" />
                <span>Save All Marks</span>
              </div>
              <Sparkles className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
            </button>
          </div>

          {/* Current Selection Context Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                Active Context
              </span>
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full font-bold">
                {enrolledStudents.length} Students
              </span>
            </div>

            <div>
              <div className="text-sm font-bold text-white font-outfit">
                {activeSubject ? `[${activeSubject.code}] ${activeSubject.name}` : 'Select Subject'}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {currentClass?.name} &bull; Stream {selectedStream}
              </div>
            </div>

            {/* Quick Class / Stream / Subject Switcher Dropdowns */}
            <div className="space-y-2 pt-2 border-t border-slate-700">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1">Class Level</label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {schoolClasses.map(cls => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name} ({cls.level})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Stream</label>
                  <select
                    value={selectedStream}
                    onChange={(e) => setSelectedStream(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    {availableStreams.map(st => (
                      <option key={st} value={st}>Stream {st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1">Student</label>
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500 truncate"
                  >
                    {enrolledStudents.length === 0
                      ? <option value="">No students</option>
                      : enrolledStudents.map(stu => (
                        <option key={stu.id} value={stu.id}>{stu.name}</option>
                      ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Categorized Navigation Sidebar */}
          <nav className="bg-white border border-slate-200 rounded-3xl p-3 shadow-sm space-y-4">
            
            {/* Group 1: Mark Sheet & Grading */}
            <div>
              <span className="text-[10px] font-extrabold uppercase text-amber-800 tracking-wider px-3 py-1 block font-outfit">
                Mark Entry & Analysis
              </span>
              <div className="space-y-1 mt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('marks')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'marks'
                      ? 'bg-amber-500 text-white shadow-sm font-extrabold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <FileSpreadsheet className={`w-4 h-4 ${activeTab === 'marks' ? 'text-white' : 'text-amber-600'}`} />
                    <span>Mark Entry Grid</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                    activeTab === 'marks' ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {enrolledStudents.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('ncdc')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'ncdc'
                      ? 'bg-amber-500 text-white shadow-sm font-extrabold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Target className={`w-4 h-4 ${activeTab === 'ncdc' ? 'text-white' : 'text-emerald-600'}`} />
                    <span>NCDC Assessment (AoI)</span>
                  </div>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-extrabold ${
                    activeTab === 'ncdc' ? 'bg-white/25 text-white' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}>
                    20% UNEB
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('remarks')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'remarks'
                      ? 'bg-amber-500 text-white shadow-sm font-extrabold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <MessageSquareQuote className={`w-4 h-4 ${activeTab === 'remarks' ? 'text-white' : 'text-amber-600'}`} />
                    <span>Class Remarks</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                    activeTab === 'remarks' ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {enrolledStudents.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('analytics')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'analytics'
                      ? 'bg-amber-500 text-white shadow-sm font-extrabold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <BarChart3 className={`w-4 h-4 ${activeTab === 'analytics' ? 'text-white' : 'text-indigo-600'}`} />
                    <span>Subject Analytics</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                    activeTab === 'analytics' ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {classAvgScore}% Avg
                  </span>
                </button>
              </div>
            </div>

            {/* Group 2: Student Rosters & Standards */}
            <div className="border-t border-slate-100 pt-3">
              <span className="text-[10px] font-extrabold uppercase text-amber-800 tracking-wider px-3 py-1 block font-outfit">
                Roster & References
              </span>
              <div className="space-y-1 mt-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('roster')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'roster'
                      ? 'bg-amber-500 text-white shadow-sm font-extrabold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Users className={`w-4 h-4 ${activeTab === 'roster' ? 'text-white' : 'text-blue-600'}`} />
                    <span>Class Student Roster</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                    activeTab === 'roster' ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}>
                    {enrolledStudents.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('grading')}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeTab === 'grading'
                      ? 'bg-amber-500 text-white shadow-sm font-extrabold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Award className={`w-4 h-4 ${activeTab === 'grading' ? 'text-white' : 'text-emerald-600'}`} />
                    <span>UNEB Grading Scale</span>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                    activeTab === 'grading' ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    Official
                  </span>
                </button>
              </div>
            </div>

          </nav>
        </aside>

        {/* Right Main Content Area */}
        <main className="lg:col-span-9 space-y-6 min-w-0">

          {/* TAB 1: MARK ENTRY GRID */}
          {activeTab === 'marks' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">

              {/* Header bar */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 font-outfit">
                    Mark Sheet — {currentClass?.name} ({selectedStream})
                  </h3>
                  {selectedStudent && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono text-amber-700 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">{selectedStudent.lin}</span>
                      <span className="text-sm font-bold text-slate-800">{selectedStudent.name}</span>
                    </div>
                  )}
                  <p className="text-[11px] text-slate-400 mt-1">
                    BOT {currentSchool.botWeight || 20}% · MOT {currentSchool.motWeight || 20}% · EOT {currentSchool.eotWeight || 60}%
                    {isClassALevel && <span className="ml-2 text-indigo-500 font-semibold">· A-Level: Paper 1 &amp; 2 averaged per subject</span>}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {savedSuccess && (
                    <span className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                      ✓ Saved
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    title="Download offline Excel mark sheet template for this class"
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0"
                  >
                    <DownloadCloud className="w-3.5 h-3.5 text-slate-600" />
                    <span>Download Sheet</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setExcelParsedSummary(null);
                      setExcelUploadError(null);
                      setIsExcelModalOpen(true);
                    }}
                    title="Upload marks spreadsheet (.xlsx) to bulk update all students"
                    className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0"
                  >
                    <FileUp className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Import Excel</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAutoGenerateSubjectRemarks}
                    disabled={!selectedStudentId}
                    title="Auto-generate constructive remarks for all subjects based on student scores"
                    className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 disabled:opacity-40 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Auto-Suggest Remarks</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAll}
                    disabled={!selectedStudentId}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm shrink-0"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save All Marks</span>
                  </button>
                </div>
              </div>

              {enrolledStudents.length === 0 ? (
                <div className="p-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                  <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="font-bold text-slate-700">No students registered in {currentClass?.name} ({selectedStream}).</p>
                  <p className="text-xs text-slate-500 mt-1">Please use the School Admin dashboard to enroll students.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="border-collapse text-xs w-full" style={{ borderSpacing: 0 }}>
                    <thead>
                      <tr className="bg-slate-900 text-white font-outfit uppercase">
                        <th rowSpan={2} className="p-2.5 text-left min-w-[160px] border border-slate-700 font-bold text-[11px]">
                          Subject
                        </th>
                        <th colSpan={2} className="p-2 text-center border border-slate-700 bg-sky-900 text-sky-200 font-bold text-[11px]">
                          BOT ({currentSchool.botWeight || 20}%)
                        </th>
                        <th colSpan={2} className="p-2 text-center border border-slate-700 bg-indigo-900 text-indigo-200 font-bold text-[11px]">
                          MOT ({currentSchool.motWeight || 20}%)
                        </th>
                        <th colSpan={2} className="p-2 text-center border border-slate-700 bg-purple-900 text-purple-200 font-bold text-[11px]">
                          EOT ({currentSchool.eotWeight || 60}%)
                        </th>
                        <th rowSpan={2} className="p-2.5 text-center border border-slate-700 bg-amber-700 text-amber-100 font-bold text-[11px] w-16">
                          Final %
                        </th>
                        <th rowSpan={2} className="p-2.5 text-center border border-slate-700 font-bold text-[11px] w-14">
                          Grade
                        </th>
                        <th rowSpan={2} className="p-2.5 text-left border border-slate-700 font-bold text-[11px] min-w-[160px]">
                          Remark
                        </th>
                      </tr>
                      <tr className="bg-slate-800 text-slate-300 text-[11px] font-bold font-outfit uppercase">
                        <th className="py-1.5 px-2 text-center border border-slate-700 bg-sky-900/60 w-14">1</th>
                        <th className="py-1.5 px-2 text-center border border-slate-700 bg-sky-900/60 w-14">2</th>
                        <th className="py-1.5 px-2 text-center border border-slate-700 bg-indigo-900/60 w-14">1</th>
                        <th className="py-1.5 px-2 text-center border border-slate-700 bg-indigo-900/60 w-14">2</th>
                        <th className="py-1.5 px-2 text-center border border-slate-700 bg-purple-900/60 w-14">1</th>
                        <th className="py-1.5 px-2 text-center border border-slate-700 bg-purple-900/60 w-14">2</th>
                      </tr>
                    </thead>
                    <tbody>
                      {availableSubjects.map((sub, idx) => {
                        const data = gridData[sub.id] || {};
                        const twoPapers = isSubjectTwoPapers(sub);

                        // Compute live averaged values
                        let botVal = null, motVal = null, eotVal = null;
                        if (twoPapers) {
                          const b1 = data.bot1 !== '' && data.bot1 !== null && data.bot1 !== undefined ? Number(data.bot1) : null;
                          const b2 = data.bot2 !== '' && data.bot2 !== null && data.bot2 !== undefined ? Number(data.bot2) : null;
                          const m1 = data.mot1 !== '' && data.mot1 !== null && data.mot1 !== undefined ? Number(data.mot1) : null;
                          const m2 = data.mot2 !== '' && data.mot2 !== null && data.mot2 !== undefined ? Number(data.mot2) : null;
                          const e1 = data.eot1 !== '' && data.eot1 !== null && data.eot1 !== undefined ? Number(data.eot1) : null;
                          const e2 = data.eot2 !== '' && data.eot2 !== null && data.eot2 !== undefined ? Number(data.eot2) : null;
                          botVal = (b1 !== null && b2 !== null) ? (b1 + b2) / 2 : (b1 ?? b2);
                          motVal = (m1 !== null && m2 !== null) ? (m1 + m2) / 2 : (m1 ?? m2);
                          eotVal = (e1 !== null && e2 !== null) ? (e1 + e2) / 2 : (e1 ?? e2);
                        } else {
                          botVal = data.bot !== '' && data.bot !== null && data.bot !== undefined ? Number(data.bot) : null;
                          motVal = data.mot !== '' && data.mot !== null && data.mot !== undefined ? Number(data.mot) : null;
                          eotVal = data.eot !== '' && data.eot !== null && data.eot !== undefined ? Number(data.eot) : null;
                        }

                        const finalScore = calculateWeightedFinalScore(botVal, motVal, eotVal, {
                          bot: currentSchool.botWeight || 20,
                          mot: currentSchool.motWeight || 20,
                          eot: currentSchool.eotWeight || 60
                        });

                        let liveGrade = '-';
                        if (finalScore !== null) {
                          if (isClassPrimary || currentSchool.levelType === 'PRIMARY') {
                            liveGrade = getPrimaryGrade(finalScore).grade;
                          } else if (isClassALevel || currentSchool.levelType === 'ALEVEL') {
                            liveGrade = getALevelSubjectGrade(finalScore, sub.isSubsidiary || isGeneralPaper(sub) || isSubmath(sub)).grade;
                          } else {
                            liveGrade = currentSchool.useNewCurriculum
                              ? getOLevelNewCurriculumGrade(botVal || 0, eotVal || finalScore).grade
                              : getOLevelClassicGrade(finalScore).grade;
                          }
                        }

                        const isSubsidiarySub = !twoPapers;
                        const rowBg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';

                        const inputCls = "w-12 bg-white border border-slate-300 text-center font-bold text-slate-900 rounded p-1 text-xs focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-400";

                        return (
                          <tr key={sub.id} style={{ backgroundColor: rowBg }} className="hover:bg-amber-50/30 transition-colors">
                            {/* Subject Name */}
                            <td className="border border-slate-200 px-2.5 py-1.5 font-bold text-slate-800 text-xs" style={{ fontFamily: "'Cambria', serif" }}>
                              <div className="flex items-center gap-1.5">
                                <span>{sub.name}</span>
                                {isSubsidiarySub && isClassALevel && (
                                  <span className="text-[9px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-1 py-0.5 rounded shrink-0">SUB</span>
                                )}
                              </div>
                            </td>

                            {/* BOT columns */}
                            <td className="border border-slate-200 p-1 text-center bg-sky-50/40">
                              {twoPapers ? (
                                <input type="number" min="0" max="100" placeholder="–" value={data.bot1 ?? ''} onChange={(e) => handleCellChange(sub.id, 'bot1', e.target.value)} className={inputCls} />
                              ) : (
                                <input type="number" min="0" max="100" placeholder="–" value={data.bot ?? ''} onChange={(e) => handleCellChange(sub.id, 'bot', e.target.value)} className={inputCls} />
                              )}
                            </td>
                            <td className="border border-slate-200 p-1 text-center bg-sky-50/40">
                              {twoPapers ? (
                                <input type="number" min="0" max="100" placeholder="–" value={data.bot2 ?? ''} onChange={(e) => handleCellChange(sub.id, 'bot2', e.target.value)} className={inputCls} />
                              ) : (
                                <span className="text-slate-300 text-[10px]">—</span>
                              )}
                            </td>

                            {/* MOT columns */}
                            <td className="border border-slate-200 p-1 text-center bg-indigo-50/40">
                              {twoPapers ? (
                                <input type="number" min="0" max="100" placeholder="–" value={data.mot1 ?? ''} onChange={(e) => handleCellChange(sub.id, 'mot1', e.target.value)} className={inputCls} />
                              ) : (
                                <input type="number" min="0" max="100" placeholder="–" value={data.mot ?? ''} onChange={(e) => handleCellChange(sub.id, 'mot', e.target.value)} className={inputCls} />
                              )}
                            </td>
                            <td className="border border-slate-200 p-1 text-center bg-indigo-50/40">
                              {twoPapers ? (
                                <input type="number" min="0" max="100" placeholder="–" value={data.mot2 ?? ''} onChange={(e) => handleCellChange(sub.id, 'mot2', e.target.value)} className={inputCls} />
                              ) : (
                                <span className="text-slate-300 text-[10px]">—</span>
                              )}
                            </td>

                            {/* EOT columns */}
                            <td className="border border-slate-200 p-1 text-center bg-purple-50/40">
                              {twoPapers ? (
                                <input type="number" min="0" max="100" placeholder="–" value={data.eot1 ?? ''} onChange={(e) => handleCellChange(sub.id, 'eot1', e.target.value)} className={inputCls} />
                              ) : (
                                <input type="number" min="0" max="100" placeholder="–" value={data.eot ?? ''} onChange={(e) => handleCellChange(sub.id, 'eot', e.target.value)} className={inputCls} />
                              )}
                            </td>
                            <td className="border border-slate-200 p-1 text-center bg-purple-50/40">
                              {twoPapers ? (
                                <input type="number" min="0" max="100" placeholder="–" value={data.eot2 ?? ''} onChange={(e) => handleCellChange(sub.id, 'eot2', e.target.value)} className={inputCls} />
                              ) : (
                                <span className="text-slate-300 text-[10px]">—</span>
                              )}
                            </td>

                            {/* Final Score */}
                            <td className="border border-slate-200 p-2 text-center font-black text-amber-900 bg-amber-50/50 text-xs">
                              {finalScore !== null ? finalScore.toFixed(1) : '—'}
                            </td>

                            {/* Grade Badge */}
                            <td className="border border-slate-200 p-2 text-center">
                              <span className={`px-2 py-0.5 rounded text-xs font-black ${
                                ['D1', 'D2', 'A'].includes(liveGrade) ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                                ['C3', 'C4', 'C5', 'C6', 'B', 'C'].includes(liveGrade) ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                                ['P7', 'P8', 'D', 'E', 'O'].includes(liveGrade) ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                                liveGrade === '-' ? 'bg-slate-100 text-slate-400' : 'bg-rose-100 text-rose-800 border border-rose-300'
                              }`}>
                                {liveGrade}
                              </span>
                            </td>

                            {/* Remark */}
                            <td className="border border-slate-200 p-1">
                              <input
                                type="text"
                                placeholder="Teacher remark…"
                                value={data.comment ?? ''}
                                onChange={(e) => handleCellChange(sub.id, 'comment', e.target.value)}
                                className="w-full bg-white border border-slate-200 text-xs text-slate-700 rounded p-1.5 focus:outline-none focus:border-amber-400"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SUBJECT PERFORMANCE ANALYTICS */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              
              {/* Analytics Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                  <span className="text-xs text-slate-500 font-bold uppercase">Class Average Score</span>
                  <div className="text-3xl font-extrabold text-slate-900 font-outfit mt-1">{classAvgScore}%</div>
                  <div className="text-xs text-emerald-600 font-semibold mt-1">Weighted Term Average</div>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                  <span className="text-xs text-slate-500 font-bold uppercase">Distinctions (D1-D2 / A)</span>
                  <div className="text-3xl font-extrabold text-emerald-600 font-outfit mt-1">{distinctionsCount}</div>
                  <div className="text-xs text-slate-500 mt-1">Top scoring students</div>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                  <span className="text-xs text-slate-500 font-bold uppercase">Credits (C3-C6 / B-C)</span>
                  <div className="text-3xl font-extrabold text-blue-600 font-outfit mt-1">{creditsCount}</div>
                  <div className="text-xs text-slate-500 mt-1">Competent passes</div>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                  <span className="text-xs text-slate-500 font-bold uppercase">Passes & Fails</span>
                  <div className="text-3xl font-extrabold text-amber-600 font-outfit mt-1">{passesCount + failsCount}</div>
                  <div className="text-xs text-slate-500 mt-1">{passesCount} Pass &bull; {failsCount} Fail</div>
                </div>
              </div>

              {/* Student Performance Ranking Table */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="text-lg font-bold text-slate-900 font-outfit">
                    Subject Score Distribution &amp; Rankings
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">Sorted by Final Score</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-outfit uppercase border-b border-slate-200">
                        <th className="p-3 w-12 text-center">Rank</th>
                        <th className="p-3">LIN</th>
                        <th className="p-3">Student Name</th>
                        <th className="p-3 text-center">BOT</th>
                        <th className="p-3 text-center">MOT</th>
                        <th className="p-3 text-center">EOT</th>
                        <th className="p-3 text-center font-bold">Final Score</th>
                        <th className="p-3 text-center font-bold">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {[...studentScores]
                        .sort((a, b) => (b.finalScore || 0) - (a.finalScore || 0))
                        .map((item, idx) => (
                          <tr key={item.student.id} className="hover:bg-slate-50">
                            <td className="p-3 text-center font-bold font-mono text-slate-600">{idx + 1}</td>
                            <td className="p-3 font-mono text-amber-700 font-bold">{item.student.lin}</td>
                            <td className="p-3 font-bold text-slate-900">{item.student.name}</td>
                            <td className="p-3 text-center font-medium">{gridData[item.student.id]?.bot || '-'}</td>
                            <td className="p-3 text-center font-medium">{gridData[item.student.id]?.mot || '-'}</td>
                            <td className="p-3 text-center font-medium">{gridData[item.student.id]?.eot || '-'}</td>
                            <td className="p-3 text-center font-black text-amber-900 bg-amber-50/50">
                              {item.finalScore !== null ? `${item.finalScore}%` : '-'}
                            </td>
                            <td className="p-3 text-center">
                              <span className="px-2 py-0.5 rounded font-black text-xs bg-slate-100 text-slate-800 border border-slate-300">
                                {item.grade}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: STUDENT ROSTER */}
          {activeTab === 'roster' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 font-outfit">
                    Enrolled Students: {currentClass?.name} ({selectedStream})
                  </h3>
                  <p className="text-xs text-slate-500">Official student roster for the active teaching class.</p>
                </div>
                <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-bold border border-amber-300">
                  {enrolledStudents.length} Students
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-outfit uppercase border-b border-slate-200">
                      <th className="p-3 w-12 text-center">#</th>
                      <th className="p-3">LIN</th>
                      <th className="p-3">Full Name</th>
                      <th className="p-3">Gender</th>
                      <th className="p-3">Combination / Level</th>
                      <th className="p-3">House</th>
                      <th className="p-3">Days Present</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {enrolledStudents.map((std, idx) => (
                      <tr key={std.id} className="hover:bg-slate-50">
                        <td className="p-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="p-3 font-mono text-amber-700 font-bold">{std.lin}</td>
                        <td className="p-3 font-bold text-slate-900">{std.name}</td>
                        <td className="p-3 text-slate-600">{std.gender === 'M' ? 'Male' : 'Female'}</td>
                        <td className="p-3 text-slate-700 font-semibold">{std.combination || currentClass?.level || 'O-Level'}</td>
                        <td className="p-3 text-slate-600">{std.house || 'General'}</td>
                        <td className="p-3 text-slate-700 font-mono">{std.daysPresent || 90} / {std.totalSchoolDays || 90} days</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: CLASS TEACHER REMARKS ENTRY */}
          {activeTab === 'remarks' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 font-outfit flex items-center gap-2">
                    <MessageSquareQuote className="w-5 h-5 text-amber-500" />
                    <span>Class Teacher &amp; Head Teacher Remarks</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Write customized report card remarks for individual students or batch-apply to the whole class: <strong className="text-slate-800">{currentClass?.name} ({selectedStream})</strong>.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAutoGenerateAllRemarks}
                    title="Auto-generate holistic Class Teacher & Head Teacher remarks for all students based on their computed grades and performance"
                    className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm shrink-0"
                  >
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>✨ Auto-Generate All Remarks</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveAllRemarks}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shadow-sm shrink-0"
                  >
                    <Save className="w-4 h-4 text-sky-400" />
                    <span>Save All Remarks</span>
                  </button>
                </div>
              </div>

              {remarksSavedFeedback && (
                <div className="p-3.5 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex items-center space-x-2 shadow-xs">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{remarksSavedFeedback}</span>
                </div>
              )}

              {/* Bulk Remarks Generator Box */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50/60 border border-amber-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <h4 className="text-xs font-extrabold text-amber-950 uppercase tracking-wide">
                      Bulk Group Remarks Tool ({enrolledStudents.length} Students)
                    </h4>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-slate-600">Target:</span>
                    <button
                      type="button"
                      onClick={() => setBulkRemarkType('classTeacher')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        bulkRemarkType === 'classTeacher'
                          ? 'bg-amber-500 text-white shadow-2xs'
                          : 'bg-white text-slate-700 border border-amber-200'
                      }`}
                    >
                      Class Teacher Remark
                    </button>
                    <button
                      type="button"
                      onClick={() => setBulkRemarkType('headTeacher')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        bulkRemarkType === 'headTeacher'
                          ? 'bg-amber-500 text-white shadow-2xs'
                          : 'bg-white text-slate-700 border border-amber-200'
                      }`}
                    >
                      Head Teacher Comment
                    </button>
                  </div>
                </div>

                <div>
                  <textarea
                    rows={2}
                    value={bulkRemarkText}
                    onChange={(e) => setBulkRemarkText(e.target.value)}
                    placeholder="Enter custom remark text to apply across all students..."
                    className="w-full bg-white border border-amber-300 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:border-amber-500 font-medium shadow-2xs"
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] text-amber-900 font-extrabold uppercase tracking-wider block">
                    Quick Preset Remark Suggestions (Click to insert &amp; apply):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Outstanding academic achievement recorded this term. Consistently disciplined and inquisitive.',
                      'Very good performance. Polite, hard working, and demonstrates high classroom engagement.',
                      'Good effort shown throughout the term. Strive for higher consistency in revision.',
                      'Fair performance recorded. Needs to dedicate more time to independent study and exercises.',
                      'Capable of achieving higher grades. Urged to stay focused and avoid distractions.'
                    ].map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setBulkRemarkText(preset);
                          handleApplyBulkRemark(preset);
                        }}
                        className="text-[10px] px-2.5 py-1 bg-white hover:bg-amber-500 hover:text-white border border-amber-300 rounded-lg text-amber-950 font-medium transition-all shadow-2xs text-left"
                      >
                        "{preset.slice(0, 48)}..."
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => handleApplyBulkRemark()}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Apply Custom Text to All ({enrolledStudents.length}) Students</span>
                  </button>
                </div>
              </div>

              {/* Individual Student Remarks List */}
              {enrolledStudents.length === 0 ? (
                <div className="p-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                  <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="font-bold text-slate-700">No students found in {currentClass?.name} ({selectedStream}).</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                      Individual Student Remarks ({enrolledStudents.length})
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                    {enrolledStudents.map((std, index) => {
                      const rem = remarksData[std.id] || { classTeacherRemark: '', headTeacherRemark: '' };

                      return (
                        <div key={std.id} className="p-4 hover:bg-slate-50/80 transition-colors space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center space-x-3">
                              <span className="w-6 h-6 rounded-full bg-slate-100 border border-slate-300 text-slate-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                                {index + 1}
                              </span>
                              <div>
                                <span className="font-bold text-slate-900 text-sm font-outfit">{std.name}</span>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                                  <span>LIN: <strong className="text-amber-700">{std.lin}</strong></span>
                                  {std.combination && <span className="text-indigo-600 font-semibold bg-indigo-50 px-1.5 rounded">[{std.combination}]</span>}
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleSaveSingleRemark(std.id)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-amber-500 hover:text-white border border-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 shrink-0 self-end sm:self-auto shadow-2xs"
                            >
                              <Save className="w-3 h-3" />
                              <span>Save Remark</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pt-1">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                                <span>Class Teacher's Remark</span>
                                <span className="text-[9px] text-slate-400 font-normal">Printed on report card</span>
                              </label>
                              <textarea
                                rows={2}
                                value={rem.classTeacherRemark || ''}
                                onChange={(e) => handleRemarkFieldChange(std.id, 'classTeacherRemark', e.target.value)}
                                placeholder={`e.g. ${std.name} is polite, disciplined, and very hard working.`}
                                className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center justify-between">
                                <span>Head Teacher's Comment</span>
                                <span className="text-[9px] text-slate-400 font-normal">Optional</span>
                              </label>
                              <textarea
                                rows={2}
                                value={rem.headTeacherRemark || ''}
                                onChange={(e) => handleRemarkFieldChange(std.id, 'headTeacherRemark', e.target.value)}
                                placeholder="e.g. An encouraging performance recorded this term."
                                className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
                              />
                            </div>
                          </div>

                          {/* Quick 1-Click Pill Suggestions for this student */}
                          <div className="flex flex-wrap gap-1 items-center pt-0.5">
                            <span className="text-[9px] text-slate-400 font-bold uppercase mr-1">Quick Fill:</span>
                            {[
                              `${std.name} is polite, hardworking, and disciplined. Demonstrates high classroom engagement.`,
                              `Excellent performance recorded. Keep up the high standard of academic excellence!`,
                              `Good progress made. More consistent revision in weak subject areas will yield top results.`,
                              `Has good potential. Needs to concentrate more and complete all holiday assignments.`
                            ].map((preset, pIdx) => (
                              <button
                                key={pIdx}
                                type="button"
                                onClick={() => handleRemarkFieldChange(std.id, 'classTeacherRemark', preset)}
                                className="text-[9.5px] px-2 py-0.5 bg-slate-50 hover:bg-amber-100 hover:text-amber-900 text-slate-600 rounded border border-slate-200 transition-colors"
                              >
                                {preset.slice(0, 32)}...
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB: NCDC CONTINUOUS ASSESSMENT (AoI 20% + SUMMATIVE 80%) */}
          {activeTab === 'ncdc' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                      NCDC Lower Secondary Framework
                    </span>
                    <span className="text-xs text-slate-400">&bull;</span>
                    <span className="text-xs font-bold text-slate-600">UNEB 20% Formative Roll-up</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 font-outfit mt-1 flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-600" />
                    <span>Continuous Assessment &amp; Activities of Integration (AoI)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Record formative Activities of Integration (AoI) scaled to <strong className="text-slate-800">20%</strong> for direct UNEB e-portal upload + <strong className="text-slate-800">80%</strong> Summative examination.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSaveNCDC}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shadow-sm shrink-0"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save NCDC Marks</span>
                  </button>
                </div>
              </div>

              {ncdcSavedFeedback && (
                <div className="p-3.5 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex items-center space-x-2 shadow-xs">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{ncdcSavedFeedback}</span>
                </div>
              )}

              {/* Controls Bar: Subject Selector & Scale Mode */}
              <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">Assessment Subject</label>
                    <select
                      value={ncdcSubjectId}
                      onChange={(e) => setNcdcSubjectId(e.target.value)}
                      className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-emerald-500"
                    >
                      {availableSubjects.map(s => (
                        <option key={s.id} value={s.id}>[{s.code}] {s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase text-slate-500 mb-1">AoI Entry Scale</label>
                    <div className="flex items-center bg-white border border-slate-300 rounded-xl p-0.5">
                      <button
                        type="button"
                        onClick={() => setNcdcScaleMode('3.0')}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                          ncdcScaleMode === '3.0' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        3.0 Scale (NCDC Rubric)
                      </button>
                      <button
                        type="button"
                        onClick={() => setNcdcScaleMode('100')}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                          ncdcScaleMode === '100' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        100% Scale
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick UNEB Summary Pills */}
                <div className="flex items-center gap-2">
                  <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-center">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Formative Weight</span>
                    <span className="text-xs font-black text-emerald-700">20% (UNEB)</span>
                  </div>
                  <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-center">
                    <span className="text-[9px] text-slate-400 font-bold uppercase block">Summative Weight</span>
                    <span className="text-xs font-black text-blue-700">80% (End Term)</span>
                  </div>
                </div>
              </div>

              {/* Table of Students */}
              {enrolledStudents.length === 0 ? (
                <div className="p-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                  <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className="font-bold text-slate-700">No students registered in {currentClass?.name} ({selectedStream}).</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-900 text-white font-outfit uppercase">
                        <th rowSpan={2} className="p-2.5 text-center w-10 border border-slate-700">#</th>
                        <th rowSpan={2} className="p-2.5 min-w-[150px] border border-slate-700">Student Particulars</th>
                        <th colSpan={3} className="p-2 text-center border border-slate-700 bg-emerald-950 text-emerald-300 font-bold">
                          Activities of Integration (AoI - {ncdcScaleMode === '3.0' ? 'Max 3.0' : '100%'})
                        </th>
                        <th rowSpan={2} className="p-2 text-center border border-slate-700 bg-emerald-900 text-emerald-200 font-bold w-20">
                          Formative (20%)
                        </th>
                        <th rowSpan={2} className="p-2 text-center border border-slate-700 bg-blue-950 text-blue-300 font-bold w-20">
                          Summative (100)
                        </th>
                        <th rowSpan={2} className="p-2 text-center border border-slate-700 bg-blue-900 text-blue-200 font-bold w-20">
                          Summative (80%)
                        </th>
                        <th rowSpan={2} className="p-2 text-center border border-slate-700 bg-amber-800 text-amber-100 font-bold w-20">
                          Total (100%)
                        </th>
                        <th rowSpan={2} className="p-2 text-center border border-slate-700 font-bold w-16">
                          Score / 3.0
                        </th>
                        <th rowSpan={2} className="p-2.5 min-w-[160px] border border-slate-700">
                          NCDC Competency Band
                        </th>
                      </tr>
                      <tr className="bg-slate-800 text-slate-300 text-[11px] font-bold font-outfit uppercase">
                        <th className="py-1 px-2 text-center border border-slate-700 bg-emerald-900/60 w-16">AoI 1</th>
                        <th className="py-1 px-2 text-center border border-slate-700 bg-emerald-900/60 w-16">AoI 2</th>
                        <th className="py-1 px-2 text-center border border-slate-700 bg-emerald-900/60 w-16">AoI 3</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {enrolledStudents.map((std, idx) => {
                        const rec = ncdcData[std.id] || {};
                        const aois = [rec.aoi1, rec.aoi2, rec.aoi3].filter(v => v !== '' && v !== undefined && v !== null);
                        const result = calculateNCDCContinuousAssessment(aois, rec.summative, ncdcScaleMode === '3.0');

                        return (
                          <tr key={std.id} className="hover:bg-slate-50">
                            <td className="p-2 text-center text-slate-400 font-mono border border-slate-200">{idx + 1}</td>
                            <td className="p-2 border border-slate-200">
                              <div className="font-bold text-slate-900">{std.name}</div>
                              <div className="text-[10px] font-mono text-amber-700">LIN: {std.lin}</div>
                            </td>

                            {/* AoI 1 */}
                            <td className="p-1 border border-slate-200 text-center bg-emerald-50/30">
                              <input
                                type="number"
                                step={ncdcScaleMode === '3.0' ? '0.1' : '1'}
                                min="0"
                                max={ncdcScaleMode === '3.0' ? '3.0' : '100'}
                                placeholder="–"
                                value={rec.aoi1 ?? ''}
                                onChange={(e) => handleNCDCChange(std.id, 'aoi1', e.target.value)}
                                className="w-14 text-center bg-white border border-slate-200 rounded p-1 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                              />
                            </td>

                            {/* AoI 2 */}
                            <td className="p-1 border border-slate-200 text-center bg-emerald-50/30">
                              <input
                                type="number"
                                step={ncdcScaleMode === '3.0' ? '0.1' : '1'}
                                min="0"
                                max={ncdcScaleMode === '3.0' ? '3.0' : '100'}
                                placeholder="–"
                                value={rec.aoi2 ?? ''}
                                onChange={(e) => handleNCDCChange(std.id, 'aoi2', e.target.value)}
                                className="w-14 text-center bg-white border border-slate-200 rounded p-1 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                              />
                            </td>

                            {/* AoI 3 */}
                            <td className="p-1 border border-slate-200 text-center bg-emerald-50/30">
                              <input
                                type="number"
                                step={ncdcScaleMode === '3.0' ? '0.1' : '1'}
                                min="0"
                                max={ncdcScaleMode === '3.0' ? '3.0' : '100'}
                                placeholder="–"
                                value={rec.aoi3 ?? ''}
                                onChange={(e) => handleNCDCChange(std.id, 'aoi3', e.target.value)}
                                className="w-14 text-center bg-white border border-slate-200 rounded p-1 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                              />
                            </td>

                            {/* Formative 20% (UNEB Submission Score) */}
                            <td className="p-2 border border-slate-200 text-center font-extrabold text-emerald-800 bg-emerald-50/50">
                              {result.formative20Score !== null ? `${result.formative20Score}%` : '—'}
                            </td>

                            {/* Summative 100 Raw Input */}
                            <td className="p-1 border border-slate-200 text-center bg-blue-50/30">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                placeholder="–"
                                value={rec.summative ?? ''}
                                onChange={(e) => handleNCDCChange(std.id, 'summative', e.target.value)}
                                className="w-16 text-center bg-white border border-slate-200 rounded p-1 text-xs font-bold text-slate-800 focus:outline-none focus:border-blue-500"
                              />
                            </td>

                            {/* Summative 80% */}
                            <td className="p-2 border border-slate-200 text-center font-bold text-blue-800 bg-blue-50/50">
                              {result.summative80Score !== null ? `${result.summative80Score}%` : '—'}
                            </td>

                            {/* Composite 100% */}
                            <td className="p-2 border border-slate-200 text-center font-black text-amber-900 bg-amber-50/60">
                              {result.compositeScore100 !== null ? `${result.compositeScore100}%` : '—'}
                            </td>

                            {/* Score / 3.0 */}
                            <td className="p-2 border border-slate-200 text-center font-bold text-slate-800 font-mono">
                              {result.scoreOutOf3 !== null ? result.scoreOutOf3.toFixed(1) : '—'}
                            </td>

                            {/* Competency Band */}
                            <td className="p-2 border border-slate-200">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold block text-center truncate ${
                                result.badgeColor === 'emerald' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                                result.badgeColor === 'blue' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                                result.badgeColor === 'amber' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                                'bg-slate-100 text-slate-500'
                              }`}>
                                {result.band}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: UNEB GRADING SCALE REFERENCE */}
          {activeTab === 'grading' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="border-b border-slate-200 pb-3">
                <h3 className="text-lg font-bold text-slate-900 font-outfit">
                  UNEB Official Grading Frameworks
                </h3>
                <p className="text-xs text-slate-500">Uganda National Examinations Board grading standard scales for Primary, O'Level, and A'Level.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Scale 1: O-Level Classic / PLE */}
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
                  <h4 className="text-sm font-bold text-amber-900 font-outfit uppercase tracking-wider">
                    PLE &amp; Classic UCE O-Level (9-Point Scale)
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs bg-white rounded-xl overflow-hidden border border-slate-200">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <th className="p-2.5">Score Range</th>
                          <th className="p-2.5 text-center">Grade</th>
                          <th className="p-2.5">Descriptor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr><td className="p-2">80% &ndash; 100%</td><td className="p-2 text-center font-bold text-emerald-700">D1</td><td className="p-2 text-slate-600">Distinction 1</td></tr>
                        <tr><td className="p-2">75% &ndash; 79%</td><td className="p-2 text-center font-bold text-emerald-700">D2</td><td className="p-2 text-slate-600">Distinction 2</td></tr>
                        <tr><td className="p-2">66% &ndash; 74%</td><td className="p-2 text-center font-bold text-blue-700">C3</td><td className="p-2 text-slate-600">Credit 3</td></tr>
                        <tr><td className="p-2">60% &ndash; 65%</td><td className="p-2 text-center font-bold text-blue-700">C4</td><td className="p-2 text-slate-600">Credit 4</td></tr>
                        <tr><td className="p-2">55% &ndash; 59%</td><td className="p-2 text-center font-bold text-blue-700">C5</td><td className="p-2 text-slate-600">Credit 5</td></tr>
                        <tr><td className="p-2">50% &ndash; 54%</td><td className="p-2 text-center font-bold text-blue-700">C6</td><td className="p-2 text-slate-600">Credit 6</td></tr>
                        <tr><td className="p-2">45% &ndash; 49%</td><td className="p-2 text-center font-bold text-amber-700">P7</td><td className="p-2 text-slate-600">Pass 7</td></tr>
                        <tr><td className="p-2">35% &ndash; 44%</td><td className="p-2 text-center font-bold text-amber-700">P8</td><td className="p-2 text-slate-600">Pass 8</td></tr>
                        <tr><td className="p-2">0% &ndash; 34%</td><td className="p-2 text-center font-bold text-rose-700">F9</td><td className="p-2 text-slate-600">Fail 9</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Scale 2: A-Level UACE 20-Point Scale */}
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
                  <h4 className="text-sm font-bold text-amber-900 font-outfit uppercase tracking-wider">
                    UACE A-Level (Principal &amp; Subsidiary)
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs bg-white rounded-xl overflow-hidden border border-slate-200">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <th className="p-2.5">Score Range</th>
                          <th className="p-2.5 text-center">Grade</th>
                          <th className="p-2.5 text-center">Points</th>
                          <th className="p-2.5">Principal Category</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr><td className="p-2">80% &ndash; 100%</td><td className="p-2 text-center font-bold text-emerald-700">A</td><td className="p-2 text-center font-bold text-emerald-700">6 pts</td><td className="p-2 text-slate-600">Principal Pass</td></tr>
                        <tr><td className="p-2">70% &ndash; 79%</td><td className="p-2 text-center font-bold text-emerald-700">B</td><td className="p-2 text-center font-bold text-emerald-700">5 pts</td><td className="p-2 text-slate-600">Principal Pass</td></tr>
                        <tr><td className="p-2">60% &ndash; 69%</td><td className="p-2 text-center font-bold text-blue-700">C</td><td className="p-2 text-center font-bold text-blue-700">4 pts</td><td className="p-2 text-slate-600">Principal Pass</td></tr>
                        <tr><td className="p-2">50% &ndash; 59%</td><td className="p-2 text-center font-bold text-blue-700">D</td><td className="p-2 text-center font-bold text-blue-700">3 pts</td><td className="p-2 text-slate-600">Principal Pass</td></tr>
                        <tr><td className="p-2">40% &ndash; 49%</td><td className="p-2 text-center font-bold text-amber-700">E</td><td className="p-2 text-center font-bold text-amber-700">2 pts</td><td className="p-2 text-slate-600">Principal Pass</td></tr>
                        <tr><td className="p-2">35% &ndash; 39%</td><td className="p-2 text-center font-bold text-amber-700">O</td><td className="p-2 text-center font-bold text-amber-700">1 pt</td><td className="p-2 text-slate-600">Subsidiary Pass</td></tr>
                        <tr><td className="p-2">0% &ndash; 34%</td><td className="p-2 text-center font-bold text-rose-700">F</td><td className="p-2 text-center font-bold text-rose-700">0 pts</td><td className="p-2 text-slate-600">Fail</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

      {/* Excel Marks Import Modal */}
      {isExcelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <FileUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-outfit">Import Marks from Spreadsheet</h3>
                  <p className="text-xs text-slate-500">{currentClass?.name} &bull; Stream {selectedStream}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsExcelModalOpen(false);
                  setExcelParsedSummary(null);
                  setExcelUploadError(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error Banner */}
            {excelUploadError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
                {excelUploadError}
              </div>
            )}

            {/* Dropzone & File Input */}
            {!excelParsedSummary ? (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/30 rounded-2xl p-8 text-center transition-all cursor-pointer relative">
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleProcessExcelFile(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center space-y-2 pointer-events-none">
                    <FileSpreadsheet className="w-10 h-10 text-emerald-600" />
                    <span className="text-sm font-bold text-slate-800">
                      {isParsingExcel ? 'Processing spreadsheet...' : 'Click to select or drag & drop .xlsx file'}
                    </span>
                    <span className="text-xs text-slate-400">
                      Accepts Excel (.xlsx, .xls) files generated from Mpumuza Analytics
                    </span>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start space-x-2.5 text-xs text-amber-900">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Tip for fastest results:</span>
                    <span>Download the pre-formatted mark sheet template using the <strong>"Download Sheet"</strong> button first, fill in your marks, and upload it here.</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Parsed Preview Screen */
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-900 font-bold text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Spreadsheet Processed Successfully!</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-emerald-800 pt-1">
                    <div className="bg-white/80 p-2 rounded-xl border border-emerald-100">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Students Matched</span>
                      <span className="text-lg font-black text-emerald-700">{excelParsedSummary.matchedStudentsCount}</span>
                    </div>
                    <div className="bg-white/80 p-2 rounded-xl border border-emerald-100">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Mark Entries Extracted</span>
                      <span className="text-lg font-black text-emerald-700">{excelParsedSummary.markEntriesCount}</span>
                    </div>
                  </div>
                </div>

                {/* Sample extracted entries preview */}
                {excelParsedSummary.markEntries.length > 0 && (
                  <div className="border border-slate-200 rounded-2xl overflow-hidden text-xs max-h-48 overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                      <thead className="bg-slate-100 text-slate-700 font-bold uppercase sticky top-0">
                        <tr>
                          <th className="p-2">Student</th>
                          <th className="p-2">Subject</th>
                          <th className="p-2 text-center">BOT</th>
                          <th className="p-2 text-center">MOT</th>
                          <th className="p-2 text-center">EOT</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {excelParsedSummary.markEntries.slice(0, 5).map((m, i) => (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-2 font-bold text-slate-900 truncate max-w-[120px]">{m.studentName}</td>
                            <td className="p-2 text-slate-600 truncate max-w-[120px]">{m.subjectName}</td>
                            <td className="p-2 text-center font-mono">{m.bot ?? '—'}</td>
                            <td className="p-2 text-center font-mono">{m.mot ?? '—'}</td>
                            <td className="p-2 text-center font-mono">{m.eot ?? '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="flex items-center justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setExcelParsedSummary(null)}
                    className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all"
                  >
                    Choose Another File
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyExcelMarks}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Apply &amp; Save ({excelParsedSummary.markEntriesCount}) Marks</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
