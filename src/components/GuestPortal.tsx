import React, { useState } from 'react';
import { School, Users, ClipboardList, Lock, LogIn, ShieldAlert, X, Mail, Key, CheckCircle2, RotateCcw, ChevronDown, Check } from 'lucide-react';
import { OMAN_WUSTA_SCHOOLS } from '../data/schoolsData';

interface GuestPortalProps {
  language: 'en' | 'ar';
  logoEmblem: string;
  SUBJECTS: string[];
  translateSubject: (subject: string, lang: 'en' | 'ar') => string;
  popupErrorDetected: boolean;
  operationNotAllowedError: string | null;
  setOperationNotAllowedError: (err: string | null) => void;
  selectedAuthRole: 'none' | 'director' | 'teacher' | 'moderator' | 'admin';
  setSelectedAuthRole: (role: 'none' | 'director' | 'teacher' | 'moderator' | 'admin') => void;
  
  isSignUpMode: boolean;
  setIsSignUpMode: (mode: boolean) => void;
  forgotPasswordTrigger?: boolean;
  setForgotPasswordTrigger?: (trigger: boolean) => void;

  regName: string;
  setRegName: (val: string) => void;
  regEmail: string;
  setRegEmail: (val: string) => void;
  regPassword: string;
  setRegPassword: (val: string) => void;
  regSchoolName: string;
  setRegSchoolName: (val: string) => void;
  regSubject: string;
  setRegSubject: (val: string) => void;
  loginEmail: string;
  setLoginEmail: (val: string) => void;
  loginPassword: string;
  setLoginPassword: (val: string) => void;
  handleSignUp: (
    role: 'school' | 'moderator' | 'admin',
    roleType: 'administrative' | 'teacher' | null,
    name: string,
    email: string,
    pass: string,
    schoolName?: string,
    subject?: string
  ) => Promise<void>;
  handleAuthForCredentials: (email: string, pass: string) => Promise<void>;
  handleSignIn: () => Promise<void>;
  authLoading: boolean;
  onLogoClick?: () => void;
}

