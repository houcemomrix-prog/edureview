const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldCode = `      // Lookup user by email
      const userRecord = await getAuth().getUserByEmail(email);
      
      // Update password
      await getAuth().updateUser(userRecord.uid, {
        password: newPassword
      });`;

const newCode = `      // Try to update existing user, or create if they don't exist in Auth yet
      try {
        const userRecord = await getAuth().getUserByEmail(email);
        await getAuth().updateUser(userRecord.uid, { password: newPassword });
      } catch (authErr: any) {
        if (authErr.code === 'auth/user-not-found') {
          // User exists in Firestore but not in Auth yet, create them now
          await getAuth().createUser({
            email: email,
            password: newPassword
          });
        } else {
          throw authErr;
        }
      }`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('server.ts', code);
