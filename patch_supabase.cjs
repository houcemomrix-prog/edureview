const fs = require('fs');
let code = fs.readFileSync('src/supabaseClient.ts', 'utf8');

code = code.replace(
  "const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';",
  "let supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';\n\n// Ensure the URL does not include /rest/v1 so auth endpoints resolve correctly\nif (supabaseUrl.endsWith('/rest/v1')) {\n  supabaseUrl = supabaseUrl.replace('/rest/v1', '');\n} else if (supabaseUrl.endsWith('/rest/v1/')) {\n  supabaseUrl = supabaseUrl.replace('/rest/v1/', '');\n}"
);

fs.writeFileSync('src/supabaseClient.ts', code);
