const fs = require('fs');
let code = fs.readFileSync('src/components/GuestPortal.tsx', 'utf8');

// I also need to remove Step 3 from the UI, because the password reset will be handled by the /reset-password route.
const step3Regex = /\{\/\* Step 3: New Password \*\/\}[\s\S]*?\{\/\* End of forgot mode \*\/\}/g;
code = code.replace(step3Regex, '{/* End of forgot mode */}');

fs.writeFileSync('src/components/GuestPortal.tsx', code);
