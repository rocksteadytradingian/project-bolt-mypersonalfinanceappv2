import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from 'firebase/auth';
import { doc, writeBatch, collection } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { getUserProfile, recoverUserProfile } from '../services/auth/authService';
import { UserProfile, Theme } from '../types/finance';
import { CountryCode, CurrencyCode } from '../utils/countries';
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
  const [error, setError] = useState<string | null>(null);
  const setStoreUserProfile = useFinanceStore(state => state.setUserProfile);

  // Separate function to load user data
  const loadUserData = useCallback(async (user: User) => {
    try {
      // Try to get existing profile with retry mechanism
      let profile = null;
      let retryCount = 0;
      const maxRetries = 3;

      while (!profile && retryCount < maxRetries) {
        try {
          profile = await getUserProfile(user.uid);
          if (!profile) {
            // Try to recover profile if not found
            profile = await recoverUserProfile(user.uid);
          }
          retryCount++;
          if (!profile) {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
          }
        } catch (error) {
          console.error(`Attempt ${retryCount + 1} failed:`, error);
          retryCount++;
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      // If still no profile after retries, create new one
      if (!profile) {
        console.log('Creating new profile from Google data...');
        const newProfile: UserProfile = {
          id: user.uid,
          userId: user.uid,
          name: user.displayName || '',
          email: user.email || '',
          country: 'PH' as CountryCode,
          currency: 'PHP' as CurrencyCode,
          theme: 'light' as Theme,
          notificationsEnabled: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...(user.photoURL && { photoUrl: user.photoURL })
        };
        profile = newProfile;

        // Initialize user data in Firestore with retry mechanism
        let batchCommitted = false;
        retryCount = 0;

        while (!batchCommitted && retryCount < maxRetries) {
          try {
            const batch = writeBatch(db);
            const profileRef = doc(db, 'users', user.uid);
            batch.set(profileRef, profile);

            // Initialize subcollections with empty arrays
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

            for (const collectionName of collections) {
              const placeholderRef = doc(collection(db, `users/${user.uid}/${collectionName}`), '_placeholder');
              batch.set(placeholderRef, {
                _isPlaceholder: true,
                createdAt: new Date().toISOString()
              });
            }

            await batch.commit();
            batchCommitted = true;
          } catch (error) {
            console.error(`Batch commit attempt ${retryCount + 1} failed:`, error);
            retryCount++;
            if (retryCount < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }

        if (!batchCommitted) {
          throw new Error('Failed to initialize user data after multiple attempts');
        }
      }

      setUserProfile(profile);
      setStoreUserProfile(profile);

      // Load financial data with retry mechanism
      retryCount = 0;
      let financialDataLoaded = false;

      while (!financialDataLoaded && retryCount < maxRetries) {
        try {
          await syncFinancialData(user.uid);
          financialDataLoaded = true;
        } catch (error) {
          console.error(`Financial data sync attempt ${retryCount + 1} failed:`, error);
          retryCount++;
          if (retryCount < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      if (!financialDataLoaded) {
        throw new Error('Failed to load financial data after multiple attempts');
      }
    } catch (error: any) {
      console.error('Error loading user data:', {
        error,
        code: error.code,
        message: error.message,
        userId: user.uid
      });
      
      // Don't reset profile if it was successfully loaded
      if (!userProfile) {
        setError('Failed to load user data. Please try again.');
        setUserProfile(null);
        setStoreUserProfile(null);
      }
    }
  }, [setStoreUserProfile]);

  // Handle auth state changes with improved error handling and retry mechanism
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;
    let retryCount = 0;
    const maxRetries = 3;

    const initializeAuth = async (user: User | null) => {
      if (!mounted) return;

      try {
        setError(null);
        setLoading(true);
        setCurrentUser(user);

        if (!user) {
          setUserProfile(null);
          setStoreUserProfile(null);
          await clearFinancialData();
          return;
        }

        // Retry loading user data with exponential backoff
        while (retryCount < maxRetries) {
          try {
            await loadUserData(user);
            return; // Success, exit retry loop
          } catch (error: any) {
            retryCount++;
            console.error(`Auth initialization attempt ${retryCount}/${maxRetries} failed:`, {
              error,
              code: error.code,
              message: error.message,
              userId: user.uid
            });

            if (retryCount === maxRetries) {
              throw error; // Max retries reached, propagate error
            }

            // Exponential backoff
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
          }
        }
      } catch (error: any) {
        console.error('Auth initialization error:', {
          error,
          code: error.code,
          message: error.message,
          state: { currentUser, userProfile }
        });

        setError('Failed to load user data. Please try again.');
        setCurrentUser(null);
        setUserProfile(null);
        setStoreUserProfile(null);
        await clearFinancialData();
      } finally {
        if (mounted) {
          setLoading(false);
          // Add a small delay before setting initialLoading to false
          timeoutId = setTimeout(() => {
            if (mounted) {
              setInitialLoading(false);
            }
          }, 500);
        }
      }
    };

    const unsubscribe = auth.onAuthStateChanged(initializeAuth);

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
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

  // Enhanced loading screen with error boundary
  if (initialLoading || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          {error ? (
            <>
              <div className="text-red-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Unable to Load Application</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
              >
                Try Again
              </button>
            </>
          ) : (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
              <p className="mt-4 text-gray-600">Loading your financial dashboard...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
