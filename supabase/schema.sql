-- ============================================================
--  Mpumuza Analytics — Multi-Tenant PostgreSQL Schema (Supabase)
--  Includes NCDC Lower Secondary & Multi-Tenant Performance Indexes
-- ============================================================

-- ─── 1. Schools (Tenants) ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schools (
  id                    TEXT PRIMARY KEY,
  name                  TEXT NOT NULL,
  slug                  TEXT UNIQUE,
  level_type            TEXT NOT NULL CHECK (level_type IN ('PRIMARY', 'SECONDARY')),
  motto                 TEXT,
  address               TEXT,
  contact_phone         TEXT,
  contact_email         TEXT,
  head_teacher          TEXT,
  head_teacher_signature TEXT,
  dos_name              TEXT,
  dos_signature         TEXT,
  theme_color           TEXT DEFAULT 'navy',
  badge_url             TEXT,
  bot_weight            INTEGER DEFAULT 20,
  mot_weight            INTEGER DEFAULT 20,
  eot_weight            INTEGER DEFAULT 60,
  use_new_curriculum    BOOLEAN DEFAULT FALSE,
  show_position_ranking BOOLEAN DEFAULT TRUE,
  subscription_status   TEXT DEFAULT 'ACTIVE',
  billing_plan          TEXT DEFAULT 'PER_STUDENT_TERM',
  student_rate_ugx      INTEGER DEFAULT 1500,
  active                BOOLEAN DEFAULT TRUE,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 2. Users (Role-Based Access) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id                TEXT PRIMARY KEY,
  school_id         TEXT REFERENCES schools(id) ON DELETE CASCADE,
  email             TEXT UNIQUE NOT NULL,
  phone             TEXT,
  password          TEXT NOT NULL,
  name              TEXT,
  role              TEXT NOT NULL CHECK (role IN ('SUPER_ADMIN', 'SCHOOL_ADMIN', 'TEACHER')),
  assigned_classes  JSONB DEFAULT '[]',
  assigned_subjects JSONB DEFAULT '[]',
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 3. Classes ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS classes (
  id         TEXT PRIMARY KEY,
  school_id  TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  level      TEXT NOT NULL,
  streams    TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 4. Subjects ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subjects (
  id            TEXT PRIMARY KEY,
  school_id     TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  code          TEXT NOT NULL,
  name          TEXT NOT NULL,
  core          BOOLEAN DEFAULT FALSE,
  is_subsidiary BOOLEAN DEFAULT FALSE,
  category      TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 5. Students ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS students (
  id                TEXT PRIMARY KEY,
  school_id         TEXT NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  lin               TEXT UNIQUE NOT NULL,
  name              TEXT NOT NULL,
  gender            TEXT DEFAULT 'M',
  class_id          TEXT REFERENCES classes(id) ON DELETE SET NULL,
  stream            TEXT,
  combination       TEXT,
  parent_phone      TEXT,
  parent_pin        TEXT DEFAULT '1234',
  house             TEXT,
  fee_required_ugx  INTEGER DEFAULT 1200000,
  fee_paid_ugx      INTEGER DEFAULT 1200000,
  fee_balance_ugx   INTEGER DEFAULT 0,
  fee_override      BOOLEAN DEFAULT FALSE,
  days_present      INTEGER DEFAULT 90,
  total_school_days INTEGER DEFAULT 90,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 6. Marks & Assessments (UNEB + NCDC Continuous Assessment) ─────────────
CREATE TABLE IF NOT EXISTS marks (
  id               BIGSERIAL PRIMARY KEY,
  student_id       TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id       TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  -- UNEB Standard Term Marks
  bot              NUMERIC,
  mot              NUMERIC,
  eot              NUMERIC,
  bot1             NUMERIC,
  bot2             NUMERIC,
  mot1             NUMERIC,
  mot2             NUMERIC,
  eot1             NUMERIC,
  eot2             NUMERIC,
  -- NCDC Lower Secondary Continuous Assessment (AoI)
  aoi1             NUMERIC,
  aoi2             NUMERIC,
  aoi3             NUMERIC,
  summative        NUMERIC,
  formative_20     NUMERIC,
  comment          TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (student_id, subject_id)
);

-- ─── 7. Audit Logs ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id         TEXT PRIMARY KEY,
  timestamp  TIMESTAMPTZ DEFAULT NOW(),
  user_id    TEXT,
  user_name  TEXT,
  user_role  TEXT,
  category   TEXT,
  action     TEXT,
  details    TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 8. SMS & Notification Logs ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sms_logs (
  id           TEXT PRIMARY KEY,
  timestamp    TIMESTAMPTZ DEFAULT NOW(),
  student_id   TEXT,
  student_name TEXT,
  phone        TEXT,
  message      TEXT,
  status       TEXT DEFAULT 'SENT',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 9. High-Performance Multi-Tenant Indexes ───────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_school           ON users(school_id);
CREATE INDEX IF NOT EXISTS idx_classes_school         ON classes(school_id);
CREATE INDEX IF NOT EXISTS idx_subjects_school        ON subjects(school_id);
CREATE INDEX IF NOT EXISTS idx_students_school        ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_school_class  ON students(school_id, class_id);
CREATE INDEX IF NOT EXISTS idx_students_lin           ON students(lin);
CREATE INDEX IF NOT EXISTS idx_marks_student_subject  ON marks(student_id, subject_id);

-- ─── 10. Disable RLS for hybrid offline-first client architecture ───────────
ALTER TABLE schools    DISABLE ROW LEVEL SECURITY;
ALTER TABLE users      DISABLE ROW LEVEL SECURITY;
ALTER TABLE classes    DISABLE ROW LEVEL SECURITY;
ALTER TABLE subjects   DISABLE ROW LEVEL SECURITY;
ALTER TABLE students   DISABLE ROW LEVEL SECURITY;
ALTER TABLE marks      DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE sms_logs   DISABLE ROW LEVEL SECURITY;

