const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  'const db = getFirestore();',
  'const db = getFirestore("ai-studio-9a076d22-26fb-4b95-8c95-7ec7c2a1a6c9");'
);

fs.writeFileSync('server.ts', code);
