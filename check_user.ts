import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import * as fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function main() {
  const newEmail = "hossam9866@moe.om";
  const password = "Skype123@";

  try {
    console.log("Trying to sign in...");
    const cred = await signInWithEmailAndPassword(auth, newEmail, password);
    console.log("Sign in successful! UID:", cred.user.uid);
    
    const docRef = doc(db, 'users', cred.user.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log("Firestore Profile:", docSnap.data());
    } else {
      console.log("Firestore profile missing!");
    }
  } catch (err: any) {
    console.error("Sign in failed:", err.message);
  }
  process.exit(0);
}

main();
