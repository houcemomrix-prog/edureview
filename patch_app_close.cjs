const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  '                      </div>\n                    </div>\n                    {currentAssessment.feedback && (',
  '                      </DocumentViewer>\n                    </div>\n                    {currentAssessment.feedback && ('
);

fs.writeFileSync('src/App.tsx', code);
