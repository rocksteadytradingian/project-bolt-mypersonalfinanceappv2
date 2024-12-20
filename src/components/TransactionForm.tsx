import React, { useState } from 'react';
import { useFinanceStore } from '../store/useFinanceStore';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Transaction, TransactionType, PaymentMethod, Category } from '../types/finance';
import { formatCurrency } from '../utils/formatters';

interface TransactionFormProps {
  transaction?: Transaction;
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
  onCancel: () => void;
}

export function TransactionForm({ transaction, onSubmit, onCancel }: TransactionFormProps) {
  const { 
    creditCards,
    fundSources,
    categories
  } = useFinanceStore();

  const [formData, setFormData] = useState({
    type: transaction?.type || 'expense' as TransactionType,
    amount: transaction?.amount || 0,
    date: transaction?.date || new Date().toISOString().split('T')[0],
    category: transaction?.category || '',
    details: transaction?.details || '',
    paymentMethod: transaction?.paymentMethod || 'cash' as PaymentMethod,
    creditCardId: transaction?.creditCardId || '',
    fundSourceId: transaction?.fundSourceId || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Filter categories based on transaction type
  const filteredCategories = categories.filter((cat: Category) => cat.type === formData.type);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (formData.type === 'debt' && !formData.creditCardId) {
      newErrors.creditCardId = 'Credit card is required for debt payments';
    }

    if (formData.paymentMethod === 'credit_card' && !formData.creditCardId) {
      newErrors.creditCardId = 'Please select a credit card';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const newTransaction: Omit<Transaction, 'id'> = {
      ...formData,
      userId: '', // Will be set by the service
      date: formData.date,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSubmit(newTransaction);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value as TransactionType })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="debt">Debt Payment</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Amount</label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            min="0"
            step="0.01"
            required
          />
          {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
          {errors.date && <p className="mt-1 text-sm text-red-600">{errors.date}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Select a category</option>
            {filteredCategories.map((category: Category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Details</label>
          <input
            type="text"
            value={formData.details}
            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter transaction details"
          />
        </div>

        {formData.type !== 'debt' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Method</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="cash">Cash</option>
              <option value="credit_card">Credit Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="check">Check</option>
              <option value="other">Other</option>
            </select>
          </div>
        )}

        {(formData.type === 'debt' || formData.paymentMethod === 'credit_card') && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Credit Card</label>
            <select
              value={formData.creditCardId}
              onChange={(e) => setFormData({ ...formData, creditCardId: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required={formData.type === 'debt' || formData.paymentMethod === 'credit_card'}
            >
              <option value="">Select a credit card</option>
              {creditCards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.name} ({card.bank}) - Balance: {formatCurrency(card.balance)}
                </option>
              ))}
            </select>
            {errors.creditCardId && <p className="mt-1 text-sm text-red-600">{errors.creditCardId}</p>}
          </div>
        )}

        {formData.paymentMethod === 'bank_transfer' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Fund Source</label>
            <select
              value={formData.fundSourceId}
              onChange={(e) => setFormData({ ...formData, fundSourceId: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required={formData.paymentMethod === 'bank_transfer'}
            >
              <option value="">Select a fund source</option>
              {fundSources.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.bankName} - {source.accountName} - Balance: {formatCurrency(source.balance)}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <Button type="button" onClick={onCancel} variant="secondary">
            Cancel
          </Button>
          <Button type="submit">
            {transaction ? 'Update' : 'Add'} Transaction
          </Button>
        </div>
      </form>
    </Card>
  );
}
