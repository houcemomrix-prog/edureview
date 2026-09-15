const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// replace the const SUBJECTS = [...]
code = code.replace(/const SUBJECTS = \[\s*['"][^]*?\];/m, `
import { getSubjectsList, DEFAULT_SUBJECTS } from './services/db';
`);

// add state for subjects inside App
code = code.replace(
  'const [sandbox, setSandbox] = useState<boolean>(isSandboxActive());',
  `const [sandbox, setSandbox] = useState<boolean>(isSandboxActive());
  const [SUBJECTS, setSUBJECTS] = useState<string[]>(DEFAULT_SUBJECTS);
  
  useEffect(() => {
    getSubjectsList().then(list => setSUBJECTS(list)).catch(console.error);
  }, []);`
);

fs.writeFileSync('src/App.tsx', code);
