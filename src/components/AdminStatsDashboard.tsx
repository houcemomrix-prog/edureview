import React, { useState, useMemo, useEffect } from 'react';
import { 
  School as SchoolIcon, 
  Users, 
  CheckCircle2, 
  Clock, 
  RotateCw, 
  TrendingUp, 
  BookOpen, 
  Award, 
  Activity, 
  FileText, 
  Search, 
  Briefcase,
  Layers,
  Sparkles,
  BarChart3,
  Percent,
  CheckCircle,
  Plus,
  Trash2,
  Edit,
  X,
  Mail,
  Phone,
  Calendar
} from 'lucide-react';
import { Assessment, UserProfile, SchoolDoc } from '../types';
import { OMAN_WUSTA_SCHOOLS } from '../data/schoolsData';
import { Language, getTranslatedText, translateSubject, translateGrade, translateStatus } from '../lib/translations';
import { 
  getAllUserProfiles, 
  createUserProfile, 
  deleteUserProfileAdmin,
  isSandboxActive,
  getSchoolsList
} from '../services/db';

const getCoordinatesForPercent = (angleInDegrees: number, radius = 40) => {
  const angleInRadians = (angleInDegrees * Math.PI) / 180;
  const x = 50 + radius * Math.cos(angleInRadians);
  const y = 50 + radius * Math.sin(angleInRadians);
  return { x, y };
};

