import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function seed() {
  const email = "hossam9866@moe.om";
  const password = "Skype123@";
  let user;
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    user = cred.user;
  } catch (e) {
    console.error(e);
    process.exit(1);
  }

  const profileRef = doc(db, 'users', user.uid);
  await setDoc(profileRef, {
    uid: user.uid,
    email: email,
    role: 'admin',
    name: 'حسام عمري',
    jobTitle: 'مدير النظام',
    createdAt: new Date().toISOString()
  }, { merge: true });
  console.log("Profile name updated successfully!");
  process.exit(0);
}
seed();
