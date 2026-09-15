export type UserRole = 'school' | 'moderator' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  schoolName?: string;
  createdAt: string;
  roleType?: 'administrative' | 'teacher';
  appointmentYear?: string;
  wilaya?: string;
  directorate?: string;
  jobTitle?: 'معلم' | 'مدقق' | 'مدير مدرسة' | 'مدير النظام' | string;
  subject?: string;
  phoneNumber?: string;
  gradesTaught?: string[];
}

export type AssessmentStatus = 'Pending' | 'In Progress' | 'Approved' | 'Revision Request' | 'Grade Revision';

export interface Assessment {
  id: string;
  title: string;
  type: 'test' | 'quiz' | string;
  grade: string;
  subject: string;
  description: string;
  questions: string;      // The actual questions/text of the test
  keyAnswer: string;      // Marked marking schemes / answers
  status: AssessmentStatus;
  schoolId: string;
  schoolName: string;
  schoolEmail: string;
  moderatorId?: string | null;
  moderatorName?: string | null;
  feedback?: string | null;
  isPdf?: boolean;
  pdfName?: string | null;
  pdfSize?: string | null;
  pdfData?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  assessmentId: string;
  action: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  comment?: string;
  createdAt: string;
}

export interface StudentMark {
  name: string;
  level: string;
  mark: string;
  notes: string;
}

export interface ObservationDetail {
  element: string;
  gradeClass: string;
  tool: string;
  status: string;
  notes: string;
}

export interface ArchivedForm {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  assessmentType: 'test' | 'quiz';
  grade: string;
  subject: string;
  schoolName: string;
  schoolId: string;
  
  teacherName: string;
  teacherFileNo: string;
  appointmentYear: string;
  directorate: string;
  visitDate: string;
  subjectName: string;
  academicYear: string;
  semester: string;
  suggestedDevelopment: string;
  examinerName: string;
  principalName: string;
  
  students: StudentMark[];
  observations: ObservationDetail[];
  
  isSigned: boolean;
  signedAt?: string;
  signedByPrincipalName?: string;
  signatureQrData?: string;
  signatureStampUrl?: string;

  isTeacherSigned?: boolean;
  teacherSignedAt?: string;
  teacherSignedName?: string;
  teacherSignatureQrData?: string;
  teacherSignatureStampUrl?: string;

  isExaminerSigned?: boolean;
  examinerSignedAt?: string;
  examinerSignedName?: string;
  examinerSignatureQrData?: string;
  examinerSignatureStampUrl?: string;
  conformanceStatus?: 'conforming' | 'non-conforming';
  hasGradeRevisions?: boolean;
  
  createdAt: string;
  updatedAt: string;
}

export interface FormDesignSettings {
  primaryFont: string;
  monoFont: string;
  titleSize: string;
  headerDetailsSize: string;
  tableHeaderSize: string;
  tableBodySize: string;
  notesSize: string;
  primaryColor: string;
  secondaryColor: string;
  tablePaddingY: string;
  outerPadding: string;
  borderWidth: string;
  borderType: 'solid' | 'dashed' | 'double';
  titleTextAr: string;
  titleTextEn: string;
  subTitleTextAr: string;
  subTitleTextEn: string;
  showWatermark: boolean;
  watermarkText: string;

  // New settings for total control of the form content (shaping the form)
  reportTitleAr?: string;
  reportTitleEn?: string;
  labelSchoolAr?: string;
  labelSchoolEn?: string;
  labelAcademicAr?: string;
  labelAcademicEn?: string;
  labelTeacherAr?: string;
  labelTeacherEn?: string;
  labelSubjectAr?: string;
  labelSubjectEn?: string;
  labelFileNumberAr?: string;
  labelFileNumberEn?: string;
  labelYearOfAppointmentAr?: string;
  labelYearOfAppointmentEn?: string;
  labelDirectorateAr?: string;
  labelDirectorateEn?: string;
  labelSpecializationAr?: string;
  labelSpecializationEn?: string;
  labelVisitDateAr?: string;
  labelVisitDateEn?: string;

  colIdAr?: string;
  colStudentNameAr?: string;
  colClassAr?: string;
  colToolAr?: string;
  colScoreBeforeAr?: string;
  colScoreAfterAr?: string;
  colReasonAr?: string;

  sectionDevelopmentAr?: string;
  sectionAuditorSignAr?: string;
  sectionPrincipalSignAr?: string;
  sectionTeacherSignAr?: string;
  
  showTeacherSignature?: boolean;
  showSultanateLogo?: boolean;
  cardBackgroundType?: 'plain' | 'shaded' | 'subtle-grid';
  tableHeaderBg?: string;
  signatureLayout?: 'horizontal' | 'vertical';

  // Table specific styling properties requested by user
  tableBorderWidth?: string;
  tableBorderType?: 'solid' | 'dashed' | 'dotted' | 'double' | 'none';
  tableBorderColor?: string;
  tableOuterBorderColor?: string;
  tableOuterBorderWidth?: string;
  tableGridPattern?: 'full' | 'horizontal' | 'vertical' | 'none';
  
  // Spacing & movement properties (Margins and positions)
  tableMarginTop?: string;
  tableMarginBottom?: string;
  sectionSpacingY?: string;
  headerMarginBottom?: string;
  metaMarginBottom?: string;
  legendPaddingY?: string;
  signaturesPaddingY?: string;
  printPageMarginX?: string;
  printPageMarginY?: string;
  printPagePadding?: string;
  printZoom?: string;
  
  // Stamp global/default template placement offset variables
  stampOffsetX?: number;
  stampOffsetY?: number;
}

export interface SchoolDoc {
  id: string;
  nameAr: string;
  nameEn: string;
  wilayaId: string;
  wilayaAr: string;
  wilayaEn: string;
  stampUrl?: string;
  stampName?: string;
  stampUploadedAt?: string;
  stampUploadedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SchoolReport {
  id?: string;
  titleAr: string;
  titleEn?: string;
  schoolId: string;
  schoolName: string;
  semester: 'first' | 'second';
  content?: string;
  fileLink?: string;
  pdfData: string; // Base64 or standard URL
  pdfName?: string;
  pdfSize?: number;
  senderId: string;
  senderName: string;
  isRead?: boolean;
  readAt?: string;
  readBy?: string;
  createdAt: string;
  updatedAt: string;
}



export interface TeacherNotification {
  id?: string;
  teacherId: string;
  teacherName: string;
  titleAr: string;
  titleEn: string;
  messageAr: string;
  messageEn: string;
  subject?: string;
  read: boolean;
  createdAt: string;
  type: 'nudge' | 'alert' | 'info';
}
