import { useState } from 'react';

interface ReturnToFreeResponse {
  success: boolean;
  message: string;
  data?: {
    user_id: string;
    tokens: number;
    is_premium: boolean;
  };
}

interface ReturnToFreePayload {
  user_id: string;
}

interface UseReturnToFreeReturn {
  returnToFree: (userId: string) => Promise<ReturnToFreeResponse>;
  loading: boolean;
  error: string | null;
  data: ReturnToFreeResponse['data'] | null;
  reset: () => void;
}

export const useReturnToFree = (): UseReturnToFreeReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ReturnToFreeResponse['data'] | null>(null);

  const returnToFree = async (userId: string): Promise<ReturnToFreeResponse> => {
    setLoading(true);
    setError(null);
    setData(null);

    try {
      // Get backend URL based on environment
      const base = process.env.NEXT_PUBLIC_NODE_ENV === 'production' 
        ? process.env.NEXT_PUBLIC_PROD_URL 
        : process.env.NEXT_PUBLIC_DEV_URL;
      const url = base || 'http://localhost:5000';

      const payload: ReturnToFreePayload = { user_id: userId };

      // Call backend API directly
      const response = await fetch(`${url}/payment/return-to-free`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Parse response
      const responseData = await response.json().catch(() => ({ 
        success: false, 
        message: 'Unexpected backend response'
      }));

      if (!response.ok) {
        throw new Error(responseData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      if (responseData.success && responseData.data) {
        setData(responseData.data);
      }

      return responseData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to return to free plan';
      console.error('Failed to return to free plan:', errorMessage);
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setData(null);
  };

  return {
    returnToFree,
    loading,
    error,
    data,
    reset,
  };
};
