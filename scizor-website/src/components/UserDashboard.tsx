'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import UserAvatar from '@/components/UserAvatar';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome back, {user.displayName || user.email}!
            </h1>
                         <div className="flex items-center justify-center mb-6">
               <UserAvatar user={user} size="xl" className="mr-4" />
               <div className="text-left">
                 <h2 className="text-xl font-semibold text-gray-900">
                   {user.displayName || 'User'}
                 </h2>
                 <p className="text-gray-600">{user.email}</p>
               </div>
             </div>
          </div>

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
};

export default UserDashboard; 