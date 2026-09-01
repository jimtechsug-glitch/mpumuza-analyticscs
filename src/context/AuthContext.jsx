import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  INITIAL_SUPER_ADMIN,
  INITIAL_SCHOOLS,
  INITIAL_USERS,
  INITIAL_CLASSES,
  INITIAL_SUBJECTS,
  INITIAL_STUDENTS,
  INITIAL_MARKS,
  INITIAL_AUDIT_LOGS,
  INITIAL_SMS_LOGS
} from '../utils/initialData';
import * as db from '../lib/db';
import { seedDatabaseIfEmpty } from '../utils/seedDatabase';
import { sendSMSBroadcast } from '../utils/smsHandler';

const AuthContext = createContext();

// Session & Storage keys
const SESSION_KEY_USER   = 'mpumuza_current_user';
const SESSION_KEY_TENANT = 'mpumuza_current_tenant';

const STORAGE_KEYS = {
  SCHOOLS:    'mpumuza_storage_schools',
  USERS:      'mpumuza_storage_users',
  CLASSES:    'mpumuza_storage_classes',
  SUBJECTS:   'mpumuza_storage_subjects',
  STUDENTS:   'mpumuza_storage_students',
  MARKS:      'mpumuza_storage_marks',
  AUDIT_LOGS: 'mpumuza_storage_audit_logs',
  SMS_LOGS:   'mpumuza_storage_sms_logs',
};

