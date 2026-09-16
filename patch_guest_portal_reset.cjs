const fs = require('fs');
let code = fs.readFileSync('src/components/GuestPortal.tsx', 'utf8');

// Import supabase if not already
if (!code.includes('import { supabase } from')) {
    code = code.replace("import { \n  onAuthStateChanged,", "import { supabase } from '../supabaseClient';\nimport { \n  onAuthStateChanged,");
}

// Replace handleForgotEmailSubmit entirely
const newSubmit = `
  const handleForgotEmailSubmit = async () => {
    const trimmed = forgotEmail.trim().toLowerCase();
    
    if (!trimmed) {
      setForgotError(language === 'ar' ? 'يرجى إدخال البريد الإلكتروني.' : 'Please enter your email.');
      return;
    }
    
    setEmailSending(true);
    setForgotError(null);
    setRealEmailSent(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo: 'https://edureview1.onrender.com/reset-password',
      });

      if (error) {
        setForgotError(error.message);
        setRealEmailSent(false);
      } else {
        setRealEmailSent(true);
        setForgotSuccess(language === 'ar'
          ? \`✓ تم إرسال رابط إعادة تعيين كلمة المرور بنجاح إلى: (\${trimmed})! يرجى التحقق من البريد الوارد.\`
          : \`✓ Password reset link successfully sent to: (\${trimmed})! Please check your inbox.\`
        );
      }
    } catch (err: any) {
      console.error("Transmission error: ", err);
      setRealEmailSent(false);
      setForgotError(err.message || 'An error occurred');
    } finally {
      setEmailSending(false);
    }
  };
`;

// RegExp to replace handleForgotEmailSubmit
code = code.replace(/const handleForgotEmailSubmit = async \(\) => \{[\s\S]*?setCopied\(false\);\n    \}\n  \};/, newSubmit.trim());

fs.writeFileSync('src/components/GuestPortal.tsx', code);
