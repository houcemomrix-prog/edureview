const fs = require('fs');
let code = fs.readFileSync('src/components/GuestPortal.tsx', 'utf8');

code = code.replace(
  /<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left max-w-4xl mx-auto font-sans">/,
  `<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left max-w-4xl mx-auto font-sans" id="guest-portal-container">`
);

fs.writeFileSync('src/components/GuestPortal.tsx', code);
