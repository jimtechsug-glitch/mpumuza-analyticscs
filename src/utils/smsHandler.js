/**
 * Africa's Talking SMS Gateway Integration Simulator for Mpumuza Analytics
 * Supports rich template variables, GSM-7 character counting, and multi-SMS parts
 */

// ============================================================
// TEMPLATE DEFINITIONS
// ============================================================

export const SMS_TEMPLATES = {
  RESULTS: {
    id: 'RESULTS',
    label: 'End of Term Academic Results',
    template: 'Dear Parent, {{STUDENT_NAME}} ({{LIN}}) End of {{TERM}} results at {{SCHOOL_SHORT}}: {{SUMMARY}}. {{FEE_STATUS}}. Portal: mpumuza.ac.ug/p/{{LIN}}',
    variables: ['STUDENT_NAME', 'LIN', 'TERM', 'SCHOOL_SHORT', 'SUMMARY', 'FEE_STATUS']
  },
  FEE_ALERT: {
    id: 'FEE_ALERT',
    label: 'Fee Balance Reminder',
    template: '[{{SCHOOL_SHORT}}] FEES REMINDER: {{STUDENT_NAME}} ({{CLASS}}) has an outstanding balance of UGX {{FEE_BALANCE}}. Please clear by {{DUE_DATE}} to avoid disruption. Call {{SCHOOL_PHONE}} for inquiries.',
    variables: ['SCHOOL_SHORT', 'STUDENT_NAME', 'CLASS', 'FEE_BALANCE', 'DUE_DATE', 'SCHOOL_PHONE']
  },
  GENERAL: {
    id: 'GENERAL',
    label: 'General School Announcement',
    template: '[{{SCHOOL_SHORT}}] Dear Parent of {{STUDENT_NAME}}, {{MESSAGE}}. For inquiries call {{SCHOOL_PHONE}}. - {{SCHOOL_SHORT}} Administration.',
    variables: ['SCHOOL_SHORT', 'STUDENT_NAME', 'MESSAGE', 'SCHOOL_PHONE']
  }
};

// ============================================================
// CHARACTER COUNTING (GSM-7 and Unicode detection)
// ============================================================

const GSM7_CHARS = '@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !"#¤%&\'()*+,-./:;<=>?ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzÄÖÑÜ§¿äöñüà0123456789';
const GSM7_CHARSET = new Set([...GSM7_CHARS]);

/**
 * Analyse a message: GSM-7 or Unicode? Returns char count and parts count.
 */
export function analyseSMS(message) {
  let isUnicode = false;
  for (const ch of message) {
    if (!GSM7_CHARSET.has(ch)) { isUnicode = true; break; }
  }
  const charCount = message.length;
  const singleLimit = isUnicode ? 70 : 160;
  const multiLimit  = isUnicode ? 67 : 153;
  const parts = charCount <= singleLimit ? 1 : Math.ceil(charCount / multiLimit);
  const remainingInPart = parts === 1
    ? singleLimit - charCount
    : multiLimit - ((charCount - 1) % multiLimit) - 1;

  return { charCount, parts, isUnicode, singleLimit, multiLimit, remainingInPart };
}

// ============================================================
// TEMPLATE ENGINE
// ============================================================

/**
 * Substitute {{VARIABLE}} placeholders in a template string.
 */
export function renderSMSTemplate(template, vars = {}) {
  return template.replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

/**
 * Build result summary text for a student from their marks.
 */
export function buildResultSummary(student, term, marks = [], schoolLevel = 'O_LEVEL') {
  const studentMarks = marks.filter(m => m.studentId === student.id && m.term === term);
  if (studentMarks.length === 0) return 'Results not yet available';

  const scores = studentMarks.map(m => m.finalScore ?? m.eotScore ?? 0).filter(s => s > 0);
  if (scores.length === 0) return 'Marks pending entry';

  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

  if (schoolLevel === 'A_LEVEL') {
    const agg = studentMarks.reduce((sum, m) => sum + (m.points ?? 0), 0);
    return `Agg: ${agg}pts. Avg: ${avg}%`;
  } else if (schoolLevel === 'PRIMARY') {
    const total = scores.reduce((a, b) => a + b, 0);
    return `Total: ${total}. Avg: ${avg}%`;
  } else {
    const agg = studentMarks.reduce((sum, m) => sum + (m.points ?? 0), 0);
    const div = agg <= 8 ? 'D1' : agg <= 14 ? 'D2' : agg <= 20 ? 'D3' : agg <= 27 ? 'D4' : 'Fail';
    return `Agg: ${agg} (${div}). Avg: ${avg}%`;
  }
}

/**
 * Build a RESULTS SMS for one student.
 */
export function buildResultsSMS(student, school, term, marks) {
  const schoolLevel = school.levelType === 'PRIMARY' ? 'PRIMARY' : 'O_LEVEL';
  const summary = buildResultSummary(student, term, marks, schoolLevel);
  const feeBalance = student.feeBalance ?? 0;
  const feeStatus = feeBalance > 0
    ? `Fee Bal: UGX ${Number(feeBalance).toLocaleString()}`
    : 'Fees: Cleared';

  return renderSMSTemplate(SMS_TEMPLATES.RESULTS.template, {
    STUDENT_NAME: student.name ?? 'Student',
    LIN: student.lin ?? student.id,
    TERM: term,
    SCHOOL_SHORT: (school.name ?? 'School').substring(0, 18),
    SUMMARY: summary,
    FEE_STATUS: feeStatus
  });
}

// ============================================================
// LEGACY COMPAT
// ============================================================

export function formatResultSMS(studentName, lin, schoolName, term, summaryText, feeBalance) {
  const formattedBalance = feeBalance > 0
    ? `Fee Bal: UGX ${Number(feeBalance).toLocaleString()}`
    : 'Fees: Cleared (UGX 0)';
  return `[${schoolName.substring(0, 20)}] Dear Parent, ${studentName} (${lin}) End of ${term} results: ${summaryText}. ${formattedBalance}. Portal: mpumuza.ac.ug/p/${lin}`;
}

// ============================================================
// SEND ENGINE (Simulated Africa's Talking)
// ============================================================

/**
 * Simulate sending a broadcast batch.
 * @param {Array} recipientsList - [{ id, name, phone, message }, ...]
 */
export function sendSMSBroadcast(recipientsList) {
  const logs = [];
  let totalSMSParts = 0;

  recipientsList.forEach(rec => {
    const analysis = analyseSMS(rec.message ?? '');
    totalSMSParts += analysis.parts;
    const delivered = Math.random() > 0.05; // ~95% success rate

    logs.push({
      id: `sms-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      recipientName: rec.name,
      phone: rec.phone || '0770000000',
      message: rec.message ?? '',
      charCount: analysis.charCount,
      parts: analysis.parts,
      status: delivered ? 'DELIVERED' : 'FAILED',
      costUGX: analysis.parts * 50,
      timestamp: new Date().toISOString()
    });
  });

  const totalCostUGX = totalSMSParts * 50; // 50 UGX per SMS part

  return {
    success: true,
    sentCount: logs.filter(l => l.status === 'DELIVERED').length,
    failedCount: logs.filter(l => l.status === 'FAILED').length,
    totalCostUGX,
    totalSMSParts,
    logs
  };
}
