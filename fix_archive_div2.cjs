const fs = require('fs');
let lines = fs.readFileSync('src/components/SchoolArchiveView.tsx', 'utf8').split('\n');

// Find the line that has the extra </div> right before `) : (`
let lineToRemove = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes(') : (') && lines[i-1].includes('</div>')) {
    lineToRemove = i - 1;
    break;
  }
}

if (lineToRemove !== -1) {
  lines.splice(lineToRemove, 1);
  fs.writeFileSync('src/components/SchoolArchiveView.tsx', lines.join('\n'));
}
