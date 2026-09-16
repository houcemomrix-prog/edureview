const fs = require('fs');
let code = fs.readFileSync('src/components/GuestPortal.tsx', 'utf8');

// replace supabase import
if (!code.includes("import { auth } from '../services/firebase';")) {
    code = code.replace("import { supabase } from '../supabaseClient';", "import { supabase } from '../supabaseClient';\nimport { auth } from '../services/firebase';\nimport { sendPasswordResetEmail } from 'firebase/auth';");
}

code = code.replace(
    /const \{ error \} = await supabase\.auth\.resetPasswordForEmail\(trimmed, \{\s*redirectTo: 'https:\/\/edureview1\.onrender\.com\/reset-password',\s*\}\);/m,
    `await sendPasswordResetEmail(auth, trimmed, {\n        url: 'https://edureview1.onrender.com/reset-password'\n      });\n      const error = null; // Mock error object to keep downstream logic`
);
fs.writeFileSync('src/components/GuestPortal.tsx', code);
