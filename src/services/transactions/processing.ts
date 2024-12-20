import { Transaction } from '../../types/finance';
import { useFinanceStore } from '../../store/useFinanceStore';
import { dateToString } from '../../types/finance';

export const processTransaction = async (transaction: Transaction) => {
  const store = useFinanceStore.getState();

  if (transaction.creditCardId) {
    const creditCard = store.creditCards.find(card => card.id === transaction.creditCardId);
    if (creditCard) {
      if (transaction.type === 'expense') {
        // Increase credit card balance for expenses
        const updatedCard = {
          ...creditCard,
          balance: creditCard.balance + transaction.amount,
          updatedAt: dateToString(new Date())
        };
        store.updateCreditCard(updatedCard);
      } else if (transaction.type === 'debt') {
        // Decrease credit card balance for payments
        const updatedCard = {
          ...creditCard,
          balance: creditCard.balance - transaction.amount,
          updatedAt: dateToString(new Date())
        };
        store.updateCreditCard(updatedCard);
      }
    }
  }

  if (transaction.fundSourceId) {
    const fundSource = store.fundSources.find(source => source.id === transaction.fundSourceId);
    if (fundSource) {
      const updatedSource = {
        ...fundSource,
        balance: transaction.type === 'income' 
          ? fundSource.balance + transaction.amount
          : fundSource.balance - transaction.amount,
        lastUpdated: dateToString(new Date()),
        updatedAt: dateToString(new Date())
      };
      store.updateFundSource(updatedSource);
    }
  }

  if (transaction.loanId) {
    const loan = store.loans.find(l => l.id === transaction.loanId);
    if (loan) {
      const updatedLoan = {
        ...loan,
        balance: loan.balance - transaction.amount,
        currentBalance: loan.currentBalance - transaction.amount,
        updatedAt: dateToString(new Date())
      };
      store.updateLoan(updatedLoan);
    }
  }

  if (transaction.debtId) {
    const debt = store.debts.find(d => d.id === transaction.debtId);
    if (debt) {
      const updatedDebt = {
        ...debt,
        balance: debt.balance - transaction.amount,
        updatedAt: dateToString(new Date())
      };
      store.updateDebt(updatedDebt);
    }
  }
};
