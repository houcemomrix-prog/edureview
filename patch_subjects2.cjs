const fs = require('fs');
let dbCode = fs.readFileSync('src/services/db.ts', 'utf8');
dbCode = dbCode.replace(/doc\(db, 'settings', 'subjects'\)/g, "doc(db, 'form_settings', 'subjects')");
fs.writeFileSync('src/services/db.ts', dbCode);
