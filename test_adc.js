import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
try {
  if (!getApps().length) {
    initializeApp();
  }
  getAuth().listUsers(1).then(console.log).catch(console.error);
} catch (err) {
  console.error(err);
}
