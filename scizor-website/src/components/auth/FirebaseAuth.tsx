'use client';

import React from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { useAuth } from '@/contexts/AuthContext';
import FirebaseUIWrapper from './FirebaseUIWrapper';

// FirebaseUI config
const uiConfig = {
  signInSuccessUrl: '/dashboard',
  signInOptions: [
    {
      provider: 'google.com',
      providerName: 'Google',
      buttonColor: '#4285F4',
      iconUrl: 'https://developers.google.com/identity/images/g-logo.png'
    },
    {
      provider: 'password',
      requireDisplayName: false
    }
  ],
  signInFlow: 'popup',
  tosUrl: '/terms',
  privacyPolicyUrl: '/privacy',
  callbacks: {
    signInSuccessWithAuthResult: function(authResult: any, redirectUrl: string) {
      // User successfully signed in.
      // Return type determines whether we continue the redirect automatically
      // or whether we leave that to developer to handle.
      return true;
    },
    signInFailure: function(error: any) {
      // Some unrecoverable error occurred during sign-in.
      console.error('Sign-in error:', error);
      return Promise.resolve();
    },
    uiShown: function() {
      // The widget is rendered.
      console.log('FirebaseUI widget is shown');
    }
  }
};

const FirebaseAuth: React.FC = () => {
  const { user, loading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(getAuth());
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome!</h2>
          <div className="mb-4">
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-16 h-16 rounded-full mx-auto mb-2"
              />
            )}
            <p className="text-gray-700">{user.displayName || user.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
        Sign In to Scizor
      </h2>
      <div className="text-center mb-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Loading authentication...</p>
      </div>
      <FirebaseUIWrapper config={uiConfig} containerId="firebaseui-auth-container" />
    </div>
  );
};

export default FirebaseAuth; 