const fs = require('fs');
let code = fs.readFileSync('tsconfig.json', 'utf8');

// Enable esModuleInterop to fix the express and path imports
code = code.replace(
  '"compilerOptions": {',
  '"compilerOptions": {\n    "esModuleInterop": true,\n    "allowSyntheticDefaultImports": true,\n    "resolveJsonModule": true,\n    "target": "es2022",'
);

fs.writeFileSync('tsconfig.json', code);
