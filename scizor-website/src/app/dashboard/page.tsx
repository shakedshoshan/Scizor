'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import UserAvatar from '@/components/UserAvatar';
import { useState, useEffect } from 'react';
import { getUserData } from '@/hooks/getUserToken';

interface UserData {
  tokens: number;
  is_premium: boolean;
}

// Custom hook for fetching user data using the API function
const useUserData = (userId: string | undefined) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const result = await getUserData(userId);
        console.log(result);
        
        if (!result.success) {
          throw new Error(result.error);
        }
        
        setUserData(result.data);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  return { userData, loading, error };
};

function DashboardContent() {
  const { user } = useAuth();
  const router = useRouter();
  const { userData, loading, error } = useUserData(user?.uid);

  const getTokenLimit = (isPremium: boolean) => isPremium ? 500 : 20;
  const getProgressPercentage = (tokens: number, isPremium: boolean) => {
    const limit = getTokenLimit(isPremium);
    return Math.min((tokens / limit) * 100, 100);
  };
  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-red-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading user data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="text-red-600 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Dashboard
            </h1>
            <div className="flex items-center justify-center mb-6">
              <UserAvatar user={user!} size="xl" className="mr-4" />
              <div className="text-left">
                <h2 className="text-xl font-semibold text-gray-900">
                  {user?.displayName || 'User'}
                </h2>
                <p className="text-gray-600">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* User Data Display */}
          {userData && (
            <div className="mb-8 bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Plan Status */}
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Plan Status</h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      userData.is_premium 
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900' 
                        : 'bg-gradient-to-r from-gray-400 to-gray-600 text-white'
                    }`}>
                      {userData.is_premium ? 'Premium' : 'Regular'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {userData.is_premium 
                      ? 'Unlimited access to all features' 
                      : 'Basic plan with limited features'
                    }
                  </p>
                </div>

                {/* Tokens Usage */}
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Tokens Remaining</h4>
                    <span className="text-lg font-bold text-gray-900">
                      {userData.tokens}
                    </span>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Used</span>
                      <span>{userData.tokens} / {getTokenLimit(userData.is_premium)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(getProgressPercentage(userData.tokens, userData.is_premium))}`}
                        style={{ width: `${getProgressPercentage(userData.tokens, userData.is_premium)}%` }}
                      ></div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {userData.is_premium 
                      ? 'Premium users get 500 tokens per month' 
                      : 'Regular users get 20 tokens per month'
                    }
                  </p>
                </div>
              </div>

              {/* Upgrade CTA for Regular Users */}
              {!userData.is_premium && (
                <div className="mt-4 bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-lg border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-yellow-800">Upgrade to Premium</h4>
                      <p className="text-xs text-yellow-700 mt-1">
                        Get 500 tokens per month and unlock all features
                      </p>
                    </div>
                    <button className="bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-yellow-700 transition-colors">
                      Upgrade Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Clipboard Management
              </h3>
              <p className="text-blue-700">
                Access your saved clipboard items and manage your productivity workflow.
              </p>
            </div>

            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                AI Text Enhancement
              </h3>
              <p className="text-green-700">
                Enhance your text with AI-powered suggestions and improvements.
              </p>
            </div>

            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-900 mb-2">
                Notes & Organization
              </h3>
              <p className="text-purple-700">
                Keep your notes organized and easily accessible across devices.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/')}
              className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors mr-4"
            >
              Go to Home
            </button>
            <button
              onClick={() => router.push('/auth')}
              className="bg-gray-600 text-white py-2 px-6 rounded-md hover:bg-gray-700 transition-colors"
            >
              Account Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
} 