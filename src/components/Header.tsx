import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  Database, 
  LogOut, 
  Users, 
  School,
  FileCheck,
  CheckCircle2,
  Lock,
  LogIn,
  Globe,
  LayoutDashboard,
  Upload,
  CheckSquare,
  BarChart3,
  Percent,
  Bell,
  FileText,
  X,
  Sun,
  Moon,
  Palette,
  Check
} from 'lucide-react';
import { UserProfile, SchoolReport, TeacherNotification } from '../types';
import { getTranslatedText, Language, translateSubject } from '../lib/translations';
import { getSchoolReports, getTeacherNotifications, markTeacherNotificationRead } from '../services/db';
import logoEmblem from './logo-emblem.svg';
import logoMoe from '../../photo.jpg';

const SUBJECTS = [
  'Arabic Language', 'English Language', 'Mathematics', 
  'Science', 'Physics', 'Chemistry', 'Biology', 
  'Islamic Studies', 'Social Studies', 'Information Technology',
  'Applied Sciences', 'Individual Skills'
];

const getUserSubtitle = (profile: UserProfile, lang: Language): string => {
  const role = profile.role;
  const roleType = profile.roleType;
  // Force jobTitle to "مدقق" if role is moderator, regardless of what's saved in the profile
  // This handles cases where older profiles might have incorrect jobTitles saved
  let jobTitle = profile.jobTitle;
  if (role === 'moderator') {
    jobTitle = 'مدقق';
  } else if (!jobTitle) {
    jobTitle = role === 'admin' ? 'مدير النظام' : (roleType === 'administrative' ? 'مدير مدرسة' : 'معلم');
  }

  if (jobTitle === 'مدير النظام') {
    return lang === 'ar' ? 'مدير النظام' : 'System Administrator';
  }
  
  if (jobTitle === 'مدير مدرسة') {
    const schoolName = profile.schoolName || '';
    if (lang === 'ar') {
      return `مدير مدرسة ${schoolName ? `(${schoolName})` : ''}`;
    } else {
      return `School Principal ${schoolName ? `(${schoolName})` : ''}`;
    }
  }

  if (jobTitle === 'مدقق') {
    return lang === 'ar' ? 'مدقق' : 'Auditor';
  }

  // Fallback is 'معلم'
  const subjectLabel = translateSubject(profile.subject || 'All Subjects', lang);
  if (lang === 'ar') {
    return `معلم مادة ${subjectLabel}`;
  } else {
    return `Teacher of ${subjectLabel}`;
  }
};

interface HeaderProps {
  userProfile: UserProfile | null;
  sandboxActive: boolean;
  onToggleSandbox: (active: boolean) => void;
  onLogout: () => void;
  onLoginRequest: () => void;
  onAdminLogin: () => void;
  onSwitchSandboxUser: (role: 'school' | 'moderator' | 'admin' | 'teacher') => void;
  authLoading: boolean;
  guestView?: 'welcome' | 'login-portal' | 'admin-portal' | 'forgot-password';
  onSelectGuestView?: (view: 'welcome' | 'login-portal' | 'admin-portal' | 'forgot-password') => void;
  language: Language;
  onToggleLanguage: (lang: Language) => void;
  onUpdateSubject?: (subject: string) => void;
  theme: 'light' | 'dark' | 'dark-blue';
  onToggleTheme: () => void;
  
  // Optional navigation handlers passed from parent App to coordinate drawer clicks
  activeTab?: 'overview' | 'exams' | 'results' | 'standards' | 'settings' | 'archive' | 'databases';
  setActiveTab?: (tab: 'overview' | 'exams' | 'results' | 'standards' | 'settings' | 'archive' | 'databases') => void;
  showUploadForm?: boolean;
  setShowUploadForm?: (show: boolean) => void;
  adminTab?: 'catalog' | 'stats' | 'database' | 'schools' | 'stamps' | 'signatures' | 'design';
  setAdminTab?: (tab: 'catalog' | 'stats' | 'database' | 'schools' | 'stamps' | 'signatures' | 'design') => void;
  onLogoClick?: () => void;
}

