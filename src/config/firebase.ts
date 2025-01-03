import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  Auth, 
  GoogleAuthProvider, 
  setPersistence, 
  browserLocalPersistence 
} from 'firebase/auth';
import { 
  getFirestore, 
  Firestore, 
  initializeFirestore, 
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';

// Log actual environment variables for debugging
console.log('Firebase Config:', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
});

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
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

// Enhanced error logging
const logFirebaseError = (context: string, error: any) => {
  console.error(`[Firebase Error - ${context}]`, {
    code: error.code,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });
};

// Initialize Firebase with retry mechanism and enhanced error handling
const initializeFirebaseApp = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const app = initializeApp(firebaseConfig);
      console.log('Firebase app initialized successfully');
      return app;
    } catch (error) {
      logFirebaseError(`App Initialization Attempt ${i + 1}`, error);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  throw new Error('Failed to initialize Firebase app after multiple attempts');
};

// Initialize Firestore with retry mechanism and enhanced error handling
const initializeFirestoreDb = async (app: FirebaseApp, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
          cacheSizeBytes: 1048576 * 100 // 100MB cache size
        })
      });
      console.log('Firestore initialized successfully');
      return db;
    } catch (error) {
      logFirebaseError(`Firestore Initialization Attempt ${i + 1}`, error);
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
  throw new Error('Failed to initialize Firestore after multiple attempts');
};

// Initialize Firebase services with enhanced error handling
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

try {
  app = await initializeFirebaseApp();
  db = await initializeFirestoreDb(app);
  auth = getAuth(app);
  
  // Configure auth settings
  auth.useDeviceLanguage();
  await setPersistence(auth, browserLocalPersistence);
  console.log('Firebase Auth configured successfully');
} catch (error) {
  logFirebaseError('Firebase Services Initialization', error);
  throw error;
}

// Configure Google Auth Provider with enhanced settings
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
googleProvider.addScope('openid');
googleProvider.setCustomParameters({
  prompt: 'select_account',
  login_hint: '',
  display: 'popup',
  access_type: 'offline', // Request a refresh token
  include_granted_scopes: 'true'
});
auth.useDeviceLanguage();

export { auth, db };
export default app;
