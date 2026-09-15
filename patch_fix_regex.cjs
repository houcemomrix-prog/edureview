const fs = require('fs');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // It has a redundant </div> before </DocumentViewer> that causes the parsing error.
  content = content.replace(/<\/div>\s*<\/DocumentViewer>/g, '</DocumentViewer>');
  fs.writeFileSync(filePath, content);
}

fixFile('src/App.tsx');
fixFile('src/components/SchoolArchiveView.tsx');
