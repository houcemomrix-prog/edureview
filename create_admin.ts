import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import * as fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function main() {
  const email = "hossam9866@gmail.om";
  const password = "Skype123@";
  const name = "حسام عمري";

  let userCredential;
  try {
    console.log("Attempting to create user...");
    userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("User created!");
  } catch (err: any) {
    if (err.code === 'auth/email-already-in-use') {
      console.log("User already exists, signing in instead...");
      userCredential = await signInWithEmailAndPassword(auth, email, password);
    } else {
      console.error("Auth error:", err);
      process.exit(1);
    }
  }

  const uid = userCredential.user.uid;
  console.log("User ID:", uid);

  console.log("Setting user profile in Firestore...");
  await setDoc(doc(db, 'users', uid), {
    uid: uid,
    name: name,
    email: email,
    role: 'admin',
    jobTitle: 'مدير النظام',
    createdAt: new Date().toISOString()
  }, { merge: true });

  console.log("Admin setup complete!");
  process.exit(0);
}

main().catch(console.error);
