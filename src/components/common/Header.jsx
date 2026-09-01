import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  User,
  LogOut,
  ArrowRightLeft,
  Menu,
  X,
  BarChart3,
  Wifi,
  WifiOff,
  RefreshCw,
  School,
  Users,
  UserCheck,
  GraduationCap,
  BookOpen,
  Layers,
  DollarSign,
  Send,
  Settings,
  Printer,
  Calendar,
  Target,
  MessageSquareQuote,
  HelpCircle,
  FileSpreadsheet,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export default function Header({ onOpenLoginModal }) {
  const {
    currentUser,
    currentSchool,
    schools,
    switchTenant,
    logout,
    activeTenantId,
    activeTab,
    setActiveTab,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    students = [],
    subjects = [],
    users = [],
    classes = [],
    isOnline,
    isOfflineMode,
    isSyncing,
    lastSyncedAt,
    triggerCloudSync
  } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState(null);

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const isSchoolAdmin = currentUser?.role === 'SCHOOL_ADMIN';
  const isTeacher = currentUser?.role === 'TEACHER';
  const isParent = currentUser?.role === 'PARENT';

  // Current tenant metrics
  const schoolStudentsCount = students.filter(s => s.schoolId === currentSchool?.id).length;
  const schoolTeachersCount = users.filter(u => u.schoolId === currentSchool?.id && u.role === 'TEACHER').length;
  const schoolSubjectsCount = subjects.filter(s => s.schoolId === currentSchool?.id).length;
  const schoolClassesCount = classes.filter(c => c.schoolId === currentSchool?.id).length;

  // Close mobile drawer on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleManualSync = async () => {
    if (isSyncing) return;
    const res = await triggerCloudSync();
    if (res?.success) {
      setSyncFeedback('Synced!');
      setTimeout(() => setSyncFeedback(null), 2500);
    } else {
      setSyncFeedback('Offline');
      setTimeout(() => setSyncFeedback(null), 2500);
    }
  };

  const handleSelectTab = (tabId) => {
    if (setActiveTab) {
      setActiveTab(tabId);
    }
    setMobileMenuOpen(false);
    
    // Smooth scroll down to main content area
    setTimeout(() => {
      const mainEl = document.querySelector('main');
      if (mainEl) {
        mainEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const handleOpenMobileSidebar = () => {
    if (setIsMobileSidebarOpen) {
      setIsMobileSidebarOpen(true);
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="navbar-custom bg-white/95 backdrop-blur-md text-slate-900 border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Top-Left: Mobile Sidebar Trigger + Logo & School Branding */}
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
              
              {/* TOP-LEFT CORNER SIDEBAR TRIGGER BUTTON (Mobile Only) */}
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                aria-label="Open navigation sidebar"
                className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-emerald-50 border border-slate-200 text-slate-800 active:scale-95 transition-all flex items-center justify-center shrink-0 shadow-2xs"
                title="Open Sidebar Navigation"
              >
                <Menu className="w-5 h-5 text-slate-800" />
              </button>

              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-slate-100 p-0.5 shadow-md flex items-center justify-center shrink-0 border border-slate-200">
                <div className="h-full w-full bg-white rounded-[9px] sm:rounded-[10px] p-0.5 sm:p-1 flex items-center justify-center overflow-hidden">
                  {isSuperAdmin ? (
                    <img
                      src="/logo.jpg"
                      alt="Mpumuza Logo"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <img
                      src={currentSchool?.badgeUrl || '/logo.jpg'}
                      alt="Badge"
                      className="h-full w-full object-cover rounded-[7px]"
                      onError={(e) => { e.target.src = '/logo.jpg'; }}
                    />
                  )}
                </div>
              </div>
              
              <div className="min-w-0">
                <div className="flex items-center space-x-1.5 sm:space-x-2 flex-wrap">
                  <span className="font-extrabold text-sm sm:text-lg lg:text-xl tracking-tight text-slate-900 font-outfit truncate max-w-[130px] sm:max-w-[240px] md:max-w-none">
                    Mpumuza Analytics
                  </span>
                  {!isSuperAdmin && currentSchool && (
                    <span className="hidden sm:inline text-xs text-slate-400 font-normal truncate max-w-[160px]">
                      &bull; {currentSchool?.name}
                    </span>
                  )}
                  <span className={`text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full font-bold truncate ${
                    currentSchool?.levelType === 'PRIMARY' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                    'bg-blue-100 text-blue-800 border border-blue-300'
                  }`}>
                    {currentSchool?.levelType === 'PRIMARY' ? 'PLE' : 'UCE / UACE'}
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 font-medium italic truncate max-w-[180px] sm:max-w-xs md:max-w-md hidden sm:block">
                  "{currentSchool?.motto || 'Education Performance & Analytics Platform'}"
                </p>
              </div>
            </div>

            {/* Desktop Right Navigation */}
            <div className="hidden md:flex items-center space-x-3">
              
              {/* Live Offline / Online Sync Status Pill */}
              <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1.5 space-x-2 text-[11px] shadow-xs">
                {isOnline && !isOfflineMode ? (
                  <div className="flex items-center space-x-1.5 text-emerald-700 font-bold">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Cloud Synced</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5 text-slate-700 font-bold">
                    <WifiOff className="w-3.5 h-3.5 text-slate-500" />
                    <span>Offline (Local)</span>
                  </div>
                )}

                <span className="text-slate-300 text-xs">|</span>
                <span className="text-slate-400 font-mono text-[10px]" title="Last sync timestamp">{lastSyncedAt}</span>

                <button
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  title="Sync local data with cloud"
                  className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-slate-200/60 rounded-lg transition-colors flex items-center space-x-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
                  {syncFeedback && <span className="text-[10px] font-bold text-emerald-700">{syncFeedback}</span>}
                </button>
              </div>
              
              {/* Tenant Switcher — Super Admin ONLY */}
              {isSuperAdmin && (
                <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 space-x-2 text-xs">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-slate-600 font-medium">Tenant:</span>
                  <select
                    value={activeTenantId}
                    onChange={(e) => switchTenant(e.target.value)}
                    className="bg-white text-slate-900 font-semibold text-xs focus:outline-none cursor-pointer rounded px-2 py-1 border border-slate-300"
                  >
                    {schools.map(sch => (
                      <option key={sch.id} value={sch.id} className="bg-white text-slate-900">
                        {sch.name} ({sch.levelType})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Current User Profile Badge */}
              {currentUser ? (
                <div className="flex items-center space-x-3 bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-xl">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-bold text-slate-900 flex items-center space-x-1">
                      <span className="truncate max-w-[120px]">{currentUser.name}</span>
                      {isSuperAdmin && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                    </div>
                    <div className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">
                      {currentUser.role.replace('_', ' ')}
                    </div>
                  </div>
                  
                  <button
                    onClick={logout}
                    title="Sign out"
                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-slate-200/60 ml-1"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenLoginModal}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all flex items-center space-x-2"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              )}

            </div>

            {/* Mobile Right Controls: Compact Sync Pill */}
            <div className="flex md:hidden items-center space-x-2">
              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                aria-label="Sync status"
                className="p-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 active:scale-95 flex items-center space-x-1 text-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-600' : isOnline ? 'text-emerald-600' : 'text-slate-500'}`} />
                {syncFeedback ? (
                  <span className="text-[10px] font-bold text-emerald-700">{syncFeedback}</span>
                ) : (
                  <span className="text-[10px] font-bold text-slate-600">{isOnline ? 'Online' : 'Offline'}</span>
                )}
              </button>

              {currentUser && (
                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl active:scale-95"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* OFF-CANVAS VERTICAL SIDEBAR DRAWER (Activated from TOP-LEFT CORNER)        */}
      {/* ========================================================================= */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-in fade-in duration-200">
          
          {/* Backdrop Overlay */}
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
          />

          {/* Vertical Drawer Container (Slides from Left) */}
          <div className="relative w-[320px] max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto animate-in slide-in-from-left duration-300 p-4 space-y-4 text-left">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="h-9 w-9 rounded-xl bg-emerald-600 p-0.5 flex items-center justify-center text-white shrink-0 shadow-sm">
                  <School className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-black text-slate-900 font-outfit uppercase tracking-wider truncate">
                    {currentSchool?.name || 'Mpumuza Analytics'}
                  </h3>
                  <span className="text-[10px] text-emerald-700 font-bold block truncate">
                    {currentSchool?.levelType === 'PRIMARY' ? 'PLE Primary' : 'UCE & UACE'} Navigation
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                aria-label="Close sidebar"
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 active:scale-95 transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* School details banner */}
            {currentSchool && (
              <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-2xl flex items-center justify-between">
                <div className="min-w-0">
                  <span className="text-[9px] text-emerald-800 font-extrabold uppercase tracking-wider block">Active School Tenant</span>
                  <span className="text-xs font-bold text-slate-900 truncate block">{currentSchool.name}</span>
                </div>
                <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shrink-0 ml-2">
                  {currentSchool.levelType}
                </span>
              </div>
            )}

            {/* Tenant switcher — Super Admin ONLY */}
            {isSuperAdmin && (
              <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-2xl space-y-1.5">
                <span className="text-[11px] text-emerald-900 font-bold flex items-center space-x-1">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Switch School Tenant:</span>
                </span>
                <select
                  value={activeTenantId}
                  onChange={(e) => {
                    switchTenant(e.target.value);
                    setIsMobileSidebarOpen(false);
                  }}
                  className="w-full bg-white text-slate-900 font-semibold text-xs rounded-xl p-2.5 border border-slate-300 shadow-2xs"
                >
                  {schools.map(sch => (
                    <option key={sch.id} value={sch.id}>
                      {sch.name} ({sch.levelType})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* --- VERTICAL NAVIGATION LIST --- */}
            <nav className="space-y-3 flex-1">
              
              {/* School Admin / Super Admin Views */}
              {(isSchoolAdmin || isSuperAdmin) && (
                <>
                  {/* Academic Management Group */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-emerald-900 tracking-wider px-2 py-1 block font-outfit">
                      Academic Management
                    </span>
                    
                    {[
                      { id: 'students', label: 'Students Roster', icon: GraduationCap, count: schoolStudentsCount, color: 'text-emerald-700' },
                      { id: 'reports', label: 'Reports & Batch PDF', icon: Printer, color: 'text-purple-600', badge: 'UNEB' },
                      { id: 'teachers', label: 'Teachers Staff', icon: Users, count: schoolTeachersCount, color: 'text-blue-600' },
                      { id: 'subjects', label: 'Subjects Setup', icon: BookOpen, count: schoolSubjectsCount, color: 'text-indigo-600' },
                      { id: 'classes', label: 'Classes & Streams', icon: Layers, count: schoolClassesCount, color: 'text-emerald-600' },
                    ].map(tab => {
                      const Icon = tab.icon;
                      const isActive = (activeTab || 'students') === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            if (setActiveTab) setActiveTab(tab.id);
                            setIsMobileSidebarOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            isActive
                              ? 'bg-emerald-600 text-white shadow-sm font-extrabold'
                              : 'text-slate-700 hover:bg-slate-100 active:bg-emerald-50'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.color}`} />
                            <span>{tab.label}</span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            {tab.badge && (
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                                isActive ? 'bg-white/25 text-white' : 'bg-purple-100 text-purple-700 border border-purple-200'
                              }`}>
                                {tab.badge}
                              </span>
                            )}
                            {tab.count !== undefined && (
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                                isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}>
                                {tab.count}
                              </span>
                            )}
                            <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-300'}`} />
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Finance & Operations Group */}
                  <div className="space-y-1 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-black uppercase text-emerald-900 tracking-wider px-2 py-1 block font-outfit">
                      Finance &amp; Operations
                    </span>

                    {[
                      { id: 'fees', label: 'Fees Clearance & Locks', icon: DollarSign, color: 'text-emerald-600', badge: 'UGX' },
                      { id: 'sms', label: 'SMS Results Broadcast', icon: Send, color: 'text-sky-600', badge: 'SMS' },
                      { id: 'attendance', label: 'Term Attendance', icon: Calendar, color: 'text-blue-600' },
                      { id: 'settings', label: 'School Settings & Weights', icon: Settings, color: 'text-slate-600' },
                      { id: 'audit', label: 'Security & Audit Logs', icon: ShieldCheck, color: 'text-rose-600' },
                    ].map(tab => {
                      const Icon = tab.icon;
                      const isActive = (activeTab || 'students') === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            if (setActiveTab) setActiveTab(tab.id);
                            setIsMobileSidebarOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                            isActive
                              ? 'bg-emerald-600 text-white shadow-sm font-extrabold'
                              : 'text-slate-700 hover:bg-slate-100 active:bg-emerald-50'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.color}`} />
                            <span>{tab.label}</span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            {tab.badge && (
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                                isActive ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                              }`}>
                                {tab.badge}
                              </span>
                            )}
                            <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-300'}`} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              {/* Teacher Navigation Group */}
              {isTeacher && (
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-sky-900 tracking-wider px-2 py-1 block font-outfit">
                    Teacher Academic Portal
                  </span>
                  {[
                    { id: 'marks', label: 'Marks Entry Grid (BOT/MOT/EOT)', icon: FileSpreadsheet, color: 'text-emerald-600' },
                    { id: 'ncdc', label: 'Continuous Assessment (AoI)', icon: Target, color: 'text-purple-600' },
                    { id: 'remarks', label: 'Class Teacher Remarks', icon: MessageSquareQuote, color: 'text-amber-600' },
                    { id: 'analytics', label: 'Performance Analytics', icon: BarChart3, color: 'text-blue-600' },
                    { id: 'roster', label: 'Students Roster', icon: Users, color: 'text-indigo-600' },
                    { id: 'grading', label: 'UNEB Grading Reference', icon: HelpCircle, color: 'text-slate-600' },
                  ].map(tab => {
                    const Icon = tab.icon;
                    const isActive = (activeTab || 'marks') === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          if (setActiveTab) setActiveTab(tab.id);
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-emerald-600 text-white shadow-sm font-extrabold'
                            : 'text-slate-700 hover:bg-slate-100 active:bg-emerald-50'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : tab.color}`} />
                          <span>{tab.label}</span>
                        </div>
                        <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-300'}`} />
                      </button>
                    );
                  })}
                </div>
              )}

            </nav>

            {/* User Profile & Sign Out Footer */}
            {currentUser && (
              <div className="border-t border-slate-200 pt-3 mt-auto">
                <div className="flex items-center justify-between bg-slate-50 border border-slate-200 p-2.5 rounded-2xl">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-xs">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</div>
                      <div className="text-[10px] text-emerald-700 uppercase font-black">{currentUser.role.replace('_', ' ')}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileSidebarOpen(false);
                    }}
                    className="px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold flex items-center space-x-1 active:scale-95 shrink-0 ml-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
}

