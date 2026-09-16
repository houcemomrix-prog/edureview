import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { ShieldCheck, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [initLoading, setInitLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setShowForm(true);
        }
        setInitLoading(false);
      }
    );
    
    // Fallback to stop loading if no event triggers within a short time
    const timeout = setTimeout(() => setInitLoading(false), 1500);

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess('Password updated successfully. You can now log in.');
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full">
        
        {initLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-4" />
            <p className="text-slate-600 font-medium">Verifying secure link...</p>
          </div>
        ) : !showForm && !success ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Invalid or Expired Link</h2>
            <p className="text-sm text-slate-500 mb-6">
              This password reset link is invalid or has expired. Please request a new one.
            </p>
            <a href="/" className="text-indigo-600 font-bold hover:underline">
              Return to Login
            </a>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-indigo-700" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800">Reset Password</h2>
              <p className="text-sm text-slate-500 mt-2 text-center">
                Enter your new password below.
              </p>
            </div>

            {error && (
              <div className="p-3 mb-4 rounded-lg bg-red-50 text-red-800 border border-red-200 text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-3 mb-4 rounded-lg bg-green-50 text-green-800 border border-green-200 text-sm">
                {success}
              </div>
            )}

            {!success && (
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};
