const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// The route in express should fallback to index.html to allow SPA routing
// This is already done for dist/index.html in production, but let's check dev mode
