import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where,
  getDocs,
  DocumentData,
  QuerySnapshot,
  DocumentReference
} from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Transaction, PaymentMethod } from '../../types/finance';
import { updateCreditCardBalance } from './creditCardUpdater';
import { updateDebtBalance } from './debtUpdater';
import { updateFundSourceBalance } from './fundSourceUpdater';
import { updateLoanBalance } from './loanUpdater';

export const processTransaction = async (transaction: Transaction): Promise<void> => {
  // Process based on payment method
  if (transaction.paymentMethod === 'credit_card' && transaction.creditCardId) {
    await updateCreditCardBalance(transaction.creditCardId, transaction.amount);
  }

  // Process based on associated IDs
  if (transaction.debtId) {
    await updateDebtBalance(transaction.debtId, transaction.amount);
  }

  if (transaction.fundSourceId) {
    await updateFundSourceBalance(transaction.fundSourceId, transaction.amount);
  }

  if (transaction.loanId) {
    await updateLoanBalance(transaction.loanId, transaction.amount);
  }
};

export const addTransaction = async (
  transaction: Omit<Transaction, 'id'>,
  userId: string
): Promise<string> => {
  try {
    const transactionWithUser = {
      ...transaction,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(
      collection(db, 'transactions'), 
      transactionWithUser
    );

    // Process the transaction based on its type
    await processTransaction({
      ...transactionWithUser,
      id: docRef.id
    });

    return docRef.id;
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
};

export const updateTransaction = async (
  id: string,
  updates: Partial<Transaction>
): Promise<void> => {
  try {
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await updateDoc(doc(db, 'transactions', id), updateData);

    // If amount changed or payment method changed, process the transaction again
    if ('amount' in updates || 'paymentMethod' in updates) {
      const fullTransaction = { ...updates, id } as Transaction;
      await processTransaction(fullTransaction);
    }
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

export const deleteTransaction = async (transactionId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'transactions', transactionId));
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

export const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    const q = query(
      collection(db, 'transactions'),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Transaction[];
  } catch (error) {
    console.error('Error getting user transactions:', error);
    throw error;
  }
};
