const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const startStr = 'id="ministry-audit-form-preview"';
const startIndex = content.lastIndexOf(startStr);
let depth = 1; // Since we're inside the div already

for (let i = startIndex + startStr.length; i < content.length; i++) {
  if (content.substr(i, 4) === '<div') {
    depth++;
  } else if (content.substr(i, 6) === '</div') {
    depth--;
    if (depth === 0) {
      console.log('Ends around line: ', content.substring(0, i).split('\n').length);
      // Replace this exact </div> with </div></DocumentViewer>
      const newContent = content.substring(0, i) + '</div>\n                        </DocumentViewer>' + content.substring(i + 6);
      fs.writeFileSync('src/App.tsx', newContent);
      break;
    }
  }
}
