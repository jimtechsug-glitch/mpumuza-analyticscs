import * as XLSX from 'xlsx';

/**
 * Downloads a pre-formatted Excel template for entering student details and subject marks.
 */
export function downloadStudentTemplate(className = 'S.3', stream = 'A', subjects = []) {
  const headers = ['LIN', 'Full Name', 'Gender (M/F)', 'Parent Phone'];
  
  if (subjects && subjects.length > 0) {
    subjects.forEach(sub => {
      headers.push(`${sub.code || sub.name} (BOT)`);
      headers.push(`${sub.code || sub.name} (MOT)`);
      headers.push(`${sub.code || sub.name} (EOT)`);
    });
  } else {
    const isALvl = ['s.5', 's.6', 'senior 5', 'senior 6', 'a-level'].some(l => className.toLowerCase().includes(l));
    if (isALvl) {
      headers.push('Physics Paper 1 (EOT)', 'Physics Paper 2 (EOT)', 'Math Paper 1 (EOT)', 'Math Paper 2 (EOT)', 'GP (EOT)', 'Submath (EOT)');
    } else {
      headers.push('Mathematics (EOT)', 'English (EOT)', 'Biology (EOT)', 'Physics (EOT)');
    }
  }

  // Sample guidance row
  const sampleRow1 = ['LIN-2026-001', 'Kateregga Paul', 'M', '0772123456'];
  const sampleRow2 = ['LIN-2026-002', 'Namazzi Sarah', 'F', '0752987654'];

  // Fill sample dummy marks
  for (let i = 4; i < headers.length; i++) {
    sampleRow1.push(Math.floor(Math.random() * 30) + 60);
    sampleRow2.push(Math.floor(Math.random() * 30) + 65);
  }

  const worksheetData = [headers, sampleRow1, sampleRow2];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
  // Set column widths
  const colWidths = headers.map(h => ({ wch: Math.max(h.length + 4, 14) }));
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Students & Marks');

  const fileName = `Student_Marks_Template_${className}_${stream}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

/**
 * Parses an uploaded Excel or CSV spreadsheet file.
 * Returns { success: true, students: [...], errors: [...] }
 */
export function parseUploadedSpreadsheet(file, availableSubjects = []) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Convert to array of arrays
        const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!rawRows || rawRows.length < 2) {
          resolve({
            success: false,
            message: 'Spreadsheet appears to be empty or missing header row.',
            students: []
          });
          return;
        }

        const headers = rawRows[0].map(h => String(h || '').trim());
        const linIdx = headers.findIndex(h => /lin/i.test(h));
        const nameIdx = headers.findIndex(h => /name/i.test(h));
        const genderIdx = headers.findIndex(h => /gender/i.test(h));
        const phoneIdx = headers.findIndex(h => /phone|parent/i.test(h));

        if (nameIdx === -1) {
          resolve({
            success: false,
            message: 'Missing "Full Name" column header in spreadsheet.',
            students: []
          });
          return;
        }

        const parsedStudents = [];
        const errors = [];

        for (let r = 1; r < rawRows.length; r++) {
          const row = rawRows[r];
          if (!row || row.length === 0 || !row[nameIdx]) continue;

          const studentName = String(row[nameIdx]).trim();
          const lin = linIdx !== -1 && row[linIdx] ? String(row[linIdx]).trim() : `LIN-${Date.now().toString().slice(-4)}-${r}`;
          const gender = genderIdx !== -1 && row[genderIdx] ? String(row[genderIdx]).trim().toUpperCase().charAt(0) : 'M';
          const parentPhone = phoneIdx !== -1 && row[phoneIdx] ? String(row[phoneIdx]).trim() : '';

          // Parse marks for subjects found in headers
          const marks = {};
          
          headers.forEach((h, colIdx) => {
            if ([linIdx, nameIdx, genderIdx, phoneIdx].includes(colIdx)) return;
            const val = row[colIdx];
            if (val !== undefined && val !== null && val !== '') {
              const numVal = Number(val);
              if (!isNaN(numVal)) {
                marks[h] = Math.min(100, Math.max(0, numVal));
              }
            }
          });

          parsedStudents.push({
            id: `std-${Date.now()}-${r}`,
            lin,
            name: studentName,
            gender: ['M', 'F'].includes(gender) ? gender : 'M',
            parentPhone,
            marks
          });
        }

        resolve({
          success: true,
          students: parsedStudents,
          count: parsedStudents.length,
          errors
        });

      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}
/**
 * Downloads a pre-formatted Excel mark sheet customized to the specific class, stream, and enrolled students.
 */
export function downloadClassMarksTemplate(className = 'S.3', stream = 'North', enrolledStudents = [], subjects = [], isNCDC = false) {
  let headers = ['LIN', 'Student Full Name', 'Gender'];

  if (isNCDC) {
    // NCDC Continuous Assessment format: Subject AoI-1, AoI-2, AoI-3, Summative
    subjects.forEach(sub => {
      const code = sub.code || sub.name;
      headers.push(`${code} (AoI-1)`);
      headers.push(`${code} (AoI-2)`);
      headers.push(`${code} (AoI-3)`);
      headers.push(`${code} (Summative 80%)`);
    });
  } else {
    // Standard UNEB format: Subject BOT, MOT, EOT
    subjects.forEach(sub => {
      const code = sub.code || sub.name;
      headers.push(`${code} (BOT)`);
      headers.push(`${code} (MOT)`);
      headers.push(`${code} (EOT)`);
    });
  }

  const rows = [];

  if (enrolledStudents && enrolledStudents.length > 0) {
    enrolledStudents.forEach(std => {
      const row = [std.lin, std.name, std.gender || 'M'];
      // Leave marks blank for teachers to fill in
      for (let i = 3; i < headers.length; i++) {
        row.push('');
      }
      rows.push(row);
    });
  } else {
    // Sample placeholder rows
    rows.push(['LIN-2026-001', 'Sample Student 1', 'M', ...Array(headers.length - 3).fill('')]);
    rows.push(['LIN-2026-002', 'Sample Student 2', 'F', ...Array(headers.length - 3).fill('')]);
  }

  const worksheetData = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  const colWidths = headers.map((h, i) => ({
    wch: i === 1 ? 26 : Math.max(h.length + 3, 12)
  }));
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Class Marks');

  const modeStr = isNCDC ? 'NCDC_AoI' : 'Marks';
  const fileName = `${className.replace(/\s+/g, '_')}_${stream}_${modeStr}_Template.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

/**
 * Parses an uploaded marks spreadsheet and maps entries to existing student IDs and subject IDs.
 */
export function parseMarksSpreadsheet(file, enrolledStudents = [], availableSubjects = []) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!rawRows || rawRows.length < 2) {
          resolve({
            success: false,
            message: 'Spreadsheet appears to be empty or missing header row.',
            markEntries: []
          });
          return;
        }

        const headers = rawRows[0].map(h => String(h || '').trim());
        const linIdx = headers.findIndex(h => /lin/i.test(h));
        const nameIdx = headers.findIndex(h => /name/i.test(h));

        if (linIdx === -1 && nameIdx === -1) {
          resolve({
            success: false,
            message: 'Spreadsheet must contain either a "LIN" or "Student Full Name" column.',
            markEntries: []
          });
          return;
        }

        // Map column index to subjectId & exam type (bot, mot, eot, aoi1, aoi2, aoi3, summative)
        const columnMap = [];

        headers.forEach((h, colIdx) => {
          if (colIdx === linIdx || colIdx === nameIdx || /gender|phone/i.test(h)) return;

          // Check which subject matches header
          const matchedSubject = availableSubjects.find(sub => {
            const subCode = (sub.code || '').toLowerCase();
            const subName = (sub.name || '').toLowerCase();
            const hLower = h.toLowerCase();
            return (subCode && hLower.includes(subCode)) || (subName && hLower.includes(subName));
          });

          if (matchedSubject) {
            let examType = 'eot';
            const hLower = h.toLowerCase();
            if (hLower.includes('bot') || hLower.includes('beginning')) examType = 'bot';
            else if (hLower.includes('mot') || hLower.includes('mid')) examType = 'mot';
            else if (hLower.includes('aoi-1') || hLower.includes('aoi 1') || hLower.includes('aoi1')) examType = 'aoi1';
            else if (hLower.includes('aoi-2') || hLower.includes('aoi 2') || hLower.includes('aoi2')) examType = 'aoi2';
            else if (hLower.includes('aoi-3') || hLower.includes('aoi 3') || hLower.includes('aoi3')) examType = 'aoi3';
            else if (hLower.includes('summative')) examType = 'summative';

            columnMap.push({
              colIdx,
              subjectId: matchedSubject.id,
              subjectName: matchedSubject.name,
              examType
            });
          }
        });

        const studentMarksMap = {}; // Key: `${studentId}_${subjectId}` -> { studentId, subjectId, bot, mot, eot, aoi1, aoi2, aoi3, summative }
        let matchedCount = 0;

        for (let r = 1; r < rawRows.length; r++) {
          const row = rawRows[r];
          if (!row || row.length === 0) continue;

          const rowLin = linIdx !== -1 && row[linIdx] ? String(row[linIdx]).trim().toLowerCase() : '';
          const rowName = nameIdx !== -1 && row[nameIdx] ? String(row[nameIdx]).trim().toLowerCase() : '';

          // Match with enrolled students
          const student = enrolledStudents.find(s => {
            if (rowLin && (s.lin || '').toLowerCase() === rowLin) return true;
            if (rowName && (s.name || '').toLowerCase() === rowName) return true;
            return false;
          });

          if (!student) continue;
          matchedCount++;

          columnMap.forEach(col => {
            const rawVal = row[col.colIdx];
            if (rawVal !== undefined && rawVal !== null && rawVal !== '') {
              const numVal = Number(rawVal);
              if (!isNaN(numVal)) {
                const key = `${student.id}_${col.subjectId}`;
                if (!studentMarksMap[key]) {
                  studentMarksMap[key] = {
                    studentId: student.id,
                    studentName: student.name,
                    subjectId: col.subjectId,
                    subjectName: col.subjectName,
                    bot: null,
                    mot: null,
                    eot: null
                  };
                }
                studentMarksMap[key][col.examType] = numVal;
              }
            }
          });
        }

        const markEntries = Object.values(studentMarksMap);

        resolve({
          success: true,
          matchedStudentsCount: matchedCount,
          markEntriesCount: markEntries.length,
          markEntries
        });

      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}
