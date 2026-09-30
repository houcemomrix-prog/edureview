const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  "import * as admin from 'firebase-admin';",
  "import { initializeApp, cert, getApps } from 'firebase-admin/app';"
);

code = code.replace(
  "if (!admin.apps.length) {",
  "if (!getApps().length) {"
);

code = code.replace(
  "if (!admin.apps.length) {",
  "if (!getApps().length) {"
);

code = code.replace(
  "admin.initializeApp({",
  "initializeApp({"
);

code = code.replace(
  "credential: admin.credential.cert(serviceAccount)",
  "credential: cert(serviceAccount)"
);

fs.writeFileSync('server.ts', code);
