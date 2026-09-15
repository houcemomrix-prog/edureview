const fs = require('fs');
let lines = fs.readFileSync('src/App.tsx', 'utf8').split('\n');
lines.splice(5075, 0, '                          </div>');
fs.writeFileSync('src/App.tsx', lines.join('\n'));
