/**
 * Seed Dataset for Mpumuza Analytics Multitenant Ugandan School Report System
 */

export const INITIAL_SUPER_ADMIN = {
  id: 'user-superadmin-01',
  email: 'admin@mpumuza.ug',
  password: 'Adallyn2290',
  name: 'Mpumuza Analytics Super Admin',
  role: 'SUPER_ADMIN'
};

export const INITIAL_SCHOOLS = [
  {
    id: 'school-primary-01',
    name: 'Kampala Parents Primary School',
    slug: 'kps-primary',
    levelType: 'PRIMARY', // Primary School (PLE)
    motto: 'We Strive for Academic Excellence & Discipline',
    address: 'Plot 14/16 Naguru Road, Kampala',
    contactPhone: '+256 414 220011',
    contactEmail: 'admin@kps.ac.ug',
    headTeacher: 'Mrs. Daphine Kato',
    headTeacherSignature: 'Daphine Kato (Headteacher)',
    dosName: 'Tr. Mark Ssemwanga',
    dosSignature: 'Mark Ssemwanga (DOS)',
    themeColor: 'emerald', // emerald, amber, navy, purple
    badgeUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=200&q=80',
    botWeight: 20,
    motWeight: 20,
    eotWeight: 60,
    useNewCurriculum: false,
    showPositionRanking: true,
    subscriptionStatus: 'ACTIVE', // ACTIVE, TRIAL, PAST_DUE, SUSPENDED
    billingPlan: 'PER_STUDENT_TERM',
    studentRateUGX: 1500,
    active: true
  },
  {
    id: 'school-secondary-02',
    name: "St. Mary's College Kitende (Secondary)",
    slug: 'smack-kitende',
    levelType: 'SECONDARY', // Secondary School (O-Level & A-Level)
    motto: 'Education for Light, Faith and Character',
    address: 'Entebbe Expressway Road, Wakiso District',
    contactPhone: '+256 772 990011',
    contactEmail: 'admin@kitende.edu.ug',
    headTeacher: 'Bro. Jude Mukasa',
    headTeacherSignature: 'Bro. Jude Mukasa (Headteacher)',
    dosName: 'Mr. Aloysius Kalanzi',
    dosSignature: 'Aloysius Kalanzi (DOS)',
    themeColor: 'navy',
    badgeUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=200&q=80',
    botWeight: 20,
    motWeight: 20,
    eotWeight: 60,
    useNewCurriculum: false,
    showPositionRanking: false, // NCDC Competency Curriculum discourages strict ranking
    subscriptionStatus: 'ACTIVE',
    billingPlan: 'PER_STUDENT_TERM',
    studentRateUGX: 1500,
    active: true
  },
  {
    id: 'school-secondary-03',
    name: 'Mengo Senior School (Secondary)',
    slug: 'mengo-ss',
    levelType: 'SECONDARY', // Secondary School (O-Level & A-Level)
    motto: 'Look Forward with Faith and Perseverance',
    address: 'Mengo Hill, Kampala Central',
    contactPhone: '+256 414 987654',
    contactEmail: 'info@mengoss.ac.ug',
    headTeacher: 'Grace Ssebugwawo',
    headTeacherSignature: 'Grace Ssebugwawo (Headteacher)',
    dosName: 'Tr. Ronald Lule',
    dosSignature: 'Ronald Lule (DOS)',
    themeColor: 'emerald',
    badgeUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=200&q=80',
    botWeight: 20,
    motWeight: 20,
    eotWeight: 60,
    useNewCurriculum: false,
    showPositionRanking: true,
    subscriptionStatus: 'ACTIVE',
    billingPlan: 'PER_STUDENT_TERM',
    studentRateUGX: 1500,
    active: true
  }
];

