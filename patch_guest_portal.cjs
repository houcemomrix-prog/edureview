const fs = require('fs');
let guestCode = fs.readFileSync('src/components/GuestPortal.tsx', 'utf8');

const hookReplacement = `
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
`;

guestCode = guestCode.replace(/const \[forgotSuccess, setForgotSuccess\] = React\.useState<string \| null>\(null\);/, hookReplacement);

fs.writeFileSync('src/components/GuestPortal.tsx', guestCode);
