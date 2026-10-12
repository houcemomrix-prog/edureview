/**
 * Sultanate of Oman - Ministry of Education Curriculum Standards
 * Official distribution of academic subjects by grade level (1 to 12)
 *
 * وثيقة مناهج وزارة التربية والتعليم بسلطنة عُمان
 * قائمة المواد الدراسية المعتمدة لكل صف دراسي
 */

export interface GradeSubjectItem {
  key: string;
  ar: string;
  en: string;
}

// 1. الصفوف 1–4
export const GRADE_1_4_SUBJECTS: string[] = [
  'Islamic Studies',                  // التربية الإسلامية
  'Arabic Language',                  // اللغة العربية
  'English Language',                 // اللغة الإنجليزية
  'Mathematics',                      // الرياضيات
  'Science',                          // العلوم العامة
  'Identity and Citizenship',         // الهوية والمواطنة
  'Information Technology',           // تقنية المعلومات
  'Physical and Health Education',    // التربية البدنية والصحية
  'Visual Arts',                      // الفنون البصرية
  'Musical Arts'                      // الفنون الموسيقية
];

// 2. الصفوف 5–8
export const GRADE_5_8_SUBJECTS: string[] = [
  'Islamic Studies',                  // التربية الإسلامية
  'Arabic Language',                  // اللغة العربية
  'English Language',                 // اللغة الإنجليزية
  'Social Studies',                   // الدراسات الاجتماعية
  'Life Skills',                      // المهارات الحياتية
  'Mathematics',                      // الرياضيات
  'Science',                          // العلوم العامة
  'Information Technology',           // تقنية المعلومات
  'School Sports',                    // الرياضة المدرسية
  'Fine Arts',                        // الفنون التشكيلية
  'Musical Skills'                    // المهارات الموسيقية
];

// 3. الصف 9
export const GRADE_9_SUBJECTS: string[] = [
  'Islamic Studies',                  // التربية الإسلامية
  'Arabic Language',                  // اللغة العربية
  'English Language',                 // اللغة الإنجليزية
  'Social Studies',                   // الدراسات الاجتماعية
  'Life Skills',                      // المهارات الحياتية
  'Mathematics',                      // الرياضيات
  'Physics',                          // الفيزياء
  'Chemistry',                        // الكيمياء
  'Biology',                          // الأحياء
  'Information Technology',           // تقنية المعلومات
  'School Sports',                    // الرياضة المدرسية
  'Fine Arts',                        // الفنون التشكيلية
  'Musical Skills'                    // المهارات الموسيقية
];

// 4. الصف 10 (نفس مواد الصف 9 + خدمة التوجيه المهني)
export const GRADE_10_SUBJECTS: string[] = [
  'Islamic Studies',                  // التربية الإسلامية
  'Arabic Language',                  // اللغة العربية
  'English Language',                 // اللغة الإنجليزية
  'Social Studies',                   // الدراسات الاجتماعية
  'Life Skills',                      // المهارات الحياتية
  'Mathematics',                      // الرياضيات
  'Physics',                          // الفيزياء
  'Chemistry',                        // الكيمياء
  'Biology',                          // الأحياء
  'Information Technology',           // تقنية المعلومات
  'School Sports',                    // الرياضة المدرسية
  'Fine Arts',                        // الفنون التشكيلية
  'Musical Skills',                   // المهارات الموسيقية
  'Career Guidance'                   // خدمة التوجيه المهني (في الصف 10 فقط)
];

// 5. الصف 11
export const GRADE_11_SUBJECTS: string[] = [
  'Islamic Studies',                  // التربية الإسلامية
  'Arabic Language',                  // اللغة العربية
  'English Language',                 // اللغة الإنجليزية
  'Social Studies',                   // الدراسات الاجتماعية
  'Core Mathematics',                 // الرياضيات الأساسية
  'Advanced Mathematics',             // الرياضيات المتقدمة
  'Biology',                          // الأحياء
  'Chemistry',                        // الكيمياء
  'Physics',                          // الفيزياء
  'Environmental Sciences',           // العلوم البيئية
  'Information Technology',           // تقنية المعلومات
  'Economic Geography',               // الجغرافيا الاقتصادية
  'History (Islamic Civilization)',   // التاريخ (الحضارة الإسلامية)
  'School Sports',                    // الرياضة المدرسية
  'Fine Arts',                        // الفنون التشكيلية
  'Musical Skills'                    // المهارات الموسيقية
];

