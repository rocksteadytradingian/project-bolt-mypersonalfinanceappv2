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

// Initialize Firebase with retry mechanism
const initializeFirebaseApp = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const app = initializeApp(firebaseConfig);
      console.log('Firebase app initialized successfully');
      return app;
    } catch (error) {
      console.error(`Firebase app initialization attempt ${i + 1} failed:`, error);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  throw new Error('Failed to initialize Firebase app after multiple attempts');
};

// Initialize Firestore with retry mechanism
const initializeFirestoreDb = async (app: FirebaseApp, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const db = initializeFirestore(app, {
        cacheSizeBytes: 1048576 * 50, // 50MB cache size
        ignoreUndefinedProperties: true,
      });
      console.log('Firestore initialized successfully');
      return db;
    } catch (error) {
      console.error(`Firestore initialization attempt ${i + 1} failed:`, error);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  throw new Error('Failed to initialize Firestore after multiple attempts');
};

// Initialize Firebase services
const app = await initializeFirebaseApp();
const db = await initializeFirestoreDb(app);
const auth = getAuth(app);

// Configure auth persistence with retry mechanism
const initializeAuthPersistence = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      await setPersistence(auth, browserLocalPersistence);
      console.log('Auth persistence initialized successfully');
      return;
    } catch (error) {
      console.error(`Auth persistence initialization attempt ${i + 1} failed:`, error);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  throw new Error('Failed to initialize auth persistence after multiple attempts');
};

// Configure Firestore persistence with retry mechanism
const initializeFirestorePersistence = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      await enableMultiTabIndexedDbPersistence(db);
      console.log('Multi-tab persistence enabled successfully');
      return;
    } catch (err: any) {
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs detected, persistence already enabled in another tab');
        return;
      } else if (err.code === 'unimplemented') {
        console.warn('Persistence not supported by browser');
        return;
      }
      console.error(`Persistence initialization attempt ${i + 1} failed:`, err);
      if (i === retries - 1) throw err;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
};

// Configure Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
  access_type: 'offline'
});
auth.useDeviceLanguage();

// Initialize persistence in the background
Promise.all([
  initializeAuthPersistence(),
  initializeFirestorePersistence()
]).catch(error => {
  console.error('Error initializing persistence:', error);
});

export { auth, db };
export default app;
