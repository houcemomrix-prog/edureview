import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { getFirestore, doc, setDoc, deleteDoc } from 'firebase/firestore';
import * as fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function main() {
  const oldEmail = "hossam9866@gmail.om";
  const newEmail = "hossam9866@moe.om";
  const password = "Skype123@";
  const name = "حسام عمري";

  // 1. Create the new, correct user
  let newCredential;
  try {
    console.log("Creating correct user...");
    newCredential = await createUserWithEmailAndPassword(auth, newEmail, password);
  } catch (err: any) {
    if (err.code === 'auth/email-already-in-use') {
      console.log("Correct user already exists, signing in...");
      newCredential = await signInWithEmailAndPassword(auth, newEmail, password);
    } else {
      console.error("Auth error:", err);
      process.exit(1);
    }
  }

  const newUid = newCredential.user.uid;
  console.log("New User ID:", newUid);

  // 2. Set Firestore doc for the new correct user
  console.log("Setting user profile in Firestore...");
  await setDoc(doc(db, 'users', newUid), {
    uid: newUid,
    name: name,
    email: newEmail,
    role: 'admin',
    jobTitle: 'مدير النظام',
    createdAt: new Date().toISOString()
  }, { merge: true });

  // 3. Delete the old typo user
  try {
    console.log("Cleaning up old incorrect account...");
    const oldCredential = await signInWithEmailAndPassword(auth, oldEmail, password);
    const oldUid = oldCredential.user.uid;
    await deleteDoc(doc(db, 'users', oldUid));
    await deleteUser(oldCredential.user);
    console.log("Old incorrect account deleted.");
  } catch (err: any) {
    console.log("Old account cleanup skipped or already deleted:", err.message);
  }

  console.log("Admin setup complete!");
  process.exit(0);
}

main().catch(console.error);
