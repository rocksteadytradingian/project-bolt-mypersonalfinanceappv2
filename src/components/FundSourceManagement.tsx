import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useFinanceStore } from '../store/useFinanceStore';
import { FundSource, dateToString } from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';
import { Transaction } from '../types/finance';
import { useNavigate } from 'react-router-dom';
import { useAccountTypes } from '../store/useAccountTypes';
import { useCustomAccountTypes } from '../store/useCustomAccountTypes';

const calculateMonthlyFlow = (transactions: Transaction[]): number => {
  const now = new Date();
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  
  return transactions
    .filter(t => new Date(t.date) >= oneMonthAgo)
    .reduce((total, t) => {
      if (t.type === 'income') {
        return total + t.amount;
      } else if (t.type === 'expense') {
        return total - t.amount;
      }
      return total;
    }, 0);
};

interface FundSourceFormData {
  bankName: string;
  accountName: string;
  accountType: string;
  currentBalance: number;
}

export function FundSourceManagement() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { fundSources, addFundSource, updateFundSource, deleteFundSource } = useFinanceStore();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedSource, setSelectedSource] = useState<FundSource | null>(null);
  const [formData, setFormData] = useState<FundSourceFormData>({
    bankName: '',
    accountName: '',
    accountType: '',
    currentBalance: 0
  });
  const [newCustomType, setNewCustomType] = useState('');

  // Move hooks to component level
  const accountTypes = useAccountTypes();
  const customAccountTypes = useCustomAccountTypes();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const now = dateToString(new Date());

    if (selectedSource) {
      const updatedSource: FundSource = {
        ...selectedSource,
        ...formData,
        monthlyFlow: calculateMonthlyFlow(selectedSource.transactions),
        lastUpdated: now,
        updatedAt: now
      };
      updateFundSource(updatedSource);
    } else {
      const newSource: Omit<FundSource, 'id'> = {
        ...formData,
        userId: currentUser.uid,
        transactions: [],
        monthlyFlow: 0,
        lastUpdated: now,
        createdAt: now,
        updatedAt: now
      };
      addFundSource(newSource);
    }

    setIsAdding(false);
    setSelectedSource(null);
    setFormData({
      bankName: '',
      accountName: '',
      accountType: '',
      currentBalance: 0
    });
  };

  const handleEdit = (source: FundSource) => {
    setSelectedSource(source);
    setFormData({
      bankName: source.bankName,
      accountName: source.accountName,
      accountType: source.accountType,
      currentBalance: source.currentBalance
    });
    setIsAdding(true);
  };

  const handleDelete = async (sourceId: string) => {
    if (window.confirm('Are you sure you want to delete this fund source?')) {
      deleteFundSource(sourceId);
    }
  };

  const handleAddCustomType = () => {
    if (newCustomType.trim()) {
      customAccountTypes.addCustomType(newCustomType.trim());
      setFormData({ ...formData, accountType: newCustomType.trim() });
      setNewCustomType('');
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
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Name</label>
                <input
                  type="text"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  placeholder="e.g., Primary Savings"
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
                  placeholder="e.g., Chase Bank"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Account Type</label>
              <select
                value={formData.accountType}
                onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select Account Type</option>
                <optgroup label="Standard Types">
                  {accountTypes.types.map((type) => (
                    <option key={type} value={type}>
                      {accountTypes.getLabel(type)}
                    </option>
                  ))}
                </optgroup>
                {customAccountTypes.customTypes.length > 0 && (
                  <optgroup label="Custom Types">
                    {customAccountTypes.customTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              <div className="flex items-center space-x-2 mt-2">
                <input
                  type="text"
                  value={newCustomType}
                  onChange={(e) => setNewCustomType(e.target.value)}
                  placeholder="Add custom type..."
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomType();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAddCustomType}
                >
                  Add
                </Button>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700">Current Balance</label>
              <input
                type="number"
                value={formData.currentBalance}
                onChange={(e) => setFormData({ ...formData, currentBalance: parseFloat(e.target.value) })}
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
                    bankName: '',
                    accountName: '',
                    accountType: '',
                    currentBalance: 0
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
          <Card 
            key={source.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => navigate(`/fund-sources/${source.id}`)}
          >
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{source.bankName}: {source.accountName}</h3>
                  <p className="text-sm text-gray-500">{source.accountType}</p>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(source);
                    }} 
                    variant="secondary"
                  >
                    Edit
                  </Button>
                  <Button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(source.id);
                    }} 
                    variant="danger"
                  >
                    Delete
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Balance:</span>
                  <span>{formatCurrency(source.currentBalance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Flow:</span>
                  <span>{formatCurrency(source.monthlyFlow || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transactions:</span>
                  <span>{source.transactions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Transaction:</span>
                  <span>
                    {source.transactions.length > 0 
                      ? new Date(Math.max(...source.transactions.map(t => new Date(t.date).getTime()))).toLocaleDateString()
                      : 'No transactions'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
