const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "          {activeTab === 'databases' && (\n            <DatabasesHubView\n              language={language}\n            />\n          )}",
  "          {activeTab === 'databases' && (\n            <DatabasesHubView\n              language={language}\n              subjects={SUBJECTS}\n            />\n          )}"
);

fs.writeFileSync('src/App.tsx', code);
