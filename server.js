import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient } from 'mongodb';
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
} from './src/utils/initialData.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, 'dist');

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// ─────────────────────────────────────────────────────────────────────────────
// MongoDB Connection Management
// ─────────────────────────────────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || '';
const DB_NAME = process.env.MONGODB_DB_NAME || 'mpumuza_analytics';

let mongoClient = null;
let db = null;
let isMongoConnected = false;

// In-memory fallback dataset (used if MongoDB URI is not provided or unreachable)
let memoryStore = {
  schools: [...INITIAL_SCHOOLS],
  users: [INITIAL_SUPER_ADMIN, ...INITIAL_USERS],
  classes: [...INITIAL_CLASSES],
  subjects: [...INITIAL_SUBJECTS],
  students: [...INITIAL_STUDENTS],
  marks: [...INITIAL_MARKS],
  audit_logs: [...INITIAL_AUDIT_LOGS],
  sms_logs: [...INITIAL_SMS_LOGS]
};

async function connectToMongo() {
  if (!MONGODB_URI) {
    console.log('[MongoDB] No MONGODB_URI provided. Running in high-performance memory fallback mode.');
    return;
  }

  try {
    console.log('[MongoDB] Connecting to MongoDB Atlas...');
    mongoClient = new MongoClient(MONGODB_URI, {
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    await mongoClient.connect();
    db = mongoClient.db(DB_NAME);
    isMongoConnected = true;
    console.log(`[MongoDB] ✓ Successfully connected to MongoDB database: "${DB_NAME}"`);

    // Ensure indexes for fast lookups & uniqueness
    await db.collection('schools').createIndex({ id: 1 }, { unique: true });
    await db.collection('users').createIndex({ id: 1 }, { unique: true });
    await db.collection('users').createIndex({ email: 1 });
    await db.collection('classes').createIndex({ id: 1 }, { unique: true });
    await db.collection('subjects').createIndex({ id: 1 }, { unique: true });
    await db.collection('students').createIndex({ id: 1 }, { unique: true });
    await db.collection('students').createIndex({ schoolId: 1 });
    await db.collection('students').createIndex({ lin: 1 });
    await db.collection('marks').createIndex({ studentId: 1, subjectId: 1 }, { unique: true });
    await db.collection('audit_logs').createIndex({ timestamp: -1 });
    await db.collection('sms_logs').createIndex({ timestamp: -1 });

    // Seed if empty
    const schoolsCount = await db.collection('schools').countDocuments();
    if (schoolsCount === 0) {
      console.log('[MongoDB] First-time setup detected. Seeding initial UNEB datasets...');
      await db.collection('schools').insertMany(INITIAL_SCHOOLS);
      await db.collection('users').insertMany([INITIAL_SUPER_ADMIN, ...INITIAL_USERS]);
      await db.collection('classes').insertMany(INITIAL_CLASSES);
      await db.collection('subjects').insertMany(INITIAL_SUBJECTS);
      await db.collection('students').insertMany(INITIAL_STUDENTS);
      await db.collection('marks').insertMany(INITIAL_MARKS);
      await db.collection('audit_logs').insertMany(INITIAL_AUDIT_LOGS);
      await db.collection('sms_logs').insertMany(INITIAL_SMS_LOGS);
      console.log('[MongoDB] ✓ Initial data seeded successfully.');
    }
  } catch (err) {
    isMongoConnected = false;
    console.warn('[MongoDB] Connection warning:', err.message);
    console.log('[MongoDB] Falling back to memory mode for uninterrupted service.');
  }
}

connectToMongo();

// ─────────────────────────────────────────────────────────────────────────────
// REST API Endpoints
// ─────────────────────────────────────────────────────────────────────────────

// Healthcheck & System Status
app.get('/healthz', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: isMongoConnected ? 'MongoDB' : 'Memory_Fallback',
    connected: isMongoConnected
  });
});

app.get('/api/status', (req, res) => {
  res.json({
    database: isMongoConnected ? 'MongoDB' : 'Memory_Fallback',
    connected: isMongoConnected,
    hasMongoUri: Boolean(MONGODB_URI)
  });
});

