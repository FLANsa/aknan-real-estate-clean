import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

const firebaseAdminConfig = {
  projectId: process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

const hasAllAdminEnvs = Boolean(
  firebaseAdminConfig.projectId &&
  firebaseAdminConfig.clientEmail &&
  firebaseAdminConfig.privateKey
);

let adminApp: ReturnType<typeof initializeApp> | undefined;

if (getApps().length > 0) {
  adminApp = getApps()[0];
} else if (hasAllAdminEnvs) {
  adminApp = initializeApp({
    credential: cert({
      projectId: firebaseAdminConfig.projectId as string,
      clientEmail: firebaseAdminConfig.clientEmail as string,
      privateKey: firebaseAdminConfig.privateKey as string,
    }),
    projectId: firebaseAdminConfig.projectId,
    storageBucket: `${firebaseAdminConfig.projectId}.appspot.com`,
  });
}

function adminNotConfiguredError(): never {
  throw new Error(
    'Firebase Admin SDK is not configured. Please set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY in .env.local.'
  );
}

export const adminAuth = adminApp ? getAuth(adminApp) : (new Proxy({}, {
  get() { return adminNotConfiguredError; }
}) as any);

export const adminDb = adminApp ? getFirestore(adminApp) : (new Proxy({}, {
  get() { return adminNotConfiguredError; }
}) as any);

export const adminStorage = adminApp ? getStorage(adminApp) : (new Proxy({}, {
  get() { return adminNotConfiguredError; }
}) as any);

export default adminApp as unknown as ReturnType<typeof initializeApp>;
