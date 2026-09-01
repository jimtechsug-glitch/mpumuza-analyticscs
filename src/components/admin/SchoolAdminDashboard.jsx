import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Modal from '../common/Modal';
import ReportCardView from '../reports/ReportCardView';
import BatchReportCardView from '../reports/BatchReportCardView';
import { downloadStudentTemplate, parseUploadedSpreadsheet } from '../../utils/excelHandler';
import {
  Users,
  GraduationCap,
  BookOpen,
  FileSpreadsheet,
  Plus,
  Printer,
  Settings,
  Upload,
  Download,
  UserPlus,
  Layers,
  DollarSign,
  Send,
  Lock,
  Unlock,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  Award,
  Sparkles,
  FileText,
  X,
  Trash2,
  Pencil,
  Ban,
  ShieldOff,
  ShieldCheck as ShieldOn,
  AlertTriangle,
  School,
  Save,
  MessageCircle
} from 'lucide-react';

export default function SchoolAdminDashboard() {
  const {
    currentSchool,
    students,
    users,
    subjects,
    classes,
    auditLogs,
    smsLogs,
    addSubject,
    deleteSubject,
    addTeacher,
    updateTeacher,
    deleteTeacher,
    blockUser,
    unblockUser,
    addStudent,
    updateStudent,
    deleteStudent,
    blockStudent,
    unblockStudent,
    updateFeeRecord,
    setBatchRequiredFeesForClass,
    updateAttendance,
    addBulkStudents,
    addClass,
    addStreamToClass,
    removeStreamFromClass,
    updateSchoolSettings,
    dispatchSMSForClass
  } = useAuth();

  // Guard: schools may still be loading from storage/Firebase
  if (!currentSchool) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-slate-500">
          <div className="w-10 h-10 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Loading school data…</p>
        </div>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState('students');
  const [selectedStudentForReport, setSelectedStudentForReport] = useState(null);
  const [batchClassForReport, setBatchClassForReport] = useState(null);
  const [reportTerm, setReportTerm] = useState('COMBINED');

  // Filter items for current school tenant
  const schoolStudents = students.filter(s => s.schoolId === currentSchool.id);
  const schoolTeachers = users.filter(u => u.schoolId === currentSchool.id && u.role === 'TEACHER');
  const schoolSubjects = subjects.filter(s => s.schoolId === currentSchool.id);
  const schoolClasses = classes.filter(c => c.schoolId === currentSchool.id);
  const schoolAuditLogs = auditLogs.filter(l => l.userId === currentSchool.id || l.userRole === 'SCHOOL_ADMIN' || l.userName.includes(currentSchool.name));

  // Subject Level sorting & filtering
  const [subjectLevelFilter, setSubjectLevelFilter] = useState('ALL');

  const getSubjectLevel = (sub) => {
    const cat = (sub.category || '').toLowerCase();
    const name = (sub.name || '').toLowerCase();
    const code = (sub.code || '').toLowerCase();
    if (cat.includes('primary') || currentSchool.levelType === 'PRIMARY') return 'Primary';
    if (
      cat.includes('a-level') ||
      cat.includes('alevel') ||
      cat.includes('uace') ||
      name.includes('a-level') ||
      name.includes('(principal') ||
      name.includes('subsidiary') ||
      name.includes('general paper') ||
      name.includes('submath') ||
      sub.isSubsidiary ||
      code.startsWith('p5') ||
      code.startsWith('p4') ||
      code.startsWith('p2') ||
      code.startsWith('p3') ||
      code.startsWith('s101') ||
      code.startsWith('s475') ||
      code.startsWith('s843')
    ) {
      return 'A-Level';
    }
    return 'O-Level';
  };

  const getSubjectLevelOrder = (sub) => {
    const lvl = getSubjectLevel(sub);
    if (lvl === 'Primary') return 1;
    if (lvl === 'O-Level') return 2;
    return 3; // A-Level
  };

  const sortedSchoolSubjects = [...schoolSubjects].sort((a, b) => {
    const levelA = getSubjectLevelOrder(a);
    const levelB = getSubjectLevelOrder(b);
    if (levelA !== levelB) return levelA - levelB;
    if (a.core && !b.core) return -1;
    if (!a.core && b.core) return 1;
    return (a.name || '').localeCompare(b.name || '');
  });

  const filteredSchoolSubjects = sortedSchoolSubjects.filter(sub => {
    if (subjectLevelFilter === 'ALL') return true;
    return getSubjectLevel(sub) === subjectLevelFilter;
  });

  const oLevelSubjectsCount = schoolSubjects.filter(s => getSubjectLevel(s) === 'O-Level').length;
  const aLevelSubjectsCount = schoolSubjects.filter(s => getSubjectLevel(s) === 'A-Level').length;
  const primarySubjectsCount = schoolSubjects.filter(s => getSubjectLevel(s) === 'Primary').length;

  // Modals state
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isEditTeacherModalOpen, setIsEditTeacherModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isEditStudentModalOpen, setIsEditStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isBatchReportModalOpen, setIsBatchReportModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  // Confirm action modal (delete / block)
  const [confirmAction, setConfirmAction] = useState(null); // { type, entity, record }

  // Forms data
  const defaultSubjectCategory = currentSchool.levelType === 'PRIMARY' ? 'Primary' : 'O-Level';
  const [subjectForm, setSubjectForm] = useState({
    code: '',
    name: '',
    core: false,
    isSubsidiary: false,
    category: defaultSubjectCategory
  });
  const [teacherForm, setTeacherForm] = useState({ 
    name: '', email: '', phone: '', password: 'teacher123', assignedClasses: [], assignedSubjects: [] 
  });
  const [editTeacherForm, setEditTeacherForm] = useState({
    name: '', email: '', phone: '', password: '', assignedClasses: [], assignedSubjects: []
  });
  const [studentForm, setStudentForm] = useState({
    name: '',
    lin: '',
    gender: 'M',
    classId: schoolClasses[0]?.id || '',
    stream: schoolClasses[0]?.streams?.[0] || 'North',
    combination: 'PCM / ICT',
    parentPhone: '',
    parentPin: '1234',
    house: 'Main',
    photoUrl: '',
    feeRequiredUGX: 1200000,
    feePaidUGX: 1200000
  });
  const [editStudentForm, setEditStudentForm] = useState({
    name: '',
    lin: '',
    gender: 'M',
    classId: '',
    stream: '',
    combination: '',
    parentPhone: '',
    parentPin: '1234',
    house: '',
    photoUrl: '',
    feeRequiredUGX: 1200000,
    feePaidUGX: 1200000
  });
  const [classForm, setClassForm] = useState({ name: '', level: 'O-Level', streams: 'North, South' });
  const [settingsForm, setSettingsForm] = useState({
    name: currentSchool.name || '',
    motto: currentSchool.motto || '',
    address: currentSchool.address || '',
    contactPhone: currentSchool.contactPhone || '',
    contactEmail: currentSchool.contactEmail || '',
    nextTermBegins: currentSchool.nextTermBegins || 'Monday, 14th September 2026',
    botWeight: currentSchool.botWeight || 20,
    motWeight: currentSchool.motWeight || 20,
    eotWeight: currentSchool.eotWeight || 60,
    headTeacher: currentSchool.headTeacher || '',
    headTeacherSignature: currentSchool.headTeacherSignature || '',
    dosName: currentSchool.dosName || 'Director of Studies',
    dosSignature: currentSchool.dosSignature || 'Director of Studies (DOS)',
    useNewCurriculum: currentSchool.useNewCurriculum || false,
    showPositionRanking: currentSchool.showPositionRanking !== false,
    themeColor: currentSchool.themeColor || 'navy',
    badgeUrl: currentSchool.badgeUrl || ''
  });
  const [settingsFeedback, setSettingsFeedback] = useState(null);

  // SMS Form
  const [smsClassId, setSmsClassId] = useState(schoolClasses[0]?.id || '');
  const [smsStream, setSmsStream] = useState('A');
  const [smsTerm, setSmsTerm] = useState('EOT');
  const [smsFeedback, setSmsFeedback] = useState(null);

  // Batch Report State
  const [batchClassId, setBatchClassId] = useState(schoolClasses[0]?.id || '');
  const [batchTerm, setBatchTerm] = useState('COMBINED');

  // Excel Bulk Upload State
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadClassId, setUploadClassId] = useState(schoolClasses[0]?.id || '');
  const [uploadStream, setUploadStream] = useState('A');
  const [uploadFeedback, setUploadFeedback] = useState(null);

  // Stream Inline Manager State
  const [streamInputs, setStreamInputs] = useState({});

  // Fees Configurator State
  const [feeConfigClassId, setFeeConfigClassId] = useState('ALL');
  const [feeConfigStream, setFeeConfigStream] = useState('ALL');
  const [feeConfigAmount, setFeeConfigAmount] = useState(currentSchool.levelType === 'PRIMARY' ? 650000 : 1250000);
  const [feeFeedback, setFeeFeedback] = useState(null);

  const handleApplyBatchFees = (e) => {
    e.preventDefault();
    const count = setBatchRequiredFeesForClass(feeConfigClassId, feeConfigStream, feeConfigAmount);
    setFeeFeedback(`Successfully updated required fees to UGX ${Number(feeConfigAmount).toLocaleString()} for ${count} students.`);
    setTimeout(() => setFeeFeedback(null), 5000);
  };

  const handleAddStreamToClass = (classId) => {
    const streamName = streamInputs[classId];
    if (!streamName || !streamName.trim()) return;
    addStreamToClass(classId, streamName.trim());
    setStreamInputs(prev => ({ ...prev, [classId]: '' }));
  };

  const handleRemoveStreamFromClass = (classId, streamName) => {
    if (window.confirm(`Are you sure you want to remove stream "${streamName}" from this class?`)) {
      removeStreamFromClass(classId, streamName);
    }
  };

  // Handlers
  const handleCreateSubject = (e) => {
    e.preventDefault();
    if (!subjectForm.name || !subjectForm.code) return;
    addSubject({ ...subjectForm, schoolId: currentSchool.id });
    setIsSubjectModalOpen(false);
    setSubjectForm({
      code: '',
      name: '',
      core: false,
      isSubsidiary: false,
      category: defaultSubjectCategory
    });
  };

  const handleDeleteSubject = (sub) => {
    if (window.confirm(`Are you sure you want to delete subject [${sub.code}] ${sub.name}?`)) {
      deleteSubject(sub.id);
    }
  };

  const handleCreateTeacher = (e) => {
    e.preventDefault();
    if (!teacherForm.name || !teacherForm.email) return;
    addTeacher({ ...teacherForm, schoolId: currentSchool.id });
    setIsTeacherModalOpen(false);
    setTeacherForm({ name: '', email: '', phone: '', password: 'teacher123', assignedClasses: [], assignedSubjects: [] });
  };

  const handleOpenEditTeacher = (tr) => {
    setEditingTeacher(tr);
    setEditTeacherForm({
      name: tr.name || '',
      email: tr.email || '',
      phone: tr.phone || '',
      password: tr.password || '',
      assignedClasses: tr.assignedClasses || [],
      assignedSubjects: tr.assignedSubjects || [],
    });
    setIsEditTeacherModalOpen(true);
  };

  const handleSaveEditTeacher = (e) => {
    e.preventDefault();
    if (!editingTeacher) return;
    updateTeacher(editingTeacher.id, editTeacherForm);
    setIsEditTeacherModalOpen(false);
    setEditingTeacher(null);
  };

  const handleConfirmAction = () => {
    if (!confirmAction) return;
    const { type, entity, record } = confirmAction;
    if (entity === 'teacher') {
      if (type === 'delete') deleteTeacher(record.id);
      else if (type === 'block') blockUser(record.id);
      else if (type === 'unblock') unblockUser(record.id);
    } else if (entity === 'student') {
      if (type === 'delete') deleteStudent(record.id);
      else if (type === 'block') blockStudent(record.id);
      else if (type === 'unblock') unblockStudent(record.id);
    }
    setConfirmAction(null);
  };


  const handleCreateStudent = (e) => {
    e.preventDefault();
    if (!studentForm.name) return;
    const targetClassId = studentForm.classId || schoolClasses[0]?.id;
    const selectedCls = schoolClasses.find(c => c.id === targetClassId) || schoolClasses[0];
    const isALevel = selectedCls?.level === 'A-Level' || ['S.5', 'S.6'].some(s => selectedCls?.name?.includes(s));
    
    addStudent({
      ...studentForm,
      classId: targetClassId,
      stream: studentForm.stream || selectedCls?.streams?.[0] || 'North',
      combination: isALevel ? (studentForm.combination || 'PCM / ICT') : '',
      parentPin: studentForm.parentPin ? studentForm.parentPin.trim() : '1234',
      schoolId: currentSchool.id
    });
    setIsStudentModalOpen(false);
    setStudentForm({
      name: '',
      lin: '',
      gender: 'M',
      classId: schoolClasses[0]?.id || '',
      stream: schoolClasses[0]?.streams?.[0] || 'North',
      combination: 'PCM / ICT',
      parentPhone: '',
      parentPin: '1234',
      house: 'Main',
      photoUrl: '',
      feeRequiredUGX: 1200000,
      feePaidUGX: 1200000
    });
  };

  const handleOpenEditStudent = (std) => {
    setEditingStudent(std);
    setEditStudentForm({
      name: std.name || '',
      lin: std.lin || '',
      gender: std.gender || 'M',
      classId: std.classId || schoolClasses[0]?.id || '',
      stream: std.stream || '',
      combination: std.combination || '',
      parentPhone: std.parentPhone || '',
      parentPin: std.parentPin || '1234',
      house: std.house || '',
      photoUrl: std.photoUrl || std.passportPhoto || '',
      feeRequiredUGX: std.feeRequiredUGX !== undefined ? std.feeRequiredUGX : 1200000,
      feePaidUGX: std.feePaidUGX !== undefined ? std.feePaidUGX : 1200000,
    });
    setIsEditStudentModalOpen(true);
  };

  const handleSaveEditStudent = (e) => {
    e.preventDefault();
    if (!editingStudent) return;
    const req = Number(editStudentForm.feeRequiredUGX) || 0;
    const paid = Number(editStudentForm.feePaidUGX) || 0;
    updateStudent(editingStudent.id, {
      ...editStudentForm,
      feeRequiredUGX: req,
      feePaidUGX: paid,
      feeBalanceUGX: Math.max(0, req - paid),
    });
    setIsEditStudentModalOpen(false);
    setEditingStudent(null);
  };

  const handleWhatsAppShareStudent = (std) => {
    const parentPhone = (std.parentPhone || '').replace(/[^0-9+]/g, '');
    const schoolName = currentSchool?.name || 'Mpumuza Analytics';
    const feeBal = Number(std.feeBalanceUGX || 0);
    const balanceText = feeBal > 0
      ? `Outstanding Fees: UGX ${feeBal.toLocaleString()}`
      : 'Fees Status: Fully Cleared';

    const portalUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/p/${std.lin}`
      : `https://mpumuza.ac.ug/p/${std.lin}`;

    const text = `*${schoolName}*
━━━━━━━━━━━━━━━━━
Dear Parent/Guardian,
Official Term Performance Report for *${std.name}* (LIN: ${std.lin}) is now available.

🔑 *Parent Portal PIN:* ${std.parentPin || '1234'}
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

  const handleCreateClass = (e) => {
    e.preventDefault();
    if (!classForm.name) return;
    const streamsList = classForm.streams.split(',').map(s => s.trim()).filter(Boolean);
    const calculatedLevel = currentSchool.levelType === 'PRIMARY' ? 'Primary' : (classForm.level || (['S.5', 'S.6'].some(x => classForm.name.toUpperCase().includes(x)) ? 'A-Level' : 'O-Level'));
    addClass({ schoolId: currentSchool.id, name: classForm.name, level: calculatedLevel, streams: streamsList });
    setIsClassModalOpen(false);
    setClassForm({ name: '', level: 'O-Level', streams: 'North, South' });
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateSchoolSettings(currentSchool.id, settingsForm);
    setSettingsFeedback('School particulars, calendar dates & template settings successfully saved and applied to all report cards!');
    setTimeout(() => setSettingsFeedback(null), 6000);
  };

  const handleDispatchSMS = (e) => {
    e.preventDefault();
    const result = dispatchSMSForClass(smsClassId, smsStream, smsTerm);
    if (result.success) {
      setSmsFeedback(`Dispatched SMS results to ${result.sentCount} parents. Total Cost: ${result.totalCostUGX} UGX.`);
      setTimeout(() => setSmsFeedback(null), 5000);
    }
  };

  const handleUploadExcel = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      alert('Please select an Excel or CSV file first.');
      return;
    }

    try {
      const result = await parseUploadedSpreadsheet(uploadFile, schoolSubjects);
      if (result.success) {
        const count = addBulkStudents(result.students, uploadClassId, uploadStream);
        setUploadFeedback({ type: 'success', message: `Successfully enrolled ${count} students and imported marks from spreadsheet!` });
        setTimeout(() => {
          setIsBulkModalOpen(false);
          setUploadFeedback(null);
          setUploadFile(null);
        }, 2000);
      } else {
        setUploadFeedback({ type: 'error', message: result.message || 'Failed to parse file.' });
      }
    } catch (err) {
      setUploadFeedback({ type: 'error', message: 'Error processing spreadsheet file.' });
    }
  };

  const handleDownloadTemplate = () => {
    const cls = schoolClasses.find(c => c.id === uploadClassId) || schoolClasses[0];
    downloadStudentTemplate(cls?.name || 'Class', uploadStream, schoolSubjects);
  };

  if (selectedStudentForReport) {
    return (
      <ReportCardView
        studentId={selectedStudentForReport}
        term={reportTerm}
        onBack={() => setSelectedStudentForReport(null)}
      />
    );
  }

  if (batchClassForReport) {
    return (
      <BatchReportCardView
        classId={batchClassForReport}
        term={reportTerm}
        onBack={() => setBatchClassForReport(null)}
      />
    );
  }

  return (
    <div className="space-y-8 text-left">
      
      {/* School Admin Header Banner */}
      <div className="bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-2xl bg-white p-1 border border-white/30 overflow-hidden shrink-0 shadow-md">
              <img
                src={currentSchool?.badgeUrl}
                alt="Badge"
                className="h-full w-full object-cover rounded-xl"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=200&q=80'; }}
              />
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <h1 className="text-3xl font-extrabold text-white font-outfit">
                  {currentSchool?.name}
                </h1>
                <span className="bg-white/20 text-white border border-white/30 text-xs px-3 py-1 rounded-full font-bold backdrop-blur-sm">
                  {currentSchool?.levelType === 'PRIMARY' ? 'Primary School' : 'Secondary School (O & A Level)'}
                </span>
              </div>
              <p className="text-emerald-100 text-sm font-medium">
                Manage student rosters, DOS template settings, fees clearance locks, SMS result broadcasts, and batch report cards.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setIsStudentModalOpen(true)}
              className="px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shadow-sm"
            >
              <UserPlus className="w-4 h-4 text-emerald-700" />
              <span>Add Student</span>
            </button>

            <button
              onClick={() => setIsBatchReportModalOpen(true)}
              className="bg-slate-900 hover:bg-slate-950 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition-all flex items-center space-x-2 border border-slate-800"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>One-Click Batch PDF Reports</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase">Enrolled Students</span>
            <div className="text-2xl font-extrabold text-slate-900 font-outfit mt-1">{schoolStudents.length}</div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700 border border-emerald-200">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase">Registered Teachers</span>
            <div className="text-2xl font-extrabold text-slate-900 font-outfit mt-1">{schoolTeachers.length}</div>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600 border border-blue-200">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase">Active Subjects</span>
            <div className="text-2xl font-extrabold text-slate-900 font-outfit mt-1">{schoolSubjects.length}</div>
          </div>
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-200">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-bold uppercase">Classes & Streams</span>
            <div className="text-2xl font-extrabold text-slate-900 font-outfit mt-1">{schoolClasses.length}</div>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-200">
            <Layers className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Mobile Navigation Bar & Sidebar Trigger (Visible on mobile/tablet, hidden on desktop) */}
      <div className="lg:hidden bg-white border border-slate-200 rounded-2xl p-3 shadow-sm space-y-2">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="flex-1 py-2.5 px-3.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-sm active:scale-98 transition-all"
          >
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Menu &amp; Actions Sidebar</span>
            </div>
            <span className="text-[10px] bg-emerald-600 text-slate-950 px-2 py-0.5 rounded-full font-black uppercase">
              {activeTab}
            </span>
          </button>

          <button
            onClick={() => setIsStudentModalOpen(true)}
            className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs active:scale-95 flex items-center justify-center shrink-0"
            title="Enroll Student"
          >
            <UserPlus className="w-4 h-4" />
          </button>
        </div>

        {/* Horizontal Quick Pill Strip */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar scroll-smooth">
          {[
            { id: 'students', label: 'Students', icon: GraduationCap },
            { id: 'reports', label: 'Reports', icon: Printer },
            { id: 'teachers', label: 'Teachers', icon: Users },
            { id: 'subjects', label: 'Subjects', icon: BookOpen },
            { id: 'classes', label: 'Classes', icon: Layers },
            { id: 'fees', label: 'Fees', icon: DollarSign },
            { id: 'attendance', label: 'Attendance', icon: Calendar },
            { id: 'sms', label: 'SMS', icon: Send },
            { id: 'settings', label: 'Settings', icon: Settings },
            { id: 'audit', label: 'Audit Logs', icon: ShieldCheck }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm font-extrabold'
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

      {/* Off-Canvas Mobile Sidebar Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop Overlay */}
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Content */}
          <div className="relative w-[320px] max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto p-4 space-y-4">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-xs">
                  <School className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 font-outfit uppercase tracking-wider">
                    School Navigation
                  </h3>
                  <span className="text-[10px] text-slate-500 truncate block max-w-[170px]">{currentSchool?.name}</span>
                </div>
              </div>

              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions in Mobile Drawer */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
                Quick Actions
              </span>
              <button
                onClick={() => {
                  setIsStudentModalOpen(true);
                  setIsMobileSidebarOpen(false);
                }}
                className="w-full px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-xs"
              >
                <div className="flex items-center space-x-2">
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Enroll Student</span>
                </div>
                <Plus className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  setIsBatchReportModalOpen(true);
                  setIsMobileSidebarOpen(false);
                }}
                className="w-full px-3 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center justify-between border border-slate-800"
              >
                <div className="flex items-center space-x-2">
                  <Printer className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Batch PDF Reports</span>
                </div>
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            </div>

            {/* Navigation Sections */}
            <nav className="space-y-4 flex-1">
              {/* 1. Academic Management */}
              <div>
                <span className="text-[10px] font-extrabold uppercase text-emerald-900 tracking-wider px-2 py-1 block font-outfit">
                  Academic Management
                </span>
                <div className="space-y-1 mt-1">
                  {[
                    { id: 'students', label: 'Students Roster', icon: GraduationCap, count: schoolStudents.length, color: 'text-emerald-700' },
                    { id: 'subjects', label: 'Subjects Setup', icon: BookOpen, count: schoolSubjects.length, color: 'text-indigo-600' },
                    { id: 'teachers', label: 'Teachers Staff', icon: Users, count: schoolTeachers.length, color: 'text-blue-600' },
                    { id: 'classes', label: 'Classes & Streams', icon: Layers, count: schoolClasses.length, color: 'text-emerald-600' },
                  ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-sm font-extrabold'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.color}`} />
                          <span>{tab.label}</span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                          isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Finance & Communications */}
              <div className="border-t border-slate-100 pt-3">
                <span className="text-[10px] font-extrabold uppercase text-emerald-900 tracking-wider px-2 py-1 block font-outfit">
                  Finance &amp; Communication
                </span>
                <div className="space-y-1 mt-1">
                  {[
                    { id: 'fees', label: 'Fees & Clearance', icon: DollarSign, color: 'text-emerald-600', badge: 'Locks' },
                    { id: 'sms', label: 'SMS Results Broadcast', icon: Send, color: 'text-sky-600', badge: 'SMS' },
                    { id: 'attendance', label: 'Term Attendance', icon: Calendar, color: 'text-blue-600' },
                  ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-sm font-extrabold'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.color}`} />
                          <span>{tab.label}</span>
                        </div>
                        {tab.badge && (
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                            isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}>
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Reports & Settings */}
              <div className="border-t border-slate-100 pt-3">
                <span className="text-[10px] font-extrabold uppercase text-emerald-900 tracking-wider px-2 py-1 block font-outfit">
                  Reports &amp; Settings
                </span>
                <div className="space-y-1 mt-1">
                  {[
                    { id: 'reports', label: 'Printable PDF Reports', icon: Printer, color: 'text-purple-600' },
                    { id: 'settings', label: 'Template & Weights', icon: Settings, color: 'text-slate-600' },
                    { id: 'audit', label: 'Audit Trail Logs', icon: ShieldCheck, color: 'text-rose-600' },
                  ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-sm font-extrabold'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.color}`} />
                          <span>{tab.label}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </nav>

          </div>
        </div>
      )}

      {/* Main Two-Column Layout: Desktop Sidebar Navigation + Tab Views */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Sidebar Menu (Desktop) */}
        <aside className="hidden lg:block lg:col-span-3 space-y-4 lg:sticky lg:top-20">
          
          {/* Quick Actions Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">
              Quick School Actions
            </span>
            <button
              onClick={() => setIsStudentModalOpen(true)}
              className="w-full px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-between shadow-sm group"
            >
              <div className="flex items-center space-x-2">
                <UserPlus className="w-4 h-4" />
                <span>Enroll Student</span>
              </div>
              <Plus className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
            </button>

            <button
              onClick={() => setIsBatchReportModalOpen(true)}
              className="w-full px-3.5 py-2.5 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-between shadow-sm group border border-slate-800"
            >
              <div className="flex items-center space-x-2">
                <Printer className="w-4 h-4 text-emerald-400" />
                <span>Batch PDF Reports</span>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 opacity-70 group-hover:opacity-100" />
            </button>
          </div>

          {/* Categorized Navigation Sidebar */}
          <nav className="bg-white border border-slate-200 rounded-3xl p-3 shadow-sm space-y-4">
            
            {/* 1. Academic Management */}
            <div>
              <span className="text-[10px] font-extrabold uppercase text-emerald-900 tracking-wider px-3 py-1 block font-outfit">
                Academic Management
              </span>
              <div className="space-y-1 mt-1">
                {[
                  { id: 'students', label: 'Students Roster', icon: GraduationCap, count: schoolStudents.length, color: 'text-emerald-700' },
                  { id: 'subjects', label: 'Subjects Setup', icon: BookOpen, count: schoolSubjects.length, color: 'text-indigo-600' },
                  { id: 'teachers', label: 'Teachers Staff', icon: Users, count: schoolTeachers.length, color: 'text-blue-600' },
                  { id: 'classes', label: 'Classes & Streams', icon: Layers, count: schoolClasses.length, color: 'text-emerald-600' },
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-sm font-extrabold'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.color}`} />
                        <span>{tab.label}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                        isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {tab.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Finance & Communications */}
            <div className="border-t border-slate-100 pt-3">
              <span className="text-[10px] font-extrabold uppercase text-emerald-900 tracking-wider px-3 py-1 block font-outfit">
                Finance & Communication
              </span>
              <div className="space-y-1 mt-1">
                {[
                  { id: 'fees', label: 'Fees & Clearance', icon: DollarSign, color: 'text-emerald-600', badge: 'Locks' },
                  { id: 'sms', label: 'SMS Results Broadcast', icon: Send, color: 'text-sky-600', badge: 'SMS' },
                  { id: 'attendance', label: 'Term Attendance', icon: Calendar, color: 'text-blue-600' },
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-sm font-extrabold'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.color}`} />
                        <span>{tab.label}</span>
                      </div>
                      {tab.badge && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                          isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}>
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Reports & Settings */}
            <div className="border-t border-slate-100 pt-3">
              <span className="text-[10px] font-extrabold uppercase text-emerald-900 tracking-wider px-3 py-1 block font-outfit">
                Reports & Settings
              </span>
              <div className="space-y-1 mt-1">
                {[
                  { id: 'reports', label: 'Printable PDF Reports', icon: Printer, color: 'text-purple-600' },
                  { id: 'settings', label: 'Template & Weights', icon: Settings, color: 'text-slate-600' },
                  { id: 'audit', label: 'Audit Trail Logs', icon: ShieldCheck, color: 'text-rose-600' },
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-sm font-extrabold'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.color}`} />
                        <span>{tab.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </nav>
        </aside>

        {/* Right Main Content Area */}
        <main className="lg:col-span-9 space-y-6 min-w-0">

          {/* 1. STUDENTS TAB */}
          {activeTab === 'students' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-outfit">Enrolled Student Directory</h3>
              <p className="text-xs text-slate-500">Manage individual student records, attendance, and LIN accounts.</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setIsStudentModalOpen(true)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 border border-slate-300"
              >
                <Plus className="w-4 h-4 text-emerald-700" />
                <span>Single Student Entry</span>
              </button>

              <button
                onClick={() => setIsBulkModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shadow-sm"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Spreadsheet</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-outfit uppercase border-b border-slate-200">
                  <th className="p-3">LIN</th>
                  <th className="p-3">Full Name</th>
                  <th className="p-3">Gender</th>
                  <th className="p-3">Class & Stream</th>
                  <th className="p-3">Level / Combination</th>
                  <th className="p-3">Parent Access PIN</th>
                  <th className="p-3">Fee Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {schoolStudents.map(std => {
                  const cls = schoolClasses.find(c => c.id === std.classId);
                  const isCleared = std.feeBalanceUGX <= 0 || std.feeOverride;
                  const isALvl = cls?.level === 'A-Level' || ['S.5', 'S.6'].some(s => cls?.name?.includes(s));

                  return (
                    <tr key={std.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono text-emerald-800 font-bold">{std.lin}</td>
                      <td className="p-3 font-bold text-slate-900 text-sm">{std.name}</td>
                      <td className="p-3 text-slate-700">{std.gender === 'M' ? 'Male' : 'Female'}</td>
                      <td className="p-3 font-semibold text-slate-800">
                        {cls?.name || 'Class'} <span className="text-slate-500 font-normal">({std.stream})</span>
                      </td>
                      <td className="p-3">
                        {isALvl ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                            {std.combination || 'PCM / ICT'}
                          </span>
                        ) : (
                          <span className="text-slate-500 font-medium text-[11px]">
                            {cls?.level || 'O-Level'}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-50 text-emerald-950 border border-emerald-300 inline-flex items-center space-x-1 shadow-2xs">
                          <Lock className="w-3 h-3 text-emerald-700" />
                          <span>{std.parentPin || '1234'}</span>
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          std.feeBalanceUGX <= 0 ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                          std.feeOverride ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                          'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}>
                          {std.feeBalanceUGX <= 0 ? 'Cleared' : std.feeOverride ? 'Waiver' : `Bal: ${std.feeBalanceUGX.toLocaleString()} UGX`}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {std.blocked && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-rose-100 text-rose-700 border border-rose-300 rounded-full text-[9px] font-bold">
                              <Ban className="w-2.5 h-2.5" /> Blocked
                            </span>
                          )}
                          <button
                            onClick={() => handleOpenEditStudent(std)}
                            className="px-2.5 py-1.5 bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200 rounded-lg text-xs font-bold transition-all flex items-center space-x-1"
                            title="Edit Student Particulars & Parent Access PIN"
                          >
                            <Settings className="w-3.5 h-3.5 text-slate-600" />
                            <span>Edit / PIN</span>
                          </button>
                          <button
                            onClick={() => setSelectedStudentForReport(std.id)}
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-900 border border-emerald-300 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-all flex items-center space-x-1"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Report</span>
                          </button>
                          <button
                            onClick={() => handleWhatsAppShareStudent(std)}
                            title="Share student result summary and portal PIN directly via WhatsApp"
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-bold transition-all flex items-center"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
                          {/* Block / Unblock */}
                          {std.blocked ? (
                            <button
                              title="Unblock student portal access"
                              onClick={() => setConfirmAction({ type: 'unblock', entity: 'student', record: std })}
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                            >
                              <Unlock className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              title="Block student portal access"
                              onClick={() => setConfirmAction({ type: 'block', entity: 'student', record: std })}
                              className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
                            >
                              <Lock className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {/* Delete */}
                          <button
                            title="Permanently delete student record"
                            onClick={() => setConfirmAction({ type: 'delete', entity: 'student', record: std })}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* 2. SUBJECTS TAB */}
      {activeTab === 'subjects' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-slate-900 font-outfit">School Subjects Directory</h3>
                <span className="text-xs bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  {schoolSubjects.length} Subjects Total
                </span>
              </div>
              <p className="text-xs text-slate-500">Configured and sorted by educational level (Primary, O-Level &amp; A-Level).</p>
            </div>
            <button
              onClick={() => setIsSubjectModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shadow-sm shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add More Subjects</span>
            </button>
          </div>

          {/* Level Filter Tabs */}
          <div className="flex flex-wrap gap-2 pt-1 border-b border-slate-100 pb-3">
            <button
              type="button"
              onClick={() => setSubjectLevelFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                subjectLevelFilter === 'ALL'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Levels ({schoolSubjects.length})
            </button>
            {oLevelSubjectsCount > 0 && (
              <button
                type="button"
                onClick={() => setSubjectLevelFilter('O-Level')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  subjectLevelFilter === 'O-Level'
                    ? 'bg-sky-700 text-white shadow-sm'
                    : 'bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100'
                }`}
              >
                <span>O-Level (UCE)</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${subjectLevelFilter === 'O-Level' ? 'bg-white/25 text-white' : 'bg-sky-200 text-sky-900'}`}>
                  {oLevelSubjectsCount}
                </span>
              </button>
            )}
            {aLevelSubjectsCount > 0 && (
              <button
                type="button"
                onClick={() => setSubjectLevelFilter('A-Level')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  subjectLevelFilter === 'A-Level'
                    ? 'bg-purple-700 text-white shadow-sm'
                    : 'bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100'
                }`}
              >
                <span>A-Level (UACE)</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${subjectLevelFilter === 'A-Level' ? 'bg-white/25 text-white' : 'bg-purple-200 text-purple-900'}`}>
                  {aLevelSubjectsCount}
                </span>
              </button>
            )}
            {primarySubjectsCount > 0 && (
              <button
                type="button"
                onClick={() => setSubjectLevelFilter('Primary')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  subjectLevelFilter === 'Primary'
                    ? 'bg-emerald-800 text-white shadow-sm'
                    : 'bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                <span>Primary (PLE)</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${subjectLevelFilter === 'Primary' ? 'bg-white/25 text-white' : 'bg-emerald-200 text-emerald-950'}`}>
                  {primarySubjectsCount}
                </span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSchoolSubjects.map(sub => {
              const level = getSubjectLevel(sub);
              const levelBadgeStyle =
                level === 'A-Level' ? 'bg-purple-100 text-purple-900 border-purple-300' :
                level === 'Primary' ? 'bg-emerald-100 text-emerald-950 border-emerald-300' :
                'bg-sky-100 text-sky-900 border-sky-300';

              return (
                <div key={sub.id} className="bg-slate-50 border border-slate-200 hover:border-slate-300 p-4 rounded-2xl space-y-3 transition-all flex flex-col justify-between hover:shadow-sm">
                  <div>
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono text-emerald-900 font-extrabold text-xs bg-white px-2 py-0.5 rounded-lg border border-slate-200">
                          [{sub.code}]
                        </span>
                        <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${levelBadgeStyle}`}>
                          {level}
                        </span>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        sub.core ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                        sub.isSubsidiary ? 'bg-indigo-100 text-indigo-800 border border-indigo-300' :
                        'bg-slate-200 text-slate-700'
                      }`}>
                        {sub.core ? 'Core' : sub.isSubsidiary ? 'Subsidiary' : 'Elective'}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 font-outfit mt-2.5">{sub.name}</h4>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {level === 'A-Level' ? (sub.isSubsidiary ? 'Subsidiary Paper' : 'Paper 1 & 2 Entries') : 'Standard Assessment'}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteSubject(sub)}
                      title={`Delete subject ${sub.name}`}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. TEACHERS TAB */}
      {activeTab === 'teachers' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-outfit">Teaching Staff Registry</h3>
              <p className="text-xs text-slate-500">Register teachers and assign them subjects & classes.</p>
            </div>
            <button
              onClick={() => setIsTeacherModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Teacher</span>
            </button>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-outfit uppercase tracking-wide text-[11px] border-b border-slate-200">
                  <th className="px-4 py-3">Teacher</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Assigned Classes</th>
                  <th className="px-4 py-3">Subjects</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schoolTeachers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400 italic text-sm">
                      No teachers registered yet. Click "Add Teacher" to begin.
                    </td>
                  </tr>
                )}
                {schoolTeachers.map(tr => (
                  <tr key={tr.id} className={`hover:bg-slate-50 transition-colors ${tr.blocked ? 'opacity-60 bg-rose-50/40' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 text-sm">{tr.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{tr.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-mono text-emerald-800 font-semibold">{tr.phone || <span className="text-slate-400 font-normal italic">No Phone</span>}</div>
                    </td>
                    <td className="px-4 py-3">
                      {(tr.assignedClasses && tr.assignedClasses.length > 0) ? (
                        <div className="flex flex-wrap gap-1">
                          {tr.assignedClasses.map((acId, i) => {
                            const c = schoolClasses.find(cl => cl.id === acId);
                            return c ? (
                              <span key={i} className="bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px] text-emerald-950 font-semibold">
                                {c.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {(tr.assignedSubjects && tr.assignedSubjects.length > 0) ? (
                        <div className="flex flex-wrap gap-1">
                          {tr.assignedSubjects.map((subId, i) => {
                            const s = schoolSubjects.find(sb => sb.id === subId);
                            return s ? (
                              <span key={i} className="bg-sky-50 border border-sky-200 px-2 py-0.5 rounded text-[10px] text-sky-900 font-semibold">
                                {s.code}
                              </span>
                            ) : null;
                          })}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">None</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {tr.blocked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-100 text-rose-700 border border-rose-300 rounded-full text-[10px] font-bold">
                          <Ban className="w-3 h-3" /> Blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-full text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Edit */}
                        <button
                          title="Edit teacher details"
                          onClick={() => handleOpenEditTeacher(tr)}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {/* Block / Unblock */}
                        {tr.blocked ? (
                          <button
                            title="Unblock teacher"
                            onClick={() => setConfirmAction({ type: 'unblock', entity: 'teacher', record: tr })}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            title="Block teacher login"
                            onClick={() => setConfirmAction({ type: 'block', entity: 'teacher', record: tr })}
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {/* Delete */}
                        <button
                          title="Permanently delete teacher"
                          onClick={() => setConfirmAction({ type: 'delete', entity: 'teacher', record: tr })}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}


      {/* 4. CLASSES TAB */}
      {activeTab === 'classes' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-outfit">Class & Stream Configuration</h3>
              <p className="text-xs text-slate-500">Manage school class levels and stream divisions.</p>
            </div>
            <button
              onClick={() => setIsClassModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Class Level</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schoolClasses.map(cls => {
              const classStudents = schoolStudents.filter(s => s.classId === cls.id);
              const currentInput = streamInputs[cls.id] || '';

              const streamSuggestions = cls.level === 'A-Level' 
                ? ['Sciences', 'Arts', 'Commercial', 'Science A', 'Science B', 'Arts A']
                : cls.level === 'Primary'
                ? ['Blue', 'Red', 'Yellow', 'Green', 'Crane', 'Gorilla']
                : ['North', 'South', 'East', 'West', 'A', 'B', 'C', 'D'];

              return (
                <div key={cls.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <div>
                        <h4 className="text-xl font-extrabold text-slate-900 font-outfit">{cls.name}</h4>
                        <span className="text-[10px] text-slate-500 font-bold">{classStudents.length} Students Enrolled</span>
                      </div>
                      <span className="text-xs bg-sky-100 text-sky-800 px-2.5 py-1 rounded-full font-bold border border-sky-200">
                        {cls.level}
                      </span>
                    </div>

                    {/* Active Streams Badges */}
                    <div className="pt-3 space-y-2">
                      <span className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Configured Streams ({cls.streams.length}):
                      </span>

                      <div className="flex flex-wrap gap-1.5 min-h-[36px]">
                        {cls.streams.map(st => {
                          const streamCount = classStudents.filter(s => s.stream === st).length;
                          return (
                            <span
                              key={st}
                              className="px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs font-bold flex items-center space-x-1.5 shadow-2xs group"
                            >
                              <span>{st}</span>
                              <span className="text-[10px] text-slate-400 bg-slate-100 px-1 rounded font-normal">
                                {streamCount}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleRemoveStreamFromClass(cls.id, st)}
                                title={`Remove stream ${st}`}
                                className="text-slate-400 hover:text-rose-600 transition-colors ml-1 p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Add Custom Stream Section */}
                  <div className="pt-3 border-t border-slate-200 space-y-2.5">
                    <span className="block text-[11px] font-extrabold text-emerald-900 uppercase tracking-wider">
                      + Add Custom Stream:
                    </span>

                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="e.g. East or Stream C"
                        value={currentInput}
                        onChange={(e) => setStreamInputs({ ...streamInputs, [cls.id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddStreamToClass(cls.id);
                          }
                        }}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-semibold focus:outline-none focus:border-emerald-600"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddStreamToClass(cls.id)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all shrink-0"
                      >
                        Add
                      </button>
                    </div>

                    {/* Quick Preset Badges */}
                    <div className="flex flex-wrap gap-1 items-center pt-1">
                      <span className="text-[10px] text-slate-400 font-medium">Quick presets:</span>
                      {streamSuggestions.filter(sug => !cls.streams.includes(sug)).slice(0, 4).map(sug => (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => addStreamToClass(cls.id, sug)}
                          className="text-[10px] px-2 py-0.5 bg-slate-200/70 hover:bg-emerald-100 hover:text-emerald-950 rounded font-bold text-slate-700 transition-colors"
                        >
                          +{sug}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. FEES & CLEARANCE TAB */}
      {activeTab === 'fees' && (
        <div className="space-y-6 text-left">
          
          {/* Top Summary Metric Cards */}
          {(() => {
            const totalRequired = schoolStudents.reduce((acc, s) => acc + (Number(s.feeRequiredUGX) || 1200000), 0);
            const totalPaid = schoolStudents.reduce((acc, s) => acc + (Number(s.feePaidUGX) || 0), 0);
            const totalOutstanding = Math.max(0, totalRequired - totalPaid);
            const clearedCount = schoolStudents.filter(s => (s.feeBalanceUGX <= 0 || s.feeOverride)).length;

            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    Total Required Tuition
                  </span>
                  <span className="text-xl font-extrabold text-slate-900 font-mono">
                    UGX {totalRequired.toLocaleString()}
                  </span>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
                  <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block mb-1">
                    Total Collected Fees
                  </span>
                  <span className="text-xl font-extrabold text-emerald-700 font-mono">
                    UGX {totalPaid.toLocaleString()}
                  </span>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
                  <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block mb-1">
                    Outstanding Balances
                  </span>
                  <span className="text-xl font-extrabold text-rose-700 font-mono">
                    UGX {totalOutstanding.toLocaleString()}
                  </span>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                    Report Card Clearance
                  </span>
                  <span className="text-xl font-extrabold text-slate-900">
                    {clearedCount} / {schoolStudents.length} <span className="text-xs font-semibold text-slate-500">Students</span>
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Fee Structure Determination Tool */}
          <div className="bg-gradient-to-r from-emerald-50 to-emerald-50 border border-emerald-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-emerald-950 font-outfit flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-emerald-700" />
                  <span>Determine Required Term Tuition / School Fees</span>
                </h3>
                <p className="text-xs text-emerald-950/80">
                  Set standard required term fees across an entire class or specific stream in one click.
                </p>
              </div>
            </div>

            {feeFeedback && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{feeFeedback}</span>
              </div>
            )}

            <form onSubmit={handleApplyBatchFees} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Class Level *</label>
                  <select
                    value={feeConfigClassId}
                    onChange={(e) => {
                      setFeeConfigClassId(e.target.value);
                      setFeeConfigStream('ALL');
                    }}
                    className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="ALL">All School Classes (Global)</option>
                    {schoolClasses.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} &bull; {cls.level}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Stream *</label>
                  {(() => {
                    const selectedCls = schoolClasses.find(c => c.id === feeConfigClassId);
                    return (
                      <select
                        value={feeConfigStream}
                        onChange={(e) => setFeeConfigStream(e.target.value)}
                        disabled={feeConfigClassId === 'ALL'}
                        className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 disabled:opacity-50"
                      >
                        <option value="ALL">All Streams in Class</option>
                        {selectedCls?.streams?.map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    );
                  })()}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Required Fee Amount (UGX) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="10000"
                    placeholder="e.g. 1450000"
                    value={feeConfigAmount}
                    onChange={(e) => setFeeConfigAmount(Number(e.target.value))}
                    className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-950 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Quick Fee Presets */}
              <div className="flex flex-wrap gap-2 items-center pt-1">
                <span className="text-[10px] text-emerald-950/70 font-extrabold uppercase tracking-wider">Quick Presets:</span>
                {[
                  { label: '650,000 UGX (Primary Tuition)', amount: 650000 },
                  { label: '850,000 UGX (Day Students)', amount: 850000 },
                  { label: '1,250,000 UGX (Boarding O-Level)', amount: 1250000 },
                  { label: '1,450,000 UGX (A-Level Arts)', amount: 1450000 },
                  { label: '1,650,000 UGX (A-Level Sciences)', amount: 1650000 }
                ].map(preset => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setFeeConfigAmount(preset.amount)}
                    className="text-[10px] px-2.5 py-1 bg-white hover:bg-emerald-600 hover:text-white border border-emerald-300 rounded-lg font-mono font-bold text-emerald-950 transition-all shadow-2xs"
                  >
                    {preset.label}
                  </button>
                ))}

                <button
                  type="submit"
                  className="ml-auto px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Apply Required Fee to Group</span>
                </button>
              </div>
            </form>
          </div>

          {/* Student-by-Student Fee Ledger Table */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 font-outfit">Student Financial Ledger & Clearance</h3>
                <p className="text-xs text-slate-500">Edit required fees or payments individually per student. Balances and lock status update automatically in real-time.</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-outfit uppercase border-b border-slate-200">
                    <th className="p-3">Student Name</th>
                    <th className="p-3">LIN</th>
                    <th className="p-3">Class & Stream</th>
                    <th className="p-3 text-right">Fee Required (UGX)</th>
                    <th className="p-3 text-right">Amount Paid (UGX)</th>
                    <th className="p-3 text-right">Balance Due</th>
                    <th className="p-3 text-center">Release Status</th>
                    <th className="p-3 text-right">Clearance Waiver</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {schoolStudents.map(std => {
                    const cls = schoolClasses.find(c => c.id === std.classId);
                    const req = std.feeRequiredUGX !== undefined ? std.feeRequiredUGX : 1200000;
                    const paid = std.feePaidUGX !== undefined ? std.feePaidUGX : 1200000;
                    const bal = Math.max(0, req - paid);
                    const isLocked = bal > 0 && !std.feeOverride;

                    return (
                      <tr key={std.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-bold text-slate-900 text-sm">{std.name}</td>
                        <td className="p-3 font-mono text-emerald-800 font-bold">{std.lin}</td>
                        <td className="p-3 font-semibold text-slate-800">
                          {cls?.name || 'Class'} <span className="text-slate-500 font-normal">({std.stream})</span>
                        </td>
                        
                        {/* Editable Fee Required Field */}
                        <td className="p-3 text-right">
                          <input
                            type="number"
                            min="0"
                            step="50000"
                            value={req}
                            onChange={(e) => updateFeeRecord(std.id, Number(e.target.value), paid, std.feeOverride)}
                            className="w-32 bg-white border border-emerald-300 focus:border-emerald-600 text-right font-mono font-bold text-emerald-950 rounded-lg p-1.5 focus:outline-none shadow-2xs"
                          />
                        </td>

                        {/* Editable Amount Paid Field */}
                        <td className="p-3 text-right">
                          <input
                            type="number"
                            min="0"
                            step="50000"
                            value={paid}
                            onChange={(e) => updateFeeRecord(std.id, req, Number(e.target.value), std.feeOverride)}
                            className="w-32 bg-white border border-slate-300 focus:border-slate-500 text-right font-mono font-bold text-emerald-800 rounded-lg p-1.5 focus:outline-none shadow-2xs"
                          />
                        </td>

                        <td className="p-3 text-right font-mono font-bold text-slate-900">
                          <span className={bal > 0 ? 'text-rose-700' : 'text-emerald-700'}>
                            {bal.toLocaleString()} UGX
                          </span>
                        </td>

                        <td className="p-3 text-center">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                            !isLocked ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}>
                            {!isLocked ? 'RELEASED' : 'LOCKED (Fee Bal)'}
                          </span>
                        </td>

                        <td className="p-3 text-right">
                          <button
                            onClick={() => updateFeeRecord(std.id, req, paid, !std.feeOverride)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ml-auto border ${
                              std.feeOverride
                                ? 'bg-emerald-100 text-emerald-950 border-emerald-300 hover:bg-emerald-200'
                                : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                            }`}
                          >
                            {std.feeOverride ? <Unlock className="w-3.5 h-3.5 text-emerald-800" /> : <Lock className="w-3.5 h-3.5 text-slate-500" />}
                            <span>{std.feeOverride ? 'Waiver Active' : 'Apply Waiver'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* 6. SMS BROADCAST TAB */}
      {activeTab === 'sms' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-outfit">Africa's Talking SMS Result Gateway</h3>
            <p className="text-xs text-slate-500">Broadcast end-of-term results, fee balances, and opening dates directly to parents' mobile phones.</p>
          </div>

          {smsFeedback && (
            <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-2xl text-xs font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{smsFeedback}</span>
            </div>
          )}

          <form onSubmit={handleDispatchSMS} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 max-w-2xl">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Class *</label>
                <select
                  value={smsClassId}
                  onChange={(e) => setSmsClassId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900"
                >
                  {schoolClasses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Stream</label>
                <input
                  type="text"
                  placeholder="Stream A"
                  value={smsStream}
                  onChange={(e) => setSmsStream(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Report Term</label>
                <select
                  value={smsTerm}
                  onChange={(e) => setSmsTerm(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900"
                >
                  <option value="BOT">BOT</option>
                  <option value="MOT">MOT</option>
                  <option value="EOT">EOT</option>
                  <option value="COMBINED">COMBINED</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">SMS Message Template Preview</label>
              <textarea
                rows={3}
                readOnly
                value={`[${currentSchool.name.substring(0, 20)}] Dear Parent, [Student Name] (LIN) ${smsTerm} Report Card Published. Bal: UGX [Balance]. Next Term Opens: 14/09/2026. Portal: mpumuza.ac.ug/p/[LIN]`}
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs font-mono text-slate-700"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast SMS Results to Parents</span>
            </button>
          </form>

          {/* SMS Logs Table */}
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 font-outfit">Africa's Talking Gateway Delivery Logs</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-outfit uppercase border-b border-slate-200">
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Recipient</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">SMS Cost</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {smsLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400 italic">No SMS broadcasts sent yet this session.</td>
                    </tr>
                  ) : (
                    smsLogs.map((log, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                        <td className="p-3 font-bold text-slate-900">{log.recipientName}</td>
                        <td className="p-3 font-mono text-emerald-800">{log.phone}</td>
                        <td className="p-3 font-mono text-slate-600">{log.cost}</td>
                        <td className="p-3 text-right font-bold text-emerald-700">{log.status}</td>
                      </tr>
                    ))
                  )
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 7. AUDIT TRAIL LOGS TAB */}
      {activeTab === 'audit' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-outfit">School Activity & Data Modification Audit Logs</h3>
            <p className="text-xs text-slate-500">Track all mark modifications, fee waivers, teacher edits, and administrative overrides.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-outfit uppercase border-b border-slate-200">
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">User Staff</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Log Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {auditLogs.map((log, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-3 font-bold text-slate-900">{log.userName}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-bold border border-slate-300">
                        {log.category}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-emerald-900">{log.action}</td>
                    <td className="p-3 text-slate-700 font-medium">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. REPORTS TAB */}
      {activeTab === 'reports' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-outfit">Report Card Engine</h3>
              <p className="text-xs text-slate-500">Select term and generate individual or batch PDF report cards.</p>
            </div>

            <button
              onClick={() => setIsBatchReportModalOpen(true)}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-2"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>One-Click Batch PDF Reports</span>
            </button>
          </div>

          <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 max-w-xl">
            <span className="text-xs font-bold text-slate-700">Select Term:</span>
            {['BOT', 'MOT', 'EOT', 'COMBINED'].map(t => (
              <button
                key={t}
                onClick={() => setReportTerm(t)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  reportTerm === t
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {t} {t === 'COMBINED' ? '(BOT+MOT+EOT)' : ''}
              </button>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-outfit uppercase border-b border-slate-200">
                  <th className="p-3">LIN</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Class</th>
                  <th className="p-3">Stream</th>
                  <th className="p-3 text-right">Generate Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {schoolStudents.map(std => {
                  const cls = schoolClasses.find(c => c.id === std.classId);
                  return (
                    <tr key={std.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-emerald-800 font-bold">{std.lin}</td>
                      <td className="p-3 font-bold text-slate-900 text-sm">{std.name}</td>
                      <td className="p-3 font-semibold text-slate-800">{cls?.name || 'Class'}</td>
                      <td className="p-3 text-slate-600">{std.stream}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedStudentForReport(std.id)}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all ml-auto flex items-center space-x-1"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Generate {reportTerm} Report</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 9. SETTINGS TAB */}
      {activeTab === 'settings' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 font-outfit">School Profile, Calendar &amp; Report Settings</h3>
              <p className="text-xs text-slate-500">Configure official school details (motto, location, Tel, email), next term opening date, marks weighting, and logo.</p>
            </div>
            <button
              onClick={handleSaveSettings}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center space-x-2 shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save All Settings</span>
            </button>
          </div>

          {settingsFeedback && (
            <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-bold flex items-center space-x-2 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{settingsFeedback}</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-6 max-w-3xl">
            
            {/* 1. Official School Particulars */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center space-x-2 text-emerald-950 font-bold text-sm">
                <School className="w-4 h-4 text-emerald-700" />
                <h4 className="font-outfit">Official School Particulars</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">School Official Name *</label>
                  <input
                    type="text"
                    required
                    value={settingsForm.name}
                    onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })}
                    placeholder="e.g. St. Mary's Secondary School"
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">School Motto</label>
                  <input
                    type="text"
                    value={settingsForm.motto}
                    onChange={(e) => setSettingsForm({ ...settingsForm, motto: e.target.value })}
                    placeholder="e.g. Look Forward with Faith and Perseverance"
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Physical Location / Address</label>
                  <input
                    type="text"
                    value={settingsForm.address}
                    onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                    placeholder="e.g. Mengo Hill, Kampala Central"
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Telephone / Contact Phone</label>
                  <input
                    type="text"
                    value={settingsForm.contactPhone}
                    onChange={(e) => setSettingsForm({ ...settingsForm, contactPhone: e.target.value })}
                    placeholder="e.g. +256 414 987654 / 0772000000"
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Official School Email</label>
                  <input
                    type="email"
                    value={settingsForm.contactEmail}
                    onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })}
                    placeholder="e.g. info@school.ac.ug"
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* 2. Term Calendar & Next Term Date */}
            <div className="bg-emerald-50/80 p-5 rounded-2xl border border-emerald-200 space-y-3">
              <div className="flex items-center space-x-2 text-emerald-950 font-bold text-sm">
                <Calendar className="w-4 h-4 text-emerald-700" />
                <h4 className="font-outfit">School Term Calendar &amp; Schedule</h4>
              </div>
              <p className="text-xs text-emerald-950/80">This date is dynamically printed on all student report cards and included in parent SMS result broadcasts.</p>

              <div>
                <label className="block text-xs font-bold text-emerald-950 mb-1">Next Term Beginning Date *</label>
                <input
                  type="text"
                  required
                  value={settingsForm.nextTermBegins}
                  onChange={(e) => setSettingsForm({ ...settingsForm, nextTermBegins: e.target.value })}
                  placeholder="e.g. Monday, 14th September 2026"
                  className="w-full bg-white border border-emerald-300 rounded-xl px-4 py-2 text-sm font-bold text-emerald-950 focus:outline-none focus:border-emerald-600"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[10px] text-emerald-900/80 font-bold">Quick Presets:</span>
                  {[
                    'Monday, 14th September 2026',
                    'Monday, 21st September 2026',
                    'Monday, 1st February 2027',
                    'Monday, 25th May 2026'
                  ].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSettingsForm({ ...settingsForm, nextTermBegins: d })}
                      className="text-[10px] px-2.5 py-0.5 bg-white border border-emerald-200 rounded-lg text-emerald-950 font-bold hover:bg-emerald-100 transition-colors"
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Administrative Sign-off Particulars & Stamps */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center space-x-2 text-emerald-950 font-bold text-sm">
                <Award className="w-4 h-4 text-emerald-700" />
                <h4 className="font-outfit">Administrative Signatures &amp; Stamps</h4>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Head Teacher Official Name</label>
                  <input
                    type="text"
                    value={settingsForm.headTeacher}
                    onChange={(e) => setSettingsForm({ ...settingsForm, headTeacher: e.target.value })}
                    placeholder="e.g. Grace Ssebugwawo"
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Head Teacher Signature Stamp Text</label>
                  <input
                    type="text"
                    value={settingsForm.headTeacherSignature}
                    onChange={(e) => setSettingsForm({ ...settingsForm, headTeacherSignature: e.target.value })}
                    placeholder="e.g. Grace Ssebugwawo (Headteacher)"
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Director of Studies (DOS) Name</label>
                  <input
                    type="text"
                    value={settingsForm.dosName}
                    onChange={(e) => setSettingsForm({ ...settingsForm, dosName: e.target.value })}
                    placeholder="e.g. Tr. Ronald Lule"
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Director of Studies (DOS) Stamp Text</label>
                  <input
                    type="text"
                    value={settingsForm.dosSignature}
                    onChange={(e) => setSettingsForm({ ...settingsForm, dosSignature: e.target.value })}
                    placeholder="e.g. Ronald Lule (DOS)"
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            {/* 4. Term Mark Weightings & Ranking */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center space-x-2 text-emerald-950 font-bold text-sm">
                <Layers className="w-4 h-4 text-emerald-700" />
                <h4 className="font-outfit">Term Mark Weightings &amp; Rankings</h4>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">BOT Weight %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settingsForm.botWeight}
                    onChange={(e) => setSettingsForm({ ...settingsForm, botWeight: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">MOT Weight %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settingsForm.motWeight}
                    onChange={(e) => setSettingsForm({ ...settingsForm, motWeight: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">EOT Weight %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={settingsForm.eotWeight}
                    onChange={(e) => setSettingsForm({ ...settingsForm, eotWeight: Number(e.target.value) })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <label className="flex items-center space-x-3 cursor-pointer text-xs text-slate-700 font-semibold">
                  <input
                    type="checkbox"
                    checked={settingsForm.showPositionRanking}
                    onChange={(e) => setSettingsForm({ ...settingsForm, showPositionRanking: e.target.checked })}
                    className="h-4 w-4 rounded accent-emerald-600"
                  />
                  <span>Display Numerical Position/Class Ranking on Report Cards (Toggle OFF for NCDC Competency Curriculum)</span>
                </label>
              </div>
            </div>

            {/* 5. School Logo / Badge Upload */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center space-x-2 text-emerald-950 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <h4 className="font-outfit">School Logo &amp; Watermark Image</h4>
              </div>
              <p className="text-xs text-slate-500">Upload your official school logo badge (PNG/JPG). It will display on all generated Report Cards, Header Badges, and as a watermark.</p>
              
              <div className="flex items-center space-x-4">
                <div className="h-20 w-20 bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs flex items-center justify-center shrink-0 p-1">
                  {settingsForm.badgeUrl ? (
                    <img src={settingsForm.badgeUrl} alt="Preview" className="h-full w-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-slate-400 font-bold text-center">No Logo</span>
                  )}
                </div>
                
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setSettingsForm(prev => ({ ...prev, badgeUrl: reader.result }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-100 file:text-emerald-900 hover:file:bg-emerald-200 cursor-pointer"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration &amp; Report Template</span>
            </button>

          </form>
        </div>
      )}

        </main>
      </div>

      {/* Modal: Batch PDF Generator */}
      <Modal isOpen={isBatchReportModalOpen} onClose={() => setIsBatchReportModalOpen(false)} title="One-Click Batch Class PDF Report Generator">
        <div className="space-y-4 text-left">
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs text-emerald-950">
            <p className="font-bold">Batch Generation Summary:</p>
            <p className="mt-1">Generates report cards for all enrolled students in the selected class in a single batch print preview.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Target Class *</label>
              <select
                value={batchClassId}
                onChange={(e) => setBatchClassId(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900"
              >
                {schoolClasses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Term</label>
              <select
                value={batchTerm}
                onChange={(e) => setBatchTerm(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900"
              >
                <option value="COMBINED">COMBINED (BOT+MOT+EOT)</option>
                <option value="EOT">EOT (End of Term)</option>
                <option value="MOT">MOT (Middle of Term)</option>
                <option value="BOT">BOT (Beginning of Term)</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setBatchClassForReport(batchClassId);
              setReportTerm(batchTerm);
              setIsBatchReportModalOpen(false);
            }}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center space-x-2"
          >
            <Printer className="w-4 h-4" />
            <span>Launch Batch Report Cards Printer</span>
          </button>
        </div>
      </Modal>

      {/* Modal: Add Subject */}
      <Modal isOpen={isSubjectModalOpen} onClose={() => setIsSubjectModalOpen(false)} title="Add Subject to School Curriculum">
        {(() => {
          const popularPresets = currentSchool.levelType === 'PRIMARY' ? [
            { code: 'ENG', name: 'English Language', core: true, category: 'Primary' },
            { code: 'MTC', name: 'Mathematics', core: true, category: 'Primary' },
            { code: 'SCI', name: 'Integrated Science', core: true, category: 'Primary' },
            { code: 'SST', name: 'Social Studies & R.E', core: true, category: 'Primary' },
            { code: 'LIT1', name: 'Literacy 1', core: true, category: 'Primary' },
            { code: 'LIT2', name: 'Literacy 2', core: true, category: 'Primary' },
            { code: 'LUG', name: 'Luganda Local Language', core: false, category: 'Primary' },
            { code: 'PE', name: 'Physical Education', core: false, category: 'Primary' }
          ] : [
            { code: '527', name: 'Agriculture', core: false, category: 'O-Level' },
            { code: '800', name: 'Commerce', core: false, category: 'O-Level' },
            { code: '208', name: 'Literature in English', core: false, category: 'O-Level' },
            { code: '223', name: 'Christian Religious Education (CRE)', core: false, category: 'O-Level' },
            { code: '225', name: 'Islamic Religious Education (IRE)', core: false, category: 'O-Level' },
            { code: '840', name: 'Information & Communications Tech (ICT)', core: false, category: 'O-Level' },
            { code: '335', name: 'Luganda Language', core: false, category: 'O-Level' },
            { code: '336', name: 'Kiswahili Language', core: false, category: 'O-Level' },
            { code: '301', name: 'French', core: false, category: 'O-Level' },
            { code: '610', name: 'Fine Art', core: false, category: 'O-Level' },
            { code: '621', name: 'Music', core: false, category: 'O-Level' },
            { code: 'P220', name: 'Economics (Principal A-Level)', core: true, category: 'A-Level' },
            { code: 'P210', name: 'History (Principal A-Level)', core: true, category: 'A-Level' },
            { code: 'P250', name: 'Geography (Principal A-Level)', core: true, category: 'A-Level' },
            { code: 'P245', name: 'Divinity / CRE (Principal A-Level)', core: true, category: 'A-Level' },
            { code: 'P310', name: 'Literature in English (Principal A-Level)', core: true, category: 'A-Level' },
            { code: 'S475', name: 'Subsidiary Mathematics (A-Level)', core: false, isSubsidiary: true, category: 'A-Level' }
          ];

          return (
            <form onSubmit={handleCreateSubject} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Agriculture or Economics"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 font-semibold focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">UNEB Subject Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 527 or P220"
                    value={subjectForm.code}
                    onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Education Level *</label>
                  <select
                    value={subjectForm.category}
                    onChange={(e) => setSubjectForm({ ...subjectForm, category: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 font-semibold"
                  >
                    {currentSchool.levelType === 'PRIMARY' ? (
                      <option value="Primary">Primary (PLE)</option>
                    ) : (
                      <>
                        <option value="O-Level">O-Level (UCE)</option>
                        <option value="A-Level">A-Level (UACE)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subject Classification *</label>
                <select
                  value={subjectForm.core ? 'CORE' : subjectForm.isSubsidiary ? 'SUBSIDIARY' : 'ELECTIVE'}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSubjectForm({
                      ...subjectForm,
                      core: val === 'CORE',
                      isSubsidiary: val === 'SUBSIDIARY'
                    });
                  }}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 font-semibold"
                >
                  <option value="CORE">Compulsory Core Subject</option>
                  <option value="ELECTIVE">Elective / Optional Subject</option>
                  <option value="SUBSIDIARY">Subsidiary Subject (A-Level GP / SubMath / SubICT)</option>
                </select>
              </div>

              {/* 1-Click Popular Subject Presets */}
              <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-2xl space-y-2">
                <span className="text-[11px] font-extrabold text-emerald-950 uppercase tracking-wider block">
                  Quick Select Common Ugandan Subjects:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                  {popularPresets.map(preset => (
                    <button
                      key={preset.code}
                      type="button"
                      onClick={() => setSubjectForm({
                        code: preset.code,
                        name: preset.name,
                        core: preset.core,
                        isSubsidiary: preset.isSubsidiary || false,
                        category: preset.category
                      })}
                      className="text-[10px] px-2.5 py-1 bg-white hover:bg-emerald-100 hover:text-emerald-950 border border-slate-200 rounded-lg font-bold text-slate-700 transition-colors flex items-center space-x-1"
                    >
                      <span className="font-mono text-emerald-800">[{preset.code}]</span>
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all text-sm">
                Save & Add Subject to School
              </button>
            </form>
          );
        })()}
      </Modal>

      {/* Modal: Add Teacher */}
      <Modal isOpen={isTeacherModalOpen} onClose={() => setIsTeacherModalOpen(false)} title="Register Teacher Staff">
        <form onSubmit={handleCreateTeacher} className="space-y-4 text-left max-h-[80vh] overflow-y-auto px-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Teacher Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Tr. Mukasa Peter"
              value={teacherForm.name}
              onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Login Address *</label>
              <input
                type="email"
                required
                placeholder="tr.mukasa@school.edu.ug"
                value={teacherForm.email}
                onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone / Contact</label>
              <input
                type="text"
                placeholder="e.g. +256 700 000000"
                value={teacherForm.phone || ''}
                onChange={(e) => setTeacherForm({ ...teacherForm, phone: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Login Password *</label>
            <input
              type="text"
              required
              placeholder="e.g. teacher123"
              value={teacherForm.password}
              onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
            />
            <p className="text-[10px] text-slate-500 mt-1">This is the default password they will use to login to the portal.</p>
          </div>

          <div className="space-y-4 pt-2 border-t border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Assigned Classes</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
                {schoolClasses.map(cls => (
                  <label key={cls.id} className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={teacherForm.assignedClasses.includes(cls.id)}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setTeacherForm(prev => ({
                          ...prev,
                          assignedClasses: isChecked 
                            ? [...prev.assignedClasses, cls.id] 
                            : prev.assignedClasses.filter(id => id !== cls.id)
                        }));
                      }}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
                    />
                    <span>{cls.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Assigned Subjects</label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
                {sortedSchoolSubjects.map(sub => (
                  <label key={sub.id} className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer truncate">
                    <input
                      type="checkbox"
                      checked={teacherForm.assignedSubjects.includes(sub.id)}
                      onChange={(e) => {
                        const isChecked = e.target.checked;
                        setTeacherForm(prev => ({
                          ...prev,
                          assignedSubjects: isChecked 
                            ? [...prev.assignedSubjects, sub.id] 
                            : prev.assignedSubjects.filter(id => id !== sub.id)
                        }));
                      }}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
                    />
                    <span className="truncate" title={sub.name}>[{getSubjectLevel(sub)}] [{sub.code}] {sub.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <button type="submit" className="w-full py-3 mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-colors text-sm">
            Save & Register Teacher
          </button>
        </form>
      </Modal>

      {/* Modal: Add Student */}
      <Modal isOpen={isStudentModalOpen} onClose={() => setIsStudentModalOpen(false)} title="Enroll Single Student">
        {(() => {
          const currentClassId = studentForm.classId || schoolClasses[0]?.id;
          const currentSelectedClass = schoolClasses.find(c => c.id === currentClassId) || schoolClasses[0];
          const isALevelClass = currentSelectedClass?.level === 'A-Level' || ['S.5', 'S.6'].some(s => currentSelectedClass?.name?.includes(s));

          const popularCombinations = [
            'PCM / ICT',
            'BCM / GP',
            'PEM / GP',
            'HEG / SubMath',
            'MEG / ICT',
            'LED / GP',
            'BAG / ICT',
            'HKG / SubMath'
          ];

          return (
            <form onSubmit={handleCreateStudent} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kateregga Paul"
                  value={studentForm.name}
                  onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">LIN Number</label>
                  <input
                    type="text"
                    placeholder="Auto-generated if blank"
                    value={studentForm.lin}
                    onChange={(e) => setStudentForm({ ...studentForm, lin: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender *</label>
                  <select
                    value={studentForm.gender}
                    onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900"
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
              </div>

              {/* Class and Stream Selectors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Class *</label>
                  <select
                    value={currentClassId}
                    onChange={(e) => {
                      const newClsId = e.target.value;
                      const matchedCls = schoolClasses.find(c => c.id === newClsId);
                      setStudentForm({
                        ...studentForm,
                        classId: newClsId,
                        stream: matchedCls?.streams?.[0] || 'A'
                      });
                    }}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 font-semibold"
                  >
                    {schoolClasses.map(cls => (
                      <option key={cls.id} value={cls.id}>
                        {cls.name} &bull; {cls.level}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stream / Section *</label>
                  {currentSelectedClass?.streams && currentSelectedClass.streams.length > 0 ? (
                    <select
                      value={studentForm.stream || currentSelectedClass.streams[0]}
                      onChange={(e) => setStudentForm({ ...studentForm, stream: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900"
                    >
                      {currentSelectedClass.streams.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      placeholder="e.g. North or A"
                      value={studentForm.stream}
                      onChange={(e) => setStudentForm({ ...studentForm, stream: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900"
                    />
                  )}
                </div>
              </div>

              {/* A-Level Subject Combination Input (Shown when A-Level Class selected) */}
              {isALevelClass && (
                <div className="bg-indigo-50/80 border border-indigo-200 p-3.5 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-extrabold text-indigo-950 uppercase tracking-wide">
                      A' Level Subject Combination *
                    </label>
                    <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-100 px-2 py-0.5 rounded border border-indigo-300">
                      UACE Principal + Subsidiary
                    </span>
                  </div>

                  <input
                    type="text"
                    required={isALevelClass}
                    placeholder="e.g. PCM / ICT or BCM / GP"
                    value={studentForm.combination || ''}
                    onChange={(e) => setStudentForm({ ...studentForm, combination: e.target.value })}
                    className="w-full bg-white border border-indigo-300 rounded-xl px-4 py-2 text-sm font-bold text-indigo-900 focus:outline-none focus:border-indigo-500 font-mono"
                  />

                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">Quick Select Preset:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {popularCombinations.map(comb => (
                        <button
                          key={comb}
                          type="button"
                          onClick={() => setStudentForm({ ...studentForm, combination: comb })}
                          className={`text-[10px] px-2 py-1 rounded-lg font-mono font-bold transition-all border ${
                            studentForm.combination === comb
                              ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                              : 'bg-white text-indigo-900 border-indigo-200 hover:bg-indigo-100'
                          }`}
                        >
                          {comb}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Parent Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 0772123456"
                    value={studentForm.parentPhone}
                    onChange={(e) => setStudentForm({ ...studentForm, parentPhone: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Parent Access PIN *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1234"
                    value={studentForm.parentPin}
                    onChange={(e) => setStudentForm({ ...studentForm, parentPin: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">House / Dormitory</label>
                <input
                  type="text"
                  placeholder="e.g. Kiwanuka"
                  value={studentForm.house}
                  onChange={(e) => setStudentForm({ ...studentForm, house: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900"
                />
              </div>

              {/* Passport Photo Upload */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-1">Student Passport Photo</label>
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-10 rounded-lg bg-white border border-slate-300 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                    {studentForm.photoUrl ? (
                      <img src={studentForm.photoUrl} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-[8px] font-bold text-slate-400 text-center">Photo</span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setStudentForm(prev => ({ ...prev, photoUrl: reader.result }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-100 file:text-emerald-900 hover:file:bg-emerald-200 cursor-pointer"
                  />
                </div>
              </div>

              <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all text-sm">
                Enroll Student
              </button>
            </form>
          );
        })()}
      </Modal>

      {/* Modal: Edit Student & Parent PIN */}
      <Modal isOpen={isEditStudentModalOpen} onClose={() => setIsEditStudentModalOpen(false)} title={`Edit Student Details: ${editingStudent?.name || ''}`}>
        {editingStudent && (() => {
          const matchedCls = schoolClasses.find(c => c.id === editStudentForm.classId) || schoolClasses[0];
          const isALevel = matchedCls?.level === 'A-Level' || ['S.5', 'S.6'].some(s => matchedCls?.name?.includes(s));

          const popularCombinations = [
            'PCM / ICT',
            'BCM / GP',
            'PEM / GP',
            'HEG / SubMath',
            'MEG / ICT',
            'LED / GP',
            'BAG / ICT',
            'HKG / SubMath'
          ];

          return (
            <form onSubmit={handleSaveEditStudent} className="space-y-4 text-left max-h-[80vh] overflow-y-auto px-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  value={editStudentForm.name}
                  onChange={(e) => setEditStudentForm({ ...editStudentForm, name: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">LIN Number</label>
                  <input
                    type="text"
                    value={editStudentForm.lin}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, lin: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender *</label>
                  <select
                    value={editStudentForm.gender}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, gender: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 font-semibold"
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                </div>
              </div>

              {/* Class and Stream */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Class *</label>
                  <select
                    value={editStudentForm.classId}
                    onChange={(e) => {
                      const newClsId = e.target.value;
                      const c = schoolClasses.find(x => x.id === newClsId);
                      setEditStudentForm({
                        ...editStudentForm,
                        classId: newClsId,
                        stream: c?.streams?.[0] || 'A'
                      });
                    }}
                    className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 font-semibold"
                  >
                    {schoolClasses.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.name} &bull; {cls.level}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Stream / Section *</label>
                  {matchedCls?.streams && matchedCls.streams.length > 0 ? (
                    <select
                      value={editStudentForm.stream || matchedCls.streams[0]}
                      onChange={(e) => setEditStudentForm({ ...editStudentForm, stream: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 font-semibold"
                    >
                      {matchedCls.streams.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={editStudentForm.stream}
                      onChange={(e) => setEditStudentForm({ ...editStudentForm, stream: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900"
                    />
                  )}
                </div>
              </div>

              {/* A-Level Subject Combination (if applicable) */}
              {isALevel && (
                <div className="bg-indigo-50/80 border border-indigo-200 p-3.5 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-extrabold text-indigo-950 uppercase tracking-wide">
                      A' Level Subject Combination *
                    </label>
                    <span className="text-[10px] text-indigo-700 font-semibold bg-indigo-100 px-2 py-0.5 rounded border border-indigo-300">
                      UACE Principal + Subsidiary
                    </span>
                  </div>

                  <input
                    type="text"
                    required={isALevel}
                    placeholder="e.g. PCM / ICT or BCM / GP"
                    value={editStudentForm.combination || ''}
                    onChange={(e) => setEditStudentForm({ ...editStudentForm, combination: e.target.value })}
                    className="w-full bg-white border border-indigo-300 rounded-xl px-4 py-2 text-sm font-bold text-indigo-900 focus:outline-none focus:border-indigo-500 font-mono"
                  />

                  <div>
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">Quick Select Preset:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {popularCombinations.map(comb => (
                        <button
                          key={comb}
                          type="button"
                          onClick={() => setEditStudentForm({ ...editStudentForm, combination: comb })}
                          className={`text-[10px] px-2 py-1 rounded-lg font-mono font-bold transition-all border ${
                            editStudentForm.combination === comb
                              ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                              : 'bg-white text-indigo-900 border-indigo-200 hover:bg-indigo-100'
                          }`}
                        >
                          {comb}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* House / Dormitory */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">House / Dormitory</label>
                <input
                  type="text"
                  placeholder="e.g. Kiwanuka, Lwanga, Main"
                  value={editStudentForm.house}
                  onChange={(e) => setEditStudentForm({ ...editStudentForm, house: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900"
                />
              </div>

              {/* Fee Particulars */}
              <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-2xl space-y-3">
                <div className="flex items-center space-x-2 text-emerald-900 font-bold text-xs">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Fee Billing &amp; Payment (UGX)</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Required Term Fee (UGX)</label>
                    <input
                      type="number"
                      min="0"
                      value={editStudentForm.feeRequiredUGX}
                      onChange={(e) => setEditStudentForm({ ...editStudentForm, feeRequiredUGX: e.target.value })}
                      className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Amount Paid (UGX)</label>
                    <input
                      type="number"
                      min="0"
                      value={editStudentForm.feePaidUGX}
                      onChange={(e) => setEditStudentForm({ ...editStudentForm, feePaidUGX: e.target.value })}
                      className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div className="text-[11px] text-emerald-800 font-medium flex items-center justify-between">
                  <span>Computed Balance:</span>
                  <span className="font-mono font-bold">
                    UGX {Math.max(0, (Number(editStudentForm.feeRequiredUGX) || 0) - (Number(editStudentForm.feePaidUGX) || 0)).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Parent Credentials Box */}
              <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-2xl space-y-3">
                <div className="flex items-center space-x-2 text-emerald-950 font-bold text-xs">
                  <Lock className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Parent Portal Credentials</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Parent Secret PIN *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1234"
                      value={editStudentForm.parentPin}
                      onChange={(e) => setEditStudentForm({ ...editStudentForm, parentPin: e.target.value })}
                      className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-2 text-sm font-mono font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Parent Phone (SMS)</label>
                    <input
                      type="text"
                      placeholder="e.g. 0772123456"
                      value={editStudentForm.parentPhone}
                      onChange={(e) => setEditStudentForm({ ...editStudentForm, parentPhone: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500">
                  The parent uses LIN: <strong className="font-mono text-slate-700">{editStudentForm.lin || 'LIN-XXXX'}</strong> and this Secret PIN to sign in.
                </p>
              </div>

              {/* Passport Photo Upload */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-1">Student Passport Photo</label>
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-10 rounded-lg bg-white border border-slate-300 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                    {editStudentForm.photoUrl ? (
                      <img src={editStudentForm.photoUrl} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-[8px] font-bold text-slate-400 text-center">Photo</span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setEditStudentForm(prev => ({ ...prev, photoUrl: reader.result }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-100 file:text-emerald-900 hover:file:bg-emerald-200 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditStudentModalOpen(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md text-sm transition-all"
                >
                  Save Student Details
                </button>
              </div>
            </form>
          );
        })()}
      </Modal>

      {/* Modal: Bulk Excel Upload */}
      <Modal isOpen={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)} title="Bulk Student & Marks Excel Upload">
        <form onSubmit={handleUploadExcel} className="space-y-4 text-left">
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs text-emerald-950 space-y-2">
            <p className="font-bold">Instructions:</p>
            <p>1. Download the pre-formatted Excel template pre-filled with your school's current subject columns.</p>
            <p>2. Fill in student names, LINs, and marks in Excel.</p>
            
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="mt-2 px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg flex items-center space-x-1 hover:bg-emerald-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Excel Template (.xlsx)</span>
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Filled Spreadsheet (.xlsx, .xls, .csv) *</label>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={(e) => setUploadFile(e.target.files[0])}
              className="w-full bg-white border border-slate-300 rounded-xl p-2 text-sm text-slate-700"
            />
          </div>

          <button type="submit" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md">
            Process & Enroll Students
          </button>
        </form>
      </Modal>

      {/* Modal: Add Class */}
      <Modal isOpen={isClassModalOpen} onClose={() => setIsClassModalOpen(false)} title="Add Class & Configure Initial Streams">
        <form onSubmit={handleCreateClass} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Class Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. S.3 or S.6 or P.6"
              value={classForm.name}
              onChange={(e) => {
                const val = e.target.value;
                const autoLevel = currentSchool.levelType === 'PRIMARY' 
                  ? 'Primary' 
                  : (['S.5', 'S.6'].some(s => val.toUpperCase().includes(s)) ? 'A-Level' : 'O-Level');
                setClassForm({ ...classForm, name: val, level: autoLevel });
              }}
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Education Level *</label>
            <select
              value={classForm.level}
              onChange={(e) => setClassForm({ ...classForm, level: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 font-semibold"
            >
              {currentSchool.levelType === 'PRIMARY' ? (
                <option value="Primary">Primary (PLE)</option>
              ) : (
                <>
                  <option value="O-Level">O-Level (UCE)</option>
                  <option value="A-Level">A-Level (UACE)</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Initial Custom Streams (comma-separated) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. North, South, East, West"
              value={classForm.streams}
              onChange={(e) => setClassForm({ ...classForm, streams: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
            />

            <div className="mt-2 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold block">Quick Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setClassForm({ ...classForm, streams: 'North, South, East, West' })}
                  className="text-[10px] px-2 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-950 border border-slate-200 rounded-md font-bold text-slate-700"
                >
                  Compass (North, South, East, West)
                </button>
                <button
                  type="button"
                  onClick={() => setClassForm({ ...classForm, streams: 'Blue, Red, Yellow, Green' })}
                  className="text-[10px] px-2 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-950 border border-slate-200 rounded-md font-bold text-slate-700"
                >
                  Colors (Blue, Red, Yellow, Green)
                </button>
                <button
                  type="button"
                  onClick={() => setClassForm({ ...classForm, streams: 'Sciences, Arts, Commercial' })}
                  className="text-[10px] px-2 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-950 border border-slate-200 rounded-md font-bold text-slate-700"
                >
                  A-Level Tracks (Sciences, Arts, Commercial)
                </button>
                <button
                  type="button"
                  onClick={() => setClassForm({ ...classForm, streams: 'A, B, C, D' })}
                  className="text-[10px] px-2 py-1 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-950 border border-slate-200 rounded-md font-bold text-slate-700"
                >
                  Letters (A, B, C, D)
                </button>
              </div>
            </div>
          </div>

          <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all text-sm mt-2">
            Create Class & Streams
          </button>
        </form>
      </Modal>

      {/* ──────────────────────────── Modal: Edit Teacher ──────────────────────────── */}
      <Modal isOpen={isEditTeacherModalOpen} onClose={() => { setIsEditTeacherModalOpen(false); setEditingTeacher(null); }} title={`Edit Teacher — ${editingTeacher?.name || ''}`}>
        <form onSubmit={handleSaveEditTeacher} className="space-y-4 text-left max-h-[80vh] overflow-y-auto px-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
            <input type="text" required placeholder="e.g. Tr. Mukasa Peter" value={editTeacherForm.name}
              onChange={(e) => setEditTeacherForm({ ...editTeacherForm, name: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Login *</label>
              <input type="email" required value={editTeacherForm.email}
                onChange={(e) => setEditTeacherForm({ ...editTeacherForm, email: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone</label>
              <input type="text" placeholder="+256 7XX XXX XXX" value={editTeacherForm.phone}
                onChange={(e) => setEditTeacherForm({ ...editTeacherForm, phone: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Login Password</label>
            <input type="text" placeholder="Leave unchanged or enter new password" value={editTeacherForm.password}
              onChange={(e) => setEditTeacherForm({ ...editTeacherForm, password: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-600"
            />
          </div>
          <div className="space-y-3 pt-2 border-t border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Assigned Classes</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
                {schoolClasses.map(cls => (
                  <label key={cls.id} className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                    <input type="checkbox"
                      checked={editTeacherForm.assignedClasses.includes(cls.id)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setEditTeacherForm(prev => ({
                          ...prev,
                          assignedClasses: checked ? [...prev.assignedClasses, cls.id] : prev.assignedClasses.filter(id => id !== cls.id)
                        }));
                      }}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
                    />
                    <span>{cls.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">Assigned Subjects</label>
              <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 border border-slate-200 rounded-xl">
                {sortedSchoolSubjects.map(sub => (
                  <label key={sub.id} className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                    <input type="checkbox"
                      checked={editTeacherForm.assignedSubjects.includes(sub.id)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setEditTeacherForm(prev => ({
                          ...prev,
                          assignedSubjects: checked ? [...prev.assignedSubjects, sub.id] : prev.assignedSubjects.filter(id => id !== sub.id)
                        }));
                      }}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-600"
                    />
                    <span className="truncate">[{getSubjectLevel(sub)}] [{sub.code}] {sub.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <button type="submit" className="w-full py-3 mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-colors text-sm">
            Save Teacher Changes
          </button>
        </form>
      </Modal>

      {/* ──────────────── Confirm Action Modal (Delete / Block / Unblock) ─────────────── */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto ${
              confirmAction.type === 'delete' ? 'bg-rose-100' :
              confirmAction.type === 'block' ? 'bg-emerald-100' :
              'bg-emerald-100'
            }`}>
              {confirmAction.type === 'delete' ? <Trash2 className="w-7 h-7 text-rose-600" /> :
               confirmAction.type === 'block' ? <Ban className="w-7 h-7 text-emerald-700" /> :
               <Unlock className="w-7 h-7 text-emerald-600" />}
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-lg font-extrabold text-slate-900 font-outfit">
                {confirmAction.type === 'delete' ? 'Permanently Delete?' :
                 confirmAction.type === 'block' ? 'Block Account?' :
                 'Unblock Account?'}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {confirmAction.type === 'delete'
                  ? <>Are you sure you want to <span className="text-rose-600 font-bold">permanently delete</span> the record for <span className="font-bold text-slate-800">{confirmAction.record.name}</span>? This action cannot be undone.</>
                  : confirmAction.type === 'block'
                  ? <>This will <span className="text-emerald-700 font-bold">block login access</span> for <span className="font-bold text-slate-800">{confirmAction.record.name}</span>. They will not be able to sign in until unblocked.</>
                  : <>This will <span className="text-emerald-600 font-bold">restore login access</span> for <span className="font-bold text-slate-800">{confirmAction.record.name}</span>.</>
                }
              </p>
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className={`flex-1 py-2.5 rounded-xl text-white font-bold text-sm transition-colors ${
                  confirmAction.type === 'delete' ? 'bg-rose-500 hover:bg-rose-600' :
                  confirmAction.type === 'block' ? 'bg-emerald-600 hover:bg-emerald-700' :
                  'bg-emerald-500 hover:bg-emerald-600'
                }`}
              >
                {confirmAction.type === 'delete' ? 'Yes, Delete' :
                 confirmAction.type === 'block' ? 'Yes, Block' :
                 'Yes, Unblock'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
