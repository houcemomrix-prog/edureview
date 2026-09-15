const fs = require('fs');
let code = fs.readFileSync('src/components/UserDatabaseView.tsx', 'utf8');

code = code.replace(
  'interface UserDatabaseViewProps {\n  language: Language;\n}',
  'interface UserDatabaseViewProps {\n  language: Language;\n  subjects: string[];\n}'
);

code = code.replace(
  'export function UserDatabaseView({ language }: UserDatabaseViewProps) {',
  'export function UserDatabaseView({ language, subjects }: UserDatabaseViewProps) {'
);

code = code.replace(/CONST_SUBJECTS/g, 'subjects');

// remove CONST_SUBJECTS definition entirely
code = code.replace(/const subjects = \[\s*[\s\S]*?\];/g, '');

fs.writeFileSync('src/components/UserDatabaseView.tsx', code);