const getStored = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export function AuthProvider({ children }) {
  // ─── App-wide loading & sync state ──────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  // ─── Real-time network detection ───────────────────────────────────────────
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setIsOfflineMode(false);
      // Auto-trigger sync on reconnect
      triggerCloudSync();
    };
    const handleOffline = () => {
      setIsOnline(false);
      setIsOfflineMode(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ─── Manual / Automatic Cloud Sync ─────────────────────────────────────────
  const triggerCloudSync = async () => {
    if (!navigator.onLine) {
      setIsOfflineMode(true);
      return { success: false, message: 'Device is offline. Changes are saved locally.' };
    }

    try {
      setIsSyncing(true);
      const [
        schoolsData, usersData, classesData, subjectsData,
        studentsData, marksData, auditLogsData, smsLogsData,
      ] = await Promise.all([
        db.getSchools(), db.getUsers(), db.getClasses(), db.getSubjects(),
        db.getStudents(), db.getMarks(), db.getAuditLogs(), db.getSmsLogs(),
      ]);

      if (schoolsData && schoolsData.length > 0) setSchools(schoolsData);
      if (usersData && usersData.length > 0) setUsers(usersData);
      if (classesData && classesData.length > 0) setClasses(classesData);
      if (subjectsData && subjectsData.length > 0) setSubjects(subjectsData);
      if (studentsData && studentsData.length > 0) setStudents(studentsData);
      if (marksData && marksData.length > 0) setMarks(marksData);
      if (auditLogsData && auditLogsData.length > 0) setAuditLogs(auditLogsData);
      if (smsLogsData && smsLogsData.length > 0) setSmsLogs(smsLogsData);

      setIsOfflineMode(false);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSyncedAt(timeStr);
      return { success: true, timestamp: timeStr };
    } catch (err) {
      console.warn('[AuthContext] Cloud sync failed, continuing offline:', err.message);
      setIsOfflineMode(true);
      return { success: false, error: err.message };
    } finally {
      setIsSyncing(false);
    }
  };

  // ─── Core data state (persisted to localStorage with INITIAL_* fallbacks) ──
  const [schools,   setSchools]   = useState(() => getStored(STORAGE_KEYS.SCHOOLS, INITIAL_SCHOOLS));
  const [users,     setUsers]     = useState(() => getStored(STORAGE_KEYS.USERS, INITIAL_USERS));
  const [classes,   setClasses]   = useState(() => getStored(STORAGE_KEYS.CLASSES, INITIAL_CLASSES));
  const [subjects,  setSubjects]  = useState(() => getStored(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS));
  const [students,  setStudents]  = useState(() => getStored(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS));
  const [marks,     setMarks]     = useState(() => getStored(STORAGE_KEYS.MARKS, INITIAL_MARKS));
  const [auditLogs, setAuditLogs] = useState(() => getStored(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS));
  const [smsLogs,   setSmsLogs]   = useState(() => getStored(STORAGE_KEYS.SMS_LOGS, INITIAL_SMS_LOGS));

  // ─── Continuous localStorage sync ──────────────────────────────────────────
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.SCHOOLS, JSON.stringify(schools)); } catch (_) {} }, [schools]);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users)); } catch (_) {} }, [users]);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes)); } catch (_) {} }, [classes]);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects)); } catch (_) {} }, [subjects]);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students)); } catch (_) {} }, [students]);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.MARKS, JSON.stringify(marks)); } catch (_) {} }, [marks]);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs)); } catch (_) {} }, [auditLogs]);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEYS.SMS_LOGS, JSON.stringify(smsLogs)); } catch (_) {} }, [smsLogs]);

  // ─── Session & Navigation state ──────────────────────────────────────────
  const [currentUser,         setCurrentUser]         = useState(null);
  const [activeTenantId,      setActiveTenantId]      = useState('school-secondary-02');
  const [activeTab,           setActiveTab]           = useState('students');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Auto-set initial activeTab based on user role upon login
  useEffect(() => {
    if (currentUser?.role === 'TEACHER') {
      setActiveTab('marks');
    } else if (currentUser?.role === 'SUPER_ADMIN') {
      setActiveTab('schools');
    } else if (currentUser?.role === 'SCHOOL_ADMIN') {
      setActiveTab('students');
    }
  }, [currentUser?.role]);

  // Use a ref so addAuditLog always sees the latest currentUser
  const currentUserRef = useRef(currentUser);
  useEffect(() => { currentUserRef.current = currentUser; }, [currentUser]);

  // ─── Initialise: seed DB if empty, load all data, restore session ──────────
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setDbError(null);

        // Seed on first run (wrapped in try/catch)
        try {
          await seedDatabaseIfEmpty();
          await db.upsertUser(INITIAL_SUPER_ADMIN);
        } catch (seedErr) {
          console.warn('[AuthContext] Seeding skipped/offline:', seedErr.message);
        }

        // Load all data from Supabase in parallel
        const [
          schoolsData, usersData, classesData, subjectsData,
          studentsData, marksData, auditLogsData, smsLogsData,
        ] = await Promise.all([
          db.getSchools(), db.getUsers(), db.getClasses(), db.getSubjects(),
          db.getStudents(), db.getMarks(), db.getAuditLogs(), db.getSmsLogs(),
        ]);

        if (schoolsData && schoolsData.length > 0) setSchools(schoolsData);
        if (usersData && usersData.length > 0) setUsers(usersData);
        if (classesData && classesData.length > 0) setClasses(classesData);
        if (subjectsData && subjectsData.length > 0) setSubjects(subjectsData);
        if (studentsData && studentsData.length > 0) setStudents(studentsData);
        if (marksData && marksData.length > 0) setMarks(marksData);
        if (auditLogsData && auditLogsData.length > 0) setAuditLogs(auditLogsData);
        if (smsLogsData && smsLogsData.length > 0) setSmsLogs(smsLogsData);

        setIsOfflineMode(false);
        setLastSyncedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

      } catch (err) {
        console.warn('[AuthContext] Supabase sync unavailable; continuing with persistent local storage:', err.message);
        // Do NOT reset to initial seed data; keep the user's stored subjects and modifications!
        setIsOfflineMode(true);
        setDbError(null);
      } finally {
        // Restore session
        try {
          const savedUser   = sessionStorage.getItem(SESSION_KEY_USER);
          const savedTenant = sessionStorage.getItem(SESSION_KEY_TENANT);
          if (savedUser)   setCurrentUser(JSON.parse(savedUser));
          if (savedTenant) setActiveTenantId(savedTenant);
        } catch (_) {}

        setLoading(false);
      }
    };

    init();
  }, []);

  // ─── Persist session to sessionStorage ────────────────────────────────────
  useEffect(() => {
    if (currentUser) {
      sessionStorage.setItem(SESSION_KEY_USER, JSON.stringify(currentUser));
    } else {
      sessionStorage.removeItem(SESSION_KEY_USER);
    }
  }, [currentUser]);

  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY_TENANT, activeTenantId);
  }, [activeTenantId]);

  // ─── Derived: active school ────────────────────────────────────────────────
  const currentSchool = currentUser?.role === 'SUPER_ADMIN'
    ? (schools.find(s => s.id === activeTenantId) || schools[0])
    : (schools.find(s => s.id === currentUser?.schoolId) || schools[0]);

  // ─── Audit Logger ─────────────────────────────────────────────────────────
  const addAuditLog = (action, category, details) => {
    const user = currentUserRef.current;
    const newLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString(),
      userId:   user?.id   || 'system',
      userName: user?.name || 'System Auto',
      userRole: user?.role || 'SYSTEM',
      category,
      action,
      details,
    };
    // Optimistic update
    setAuditLogs(prev => [newLog, ...prev]);
    // Persist to Supabase (fire-and-forget — non-blocking)
    db.insertAuditLog(newLog).catch(err =>
      console.error('[DB] Audit log failed:', err.message)
    );
  };

  // ─── Auth ─────────────────────────────────────────────────────────────────
  const login = (email, password) => {
    // Search local state (already loaded from Supabase on mount)
    const found = users.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (found) {
      // Check if user is blocked individually
      if (found.blocked) {
        addAuditLog('BLOCKED_USER_LOGIN_ATTEMPT', 'AUTHENTICATION',
          `Blocked login attempt for account ${found.email} (${found.role}) - Account status is blocked.`);
        return {
          success: false,
          message: 'Account Suspended: Your access has been blocked by the school administrator.'
        };
      }

      // Check if school is blocked or suspended (Super Admin is always allowed)
      if (found.role !== 'SUPER_ADMIN' && found.schoolId) {
        const userSchool = schools.find(s => s.id === found.schoolId);
        if (userSchool && (userSchool.active === false || userSchool.subscriptionStatus === 'SUSPENDED')) {
          addAuditLog('BLOCKED_LOGIN_ATTEMPT', 'AUTHENTICATION',
            `Blocked login for ${found.email} (${found.role}) - School "${userSchool.name}" is currently blocked/suspended.`);
          return {
            success: false,
            message: `Access Restricted: "${userSchool.name}" is currently blocked by the Super Administrator. Please contact platform administration.`
          };
        }
      }

      setCurrentUser(found);
      if (found.schoolId) setActiveTenantId(found.schoolId);
      addAuditLog('USER_LOGIN', 'AUTHENTICATION', `Logged in successfully as ${found.role}`);
      return { success: true, user: found };
    }
    return { success: false, message: 'Invalid credentials. Please check email and password.' };
  };

  const parentLogin = (lin, pin) => {
    if (!lin || !pin) {
      return { success: false, message: 'Please provide both the Learner LIN and Parent Access PIN.' };
    }
    const cleanLin = String(lin).trim().toLowerCase();
    const cleanPin = String(pin).trim();

    const foundStudent = students.find(
      s => s.lin && String(s.lin).trim().toLowerCase() === cleanLin && String(s.parentPin || '1234').trim() === cleanPin
    );
    if (foundStudent) {
      if (foundStudent.blocked) {
        addAuditLog('BLOCKED_PARENT_LOGIN_ATTEMPT', 'PARENT_PORTAL',
          `Blocked parent login attempt for student ${foundStudent.name} (${foundStudent.lin}) - Student record is blocked.`);
        return {
          success: false,
          message: 'Access Restricted: This student portal account has been temporarily blocked by school administration.'
        };
      }

      const studentSchool = schools.find(s => s.id === foundStudent.schoolId);
      if (studentSchool && (studentSchool.active === false || studentSchool.subscriptionStatus === 'SUSPENDED')) {
        return {
          success: false,
          message: `Access Restricted: "${studentSchool.name}" portal is currently blocked by the Super Administrator.`
        };
      }

      const parentUser = {
        id: `parent-${foundStudent.id}`,
        schoolId: foundStudent.schoolId,
        email: `parent.${foundStudent.lin}@mpumuza.ac.ug`,
        name: `Parent of ${foundStudent.name}`,
        role: 'PARENT',
        studentId: foundStudent.id,
      };
      setCurrentUser(parentUser);
      setActiveTenantId(foundStudent.schoolId);
      addAuditLog('PARENT_LOGIN', 'PARENT_PORTAL',
        `Parent logged in for student ${foundStudent.name} (${foundStudent.lin})`);
      return { success: true, student: foundStudent };
    }
    return { success: false, message: 'Invalid Student LIN or Parent PIN. Please confirm credentials assigned by school admin.' };
  };

  const logout = () => {
    if (currentUser) {
      addAuditLog('USER_LOGOUT', 'AUTHENTICATION',
        `Logged out (${currentUser.email || currentUser.name})`);
    }
    setCurrentUser(null);
  };

  const switchTenant = (tenantId) => setActiveTenantId(tenantId);

  // ─── Super Admin Actions ───────────────────────────────────────────────────
  const addSchoolPlatform = async (newSchoolData, adminCredentials) => {
    const newSchoolId = `school-${Date.now()}`;

    const newSchool = {
      id: newSchoolId,
      name: newSchoolData.name,
      slug: newSchoolData.slug || newSchoolData.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      levelType: newSchoolData.levelType,
      motto: newSchoolData.motto || 'Strive for Excellence',
      address: newSchoolData.address || 'Uganda',
      contactPhone: newSchoolData.contactPhone || '+256',
      contactEmail: newSchoolData.contactEmail || adminCredentials.email,
      headTeacher: newSchoolData.headTeacher || 'Headteacher',
      headTeacherSignature: `${newSchoolData.headTeacher || 'Headteacher'} (Headteacher)`,
      dosName: 'Director of Studies',
      dosSignature: 'Director of Studies (DOS)',
      themeColor: 'navy',
      badgeUrl: newSchoolData.badgeUrl ||
        'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=200&q=80',
      botWeight: 20,
      motWeight: 20,
      eotWeight: 60,
      useNewCurriculum: newSchoolData.levelType === 'SECONDARY',
      showPositionRanking: true,
      subscriptionStatus: 'ACTIVE',
      billingPlan: 'PER_STUDENT_TERM',
      studentRateUGX: 1500,
      active: true,
    };

    const newAdminUser = {
      id: `user-admin-${Date.now()}`,
      schoolId: newSchoolId,
      email: adminCredentials.email,
      password: adminCredentials.password || 'admin123',
      name: adminCredentials.name || `${newSchoolData.name} Admin`,
      role: 'SCHOOL_ADMIN',
    };

    // Auto-generate standard classes & subjects based on school level
    let autoClasses = [];
    let autoSubjects = [];

    if (newSchool.levelType === 'PRIMARY') {
      autoClasses = [
        { id: `cls-${newSchoolId}-p1`, schoolId: newSchoolId, name: 'P.1', level: 'Primary', streams: ['Blue', 'Red'] },
        { id: `cls-${newSchoolId}-p2`, schoolId: newSchoolId, name: 'P.2', level: 'Primary', streams: ['Blue', 'Red'] },
        { id: `cls-${newSchoolId}-p3`, schoolId: newSchoolId, name: 'P.3', level: 'Primary', streams: ['Blue', 'Red'] },
        { id: `cls-${newSchoolId}-p4`, schoolId: newSchoolId, name: 'P.4', level: 'Primary', streams: ['Blue', 'Red'] },
        { id: `cls-${newSchoolId}-p5`, schoolId: newSchoolId, name: 'P.5', level: 'Primary', streams: ['Blue', 'Red'] },
        { id: `cls-${newSchoolId}-p6`, schoolId: newSchoolId, name: 'P.6', level: 'Primary', streams: ['Blue', 'Red'] },
        { id: `cls-${newSchoolId}-p7`, schoolId: newSchoolId, name: 'P.7', level: 'Primary', streams: ['Blue', 'Red'] },
      ];
      autoSubjects = [
        { id: `sub-${newSchoolId}-eng`, schoolId: newSchoolId, code: 'ENG', name: 'English Language', core: true, isSubsidiary: false, category: 'Primary' },
        { id: `sub-${newSchoolId}-mtc`, schoolId: newSchoolId, code: 'MTC', name: 'Mathematics',      core: true, isSubsidiary: false, category: 'Primary' },
        { id: `sub-${newSchoolId}-sci`, schoolId: newSchoolId, code: 'SCI', name: 'Integrated Science', core: true, isSubsidiary: false, category: 'Primary' },
        { id: `sub-${newSchoolId}-sst`, schoolId: newSchoolId, code: 'SST', name: 'Social Studies & R.E', core: true, isSubsidiary: false, category: 'Primary' },
      ];
    } else {
      autoClasses = [
        { id: `cls-${newSchoolId}-s1`, schoolId: newSchoolId, name: 'S.1', level: 'O-Level', streams: ['North', 'South'] },
        { id: `cls-${newSchoolId}-s2`, schoolId: newSchoolId, name: 'S.2', level: 'O-Level', streams: ['North', 'South'] },
        { id: `cls-${newSchoolId}-s3`, schoolId: newSchoolId, name: 'S.3', level: 'O-Level', streams: ['North', 'South'] },
        { id: `cls-${newSchoolId}-s4`, schoolId: newSchoolId, name: 'S.4', level: 'O-Level', streams: ['North', 'South'] },
        { id: `cls-${newSchoolId}-s5`, schoolId: newSchoolId, name: 'S.5', level: 'A-Level', streams: ['Sciences', 'Arts'] },
        { id: `cls-${newSchoolId}-s6`, schoolId: newSchoolId, name: 'S.6', level: 'A-Level', streams: ['Sciences', 'Arts'] },
      ];
      autoSubjects = [
        { id: `sub-${newSchoolId}-112`,  schoolId: newSchoolId, code: '112',  name: 'English Language',             core: true,  isSubsidiary: false, category: 'O-Level' },
        { id: `sub-${newSchoolId}-456`,  schoolId: newSchoolId, code: '456',  name: 'Mathematics',                  core: true,  isSubsidiary: false, category: 'O-Level' },
        { id: `sub-${newSchoolId}-535`,  schoolId: newSchoolId, code: '535',  name: 'Physics',                      core: true,  isSubsidiary: false, category: 'O-Level' },
        { id: `sub-${newSchoolId}-545`,  schoolId: newSchoolId, code: '545',  name: 'Chemistry',                    core: true,  isSubsidiary: false, category: 'O-Level' },
        { id: `sub-${newSchoolId}-553`,  schoolId: newSchoolId, code: '553',  name: 'Biology',                      core: true,  isSubsidiary: false, category: 'O-Level' },
        { id: `sub-${newSchoolId}-241`,  schoolId: newSchoolId, code: '241',  name: 'History & Political Education', core: true,  isSubsidiary: false, category: 'O-Level' },
        { id: `sub-${newSchoolId}-273`,  schoolId: newSchoolId, code: '273',  name: 'Geography',                    core: true,  isSubsidiary: false, category: 'O-Level' },
        { id: `sub-${newSchoolId}-845`,  schoolId: newSchoolId, code: '845',  name: 'Entrepreneurship',             core: false, isSubsidiary: false, category: 'O-Level' },
        { id: `sub-${newSchoolId}-p510`, schoolId: newSchoolId, code: 'P510', name: 'Physics (Principal A-Level)',   core: true,  isSubsidiary: false, category: 'A-Level' },
        { id: `sub-${newSchoolId}-p525`, schoolId: newSchoolId, code: 'P525', name: 'Chemistry (Principal A-Level)', core: true,  isSubsidiary: false, category: 'A-Level' },
        { id: `sub-${newSchoolId}-p425`, schoolId: newSchoolId, code: 'P425', name: 'Mathematics (Principal A-Level)', core: true, isSubsidiary: false, category: 'A-Level' },
        { id: `sub-${newSchoolId}-p530`, schoolId: newSchoolId, code: 'P530', name: 'Biology (Principal A-Level)',   core: true,  isSubsidiary: false, category: 'A-Level' },
        { id: `sub-${newSchoolId}-s101`, schoolId: newSchoolId, code: 'S101', name: 'General Paper (GP)',            core: false, isSubsidiary: true,  category: 'A-Level' },
        { id: `sub-${newSchoolId}-s475`, schoolId: newSchoolId, code: 'S475', name: 'Subsidiary Mathematics (Submath)', core: false, isSubsidiary: true, category: 'A-Level' },
        { id: `sub-${newSchoolId}-s843`, schoolId: newSchoolId, code: 'S843', name: 'Subsidiary ICT',               core: false, isSubsidiary: true,  category: 'A-Level' },
      ];
    }

    // Write to Supabase
    const savedSchool  = await db.upsertSchool(newSchool);
    const savedAdmin   = await db.upsertUser(newAdminUser);
    const savedClasses = await Promise.all(autoClasses.map(c => db.upsertClass(c)));
    const savedSubjects = await Promise.all(autoSubjects.map(s => db.upsertSubject(s)));

    // Update local state (optimistic)
    setSchools(prev  => [...prev, savedSchool]);
    setUsers(prev    => [...prev, savedAdmin]);
    setClasses(prev  => [...prev, ...savedClasses]);
    setSubjects(prev => [...prev, ...savedSubjects]);
    setActiveTenantId(newSchoolId);

    addAuditLog('CREATE_SCHOOL_TENANT', 'PLATFORM_ADMIN',
      `Created new school platform: ${newSchool.name} (${newSchool.levelType}) with ${savedClasses.length} classes and ${savedSubjects.length} subjects auto-configured.`);

    return savedSchool;
  };

  const toggleSchoolStatus = async (schoolId) => {
    const target = schools.find(s => s.id === schoolId);
    if (!target) return;
    const updated = { ...target, active: !target.active };
    await db.upsertSchool(updated);
    setSchools(prev => prev.map(s => s.id === schoolId ? updated : s));
    addAuditLog('TOGGLE_SCHOOL_STATUS', 'PLATFORM_ADMIN',
      `Changed ${target.name} status to ${updated.active ? 'Active' : 'Disabled'}`);
  };

  const deleteSchoolPlatform = async (schoolId) => {
    const target = schools.find(s => s.id === schoolId);
    if (!target) return false;

    // Supabase cascades deletes users/classes/subjects/students via FK ON DELETE CASCADE
    await db.deleteSchool(schoolId);

    setSchools(prev  => prev.filter(s  => s.id !== schoolId));
    setUsers(prev    => prev.filter(u  => u.schoolId !== schoolId || u.role === 'SUPER_ADMIN'));
    setClasses(prev  => prev.filter(c  => c.schoolId !== schoolId));
    setSubjects(prev => prev.filter(s  => s.schoolId !== schoolId));
    setStudents(prev => prev.filter(st => st.schoolId !== schoolId));

    const remaining = schools.filter(s => s.id !== schoolId);
    if (remaining.length > 0) setActiveTenantId(remaining[0].id);

    addAuditLog('DELETE_SCHOOL_TENANT', 'PLATFORM_ADMIN',
      `Permanently deleted school platform: ${target.name}`);
    return true;
  };

  const updateSubscriptionStatus = async (schoolId, status) => {
    const target = schools.find(s => s.id === schoolId);
    if (!target) return;
    const updated = { ...target, subscriptionStatus: status };
    await db.upsertSchool(updated);
    setSchools(prev => prev.map(s => s.id === schoolId ? updated : s));
    addAuditLog('UPDATE_SUBSCRIPTION', 'PLATFORM_BILLING',
      `Updated ${target.name} billing subscription to ${status}`);
  };

  const updateSchoolSettings = async (schoolId, settings) => {
    const target = schools.find(s => s.id === schoolId);
    if (!target) return;
    const updated = { ...target, ...settings };
    try {
      await db.upsertSchool(updated);
    } catch (err) {
      console.warn('[DB] Supabase updateSchoolSettings offline/failed; saved to local persistence:', err.message);
    }
    setSchools(prev => prev.map(s => s.id === schoolId ? updated : s));
    addAuditLog('UPDATE_SCHOOL_SETTINGS', 'SCHOOL_CONFIG',
      `Updated configuration and report template settings for ${target.name}`);
  };

  const editSchoolPlatform = async (schoolId, updatedSchoolData, adminCredentials) => {
    const target = schools.find(s => s.id === schoolId);
    if (!target) return null;

    const updatedSchool = {
      ...target,
      ...updatedSchoolData
    };

    const savedSchool = await db.upsertSchool(updatedSchool);
    setSchools(prev => prev.map(s => s.id === schoolId ? savedSchool : s));

    // If admin details provided, update the corresponding school admin account
    if (adminCredentials && (adminCredentials.email || adminCredentials.name || adminCredentials.password)) {
      const existingAdmin = users.find(u => u.schoolId === schoolId && u.role === 'SCHOOL_ADMIN');
      if (existingAdmin) {
        const updatedAdmin = {
          ...existingAdmin,
          name: adminCredentials.name || existingAdmin.name,
          email: adminCredentials.email || existingAdmin.email,
          ...(adminCredentials.password ? { password: adminCredentials.password } : {})
        };
        const savedAdmin = await db.upsertUser(updatedAdmin);
        setUsers(prev => prev.map(u => u.id === existingAdmin.id ? savedAdmin : u));
      }
    }

    addAuditLog('EDIT_SCHOOL_PLATFORM', 'PLATFORM_ADMIN',
      `Super Admin updated school platform details: ${savedSchool.name}`);
    return savedSchool;
  };

  // ─── School Admin Actions ─────────────────────────────────────────────────
  const addSubject = async (subjectData) => {
    const newSub = {
      id: `sub-${Date.now()}`,
      schoolId: subjectData.schoolId || currentSchool.id,
      code: subjectData.code,
      name: subjectData.name,
      core: subjectData.core || false,
      isSubsidiary: subjectData.isSubsidiary || false,
      category: subjectData.category || (currentSchool.levelType === 'PRIMARY' ? 'Primary' : 'O-Level'),
    };
    let saved = newSub;
    try {
      saved = await db.upsertSubject(newSub);
    } catch (err) {
      console.warn('[DB] Supabase upsertSubject offline/failed; saved to local persistence:', err.message);
    }
    setSubjects(prev => [...prev, saved]);
    addAuditLog('ADD_SUBJECT', 'SUBJECT_MGMT',
      `Added subject [${newSub.code}] ${newSub.name} (${newSub.category})`);
    return saved;
  };

  const deleteSubject = async (subjectId) => {
    const target = subjects.find(s => s.id === subjectId);
    try {
      await db.deleteSubject(subjectId);
    } catch (err) {
      console.warn('[DB] Supabase deleteSubject offline/failed:', err.message);
    }
    setSubjects(prev => prev.filter(s => s.id !== subjectId));
    if (target) {
      addAuditLog('DELETE_SUBJECT', 'SUBJECT_MGMT',
        `Deleted subject [${target.code}] ${target.name}`);
    }
  };

  const addTeacher = async (teacherData) => {
    const newTr = {
      id: `user-tr-${Date.now()}`,
      schoolId: teacherData.schoolId || currentSchool.id,
      email: teacherData.email,
      phone: teacherData.phone || '',
      password: teacherData.password || 'teacher123',
      name: teacherData.name,
      role: 'TEACHER',
      assignedClasses: teacherData.assignedClasses || [],
      assignedSubjects: teacherData.assignedSubjects || [],
    };
    let saved = newTr;
    try {
      saved = await db.upsertUser(newTr);
    } catch (err) {
      console.warn('[DB] Supabase upsertUser offline/failed; saved to local persistence:', err.message);
    }
    setUsers(prev => [...prev, saved]);
    addAuditLog('REGISTER_TEACHER', 'STAFF_MGMT',
      `Registered teacher ${newTr.name} (${newTr.email})`);
    return saved;
  };

  const updateTeacher = async (teacherId, teacherData) => {
    const target = users.find(u => u.id === teacherId);
    if (!target) return;
    const updated = {
      ...target,
      ...teacherData,
      assignedClasses: teacherData.assignedClasses !== undefined ? teacherData.assignedClasses : target.assignedClasses,
      assignedSubjects: teacherData.assignedSubjects !== undefined ? teacherData.assignedSubjects : target.assignedSubjects,
    };
    let saved = updated;
    try {
      saved = await db.upsertUser(updated);
    } catch (err) {
      console.warn('[DB] Supabase upsertUser offline/failed; saved to local persistence:', err.message);
    }
    setUsers(prev => prev.map(u => u.id === teacherId ? saved : u));
    addAuditLog('UPDATE_TEACHER', 'STAFF_MGMT',
      `Updated teacher ${saved.name} (${saved.email})`);
    return saved;
  };

  const deleteTeacher = async (teacherId) => {
    const target = users.find(u => u.id === teacherId);
    if (!target) return;
    try {
      await db.deleteUser(teacherId);
    } catch (err) {
      console.warn('[DB] Supabase deleteUser offline/failed:', err.message);
    }
    setUsers(prev => prev.filter(u => u.id !== teacherId));
    addAuditLog('DELETE_TEACHER', 'STAFF_MGMT',
      `Removed teacher ${target.name} (${target.email})`);
  };

  const blockUser = async (userId) => {
    const target = users.find(u => u.id === userId);
    if (!target) return;
    const updated = { ...target, blocked: true };
    try { await db.upsertUser(updated); } catch (err) {
      console.warn('[DB] Supabase blockUser offline/failed:', err.message);
    }
    setUsers(prev => prev.map(u => u.id === userId ? updated : u));
    addAuditLog('BLOCK_USER', 'STAFF_MGMT', `Blocked account for ${target.name} (${target.email})`);
  };

  const unblockUser = async (userId) => {
    const target = users.find(u => u.id === userId);
    if (!target) return;
    const updated = { ...target, blocked: false };
    try { await db.upsertUser(updated); } catch (err) {
      console.warn('[DB] Supabase unblockUser offline/failed:', err.message);
    }
    setUsers(prev => prev.map(u => u.id === userId ? updated : u));
    addAuditLog('UNBLOCK_USER', 'STAFF_MGMT', `Unblocked account for ${target.name} (${target.email})`);
  };

  const addStudent = async (studentData) => {
    const newStd = {
      id: `std-${Date.now()}`,
      schoolId: studentData.schoolId || currentSchool.id,
      lin: studentData.lin || `LIN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      name: studentData.name,
      gender: studentData.gender || 'M',
      classId: studentData.classId,
      stream: studentData.stream || 'A',
      combination: studentData.combination || '',
      parentPhone: studentData.parentPhone || '',
      parentPin: studentData.parentPin ? String(studentData.parentPin).trim() : '1234',
      house: studentData.house || 'Main',
      feeRequiredUGX: Number(studentData.feeRequiredUGX) || 1200000,
      feePaidUGX: Number(studentData.feePaidUGX) || 1200000,
      feeBalanceUGX: Number(studentData.feeBalanceUGX) || 0,
      feeOverride: false,
      daysPresent: 90,
      totalSchoolDays: 90,
    };
    let saved = newStd;
    try {
      saved = await db.upsertStudent(newStd);
    } catch (err) {
      console.warn('[DB] Supabase upsertStudent offline/failed; saved to local persistence:', err.message);
    }
    setStudents(prev => [...prev, saved]);
    addAuditLog('ENROLL_STUDENT', 'STUDENT_MGMT',
      `Enrolled student ${newStd.name} (LIN: ${newStd.lin}, Parent PIN: ${newStd.parentPin})${newStd.combination ? ` [${newStd.combination}]` : ''}`);
    return saved;
  };

  const updateStudent = async (studentId, studentData) => {
    const target = students.find(s => s.id === studentId);
    if (!target) return null;
    const updated = {
      ...target,
      ...studentData,
      parentPin: studentData.parentPin !== undefined ? String(studentData.parentPin).trim() : target.parentPin,
    };
    let saved = updated;
    try {
      saved = await db.upsertStudent(updated);
    } catch (err) {
      console.warn('[DB] Supabase upsertStudent offline/failed; saved to local persistence:', err.message);
    }
    setStudents(prev => prev.map(s => s.id === studentId ? saved : s));
    addAuditLog('UPDATE_STUDENT', 'STUDENT_MGMT',
      `Updated particulars for ${saved.name} (LIN: ${saved.lin}, Parent PIN: ${saved.parentPin || '1234'})`);
    return saved;
  };

  const deleteStudent = async (studentId) => {
    const target = students.find(s => s.id === studentId);
    if (!target) return;
    try {
      await db.deleteStudent?.(studentId);
    } catch (err) {
      console.warn('[DB] Supabase deleteStudent offline/failed:', err.message);
    }
    setStudents(prev => prev.filter(s => s.id !== studentId));
    addAuditLog('DELETE_STUDENT', 'STUDENT_MGMT',
      `Removed student ${target.name} (LIN: ${target.lin}) from school records`);
  };

  const blockStudent = async (studentId) => {
    const target = students.find(s => s.id === studentId);
    if (!target) return;
    const updated = { ...target, blocked: true };
    try { await db.upsertStudent(updated); } catch (err) {
      console.warn('[DB] Supabase blockStudent offline/failed:', err.message);
    }
    setStudents(prev => prev.map(s => s.id === studentId ? updated : s));
    addAuditLog('BLOCK_STUDENT', 'STUDENT_MGMT', `Blocked portal access for student ${target.name} (${target.lin})`);
  };

  const unblockStudent = async (studentId) => {
    const target = students.find(s => s.id === studentId);
    if (!target) return;
    const updated = { ...target, blocked: false };
    try { await db.upsertStudent(updated); } catch (err) {
      console.warn('[DB] Supabase unblockStudent offline/failed:', err.message);
    }
    setStudents(prev => prev.map(s => s.id === studentId ? updated : s));
    addAuditLog('UNBLOCK_STUDENT', 'STUDENT_MGMT', `Unblocked portal access for student ${target.name} (${target.lin})`);
  };

  const updateFeeRecord = async (studentId, feeRequiredUGX, feePaidUGX, feeOverride) => {
    const target = students.find(s => s.id === studentId);
    if (!target) return;
    const req  = Number(feeRequiredUGX);
    const paid = Number(feePaidUGX);
    const bal  = Math.max(0, req - paid);
    const updated = {
      ...target,
      feeRequiredUGX: req,
      feePaidUGX: paid,
      feeBalanceUGX: bal,
      feeOverride: feeOverride !== undefined ? feeOverride : target.feeOverride,
    };
    try {
      await db.upsertStudent(updated);
    } catch (err) {
      console.warn('[DB] Supabase upsertStudent offline/failed:', err.message);
    }
    setStudents(prev => prev.map(s => s.id === studentId ? updated : s));
    addAuditLog('UPDATE_FEE_RECORD', 'FINANCIAL_CLEARANCE',
      `Updated fees for ${target.name}: Required UGX ${req.toLocaleString()}, Paid UGX ${paid.toLocaleString()}, Balance UGX ${bal.toLocaleString()}, Override: ${updated.feeOverride}`);
  };

  const setBatchRequiredFeesForClass = async (classId, stream, feeAmountUGX) => {
    const feeReq = Number(feeAmountUGX);
    if (isNaN(feeReq) || feeReq < 0) return 0;

    const affected = students.filter(s => {
      const matchClass  = classId === 'ALL' || s.classId === classId;
      const matchStream = !stream || stream === 'ALL' || s.stream === stream;
      return s.schoolId === currentSchool.id && matchClass && matchStream;
    });

    const updated = affected.map(s => ({
      ...s,
      feeRequiredUGX: feeReq,
      feeBalanceUGX: Math.max(0, feeReq - (s.feePaidUGX || 0)),
    }));

    try {
      await Promise.all(updated.map(s => db.upsertStudent(s)));
    } catch (err) {
      console.warn('[DB] Supabase batch upsertStudent offline/failed:', err.message);
    }
    setStudents(prev => prev.map(s => {
      const u = updated.find(u => u.id === s.id);
      return u || s;
    }));

    const targetCls = classes.find(c => c.id === classId);
    const label = classId === 'ALL'
      ? 'All Classes'
      : `${targetCls?.name || 'Class'}${stream && stream !== 'ALL' ? ` (${stream})` : ''}`;
    addAuditLog('SET_CLASS_FEES', 'FINANCIAL_CLEARANCE',
      `Determined required term fees for ${label} as UGX ${feeReq.toLocaleString()}`);

    return affected.length;
  };

  const updateAttendance = async (studentId, daysPresent, totalSchoolDays) => {
    const target = students.find(s => s.id === studentId);
    if (!target) return;
    const updated = { ...target, daysPresent: Number(daysPresent), totalSchoolDays: Number(totalSchoolDays) };
    try {
      await db.upsertStudent(updated);
    } catch (err) {
      console.warn('[DB] Supabase upsertStudent offline/failed:', err.message);
    }
    setStudents(prev => prev.map(s => s.id === studentId ? updated : s));
  };

  const addBulkStudents = async (bulkList, classId, stream) => {
    const newStudents = bulkList.map((item, idx) => ({
      id: `std-bulk-${Date.now()}-${idx}`,
      schoolId: currentSchool.id,
      lin: item.lin || `LIN-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      name: item.name,
      gender: item.gender || 'M',
      classId,
      stream: stream || 'A',
      parentPhone: item.parentPhone || '',
      parentPin: '1234',
      house: item.house || 'General',
      feeRequiredUGX: 1200000,
      feePaidUGX: 1200000,
      feeBalanceUGX: 0,
      feeOverride: false,
      daysPresent: 90,
      totalSchoolDays: 90,
    }));

    let saved = newStudents;
    try {
      saved = await Promise.all(newStudents.map(s => db.upsertStudent(s)));
    } catch (err) {
      console.warn('[DB] Supabase batch upsertStudent offline/failed:', err.message);
    }
    setStudents(prev => [...prev, ...saved]);
    addAuditLog('BULK_EXCEL_IMPORT', 'STUDENT_MGMT',
      `Imported ${saved.length} students via Excel spreadsheet`);
    return saved.length;
  };

  const addClass = async (classData) => {
    const newCls = {
      id: `cls-${Date.now()}`,
      schoolId: classData.schoolId || currentSchool.id,
      name: classData.name,
      level: classData.level || 'O-Level',
      streams: classData.streams || ['A', 'B'],
    };
    let saved = newCls;
    try {
      saved = await db.upsertClass(newCls);
    } catch (err) {
      console.warn('[DB] Supabase upsertClass offline/failed:', err.message);
    }
    setClasses(prev => [...prev, saved]);
    addAuditLog('ADD_CLASS', 'CLASS_MGMT',
      `Added class level ${newCls.name} (${newCls.level}) with streams: ${newCls.streams.join(', ')}`);
    return saved;
  };

  const addStreamToClass = async (classId, streamName) => {
    const trimmed = streamName.trim();
    if (!trimmed) return;
    const target = classes.find(c => c.id === classId);
    if (!target || target.streams.includes(trimmed)) return;
    const updated = { ...target, streams: [...target.streams, trimmed] };
    try {
      await db.upsertClass(updated);
    } catch (err) {
      console.warn('[DB] Supabase upsertClass offline/failed:', err.message);
    }
    setClasses(prev => prev.map(c => c.id === classId ? updated : c));
    addAuditLog('ADD_STREAM', 'CLASS_MGMT',
      `Added custom stream "${trimmed}" to ${target.name}`);
  };

  const removeStreamFromClass = async (classId, streamName) => {
    const target = classes.find(c => c.id === classId);
    if (!target) return;
    const updated = { ...target, streams: target.streams.filter(s => s !== streamName) };
    try {
      await db.upsertClass(updated);
    } catch (err) {
      console.warn('[DB] Supabase upsertClass offline/failed:', err.message);
    }
    setClasses(prev => prev.map(c => c.id === classId ? updated : c));
    addAuditLog('REMOVE_STREAM', 'CLASS_MGMT',
      `Removed stream "${streamName}" from ${target.name}`);
  };

  // ─── Teacher / Mark Entry Actions ─────────────────────────────────────────
  const saveMarks = async (markEntries) => {
    // Optimistic update
    setMarks(prev => {
      const updated = [...prev];
      markEntries.forEach(entry => {
        const idx = updated.findIndex(
          m => m.studentId === entry.studentId && m.subjectId === entry.subjectId
        );
        if (idx !== -1) updated[idx] = { ...updated[idx], ...entry };
        else updated.push(entry);
      });
      return updated;
    });

    // Persist to Supabase
    try {
      await Promise.all(markEntries.map(m => db.upsertMark(m)));
    } catch (err) {
      console.warn('[DB] Supabase saveMarks offline/failed; saved to local persistence:', err.message);
    }
    addAuditLog('SAVE_MARKS', 'MARK_SHEET',
      `Saved/updated mark entries for ${markEntries.length} student scores`);
  };

  // ─── SMS Dispatch Engine ───────────────────────────────────────────────────
  const dispatchSMSForClass = async (classId, stream, term = 'EOT', messageTemplate = '') => {
    const targetStudents = students.filter(
      s => s.schoolId === currentSchool.id && s.classId === classId && (s.stream === stream || !stream)
    );

    const recipients = targetStudents.map(std => {
      const balanceText = std.feeBalanceUGX > 0
        ? `Bal: UGX ${std.feeBalanceUGX.toLocaleString()}`
        : 'Fees: Cleared';
      const msg = messageTemplate ||
        `[${currentSchool.name.substring(0, 20)}] Dear Parent, ${std.name} (${std.lin}) ${term} Report Card Published. ${balanceText}. Next Term Opens: 14/09/2026. Portal: mpumuza.ac.ug/p/${std.lin}`;
      return { id: std.id, name: std.name, phone: std.parentPhone || '0772000000', message: msg };
    });

    const result = sendSMSBroadcast(recipients, messageTemplate);
    if (result.success) {
      setSmsLogs(prev => [...result.logs, ...prev]);
      await db.insertSmsLogs(result.logs).catch(err =>
        console.error('[DB] SMS log insert failed:', err.message)
      );
      addAuditLog('DISPATCH_SMS', 'SMS_BROADCAST',
        `Dispatched SMS results to ${result.sentCount} parents via Africa's Talking gateway`);
    }
    return result;
  };

  // ─── Provider ─────────────────────────────────────────────────────────────
  return (
    <AuthContext.Provider value={{
      loading,
      dbError,
      isOfflineMode,
      isOnline,
      isSyncing,
      lastSyncedAt,
      triggerCloudSync,
      schools,
      users,
      classes,
      subjects,
      students,
      marks,
      auditLogs,
      smsLogs,
      currentUser,
      currentSchool,
      activeTenantId,
      activeTab,
      setActiveTab,
      isMobileSidebarOpen,
      setIsMobileSidebarOpen,
      login,
      parentLogin,
      logout,
      switchTenant,
      addSchoolPlatform,
      editSchoolPlatform,
      toggleSchoolStatus,
      deleteSchoolPlatform,
      updateSubscriptionStatus,
      updateSchoolSettings,
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
      saveMarks,
      dispatchSMSForClass,
      addAuditLog,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
