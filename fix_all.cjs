const fs = require('fs');

// 1. Fix UserDatabaseView.tsx
let uiCode = fs.readFileSync('src/components/UserDatabaseView.tsx', 'utf8');

// Remove the conflicting handleResetPasswordSubmit I added
const handleResetCode = `  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus({ type: 'loading', message: language === 'ar' ? 'جاري إعادة تعيين كلمة المرور...' : 'Resetting password...' });
    
    try {
      const res = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: resetTargetEmail, newPassword: resetNewPassword })
      });
      const data = await res.json();
      
      if (data.success) {
        setResetStatus({ type: 'success', message: language === 'ar' ? 'تم تعيين كلمة المرور الجديدة بنجاح!' : 'Password successfully updated!' });
        setResetTargetEmail('');
        setResetNewPassword('');
      } else {
        setResetStatus({ type: 'error', message: data.error || 'Failed to reset password' });
      }
    } catch (err: any) {
      setResetStatus({ type: 'error', message: err.message || 'Network error' });
    }
  };`;

uiCode = uiCode.replace(handleResetCode, "");

// Replace the modal form state mappings to use the original ones (resetSearchEmail, resetLoading, etc)
// And I also need to add isResetPasswordModalOpen state back because I deleted it when fixing duplicates!
const stateAdd = `  // Password Reset Widget States
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [resetSearchEmail, setResetSearchEmail] = useState('');`;

uiCode = uiCode.replace(
  "  // Password Reset Widget States\n  const [resetSearchEmail, setResetSearchEmail] = useState('');",
  stateAdd
);

// Update button onClick
uiCode = uiCode.replace(
  `onClick={() => {
              setResetTargetEmail('');
              setResetNewPassword('');
              setResetStatus({type: 'idle', message: ''});
              setIsResetPasswordModalOpen(true);
            }}`,
  `onClick={() => {
              setResetSearchEmail('');
              setResetNewPassword('');
              setResetError(null);
              setResetSuccess(null);
              setIsResetPasswordModalOpen(true);
            }}`
);

// Update modal
const oldModal = `              {resetStatus.type !== 'idle' && (
                <div className={\`mb-4 p-3 rounded-xl text-xs font-bold flex items-center gap-2 \${
                  resetStatus.type === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                  resetStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  'bg-blue-50 text-blue-700 border border-blue-200'
                }\`}>
                  {resetStatus.type === 'error' && <ShieldAlert className="w-4 h-4 shrink-0" />}
                  {resetStatus.type === 'success' && <CheckCircle className="w-4 h-4 shrink-0" />}
                  <span>{resetStatus.message}</span>
                </div>
              )}

              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">
                    {language === 'ar' ? 'البريد الإلكتروني المستهدف' : 'Target Email Address'}
                  </label>
                  <input
                    type="email"
                    required
                    value={resetTargetEmail}
                    onChange={(e) => setResetTargetEmail(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white focus:outline-none focus:border-[#051C3F] font-bold"
                    placeholder="name@moe.om"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">
                    {language === 'ar' ? 'كلمة المرور الجديدة' : 'New Temporary Password'}
                  </label>
                  <input
                    type="text"
                    required
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    minLength={6}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white focus:outline-none focus:border-[#051C3F] font-bold"
                    placeholder="New password (min 6 chars)"
                  />
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={resetStatus.type === 'loading' || resetStatus.type === 'success'}
                    className="w-full py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {resetStatus.type === 'loading' ? (
                      <span className="animate-pulse">{language === 'ar' ? 'جاري المعالجة...' : 'Processing...'}</span>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>{language === 'ar' ? 'تأكيد تغيير كلمة المرور' : 'Confirm Password Change'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>`;

const newModal = `              {resetError && (
                <div className="mb-4 p-3 rounded-xl text-xs font-bold flex items-center gap-2 bg-rose-50 text-rose-700 border border-rose-200">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{resetError}</span>
                </div>
              )}
              {resetSuccess && (
                <div className="mb-4 p-3 rounded-xl text-xs font-bold flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{resetSuccess}</span>
                </div>
              )}

              <form onSubmit={handleForcePasswordReset} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">
                    {language === 'ar' ? 'البريد الإلكتروني المستهدف' : 'Target Email Address'}
                  </label>
                  <input
                    type="email"
                    required
                    value={resetSearchEmail}
                    onChange={(e) => setResetSearchEmail(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white focus:outline-none focus:border-[#051C3F] font-bold"
                    placeholder="name@moe.om"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">
                    {language === 'ar' ? 'كلمة المرور الجديدة' : 'New Temporary Password'}
                  </label>
                  <input
                    type="text"
                    required
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    minLength={6}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white focus:outline-none focus:border-[#051C3F] font-bold"
                    placeholder="New password (min 6 chars)"
                  />
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={resetLoading || !!resetSuccess}
                    className="w-full py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white rounded-xl text-xs font-black transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {resetLoading ? (
                      <span className="animate-pulse">{language === 'ar' ? 'جاري المعالجة...' : 'Processing...'}</span>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>{language === 'ar' ? 'تأكيد تغيير كلمة المرور' : 'Confirm Password Change'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>`;

uiCode = uiCode.replace(oldModal, newModal);
fs.writeFileSync('src/components/UserDatabaseView.tsx', uiCode);


// 2. Fix server.ts route name (change-password instead of reset-password)
let serverCode = fs.readFileSync('server.ts', 'utf8');
serverCode = serverCode.replace('app.post("/api/admin/reset-password",', 'app.post("/api/admin/change-password",');
fs.writeFileSync('server.ts', serverCode);

