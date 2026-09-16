import 'dotenv/config';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

const requiredEnv = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'];
const missingEnv = requiredEnv.filter((name) => !process.env[name]);

const normalizePrivateKey = (value) => {
  const privateKey = value.replace(/\\n/g, '\n').trim();
  if (privateKey.includes('-----BEGIN PRIVATE KEY-----')) return privateKey;
  return `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
};

let firebaseAdminApp = null;
let firebaseAdminAuth = null;
let firebaseAdminConfigError = null;

if (missingEnv.length) {
  firebaseAdminConfigError = `Firebase Admin SDK is not configured. Missing: ${missingEnv.join(', ')}`;
  console.warn(firebaseAdminConfigError);
} else {
  try {
    firebaseAdminApp = getApps().length
      ? getApps()[0]
      : initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY),
        }),
      });
    firebaseAdminAuth = getAuth(firebaseAdminApp);
  } catch (error) {
    firebaseAdminConfigError = 'Firebase Admin SDK could not be initialized.';
    console.error(firebaseAdminConfigError);
  }
}

export { firebaseAdminApp, firebaseAdminAuth, firebaseAdminConfigError };
