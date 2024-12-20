import React from 'react';
import { Card } from '../ui/Card';
import { Investment } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';
import { useFinanceStore } from '../../store/useFinanceStore';

interface InvestmentDetailsProps {
  investment: Investment;
}

export function InvestmentDetails({ investment }: InvestmentDetailsProps) {
  const { fundSources } = useFinanceStore();

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
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-4">{investment.name}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Investment Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="capitalize">{investment.type.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="capitalize">{investment.category.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform:</span>
                  <span>{investment.platform}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Risk Level:</span>
                  <span className="capitalize">{investment.riskLevel.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="capitalize">{investment.status}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Financial Details</h3>
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
                  <span className="text-gray-600">Expected Return:</span>
                  <span>{investment.expectedReturn}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Dates</h3>
              <div className="space-y-2">
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
                {investment.lastUpdated && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span>{new Date(investment.lastUpdated).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            {investment.notes && (
              <div>
                <h3 className="text-lg font-medium mb-2">Notes</h3>
                <p className="text-gray-600">{investment.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
