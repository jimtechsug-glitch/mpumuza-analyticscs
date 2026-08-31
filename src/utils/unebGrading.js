/**
 * UNEB (Uganda National Examinations Board) Standard Grading Engine
 * Covers: Primary (PLE), O-Level (UCE Classic & New NCDC Curriculum), and A-Level (UACE).
 */

// ==========================================
// 1. PRIMARY LEVEL (PLE / P.1 - P.7)
// ==========================================

export function getPrimaryGrade(score) {
  const val = Number(score);
  if (isNaN(val) || val === null || val === undefined) return { grade: '-', aggregate: 9, remark: 'No Mark' };
  
  if (val >= 80) return { grade: 'D1', aggregate: 1, remark: 'Distinction' };
  if (val >= 75) return { grade: 'D2', aggregate: 2, remark: 'Distinction' };
  if (val >= 65) return { grade: 'C3', aggregate: 3, remark: 'Credit' };
  if (val >= 60) return { grade: 'C4', aggregate: 4, remark: 'Credit' };
  if (val >= 55) return { grade: 'C5', aggregate: 5, remark: 'Credit' };
  if (val >= 50) return { grade: 'C6', aggregate: 6, remark: 'Credit' };
  if (val >= 45) return { grade: 'P7', aggregate: 7, remark: 'Pass' };
  if (val >= 40) return { grade: 'P8', aggregate: 8, remark: 'Pass' };
  return { grade: 'F9', aggregate: 9, remark: 'Fail' };
}

/**
 * Calculates PLE Division based on 4 Core Subjects (English, Mathematics, Science, SST)
 */
export function calculatePrimaryDivision(subjectGradesList) {
  // Extract aggregate values for core subjects
  if (!subjectGradesList || subjectGradesList.length === 0) {
    return { totalAggregate: 36, division: 'Division U', summary: 'Ungraded' };
  }

  // Sort aggregates ascending (best scores first)
  const aggregates = subjectGradesList.map(item => item.aggregate).sort((a, b) => a - b);
  
  // Best 4 core subjects
  const top4 = aggregates.slice(0, 4);
  const totalAggregate = top4.reduce((sum, val) => sum + val, 0);

  // Check English and Math passes for Div 1 eligibility
  const engItem = subjectGradesList.find(i => i.subjectCode?.toLowerCase().includes('eng') || i.subjectName?.toLowerCase().includes('english'));
  const mathItem = subjectGradesList.find(i => i.subjectCode?.toLowerCase().includes('math') || i.subjectName?.toLowerCase().includes('math'));

  const engAgg = engItem ? engItem.aggregate : 9;
  const mathAgg = mathItem ? mathItem.aggregate : 9;

  let division = 'Division U';

  if (totalAggregate <= 12 && engAgg <= 8 && mathAgg <= 8) {
    division = 'Division I';
  } else if (totalAggregate <= 24 && engAgg <= 8) {
    division = 'Division II';
  } else if (totalAggregate <= 30) {
    division = 'Division III';
  } else if (totalAggregate <= 34) {
    division = 'Division IV';
  } else {
    division = 'Division U';
  }

  return {
    totalAggregate,
    division,
    summary: `${division} (${totalAggregate} Aggregates)`
  };
}


// ==========================================
// 2. O-LEVEL (UCE / S.1 - S.4)
// ==========================================

// --- A. Classic UNEB Aggregate System ---
export function getOLevelClassicGrade(score) {
  const val = Number(score);
  if (isNaN(val) || val === null || val === undefined) return { grade: '-', aggregate: 9, remark: 'No Mark' };

  if (val >= 80) return { grade: 'D1', aggregate: 1, remark: 'Distinction' };
  if (val >= 75) return { grade: 'D2', aggregate: 2, remark: 'Distinction' };
  if (val >= 66) return { grade: 'C3', aggregate: 3, remark: 'Credit' };
  if (val >= 60) return { grade: 'C4', aggregate: 4, remark: 'Credit' };
  if (val >= 55) return { grade: 'C5', aggregate: 5, remark: 'Credit' };
  if (val >= 50) return { grade: 'C6', aggregate: 6, remark: 'Credit' };
  if (val >= 45) return { grade: 'P7', aggregate: 7, remark: 'Pass' };
  if (val >= 40) return { grade: 'P8', aggregate: 8, remark: 'Pass' };
  return { grade: 'F9', aggregate: 9, remark: 'Fail' };
}

