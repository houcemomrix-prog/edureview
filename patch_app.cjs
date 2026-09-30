const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /if \(trimmedEmail === 'hossam9866@moe\.om'\) \{[\s\S]*?(?=\/\/ Fallback for custom user email override)/m;

if (regex.test(code)) {
    code = code.replace(regex, '');
    fs.writeFileSync('src/App.tsx', code);
    console.log("Patched App.tsx successfully.");
} else {
    console.log("Could not find the block to replace.");
}
