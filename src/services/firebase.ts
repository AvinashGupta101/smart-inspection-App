import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocFromServer,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// CRITICAL: Initialize Firestore using the specific databaseId from firebase-applet-config.json
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Storage
export const storage = getStorage(app);

// Initialize Firebase Auth
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Test Firestore Connection on App Boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection check: client is currently offline.');
    }
    return false;
  }
}

// Call test connection
testConnection().catch(() => {
  // Graceful boot check
});

// Standard Firestore Error Handling Protocol
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map(provider => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Sign in using Google OAuth Popup
 */
export async function signInWithGoogle(): Promise<FirebaseUser> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err: unknown) {
    console.error('Google Sign In Error:', err);
    throw err;
  }
}

/**
 * Sign out of Firebase Auth
 */
export async function signOutFirebase(): Promise<void> {
  try {
    await signOut(auth);
  } catch (err) {
    console.error('Firebase sign out error:', err);
  }
}

/**
 * Upload profile photo blob to Firebase Storage and sync photo URL to Firestore users/{uid}
 */
export async function uploadProfilePhotoToFirebase(
  blob: Blob,
  uid: string,
  onProgress?: (progress: number, bytesTransferred: number, totalBytes: number) => void
): Promise<string> {
  if (!uid) {
    throw new Error('Authenticated user UID is required for Firebase profile photo upload.');
  }

  // 1. Create a timestamped storage reference inside Firebase Storage
  const filename = `avatar_${Date.now()}.webp`;
  const storagePath = `profile_photos/${uid}/${filename}`;
  const fileRef = ref(storage, storagePath);

  // 2. Start resumable upload
  const uploadTask = uploadBytesResumable(fileRef, blob, {
    contentType: blob.type || 'image/webp',
    customMetadata: {
      ownerUid: uid,
      uploadedAt: new Date().toISOString(),
    },
  });

  const downloadUrl = await new Promise<string>((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      snapshot => {
        const progress = snapshot.totalBytes > 0
          ? Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
          : 0;
        if (onProgress) {
          onProgress(progress, snapshot.bytesTransferred, snapshot.totalBytes);
        }
      },
      error => {
        console.error('Firebase Storage upload error:', error);
        reject(error);
      },
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        } catch (urlErr) {
          reject(urlErr);
        }
      }
    );
  });

  // 3. Save photo URL in Firestore under users/{uid}
  const userDocRef = doc(db, 'users', uid);
  try {
    await setDoc(
      userDocRef,
      {
        id: uid,
        name: auth.currentUser?.displayName || 'Authorized User',
        email: auth.currentUser?.email || '',
        photoUrl: downloadUrl,
        avatarUrl: downloadUrl,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (firestoreError) {
    handleFirestoreError(firestoreError, OperationType.WRITE, `users/${uid}`);
  }

  return downloadUrl;
}

/**
 * Remove profile photo: delete from Firebase Storage (if applicable) and clear in Firestore users/{uid}
 */
export async function removeProfilePhotoFromFirebase(
  uid: string,
  existingPhotoUrl?: string
): Promise<void> {
  if (!uid) {
    throw new Error('Authenticated user UID is required to remove profile photo.');
  }

  // 1. If photo is stored in Firebase Storage, attempt to delete the file
  if (existingPhotoUrl && existingPhotoUrl.includes('firebasestorage.googleapis.com')) {
    try {
      const photoRef = ref(storage, existingPhotoUrl);
      await deleteObject(photoRef);
    } catch (storageErr) {
      // Non-fatal if object was already deleted
      console.warn('Storage file deletion notice:', storageErr);
    }
  }

  // 2. Clear photo URL in Firestore under users/{uid}
  const userDocRef = doc(db, 'users', uid);
  try {
    await setDoc(
      userDocRef,
      {
        id: uid,
        photoUrl: '',
        avatarUrl: '',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (firestoreError) {
    handleFirestoreError(firestoreError, OperationType.UPDATE, `users/${uid}`);
  }
}

/**
 * Retrieve user profile from Firestore users/{uid}
 */
export async function getFirestoreUserProfile(
  uid: string
): Promise<{ photoUrl?: string; avatarUrl?: string; name?: string; email?: string } | null> {
  if (!uid) return null;
  const userDocRef = doc(db, 'users', uid);
  try {
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data() as { photoUrl?: string; avatarUrl?: string; name?: string; email?: string };
    }
    return null;
  } catch (error) {
    console.warn('Could not read user profile from Firestore:', error);
    return null;
  }
}

export { onAuthStateChanged };
export type { FirebaseUser };