export const INITIAL_USERS = [
  // Super Admin
  INITIAL_SUPER_ADMIN,

  // School Admins
  {
    id: 'user-admin-kps',
    schoolId: 'school-primary-01',
    email: 'admin.kps@uneb.go.ug',
    password: 'admin123',
    name: 'Samuel Mugisha (Admin KPS)',
    role: 'SCHOOL_ADMIN'
  },
  {
    id: 'user-admin-kitende',
    schoolId: 'school-secondary-02',
    email: 'admin.kitende@uneb.go.ug',
    password: 'admin123',
    name: 'Sr. Clare Nsubuga (Admin Kitende Secondary)',
    role: 'SCHOOL_ADMIN'
  },
  {
    id: 'user-admin-mengo',
    schoolId: 'school-secondary-03',
    email: 'admin.mengo@uneb.go.ug',
    password: 'admin123',
    name: 'David Kasule (Admin Mengo Secondary)',
    role: 'SCHOOL_ADMIN'
  },

  // Teachers
  {
    id: 'user-teacher-01',
    schoolId: 'school-secondary-02',
    email: 'tr.mukasa@kitende.edu.ug',
    password: 'teacher123',
    name: 'Tr. Peter Mukasa',
    role: 'TEACHER',
    assignedClasses: [
      { classId: 'cls-s3', streamId: 'stm-north', subjectId: 'sub-phy-535' },
      { classId: 'cls-s6-kitende', streamId: 'Sciences', subjectId: 'sub-kitende-a-phy' }
    ]
  },
  {
    id: 'user-teacher-02',
    schoolId: 'school-primary-01',
    email: 'tr.nambasa@kps.ac.ug',
    password: 'teacher123',
    name: 'Tr. Rose Nambasa',
    role: 'TEACHER',
    assignedClasses: [
      { classId: 'cls-p7', streamId: 'stm-blue', subjectId: 'sub-p7-eng' },
      { classId: 'cls-p7', streamId: 'stm-blue', subjectId: 'sub-p7-mtc' }
    ]
  },
  {
    id: 'user-teacher-03',
    schoolId: 'school-secondary-03',
    email: 'tr.kiggundu@mengoss.ac.ug',
    password: 'teacher123',
    name: 'Tr. Joseph Kiggundu',
    role: 'TEACHER',
    assignedClasses: [
      { classId: 'cls-s4', streamId: 'stm-south', subjectId: 'sub-mat-456' },
      { classId: 'cls-s6', streamId: 'Sciences', subjectId: 'sub-a-mat' }
    ]
  }
];

export const INITIAL_CLASSES = [
  // Primary School KPS (P.1 - P.7)
  { id: 'cls-p5', schoolId: 'school-primary-01', name: 'P.5', level: 'Primary', streams: ['Blue', 'Red'] },
  { id: 'cls-p6', schoolId: 'school-primary-01', name: 'P.6', level: 'Primary', streams: ['Blue', 'Red'] },
  { id: 'cls-p7', schoolId: 'school-primary-01', name: 'P.7', level: 'Primary', streams: ['Blue', 'Red'] },

  // Secondary School Kitende (O-Level S.1 - S.4 AND A-Level S.5 - S.6)
  { id: 'cls-s1', schoolId: 'school-secondary-02', name: 'S.1', level: 'O-Level', streams: ['North', 'South'] },
  { id: 'cls-s2', schoolId: 'school-secondary-02', name: 'S.2', level: 'O-Level', streams: ['North', 'South'] },
  { id: 'cls-s3', schoolId: 'school-secondary-02', name: 'S.3', level: 'O-Level', streams: ['North', 'South'] },
  { id: 'cls-s4', schoolId: 'school-secondary-02', name: 'S.4', level: 'O-Level', streams: ['North', 'South'] },
  { id: 'cls-s5-kitende', schoolId: 'school-secondary-02', name: 'S.5', level: 'A-Level', streams: ['Sciences', 'Arts'] },
  { id: 'cls-s6-kitende', schoolId: 'school-secondary-02', name: 'S.6', level: 'A-Level', streams: ['Sciences', 'Arts'] },

  // Secondary School Mengo (O-Level S.1 - S.4 AND A-Level S.5 - S.6)
  { id: 'cls-mengo-s4', schoolId: 'school-secondary-03', name: 'S.4', level: 'O-Level', streams: ['East', 'West'] },
  { id: 'cls-s5', schoolId: 'school-secondary-03', name: 'S.5', level: 'A-Level', streams: ['Sciences', 'Arts'] },
  { id: 'cls-s6', schoolId: 'school-secondary-03', name: 'S.6', level: 'A-Level', streams: ['Sciences', 'Arts'] }
];

