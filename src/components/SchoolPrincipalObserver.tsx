import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  GraduationCap, 
  FileText, 
  CheckCircle2, 
  HelpCircle, 
  AlertCircle, 
  Clock, 
  Sparkles, 
  Eye, 
  ChevronDown, 
  ChevronUp,
  Bell,
  MailCheck,
  Send,
  Check,
  BookOpen,
  ArrowRight,
  ClipboardCheck,
  CheckSquare,
  FileCheck2,
  ListFilter
} from 'lucide-react';
import { UserProfile, Assessment } from '../types';
import { Language, translateGrade, translateSubject, translateStatus } from '../lib/translations';
import { getAllUserProfiles } from '../services/db';
import { Badge } from './Badge';

// School name normalizer to pair variations perfectly
export const normalizeSchoolName = (name: string): string => {
  if (!name) return "";
  return name.toLowerCase()
    .replace(/(basic\s+education\s+school|school|مدرسة|للتعليم|الأساسي|الأساسية|التعليم|الخاصة|الخاص)/gi, '')
    .replace(/[\s\-_]/g, '')
    .trim();
};

export const isSameSchool = (school1?: string, school2?: string): boolean => {
  if (!school1 || !school2) return false;
  const s1 = normalizeSchoolName(school1);
  const s2 = normalizeSchoolName(school2);
  return s1.includes(s2) || s2.includes(s1);
};

interface SchoolPrincipalObserverProps {
  userProfile: UserProfile;
  assessments: Assessment[];
  language: Language;
  onInspect: (assessment: Assessment) => void;
  onSuccess: (msg: string) => void;
}

interface TeacherStatus {
  profile: UserProfile;
  uploads: Assessment[];
  complianceStatus: 'completed' | 'partial' | 'none';
  hasNudgeSent: boolean;
}

