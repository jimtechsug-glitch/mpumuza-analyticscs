import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, User, LogOut, ArrowRightLeft, Menu, X, BarChart3, Wifi, WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function Header({ onOpenLoginModal }) {
  const {
    currentUser,
    currentSchool,
    schools,
    switchTenant,
    logout,
    activeTenantId,
    isOnline,
    isOfflineMode,
    isSyncing,
    lastSyncedAt,
    triggerCloudSync
  } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState(null);

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  const handleManualSync = async () => {
    if (isSyncing) return;
    const res = await triggerCloudSync();
    if (res.success) {
      setSyncFeedback('Synced!');
      setTimeout(() => setSyncFeedback(null), 2500);
    } else {
      setSyncFeedback('Offline');
      setTimeout(() => setSyncFeedback(null), 2500);
    }
  };

  return (
    <header className="navbar-custom bg-white/95 backdrop-blur-md text-slate-900 border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & School Branding */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 p-0.5 shadow-md flex items-center justify-center shrink-0">
              <div className="h-full w-full bg-white rounded-[10px] p-1 flex items-center justify-center">
                {isSuperAdmin ? (
                  <BarChart3 className="w-6 h-6 text-amber-600" />
                ) : (
                  <img
                    src={currentSchool?.badgeUrl || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=200&q=80'}
                    alt="Badge"
                    className="h-full w-full object-cover rounded-[8px]"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=200&q=80'; }}
                  />
                )}
              </div>
            </div>
            
            <div>
              <div className="flex items-center space-x-2 flex-wrap">
                <span className="font-extrabold text-base sm:text-xl tracking-tight text-slate-900 font-outfit flex items-center space-x-1.5">
                  <span>Mpumuza Analytics</span>
                  {!isSuperAdmin && (
                    <span className="text-xs text-slate-400 font-normal">&bull; {currentSchool?.name}</span>
                  )}
                </span>
                <span className={`text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full font-bold ${
                  currentSchool?.levelType === 'PRIMARY' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                  'bg-blue-100 text-blue-800 border border-blue-300'
                }`}>
                  {currentSchool?.levelType === 'PRIMARY' ? 'Primary School (PLE)' : 'Secondary School (O & A Level)'}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium italic truncate max-w-xs sm:max-w-md">
                "{currentSchool?.motto || 'Education Performance & Analytics Platform'}"
              </p>
            </div>
          </div>

          {/* Desktop Right Navigation */}
          <div className="hidden md:flex items-center space-x-3">
            
            {/* Live Offline / Online Sync Status Pill */}
            <div className="flex items-center bg-slate-50 border border-slate-200/80 rounded-xl px-2.5 py-1.5 space-x-2 text-[11px] shadow-sm">
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
                <div className="flex items-center space-x-1.5 text-amber-700 font-bold">
                  <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                  <span>Offline (Local)</span>
                </div>
              )}

              <span className="text-slate-300 text-xs">|</span>
              <span className="text-slate-400 font-mono text-[10px]" title="Last sync timestamp">{lastSyncedAt}</span>

              <button
                onClick={handleManualSync}
                disabled={isSyncing}
                title="Sync local data with cloud"
                className="p-1 text-slate-500 hover:text-amber-600 hover:bg-slate-200/60 rounded-lg transition-colors flex items-center space-x-1"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-600' : ''}`} />
                {syncFeedback && <span className="text-[10px] font-bold text-amber-700">{syncFeedback}</span>}
              </button>
            </div>
            
            {/* Tenant Switcher — Super Admin ONLY */}
            {isSuperAdmin && (
              <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 space-x-2 text-xs">
                <ArrowRightLeft className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="text-slate-600 font-medium">School Tenant:</span>
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
                <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-900 flex items-center space-x-1">
                    <span className="truncate max-w-[130px]">{currentUser.name}</span>
                    {isSuperAdmin && <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />}
                  </div>
                  <div className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">
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
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all flex items-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}

          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex md:hidden items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-700 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 space-y-3 bg-white">

            {/* Tenant switcher — Super Admin ONLY on mobile */}
            {isSuperAdmin && (
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-2">
                <span className="text-xs text-amber-800 font-bold block uppercase tracking-wider">Switch School Tenant:</span>
                <select
                  value={activeTenantId}
                  onChange={(e) => {
                    switchTenant(e.target.value);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-white text-slate-900 font-semibold text-xs rounded-lg p-2 border border-slate-300"
                >
                  {schools.map(sch => (
                    <option key={sch.id} value={sch.id}>
                      {sch.name} ({sch.levelType})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* School name for non-super-admin users */}
            {!isSuperAdmin && currentSchool && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl">
                <span className="text-[10px] text-amber-800 font-bold block uppercase tracking-wider mb-0.5">Your School</span>
                <span className="text-sm font-bold text-slate-900">{currentSchool.name}</span>
                <span className="block text-[10px] text-slate-500 italic mt-0.5">"{currentSchool.motto}"</span>
              </div>
            )}

            {currentUser && (
              <div className="flex items-center justify-between bg-slate-100 p-3 rounded-xl">
                <div>
                  <div className="text-xs font-bold text-slate-900">{currentUser.name}</div>
                  <div className="text-[10px] text-amber-700 uppercase font-bold">{currentUser.role.replace('_', ' ')}</div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 bg-rose-100 text-rose-700 border border-rose-300 rounded-lg text-xs font-bold flex items-center space-x-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </header>
  );
}
