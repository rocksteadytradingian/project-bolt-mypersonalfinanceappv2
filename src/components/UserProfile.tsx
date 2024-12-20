import React from 'react';
import { UserProfileForm } from './profile/UserProfileForm';
import { UserProfileOverview } from './profile/UserProfileOverview';
import { APISettings } from './profile/APISettings';
import { useFinanceStore } from '../store/useFinanceStore';

export function UserProfile() {
  const { userProfile } = useFinanceStore();

  return (
    <div className="space-y-6">
      {userProfile && <UserProfileOverview />}
      <UserProfileForm />
      <APISettings />
    </div>
  );
}