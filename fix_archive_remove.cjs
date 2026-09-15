const fs = require('fs');
let lines = fs.readFileSync('src/components/SchoolArchiveView.tsx', 'utf8').split('\n');
lines.splice(2024, 1);
fs.writeFileSync('src/components/SchoolArchiveView.tsx', lines.join('\n'));
