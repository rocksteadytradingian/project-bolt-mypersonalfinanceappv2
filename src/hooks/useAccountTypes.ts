import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AccountType } from '../types/finance';

interface AccountTypesStore {
  accountTypes: AccountType[];
  addAccountType: (type: string) => void;
}

const defaultAccountTypes: AccountType[] = [
  'savings',
  'checking',
  'cash',
  'investment',
  'credit',
  'digital'
];

export const useAccountTypes = create<AccountTypesStore>()(
  persist(
    (set) => ({
      accountTypes: defaultAccountTypes,
      addAccountType: (type) =>
        set((state) => ({
          accountTypes: [...state.accountTypes, type.toLowerCase() as AccountType],
        })),
    }),
    {
      name: 'account-types-store',
    }
  )
);