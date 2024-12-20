import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

export const updateCreditCardBalance = async (creditCardId: string, amount: number): Promise<void> => {
  try {
    const creditCardRef = doc(db, 'creditCards', creditCardId);
    await updateDoc(creditCardRef, {
      balance: amount,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating credit card balance:', error);
    throw error;
  }
};
