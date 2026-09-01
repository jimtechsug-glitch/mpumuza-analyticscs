import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Modal from '../common/Modal';
import {
  School,
  Plus,
  Users,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  DollarSign,
  ListFilter,
  Trash2,
  Edit3,
  Lock,
  Unlock,
  AlertTriangle,
  Mail,
  Phone,
  MapPin,
  Palette,
  Percent,
  SlidersHorizontal,
  ExternalLink,
  Layers,
  X
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const {
    schools,
    students,
    users,
    auditLogs,
    addSchoolPlatform,
    editSchoolPlatform,
    toggleSchoolStatus,
    deleteSchoolPlatform,
    updateSubscriptionStatus,
    switchTenant
  } = useAuth();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSchoolId, setEditingSchoolId] = useState(null);
  const [logFilterCategory, setLogFilterCategory] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'ACTIVE', 'BLOCKED'
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState('schools'); // 'schools' | 'logs'

  // Create School Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    levelType: 'SECONDARY',
    motto: '',
    address: '',
    contactPhone: '',
    contactEmail: '',
    headTeacher: '',
    adminName: '',
    adminEmail: '',
    adminPassword: ''
  });

  // Edit School Form State
  const [editFormData, setEditFormData] = useState({
    name: '',
    slug: '',
    levelType: 'SECONDARY',
    motto: '',
    address: '',
    contactPhone: '',
    contactEmail: '',
    headTeacher: '',
    headTeacherSignature: '',
    dosName: '',
    dosSignature: '',
    themeColor: 'navy',
    badgeUrl: '',
    botWeight: 20,
    motWeight: 20,
    eotWeight: 60,
    useNewCurriculum: false,
    showPositionRanking: true,
    subscriptionStatus: 'ACTIVE',
    billingPlan: 'PER_STUDENT_TERM',
    studentRateUGX: 1500,
    active: true,
    adminName: '',
    adminEmail: '',
    adminPassword: ''
  });

  const totalPlatformRevenueUGX = students.length * 1500;

  const filteredLogs = logFilterCategory === 'ALL'
    ? auditLogs
    : auditLogs.filter(l => l.category === logFilterCategory);

  const displayedSchools = schools.filter(s => {
    if (statusFilter === 'ACTIVE') return s.active && s.subscriptionStatus !== 'SUSPENDED';
    if (statusFilter === 'BLOCKED') return !s.active || s.subscriptionStatus === 'SUSPENDED';
    return true;
  });

  // Open Edit Modal and prefill data
  const handleOpenEditModal = (school) => {
    const schoolAdmin = users.find(u => u.schoolId === school.id && u.role === 'SCHOOL_ADMIN');
    setEditingSchoolId(school.id);
    setEditFormData({
      name: school.name || '',
      slug: school.slug || '',
      levelType: school.levelType || 'SECONDARY',
      motto: school.motto || '',
      address: school.address || '',
      contactPhone: school.contactPhone || '',
      contactEmail: school.contactEmail || '',
      headTeacher: school.headTeacher || '',
      headTeacherSignature: school.headTeacherSignature || '',
      dosName: school.dosName || 'Director of Studies',
      dosSignature: school.dosSignature || '',
      themeColor: school.themeColor || 'navy',
      badgeUrl: school.badgeUrl || '',
      botWeight: school.botWeight ?? 20,
      motWeight: school.motWeight ?? 20,
      eotWeight: school.eotWeight ?? 60,
      useNewCurriculum: school.useNewCurriculum || false,
      showPositionRanking: school.showPositionRanking !== false,
      subscriptionStatus: school.subscriptionStatus || 'ACTIVE',
      billingPlan: school.billingPlan || 'PER_STUDENT_TERM',
      studentRateUGX: school.studentRateUGX || 1500,
      active: school.active !== false,
      adminName: schoolAdmin?.name || '',
      adminEmail: schoolAdmin?.email || '',
      adminPassword: ''
    });
    setIsEditModalOpen(true);
  };

  // Submit Create School
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.adminEmail) {
      alert('Please fill in the School Name and Admin Email.');
      return;
    }

    await addSchoolPlatform(
      {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        levelType: formData.levelType,
        motto: formData.motto,
        address: formData.address,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        headTeacher: formData.headTeacher
      },
      {
        name: formData.adminName || `${formData.name} Admin`,
        email: formData.adminEmail,
        password: formData.adminPassword || 'admin123'
      }
    );

    setIsCreateModalOpen(false);
    setFormData({
      name: '',
      slug: '',
      levelType: 'SECONDARY',
      motto: '',
      address: '',
      contactPhone: '',
      contactEmail: '',
      headTeacher: '',
      adminName: '',
      adminEmail: '',
      adminPassword: ''
    });
  };

  // Submit Edit School
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.name) {
      alert('School name is required.');
      return;
    }

    const schoolPayload = {
      name: editFormData.name,
      slug: editFormData.slug || editFormData.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      levelType: editFormData.levelType,
      motto: editFormData.motto,
      address: editFormData.address,
      contactPhone: editFormData.contactPhone,
      contactEmail: editFormData.contactEmail,
      headTeacher: editFormData.headTeacher,
      headTeacherSignature: editFormData.headTeacherSignature || `${editFormData.headTeacher} (Headteacher)`,
      dosName: editFormData.dosName,
      dosSignature: editFormData.dosSignature || `${editFormData.dosName} (DOS)`,
      themeColor: editFormData.themeColor,
      badgeUrl: editFormData.badgeUrl,
      botWeight: Number(editFormData.botWeight) || 20,
      motWeight: Number(editFormData.motWeight) || 20,
      eotWeight: Number(editFormData.eotWeight) || 60,
      useNewCurriculum: editFormData.useNewCurriculum,
      showPositionRanking: editFormData.showPositionRanking,
      subscriptionStatus: editFormData.subscriptionStatus,
      billingPlan: editFormData.billingPlan,
      studentRateUGX: Number(editFormData.studentRateUGX) || 1500,
      active: editFormData.active
    };

    const adminPayload = {
      name: editFormData.adminName,
      email: editFormData.adminEmail,
      password: editFormData.adminPassword || undefined
    };

    await editSchoolPlatform(editingSchoolId, schoolPayload, adminPayload);
    setIsEditModalOpen(false);
    setEditingSchoolId(null);
  };

  // Handle Quick Toggle Block/Unblock
  const handleToggleBlock = async (school) => {
    const willBlock = school.active;
    const confirmMsg = willBlock
      ? `Are you sure you want to BLOCK "${school.name}"?\n\n• School Administrators, Teachers, and Parents of this school will be IMMEDIATELY RESTRICTED from logging in.\n• You can unblock the school at any time.`
      : `Are you sure you want to UNBLOCK "${school.name}"?\n\n• School Administrators, Teachers, and Parents will immediately regain full access.`;

    if (window.confirm(confirmMsg)) {
      await toggleSchoolStatus(school.id);
    }
  };

  // Handle Permanent Delete
  const handleDeleteSchool = async (school) => {
    if (window.confirm(`Are you sure you want to PERMANENTLY delete "${school.name}"?\n\n⚠️ This will remove all associated classes, subjects, and student records from the database.`)) {
      await deleteSchoolPlatform(school.id);
    }
  };

  return (
    <div className="space-y-8 text-left">

      {/* Mobile Navigation Bar (visible on small screens) */}
      <div className="lg:hidden bg-white border border-slate-200 rounded-2xl p-3 shadow-sm flex items-center justify-between gap-2">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="flex-1 py-2.5 px-3.5 bg-gradient-to-r from-sky-900 to-indigo-900 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-sm active:scale-98 transition-all"
        >
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-sky-300" />
            <span>Super Admin Control Panel</span>
          </div>
          <span className="text-[10px] bg-sky-400 text-slate-950 px-2 py-0.5 rounded-full font-black uppercase">
            {mobileSection === 'schools' ? 'Schools' : 'Audit Logs'}
          </span>
        </button>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-3.5 py-2.5 bg-sky-600 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 flex items-center space-x-1.5 shrink-0"
          title="Create New School"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New School</span>
        </button>
      </div>

      {/* Off-Canvas Mobile Sidebar Drawer */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
          />
          <div className="relative w-[320px] max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto p-4 space-y-4">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-sky-600 flex items-center justify-center text-white">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 font-outfit uppercase tracking-wider">Super Admin</h3>
                  <span className="text-[10px] text-slate-500">Platform Control Center</span>
                </div>
              </div>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Global Stats Summary */}
            <div className="bg-gradient-to-br from-sky-900 to-indigo-900 text-white rounded-2xl p-3.5 space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-300 block">Platform Overview</span>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-white/10 rounded-xl p-2">
                  <div className="text-xl font-extrabold font-outfit">{schools.length}</div>
                  <div className="text-[10px] text-sky-200">School Tenants</div>
                </div>
                <div className="bg-white/10 rounded-xl p-2">
                  <div className="text-xl font-extrabold font-outfit">{students.length}</div>
                  <div className="text-[10px] text-sky-200">Students</div>
                </div>
                <div className="bg-white/10 rounded-xl p-2">
                  <div className="text-sm font-extrabold font-outfit text-emerald-300">{schools.filter(s => s.active).length} Active</div>
                  <div className="text-[10px] text-sky-200">Live Portals</div>
                </div>
                <div className="bg-white/10 rounded-xl p-2">
                  <div className="text-sm font-extrabold font-outfit text-rose-300">{schools.filter(s => !s.active).length} Blocked</div>
                  <div className="text-[10px] text-sky-200">Restricted</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 space-y-2">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">Quick Actions</span>
              <button
                onClick={() => { setIsCreateModalOpen(true); setIsMobileSidebarOpen(false); }}
                className="w-full px-3 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold flex items-center justify-between shadow-xs"
              >
                <div className="flex items-center space-x-2">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create New School Platform</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Section Navigation */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 px-2 tracking-wider block">Sections</span>
              {[
                { id: 'schools', label: 'School Platforms Directory', icon: School },
                { id: 'logs', label: 'Security & Audit Logs', icon: ShieldCheck }
              ].map(section => {
                const Icon = section.icon;
                const isActive = mobileSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => { setMobileSection(section.id); setIsMobileSidebarOpen(false); }}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                      isActive ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{section.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-800 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <span className="p-2.5 bg-white/20 rounded-2xl text-white backdrop-blur-sm shadow-inner shrink-0">
                <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" />
              </span>
              <div>
                <span className="text-[10px] sm:text-[11px] uppercase tracking-widest text-sky-200 font-bold block">Super Administrator</span>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white font-outfit leading-tight">
                  Mpumuza Analytics Platform Control
                </h1>
              </div>
            </div>
            <p className="text-sky-100 text-xs sm:text-sm max-w-2xl font-medium mt-1">
              Configure multi-tenant school platforms, manage and edit institution profiles, block/unblock tenant access, configure UNEB grading metrics, and audit system security.
            </p>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-slate-900 hover:bg-slate-950 text-white font-bold px-5 py-3 sm:px-6 sm:py-3.5 rounded-2xl shadow-xl transition-all flex items-center space-x-2 shrink-0 border border-slate-800 hover:scale-105 active:scale-95 text-xs sm:text-sm"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400" />
            <span>Create New School Platform</span>
          </button>
        </div>
      </div>

      {/* Global Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total School Platforms</span>
            <div className="p-2.5 sm:p-3 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-200">
              <School className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-outfit">{schools.length}</div>
          <div className="text-xs text-slate-600 font-semibold mt-2 flex items-center justify-between">
            <span className="text-emerald-600 font-bold">{schools.filter(s => s.active).length} Active</span>
            <span className="text-rose-600 font-bold">{schools.filter(s => !s.active).length} Blocked</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Enrolled Students</span>
            <div className="p-2.5 sm:p-3 bg-blue-50 rounded-xl text-blue-600 border border-blue-200">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-outfit">{students.length}</div>
          <div className="text-xs text-slate-500 mt-2 font-medium">Across all levels &amp; streams</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Platform Billing Revenue</span>
            <div className="p-2.5 sm:p-3 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-200">
              <DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-slate-900 font-outfit">UGX {totalPlatformRevenueUGX.toLocaleString()}</div>
          <div className="text-xs text-emerald-700 font-semibold mt-2">@ 1,500 UGX / active student / term</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">MongoDB Database</span>
            <div className="p-2.5 sm:p-3 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-200">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-emerald-700 font-outfit">MongoDB Atlas Connected</div>
          <div className="text-xs text-slate-500 mt-2 font-medium">Multi-tenant Document Cloud DB</div>
        </div>

      </div>

      {/* School Platforms Directory */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-outfit">Registered School Platforms ({displayedSchools.length})</h2>
            <p className="text-xs text-slate-500">Manage, edit details, and configure access permissions or block tenant portals.</p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500">Filter:</span>
            <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1 text-xs font-bold border border-slate-200">
              <button
                type="button"
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all ${statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
              >
                All ({schools.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('ACTIVE')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all ${statusFilter === 'ACTIVE' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Active ({schools.filter(s => s.active).length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('BLOCKED')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg transition-all ${statusFilter === 'BLOCKED' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Blocked ({schools.filter(s => !s.active).length})
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {displayedSchools.map(school => {
            const schoolStudents = students.filter(s => s.schoolId === school.id);
            const schoolAdmin = users.find(u => u.schoolId === school.id && u.role === 'SCHOOL_ADMIN');
            const subStatus = school.subscriptionStatus || 'ACTIVE';
            const isBlocked = !school.active || subStatus === 'SUSPENDED';

            return (
              <div
                key={school.id}
                className={`rounded-2xl p-5 sm:p-6 transition-all shadow-sm hover:shadow-md flex flex-col justify-between group border relative ${
                  isBlocked
                    ? 'bg-rose-50/40 border-rose-300 ring-1 ring-rose-200'
                    : 'bg-slate-50 border-slate-200 hover:border-emerald-500'
                }`}
              >
                {/* Blocked Badge Banner */}
                {isBlocked && (
                  <div className="mb-3 bg-rose-600 text-white px-3 py-1 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs">
                    <span className="flex items-center space-x-1">
                      <Lock className="w-3.5 h-3.5" />
                      <span>ACCESS RESTRICTED / BLOCKED</span>
                    </span>
                    <span className="text-[10px] bg-rose-800 px-1.5 py-0.5 rounded">Login Denied</span>
                  </div>
                )}

                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-12 w-12 rounded-xl bg-white p-1 border border-slate-200 overflow-hidden shrink-0 shadow-xs">
                      <img
                        src={school.badgeUrl}
                        alt="Badge"
                        className="h-full w-full object-cover rounded-lg"
                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=200&q=80'; }}
                      />
                    </div>

                    <span className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold ${
                      school.levelType === 'PRIMARY' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                      'bg-blue-100 text-blue-800 border border-blue-300'
                    }`}>
                      {school.levelType === 'PRIMARY' ? 'Primary School (PLE)' : 'Secondary (O & A Level)'}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors font-outfit">
                    {school.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 italic">"{school.motto || 'No motto set'}"</p>

                  <div className="mt-4 pt-4 border-t border-slate-200 space-y-2 text-xs text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-500">School Code/Slug:</span>
                      <span className="font-mono text-emerald-700 font-bold">{school.slug}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Head Teacher:</span>
                      <span className="font-semibold text-slate-900">{school.headTeacher || 'Not assigned'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Admin Account:</span>
                      <span className="text-slate-800 truncate max-w-[160px] font-mono text-[11px]">{schoolAdmin?.email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Enrolled Students:</span>
                      <span className="font-bold text-slate-900">{schoolStudents.length}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                      <span className="text-slate-500">Subscription:</span>
                      <select
                        value={subStatus}
                        onChange={(e) => updateSubscriptionStatus(school.id, e.target.value)}
                        className={`text-[10px] font-bold rounded px-2 py-0.5 border ${
                          subStatus === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                          subStatus === 'TRIAL' ? 'bg-teal-100 text-teal-800 border-teal-300' :
                          'bg-rose-100 text-rose-800 border-rose-300'
                        }`}
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="TRIAL">TRIAL</option>
                        <option value="PAST_DUE">PAST DUE</option>
                        <option value="SUSPENDED">SUSPENDED (BLOCKED)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="mt-6 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  
                  {/* Block / Unblock Toggle Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleBlock(school)}
                    className={`flex items-center space-x-1 text-xs px-3 py-1.5 rounded-xl border font-bold transition-all ${
                      school.active
                        ? 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                    }`}
                    title={school.active ? 'Block this school portal' : 'Unblock this school portal'}
                  >
                    {school.active ? (
                      <>
                        <Lock className="w-3.5 h-3.5 text-rose-600" />
                        <span>Block</span>
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Unblock</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center space-x-1.5">
                    
                    {/* Edit School Details Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(school)}
                      className="text-xs text-slate-700 hover:text-slate-900 font-bold bg-white hover:bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-xl transition-colors flex items-center space-x-1 shadow-xs"
                      title="Edit school details & settings"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Edit</span>
                    </button>

                    {/* Manage Tenant Preview */}
                    <button
                      type="button"
                      onClick={() => switchTenant(school.id)}
                      className="text-xs text-sky-700 hover:text-sky-800 font-bold bg-sky-50 hover:bg-sky-100 border border-sky-200 px-3 py-1.5 rounded-xl transition-colors"
                      title="Preview this school's dashboard"
                    >
                      <span>Manage &rarr;</span>
                    </button>

                    {/* Delete School Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteSchool(school)}
                      title="Delete School Platform"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-xl transition-all"
                    >
                      <Trash2 className="w-4 h-4 text-rose-500" />
                    </button>

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Global Audit Logs Monitor */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-outfit">Platform Security &amp; Audit Logs Monitor</h2>
            <p className="text-xs text-slate-500">Real-time system audit logs across all tenant school platforms.</p>
          </div>

          <div className="flex items-center space-x-2">
            <ListFilter className="w-4 h-4 text-slate-500" />
            <select
              value={logFilterCategory}
              onChange={(e) => setLogFilterCategory(e.target.value)}
              className="bg-slate-100 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold"
            >
              <option value="ALL">All Categories</option>
              <option value="PLATFORM_ADMIN">Platform Admin</option>
              <option value="AUTHENTICATION">Authentication &amp; Logins</option>
              <option value="SCHOOL_CONFIG">School Config</option>
              <option value="STUDENT_MGMT">Student Management</option>
              <option value="FINANCIAL_CLEARANCE">Fees &amp; Finance</option>
              <option value="MARK_SHEET">Mark Entries</option>
            </select>
          </div>
        </div>

        {/* Mobile Card List for Logs (hidden on md+) */}
        <div className="md:hidden space-y-3">
          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-xs italic">No logs recorded for this filter.</div>
          )}
          {filteredLogs.map((log, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-bold text-slate-900 text-xs">{log.userName}</span>
                  <span className="text-[10px] text-slate-400 block font-mono">{log.userRole}</span>
                </div>
                <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[9px] font-bold border border-slate-300 shrink-0">
                  {log.category}
                </span>
              </div>
              <div className="font-bold text-xs text-emerald-800">{log.action}</div>
              <p className="text-xs text-slate-600 font-medium">{log.details}</p>
              <div className="text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-200">
                {new Date(log.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View for Logs */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-outfit uppercase border-b border-slate-200">
                <th className="p-3">Timestamp</th>
                <th className="p-3">User Staff / System</th>
                <th className="p-3">User Role</th>
                <th className="p-3">Category</th>
                <th className="p-3">Action</th>
                <th className="p-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredLogs.map((log, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 font-mono text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-3 font-bold text-slate-900">{log.userName}</td>
                  <td className="p-3 text-slate-600 font-semibold">{log.userRole}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded text-[10px] font-bold border border-slate-300">
                      {log.category}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-emerald-800">{log.action}</td>
                  <td className="p-3 text-slate-700 font-medium">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Create New School Platform */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New School Platform Instance">
        <form onSubmit={handleCreateSubmit} className="space-y-4 text-left">
          
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">School Official Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Uganda Martyrs SS Namugongo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">School Level Standard *</label>
              <select
                value={formData.levelType}
                onChange={(e) => setFormData({ ...formData, levelType: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
              >
                <option value="PRIMARY">PRIMARY SCHOOL (PLE Standard P.1-P.7)</option>
                <option value="SECONDARY">SECONDARY SCHOOL (O-Level & A-Level Combined)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Headteacher Name</label>
              <input
                type="text"
                placeholder="e.g. Fr. Henry Ssuubi"
                value={formData.headTeacher}
                onChange={(e) => setFormData({ ...formData, headTeacher: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Motto</label>
            <input
              type="text"
              placeholder="e.g. Education for Light and Faith"
              value={formData.motto}
              onChange={(e) => setFormData({ ...formData, motto: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="border-t border-slate-200 pt-3 mt-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">School Admin Account Credentials</h4>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Admin Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="admin.namugongo@uneb.go.ug"
                  value={formData.adminEmail}
                  onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Initial Password</label>
                <input
                  type="password"
                  placeholder="admin123"
                  value={formData.adminPassword}
                  onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all text-sm"
            >
              Provision School Platform Instance
            </button>
          </div>

        </form>
      </Modal>

      {/* Modal 2: Edit School Details & Status */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit School Platform Details & Settings"
      >
        <form onSubmit={handleEditSubmit} className="space-y-5 text-left max-h-[80vh] overflow-y-auto pr-1">
          
          {/* Section 1: Core Profile */}
          <div>
            <h4 className="text-xs font-extrabold uppercase text-emerald-800 tracking-wider mb-3 flex items-center space-x-1.5">
              <School className="w-4 h-4 text-emerald-600" />
              <span>Core Profile & Identity</span>
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">School Official Name *</label>
                <input
                  type="text"
                  required
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Level Standard</label>
                  <select
                    value={editFormData.levelType}
                    onChange={(e) => setEditFormData({ ...editFormData, levelType: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 font-bold"
                  >
                    <option value="PRIMARY">PRIMARY (PLE P.1-P.7)</option>
                    <option value="SECONDARY">SECONDARY (O & A Level)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">System Code/Slug</label>
                  <input
                    type="text"
                    value={editFormData.slug}
                    onChange={(e) => setEditFormData({ ...editFormData, slug: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Motto</label>
                <input
                  type="text"
                  value={editFormData.motto}
                  onChange={(e) => setEditFormData({ ...editFormData, motto: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Badge / Logo URL</label>
                <input
                  type="text"
                  value={editFormData.badgeUrl}
                  onChange={(e) => setEditFormData({ ...editFormData, badgeUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Location */}
          <div className="border-t border-slate-200 pt-4">
            <h4 className="text-xs font-extrabold uppercase text-emerald-800 tracking-wider mb-3 flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Contact & Physical Address</span>
            </h4>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Address / Location</label>
                <input
                  type="text"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  placeholder="e.g. Plot 14/16 Naguru Road, Kampala"
                  className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={editFormData.contactPhone}
                    onChange={(e) => setEditFormData({ ...editFormData, contactPhone: e.target.value })}
                    placeholder="+256 700 000000"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={editFormData.contactEmail}
                    onChange={(e) => setEditFormData({ ...editFormData, contactEmail: e.target.value })}
                    placeholder="info@school.ac.ug"
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Leadership & Signatures */}
          <div className="border-t border-slate-200 pt-4">
            <h4 className="text-xs font-extrabold uppercase text-emerald-800 tracking-wider mb-3 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>School Leadership & Report Signatures</span>
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Headteacher Name</label>
                <input
                  type="text"
                  value={editFormData.headTeacher}
                  onChange={(e) => setEditFormData({ ...editFormData, headTeacher: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Headteacher Signature Text</label>
                <input
                  type="text"
                  value={editFormData.headTeacherSignature}
                  onChange={(e) => setEditFormData({ ...editFormData, headTeacherSignature: e.target.value })}
                  placeholder="e.g. John Kato (Headteacher)"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Director of Studies (DOS)</label>
                <input
                  type="text"
                  value={editFormData.dosName}
                  onChange={(e) => setEditFormData({ ...editFormData, dosName: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">DOS Signature Text</label>
                <input
                  type="text"
                  value={editFormData.dosSignature}
                  onChange={(e) => setEditFormData({ ...editFormData, dosSignature: e.target.value })}
                  placeholder="e.g. Mark Mukasa (DOS)"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Term Weights & Grading Config */}
          <div className="border-t border-slate-200 pt-4">
            <h4 className="text-xs font-extrabold uppercase text-emerald-800 tracking-wider mb-3 flex items-center space-x-1.5">
              <Percent className="w-4 h-4 text-emerald-600" />
              <span>Assessment Weights & Report Format</span>
            </h4>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">BOT Weight (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editFormData.botWeight}
                  onChange={(e) => setEditFormData({ ...editFormData, botWeight: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-bold text-center"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">MOT Weight (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editFormData.motWeight}
                  onChange={(e) => setEditFormData({ ...editFormData, motWeight: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-bold text-center"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">EOT Weight (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={editFormData.eotWeight}
                  onChange={(e) => setEditFormData({ ...editFormData, eotWeight: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-bold text-center"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <label className="flex items-center space-x-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={editFormData.showPositionRanking}
                  onChange={(e) => setEditFormData({ ...editFormData, showPositionRanking: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-800">Show Position Ranking</span>
              </label>

              <label className="flex items-center space-x-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100">
                <input
                  type="checkbox"
                  checked={editFormData.useNewCurriculum}
                  onChange={(e) => setEditFormData({ ...editFormData, useNewCurriculum: e.target.checked })}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-slate-800">New NCDC Competency Format</span>
              </label>
            </div>
          </div>

          {/* Section 5: Access Control, Blocking & Subscription */}
          <div className="border-t border-slate-200 pt-4 bg-slate-50/70 -mx-6 -mb-6 p-6 rounded-b-3xl">
            <h4 className="text-xs font-extrabold uppercase text-slate-900 tracking-wider mb-3 flex items-center space-x-1.5">
              <Lock className="w-4 h-4 text-slate-700" />
              <span>Platform Access Permission & Account Admin</span>
            </h4>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Access Status</label>
                  <select
                    value={editFormData.active ? 'ACTIVE' : 'BLOCKED'}
                    onChange={(e) => setEditFormData({ ...editFormData, active: e.target.value === 'ACTIVE' })}
                    className={`w-full border rounded-xl px-3 py-2 text-sm font-bold focus:outline-none ${
                      editFormData.active ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-rose-50 text-rose-800 border-rose-300'
                    }`}
                  >
                    <option value="ACTIVE">ACTIVE (Access Allowed)</option>
                    <option value="BLOCKED">BLOCKED (Access Denied)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Billing Subscription</label>
                  <select
                    value={editFormData.subscriptionStatus}
                    onChange={(e) => setEditFormData({ ...editFormData, subscriptionStatus: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="TRIAL">TRIAL</option>
                    <option value="PAST_DUE">PAST DUE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
              </div>

              {/* Edit Associated Admin Credentials */}
              <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2 mt-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">Linked School Admin Account</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500">Admin Name</label>
                    <input
                      type="text"
                      value={editFormData.adminName}
                      onChange={(e) => setEditFormData({ ...editFormData, adminName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500">Admin Email</label>
                    <input
                      type="email"
                      value={editFormData.adminEmail}
                      onChange={(e) => setEditFormData({ ...editFormData, adminEmail: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500">Reset Password (leave empty to keep current)</label>
                  <input
                    type="password"
                    placeholder="New password..."
                    value={editFormData.adminPassword}
                    onChange={(e) => setEditFormData({ ...editFormData, adminPassword: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="pt-5 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all text-sm"
              >
                Save School Changes
              </button>
            </div>

          </div>

        </form>
      </Modal>

    </div>
  );
}
