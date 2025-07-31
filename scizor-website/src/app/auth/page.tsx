import BasicAuth from '@/components/auth/BasicAuth';

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Scizor
          </h1>
          <p className="text-lg text-gray-600">
            Sign in to access your AI-powered productivity tools
          </p>
        </div>
        <BasicAuth />
      </div>
    </div>
  );
} 