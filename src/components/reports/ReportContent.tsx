import React from 'react';
import { ReportData } from '../../types/reports';
import { FundSourceReport } from './FundSourceReport';
import { TransactionReport } from './TransactionReport';
import { CreditCardReport } from './CreditCardReport';
import { BudgetReport } from './BudgetReport';
import { DebtReport } from './DebtReport';
import { RecurringReport } from './RecurringReport';

interface ReportContentProps {
  data: ReportData;
}

export function ReportContent({ data }: ReportContentProps) {
  switch (data.type) {
    case 'fund-sources':
      return <FundSourceReport data={data.data} />;
    case 'transactions':
      return <TransactionReport data={data.data} summary={data.summary} />;
    case 'credit-cards':
      return <CreditCardReport data={data.data} />;
    case 'budget':
      return <BudgetReport data={data.data} />;
    case 'debts':
      return <DebtReport data={data.data} />;
    case 'recurring':
      return <RecurringReport data={data.data} />;
    default:
      return null;
  }
}