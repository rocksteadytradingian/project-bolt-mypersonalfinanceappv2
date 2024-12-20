import create from 'zustand';
import { persist } from 'zustand/middleware';

interface CustomAccountTypesState {
  customTypes: string[];
  addCustomType: (type: string) => void;
  removeCustomType: (type: string) => void;
}

export const useCustomAccountTypes = create<CustomAccountTypesState>()(
  persist(
    (set) => ({
      customTypes: [],
      addCustomType: (type: string) =>
        set((state) => ({
          customTypes: [...new Set([...state.customTypes, type])],
        })),
      removeCustomType: (type: string) =>
        set((state) => ({
          customTypes: state.customTypes.filter((t) => t !== type),
        })),
    }),
    {
      name: 'custom-account-types',
    }
  )
);
