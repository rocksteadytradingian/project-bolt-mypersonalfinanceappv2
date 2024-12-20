import { UserProfile } from '../../types/finance';

export interface UserProfileSlice {
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  updateCurrency: (currency: string) => void;
}

export const createUserProfileSlice = (set: any): UserProfileSlice => ({
  userProfile: null,
  setUserProfile: (profile) => set({ userProfile: profile }),
  updateUserProfile: (profile) => set((state: any) => ({
    userProfile: state.userProfile ? { ...state.userProfile, ...profile } : null
  })),
  updateCurrency: (currency) => set((state: any) => ({
    userProfile: state.userProfile ? { ...state.userProfile, currency } : null
  })),
});