import { useState } from 'react';

interface CreateUserTokenResponse {
  success: boolean;
  token?: string;
  error?: string;
}

interface CreateUserTokenPayload {
  user_id: string;
}

export const useCreateUserToken = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const createUserToken = async (userId: string): Promise<CreateUserTokenResponse> => {
    setLoading(true);
    setError(null);
    setToken(null);

    try {
      const payload: CreateUserTokenPayload = { user_id: userId };

      // Use Next.js API route to avoid CORS/backend URL coupling in the client
      const response = await fetch(`${process.env.NEXT_PUBLIC_NODE_ENV === 'production' ? process.env.NEXT_PUBLIC_PROD_URL : process.env.NEXT_PUBLIC_DEV_URL}/auth/create-user-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // Try to parse JSON even for non-2xx
      const data = await response.json().catch(() => ({ success: false, message: 'Unexpected response' }));

      // Backend returns shape { success, message, data }
      if (!response.ok) {
        // If user already exists, we consider this a non-fatal condition and return success
        const msg = (data?.message || '').toString().toLowerCase();
        if (msg.includes('already exists')) {
          return { success: true };
        }
        throw new Error(data?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Success
      setToken(data?.data?.token ?? null);
      return { success: true, token: data?.data?.token };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to create user token:', errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setToken(null);
  };

  return {
    createUserToken,
    loading,
    error,
    token,
    reset,
  };
};
