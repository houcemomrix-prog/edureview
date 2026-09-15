const fs = require('fs');
let content = fs.readFileSync('src/components/SchoolArchiveView.tsx', 'utf8');

// Insert import at the top
if (!content.includes("import { DocumentViewer }")) {
  content = content.replace("import React,", "import { DocumentViewer } from './DocumentViewer';\nimport React,");
}

// Replace wrapper start
content = content.replace(
  '<div className="overflow-x-auto bg-slate-900/5 rounded-3xl p-4 sm:p-6 border border-slate-300 shadow-inner block text-center mb-8">',
  '<DocumentViewer language={language} documentWidth={1000}>'
);

const startStr = 'id="printable-archive-form"';
const startIndex = content.lastIndexOf(startStr);
let depth = 1;

for (let i = startIndex + startStr.length; i < content.length; i++) {
  if (content.substr(i, 4) === '<div') {
    depth++;
  } else if (content.substr(i, 6) === '</div') {
    depth--;
    if (depth === 0) {
      console.log('Ends around line: ', content.substring(0, i).split('\n').length);
      const newContent = content.substring(0, i) + '</div>\n              </DocumentViewer>' + content.substring(i + 6);
      fs.writeFileSync('src/components/SchoolArchiveView.tsx', newContent);
      break;
    }
  }
}