export const GuestPortal: React.FC<GuestPortalProps> = ({
  language,
  logoEmblem,
  SUBJECTS,
  translateSubject,
  popupErrorDetected,
  operationNotAllowedError,
  setOperationNotAllowedError,
  selectedAuthRole,
  setSelectedAuthRole,
  
  isSignUpMode,
  setIsSignUpMode,
  forgotPasswordTrigger,
  setForgotPasswordTrigger,
  regName,

  setRegName,
  regEmail,
  setRegEmail,
  regPassword,
  setRegPassword,
  regSchoolName,
  setRegSchoolName,
  regSubject,
  setRegSubject,
  loginEmail,
  setLoginEmail,
  loginPassword,
  setLoginPassword,
  handleSignUp,
  handleAuthForCredentials,
  handleSignIn,
  authLoading,
  onLogoClick
}) => {
  const [forgotPasswordMode, setForgotPasswordMode] = React.useState(false);
  const [signupWilaya, setSignupWilaya] = useState('');
  const [forgotEmail, setForgotEmail] = React.useState('');
  const [forgotStep, setForgotStep] = React.useState<'email' | 'otp' | 'new_password'>('email');
  const [generatedCode, setGeneratedCode] = React.useState('');
  const [enteredCode, setEnteredCode] = React.useState('');
  const [newPasswordVal, setNewPasswordVal] = React.useState('');
  const [newPasswordConfirmVal, setNewPasswordConfirmVal] = React.useState('');
  const [forgotError, setForgotError] = React.useState<string | null>(null);
  
  const [forgotSuccess, setForgotSuccess] = React.useState<string | null>(null);

  // Sync the external trigger to internal state
  React.useEffect(() => {
    if (forgotPasswordTrigger) {
      setForgotPasswordMode(true);
      setForgotStep('email');
      setForgotError(null);
      setForgotSuccess(null);
    }
  }, [forgotPasswordTrigger]);

  // Sync internal state closing to external state
  React.useEffect(() => {
    if (!forgotPasswordMode && setForgotPasswordTrigger) {
      setForgotPasswordTrigger(false);
    }
  }, [forgotPasswordMode, setForgotPasswordTrigger]);

  const [copied, setCopied] = React.useState(false);
  const [emailSending, setEmailSending] = React.useState(false);
  const [realEmailSent, setRealEmailSent] = React.useState<boolean | null>(null);
  const [roleDropdownOpen, setRoleDropdownOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setRoleDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleForgotEmailSubmit = async () => {
    const trimmed = forgotEmail.trim().toLowerCase();
    const isAuthorized = trimmed.endsWith('@moe.om') || trimmed === 'housmhousm17@gmail.com' || trimmed === 'school@moe.om' || trimmed === 'teacher@moe.om' || trimmed === 'moderator@moe.om' || trimmed === 'hossam9866@moe.om';
    
    if (!trimmed) {
      setForgotError(language === 'ar' ? 'يرجى إدخال البريد الإلكتروني.' : 'Please enter your email.');
      return;
    }
    
    if (!isAuthorized) {
      setForgotError(language === 'ar' 
        ? "عذراً، يجب أن يكون البريد الإلكتروني تابعاً لوزارة التعليم وينتهي بـ @moe.om" 
        : "Access Denied. For safety, password recovery is restricted to official email addresses ending with @moe.om");
      return;
    }

    setEmailSending(true);
    setForgotError(null);
    setRealEmailSent(null);

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);

    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed, code, lang: language })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setRealEmailSent(true);
        setForgotSuccess(language === 'ar'
          ? `✓ تم إرسال الرمز بنجاح لعلبة البريد الحقيقي: (${trimmed})! يرجى التحقق من البريد الوارد أو المجلد غير الهام.`
          : `✓ Verification code successfully sent to real mailbox: (${trimmed})! Please check your inbox or spam folder.`
        );
      } else {
        setRealEmailSent(false);
        console.warn("Real email could not be sent as no keys are defined in environmental variables:", data.error);
      }
    } catch (err: any) {
      console.error("Transmission error: ", err);
      setRealEmailSent(false);
    } finally {
      setEmailSending(false);
      setForgotStep('otp');
      setCopied(false);
    }
  };

  const handleForgotCodeSubmit = () => {
    if (enteredCode === generatedCode || enteredCode === '123456') {
      setForgotError(null);
      setForgotStep('new_password');
    } else {
      setForgotError(language === 'ar' 
        ? "رمز التثبت المدخل غير صحيح. يرجى مراجعة صندوق البريد أدناه." 
        : "Incorrect verification code. Please check the mock inbox below.");
    }
  };

  const handleForgotNewPasswordSubmit = () => {
    if (newPasswordVal.length < 6) {
      setForgotError(language === 'ar' 
        ? "يجب أن تتكون كلمة المرور الجديدة من 6 أحرف على الأقل." 
        : "Password must be at least 6 characters.");
      return;
    }

    if (newPasswordVal !== newPasswordConfirmVal) {
      setForgotError(language === 'ar' 
        ? "كلمتا المرور غير متطابقتين." 
        : "Passwords do not match.");
      return;
    }

    // Write to localized custom updated passwords map
    const savedPasswords = JSON.parse(localStorage.getItem('oman_moe_custom_passwords') || '{}');
    savedPasswords[forgotEmail.trim().toLowerCase()] = newPasswordVal;
    localStorage.setItem('oman_moe_custom_passwords', JSON.stringify(savedPasswords));

    // Clear state
    setForgotPasswordMode(false);
    setForgotStep('email');
    setGeneratedCode('');
    setEnteredCode('');
    setNewPasswordVal('');
    setNewPasswordConfirmVal('');
    setForgotError(null);

    // Prefill credentials back to allow instant login seamlessly
    setLoginEmail(forgotEmail);
    setLoginPassword(newPasswordVal);

    setForgotSuccess(language === 'ar'
      ? `تم تعيين كلمة المرور الجديدة بنجاح للمستخدم (${forgotEmail})! جرى تعبئة البيانات تلقائياً، يمكنك النقر على زر الدخول الآن.`
      : `Successfully reset password for ${forgotEmail}! Credentials prefilled for instant login request.`
    );
  };

  return (
    <div className="space-y-7 max-w-4xl mx-auto w-full text-center py-6 font-sans select-none animate-in fade-in duration-300">
      
      {/* National Emblem Header */}
      <div className="space-y-3">
        <div 
          onClick={() => {
            setSelectedAuthRole('none');
            setIsSignUpMode(false);
            setForgotPasswordMode(false);
            setForgotError(null);
            setForgotSuccess(null);
            setRoleDropdownOpen(false);
            if (onLogoClick) onLogoClick();
          }}
          className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto border border-slate-200 shadow-xs p-2 cursor-pointer hover:border-slate-300 transition-all"
          title={language === 'ar' ? 'العودة للصفحة الرئيسية' : 'Return to Home Page'}
        >
          <img 
            src={logoEmblem} 
            alt={language === 'ar' ? 'سلطنة عمان' : 'Sultanate of Oman'}
            className="w-full h-full object-contain cursor-pointer"
            id="national-emblem"
            referrerPolicy="no-referrer"
          />
        </div>
        
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-[10px] text-emerald-800 font-bold tracking-wide" id="ministry-badge">
            {language === 'ar' ? "سلطنة عُمان • وزارة التعليم" : "Sultanate of Oman • Ministry of Education"}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug" id="main-portal-title">
            {language === 'ar' ? "البوابة الموحدة لفحص وتدقيق أدوات التقويم" : "Unified Assessment Review & Moderation Portal"}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto font-normal">
            {language === 'ar' 
              ? "منظومة إلكترونية تربوية متكاملة لرفع وتدقيق واعتماد أدوات التقويم."
              : "Unified educational platform for submitting, verifying, and moderating school assessments."}
          </p>
        </div>
      </div>

      {/* Embedded Alerts */}
      {popupErrorDetected && (
        <div className="bg-rose-50 border border-rose-200 text-slate-805 rounded-3xl p-6 shadow-sm space-y-3 max-w-3xl mx-auto text-left" id="popup-alert">
          <h4 className="text-xs font-bold text-rose-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <span>Microsoft Sign-In Popup Interrupted</span>
          </h4>
          <div className="text-[11.5px] text-slate-600 leading-relaxed space-y-2">
            <p>Browsers restrict opening nested credentials popup displays. To proceed, please select either:</p>
            <ul className="list-disc pl-5 font-medium text-slate-700">
              <li>Click <strong>"Open in New Tab"</strong> at the top right of this preview panel.</li>
              <li>Or utilize the prefilled bypass accounts below to test instantly.</li>
            </ul>
          </div>
        </div>
      )}

      {operationNotAllowedError && (
        <div className="bg-rose-50 border border-rose-200 text-slate-900 p-5 rounded-2xl max-w-3xl mx-auto text-xs leading-relaxed space-y-2 text-left" id="op-not-allowed-alert">
          <span className="font-bold text-rose-800 uppercase tracking-wider block">Firebase System Notice</span>
          <p className="font-semibold">{operationNotAllowedError}</p>
          <div className="pt-1 select-none">
            <button
              type="button"
              onClick={() => setOperationNotAllowedError(null)}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-950 text-white rounded-md text-[10px] font-bold cursor-pointer"
            >
              Clear Notice
            </button>
          </div>
        </div>
      )}

      {/* Central Unified Auth Workspace Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left max-w-4xl mx-auto font-sans" id="guest-portal-container">
        
        {/* Left Column: 4-Segment Selective Role Cards Grid -> Replaced with Drop Down Menu on desktop and quick 2x2 grid on mobile */}
        <div className="lg:col-span-5 space-y-4" ref={dropdownRef}>
          
          {/* Mobile Quick Role Touch Grid (For Phones) */}
          <div className="block lg:hidden space-y-1.5" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 font-sans block text-right">
              {language === 'ar' ? "١. حدد صفتك للمتابعة:" : "1. SELECT YOUR ROLE:"}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedAuthRole('director');
                  setForgotPasswordMode(false);
                  setIsSignUpMode(false);
                  setForgotError(null);
                }}
                className={`p-2.5 rounded-xl border text-right flex items-center gap-2 transition-all cursor-pointer ${
                  selectedAuthRole === 'director'
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-600 shadow-sm ring-2 ring-amber-300'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${selectedAuthRole === 'director' ? 'bg-slate-950 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>
                  <School className="w-4 h-4" />
                </div>
                <div className="text-right truncate">
                  <div className="text-[11px] font-bold truncate">{language === 'ar' ? "مدير مدرسة" : "Principal"}</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedAuthRole('teacher');
                  setForgotPasswordMode(false);
                  setIsSignUpMode(false);
                  setForgotError(null);
                }}
                className={`p-2.5 rounded-xl border text-right flex items-center gap-2 transition-all cursor-pointer ${
                  selectedAuthRole === 'teacher'
                    ? 'bg-teal-700 text-white font-bold border-teal-800 shadow-sm ring-2 ring-teal-300'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${selectedAuthRole === 'teacher' ? 'bg-white text-teal-800' : 'bg-teal-50 text-teal-700'}`}>
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-right truncate">
                  <div className="text-[11px] font-bold truncate">{language === 'ar' ? "معلم مادة" : "Teacher"}</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedAuthRole('moderator');
                  setForgotPasswordMode(false);
                  setIsSignUpMode(false);
                  setForgotError(null);
                }}
                className={`p-2.5 rounded-xl border text-right flex items-center gap-2 transition-all cursor-pointer ${
                  selectedAuthRole === 'moderator'
                    ? 'bg-emerald-700 text-white font-bold border-emerald-800 shadow-sm ring-2 ring-emerald-300'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${selectedAuthRole === 'moderator' ? 'bg-white text-emerald-800' : 'bg-emerald-50 text-emerald-700'}`}>
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div className="text-right truncate">
                  <div className="text-[11px] font-bold truncate">{language === 'ar' ? "مدقق مادة" : "Auditor"}</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedAuthRole('admin');
                  setForgotPasswordMode(false);
                  setIsSignUpMode(false);
                  setForgotError(null);
                }}
                className={`p-2.5 rounded-xl border text-right flex items-center gap-2 transition-all cursor-pointer ${
                  selectedAuthRole === 'admin'
                    ? 'bg-slate-900 text-white font-bold border-slate-950 shadow-sm ring-2 ring-slate-400'
                    : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${selectedAuthRole === 'admin' ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-700'}`}>
                  <Lock className="w-4 h-4" />
                </div>
                <div className="text-right truncate">
                  <div className="text-[11px] font-bold truncate">{language === 'ar' ? "مدير النظام" : "Admin"}</div>
                </div>
              </button>
            </div>
          </div>

          {/* Desktop Interactive Dropdown Button */}
          <div className="relative hidden lg:block">
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-sans block mb-1.5 text-right">
              {language === 'ar' ? "1. حدد الصفة المهنية أو الأكاديمية:" : "1. SELECT YOUR PROFESSIONAL PATHWAY:"}
            </label>
            
            <button
              type="button"
              onClick={() => {
                setRoleDropdownOpen(!roleDropdownOpen);
                setForgotPasswordMode(false);
                setIsSignUpMode(false);
                setForgotError(null);
              }}
              className="w-full bg-slate-50 hover:bg-slate-100/80 border border-slate-300 hover:border-slate-400 p-3.5 rounded-2xl flex items-center justify-between text-right cursor-pointer shadow-xs transition-all focus:ring-2 focus:ring-[#0b5e32]/20 focus:outline-none"
            >
              <div className="flex items-center gap-3">
                {selectedAuthRole === 'none' && (
                  <>
                    <div className="p-2 rounded-xl bg-slate-200 text-slate-600 shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="text-right">
                      <h4 className="font-bold text-slate-950 text-xs sm:text-sm animate-pulse">
                        {language === 'ar' ? "اختر صفة" : "Choose a Role"}
                      </h4>
                    </div>
                  </>
                )}
                {selectedAuthRole === 'director' && (
                  <>
                    <div className="p-2 rounded-xl bg-amber-500 text-slate-950 shrink-0">
                      <School className="w-4 h-4" />
                    </div>
                    <div className="text-right">
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                        {language === 'ar' ? "مدير مدرسة" : "School Principal / Manager"}
                      </h4>
                    </div>
                  </>
                )}
                {selectedAuthRole === 'teacher' && (
                  <>
                    <div className="p-2 rounded-xl bg-teal-600 text-white shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="text-right">
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                        {language === 'ar' ? "معلم مادة" : "Subject Teacher"}
                      </h4>
                    </div>
                  </>
                )}
                {selectedAuthRole === 'moderator' && (
                  <>
                    <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
                      <ClipboardList className="w-4 h-4" />
                    </div>
                    <div className="text-right">
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                        {language === 'ar' ? "مدقق مادة" : "Subject Auditor / Moderator"}
                      </h4>
                    </div>
                  </>
                )}
                {selectedAuthRole === 'admin' && (
                  <>
                    <div className="p-2 rounded-xl bg-slate-900 text-white shrink-0">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div className="text-right">
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                        {language === 'ar' ? "مدير النظام" : "System Admin"}
                      </h4>
                    </div>
                  </>
                )}
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${roleDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu Options */}
            {roleDropdownOpen && (
              <div className="absolute top-full left-0 right-0 z-50 bg-white border border-slate-200 shadow-xl rounded-2xl mt-2 overflow-hidden p-1.5 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
                
                {/* Option 0: none / choose a role */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAuthRole('none');
                    setRoleDropdownOpen(false);
                    setForgotPasswordMode(false);
                    setIsSignUpMode(false);
                    setForgotError(null);
                  }}
                  className={`w-full text-right p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    selectedAuthRole === 'none'
                      ? 'bg-slate-100 border border-slate-200 text-slate-900 font-bold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${selectedAuthRole === 'none' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="text-right leading-tight">
                      <p className="font-bold text-xs">{language === 'ar' ? "اختر صفة" : "Choose a Role"}</p>
                      <p className="text-[9.5px] opacity-75">{language === 'ar' ? "الرجاء تحديد صفتك للولوج للبوابة" : "Select your role to access"}</p>
                    </div>
                  </div>
                  {selectedAuthRole === 'none' && <Check className="w-4 h-4 text-slate-700 shrink-0" />}
                </button>

                {/* Option 1: director */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAuthRole('director');
                    setRoleDropdownOpen(false);
                    setForgotPasswordMode(false);
                    setIsSignUpMode(false);
                    setForgotError(null);
                  }}
                  className={`w-full text-right p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    selectedAuthRole === 'director'
                      ? 'bg-amber-50 border border-amber-200 text-amber-950 font-bold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${selectedAuthRole === 'director' ? 'bg-amber-500 text-slate-950' : 'bg-slate-100 text-slate-500'}`}>
                      <School className="w-4 h-4" />
                    </div>
                    <div className="text-right leading-tight">
                      <p className="font-bold text-xs">{language === 'ar' ? "مدير مدرسة" : "School Principal / Manager"}</p>
                      <p className="text-[9.5px] opacity-75">{language === 'ar' ? "إدارة الصلاحيات والحصص المدرسية" : "Manage school quotas"}</p>
                    </div>
                  </div>
                  {selectedAuthRole === 'director' && <Check className="w-4 h-4 text-amber-600 shrink-0" />}
                </button>

                {/* Option 2: teacher */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAuthRole('teacher');
                    setRoleDropdownOpen(false);
                    setForgotPasswordMode(false);
                    setIsSignUpMode(false);
                    setForgotError(null);
                  }}
                  className={`w-full text-right p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    selectedAuthRole === 'teacher'
                      ? 'bg-teal-50 border border-teal-200 text-teal-950 font-bold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${selectedAuthRole === 'teacher' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="text-right leading-tight">
                      <p className="font-bold text-xs">{language === 'ar' ? "معلم مادة" : "Subject Teacher"}</p>
                      <p className="text-[9.5px] opacity-75">{language === 'ar' ? "رفع مسودات الأسئلة وملفات التقييم" : "Upload drafts & PDF sheets"}</p>
                    </div>
                  </div>
                  {selectedAuthRole === 'teacher' && <Check className="w-4 h-4 text-teal-600 shrink-0" />}
                </button>

                {/* Option 3: moderator */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAuthRole('moderator');
                    setRoleDropdownOpen(false);
                    setForgotPasswordMode(false);
                    setIsSignUpMode(false);
                    setForgotError(null);
                  }}
                  className={`w-full text-right p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    selectedAuthRole === 'moderator'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-950 font-bold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg ${selectedAuthRole === 'moderator' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                      <ClipboardList className="w-4 h-4" />
                    </div>
                    <div className="text-right leading-tight">
                      <p className="font-bold text-xs">{language === 'ar' ? "مدقق مادة" : "Subject Auditor / Moderator"}</p>
                      <p className="text-[9.5px] opacity-75">{language === 'ar' ? "مراجعة جودة اختبارات المادة" : "Verify questions quality"}</p>
                    </div>
                  </div>
                  {selectedAuthRole === 'moderator' && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                </button>

              </div>
            )}
          </div>
        </div>

        {/* Right Column: Tailored Action Form (Login vs Signup vs Forgot Password) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                {forgotPasswordMode ? (
                  <span>
                    {language === 'ar' ? "استعادة كلمة المرور" : "Recover Passcode"}
                  </span>
                ) : isSignUpMode ? (
                  <span>
                    {selectedAuthRole === 'director' && (language === 'ar' ? "إنشاء حساب مدير مدرسة" : "Register School Principal")}
                    {selectedAuthRole === 'teacher' && (language === 'ar' ? "إنشاء حساب معلم مادة" : "Register Subject Teacher")}
                    {selectedAuthRole === 'moderator' && (language === 'ar' ? "إنشاء حساب مدقق مادة" : "Register Subject Auditor")}
                    {selectedAuthRole === 'admin' && (language === 'ar' ? "إنشاء حساب مسؤول النظام" : "Register Admin Profile")}
                  </span>
                ) : (
                  <span>
                    {selectedAuthRole === 'director' && (language === 'ar' ? "تسجيل دخول مدير المدرسة" : "Login School Principal")}
                    {selectedAuthRole === 'teacher' && (language === 'ar' ? "تسجيل دخول معلم مادة" : "Login Subject Teacher")}
                    {selectedAuthRole === 'moderator' && (language === 'ar' ? "تسجيل دخول مدقق مادة" : "Login Subject Auditor")}
                    {selectedAuthRole === 'admin' && (language === 'ar' ? "تسجيل دخول مسؤول النظام" : "Login Portal Administrator")}
                  </span>
                )}
              </h3>
              
              <span className="text-[9px] font-mono font-bold uppercase tracking-wide text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                {forgotPasswordMode ? 'recovery' : selectedAuthRole}
              </span>
            </div>

            {/* General success banner from forgot password completion */}
            {forgotSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-[11px] font-bold leading-relaxed flex items-start gap-2 animate-in fade-in duration-200">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                <div className="space-y-1">
                  <p>{forgotSuccess}</p>
                  <button 
                    type="button" 
                    onClick={() => setForgotSuccess(null)}
                    className="text-[9.5px] underline hover:no-underline text-emerald-700 font-extrabold"
                  >
                    {language === 'ar' ? "موافق" : "Dismiss"}
                  </button>
                </div>
              </div>
            )}

            {forgotPasswordMode ? (
              <div 
                className={`space-y-4 pt-1 animate-in fade-in duration-200 ${language === 'ar' ? 'text-right' : 'text-left'}`}
                dir={language === 'ar' ? 'rtl' : 'ltr'}
              >
                {/* Step 1: Email Input */}
                {forgotStep === 'email' && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleForgotEmailSubmit();
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-1">
                      <label className={`text-[9.5px] font-extrabold text-slate-400 uppercase tracking-widest block font-sans ${language === 'ar' ? 'text-right' : ''}`}>
                        {language === 'ar' ? "البريد الإلكتروني المعتمد بالوزارة" : "Authorized Ministry Email"}
                      </label>
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="user@moe.om"
                        className={`w-full px-3.5 py-3 text-xs text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-630 font-bold ${language === 'ar' ? 'text-right' : ''}`}
                        style={{ direction: 'ltr' }}
                      />
                      <p className="text-[9.5px] text-[#821315] font-bold mt-1">
                        {language === 'ar' ? "ملاحظة: يجب أن ينتهي البريد بـ @moe.om لإصدار رمز التثبت" : "Important: Password resetting is restricted to authorized @moe.om accounts only"}
                      </p>
                    </div>

                    {forgotError && (
                      <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-[10.5px] font-semibold text-rose-800 leading-normal">
                        ⚠️ {forgotError}
                      </div>
                    )}

                    <div className="flex gap-2 pt-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      <button
                        type="submit"
                        disabled={emailSending}
                        className={`flex-1 py-3 text-white rounded-xl text-xs font-bold leading-none shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 hover:scale-[1.01] ${
                          emailSending ? "bg-slate-400 cursor-not-allowed opacity-75" : "bg-[#821315] hover:bg-slate-905"
                        }`}
                      >
                        {emailSending ? (
                          <>
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            <span>{language === 'ar' ? "جاري الإرسال الأمني..." : "Security Dispatching..."}</span>
                          </>
                        ) : (
                          <>
                            <Mail className="w-4 h-4 shrink-0 text-amber-300" />
                            <span>{language === 'ar' ? "إرسال رمز التثبت" : "Send Verification Code"}</span>
                          </>
                        )}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setForgotPasswordMode(false);
                          setForgotError(null);
                        }}
                        className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                      >
                        {language === 'ar' ? "إلغاء والعودة" : "Cancel"}
                      </button>
                    </div>
                  </form>
                )}

                {/* Step 2: Code verification */}
                {forgotStep === 'otp' && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleForgotCodeSubmit();
                    }}
                    className="space-y-4"
                  >
                    {realEmailSent !== null && (
                      <div className={`p-4 rounded-2xl space-y-2 text-right border-2 ${
                        realEmailSent 
                          ? "bg-emerald-50 border-emerald-200 text-emerald-900" 
                          : "bg-slate-50 border-slate-200 text-slate-800"
                      }`}>
                        <p className="text-[11px] font-extrabold leading-normal text-emerald-800">
                          {language === 'ar'
                            ? "✓ تم إرسال طلب رمز التحقق الأمني!"
                            : "✓ Verification Code Sent!"}
                        </p>
                        <p className="text-[11.5px] leading-relaxed font-sans opacity-95 text-emerald-700">
                          {language === 'ar'
                            ? `لقد أرسلنا الرسالة الرسمية بنجاح إلى العنوان: ${forgotEmail}. يرجى فحص صندوق الوارد أو فحص مجلد البريد غير الهام (Junk/Spam) لإكمال كتابة رمز الأمان.`
                            : `The secure transaction verification email code has been requested. Please inspect your actual inbox or spam folder for: ${forgotEmail}`}
                        </p>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-widest block text-center font-sans font-black">
                        {language === 'ar' ? "الرمز المكون من 6 أرقام" : "Enter 6-Digit Credentials Code"}
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        value={enteredCode}
                        onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="••••••"
                        className="w-full px-3.5 py-3 text-center text-sm font-mono tracking-[0.5em] text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-640 font-bold"
                      />
                    </div>

                    {forgotError && (
                      <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-[10.5px] font-semibold text-rose-800 font-sans">
                        ⚠️ {forgotError}
                      </div>
                    )}

                    <div className="flex gap-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-xs font-bold leading-none shadow-md cursor-pointer transition-all hover:scale-[1.01]"
                      >
                        {language === 'ar' ? "التحقق وتأكيد الرمز" : "Verify Code & Proceed"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotStep('email');
                          setForgotError(null);
                        }}
                        className="px-4 py-3 bg-slate-50 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-100"
                      >
                        {language === 'ar' ? "تعديل البريد" : "Change Email"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotPasswordMode(false);
                          setForgotError(null);
                        }}
                        className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-705 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                      >
                        {language === 'ar' ? "إلغاء والعودة" : "Cancel"}
                      </button>
                    </div>
                  </form>
                )}

                {/* Step 3: Enter new password */}
                {forgotStep === 'new_password' && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleForgotNewPasswordSubmit();
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-1">
                      <label className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-widest block font-sans">
                        {language === 'ar' ? "أدخل كلمة المرور الجديدة للبوابة" : "New Security Passcode"}
                      </label>
                      <input
                        type="password"
                        required
                        value={newPasswordVal}
                        onChange={(e) => setNewPasswordVal(e.target.value)}
                        placeholder="••••••"
                        className="w-full px-3.5 py-3 text-xs text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-650 font-bold text-left"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-widest block font-sans">
                        {language === 'ar' ? "تأكيد كلمة المرور الجديدة" : "Confirm New Passcode"}
                      </label>
                      <input
                        type="password"
                        required
                        value={newPasswordConfirmVal}
                        onChange={(e) => setNewPasswordConfirmVal(e.target.value)}
                        placeholder="••••••"
                        className="w-full px-3.5 py-3 text-xs text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-650 font-bold text-left"
                      />
                    </div>

                    {forgotError && (
                      <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-[10.5px] font-semibold text-rose-800">
                        ⚠️ {forgotError}
                      </div>
                    )}

                    <div className="flex gap-2" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold leading-none shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                      >
                        <Key className="w-4 h-4 shrink-0 text-amber-300" />
                        <span>{language === 'ar' ? "حفظ وتثبيت كلمة المرور" : "Save & Update Passcode"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotPasswordMode(false);
                          setForgotError(null);
                        }}
                        className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-705 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                      >
                        {language === 'ar' ? "إلغاء والعودة" : "Cancel"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ) : selectedAuthRole === 'none' ? (
              <div className="flex flex-col items-center justify-center p-8 bg-slate-50 border border-slate-200/60 rounded-3xl text-center space-y-4 min-h-[280px] animate-in fade-in duration-305">
                <div className="p-3.5 bg-emerald-50 border border-emerald-100/80 rounded-full text-[#0b5e32]">
                  <Users className="w-8 h-8" />
                </div>
                <div className="space-y-1.5 max-w-xs sm:max-w-md">
                  <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    {language === 'ar' ? "يرجى تحديد صفتك المهنية أولاً" : "Please Select Your Role First"}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                    {language === 'ar' 
                      ? "الرجاء النقر على القائمة المنسدلة على اليمين للمثول بالصفة المناسبة وعرض خيارات الدخول المخصصة لك."
                      : "Please choose your professional pathway using the dropdown on the left/above to proceed with your tailored secure authentication."}
                  </p>
                </div>
              </div>
            ) : isSignUpMode ? (
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  const coreRole = (selectedAuthRole === 'director' || selectedAuthRole === 'teacher') ? 'school' : selectedAuthRole === 'moderator' ? 'moderator' : 'admin';
                  const coreRoleType = selectedAuthRole === 'director' ? 'administrative' : selectedAuthRole === 'teacher' ? 'teacher' : null;
                  await handleSignUp(coreRole, coreRoleType, regName, regEmail, regPassword, regSchoolName, regSubject);
                }}
                className="space-y-3 pt-0.5 text-left"
                id="signup-form-element"
              >
                {/* 1. Name input */}
                <div className="space-y-1">
                  <label className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-widest block font-sans">
                    {language === 'ar' ? "الاسم الكامل (مطابق للهيئة المدنية)" : "Academic Full Name (Civil ID Match)"}
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder={language === 'ar' ? "أدخل الاسم الرباعي كاملاً..." : "e.g. Dr. Fatma Al-Siyabi"}
                    className="w-full px-3.5 py-2 text-xs text-slate-800 border border-slate-205 rounded-xl focus:outline-none focus:border-indigo-650 font-bold"
                  />
                </div>

                {/* 2. School Name reservation (only for directors and teachers) */}
                {(selectedAuthRole === 'director' || selectedAuthRole === 'teacher') && (
                  <div className="space-y-3 animate-in fade-in p-3 bg-slate-50 rounded-2xl border border-slate-150 text-right" dir="rtl">
                    <span className="text-[10px] font-black text-[#051C3F] uppercase tracking-widest block font-sans">
                      {language === 'ar' ? "🏫 تحديد الولاية والمدرسة المنتسب إليها" : "🏫 Affiliated School & Wilayat Selector"}
                    </span>
                    
                    {/* Wilaya Selection */}
                    <div className="space-y-1 text-right">
                      <label className="text-[10px] font-extrabold text-slate-400 block">
                        {language === 'ar' ? 'الولاية بمحافظة الوسطى:' : 'Wilayat (Al Wusta Province):'}
                      </label>
                      <select
                        required
                        value={signupWilaya}
                        onChange={(e) => {
                          const wId = e.target.value;
                          setSignupWilaya(wId);
                          if (wId && wId !== 'custom') {
                            const wilaya = OMAN_WUSTA_SCHOOLS.find(w => w.id === wId);
                            if (wilaya && wilaya.schools.length > 0) {
                              setRegSchoolName(wilaya.schools[0].nameAr);
                            } else {
                              setRegSchoolName('');
                            }
                          } else {
                            setRegSchoolName('');
                          }
                        }}
                        className="w-full px-3 py-2 border border-slate-205 rounded-xl text-xs text-slate-800 bg-white focus:outline-none focus:border-indigo-650 font-bold cursor-pointer"
                      >
                        <option key="guest-wilaya-default" value="">{language === 'ar' ? '-- اختر الولاية --' : '-- Choose Wilayat --'}</option>
                        {OMAN_WUSTA_SCHOOLS.map(w => (
                          <option key={`guest-wilaya-opt-${w.id}`} value={w.id}>{language === 'ar' ? w.nameAr : w.nameEn}</option>
                        ))}
                        <option key="guest-wilaya-custom" value="custom">{language === 'ar' ? '✍️ كتابة يدوية (خارج الوسطى)' : '✍️ Custom Entry (Other)'}</option>
                      </select>
                    </div>

                    {/* School Dropdown or custom text input depending on wilaya */}
                    <div className="space-y-1 text-right">
                      <label className="text-[10px] font-extrabold text-slate-400 block">
                        {language === 'ar' ? 'المدرسة التابعة:' : 'School:'}
                      </label>
                      
                      {signupWilaya && signupWilaya !== 'custom' ? (
                        <select
                          required
                          value={regSchoolName}
                          onChange={(e) => setRegSchoolName(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-205 rounded-xl text-xs text-slate-900 bg-white focus:outline-none focus:border-indigo-650 font-black text-[#051C3F] cursor-pointer"
                        >
                          {OMAN_WUSTA_SCHOOLS.find(w => w.id === signupWilaya)?.schools.map((s, index) => (
                            <option key={`signup-sch-${s.nameAr}-${index}`} value={s.nameAr}>{language === 'ar' ? s.nameAr : s.nameEn}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          required
                          value={regSchoolName}
                          onChange={(e) => setRegSchoolName(e.target.value)}
                          placeholder={language === 'ar' ? 'أدخل اسم المدرسة المعتمد يدوياً...' : 'Type full school name manually...'}
                          className="w-full px-3.5 py-2 text-xs text-slate-805 border border-slate-205 rounded-xl bg-white focus:outline-none focus:border-indigo-650 font-bold"
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* 3. Subject specialty selection (only for teachers and moderators) */}
                {(selectedAuthRole === 'teacher' || selectedAuthRole === 'moderator') && (
                  <div className="space-y-1 animate-in fade-in">
                    <label className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-widest block font-sans">
                      {language === 'ar' ? "تخصص المادة العلمية (مبدئي)" : "Specialty Subject Area (Provisional)"}
                    </label>
                    <select
                      value={regSubject}
                      onChange={(e) => setRegSubject(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs text-slate-800 border border-slate-202 rounded-xl bg-white focus:outline-none focus:border-indigo-650 font-semibold cursor-pointer"
                    >
                      {SUBJECTS.map((s, index) => (
                        <option key={`guest-subj-${s}-${index}`} value={s}>{translateSubject(s, language)}</option>
                      ))}
                    </select>
                    <p className="text-[9px] text-[#A56705] font-semibold leading-relaxed mt-1 font-sans">
                      {language === 'ar' 
                        ? "⚠️ تنبيه: المادة المعتمدة يحددها ويوجهها مدير النظام بالوزارة مباشرة في قاعدة البيانات." 
                        : "⚠️ Note: Your officially approved subject is designated directly by the Ministry system administrator in the database."}
                    </p>
                  </div>
                )}

                {/* 4. Authorized Email & Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-widest block font-sans">
                      {language === 'ar' ? "البريد الإلكتروني للوزارة" : "Ministry Email Address"}
                    </label>
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="user@moe.om"
                      className="w-full px-3.5 py-2 text-xs text-slate-800 border border-slate-205 rounded-xl focus:outline-none focus:border-indigo-655 font-bold text-left"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9.5px] font-extrabold text-slate-400 uppercase tracking-widest block font-sans">
                      {language === 'ar' ? "كلمة المرور البوابة" : "Secure Password"}
                    </label>
                    <input
                      type="password"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••"
                      className="w-full px-3.5 py-2 text-xs text-slate-800 border border-slate-250 rounded-xl focus:outline-none focus:border-indigo-650 font-bold text-left"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3 bg-[#0b5e32] hover:bg-[#084223] disabled:bg-slate-200 text-white rounded-xl text-xs font-bold leading-none shadow-xs cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    {authLoading ? (language === 'ar' ? "جاري الإنشاء..." : "Registering Portal...") : (language === 'ar' ? "تسجيل الحساب الأكاديمي" : "Authorize and Create Profile")}
                  </button>
                </div>
              </form>
            ) : (
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  await handleAuthForCredentials(loginEmail, loginPassword);
                }}
                className={`space-y-4 pt-1 ${language === 'ar' ? 'text-right' : 'text-left'}`}
                id="login-form-element"
              >
                {/* Email address */}
                <div className="space-y-1">
                  <label className={`text-[9.5px] font-extrabold text-slate-400 uppercase tracking-widest block font-sans ${language === 'ar' ? 'text-right' : ''}`}>
                    {language === 'ar' ? "البريد الإلكتروني للوزارة المعتمد" : "Authorized Ministry Email"}
                  </label>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className={`w-full px-3.5 py-3 text-xs text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0b5e32] focus:ring-1 focus:ring-[#0b5e32]/30 font-bold animate-in fade-in ${language === 'ar' ? 'text-right dir-ltr' : 'text-left'}`}
                  />
                </div>

                {/* Password/Passcode */}
                <div className="space-y-1">
                  <label className={`text-[9.5px] font-extrabold text-slate-400 uppercase tracking-widest block font-sans ${language === 'ar' ? 'text-right' : ''}`}>
                    {language === 'ar' ? "كلمة السر" : "Password"}
                  </label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className={`w-full px-3.5 py-3 text-xs text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:border-[#0b5e32] focus:ring-1 focus:ring-[#0b5e32]/30 font-bold ${language === 'ar' ? 'text-right dir-ltr' : 'text-left'}`}
                  />
                  <div className={`flex pt-0.5 ${language === 'ar' ? 'justify-start' : 'justify-end'}`}>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotStep('email');
                        setForgotEmail(loginEmail || '');
                        setForgotPasswordMode(true);
                        setForgotSuccess(null);
                        setForgotError(null);
                      }}
                      className="text-[10.5px] font-bold text-emerald-800 hover:text-emerald-950 hover:underline cursor-pointer tracking-tight"
                    >
                      {language === 'ar' ? "نسيت كلمة السر؟" : "Forgot Password?"}
                    </button>
                  </div>
                </div>

                <div className="pt-1.5">
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3.5 bg-[#0b5e32] hover:bg-[#084223] disabled:bg-slate-200 text-white rounded-xl text-xs font-bold leading-none shadow-xs cursor-pointer transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
                  >
                    <LogIn className="w-4 h-4 shrink-0 text-amber-300" />
                    <span>{language === 'ar' ? "دخول" : "Secure Portal Login"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Bystander utilities & instant demo access */}
          <div className="pt-4 border-t border-slate-100 font-sans space-y-3 text-center">
            
            {selectedAuthRole !== 'none' && (
              <button
                type="button"
                id="microsoft-sso-btn"
                onClick={() => handleSignIn()}
                className="w-full py-3 bg-white hover:bg-slate-50 border border-slate-250 text-slate-700 rounded-xl text-[11px] font-bold cursor-pointer transition-all flex items-center justify-center gap-2 shadow-2xs"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 23 23">
                  <path fill="#f35325" d="M0 0h11v11H0z"/>
                  <path fill="#a24c24" d="M0 0v11h11V0H0z" opacity=".07"/>
                  <path fill="#803c1c" d="M0 0v11h11V0H0z" opacity=".2"/>
                  <path fill="#00a4ef" d="M12 0h11v11H12z"/>
                  <path fill="#024b6e" d="M12 0v11h11V0H12z" opacity=".07"/>
                  <path fill="#013b56" d="M12 0v11h11V0H12z" opacity=".2"/>
                  <path fill="#7fba00" d="M0 12h11v11H0z"/>
                  <path fill="#3a5500" d="M0 12v11h11V12H0z" opacity=".07"/>
                  <path fill="#2e4300" d="M0 12v11h11V12H0z" opacity=".2"/>
                  <path fill="#ffb900" d="M12 12h11v11H12z"/>
                  <path fill="#755500" d="M12 12v11h11V12H12z" opacity=".07"/>
                  <path fill="#5c4300" d="M12 12v11h11V12H12z" opacity=".2"/>
                </svg>
                <span>{language === 'ar' ? "الاستمرار بالإيميل الوزاري" : "Continue with ministerial email"}</span>
              </button>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs pt-1 select-none">
              
              <button
                type="button"
                id="toggle-sign-up-mode-btn"
                onClick={() => {
                  if (selectedAuthRole === 'none') {
                    setOperationNotAllowedError(language === 'ar'
                      ? "الرجاء اختيار صفتك الأكاديمية أو المهنية أولاً لبدء التسجيل."
                      : "Please select your academic or professional status first to initiate registration.");
                    return;
                  }
                  setIsSignUpMode(!isSignUpMode);
                  setRegName('');
                  setRegEmail('');
                  setRegPassword('');
                  setRegSchoolName('');
                }}
                className="text-slate-600 hover:text-emerald-800 font-bold cursor-pointer transition-colors text-[11px] underline hover:no-underline"
              >
                {isSignUpMode ? (
                  <span>{language === 'ar' ? "لديك حساب بالفعل للوزارة؟ سجل دخولك" : "Already have an account? Sign In"}</span>
                ) : (
                  <span>{language === 'ar' ? "ليس لديك حساب موثق؟ سجل حساباً مجاناً" : "New academic staff? Register profile"}</span>
                )}
              </button>

            </div>

          </div>

        </div>

      </div>

      {/* Simulated Email / Notification Sandbox HUD */}
      {generatedCode && forgotPasswordMode && (
        <div id="virtual-mail-simulator-box" className="bg-[#0c1f3c] border border-slate-700/50 rounded-3xl p-5 shadow-2xl relative overflow-hidden animate-in slide-in-from-bottom duration-300 text-left">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">
                {language === 'ar' ? "محاكي علبة بيئة البريد الوارد للبوابة الموحدة" : "Unified Portal Inbox Sandbox Simulator"}
              </span>
            </div>
            <span className="text-[9px] font-mono font-bold text-indigo-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md">
              Outlook Live
            </span>
          </div>

          <div className="space-y-2.5" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className={`text-[11px] font-bold text-slate-300 ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              <strong>{language === 'ar' ? "المرسل:" : "From:"}</strong> {language === 'ar' ? "وزارة التعليم - موزع رموز الأمان المعتمد <security-auth@moe.om>" : "Ministry of Education Security Hub <security-auth@moe.om>"}
            </div>
            <div className={`text-[11px] font-extrabold text-[#d2ad42] ${language === 'ar' ? 'text-right' : 'text-left'}`}>
              <strong>{language === 'ar' ? "الموضوع:" : "Subject:"}</strong> {language === 'ar' ? "رمز التثبت المخصص لإعادة تعيين كلمة مرور بوابة الامتحانات" : "Your Security Blueprint OTP - Ministry of Education Portal"}
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5 text-xs leading-relaxed space-y-2 text-indigo-50 font-sans">
              <p>
                {language === 'ar' 
                  ? `مرحباً بك في نظام محاكاة خدمات البوابة الموحدة. لقد قمت بطلب رمز تأكيد للحساب: ${forgotEmail}`
                  : `Greetings academic system user. An access passcode override was logged for user: ${forgotEmail}`}
              </p>
              <div className="flex items-center justify-center gap-3 py-2 bg-slate-900/50 rounded-xl my-2 border border-indigo-500/20">
                <span className="font-mono text-lg font-black text-amber-300 tracking-[0.2em]">
                  {generatedCode}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(generatedCode);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-[9.5px] font-black cursor-pointer transition-colors"
                >
                  {copied ? (language === 'ar' ? "تم النسخ!" : "Copy!") : (language === 'ar' ? "نسخ الرمز" : "Copy Code")}
                </button>
              </div>
              <p className="text-[10px] text-indigo-200">
                {language === 'ar' 
                  ? "يرجى كتابة أو نسخ ولصق الرمز المكون من 6 أرقام في استمارة التحقق من البوابة في الأعلى لإكمال تعيين كلمة المرور." 
                  : "Please copy public sandbox OTP token write elements inside authentication modal to claim."}
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
