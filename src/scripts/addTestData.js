// Add test data to finance store
const addTestData = () => {
  const { addFundSource, addDebt, addTransaction } = window.useFinanceStore.getState();

  // Add a test fund source
  addFundSource({
    bankName: "Test Bank",
    accountName: "Checking Account",
    accountType: "checking",
    balance: 5000,
    lastUpdated: new Date()
  });

  // Add test debts
  const carLoanId = crypto.randomUUID();
  const creditCardDebtId = crypto.randomUUID();
  const personalLoanId = crypto.randomUUID();

  // Car Loan
  addDebt({
    id: carLoanId,
    name: "Car Loan",
    amount: 15000,
    interestRate: 4.5,
    minimumPayment: 300,
    dueDate: "2024-01-15"
  });

  // Credit Card Debt
  addDebt({
    id: creditCardDebtId,
    name: "Credit Card Debt",
    amount: 5000,
    interestRate: 18.99,
    minimumPayment: 150,
    dueDate: "2024-01-20"
  });

  // Personal Loan
  addDebt({
    id: personalLoanId,
    name: "Personal Loan",
    amount: 8000,
    interestRate: 10.5,
    minimumPayment: 200,
    dueDate: "2024-01-25"
  });

  // Add test transactions for debts
  // Car Loan transactions
  addTransaction({
    date: new Date(2023, 11, 15),
    amount: 300,
    type: 'expense',
    category: 'Debt Payment',
    details: 'Car Loan Monthly Payment',
    debtId: carLoanId
  });

  addTransaction({
    date: new Date(2023, 10, 15),
    amount: 300,
    type: 'expense',
    category: 'Debt Payment',
    details: 'Car Loan Monthly Payment',
    debtId: carLoanId
  });

  // Credit Card Debt transactions
  addTransaction({
    date: new Date(2023, 11, 20),
    amount: 200,
    type: 'expense',
    category: 'Debt Payment',
    details: 'Credit Card Debt Payment',
    debtId: creditCardDebtId
  });

  addTransaction({
    date: new Date(2023, 10, 20),
    amount: 150,
    type: 'expense',
    category: 'Debt Payment',
    details: 'Credit Card Debt Payment',
    debtId: creditCardDebtId
  });

  // Personal Loan transactions
  addTransaction({
    date: new Date(2023, 11, 25),
    amount: 250,
    type: 'expense',
    category: 'Debt Payment',
    details: 'Personal Loan Payment',
    debtId: personalLoanId
  });

  addTransaction({
    date: new Date(2023, 10, 25),
    amount: 200,
    type: 'expense',
    category: 'Debt Payment',
    details: 'Personal Loan Payment',
    debtId: personalLoanId
  });
};

// Execute
addTestData();
