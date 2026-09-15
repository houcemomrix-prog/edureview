const fs = require('fs');

let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(/const \[guestView, setGuestView\] = useState<'welcome' \| 'login-portal' \| 'admin-portal'>\('login-portal'\);/, `const [guestView, setGuestView] = useState<'welcome' | 'login-portal' | 'admin-portal' | 'forgot-password'>('login-portal');`);
appCode = appCode.replace(/guestView\?: 'welcome' \| 'login-portal' \| 'admin-portal';\s+onSelectGuestView\?: \(view: 'welcome' \| 'login-portal' \| 'admin-portal'\) => void;/, `guestView?: 'welcome' | 'login-portal' | 'admin-portal' | 'forgot-password';\n  onSelectGuestView?: (view: 'welcome' | 'login-portal' | 'admin-portal' | 'forgot-password') => void;`);
fs.writeFileSync('src/App.tsx', appCode);

let headerCode = fs.readFileSync('src/components/Header.tsx', 'utf8');
headerCode = headerCode.replace(/guestView\?: 'welcome' \| 'login-portal' \| 'admin-portal';\s+onSelectGuestView\?: \(view: 'welcome' \| 'login-portal' \| 'admin-portal'\) => void;/, `guestView?: 'welcome' | 'login-portal' | 'admin-portal' | 'forgot-password';\n  onSelectGuestView?: (view: 'welcome' | 'login-portal' | 'admin-portal' | 'forgot-password') => void;`);
fs.writeFileSync('src/components/Header.tsx', headerCode);

