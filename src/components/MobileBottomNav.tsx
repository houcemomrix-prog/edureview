import React from 'react';
import { 
  FileUp, 
  LayoutDashboard, 
  Archive, 
  LogOut, 
  Users, 
  FolderOpen, 
  FileSpreadsheet, 
  BarChart3, 
  School, 
  ClipboardCheck
} from 'lucide-react';
import { UserProfile } from '../types';

interface MobileBottomNavProps {
  userProfile: UserProfile;
  language: 'ar' | 'en';
  activeTab: 'overview' | 'archive' | 'results' | 'databases';
  adminTab?: 'stats' | 'database' | 'schools' | 'signatures' | 'design';
  principalTab?: 'staff' | 'catalog';
  showUploadForm: boolean;
  onSelectTab: (tab: 'overview' | 'archive' | 'results' | 'databases') => void;
  onSelectAdminTab?: (tab: 'stats' | 'database' | 'schools' | 'signatures' | 'design') => void;
  onSelectPrincipalTab?: (tab: 'staff' | 'catalog') => void;
  onToggleUploadForm: (show: boolean) => void;
  onLogout: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  userProfile,
  language,
  activeTab,
  adminTab,
  principalTab,
  showUploadForm,
  onSelectTab,
  onSelectAdminTab,
  onSelectPrincipalTab,
  onToggleUploadForm,
  onLogout,
}) => {
  const isTeacher = userProfile.roleType === 'teacher';
  const isPrincipal = userProfile.role === 'school' && userProfile.roleType === 'administrative';
  const isModerator = userProfile.role === 'moderator';
  const isAdmin = userProfile.role === 'admin';

  return (
    <nav 
      id="mobile-bottom-nav" 
      aria-label="Mobile Navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] py-1.5 px-2 flex items-center justify-around md:hidden select-none font-sans"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
    >
      {/* 1. TEACHER NAVIGATION */}
      {isTeacher && (
        <>
          <button
            type="button"
            onClick={() => {
              onSelectTab('overview');
              onToggleUploadForm(true);
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
              showUploadForm
                ? 'text-[#0b5e32] font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${showUploadForm ? 'bg-emerald-50 text-[#0b5e32]' : ''}`}>
              <FileUp className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 leading-none">
              {language === 'ar' ? 'رفع نموذج' : 'Upload'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectTab('overview');
              onToggleUploadForm(false);
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'overview' && !showUploadForm
                ? 'text-[#0b5e32] font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'overview' && !showUploadForm ? 'bg-emerald-50 text-[#0b5e32]' : ''}`}>
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 leading-none">
              {language === 'ar' ? 'المتابعة' : 'Dashboard'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectTab('archive');
              onToggleUploadForm(false);
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'archive'
                ? 'text-[#0b5e32] font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'archive' ? 'bg-emerald-50 text-[#0b5e32]' : ''}`}>
              <Archive className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 leading-none">
              {language === 'ar' ? 'الأرشيف' : 'Archive'}
            </span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl text-rose-600 hover:text-rose-800 transition-all cursor-pointer"
          >
            <div className="p-1.5 rounded-xl hover:bg-rose-50 transition-all">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 leading-none font-bold">
              {language === 'ar' ? 'خروج' : 'Logout'}
            </span>
          </button>
        </>
      )}

      {/* 2. PRINCIPAL NAVIGATION */}
      {isPrincipal && (
        <>
          <button
            type="button"
            onClick={() => {
              onSelectTab('overview');
              onSelectPrincipalTab?.('staff');
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'overview' && principalTab === 'staff'
                ? 'text-[#0b5e32] font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'overview' && principalTab === 'staff' ? 'bg-emerald-50 text-[#0b5e32]' : ''}`}>
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 leading-none">
              {language === 'ar' ? 'المعلمين' : 'Teachers'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectTab('overview');
              onSelectPrincipalTab?.('catalog');
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'overview' && principalTab === 'catalog'
                ? 'text-[#0b5e32] font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'overview' && principalTab === 'catalog' ? 'bg-emerald-50 text-[#0b5e32]' : ''}`}>
              <FolderOpen className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 leading-none">
              {language === 'ar' ? 'الملفات' : 'Files'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('results')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'results'
                ? 'text-[#0b5e32] font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'results' ? 'bg-emerald-50 text-[#0b5e32]' : ''}`}>
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 leading-none">
              {language === 'ar' ? 'التقارير' : 'Reports'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('archive')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'archive'
                ? 'text-[#0b5e32] font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'archive' ? 'bg-emerald-50 text-[#0b5e32]' : ''}`}>
              <Archive className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 leading-none">
              {language === 'ar' ? 'الأرشيف' : 'Archive'}
            </span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl text-rose-600 hover:text-rose-800 transition-all cursor-pointer"
          >
            <div className="p-1.5 rounded-xl hover:bg-rose-50 transition-all">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 leading-none font-bold">
              {language === 'ar' ? 'خروج' : 'Logout'}
            </span>
          </button>
        </>
      )}

      {/* 3. MODERATOR NAVIGATION */}
      {isModerator && (
        <>
          <button
            type="button"
            onClick={() => {
              onSelectTab('overview');
              onToggleUploadForm(false);
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'text-[#0b5e32] font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-emerald-50 text-[#0b5e32]' : ''}`}>
              <ClipboardCheck className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 leading-none">
              {language === 'ar' ? 'المراجعة' : 'Audit'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('results')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'results'
                ? 'text-[#0b5e32] font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'results' ? 'bg-emerald-50 text-[#0b5e32]' : ''}`}>
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 leading-none">
              {language === 'ar' ? 'التقارير' : 'Reports'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('archive')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'archive'
                ? 'text-[#0b5e32] font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'archive' ? 'bg-emerald-50 text-[#0b5e32]' : ''}`}>
              <Archive className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 leading-none">
              {language === 'ar' ? 'الأرشيف' : 'Archive'}
            </span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl text-rose-600 hover:text-rose-800 transition-all cursor-pointer"
          >
            <div className="p-1.5 rounded-xl hover:bg-rose-50 transition-all">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 leading-none font-bold">
              {language === 'ar' ? 'خروج' : 'Logout'}
            </span>
          </button>
        </>
      )}

      {/* 4. ADMIN NAVIGATION */}
      {isAdmin && (
        <>
          <button
            type="button"
            onClick={() => {
              onSelectTab('overview');
              onSelectAdminTab?.('stats');
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'overview' && adminTab === 'stats'
                ? 'text-[#0b5e32] font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'overview' && adminTab === 'stats' ? 'bg-emerald-50 text-[#0b5e32]' : ''}`}>
              <BarChart3 className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 leading-none">
              {language === 'ar' ? 'التحليلات' : 'Analytics'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectTab('overview');
              onSelectAdminTab?.('database');
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'overview' && adminTab === 'database'
                ? 'text-[#0b5e32] font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'overview' && adminTab === 'database' ? 'bg-emerald-50 text-[#0b5e32]' : ''}`}>
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 leading-none">
              {language === 'ar' ? 'المستخدمين' : 'Users'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              onSelectTab('overview');
              onSelectAdminTab?.('schools');
            }}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'overview' && adminTab === 'schools'
                ? 'text-[#0b5e32] font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'overview' && adminTab === 'schools' ? 'bg-emerald-50 text-[#0b5e32]' : ''}`}>
              <School className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 leading-none">
              {language === 'ar' ? 'المدارس' : 'Schools'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('archive')}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
              activeTab === 'archive'
                ? 'text-[#0b5e32] font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${activeTab === 'archive' ? 'bg-emerald-50 text-[#0b5e32]' : ''}`}>
              <Archive className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 leading-none">
              {language === 'ar' ? 'الأرشيف' : 'Archive'}
            </span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl text-rose-600 hover:text-rose-800 transition-all cursor-pointer"
          >
            <div className="p-1.5 rounded-xl hover:bg-rose-50 transition-all">
              <LogOut className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5 leading-none font-bold">
              {language === 'ar' ? 'خروج' : 'Logout'}
            </span>
          </button>
        </>
      )}
    </nav>
  );
};
