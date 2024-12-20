import { AccountType } from '../types/finance';

export const useAccountTypes = () => {
  const types: AccountType[] = [
    'checking',
    'savings',
    'investment',
    'credit',
    'loan',
    'debt',
    'cash',
    'digital'
  ];

  const labels: Record<AccountType, string> = {
    checking: 'Checking Account',
    savings: 'Savings Account',
    investment: 'Investment Account',
    credit: 'Credit Account',
    loan: 'Loan Account',
    debt: 'Debt Account',
    cash: 'Cash',
    digital: 'Digital Account'
  };

  const getLabel = (type: AccountType): string => {
    return labels[type] || type;
  };

  return {
    types,
    labels,
    getLabel
  };
};
