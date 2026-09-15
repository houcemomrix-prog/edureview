import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Trash2, 
  Edit2, 
  ShieldAlert, 
  Sparkles, 
  X, 
  Save, 
  Phone, 
  Mail, 
  Calendar, 
  GraduationCap, 
  Building2, 
  BookOpen, 
  Lock,
  UserCheck,
  Search,
  Filter,
  Shield
} from 'lucide-react';
import { UserProfile, UserRole } from '../types';
import { getAllUserProfiles, createUserProfile, deleteUserProfileAdmin } from '../services/db';
import { Language, translateSubject, translateGrade } from '../lib/translations';
import { OMAN_WUSTA_SCHOOLS } from '../data/schoolsData';

interface UserDatabaseViewProps {
  language: Language;
  subjects: string[];
}

const CONST_GRADES = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 
  'Grade 11', 'Grade 12'
];



export function UserDatabaseView({ language, subjects }: UserDatabaseViewProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formJobTitle, setFormJobTitle] = useState<'معلم' | 'مدقق' | 'مدير مدرسة' | 'مدير النظام'>('معلم');
  const [formSchool, setFormSchool] = useState('');
  const [formWilaya, setFormWilaya] = useState('');
  const [formDirectorate, setFormDirectorate] = useState('المديرية العامة للتعليم بمحافظة الوسطى');
  const [formAppointmentYear, setFormAppointmentYear] = useState('');
  const [schoolWilaya, setSchoolWilaya] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formSubject, setFormSubject] = useState('Arabic Language');

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'مدقق' | 'معلم' | 'مدير مدرسة' | 'مدير النظام'>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');

  // Helper functions to map Arabic Job titles to internal authorization roles
  const getJobTitleFromRoleAndType = (role: string, roleType?: string): 'معلم' | 'مدقق' | 'مدير مدرسة' | 'مدير النظام' => {
    if (role === 'admin') return 'مدير النظام';
    if (role === 'moderator') return 'مدقق';
    if (role === 'school' && roleType === 'administrative') return 'مدير مدرسة';
    return 'معلم';
  };

  const getRoleAndTypeFromJobTitle = (jobTitle: 'معلم' | 'مدقق' | 'مدير مدرسة' | 'مدير النظام'): { role: UserRole; roleType?: 'administrative' | 'teacher' } => {
    if (jobTitle === 'مدير النظام') return { role: 'admin' };
    if (jobTitle === 'مدقق') return { role: 'moderator' };
    if (jobTitle === 'مدير مدرسة') return { role: 'school', roleType: 'administrative' };
    return { role: 'school', roleType: 'teacher' };
  };

  // Find wilaya of school name to prepopulate
  const getWilayaIdFromSchoolName = (schoolName: string): string => {
    if (!schoolName) return '';
    const found = OMAN_WUSTA_SCHOOLS.find(w => 
      w.schools.some(s => s.nameAr === schoolName || s.nameEn === schoolName)
    );
    return found ? found.id : 'custom';
  };

  const getWilayaNameFromId = (id: string): string => {
    const found = OMAN_WUSTA_SCHOOLS.find(w => w.id === id);
    return found ? found.nameAr : '';
  };

  // Delete matching state
  const [confirmDeleteUid, setConfirmDeleteUid] = useState<string | null>(null);

  // Fetch all users on mount
  const loadUsers = async () => {
    setLoading(true);
    try {
      const results = await getAllUserProfiles();
      setUsers(results);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(language === 'ar' ? 'حدث خطأ أثناء تحميل قاعدة بيانات المستخدمين.' : 'Failed to retrieve user database from servers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const clearSuccess = () => {
    setTimeout(() => {
      setSuccessMsg(null);
    }, 4000);
  };

  // Open Add modal
  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormName('');
    setFormEmail('');
    setFormJobTitle('معلم');
    setFormSchool('');
    setFormWilaya('');
    setFormDirectorate('المديرية العامة للتعليم بمحافظة الوسطى');
    setSchoolWilaya('');
    setFormAppointmentYear(new Date().getFullYear().toString());
    setFormPhone('');
    setFormSubject('Arabic Language');
    setIsModalOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (user: UserProfile) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    
    const computedJob = user.jobTitle || getJobTitleFromRoleAndType(user.role, user.roleType);
    setFormJobTitle(computedJob);
    
    if (computedJob === 'مدقق' || computedJob === 'مدير النظام') {
      setFormSchool('');
      setFormWilaya('');
      setSchoolWilaya('');
    } else {
      setFormSchool(user.schoolName || '');
      setFormWilaya(user.wilaya || '');
      const wId = getWilayaIdFromSchoolName(user.schoolName || '');
      setSchoolWilaya(wId);
    }
    setFormDirectorate(user.directorate || 'المديرية العامة للتربية والتعليم بمحافظة الوسطى');
    
    setFormAppointmentYear(user.appointmentYear || '');
    setFormPhone(user.phoneNumber || '');
    setFormSubject(user.subject || (computedJob === 'مدقق' ? 'All Subjects' : 'Arabic Language'));
    setIsModalOpen(true);
  };

  // Handle Submit Form (Add or Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic Validation
    if (!formName.trim() || !formEmail.trim()) {
      setError(language === 'ar' ? 'الرجاء إدخال حقل الاسم والبريد الإلكتروني الوزاري.' : 'Please provide user name and official email.');
      return;
    }

    if (!formEmail.toLowerCase().endsWith('@moe.om')) {
      setError(language === 'ar' ? 'يجب إدخال بريد إلكتروني ينتهي بـ @moe.om ومطابق للأنظمة الوزارية.' : 'Official ministerial email must terminate with "@moe.om".');
      return;
    }

    try {
      const uid = editingUser ? editingUser.uid : 'user-' + Math.random().toString(36).substring(2, 9);
      
      const { role, roleType } = getRoleAndTypeFromJobTitle(formJobTitle);

      const isSubjectRelevant = formJobTitle === 'معلم' || formJobTitle === 'مدقق';
      const isAuditor = formJobTitle === 'مدقق';
      const isAdmin = formJobTitle === 'مدير النظام';

      const payload: UserProfile = {
        uid,
        name: formName.trim(),
        email: formEmail.trim().toLowerCase(),
        role,
        roleType,
        schoolName: (isAuditor || isAdmin) ? undefined : formSchool.trim(),
        wilaya: (isAuditor || isAdmin) ? undefined : formWilaya.trim(),
        directorate: formDirectorate.trim() || 'المديرية العامة للتربية والتعليم بمحافظة الوسطى',
        appointmentYear: formAppointmentYear.trim(),
        jobTitle: formJobTitle,
        phoneNumber: formPhone.trim(),
        subject: isSubjectRelevant ? formSubject : undefined,
        createdAt: editingUser ? editingUser.createdAt : new Date().toISOString()
      };

      await createUserProfile(payload);

      setIsModalOpen(false);
      setSuccessMsg(
        editingUser 
          ? (language === 'ar' ? 'تم تحديث بيانات المستخدم بنجاح.' : 'User configuration saved successfully.')
          : (language === 'ar' ? 'تم تسجيل وإضافة مستخدم وزاري جديد بنجاح.' : 'Registered new ministerial staff successfully.')
      );
      clearSuccess();
      loadUsers();
    } catch (err: any) {
      console.error(err);
      setError(err.message || (language === 'ar' ? 'فشل حفظ الملف التعريفي.' : 'Could not save profile setup.'));
    }
  };

  // Delete User handler
  const handleDelete = async (uid: string) => {
    setError(null);
    try {
      await deleteUserProfileAdmin(uid);
      setSuccessMsg(language === 'ar' ? 'تم إزالة المستخدم وحذف بياناته نهائياً.' : 'Staff deleted and wiped successfully from index.');
      clearSuccess();
      setConfirmDeleteUid(null);
      loadUsers();
    } catch (err: any) {
      console.error(err);
      setError(language === 'ar' ? 'حدث خطأ أثناء محاولة إزالة الفايل.' : 'An error occurred while deleting staff record.');
    }
  };

  const countAll = users.length;
  const countAuditors = users.filter(u => (u.jobTitle || getJobTitleFromRoleAndType(u.role, u.roleType)) === 'مدقق').length;
  const countTeachers = users.filter(u => (u.jobTitle || getJobTitleFromRoleAndType(u.role, u.roleType)) === 'معلم').length;
  const countPrincipals = users.filter(u => (u.jobTitle || getJobTitleFromRoleAndType(u.role, u.roleType)) === 'مدير مدرسة').length;
  const countAdmins = users.filter(u => (u.jobTitle || getJobTitleFromRoleAndType(u.role, u.roleType)) === 'مدير النظام').length;

  const filteredUsers = users.filter(u => {
    const computedJob = u.jobTitle || getJobTitleFromRoleAndType(u.role, u.roleType);
    if (roleFilter !== 'all' && computedJob !== roleFilter) {
      return false;
    }
    if (subjectFilter !== 'all') {
      if (u.subject !== subjectFilter) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = u.name?.toLowerCase().includes(q);
      const matchEmail = u.email?.toLowerCase().includes(q);
      const matchSchool = u.schoolName?.toLowerCase().includes(q);
      const matchPhone = u.phoneNumber?.toLowerCase().includes(q);
      const matchJob = computedJob.toLowerCase().includes(q);
      const matchSub = u.subject?.toLowerCase().includes(q) || 
        translateSubject(u.subject || '', language).toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchSchool && !matchPhone && !matchJob && !matchSub) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-205/50 shadow-md animate-in fade-in duration-200 text-left font-sans">
      
      {/* Header element */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h3 className="text-lg font-extrabold font-heading text-[#0B1E40] flex items-center gap-2">
            <span>👥 {language === 'ar' ? 'قاعدة بيانات الطاقم والمستخدمين' : 'Ministry Staff & Users Database'}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            {language === 'ar' 
              ? 'تتبع مركزي ومطابقة شاملة لجميع حسابات ممثلي المدارس والمشرفين التربويين بوزارة التعليم العمانية.' 
              : 'Central registry for all active continuous evaluation managers, regional supervisors, and administrative officers.'}
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="w-full sm:w-auto px-4 py-2.5 bg-[#051C3F] hover:bg-[#124282] text-white rounded-xl text-xs font-bold font-heading flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md active:scale-95"
          id="btn-add-user"
        >
          <UserPlus className="w-4 h-4 text-amber-400" />
          <span>{language === 'ar' ? 'إضافة مستخدم جديد' : 'Add New Staff'}</span>
        </button>
      </div>

      {/* Alert overlays */}
      {error && (
        <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs leading-relaxed max-w-2xl text-rose-800">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs leading-relaxed max-w-2xl text-emerald-800 animate-in slide-in-from-top-2 duration-200">
          <UserCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="mt-5 pt-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Role Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => { setRoleFilter('all'); setSubjectFilter('all'); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              roleFilter === 'all'
                ? 'bg-[#051C3F] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {language === 'ar' ? 'الكل' : 'All'} ({countAll})
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('مدقق')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              roleFilter === 'مدقق'
                ? 'bg-sky-700 text-white shadow-xs'
                : 'bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-100'
            }`}
          >
            <span>🔍</span>
            <span>{language === 'ar' ? 'المدققين' : 'Auditors'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/40 font-mono font-bold">{countAuditors}</span>
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('معلم')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              roleFilter === 'معلم'
                ? 'bg-[#051C3F] text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>📚</span>
            <span>{language === 'ar' ? 'المعلمين' : 'Teachers'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 font-mono font-bold">{countTeachers}</span>
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('مدير مدرسة')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              roleFilter === 'مدير مدرسة'
                ? 'bg-purple-800 text-white shadow-xs'
                : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-100'
            }`}
          >
            <span>🏢</span>
            <span>{language === 'ar' ? 'مدراء المدارس' : 'Principals'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/40 font-mono font-bold">{countPrincipals}</span>
          </button>
          <button
            type="button"
            onClick={() => setRoleFilter('مدير النظام')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              roleFilter === 'مدير النظام'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-150'
            }`}
          >
            <span>🛡️</span>
            <span>{language === 'ar' ? 'إدارة النظام' : 'Admins'}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/40 font-mono font-bold">{countAdmins}</span>
          </button>
        </div>

        {/* Search & Subject filter */}
        <div className="flex items-center gap-2">
          {(roleFilter === 'all' || roleFilter === 'مدقق' || roleFilter === 'معلم') && (
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:outline-none focus:border-[#051C3F] cursor-pointer"
            >
              <option key="user-filter-all" value="all">{language === 'ar' ? 'جميع المواد' : 'All Subjects'}</option>
              {roleFilter === 'مدقق' && (
                <option key="user-filter-universal" value="All Subjects">{language === 'ar' ? '🌟 مدقق شامل (كافة المواد)' : '🌟 Universal (All Subjects)'}</option>
              )}
              {subjects.map((s, index) => (
                <option key={`user-filter-subj-${s}-${index}`} value={s}>{translateSubject(s, language)}</option>
              ))}
            </select>
          )}

          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 rtl:left-auto rtl:right-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'ar' ? 'بحث بالاسم، المادة...' : 'Search staff, subject...'}
              className="w-full pl-8 pr-7 rtl:pr-8 rtl:pl-7 py-1.5 text-xs font-bold border border-slate-200 rounded-xl bg-slate-50 text-slate-800 focus:outline-none focus:border-[#051C3F]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rtl:right-auto rtl:left-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Database Viewport Desk */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-xs text-slate-705 text-left rtl:text-right border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[10.5px] font-black uppercase text-slate-400 tracking-wider bg-slate-50/50">
              <th className="py-3.5 px-4 font-extrabold">{language === 'ar' ? 'الاسم كاملاً' : 'Full Name'}</th>
              <th className="py-3.5 px-4 font-extrabold">{language === 'ar' ? 'الصفة / التخصص' : 'Job Title / Subject'}</th>
              <th className="py-3.5 px-4 font-extrabold">{language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}</th>
              <th className="py-3.5 px-4 font-extrabold">{language === 'ar' ? 'البريد الإلكتروني الوزاري' : 'Ministerial Email'}</th>
              <th className="py-3.5 px-4 font-extrabold">{language === 'ar' ? 'الولاية' : 'Wilaya'}</th>
              <th className="py-3.5 px-4 font-extrabold">{language === 'ar' ? 'المديرية' : 'Directorate'}</th>
              <th className="py-3.5 px-4 font-extrabold">{language === 'ar' ? 'المدرسة' : 'School'}</th>
              <th className="py-3.5 px-4 font-extrabold">{language === 'ar' ? 'سنة التعيين' : 'Appointment Year'}</th>
              <th className="py-3.5 px-4 font-extrabold text-center">{language === 'ar' ? 'الإجراءات الإدارية' : 'Admin Operations'}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr key="user-db-loading">
                <td colSpan={9} className="text-center py-16 text-slate-400 font-bold">
                  <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-[#051C3F] animate-spin mx-auto mb-3"></div>
                  <span>{language === 'ar' ? 'جاري قراءة وتصنيف بيانات الكوادر...' : 'Retrieving Omani system directory records...'}</span>
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr key="user-db-empty">
                <td colSpan={9} className="text-center py-14 text-slate-400 font-bold">
                  {language === 'ar' ? 'لم يتم العثور على أي كادر مطابق للشروط المحددة.' : 'No active educational staff found matching criteria.'}
                </td>
              </tr>
            ) : (
              filteredUsers.map((u, index) => {
                const computedJob = u.jobTitle || getJobTitleFromRoleAndType(u.role, u.roleType);
                return (
                  <tr key={`${u.uid || 'user'}-${index}`} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    
                    {/* name column */}
                    <td className="py-4 px-4 font-black font-heading text-[#0B1E40] text-sm md:text-xs">
                       {u.name}
                    </td>

                    {/* job title / role category column */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <span className={`inline-flex px-2 py-0.5 rounded-lg text-[10px] items-center font-black ${
                          computedJob === 'مدير النظام' 
                            ? 'bg-amber-100 text-[#735200] border border-amber-200/50' 
                            : computedJob === 'مدقق'
                              ? 'bg-sky-50 text-sky-800 border border-sky-100'
                              : computedJob === 'مدير مدرسة'
                                ? 'bg-purple-50 text-purple-800 border border-purple-100'
                                : 'bg-slate-100 text-slate-700'
                        }`}>
                          {computedJob}
                        </span>
                        {computedJob === 'معلم' && u.subject && (
                          <div className="text-[10px] font-bold text-[#051C3F] flex items-center gap-1 mt-0.5">
                            <span>📚</span>
                            <span>{translateSubject(u.subject, language)}</span>
                          </div>
                        )}
                        {computedJob === 'مدقق' && (
                          <div className="text-[10px] font-bold flex items-center gap-1 mt-0.5">
                            {u.subject ? (
                              <span className="text-sky-700 bg-sky-50 border border-sky-200/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <span>🔍</span>
                                <span>
                                  {u.subject === 'All Subjects' || u.subject === 'all' || u.subject === 'جميع المواد'
                                    ? (language === 'ar' ? 'جميع المواد (شامل)' : 'All Subjects')
                                    : translateSubject(u.subject, language)}
                                </span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(u)}
                                className="text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                                title={language === 'ar' ? 'انقر لتعيين مادة التدقيق لهذا المدقق' : 'Click to assign audit subject'}
                              >
                                <span>⚠️</span>
                                <span>{language === 'ar' ? 'لم تُحدد مادة (تعيين)' : 'No subject (Assign)'}</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* phone number column */}
                    <td className="py-4 px-4 font-mono font-medium text-[#051C3F]">
                      {u.phoneNumber ? (
                        <div className="flex items-center gap-1.5 font-bold">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{u.phoneNumber}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300 italic">—</span>
                      )}
                    </td>

                    {/* ministerial email column */}
                    <td className="py-4 px-4 font-mono select-all font-bold">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-indigo-650 hover:underline">{u.email}</span>
                      </div>
                    </td>

                    {/* wilaya column */}
                    <td className="py-4 px-4 font-semibold text-slate-600">
                      {computedJob === 'مدقق' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-sky-50 text-sky-850 border border-sky-200/80">
                          <span>🏛️</span>
                          <span>{language === 'ar' ? 'على مستوى المحافظة' : 'Governorate Level'}</span>
                        </span>
                      ) : computedJob === 'مدير النظام' ? (
                        <span className="text-slate-400 font-medium text-[11px]">—</span>
                      ) : (
                        u.wilaya || '—'
                      )}
                    </td>

                    {/* directorate column */}
                    <td className="py-4 px-4 text-slate-600 font-medium whitespace-normal max-w-[200px]">
                      <span className="font-bold text-[#051C3F] block text-xs">
                        {u.directorate || (language === 'ar' ? 'المديرية العامة للتربية والتعليم بمحافظة الوسطى' : 'General Directorate of Education - Al Wusta')}
                      </span>
                    </td>

                    {/* school Name column */}
                    <td className="py-4 px-4 font-semibold text-slate-600">
                      {computedJob === 'مدقق' ? (
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                          <Building2 className="w-3.5 h-3.5 text-sky-600" />
                          <span className="font-bold text-[11px] text-slate-600">
                            {language === 'ar' ? 'لا يتبع مدرسة' : 'No school'}
                          </span>
                        </div>
                      ) : computedJob === 'مدير النظام' ? (
                        <span className="text-slate-400 font-medium text-[11px]">—</span>
                      ) : u.schoolName ? (
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{u.schoolName}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300 italic">—</span>
                      )}
                    </td>

                    {/* date of appointment (year only) */}
                    <td className="py-4 px-4 font-mono text-center font-bold text-slate-600">
                      {u.appointmentYear ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{u.appointmentYear}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300 italic">—</span>
                      )}
                    </td>

                    {/* Actions column */}
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        
                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(u)}
                          className="p-1.5 rounded-lg border border-slate-100 bg-white hover:bg-slate-100 text-[#051C3F] transition-all cursor-pointer"
                          title={language === 'ar' ? 'تعديل بيانات الكادر' : 'Edit Configuration'}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Flow */}
                        {confirmDeleteUid === u.uid ? (
                          <div className="flex items-center gap-1.5 animate-in slide-in-from-right-2 duration-150">
                            <button
                              type="button"
                              onClick={() => handleDelete(u.uid)}
                              className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[10px] font-black cursor-pointer shadow-xs"
                            >
                              {language === 'ar' ? 'تأكيد الحذف' : 'Confirm'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteUid(null)}
                              className="p-1 hover:bg-slate-100 rounded text-slate-450 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={u.role === 'admin'}
                            onClick={() => setConfirmDeleteUid(u.uid)}
                            className="p-1.5 rounded-lg border border-rose-100 bg-white hover:bg-rose-50 text-rose-600 transition-all disabled:opacity-30 disabled:hover:bg-white cursor-pointer"
                            title={language === 'ar' ? 'حذف من النظام' : 'Delete Staff'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* FORM DIALOG MODAL (ADD / EDIT) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-150 w-full max-w-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-150 text-slate-800">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-radial from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#051C3F]/10 flex items-center justify-center border border-[#051C3F]/20">
                  <UserPlus className="w-5 h-5 text-[#051C3F]" />
                </div>
                <div>
                  <h3 className="font-bold font-heading text-slate-800 text-base leading-tight">
                    {editingUser 
                      ? (language === 'ar' ? 'تعديل بيانات الكادر' : 'Edit Staff Registration') 
                      : (language === 'ar' ? 'تسجيل كادر وزاري جديد' : 'Register New MoE Educational Staff')}
                  </h3>
                  <p className="text-[11px] text-slate-400 font-sans mt-0.5">
                    {language === 'ar' ? 'يرجى استيفاء الحقول بدقة طبقاً للأنظمة الوزارية.' : 'Fill the fields for official registration.'}
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 rounded-xl p-2 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-5">
              
              {/* Main Fields Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest block font-sans">
                    {language === 'ar' ? 'الاسم كاملاً ثنائياً أو ثلاثياً' : 'Full Name'} <span className="text-rose-500 font-black">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: فاطمة بنت مبارك البوسعيدية' : 'e.g. Salim Al-Harthy'}
                    className="w-full px-4.5 py-3 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#051C3F] bg-slate-50/50 font-bold"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest block font-sans">
                    {language === 'ar' ? 'البريد الإلكتروني الوزاري الرسمي (@moe.om)' : 'Official Ministerial Email'} <span className="text-rose-500 font-black">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="name@moe.om"
                    className="w-full px-4.5 py-3 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#051C3F] bg-slate-50/50 font-mono font-bold"
                  />
                </div>

                {/* Job Title Select */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest block font-sans">
                    {language === 'ar' ? 'الصفة' : 'Job Title'}
                  </label>
                  <select
                    value={formJobTitle}
                    onChange={(e) => {
                      const newJob = e.target.value as any;
                      setFormJobTitle(newJob);
                      if (newJob === 'مدقق' && (!formSubject || formSubject === 'Arabic Language')) {
                        setFormSubject('All Subjects');
                      } else if (newJob === 'معلم' && formSubject === 'All Subjects') {
                        setFormSubject('Arabic Language');
                      }
                    }}
                    className="w-full px-3 py-3 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none bg-slate-50/50 font-bold cursor-pointer"
                  >
                    <option value="معلم">{language === 'ar' ? 'معلم' : 'Teacher'}</option>
                    <option value="مدقق">{language === 'ar' ? 'مدقق' : 'Auditor'}</option>
                    <option value="مدير مدرسة">{language === 'ar' ? 'مدير مدرسة' : 'School Principal'}</option>
                    <option value="مدير النظام">{language === 'ar' ? 'مدير النظام' : 'System Administrator'}</option>
                  </select>
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest block font-sans">
                    {language === 'ar' ? 'رقم الهاتف المتصل بالنظام' : 'Phone Number'}
                  </label>
                  <input
                    type="tel"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+968 9123 4567"
                    className="w-full px-4.5 py-3 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#051C3F] bg-slate-50/50 font-mono font-bold"
                  />
                </div>

                {/* Date of Appointment */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest block font-sans">
                    {language === 'ar' ? 'سنة التعيين (السنة فقط)' : 'Appointment Year (Year Only)'}
                  </label>
                  <input
                    type="number"
                    min="1970"
                    max={new Date().getFullYear()}
                    value={formAppointmentYear}
                    onChange={(e) => setFormAppointmentYear(e.target.value)}
                    placeholder="2020"
                    className="w-full px-4.5 py-3 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#051C3F] bg-slate-50/50 font-mono font-bold"
                  />
                </div>

                {/* Directorate General */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-450 uppercase tracking-widest block font-sans">
                    {language === 'ar' ? 'المديرية العامة التعليمية' : 'General Directorate of Education'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formDirectorate}
                    onChange={(e) => setFormDirectorate(e.target.value)}
                    placeholder={language === 'ar' ? 'المديرية العامة للتعليم بمحافظة الوسطى' : 'General Directorate of Education - Al Wusta'}
                    className="w-full px-4.5 py-3 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#051C3F] bg-slate-50/50 font-bold"
                  />
                </div>

              </div>

              {/* Subject Select, conditional on Job Title being Teacher ('معلم') or Auditor ('مدقق') */}
              {(formJobTitle === 'معلم' || formJobTitle === 'مدقق') && (
                <div className="space-y-2 p-4 bg-sky-50/50 rounded-2xl border border-sky-200/60 text-right animate-in fade-in duration-150" dir="rtl">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-black text-[#051C3F] uppercase tracking-wider block font-sans">
                      {formJobTitle === 'مدقق' 
                        ? (language === 'ar' ? '🔍 المادة الدراسية المسندة لتدقيقها (تخصص المدقق)' : '🔍 Assigned Subject for Audit Specialty')
                        : (language === 'ar' ? '📚 المادة الدراسية المسندة للمعلم' : '📚 Assigned Academic Subject Specialty')}
                    </label>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#051C3F] text-white">
                      {formJobTitle === 'مدقق' 
                        ? (language === 'ar' ? 'تخصص التدقيق الفني' : 'Audit Domain') 
                        : (language === 'ar' ? 'تخصص التدريس' : 'Teaching Subject')}
                    </span>
                  </div>
                  <select
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#051C3F] bg-white font-bold cursor-pointer shadow-xs"
                  >
                    {formJobTitle === 'مدقق' && (
                      <option key="user-edit-sub-all-subjects" value="All Subjects">
                        {language === 'ar' ? '🌟 جميع المواد (مدقق شامل لكافة التخصصات)' : '🌟 All Subjects (Universal Auditor)'}
                      </option>
                    )}
                    {subjects.map((sub, index) => (
                      <option key={`user-edit-sub-${sub}-${index}`} value={sub}>{translateSubject(sub, language)}</option>
                    ))}
                  </select>
                  <p className="text-[10.5px] text-slate-500 font-sans leading-relaxed">
                    {formJobTitle === 'مدقق'
                      ? (language === 'ar'
                          ? 'تحديد المادة يمنح المدقق صلاحية مراجعة وتدقيق واعتماد استمارات ونماذج التقييم الخاصة بهذه المادة حصراً، أو اختيار "جميع المواد" للإشراف والتدقيق العام لكافة التخصصات.'
                          : 'Assigning a subject allows the auditor to review, moderate, and approve evaluation forms for this subject, or choose "All Subjects" for universal oversight.')
                      : (language === 'ar'
                          ? 'المادة الدراسية الأساسية المسندة لتدريسها من قبل المعلم في المدرسة.'
                          : 'Primary academic subject taught by the teacher in the assigned school.')}
                  </p>
                </div>
              )}

              {/* Institutional Affiliation / School and Wilaya Selector block */}
              {formJobTitle === 'مدقق' ? (
                <div className="space-y-3 p-4 bg-sky-50/70 rounded-2xl border border-sky-200 text-right animate-in fade-in duration-150" dir="rtl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#051C3F] font-black text-xs">
                      <Building2 className="w-4 h-4 text-sky-700" />
                      <span>{language === 'ar' ? 'التبعية المؤسسية: المديرية العامة بمحافظة الوسطى' : 'Institutional Affiliation: Al Wusta Directorate'}</span>
                    </div>
                    <span className="text-[10px] font-black px-2.5 py-0.5 rounded-md bg-[#051C3F] text-white">
                      {language === 'ar' ? 'فاحص مركزي بالمحافظة' : 'Central Examiner'}
                    </span>
                  </div>

                  <p className="text-[11.5px] text-slate-700 font-sans leading-relaxed">
                    {language === 'ar'
                      ? '⚠️ تنبيه تنظيمي: الفاحص / المدقق لا يتبع أي ولاية أو مدرسة محددة، بل يتبع المديرية العامة للتربية والتعليم بمحافظة الوسطى مباشرة، لتمكينه من فحص وتدقيق استمارات ونماذج التقييم لكافة المدارس على مستوى المحافظة.'
                      : '⚠️ Administrative Note: The examiner/auditor is not affiliated with any specific wilaya or school. They report exclusively to the Directorate General of Education in Al Wusta to audit evaluations across all schools.'}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] font-bold">
                    <div className="p-2.5 rounded-xl bg-white border border-sky-100 flex items-center gap-2 text-slate-800 shadow-2xs">
                      <span className="text-base">🏛️</span>
                      <div>
                        <span className="text-[9.5px] text-slate-400 block font-semibold">{language === 'ar' ? 'المحافظة' : 'Governorate'}</span>
                        <span className="text-[#051C3F] font-black">{language === 'ar' ? 'محافظة الوسطى' : 'Al Wusta'}</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-sky-100 flex items-center gap-2 text-slate-800 shadow-2xs">
                      <span className="text-base">📍</span>
                      <div>
                        <span className="text-[9.5px] text-slate-400 block font-semibold">{language === 'ar' ? 'نطاق الولاية' : 'Wilaya Scope'}</span>
                        <span className="text-slate-600 font-bold">{language === 'ar' ? 'على مستوى المحافظة' : 'Province-wide'}</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-sky-100 flex items-center gap-2 text-slate-800 shadow-2xs">
                      <span className="text-base">🏫</span>
                      <div>
                        <span className="text-[9.5px] text-slate-400 block font-semibold">{language === 'ar' ? 'المدرسة' : 'School'}</span>
                        <span className="text-slate-600 font-bold">{language === 'ar' ? 'لا يتبع مدرسة' : 'No school bound'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : formJobTitle === 'مدير النظام' ? (
                <div className="space-y-2 p-4 bg-amber-50/60 rounded-2xl border border-amber-200 text-right animate-in fade-in duration-150" dir="rtl">
                  <div className="flex items-center gap-2 text-amber-900 font-black text-xs">
                    <Shield className="w-4 h-4 text-amber-700" />
                    <span>{language === 'ar' ? 'التبعية: إدارة المنصة المركزية' : 'Portal System Administrator'}</span>
                  </div>
                  <p className="text-[11px] text-amber-800 font-sans leading-relaxed">
                    {language === 'ar' 
                      ? 'مدير النظام يتبع إدارة البوابة بالوزارة ولا يرتبط بمدرسة أو ولاية بعينها.' 
                      : 'System Administrator operates at the central ministerial portal level.'}
                  </p>
                </div>
              ) : (
                /* School and Wilaya Selector block for Teacher and Principal */
                <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-150 text-right" dir="rtl">
                  <h4 className="text-[11px] font-black text-[#051C3F] uppercase tracking-wide">
                    {language === 'ar' ? '🏢 تحديد الولاية والمدرسة المنتسب إليها' : '🏢 Choose Registered Wilayat & School'}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-right">
                    {/* Wilaya Selection */}
                    <div className="space-y-1.5 text-right">
                      <label className="text-[10px] font-extrabold text-slate-400 block">
                        {language === 'ar' ? 'الولاية (محافظة الوسطى)' : 'Wilayat (Al Wusta Region)'}
                      </label>
                      <select
                        value={schoolWilaya}
                        onChange={(e) => {
                          const wId = e.target.value;
                          setSchoolWilaya(wId);
                          if (wId && wId !== 'custom') {
                            const wName = getWilayaNameFromId(wId);
                            setFormWilaya(wName);
                            const wilaya = OMAN_WUSTA_SCHOOLS.find(w => w.id === wId);
                            if (wilaya && wilaya.schools.length > 0) {
                              setFormSchool(wilaya.schools[0].nameAr);
                            } else {
                              setFormSchool('');
                            }
                          } else {
                            setFormWilaya('');
                            setFormSchool('');
                          }
                        }}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-850 bg-white focus:outline-none focus:border-[#051C3F] font-bold"
                      >
                        <option key="user-wilaya-default" value="">{language === 'ar' ? '-- اختر الولاية --' : '-- Choose Wilayat --'}</option>
                        {OMAN_WUSTA_SCHOOLS.map(w => (
                          <option key={`user-wilaya-opt-${w.id}`} value={w.id}>{language === 'ar' ? w.nameAr : w.nameEn}</option>
                        ))}
                        <option key="user-wilaya-custom" value="custom">{language === 'ar' ? '✍️ كتابة يدوية' : '✍️ Custom Entry'}</option>
                      </select>
                    </div>

                    {/* School Dropdown or custom text input depending on wilaya */}
                    <div className="space-y-1.5 text-right">
                      <label className="text-[10px] font-extrabold text-slate-400 block">
                        {language === 'ar' ? 'المدرسة التابعة للولاية' : 'School'}
                      </label>
                      
                      {schoolWilaya && schoolWilaya !== 'custom' ? (
                        <select
                          value={formSchool}
                          onChange={(e) => setFormSchool(e.target.value)}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-855 bg-white focus:outline-none focus:border-[#051C3F] font-black text-[#051C3F]"
                        >
                          {OMAN_WUSTA_SCHOOLS.find(w => w.id === schoolWilaya)?.schools.map((s, index) => (
                            <option key={`user-sch-${s.nameAr}-${index}`} value={s.nameAr}>{language === 'ar' ? s.nameAr : s.nameEn}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          required
                          value={formSchool}
                          onChange={(e) => setFormSchool(e.target.value)}
                          placeholder={language === 'ar' ? 'أدخل اسم المدرسة المعتمد المسمى الفني...' : 'Type school name...'}
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#051C3F] bg-white font-bold"
                        />
                      )}
                    </div>
                  </div>

                  {/* Custom Wilaya Input if Custom is selected */}
                  {schoolWilaya === 'custom' && (
                    <div className="space-y-1.5 text-right mt-3 pt-3 border-t border-slate-100 animate-in fade-in duration-100">
                      <label className="text-[10px] font-extrabold text-slate-405 block">
                        {language === 'ar' ? 'اكتب اسم الولاية يدوياً' : 'Type Wilaya Name'}
                      </label>
                      <input
                        type="text"
                        required
                        value={formWilaya}
                        onChange={(e) => setFormWilaya(e.target.value)}
                        placeholder={language === 'ar' ? 'مثال: محوت، الدقم' : 'e.g. Mahout, Duqm'}
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#051C3F] bg-white font-bold"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Modal Footer block */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-150 hover:bg-slate-200 text-slate-650 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  {language === 'ar' ? 'إلغاء الأمر' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#051C3F] hover:bg-indigo-750 text-white font-bold text-xs rounded-xl cursor-pointer shadow-md transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>{editingUser ? (language === 'ar' ? 'حفظ التغيرات' : 'Save Adjustments') : (language === 'ar' ? 'إضافة وتسجيل الكادر' : 'Register Staff')}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
