const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');
const startStr = '<DocumentViewer';
const startIndex = content.indexOf(startStr);
let depth = 0;
let foundStart = false;

for (let i = startIndex; i < content.length; i++) {
  if (content.substr(i, 4) === '<div') {
    depth++;
    foundStart = true;
  } else if (content.substr(i, 6) === '</div') {
    depth--;
    if (foundStart && depth === 0) {
      console.log('Ends around line: ', content.substring(0, i).split('\n').length);
      console.log(content.substring(i - 150, i + 100));
      break;
    }
  }
}
