const fs = require('fs');
let code = fs.readFileSync('src/components/GuestPortal.tsx', 'utf8');

// I need to make sure supabase is properly imported in GuestPortal.tsx
if (!code.includes("import { supabase } from '../supabaseClient';")) {
  code = "import { supabase } from '../supabaseClient';\n" + code;
}

fs.writeFileSync('src/components/GuestPortal.tsx', code);
