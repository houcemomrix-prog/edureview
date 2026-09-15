import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
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
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    user = cred.user;
    console.log("Created new user:", user.uid);
  } catch (e) {
    if (e.code === 'auth/email-already-in-use') {
      console.log("User already exists, signing in to update profile...");
      const cred = await signInWithEmailAndPassword(auth, email, password);
      user = cred.user;
    } else {
      console.error(e);
      process.exit(1);
    }
  }

  const profileRef = doc(db, 'users', user.uid);
  await setDoc(profileRef, {
    uid: user.uid,
    email: email,
    role: 'admin',
    name: 'Admin',
    jobTitle: 'مدير النظام',
    createdAt: new Date().toISOString()
  }, { merge: true });
  console.log("Profile updated successfully!");
  process.exit(0);
}
seed();
