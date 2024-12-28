import { 
  createUserWithEmailAndPassword as firebaseCreateUser, 
  signInWithEmailAndPassword as firebaseSignInWithEmail, 
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup as firebaseSignInWithPopup,
  signInWithRedirect as firebaseSignInWithRedirect,
  getRedirectResult,
  User,
  Auth,
  UserCredential
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  writeBatch, 
  updateDoc,
  collection,
  getDocs,
  query,
  limit 
} from 'firebase/firestore';
import { UserProfile } from '../../types/finance';
import { dateToString } from '../../types/finance';
import { useFinanceStore } from '../../store/useFinanceStore';
import { auth, db, googleProvider } from '../../config/firebase';

// Enhanced logging utility
const logAuthError = (context: string, error: any) => {
  console.error(`[AUTH ERROR - ${context}]`, {
    message: error.message,
    code: error.code,
    timestamp: new Date().toISOString(),
    userId: error.uid || 'unknown'
  });
};

// Profile recovery mechanism with subcollections verification
export const recoverUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      const existingProfile = userDoc.data() as UserProfile;
      
      // Verify all required subcollections exist
      const collections = [
        'transactions',
        'creditCards',
        'fundSources',
        'loans',
        'debts',
        'investments',
        'budgets',
        'recurringTransactions',
        'categories'
      ];

      const batch = writeBatch(db);
      
      // Check each subcollection and initialize if empty
      await Promise.all(collections.map(async (collectionName) => {
        const collectionRef = collection(db, `users/${userId}/${collectionName}`);
        const q = query(collectionRef, limit(1));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          // Add a placeholder document that will be removed on first real data
          const placeholderDoc = doc(collectionRef, '_placeholder');
          batch.set(placeholderDoc, {
            _isPlaceholder: true,
            createdAt: new Date().toISOString()
          });
        }
      }));

      await batch.commit();
      
      return existingProfile;
    }
    
    return null;
  } catch (error) {
    logAuthError('Profile Recovery', error);
    throw error;
  }
};

// Manual profile restoration
export const manualProfileRestore = async (
  userId: string, 
  profileData: Partial<UserProfile>
): Promise<UserProfile> => {
  try {
    const profileRef = doc(db, 'users', userId);
    
    // Merge existing profile with provided data
    await updateDoc(profileRef, {
      ...profileData,
      updatedAt: dateToString(new Date())
    });
    
    const updatedProfile = await getDoc(profileRef);
    return updatedProfile.data() as UserProfile;
  } catch (error) {
    logAuthError('Manual Profile Restore', error);
    throw error;
  }
};

const createDefaultProfile = (user: User): UserProfile => ({
  id: user.uid,
  userId: user.uid,
  name: user.displayName || '',
  email: user.email || '',
  country: 'PH',
  currency: 'PHP',
  theme: 'light',
  notificationsEnabled: true,
  createdAt: dateToString(new Date()),
  updatedAt: dateToString(new Date()),
  ...(user.photoURL && { photoUrl: user.photoURL })
});

const initializeUserData = async (user: User, profile: UserProfile) => {
  const batch = writeBatch(db);
  
  // Set profile document
  const profileRef = doc(db, 'users', user.uid);
  batch.set(profileRef, profile);

  // Initialize subcollections with placeholder documents
  const collections = [
    'transactions',
    'creditCards',
    'fundSources',
    'loans',
    'debts',
    'investments',
    'budgets',
    'recurringTransactions',
    'categories'
  ];

  collections.forEach(collectionName => {
    const placeholderDoc = doc(collection(db, `users/${user.uid}/${collectionName}`), '_placeholder');
    batch.set(placeholderDoc, {
      _isPlaceholder: true,
      createdAt: new Date().toISOString()
    });
  });

  // Commit the batch
  await batch.commit();
  
  // Update the store
  useFinanceStore.getState().setUserProfile(profile);
};

const getUserData = async (userId: string): Promise<{ profile: UserProfile | null }> => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  return {
    profile: userDoc.exists() ? (userDoc.data() as UserProfile) : null
  };
};

