import React, { useEffect, useState } from 'react';
import { 
  createBrowserRouter, 
  RouterProvider, 
  Navigate,
  createRoutesFromElements,
  Route,
  Outlet
} from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { SignIn } from './components/auth/SignIn';
import { SignUp } from './components/auth/SignUp';
import { Dashboard } from './components/Dashboard';
import { ProfileSetup } from './components/profile/ProfileSetup';
import { UserProfileForm } from './components/profile/UserProfileForm';
import { TransactionListContainer } from './components/TransactionListContainer';
import { TransactionForm } from './components/TransactionForm';
import { Reports } from './components/Reports';
import { BudgetTracker } from './components/BudgetTracker';
import { CreditCardManagement } from './components/CreditCardManagement';
import { DebtTracker } from './components/DebtTracker';
import { LoanManagement } from './components/LoanManagement';
import { InvestmentManagement } from './components/investments/InvestmentManagement';
import { FundSourceManagement } from './components/FundSourceManagement';
import { FundSourceTransactions } from './components/fund-sources/FundSourceTransactions';
import { RecurringTransactions } from './components/RecurringTransactions';
import { FinancialConsultant } from './components/FinancialConsultant';
import { Navigation } from './components/Navigation';
import { auth } from './config/firebase';
import { useAuth } from './contexts/AuthContext';

// Import insight components
import { ExpenseAnalysis } from './components/insights/ExpenseAnalysis';
import { IncomeAnalysis } from './components/insights/IncomeAnalysis';
import { SpendingHabits } from './components/insights/SpendingHabits';
import { SavingsAnalysis } from './components/insights/SavingsAnalysis';
import { DebtAnalysis } from './components/insights/DebtAnalysis';
import { CreditCardAnalysis } from './components/insights/CreditCardAnalysis';
import { LoanAnalysis } from './components/insights/LoanAnalysis';
import { InvestmentAnalysis } from './components/insights/InvestmentAnalysis';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navigation />
      <div className="flex-1 w-full">
        <main className="p-4 sm:p-6 lg:p-8 lg:ml-64">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

// Initial loading component
const InitialLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      <p className="mt-4 text-gray-600">Initializing...</p>
    </div>
  </div>
);

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    let unsubscribe: () => void;

    const initialize = async () => {
      try {
        // Wait for Firebase Auth to initialize
        unsubscribe = auth.onAuthStateChanged(() => {
          setIsInitialized(true);
        });
      } catch (error) {
        console.error('Error during initialization:', error);
        // Still set initialized to true to allow the app to load
        setIsInitialized(true);
      }
    };

    initialize();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route 
        element={<AuthProvider><Outlet /></AuthProvider>}
        errorElement={<Navigate to={currentUser ? "/" : "/signin"} replace />}
      >
        {/* Public Routes */}
        <Route 
          path="/signin" 
          element={currentUser ? <Navigate to="/" replace /> : <SignIn />} 
        />
        <Route 
          path="/signup" 
          element={currentUser ? <Navigate to="/" replace /> : <SignUp />} 
        />
        
        {/* Protected Routes */}
        <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
          <Route 
            path="/" 
            element={
              <Layout>
                <Dashboard />
              </Layout>
            } 
          />
          <Route 
            path="/profile/setup" 
            element={<ProfileSetup />} 
          />
          <Route 
            path="/profile" 
            element={
              <Layout>
                <UserProfileForm />
              </Layout>
            } 
          />
          
          {/* Transactions Routes */}
          <Route 
            path="/transactions" 
            element={<Navigate to="/transactions/records" replace />} 
          />
          <Route 
            path="/transactions/new" 
            element={
              <Layout>
                <div className="max-w-2xl mx-auto">
                  <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Transaction</h1>
                  <TransactionForm
                    onSubmit={async () => window.location.replace('/transactions/records')}
                    onCancel={() => window.location.replace('/transactions/records')}
                  />
                </div>
              </Layout>
            } 
          />
          <Route 
            path="/transactions/records" 
            element={
              <Layout>
                <TransactionListContainer />
              </Layout>
            } 
          />
          <Route 
            path="/transactions/recurring" 
            element={
              <Layout>
                <RecurringTransactions />
              </Layout>
            } 
          />

          {/* Other Routes */}
          <Route 
            path="/budget/overview" 
            element={
              <Layout>
                <BudgetTracker />
              </Layout>
            } 
          />
          <Route 
            path="/fund-sources" 
            element={
              <Layout>
                <FundSourceManagement />
              </Layout>
            } 
          />
          <Route 
            path="/fund-sources/:id" 
            element={
              <Layout>
                <FundSourceTransactions />
              </Layout>
            } 
          />
          <Route 
            path="/credit-cards" 
            element={
              <Layout>
                <CreditCardManagement />
              </Layout>
            } 
          />
          <Route 
            path="/loans" 
            element={
              <Layout>
                <LoanManagement />
              </Layout>
            } 
          />
          <Route 
            path="/investments" 
            element={
              <Layout>
                <InvestmentManagement />
              </Layout>
            } 
          />
          <Route 
            path="/insights/overview" 
            element={
              <Layout>
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold text-gray-900">Financial Insights</h1>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ExpenseAnalysis />
                    <IncomeAnalysis />
                    <SpendingHabits />
                    <SavingsAnalysis />
                    <DebtAnalysis />
                    <CreditCardAnalysis />
                    <LoanAnalysis />
                    <InvestmentAnalysis />
                  </div>
                </div>
              </Layout>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <Layout>
                <Reports />
              </Layout>
            } 
          />
          <Route 
            path="/consultant" 
            element={
              <Layout>
                <FinancialConsultant />
              </Layout>
            } 
          />
        </Route>

        {/* Fallback Route */}
        <Route 
          path="*" 
          element={<Navigate to={currentUser ? "/" : "/signin"} replace />} 
        />
      </Route>
    ),
    {
      // Opt-in to future React Router v7 features
      future: {
        // These are placeholders and may change with actual React Router v7 implementation
        v7_normalizeFormMethod: true,
        v7_fetcherPersist: true
      }
    }
  );

  if (!isInitialized) {
    return <InitialLoading />;
  }

  return <RouterProvider router={router} />;
}

export default App;
