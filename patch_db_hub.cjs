const fs = require('fs');
let code = fs.readFileSync('src/components/DatabasesHubView.tsx', 'utf8');

// The UserDatabaseView requires a 'subjects' prop that DatabasesHubView isn't providing.
// Let's pass the subjects prop to DatabasesHubView and forward it.

code = code.replace(
  "interface DatabasesHubViewProps {\n  language: Language;\n}",
  "interface DatabasesHubViewProps {\n  language: Language;\n  subjects: string[];\n}"
);

code = code.replace(
  "export function DatabasesHubView({ language }: DatabasesHubViewProps) {",
  "export function DatabasesHubView({ language, subjects }: DatabasesHubViewProps) {"
);

code = code.replace(
  "<UserDatabaseView language={language} />",
  "<UserDatabaseView language={language} subjects={subjects} />"
);

fs.writeFileSync('src/components/DatabasesHubView.tsx', code);
