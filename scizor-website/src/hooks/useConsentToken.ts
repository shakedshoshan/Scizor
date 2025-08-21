import { useState } from 'react';

interface ConsentTokenResponse {
  success: boolean;
  message: string;
  data: {
    consent_token: string;
    expires_in: number;
    code_challenge: string | null;
  } | null;
}

interface ConsentTokenPayload {
  userId: string;
  userEmail: string;
  userName?: string;
  codeChallenge?: string;
}

interface UseConsentTokenReturn {
  generateConsentToken: (payload: ConsentTokenPayload) => Promise<ConsentTokenResponse>;
  loading: boolean;
  error: string | null;
  consentToken: string | null;
  reset: () => void;
}

export const useConsentToken = (): UseConsentTokenReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consentToken, setConsentToken] = useState<string | null>(null);

  const generateConsentToken = async (payload: ConsentTokenPayload): Promise<ConsentTokenResponse> => {
    setLoading(true);
    setError(null);
    setConsentToken(null);

    try {
      // Get backend URL based on environment
      const base = process.env.NEXT_PUBLIC_NODE_ENV === 'production' 
        ? process.env.NEXT_PUBLIC_PROD_URL 
        : process.env.NEXT_PUBLIC_DEV_URL;
      const url = base || 'http://localhost:5000';

      // Call backend API directly
      const response = await fetch(`${url}/auth/consent-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Parse response
      const data = await response.json().catch(() => ({ 
        success: false, 
        message: 'Unexpected backend response', 
        data: null 
      }));

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (data.success && data.data?.consent_token) {
        setConsentToken(data.data.consent_token);
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate consent token';
      console.error('Failed to generate consent token:', errorMessage);
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
        data: null
      };
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setConsentToken(null);
  };

  return {
    generateConsentToken,
    loading,
    error,
    consentToken,
    reset,
  };
};