export const INITIAL_SUBJECTS = [
  // Primary (PLE)
  { id: 'sub-p7-eng', schoolId: 'school-primary-01', code: 'ENG-01', name: 'English Language', core: true, isSubsidiary: false, category: 'Primary' },
  { id: 'sub-p7-mtc', schoolId: 'school-primary-01', code: 'MTC-02', name: 'Mathematics', core: true, isSubsidiary: false, category: 'Primary' },
  { id: 'sub-p7-sci', schoolId: 'school-primary-01', code: 'SCI-03', name: 'Basic Science', core: true, isSubsidiary: false, category: 'Primary' },
  { id: 'sub-p7-sst', schoolId: 'school-primary-01', code: 'SST-04', name: 'Social Studies & RE', core: true, isSubsidiary: false, category: 'Primary' },

  // Secondary Kitende (O-Level UCE & A-Level UACE)
  { id: 'sub-phy-535', schoolId: 'school-secondary-02', code: '535', name: 'Physics (O-Level)', core: true, isSubsidiary: false, category: 'O-Level' },
  { id: 'sub-chm-545', schoolId: 'school-secondary-02', code: '545', name: 'Chemistry (O-Level)', core: true, isSubsidiary: false, category: 'O-Level' },
  { id: 'sub-bio-553', schoolId: 'school-secondary-02', code: '553', name: 'Biology (O-Level)', core: true, isSubsidiary: false, category: 'O-Level' },
  { id: 'sub-mat-456', schoolId: 'school-secondary-02', code: '456', name: 'Mathematics (O-Level)', core: true, isSubsidiary: false, category: 'O-Level' },
  { id: 'sub-eng-112', schoolId: 'school-secondary-02', code: '112', name: 'English Language (O-Level)', core: true, isSubsidiary: false, category: 'O-Level' },
  { id: 'sub-his-241', schoolId: 'school-secondary-02', code: '241', name: 'History (O-Level)', core: true, isSubsidiary: false, category: 'O-Level' },
  { id: 'sub-geo-273', schoolId: 'school-secondary-02', code: '273', name: 'Geography (O-Level)', core: true, isSubsidiary: false, category: 'O-Level' },
  { id: 'sub-ent-845', schoolId: 'school-secondary-02', code: '845', name: 'Entrepreneurship (O-Level)', core: false, isSubsidiary: false, category: 'O-Level' },
  
  // A-Level Subjects in Kitende Secondary (Principal subjects have 2 papers entered under BOT/MOT/EOT; GP and Submath are single)
  { id: 'sub-kitende-a-phy', schoolId: 'school-secondary-02', code: 'P510', name: 'Physics (Principal A-Level)', core: true, isSubsidiary: false, category: 'A-Level' },
  { id: 'sub-kitende-a-chm', schoolId: 'school-secondary-02', code: 'P525', name: 'Chemistry (Principal A-Level)', core: true, isSubsidiary: false, category: 'A-Level' },
  { id: 'sub-kitende-a-mat', schoolId: 'school-secondary-02', code: 'P425', name: 'Mathematics (Principal A-Level)', core: true, isSubsidiary: false, category: 'A-Level' },
  { id: 'sub-kitende-a-gp', schoolId: 'school-secondary-02', code: 'S101', name: 'General Paper (GP)', core: false, isSubsidiary: true, category: 'A-Level' },
  { id: 'sub-kitende-a-submath', schoolId: 'school-secondary-02', code: 'S475', name: 'Subsidiary Mathematics (Submath)', core: false, isSubsidiary: true, category: 'A-Level' },
  { id: 'sub-kitende-a-subict', schoolId: 'school-secondary-02', code: 'S843', name: 'Subsidiary ICT', core: false, isSubsidiary: true, category: 'A-Level' },

  // Secondary Mengo A-Level Subjects
  { id: 'sub-a-phy', schoolId: 'school-secondary-03', code: 'P510', name: 'Physics (Principal A-Level)', core: true, isSubsidiary: false, category: 'A-Level' },
  { id: 'sub-a-chm', schoolId: 'school-secondary-03', code: 'P525', name: 'Chemistry (Principal A-Level)', core: true, isSubsidiary: false, category: 'A-Level' },
  { id: 'sub-a-mat', schoolId: 'school-secondary-03', code: 'P425', name: 'Mathematics (Principal A-Level)', core: true, isSubsidiary: false, category: 'A-Level' },
  { id: 'sub-a-bio', schoolId: 'school-secondary-03', code: 'P530', name: 'Biology (Principal A-Level)', core: true, isSubsidiary: false, category: 'A-Level' },
  { id: 'sub-a-gp', schoolId: 'school-secondary-03', code: 'S101', name: 'General Paper (GP)', core: false, isSubsidiary: true, category: 'A-Level' },
  { id: 'sub-a-submath', schoolId: 'school-secondary-03', code: 'S475', name: 'Subsidiary Mathematics (Submath)', core: false, isSubsidiary: true, category: 'A-Level' },
  { id: 'sub-a-subict', schoolId: 'school-secondary-03', code: 'S843', name: 'Subsidiary ICT', core: false, isSubsidiary: true, category: 'A-Level' }
];

