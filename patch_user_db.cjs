const fs = require('fs');
let code = fs.readFileSync('src/components/UserDatabaseView.tsx', 'utf8');

const importLines = `
import { auth } from '../services/firebase';
import { KeyRound, CheckCircle } from 'lucide-react';
`;

code = code.replace("import { UserProfile, UserRole }", importLines + "\nimport { UserProfile, UserRole }");

const widgetState = `
  // Password Reset Widget States
  const [resetSearchEmail, setResetSearchEmail] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  const handleForcePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetSearchEmail.trim() || !resetNewPassword) {
      setResetError('Please enter both email and new password');
      return;
    }
    
    setResetLoading(true);
    setResetError(null);
    setResetSuccess(null);

    try {
      // Get the admin's current token
      const token = await auth.currentUser?.getIdToken();
      
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${token}\`
        },
        body: JSON.stringify({ email: resetSearchEmail.trim(), newPassword: resetNewPassword })
      });

      const data = await response.json();
      
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to change password');
      }

      setResetSuccess(data.message || 'Password successfully updated.');
      setResetSearchEmail('');
      setResetNewPassword('');
    } catch (err: any) {
      setResetError(err.message || 'Error occurred while changing password');
    } finally {
      setResetLoading(false);
    }
  };
`;

code = code.replace("// Form Fields", widgetState + "\n  // Form Fields");

const widgetJSX = `
      {/* Password Reset Widget */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8 mt-6 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl -mr-10 -mt-10 opacity-70 pointer-events-none"></div>
        <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-amber-600" />
          {language === 'ar' ? 'تعيين كلمة مرور مؤقتة (للمسؤولين فقط)' : 'Temporary Password Reset (Admin Only)'}
        </h3>
        
        {resetError && (
          <div className="p-3 mb-4 text-xs font-bold text-red-700 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{resetError}</span>
          </div>
        )}
        
        {resetSuccess && (
          <div className="p-3 mb-4 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-2">
            <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{resetSuccess}</span>
          </div>
        )}

        <form onSubmit={handleForcePasswordReset} className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
              {language === 'ar' ? 'البريد الإلكتروني للمستخدم' : 'User Email'}
            </label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="email" 
                required
                value={resetSearchEmail}
                onChange={(e) => setResetSearchEmail(e.target.value)}
                placeholder="user@moe.om"
                className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                style={{ direction: 'ltr' }}
              />
            </div>
          </div>
          <div className="flex-1 w-full">
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
              {language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
            </label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                required
                minLength={6}
                value={resetNewPassword}
                onChange={(e) => setResetNewPassword(e.target.value)}
                placeholder="NewTempPass123"
                className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                style={{ direction: 'ltr' }}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={resetLoading}
            className="w-full sm:w-auto h-[42px] px-6 bg-[#051C3F] hover:bg-[#031229] text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-70 whitespace-nowrap"
          >
            {resetLoading ? 'جاري التحديث...' : (language === 'ar' ? 'تحديث كلمة المرور' : 'Update Password')}
          </button>
        </form>
      </div>
`;

code = code.replace('{/* Filters & Search Header */}', widgetJSX + '\n\n        {/* Filters & Search Header */}');

fs.writeFileSync('src/components/UserDatabaseView.tsx', code);