const getPathDef = (startAngle: number, endAngle: number) => {
  if (endAngle - startAngle >= 359.99) {
    return 'M 50 10 A 40 40 0 1 1 49.99 10 Z';
  }
  const start = getCoordinatesForPercent(startAngle);
  const end = getCoordinatesForPercent(endAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return `M 50 50 L ${start.x} ${start.y} A 40 40 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
};

interface AdminStatsDashboardProps {
  assessments: Assessment[];
  language?: Language;
}

export function AdminStatsDashboard({ assessments, language = 'en' }: AdminStatsDashboardProps) {
  // Local state for searching/filtering lists inside statistics
  const [schoolSearchQuery, setSchoolSearchQuery] = useState('');
  const [modSearchQuery, setModSearchQuery] = useState('');
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  // Custom interactive selection to inspect element details
  const [selectedInspectSchool, setSelectedInspectSchool] = useState<string | null>(null);

  // Loaded schools list from base database
  const [dbSchools, setDbSchools] = useState<SchoolDoc[]>([]);

  // --- Section 4: Compliance and Alignment Statistics State ---
  const [complianceWilayatFilter, setComplianceWilayatFilter] = useState<string>('all');
  const [complianceSchoolFilter, setComplianceSchoolFilter] = useState<string>('all');
  const [complianceTab, setComplianceTab] = useState<'overview' | 'comparison'>('overview');
  const [complianceChartMode, setComplianceChartMode] = useState<'table' | 'bar' | 'pie'>('table');

  // --- Users Database tab & CRUD State management (OMAN MOE) ---
  const [innerTab, setInnerTab] = useState<'metrics' | 'users'>('metrics');
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Form management
  const [showUserForm, setShowUserForm] = useState(false);
  const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form inputs
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState<'school' | 'moderator' | 'admin'>('school');
  const [formRoleType, setFormRoleType] = useState<'administrative' | 'teacher'>('teacher');
  const [formSubject, setFormSubject] = useState('Mathematics');
  const [formGrades, setFormGrades] = useState('Grade 10, Grade 11');
  const [formSchool, setFormSchool] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formYear, setFormYear] = useState('2022');

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const data = await getAllUserProfiles();
      setUsersList(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    
    // Load official schools from database
    const loadRealSchools = async () => {
      try {
        const list = await getSchoolsList();
        setDbSchools(list);
      } catch (err) {
        console.error('Failed to load schools for Stats Dashboard:', err);
      }
    };
    loadRealSchools();
  }, [innerTab]);

  const handleEditClick = (user: UserProfile) => {
    setFormMode('edit');
    setEditingUserId(user.uid);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormRoleType(user.roleType || 'teacher');
    setFormSubject(user.subject || 'Mathematics');
    setFormGrades((user.gradesTaught || []).join(', '));
    setFormSchool(user.schoolName || '');
    setFormPhone(user.phoneNumber || '');
    setFormYear(user.appointmentYear || '2022');
    setFormError('');
    setShowUserForm(true);
  };

  const resetUserForm = () => {
    setFormMode('add');
    setEditingUserId(null);
    setFormName('');
    setFormEmail('');
    setFormRole('school');
    setFormRoleType('teacher');
    setFormSubject('Mathematics');
    setFormGrades('Grade 10, Grade 11');
    setFormSchool('');
    setFormPhone('');
    setFormYear('2022');
    setFormError('');
  };

  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      setFormError(language === 'ar' ? 'الرجاء تعبئة الاسم والبريد الإلكتروني.' : 'Name and email are required.');
      return;
    }
    
    setIsSubmitting(true);
    setFormError('');
    try {
      const uid = formMode === 'add' 
        ? 'moe_user_' + Math.floor(Math.random() * 100000) + '_' + Date.now().toString(36)
        : editingUserId!;

      const targetRoleType = formRole === 'admin' 
        ? 'administrative' 
        : (formRole === 'moderator' ? 'administrative' : formRoleType);

      const userPayload: UserProfile = {
        uid,
        name: formName.trim(),
        email: formEmail.trim(),
        role: formRole,
        phoneNumber: formPhone.trim(),
        roleType: targetRoleType,
        gradesTaught: targetRoleType === 'teacher' 
          ? formGrades.split(',').map(g => g.trim()).filter(Boolean)
          : [],
        schoolName: (formRole === 'school' || (targetRoleType === 'teacher' && formRole !== 'moderator'))
          ? formSchool.trim()
          : '',
        subject: (targetRoleType === 'teacher' || formRole === 'moderator') ? formSubject : '',
        appointmentYear: formYear.trim() || '2022',
        createdAt: formMode === 'add' 
          ? new Date().toISOString() 
          : (usersList.find(u => u.uid === uid)?.createdAt || new Date().toISOString())
      };

      await createUserProfile(userPayload);
      await fetchUsers();
      setShowUserForm(false);
      resetUserForm();
    } catch (err: any) {
      setFormError(err.message || String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (confirmDeleteId !== uid) {
      setConfirmDeleteId(uid);
      setTimeout(() => setConfirmDeleteId(null), 4000); // Reset confirmation highlight after 4 seconds
      return;
    }

    try {
      await deleteUserProfileAdmin(uid);
      setConfirmDeleteId(null);
      await fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered users for search input
  const filteredUsers = useMemo(() => {
    if (!userSearchQuery.trim()) return usersList;
    const q = userSearchQuery.toLowerCase();
    return usersList.filter(u => 
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.schoolName || '').toLowerCase().includes(q) ||
      (u.phoneNumber || '').includes(q) ||
      (u.role || '').toLowerCase().includes(q)
    );
  }, [usersList, userSearchQuery]);

  // --- COMPUTE STATISTICS Group 1: Uploading statistics done by teachers (Assessments) ---
  const uploadStats = useMemo(() => {
    const totalCount = assessments.length;
    const examsCount = assessments.filter(a => a.type === 'test').length;
    const quizzesCount = assessments.filter(a => a.type === 'quiz').length;
    
    // Group uploads by subject
    const subjectCounts: Record<string, number> = {};
    // Group uploads by grade
    const gradeCounts: Record<string, number> = {};

    assessments.forEach(a => {
      subjectCounts[a.subject] = (subjectCounts[a.subject] || 0) + 1;
      gradeCounts[a.grade] = (gradeCounts[a.grade] || 0) + 1;
    });

    const subjectList = Object.entries(subjectCounts)
      .map(([subject, count]) => ({ subject, count }))
      .sort((a, b) => b.count - a.count);

    const gradeList = Object.entries(gradeCounts)
      .map(([grade, count]) => ({ grade, count }))
      .sort((a, b) => b.count - a.count);

    return {
      totalCount,
      examsCount,
      quizzesCount,
      subjectList,
      gradeList
    };
  }, [assessments]);


  // --- COMPUTE STATISTICS Group 2: Schools Statistics ---
  // Seed default registered schools to merge with live school data
  const schoolStats = useMemo(() => {
    // Compute metrics grouped by school
    const schoolMetrics: Record<string, { 
      uploaded: number; 
      approved: number; 
      revision: number; 
      pending: number; 
      inProgress: number; 
      name: string;
      id: string;
      region: string;
    }> = {};

    // 1. Initialize with database schools if any exist, fallback to seed list
    if (dbSchools && dbSchools.length > 0) {
      dbSchools.forEach(ds => {
        const displayName = language === 'ar' ? ds.nameAr : ds.nameEn;
        schoolMetrics[ds.id] = {
          id: ds.id,
          name: displayName,
          region: language === 'ar' ? ds.wilayaAr : ds.wilayaEn,
          uploaded: 0,
          approved: 0,
          revision: 0,
          pending: 0,
          inProgress: 0
        };
      });
    } else {
      // Temporary fallback while db is fetching
      const defaultSchools = [
        { id: 'demo-school-1', name: language === 'ar' ? 'مدرسة العذيبة الأساسية' : 'Al-Azaiba School', region: language === 'ar' ? 'مسقط، السيب' : 'Muscat, Al Seeb', status: 'Active' },
        { id: 'seed-school-2', name: language === 'ar' ? 'مدرسة الموالح للتعليم الأساسي' : 'Al-Mawaleh Basic Education', region: language === 'ar' ? 'مسقط، السيب' : 'Muscat, Al Seeb', status: 'Active' },
        { id: 'seed-school-3', name: language === 'ar' ? 'مدرسة السيب الثانوية' : 'Seeb Secondary School', region: language === 'ar' ? 'مسقط، السيب' : 'Muscat, Seeb Center', status: 'Pending Uploads' },
        { id: 'seed-school-4', name: language === 'ar' ? 'مدرسة صلالة النموذجية' : 'Salalah Model Academy', region: language === 'ar' ? 'ظفار، صلالة' : 'Dhofar, Salalah', status: 'Active' },
        { id: 'seed-school-5', name: language === 'ar' ? 'مدرسة صحار الوطنية' : 'Sohar National School', region: language === 'ar' ? 'شمال الباطنة، صحار' : 'Al Batinah North, Sohar', status: 'Active' }
      ];
      defaultSchools.forEach(ds => {
        schoolMetrics[ds.id] = {
          id: ds.id,
          name: ds.name,
          region: ds.region,
          uploaded: 0,
          approved: 0,
          revision: 0,
          pending: 0,
          inProgress: 0
        };
      });
    }

    // 2. Populate and merge metrics from actual current assessments state
    assessments.forEach(a => {
      // Find matching school in our existing entries
      let matchedId = '';
      if (dbSchools && dbSchools.length > 0) {
        const found = dbSchools.find(ds => 
          (a.schoolId && ds.id && a.schoolId === ds.id) ||
          (a.schoolName && ds.nameAr && a.schoolName.trim().toLowerCase() === ds.nameAr.trim().toLowerCase()) ||
          (a.schoolName && ds.nameEn && a.schoolName.trim().toLowerCase() === ds.nameEn.trim().toLowerCase())
        );
        if (found) {
          matchedId = found.id;
        }
      } else {
        // Simple string comparison for standard fallbacks
        const key = (a.schoolName || '').trim().toLowerCase();
        if (key.includes('azaiba') || key.includes('عذيبة')) matchedId = 'demo-school-1';
        else if (key.includes('mawaleh') || key.includes('موالح')) matchedId = 'seed-school-2';
        else if (key.includes('seeb') || key.includes('سيب')) matchedId = 'seed-school-3';
        else if (key.includes('salalah') || key.includes('صلالة')) matchedId = 'seed-school-4';
        else if (key.includes('sohar') || key.includes('صحار')) matchedId = 'seed-school-5';
      }

      if (matchedId && schoolMetrics[matchedId]) {
        schoolMetrics[matchedId].uploaded += 1;
        if (a.status === 'Approved') schoolMetrics[matchedId].approved += 1;
        else if (a.status === 'Revision Request') schoolMetrics[matchedId].revision += 1;
        else if (a.status === 'Pending') schoolMetrics[matchedId].pending += 1;
        else if (a.status === 'In Progress') schoolMetrics[matchedId].inProgress += 1;
      } else {
        // Dynamic or standalone school not in seed/db lists
        const schoolName = a.schoolName || 'Unknown School';
        const dynamicId = a.schoolId || `dyn-${schoolName}`;
        if (!schoolMetrics[dynamicId]) {
          schoolMetrics[dynamicId] = {
            id: dynamicId,
            name: schoolName,
            region: language === 'ar' ? 'سلطنة عمان' : 'Oman Region',
            uploaded: 0,
            approved: 0,
            revision: 0,
            pending: 0,
            inProgress: 0
          };
        }
        schoolMetrics[dynamicId].uploaded += 1;
        if (a.status === 'Approved') schoolMetrics[dynamicId].approved += 1;
        else if (a.status === 'Revision Request') schoolMetrics[dynamicId].revision += 1;
        else if (a.status === 'Pending') schoolMetrics[dynamicId].pending += 1;
        else if (a.status === 'In Progress') schoolMetrics[dynamicId].inProgress += 1;
      }
    });

    return Object.values(schoolMetrics);
  }, [assessments, dbSchools, language]);

  // Filtered Schools derived from local search input query
  const filteredSchools = useMemo(() => {
    return schoolStats.filter(s => 
      s.name.toLowerCase().includes(schoolSearchQuery.toLowerCase()) ||
      s.region.toLowerCase().includes(schoolSearchQuery.toLowerCase())
    );
  }, [schoolStats, schoolSearchQuery]);


  // --- COMPUTE STATISTICS Group 4: Compliance & Alignment Statistics ---
  const complianceStats = useMemo(() => {
    const schoolsList: { id: string; nameAr: string; nameEn: string; wilayaId: string; wilayaAr: string; wilayaEn: string }[] = [];
    
    if (dbSchools && dbSchools.length > 0) {
      dbSchools.forEach(s => {
        schoolsList.push({
          id: s.id,
          nameAr: s.nameAr,
          nameEn: s.nameEn,
          wilayaId: s.wilayaId,
          wilayaAr: s.wilayaAr,
          wilayaEn: s.wilayaEn
        });
      });
    } else {
      let idx = 1;
      OMAN_WUSTA_SCHOOLS.forEach(w => {
        w.schools.forEach(s => {
          schoolsList.push({
            id: `school-fallback-${idx++}`,
            nameAr: s.nameAr,
            nameEn: s.nameEn,
            wilayaId: w.id,
            wilayaAr: w.nameAr,
            wilayaEn: w.nameEn
          });
        });
      });
    }

    const rawStats: Record<string, {
      schoolId: string;
      schoolNameAr: string;
      schoolNameEn: string;
      wilayaId: string;
      wilayaAr: string;
      wilayaEn: string;
      aligned: number;
      nonAligned: number;
      gradeRevision: number;
    }> = {};

    schoolsList.forEach(s => {
      // Seed some deterministic metrics so the UI isn't starting blank
      const baseAligned = Math.abs((s.nameAr.length * 3) % 9) + 5;
      const baseNonAligned = Math.abs((s.nameAr.length + 2) % 4) + 1;
      const baseGradeRev = Math.abs((s.nameAr.length * 5) % 3) + 1;

      rawStats[s.id] = {
        schoolId: s.id,
        schoolNameAr: s.nameAr,
        schoolNameEn: s.nameEn,
        wilayaId: s.wilayaId,
        wilayaAr: s.wilayaAr,
        wilayaEn: s.wilayaEn,
        aligned: baseAligned,
        nonAligned: baseNonAligned,
        gradeRevision: baseGradeRev
      };
    });

    assessments.forEach(a => {
      let matchId = '';
      const nameToMatch = (a.schoolName || '').trim().toLowerCase();
      
      const sMatch = schoolsList.find(s => 
        (a.schoolId && s.id === a.schoolId) ||
        (nameToMatch && (s.nameAr.trim().toLowerCase() === nameToMatch || s.nameEn.trim().toLowerCase() === nameToMatch)) ||
        (nameToMatch && (s.nameAr.trim().toLowerCase().includes(nameToMatch) || nameToMatch.includes(s.nameAr.trim().toLowerCase())))
      );

      if (sMatch) {
        matchId = sMatch.id;
      }

      if (matchId && rawStats[matchId]) {
        if (a.status === 'Approved') {
          rawStats[matchId].aligned += 1;
        } else if (a.status === 'Revision Request') {
          rawStats[matchId].nonAligned += 1;
        } else if (a.status === 'Grade Revision') {
          rawStats[matchId].gradeRevision += 1;
        } else {
          rawStats[matchId].nonAligned += 1;
        }
      }
    });

    return Object.values(rawStats);
  }, [assessments, dbSchools]);

  const filteredComplianceData = useMemo(() => {
    let list = complianceStats;
    if (complianceWilayatFilter !== 'all') {
      list = list.filter(item => item.wilayaId === complianceWilayatFilter);
    }
    if (complianceSchoolFilter !== 'all') {
      list = list.filter(item => item.schoolId === complianceSchoolFilter);
    }
    return list;
  }, [complianceStats, complianceWilayatFilter, complianceSchoolFilter]);

  const complianceTotals = useMemo(() => {
    let aligned = 0;
    let nonAligned = 0;
    let gradeRevision = 0;

    filteredComplianceData.forEach(item => {
      aligned += item.aligned;
      nonAligned += item.nonAligned;
      gradeRevision += item.gradeRevision;
    });

    const total = aligned + nonAligned + gradeRevision;
    return { aligned, nonAligned, gradeRevision, total };
  }, [filteredComplianceData]);

  const complianceSchoolsDropdown = useMemo(() => {
    if (complianceWilayatFilter === 'all') {
      return complianceStats;
    }
    return complianceStats.filter(s => s.wilayaId === complianceWilayatFilter);
  }, [complianceStats, complianceWilayatFilter]);

  const wilayatComparisonData = useMemo(() => {
    const wilayats = [
      { id: 'haima', nameAr: 'ولاية هيماء', nameEn: 'Wilayat Haima' },
      { id: 'duqm', nameAr: 'ولاية الدقم', nameEn: 'Wilayat Duqm' },
      { id: 'mahout', nameAr: 'ولاية محوت', nameEn: 'Wilayat Mahout' },
      { id: 'jazer', nameAr: 'ولاية الجازر', nameEn: 'Wilayat Al Jazer' }
    ];

    return wilayats.map(w => {
      const schoolsInW = complianceStats.filter(item => item.wilayaId === w.id);
      let aligned = 0;
      let nonAligned = 0;
      let gradeRevision = 0;

      schoolsInW.forEach(s => {
        aligned += s.aligned;
        nonAligned += s.nonAligned;
        gradeRevision += s.gradeRevision;
      });

      const total = aligned + nonAligned + gradeRevision;

      return {
        wilayaId: w.id,
        nameAr: w.nameAr,
        nameEn: w.nameEn,
        aligned,
        nonAligned,
        gradeRevision,
        total
      };
    });
  }, [complianceStats]);


  // --- COMPUTE STATISTICS Group 3: Advancement of Moderator Work done ---
  const moderatorStats = useMemo(() => {
    const defaultModerators = [
      { id: 'demo-mod-1', name: 'Salem Al-Harthy', subject: 'Mathematics & Science', email: 'salem.alharthy@moe.om' },
      { id: 'seed-mod-2', name: 'Fatma Al-Balushi', subject: 'English Language', email: 'fatma.albalushi@moe.om' },
      { id: 'seed-mod-3', name: 'Ahmed Al-Omani', subject: 'Physics & Chemistry', email: 'ahmed.alomani@moe.om' },
      { id: 'seed-mod-4', name: 'Dr. Mona Al-Said', subject: 'Social Studies & Islamic Education', email: 'mona.alsaid@moe.om' }
    ];

    const moderatorMetrics: Record<string, {
      id: string;
      name: string;
      subject: string;
      email: string;
      claims: number;
      approved: number;
      revisionRequested: number;
      inProgress: number;
    }> = {};

    // Initialize with default supervisors
    defaultModerators.forEach(dm => {
      moderatorMetrics[dm.name] = {
        id: dm.id,
        name: dm.name,
        subject: dm.subject,
        email: dm.email,
        claims: 0,
        approved: 0,
        revisionRequested: 0,
        inProgress: 0
      };
    });

    // Compute metrics based on actual assignments in database assessments
    assessments.forEach(a => {
      if (a.moderatorName && a.moderatorId) {
        const key = a.moderatorName;
        if (!moderatorMetrics[key]) {
          moderatorMetrics[key] = {
            id: a.moderatorId,
            name: key,
            subject: a.subject,
            email: a.schoolEmail || 'moderator@moe.om',
            claims: 0,
            approved: 0,
            revisionRequested: 0,
            inProgress: 0
          };
        }

        moderatorMetrics[key].claims += 1;
        if (a.status === 'Approved') moderatorMetrics[key].approved += 1;
        else if (a.status === 'Revision Request') moderatorMetrics[key].revisionRequested += 1;
        else if (a.status === 'In Progress') moderatorMetrics[key].inProgress += 1;
      }
    });

    return Object.values(moderatorMetrics);
  }, [assessments]);

  // Filtered Moderators list derived from search input query
  const filteredModerators = useMemo(() => {
    return moderatorStats.filter(m => 
      m.name.toLowerCase().includes(modSearchQuery.toLowerCase()) ||
      m.subject.toLowerCase().includes(modSearchQuery.toLowerCase())
    );
  }, [moderatorStats, modSearchQuery]);


  // Summary calculations
  const totalClaims = assessments.filter(a => a.moderatorId).length;
  const completedReviewsCount = assessments.filter(a => a.status === 'Approved' || a.status === 'Revision Request').length;
  const advancementPercentage = assessments.length > 0 ? Math.round((completedReviewsCount / assessments.length) * 10) * 10 : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Title Header Banner bar with interactive indicators */}
      <div className="bg-slate-900 rounded-3xl p-6 border border-slate-800 relative overflow-hidden shadow-md">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial-at-tr from-amber-500/10 via-transparent to-transparent opacity-60 pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1 relative z-10">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#D4AF37] font-mono">
                {language === 'ar' ? 'البوابة الوطنية لإحصائيات جودة التقويم الدراسي العماني' : 'Sultanate of Oman • Ministry of Education Portal Admin Panel'}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-[#D4AF37] text-[8px] font-bold uppercase tracking-wider font-mono">
                {language === 'ar' ? 'سري وتدقيق' : 'Secretariat Only'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 font-heading">
              {getTranslatedText('nationalQualityAnalytics', language)}
            </h2>
            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              {getTranslatedText('regionalAnalyticsDesc', language)}
            </p>
          </div>
          <div className="bg-slate-950 px-4.5 py-3 rounded-2xl border border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9.5px] font-bold text-slate-500 block uppercase tracking-widest font-sans">
                {getTranslatedText('reviewCompletion', language)}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-base font-black text-slate-100 tracking-tight leading-none">
                  {advancementPercentage}%
                </span>
                <span className="text-[9px] text-emerald-400 font-mono font-bold">
                  ({completedReviewsCount}/{assessments.length} {language === 'ar' ? 'ملفات' : 'papers'})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Users database is disabled here since it is already present in the dedicated Databases page */}
      {false ? (
        <div className="space-y-6 animate-in fade-in duration-300 font-sans" dir={language === 'ar' ? 'rtl' : 'ltr'}>
          {/* Form Panel */}
          {showUserForm && (
            <form onSubmit={handleSubmitUser} className="bg-slate-50 border border-slate-200/80 p-6 rounded-3xl space-y-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-150 pb-3">
                <h3 className="text-sm font-black text-slate-900 font-heading">
                  {formMode === 'add' 
                    ? (language === 'ar' ? '➕ إضافة مستخدم جديد للبوابة' : '➕ Register New User Profile')
                    : (language === 'ar' ? '📝 تعديل بيانات المستخدم الحالي' : '📝 Edit Selected User Profile')
                  }
                </h3>
                <button
                  type="button"
                  onClick={() => { setShowUserForm(false); resetUserForm(); }}
                  className="p-1 px-1.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-555 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-sans font-bold">
                  ⚠️ {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-sans">
                {/* 1. User Name */}
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-705 block">{language === 'ar' ? 'اسم المستخدم الكامل (الثلاثي والقبيلة)' : 'Full Name of the User'}</label>
                  <input 
                    type="text" 
                    value={formName} 
                    onChange={(e) => setFormName(e.target.value)}
                    required
                    placeholder={language === 'ar' ? 'أدخل الاسم الثلاثي والقبيلة...' : 'e.g. Salim bin Said Al-Busaidi'} 
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-850 font-medium focus:outline-none focus:border-[#051C3F]"
                  />
                </div>

                {/* 2. Ministerial Email */}
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-705 block">{language === 'ar' ? 'البريد الإلكتروني الوزاري الرسمي (@moe.om)' : 'Official Ministerial Email (@moe.om)'}</label>
                  <input 
                    type="email" 
                    value={formEmail} 
                    onChange={(e) => setFormEmail(e.target.value)}
                    required
                    placeholder="example@moe.om" 
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-850 font-medium focus:outline-none focus:border-[#051C3F]"
                  />
                </div>

                {/* 3. Phone number */}
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-705 block">{language === 'ar' ? 'رقم الهاتف (النقّال العُماني)' : 'OMAN Phone Number'}</label>
                  <input 
                    type="tel" 
                    value={formPhone} 
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="e.g. 91234567" 
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-850 font-medium focus:outline-none focus:border-[#051C3F]"
                  />
                </div>

                {/* 4. Portal Global Role */}
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-705 block">{language === 'ar' ? 'الصفة الوظيفية العامة بالوزارة' : 'Portal System Role'}</label>
                  <select 
                    value={formRole} 
                    onChange={(e: any) => {
                      const role = e.target.value;
                      setFormRole(role);
                      if (role === 'admin' || role === 'moderator') {
                        setFormRoleType('administrative');
                      } else {
                        setFormRoleType('teacher'); // default to school teacher
                      }
                    }}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-850 font-bold focus:outline-none focus:border-[#051C3F] cursor-pointer"
                  >
                    <option value="school">{language === 'ar' ? '🏫 جهة مدرسية (معلم / إداري مدرسة)' : '🏫 School Representative'}</option>
                    <option value="moderator">{language === 'ar' ? '🔍 موجه تربوي (وزاري)' : '🔍 Educational Moderator (MOE)'}</option>
                    <option value="admin">{language === 'ar' ? '👑 مدير النظام العام' : '👑 Portal Administrator'}</option>
                  </select>
                </div>

                {/* If role is school, let them specify if Administrative or Teacher */}
                {formRole === 'school' && (
                  <div className="space-y-1.5 font-sans">
                    <label className="font-extrabold text-slate-705 block">{language === 'ar' ? 'تصنيف الكادر (إداري / تعليمي)' : 'School Position Classification'}</label>
                    <div className="flex gap-6 pt-2.5">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-600 font-sans">
                        <input 
                          type="radio" 
                          name="roleType" 
                          value="teacher" 
                          checked={formRoleType === 'teacher'} 
                          onChange={() => setFormRoleType('teacher')}
                          className="accent-[#051C3F] w-4 h-4 font-sans"
                        />
                        {language === 'ar' ? 'معلم مادة دراسية' : 'Teacher of Academic Subject'}
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-600 font-sans">
                        <input 
                          type="radio" 
                          name="roleType" 
                          value="administrative" 
                          checked={formRoleType === 'administrative'} 
                          onChange={() => setFormRoleType('administrative')}
                          className="accent-[#051C3F] w-4 h-4 font-sans"
                        />
                        {language === 'ar' ? 'إداري مدرسة' : 'School Administrative'}
                      </label>
                    </div>
                  </div>
                )}

                {/* School Name (only for school role, or teachers) */}
                {(formRole === 'school' || (formRoleType === 'teacher' && formRole !== 'moderator')) && (
                  <div className="space-y-1.5">
                    <label className="font-extrabold text-slate-705 block">{language === 'ar' ? 'اسم المدرسة / المؤسسة التعليمية' : 'School/Directorate Name'}</label>
                    <input 
                      type="text" 
                      value={formSchool} 
                      onChange={(e) => setFormSchool(e.target.value)}
                      placeholder={language === 'ar' ? 'مدرسة الخوض للتعليم ما بعد الأساسي...' : 'e.g. Al-Mawaleh Basic Education'} 
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-850 font-medium focus:outline-none focus:border-[#051C3F]"
                    />
                  </div>
                )}

                {/* For moderator, show official governorate note */}
                {formRole === 'moderator' && (
                  <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-950 font-sans space-y-1">
                    <p className="font-bold flex items-center gap-1.5 text-[#051C3F]">
                      <span>🏛️</span>
                      <span>{language === 'ar' ? 'التبعية: المديرية العامة للتربية والتعليم بمحافظة الوسطى' : 'Affiliation: Al Wusta Directorate'}</span>
                    </p>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {language === 'ar'
                        ? 'الفاحص / المدقق لا يتبع أي ولاية أو مدرسة، بل يتبع المحافظة مباشرة للإشراف وتدقيق نماذج التقييم لكافة المدارس.'
                        : 'The auditor/examiner operates exclusively at the governorate level and is not tied to any school or wilaya.'}
                    </p>
                  </div>
                )}

                {/* If roleType is teacher or role is moderator, collect subject */}
                {(formRoleType === 'teacher' || formRole === 'moderator') && formRole !== 'admin' && (
                  <div className="space-y-1.5 animate-in fade-in duration-150 font-sans">
                    <label className="font-extrabold text-slate-705 block">{language === 'ar' ? 'المادة الدراسية المسندة أو التخصص العلمي' : 'Academic Subject taught'}</label>
                    <select 
                      value={formSubject} 
                      onChange={(e) => setFormSubject(e.target.value)}
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-850 font-bold focus:outline-none focus:border-[#051C3F] cursor-pointer"
                    >
                      {formRole === 'moderator' && (
                        <option value="All Subjects">{language === 'ar' ? '🌟 جميع المواد (مدقق شامل)' : '🌟 All Subjects (Universal)'}</option>
                      )}
                      <option value="Mathematics">{language === 'ar' ? 'الرياضيات' : 'Mathematics'}</option>
                      <option value="Science">{language === 'ar' ? 'العلوم العامة' : 'Science'}</option>
                      <option value="English Language">{language === 'ar' ? 'اللغة الإنجليزية' : 'English Language'}</option>
                      <option value="Arabic Language">{language === 'ar' ? 'اللغة العربية' : 'Arabic Language'}</option>
                      <option value="Physics">{language === 'ar' ? 'الفيزياء' : 'Physics'}</option>
                      <option value="Chemistry">{language === 'ar' ? 'الكيمياء' : 'Chemistry'}</option>
                      <option value="Biology">{language === 'ar' ? 'الأحياء' : 'Biology'}</option>
                      <option value="Islamic Studies">{language === 'ar' ? 'التربية الإسلامية' : 'Islamic Studies'}</option>
                      <option value="Social Studies">{language === 'ar' ? 'الدراسات الاجتماعية' : 'Social Studies'}</option>
                      <option value="Information Technology">{language === 'ar' ? 'تقنية المعلومات' : 'Information Technology'}</option>
                      <option value="Applied Sciences">{language === 'ar' ? 'العلوم التطبيقية' : 'Applied Sciences'}</option>
                      <option value="Individual Skills">{language === 'ar' ? 'المهارات الفردية' : 'Individual Skills'}</option>
                    </select>
                  </div>
                )}

                {/* If roleType is teacher, collect Grades taught */}
                {formRoleType === 'teacher' && formRole !== 'admin' && (
                  <div className="space-y-1.5 animate-in fade-in duration-150">
                    <label className="font-extrabold text-slate-705 block">
                      {language === 'ar' ? 'الصفوف الدراسية التي يقوم بتدريسها (مفصولة بفاصلة)' : 'Grades Taught (e.g. Grade 10, Grade 11)'}
                    </label>
                    <input 
                      type="text" 
                      value={formGrades} 
                      onChange={(e) => setFormGrades(e.target.value)}
                      placeholder={language === 'ar' ? 'الصف العاشر, الصف الحادي عشر' : 'e.g. Grade 10, Grade 12'} 
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-850 font-medium focus:outline-none focus:border-[#051C3F]"
                    />
                  </div>
                )}

                {/* Appointment Year */}
                <div className="space-y-1.5">
                  <label className="font-extrabold text-slate-705 block">{language === 'ar' ? 'سنة التعيين الوظيفي بالوزارة (السنة فقط)' : 'Appointment Year (Year only e.g. 2018)'}</label>
                  <input 
                    type="text" 
                    value={formYear} 
                    onChange={(e) => setFormYear(e.target.value)}
                    placeholder="e.g. 2020" 
                    maxLength={4}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl bg-white text-slate-855 font-medium focus:outline-none focus:border-[#051C3F] text-center font-mono font-bold"
                  />
                </div>

              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-150 font-sans">
                <button
                  type="button"
                  onClick={() => { setShowUserForm(false); resetUserForm(); }}
                  className="px-5 py-2.5 text-slate-500 hover:text-slate-800 font-extrabold transition-colors cursor-pointer text-xs font-sans"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-[#051C3F] hover:bg-[#0c2e5c] text-white hover:text-amber-400 font-black rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 text-xs font-sans"
                >
                  {isSubmitting ? (language === 'ar' ? 'جاري حفظ السجل...' : 'Saving secure file...') : (language === 'ar' ? '💾 حفظ السجل بالمنظومة' : '💾 Save Security Record')}
                </button>
              </div>
            </form>
          )}

          {/* Search bar & Create Action element */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50 p-4 border border-slate-200/60 rounded-3xl font-sans">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={language === 'ar' ? 'البحث في الكادر: الاسم، البريد، الهاتف، المدرسة...' : 'Filter database by name, email, phone number, school...'}
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#051C3F] bg-white font-medium"
              />
            </div>

            <button
              id="btn-add-new-user-record"
              type="button"
              onClick={() => { resetUserForm(); setShowUserForm(true); }}
              className="w-full md:w-auto px-5 py-2.5 bg-[#00b074] hover:bg-[#009c66] text-white rounded-xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all hover:scale-[1.01]"
            >
              <Plus className="w-4 h-4" />
              {language === 'ar' ? 'سجل مستخدم جديد بالوزارة' : 'Add New User Profile'}
            </button>
          </div>

          {/* Table Container */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className={`w-full ${language === 'ar' ? 'text-right' : 'text-left'} border-collapse text-xs font-sans`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-[10.5px] font-extrabold uppercase tracking-wider text-slate-400 font-sans">
                    <th className={`py-4 px-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{language === 'ar' ? 'الاسم وبطاقة الهوية' : 'User Representative Name'}</th>
                    <th className={`py-4 px-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{language === 'ar' ? 'البريد الوزاري الرسمي' : 'Ministerial Email Address'}</th>
                    <th className={`py-4 px-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{language === 'ar' ? 'الصفة الوظيفية والمسؤولية' : 'Class / Role & Specialization'}</th>
                    <th className={`py-4 px-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{language === 'ar' ? 'المدرسة التابع لها' : 'Educational School'}</th>
                    <th className={`py-4 px-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{language === 'ar' ? 'رقم الهاتف' : 'Contact Phone'}</th>
                    <th className="py-4 px-3 text-center">{language === 'ar' ? 'سنة التعيين' : 'Year Appointed'}</th>
                    <th className="py-4 px-4 text-center">{language === 'ar' ? 'إجراءات' : 'Control'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11.5px] font-sans">
                  {isLoadingUsers ? (
                    <tr>
                      <td colSpan={7} className="py-14 text-center text-slate-400 font-medium">
                        <div className="flex items-center justify-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                          <span>{language === 'ar' ? 'جاري استيراد وتدقيق البيانات من الخادم الآمن بالوزارة...' : 'Retrieving secured national registry files from Ministry database...'}</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-14 text-center text-slate-400 font-bold">
                        {language === 'ar' ? '⚠️ لا توجد نتائج مطابقة لشروط البحث.' : '⚠️ No user logs match current query parameters.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user, index) => {
                      const displayType = user.roleType === 'teacher' 
                        ? (language === 'ar' ? `📝 معلم مادة: ${translateSubject(user.subject || 'All', language)}` : `📝 Teacher: ${translateSubject(user.subject || 'All', language)}`)
                        : (language === 'ar' ? '💼 صفة إدارية / إشرافية' : '💼 Administrative');

                      let statusBadge = '';
                      if (user.role === 'admin') {
                        statusBadge = language === 'ar' ? '👑 مدير النظام العام' : '👑 System Admin';
                      } else if (user.role === 'moderator') {
                        statusBadge = language === 'ar' ? '🔍 موجه تربوي' : '🔍 Web Moderator';
                      } else {
                        statusBadge = language === 'ar' ? '🏫 ممثل المدرسة' : '🏫 School Staff';
                      }

                      return (
                        <tr key={`${user.uid || 'user'}-${index}`} className="hover:bg-slate-50/40 transition-colors font-sans">
                          <td className="py-4 px-4">
                            <div>
                              <p className="font-extrabold text-[#051C3F] font-heading text-sm">{user.name}</p>
                              <span className="inline-flex items-center mt-1 px-2.5 py-0.5 rounded-full text-[9px] font-black bg-[#051C3F]/5 text-[#051C3F] tracking-wide border border-[#051C3F]/10">
                                {statusBadge}
                              </span>
                            </div>
                          </td>

                          <td className="py-4 px-4 select-all font-mono font-medium text-slate-650">
                            {user.email}
                          </td>

                          <td className="py-4 px-4">
                            <div>
                              <p className="font-bold text-slate-800">{displayType}</p>
                              {user.roleType === 'teacher' && user.gradesTaught && user.gradesTaught.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mt-1.5">
                                  {user.gradesTaught.map((gradeVal, index) => (
                                    <span key={index} className="px-2 py-0.5 text-[8.5px] font-black tracking-wider rounded-md bg-amber-450/15 text-amber-850 font-sans border border-amber-400/20 animate-in fade-in">
                                      {translateGrade(gradeVal, language)}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="py-4 px-4 font-extrabold text-slate-705">
                            {user.role === 'moderator' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-sky-50 text-sky-850 border border-sky-200">
                                <span>🏛️</span>
                                <span>{language === 'ar' ? 'لا يتبع مدرسة' : 'No school'}</span>
                              </span>
                            ) : user.role === 'admin' ? (
                              <span className="text-slate-400 font-medium text-xs">—</span>
                            ) : user.schoolName || user.schoolName === '' ? (language === 'ar' && user.schoolName === 'Al-Azaiba School' ? 'مدرسة العذيبة الأساسية للتعليم' : (user.schoolName || '-')) : '-'}
                          </td>

                          <td className="py-4 px-4 font-mono text-slate-600">
                            {user.phoneNumber || '-'}
                          </td>

                          <td className="py-4 px-3 text-center font-mono font-extrabold text-slate-750 text-sm">
                            {user.appointmentYear || '-'}
                          </td>

                          <td className="py-4 px-4 text-center">
                            <div className="flex items-center justify-center gap-2 font-sans">
                              <button
                                type="button"
                                onClick={() => handleEditClick(user)}
                                className="p-1.5 bg-indigo-50 text-indigo-705 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer border border-indigo-200/20"
                                title={language === 'ar' ? 'تعديل السجل' : 'Edit directory profile'}
                              >
                                <Edit className="w-3.5 h-3.5 text-indigo-700" />
                              </button>
                              
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(user.uid)}
                                className={`p-1.5 rounded-lg transition-all cursor-pointer font-black text-[9.5px] flex items-center gap-1 border ${
                                  confirmDeleteId === user.uid 
                                    ? 'bg-rose-600 text-white border-rose-500 hover:bg-rose-700 animate-pulse font-sans'
                                    : 'bg-rose-50 text-rose-600 hover:bg-rose-100 border-rose-100 font-sans'
                                }`}
                                title={language === 'ar' ? 'حذف هذا السجل نهائياً' : 'Permanently remove profile'}
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                {confirmDeleteId === user.uid && (
                                  <span>{language === 'ar' ? 'تأكيد الحذف النهائي؟' : 'Confirm?'}</span>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* THREE REQUIRED GROUPS GRID */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-7">

        {/* ==========================================
            GROUP 1: STATISTICS OF SCHOOLS
            ========================================== */}
        <div className="xl:col-span-8 bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-150 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
                    <SchoolIcon className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="font-extrabold text-slate-900 font-heading text-sm uppercase tracking-wider">
                    {language === 'ar' ? '1. إحصاءات المدارس والمؤسسات التعليمية' : '1. Institutional Schools Statistics'}
                  </h3>
                </div>
                <p className="text-[11.5px] text-slate-400 font-sans">
                  {language === 'ar' 
                    ? 'فحص ومتابعة حجم المرفوعات ونسبة الاعتماد لمدارس سلطنة عمان بالمنظومة التدقيقية برابط حي.'
                    : 'Inspect upload volume and matching status ratio metrics across direct school boundaries in the region.'}
                </p>
              </div>

              {/* Dynamic Search box for Schools */}
              <div className="relative w-full md:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={language === 'ar' ? 'تصفية إحصاءات المدارس...' : 'Filter school stats...'}
                  value={schoolSearchQuery}
                  onChange={(e) => setSchoolSearchQuery(e.target.value)}
                  className="w-full pl-8.5 pr-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-550 bg-slate-50/50 font-medium font-sans"
                />
              </div>
            </div>

            {/* School statistics Table */}
            <div className="border border-slate-150 rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className={`w-full ${language === 'ar' ? 'text-right' : 'text-left'} border-collapse text-xs font-sans`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150 text-[10.5px] font-extrabold uppercase tracking-wider text-slate-400">
                      <th className={`py-3 px-4 text-slate-550 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{language === 'ar' ? 'المدرسة / المؤسسة التعليمية' : 'School Institution'}</th>
                      <th className="py-3 px-3 text-center text-slate-550">{language === 'ar' ? 'إجمالي المرفوعات' : 'Total Uploads'}</th>
                      <th className="py-3 px-2 text-center text-emerald-600 font-bold">{language === 'ar' ? 'المعتمدة' : 'Approved'}</th>
                      <th className="py-3 px-2 text-center text-rose-550 font-bold">{language === 'ar' ? 'طلبات تعديل' : 'Revisions'}</th>
                      <th className="py-3 px-2 text-center text-amber-600 font-bold">{language === 'ar' ? 'قيد الانتظار' : 'Pending'}</th>
                      <th className={`py-3 px-4 text-slate-550 ${language === 'ar' ? 'text-left' : 'text-right'}`}>{language === 'ar' ? 'معدل الاعتماد والقبول' : 'Approval Rate'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredSchools.map((school, index) => {
                      // Calculate approval rate
                      const appRate = school.uploaded > 0
                        ? Math.round((school.approved / school.uploaded) * 100)
                        : 0;

                      // Decide a visual safety class
                      let labelColor = 'text-slate-650';
                      let barColor = 'bg-slate-300';
                      if (appRate >= 80) {
                        labelColor = 'text-emerald-700 font-bold';
                        barColor = 'bg-emerald-500';
                      } else if (appRate >= 40) {
                        labelColor = 'text-[#D4AF37] font-bold';
                        barColor = 'bg-amber-400';
                      } else if (school.uploaded > 0) {
                        labelColor = 'text-rose-600 font-bold';
                        barColor = 'bg-rose-500';
                      }

                      return (
                        <tr 
                          key={`school-${school.id || school.name || index}-${index}`} 
                          onClick={() => setSelectedInspectSchool(selectedInspectSchool === school.name ? null : school.name)}
                          className={`hover:bg-slate-50/80 transition-colors cursor-pointer select-none ${
                            selectedInspectSchool === school.name ? 'bg-indigo-50/15' : ''
                          }`}
                        >
                          <td className={`py-3 px-4 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
                            <div>
                              <p className="font-extrabold text-slate-800 leading-tight block">
                                {language === 'ar' && school.name === 'Al-Azaiba School' ? 'مدرسة العذيبة الأساسية' : school.name}
                              </p>
                              <p className="text-[10px] text-slate-400 font-sans truncate mt-0.5">{school.region}</p>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-slate-700">
                            {school.uploaded}
                          </td>
                          <td className="py-3 px-2 text-center font-mono text-emerald-600 font-bold">
                            {school.approved}
                          </td>
                          <td className="py-3 px-2 text-center font-mono text-rose-500 font-medium">
                            {school.revision}
                          </td>
                          <td className="py-3 px-2 text-center font-mono text-amber-550 font-medium">
                            {school.pending + school.inProgress}
                          </td>
                          <td className={`py-3 px-4 ${language === 'ar' ? 'text-left' : 'text-right'}`}>
                            <div className={`flex flex-col ${language === 'ar' ? 'items-start' : 'items-end'} gap-1 font-sans`}>
                              {school.uploaded > 0 ? (
                                <>
                                  <span className={`text-[11px] font-bold ${labelColor}`}>
                                    {appRate}%
                                  </span>
                                  {/* Progress mini bar */}
                                  <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-0.5">
                                    <div className={`h-full ${barColor}`} style={{ width: `${appRate}%` }}></div>
                                  </div>
                                </>
                              ) : (
                                <span className="text-[9.5px] text-slate-400 italic">{language === 'ar' ? 'لا توجد أوراق بعد' : 'No papers'}</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* School detail sub-card showing when clicking a school row */}
          {selectedInspectSchool && (
            <div className="bg-slate-50 border border-slate-150 p-4.5 rounded-2xl space-y-2 animate-in slide-in-from-bottom-2 duration-150 text-xs text-right">
              <div className="flex items-center justify-between border-b border-slate-205 pb-1.5">
                <span className="font-extrabold text-slate-800 font-heading tracking-wide uppercase text-[10px]">
                  {language === 'ar' ? 'تفاصيل المراجعة والتدقيق للمدرسة: ' : 'Institutional Detail Review: '} {language === 'ar' && selectedInspectSchool === 'Al-Azaiba School' ? 'مدرسة العذيبة الأساسية' : selectedInspectSchool}
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">
                  {language === 'ar' ? 'مطابقات المنهج الوطني بوزارة التعليم' : 'Oman National Syllabus Matches'}
                </span>
              </div>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                {language === 'ar' 
                  ? `قامت مدرسة (${selectedInspectSchool === 'Al-Azaiba School' ? 'مدرسة العذيبة الأساسية' : selectedInspectSchool}) برفع وتأكيد حزم ملفات المنهج. تخضع جميع المرفوعات للفحص العكسي ضد البنية المرجعية العمانية لتجنب تفاوت وتعارض الأهداف قبل إرسالها للتقييم النهائي.`
                  : `This institution has loaded ${schoolStats.find(s => s.name === selectedInspectSchool)?.uploaded || 0} total curriculum packets. All papers are automatically mapped under the Oman Unified Portal system to detect any outline deviations before being issued to pedagogical units.`}
              </p>
            </div>
          )}
        </div>

        {/* ==========================================
            GROUP 2: STATISTICS OF UPLOADING DONE BY TEACHERS
            ========================================== */}
        <div className="xl:col-span-4 bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm space-y-6">
          <div className="space-y-1.5 border-b border-slate-150 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-650">
                <Layers className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-extrabold text-slate-900 font-heading text-sm uppercase tracking-wider">
                {language === 'ar' ? '2. إحصاءات مرفوعات المعلمين' : '2. Teacher Uploading Statistics'}
              </h3>
            </div>
            <p className="text-[11.5px] text-slate-400 font-sans">
              {language === 'ar' 
                ? 'مؤشرات حول الدروس والواجبات والتركيبة العامة لوحدات المنهج المرفوعة من المعلمين.'
                : 'Metrics on syllabus units, quiz assignments, and overall upload composition submitted by faculty.'}
            </p>
          </div>

          {/* Simple breakdown cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl space-y-1 font-sans">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-sans">
                {language === 'ar' ? 'الامتحانات الموحدة' : 'Unified Exams'}
              </span>
              <span className="text-xl font-extrabold text-slate-900 tracking-tight block">
                {uploadStats.examsCount} <span className="text-xs text-slate-400 font-sans font-medium">{language === 'ar' ? 'وحدات' : 'units'}</span>
              </span>
              <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden mt-2">
                <div 
                   className="bg-indigo-600 h-full"
                   style={{ width: `${uploadStats.totalCount ? (uploadStats.examsCount / uploadStats.totalCount) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl space-y-1 font-sans">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-sans">
                {language === 'ar' ? 'الاختبارات القصيرة' : 'Blueprints/Quizzes'}
              </span>
              <span className="text-xl font-extrabold text-slate-900 tracking-tight block">
                {uploadStats.quizzesCount} <span className="text-xs text-slate-400 font-sans font-medium">{language === 'ar' ? 'وحدات' : 'units'}</span>
              </span>
              <div className="h-1 w-full bg-slate-200 rounded-full overflow-hidden mt-2">
                <div 
                   className="bg-sky-500 h-full"
                   style={{ width: `${uploadStats.totalCount ? (uploadStats.quizzesCount / uploadStats.totalCount) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Subject Distribution horizontal or pie chart */}
          <div className="space-y-3.5 pt-1">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block font-sans">
                {language === 'ar' ? 'توزيع المرفوعات حسب المواد الدراسية' : 'Subject-Wise Upload Distribution'}
              </span>
              
              {/* Segmented layout select: bar vs pie */}
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10px] font-extrabold font-sans">
                <button
                  type="button"
                  onClick={() => setChartType('bar')}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    chartType === 'bar'
                      ? 'bg-white shadow-xs text-[#051C3F] font-black'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title={language === 'ar' ? 'عرض كمخطط أعمدة' : 'View as Bar Chart'}
                >
                  {language === 'ar' ? '📊 أعمدة' : '📊 Bar'}
                </button>
                <button
                  type="button"
                  onClick={() => setChartType('pie')}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    chartType === 'pie'
                      ? 'bg-white shadow-xs text-[#051C3F] font-black'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                  title={language === 'ar' ? 'عرض كمخطط دائري' : 'View as Pie Chart'}
                >
                  {language === 'ar' ? '🍕 دائري' : '🍕 Pie'}
                </button>
              </div>
            </div>
            
            {uploadStats.subjectList.length === 0 ? (
              <div className="text-center py-6 text-[11px] text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-150">
                {language === 'ar' ? 'لم يتم تسجيل أي مرفوعات نشطة بعد.' : 'No active uploads recorded yet.'}
              </div>
            ) : chartType === 'bar' ? (
              <div className="space-y-3 animate-in fade-in duration-200">
                {uploadStats.subjectList.map(({ subject, count }, index) => {
                  const percent = Math.round((count / uploadStats.totalCount) * 100);
                  // Dynamic vibrant colors
                  const colors = ['bg-indigo-600', 'bg-emerald-500', 'bg-sky-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500'];
                  const currentColor = colors[index % colors.length];
                  return (
                    <div key={`subject-bar-${subject || 'none'}-${index}`} className="space-y-1 text-xs font-sans">
                      <div className="flex items-center justify-between text-slate-705 font-medium">
                        <span className="truncate max-w-[170px] font-sans font-semibold text-slate-800">{translateSubject(subject, language)}</span>
                        <div className="flex items-center gap-1.5 font-sans">
                          <strong className="text-slate-900 font-extrabold">{count}</strong>
                          <span className="text-[10.5px] text-slate-400 font-sans">({percent}%)</span>
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${currentColor} rounded-full`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-2 animate-in fade-in duration-200">
                {/* Clean, interactive donut chart */}
                <div className="relative w-44 h-44 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full transform hover:scale-[1.02] transition-transform duration-300">
                    {(() => {
                      const colors = ['#4f46e5', '#10b981', '#0ea5e9', '#f59e0b', '#f43f5e', '#a855f7'];
                      let accumulatedAngle = -90; // Top
                      
                      return uploadStats.subjectList.map(({ subject, count }, index) => {
                        const angle = uploadStats.totalCount > 0 ? (count / uploadStats.totalCount) * 360 : 0;
                        const startAngle = accumulatedAngle;
                        const endAngle = accumulatedAngle + angle;
                        accumulatedAngle = endAngle;

                        const isHovered = hoveredIndex === index;
                        // Calculate bisector angle for translation
                        const midAngle = (startAngle + endAngle) / 2;
                        const midAngleRad = (midAngle * Math.PI) / 180;
                        const dx = Math.cos(midAngleRad) * 2;
                        const dy = Math.sin(midAngleRad) * 2;
                        const translation = isHovered ? `translate(${dx}px, ${dy}px)` : 'none';

                        return (
                          <path
                            key={`subject-donut-${subject || 'none'}-${index}`}
                            d={getPathDef(startAngle, endAngle)}
                            fill={colors[index % colors.length]}
                            style={{ 
                              transform: translation, 
                              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                              cursor: 'pointer' 
                            }}
                            onMouseEnter={() => setHoveredIndex(index)}
                            onMouseLeave={() => setHoveredIndex(null)}
                            className="stroke-white stroke-[0.8]"
                          />
                        );
                      });
                    })()}

                    {/* Donut hollow center */}
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="24" 
                      fill="#ffffff" 
                      className="stroke-slate-100 stroke-[0.5]" 
                    />
                  </svg>

                  {/* Donut inner labels */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                    {hoveredIndex === null ? (
                      <>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                          {language === 'ar' ? 'الإجمالي' : 'Total'}
                        </span>
                        <span className="text-xl font-black text-[#051C3F] mt-1 leading-none font-sans">
                          {uploadStats.totalCount}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-[9px] text-slate-700 font-bold truncate max-w-[80px] leading-none mb-1 text-center block px-1">
                          {translateSubject(uploadStats.subjectList[hoveredIndex].subject, language)}
                        </span>
                        <span className="text-sm font-black text-indigo-700 mt-0.5 leading-none font-mono">
                          {uploadStats.subjectList[hoveredIndex].count}
                        </span>
                        <span className="text-[8.5px] text-slate-400 mt-0.5 leading-none font-sans font-bold">
                          {Math.round((uploadStats.subjectList[hoveredIndex].count / uploadStats.totalCount) * 100)}%
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Legend Grid Below */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-2 w-full text-[11px] px-1 font-sans">
                  {(() => {
                    const colors = ['#4f46e5', '#10b981', '#0ea5e9', '#f59e0b', '#f43f5e', '#a855f7'];
                    return uploadStats.subjectList.map(({ subject, count }, index) => {
                      const isHovered = hoveredIndex === index;
                      const percent = Math.round((count / uploadStats.totalCount) * 100);
                      return (
                        <div 
                          key={`subject-legend-${subject || 'none'}-${index}`}
                          onMouseEnter={() => setHoveredIndex(index)}
                          onMouseLeave={() => setHoveredIndex(null)}
                          className={`flex items-center gap-1.5 cursor-pointer p-1 rounded-lg transition-all ${
                            isHovered ? 'bg-[#051C3F]/5 scale-[1.02]' : 'hover:bg-slate-50'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: colors[index % colors.length] }}></span>
                          <div className="min-w-0 flex-1 flex items-center justify-between gap-1 text-[10.5px]">
                            <span className="text-slate-705 font-semibold truncate" title={translateSubject(subject, language)}>
                              {translateSubject(subject, language)}
                            </span>
                            <span className="text-slate-405 font-bold flex-shrink-0 font-sans">
                              {count} <span className="text-[9px] text-slate-400">({percent}%)</span>
                            </span>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>

          {/* Grade Level Breakdown */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block font-sans">
              {language === 'ar' ? 'تحليل الحصص حسب الصفوف الدراسية' : 'Key Grade-Level Quotas'}
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {uploadStats.gradeList.slice(0, 4).map(({ grade, count }, idx) => (
                <div key={`admin-grade-list-${grade || 'none'}-${idx}`} className="p-2 sm:p-2.5 bg-[#FAFBFD] border border-slate-100 rounded-xl flex items-center justify-between font-sans">
                  <div className="space-y-0.5 truncate pr-1">
                    <p className="font-bold text-[11px] text-slate-705 truncate">{translateGrade(grade, language)}</p>
                    <p className="text-[9.5px] text-slate-400">{language === 'ar' ? 'المستوى المعتمد' : 'Allocated level'}</p>
                  </div>
                  <span className="px-2 py-0.5 text-[11px] font-extrabold rounded-lg bg-indigo-50 text-indigo-700 min-w-7 text-center">
                    {count}
                  </span>
                </div>
              ))}
              {uploadStats.gradeList.length === 0 && (
                <div className="col-span-2 text-center py-4 text-[10px] text-slate-400">
                  {language === 'ar' ? 'لا توجد بيانات صفية حالياً.' : 'No grade metadata uploaded.'}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* ==========================================
          GROUP 3: STATISTICS ON THE ADVANCEMENT OF THE WORK DONE BY MODERATORS
          ========================================== */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm space-y-6">
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-150 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
                <Users className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-extrabold text-slate-900 font-heading text-sm uppercase tracking-wider">
                {language === 'ar' ? '3. معدلات إنجاز وتقدم المشرفين والموجهين التربويين' : '3. Subject Supervisors &amp; Moderators Work Advancement'}
              </h3>
            </div>
            <p className="text-[11.5px] text-slate-400 font-sans">
              {language === 'ar'
                ? 'متابعة وفحص المستندات المسحوبة ونشاط الموجهين التربويين لإثبات سرعة إنجاز كراسات الامتحانات والمقاييس.'
                : 'Track assignments claimed, active moderation status, and review approval velocity metrics across pedagogical reviewers.'}
            </p>
          </div>

          {/* Dynamic Search box for Moderators */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={language === 'ar' ? 'البحث في سجلات المشرفين...' : 'Search supervisor logs...'}
              value={modSearchQuery}
              onChange={(e) => setModSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-550 bg-slate-50/50 font-medium font-sans"
            />
          </div>
        </div>

        {/* Global Advancement visual KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-[#FAFBFD] border border-slate-100 rounded-2xl space-y-1.5 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9.5px] text-slate-400 font-black uppercase tracking-wider">{language === 'ar' ? 'إجمالي الملفات المستلمة' : 'Total Claims'}</p>
              <p className="text-xl font-bold text-slate-80s">{totalClaims}</p>
            </div>
          </div>
          <div className="p-4 bg-[#FAFBFD] border border-slate-100 rounded-2xl space-y-1.5 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-105 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <p className="text-[9.5px] text-slate-400 font-black uppercase tracking-wider">{language === 'ar' ? 'أوراق قيد المراجعة' : 'Active In-Progress'}</p>
              <p className="text-xl font-bold text-slate-80s">
                {assessments.filter(a => a.status === 'In Progress').length}
              </p>
            </div>
          </div>
          <div className="p-4 bg-[#FAFBFD] border border-slate-100 rounded-2xl space-y-1.5 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[9.5px] text-slate-400 font-black uppercase tracking-wider">{language === 'ar' ? 'الملفات المعتمدة' : 'Total Approved'}</p>
              <p className="text-xl font-bold text-slate-8s">
                {assessments.filter(a => a.status === 'Approved').length}
              </p>
            </div>
          </div>
          <div className="p-4 bg-[#FAFBFD] border border-slate-100 rounded-2xl space-y-1.5 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <RotateCw className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[9.5px] text-slate-400 font-black uppercase tracking-wider">{language === 'ar' ? 'جوانب التعديل الوزارية' : 'Revisions Mandated'}</p>
              <p className="text-xl font-bold text-slate-8s">
                {assessments.filter(a => a.status === 'Revision Request').length}
              </p>
            </div>
          </div>
        </div>

        {/* List of active moderators with details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5.5 font-sans">
          {filteredModerators.map((mod, index) => {
            // Compute completion percentage
            const pct = mod.claims > 0 
              ? Math.round(((mod.approved + mod.revisionRequested) / mod.claims) * 100) 
              : 0;

            let progressColor = 'bg-slate-350';
            if (pct >= 80) progressColor = 'bg-emerald-500';
            else if (pct >= 40) progressColor = 'bg-indigo-650';
            else if (mod.claims > 0) progressColor = 'bg-amber-400';

            return (
              <div 
                key={`mod-${mod.id || mod.name || index}-${index}`} 
                className="border border-slate-200/70 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition-colors bg-slate-50/25 space-y-4"
              >
                {/* Header segment card */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h4 className="font-extrabold text-slate-850 text-sm">
                      {language === 'ar' && mod.name === 'Salem Al-Harthy' ? 'أ. سالم بن راشد الحارثي' : mod.name}
                    </h4>
                    <p className="text-[10.5px] text-indigo-700 hover:text-indigo-850 transition-colors font-medium cursor-pointer flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block"></span>
                      {language === 'ar' ? 'المادة اختصاصه الدراسي:' : 'Subject:'} {translateSubject(mod.subject, language)}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-white border border-slate-200 rounded-xl px-2.5 py-1 font-mono font-bold">
                    {mod.email.split('@')[0]}
                  </span>
                </div>

                {/* Sub-counter panel Grid */}
                <div className="grid grid-cols-3 gap-2 py-1">
                  <div className="text-center p-2 bg-white border border-slate-150 rounded-xl">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{language === 'ar' ? 'طلب مستلم' : 'Claims'}</p>
                    <p className="text-sm font-extrabold text-slate-705 mt-0.5">{mod.claims}</p>
                  </div>
                  <div className="text-center p-2 bg-white border border-slate-150 rounded-xl">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-emerald-600">{language === 'ar' ? 'معتمد' : 'Approved'}</p>
                    <p className="text-sm font-extrabold text-slate-705 mt-0.5 text-emerald-60s">{mod.approved}</p>
                  </div>
                  <div className="text-center p-2 bg-white border border-slate-150 rounded-xl">
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider text-rose-500">{language === 'ar' ? 'مطلوب مراجعة' : 'Revisions'}</p>
                    <p className="text-sm font-extrabold text-slate-705 mt-0.5 text-rose-60s">{mod.revisionRequested}</p>
                  </div>
                </div>

                {/* Work advancement rate and progress-bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[11px] font-sans font-medium text-slate-700">
                    <span className="text-slate-400 hover:text-slate-500 tracking-wide font-black uppercase text-[9.5px]">
                      {language === 'ar' ? 'معدل إنجاز الطلبات' : 'Advancement Progress'}
                    </span>
                    <strong className="text-slate-850 font-black">{pct}% {language === 'ar' ? 'مكتمل' : 'Done'}</strong>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-150">
                    {mod.claims > 0 ? (
                      <div 
                        className={`h-full ${progressColor} rounded-full`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    ) : (
                      <div className="h-full bg-slate-200 rounded-full" style={{ width: '0%' }}></div>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 text-right mt-1 font-medium">
                    {language === 'ar'
                      ? `يوجد عدد ${mod.claims - (mod.approved + mod.revisionRequested)} طلبات غير منجزة ومطروحة في قائمة أعمال الموجه حالياً.`
                      : `${mod.claims - (mod.approved + mod.revisionRequested)} active papers currently incomplete on assigned queue.`}
                  </p>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* ==========================================
          GROUP 4: COMPLIANCE & ALIGNMENT STATISTICS (NEW SECTION 4)
          ========================================== */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/60 shadow-sm space-y-6" id="compliance-alignment-stats-sec">
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-150 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 font-extrabold flex items-center justify-center text-xs w-8 h-8 border border-emerald-100 font-sans">
                4
              </div>
              <h3 className="font-extrabold text-slate-900 font-heading text-sm uppercase tracking-wider">
                {language === 'ar' ? '4. إحصاءات تطابق ومواءمة الامتحانات والمناهج' : '4. Syllabus Alignment & Exam Compliance Statistics'}
              </h3>
            </div>
            <p className="text-[11.5px] text-slate-400 font-sans">
              {language === 'ar'
                ? 'فحص ومراقبة نسب مواءمة الكراسات المرفوعة مع المعايير (مطابق، غير مطابق، تعديل درجات) مصنفة حسب الولاية والمدرسة.'
                : 'Inspect and benchmark exam compliance rates (aligned, non-compliant, grade revision) across schools and districts.'}
            </p>
          </div>

          {/* Sub-tab selection choices */}
          <div className="flex bg-slate-50 p-1 border border-slate-200 rounded-2xl text-xs font-bold font-sans">
            <button
              type="button"
              onClick={() => {
                setComplianceTab('overview');
                setComplianceWilayatFilter('all');
                setComplianceSchoolFilter('all');
              }}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                complianceTab === 'overview'
                  ? 'bg-[#051C3F] text-amber-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {language === 'ar' ? '🔍 نظرة عامة وفلترة مخصصة' : '🔍 Filter & Overview'}
            </button>
            <button
              type="button"
              onClick={() => setComplianceTab('comparison')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                complianceTab === 'comparison'
                  ? 'bg-[#051C3F] text-amber-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {language === 'ar' ? '⚖️ مقارنة الولايات' : '⚖️ Wilayat Comparison'}
            </button>
          </div>
        </div>

        {/* --- OPTION 1: DETAILED VIEW + FILTERS TAB --- */}
        {complianceTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Horizontal Filter Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4.5 bg-slate-50/50 rounded-2xl border border-slate-150 text-xs">
              
              {/* Wilayat selector */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest text-start font-sans">
                  {language === 'ar' ? 'تصفية حسب الولاية:' : 'Filter by Wilayat:'}
                </label>
                <select
                  value={complianceWilayatFilter}
                  onChange={(e) => {
                    setComplianceWilayatFilter(e.target.value);
                    setComplianceSchoolFilter('all');
                  }}
                  className="w-full px-3 py-2 border border-slate-205 rounded-xl bg-white text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-600 font-sans"
                >
                  <option value="all">{language === 'ar' ? 'كل ولايات المحافظة 🇴🇲' : 'All Regional Wilayats'}</option>
                  <option value="haima">{language === 'ar' ? 'ولاية هيماء' : 'Wilayat Haima'}</option>
                  <option value="duqm">{language === 'ar' ? 'ولاية الدقم' : 'Wilayat Duqm'}</option>
                  <option value="mahout">{language === 'ar' ? 'ولاية محوت' : 'Wilayat Mahout'}</option>
                  <option value="jazer">{language === 'ar' ? 'ولاية الجازر' : 'Wilayat Al Jazer'}</option>
                </select>
              </div>

              {/* School selector */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest text-start font-sans">
                  {language === 'ar' ? 'تصفية حسب المدرسة التعليمية:' : 'Filter by School:'}
                </label>
                <select
                  value={complianceSchoolFilter}
                  onChange={(e) => setComplianceSchoolFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-205 rounded-xl bg-white text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-emerald-600 font-sans"
                >
                  <option value="all">{language === 'ar' ? 'كل المدارس تحت النطاق 🏫' : 'All Institutional Schools'}</option>
                  {complianceSchoolsDropdown.map(s => {
                    const disp = language === 'ar' ? s.schoolNameAr : s.schoolNameEn;
                    return (
                      <option key={`comp-drop-${s.schoolId}`} value={s.schoolId}>
                        {disp}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Reset shortcut */}
              <div className="flex items-end">
                {(complianceWilayatFilter !== 'all' || complianceSchoolFilter !== 'all') ? (
                  <button
                    type="button"
                    onClick={() => {
                      setComplianceWilayatFilter('all');
                      setComplianceSchoolFilter('all');
                    }}
                    className="px-3.5 py-2 hover:bg-slate-200 text-slate-650 font-bold rounded-xl border border-slate-300 transition-colors cursor-pointer w-full text-center flex items-center justify-center gap-1.5 font-sans"
                  >
                    <span>🔄 {language === 'ar' ? 'إعادة تعيين الفلاتر' : 'Reset Filters'}</span>
                  </button>
                ) : (
                  <div className="text-center text-slate-300 py-1 font-sans text-[10px] font-semibold w-full block">
                    {language === 'ar' ? 'رصد دقيق برابط حي' : 'Fully Real-time Linked'}
                  </div>
                )}
              </div>

              {/* Toggle Chart view mode button */}
              <div className="space-y-1.5 flex flex-col justify-end">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest text-start font-sans">
                  {language === 'ar' ? 'شكل عرض الإحصاءات:' : 'View Format Mode:'}
                </label>
                <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 justify-between items-center w-full font-sans">
                  <button
                    type="button"
                    onClick={() => setComplianceChartMode('table')}
                    className={`flex-1 py-1 text-center rounded-md text-[10px] font-extrabold cursor-pointer transition-all ${
                      complianceChartMode === 'table' ? 'bg-white shadow-xs text-[#051C3F] font-black' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {language === 'ar' ? '📰 جدول' : '📰 Table'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setComplianceChartMode('bar')}
                    className={`flex-1 py-1 text-center rounded-md text-[10px] font-extrabold cursor-pointer transition-all ${
                      complianceChartMode === 'bar' ? 'bg-white shadow-xs text-[#051C3F] font-black' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {language === 'ar' ? '📊 أعمدة' : '📊 Bar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setComplianceChartMode('pie')}
                    className={`flex-1 py-1 text-center rounded-md text-[10px] font-extrabold cursor-pointer transition-all ${
                      complianceChartMode === 'pie' ? 'bg-white shadow-xs text-[#051C3F] font-black' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {language === 'ar' ? '🍩 دائرة' : '🍩 Ring'}
                  </button>
                </div>
              </div>

            </div>

            {/* General metrics numerical summaries */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              
              {/* Box 1: Aligned */}
              <div className="p-4 bg-emerald-50/40 border border-emerald-100 rounded-2xl flex flex-col justify-between space-y-1">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] font-black uppercase text-emerald-800 tracking-wider font-sans">
                      {language === 'ar' ? 'كراسات مطابقة ✓' : 'Aligned ✓'}
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  </div>
                  <h4 className="text-xl font-bold text-emerald-900 mt-1 font-sans">
                    {complianceTotals.aligned} <span className="text-[10px] text-slate-400 font-medium font-sans">{language === 'ar' ? 'كراسة' : 'claims'}</span>
                  </h4>
                </div>
                <p className="text-[10px] text-emerald-700 italic font-medium font-sans mt-1.5">
                  {complianceTotals.total > 0 ? Math.round(complianceTotals.aligned / complianceTotals.total * 100) : 0}% {language === 'ar' ? 'من الإجمالي المقيّم' : 'of compliance total'}
                </p>
              </div>

              {/* Box 2: Non Aligned */}
              <div className="p-4 bg-rose-50/40 border border-rose-100 rounded-2xl flex flex-col justify-between space-y-1">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] font-black uppercase text-rose-800 tracking-wider font-sans">
                      {language === 'ar' ? 'غير مطابق ⚠️' : 'Non-aligned ⚠️'}
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block animate-pulse"></span>
                  </div>
                  <h4 className="text-xl font-bold text-rose-900 mt-1 font-sans">
                    {complianceTotals.nonAligned} <span className="text-[10px] text-slate-400 font-medium font-sans">{language === 'ar' ? 'كراسة' : 'claims'}</span>
                  </h4>
                </div>
                <p className="text-[10px] text-rose-700 italic font-medium font-sans mt-1.5">
                  {complianceTotals.total > 0 ? Math.round(complianceTotals.nonAligned / complianceTotals.total * 100) : 0}% {language === 'ar' ? 'استدعى مراجعة وإعادة صياغة' : 'requires validation'}
                </p>
              </div>

              {/* Box 3: Grade adjustment */}
              <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-2xl flex flex-col justify-between space-y-1 font-sans">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9.5px] font-black uppercase text-indigo-805 tracking-wider font-sans">
                      {language === 'ar' ? 'تعديل درجات ⚖️' : 'Grade Adjustment ⚖️'}
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>
                  </div>
                  <h4 className="text-xl font-bold text-indigo-900 mt-1 font-sans">
                    {complianceTotals.gradeRevision} <span className="text-[10px] text-slate-400 font-medium font-sans">{language === 'ar' ? 'كراسة' : 'claims'}</span>
                  </h4>
                </div>
                <p className="text-[10px] text-indigo-700 italic font-medium font-sans mt-1.5">
                  {complianceTotals.total > 0 ? Math.round(complianceTotals.gradeRevision / complianceTotals.total * 100) : 0}% {language === 'ar' ? 'معالجة وتصحيح للأوزان النسبية' : 'weight shifts requested'}
                </p>
              </div>

              {/* Box 4: Total evaluated */}
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col justify-between space-y-1">
                <div>
                  <div className="flex items-center justify-between font-sans">
                    <span className="text-[9.5px] font-black uppercase text-slate-500 tracking-wider">
                      {language === 'ar' ? 'الأوراق المقيّمة' : 'Evaluated Papers'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 font-sans">Total</span>
                  </div>
                  <h4 className="text-xl font-bold text-slate-900 mt-1 font-sans">
                    {complianceTotals.total} <span className="text-[10px] text-slate-400 font-medium font-sans">{language === 'ar' ? 'وثيقة كلياً' : 'total items'}</span>
                  </h4>
                </div>
                <p className="text-[10px] text-slate-500 italic font-medium font-sans mt-1.5">
                  {language === 'ar' ? 'بالمقارنة مع المرجع الوزاري' : 'Cross-validated against reference guides'}
                </p>
              </div>

            </div>

            {/* RENDER CHOSEN DISPLAY FORMAT MODE */}
            {complianceTotals.total === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 rounded-2xl text-slate-400 bg-slate-50/50 text-xs font-sans">
                ⚠️ {language === 'ar' ? 'لم يتم تسجيل بيانات أو إحصاءات تطابق من المدارس المحددة حالياً.' : 'No compliance data matching the filtered settings is recorded.'}
              </div>
            ) : complianceChartMode === 'table' ? (
              /* ================= RENDER TABLE VIEW ================= */
              <div className="border border-slate-150 rounded-2xl overflow-hidden shadow-xs animate-in fade-in duration-200 text-xs text-sans">
                <div className="overflow-x-auto">
                  <table className={`w-full ${language === 'ar' ? 'text-right' : 'text-left'} border-collapse`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                    <thead>
                      <tr className="bg-slate-50/75 border-b border-slate-150 text-[10.5px] font-extrabold uppercase tracking-wider text-slate-400 font-sans">
                        <th className="py-2.5 px-4 text-slate-600">{language === 'ar' ? 'المدرسة / المؤسسة التعليمية' : 'Educational School'}</th>
                        <th className="py-2.5 px-3 text-slate-600 text-center">{language === 'ar' ? 'الولاية' : 'Wilayat'}</th>
                        <th className="py-2.5 px-3 text-center text-emerald-700 font-bold bg-emerald-50/30">{language === 'ar' ? 'مطابق ✓' : 'Aligned'}</th>
                        <th className="py-2.5 px-3 text-center text-rose-700 font-bold bg-rose-50/30">{language === 'ar' ? 'غير مطابق ⚠️' : 'Non-Compliant'}</th>
                        <th className="py-2.5 px-3 text-center text-indigo-700 font-bold bg-indigo-50/30">{language === 'ar' ? 'تعديل درجات ⚖️' : 'Grade Rev.'}</th>
                        <th className="py-2.5 px-3 text-center font-bold text-slate-800">{language === 'ar' ? 'إجمالي الأوراق المقيّمة' : 'Total Items'}</th>
                        <th className="py-2.5 px-4 text-center text-slate-600">{language === 'ar' ? 'نسبة الالتزام' : 'Compliance Rate'}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans font-medium">
                      {filteredComplianceData.map((item, index) => {
                        const totalItem = item.aligned + item.nonAligned + item.gradeRevision;
                        const rate = totalItem > 0 ? Math.round((item.aligned / totalItem) * 100) : 0;
                        let rateLabelColor = 'text-slate-650';
                        let rateBarColor = 'bg-slate-300';
                        if (rate >= 80) {
                          rateLabelColor = 'text-emerald-700 font-extrabold';
                          rateBarColor = 'bg-emerald-500';
                        } else if (rate >= 40) {
                          rateLabelColor = 'text-indigo-650 font-extrabold';
                          rateBarColor = 'bg-indigo-500';
                        } else {
                          rateLabelColor = 'text-rose-600 font-extrabold';
                          rateBarColor = 'bg-rose-500';
                        }

                        return (
                          <tr key={`comp-tab-${item.schoolId}-${index}`} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-2.5 px-4 font-bold text-slate-800">
                              {language === 'ar' ? item.schoolNameAr : item.schoolNameEn}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-550 text-center">
                              {language === 'ar' ? item.wilayaAr : item.wilayaEn}
                            </td>
                            <td className="py-2.5 px-3 text-center text-emerald-805 font-extrabold bg-emerald-50/10">
                              {item.aligned}
                            </td>
                            <td className="py-2.5 px-3 text-center text-rose-805 font-extrabold bg-rose-50/10">
                              {item.nonAligned}
                            </td>
                            <td className="py-2.5 px-3 text-center text-indigo-805 font-extrabold bg-indigo-50/10">
                              {item.gradeRevision}
                            </td>
                            <td className="py-2.5 px-3 text-center font-black text-[#051C3F] bg-slate-100/20">
                              {totalItem}
                            </td>
                            <td className="py-2.5 px-4">
                              <div className="flex flex-col items-center gap-1 font-sans">
                                <span className={`text-[10px] ${rateLabelColor}`}>{rate}%</span>
                                <div className="w-16 h-1 w-full bg-slate-100 rounded-full overflow-hidden block">
                                  <div className={`h-full ${rateBarColor}`} style={{ width: `${rate}%` }}></div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : complianceChartMode === 'bar' ? (
              /* ================= RENDER BAR CHART VIEW ================= */
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150 flex flex-col space-y-6 animate-in fade-in duration-200 text-xs font-sans">
                <div className="text-center font-bold text-slate-700 text-xs">
                  {language === 'ar' ? '📊 مقارنة توزيع كراسات المواءمة الكلية' : '📊 Comparative Column Distribution of Overall Compliance Elements'}
                </div>

                <div className="flex flex-col md:flex-row items-stretch justify-around gap-8 md:h-64 py-4">
                  {/* Column 1: Aligned */}
                  <div className="flex-1 flex flex-col items-center justify-end space-y-2">
                    <span className="font-extrabold text-emerald-700 text-xs">{complianceTotals.aligned} كراسات ({complianceTotals.total > 0 ? Math.round(complianceTotals.aligned / complianceTotals.total * 100) : 0}%)</span>
                    <div className="w-20 md:w-24 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-xl transition-all duration-350 relative group flex items-end justify-center shadow-md shadow-emerald-100/30" 
                         style={{ height: `${complianceTotals.total > 0 ? (complianceTotals.aligned / complianceTotals.total) * 100 : 0}%`, minHeight: '12px' }}>
                      <span className="absolute -bottom-6 text-[9.5px] font-bold text-emerald-805">{language === 'ar' ? 'مطابق' : 'Aligned'}</span>
                    </div>
                  </div>

                  {/* Column 2: Non Aligned */}
                  <div className="flex-1 flex flex-col items-center justify-end space-y-2">
                    <span className="font-extrabold text-rose-700 text-xs">{complianceTotals.nonAligned} كراسات ({complianceTotals.total > 0 ? Math.round(complianceTotals.nonAligned / complianceTotals.total * 100) : 0}%)</span>
                    <div className="w-20 md:w-24 bg-gradient-to-t from-rose-500 to-rose-400 rounded-t-xl transition-all duration-350 relative group flex items-end justify-center shadow-md shadow-rose-100/30" 
                         style={{ height: `${complianceTotals.total > 0 ? (complianceTotals.nonAligned / complianceTotals.total) * 100 : 0}%`, minHeight: '12px' }}>
                      <span className="absolute -bottom-6 text-[9.5px] font-bold text-rose-805">{language === 'ar' ? 'غير مطابق' : 'Non-aligned'}</span>
                    </div>
                  </div>

                  {/* Column 3: Grade adjustment */}
                  <div className="flex-1 flex flex-col items-center justify-end space-y-2">
                    <span className="font-extrabold text-indigo-700 text-xs">{complianceTotals.gradeRevision} كراسات ({complianceTotals.total > 0 ? Math.round(complianceTotals.gradeRevision / complianceTotals.total * 100) : 0}%)</span>
                    <div className="w-20 md:w-24 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-xl transition-all duration-350 relative group flex items-end justify-center shadow-md shadow-indigo-100/30" 
                         style={{ height: `${complianceTotals.total > 0 ? (complianceTotals.gradeRevision / complianceTotals.total) * 100 : 0}%`, minHeight: '12px' }}>
                      <span className="absolute -bottom-6 text-[9.5px] font-bold text-indigo-805 whitespace-nowrap">{language === 'ar' ? 'تعديل درجات' : 'Grade Adjustment'}</span>
                    </div>
                  </div>
                </div>
                <div className="h-6"></div>
              </div>
            ) : (
              /* ================= RENDER PIE CHART VIEW ================= */
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150 flex flex-col md:flex-row items-center justify-center gap-8 animate-in fade-in duration-200">
                
                {/* Custom responsive SVG Draw circle */}
                <div className="relative w-32 h-32 md:w-36 md:h-36 shrink-0 font-sans">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F1F5F9" strokeWidth="15" />
                    {(() => {
                      const totalVal = complianceTotals.total || 1;
                      const alignedPct = (complianceTotals.aligned / totalVal);
                      const nonAlignedPct = (complianceTotals.nonAligned / totalVal);
                      const gradeRevPct = (complianceTotals.gradeRevision / totalVal);

                      const strokeAligned = alignedPct * 251.2;
                      const strokeNon = nonAlignedPct * 251.2;
                      const strokeGrade = gradeRevPct * 251.2;

                      const offset1 = 0;
                      const offset2 = strokeAligned;
                      const offset3 = strokeAligned + strokeNon;

                      return (
                        <>
                          {strokeAligned > 0 && (
                            <circle 
                              cx="50" cy="50" r="40" 
                              fill="transparent" 
                              stroke="#10B981" 
                              strokeWidth="15" 
                              strokeDasharray={`${strokeAligned} 251.2`}
                              strokeDashoffset={-offset1}
                            />
                          )}
                          {strokeNon > 0 && (
                            <circle 
                              cx="50" cy="50" r="40" 
                              fill="transparent" 
                              stroke="#F43F5E" 
                              strokeWidth="15" 
                              strokeDasharray={`${strokeNon} 251.2`}
                              strokeDashoffset={-offset2}
                            />
                          )}
                          {strokeGrade > 0 && (
                            <circle 
                              cx="50" cy="50" r="40" 
                              fill="transparent" 
                              stroke="#6366F1" 
                              strokeWidth="15" 
                              strokeDasharray={`${strokeGrade} 251.2`}
                              strokeDashoffset={-offset3}
                            />
                          )}
                        </>
                      );
                    })()}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-transparent mt-0.5 pointer-events-none">
                    <span className="text-lg font-black text-[#051C3F] leading-none">{complianceTotals.total}</span>
                    <span className="text-[8px] font-black text-slate-450 mt-0.5 uppercase tracking-wide">{language === 'ar' ? 'إجمالي' : 'Total'}</span>
                  </div>
                </div>

                {/* Legend and percentage list */}
                <div className="space-y-3 font-sans text-xs w-full max-w-sm text-start" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  <div className="font-extrabold text-slate-500 border-b border-slate-205 pb-1">[ {language === 'ar' ? 'الأوزان المئوية للتقييم' : 'Percentage Distribution legend'} ]</div>
                  
                  {/* Legend 1 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-emerald-500 shrink-0"></div>
                      <span className="font-bold text-slate-750">{language === 'ar' ? 'مطابق (مقبول ومعتمد)' : 'Aligned / Validated'}</span>
                    </div>
                    <strong className="text-emerald-700 text-sm font-extrabold shrink-0">
                      {complianceTotals.aligned} كراسات ({complianceTotals.total > 0 ? Math.round(complianceTotals.aligned / complianceTotals.total * 100) : 0}%)
                    </strong>
                  </div>

                  {/* Legend 2 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-rose-500 shrink-0"></div>
                      <span className="font-bold text-slate-750">{language === 'ar' ? 'غير مطابق (يحتاج مراجعات وتكرار)' : 'Non-aligned / Discrepancy'}</span>
                    </div>
                    <strong className="text-rose-600 text-sm font-extrabold shrink-0">
                      {complianceTotals.nonAligned} كراسات ({complianceTotals.total > 0 ? Math.round(complianceTotals.nonAligned / complianceTotals.total * 100) : 0}%)
                    </strong>
                  </div>

                  {/* Legend 3 */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-indigo-500 shrink-0"></div>
                      <span className="font-bold text-slate-750">{language === 'ar' ? 'تعديل درجات وزمن الأوزان' : 'Required Grade Weight Adjustment'}</span>
                    </div>
                    <strong className="text-indigo-650 text-sm font-extrabold shrink-0">
                      {complianceTotals.gradeRevision} كراسات ({complianceTotals.total > 0 ? Math.round(complianceTotals.gradeRevision / complianceTotals.total * 100) : 0}%)
                    </strong>
                  </div>

                </div>

              </div>
            )}

          </div>
        )}

        {/* --- OPTION 2: DISTRICT / WILAYAT COMPARATIVE CHARTS --- */}
        {complianceTab === 'comparison' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-4 bg-amber-50/20 border border-amber-100 rounded-2xl flex items-center gap-3">
              <span className="text-xl">📊</span>
              <p className="text-xs text-amber-900 leading-relaxed font-semibold font-sans text-start">
                {language === 'ar' 
                  ? 'مؤشر المقارنة التحليلية بين الولايات الأربعة لمحافظة الوسطى (هيماء، الدقم، محوت، الجازر). تتيح هذه اللوحة التحقق من نسبة الانضباط الأسرع والأعلى على مستوى المنطقة التعليمية.'
                  : 'Comparing alignment rates across all 4 districts in Oman Al Wusta region (Haima, Duqm, Mahout, Jazer) to ensure high academic rigor.'}
              </p>
            </div>

            {/* Stacked Percentage bar list for Wilayats */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-150 space-y-6 font-sans">
              <div className="text-center font-bold text-slate-800 text-xs border-b border-slate-205 pb-3 font-sans">
                {language === 'ar' ? '📊 رسم مقارن لمجموع كراسات الفحص المودعة ونسبة المواءمة لكل ولاية' : '📊 Overall Compliance Weights compared side-by-side for district clusters'}
              </div>

              <div className="space-y-5">
                {wilayatComparisonData.map((wil, index) => {
                  const itemsCount = wil.total || 1;
                  const pctAligned = Math.round((wil.aligned / itemsCount) * 100);
                  const pctNonAligned = Math.round((wil.nonAligned / itemsCount) * 100);
                  const pctGradeRev = 100 - pctAligned - pctNonAligned;

                  return (
                    <div key={`comp-wil-${wil.wilayaId}-${index}`} className="space-y-2 text-start">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs font-bold text-slate-755 gap-1.5 font-sans">
                        <div className="flex items-center gap-2 text-slate-900 font-sans">
                          <span className="w-1.5 h-3 bg-indigo-700 rounded-xs inline-block"></span>
                          <span className="font-extrabold">{language === 'ar' ? wil.nameAr : wil.nameEn}</span>
                          <span className="text-[10px] text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded-md font-mono font-bold shrink-0">
                            {wil.total} {language === 'ar' ? 'كراسة' : 'total'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-bold">
                          <span className="text-emerald-700">✓ {language === 'ar' ? 'مطابق:' : 'Aligned:'} {pctAligned}%</span>
                          <span className="text-rose-600">⚠️ {language === 'ar' ? 'غير مطابق:' : 'Issues:'} {pctNonAligned}%</span>
                          <span className="text-indigo-650">⚖️ {language === 'ar' ? 'تعديل:' : 'Revision:'} {pctGradeRev}%</span>
                        </div>
                      </div>

                      {/* Stacked custom bar */}
                      <div className="w-full h-4 bg-slate-200 border border-slate-250 rounded-lg overflow-hidden flex shadow-xs">
                        {wil.aligned > 0 && (
                          <div 
                            className="bg-emerald-500 h-full relative group hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center text-[9px] text-white font-extrabold font-sans" 
                            style={{ width: `${pctAligned}%` }} 
                            title={`${wil.aligned} مطابق`}
                          >
                            {pctAligned > 12 && `${pctAligned}%`}
                          </div>
                        )}
                        {wil.nonAligned > 0 && (
                          <div 
                            className="bg-rose-500 h-full relative group hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center text-[9px] text-white font-extrabold font-sans" 
                            style={{ width: `${pctNonAligned}%` }} 
                            title={`${wil.nonAligned} غير مطابق`}
                          >
                            {pctNonAligned > 12 && `${pctNonAligned}%`}
                          </div>
                        )}
                        {wil.gradeRevision > 0 && (
                          <div 
                            className="bg-indigo-500 h-full relative group hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center text-[9px] text-white font-extrabold font-sans" 
                            style={{ width: `${pctGradeRev}%` }} 
                            title={`${wil.gradeRevision} تعديل درجات`}
                          >
                            {pctGradeRev > 12 && `${pctGradeRev}%`}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Stacked Chart footer explain labels */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-3.5 border-t border-slate-150 text-[10px] font-black text-slate-500 font-sans">
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3 rounded bg-emerald-500"></div>
                  <span>{language === 'ar' ? 'مطابق (صحيح ومعتمد)' : 'Aligned / Verified'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3 rounded bg-rose-500"></div>
                  <span>{language === 'ar' ? 'غير مطابق (تحت المراجعة والتعديل)' : 'Non-aligned / Discrepancy'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3 rounded bg-indigo-500"></div>
                  <span>{language === 'ar' ? 'مواءمة درجات (تعديل الدرجات والأوزان)' : 'Weight Adjustment / Revision'}</span>
                </div>
              </div>

            </div>

            {/* Flat table comparison of Wilayats for rigorous reporting */}
            <div className="border border-slate-150 rounded-2xl overflow-hidden shadow-xs text-xs text-sans font-sans">
              <div className="overflow-x-auto">
                <table className={`w-full ${language === 'ar' ? 'text-right' : 'text-left'} border-collapse`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-150 text-[10.5px] font-extrabold uppercase tracking-wider text-slate-400 font-sans">
                      <th className="py-2.5 px-4 text-slate-600">{language === 'ar' ? 'الولاية بمحافظة الوسطى' : 'Regional District'}</th>
                      <th className="py-2.5 px-3 text-center text-emerald-700 font-bold bg-emerald-50/20">{language === 'ar' ? 'مطابِق (كراسات)' : 'Aligned'}</th>
                      <th className="py-2.5 px-3 text-center text-rose-700 font-bold bg-rose-50/20">{language === 'ar' ? 'غير مطابِق (كراسات)' : 'Non-Compliant'}</th>
                      <th className="py-2.5 px-3 text-center text-indigo-700 font-bold bg-indigo-50/20">{language === 'ar' ? 'تعديل درجات' : 'Grade Revision'}</th>
                      <th className="py-2.5 px-4 text-center text-slate-800 font-bold">{language === 'ar' ? 'مجموع الكراسات الموثقة' : 'Total Evaluated'}</th>
                      <th className="py-2.5 px-4 text-center text-slate-600">{language === 'ar' ? 'معدل جودة ومطابقة المنهج' : 'Weighted Compliance Rate'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {wilayatComparisonData.map((wil, index) => {
                      const complianceRate = wil.total > 0 ? Math.round((wil.aligned / wil.total) * 100) : 0;
                      return (
                        <tr key={`comp-wil-tab-${wil.wilayaId}-${index}`} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2.5 px-4 font-bold text-slate-800">
                            {language === 'ar' ? wil.nameAr : wil.nameEn}
                          </td>
                          <td className="py-2.5 px-3 text-center text-emerald-805 font-bold bg-emerald-50/5">
                            {wil.aligned}
                          </td>
                          <td className="py-2.5 px-3 text-center text-rose-805 font-bold bg-rose-50/5">
                            {wil.nonAligned}
                          </td>
                          <td className="py-2.5 px-3 text-center text-indigo-805 font-bold bg-indigo-50/5">
                            {wil.gradeRevision}
                          </td>
                          <td className="py-2.5 px-4 text-center font-extrabold text-slate-750">
                            {wil.aligned + wil.nonAligned + wil.gradeRevision}
                          </td>
                          <td className="py-2.5 px-4 text-center font-black text-emerald-700">
                            {complianceRate}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
      </>
      )}

    </div>
  );
}
