import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CategoriesStore {
  categories: string[];
  addCategory: (category: string) => void;
}

const defaultCategories = [
  'Food & Dining',
  'Shopping',
  'Transportation',
  'Bills & Utilities',
  'Entertainment',
  'Health & Fitness',
  'Income',
  'Investment',
  'Debt Payment',
  'Salary',
  'Freelance',
  'Business',
  'Rent',
  'Mortgage',
  'Insurance',
  'Education',
  'Savings',
  'Gift',
];

export const useCategories = create<CategoriesStore>()(
  persist(
    (set) => ({
      categories: defaultCategories,
      addCategory: (category) =>
        set((state) => ({
          categories: [...new Set([...state.categories, category])],
        })),
    }),
    {
      name: 'categories-store',
    }
  )
);