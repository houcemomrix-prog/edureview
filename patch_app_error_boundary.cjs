const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace("import { GuestPortal } from './components/GuestPortal';", "import { GuestPortal } from './components/GuestPortal';\nimport { ErrorBoundary } from './components/ErrorBoundary';");

code = code.replace(
  "{/* MAIN CANVAS CONTENT */}",
  "{/* MAIN CANVAS CONTENT */}\n            <ErrorBoundary>"
);

// We need to close it after the last tab which is activeTab === 'archive'
// Let's just find the end of the <div className="space-y-7 min-w-0"> block.
code = code.replace(
  "          </div>\n        )\n      }\n    </div>\n  );\n}",
  "            </ErrorBoundary>\n          </div>\n        )\n      }\n    </div>\n  );\n}"
);

fs.writeFileSync('src/App.tsx', code);
