const fs = require('fs');

function deleteLine(filePath, lineNumber) {
  let lines = fs.readFileSync(filePath, 'utf8').split('\n');
  lines.splice(lineNumber - 1, 1);
  fs.writeFileSync(filePath, lines.join('\n'));
}

deleteLine('src/App.tsx', 5076);
