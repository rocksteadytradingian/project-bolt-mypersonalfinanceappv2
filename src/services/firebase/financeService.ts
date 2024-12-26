import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  getDocs, 
  writeBatch,
  limit,
  orderBy,
  startAfter,
  DocumentSnapshot,
  enableIndexedDbPersistence
} from 'firebase/firestore';
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

const BATCH_SIZE = 500;

// Initialize persistence with retry mechanism
const initializePersistence = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      await enableIndexedDbPersistence(db);
      console.log('IndexedDB persistence initialized successfully');
      return;
    } catch (err: any) {
      if (err.code === 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a time
        console.warn('Persistence failed: Multiple tabs open');
        return;
      } else if (err.code === 'unimplemented') {
        // The current browser doesn't support persistence
        console.warn('Persistence not supported in this browser');
        return;
      }
      
      if (i === retries - 1) {
        console.error('Failed to initialize persistence after retries:', err);
      } else {
        console.warn(`Persistence initialization attempt ${i + 1} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
};

// Initialize persistence
initializePersistence();

const PAGE_SIZE = 50;

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

// Cache for last document snapshots (for pagination)
const lastDocCache = new Map<string, DocumentSnapshot>();

// Helper function to get collection reference
const getCollectionRef = (userId: string, collectionName: keyof UserFinancialData) => {
  return collection(db, `users/${userId}/${collectionName}`);
};

// Get paginated data from a collection
const getPaginatedData = async <T>(
  userId: string,
  collectionName: keyof UserFinancialData,
  pageSize: number = PAGE_SIZE
): Promise<T[]> => {
  const collectionRef = getCollectionRef(userId, collectionName);
  const lastDoc = lastDocCache.get(`${userId}_${collectionName}`);
  
  const q = lastDoc
    ? query(collectionRef, orderBy('timestamp', 'desc'), startAfter(lastDoc), limit(pageSize))
    : query(collectionRef, orderBy('timestamp', 'desc'), limit(pageSize));

  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    lastDocCache.set(`${userId}_${collectionName}`, snapshot.docs[snapshot.docs.length - 1]);
  }

  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[];
};

export const getUserFinancialData = async (userId: string): Promise<UserFinancialData> => {
  try {
    // Get initial page of each collection type
    const [
      transactions,
      creditCards,
      fundSources,
      loans,
      debts,
      investments,
      budgets,
      recurringTransactions,
      categories
    ] = await Promise.all([
      getPaginatedData<Transaction>(userId, 'transactions'),
      getPaginatedData<CreditCard>(userId, 'creditCards'),
      getPaginatedData<FundSource>(userId, 'fundSources'),
      getPaginatedData<Loan>(userId, 'loans'),
      getPaginatedData<Debt>(userId, 'debts'),
      getPaginatedData<Investment>(userId, 'investments'),
      getPaginatedData<Budget>(userId, 'budgets'),
      getPaginatedData<RecurringTransaction>(userId, 'recurringTransactions'),
      getPaginatedData<Category>(userId, 'categories')
    ]);

    return {
      transactions,
      creditCards,
      fundSources,
      loans,
      debts,
      investments,
      budgets,
      recurringTransactions,
      categories
    };
  } catch (error) {
    console.error('Error getting user financial data:', error);
    throw error;
  }
};

export const updateUserFinancialData = async <T>(
  userId: string,
  collectionName: keyof UserFinancialData,
  data: T[]
) => {
  try {
    const batch = writeBatch(db);
    const collectionRef = getCollectionRef(userId, collectionName);

    // Process in batches to avoid write limits
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const chunk = data.slice(i, i + BATCH_SIZE);
      
      chunk.forEach(item => {
        const docRef = doc(collectionRef);
        batch.set(docRef, {
          ...item,
          timestamp: new Date().toISOString(),
          userId
        });
      });
    }

    await batch.commit();
    
    // Clear the cache for this collection to force fresh data on next fetch
    lastDocCache.delete(`${userId}_${collectionName}`);
  } catch (error) {
    console.error(`Error updating ${collectionName}:`, error);
    throw error;
  }
};

export const syncFinancialData = async (userId: string) => {
  try {
    // Retry mechanism for data sync
    let retries = 3;
    let data = null;
    
    while (retries > 0 && !data) {
      try {
        data = await getUserFinancialData(userId);
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        console.warn(`Data sync attempt failed, retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (data) {
      const store = useFinanceStore.getState();
      store.setFinancialData(data);
    } else {
      throw new Error('Failed to sync financial data after retries');
    }
  } catch (error) {
    console.error('Error syncing financial data:', error);
    // Initialize with empty data on error
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
    throw error;
  }
};

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
  // Clear all pagination caches
  lastDocCache.clear();
};

// Load more data for a specific collection
export const loadMoreData = async <T>(
  userId: string,
  collectionName: keyof UserFinancialData
): Promise<T[]> => {
  return getPaginatedData<T>(userId, collectionName);
};
