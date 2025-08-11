'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface AuthParams {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  codeChallengeMethod?: string;
  state?: string;
  scope?: string;
  userId: string;
}

const DeviceConsentContent: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [authParams, setAuthParams] = useState<AuthParams | null>(null);
  const [userEmail, setUserEmail] = useState('');
  const [consentToken, setConsentToken] = useState('');
  const [showConsentToken, setShowConsentToken] = useState(false);

  useEffect(() => {
    // Extract parameters from URL
    const clientId = searchParams.get('client_id');
    const redirectUri = searchParams.get('redirect_uri');
    const codeChallenge = searchParams.get('code_challenge');
    const codeChallengeMethod = searchParams.get('code_challenge_method');
    const state = searchParams.get('state');
    const scope = searchParams.get('scope');
    const userId = searchParams.get('user_id');
    const email = searchParams.get('email');

    // Debug logging
    console.log('🔍 Consent Page Debug - URL Parameters:');
    console.log('  client_id:', clientId);
    console.log('  redirect_uri:', redirectUri);
    console.log('  code_challenge:', codeChallenge);
    console.log('  code_challenge_method:', codeChallengeMethod);
    console.log('  state:', state);
    console.log('  scope:', scope);
    console.log('  user_id:', userId);
    console.log('  email:', email);
    console.log('  Full URL:', window.location.href);

    if (!clientId || !redirectUri || !codeChallenge || !userId) {
      console.error('❌ Missing required parameters:', {
        clientId: !!clientId,
        redirectUri: !!redirectUri,
        codeChallenge: !!codeChallenge,
        userId: !!userId
      });
      setError('Invalid consent parameters');
      return;
    }

    console.log('✅ All required parameters found');

    setAuthParams({
      clientId,
      redirectUri,
      codeChallenge,
      codeChallengeMethod: codeChallengeMethod || undefined,
      state: state || undefined,
      scope: scope || undefined,
      userId
    });
    setUserEmail(email || '');
  }, [searchParams]);

  const handleGrantPermission = async () => {
    console.log('🔍 handleGrantPermission called');
    setIsLoading(true);
    setError('');

    if (!authParams) {
      setError('Authentication parameters not found');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔍 Generating JWT consent token with PKCE challenge...');
      
      // Generate JWT consent token by calling backend with PKCE challenge
      const response = await fetch('/api/auth/consent-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: authParams.userId,
          userEmail: userEmail,
          userName: userEmail.split('@')[0], // Use email prefix as default name
          codeChallenge: authParams.codeChallenge // Include PKCE challenge
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to generate consent token' }));
        throw new Error(errorData.message || 'Failed to generate consent token');
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Generated consent token with PKCE challenge:', result.data.consent_token);
        setConsentToken(result.data.consent_token);
        setShowConsentToken(true);
        setError(''); // Clear any previous errors
      } else {
        throw new Error(result.message || 'Failed to generate consent token');
      }
      
      setIsLoading(false);
      
    } catch (error) {
      console.error('❌ Error in handleGrantPermission:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate consent token');
      setIsLoading(false);
    }
  };

  const handleDenyPermission = () => {
    if (!authParams) {
      setError('Authentication parameters not found');
      return;
    }
    
    // Redirect to desktop app with error
    const redirectUrl = `${authParams.redirectUri}?error=access_denied&state=${authParams.state || ''}`;
    window.location.href = redirectUrl;
  };

  const copyConsentToken = () => {
    console.log('🔍 copyConsentToken called, consentToken:', consentToken);
    if (consentToken) {
      navigator.clipboard.writeText(consentToken);
      alert('Consent token copied to clipboard!');
      console.log('✅ Consent token copied to clipboard');
    } else {
      console.error('❌ No consent token to copy');
    }
  };

  if (error) {
    console.log('🔍 Rendering error state:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Consent Error</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/auth')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!authParams) {
    console.log('🔍 Rendering loading state - no authParams');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  console.log('🔍 Rendering main consent page:', {
    authParams: !!authParams,
    userEmail,
    consentToken,
    showConsentToken,
    isLoading,
    error
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Grant Permission
          </h1>
          <p className="text-lg text-gray-600">
            Scizor Desktop App wants to access your account
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Scizor Desktop App</h3>
              <p className="text-sm text-gray-600">Desktop Application</p>
            </div>
          </div>
          
          <div className="text-sm text-gray-700">
            <p className="mb-2">This app will be able to:</p>
            <ul className="space-y-1 text-gray-600">
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Access your basic profile information
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Sync your notes and data
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Use AI features on your behalf
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600">
            <strong>Signed in as:</strong> {userEmail}
          </p>
          {authParams.codeChallenge && (
            <p className="text-xs text-gray-500 mt-2">
              <strong>PKCE Challenge:</strong> {authParams.codeChallenge.substring(0, 20)}...
            </p>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {showConsentToken && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            <h3 className="font-semibold mb-2">✅ Authorization Successful!</h3>
            <p className="mb-3">Your consent token has been generated with PKCE security. Please copy it and paste it into your desktop application.</p>
            <div className="bg-white p-3 border border-green-300 rounded mb-3">
              <p className="text-sm font-mono break-all">{consentToken}</p>
            </div>
            <button
              onClick={copyConsentToken}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
            >
              📋 Copy Consent Token
            </button>
          </div>
        )}

        <div className="space-y-3">
          {!showConsentToken && (
            <>
              <button
                onClick={handleGrantPermission}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 font-semibold"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Granting Permission...
                  </div>
                ) : (
                  'Grant Permission'
                )}
              </button>
              
              <button
                onClick={handleDenyPermission}
                disabled={isLoading}
                className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </>
          )}
          
          {showConsentToken && (
            <button
              onClick={() => window.close()}
              className="w-full bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 transition-colors"
            >
              ✅ Done - Close Window
            </button>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By granting permission, you allow the desktop app to access your account data.
            This authorization uses PKCE (Proof Key for Code Exchange) for enhanced security.
            You can revoke this permission at any time in your account settings.
          </p>
        </div>
      </div>
    </div>
  );
};

const DeviceConsentPage: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    }>
      <DeviceConsentContent />
    </Suspense>
  );
};

export default DeviceConsentPage; 