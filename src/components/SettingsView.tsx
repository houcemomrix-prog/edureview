import React from 'react';
import { UserProfile } from '../types';
import { Language, translateSubject } from '../lib/translations';

interface SettingsViewProps {
  userProfile: UserProfile;
  language: Language;
  onUpdateSubject: (subject: string) => void;
  sandboxActive: boolean;
  onToggleSandbox: (active: boolean) => void;
  subjects: string[];
}

export function SettingsView({ userProfile, language, onUpdateSubject, sandboxActive, onToggleSandbox, subjects }: SettingsViewProps) {
  return (
    <div className="bg-white rounded-3xl p-6.5 border border-slate-205/50 shadow-md animate-in fade-in duration-200 text-left font-sans space-y-6">
      <div className="space-y-1.5 border-b border-slate-100 pb-4">
        <h3 className="text-lg font-extrabold font-heading text-[#0B1E40]">
          {language === 'ar' ? '⚙️ إعدادات الحساب وملف السجل المدني' : '⚙️ Custom Portal Credentials & Sandbox Controls'}
        </h3>
        <p className="text-xs text-slate-400">
          {language === 'ar' ? 'إدارة الهوية التعليمية وإثباتات السجل المدني المرتبطة بوزارة التعليم' : 'Administer civil registry integration, active sandboxes, and login profile credentials.'}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-5 items-start">
        <div className="w-16 h-16 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xl font-black shadow-md shrink-0">
          {userProfile.name[0].toUpperCase()}
        </div>
        <div className="space-y-4 flex-1 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-extrabold text-[#748296] uppercase tracking-wider block mb-1">{language === 'ar' ? 'الاسم الكامل المسير' : 'Full Registered Name'}</span>
              <p className="text-xs font-bold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">{userProfile.name}</p>
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-[#748296] uppercase tracking-wider block mb-1">{language === 'ar' ? 'جهة الانتساب الأكاديمي' : 'Institution representation'}</span>
              <p className="text-xs font-bold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">
                {userProfile.role === 'school' ? (userProfile.schoolName || (language === 'ar' ? 'مدرسة الدقم للتعليم الأساسي' : 'Duqm Basic Education School')) : (language === 'ar' ? 'وزارة التعليم' : 'Ministry of Education')}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-[#748296] uppercase tracking-wider block mb-1">{language === 'ar' ? 'الصفة الوظيفية بالبوابة' : 'Portal Cleared Role'}</span>
              <p className="text-xs font-bold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100 uppercase tracking-widest text-[#051C3F]">
                {userProfile.role === 'school' ? (language === 'ar' ? 'منسق وممثل امتحانات المدرسة' : 'School Administrator') : (language === 'ar' ? 'مشرف ومقيم جودة المادة' : 'Ministry Supervisor')}
              </p>
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-[#748296] uppercase tracking-wider block mb-1">{language === 'ar' ? 'تعديل وتحديد تخصص جودة المادة' : 'Specialty Subject Alignment'}</span>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-105 select-none font-bold">
                {userProfile.role === 'admin' ? (
                  <select
                    value={userProfile.subject || ''}
                    onChange={(e) => onUpdateSubject(e.target.value)}
                    className="w-full text-xs font-bold text-indigo-700 bg-transparent border-none outline-none cursor-pointer focus:ring-0"
                  >
                    {subjects.map((s, index) => <option key={`setting-subj-${s}-${index}`} value={s}>{translateSubject(s, language)}</option>)}
                  </select>
                ) : userProfile.role === 'moderator' ? (
                  <div className="flex items-center gap-1.5 justify-between w-full">
                    <p className="text-xs font-bold text-emerald-800">{translateSubject(userProfile.subject || '', language)}</p>
                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-150 text-emerald-800 uppercase tracking-widest font-mono">
                      {language === 'ar' ? 'مغلق ومحمي' : 'LOCKED'}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs font-bold text-slate-400 capitalize">{language === 'ar' ? 'عام / ممثل جميع المواد' : 'Universal / All Subjects'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Sandbox select switcher */}
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs space-y-3.5">
            <div className="space-y-1">
              <h4 className="font-extrabold text-[#0B1E40]">{language === 'ar' ? 'تعديل بيئة التشغيل للبوابة الوطنية' : 'Select Portal Runtime Environment'}</h4>
              <p className="text-[#64748B] text-[11px] leading-normal">{language === 'ar' ? 'تتيح لك بيئة الإعداد (Sandbox) تجربة الرفع وإدراج مسودات امتحانات للتدريس والتشغيل الافتراضي، بينما تتصل البيئة الحقيقية بالنظام الرسمي المعتمد.' : 'The Sandbox environment utilizes virtual test mock databases for verification drills. Production targets live MOE institutional records.'}</p>
            </div>

            <div className="flex bg-slate-200/50 p-1.25 rounded-xl gap-2 max-w-xs select-none">
              <button
                type="button"
                onClick={() => onToggleSandbox(true)}
                className={`flex-1 py-1 px-3.5 text-[11.5px] font-black rounded-lg cursor-pointer ${sandboxActive ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm' : 'text-slate-550 hover:text-slate-700'}`}
              >
                {language === 'ar' ? 'بيئة تجريبية' : 'Sandbox (Mock)'}
              </button>
              <button
                type="button"
                onClick={() => onToggleSandbox(false)}
                className={`flex-1 py-1 px-3.5 text-[11.5px] font-black rounded-lg cursor-pointer ${!sandboxActive ? 'bg-[#051C3F] text-white shadow-sm' : 'text-slate-555 hover:text-slate-700'}`}
              >
                {language === 'ar' ? 'بيئة رسمية' : 'Live (Official)'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
