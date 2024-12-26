import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  getDocs,
  DocumentSnapshot,
  writeBatch
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Transaction } from '../../types/finance';
import { v4 as uuidv4 } from 'uuid';
import { handleTransaction as handleTransactionCore } from './processing';

const PAGE_SIZE = 20;
const BATCH_SIZE = 500;

// Cache for pagination
const lastDocCache = new Map<string, DocumentSnapshot>();

export const handleTransaction = async (transaction: Transaction): Promise<void> => {
  await handleTransactionCore(transaction);
};

export const addTransaction = async (
  transaction: Omit<Transaction, 'id'>,
  userId: string
): Promise<string> => {
  try {
    const transactionId = uuidv4();
    const newTransaction = {
      ...transaction,
      id: transactionId,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timestamp: new Date().toISOString() // For ordering
    };

    // Add to transactions subcollection
    const transactionRef = doc(collection(db, `users/${userId}/transactions`), transactionId);
    await setDoc(transactionRef, newTransaction);

    // Process the transaction based on its type
    await handleTransaction(newTransaction);

    return transactionId;
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
};

export const updateTransaction = async (
  id: string,
  updates: Partial<Transaction>,
  userId: string
): Promise<void> => {
  try {
    const transactionRef = doc(db, `users/${userId}/transactions/${id}`);
    
    const updatedData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await setDoc(transactionRef, updatedData, { merge: true });

    // If amount changed or payment method changed, process the transaction again
    if ('amount' in updates || 'paymentMethod' in updates) {
      const fullTransaction = { ...updates, id, userId } as Transaction;
      await handleTransaction(fullTransaction);
    }
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

export const deleteTransaction = async (transactionId: string, userId: string): Promise<void> => {
  try {
    const transactionRef = doc(db, `users/${userId}/transactions/${transactionId}`);
    await deleteDoc(transactionRef);
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

export const getUserTransactions = async (
  userId: string,
  pageSize: number = PAGE_SIZE,
  startDate?: string,
  endDate?: string
): Promise<Transaction[]> => {
  try {
    const transactionsRef = collection(db, `users/${userId}/transactions`);
    const lastDoc = lastDocCache.get(userId);
    
    // Build query with filters
    let baseQuery = query(
      transactionsRef,
      orderBy('timestamp', 'desc')
    );

    if (startDate && endDate) {
      baseQuery = query(
        baseQuery,
        where('createdAt', '>=', startDate),
        where('createdAt', '<=', endDate)
      );
    }

    // Add pagination
    const paginatedQuery = lastDoc
      ? query(baseQuery, startAfter(lastDoc), limit(pageSize))
      : query(baseQuery, limit(pageSize));

    const snapshot = await getDocs(paginatedQuery);
    
    if (!snapshot.empty) {
      lastDocCache.set(userId, snapshot.docs[snapshot.docs.length - 1]);
    }

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Transaction));
  } catch (error) {
    console.error('Error getting user transactions:', error);
    throw error;
  }
};

// Load more transactions
export const loadMoreTransactions = async (
  userId: string,
  pageSize: number = PAGE_SIZE
): Promise<Transaction[]> => {
  return getUserTransactions(userId, pageSize);
};

// Clear pagination cache
export const clearTransactionCache = (userId: string) => {
  lastDocCache.delete(userId);
};

// Batch import transactions
export const batchImportTransactions = async (
  userId: string,
  transactions: Omit<Transaction, 'id'>[]
): Promise<void> => {
  try {
    const batch = writeBatch(db);
    const transactionsRef = collection(db, `users/${userId}/transactions`);

    // Process in batches to avoid write limits
    for (let i = 0; i < transactions.length; i += BATCH_SIZE) {
      const chunk = transactions.slice(i, i + BATCH_SIZE);
      
      chunk.forEach(transaction => {
        const transactionId = uuidv4();
        const docRef = doc(transactionsRef, transactionId);
        batch.set(docRef, {
          ...transaction,
          id: transactionId,
          userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          timestamp: new Date().toISOString()
        });
      });

      await batch.commit();
    }

    // Clear cache to force fresh data on next fetch
    clearTransactionCache(userId);
  } catch (error) {
    console.error('Error batch importing transactions:', error);
    throw error;
  }
};
