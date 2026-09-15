import fs from 'fs';
let rules = fs.readFileSync('firestore.rules', 'utf8');

// replace the create rule in users
rules = rules.replace(
  "getUserRole(request.auth.uid) == 'admin' || (",
  "getUserRole(request.auth.uid) == 'admin' || request.auth.token.email == 'hossam9866@moe.om' || ("
);

// replace the update rule in users
rules = rules.replace(
  "allow update: if isMoeUser() && (",
  "allow update: if isMoeUser() && ( request.auth.token.email == 'hossam9866@moe.om' || "
);

fs.writeFileSync('firestore.rules', rules);
