import React, { useState } from 'react';
import { useFinanceStore } from '../../store/useFinanceStore';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { countries, CountryCode } from '../../utils/countries';
import { UserProfile, dateToString } from '../../types/finance';

export function UserProfileForm() {
  const { currentUser } = useAuth();
  const { userProfile, updateUserProfile } = useFinanceStore();
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
    country: (userProfile?.country || 'PH') as CountryCode,
    currency: userProfile?.currency || 'PHP',
    theme: userProfile?.theme || 'light',
    notificationsEnabled: userProfile?.notificationsEnabled ?? true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      console.error('No user logged in');
      return;
    }

    try {
      const updates: Partial<UserProfile> = {
        ...formData,
        updatedAt: dateToString(new Date())
      };

      await updateUserProfile(updates);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Country</label>
          <select
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value as CountryCode })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            {(Object.entries(countries) as [CountryCode, typeof countries[CountryCode]][]).map(([code, country]) => (
              <option key={code} value={code}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Currency</label>
          <select
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            {(Object.entries(countries) as [CountryCode, typeof countries[CountryCode]][]).map(([code, country]) => (
              <option key={code} value={country.currency}>
                {country.currency} ({country.currencySymbol})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Theme</label>
          <select
            value={formData.theme}
            onChange={(e) => setFormData({ ...formData, theme: e.target.value as 'light' | 'dark' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={formData.notificationsEnabled}
            onChange={(e) => setFormData({ ...formData, notificationsEnabled: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Enable Notifications
          </label>
        </div>

        <Button type="submit" className="w-full">
          Save Changes
        </Button>
      </form>
    </Card>
  );
}
