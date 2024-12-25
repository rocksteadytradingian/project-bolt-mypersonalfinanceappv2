import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Transaction } from '../../types/finance';
import { v4 as uuidv4 } from 'uuid';
import { useFinanceStore } from '../../store/useFinanceStore';
import { processTransaction as processTransactionInternal } from './processing';

export const processTransaction = async (transaction: Transaction): Promise<void> => {
  const store = useFinanceStore.getState();
  await processTransactionInternal(transaction, store);
};

export const addTransaction = async (
  transaction: Omit<Transaction, 'id'>,
  userId: string
): Promise<string> => {
  try {
    const docRef = doc(db, `financial_records/${userId}`);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Financial records not found');
    }

    const data = docSnap.data();
    const transactionId = uuidv4();
    const newTransaction = {
      ...transaction,
      id: transactionId,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add new transaction to existing transactions array
    const updatedTransactions: Transaction[] = [...(data.transactions || []), newTransaction];

    // Update the financial_records document
    await setDoc(docRef, {
      ...data,
      transactions: updatedTransactions
    }, { merge: true });

    // Process the transaction based on its type
    const store = useFinanceStore.getState();
    await processTransactionInternal(newTransaction, store);

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
    const docRef = doc(db, `financial_records/${userId}`);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Financial records not found');
    }

    const data = docSnap.data();
    const transactions: Transaction[] = data.transactions || [];
    
    // Find and update the specific transaction
    const updatedTransactions = transactions.map((t: Transaction) => 
      t.id === id 
        ? { ...t, ...updates, updatedAt: new Date().toISOString() }
        : t
    );

    // Update the financial_records document
    await setDoc(docRef, {
      ...data,
      transactions: updatedTransactions
    }, { merge: true });

    // If amount changed or payment method changed, process the transaction again
    if ('amount' in updates || 'paymentMethod' in updates) {
      const fullTransaction = transactions.find(t => t.id === id);
      if (fullTransaction) {
        const store = useFinanceStore.getState();
        await processTransactionInternal({ ...fullTransaction, ...updates }, store);
      }
    }
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

export const deleteTransaction = async (transactionId: string, userId: string): Promise<void> => {
  try {
    const docRef = doc(db, `financial_records/${userId}`);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Financial records not found');
    }

    const data = docSnap.data();
    const transactions = data.transactions || [];
    
    // Filter out the transaction to delete
    const updatedTransactions = transactions.filter((t: Transaction) => t.id !== transactionId);

    // Update the financial_records document
    await setDoc(docRef, {
      ...data,
      transactions: updatedTransactions
    }, { merge: true });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

export const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    const docRef = doc(db, `financial_records/${userId}`);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return [];
    }

    const data = docSnap.data();
    return data.transactions || [];
  } catch (error) {
    console.error('Error getting user transactions:', error);
    throw error;
  }
};
