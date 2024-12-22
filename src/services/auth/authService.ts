import { 
  createUserWithEmailAndPassword as firebaseCreateUser, 
  signInWithEmailAndPassword as firebaseSignInWithEmail, 
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup as firebaseSignInWithPopup,
  User,
  Auth,
  UserCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc, writeBatch, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../config/firebase';
import { UserProfile } from '../../types/finance';
import { dateToString } from '../../types/finance';
import { useFinanceStore } from '../../store/useFinanceStore';

// Enhanced logging utility
const logAuthError = (context: string, error: any) => {
  console.error(`[AUTH ERROR - ${context}]`, {
    message: error.message,
    code: error.code,
    timestamp: new Date().toISOString(),
    userId: error.uid || 'unknown'
  });
};

// Profile recovery mechanism
export const recoverUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      const existingProfile = userDoc.data() as UserProfile;
      
      // Attempt to recreate financial records if missing
      const financialDoc = await getDoc(doc(db, 'financial_records', userId));
      
      if (!financialDoc.exists()) {
        await setDoc(doc(db, 'financial_records', userId), {
          transactions: [],
          creditCards: [],
          fundSources: [],
          loans: [],
          debts: [],
          investments: [],
          budgets: [],
          recurringTransactions: [],
          categories: []
        });
      }
      
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

  // Set financial records document
  const financialRef = doc(db, 'financial_records', user.uid);
  batch.set(financialRef, {
    transactions: [],
    creditCards: [],
    fundSources: [],
    loans: [],
    debts: [],
    investments: [],
    budgets: [],
    recurringTransactions: [],
    categories: []
  });

  // Commit the batch
  await batch.commit();
  
  // Update the store
  useFinanceStore.getState().setUserProfile(profile);
};

const getUserData = async (userId: string): Promise<{ profile: UserProfile | null, hasFinancialRecords: boolean }> => {
  const [userDoc, financialDoc] = await Promise.all([
    getDoc(doc(db, 'users', userId)),
    getDoc(doc(db, 'financial_records', userId))
  ]);
  return {
    profile: userDoc.exists() ? (userDoc.data() as UserProfile) : null,
    hasFinancialRecords: financialDoc.exists()
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
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    const result = await firebaseSignInWithPopup(auth, provider);
    const { profile } = await getUserData(result.user.uid);
    
    if (!profile) {
      const newProfile = createDefaultProfile(result.user);
      await initializeUserData(result.user, newProfile);
      return { user: result.user, isNewUser: true };
    } else {
      useFinanceStore.getState().setUserProfile(profile);
      return { user: result.user, isNewUser: false };
    }
  } catch (error: any) {
    console.error('Error initiating Google sign in:', error);
    throw new Error(getAuthErrorMessage(error.code));
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