export const INITIAL_STUDENTS = [
  // Primary P.7
  {
    id: 'std-p7-01',
    schoolId: 'school-primary-01',
    lin: 'LIN-2026-P01',
    name: 'Okello David',
    gender: 'M',
    classId: 'cls-p7',
    stream: 'Blue',
    parentPhone: '0772123456',
    parentPin: '1234',
    house: 'Lwanga',
    feeRequiredUGX: 850000,
    feePaidUGX: 850000,
    feeBalanceUGX: 0,
    feeOverride: false,
    daysPresent: 88,
    totalSchoolDays: 90
  },
  {
    id: 'std-p7-02',
    schoolId: 'school-primary-01',
    lin: 'LIN-2026-P02',
    name: 'Namazzi Sarah',
    gender: 'F',
    classId: 'cls-p7',
    stream: 'Blue',
    parentPhone: '0752987654',
    parentPin: '1234',
    house: 'Mutesa',
    feeRequiredUGX: 850000,
    feePaidUGX: 550000,
    feeBalanceUGX: 300000,
    feeOverride: false, // Locked due to balance
    daysPresent: 85,
    totalSchoolDays: 90
  },

  // Secondary Kitende: O-Level Students (S.4)
  {
    id: 'std-s4-01',
    schoolId: 'school-secondary-02',
    lin: 'LIN-2026-S01',
    name: 'Kateregga Paul',
    gender: 'M',
    classId: 'cls-s4',
    stream: 'South',
    parentPhone: '0782334455',
    parentPin: '1234',
    house: 'Kiwanuka',
    feeRequiredUGX: 1450000,
    feePaidUGX: 1450000,
    feeBalanceUGX: 0,
    feeOverride: false,
    daysPresent: 89,
    totalSchoolDays: 90
  },
  {
    id: 'std-s4-02',
    schoolId: 'school-secondary-02',
    lin: 'LIN-2026-S02',
    name: 'Apio Christine',
    gender: 'F',
    classId: 'cls-s4',
    stream: 'South',
    parentPhone: '0774556677',
    parentPin: '1234',
    house: 'Bikira',
    feeRequiredUGX: 1450000,
    feePaidUGX: 1000000,
    feeBalanceUGX: 450000,
    feeOverride: true, // Overridden by Headteacher clearance
    daysPresent: 87,
    totalSchoolDays: 90
  },

  // Secondary Kitende: A-Level Student (S.6)
  {
    id: 'std-kitende-s6-01',
    schoolId: 'school-secondary-02',
    lin: 'LIN-2026-A05',
    name: 'Kato Dennis',
    gender: 'M',
    classId: 'cls-s6-kitende',
    stream: 'Sciences',
    combination: 'PCM / ICT',
    parentPhone: '0772001122',
    parentPin: '1234',
    house: 'Kiwanuka',
    feeRequiredUGX: 1650000,
    feePaidUGX: 1650000,
    feeBalanceUGX: 0,
    feeOverride: false,
    daysPresent: 90,
    totalSchoolDays: 90
  },

  // Secondary Mengo: A-Level Student (S.6)
  {
    id: 'std-s6-01',
    schoolId: 'school-secondary-03',
    lin: 'LIN-2026-A01',
    name: 'Mugisha Ronald',
    gender: 'M',
    classId: 'cls-s6',
    stream: 'Sciences',
    combination: 'BCM / GP',
    parentPhone: '0772445566',
    parentPin: '1234',
    house: 'Speke',
    feeRequiredUGX: 1350000,
    feePaidUGX: 1350000,
    feeBalanceUGX: 0,
    feeOverride: false,
    daysPresent: 88,
    totalSchoolDays: 90
  }
];

