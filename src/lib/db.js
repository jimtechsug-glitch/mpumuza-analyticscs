/**
 * db.js — All Supabase database operations for Mpumuza Analytics.
 *
 * Each function maps between the app's camelCase data model and
 * the PostgreSQL snake_case column names. Components and AuthContext
 * always work with camelCase; only this file touches snake_case.
 */
import { supabase } from './supabase';

// ─────────────────────────────────────────────────────────────────────────────
// Mappers: DB row (snake_case) ↔ App model (camelCase)
// ─────────────────────────────────────────────────────────────────────────────

const fromDbSchool = (r) => !r ? null : ({
  id: r.id,
  name: r.name,
  slug: r.slug,
  levelType: r.level_type,
  motto: r.motto,
  address: r.address,
  contactPhone: r.contact_phone,
  contactEmail: r.contact_email,
  headTeacher: r.head_teacher,
  headTeacherSignature: r.head_teacher_signature,
  dosName: r.dos_name,
  dosSignature: r.dos_signature,
  themeColor: r.theme_color,
  badgeUrl: r.badge_url,
  botWeight: r.bot_weight,
  motWeight: r.mot_weight,
  eotWeight: r.eot_weight,
  useNewCurriculum: r.use_new_curriculum,
  showPositionRanking: r.show_position_ranking,
  subscriptionStatus: r.subscription_status,
  billingPlan: r.billing_plan,
  studentRateUGX: r.student_rate_ugx,
  active: r.active,
  nextTermBegins: r.next_term_begins || r.nextTermBegins || 'Monday, 14th September 2026',
});

const toDbSchool = (s) => ({
  id: s.id,
  name: s.name,
  slug: s.slug,
  level_type: s.levelType,
  motto: s.motto,
  address: s.address,
  contact_phone: s.contactPhone,
  contact_email: s.contactEmail,
  head_teacher: s.headTeacher,
  head_teacher_signature: s.headTeacherSignature,
  dos_name: s.dosName,
  dos_signature: s.dosSignature,
  theme_color: s.themeColor,
  badge_url: s.badgeUrl,
  bot_weight: s.botWeight,
  mot_weight: s.motWeight,
  eot_weight: s.eotWeight,
  use_new_curriculum: s.useNewCurriculum,
  show_position_ranking: s.showPositionRanking,
  subscription_status: s.subscriptionStatus,
  billing_plan: s.billingPlan,
  student_rate_ugx: s.studentRateUGX,
  active: s.active,
  next_term_begins: s.nextTermBegins || 'Monday, 14th September 2026',
});

const fromDbUser = (r) => !r ? null : ({
  id: r.id,
  schoolId: r.school_id,
  email: r.email,
  phone: r.phone || '',
  password: r.password,
  name: r.name,
  role: r.role,
  assignedClasses: r.assigned_classes || [],
  assignedSubjects: r.assigned_subjects || [],
});

const toDbUser = (u) => ({
  id: u.id,
  school_id: u.schoolId || null,
  email: u.email,
  phone: u.phone || null,
  password: u.password,
  name: u.name,
  role: u.role,
  assigned_classes: u.assignedClasses || [],
  assigned_subjects: u.assignedSubjects || [],
});

const fromDbClass = (r) => !r ? null : ({
  id: r.id,
  schoolId: r.school_id,
  name: r.name,
  level: r.level,
  streams: r.streams || [],
});

const toDbClass = (c) => ({
  id: c.id,
  school_id: c.schoolId,
  name: c.name,
  level: c.level,
  streams: c.streams || [],
});

const fromDbSubject = (r) => !r ? null : ({
  id: r.id,
  schoolId: r.school_id,
  code: r.code,
  name: r.name,
  core: r.core,
  isSubsidiary: r.is_subsidiary,
  category: r.category,
});

const toDbSubject = (s) => ({
  id: s.id,
  school_id: s.schoolId,
  code: s.code,
  name: s.name,
  core: s.core,
  is_subsidiary: s.isSubsidiary,
  category: s.category,
});

