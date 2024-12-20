import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Investment, InvestmentCategory, InvestmentType, InvestmentStatus, InvestmentRiskLevel, dateToString } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../contexts/AuthContext';

export function InvestmentManagement() {
  const { currentUser } = useAuth();
  const { investments, addInvestment, updateInvestment, deleteInvestment } = useFinanceStore();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'stocks' as InvestmentType,
    category: 'stocks' as InvestmentCategory,
    amount: 0,
    currentValue: 0,
    purchaseDate: '',
    purchasePrice: 0,
    quantity: 0,
    platform: '',
    riskLevel: 'medium' as InvestmentRiskLevel,
    status: 'active' as InvestmentStatus,
    expectedReturn: 0,
    maturityDate: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const now = dateToString(new Date());

    if (selectedInvestment) {
      const updatedInvestment: Investment = {
        ...selectedInvestment,
        ...formData,
        updatedAt: now
      };
      updateInvestment(updatedInvestment);
    } else {
      const newInvestment: Omit<Investment, 'id'> = {
        ...formData,
        userId: currentUser.uid,
        platform: formData.platform || '',
        expectedReturn: formData.expectedReturn || 0,
        transactions: [],
        createdAt: now,
        updatedAt: now
      };
      addInvestment(newInvestment);
    }

    setIsAdding(false);
    setSelectedInvestment(null);
    setFormData({
      name: '',
      type: 'stocks',
      category: 'stocks',
      amount: 0,
      currentValue: 0,
      purchaseDate: '',
      purchasePrice: 0,
      quantity: 0,
      platform: '',
      riskLevel: 'medium',
      status: 'active',
      expectedReturn: 0,
      maturityDate: '',
      notes: ''
    });
  };

  const handleEdit = (investment: Investment) => {
    setSelectedInvestment(investment);
    setFormData({
      name: investment.name,
      type: investment.type,
      category: investment.category,
      amount: investment.amount,
      currentValue: investment.currentValue,
      purchaseDate: investment.purchaseDate,
      purchasePrice: investment.purchasePrice,
      quantity: investment.quantity,
      platform: investment.platform,
      riskLevel: investment.riskLevel,
      status: investment.status,
      expectedReturn: investment.expectedReturn,
      maturityDate: investment.maturityDate || '',
      notes: investment.notes || ''
    });
    setIsAdding(true);
  };

  const handleDelete = async (investmentId: string) => {
    if (window.confirm('Are you sure you want to delete this investment?')) {
      deleteInvestment(investmentId);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Investments</h2>
        <Button onClick={() => setIsAdding(true)}>Add Investment</Button>
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as InvestmentType })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="stocks">Stocks</option>
                  <option value="bonds">Bonds</option>
                  <option value="mutual_funds">Mutual Funds</option>
                  <option value="etfs">ETFs</option>
                  <option value="crypto">Cryptocurrency</option>
                  <option value="real_estate">Real Estate</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as InvestmentCategory })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="stocks">Stocks</option>
                  <option value="bonds">Bonds</option>
                  <option value="mutual_funds">Mutual Funds</option>
                  <option value="etfs">ETFs</option>
                  <option value="crypto">Cryptocurrency</option>
                  <option value="real_estate">Real Estate</option>
                  <option value="traditional">Traditional</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Current Value</label>
                <input
                  type="number"
                  value={formData.currentValue}
                  onChange={(e) => setFormData({ ...formData, currentValue: parseFloat(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Purchase Date</label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Purchase Price</label>
                <input
                  type="number"
                  value={formData.purchasePrice}
                  onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Platform</label>
                <input
                  type="text"
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Risk Level</label>
                <select
                  value={formData.riskLevel}
                  onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value as InvestmentRiskLevel })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as InvestmentStatus })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="active">Active</option>
                  <option value="sold">Sold</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Expected Return (%)</label>
              <input
                type="number"
                value={formData.expectedReturn}
                onChange={(e) => setFormData({ ...formData, expectedReturn: parseFloat(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Maturity Date</label>
              <input
                type="date"
                value={formData.maturityDate}
                onChange={(e) => setFormData({ ...formData, maturityDate: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsAdding(false);
                  setSelectedInvestment(null);
                  setFormData({
                    name: '',
                    type: 'stocks',
                    category: 'stocks',
                    amount: 0,
                    currentValue: 0,
                    purchaseDate: '',
                    purchasePrice: 0,
                    quantity: 0,
                    platform: '',
                    riskLevel: 'medium',
                    status: 'active',
                    expectedReturn: 0,
                    maturityDate: '',
                    notes: ''
                  });
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {selectedInvestment ? 'Update' : 'Add'} Investment
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {investments.map((investment) => (
          <Card key={investment.id}>
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{investment.name}</h3>
                  <p className="text-sm text-gray-500">{investment.type}</p>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={() => handleEdit(investment)} variant="secondary">
                    Edit
                  </Button>
                  <Button onClick={() => handleDelete(investment.id)} variant="danger">
                    Delete
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span>{formatCurrency(investment.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Value:</span>
                  <span>{formatCurrency(investment.currentValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Return:</span>
                  <span className={investment.currentValue > investment.amount ? 'text-green-600' : 'text-red-600'}>
                    {((investment.currentValue - investment.amount) / investment.amount * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span>{investment.status}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
