const fs = require('fs');

function fixSchoolArchiveView() {
  let content = fs.readFileSync('src/components/SchoolArchiveView.tsx', 'utf8');
  if (!content.includes('import { DocumentViewer }')) {
    content = content.replace("import React,", "import { DocumentViewer } from './DocumentViewer';\nimport React,");
  }

  // Find the exact wrapper
  const wrapperRegex = /<div className="overflow-x-auto bg-slate-900\/5[^>]*>/;
  content = content.replace(wrapperRegex, '<DocumentViewer language={language} documentWidth={1000}>');
  
  // Clean up any existing `</DocumentViewer>`
  content = content.replace(/<\/DocumentViewer>/g, '');

  fs.writeFileSync('src/components/SchoolArchiveView.tsx', content);
}
fixSchoolArchiveView();