export function calculateOLevelClassicDivision(subjectGradesList) {
  if (!subjectGradesList || subjectGradesList.length < 8) {
    // If fewer than 8 subjects, sum what is available and pad with 9s
    const aggs = (subjectGradesList || []).map(i => i.aggregate);
    while (aggs.length < 8) aggs.push(9);
    const total = aggs.sort((a, b) => a - b).slice(0, 8).reduce((s, v) => s + v, 0);
    return { totalAggregate: total, division: 'Division U', summary: 'Ungraded (<8 Subjects)' };
  }

  const sortedAggs = subjectGradesList.map(i => i.aggregate).sort((a, b) => a - b);
  const best8 = sortedAggs.slice(0, 8);
  const totalAggregate = best8.reduce((sum, val) => sum + val, 0);

  let division = 'Division U';
  if (totalAggregate <= 32) {
    division = 'Division 1';
  } else if (totalAggregate <= 45) {
    division = 'Division 2';
  } else if (totalAggregate <= 58) {
    division = 'Division 3';
  } else if (totalAggregate <= 72) {
    division = 'Division 4';
  } else {
    division = 'Division U';
  }

  return {
    totalAggregate,
    division,
    summary: `${division} (${totalAggregate} Aggregates)`
  };
}

// --- B. New NCDC Lower Secondary Curriculum (LSC Competency-Based) ---
export function getOLevelNewCurriculumGrade(scoreOrFormative, summative80 = null) {
  let totalPercent = 0;

  if (summative80 !== null && summative80 !== undefined) {
    const f = Number(scoreOrFormative) || 0;
    const s = Number(summative80) || 0;
    totalPercent = Math.min(100, Math.max(0, f + s));
  } else {
    const val = Number(scoreOrFormative);
    if (isNaN(val) || scoreOrFormative === null || scoreOrFormative === undefined) {
      return {
        totalPercent: null,
        descriptorScore: '-',
        grade: '-',
        descriptor: 'No Mark',
        level: 'No Mark',
        remark: 'No Mark'
      };
    }
    totalPercent = Math.min(100, Math.max(0, val));
  }
  
  // Score on 3.0 NCDC Competency Scale
  const descriptorScore = Number(((totalPercent / 100) * 3.0).toFixed(2));

  let grade = 'D';
  let descriptor = 'Below Basic';
  let level = 'Needs Support';

  if (descriptorScore >= 2.5) {
    grade = 'A';
    descriptor = 'Outstanding';
    level = 'Mastered Competency';
  } else if (descriptorScore >= 1.5) {
    grade = 'B';
    descriptor = 'Moderate';
    level = 'Good Competency';
  } else if (descriptorScore >= 0.9) {
    grade = 'C';
    descriptor = 'Basic';
    level = 'Basic Competency';
  } else {
    grade = 'D';
    descriptor = 'Below Basic';
    level = 'Needs Support';
  }

  return {
    totalPercent: Math.round(totalPercent * 10) / 10,
    descriptorScore,
    grade,
    descriptor,
    level,
    remark: `${descriptor} (${grade} - ${descriptorScore}/3.0)`
  };
}

export function calculateOLevelLSCResult(subjectGradesList) {
  if (!subjectGradesList || subjectGradesList.length === 0) {
    return {
      averageScore3: '0.00',
      overallGrade: 'D',
      descriptor: 'Below Basic',
      passedSubjects: 0,
      summary: 'No Assessment Data'
    };
  }

  const validItems = subjectGradesList.filter(i => i.descriptorScore !== '-' && !isNaN(Number(i.descriptorScore)));
  if (validItems.length === 0) {
    return {
      averageScore3: '0.00',
      overallGrade: 'D',
      descriptor: 'Below Basic',
      passedSubjects: 0,
      summary: 'No Assessed Subjects'
    };
  }

  const totalScore3 = validItems.reduce((sum, item) => sum + Number(item.descriptorScore), 0);
  const averageScore3 = Number((totalScore3 / validItems.length).toFixed(2));
  const passedSubjects = validItems.filter(i => ['A', 'B', 'C'].includes(i.grade)).length;

  let overallGrade = 'D';
  let descriptor = 'Below Basic';

  if (averageScore3 >= 2.5) {
    overallGrade = 'A';
    descriptor = 'Outstanding Competence';
  } else if (averageScore3 >= 1.5) {
    overallGrade = 'B';
    descriptor = 'Moderate Competence';
  } else if (averageScore3 >= 0.9) {
    overallGrade = 'C';
    descriptor = 'Basic Competence';
  } else {
    overallGrade = 'D';
    descriptor = 'Needs Support';
  }

  return {
    averageScore3: averageScore3.toFixed(2),
    overallGrade,
    descriptor,
    passedSubjects,
    totalSubjects: validItems.length,
    summary: `${descriptor} (Avg: ${averageScore3.toFixed(2)}/3.0 - Grade ${overallGrade})`
  };
}


