const fs = require('fs');

function fixFinal(filePath, startStr) {
  let content = fs.readFileSync(filePath, 'utf8');
  const startIndex = content.lastIndexOf(startStr);
  let depth = 1;

  for (let i = startIndex + startStr.length; i < content.length; i++) {
    if (content.substr(i, 4) === '<div') {
      depth++;
    } else if (content.substr(i, 6) === '</div') {
      depth--;
      if (depth === 0) {
        // We found the closing div of the preview block.
        // The DocumentViewer wrapper needs to be closed AFTER this div.
        
        // Wait, did we already remove `</DocumentViewer>`? Yes, apparently.
        
        const newContent = content.substring(0, i) + '</div>\n                        </DocumentViewer>' + content.substring(i + 6);
        fs.writeFileSync(filePath, newContent);
        break;
      }
    }
  }
}

fixFinal('src/App.tsx', 'id="ministry-audit-form-preview"');
fixFinal('src/components/SchoolArchiveView.tsx', 'id="printable-archive-form"');