export const signUp = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await firebaseCreateUser(auth, email, password);
    const profile = createDefaultProfile(userCredential.user);
    
    await initializeUserData(userCredential.user, profile);
    
    return userCredential.user;
  } catch (error: any) {
    console.error('Error in signup process:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

export const signIn = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await firebaseSignInWithEmail(auth, email, password);
    const { profile } = await getUserData(userCredential.user.uid);
    
    if (profile) {
      // Verify and recover profile data if needed
      await recoverUserProfile(userCredential.user.uid);
      useFinanceStore.getState().setUserProfile(profile);
    }
    
    return userCredential.user;
  } catch (error: any) {
    console.error('Error signing in:', error);
    throw new Error(getAuthErrorMessage(error.code));
  }
};

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const { profile } = await getUserData(userId);
    return profile;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
    useFinanceStore.getState().setUserProfile(null);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const signInWithGoogle = async (): Promise<{ user: User; isNewUser: boolean }> => {
  try {
    // Log initial state
    console.log('Initiating Google Sign In:', {
      timestamp: new Date().toISOString(),
      environment: import.meta.env.MODE,
      authDomain: auth.config?.authDomain
    });

    // First try to get redirect result
    try {
      const redirectResult = await getRedirectResult(auth);
      if (redirectResult) {
        console.log('Got redirect result:', {
          user: redirectResult.user.uid,
          providerId: redirectResult.providerId
        });
        return handleAuthResult(redirectResult);
      }
    } catch (redirectError) {
      console.warn('No redirect result:', redirectError);
    }

    // Try popup first
    try {
      console.log('Attempting popup sign in...');
      const popupResult = await firebaseSignInWithPopup(auth, googleProvider);
      console.log('Popup sign in successful');
      return handleAuthResult(popupResult);
    } catch (popupError: any) {
      console.warn('Popup sign in failed:', popupError);
      
      // If popup fails, try redirect
      if (
        popupError.code === 'auth/popup-blocked' ||
        popupError.code === 'auth/popup-closed-by-user' ||
        popupError.code === 'auth/cancelled-popup-request'
      ) {
        console.log('Falling back to redirect sign in...');
        await firebaseSignInWithRedirect(auth, googleProvider);
        // The page will reload and we'll handle the result above
        return { user: null as any, isNewUser: false }; // This won't actually be returned
      }
      
      throw popupError;
    }
  } catch (error: any) {
    console.error('Google sign in error:', {
      code: error.code,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    throw new Error(getAuthErrorMessage(error.code));
  }
};

const handleAuthResult = async (result: UserCredential): Promise<{ user: User; isNewUser: boolean }> => {
  try {

    console.log('Processing user profile...');
    const userDoc = await getDoc(doc(db, 'users', result.user.uid));
    let profile: UserProfile | null = null;
    let isNewUser = false;

    if (!userDoc.exists()) {
      console.log('Creating new user profile...');
      profile = createDefaultProfile(result.user);
      await initializeUserData(result.user, profile);
      isNewUser = true;
    } else {
      console.log('Retrieving existing profile...');
      profile = await recoverUserProfile(result.user.uid);
      
      if (!profile) {
        console.log('Profile recovery failed, creating new profile...');
        profile = createDefaultProfile(result.user);
        await initializeUserData(result.user, profile);
        isNewUser = true;
      } else {
        console.log('Updating existing profile...');
        const updatedProfile = {
          ...profile,
          name: result.user.displayName || profile.name,
          email: result.user.email || profile.email,
          photoUrl: result.user.photoURL || profile.photoUrl,
          updatedAt: new Date().toISOString()
        };
        
        await setDoc(doc(db, 'users', result.user.uid), updatedProfile, { merge: true });
        useFinanceStore.getState().setUserProfile(updatedProfile);
        profile = updatedProfile;
      }
    }

    console.log('Sign in process completed successfully');
    return { user: result.user, isNewUser };
  } catch (error: any) {
    console.error('Error handling auth result:', error);
    throw error;
  }
};

const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.';
    case 'auth/invalid-email':
      return 'Invalid email address format.';
    case 'auth/operation-not-allowed':
      return 'Email/password sign in is not enabled. Please contact support.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Invalid email or password.';
    case 'auth/popup-closed-by-user':
      return 'Sign in was cancelled. Please try again.';
    case 'auth/cancelled-popup-request':
      return 'Only one sign in window can be open at a time.';
    case 'auth/popup-blocked':
      return 'Sign in popup was blocked by your browser. Please allow popups for this site.';
    default:
      return 'An error occurred during authentication. Please try again.';
  }
};
