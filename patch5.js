const fs = require('fs');
let code = fs.readFileSync('src/services/db.ts', 'utf8');

code = code.replace(
  /const q = query\(\s*collection\(db, 'teacher_notifications'\),\s*where\('teacherId', '==', teacherId\),\s*orderBy\('createdAt', 'desc'\),\s*limit\(20\)\s*\);/,
  `const q = query(
      collection(db, 'teacher_notifications'),
      where('teacherId', '==', teacherId)
    );`
);

fs.writeFileSync('src/services/db.ts', code);
