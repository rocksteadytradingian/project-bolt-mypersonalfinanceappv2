import { Transaction } from '../../types/finance';
import { useFinanceStore } from '../../store/useFinanceStore';
import { dateToString } from '../../types/finance';

const calculateMonthlyFlow = (transactions: Transaction[]): number => {
  const now = new Date();
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  
  return transactions
    .filter(t => new Date(t.date) >= oneMonthAgo)
    .reduce((total, t) => {
      if (t.type === 'income') {
        return total + t.amount;
      } else if (t.type === 'expense') {
        return total - t.amount;
      }
      return total;
    }, 0);
};

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
        currentBalance: transaction.type === 'income' 
          ? fundSource.currentBalance + transaction.amount
          : fundSource.currentBalance - transaction.amount,
        monthlyFlow: calculateMonthlyFlow([...fundSource.transactions, transaction]),
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
