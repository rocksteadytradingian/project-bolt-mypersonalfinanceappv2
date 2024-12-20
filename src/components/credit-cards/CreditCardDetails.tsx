import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useFinanceStore } from '../../store/useFinanceStore';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { TransactionList } from '../TransactionList';
import { formatCurrency } from '../../utils/formatters';

export function CreditCardDetails() {
  const { id } = useParams<{ id: string }>();
  const { creditCards, transactions } = useFinanceStore();
  
  const card = creditCards.find(c => c.id === id);
  const cardTransactions = transactions.filter(t => t.creditCardId === id);

  if (!card) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Credit Card Not Found</h2>
        <Link to="/credit-cards" className="text-blue-600 hover:text-blue-800">
          Return to Credit Cards
        </Link>
      </div>
    );
  }

  const availableCredit = card.limit - card.balance;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{card.name}</h1>
        <Link to="/credit-cards">
          <Button variant="secondary">Back to Credit Cards</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Current Balance</h3>
          <p className="text-3xl font-bold text-red-600">{formatCurrency(card.balance)}</p>
        </Card>
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Available Credit</h3>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(availableCredit)}</p>
        </Card>
        <Card>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Due Date</h3>
          <p className="text-3xl font-bold text-blue-600">Every {card.cutOffDate}th</p>
        </Card>
      </div>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Card Details</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-500">Bank</p>
            <p className="text-gray-900">{card.bank}</p>
          </div>
          <div>
            <p className="font-medium text-gray-500">Credit Limit</p>
            <p className="text-gray-900">{formatCurrency(card.limit)}</p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
        <TransactionList 
          transactions={cardTransactions} 
          onEdit={() => {}} 
          onDelete={() => {}} 
          readOnly={true}
        />
      </Card>
    </div>
  );
}