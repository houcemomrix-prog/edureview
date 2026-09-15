const fs = require('fs');

let lines = fs.readFileSync('src/App.tsx', 'utf8').split('\n');

// 5076 is currently `                      </div>`
// 5077 is currently `                    </div>`
// Wait, I deleted a line, so line numbers changed.
