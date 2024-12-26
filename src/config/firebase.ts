import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, Firestore, initializeFirestore, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
import { connectFirestoreEmulator } from 'firebase/firestore';

// Log environment variables (excluding actual values for security)
console.log('Firebase Config Keys Present:', {
  apiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: !!import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: !!import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: !!import.meta.env.VITE_FIREBASE_APP_ID
});

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
} as const;

// Verify required config values
const requiredConfigKeys = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId'
] as const;

const missingKeys = requiredConfigKeys.filter(key => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  throw new Error(`Missing required Firebase configuration keys: ${missingKeys.join(', ')}`);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log('Firebase initialized successfully');

// Get Auth instance
const auth = getAuth(app);

// Set auth persistence
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error('Auth persistence error:', error);
});

// Configure Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
  access_type: 'offline'
});
auth.useDeviceLanguage();

// Initialize Firestore with optimized settings
const db = initializeFirestore(app, {
  cacheSizeBytes: 1048576 * 50, // 50MB cache size
  ignoreUndefinedProperties: true, // Improve write performance
});

// Enable offline persistence
enableMultiTabIndexedDbPersistence(db).catch((err: any) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence enabled in another tab');
  } else if (err.code === 'unimplemented') {
    console.warn('Persistence not supported by browser');
  } else {
    console.error('Persistence error:', err);
  }
});

export { auth, db };
export default app;
