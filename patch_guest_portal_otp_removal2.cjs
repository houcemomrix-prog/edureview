const fs = require('fs');
let code = fs.readFileSync('src/components/GuestPortal.tsx', 'utf8');

// The replacement was successful, but the OTP form is still there and we need to remove the OTP step from the UI.
// Let's remove the OTP step logic entirely.

// Find Step 2: Code verification
const step2Regex = /\{\/\* Step 2: Code verification \*\/\}[\s\S]*?\{\/\* Step 3: New Password \*\/\}/g;
code = code.replace(step2Regex, '{/* Step 3: New Password */}');

const virtualMailRegex = /\{\/\* Simulated Email \/ Notification Sandbox HUD \*\/\}\n\s*\{generatedCode && forgotPasswordMode && \([\s\S]*?\}\)/g;
code = code.replace(virtualMailRegex, '');

fs.writeFileSync('src/components/GuestPortal.tsx', code);
