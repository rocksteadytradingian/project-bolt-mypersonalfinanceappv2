import React, { Suspense, useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { auth, db } from './config/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { enableIndexedDbPersistence } from 'firebase/firestore'

// Initialize Firebase persistence
const initializeFirebase = async () => {
  try {
    await enableIndexedDbPersistence(db);
    console.log('Firebase persistence initialized');
  } catch (err: any) {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab.');
    } else if (err.code === 'unimplemented') {
      console.warn('Persistence not supported by browser');
    } else {
      console.error('Error initializing persistence:', err);
    }
  }
};

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto"></div>
      <p className="mt-4 text-gray-600">Loading Make Money Move...</p>
    </div>
  </div>
);

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Application Error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-center px-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Oops! Something went wrong</h1>
            <p className="text-gray-600 mb-4">We're having trouble loading the application.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Root component to handle initialization
const Root = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let unsubscribe: () => void;

    const initialize = async () => {
      try {
        // Initialize Firebase persistence
        await initializeFirebase();

        // Wait for initial auth state
        unsubscribe = onAuthStateChanged(auth, () => {
          setIsInitialized(true);
        });
      } catch (error) {
        console.error('Error during initialization:', error);
        setIsInitialized(true); // Still set initialized to allow app to load
      }
    };

    initialize();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingScreen />}>
        <App />
      </Suspense>
    </ErrorBoundary>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
