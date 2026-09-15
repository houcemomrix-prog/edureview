const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Remove the import
code = code.replace("import { DocumentViewer } from './components/DocumentViewer';\n", "");

// Restore original wrapper start
code = code.replace(
  '<DocumentViewer language={language} documentWidth={950}>',
  '<div className="overflow-x-auto rounded-3xl border border-slate-300 bg-slate-900/5 p-4 sm:p-6 shadow-inner block text-center">'
);

// Remove the `</DocumentViewer>` that we added
code = code.replace(/<\/DocumentViewer>/g, '');

fs.writeFileSync('src/App.tsx', code);