const fromDbStudent = (r) => !r ? null : ({
  id: r.id,
  schoolId: r.school_id,
  lin: r.lin,
  name: r.name,
  gender: r.gender,
  classId: r.class_id,
  stream: r.stream,
  combination: r.combination,
  parentPhone: r.parent_phone,
  parentPin: r.parent_pin,
  house: r.house,
  feeRequiredUGX: r.fee_required_ugx,
  feePaidUGX: r.fee_paid_ugx,
  feeBalanceUGX: r.fee_balance_ugx,
  feeOverride: r.fee_override,
  daysPresent: r.days_present,
  totalSchoolDays: r.total_school_days,
  classTeacherRemark: r.class_teacher_remark || r.classTeacherRemark || null,
  headTeacherRemark: r.head_teacher_remark || r.headTeacherRemark || null,
});

const toDbStudent = (s) => ({
  id: s.id,
  school_id: s.schoolId,
  lin: s.lin,
  name: s.name,
  gender: s.gender || 'M',
  class_id: s.classId,
  stream: s.stream || null,
  combination: s.combination || null,
  parent_phone: s.parentPhone || null,
  parent_pin: s.parentPin || '1234',
  house: s.house || null,
  fee_required_ugx: s.feeRequiredUGX || 0,
  fee_paid_ugx: s.feePaidUGX || 0,
  fee_balance_ugx: s.feeBalanceUGX || 0,
  fee_override: s.feeOverride || false,
  days_present: s.daysPresent || 90,
  total_school_days: s.totalSchoolDays || 90,
  class_teacher_remark: s.classTeacherRemark || null,
  head_teacher_remark: s.headTeacherRemark || null,
});

const fromDbMark = (r) => !r ? null : ({
  studentId: r.student_id,
  subjectId: r.subject_id,
  bot: r.bot,
  mot: r.mot,
  eot: r.eot,
  comment: r.comment,
});

const toDbMark = (m) => ({
  student_id: m.studentId,
  subject_id: m.subjectId,
  bot: m.bot ?? null,
  mot: m.mot ?? null,
  eot: m.eot ?? null,
  comment: m.comment || null,
});

const fromDbAuditLog = (r) => !r ? null : ({
  id: r.id,
  timestamp: r.timestamp,
  userId: r.user_id,
  userName: r.user_name,
  userRole: r.user_role,
  category: r.category,
  action: r.action,
  details: r.details,
});

const toDbAuditLog = (l) => ({
  id: l.id,
  timestamp: l.timestamp,
  user_id: l.userId,
  user_name: l.userName,
  user_role: l.userRole,
  category: l.category,
  action: l.action,
  details: l.details,
});

const fromDbSmsLog = (r) => !r ? null : ({
  id: r.id,
  timestamp: r.timestamp,
  studentId: r.student_id,
  studentName: r.student_name,
  phone: r.phone,
  message: r.message,
  status: r.status,
});

const toDbSmsLog = (l) => ({
  id: l.id,
  timestamp: l.timestamp,
  student_id: l.studentId,
  student_name: l.studentName,
  phone: l.phone,
  message: l.message,
  status: l.status,
});

// ─────────────────────────────────────────────────────────────────────────────
// Seed Check
// ─────────────────────────────────────────────────────────────────────────────

/** Returns true if the database has already been seeded (at least 1 school exists). */
export const isSeeded = async () => {
  const { count, error } = await supabase
    .from('schools')
    .select('*', { count: 'exact', head: true });
  if (error) throw error;
  return (count ?? 0) > 0;
};

// ─────────────────────────────────────────────────────────────────────────────
// Schools
// ─────────────────────────────────────────────────────────────────────────────

export const getSchools = async () => {
  const { data, error } = await supabase.from('schools').select('*').order('created_at');
  if (error) throw error;
  return data.map(fromDbSchool);
};

