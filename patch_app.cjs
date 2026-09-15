const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

if (!code.includes("import { DocumentViewer }")) {
  code = code.replace("import React,", "import { DocumentViewer } from './components/DocumentViewer';\nimport React,");
}

code = code.replace(
  '<div className="overflow-x-auto rounded-3xl border border-slate-300 bg-slate-900/5 p-4 sm:p-6 shadow-inner block text-center">',
  '<DocumentViewer language={language} documentWidth={950}>'
);

code = code.replace(
  '                        </div>\n                      </div>\n                    </div>\n                    {currentAssessment.feedback && (',
  '                        </DocumentViewer>\n                      </div>\n                    </div>\n                    {currentAssessment.feedback && ('
);

fs.writeFileSync('src/App.tsx', code);
