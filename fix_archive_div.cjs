const fs = require('fs');
let lines = fs.readFileSync('src/components/SchoolArchiveView.tsx', 'utf8').split('\n');
// We need to insert a </div> before line 2021
lines.splice(2020, 0, '                  </div>');
fs.writeFileSync('src/components/SchoolArchiveView.tsx', lines.join('\n'));