export function Header({
  userProfile,
  sandboxActive,
  onToggleSandbox,
  onLogout,
  onLoginRequest,
  onAdminLogin,
  
  onSwitchSandboxUser,
  authLoading,
  guestView = 'welcome',
  onSelectGuestView,

  language,
  onToggleLanguage,
  onUpdateSubject,
  theme,
  onToggleTheme,
  activeTab,
  setActiveTab,
  showUploadForm,
  setShowUploadForm,
  adminTab,
  setAdminTab,
  onLogoClick
}: HeaderProps) {
  const [showSandboxDropdown, setShowSandboxDropdown] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [myReports, setMyReports] = useState<SchoolReport[]>([]);
  const [myTeacherNotifications, setMyTeacherNotifications] = useState<TeacherNotification[]>([]);
  const [readReportIds, setReadReportIds] = useState<string[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAdminLoginForm, setShowAdminLoginForm] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const notificationsRef = useRef<HTMLDivElement>(null);

  // Poll for reports to notify of new ones if they represent a school
  useEffect(() => {
    if (userProfile?.role === 'school') {
      const savedRead = localStorage.getItem('read_report_notification_ids');
      if (savedRead) {
        try {
          setReadReportIds(JSON.parse(savedRead));
        } catch (e) {
          console.error(e);
        }
      }

      const fetchReports = async () => {
        try {
          if (userProfile.roleType !== 'teacher') {
            const fetched = await getSchoolReports(userProfile);
            setMyReports(fetched);
          }
          if (userProfile.roleType === 'teacher') {
             const fetchedTeacherNotifs = await getTeacherNotifications(userProfile.uid);
             setMyTeacherNotifications(fetchedTeacherNotifs);
          }
        } catch (err) {
          console.error('Error loading reports in Header component:', err);
        }
      };

      fetchReports();
      const interval = setInterval(fetchReports, 10000); // Poll every 10 seconds for speedy notification sync!
      return () => clearInterval(interval);
    } else {
      setMyReports([]);
      setMyTeacherNotifications([]);
    }
  }, [userProfile]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadReports = myReports.filter(r => r.id && !readReportIds.includes(r.id));
  const unreadTeacherNotifications = myTeacherNotifications.filter(n => !n.read);
  const unreadCount = userProfile?.roleType === 'teacher' ? unreadTeacherNotifications.length : unreadReports.length;

  const handleTeacherNotificationClick = async (id: string) => {
    await markTeacherNotificationRead(id);
    setMyTeacherNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markReportAsRead = (id: string) => {
    if (!readReportIds.includes(id)) {
      const updated = [...readReportIds, id];
      setReadReportIds(updated);
      localStorage.setItem('read_report_notification_ids', JSON.stringify(updated));
    }
    setShowNotifications(false);
    setActiveTab?.('results');
  };

  const markAllAsRead = () => {
    const list = myReports.map(r => r.id || '').filter(Boolean);
    setReadReportIds(list);
    localStorage.setItem('read_report_notification_ids', JSON.stringify(list));
    
    // Also mark all teacher notifications
    myTeacherNotifications.forEach(n => {
      if (!n.read && n.id) {
        markTeacherNotificationRead(n.id);
      }
    });
    setMyTeacherNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const t = (key: any) => getTranslatedText(key, language);

  const hamburgerButton = (
    <button
      id="hamburger-menu-trigger"
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={`p-2 rounded-xl transition-all duration-300 focus:outline-none flex flex-col justify-center items-center gap-1.25 w-9 h-9 sm:w-10 sm:h-10 relative z-50 cursor-pointer border shrink-0 ${
        isOpen 
          ? 'bg-emerald-900/90 border-emerald-600/50 text-amber-300 shadow-inner' 
          : 'bg-white/10 hover:bg-white/15 border-white/15 text-white active:scale-95'
      }`}
      aria-label="Toggle Interactive Menu"
      title={language === 'ar' ? 'القائمة الرئيسية' : 'Main Menu'}
    >
      <span className={`h-0.5 bg-current rounded-full transition-all duration-300 transform origin-center ${
        isOpen ? 'w-5 translate-y-[6px] rotate-45' : 'w-5'
      }`}></span>
      <span className={`h-0.5 bg-current rounded-full transition-all duration-200 ${
        isOpen ? 'w-0 opacity-0 -translate-x-2' : 'w-3.5 opacity-90'
      }`}></span>
      <span className={`h-0.5 bg-current rounded-full transition-all duration-300 transform origin-center ${
        isOpen ? 'w-5 -translate-y-[6px] -rotate-45' : 'w-5'
      }`}></span>
    </button>
  );

  return (
    <header id="app-main-header" className="bg-[#0b5e32] text-white sticky top-0 z-50 border-b border-emerald-900/30 shadow-md font-sans">
      
      {/* Subtle clean accent line */}
      <div className="h-0.5 w-full bg-[#d4af37]/60"></div>

      <div className="max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 w-full flex items-center justify-between gap-3 sm:gap-5 relative z-10">
        
        {/* Hamburger menu button */}
        {hamburgerButton}
        
        {/* Branding Group */}
        <div 
          onClick={() => {
            setShowAdminLoginForm(false);
            setShowNotifications(false);
            if (onLogoClick) {
              onLogoClick();
            } else {
              onSelectGuestView?.('welcome');
            }
            setIsOpen(false);
          }}
          className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer select-none shrink-0 group text-right rtl:text-right ltr:text-left"
          title={language === 'en' ? 'Return to Home View' : 'العودة للرئيسية'}
        >
          {/* Clean inline ministry emblem */}
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-white p-1 shadow-xs border border-white/20 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
            <img 
              src={logoMoe} 
              alt={t('ministryOfEducation')}
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Titles & Oman badge */}
          <div className="flex flex-col justify-center text-right rtl:text-right ltr:text-left">
            <div className="flex items-center gap-1.5 mb-0.5 justify-start rtl:justify-start ltr:justify-start">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span className="text-[9px] sm:text-[10px] font-bold tracking-wider text-amber-300 uppercase leading-none font-sans">
                {t('sultanateOfOman')}
              </span>
            </div>
            
            <h1 className="text-xs sm:text-base font-bold font-heading text-white tracking-tight leading-tight group-hover:text-amber-200 transition-colors truncate max-w-[140px] xs:max-w-[220px] sm:max-w-none">
              {t('ministryOfEducation')}
            </h1>
            <p className="text-[8.5px] sm:text-[10.5px] text-emerald-100/80 font-sans font-medium tracking-normal leading-none mt-0.5 hidden xs:block truncate max-w-[150px] xs:max-w-[240px] sm:max-w-none">
              {language === 'ar' 
                ? 'البوابة الموحدة لجودة الامتحانات • الفحص والتدقيق' 
                : 'Unified Exam Quality Portal • Verification & Moderation'}
            </p>
          </div>
        </div>

        {/* MIDDLE SECTION: Horizontal Menu Links (Hidden on small displays) */}
        <nav className="hidden xl:flex items-center gap-2 text-xs font-semibold select-none">
          <span 
            onClick={() => setActiveTab?.('archive')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'archive' 
                ? 'bg-white/15 text-white font-bold shadow-xs' 
                : 'text-emerald-100/90 hover:text-white hover:bg-white/5'
            }`}
          >
            {language === 'ar' ? 'الأرشيف' : 'Archive'}
          </span>
          <span 
            onClick={() => setActiveTab?.('results')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'results' 
                ? 'bg-white/15 text-white font-bold shadow-xs' 
                : 'text-emerald-100/90 hover:text-white hover:bg-white/5'
            }`}
          >
            {language === 'ar' 
              ? (userProfile?.role === 'school' ? 'تقارير المدرسة' : 'تقارير المدارس')
              : (userProfile?.role === 'school' ? 'School Reports' : 'Reports')
            }
          </span>
          {userProfile?.role === 'admin' && (
            <span 
              onClick={() => setActiveTab?.('databases')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                activeTab === 'databases' 
                  ? 'bg-white/15 text-white font-bold shadow-xs' 
                  : 'text-emerald-100/90 hover:text-white hover:bg-white/5'
              }`}
            >
              {language === 'ar' ? 'قواعد البيانات' : 'Databases'}
            </span>
          )}
          <span 
            onClick={() => {
              setActiveTab?.('overview');
              setShowUploadForm?.(false);
            }}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              activeTab === 'overview' && !showUploadForm
                ? 'bg-white/15 text-white font-bold shadow-xs' 
                : 'text-emerald-100/90 hover:text-white hover:bg-white/5'
            }`}
          >
            {language === 'ar' ? 'لوحة المتابعة' : 'Dashboard'}
          </span>
        </nav>

        {/* LEFT SIDE (in RTL) / RIGHT SIDE (in LTR): User Settings, Profile & Hamburger menu */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          
          {/* Language Switcher Pill */}
          <button
            type="button"
            onClick={() => onToggleLanguage(language === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl px-2.5 sm:px-3 py-1.5 text-[10px] font-bold tracking-wider cursor-pointer transition-all shadow-xs shrink-0 font-sans"
            title={language === 'en' ? 'Switch to Arabic' : 'تحويل للإنجليزية'}
          >
            <Globe className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="text-white uppercase">
              {language === 'en' ? 'العربية' : 'EN'}
            </span>
          </button>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 border border-white/15 rounded-xl px-2.5 sm:px-3 py-1.5 text-[10px] font-bold tracking-wider cursor-pointer transition-all shadow-xs shrink-0 font-sans text-white focus:outline-none"
            title={
              theme === 'light'
                ? (language === 'en' ? 'Switch to Dark Mode' : 'التحويل للوضع الداكن')
                : theme === 'dark'
                ? (language === 'en' ? 'Switch to Dark Blue' : 'التحويل للوضع الكحلي')
                : (language === 'en' ? 'Switch to Light Mode' : 'التحويل للوضع المضيء')
            }
          >
            {theme === 'light' && (
              <>
                <svg className="w-3.5 h-3.5 text-amber-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
                <span className="text-white/95 uppercase tracking-wider font-sans text-[10.5px]">
                  {language === 'en' ? 'LIGHT' : 'مضيء'}
                </span>
              </>
            )}
            {theme === 'dark' && (
              <>
                <svg className="w-3.5 h-3.5 text-zinc-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <span className="text-white/95 uppercase tracking-wider font-sans text-[10.5px]">
                  {language === 'en' ? 'DARK' : 'داكن'}
                </span>
              </>
            )}
            {theme === 'dark-blue' && (
              <>
                <svg className="w-3.5 h-3.5 text-sky-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                <span className="text-sky-200 uppercase tracking-wider font-sans text-[9.5px]">
                  {language === 'en' ? 'DARK BLUE' : 'أزرق داكن'}
                </span>
              </>
            )}
          </button>

          {/* System Settings Gear Icon (for sandbox dropdown) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSandboxDropdown(!showSandboxDropdown)}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
              title={t('portalEnvMode')}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            
            {showSandboxDropdown && (
              <div className="absolute left-0 mt-2 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 text-xs">
                <p className="font-bold text-slate-400 p-2 border-b border-slate-800 text-right">{t('portalEnvMode')}</p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSandbox(true);
                    setShowSandboxDropdown(false);
                  }}
                  className={`w-full text-right p-2.5 rounded-lg flex items-center gap-2 mt-1 cursor-pointer ${sandboxActive ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
                >
                  <Database className="w-3.5 h-3.5 shrink-0" />
                  <span>{t('sandboxPrepEnv')}</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSandbox(false);
                    setShowSandboxDropdown(false);
                  }}
                  className={`w-full text-right p-2.5 rounded-lg flex items-center gap-2 mt-0.5 cursor-pointer ${!sandboxActive ? 'bg-indigo-650 text-white font-bold' : 'hover:bg-slate-800 text-slate-300'}`}
                >
                  <FileCheck className="w-3.5 h-3.5 shrink-0" />
                  <span>{t('liveOfficialGateway')}</span>
                </button>
              </div>
            )}
          </div>

          {/* Notification Bell Icon */}
          <div className="relative font-sans" ref={notificationsRef}>
            <button
              id="header-notification-bell-btn"
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-white/85 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer relative flex items-center justify-center"
              title={language === 'ar' ? 'إشعارات البوابة' : "Portal Notifications"}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <>
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center bg-rose-600 text-white rounded-full text-[9px] font-black border border-[#0B1E40]">
                    {unreadCount}
                  </span>
                </>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {showNotifications && (
              <div 
                id="header-notif-dropdown"
                className={`absolute top-12 ${language === 'ar' ? 'left-0' : 'right-0'} w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 text-slate-800 z-50 animate-in fade-in slide-in-from-top-3 duration-150`}
              >
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-emerald-800" />
                    <span>{language === 'ar' ? 'إشعارات البوابة' : 'Portal Notifications'}</span>
                  </h4>
                  {unreadCount > 0 && (
                    <button
                      id="notif-mark-all-read-btn"
                      type="button"
                      onClick={markAllAsRead}
                      className="text-[10px] font-extrabold text-[#0a4d28] hover:text-[#06331a] px-2 py-1 bg-emerald-50 rounded-lg cursor-pointer"
                    >
                      {language === 'ar' ? 'تحديد الكل كمقروء' : 'Mark all as read'}
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto mt-2">
                  {myReports.length === 0 && myTeacherNotifications.length === 0 ? (
                    <div className="py-8 px-4 text-center text-slate-400">
                      <p className="text-xs font-bold leading-relaxed">
                        {language === 'ar' ? 'لا توجد إشعارات لتقارير الجودة حالياً' : 'No quality report notifications currently.'}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                        {language === 'ar' ? 'تظهر هنا إشعارات فورية عند توجيه تقارير أو تنبيهات.' : 'Notifications will appear here when new reports or alerts are sent.'}
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {myReports.slice(0, 5).map((rep, index) => {
                        const isUnread = !readReportIds.includes(rep.id || '');
                        return (
                          <div
                            id={`notif-item-${rep.id || index}`}
                            key={`notif-${rep.id || index}-${index}`}
                            onClick={() => rep.id && markReportAsRead(rep.id)}
                            className={`p-3 px-4 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${isUnread ? 'bg-amber-50/20' : ''}`}
                          >
                            <div className={`p-2 rounded-xl shrink-0 h-10 w-10 flex items-center justify-center ${isUnread ? 'bg-amber-100/60 text-amber-805' : 'bg-slate-100 text-slate-500'}`}>
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-1 text-right rtl:text-right ltr:text-left">
                              <div className="flex items-center justify-between mb-0.5">
                                <span className={`text-[8px] font-semibold uppercase px-2 py-0.5 rounded-md ${isUnread ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
                                  {isUnread 
                                    ? (language === 'ar' ? 'جديد 🔔' : 'New 🔔') 
                                    : (language === 'ar' ? 'مقروء' : 'Read')
                                  }
                                </span>
                                <span className="text-[9px] text-slate-400 font-bold font-mono">
                                  {rep.semester === 'first' ? (language === 'ar' ? 'الفصل ١' : 'Sem 1') : (language === 'ar' ? 'الفصل ٢' : 'Sem 2')}
                                </span>
                              </div>
                              <p className="text-[11px] font-black text-slate-800 leading-snug">
                                {language === 'ar' ? 'تم استلام تقرير جولة جودة ومطابقة جديد' : 'New quality & compliance report received'}
                              </p>
                              <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                {language === 'ar' ? rep.titleAr : (rep.titleEn || rep.titleAr)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      {myTeacherNotifications.slice(0, 5).map((notif, index) => {
                        const isUnread = !notif.read;
                        return (
                          <div
                            id={`notif-teacher-${notif.id || index}`}
                            key={`notif-teacher-${notif.id || index}-${index}`}
                            onClick={() => notif.id && handleTeacherNotificationClick(notif.id)}
                            className={`p-3 px-4 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 ${isUnread ? 'bg-sky-50/30' : ''}`}
                          >
                            <div className={`p-2 rounded-xl shrink-0 h-10 w-10 flex items-center justify-center ${isUnread ? 'bg-sky-100/60 text-sky-800' : 'bg-slate-100 text-slate-500'}`}>
                              <Bell className="w-5 h-5" />
                            </div>
                            <div className="min-w-0 flex-1 text-right rtl:text-right ltr:text-left">
                              <div className="flex items-center justify-between mb-0.5">
                                <span className={`text-[8px] font-semibold uppercase px-2 py-0.5 rounded-md ${isUnread ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
                                  {isUnread 
                                    ? (language === 'ar' ? 'جديد 🔔' : 'New 🔔') 
                                    : (language === 'ar' ? 'مقروء' : 'Read')
                                  }
                                </span>
                              </div>
                              <p className="text-[11px] font-black text-slate-800 leading-snug">
                                {language === 'ar' ? notif.titleAr : notif.titleEn}
                              </p>
                              <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                                {language === 'ar' ? notif.messageAr : notif.messageEn}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {myReports.length > 0 && (
                  <div className="p-2 px-4 border-t border-slate-100 text-center mt-1">
                    <button
                      id="notif-view-all-btn"
                      type="button"
                      onClick={() => {
                        setShowNotifications(false);
                        setActiveTab?.('results');
                      }}
                      className="text-[10px] font-black text-[#0B1E40] hover:text-emerald-850 flex items-center gap-1 mx-auto cursor-pointer"
                    >
                      <span>{language === 'ar' ? 'عرض كافة تقارير الجودة والمطابقة' : 'View all quality and compliance reports'}</span>
                      <span>→</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Authenticated User Profile Pill */}
          {userProfile ? (
            <div className="flex items-center gap-1.5 sm:gap-2.5 bg-white/10 border border-white/15 rounded-xl p-1 sm:p-1.5 px-2 sm:px-3 transition-all shrink-0 font-sans select-none shadow-xs">
              
              {/* Logout Action Button on the outer edge */}
              <button
                type="button"
                onClick={onLogout}
                className="p-1 px-1 sm:px-1.5 hover:bg-white/15 text-emerald-100 hover:text-rose-300 rounded-lg transition-all cursor-pointer flex items-center justify-center"
                title={language === 'ar' ? 'تسجيل الخروج' : 'Log Out'}
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>

              {/* Profile details */}
              <div className="text-right rtl:text-right ltr:text-left text-xs leading-none">
                <p className="font-bold text-white font-heading leading-tight truncate max-w-[65px] xs:max-w-[110px] sm:max-w-[220px]" title={userProfile.name}>
                  {userProfile.name}
                </p>
                <div className="hidden sm:flex items-center gap-1 mt-1 justify-start rtl:justify-start ltr:justify-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span className="text-[10px] text-emerald-100/80 font-medium block truncate max-w-[160px]" title={getUserSubtitle(userProfile, language)}>
                    {getUserSubtitle(userProfile, language)}
                  </span>
                </div>
              </div>

              {/* Clean initials avatar */}
              <div 
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center font-bold text-xs shadow-xs shrink-0 bg-amber-400 text-slate-950"
              >
                {userProfile.name[0].toUpperCase()}
              </div>

            </div>
          ) : (
            <div className="flex items-center gap-2">
              {showAdminLoginForm ? (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    onAdminLogin();
                    setShowAdminLoginForm(false);
                  }}
                  className="flex items-center gap-1.5 animate-in slide-in-from-right duration-250 font-sans"
                  dir={language === 'ar' ? 'rtl' : 'ltr'}
                >
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder={language === 'ar' ? 'البريد الإلكتروني' : 'Email address'}
                    className="px-3 py-1.5 bg-slate-900/90 border border-emerald-500/35 rounded-xl text-[11px] text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 w-32 sm:w-44 transition-all"
                  />
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder={language === 'ar' ? 'كلمة السر' : 'Password'}
                    className="px-3 py-1.5 bg-slate-900/90 border border-emerald-500/35 rounded-xl text-[11px] text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 w-24 sm:w-36 transition-all"
                  />
                  <div className="flex flex-col gap-1 items-start">
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-[#0a4d28] hover:bg-[#126b3a] text-white rounded-xl text-[10.5px] font-black transition-all cursor-pointer border border-emerald-500/20 shadow-md whitespace-nowrap w-full"
                    >
                      {language === 'ar' ? 'دخول' : 'Log In'}
                    </button>
                    <button
                      type="button"
                      
                      onClick={() => {
                        if (onSelectGuestView) {
                          onSelectGuestView('forgot-password');
                        }
                        setShowAdminLoginForm(false);
                        
                        // Scroll down to the Guest Portal
                        setTimeout(() => {
                          const el = document.getElementById('login-form-element') || document.getElementById('guest-portal-container');
                          if (el) {
                            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          } else {
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        }, 100);
                      }}

                      className="text-[9.5px] text-emerald-400/80 hover:text-emerald-300 hover:underline px-1 cursor-pointer"
                    >
                      {language === 'ar' ? 'نسيت كلمة السر؟' : 'Forgot Password?'}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAdminLoginForm(false)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-lg transition-colors cursor-pointer self-start"
                    title={language === 'ar' ? 'إلغاء' : 'Cancel'}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminLoginForm(true);
                    setAdminEmail('hossam9866@moe.om');
                    setAdminPassword('Skype123@');
                  }}
                  className="px-3.5 py-2 bg-[#0a4d28] hover:bg-[#126b3a] text-white rounded-xl text-xs font-bold transition-all cursor-pointer border border-white/10 shadow-sm flex items-center gap-1.5"
                >
                  <Lock className="w-3 h-3 text-amber-300" />
                  <span>{language === 'ar' ? 'تسجيل دخول مدير النظام' : 'Admin Log in'}</span>
                </button>
              )}
            </div>
          )}

        </div>

      </div>

      {/* Slide-out Sidebar Drawer for General portal options & navigation */}
      <div 
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          isOpen ? 'visible opacity-100 pointer-events-auto' : 'invisible opacity-0 pointer-events-none'
        }`}
        id="mobile-nav-drawer"
      >
        {/* Semi-transparent Backdrop Overlay */}
        <div 
          onClick={() => setIsOpen(false)}
          className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity"
        ></div>

        {/* Navigation Sidebar Drawer Content */}
        <div className={`absolute top-0 bottom-0 w-full max-w-[88vw] sm:max-w-md bg-white shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-out transform ${
          language === 'ar'
            ? `right-0 border-l border-slate-200 sm:rounded-l-3xl ${isOpen ? 'translate-x-0' : 'translate-x-full'}`
            : `left-0 border-r border-slate-200 sm:rounded-r-3xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`
        }`}>
          {/* Top section of Drawer */}
          <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1 text-slate-800 font-sans">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div 
                onClick={() => {
                  setShowAdminLoginForm(false);
                  setShowNotifications(false);
                  if (onLogoClick) {
                    onLogoClick();
                  } else {
                    onSelectGuestView?.('welcome');
                  }
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
                title={language === 'en' ? 'Return to Home View' : 'العودة للرئيسية'}
              >
                <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center border border-slate-200/80 shadow-xs shrink-0">
                  <img 
                    src={logoMoe} 
                    alt={t('ministryOfEducation')}
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="min-w-0 text-right rtl:text-right ltr:text-left">
                  <div className="flex items-center gap-1.5 mb-0.5 justify-start rtl:justify-start ltr:justify-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 font-mono leading-none">
                      {t('sultanateOfOman')}
                    </span>
                  </div>
                  <p className="text-xs font-black text-slate-900 font-heading truncate">{t('ministryOfEducation')}</p>
                </div>
              </div>
              
              {/* Close Button */}
              <button
                id="drawer-close-btn"
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 transition-all cursor-pointer shrink-0 border border-slate-200/60 active:scale-95"
                title={t('close')}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Controls: Language & Theme Segmented Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              
              {/* Language Switch Segmented Pill */}
              <div className="p-2 bg-slate-50 border border-slate-200/70 rounded-2xl">
                <div className="flex items-center gap-1.5 mb-1.5 px-1">
                  <Globe className="w-3.5 h-3.5 text-[#0b5e32]" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {language === 'en' ? 'Language' : 'اللغة'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1 p-0.5 bg-slate-200/60 rounded-xl">
                  <button
                    type="button"
                    onClick={() => onToggleLanguage('ar')}
                    className={`py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer text-center ${
                      language === 'ar'
                        ? 'bg-[#0b5e32] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    العربية
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleLanguage('en')}
                    className={`py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer text-center ${
                      language === 'en'
                        ? 'bg-[#0b5e32] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Theme Segmented Switcher */}
              <div className="p-2 bg-slate-50 border border-slate-200/70 rounded-2xl">
                <div className="flex items-center gap-1.5 mb-1.5 px-1">
                  <Palette className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    {language === 'en' ? 'Appearance' : 'المظهر'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1 p-0.5 bg-slate-200/60 rounded-xl">
                  <button
                    type="button"
                    onClick={() => theme !== 'light' && onToggleTheme()}
                    className={`py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      theme === 'light'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title={language === 'en' ? 'Light Mode' : 'الوضع المضيء'}
                  >
                    <Sun className="w-3 h-3 text-amber-500" />
                    <span>{language === 'en' ? 'Light' : 'مضيء'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (theme === 'light') onToggleTheme();
                      else if (theme === 'dark-blue') { onToggleTheme(); }
                    }}
                    className={`py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      theme === 'dark'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title={language === 'en' ? 'Dark Mode' : 'الوضع الداكن'}
                  >
                    <Moon className="w-3 h-3 text-zinc-300" />
                    <span>{language === 'en' ? 'Dark' : 'داكن'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (theme === 'dark') onToggleTheme();
                      else if (theme === 'light') { onToggleTheme(); onToggleTheme(); }
                    }}
                    className={`py-1.5 text-[10px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                      theme === 'dark-blue'
                        ? 'bg-[#0f172a] text-sky-200 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title={language === 'en' ? 'Dark Blue' : 'أزرق كحلي'}
                  >
                    <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                    <span>{language === 'en' ? 'Blue' : 'كحلي'}</span>
                  </button>
                </div>
              </div>

            </div>

            {/* PORTAL NAVIGATION LINKS */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans block">
                  {language === 'en' ? 'PORTAL NAVIGATION' : 'تصفح البوابة الوطنية'}
                </label>
                {userProfile && (
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                    {language === 'ar' ? 'معتمد' : 'Authorized'}
                  </span>
                )}
              </div>

              {userProfile ? (
                <div className="space-y-1.5 font-sans">
                  
                  {/* OVERVIEW */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab?.('overview');
                      setShowUploadForm?.(false);
                      setAdminTab?.('stats');
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'overview' && (!showUploadForm || userProfile.role !== 'school') && (userProfile.role !== 'admin' || adminTab === 'stats')
                        ? 'bg-emerald-50 text-[#0b5e32] border border-emerald-300 shadow-xs'
                        : 'text-slate-700 hover:text-[#0b5e32] hover:bg-slate-50 border border-slate-200/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${
                        activeTab === 'overview' && (!showUploadForm || userProfile.role !== 'school') && (userProfile.role !== 'admin' || adminTab === 'stats')
                          ? 'bg-[#0b5e32] text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        <LayoutDashboard className="w-4 h-4" />
                      </div>
                      <span>{language === 'en' ? 'Overview' : 'نظرة عامة'}</span>
                    </div>
                    {activeTab === 'overview' && (!showUploadForm || userProfile.role !== 'school') && (userProfile.role !== 'admin' || adminTab === 'stats') && (
                      <span className="w-2 h-2 rounded-full bg-[#0b5e32]"></span>
                    )}
                  </button>

                  {/* MY UPLOADS (for teacher/school account only) */}
                  {userProfile.role === 'school' && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab?.('overview');
                        setShowUploadForm?.(false);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'overview' && !showUploadForm
                          ? 'bg-emerald-50 text-[#0b5e32] border border-emerald-300 shadow-xs'
                          : 'text-slate-700 hover:text-[#0b5e32] hover:bg-slate-50 border border-slate-200/70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${
                          activeTab === 'overview' && !showUploadForm
                            ? 'bg-[#0b5e32] text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          <Upload className="w-4 h-4" />
                        </div>
                        <span>{language === 'en' ? 'My Uploads' : 'ملفاتي ومرفوعاتي'}</span>
                      </div>
                      {activeTab === 'overview' && !showUploadForm && (
                        <span className="w-2 h-2 rounded-full bg-[#0b5e32]"></span>
                      )}
                    </button>
                  )}

                  {/* CERTIFIED SIGNED ARCHIVE */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab?.('archive');
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'archive'
                        ? 'bg-emerald-50 text-[#0b5e32] border border-emerald-300 shadow-xs'
                        : 'text-slate-700 hover:text-[#0b5e32] hover:bg-slate-50 border border-slate-200/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${
                        activeTab === 'archive'
                          ? 'bg-[#0b5e32] text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        <FileCheck className="w-4 h-4" />
                      </div>
                      <span>{language === 'en' ? 'Archive' : 'الأرشيف المعتمد'}</span>
                    </div>
                    {activeTab === 'archive' && (
                      <span className="w-2 h-2 rounded-full bg-[#0b5e32]"></span>
                    )}
                  </button>

                  {/* QUALITY STANDARDS */}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab?.('standards');
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'standards'
                        ? 'bg-emerald-50 text-[#0b5e32] border border-emerald-300 shadow-xs'
                        : 'text-slate-700 hover:text-[#0b5e32] hover:bg-slate-50 border border-slate-200/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-lg ${
                        activeTab === 'standards'
                          ? 'bg-[#0b5e32] text-white'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        <CheckSquare className="w-4 h-4" />
                      </div>
                      <span>{language === 'en' ? 'Quality Standards' : 'معايير الجودة والتدقيق'}</span>
                    </div>
                    {activeTab === 'standards' && (
                      <span className="w-2 h-2 rounded-full bg-[#0b5e32]"></span>
                    )}
                  </button>

                  {/* CENTRAL DATABASES HUB (for admin only) */}
                  {userProfile.role === 'admin' && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab?.('databases');
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'databases'
                          ? 'bg-emerald-50 text-[#0b5e32] border border-emerald-300 shadow-xs'
                          : 'text-slate-700 hover:text-[#0b5e32] hover:bg-slate-50 border border-slate-200/70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${
                          activeTab === 'databases'
                            ? 'bg-[#0b5e32] text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          <Database className="w-4 h-4" />
                        </div>
                        <span>{language === 'en' ? 'Central Databases Hub' : 'مركز قواعد البيانات الوطنية'}</span>
                      </div>
                      {activeTab === 'databases' && (
                        <span className="w-2 h-2 rounded-full bg-[#0b5e32]"></span>
                      )}
                    </button>
                  )}

                  {/* REPORTS AND ANALYTICS (for admin, moderators, and school users) */}
                  {(userProfile.role === 'admin' || userProfile.role === 'moderator' || userProfile.role === 'school') && (
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab?.('results');
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === 'results'
                          ? 'bg-emerald-50 text-[#0b5e32] border border-emerald-300 shadow-xs'
                          : 'text-slate-700 hover:text-[#0b5e32] hover:bg-slate-50 border border-slate-200/70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${
                          activeTab === 'results'
                            ? 'bg-[#0b5e32] text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          <BarChart3 className="w-4 h-4" />
                        </div>
                        <span>
                          {language === 'en' 
                            ? (userProfile.role === 'school' ? 'School Reports' : 'Reports and Analytics')
                            : (userProfile.role === 'school' ? 'تقارير المدرسة' : 'التقارير والتحليلات الوزارية')
                          }
                        </span>
                      </div>
                      {activeTab === 'results' && (
                        <span className="w-2 h-2 rounded-full bg-[#0b5e32]"></span>
                      )}
                    </button>
                  )}

                  {/* STATISTICS (for admin and moderators) */}
                  {(userProfile.role === 'admin' || userProfile.role === 'moderator') && (
                    <button
                      type="button"
                      onClick={() => {
                        if (userProfile.role === 'admin') {
                           setActiveTab?.('overview');
                           setAdminTab?.('stats');
                        } else {
                           setActiveTab?.('results');
                        }
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        (userProfile.role === 'admin' && activeTab === 'overview' && adminTab === 'stats') || (userProfile.role === 'moderator' && activeTab === 'results')
                          ? 'bg-emerald-50 text-[#0b5e32] border border-emerald-300 shadow-xs'
                          : 'text-slate-700 hover:text-[#0b5e32] hover:bg-slate-50 border border-slate-200/70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${
                          (userProfile.role === 'admin' && activeTab === 'overview' && adminTab === 'stats') || (userProfile.role === 'moderator' && activeTab === 'results')
                            ? 'bg-[#0b5e32] text-white'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          <Percent className="w-4 h-4" />
                        </div>
                        <span>{language === 'en' ? 'Statistics' : 'الإحصائيات والمؤشرات'}</span>
                      </div>
                      {((userProfile.role === 'admin' && activeTab === 'overview' && adminTab === 'stats') || (userProfile.role === 'moderator' && activeTab === 'results')) && (
                        <span className="w-2 h-2 rounded-full bg-[#0b5e32]"></span>
                      )}
                    </button>
                  )}

                </div>
              ) : (
                <div className="bg-slate-50 p-4 border border-slate-200/70 rounded-2xl text-center space-y-1 font-sans">
                  <p className="text-slate-700 text-xs font-bold">
                    {language === 'en' ? 'Ministry Access Required' : 'مطلوب تسجيل الدخول'}
                  </p>
                  <p className="text-slate-500 text-[11px] font-medium leading-relaxed">
                    {language === 'en' 
                      ? 'Please sign in with your ministry account to display portal navigation.' 
                      : 'يرجى تسجيل الدخول بحساب الوزارة المعتمد للوصول لأقسام البوابة الأساسية.'}
                  </p>
                </div>
              )}
            </div>

            {/* Environment Selector: Sandbox vs Live */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans block px-1">
                {t('portalEnvMode')}
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200/70">
                <button
                  type="button"
                  onClick={() => {
                    onToggleSandbox(true);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    sandboxActive 
                      ? 'bg-amber-500 text-slate-950 shadow-xs font-bold' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>{t('sandboxPrepEnv')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onToggleSandbox(false);
                    setIsOpen(false);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    !sandboxActive 
                      ? 'bg-[#0b5e32] text-white shadow-xs font-bold' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t('liveOfficialGateway')}</span>
                </button>
              </div>
            </div>

            {/* Session Preset Role Switcher (If in Sandbox) */}
            {/* Account Switcher removed as sandbox mode is being phased out */}

            {/* Profile / Account details */}
            <div className="space-y-2.5 pt-3 border-t border-slate-100">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-sans block px-1">
                {t('accCredentials')}
              </label>
              
              {userProfile ? (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/70 space-y-3.5 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                      {userProfile.name[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1 text-right rtl:text-right ltr:text-left">
                      <p className="font-bold text-slate-900 font-heading text-sm truncate">{userProfile.name}</p>
                      <p className="text-[10.5px] text-[#0b5e32] font-bold mt-0.5 truncate">
                        {getUserSubtitle(userProfile, language)}
                      </p>
                      {userProfile.role === 'admin' ? (
                        <div className="mt-2">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1 text-right">
                            {language === 'ar' ? 'تعديل التخصص الدراسي' : 'Edit Academic Subject'}
                          </label>
                          <select
                            value={userProfile.subject || ''}
                            onChange={(e) => onUpdateSubject?.(e.target.value)}
                            className="bg-white border border-slate-200 text-[#0b5e32] rounded-xl text-xs font-bold px-2.5 py-1.5 focus:outline-none focus:border-[#0b5e32] w-full cursor-pointer shadow-2xs font-sans"
                          >
                            <option key="hdr-subj-default" value="" disabled>
                              {language === 'ar' ? 'اختر المادة...' : 'Select Subject...'}
                            </option>
                            {SUBJECTS.map((s, index) => (
                              <option key={`hdr-subj-${s}-${index}`} value={s} className="bg-white text-slate-800">
                                {translateSubject(s, language)}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : userProfile.role === 'moderator' ? (
                        <div className="mt-2">
                          <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1 text-right">
                            {language === 'ar' ? 'المادة المخصصة للتدقيق' : 'Assigned Subject'}
                          </label>
                          <div className="bg-emerald-50 border border-emerald-200 text-[#0b5e32] rounded-xl text-xs font-bold px-2.5 py-1.5 text-right flex items-center gap-1.5 select-none font-sans">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0"></span>
                            <span>{translateSubject(userProfile.subject || '', language)}</span>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      onLogout();
                      setIsOpen(false);
                    }}
                    className="w-full py-2.5 bg-white hover:bg-rose-50 hover:text-rose-700 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-500" />
                    <span>{t('signOut')}</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 animate-in fade-in duration-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      if (onSelectGuestView) {
                        onSelectGuestView('login-portal');
                      } else {
                        onLoginRequest();
                      }
                    }}
                    className={`w-full py-3 rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer border ${
                      guestView === 'login-portal'
                        ? 'bg-[#0b5e32] text-white border-transparent'
                        : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <LogIn className="w-4 h-4 text-amber-500" />
                    <span>{t('loginRep')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      if (onSelectGuestView) {
                        onSelectGuestView('admin-portal');
                      } else {
                        onAdminLogin();
                      }
                    }}
                    className={`w-full py-3 rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                      guestView === 'admin-portal'
                        ? 'bg-[#0b5e32] text-white border-transparent'
                        : 'bg-slate-900 text-white border-slate-950 hover:bg-slate-800'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5 text-amber-300" />
                    <span>{t('directorLogin')}</span>
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Drawer Footer bottom badge */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center space-y-1 font-sans">
            <div className="flex items-center justify-center gap-1.5 text-[9.5px] font-bold text-amber-800">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>{t('sultanateOfOman')} • {t('ministryOfEducation')}</span>
            </div>
            <p className="text-[8.5px] text-slate-400 font-medium">
              {t('unifiedQualityPortal')} • {t('secureConnection')}
            </p>
          </div>

        </div>
      </div>

    </header>
  );
}
