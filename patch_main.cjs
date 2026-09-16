const fs = require('fs');
let code = fs.readFileSync('src/main.tsx', 'utf8');

const importReset = `import { ResetPassword } from './components/ResetPassword.tsx';\n`;

// Add conditional rendering
const renderLogic = `
const path = window.location.pathname;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {path === '/reset-password' ? <ResetPassword /> : <App />}
  </StrictMode>,
);
`;

code = importReset + code.replace(/createRoot\(document\.getElementById\('root'\)!\)\.render\([\s\S]*?\);/, renderLogic);

fs.writeFileSync('src/main.tsx', code);
