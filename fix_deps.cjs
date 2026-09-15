const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const depsToMove = ['esbuild', 'typescript', 'tailwindcss', 'autoprefixer'];

for (const dep of depsToMove) {
  if (pkg.devDependencies[dep]) {
    pkg.dependencies[dep] = pkg.devDependencies[dep];
    delete pkg.devDependencies[dep];
  }
}

fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2));
