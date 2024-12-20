import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useFinanceStore } from '../store/useFinanceStore';
import { FundSource, dateToString } from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';

interface FundSourceFormData {
  name: string;
  bankName: string;
  accountName: string;
  accountType: string;
  type: 'checking' | 'savings';
  balance: number;
}

export function FundSourceManagement() {
  const { currentUser } = useAuth();
  const { fundSources, addFundSource, updateFundSource, deleteFundSource } = useFinanceStore();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedSource, setSelectedSource] = useState<FundSource | null>(null);
  const [formData, setFormData] = useState<FundSourceFormData>({
    name: '',
    bankName: '',
    accountName: '',
    accountType: '',
    type: 'checking',
    balance: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const now = dateToString(new Date());

    if (selectedSource) {
      const updatedSource: FundSource = {
        ...selectedSource,
        ...formData,
        lastUpdated: now,
        updatedAt: now
      };
      updateFundSource(updatedSource);
    } else {
      const newSource: Omit<FundSource, 'id'> = {
        ...formData,
        userId: currentUser.uid,
        transactions: [],
        lastUpdated: now,
        createdAt: now,
        updatedAt: now
      };
      addFundSource(newSource);
    }

    setIsAdding(false);
    setSelectedSource(null);
    setFormData({
      name: '',
      bankName: '',
      accountName: '',
      accountType: '',
      type: 'checking',
      balance: 0
    });
  };

  const handleEdit = (source: FundSource) => {
    setSelectedSource(source);
    setFormData({
      name: source.name,
      bankName: source.bankName,
      accountName: source.accountName,
      accountType: source.accountType,
      type: source.type,
      balance: source.balance
    });
    setIsAdding(true);
  };

  const handleDelete = async (sourceId: string) => {
    if (window.confirm('Are you sure you want to delete this fund source?')) {
      deleteFundSource(sourceId);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Fund Sources</h2>
        <Button onClick={() => setIsAdding(true)}>Add Fund Source</Button>
      </div>

      {isAdding && (
        <Card>
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
              <label className="block text-sm font-medium text-gray-700">Bank Name</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Account Name</label>
              <input
                type="text"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Account Type</label>
              <input
                type="text"
                value={formData.accountType}
                onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'checking' | 'savings' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="checking">Checking</option>
                <option value="savings">Savings</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Balance</label>
              <input
                type="number"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsAdding(false);
                  setSelectedSource(null);
                  setFormData({
                    name: '',
                    bankName: '',
                    accountName: '',
                    accountType: '',
                    type: 'checking',
                    balance: 0
                  });
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {selectedSource ? 'Update' : 'Add'} Fund Source
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {fundSources.map((source) => (
          <Card key={source.id}>
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{source.name}</h3>
                  <p className="text-sm text-gray-500">{source.bankName}</p>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={() => handleEdit(source)} variant="secondary">
                    Edit
                  </Button>
                  <Button onClick={() => handleDelete(source.id)} variant="danger">
                    Delete
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Name:</span>
                  <span>{source.accountName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Account Type:</span>
                  <span>{source.accountType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="capitalize">{source.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Balance:</span>
                  <span>{formatCurrency(source.balance)}</span>
                </div>
                {source.lastUpdated && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span>{new Date(source.lastUpdated).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
