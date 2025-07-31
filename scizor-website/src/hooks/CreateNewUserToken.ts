import { useState } from 'react';

interface CreateUserTokenResponse {
  success: boolean;
  token?: string;
  error?: string;
}

interface CreateUserTokenPayload {
  user_id: string;
}

const DEV_URL = 'http://localhost:5000';

export const useCreateUserToken = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const createUserToken = async (userId: string): Promise<CreateUserTokenResponse> => {
    setLoading(true);
    setError(null);
    setToken(null);

    try {
      const payload: CreateUserTokenPayload = {
        user_id: userId
      };

      console.log('Creating user token for:', userId);
      console.log('API URL:', `${DEV_URL}/auth/create-user-token`);

      const response = await fetch(`${DEV_URL}/auth/create-user-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Token created successfully:', data);

      setToken(data.token);
      return {
        success: true,
        token: data.token
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('Failed to create user token:', errorMessage);
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
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
    reset
  };
};