// ==========================================
// 3. A-LEVEL (UACE / S.5 - S.6)
// ==========================================

export function getALevelSubjectGrade(score, isSubsidiary = false) {
  const val = Number(score);
  if (isNaN(val) || score === null || score === undefined || score === '') {
    return { grade: '-', points: 0, remark: 'No Mark' };
  }

  if (isSubsidiary) {
    // Subsidiary subjects (General Paper, Sub Math, Sub ICT)
    // >= 50: Grade A (1 pt), <= 49: Grade E (0 pt)
    if (val >= 50) return { grade: 'A', points: 1, remark: 'Subsidiary Pass' };
    return { grade: 'E', points: 0, remark: 'Subsidiary Fail' };
  }

  // Principal Subjects
  // 80 - 100: Grade A (5 pts)
  // 70 - 79:  Grade B (4 pts)
  // 60 - 69:  Grade C (3 pts)
  // 45 - 59:  Grade D (2 pts)
  // 35 - 44:  Grade E (1 pt)
  // 0 - 34:   Grade F (0 pt)
  if (val >= 80) return { grade: 'A', points: 5, remark: 'Principal Pass' };
  if (val >= 70) return { grade: 'B', points: 4, remark: 'Principal Pass' };
  if (val >= 60) return { grade: 'C', points: 3, remark: 'Principal Pass' };
  if (val >= 45) return { grade: 'D', points: 2, remark: 'Principal Pass' };
  if (val >= 35) return { grade: 'E', points: 1, remark: 'Principal Pass' };
  return { grade: 'F', points: 0, remark: 'Fail' };
}

export function calculateALevelPoints(subjectGradesList) {
  if (!subjectGradesList || subjectGradesList.length === 0) {
    return { totalPoints: 0, principalPasses: 0, subsidiaryPasses: 0, summary: '0 Points (0 Principal Passes)' };
  }

  // Separate subsidiaries from principals
  const subsidiaries = [];
  const principalPapers = {};

  subjectGradesList.forEach(item => {
    const isSub = item.isSubsidiary ||
      (item.subjectName && (
        item.subjectName.toLowerCase().includes('general paper') ||
        item.subjectName.toLowerCase().includes('gp') ||
        item.subjectName.toLowerCase().includes('submath') ||
        item.subjectName.toLowerCase().includes('sub math') ||
        item.subjectName.toLowerCase().includes('subsidiary')
      ));

    if (isSub) {
      subsidiaries.push(item);
    } else {
      // Group by base subject name (e.g., "Physics Paper 1" & "Physics Paper 2" -> "Physics")
      const rawName = item.subjectName || item.name || '';
      const baseName = rawName
        .replace(/\s*Paper\s*[12]/gi, '')
        .replace(/\s*P\.?[12]/gi, '')
        .replace(/\s*\((?:Principal\s+)?A-Level\)/gi, '')
        .trim() || rawName || 'Principal Subject';

      if (!principalPapers[baseName]) {
        principalPapers[baseName] = [];
      }
      principalPapers[baseName].push(item);
    }
  });

  let totalPrincipalPoints = 0;
  let principalPasses = 0;

  // Calculate score & grade for each principal subject (averaging Paper 1 and Paper 2 if both present)
  Object.values(principalPapers).forEach(papers => {
    let finalScore = null;
    const validScores = papers.map(p => Number(p.finalScore)).filter(s => !isNaN(s) && s !== null);

    if (validScores.length > 0) {
      finalScore = validScores.reduce((a, b) => a + b, 0) / validScores.length;
    }

    if (finalScore !== null) {
      const { grade, points } = getALevelSubjectGrade(finalScore, false);
      totalPrincipalPoints += points;
      if (['A', 'B', 'C', 'D', 'E'].includes(grade)) {
        principalPasses += 1;
      }
    } else {
      // Fallback to highest points among papers if finalScore not present
      const maxPts = Math.max(...papers.map(p => Number(p.points) || 0), 0);
      totalPrincipalPoints += maxPts;
      if (papers.some(p => ['A', 'B', 'C', 'D', 'E'].includes(p.grade) && p.grade !== '-')) {
        principalPasses += 1;
      }
    }
  });

  let subsidiaryPasses = 0;
  let totalSubsidiaryPoints = 0;

  subsidiaries.forEach(item => {
    const isPass = item.grade === 'A' || Number(item.points) >= 1 || (item.finalScore !== null && Number(item.finalScore) >= 50);
    if (isPass) {
      subsidiaryPasses += 1;
      totalSubsidiaryPoints += 1;
    }
  });

  // UNEB UACE standard: Max 15 points from 3 principals + max 2 points from subsidiaries = max 20 points
  const totalPoints = Math.min(20, totalPrincipalPoints + Math.min(2, totalSubsidiaryPoints));

  return {
    totalPoints,
    principalPasses,
    subsidiaryPasses,
    summary: `${totalPoints} Points (${principalPasses} Principal Pass${principalPasses === 1 ? '' : 'es'}, ${subsidiaryPasses} Subsidiary Pass${subsidiaryPasses === 1 ? '' : 'es'})`
  };
}

