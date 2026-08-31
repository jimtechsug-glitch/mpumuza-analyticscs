import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/common/Header';
import SuperAdminDashboard from './components/superadmin/SuperAdminDashboard';
import SchoolAdminDashboard from './components/admin/SchoolAdminDashboard';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import ParentPortalView from './components/parent/ParentPortalView';
import LoginModal from './components/auth/LoginModal';
import LandingLoginPage from './components/auth/LandingLoginPage';
import { ShieldCheck, School, Users, UserCheck } from 'lucide-react';

function MainApp() {
  const { currentUser, loading, dbError } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [viewRoleOverride, setViewRoleOverride] = useState(null);

  // Loading state while Supabase data fetches
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 font-semibold text-sm">Connecting to Mpumuza Analytics…</p>
        </div>
      </div>
    );
  }

  // Database connection error
  if (dbError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white border border-rose-300 rounded-2xl p-8 shadow-xl max-w-md text-center space-y-4">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">!</div>
          <h2 className="text-lg font-bold text-slate-900">Database Connection Error</h2>
          <p className="text-sm text-slate-600">{dbError}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-amber-500 text-white rounded-xl font-bold text-sm hover:bg-amber-600 transition-all">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // If no user is logged in, show the dedicated Mpumuza Analytics Login Landing Page
  if (!currentUser) {
    return <LandingLoginPage />;
  }

  // Role is strictly locked to what the authenticated user account holds.
  // Only SUPER_ADMIN is allowed to switch between tenant views.
  const activeRole = currentUser.role;

  // Only Super Admins can see the role navigation bar (for tenant switching).
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-amber-500 selection:text-white">
      
      {/* Navbar Header */}
      <Header
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Role Indicator Bar — shown to all users */}
      <div className="bg-white border-b border-slate-200 px-3 sm:px-4 py-2 sm:py-2.5 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          
          <div className="flex items-center space-x-2 text-xs flex-wrap gap-y-1">
            <span className="text-slate-500 font-semibold text-[11px] sm:text-xs">Logged in:</span>
            <span className="font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center space-x-1 text-[11px] sm:text-xs">
              {activeRole === 'SUPER_ADMIN' && <ShieldCheck className="w-3.5 h-3.5 mr-1" />}
              {activeRole === 'SCHOOL_ADMIN' && <School className="w-3.5 h-3.5 mr-1" />}
              {activeRole === 'TEACHER' && <Users className="w-3.5 h-3.5 mr-1" />}
              {activeRole === 'PARENT' && <UserCheck className="w-3.5 h-3.5 mr-1" />}
              <span className="truncate max-w-[120px] sm:max-w-none">{currentUser.name || activeRole.replace('_', ' ')}</span>
              <span className="ml-1 text-[9px] sm:text-[10px] text-amber-600 font-bold bg-amber-100 px-1.5 py-0.2 rounded border border-amber-300">
                {activeRole.replace('_', ' ')}
              </span>
            </span>
          </div>

          {/* Quick Tenant Switcher — Super Admin ONLY */}
          {isSuperAdmin && (
            <div className="flex items-center space-x-1 bg-slate-100 p-0.5 sm:p-1 rounded-xl border border-slate-200 text-xs w-full sm:w-auto justify-between sm:justify-start">
              <button
                onClick={() => setViewRoleOverride('SUPER_ADMIN')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg font-bold transition-all flex items-center space-x-1 text-[11px] sm:text-xs ${
                  (viewRoleOverride || 'SUPER_ADMIN') === 'SUPER_ADMIN' ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => setViewRoleOverride('SCHOOL_ADMIN')}
                className={`px-2.5 sm:px-3 py-1 rounded-lg font-bold transition-all flex items-center space-x-1 text-[11px] sm:text-xs ${
                  viewRoleOverride === 'SCHOOL_ADMIN' ? 'bg-amber-500 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                }`}
              >
                <School className="w-3.5 h-3.5" />
                <span>Admin View</span>
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2.5 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Super Admin: can preview School Admin view via switcher */}
        {activeRole === 'SUPER_ADMIN' && (viewRoleOverride === 'SCHOOL_ADMIN' ? <SchoolAdminDashboard /> : <SuperAdminDashboard />)}

        {/* School Admin: only sees their own dashboard */}
        {activeRole === 'SCHOOL_ADMIN' && <SchoolAdminDashboard />}

        {/* Teacher: only sees their own portal */}
        {activeRole === 'TEACHER' && <TeacherDashboard />}

        {/* Parent: only sees their portal */}
        {activeRole === 'PARENT' && <ParentPortalView />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            &copy; 2026 Mpumuza Analytics &bull; Ugandan School Report Management System (UNEB Standard)
          </div>
          <div className="flex space-x-4 text-slate-600 font-medium">
            <span>PLE Primary</span>
            <span>&bull;</span>
            <span>UCE O-Level</span>
            <span>&bull;</span>
            <span>UACE A-Level</span>
          </div>
        </div>
      </footer>

      {/* Login / Switch Role Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
