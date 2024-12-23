import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from 'firebase/auth';
import { doc, writeBatch } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { getUserProfile, recoverUserProfile } from '../services/auth/authService';
import { UserProfile } from '../types/finance';
import { syncFinancialData, clearFinancialData } from '../services/firebase/financeService';
import { useFinanceStore } from '../store/useFinanceStore';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  initialLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  userProfile: null,
  loading: true,
  initialLoading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const setStoreUserProfile = useFinanceStore(state => state.setUserProfile);

  // Separate function to load user data
  const loadUserData = useCallback(async (user: User) => {
    try {
      let profile = await getUserProfile(user.uid);
      
      // If profile is not found, create a new one using user's Google data
      if (!profile) {
        console.log('Profile not found, creating new profile from Google data...');
        profile = {
          id: user.uid,
          userId: user.uid,
          name: user.displayName || '',
          email: user.email || '',
          country: 'PH',
          currency: 'PHP',
          theme: 'light',
          notificationsEnabled: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...(user.photoURL && { photoUrl: user.photoURL })
        };
        
        // Initialize user data in Firestore
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
      }
      
      setUserProfile(profile);
      setStoreUserProfile(profile);
      
      // Load financial data in the background
      await syncFinancialData(user.uid).catch(error => {
        console.error('Error syncing financial data:', error);
        // Even if sync fails, keep the profile loaded
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      // Reset user profile on error
      setUserProfile(null);
      setStoreUserProfile(null);
    }
  }, [setStoreUserProfile]);

  // Handle auth state changes
  useEffect(() => {
    let mounted = true;

    const unsubscribe = auth.onAuthStateChanged(async (user: User | null) => {
      if (!mounted) return;

      setLoading(true);
      setCurrentUser(user);

      if (!user) {
        setUserProfile(null);
        setStoreUserProfile(null);
        clearFinancialData();
      } else {
        await loadUserData(user);
      }

      setLoading(false);
      setInitialLoading(false);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, [loadUserData, setStoreUserProfile]);

  // Memoize context value to prevent unnecessary re-renders
  const value = React.useMemo(() => ({
    currentUser,
    userProfile,
    loading,
    initialLoading,
  }), [currentUser, userProfile, loading, initialLoading]);

  // Only block rendering during initial auth check
  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