// 6. الصف 12
export const GRADE_12_SUBJECTS: string[] = [
  'Islamic Studies',                  // التربية الإسلامية
  'Arabic Language',                  // اللغة العربية
  'English Language',                 // اللغة الإنجليزية
  'Social Studies',                   // الدراسات الاجتماعية
  'Core Mathematics',                 // الرياضيات الأساسية
  'Advanced Mathematics',             // الرياضيات المتقدمة
  'English Language Skills',          // مهارات اللغة الإنجليزية
  'Biology',                          // الأحياء
  'Chemistry',                        // الكيمياء
  'Physics',                          // الفيزياء
  'Geography and Modern Technologies',// الجغرافيا والتقنيات الحديثة
  'History (World Around Me)',        // التاريخ (العالم من حولي)
  'School Sports',                    // الرياضة المدرسية
  'Fine Arts',                        // الفنون التشكيلية
  'Musical Skills'                    // المهارات الموسيقية
];

/**
 * All curriculum subjects across all grades combined, deduplicated in order of prominence.
 */
export const ALL_CURRICULUM_SUBJECTS: string[] = Array.from(
  new Set([
    ...GRADE_1_4_SUBJECTS,
    ...GRADE_5_8_SUBJECTS,
    ...GRADE_9_SUBJECTS,
    ...GRADE_10_SUBJECTS,
    ...GRADE_11_SUBJECTS,
    ...GRADE_12_SUBJECTS
  ])
);

/**
 * Normalizes any grade string to a clean 1..12 integer number, or null if unspecified.
 * Handles English ('Grade 10', '10') and Arabic ('الصف العاشر', 'العاشر', 'صف 10').
 */
export function normalizeGradeNumber(grade?: string | null): number | null {
  if (!grade) return null;
  const g = grade.trim().toLowerCase();

  // Test from 12 down to 10 first to avoid substring false matches
  if (g.includes('12') || g.includes('ثاني عشر') || g.includes('twelve')) return 12;
  if (g.includes('11') || g.includes('حادي عشر') || g.includes('eleven')) return 11;
  if (g.includes('10') || g.includes('عاشر') || g.includes('ten')) return 10;
  if (g.includes('9') || g.includes('تاسع') || g.includes('nine')) return 9;
  if (g.includes('8') || g.includes('ثامن') || g.includes('eight')) return 8;
  if (g.includes('7') || g.includes('سابع') || g.includes('seven')) return 7;
  if (g.includes('6') || g.includes('سادس') || g.includes('six')) return 6;
  if (g.includes('5') || g.includes('خامس') || g.includes('five')) return 5;
  if (g.includes('4') || g.includes('رابع') || g.includes('four')) return 4;
  if (g.includes('3') || g.includes('ثالث') || g.includes('three')) return 3;
  if (g.includes('2') || g.includes('ثاني') || g.includes('two')) return 2;
  if (g.includes('1') || g.includes('أول') || g.includes('اول') || g.includes('one')) return 1;

  return null;
}

/**
 * Returns the exact list of official subjects for a given grade level.
 * If grade is empty or unselected, returns ALL curriculum subjects.
 */
export function getSubjectsForGrade(grade?: string | null): string[] {
  const num = normalizeGradeNumber(grade);
  if (num === null) {
    return ALL_CURRICULUM_SUBJECTS;
  }
  if (num >= 1 && num <= 4) {
    return GRADE_1_4_SUBJECTS;
  }
  if (num >= 5 && num <= 8) {
    return GRADE_5_8_SUBJECTS;
  }
  if (num === 9) {
    return GRADE_9_SUBJECTS;
  }
  if (num === 10) {
    return GRADE_10_SUBJECTS;
  }
  if (num === 11) {
    return GRADE_11_SUBJECTS;
  }
  if (num === 12) {
    return GRADE_12_SUBJECTS;
  }
  return ALL_CURRICULUM_SUBJECTS;
}

/**
 * Checks if a given subject is taught in a specific grade.
 */
export function isSubjectInGrade(subject?: string | null, grade?: string | null): boolean {
  if (!subject) return true;
  if (!grade) return true;
  const gradeSubjs = getSubjectsForGrade(grade);
  return gradeSubjs.some(s => s.toLowerCase() === subject.trim().toLowerCase());
}
