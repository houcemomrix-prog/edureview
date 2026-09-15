const fs = require('fs');

function replaceLine(filePath, lineNumber, newContent) {
  let lines = fs.readFileSync(filePath, 'utf8').split('\n');
  lines[lineNumber - 1] = newContent;
  fs.writeFileSync(filePath, lines.join('\n'));
}

replaceLine('src/App.tsx', 5077, '                      </DocumentViewer>');
replaceLine('src/components/SchoolArchiveView.tsx', 2021, '              </DocumentViewer>');
