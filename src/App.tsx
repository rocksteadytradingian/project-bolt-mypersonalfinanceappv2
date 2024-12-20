import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { SignIn } from './components/auth/SignIn';
import { SignUp } from './components/auth/SignUp';
import { Dashboard } from './components/Dashboard';
import { ProfileSetup } from './components/profile/ProfileSetup';
import { UserProfileForm } from './components/profile/UserProfileForm';
import { TransactionListContainer } from './components/TransactionListContainer';
import { Reports } from './components/Reports';
import { BudgetTracker } from './components/BudgetTracker';
import { CreditCardManagement } from './components/CreditCardManagement';
import { DebtTracker } from './components/DebtTracker';
import { LoanManagement } from './components/LoanManagement';
import { InvestmentManagement } from './components/investments/InvestmentManagement';
import { FundSourceManagement } from './components/FundSourceManagement';
import { RecurringTransactions } from './components/RecurringTransactions';
import { FinancialConsultant } from './components/FinancialConsultant';
import { Navigation } from './components/Navigation';
import { auth } from './config/firebase';

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

function AppRoutes() {
  return (
    <div className="min-h-screen bg-white">
      <Routes>
        {/* Public Routes */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        
        {/* Profile Setup - Protected but without Navigation */}
        <Route path="/profile/setup" element={<ProtectedRoute><ProfileSetup /></ProtectedRoute>} />

        {/* Protected Routes with Navigation */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout>
              <UserProfileForm />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/transactions" element={
          <ProtectedRoute>
            <Layout>
              <TransactionListContainer />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute>
            <Layout>
              <Reports />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/budget" element={
          <ProtectedRoute>
            <Layout>
              <BudgetTracker />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/credit-cards" element={
          <ProtectedRoute>
            <Layout>
              <CreditCardManagement />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/debts" element={
          <ProtectedRoute>
            <Layout>
              <DebtTracker />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/loans" element={
          <ProtectedRoute>
            <Layout>
              <LoanManagement />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/investments" element={
          <ProtectedRoute>
            <Layout>
              <InvestmentManagement />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/fund-sources" element={
          <ProtectedRoute>
            <Layout>
              <FundSourceManagement />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/recurring" element={
          <ProtectedRoute>
            <Layout>
              <RecurringTransactions />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/consultant" element={
          <ProtectedRoute>
            <Layout>
              <FinancialConsultant />
            </Layout>
          </ProtectedRoute>
        } />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Wait for Firebase Auth to initialize
    const unsubscribe = auth.onAuthStateChanged(() => {
      // Add a small delay to ensure auth state is properly synced
      setTimeout(() => {
        setIsInitialized(true);
      }, 100);
    });

    return () => unsubscribe();
  }, []);

  if (!isInitialized) {
    return <InitialLoading />;
  }

  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
