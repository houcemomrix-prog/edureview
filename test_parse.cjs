const fs = require('fs');

function checkParse(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let opens = (content.match(/<DocumentViewer/g) || []).length;
  let closes = (content.match(/<\/DocumentViewer>/g) || []).length;
  console.log(filePath, 'opens:', opens, 'closes:', closes);
}

checkParse('src/App.tsx');
checkParse('src/components/SchoolArchiveView.tsx');