// ==========================================
// 4. GENERAL WEIGHING CALCULATOR (BOT, MOT, EOT)
// ==========================================

export function calculateWeightedFinalScore(botMark, motMark, eotMark, weights = { bot: 20, mot: 20, eot: 60 }) {
  const bot = Number(botMark);
  const mot = Number(motMark);
  const eot = Number(eotMark);

  const hasBot = !isNaN(bot) && botMark !== '' && botMark !== null;
  const hasMot = !isNaN(mot) && motMark !== '' && motMark !== null;
  const hasEot = !isNaN(eot) && eotMark !== '' && eotMark !== null;

  if (!hasBot && !hasMot && !hasEot) return null;

  let totalWeight = 0;
  let weightedSum = 0;

  if (hasBot) {
    weightedSum += bot * (weights.bot / 100);
    totalWeight += weights.bot;
  }
  if (hasMot) {
    weightedSum += mot * (weights.mot / 100);
    totalWeight += weights.mot;
  }
  if (hasEot) {
    weightedSum += eot * (weights.eot / 100);
    totalWeight += weights.eot;
  }

  if (totalWeight === 0) return null;

  // Scale to 100% if some components are missing
  const finalScore = (weightedSum / totalWeight) * 100;
  return Math.round(finalScore * 10) / 10;
}

// ==========================================
// 5. NCDC CONTINUOUS ASSESSMENT ENGINE (20% Formative + 80% Summative)
// ==========================================

/**
 * Calculates NCDC Continuous Assessment (AoI - Formative 20% + Summative Exam 80%)
 * @param {Array<number>} aoiScores - Scores for Activities of Integration (typically out of 3.0 or 100)
 * @param {number} summativeScore - End of Cycle/Term Summative examination score (out of 100 or 80)
 * @param {boolean} aoiIsOutOf3 - Whether AoI raw scores are on the 3.0 scale or 100% scale
 */
