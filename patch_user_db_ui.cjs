const fs = require('fs');
let code = fs.readFileSync('src/components/UserDatabaseView.tsx', 'utf8');

const targetButtons = `<button
          type="button"
          onClick={handleOpenAdd}
          className="w-full sm:w-auto px-4 py-2.5 bg-[#051C3F] hover:bg-[#124282] text-white rounded-xl text-xs font-bold font-heading flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md active:scale-95"
          id="btn-add-user"
        >
          <UserPlus className="w-4 h-4 text-amber-400" />
          <span>{language === 'ar' ? 'إضافة مستخدم جديد' : 'Add New Staff'}</span>
        </button>`;

const replacementButtons = `<div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              setResetTargetEmail('');
              setResetNewPassword('');
              setResetStatus({type: 'idle', message: ''});
              setIsResetPasswordModalOpen(true);
            }}
            className="w-full sm:w-auto px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold font-heading flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm active:scale-95"
          >
            <Lock className="w-4 h-4" />
            <span>{language === 'ar' ? 'إعادة تعيين كلمة المرور' : 'Force Reset Password'}</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="w-full sm:w-auto px-4 py-2.5 bg-[#051C3F] hover:bg-[#124282] text-white rounded-xl text-xs font-bold font-heading flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md active:scale-95"
            id="btn-add-user"
          >
            <UserPlus className="w-4 h-4 text-amber-400" />
            <span>{language === 'ar' ? 'إضافة مستخدم جديد' : 'Add New Staff'}</span>
          </button>
        </div>`;

code = code.replace(targetButtons, replacementButtons);

const targetModalEnd = `          </div>
        </div>
      )}`;

const resetModal = `
      {/* RESET PASSWORD MODAL */}
      {isResetPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsResetPasswordModalOpen(false)}></div>
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-heading font-black text-lg text-[#0B1E40]">
                {language === 'ar' ? 'إعادة تعيين كلمة مرور المستخدم' : 'Force Reset User Password'}
              </h3>
              <button
                type="button"
                onClick={() => setIsResetPasswordModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto">
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                {language === 'ar' 
                  ? 'قم بإدخال البريد الإلكتروني للمستخدم وكلمة المرور المؤقتة الجديدة. سيتم تعيينها مباشرة عبر صلاحيات المسؤول ولن يتم إرسال أي بريد إلكتروني.' 
                  : 'Enter the user\\'s email address and a new temporary password. It will be forcefully updated using admin privileges. No email will be sent.'}
              </p>
              
              {resetStatus.type !== 'idle' && (
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
              </form>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace(targetModalEnd, targetModalEnd + resetModal);

fs.writeFileSync('src/components/UserDatabaseView.tsx', code);
