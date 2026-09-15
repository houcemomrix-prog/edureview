const fs = require('fs');
let code = fs.readFileSync('src/components/GuestPortal.tsx', 'utf8');

code = code.replace(
  /\/\/ Generate 6-digit verification code\n\s*const code = Math\.floor\(100000 \+ Math\.random\(\) \* 900000\)\.toString\(\);\n\s*setGeneratedCode\(code\);/,
  ''
);

code = code.replace(
  /body: JSON\.stringify\(\{ email: trimmed, code, lang: language \}\)/,
  'body: JSON.stringify({ email: trimmed, lang: language })'
);

code = code.replace(
  /if \(res\.ok && data\.success\) \{/,
  'if (res.ok && data.success) {\n        if (data.code) setGeneratedCode(data.code);'
);

fs.writeFileSync('src/components/GuestPortal.tsx', code);