// 1. Schools CRUD
app.get('/api/schools', async (req, res) => {
  try {
    if (isMongoConnected && db) {
      const data = await db.collection('schools').find({}).toArray();
      return res.json(data.map(({ _id, ...rest }) => rest));
    }
    res.json(memoryStore.schools);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/schools', async (req, res) => {
  try {
    const school = req.body;
    if (!school.id) return res.status(400).json({ error: 'School ID required' });

    if (isMongoConnected && db) {
      await db.collection('schools').updateOne(
        { id: school.id },
        { $set: school },
        { upsert: true }
      );
      return res.json({ success: true, school });
    }

    const idx = memoryStore.schools.findIndex(s => s.id === school.id);
    if (idx >= 0) memoryStore.schools[idx] = school;
    else memoryStore.schools.push(school);

    res.json({ success: true, school });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/schools/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected && db) {
      await db.collection('schools').deleteOne({ id });
      await db.collection('users').deleteMany({ schoolId: id });
      await db.collection('classes').deleteMany({ schoolId: id });
      await db.collection('subjects').deleteMany({ schoolId: id });
      await db.collection('students').deleteMany({ schoolId: id });
      return res.json({ success: true });
    }

    memoryStore.schools = memoryStore.schools.filter(s => s.id !== id);
    memoryStore.users = memoryStore.users.filter(u => u.schoolId !== id);
    memoryStore.classes = memoryStore.classes.filter(c => c.schoolId !== id);
    memoryStore.subjects = memoryStore.subjects.filter(s => s.schoolId !== id);
    memoryStore.students = memoryStore.students.filter(s => s.schoolId !== id);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Users CRUD
app.get('/api/users', async (req, res) => {
  try {
    if (isMongoConnected && db) {
      const data = await db.collection('users').find({}).toArray();
      return res.json(data.map(({ _id, ...rest }) => rest));
    }
    res.json(memoryStore.users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const user = req.body;
    if (!user.id) return res.status(400).json({ error: 'User ID required' });

    if (isMongoConnected && db) {
      await db.collection('users').updateOne(
        { id: user.id },
        { $set: user },
        { upsert: true }
      );
      return res.json({ success: true, user });
    }

    const idx = memoryStore.users.findIndex(u => u.id === user.id);
    if (idx >= 0) memoryStore.users[idx] = user;
    else memoryStore.users.push(user);

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected && db) {
      await db.collection('users').deleteOne({ id });
      return res.json({ success: true });
    }
    memoryStore.users = memoryStore.users.filter(u => u.id !== id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Classes CRUD
app.get('/api/classes', async (req, res) => {
  try {
    if (isMongoConnected && db) {
      const data = await db.collection('classes').find({}).toArray();
      return res.json(data.map(({ _id, ...rest }) => rest));
    }
    res.json(memoryStore.classes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/classes', async (req, res) => {
  try {
    const cls = req.body;
    if (!cls.id) return res.status(400).json({ error: 'Class ID required' });

    if (isMongoConnected && db) {
      await db.collection('classes').updateOne(
        { id: cls.id },
        { $set: cls },
        { upsert: true }
      );
      return res.json({ success: true, class: cls });
    }

    const idx = memoryStore.classes.findIndex(c => c.id === cls.id);
    if (idx >= 0) memoryStore.classes[idx] = cls;
    else memoryStore.classes.push(cls);

    res.json({ success: true, class: cls });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/classes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected && db) {
      await db.collection('classes').deleteOne({ id });
      return res.json({ success: true });
    }
    memoryStore.classes = memoryStore.classes.filter(c => c.id !== id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Subjects CRUD
app.get('/api/subjects', async (req, res) => {
  try {
    if (isMongoConnected && db) {
      const data = await db.collection('subjects').find({}).toArray();
      return res.json(data.map(({ _id, ...rest }) => rest));
    }
    res.json(memoryStore.subjects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/subjects', async (req, res) => {
  try {
    const sub = req.body;
    if (!sub.id) return res.status(400).json({ error: 'Subject ID required' });

    if (isMongoConnected && db) {
      await db.collection('subjects').updateOne(
        { id: sub.id },
        { $set: sub },
        { upsert: true }
      );
      return res.json({ success: true, subject: sub });
    }

    const idx = memoryStore.subjects.findIndex(s => s.id === sub.id);
    if (idx >= 0) memoryStore.subjects[idx] = sub;
    else memoryStore.subjects.push(sub);

    res.json({ success: true, subject: sub });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/subjects/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected && db) {
      await db.collection('subjects').deleteOne({ id });
      return res.json({ success: true });
    }
    memoryStore.subjects = memoryStore.subjects.filter(s => s.id !== id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Students CRUD & Bulk Import
app.get('/api/students', async (req, res) => {
  try {
    if (isMongoConnected && db) {
      const data = await db.collection('students').find({}).toArray();
      return res.json(data.map(({ _id, ...rest }) => rest));
    }
    res.json(memoryStore.students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/students', async (req, res) => {
  try {
    const student = req.body;
    if (!student.id) return res.status(400).json({ error: 'Student ID required' });

    if (isMongoConnected && db) {
      await db.collection('students').updateOne(
        { id: student.id },
        { $set: student },
        { upsert: true }
      );
      return res.json({ success: true, student });
    }

    const idx = memoryStore.students.findIndex(s => s.id === student.id);
    if (idx >= 0) memoryStore.students[idx] = student;
    else memoryStore.students.push(student);

    res.json({ success: true, student });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/students/bulk', async (req, res) => {
  try {
    const students = req.body;
    if (!Array.isArray(students) || students.length === 0) {
      return res.json({ success: true, count: 0 });
    }

    if (isMongoConnected && db) {
      const ops = students.map(st => ({
        updateOne: {
          filter: { id: st.id },
          update: { $set: st },
          upsert: true
        }
      }));
      await db.collection('students').bulkWrite(ops);
      return res.json({ success: true, count: students.length });
    }

    students.forEach(st => {
      const idx = memoryStore.students.findIndex(s => s.id === st.id);
      if (idx >= 0) memoryStore.students[idx] = st;
      else memoryStore.students.push(st);
    });

    res.json({ success: true, count: students.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isMongoConnected && db) {
      await db.collection('students').deleteOne({ id });
      await db.collection('marks').deleteMany({ studentId: id });
      return res.json({ success: true });
    }
    memoryStore.students = memoryStore.students.filter(s => s.id !== id);
    memoryStore.marks = memoryStore.marks.filter(m => m.studentId !== id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/students/by-school/:schoolId', async (req, res) => {
  try {
    const { schoolId } = req.params;
    if (isMongoConnected && db) {
      await db.collection('students').deleteMany({ schoolId });
      return res.json({ success: true });
    }
    memoryStore.students = memoryStore.students.filter(s => s.schoolId !== schoolId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Marks CRUD & Batch Save
app.get('/api/marks', async (req, res) => {
  try {
    if (isMongoConnected && db) {
      const data = await db.collection('marks').find({}).toArray();
      return res.json(data.map(({ _id, ...rest }) => rest));
    }
    res.json(memoryStore.marks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/marks', async (req, res) => {
  try {
    const mark = req.body;
    if (!mark.studentId || !mark.subjectId) {
      return res.status(400).json({ error: 'Student ID and Subject ID required' });
    }

    if (isMongoConnected && db) {
      await db.collection('marks').updateOne(
        { studentId: mark.studentId, subjectId: mark.subjectId },
        { $set: mark },
        { upsert: true }
      );
      return res.json({ success: true, mark });
    }

    const idx = memoryStore.marks.findIndex(
      m => m.studentId === mark.studentId && m.subjectId === mark.subjectId
    );
    if (idx >= 0) memoryStore.marks[idx] = mark;
    else memoryStore.marks.push(mark);

    res.json({ success: true, mark });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/marks/batch', async (req, res) => {
  try {
    const marksList = req.body;
    if (!Array.isArray(marksList) || marksList.length === 0) {
      return res.json({ success: true, count: 0 });
    }

    if (isMongoConnected && db) {
      const ops = marksList.map(m => ({
        updateOne: {
          filter: { studentId: m.studentId, subjectId: m.subjectId },
          update: { $set: m },
          upsert: true
        }
      }));
      await db.collection('marks').bulkWrite(ops);
      return res.json({ success: true, count: marksList.length });
    }

    marksList.forEach(m => {
      const idx = memoryStore.marks.findIndex(
        item => item.studentId === m.studentId && item.subjectId === m.subjectId
      );
      if (idx >= 0) memoryStore.marks[idx] = m;
      else memoryStore.marks.push(m);
    });

    res.json({ success: true, count: marksList.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Audit Logs
app.get('/api/audit-logs', async (req, res) => {
  try {
    if (isMongoConnected && db) {
      const data = await db.collection('audit_logs').find({}).sort({ timestamp: -1 }).limit(500).toArray();
      return res.json(data.map(({ _id, ...rest }) => rest));
    }
    res.json(memoryStore.audit_logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/audit-logs', async (req, res) => {
  try {
    const log = req.body;
    if (isMongoConnected && db) {
      await db.collection('audit_logs').insertOne(log);
      return res.json({ success: true });
    }
    memoryStore.audit_logs.unshift(log);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. SMS Logs
app.get('/api/sms-logs', async (req, res) => {
  try {
    if (isMongoConnected && db) {
      const data = await db.collection('sms_logs').find({}).sort({ timestamp: -1 }).toArray();
      return res.json(data.map(({ _id, ...rest }) => rest));
    }
    res.json(memoryStore.sms_logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/sms-logs', async (req, res) => {
  try {
    const logs = req.body;
    if (!logs) return res.json({ success: true });
    const logList = Array.isArray(logs) ? logs : [logs];

    if (isMongoConnected && db) {
      await db.collection('sms_logs').insertMany(logList);
      return res.json({ success: true });
    }
    memoryStore.sms_logs.unshift(...logList);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Frontend Static Assets & SPA Routing
// ─────────────────────────────────────────────────────────────────────────────
app.use(express.static(distPath));

app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Mpumuza Analytics server running on port ${PORT}`);
});
