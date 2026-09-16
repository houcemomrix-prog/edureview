const fs = require('fs');
let code = fs.readFileSync('src/components/GuestPortal.tsx', 'utf8');

// The try/catch for Firebase throws an error rather than returning { error }.
// Let's rewrite handleForgotEmailSubmit properly.

let newFunc = `  const handleForgotEmailSubmit = async () => {
    const trimmed = forgotEmail.trim().toLowerCase();
    
    if (!trimmed) {
      setForgotError(language === 'ar' ? 'يرجى إدخال البريد الإلكتروني.' : 'Please enter your email.');
      return;
    }
    
    setEmailSending(true);
    setForgotError(null);
    setRealEmailSent(null);

    try {
      await sendPasswordResetEmail(auth, trimmed, {
        url: 'https://edureview1.onrender.com/reset-password',
      });
      setForgotError(null);
      setRealEmailSent(true);
      setTimeout(() => {
        setForgotPasswordMode(false);
        setForgotEmail('');
        setRealEmailSent(null);
      }, 5000);
    } catch (err: any) {
      setForgotError(err.message || 'Error sending password reset email');
      setRealEmailSent(false);
    } finally {
      setEmailSending(false);
    }
  };`;

// replace the old one
code = code.replace(/const handleForgotEmailSubmit = async \(\) => \{[\s\S]*?(?=const handleTeacherLogin)/, newFunc + '\n\n  ');

fs.writeFileSync('src/components/GuestPortal.tsx', code);
