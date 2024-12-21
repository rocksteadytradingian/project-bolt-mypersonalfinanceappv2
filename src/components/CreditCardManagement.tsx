import React, { useState } from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { useFinanceStore } from '../store/useFinanceStore';
import { CreditCard, dateToString } from '../types/finance';
import { formatCurrency } from '../utils/formatters';
import { useAuth } from '../contexts/AuthContext';

export function CreditCardManagement() {
  const { currentUser } = useAuth();
  const { creditCards, addCreditCard, updateCreditCard, deleteCreditCard } = useFinanceStore();
  const [isAdding, setIsAdding] = useState(false);
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    bank: '',
    limit: 0,
    balance: 0,
    apr: 0,
    dueDate: 1,
    cutOffDate: 1,
    minimumPayment: 0
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const now = dateToString(new Date());

    if (selectedCard) {
      const updatedCard: CreditCard = {
        ...selectedCard,
        ...formData,
        updatedAt: now
      };
      updateCreditCard(updatedCard);
    } else {
      const newCard: Omit<CreditCard, 'id'> = {
        ...formData,
        userId: currentUser.uid,
        transactions: [],
        createdAt: now,
        updatedAt: now
      };
      addCreditCard(newCard);
    }

    setIsAdding(false);
    setSelectedCard(null);
    setFormData({
      name: '',
      bank: '',
      limit: 0,
      balance: 0,
      apr: 0,
      dueDate: 1,
      cutOffDate: 1,
      minimumPayment: 0
    });
  };

  const handleEdit = (card: CreditCard) => {
    setSelectedCard(card);
    setFormData({
      name: card.name,
      bank: card.bank,
      limit: card.limit,
      balance: card.balance,
      apr: card.apr,
      dueDate: card.dueDate,
      cutOffDate: card.cutOffDate,
      minimumPayment: card.minimumPayment
    });
    setIsAdding(true);
  };

  const handleDelete = async (cardId: string) => {
    if (window.confirm('Are you sure you want to delete this credit card?')) {
      deleteCreditCard(cardId);
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Credit Cards</h2>
        <Button onClick={() => setIsAdding(true)}>Add Credit Card</Button>
      </div>

      {isAdding && (
        <Card>
          <form onSubmit={handleSubmit} className="space-y-4 p-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Card Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Bank</label>
              <input
                type="text"
                value={formData.bank}
                onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Credit Limit</label>
                <input
                  type="number"
                  value={formData.limit}
                  onChange={(e) => setFormData({ ...formData, limit: parseFloat(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Current Balance</label>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">APR (%)</label>
                <input
                  type="number"
                  value={formData.apr}
                  onChange={(e) => setFormData({ ...formData, apr: parseFloat(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Minimum Payment</label>
                <input
                  type="number"
                  value={formData.minimumPayment}
                  onChange={(e) => setFormData({ ...formData, minimumPayment: parseFloat(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Due Every</label>
                <select
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Cut-off Date Every</label>
                <select
                  value={formData.cutOffDate}
                  onChange={(e) => setFormData({ ...formData, cutOffDate: parseInt(e.target.value) })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsAdding(false);
                  setSelectedCard(null);
                  setFormData({
                    name: '',
                    bank: '',
                    limit: 0,
                    balance: 0,
                    apr: 0,
                    dueDate: 1,
                    cutOffDate: 1,
                    minimumPayment: 0
                  });
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {selectedCard ? 'Update' : 'Add'} Credit Card
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {creditCards.map((card) => (
          <Card key={card.id}>
            <div className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{card.name}</h3>
                  <p className="text-sm text-gray-500">{card.bank}</p>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={() => handleEdit(card)} variant="secondary">
                    Edit
                  </Button>
                  <Button onClick={() => handleDelete(card.id)} variant="danger">
                    Delete
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Credit Limit:</span>
                  <span>{formatCurrency(card.limit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Balance:</span>
                  <span>{formatCurrency(card.balance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available Credit:</span>
                  <span>{formatCurrency(card.limit - card.balance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">APR:</span>
                  <span>{card.apr}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Due Every:</span>
                  <span>{card.dueDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cut-off Every:</span>
                  <span>{card.cutOffDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Minimum Payment:</span>
                  <span>{formatCurrency(card.minimumPayment)}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
