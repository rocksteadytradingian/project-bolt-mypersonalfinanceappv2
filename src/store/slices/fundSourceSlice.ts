import { FundSource } from '../../types/finance';

export interface FundSourceSlice {
  fundSources: FundSource[];
  addFundSource: (fundSource: Omit<FundSource, 'id'>) => void;
  updateFundSource: (id: string, fundSource: Partial<FundSource>) => void;
  deleteFundSource: (id: string) => void;
}

export const createFundSourceSlice = (set: any): FundSourceSlice => ({
  fundSources: [],
  addFundSource: (fundSource) => set((state: any) => ({
    fundSources: [...state.fundSources, { ...fundSource, id: crypto.randomUUID() }],
  })),
  updateFundSource: (id, fundSource) => set((state: any) => ({
    fundSources: state.fundSources.map((fs: FundSource) => 
      fs.id === id ? { ...fs, ...fundSource } : fs
    ),
  })),
  deleteFundSource: (id) => set((state: any) => ({
    fundSources: state.fundSources.filter((fs: FundSource) => fs.id !== id),
  })),
});