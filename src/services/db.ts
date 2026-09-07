import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query, 
  where,
  serverTimestamp,
  Timestamp,
  onSnapshot
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { OMAN_WUSTA_SCHOOLS } from '../data/schoolsData';
import { db, auth, OperationType, handleFirestoreError, storage } from './firebase';
import { UserProfile, Assessment, ActivityLog, AssessmentStatus, ArchivedForm, FormDesignSettings, SchoolDoc, SchoolReport } from '../types';

let sandboxListeners: Array<(uid: string, profile: UserProfile | null) => void> = [];

export function subscribeToUserProfile(uid: string, onUpdate: (profile: UserProfile | null) => void): () => void {
  if (isSandboxActive()) {
    const users = getSandboxData<Record<string, UserProfile>>(SANDBOX_USERS_KEY, INITIAL_SANDBOX_USERS);
    onUpdate(users[uid] || null);

    const listener = (eventUid: string, updatedProfile: UserProfile | null) => {
      if (eventUid === uid) {
        onUpdate(updatedProfile);
      }
    };
    sandboxListeners.push(listener);

    return () => {
      sandboxListeners = sandboxListeners.filter(l => l !== listener);
    };
  }

  return onSnapshot(
    doc(db, 'users', uid),
    (snapshot) => {
      if (!snapshot.exists()) {
        onUpdate(null);
        return;
      }
      const data = snapshot.data();
      let createdAt = new Date().toISOString();
      if (data.createdAt && typeof data.createdAt.toDate === 'function') {
        createdAt = data.createdAt.toDate().toISOString();
      } else if (data.createdAt) {
        createdAt = new Date(data.createdAt).toISOString();
      }

      onUpdate({
        uid: data.uid,
        name: data.name,
        email: data.email,
        role: data.role,
        schoolName: data.schoolName,
        subject: data.subject,
        phoneNumber: data.phoneNumber,
        roleType: data.roleType,
        gradesTaught: data.gradesTaught,
        appointmentYear: data.appointmentYear,
        wilaya: data.wilaya,
        directorate: data.directorate,
        jobTitle: data.jobTitle,
        createdAt
      });
    },
    (error) => {
      console.error("Firestore real-time profile subscription error:", error);
    }
  );
}

// Check if running in Sandbox Mode
export function isSandboxActive(): boolean {
  const stored = localStorage.getItem('oman_moe_sandbox_active');
  return stored !== 'false'; // Defaults to true for instant preview in sandboxed environments
}

export function setSandboxActive(active: boolean) {
  localStorage.setItem('oman_moe_sandbox_active', String(active));
}

// --- SANDBOX DATABASE (Local Storage Backed) ---
const SANDBOX_USERS_KEY = 'oman_moe_sandbox_users';
const SANDBOX_ASSESSMENTS_KEY = 'oman_moe_sandbox_assessments';
const SANDBOX_LOGS_KEY = 'oman_moe_sandbox_logs';

const INITIAL_SANDBOX_USERS: Record<string, UserProfile> = {
  'demo-school-1': {
    uid: 'demo-school-1',
    name: 'Al-Azaiba Basic Education School',
    email: 'azaiba.school@moe.om',
    role: 'school',
    schoolName: 'Al-Azaiba School',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString()
  },
  'demo-teacher-1': {
    uid: 'demo-teacher-1',
    name: 'Dr. Fatma Al-Siyabi',
    email: 'fatma.teacher@moe.om',
    role: 'school',
    roleType: 'teacher',
    schoolName: 'Al-Azaiba Basic Education School',
    subject: 'Science',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString()
  },
  'demo-mod-1': {
    uid: 'demo-mod-1',
    name: 'Salem Al-Harthy',
    email: 'salem.alharthy@moe.om',
    role: 'moderator',
    jobTitle: 'مدقق',
    directorate: 'المديرية العامة للتربية والتعليم بمحافظة الوسطى',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString()
  },
  'demo-admin-1': {
    uid: 'demo-admin-1',
    name: 'Khalid Al-Amri',
    email: 'admin@moe.om',
    role: 'admin',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString()
  }
};

const INITIAL_SANDBOX_ASSESSMENTS: Assessment[] = [];

const INITIAL_SANDBOX_LOGS: ActivityLog[] = [];

function getSandboxData<T>(key: string, initial: T): T {
  let dataStr = localStorage.getItem(key);
  if (!dataStr) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  try {
    if (key === SANDBOX_ASSESSMENTS_KEY || key === SANDBOX_ARCHIVED_FORMS_KEY) {
      const resetKey = 'oman_moe_sandbox_assessments_reset_v9';
      if (!localStorage.getItem(resetKey)) {
        localStorage.setItem(resetKey, 'true');
        localStorage.setItem(SANDBOX_ASSESSMENTS_KEY, JSON.stringify([]));
        localStorage.setItem(SANDBOX_LOGS_KEY, JSON.stringify([]));
        localStorage.setItem(SANDBOX_ARCHIVED_FORMS_KEY, JSON.stringify([]));
        return [] as unknown as T;
      }
    }

    let parsed = JSON.parse(dataStr);
    if (Array.isArray(parsed)) {
      // Keep only exact demo seed IDs if present
      const demoIds = ['test-math-grade10', 'quiz-science-grade7', 'quiz-english-grade9', 'archived_demo_1'];
      const filtered = parsed.filter((item: any) => {
        if (!item) return false;
        if (demoIds.includes(item.id)) return false;
        return true;
      });
      if (filtered.length !== parsed.length) {
        localStorage.setItem(key, JSON.stringify(filtered));
        return filtered as unknown as T;
      }
    }
    return parsed as T;
  } catch (e) {
    return initial;
  }
}

function setSandboxData<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

// --- DATABASE OPERATIONS DISPATCHER ---

