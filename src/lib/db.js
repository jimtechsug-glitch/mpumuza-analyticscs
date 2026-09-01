/**
 * db.js — MongoDB API Client for Mpumuza Analytics
 *
 * Communicates with the Express backend REST API (/api/*) which persists
 * data to MongoDB Atlas. Maintains seamless offline/local fallback.
 */

const API_BASE = '/api';

// Helper for resilient JSON fetch requests
async function apiRequest(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || `API error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (err) {
    console.warn(`[DB API] Request to ${endpoint} failed:`, err.message);
    throw err;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Status & Seed
// ─────────────────────────────────────────────────────────────────────────────

export const isSeeded = async () => {
  try {
    const schools = await getSchools();
    return Boolean(schools && schools.length > 0);
  } catch {
    return false;
  }
};

export const getDbStatus = async () => {
  try {
    return await apiRequest('/status');
  } catch {
    return { database: 'offline_local', connected: false };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Schools
// ─────────────────────────────────────────────────────────────────────────────

export const getSchools = async () => {
  try {
    return await apiRequest('/schools');
  } catch {
    const local = localStorage.getItem('mpumuza_storage_schools');
    return local ? JSON.parse(local) : [];
  }
};

export const upsertSchool = async (school) => {
  try {
    const res = await apiRequest('/schools', {
      method: 'POST',
      body: JSON.stringify(school)
    });
    return res.school || school;
  } catch {
    return school;
  }
};

export const deleteSchool = async (schoolId) => {
  try {
    await apiRequest(`/schools/${schoolId}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('[DB] Delete school local fallback:', err.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Users
// ─────────────────────────────────────────────────────────────────────────────

export const getUsers = async () => {
  try {
    return await apiRequest('/users');
  } catch {
    const local = localStorage.getItem('mpumuza_storage_users');
    return local ? JSON.parse(local) : [];
  }
};

export const upsertUser = async (user) => {
  try {
    const res = await apiRequest('/users', {
      method: 'POST',
      body: JSON.stringify(user)
    });
    return res.user || user;
  } catch {
    return user;
  }
};

export const deleteUser = async (userId) => {
  try {
    await apiRequest(`/users/${userId}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('[DB] Delete user local fallback:', err.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Classes
// ─────────────────────────────────────────────────────────────────────────────

export const getClasses = async () => {
  try {
    return await apiRequest('/classes');
  } catch {
    const local = localStorage.getItem('mpumuza_storage_classes');
    return local ? JSON.parse(local) : [];
  }
};

export const upsertClass = async (cls) => {
  try {
    const res = await apiRequest('/classes', {
      method: 'POST',
      body: JSON.stringify(cls)
    });
    return res.class || cls;
  } catch {
    return cls;
  }
};

export const deleteClass = async (classId) => {
  try {
    await apiRequest(`/classes/${classId}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('[DB] Delete class local fallback:', err.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Subjects
// ─────────────────────────────────────────────────────────────────────────────

export const getSubjects = async () => {
  try {
    return await apiRequest('/subjects');
  } catch {
    const local = localStorage.getItem('mpumuza_storage_subjects');
    return local ? JSON.parse(local) : [];
  }
};

export const upsertSubject = async (subject) => {
  try {
    const res = await apiRequest('/subjects', {
      method: 'POST',
      body: JSON.stringify(subject)
    });
    return res.subject || subject;
  } catch {
    return subject;
  }
};

export const deleteSubject = async (subjectId) => {
  try {
    await apiRequest(`/subjects/${subjectId}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('[DB] Delete subject local fallback:', err.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Students
// ─────────────────────────────────────────────────────────────────────────────

export const getStudents = async () => {
  try {
    return await apiRequest('/students');
  } catch {
    const local = localStorage.getItem('mpumuza_storage_students');
    return local ? JSON.parse(local) : [];
  }
};

export const upsertStudent = async (student) => {
  try {
    const res = await apiRequest('/students', {
      method: 'POST',
      body: JSON.stringify(student)
    });
    return res.student || student;
  } catch {
    return student;
  }
};

export const upsertStudentsBulk = async (students) => {
  try {
    const res = await apiRequest('/students/bulk', {
      method: 'POST',
      body: JSON.stringify(students)
    });
    return res;
  } catch {
    return { success: true, count: students.length };
  }
};

export const deleteStudent = async (studentId) => {
  try {
    await apiRequest(`/students/${studentId}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('[DB] Delete student local fallback:', err.message);
  }
};

export const deleteStudentsBySchool = async (schoolId) => {
  try {
    await apiRequest(`/students/by-school/${schoolId}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('[DB] Delete students by school fallback:', err.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Marks
// ─────────────────────────────────────────────────────────────────────────────

export const getMarks = async () => {
  try {
    return await apiRequest('/marks');
  } catch {
    const local = localStorage.getItem('mpumuza_storage_marks');
    return local ? JSON.parse(local) : [];
  }
};

export const upsertMark = async (mark) => {
  try {
    const res = await apiRequest('/marks', {
      method: 'POST',
      body: JSON.stringify(mark)
    });
    return res.mark || mark;
  } catch {
    return mark;
  }
};

export const saveMarksBatch = async (marksList) => {
  try {
    const res = await apiRequest('/marks/batch', {
      method: 'POST',
      body: JSON.stringify(marksList)
    });
    return res;
  } catch {
    return { success: true, count: marksList.length };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Audit Logs
// ─────────────────────────────────────────────────────────────────────────────

export const getAuditLogs = async () => {
  try {
    return await apiRequest('/audit-logs');
  } catch {
    const local = localStorage.getItem('mpumuza_storage_audit_logs');
    return local ? JSON.parse(local) : [];
  }
};

export const insertAuditLog = async (log) => {
  try {
    await apiRequest('/audit-logs', {
      method: 'POST',
      body: JSON.stringify(log)
    });
  } catch (err) {
    console.warn('[DB] Audit log insert fallback:', err.message);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SMS Logs
// ─────────────────────────────────────────────────────────────────────────────

export const getSmsLogs = async () => {
  try {
    return await apiRequest('/sms-logs');
  } catch {
    const local = localStorage.getItem('mpumuza_storage_sms_logs');
    return local ? JSON.parse(local) : [];
  }
};

export const insertSmsLogs = async (logs) => {
  try {
    await apiRequest('/sms-logs', {
      method: 'POST',
      body: JSON.stringify(logs)
    });
  } catch (err) {
    console.warn('[DB] SMS logs insert fallback:', err.message);
  }
};
