import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { signInWithGoogle, getUserProfile } from '../../services/auth/authService';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../config/firebase';

export function GoogleAuth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { userProfile } = useAuth();

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Handle navigation based on profile status
  useEffect(() => {
    if (userProfile) {
      navigate('/', { replace: true });
    }
  }, [userProfile, navigate]);

  const handleGoogleSignIn = async () => {
    if (loading) return;
    
    setLoading(true);
    setError('');

    try {
      // Add delay before sign-in attempt to ensure Firebase is fully initialized
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Log Firebase auth state
      console.log('Firebase Auth State:', {
        initialized: !!auth,
        currentUser: auth?.currentUser?.uid,
        config: auth?.config,
        name: auth?.name
      });

      const result = await signInWithGoogle();
      console.log('Google Sign In Result:', {
        success: true,
        isNewUser: result.isNewUser,
        uid: result.user.uid
      });

      if (result.isNewUser) {
        navigate('/profile/setup', { replace: true });
      }
      // If not a new user, navigation will be handled by the useEffect above
    } catch (error: any) {
      console.error('Google Sign In Error:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });

      // Handle specific error cases
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign in was cancelled. Please try again.');
      } else if (error.code === 'auth/popup-blocked') {
        setError('Sign in popup was blocked. Please allow popups for this site.');
      } else if (error.code === 'auth/network-request-failed') {
        setError('Network error. Please check your connection and try again.');
      } else if (error.code === 'auth/internal-error') {
        setError('An internal error occurred. Please wait a moment and try again.');
      } else if (error.code === 'auth/timeout') {
        setError('The request timed out. Please try again.');
      } else {
        setError(error.message || 'Failed to sign in with Google. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        type="button"
        onClick={handleGoogleSignIn}
        className="w-full flex items-center justify-center"
        disabled={loading}
      >
        {loading ? (
          <>
            <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-neutral-200 border-t-primary"></div>
            Signing in...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
              />
            </svg>
            Continue with Google
          </>
        )}
      </Button>
      
      {error && (
        <div className="mt-2 text-sm text-danger text-center">
          {error}
        </div>
      )}
    </div>
  );
}