export async function createUserProfile(profile: UserProfile): Promise<void> {
  if (isSandboxActive()) {
    const users = getSandboxData<Record<string, UserProfile>>(SANDBOX_USERS_KEY, INITIAL_SANDBOX_USERS);
    users[profile.uid] = profile;
    setSandboxData(SANDBOX_USERS_KEY, users);
    sandboxListeners.forEach(listener => listener(profile.uid, profile));
    return;
  }

  const path = `users/${profile.uid}`;
  try {
    const docData: any = {
      uid: profile.uid,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      schoolName: profile.schoolName || '',
      createdAt: profile.createdAt ? profile.createdAt : serverTimestamp()
    };
    if (profile.subject) docData.subject = profile.subject;
    if (profile.phoneNumber) docData.phoneNumber = profile.phoneNumber;
    if (profile.roleType) docData.roleType = profile.roleType;
    if (profile.gradesTaught) docData.gradesTaught = profile.gradesTaught;
    if (profile.appointmentYear) docData.appointmentYear = profile.appointmentYear;
    if (profile.wilaya) docData.wilaya = profile.wilaya;
    if (profile.directorate) docData.directorate = profile.directorate;
    if (profile.jobTitle) docData.jobTitle = profile.jobTitle;

    await setDoc(doc(db, 'users', profile.uid), docData);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (isSandboxActive()) {
    const users = getSandboxData<Record<string, UserProfile>>(SANDBOX_USERS_KEY, INITIAL_SANDBOX_USERS);
    return users[uid] || null;
  }

  const path = `users/${uid}`;
  try {
    const s = await getDoc(doc(db, 'users', uid));
    if (!s.exists()) return null;
    const data = s.data();
    
    // Parse timestamp
    let createdAt = new Date().toISOString();
    if (data.createdAt && typeof data.createdAt.toDate === 'function') {
      createdAt = data.createdAt.toDate().toISOString();
    } else if (data.createdAt) {
      createdAt = new Date(data.createdAt).toISOString();
    }

    return {
      uid: data.uid,
      name: data.name,
      email: data.email,
      role: data.role,
      schoolName: data.schoolName,
      subject: data.subject,
      phoneNumber: data.phoneNumber,
      roleType: data.roleType,
      gradesTaught: data.gradesTaught,
      appointmentYear: data.appointmentYear,
      wilaya: data.wilaya,
      directorate: data.directorate,
      jobTitle: data.jobTitle,
      createdAt
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export async function updateUserProfileSubject(uid: string, subject: string): Promise<void> {
  if (isSandboxActive()) {
    const users = getSandboxData<Record<string, UserProfile>>(SANDBOX_USERS_KEY, INITIAL_SANDBOX_USERS);
    if (users[uid]) {
      users[uid].subject = subject;
      setSandboxData(SANDBOX_USERS_KEY, users);
      sandboxListeners.forEach(listener => listener(uid, users[uid]));
    }
    return;
  }

  const path = `users/${uid}`;
  try {
    await updateDoc(doc(db, 'users', uid), {
      subject: subject
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getAllUserProfiles(): Promise<UserProfile[]> {
  if (isSandboxActive()) {
    const users = getSandboxData<Record<string, UserProfile>>(SANDBOX_USERS_KEY, INITIAL_SANDBOX_USERS);
    return Object.values(users).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  const path = 'users';
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const results: UserProfile[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      let createdAtStr = new Date().toISOString();
      if (data.createdAt && typeof data.createdAt.toDate === 'function') {
        createdAtStr = data.createdAt.toDate().toISOString();
      } else if (data.createdAt) {
        createdAtStr = new Date(data.createdAt).toISOString();
      }
      results.push({
        uid: doc.id,
        name: data.name || '',
        email: data.email || '',
        role: data.role || 'school',
        schoolName: data.schoolName || '',
        subject: data.subject || '',
        phoneNumber: data.phoneNumber || '',
        roleType: data.roleType || 'administrative',
        gradesTaught: data.gradesTaught || [],
        appointmentYear: data.appointmentYear || '',
        wilaya: data.wilaya || '',
        directorate: data.directorate || '',
        jobTitle: data.jobTitle,
        createdAt: createdAtStr
      });
    });
    return results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function deleteUserProfileAdmin(uid: string): Promise<void> {
  if (isSandboxActive()) {
    const users = getSandboxData<Record<string, UserProfile>>(SANDBOX_USERS_KEY, INITIAL_SANDBOX_USERS);
    delete users[uid];
    setSandboxData(SANDBOX_USERS_KEY, users);
    sandboxListeners.forEach(listener => listener(uid, null));
    return;
  }

  const path = `users/${uid}`;
  try {
    await deleteDoc(doc(db, 'users', uid));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function uploadAssessment(assessment: Omit<Assessment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  if (isSandboxActive()) {
    const assessments = getSandboxData<Assessment[]>(SANDBOX_ASSESSMENTS_KEY, INITIAL_SANDBOX_ASSESSMENTS);
    const newId = 'assessment_' + Math.random().toString(36).substr(2, 9);
    const newAss: Assessment = {
      ...assessment,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    assessments.push(newAss);
    setSandboxData(SANDBOX_ASSESSMENTS_KEY, assessments);

    // Create log
    await createActivityLog({
      id: 'log_' + Math.random().toString(36).substr(2, 9),
      assessmentId: newId,
      action: 'Created',
      userId: assessment.schoolId,
      userName: assessment.schoolName,
      userRole: 'school',
      comment: `Uploaded student ${assessment.type} paper: "${assessment.title}" for subject: ${assessment.subject}`,
      createdAt: new Date().toISOString()
    });

    return newId;
  }

  const path = 'assessments';
  try {
    const docRef = await addDoc(collection(db, 'assessments'), {
      title: assessment.title,
      type: assessment.type,
      grade: assessment.grade,
      subject: assessment.subject,
      description: assessment.description,
      questions: assessment.questions,
      keyAnswer: assessment.keyAnswer,
      status: 'Pending',
      schoolId: assessment.schoolId,
      schoolName: assessment.schoolName,
      schoolEmail: assessment.schoolEmail,
      moderatorId: null,
      moderatorName: null,
      feedback: '',
      isPdf: (assessment as any).isPdf || false,
      pdfName: (assessment as any).pdfName || null,
      pdfSize: (assessment as any).pdfSize || null,
      pdfData: (assessment as any).pdfData || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // If PDF is supplied and is in base64 DataURL format, upload it to real Firebase Storage
    const rawPdfData = (assessment as any).pdfData;
    if (rawPdfData && rawPdfData.startsWith('data:')) {
      try {
        const fileRef = ref(storage, `assessments/${docRef.id}/${(assessment as any).pdfName || 'continuous_assessment.pdf'}`);
        await uploadString(fileRef, rawPdfData, 'data_url');
        const downloadUrl = await getDownloadURL(fileRef);
        
        // Update document with the clean storage URL
        await updateDoc(docRef, { pdfData: downloadUrl });
      } catch (storageErr) {
        console.warn("Could not save to Firebase Storage, falling back to Base64 in Firestore", storageErr);
      }
    }

    // Create log
    await createActivityLog({
      id: '',
      assessmentId: docRef.id,
      action: 'Created',
      userId: assessment.schoolId,
      userName: assessment.schoolName,
      userRole: 'school',
      comment: `Uploaded student ${assessment.type} paper: "${assessment.title}". Subject: ${assessment.subject}`,
      createdAt: new Date().toISOString()
    });

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return '';
  }
}

export async function getAssessments(userProfile: UserProfile): Promise<Assessment[]> {
  if (isSandboxActive()) {
    const assessments = getSandboxData<Assessment[]>(SANDBOX_ASSESSMENTS_KEY, INITIAL_SANDBOX_ASSESSMENTS);
    if (userProfile.role === 'school') {
      if (userProfile.roleType === 'administrative') {
        const mySchool = (userProfile.schoolName || '').toLowerCase().trim();
        return assessments.filter(a => 
          a.schoolId === userProfile.uid || 
          (a.schoolName && a.schoolName.toLowerCase().trim() === mySchool) ||
          (a.schoolName && mySchool.includes(a.schoolName.toLowerCase().trim())) ||
          (userProfile.schoolName && a.schoolName && userProfile.schoolName.toLowerCase().trim().includes(a.schoolName.toLowerCase().trim()))
        ).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
      }
      return assessments.filter(a => a.schoolId === userProfile.uid)
        .sort((a,b) => b.createdAt.localeCompare(a.createdAt));
    }
    
    if (userProfile.role === 'moderator') {
      const targetSubject = (userProfile.subject || '').toLowerCase().trim();
      const isUniversal = !targetSubject || targetSubject === 'all subjects' || targetSubject === 'all' || targetSubject === 'جميع المواد';
      if (isUniversal) {
        return assessments.sort((a,b) => b.createdAt.localeCompare(a.createdAt));
      }
      return assessments.filter(a => 
        a.subject && a.subject.toLowerCase().trim() === targetSubject
      ).sort((a,b) => b.createdAt.localeCompare(a.createdAt));
    }
    
    return assessments.sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  }

  const path = 'assessments';
  try {
    let q;
    if (userProfile.role === 'school') {
      if (userProfile.roleType === 'administrative') {
        q = query(collection(db, 'assessments'));
      } else {
        q = query(collection(db, 'assessments'), where('schoolId', '==', userProfile.uid));
      }
    } else {
      q = query(collection(db, 'assessments'));
    }

    const querySnapshot = await getDocs(q);
    const results: Assessment[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as any;
      
      let createdAtStr = new Date().toISOString();
      let updatedAtStr = new Date().toISOString();

      if (data.createdAt && typeof data.createdAt.toDate === 'function') {
        createdAtStr = data.createdAt.toDate().toISOString();
      } else if (data.createdAt) {
        createdAtStr = new Date(data.createdAt).toISOString();
      }

      if (data.updatedAt && typeof data.updatedAt.toDate === 'function') {
        updatedAtStr = data.updatedAt.toDate().toISOString();
      } else if (data.updatedAt) {
        updatedAtStr = new Date(data.updatedAt).toISOString();
      }

      results.push({
        id: doc.id,
        title: data.title,
        type: data.type,
        grade: data.grade,
        subject: data.subject,
        description: data.description,
        questions: data.questions,
        keyAnswer: data.keyAnswer,
        status: data.status,
        schoolId: data.schoolId,
        schoolName: data.schoolName,
        schoolEmail: data.schoolEmail,
        moderatorId: data.moderatorId,
        moderatorName: data.moderatorName,
        feedback: data.feedback,
        isPdf: data.isPdf || false,
        pdfName: data.pdfName || null,
        pdfSize: data.pdfSize || null,
        pdfData: data.pdfData || null,
        createdAt: createdAtStr,
        updatedAt: updatedAtStr
      });
    });

    if (userProfile.role === 'school') {
      if (userProfile.roleType === 'administrative') {
        const mySchool = (userProfile.schoolName || '').toLowerCase().trim();
        return results.filter(a => 
          a.schoolId === userProfile.uid || 
          (a.schoolName && a.schoolName.toLowerCase().trim() === mySchool) ||
          (a.schoolName && mySchool.includes(a.schoolName.toLowerCase().trim())) ||
          (userProfile.schoolName && a.schoolName && userProfile.schoolName.toLowerCase().trim().includes(a.schoolName.toLowerCase().trim()))
        ).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      } else {
        return results.filter(a => a.schoolId === userProfile.uid).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      }
    }

    if (userProfile.role === 'moderator') {
      const targetSubject = (userProfile.subject || '').toLowerCase().trim();
      const isUniversal = !targetSubject || targetSubject === 'all subjects' || targetSubject === 'all' || targetSubject === 'جميع المواد';
      if (isUniversal) {
        return results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      }
      return results.filter(a => 
        a.subject && a.subject.toLowerCase().trim() === targetSubject
      ).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }

    // Sort client-side to avoid composite indexing errors in Firebase
    return results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function editAssessment(assessmentId: string, updates: Partial<Assessment>, userProfile: UserProfile): Promise<void> {
  if (isSandboxActive()) {
    const assessments = getSandboxData<Assessment[]>(SANDBOX_ASSESSMENTS_KEY, INITIAL_SANDBOX_ASSESSMENTS);
    const idx = assessments.findIndex(a => a.id === assessmentId);
    if (idx !== -1) {
      assessments[idx] = {
        ...assessments[idx],
        ...updates,
        status: 'Pending', // Force reset status to Pending upon school edit
        updatedAt: new Date().toISOString()
      };
      setSandboxData(SANDBOX_ASSESSMENTS_KEY, assessments);

      // Create log
      await createActivityLog({
        id: 'log_' + Math.random().toString(36).substr(2, 9),
        assessmentId,
        action: 'Updated',
        userId: userProfile.uid,
        userName: userProfile.name,
        userRole: userProfile.role,
        comment: 'Modified and resubmitted assessment draft for moderation review.',
        createdAt: new Date().toISOString()
      });
    }
    return;
  }

  const path = `assessments/${assessmentId}`;
  try {
    await updateDoc(doc(db, 'assessments', assessmentId), {
      title: updates.title,
      type: updates.type,
      grade: updates.grade,
      subject: updates.subject,
      description: updates.description,
      questions: updates.questions,
      keyAnswer: updates.keyAnswer,
      status: 'Pending', // Force back to Pending upon revision by school
      updatedAt: serverTimestamp()
    });

    // Log the change
    await createActivityLog({
      id: '',
      assessmentId,
      action: 'Updated',
      userId: userProfile.uid,
      userName: userProfile.name,
      userRole: userProfile.role,
      comment: 'Modified and resubmitted assessment paper.',
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function claimAssessment(assessmentId: string, moderatorProfile: UserProfile): Promise<void> {
  if (isSandboxActive()) {
    const assessments = getSandboxData<Assessment[]>(SANDBOX_ASSESSMENTS_KEY, INITIAL_SANDBOX_ASSESSMENTS);
    const idx = assessments.findIndex(a => a.id === assessmentId);
    if (idx !== -1) {
      assessments[idx] = {
        ...assessments[idx],
        status: 'In Progress',
        moderatorId: moderatorProfile.uid,
        moderatorName: moderatorProfile.name,
        updatedAt: new Date().toISOString()
      };
      setSandboxData(SANDBOX_ASSESSMENTS_KEY, assessments);

      // Log action
      await createActivityLog({
        id: 'log_' + Math.random().toString(36).substr(2, 9),
        assessmentId,
        action: 'Claimed',
        userId: moderatorProfile.uid,
        userName: moderatorProfile.name,
        userRole: 'moderator',
        comment: 'Assigned test key to self for moderation check.',
        createdAt: new Date().toISOString()
      });
    }
    return;
  }

  const path = `assessments/${assessmentId}`;
  try {
    await updateDoc(doc(db, 'assessments', assessmentId), {
      status: 'In Progress',
      moderatorId: moderatorProfile.uid,
      moderatorName: moderatorProfile.name,
      updatedAt: serverTimestamp()
    });

    await createActivityLog({
      id: '',
      assessmentId,
      action: 'Claimed',
      userId: moderatorProfile.uid,
      userName: moderatorProfile.name,
      userRole: 'moderator',
      comment: 'Claimed assessment paper for review.',
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function submitModerationReview(
  assessmentId: string, 
  status: 'Approved' | 'Revision Request' | 'Grade Revision', 
  feedback: string, 
  moderatorProfile: UserProfile
): Promise<void> {
  if (isSandboxActive()) {
    const assessments = getSandboxData<Assessment[]>(SANDBOX_ASSESSMENTS_KEY, INITIAL_SANDBOX_ASSESSMENTS);
    const idx = assessments.findIndex(a => a.id === assessmentId);
    if (idx !== -1) {
      assessments[idx] = {
        ...assessments[idx],
        status,
        feedback,
        updatedAt: new Date().toISOString()
      };
      setSandboxData(SANDBOX_ASSESSMENTS_KEY, assessments);

      // Log action
      await createActivityLog({
        id: 'log_' + Math.random().toString(36).substr(2, 9),
        assessmentId,
        action: status === 'Approved' ? 'Approved' : status === 'Grade Revision' ? 'Grade Revision' : 'Revision Requested',
        userId: moderatorProfile.uid,
        userName: moderatorProfile.name,
        userRole: 'moderator',
        comment: feedback,
        createdAt: new Date().toISOString()
      });
    }
    return;
  }

  const path = `assessments/${assessmentId}`;
  try {
    await updateDoc(doc(db, 'assessments', assessmentId), {
      status,
      feedback,
      updatedAt: serverTimestamp()
    });

    await createActivityLog({
      id: '',
      assessmentId,
      action: status === 'Approved' ? 'Approved' : status === 'Grade Revision' ? 'Grade Revision' : 'Revision Requested',
      userId: moderatorProfile.uid,
      userName: moderatorProfile.name,
      userRole: 'moderator',
      comment: feedback,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function createActivityLog(log: Omit<ActivityLog, 'id' | 'createdAt'> & { id?: string; createdAt?: string }): Promise<void> {
  if (isSandboxActive()) {
    const logs = getSandboxData<ActivityLog[]>(SANDBOX_LOGS_KEY, INITIAL_SANDBOX_LOGS);
    logs.push({
      ...log,
      id: 'log_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    });
    setSandboxData(SANDBOX_LOGS_KEY, logs);
    return;
  }

  const path = `assessments/${log.assessmentId}/logs`;
  try {
    await addDoc(collection(db, 'assessments', log.assessmentId, 'logs'), {
      assessmentId: log.assessmentId,
      action: log.action,
      userId: log.userId,
      userName: log.userName,
      userRole: log.userRole,
      comment: log.comment || '',
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function getActivityLogs(assessmentId: string): Promise<ActivityLog[]> {
  if (isSandboxActive()) {
    const logs = getSandboxData<ActivityLog[]>(SANDBOX_LOGS_KEY, INITIAL_SANDBOX_LOGS);
    return logs.filter(l => l.assessmentId === assessmentId)
      .sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  }

  const path = `assessments/${assessmentId}/logs`;
  try {
    const q = collection(db, 'assessments', assessmentId, 'logs');
    const querySnapshot = await getDocs(q);
    const results: ActivityLog[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      let createdAtStr = new Date().toISOString();
      if (data.createdAt && typeof data.createdAt.toDate === 'function') {
        createdAtStr = data.createdAt.toDate().toISOString();
      } else if (data.createdAt) {
        createdAtStr = new Date(data.createdAt).toISOString();
      }

      results.push({
        id: doc.id,
        assessmentId: data.assessmentId,
        action: data.action,
        userId: data.userId,
        userName: data.userName,
        userRole: data.userRole,
        comment: data.comment,
        createdAt: createdAtStr
      });
    });

    return results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

// --- ARCHIVED FORMS DB OPERATIONS ---
const SANDBOX_ARCHIVED_FORMS_KEY = 'oman_moe_sandbox_archived_forms';

const INITIAL_SANDBOX_ARCHIVED_FORMS: ArchivedForm[] = [
  {
    id: 'archive_demo_step2_pending_teacher',
    assessmentId: 'asmt_arab_g10_q1',
    assessmentTitle: 'استمارة الفحص والتدقيق المستمر - اختبار قصير 1 (اللغة العربية)',
    assessmentType: 'test',
    grade: 'الصف العاشر',
    subject: 'اللغة العربية',
    schoolName: 'مدرسة صوقرة للتعليم الأساسي (5-12)',
    schoolId: 'school_soqra',
    teacherName: 'أ. سالم بن سعيد الوهيبي',
    teacherFileNo: '96891234567',
    appointmentYear: '2018',
    directorate: 'المديرية العامة للتربية والتعليم بمحافظة الوسطى',
    visitDate: '2025-02-15',
    subjectName: 'اللغة العربية',
    academicYear: '2024/2025',
    semester: 'الفصل الدراسي الثاني',
    suggestedDevelopment: 'التركيز على مهارات التحليل البلاغي وتطوير الأنشطة التمايزية لمراعاة الفروق الفردية للطلبة.',
    examinerName: 'أ. سالم بن راشد الهنائي',
    principalName: 'أ. محمد بن راشد الجنيبي',
    students: [
      { name: 'محمد بن سالم الجنيبي', level: 'اختبار قصير 1', mark: '10', notes: 'مطابق للشروط فنيًا' },
      { name: 'عبدالله بن ناصر الحرسوسي', level: 'اختبار قصير 1', mark: '9.5', notes: 'مطابق للشروط فنيًا' },
      { name: 'سعيد بن مبارك الوهيبي', level: 'اختبار قصير 1', mark: '8.5', notes: 'مطابق للشروط فنيًا' },
      { name: 'أحمد بن علي الشكيلي', level: 'اختبار قصير 1', mark: '9', notes: 'مطابق للشروط فنيًا' },
      { name: 'عمر بن خالد المهرى', level: 'اختبار قصير 1', mark: '10', notes: 'مطابق للشروط فنيًا' }
    ],
    observations: [
      { element: 'بند مطابقة أدوات التقويم وتوزيع الدرجات', gradeClass: 'الصف العاشر', tool: 'اختبار قصير', status: 'مطابق للشروط فنيًا', notes: 'الدرجات مرصودة طبقاً للوثيقة التقويمية المعتمدة' },
      { element: 'بند معالجة الفروق الفردية ودقة التصحيح', gradeClass: 'الصف العاشر', tool: 'اختبار قصير', status: 'مطابق للشروط فنيًا', notes: 'تمت مراجعة عينة الطلاب وتطابق الدرجات' }
    ],
    // Step 1: Prepared & Signed by Auditor
    isExaminerSigned: true,
    examinerSignedAt: '2025-02-15T09:30:00.000Z',
    examinerSignedName: 'أ. سالم بن راشد الهنائي',
    examinerSignatureQrData: 'OM-AUD-9F42-7K11',
    examinerSignatureStampUrl: 'Examiner verified electronically',
    conformanceStatus: 'conforming',
    hasGradeRevisions: false,
    // Step 2: Awaiting Teacher Signature
    isTeacherSigned: false,
    // Step 3: Awaiting Principal Signature & Stamp
    isSigned: false,
    createdAt: '2025-02-15T09:30:00.000Z',
    updatedAt: '2025-02-15T09:30:00.000Z'
  },
  {
    id: 'archive_demo_step3_pending_principal',
    assessmentId: 'asmt_math_g9_hw',
    assessmentTitle: 'استمارة الفحص والتدقيق المستمر - واجبات وتطبيقات (الرياضيات)',
    assessmentType: 'quiz',
    grade: 'الصف التاسع',
    subject: 'الرياضيات',
    schoolName: 'مدرسة الكحل للتعليم الأساسي (1-12)',
    schoolId: 'school_kuhl',
    teacherName: 'أ. منى بنت عبدالله الوهيبية',
    teacherFileNo: '96892345678',
    appointmentYear: '2019',
    directorate: 'المديرية العامة للتربية والتعليم بمحافظة الوسطى',
    visitDate: '2025-02-14',
    subjectName: 'الرياضيات',
    academicYear: '2024/2025',
    semester: 'الفصل الدراسي الثاني',
    suggestedDevelopment: 'تعزيز حل المشكلات الهندسية باستخدام البرمجيات التفاعلية وإشراك أولياء الأمور.',
    examinerName: 'أ. سالم بن راشد الهنائي',
    principalName: 'أ. سعيد بن مسلم الجنيبي',
    students: [
      { name: 'فاطمة بنت سالم الجنيبية', level: 'واجب 1', mark: '5', notes: 'مطابق للشروط فنيًا' },
      { name: 'مريم بنت راشد الحرسوسية', level: 'واجب 1', mark: '5', notes: 'مطابق للشروط فنيًا' },
      { name: 'شيخة بنت حمد الوهيبية', level: 'واجب 1', mark: '4.5', notes: 'مطابق للشروط فنيًا' },
      { name: 'هدى بنت علي العامرية', level: 'واجب 1', mark: '5', notes: 'مطابق للشروط فنيًا' }
    ],
    observations: [
      { element: 'سلامة احتساب درجات الواجبات والتطبيقات', gradeClass: 'الصف التاسع', tool: 'واجب', status: 'مطابق للشروط فنيًا', notes: 'مطابقة تامة لتعليمات التقويم المستمر' }
    ],
    // Step 1: Auditor signed
    isExaminerSigned: true,
    examinerSignedAt: '2025-02-14T10:15:00.000Z',
    examinerSignedName: 'أ. سالم بن راشد الهنائي',
    examinerSignatureQrData: 'OM-AUD-3C88-1M90',
    examinerSignatureStampUrl: 'Examiner verified electronically',
    conformanceStatus: 'conforming',
    hasGradeRevisions: false,
    // Step 2: Teacher signed
    isTeacherSigned: true,
    teacherSignedAt: '2025-02-15T11:45:00.000Z',
    teacherSignedName: 'أ. منى بنت عبدالله الوهيبية',
    teacherSignatureQrData: 'OM-TCH-8B22-4P67',
    teacherSignatureStampUrl: 'Teacher verified electronically',
    // Step 3: Awaiting Principal Signature & Stamp
    isSigned: false,
    createdAt: '2025-02-14T10:15:00.000Z',
    updatedAt: '2025-02-15T11:45:00.000Z'
  },
  {
    id: 'archive_demo_step4_certified',
    assessmentId: 'asmt_sci_g8_t1',
    assessmentTitle: 'استمارة الفحص والتدقيق المستمر - اختبار قصير 2 (العلوم العامة)',
    assessmentType: 'test',
    grade: 'الصف الثامن',
    subject: 'العلوم العامة',
    schoolName: 'مدرسة اللكبي للتعليم الأساسي (1-12)',
    schoolId: 'school_lakbi',
    teacherName: 'أ. فاطمة بنت حميد المهرية',
    teacherFileNo: '96893456789',
    appointmentYear: '2020',
    directorate: 'المديرية العامة للتربية والتعليم بمحافظة الوسطى',
    visitDate: '2025-02-10',
    subjectName: 'العلوم العامة',
    academicYear: '2024/2025',
    semester: 'الفصل الدراسي الثاني',
    suggestedDevelopment: 'تفعيل التجارب المخبرية الاستقصائية وتطبيق التعلم القائم على المشاريع العلمية.',
    examinerName: 'أ. سالم بن راشد الهنائي',
    principalName: 'أ. حمود بن عامر الحرسوسي',
    students: [
      { name: 'خالد بن حمود الحرسوسي', level: 'اختبار قصير 2', mark: '10', notes: 'مطابق للشروط فنيًا' },
      { name: 'سلطان بن مبارك الجنيبي', level: 'اختبار قصير 2', mark: '9', notes: 'مطابق للشروط فنيًا' },
      { name: 'سيف بن خلفان الحكماني', level: 'اختبار قصير 2', mark: '9.5', notes: 'مطابق للشروط فنيًا' }
    ],
    observations: [
      { element: 'مطابقة نماذج الإجابة وسلم التصحيح', gradeClass: 'الصف الثامن', tool: 'اختبار قصير', status: 'مطابق للشروط فنيًا', notes: 'استيفاء كافة المعايير الفنية والتربوية' }
    ],
    // Step 1: Auditor signed
    isExaminerSigned: true,
    examinerSignedAt: '2025-02-10T08:20:00.000Z',
    examinerSignedName: 'أ. سالم بن راشد الهنائي',
    examinerSignatureQrData: 'OM-AUD-5X12-9A34',
    examinerSignatureStampUrl: 'Examiner verified electronically',
    conformanceStatus: 'conforming',
    hasGradeRevisions: false,
    // Step 2: Teacher signed
    isTeacherSigned: true,
    teacherSignedAt: '2025-02-11T12:10:00.000Z',
    teacherSignedName: 'أ. فاطمة بنت حميد المهرية',
    teacherSignatureQrData: 'OM-TCH-4D88-7Q29',
    teacherSignatureStampUrl: 'Teacher verified electronically',
    // Step 3: Principal signed and officially stamped
    isSigned: true,
    signedAt: '2025-02-12T13:40:00.000Z',
    signedByPrincipalName: 'أ. حمود بن عامر الحرسوسي',
    signatureStampUrl: 'official_moe_stamp',
    signatureQrData: 'OM-DIR-7K99-2N55',
    createdAt: '2025-02-10T08:20:00.000Z',
    updatedAt: '2025-02-12T13:40:00.000Z'
  }
];

export async function archiveForm(archive: Omit<ArchivedForm, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  if (isSandboxActive()) {
    const archives = getSandboxData<ArchivedForm[]>(SANDBOX_ARCHIVED_FORMS_KEY, INITIAL_SANDBOX_ARCHIVED_FORMS);
    const newId = 'archive_' + Math.random().toString(36).substr(2, 9);
    const newArchive: ArchivedForm = {
      ...archive,
      id: newId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    archives.push(newArchive);
    setSandboxData(SANDBOX_ARCHIVED_FORMS_KEY, archives);
    return newId;
  }

  const path = 'archived_forms';
  try {
    const docRef = await addDoc(collection(db, 'archived_forms'), {
      ...archive,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
    return '';
  }
}

function normalizeSchoolNameLocal(name: string): string {
  if (!name) return "";
  return name.toLowerCase()
    .replace(/(basic\s+education\s+school|school|مدرسة|للتعليم|الأساسي|الأساسية|التعليم|الخاصة|الخاص)/gi, '')
    .replace(/[\s\-_]/g, '')
    .trim();
}

function isSameSchoolLocal(school1?: string, school2?: string): boolean {
  if (!school1 || !school2) return false;
  const s1 = normalizeSchoolNameLocal(school1);
  const s2 = normalizeSchoolNameLocal(school2);
  return s1.includes(s2) || s2.includes(s1);
}

export async function getArchivedForms(userProfileOrId?: UserProfile | string): Promise<ArchivedForm[]> {
  const isProfile = userProfileOrId && typeof userProfileOrId === 'object' && 'role' in userProfileOrId;
  const profileDetails = isProfile ? (userProfileOrId as UserProfile) : null;
  const passedId = !isProfile && typeof userProfileOrId === 'string' ? userProfileOrId : undefined;

  if (isSandboxActive()) {
    const archives = getSandboxData<ArchivedForm[]>(SANDBOX_ARCHIVED_FORMS_KEY, INITIAL_SANDBOX_ARCHIVED_FORMS);
    if (profileDetails && profileDetails.role === 'school') {
      if (profileDetails.roleType === 'administrative') {
        return archives.filter(a => 
          a.schoolId === profileDetails.uid || 
          isSameSchoolLocal(a.schoolName, profileDetails.schoolName)
        ).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      }
      if (profileDetails.roleType === 'teacher') {
        return archives.filter(a => 
          (a.teacherFileNo && profileDetails.phoneNumber && a.teacherFileNo === profileDetails.phoneNumber) ||
          (profileDetails.name && a.teacherName && (a.teacherName.trim().includes(profileDetails.name.trim()) || profileDetails.name.trim().includes(a.teacherName.trim()))) ||
          isSameSchoolLocal(a.schoolName, profileDetails.schoolName)
        ).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      }
      return archives.filter(a => a.schoolId === profileDetails.uid).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } else if (profileDetails && profileDetails.role === 'moderator') {
      const targetSubject = (profileDetails.subject || '').toLowerCase().trim();
      return archives.filter(a => {
        const matchesSubject = !targetSubject ||
                               (a.subject && a.subject.toLowerCase().trim() === targetSubject) ||
                               (a.subjectName && a.subjectName.toLowerCase().trim() === targetSubject);
        return matchesSubject;
      }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    } else if (passedId) {
      return archives.filter(a => a.schoolId === passedId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return archives.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  const path = 'archived_forms';
  try {
    let q = query(collection(db, 'archived_forms'));
    if (passedId) {
      q = query(collection(db, 'archived_forms'), where('schoolId', '==', passedId));
    }
    const querySnapshot = await getDocs(q);
    const results: ArchivedForm[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data() as any;
      let createdAtStr = new Date().toISOString();
      let updatedAtStr = new Date().toISOString();

      if (data.createdAt && typeof data.createdAt.toDate === 'function') {
        createdAtStr = data.createdAt.toDate().toISOString();
      } else if (data.createdAt) {
        createdAtStr = new Date(data.createdAt).toISOString();
      }

      if (data.updatedAt && typeof data.updatedAt.toDate === 'function') {
        updatedAtStr = data.updatedAt.toDate().toISOString();
      } else if (data.updatedAt) {
        updatedAtStr = new Date(data.updatedAt).toISOString();
      }

      results.push({
        id: doc.id,
        assessmentId: data.assessmentId,
        assessmentTitle: data.assessmentTitle,
        assessmentType: data.assessmentType,
        grade: data.grade,
        subject: data.subject,
        schoolName: data.schoolName,
        schoolId: data.schoolId,
        teacherName: data.teacherName,
        teacherFileNo: data.teacherFileNo,
        appointmentYear: data.appointmentYear,
        directorate: data.directorate,
        visitDate: data.visitDate,
        subjectName: data.subjectName,
        academicYear: data.academicYear,
        semester: data.semester,
        suggestedDevelopment: data.suggestedDevelopment,
        examinerName: data.examinerName,
        principalName: data.principalName,
        students: data.students || [],
        observations: data.observations || [],
        isSigned: data.isSigned || false,
        signedAt: data.signedAt,
        signedByPrincipalName: data.signedByPrincipalName,
        signatureQrData: data.signatureQrData,
        signatureStampUrl: data.signatureStampUrl,
        isTeacherSigned: data.isTeacherSigned || false,
        teacherSignedAt: data.teacherSignedAt,
        teacherSignedName: data.teacherSignedName,
        teacherSignatureQrData: data.teacherSignatureQrData,
        teacherSignatureStampUrl: data.teacherSignatureStampUrl,
        isExaminerSigned: data.isExaminerSigned || false,
        examinerSignedAt: data.examinerSignedAt,
        examinerSignedName: data.examinerSignedName,
        examinerSignatureQrData: data.examinerSignatureQrData,
        examinerSignatureStampUrl: data.examinerSignatureStampUrl,
        conformanceStatus: data.conformanceStatus,
        hasGradeRevisions: data.hasGradeRevisions,
        createdAt: createdAtStr,
        updatedAt: updatedAtStr
      });
    });

    if (profileDetails && profileDetails.role === 'school') {
      if (profileDetails.roleType === 'administrative') {
        return results.filter(a => 
          a.schoolId === profileDetails.uid || 
          isSameSchoolLocal(a.schoolName, profileDetails.schoolName)
        ).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      }
      if (profileDetails.roleType === 'teacher') {
        return results.filter(a => 
          (a.teacherFileNo && profileDetails.phoneNumber && a.teacherFileNo === profileDetails.phoneNumber) ||
          (profileDetails.name && a.teacherName && (a.teacherName.trim().includes(profileDetails.name.trim()) || profileDetails.name.trim().includes(a.teacherName.trim()))) ||
          isSameSchoolLocal(a.schoolName, profileDetails.schoolName)
        ).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      }
      return results.filter(a => a.schoolId === profileDetails.uid).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }

    if (profileDetails && profileDetails.role === 'moderator') {
      const targetSubject = (profileDetails.subject || '').toLowerCase().trim();
      return results.filter(a => {
        const matchesSubject = !targetSubject ||
                               (a.subject && a.subject.toLowerCase().trim() === targetSubject) ||
                               (a.subjectName && a.subjectName.toLowerCase().trim() === targetSubject);
        return matchesSubject;
      }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }

    return results.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function signArchivedForm(
  archiveId: string, 
  principalName: string, 
  signatureQrData: string, 
  stampUrl?: string
): Promise<void> {
  if (isSandboxActive()) {
    const archives = getSandboxData<ArchivedForm[]>(SANDBOX_ARCHIVED_FORMS_KEY, INITIAL_SANDBOX_ARCHIVED_FORMS);
    const idx = archives.findIndex(a => a.id === archiveId);
    if (idx !== -1) {
      archives[idx] = {
        ...archives[idx],
        isSigned: true,
        signedAt: new Date().toISOString(),
        signedByPrincipalName: principalName,
        signatureQrData: signatureQrData,
        signatureStampUrl: stampUrl || 'Stamping verified electronically',
        updatedAt: new Date().toISOString()
      };
      setSandboxData(SANDBOX_ARCHIVED_FORMS_KEY, archives);
    }
    return;
  }

  const path = `archived_forms/${archiveId}`;
  try {
    await updateDoc(doc(db, 'archived_forms', archiveId), {
      isSigned: true,
      signedAt: serverTimestamp(),
      signedByPrincipalName: principalName,
      signatureQrData: signatureQrData,
      signatureStampUrl: stampUrl || 'Stamping verified electronically',
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function signArchivedTeacherForm(
  archiveId: string, 
  teacherName: string, 
  signatureQrData: string, 
  stampUrl?: string
): Promise<void> {
  if (isSandboxActive()) {
    const archives = getSandboxData<ArchivedForm[]>(SANDBOX_ARCHIVED_FORMS_KEY, INITIAL_SANDBOX_ARCHIVED_FORMS);
    const idx = archives.findIndex(a => a.id === archiveId);
    if (idx !== -1) {
      archives[idx] = {
        ...archives[idx],
        isTeacherSigned: true,
        teacherSignedAt: new Date().toISOString(),
        teacherSignedName: teacherName,
        teacherSignatureQrData: signatureQrData,
        teacherSignatureStampUrl: stampUrl || 'Teacher verified electronically',
        updatedAt: new Date().toISOString()
      };
      setSandboxData(SANDBOX_ARCHIVED_FORMS_KEY, archives);
    }
    return;
  }

  const path = `archived_forms/${archiveId}`;
  try {
    await updateDoc(doc(db, 'archived_forms', archiveId), {
      isTeacherSigned: true,
      teacherSignedAt: serverTimestamp(),
      teacherSignedName: teacherName,
      teacherSignatureQrData: signatureQrData,
      teacherSignatureStampUrl: stampUrl || 'Teacher verified electronically',
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function signArchivedExaminerForm(
  archiveId: string, 
  examinerName: string, 
  signatureQrData: string, 
  stampUrl?: string,
  conformanceStatus?: 'conforming' | 'non-conforming',
  hasGradeRevisions?: boolean
): Promise<void> {
  if (isSandboxActive()) {
    const archives = getSandboxData<ArchivedForm[]>(SANDBOX_ARCHIVED_FORMS_KEY, INITIAL_SANDBOX_ARCHIVED_FORMS);
    const idx = archives.findIndex(a => a.id === archiveId);
    if (idx !== -1) {
      archives[idx] = {
        ...archives[idx],
        isExaminerSigned: true,
        examinerSignedAt: new Date().toISOString(),
        examinerSignedName: examinerName,
        examinerSignatureQrData: signatureQrData,
        examinerSignatureStampUrl: stampUrl || 'Examiner verified electronically',
        conformanceStatus: conformanceStatus || undefined,
        hasGradeRevisions: hasGradeRevisions || false,
        updatedAt: new Date().toISOString()
      };
      setSandboxData(SANDBOX_ARCHIVED_FORMS_KEY, archives);
    }
    return;
  }

  const path = `archived_forms/${archiveId}`;
  try {
    await updateDoc(doc(db, 'archived_forms', archiveId), {
      isExaminerSigned: true,
      examinerSignedAt: serverTimestamp(),
      examinerSignedName: examinerName,
      examinerSignatureQrData: signatureQrData,
      examinerSignatureStampUrl: stampUrl || 'Examiner verified electronically',
      conformanceStatus: conformanceStatus || null,
      hasGradeRevisions: hasGradeRevisions || false,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// --- FORM CUSTOMIZATION AND RENDERING DESIGN ENGINE (ADMIN-ONLY CONTROLLER) ---
export const DEFAULT_FORM_STYLES: FormDesignSettings = {
  primaryFont: 'Cairo', // Options: 'Cairo', 'Tajawal', 'Amiri', 'Inter', 'IBM Plex Sans Arabic'
  monoFont: 'JetBrains Mono', // Options: 'JetBrains Mono', 'Courier New', 'Fira Code'
  titleSize: '24px',
  headerDetailsSize: '13px',
  tableHeaderSize: '13px',
  tableBodySize: '12px',
  notesSize: '11px',
  primaryColor: '#821315', // Oman Ministry Red / Royal Burgundy
  secondaryColor: '#051C3F', // Complementary Navy Blue
  tablePaddingY: '8px',
  outerPadding: '32px',
  borderWidth: '1.5px',
  borderType: 'solid',
  titleTextAr: 'وزارة التربية والتعليم',
  titleTextEn: 'MINISTRY OF EDUCATION',
  subTitleTextAr: 'المديرية العامة للإشراف التربوي - دائرة تقييم العائد التدريبي والقياس اللغوي',
  subTitleTextEn: 'DIRECTORATE GENERAL OF EDUCATIONAL SUPERVISION',
  showWatermark: true,
  watermarkText: 'وزارة التربية والتعليم - وثيقة فحص رسمية',

  // Default content labels for total control configuration
  reportTitleAr: 'استمارة الفحص و التدقيق المستمر',
  reportTitleEn: 'Continuous Assessment Auditing & Moderation Form',
  labelSchoolAr: 'المدرسة الدراسية:',
  labelSchoolEn: 'School:',
  labelAcademicAr: 'المجلس الأكاديمي والزيارة:',
  labelAcademicEn: 'Academic & Visit:',
  labelTeacherAr: 'الأستاذ القائم / المعلم:',
  labelTeacherEn: 'Assigned Teacher:',
  labelSubjectAr: 'المادة وسنة التعيين:',
  labelSubjectEn: 'Subject & Appt Year:',
  labelFileNumberAr: 'رقم الملف الوظيفي:',
  labelFileNumberEn: 'File ID Number:',
  labelYearOfAppointmentAr: 'سنة التعيين:',
  labelYearOfAppointmentEn: 'Appointment Year:',
  labelDirectorateAr: 'المديريـــــــــة:',
  labelDirectorateEn: 'Directorate:',
  labelSpecializationAr: 'التخصـــــــــص:',
  labelSpecializationEn: 'Specialization:',
  labelVisitDateAr: 'تاريخ الزيارة:',
  labelVisitDateEn: 'Visit Date:',

  colIdAr: 'م',
  colStudentNameAr: 'اسم الطالب ثلاثياً وقبيلته',
  colClassAr: 'الصف والشعبة',
  colToolAr: 'أداة التقويم المستمر',
  colScoreBeforeAr: 'الدرجة قبل',
  colScoreAfterAr: 'الدرجة بعد',
  colReasonAr: 'سبب التعديل والقرار الفني للمطابقة',

  sectionDevelopmentAr: 'برامج الإنماء والتمكين المهني المقترحة بالتقرير:',
  sectionAuditorSignAr: 'مشرف فحص ومطابقة المادة:',
  sectionPrincipalSignAr: 'مدير المدرسة المصادق:',
  sectionTeacherSignAr: 'توقيع المعلم القائم بالرصد:',
  
  showTeacherSignature: true,
  showSultanateLogo: true,
  cardBackgroundType: 'plain',
  tableHeaderBg: '#f8fafc',
  signatureLayout: 'horizontal',

  // Table styling & movement defaults
  tableBorderWidth: '1px',
  tableBorderType: 'solid',
  tableBorderColor: '#cbd5e1',
  tableOuterBorderColor: '#821315',
  tableOuterBorderWidth: '1.5px',
  tableGridPattern: 'full',
  tableMarginTop: '0px',
  tableMarginBottom: '0px',
  sectionSpacingY: '12px',
  headerMarginBottom: '12px',
  metaMarginBottom: '12px',
  legendPaddingY: '8px',
  signaturesPaddingY: '12px',
  printPageMarginX: '12mm',
  printPageMarginY: '10mm',
  printPagePadding: '6mm 8mm',
  printZoom: '100%',
  stampOffsetX: 0,
  stampOffsetY: 0
};

const SANDBOX_FORM_SETTINGS_KEY = 'oman_moe_sandbox_form_settings_v2';

export async function getFormDesignSettings(): Promise<FormDesignSettings> {
  if (isSandboxActive()) {
    const val = localStorage.getItem(SANDBOX_FORM_SETTINGS_KEY);
    if (val) {
      try {
        return { ...DEFAULT_FORM_STYLES, ...JSON.parse(val) };
      } catch (e) {
        return DEFAULT_FORM_STYLES;
      }
    }
    return DEFAULT_FORM_STYLES;
  }

  const path = 'form_settings/global_style';
  try {
    const s = await getDoc(doc(db, 'form_settings', 'global_style'));
    if (s.exists()) {
      return { ...DEFAULT_FORM_STYLES, ...s.data() } as FormDesignSettings;
    }
    return DEFAULT_FORM_STYLES;
  } catch (error) {
    console.warn("Firestore style load defaulted to fallback:", error);
    return DEFAULT_FORM_STYLES;
  }
}

export async function saveFormDesignSettings(settings: FormDesignSettings): Promise<void> {
  if (isSandboxActive()) {
    localStorage.setItem(SANDBOX_FORM_SETTINGS_KEY, JSON.stringify(settings));
    return;
  }

  const path = 'form_settings/global_style';
  try {
    await setDoc(doc(db, 'form_settings', 'global_style'), {
      ...settings,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

const SANDBOX_SCHOOLS_KEY = 'oman_moe_sandbox_schools_v4';

export async function getSchoolsList(): Promise<SchoolDoc[]> {
  if (isSandboxActive()) {
    const val = localStorage.getItem(SANDBOX_SCHOOLS_KEY);
    if (val) {
      try {
        const parsed = JSON.parse(val) as SchoolDoc[];
        if (parsed.length >= 27 && parsed.some(s => s.nameAr.includes('11 يناير'))) {
          return parsed;
        }
      } catch (e) {
        // Fallback to static seed
      }
    }
    // Seed Sandbox schools list from static OMAN_WUSTA_SCHOOLS
    const initialList: SchoolDoc[] = [];
    let idx = 1;
    OMAN_WUSTA_SCHOOLS.forEach(wilaya => {
      wilaya.schools.forEach(school => {
        initialList.push({
          id: `school-seed-${idx++}`,
          nameAr: school.nameAr,
          nameEn: school.nameEn,
          wilayaId: wilaya.id,
          wilayaAr: wilaya.nameAr,
          wilayaEn: wilaya.nameEn,
          createdAt: new Date().toISOString()
        });
      });
    });
    localStorage.setItem(SANDBOX_SCHOOLS_KEY, JSON.stringify(initialList));
    return initialList;
  }

  const path = 'schools';
  try {
    const snapshot = await getDocs(collection(db, 'schools'));
    const list: SchoolDoc[] = [];
    snapshot.forEach(doc => {
      list.push({ id: doc.id, ...doc.data() } as SchoolDoc);
    });

    if (list.length === 0) {
      // Seed Firebase automatically so the admin has the data
      const initialList: SchoolDoc[] = [];
      let idx = 1;
      for (const wilaya of OMAN_WUSTA_SCHOOLS) {
        for (const school of wilaya.schools) {
          const newId = `school-seed-${idx++}`;
          const item = {
            nameAr: school.nameAr,
            nameEn: school.nameEn,
            wilayaId: wilaya.id,
            wilayaAr: wilaya.nameAr,
            wilayaEn: wilaya.nameEn,
            createdAt: new Date().toISOString()
          };
          await setDoc(doc(db, 'schools', newId), item);
          initialList.push({ id: newId, ...item });
        }
      }
      return initialList;
    }

    return list.sort((a, b) => a.nameAr.localeCompare(b.nameAr));
  } catch (error) {
    console.warn("Firestore schools failed to load: ", error);
    // Return static seed fallback
    const list: SchoolDoc[] = [];
    let idx = 1;
    OMAN_WUSTA_SCHOOLS.forEach(wilaya => {
      wilaya.schools.forEach(school => {
        list.push({
          id: `school-fallback-${idx++}`,
          nameAr: school.nameAr,
          nameEn: school.nameEn,
          wilayaId: wilaya.id,
          wilayaAr: wilaya.nameAr,
          wilayaEn: wilaya.nameEn,
          createdAt: new Date().toISOString()
        });
      });
    });
    return list;
  }
}

export async function syncOfficialWustaSchools(): Promise<SchoolDoc[]> {
  const initialList: SchoolDoc[] = [];
  let idx = 1;
  for (const wilaya of OMAN_WUSTA_SCHOOLS) {
    for (const school of wilaya.schools) {
      initialList.push({
        id: `school-wusta-${idx++}`,
        nameAr: school.nameAr,
        nameEn: school.nameEn,
        wilayaId: wilaya.id,
        wilayaAr: wilaya.nameAr,
        wilayaEn: wilaya.nameEn,
        createdAt: new Date().toISOString()
      });
    }
  }

  if (isSandboxActive()) {
    localStorage.setItem(SANDBOX_SCHOOLS_KEY, JSON.stringify(initialList));
    return initialList;
  }

  try {
    const existingSnapshot = await getDocs(collection(db, 'schools'));
    const existingMap = new Map<string, string>();
    existingSnapshot.forEach(d => {
      const data = d.data();
      if (data?.nameAr) {
        existingMap.set(data.nameAr, d.id);
      }
    });

    for (const item of initialList) {
      const existingId = existingMap.get(item.nameAr);
      const targetId = existingId || item.id;
      await setDoc(doc(db, 'schools', targetId), {
        nameAr: item.nameAr,
        nameEn: item.nameEn,
        wilayaId: item.wilayaId,
        wilayaAr: item.wilayaAr,
        wilayaEn: item.wilayaEn,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }

    return await getSchoolsList();
  } catch (err) {
    console.warn("Failed to sync Firestore schools, returning static list:", err);
    return initialList;
  }
}

export async function addSchoolDoc(school: Omit<SchoolDoc, 'id' | 'createdAt'>): Promise<string> {
  const timestamp = new Date().toISOString();
  if (isSandboxActive()) {
    const list = await getSchoolsList();
    const newId = `school-custom-${Date.now()}`;
    const newSchool: SchoolDoc = {
      id: newId,
      ...school,
      createdAt: timestamp
    };
    list.push(newSchool);
    localStorage.setItem(SANDBOX_SCHOOLS_KEY, JSON.stringify(list));
    return newId;
  }

  const path = 'schools';
  try {
    const docRef = await addDoc(collection(db, 'schools'), {
      ...school,
      createdAt: timestamp
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function updateSchoolDoc(schoolId: string, updates: Partial<SchoolDoc>): Promise<void> {
  if (isSandboxActive()) {
    const list = await getSchoolsList();
    const idx = list.findIndex(s => s.id === schoolId);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem(SANDBOX_SCHOOLS_KEY, JSON.stringify(list));
    }
    return;
  }

  const path = `schools/${schoolId}`;
  try {
    await updateDoc(doc(db, 'schools', schoolId), {
      ...updates,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteSchoolDoc(schoolId: string): Promise<void> {
  if (isSandboxActive()) {
    let list = await getSchoolsList();
    list = list.filter(s => s.id !== schoolId);
    localStorage.setItem(SANDBOX_SCHOOLS_KEY, JSON.stringify(list));
    return;
  }

  const path = `schools/${schoolId}`;
  try {
    await deleteDoc(doc(db, 'schools', schoolId));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// --- School Stamps Operations ---
export async function uploadSchoolStamp(
  schoolId: string, 
  stampDataUrl: string, 
  fileName?: string, 
  adminName?: string
): Promise<string> {
  const now = new Date().toISOString();
  let finalStampUrl = stampDataUrl;

  // Try uploading to Firebase Storage if online and not sandbox
  if (!isSandboxActive() && stampDataUrl.startsWith('data:')) {
    try {
      const cleanFileName = (fileName || 'official_school_stamp.png').replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileRef = ref(storage, `school_stamps/${schoolId}/${Date.now()}_${cleanFileName}`);
      await uploadString(fileRef, stampDataUrl, 'data_url');
      finalStampUrl = await getDownloadURL(fileRef);
    } catch (storageErr) {
      console.warn("Storage upload failed or offline, saving DataURL directly to Firestore:", storageErr);
      finalStampUrl = stampDataUrl;
    }
  }

  const updates: Partial<SchoolDoc> = {
    stampUrl: finalStampUrl,
    stampName: fileName || 'school_stamp.png',
    stampUploadedAt: now,
    stampUploadedBy: adminName || 'مدير النظام (Admin)',
    updatedAt: now
  };

  // Cache locally for instantaneous retrieval across the portal
  try {
    localStorage.setItem(`oman_school_stamp_${schoolId}`, finalStampUrl);
  } catch (e) {
    // ignore quota err
  }

  await updateSchoolDoc(schoolId, updates);
  return finalStampUrl;
}

export async function deleteSchoolStamp(schoolId: string): Promise<void> {
  const now = new Date().toISOString();
  const updates: Partial<SchoolDoc> = {
    stampUrl: '',
    stampName: '',
    stampUploadedAt: '',
    stampUploadedBy: '',
    updatedAt: now
  };

  try {
    localStorage.removeItem(`oman_school_stamp_${schoolId}`);
  } catch (e) {
    // ignore
  }

  await updateSchoolDoc(schoolId, updates);
}

export async function getSchoolStampBySchoolIdOrName(schoolIdOrName: string): Promise<string | null> {
  if (!schoolIdOrName) return null;
  const target = schoolIdOrName.trim().toLowerCase();

  // 1. Check local storage cache first
  try {
    const cached = localStorage.getItem(`oman_school_stamp_${schoolIdOrName}`);
    if (cached) return cached;
  } catch (e) {
    // ignore
  }

  // 2. Look up in schools list
  try {
    const schools = await getSchoolsList();
    const found = schools.find(s => 
      s.id === schoolIdOrName ||
      s.nameAr.trim().toLowerCase() === target ||
      (s.nameEn && s.nameEn.trim().toLowerCase() === target) ||
      target.includes(s.nameAr.trim().toLowerCase()) ||
      s.nameAr.trim().toLowerCase().includes(target)
    );
    if (found && found.stampUrl) {
      try {
        localStorage.setItem(`oman_school_stamp_${found.id}`, found.stampUrl);
      } catch (e) {}
      return found.stampUrl;
    }
  } catch (err) {
    console.warn("Failed looking up school stamp:", err);
  }

  return null;
}

// --- School Reports Operations ---
const SANDBOX_REPORTS_KEY = 'sandbox_school_reports';

export async function getSchoolReports(userProfile?: UserProfile | null): Promise<SchoolReport[]> {
  if (isSandboxActive()) {
    const raw = localStorage.getItem(SANDBOX_REPORTS_KEY);
    const list: SchoolReport[] = raw ? JSON.parse(raw) : [];
    if (!userProfile) return list;
    if (userProfile.role === 'admin') {
      return list;
    } else {
      // Automatic routing: each school gets only its designated reports
      const mySchoolName = (userProfile.schoolName || '').trim().toLowerCase();
      return list.filter(r => {
        const repSchoolName = (r.schoolName || '').trim().toLowerCase();
        return (
          r.schoolId === userProfile.uid || 
          (mySchoolName && repSchoolName && (mySchoolName === repSchoolName || mySchoolName.includes(repSchoolName) || repSchoolName.includes(mySchoolName)))
        );
      });
    }
  }

  const path = 'school_reports';
  try {
    if (!userProfile) {
      const snap = await getDocs(collection(db, 'school_reports'));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as SchoolReport));
    }

    if (userProfile.role === 'admin') {
      const snap = await getDocs(collection(db, 'school_reports'));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as SchoolReport));
    } else {
      // Fetch all reports to filter client-side for resilient matching without complex Firestore compound setups
      const snap = await getDocs(collection(db, 'school_reports'));
      const allReports = snap.docs.map(d => ({ id: d.id, ...d.data() } as SchoolReport));
      const mySchoolName = (userProfile.schoolName || '').trim().toLowerCase();
      
      return allReports.filter(r => {
        const repSchoolName = (r.schoolName || '').trim().toLowerCase();
        return (
          r.schoolId === userProfile.uid || 
          (mySchoolName && repSchoolName && (mySchoolName === repSchoolName || mySchoolName.includes(repSchoolName) || repSchoolName.includes(mySchoolName)))
        );
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function createSchoolReport(report: Omit<SchoolReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const now = new Date().toISOString();
  if (isSandboxActive()) {
    const raw = localStorage.getItem(SANDBOX_REPORTS_KEY);
    const list: SchoolReport[] = raw ? JSON.parse(raw) : [];
    const newReport: SchoolReport = {
      ...report,
      id: 'rep_' + Math.random().toString(36).substr(2, 9),
      isRead: false,
      readAt: '',
      readBy: '',
      createdAt: now,
      updatedAt: now
    };
    list.push(newReport);
    localStorage.setItem(SANDBOX_REPORTS_KEY, JSON.stringify(list));
    return newReport.id!;
  }

  const path = 'school_reports';
  try {
    const docRef = await addDoc(collection(db, 'school_reports'), {
      ...report,
      isRead: false,
      readAt: '',
      readBy: '',
      createdAt: now,
      updatedAt: now
    });

    // If PDF is supplied and is in base64 DataURL format, upload it to real Firebase Storage
    const rawPdfData = report.pdfData;
    if (rawPdfData && rawPdfData.startsWith('data:')) {
      try {
        const fileRef = ref(storage, `school_reports/${docRef.id}/${report.pdfName || 'school_report.pdf'}`);
        await uploadString(fileRef, rawPdfData, 'data_url');
        const downloadUrl = await getDownloadURL(fileRef);
        
        // Update document with the clean storage URL
        await updateDoc(doc(db, 'school_reports', docRef.id), { pdfData: downloadUrl });
      } catch (storageErr) {
        console.warn("Could not save to Firebase Storage, falling back to Base64 in Firestore", storageErr);
      }
    }

    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

export async function deleteSchoolReport(reportId: string): Promise<void> {
  if (isSandboxActive()) {
    const raw = localStorage.getItem(SANDBOX_REPORTS_KEY);
    if (raw) {
      let list: SchoolReport[] = JSON.parse(raw);
      list = list.filter(r => r.id !== reportId);
      localStorage.setItem(SANDBOX_REPORTS_KEY, JSON.stringify(list));
    }
    return;
  }

  const path = `school_reports/${reportId}`;
  try {
    await deleteDoc(doc(db, 'school_reports', reportId));
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function markSchoolReportAsRead(reportId: string, userName: string): Promise<void> {
  const now = new Date().toISOString();
  if (isSandboxActive()) {
    const raw = localStorage.getItem(SANDBOX_REPORTS_KEY);
    if (raw) {
      const list: SchoolReport[] = JSON.parse(raw);
      const index = list.findIndex(r => r.id === reportId);
      if (index !== -1) {
        list[index].isRead = true;
        list[index].readAt = now;
        list[index].readBy = userName;
        list[index].updatedAt = now;
        localStorage.setItem(SANDBOX_REPORTS_KEY, JSON.stringify(list));
      }
    }
    return;
  }

  const path = `school_reports/${reportId}`;
  try {
    await updateDoc(doc(db, 'school_reports', reportId), {
      isRead: true,
      readAt: now,
      readBy: userName,
      updatedAt: now
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}



