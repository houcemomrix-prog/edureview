import React, { useState } from 'react';
import { Lock, Key, Eye, EyeOff, ShieldCheck, ShieldAlert, X, CheckCircle } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  userName: string;
  language: 'ar' | 'en';
  onSuccess?: () => void;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
  userEmail,
  userName,
  language,
  onSuccess
}: ChangePasswordModalProps) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [showForgotNotice, setShowForgotNotice] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!oldPassword.trim()) {
      setError(language === 'ar' ? 'يرجى إدخال كلمة المرور الحالية.' : 'Please enter your current password.');
      return;
    }

    if (newPassword.length < 6) {
      setError(language === 'ar' ? 'يجب ألا تقل كلمة المرور الجديدة عن 6 أحرف.' : 'New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(language === 'ar' ? 'كلمتا المرور غير متطابقتين.' : 'New passwords do not match.');
      return;
    }

    if (oldPassword === newPassword) {
      setError(language === 'ar' ? 'كلمة المرور الجديدة يجب أن تكون مختلفة عن كلمة المرور الحالية.' : 'New password must be different from current password.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail.trim(),
          oldPassword: oldPassword,
          newPassword: newPassword
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || (language === 'ar' ? 'فشل تغيير كلمة المرور.' : 'Failed to change password.'));
      }

      // Sync local passwords storage for seamless offline/sandbox compatibility
      try {
        const savedPasswords = JSON.parse(localStorage.getItem('oman_moe_custom_passwords') || '{}');
        savedPasswords[userEmail.trim().toLowerCase()] = newPassword;
        localStorage.setItem('oman_moe_custom_passwords', JSON.stringify(savedPasswords));
      } catch (e) {
        console.warn('Could not sync custom passwords in localStorage:', e);
      }

      setSuccess(
        language === 'ar' 
          ? 'تم تغيير كلمة المرور بنجاح! يمكنك الآن استخدام كلمة المرور الجديدة.' 
          : 'Password changed successfully! You can now use your new password.'
      );

      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 2000);

    } catch (err: any) {
      setError(err.message || (language === 'ar' ? 'حدث خطأ أثناء تغيير كلمة المرور.' : 'An error occurred while changing password.'));
      // If error indicates wrong old password, automatically emphasize the admin contact notice
      if (err.message?.includes('غير صحيحة') || err.message?.includes('Incorrect') || err.message?.includes('INVALID')) {
        setShowForgotNotice(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/65 backdrop-blur-xs transition-opacity"
        onClick={() => !loading && onClose()}
      />

      {/* Modal Dialog */}
      <div 
        className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[92vh] border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-emerald-50/50 to-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0b5e32] text-white flex items-center justify-center shadow-sm">
              <Key className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-heading font-black text-base text-[#0B1E40]">
                {language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
              </h3>
              <p className="text-[11px] font-bold text-slate-500 mt-0.5 truncate max-w-[240px]">
                {userName} ({userEmail})
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            title={language === 'ar' ? 'إغلاق' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">

          {/* Success Banner */}
          {success && (
            <div className="p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 animate-in fade-in">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-2xl text-xs font-bold flex items-start gap-2.5 bg-rose-50 text-rose-800 border border-rose-200 animate-in fade-in">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Old / Current Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-extrabold text-slate-700 block font-sans">
                  {language === 'ar' ? 'كلمة المرور الحالية (القديمة):' : 'Current (Old) Password:'}
                </label>

                {/* Forgotten Password link */}
                <button
                  type="button"
                  onClick={() => setShowForgotNotice(!showForgotNotice)}
                  className="text-[10px] font-extrabold text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer transition-colors"
                >
                  {language === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder={language === 'ar' ? 'أدخل كلمة المرور الحالية...' : 'Enter your current password...'}
                  className="w-full px-3.5 py-2.5 pr-10 pl-10 border border-slate-200 rounded-xl text-xs text-slate-900 bg-white focus:outline-none focus:border-[#0b5e32] focus:ring-1 focus:ring-[#0b5e32] font-mono transition-all"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1 ${language === 'ar' ? 'left-2.5' : 'right-2.5'}`}
                  title={showOldPassword ? (language === 'ar' ? 'إخفاء' : 'Hide') : (language === 'ar' ? 'إظهار' : 'Show')}
                >
                  {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Admin Contact Notice (if forgotten) */}
            {showForgotNotice && (
              <div className="p-3.5 bg-amber-50/90 border border-amber-200 rounded-2xl text-xs space-y-1.5 animate-in fade-in slide-in-from-top-1 text-slate-800">
                <div className="flex items-center gap-2 text-amber-900 font-extrabold text-[11.5px]">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>
                    {language === 'ar' 
                      ? 'إذا نسيت كلمة المرور، يرجى التواصل مع مدير النظام' 
                      : 'If forgotten, please contact the System Administrator'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {language === 'ar'
                    ? 'بموجب ضوابط أمن البوابة، يمتلك مدير النظام صلاحية إعادة تعيين كلمات المرور لكافة المستخدمين. يرجى التواصل مع مدير النظام لإعادة ضبط كلمة المرور الخاصة بك.'
                    : 'According to portal security regulations, the System Administrator has the authority to reset forgotten passwords for all users. Please reach out to your administrator to reset your password.'}
                </p>
              </div>
            )}

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-700 block font-sans">
                {language === 'ar' ? 'كلمة المرور الجديدة (6 أحرف على الأقل):' : 'New Password (min 6 characters):'}
              </label>

              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={6}
                  placeholder={language === 'ar' ? '••••••••' : '••••••••'}
                  className="w-full px-3.5 py-2.5 pr-10 pl-10 border border-slate-200 rounded-xl text-xs text-slate-900 bg-white focus:outline-none focus:border-[#0b5e32] focus:ring-1 focus:ring-[#0b5e32] font-mono transition-all"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1 ${language === 'ar' ? 'left-2.5' : 'right-2.5'}`}
                  title={showNewPassword ? (language === 'ar' ? 'إخفاء' : 'Hide') : (language === 'ar' ? 'إظهار' : 'Show')}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-extrabold text-slate-700 block font-sans">
                {language === 'ar' ? 'تأكيد كلمة المرور الجديدة:' : 'Confirm New Password:'}
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  minLength={6}
                  placeholder={language === 'ar' ? '••••••••' : '••••••••'}
                  className="w-full px-3.5 py-2.5 pr-10 pl-10 border border-slate-200 rounded-xl text-xs text-slate-900 bg-white focus:outline-none focus:border-[#0b5e32] focus:ring-1 focus:ring-[#0b5e32] font-mono transition-all"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className={`absolute top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1 ${language === 'ar' ? 'left-2.5' : 'right-2.5'}`}
                  title={showConfirmPassword ? (language === 'ar' ? 'إخفاء' : 'Hide') : (language === 'ar' ? 'إظهار' : 'Show')}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Action Buttons */}
            <div className="pt-2 flex gap-2">
              <button
                type="submit"
                disabled={loading || !!success}
                className="flex-1 py-3 bg-[#0b5e32] hover:bg-[#074123] disabled:bg-slate-300 text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>{language === 'ar' ? 'جاري التحديث...' : 'Updating...'}</span>
                  </span>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-amber-300" />
                    <span>{language === 'ar' ? 'حفظ كلمة المرور الجديدة' : 'Save New Password'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
}
