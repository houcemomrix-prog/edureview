const fs = require('fs');
let tsconfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
if (!tsconfig.compilerOptions) tsconfig.compilerOptions = {};
tsconfig.compilerOptions.jsx = "react-jsx";
fs.writeFileSync('tsconfig.json', JSON.stringify(tsconfig, null, 2));