export const INITIAL_MARKS = [
  // Okello David (P.7 Primary)
  { studentId: 'std-p7-01', subjectId: 'sub-p7-eng', bot: 82, mot: 85, eot: 88, comment: 'Excellent command of English grammar.' },
  { studentId: 'std-p7-01', subjectId: 'sub-p7-mtc', bot: 78, mot: 80, eot: 84, comment: 'Strong mathematical reasoning.' },
  { studentId: 'std-p7-01', subjectId: 'sub-p7-sci', bot: 85, mot: 88, eot: 90, comment: 'Outstanding in practical science.' },
  { studentId: 'std-p7-01', subjectId: 'sub-p7-sst', bot: 76, mot: 79, eot: 82, comment: 'Good knowledge of social issues.' },

  // Kateregga Paul (S.4 O-Level Kitende Secondary)
  { studentId: 'std-s4-01', subjectId: 'sub-phy-535', bot: 80, mot: 82, eot: 86, comment: 'Mastered physics mechanics.' },
  { studentId: 'std-s4-01', subjectId: 'sub-chm-545', bot: 74, mot: 76, eot: 80, comment: 'Good organic chemistry knowledge.' },
  { studentId: 'std-s4-01', subjectId: 'sub-bio-553', bot: 78, mot: 80, eot: 83, comment: 'Detailed biological diagrams.' },
  { studentId: 'std-s4-01', subjectId: 'sub-mat-456', bot: 85, mot: 88, eot: 92, comment: 'Exceptional in trigonometry.' },
  { studentId: 'std-s4-01', subjectId: 'sub-eng-112', bot: 70, mot: 72, eot: 75, comment: 'Clear essay writing.' },
  { studentId: 'std-s4-01', subjectId: 'sub-his-241', bot: 72, mot: 74, eot: 78, comment: 'Good historical analysis.' },
  { studentId: 'std-s4-01', subjectId: 'sub-geo-273', bot: 76, mot: 78, eot: 80, comment: 'Accurate mapwork interpretation.' },
  { studentId: 'std-s4-01', subjectId: 'sub-ent-845', bot: 82, mot: 84, eot: 88, comment: 'Innovative business concept.' },

  // Kato Dennis (S.6 A-Level Kitende Secondary - Combination: PCM / ICT)
  { studentId: 'std-kitende-s6-01', subjectId: 'sub-kitende-a-phy', bot1: 82, bot2: 86, bot: 84, mot1: 85, mot2: 87, mot: 86, eot1: 88, eot2: 92, eot: 90, comment: 'Strong performance across Paper 1 and Paper 2.' },
  { studentId: 'std-kitende-s6-01', subjectId: 'sub-kitende-a-mat', bot1: 88, bot2: 85, bot: 86.5, mot1: 90, mot2: 88, mot: 89, eot1: 95, eot2: 90, eot: 92.5, comment: 'Top score in pure mathematics & numericals.' },
  { studentId: 'std-kitende-s6-01', subjectId: 'sub-kitende-a-chm', bot1: 78, bot2: 80, bot: 79, mot1: 82, mot2: 84, mot: 83, eot1: 85, eot2: 86, eot: 85.5, comment: 'Good physical chemistry and volumetric practical.' },
  { studentId: 'std-kitende-s6-01', subjectId: 'sub-kitende-a-gp', bot: 70, mot: 74, eot: 76, comment: 'Well researched general paper essays.' },
  { studentId: 'std-kitende-s6-01', subjectId: 'sub-kitende-a-subict', bot1: 84, bot2: 86, bot: 85, mot1: 87, mot2: 89, mot: 88, eot1: 90, eot2: 94, eot: 92, comment: 'Great practical ICT skills across Paper 1 and 2.' },

  // Ronald Mugisha (S.6 A-Level Mengo Secondary - Combination: BCM / GP)
  { studentId: 'std-s6-01', subjectId: 'sub-a-bio', bot1: 80, bot2: 82, bot: 81, mot1: 83, mot2: 85, mot: 84, eot1: 87, eot2: 89, eot: 88, comment: 'Excellent biology theory and practicals.' },
  { studentId: 'std-s6-01', subjectId: 'sub-a-chm', bot1: 75, bot2: 77, bot: 76, mot1: 78, mot2: 80, mot: 79, eot1: 82, eot2: 84, eot: 83, comment: 'Solid organic & inorganic chemistry.' },
  { studentId: 'std-s6-01', subjectId: 'sub-a-mat', bot1: 72, bot2: 70, bot: 71, mot1: 75, mot2: 74, mot: 74.5, eot1: 78, eot2: 76, eot: 77, comment: 'Good pure math & statistics.' },
  { studentId: 'std-s6-01', subjectId: 'sub-a-gp', bot: 68, mot: 72, eot: 74, comment: 'Good analysis of contemporary issues.' }
];

export const INITIAL_AUDIT_LOGS = [
  {
    id: 'log-01',
    timestamp: new Date().toISOString(),
    userId: 'user-admin-kitende',
    userName: 'Sr. Clare Nsubuga',
    userRole: 'SCHOOL_ADMIN',
    category: 'FEE_CLEARANCE',
    action: 'ADMIN_OVERRIDE_FEE_RELEASE',
    details: 'Released report card for Apio Christine (LIN-2026-S02) despite fee balance UGX 450,000'
  },
  {
    id: 'log-02',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    userId: 'user-teacher-01',
    userName: 'Tr. Peter Mukasa',
    userRole: 'TEACHER',
    category: 'MARK_SHEET',
    action: 'UPDATE_MARKS',
    details: 'Updated End of Term (EOT) Physics scores for S.4 South'
  }
];

export const INITIAL_SMS_LOGS = [];
