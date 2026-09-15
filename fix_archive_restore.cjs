const fs = require('fs');
let lines = fs.readFileSync('src/components/SchoolArchiveView.tsx', 'utf8').split('\n');

// Restore the div at line 1068
lines.splice(1067, 0, '            </div>');

fs.writeFileSync('src/components/SchoolArchiveView.tsx', lines.join('\n'));
