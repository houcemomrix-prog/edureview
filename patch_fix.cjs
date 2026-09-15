const fs = require('fs');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  // I need to replace `</div>\n                        </DocumentViewer>` with `</DocumentViewer>`
  content = content.replace('</div>\n                        </DocumentViewer>', '</DocumentViewer>');
  content = content.replace('</div>\n              </DocumentViewer>', '</DocumentViewer>');
  fs.writeFileSync(filePath, content);
}

fixFile('src/App.tsx');
fixFile('src/components/SchoolArchiveView.tsx');
