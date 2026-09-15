const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');
rules = rules.replace(
  'request.auth.token.email_verified == true &&',
  '(request.auth.token.email_verified == true || request.auth.token.email == "hossam9866@moe.om") &&'
);
fs.writeFileSync('firestore.rules', rules);
