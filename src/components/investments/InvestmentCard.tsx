import React from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Investment } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';

interface InvestmentCardProps {
  investment: Investment;
  onEdit: (investment: Investment) => void;
  onDelete: (investmentId: string) => void;
}

export function InvestmentCard({ investment, onEdit, onDelete }: InvestmentCardProps) {
  const calculateReturn = () => {
    const returnAmount = investment.currentValue - investment.amount;
    const returnPercentage = (returnAmount / investment.amount) * 100;
    return {
      amount: returnAmount,
      percentage: returnPercentage
    };
  };

  const returns = calculateReturn();
  const isPositiveReturn = returns.amount >= 0;

  return (
    <Card>
      <div className="p-4">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold">{investment.name}</h3>
            <p className="text-sm text-gray-500 capitalize">{investment.type.replace('_', ' ')}</p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={() => onEdit(investment)} variant="secondary">
              Edit
            </Button>
            <Button onClick={() => onDelete(investment.id)} variant="danger">
              Delete
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Invested Amount:</span>
            <span>{formatCurrency(investment.amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Current Value:</span>
            <span>{formatCurrency(investment.currentValue)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Return:</span>
            <span className={isPositiveReturn ? 'text-green-600' : 'text-red-600'}>
              {formatCurrency(Math.abs(returns.amount))} ({returns.percentage.toFixed(2)}%)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Risk Level:</span>
            <span className="capitalize">{investment.riskLevel.replace('_', ' ')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Status:</span>
            <span className="capitalize">{investment.status}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Purchase Date:</span>
            <span>{new Date(investment.purchaseDate).toLocaleDateString()}</span>
          </div>
          {investment.maturityDate && (
            <div className="flex justify-between">
              <span className="text-gray-600">Maturity Date:</span>
              <span>{new Date(investment.maturityDate).toLocaleDateString()}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Platform:</span>
            <span>{investment.platform}</span>
          </div>
          {investment.lastUpdated && (
            <div className="flex justify-between">
              <span className="text-gray-600">Last Updated:</span>
              <span>{new Date(investment.lastUpdated).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {investment.notes && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">{investment.notes}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
