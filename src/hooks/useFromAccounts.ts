import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FromAccountsStore {
  accounts: string[];
  addAccount: (account: string) => void;
}

const defaultAccounts = [
  'Cash',
  'Bank Account',
  'Credit Card',
  'Savings Account',
  'Investment Account',
  'Digital Wallet',
  'Business Account',
];

export const useFromAccounts = create<FromAccountsStore>()(
  persist(
    (set) => ({
      accounts: defaultAccounts,
      addAccount: (account) =>
        set((state) => ({
          accounts: [...new Set([...state.accounts, account])],
        })),
    }),
    {
      name: 'from-accounts-store',
    }
  )
);