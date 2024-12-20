import React, { useState, useCallback, useEffect, Suspense, memo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { signIn } from '../../services/auth/authService';
import { Button } from '../ui/Button';
import { Logo } from '../Logo';

// Lazy load GoogleAuth component with named export
const GoogleAuthComponent = React.lazy(() => 
  import('./GoogleAuth').then(module => ({ default: module.GoogleAuth }))
);

// Memoize static components
const MemoizedLogo = memo(Logo);

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

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-danger p-4">
          Something went wrong. Please try refreshing the page.
        </div>
      );
    }
    return this.props.children;
  }
}

// Form validation
const validateForm = (email: string, password: string) => {
  const errors: { email?: string; password?: string } = {};
  
  if (!email) {
    errors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.email = 'Email is invalid';
  }
  
  if (!password) {
    errors.password = 'Password is required';
  }
  
  return errors;
};

export function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, userProfile, loading: authLoading } = useAuth();

  // Add preconnect hint for external resources
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = 'https://apis.google.com';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Handle auth state changes
  useEffect(() => {
    // Don't redirect while auth is still loading
    if (authLoading) return;

    // Only handle redirects if we're on the signin page
    if (location.pathname !== '/signin') return;

    if (currentUser) {
      if (userProfile) {
        navigate('/', { replace: true });
      } else {
        navigate('/profile/setup', { replace: true });
      }
    }
  }, [currentUser, userProfile, authLoading, navigate, location]);

  useEffect(() => {
    // Add a small delay to prevent flash of loading state
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    // Client-side validation
    const errors = validateForm(email, password);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setError('');
    setValidationErrors({});
    setLoading(true);

    try {
      await signIn(email, password);
      // Navigation will be handled by the useEffect
    } catch (err: any) {
      setError(err.message);
      console.error('Sign in error:', err);
    } finally {
      setLoading(false);
    }
  }, [email, password, loading]);

  // Show loading state while auth is initializing
  if (authLoading || !isVisible) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-card">
          <div className="flex flex-col items-center justify-center">
            <MemoizedLogo className="w-20 h-20" />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-neutral-900">
              Welcome back
            </h2>
            <p className="mt-2 text-center text-sm text-neutral-600">
              Sign in to continue to your account
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
            {error && (
              <div className="rounded-md bg-danger/10 p-4">
                <div className="text-sm text-danger">
                  {error}
                </div>
              </div>
            )}

            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationErrors.email) {
                      setValidationErrors(prev => ({ ...prev, email: undefined }));
                    }
                  }}
                  className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                    validationErrors.email ? 'border-danger' : 'border-neutral-300'
                  } placeholder-neutral-500 text-neutral-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm`}
                  placeholder="Email address"
                  disabled={loading}
                />
                {validationErrors.email && (
                  <p className="mt-1 text-sm text-danger">{validationErrors.email}</p>
                )}
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (validationErrors.password) {
                      setValidationErrors(prev => ({ ...prev, password: undefined }));
                    }
                  }}
                  className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                    validationErrors.password ? 'border-danger' : 'border-neutral-300'
                  } placeholder-neutral-500 text-neutral-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm`}
                  placeholder="Password"
                  disabled={loading}
                />
                {validationErrors.password && (
                  <p className="mt-1 text-sm text-danger">{validationErrors.password}</p>
                )}
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full flex justify-center py-2 px-4"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-neutral-200 border-t-primary"></div>
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-neutral-500">Or</span>
              </div>
            </div>

            <div>
              <Suspense fallback={
                <div className="w-full h-10 bg-neutral-100 animate-pulse rounded-md"></div>
              }>
                <GoogleAuthComponent />
              </Suspense>
            </div>

            <div className="flex items-center justify-center">
              <div className="text-sm">
                <span className="text-neutral-500">Don't have an account? </span>
                <Link
                  to="/signup"
                  className="font-medium text-primary hover:text-primary-dark"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </ErrorBoundary>
  );
}
