import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../config/firebase';
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
      
      // If profile is not found, attempt recovery
      if (!profile) {
        console.log('Profile not found, attempting recovery...');
        profile = await recoverUserProfile(user.uid);
      }
      
      if (profile) {
        setUserProfile(profile);
        setStoreUserProfile(profile);
        
        // Load financial data in the background
        await syncFinancialData(user.uid).catch(error => {
          console.error('Error syncing financial data:', error);
          // Even if sync fails, keep the profile loaded
        });
      } else {
        // Only clear profile if recovery also failed
        setUserProfile(null);
        setStoreUserProfile(null);
        console.error('Profile recovery failed for user:', user.uid);
      }
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
