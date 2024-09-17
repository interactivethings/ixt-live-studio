import * as admin from 'firebase-admin';
import getConfig from 'next/config';

const { serverRuntimeConfig } = getConfig();
const { firebasePrivateKey } = serverRuntimeConfig;

let firestoreInstance: admin.firestore.Firestore | null = null;
export function initializeFirebase() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(firebasePrivateKey),
      databaseURL: process.env.FIREBASE_DATABASE_URL || '',
    });

    // Initialize Firestore with the settings
    firestoreInstance = admin.firestore();
    firestoreInstance.settings({ ignoreUndefinedProperties: true });
  } else if (!firestoreInstance) {
    // If Firestore is not set but the app is initialized, get the Firestore instance
    firestoreInstance = admin.firestore();
  }
  return firestoreInstance;
}

export function getDatabase() {
  initializeFirebase(); // Ensure Firebase is initialized
  return admin.database(); // Now it's safe to call this
}