export const upsertSchool = async (school) => {
  const { data, error } = await supabase
    .from('schools')
    .upsert(toDbSchool(school), { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return fromDbSchool(data);
};

export const deleteSchool = async (schoolId) => {
  const { error } = await supabase.from('schools').delete().eq('id', schoolId);
  if (error) throw error;
};

// ─────────────────────────────────────────────────────────────────────────────
// Users
// ─────────────────────────────────────────────────────────────────────────────

export const getUsers = async () => {
  const { data, error } = await supabase.from('users').select('*');
  if (error) throw error;
  return data.map(fromDbUser);
};

export const upsertUser = async (user) => {
  const { data, error } = await supabase
    .from('users')
    .upsert(toDbUser(user), { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return fromDbUser(data);
};

export const deleteUser = async (userId) => {
  const { error } = await supabase.from('users').delete().eq('id', userId);
  if (error) throw error;
};

export const deleteUsersBySchool = async (schoolId) => {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('school_id', schoolId)
    .neq('role', 'SUPER_ADMIN');
  if (error) throw error;
};

// ─────────────────────────────────────────────────────────────────────────────
// Classes
// ─────────────────────────────────────────────────────────────────────────────

export const getClasses = async () => {
  const { data, error } = await supabase.from('classes').select('*').order('name');
  if (error) throw error;
  return data.map(fromDbClass);
};

export const upsertClass = async (cls) => {
  const { data, error } = await supabase
    .from('classes')
    .upsert(toDbClass(cls), { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return fromDbClass(data);
};

export const deleteClassesBySchool = async (schoolId) => {
  const { error } = await supabase.from('classes').delete().eq('school_id', schoolId);
  if (error) throw error;
};

// ─────────────────────────────────────────────────────────────────────────────
// Subjects
// ─────────────────────────────────────────────────────────────────────────────

export const getSubjects = async () => {
  const { data, error } = await supabase.from('subjects').select('*');
  if (error) throw error;
  return data.map(fromDbSubject);
};

export const upsertSubject = async (subject) => {
  const { data, error } = await supabase
    .from('subjects')
    .upsert(toDbSubject(subject), { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return fromDbSubject(data);
};

export const deleteSubject = async (subjectId) => {
  const { error } = await supabase.from('subjects').delete().eq('id', subjectId);
  if (error) throw error;
};

export const deleteSubjectsBySchool = async (schoolId) => {
  const { error } = await supabase.from('subjects').delete().eq('school_id', schoolId);
  if (error) throw error;
};

// ─────────────────────────────────────────────────────────────────────────────
// Students
// ─────────────────────────────────────────────────────────────────────────────

export const getStudents = async () => {
  const { data, error } = await supabase.from('students').select('*');
  if (error) throw error;
  return data.map(fromDbStudent);
};

export const upsertStudent = async (student) => {
  const { data, error } = await supabase
    .from('students')
    .upsert(toDbStudent(student), { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return fromDbStudent(data);
};

export const deleteStudent = async (studentId) => {
  const { error } = await supabase.from('students').delete().eq('id', studentId);
  if (error) throw error;
};

export const deleteStudentsBySchool = async (schoolId) => {
  const { error } = await supabase.from('students').delete().eq('school_id', schoolId);
  if (error) throw error;
};

// ─────────────────────────────────────────────────────────────────────────────
// Marks
// ─────────────────────────────────────────────────────────────────────────────

export const getMarks = async () => {
  const { data, error } = await supabase.from('marks').select('*');
  if (error) throw error;
  return data.map(fromDbMark);
};

export const upsertMark = async (mark) => {
  const { data, error } = await supabase
    .from('marks')
    .upsert(toDbMark(mark), { onConflict: 'student_id,subject_id' })
    .select()
    .single();
  if (error) throw error;
  return fromDbMark(data);
};

// ─────────────────────────────────────────────────────────────────────────────
// Audit Logs
// ─────────────────────────────────────────────────────────────────────────────

export const getAuditLogs = async () => {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('timestamp', { ascending: false })
    .limit(500);
  if (error) throw error;
  return data.map(fromDbAuditLog);
};

export const insertAuditLog = async (log) => {
  const { error } = await supabase.from('audit_logs').insert(toDbAuditLog(log));
  if (error) console.error('[DB] Audit log insert failed:', error.message);
};

// ─────────────────────────────────────────────────────────────────────────────
// SMS Logs
// ─────────────────────────────────────────────────────────────────────────────

export const getSmsLogs = async () => {
  const { data, error } = await supabase
    .from('sms_logs')
    .select('*')
    .order('timestamp', { ascending: false });
  if (error) throw error;
  return data.map(fromDbSmsLog);
};

export const insertSmsLogs = async (logs) => {
  if (!logs || !logs.length) return;
  const { error } = await supabase.from('sms_logs').insert(logs.map(toDbSmsLog));
  if (error) throw error;
};
