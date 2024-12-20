import React from 'react';
import { Card } from './ui/Card';
import { formatCurrency } from '../utils/formatters';
import { Transaction } from '../types/finance';

interface TransactionPreviewProps {
  transaction: Transaction;
}

export function TransactionPreview({ transaction }: TransactionPreviewProps) {
  const getFormattedDate = (dateString: string) => {
    const date = new Date(dateString);
    return !isNaN(date.getTime()) ? date.toLocaleDateString() : 'Invalid Date';
  };

  return (
    <Card>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">Transaction Preview</h3>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Type:</span>
            <span className={`font-medium ${
              transaction.type === 'income' ? 'text-green-600' : 
              transaction.type === 'expense' ? 'text-red-600' : 
              'text-blue-600'
            }`}>
              {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Amount:</span>
            <span className="font-medium">{formatCurrency(transaction.amount)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Date:</span>
            <span className="font-medium">{getFormattedDate(transaction.date)}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Category:</span>
            <span className="font-medium">{transaction.category}</span>
          </div>

          {transaction.details && (
            <div className="flex justify-between">
              <span className="text-gray-600">Details:</span>
              <span className="font-medium">{transaction.details}</span>
            </div>
          )}

          {transaction.paymentMethod && (
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-medium">
                {transaction.paymentMethod.split('_').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
