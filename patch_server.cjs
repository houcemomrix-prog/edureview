const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldRouteStart = `  app.post("/api/admin/change-password", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;`;

const newRouteStart = `  app.post("/api/admin/change-password", async (req, res) => {
    try {
      if (!getApps().length) {
        return res.status(500).json({ 
          success: false, 
          error: "Firebase Admin SDK is not configured.\\n\\nTo use admin features like forced password resets:\\n1. Go to Firebase Console > Project Settings > Service Accounts\\n2. Generate a new private key (JSON)\\n3. Open AI Studio Settings > Secrets\\n4. Add a secret named FIREBASE_SERVICE_ACCOUNT_KEY and paste the entire JSON content as its value." 
        });
      }

      const authHeader = req.headers.authorization;`;

code = code.replace(oldRouteStart, newRouteStart);

fs.writeFileSync('server.ts', code);
