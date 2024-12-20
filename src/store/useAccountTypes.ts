import { AccountType } from '../types/finance';

export const useAccountTypes = () => {
  const types: AccountType[] = [
    'savings',
    'checking',
    'cash',
    'digital',
    'joint_account',
    'dollar_account'
  ];

  const labels: Record<AccountType, string> = {
    savings: 'Savings Account',
    checking: 'Checking Account',
    cash: 'Cash',
    digital: 'Digital Account',
    joint_account: 'Joint Account',
    dollar_account: 'Dollar Account'
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