export function SchoolPrincipalObserver({
  userProfile,
  assessments,
  language,
  onInspect,
  onSuccess
}: SchoolPrincipalObserverProps) {
  const [teachers, setTeachers] = useState<TeacherStatus[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedTeacherId, setExpandedTeacherId] = useState<string | null>(null);
  const [nudgedTeacherIds, setNudgedTeacherIds] = useState<Record<string, boolean>>({});
  const [subjectFilter, setSubjectFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  const principalSchool = userProfile.schoolName || 'Al-Azaiba School';

  useEffect(() => {
    async function loadTeachers() {
      setLoading(true);
      try {
        // Fetch all profiles from the database
        const allProfiles = await getAllUserProfiles();
        
        // Filter those who are role school & type teacher, and belong to the same school
        const sameSchoolTeachers = allProfiles.filter(p => 
          p.role === 'school' && 
          p.roleType === 'teacher' && 
          isSameSchool(p.schoolName, principalSchool)
        );

        // Core simulated teachers for a robust and satisfying visual experience in sandbox
        const DEFAULT_SIMULATED_TEACHERS: UserProfile[] = [
          {
            uid: 'sim-teacher-math',
            name: language === 'ar' ? 'أ. وليد الريامي' : 'Mr. Waleed Al-Riyami',
            email: 'riyami.math@moe.om',
            role: 'school',
            roleType: 'teacher',
            schoolName: principalSchool,
            subject: 'Mathematics',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString()
          },
          {
            uid: 'sim-teacher-arabic',
            name: language === 'ar' ? 'أ. عائشة الرواحية' : 'Mrs. Aisha Al-Rawahi',
            email: 'rawahi.arabic@moe.om',
            role: 'school',
            roleType: 'teacher',
            schoolName: principalSchool,
            subject: 'Arabic Language',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString()
          },
          {
            uid: 'sim-teacher-it',
            name: language === 'ar' ? 'أ. أمينة البلوشية' : 'Mrs. Amina Al-Balushi',
            email: 'balushi.it@moe.om',
            role: 'school',
            roleType: 'teacher',
            schoolName: principalSchool,
            subject: 'Information Technology',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString()
          },
          {
            uid: 'sim-teacher-islamic',
            name: language === 'ar' ? 'الشيخ أحمد الحوسني' : 'Sheikh Ahmed Al-Hosni',
            email: 'hosni.islamic@moe.om',
            role: 'school',
            roleType: 'teacher',
            schoolName: principalSchool,
            subject: 'Islamic Studies',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString()
          }
        ];

        // Combine database teachers and sandbox simulated teachers avoiding duplicates
        const combinedTeachersList = [...sameSchoolTeachers];
        DEFAULT_SIMULATED_TEACHERS.forEach(st => {
          const alreadyExists = combinedTeachersList.some(t => 
            t.email.toLowerCase() === st.email.toLowerCase() || 
            t.subject === st.subject
          );
          if (!alreadyExists) {
            combinedTeachersList.push(st);
          }
        });

        // Now map each teacher with their uploads in the assessments list
        const processed: TeacherStatus[] = combinedTeachersList.map(teacher => {
          // Identify matching assessments uploaded by this teacher
          // A document belongs to this teacher if matching user id or email or name
          const teacherUploads = assessments.filter(ass => 
            ass.schoolId === teacher.uid || 
            (ass.schoolEmail && ass.schoolEmail.toLowerCase() === teacher.email.toLowerCase())
          );

          // Calculate compliance: teachers are expected to have at least one complete syllabus exam/quiz
          let statusResult: 'completed' | 'partial' | 'none' = 'none';
          if (teacherUploads.length >= 2) {
            statusResult = 'completed';
          } else if (teacherUploads.length === 1) {
            statusResult = 'partial';
          }

          return {
            profile: teacher,
            uploads: teacherUploads,
            complianceStatus: statusResult,
            hasNudgeSent: false
          };
        });

        setTeachers(processed);
      } catch (err) {
        console.error("Error matching school teachers: ", err);
      } finally {
        setLoading(false);
      }
    }
    loadTeachers();
  }, [assessments, principalSchool, language]);

    // Track total supportive reminders sent to keep layout active
    const nudgeCount = Object.keys(nudgedTeacherIds).length;

    // Helper to send reminder nudge
    const handleSendNudge = (teacherId: string, teacherName: string, subject: string) => {
      setNudgedTeacherIds(prev => ({ ...prev, [teacherId]: true }));
      const msg = language === 'ar'
        ? `تم إرسال تنبيه متابعة وتدقيق تربوي بنجاح إلى ${teacherName} لمتابعة مرفوعات مادة ${translateSubject(subject, 'ar')}.`
        : `Supportive syllabus upload reminder successfully dispatched to ${teacherName} regarding ${translateSubject(subject, 'en')} curriculum schedule.`;
      onSuccess(msg);
    };

    // Calculate aggregated school stats
    const totalTeachers = teachers.length;
    const completedUploadsCount = teachers.filter(t => t.complianceStatus === 'completed').length;
    const partialUploadsCount = teachers.filter(t => t.complianceStatus === 'partial').length;
    const noneUploadsCount = teachers.filter(t => t.complianceStatus === 'none').length;
    const overallComplianceMultiplier = totalTeachers > 0 
      ? Math.round(((completedUploadsCount * 1 + partialUploadsCount * 0.5) / totalTeachers) * 100) 
      : 0;

    const totalPaperCount = teachers.reduce((acc, current) => acc + current.uploads.length, 0);
    const approvedPaperCount = assessments.filter(a => a.status === 'Approved').length;
    const pendingPaperCount = assessments.filter(a => a.status === 'Pending').length;
    const revisionPaperCount = assessments.filter(a => a.status === 'Revision Request').length;

    // Filtration
    const filteredTeachers = teachers.filter(t => {
      const matchSearch = t.profile.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.profile.subject?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchSubject = !subjectFilter || t.profile.subject === subjectFilter;
      const matchStatus = !statusFilter || t.complianceStatus === statusFilter;
      
      return matchSearch && matchSubject && matchStatus;
    });

    return (
      <div className="space-y-7 animate-in fade-in duration-200">
        
        {/* TOP COMPACT BRANDING BAR */}
        <div className="bg-[#051C3F] text-white p-6 sm:p-7 rounded-3xl border border-indigo-900/30 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden shadow-lg">
          <div className="absolute inset-0 bg-radial-at-tr from-amber-500/10 via-transparent to-transparent opacity-60 pointer-events-none"></div>
          <div className="space-y-2 text-center md:text-left">
            <span className="bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest block w-fit mx-auto md:mx-0 shadow-xs">
              {language === 'ar' ? 'منصة متابعة الإدارة المدرسية' : 'School Administration Tracker'}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold font-heading tracking-tight leading-normal">
              {language === 'ar' ? `لوحة متابعة ومراقبة المعلمين - مدرسة العذيبة` : `Academic Staff Submission Observer — ${principalSchool}`}
            </h2>
            <p className="text-slate-350 text-xs font-sans max-w-xl font-medium leading-relaxed">
              {language === 'ar' 
                ? 'متابعة وإشراف على التقييمات الدراسية وأوراق الامتحانات المرفوعة من قبل كوادر المدرسة للتأكد من مطابقة معايير وزارة التعليم.' 
                : 'Observe, coordinate and audit syllabus assessments and blueprints uploaded by your school faculty before national Ministry moderation review.'}
            </p>
          </div>
          <div className="bg-white/10 px-5 py-4.5 rounded-2xl border border-white/15 text-center shrink-0 min-w-[200px] shadow-inner">
            <p className="text-amber-400 text-[10px] font-black uppercase tracking-widest">{language === 'ar' ? 'معدل التزام المدرسة الموحد' : 'Unified School Compliance'}</p>
            <div className="flex items-baseline justify-center gap-1.5 mt-0.5">
              <span className="text-3xl font-black text-white">{overallComplianceMultiplier}%</span>
            </div>
            {/* Minimal Progress Bar */}
            <div className="w-full bg-indigo-950/40 h-1.5 rounded-full mt-2.5 border border-indigo-900/40">
              <div 
                className="bg-amber-400 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${overallComplianceMultiplier}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* HIGH-CONTRAST METRICS STATS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200/50 shadow-xs space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">
                {language === 'ar' ? 'الكوادر المسجلة' : 'Staff Size'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-650 font-bold text-sm shrink-0">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 font-heading">{totalTeachers} {language === 'ar' ? 'معلمين' : 'Teachers'}</p>
              <p className="text-[10.5px] text-slate-400 mt-1">{language === 'ar' ? 'الطاقم الأكاديمي النشط للتقييم' : 'Active faculty evaluated in portal'}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/50 shadow-xs space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">
                {language === 'ar' ? 'اكتمال الرفع' : 'Upload Status'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 font-heading">
                {completedUploadsCount} / {totalTeachers}
              </p>
              <p className="text-[10.5px] text-slate-400 mt-1 flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {language === 'ar' ? `${completedUploadsCount} معلمين قد استوفوا النصاب المعتمد` : `${completedUploadsCount} teachers fully compliant`}
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/50 shadow-xs space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono">
                {language === 'ar' ? 'ملفات التقييم بالمدرسة' : 'School Blueprints'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 font-heading">
                {totalPaperCount} {language === 'ar' ? 'مرفوعات' : 'Files'}
              </p>
              <p className="text-[10.5px] text-slate-400 mt-1">
                {language === 'ar' 
                  ? `${approvedPaperCount} معتمد • ${pendingPaperCount} بانتظار الوزارة` 
                  : `${approvedPaperCount} Approved • ${pendingPaperCount} Pending MOE`}
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/50 shadow-xs space-y-2 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest font-mono font-sans">
                {language === 'ar' ? 'التوجيهات والتنبيهات المدرسية' : 'Nudges Demanded'}
              </span>
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 shrink-0">
                <Bell className="w-4 h-4" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 font-heading">
                {nudgeCount} {language === 'ar' ? 'تذكيرات ودية' : 'Nudges'}
              </p>
              <p className="text-[10.5px] text-slate-400 mt-1">
                {language === 'ar' ? 'تذكيرات أرسلت لتشجيع المعلمين غير الملتزمين' : 'Formal reminders sent to incentivize uploads'}
              </p>
            </div>
          </div>

        </div>

        {/* CONTROLS FILTRATION HEADER CARD */}
        <div className="bg-white rounded-3xl border border-slate-200/60 p-5 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <h3 className="font-bold text-slate-800 text-sm sm:text-base font-heading flex items-center gap-2">
              <GraduationCap className="text-indigo-650 w-5 h-5" />
              {language === 'ar' ? 'دليل تقدم الكادر التعليمي ومستنداتهم' : 'Academic Faculty Progress & Upload Log Directory'}
            </h3>
            
            {/* Dropdown Filters */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <div className="flex items-center gap-1.5">
                <ListFilter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <select 
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-650 bg-slate-50 cursor-pointer font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="">{language === 'ar' ? 'جميع المواد' : 'All Subjects'}</option>
                  {((Array.from(new Set(teachers.map(t => t.profile.subject).filter(Boolean))) as string[])).map(subj => (
                    <option key={subj} value={subj}>{translateSubject(subj, language)}</option>
                  ))}
                </select>

                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs text-slate-650 bg-slate-50 cursor-pointer font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="">{language === 'ar' ? 'جميع الحالات' : 'All Compliance'}</option>
                  <option value="completed">{language === 'ar' ? 'مستوفي النصاب (مكتمل)' : 'Fully Compliant'}</option>
                  <option value="partial">{language === 'ar' ? 'جزئي (مرفوعات ناقصة)' : 'Partial Uploads'}</option>
                  <option value="none">{language === 'ar' ? 'متأخر (لم يرفع ملفات)' : 'No Submissions'}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Keyword Search input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={language === 'ar' ? 'البحث بالاسم بريد المعلم أو المادة الدراسية...' : 'Search teacher by name, email academic details or subject...'}
              className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-xs text-slate-705 focus:outline-none focus:border-indigo-500 bg-slate-50/30 font-medium font-sans"
            />
          </div>
        </div>

        {/* STAFF LIST TABLE CARD WITH ACCORDIONS */}
        <div className="bg-white rounded-3xl border border-slate-200/50 shadow-sm overflow-hidden">
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-450 text-[10px] font-extrabold uppercase tracking-widest font-sans">
                  <th className="py-4.5 px-6">{language === 'ar' ? 'المعلم والبريد الإلكتروني' : 'Teacher & Email'}</th>
                  <th className="py-4.5 px-4">{language === 'ar' ? 'التخصص والمادة' : 'Subject Field'}</th>
                  <th className="py-4.5 px-4">{language === 'ar' ? 'الملفات المرفوعة' : 'Blueprints Uploaded'}</th>
                  <th className="py-4.5 px-4">{language === 'ar' ? 'مطابقة الخطة والمستندات' : 'Syllabus Tracking'}</th>
                  <th className="py-4.5 px-6 text-right">{language === 'ar' ? 'الإجراء الإداري والمتابعة' : 'Observation Management'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans text-slate-800 text-xs">
                {filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-slate-400">
                      <div className="space-y-2">
                        <AlertCircle className="w-9 h-9 text-slate-350 mx-auto opacity-70" />
                        <p className="font-medium text-slate-500">{language === 'ar' ? 'لا توجد فلاتر متطابقة مع المعلمين.' : 'No teachers mathcing these search filters.'}</p>
                        <p className="text-[11px] text-slate-400">{language === 'ar' ? 'جرب تغيير معايير البحث أو تصفية الحالات.' : 'Try adjusting filters to view the Al-Azaiba School roster.'}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map(({ profile, uploads, complianceStatus }, idx) => {
                    const isExpanded = expandedTeacherId === profile.uid;
                    const hasNudge = nudgedTeacherIds[profile.uid];

                    // Visual badge style for compliance status
                    let statusLabel = '';
                    let statusColor = '';
                    if (complianceStatus === 'completed') {
                      statusLabel = language === 'ar' ? 'مستوفي النصاب (🟢)' : 'Fully Compliant';
                      statusColor = 'bg-emerald-50 text-emerald-700 border border-emerald-150 font-bold';
                    } else if (complianceStatus === 'partial') {
                      statusLabel = language === 'ar' ? 'مرفوع جزئي (🟡)' : 'Partial Uploads';
                      statusColor = 'bg-amber-50 text-amber-700 border border-amber-150 font-bold';
                    } else {
                      statusLabel = language === 'ar' ? 'لم يرفع بعد (🔴)' : 'Pending Submissions';
                      statusColor = 'bg-rose-50 text-rose-700 border border-rose-150 font-bold';
                    }

                    return (
                      <React.Fragment key={`teacher-frag-${profile.uid || idx}-${idx}`}>
                        
                        {/* Core Teacher Row */}
                        <tr 
                          onClick={() => setExpandedTeacherId(isExpanded ? null : profile.uid)}
                          className={`hover:bg-slate-50/60 transition-colors cursor-pointer ${
                            isExpanded ? 'bg-indigo-50/10' : ''
                          }`}
                        >
                          {/* Name Email */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-indigo-600/10 text-indigo-700 font-heading font-black flex items-center justify-center border border-indigo-100 uppercase text-xs shrink-0">
                                {profile.name.substring(0, 2)}
                              </div>
                              <div className="space-y-0.5">
                                <h5 className="font-bold text-slate-900 text-xs sm:text-sm font-heading flex items-center gap-1.5 hover:text-indigo-600 transition-colors">
                                  {profile.name}
                                </h5>
                                <code className="text-[10px] text-slate-400 font-mono tracking-normal pr-0.5">{profile.email}</code>
                              </div>
                            </div>
                          </td>

                          {/* Subject Specialty */}
                          <td className="py-4 px-4 font-semibold text-slate-700">
                            {translateSubject(profile.subject || 'Syllabus Core', language)}
                          </td>

                          {/* Upload Count Grid */}
                          <td className="py-4 px-4 font-mono font-bold">
                            <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded-lg text-xs border border-slate-200 shadow-3xs">
                              {uploads.length} {uploads.length === 1 ? (language === 'ar' ? 'مستند' : 'file') : (language === 'ar' ? 'مستندات' : 'files')}
                            </span>
                          </td>

                          {/* Syllabus compliance tracker tag */}
                          <td className="py-4 px-4 text-xs font-semibold">
                            <span className={`px-2.5 py-1 rounded-full text-[10.5px] font-sans ${statusColor}`}>
                              {statusLabel}
                            </span>
                          </td>

                          {/* Observation controller triggers */}
                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2.5" onClick={e => e.stopPropagation()}>
                              
                              {/* Detailed Dropdown toggle */}
                              <button
                                type="button"
                                onClick={() => setExpandedTeacherId(isExpanded ? null : profile.uid)}
                                className="p-1.5 text-slate-400 hover:text-slate-650 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer shrink-0"
                                title={language === 'ar' ? 'عرض المستندات المرفوعة' : 'View Uploaded Documents'}
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>

                              {/* Supportive Nudge Button */}
                              {complianceStatus !== 'completed' ? (
                                <button
                                  type="button"
                                  onClick={() => handleSendNudge(profile.uid, profile.name, profile.subject || 'Syllabus Science')}
                                  disabled={hasNudge}
                                  className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5 shadow-3xs cursor-pointer transition-all ${
                                    hasNudge 
                                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed' 
                                      : 'bg-amber-400 hover:bg-amber-500 text-slate-950 border border-amber-300 hover:scale-[1.01]'
                                  }`}
                                >
                                  {hasNudge ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>{language === 'ar' ? 'أرسل التنبيه' : 'Nudge Sent'}</span>
                                    </>
                                  ) : (
                                    <>
                                      <Send className="w-3 h-3 text-slate-900" />
                                      <span>{language === 'ar' ? 'تذكير متابعة' : 'Support Nudge'}</span>
                                    </>
                                  )}
                                </button>
                              ) : (
                                <span className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-[10px] font-black border border-emerald-100 uppercase flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5" />
                                  {language === 'ar' ? 'ملتزم كامل' : 'Compliant'}
                                </span>
                              )}

                            </div>
                          </td>

                        </tr>

                        {/* Interactive Accordion Subtable: File details */}
                        {isExpanded && (
                          <tr className="bg-indigo-50/5/25">
                            <td colSpan={5} className="py-4 px-6 border-b border-indigo-100/30">
                              <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/50 space-y-4 animate-in slide-in-from-top-1 duration-150">
                                
                                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                  <h6 className="font-heading font-black text-[#051C3F] text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                                    <BookOpen className="w-4 h-4 text-indigo-600" />
                                    {language === 'ar' ? `المرفوعات والامتحانات التعليمية لـ ${profile.name}` : `Assessment Blueprints Uploaded by ${profile.name}`}
                                  </h6>
                                  <span className="text-[10px] font-semibold text-slate-400">
                                    {uploads.length} {language === 'ar' ? 'أوراق تقييم مسجلة' : 'papers registered'}
                                  </span>
                                </div>

                                {uploads.length === 0 ? (
                                  <div className="text-center py-6 text-slate-400 text-xs font-sans">
                                    <AlertCircle className="w-6 h-6 text-slate-300 mx-auto mb-1.5" />
                                    <p>{language === 'ar' ? 'لم يقم هذا المعلم برفع أي تقييمات إلى البوابة بعد.' : 'This academic has not uploaded any specifications yet.'}</p>
                                    <p className="text-[10.5px] text-slate-350 mt-0.5">{language === 'ar' ? 'انقر على "تذكير متابعة" لإرسال تذكير الدعم الإداري.' : 'Click "Support Nudge" to politely prompt them.'}</p>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {uploads.map((docItem, index) => (
                                      <div 
                                        key={`doc-item-${docItem.id || index}-${index}`}
                                        className="bg-white p-3 border border-slate-200 rounded-xl hover:border-indigo-400/50 shadow-3xs flex flex-col justify-between gap-3 group transition-colors"
                                      >
                                        <div className="flex items-start justify-between gap-1.5">
                                          <div className="space-y-0.5">
                                            <span className="bg-slate-100 text-slate-500 font-extrabold text-[8.5px] px-1.5 py-0.5 rounded uppercase tracking-wider block w-fit">
                                              {docItem.type === 'test' ? (language === 'ar' ? 'امتحان موحد' : 'Unified Exam') : (language === 'ar' ? 'اختبار قصير' : 'Unit Quiz')}
                                            </span>
                                            <h4 className="font-bold text-slate-900 group-hover:text-indigo-650 transition-colors text-xs line-clamp-1 pr-1 font-heading">
                                              {docItem.title}
                                            </h4>
                                            <div className="flex items-center text-[10px] text-slate-400 gap-2 font-semibold">
                                              <span>{translateGrade(docItem.grade, language)}</span>
                                              <span>•</span>
                                              <span>
                                                {new Date(docItem.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                                              </span>
                                            </div>
                                          </div>

                                          <Badge status={docItem.status} language={language} />
                                        </div>

                                        {/* Row footer: feedback snapshot and Inspector button */}
                                        <div className="flex items-center justify-between border-t border-slate-50 pt-2 text-[10.5px]">
                                          <div className="truncate max-w-[170px] text-slate-450 italic font-medium font-sans">
                                            {docItem.feedback ? (
                                              <span>💬 {docItem.feedback}</span>
                                            ) : (
                                              <span className="text-slate-350">{language === 'ar' ? 'لا توجد ملاحظات مراجعة بعد' : 'No pedagogical feedback yet'}</span>
                                            )}
                                          </div>
                                          
                                          {/* Inspect Action */}
                                          <button
                                            type="button"
                                            onClick={() => onInspect(docItem)}
                                            className="px-2.5 py-1 text-indigo-750 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 rounded-lg text-[10px] font-black tracking-normal flex items-center gap-1 cursor-pointer transition-all shrink-0"
                                          >
                                            <Eye className="w-3.5 h-3.5 text-indigo-650" />
                                            <span>{language === 'ar' ? 'تفاصيل المطابقة' : 'Inspect Details'}</span>
                                          </button>
                                        </div>

                                      </div>
                                    ))}
                                  </div>
                                )}

                              </div>
                            </td>
                          </tr>
                        )}

                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    );
  }
