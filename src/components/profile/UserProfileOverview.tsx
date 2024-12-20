import React from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { countries, CountryCode } from '../../utils/countries';

export function UserProfileOverview() {
  const navigate = useNavigate();
  const { userProfile } = useFinanceStore();

  if (!userProfile) {
    return (
      <Card>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No profile information available</p>
          <Button onClick={() => navigate('/profile/edit')}>
            Create Profile
          </Button>
        </div>
      </Card>
    );
  }

  const countryData = countries[userProfile.country as CountryCode];

  return (
    <Card>
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-xl font-semibold">Profile Overview</h2>
        <Button onClick={() => navigate('/profile/edit')}>
          Edit Profile
        </Button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-500">Name</label>
          <p className="mt-1">{userProfile.name}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500">Email</label>
          <p className="mt-1">{userProfile.email}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500">Country</label>
          <p className="mt-1">{countryData?.name || 'Not specified'}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500">Currency</label>
          <p className="mt-1">{countryData ? `${countryData.currency} (${countryData.currencySymbol})` : 'Not specified'}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500">Theme</label>
          <p className="mt-1 capitalize">{userProfile.theme}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-500">Notifications</label>
          <p className="mt-1">{userProfile.notificationsEnabled ? 'Enabled' : 'Disabled'}</p>
        </div>
      </div>
    </Card>
  );
}
