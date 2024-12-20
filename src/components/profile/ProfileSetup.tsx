import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { countries, CountryCode } from '../../utils/countries';
import { UserProfile, dateToString, Theme } from '../../types/finance';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useFinanceStore } from '../../store/useFinanceStore';

export function ProfileSetup() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const setStoreUserProfile = useFinanceStore(state => state.setUserProfile);

  const [formData, setFormData] = useState({
    name: currentUser?.displayName || '',
    email: currentUser?.email || '',
    country: 'PH' as CountryCode,
    currency: 'PHP',
    theme: 'light' as Theme,
    notificationsEnabled: true,
  });

  // Redirect if user already has a profile
  useEffect(() => {
    if (userProfile) {
      navigate('/', { replace: true });
    }
  }, [userProfile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      console.error('No user logged in');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create the profile document
      const profile: UserProfile = {
        id: currentUser.uid,
        userId: currentUser.uid,
        ...formData,
        createdAt: dateToString(new Date()),
        updatedAt: dateToString(new Date())
      };

      // Save profile and initialize financial records in parallel
      await Promise.all([
        setDoc(doc(db, 'users', currentUser.uid), profile),
        setDoc(doc(db, 'financial_records', currentUser.uid), {
          transactions: [],
          creditCards: [],
          fundSources: [],
          loans: [],
          debts: [],
          investments: [],
          budgets: [],
          recurringTransactions: [],
          categories: []
        })
      ]);

      // Update the store with the new profile
      setStoreUserProfile(profile);

      // Navigate to dashboard after successful setup
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error creating profile:', error);
      setError('Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return <Navigate to="/signin" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
          <p className="mt-2 text-sm text-gray-600">
            Set up your profile to get started with personal finance management
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-danger/10 text-danger rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Country</label>
            <select
              value={formData.country}
              onChange={(e) => {
                const country = e.target.value as CountryCode;
                const currency = countries[country]?.currency || 'PHP';
                setFormData({ ...formData, country, currency });
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              required
              disabled={loading}
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              required
              disabled={loading}
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
              onChange={(e) => setFormData({ ...formData, theme: e.target.value as Theme })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              required
              disabled={loading}
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
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              disabled={loading}
            />
            <label className="ml-2 block text-sm text-gray-900">
              Enable Notifications
            </label>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Creating Profile...' : 'Complete Setup'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
