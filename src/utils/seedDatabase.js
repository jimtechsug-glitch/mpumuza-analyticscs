/**
 * seedDatabase.js
 * Seeds the Supabase database with initial demo data on first run.
 * Does nothing if the database already has schools (already seeded).
 */
import {
  INITIAL_SUPER_ADMIN,
  INITIAL_SCHOOLS,
  INITIAL_USERS,
  INITIAL_CLASSES,
  INITIAL_SUBJECTS,
  INITIAL_STUDENTS,
  INITIAL_MARKS,
  INITIAL_AUDIT_LOGS,
} from './initialData';
import * as db from '../lib/db';

export const seedDatabaseIfEmpty = async () => {
  try {
    const seeded = await db.isSeeded();
    if (seeded) {
      console.log('[Seed] Database already populated — skipping seed.');
      return;
    }

    console.log('[Seed] First run — seeding database with initial data…');

    // 1. Schools must come first (foreign key root)
    for (const school of INITIAL_SCHOOLS) {
      await db.upsertSchool(school);
    }
    console.log(`[Seed] ✓ ${INITIAL_SCHOOLS.length} schools`);

    // 2. Users (super admin + school admins + teachers)
    for (const user of INITIAL_USERS) {
      await db.upsertUser(user);
    }
    console.log(`[Seed] ✓ ${INITIAL_USERS.length} users`);

    // 3. Classes
    for (const cls of INITIAL_CLASSES) {
      await db.upsertClass(cls);
    }
    console.log(`[Seed] ✓ ${INITIAL_CLASSES.length} classes`);

    // 4. Subjects
    for (const sub of INITIAL_SUBJECTS) {
      await db.upsertSubject(sub);
    }
    console.log(`[Seed] ✓ ${INITIAL_SUBJECTS.length} subjects`);

    // 5. Students
    for (const std of INITIAL_STUDENTS) {
      await db.upsertStudent(std);
    }
    console.log(`[Seed] ✓ ${INITIAL_STUDENTS.length} students`);

    // 6. Marks
    for (const mark of INITIAL_MARKS) {
      await db.upsertMark(mark);
    }
    console.log(`[Seed] ✓ ${INITIAL_MARKS.length} mark entries`);

    // 7. Audit logs
    for (const log of INITIAL_AUDIT_LOGS) {
      await db.insertAuditLog(log);
    }
    console.log(`[Seed] ✓ ${INITIAL_AUDIT_LOGS.length} audit logs`);

    console.log('[Seed] ✅ Database seeded successfully!');
  } catch (err) {
    console.error('[Seed] ❌ Seeding failed:', err.message || err);
    throw err;
  }
};
