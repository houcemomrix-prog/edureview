const admin = require('firebase-admin');
const { getAuth } = require('firebase-admin/auth');

admin.initializeApp({
  projectId: require('./firebase-applet-config.json').firebaseProjectID
});
getAuth().listUsers(1).then(() => {
  console.log("SUCCESS");
}).catch(err => {
  console.error("FAILED", err);
});
