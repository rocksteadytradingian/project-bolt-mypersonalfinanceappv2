import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { 
  Transaction, 
  CreditCard, 
  FundSource, 
  Loan, 
  Debt, 
  Investment,
  Budget,
  RecurringTransaction,
  Category
} from '../../types/finance';
import { useFinanceStore } from '../../store/useFinanceStore';

interface UserFinancialData {
  transactions: Transaction[];
  creditCards: CreditCard[];
  fundSources: FundSource[];
  loans: Loan[];
  debts: Debt[];
  investments: Investment[];
  budgets: Budget[];
  recurringTransactions: RecurringTransaction[];
  categories: Category[];
}

export const getUserFinancialData = async (userId: string): Promise<UserFinancialData | null> => {
  try {
    const docRef = doc(db, `financial_records/${userId}`);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserFinancialData;
    }

    // If no data exists, create initial structure
    const initialData: UserFinancialData = {
      transactions: [],
      creditCards: [],
      fundSources: [],
      loans: [],
      debts: [],
      investments: [],
      budgets: [],
      recurringTransactions: [],
      categories: []
    };

    await setDoc(docRef, initialData);
    return initialData;
  } catch (error) {
    console.error('Error getting user financial data:', error);
    throw error;
  }
};

export const updateUserFinancialData = async (
  userId: string,
  collection: keyof UserFinancialData,
  data: any
) => {
  try {
    const docRef = doc(db, `financial_records/${userId}`);
    const docSnap = await getDoc(docRef);
    
    // Get existing data or create initial structure
    const existingData = docSnap.exists() 
      ? docSnap.data() as UserFinancialData 
      : {
          transactions: [],
          creditCards: [],
          fundSources: [],
          loans: [],
          debts: [],
          investments: [],
          budgets: [],
          recurringTransactions: [],
          categories: []
        };

    // Update only the specified collection while preserving others
    const updatedData = {
      ...existingData,
      [collection]: data
    };

    // Write back the complete data
    await setDoc(docRef, updatedData);
  } catch (error) {
    console.error('Error updating user financial data:', error);
    throw error;
  }
};

// Helper function to sync store with Firebase data
export const syncFinancialData = async (userId: string) => {
  try {
    const docRef = doc(db, `financial_records/${userId}`);
    const docSnap = await getDoc(docRef);
    const store = useFinanceStore.getState();

    if (docSnap.exists()) {
      const data = docSnap.data() as UserFinancialData;
      // Update store with Firebase data
      store.setFinancialData({
        transactions: data.transactions || [],
        creditCards: data.creditCards || [],
        fundSources: data.fundSources || [],
        loans: data.loans || [],
        debts: data.debts || [],
        investments: data.investments || [],
        budgets: data.budgets || [],
        recurringTransactions: data.recurringTransactions || [],
        categories: data.categories || []
      });
    } else {
      // If document doesn't exist, create it with initial data
      const initialData: UserFinancialData = {
        transactions: [],
        creditCards: [],
        fundSources: [],
        loans: [],
        debts: [],
        investments: [],
        budgets: [],
        recurringTransactions: [],
        categories: []
      };
      await setDoc(docRef, initialData);
      store.setFinancialData(initialData);
    }
  } catch (error) {
    console.error('Error syncing financial data:', error);
    // Don't throw error to prevent blocking the UI
    // Instead, set empty data
    const store = useFinanceStore.getState();
    store.setFinancialData({
      transactions: [],
      creditCards: [],
      fundSources: [],
      loans: [],
      debts: [],
      investments: [],
      budgets: [],
      recurringTransactions: [],
      categories: []
    });
  }
};

// Helper function to clear store data on sign out
export const clearFinancialData = () => {
  const store = useFinanceStore.getState();
  store.setFinancialData({
    transactions: [],
    creditCards: [],
    fundSources: [],
    loans: [],
    debts: [],
    investments: [],
    budgets: [],
    recurringTransactions: [],
    categories: []
  });
};
