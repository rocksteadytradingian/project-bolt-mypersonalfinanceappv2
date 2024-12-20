import React from 'react';
import { Link } from 'react-router-dom';
import { CreditCard, Transaction } from '../../types/finance';
import { Card } from '../ui/Card';
import { formatCurrency } from '../../utils/formatters';

interface CreditCardProfileProps {
  card: CreditCard;
  transactions: Transaction[];
}

export function CreditCardProfile({ card, transactions }: CreditCardProfileProps) {
  const availableCredit = card.limit - card.balance;

  return (
    <Link to={`/credit-cards/${card.id}`}>
      <Card className="relative overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-lg">
        <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-16 -translate-y-8">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full" />
        </div>
        
        <div className="relative">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold">{card.name}</h2>
              <p className="text-gray-600">{card.bank}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-600">Cut-off Date</p>
              <p className="text-lg font-semibold text-gray-800">Every {card.cutOffDate}th</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Current Balance</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(card.balance)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Available Credit</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(availableCredit)}</p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <p className="text-sm font-medium text-gray-600">Credit Limit</p>
              <p className="text-lg font-semibold text-gray-800">{formatCurrency(card.limit)}</p>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}