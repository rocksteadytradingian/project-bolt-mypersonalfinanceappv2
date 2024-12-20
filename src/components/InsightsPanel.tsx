import React from 'react';
import { IncomeAnalysis } from './insights/IncomeAnalysis';
import { ExpenseAnalysis } from './insights/ExpenseAnalysis';
import { SavingsAnalysis } from './insights/SavingsAnalysis';
import { SpendingHabits } from './insights/SpendingHabits';
import { DebtAnalysis } from './insights/DebtAnalysis';
import { CreditCardAnalysis } from './insights/CreditCardAnalysis';
import { BudgetAnalysis } from './insights/BudgetAnalysis';
import { LoanAnalysis } from './insights/LoanAnalysis';

export function InsightsPanel() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <IncomeAnalysis />
        <ExpenseAnalysis />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SavingsAnalysis />
        <SpendingHabits />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DebtAnalysis />
        <CreditCardAnalysis />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BudgetAnalysis />
        <LoanAnalysis />
      </div>
    </div>
  );
}