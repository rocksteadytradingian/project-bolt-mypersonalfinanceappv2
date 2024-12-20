import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CategoriesStore {
  categories: string[];
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
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
  'Credit Card Payment',
  'Debt Payment',
  'Loan Payment',
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

export const useCategoriesStore = create<CategoriesStore>()(
  persist(
    (set) => ({
      categories: defaultCategories,
      addCategory: (category) =>
        set((state) => ({
          categories: [...new Set([...state.categories, category])].sort(),
        })),
      removeCategory: (category) =>
        set((state) => ({
          categories: state.categories.filter((c) => c !== category),
        })),
    }),
    {
      name: 'categories-store',
    }
  )
);