export function calculateNCDCContinuousAssessment(aoiScores = [], summativeScore = null, aoiIsOutOf3 = true) {
  // 1. Filter valid AoI entries
  const validAoIs = (aoiScores || [])
    .map(s => Number(s))
    .filter(s => !isNaN(s) && s !== null && s !== undefined);

  let formativeAveragePercentage = null;
  let formative20Score = null;

  if (validAoIs.length > 0) {
    const sumAoI = validAoIs.reduce((a, b) => a + b, 0);
    const avgAoI = sumAoI / validAoIs.length;
    // If entered out of 3.0, convert to %: (avg / 3) * 100
    formativeAveragePercentage = aoiIsOutOf3 ? (avgAoI / 3) * 100 : avgAoI;
    // Scale to official 20% UNEB Continuous Assessment
    formative20Score = Math.round((formativeAveragePercentage * 0.20) * 10) / 10;
  }

  // 2. Summative Component (80%)
  const numSummative = Number(summativeScore);
  let summativePercentage = null;
  let summative80Score = null;

  if (!isNaN(numSummative) && summativeScore !== null && summativeScore !== '') {
    summativePercentage = numSummative;
    summative80Score = Math.round((numSummative * 0.80) * 10) / 10;
  }

  // 3. Composite Final Score (out of 100%) and Score out of 3.0
  let compositeScore100 = null;
  let scoreOutOf3 = null;

  if (formative20Score !== null && summative80Score !== null) {
    compositeScore100 = Math.round((formative20Score + summative80Score) * 10) / 10;
    scoreOutOf3 = Math.round(((compositeScore100 / 100) * 3) * 10) / 10;
  } else if (summative80Score !== null) {
    // If AoI missing, scale summative to 100
    compositeScore100 = Math.round(summativePercentage * 10) / 10;
    scoreOutOf3 = Math.round(((compositeScore100 / 100) * 3) * 10) / 10;
  } else if (formative20Score !== null) {
    // If summative missing, show formative %
    compositeScore100 = Math.round(formativeAveragePercentage * 10) / 10;
    scoreOutOf3 = Math.round(((compositeScore100 / 100) * 3) * 10) / 10;
  }

  const descriptorObj = getNCDCCompetencyBand(scoreOutOf3);

  return {
    validAoICount: validAoIs.length,
    formativeAveragePercentage: formativeAveragePercentage !== null ? Math.round(formativeAveragePercentage * 10) / 10 : null,
    formative20Score, // The exact 20% score for UNEB e-portal upload
    summativePercentage: summativePercentage !== null ? Math.round(summativePercentage * 10) / 10 : null,
    summative80Score,
    compositeScore100,
    scoreOutOf3,
    ...descriptorObj
  };
}

/**
 * Returns official NCDC 3-tier Competency Bands
 */
export function getNCDCCompetencyBand(scoreOutOf3) {
  const val = Number(scoreOutOf3);
  if (isNaN(val) || val === null || val === undefined) {
    return {
      band: 'No Mark',
      badgeColor: 'gray',
      descriptor: 'Assessment pending or not yet submitted',
      levelCode: '-'
    };
  }

  if (val >= 2.5) {
    return {
      band: 'Outstanding Achievement',
      badgeColor: 'emerald',
      descriptor: 'Exhibits deep conceptual understanding, independent problem solving, and exceptional application of competencies in complex real-world scenarios.',
      levelCode: 'Level 3 (2.5 - 3.0)'
    };
  }
  if (val >= 1.5) {
    return {
      band: 'Moderate Achievement',
      badgeColor: 'blue',
      descriptor: 'Demonstrates clear grasp of core concepts and meets prescribed learning competencies with consistent accuracy under standard guidance.',
      levelCode: 'Level 2 (1.5 - 2.4)'
    };
  }
  return {
    band: 'Basic Competency (Needs Support)',
    badgeColor: 'amber',
    descriptor: 'Acquires fundamental familiarity with basic concepts but requires targeted remedial reinforcement and structured guidance to master required skills.',
    levelCode: 'Level 1 (0.9 - 1.4)'
  };
}

// ==========================================
// 6. SMART AUTOMATED REMARKS & DESCRIPTORS
// ==========================================

/**
 * Generates subject-specific teacher remark based on student mark/grade
 */
export function generateSubjectRemark(score, subjectName = 'the subject', curriculumLevel = 'O-Level') {
  const val = Number(score);
  const sub = subjectName.trim();

  if (isNaN(val) || score === null || score === '') return 'Assessment data pending.';

  if (val >= 80) {
    const comments = [
      `Exceptional mastery of core concepts in ${sub}. Consistently produces analytical, high-quality work.`,
      `Outstanding performance in ${sub}. Demonstrates critical thinking and superior problem-solving skills.`,
      `Exemplary work in ${sub}. Shows great passion and deep conceptual comprehension.`
    ];
    return comments[Math.floor(Math.random() * comments.length)];
  }

  if (val >= 65) {
    const comments = [
      `Solid understanding and commendable effort in ${sub}. Has strong potential for distinction with more practice.`,
      `Good grasp of ${sub} fundamentals. Active participation and steady progress observed throughout the term.`,
      `Very good performance in ${sub}. Keep up the high standard and focus on fine-tuning complex topics.`
    ];
    return comments[Math.floor(Math.random() * comments.length)];
  }

  if (val >= 50) {
    const comments = [
      `Fair progress in ${sub}. Needs more self-study and regular revision in key topic areas to improve score.`,
      `Average grasp of ${sub}. Capable of better results if consistency and assignment submissions are prioritized.`,
      `Satisfactory performance in ${sub}, but extra attention is required in practical and application exercises.`
    ];
    return comments[Math.floor(Math.random() * comments.length)];
  }

  if (val >= 40) {
    const comments = [
      `Pass achieved in ${sub}, but foundation remains weak. Needs continuous remedial coaching and focused effort.`,
      `Borderline performance in ${sub}. Must put in more revision time and seek teacher guidance on difficult concepts.`,
      `Needs substantial improvement in ${sub}. Extra practice and attentive participation are strongly advised.`
    ];
    return comments[Math.floor(Math.random() * comments.length)];
  }

  return `Struggling in ${sub}. Urgent remedial support, peer study, and regular consultations with the subject teacher are vital.`;
}

