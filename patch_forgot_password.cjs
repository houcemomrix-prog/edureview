const fs = require('fs');

// Patch App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
const appReplacement = `
            isSignUpMode={isSignUpMode}
            setIsSignUpMode={setIsSignUpMode}
            forgotPasswordTrigger={guestView === 'forgot-password'}
            setForgotPasswordTrigger={(trigger) => {
              if (!trigger && guestView === 'forgot-password') {
                setGuestView('login-portal');
              }
            }}
`;
appCode = appCode.replace(/isSignUpMode={isSignUpMode}\s+setIsSignUpMode={setIsSignUpMode}/, appReplacement);
fs.writeFileSync('src/App.tsx', appCode);

// Patch GuestPortal.tsx
let guestCode = fs.readFileSync('src/components/GuestPortal.tsx', 'utf8');
const guestReplacement = `
  isSignUpMode: boolean;
  setIsSignUpMode: (mode: boolean) => void;
  forgotPasswordTrigger?: boolean;
  setForgotPasswordTrigger?: (trigger: boolean) => void;
`;
guestCode = guestCode.replace(/isSignUpMode: boolean;\s+setIsSignUpMode: \(mode: boolean\) => void;/, guestReplacement);

const guestReplacement2 = `
  isSignUpMode,
  setIsSignUpMode,
  forgotPasswordTrigger,
  setForgotPasswordTrigger,
  regName,
`;
guestCode = guestCode.replace(/isSignUpMode,\s+setIsSignUpMode,\s+regName,/, guestReplacement2);

const guestReplacement3 = `
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
`;
guestCode = guestCode.replace(/const \[forgotSuccess, setForgotSuccess\] = useState<string \| null>\(null\);/, `const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);\n${guestReplacement3}`);
fs.writeFileSync('src/components/GuestPortal.tsx', guestCode);

// Patch Header.tsx
let headerCode = fs.readFileSync('src/components/Header.tsx', 'utf8');
const headerReplacement = `
  onSwitchSandboxUser,
  authLoading,
  guestView = 'welcome',
  onSelectGuestView,
`;
headerCode = headerCode.replace(/onSwitchSandboxUser,\s+authLoading,\s+guestView = 'welcome',\s+onSelectGuestView,/, headerReplacement.replace(`guestView = 'welcome'`, `guestView = 'welcome'`).replace(`onSelectGuestView,`, `onSelectGuestView,`));

// In Header.tsx we need to change what happens when we click forgot password
const headerReplacement2 = `
                      onClick={() => {
                        if (onSelectGuestView) {
                          onSelectGuestView('forgot-password');
                        }
                        setShowAdminLoginForm(false);
                      }}
`;
headerCode = headerCode.replace(/onClick=\{\(\) => \{\s+if \(onSelectGuestView\) \{\s+onSelectGuestView\('login-portal'\);\s+\}\s+setShowAdminLoginForm\(false\);\s+\}\}/, headerReplacement2);
fs.writeFileSync('src/components/Header.tsx', headerCode);

