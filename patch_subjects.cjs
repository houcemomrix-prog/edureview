const fs = require('fs');
let dbCode = fs.readFileSync('src/services/db.ts', 'utf8');

const subjectsCode = `
export const DEFAULT_SUBJECTS = [
  'Arabic Language', 'English Language', 'Mathematics', 
  'Science', 'Physics', 'Chemistry', 'Biology', 
  'Islamic Studies', 'Social Studies', 'Information Technology',
  'Applied Sciences', 'Individual Skills'
];

export async function getSubjectsList(): Promise<string[]> {
  try {
    const docRef = doc(db, 'settings', 'subjects');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data().list) {
      return docSnap.data().list;
    }
    return DEFAULT_SUBJECTS;
  } catch (err) {
    console.error("Error getting subjects:", err);
    return DEFAULT_SUBJECTS;
  }
}

export async function saveSubjectsList(list: string[]): Promise<void> {
  try {
    const docRef = doc(db, 'settings', 'subjects');
    await setDoc(docRef, { list, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    console.error("Error saving subjects:", err);
    throw err;
  }
}
`;

dbCode = dbCode + "\n" + subjectsCode;
fs.writeFileSync('src/services/db.ts', dbCode);