/**
 * Generates Class Teacher appraisal based on overall division / aggregate performance
 */
export function generateClassTeacherRemark(division = 'Division II', totalAggregate = 20, studentName = 'The student') {
  const divStr = (division || '').toUpperCase();

  if (divStr.includes('DIVISION I') || divStr.includes('DISTINCTION') || totalAggregate <= 14) {
    const comments = [
      `An exceptional student who exhibits sterling academic discipline, exemplary focus, and leadership qualities. Highly commendable performance!`,
      `Brilliant academic progress this term. Maintains high personal standards and sets a wonderful example for classmates. Keep aiming for the stars!`,
      `Outstanding achievement across all subjects. Highly committed, attentive, and enthusiastic in all class activities.`
    ];
    return comments[Math.floor(Math.random() * comments.length)];
  }

  if (divStr.includes('DIVISION II') || (totalAggregate > 14 && totalAggregate <= 24)) {
    const comments = [
      `A hardworking and dedicated student who has shown good academic capability. With extra concentration on weaker subjects, Division 1 is well within reach.`,
      `Good overall conduct and steady academic progress. Encouraged to manage revision time efficiently to maximize full potential next term.`,
      `Commendable results. Demonstrates positive attitude towards class assignments and shows strong promise for higher distinctions.`
    ];
    return comments[Math.floor(Math.random() * comments.length)];
  }

  if (divStr.includes('DIVISION III') || (totalAggregate > 24 && totalAggregate <= 30)) {
    const comments = [
      `A polite student with fair academic output. Needs to double revision efforts and eliminate distractions in class to secure a stronger division.`,
      `Average term performance. Has the capability to achieve far better grades if consistency and timely submission of classwork are maintained.`,
      `Moderate progress shown. Encouraged to form active study groups and consult subject teachers regularly during remedial periods.`
    ];
    return comments[Math.floor(Math.random() * comments.length)];
  }

  if (divStr.includes('DIVISION IV') || (totalAggregate > 30 && totalAggregate <= 34)) {
    const comments = [
      `Borderline performance this term. Must take studies more seriously and engage in intensive holiday revision to avoid repeating or dropping.`,
      `Weak academic standing. Requires close monitoring, disciplined self-study habits, and active engagement during classroom lessons.`
    ];
    return comments[Math.floor(Math.random() * comments.length)];
  }

  return `Unsatisfactory results this term. Urgent parent-teacher consultation is required, along with structured daily remedial intervention.`;
}

/**
 * Generates Headteacher / DOS official verdict and endorsement
 */
export function generateHeadTeacherRemark(division = 'Division II', feeBalance = 0, nextTermFee = 0) {
  const divStr = (division || '').toUpperCase();
  const hasFeeBalance = Number(feeBalance) > 0;

  let feeClause = hasFeeBalance
    ? ` Note: Please clear outstanding fee arrears of UGX ${Number(feeBalance).toLocaleString()} before next term commences.`
    : ` Thank you for staying up to date with school dues.`;

  if (divStr.includes('DIVISION I') || divStr.includes('DISTINCTION')) {
    return `Excellent results! The administration is proud of this remarkable academic standard. Keep up the high standard next term.${feeClause}`;
  }

  if (divStr.includes('DIVISION II')) {
    return `Good performance with clear potential for Division 1. Encouraged to maintain hard work and academic focus during the holidays.${feeClause}`;
  }

  if (divStr.includes('DIVISION III')) {
    return `Fair performance. More commitment, disciplined revision, and serious engagement with teachers needed next term.${feeClause}`;
  }

  if (divStr.includes('DIVISION IV')) {
    return `Poor results. Must seek teacher guidance, attend all holiday coaching sessions, and significantly improve performance next term.${feeClause}`;
  }

  return `Critical performance level. Parent is requested to see the Headteacher/DOS on opening day to discuss academic retention plan.${feeClause}`;
}

