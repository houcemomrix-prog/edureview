const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The issue: admin.auth() is not valid in firebase-admin v12+ ESM sometimes, 
// OR it is actually valid but "import * as admin" acts weird with default exports in ESM.
// We can use getAuth from 'firebase-admin/auth'.
code = code.replace(
  "import * as admin from 'firebase-admin';",
  "import * as admin from 'firebase-admin';\nimport { getAuth } from 'firebase-admin/auth';\nimport { getFirestore } from 'firebase-admin/firestore';"
);

// We should replace all admin.auth() with getAuth()
code = code.replace(/admin\.auth\(\)/g, "getAuth()");

// We should replace all admin.firestore() with getFirestore()
code = code.replace(/admin\.firestore\(\)/g, "getFirestore()");

fs.writeFileSync('server.ts', code);
