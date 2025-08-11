'use client';

import React from 'react';
import Image from 'next/image';

export default function TestImagesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Image Configuration Test
          </h1>
          <p className="text-lg text-gray-600">
            Testing external image loading with Next.js configuration
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Google Profile Images</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Test Google profile image URLs */}
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Google Profile 1</h3>
              <Image
                src="https://lh3.googleusercontent.com/a/ACg8ocJ5x746oQmWXQpGyukz3lnkFhqnBid1Xln-X1pvBbXzVw3Eog=s96-c"
                alt="Test Google Profile 1"
                width={96}
                height={96}
                className="rounded-full mx-auto"
                onError={(e) => console.error('Image 1 failed to load:', e)}
                onLoad={() => console.log('Image 1 loaded successfully')}
              />
            </div>

            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Google Profile 2</h3>
              <Image
                src="https://lh4.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo"
                alt="Test Google Profile 2"
                width={96}
                height={96}
                className="rounded-full mx-auto"
                onError={(e) => console.error('Image 2 failed to load:', e)}
                onLoad={() => console.log('Image 2 loaded successfully')}
              />
            </div>

            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Google Profile 3</h3>
              <Image
                src="https://lh5.googleusercontent.com/-v0soe-iavYE/AAAAAAAAAAI/AAAAAAAAAAA/AMZuOYn5YDeFA4OnFA_UngJ_G9WsjuBIg/photo"
                alt="Test Google Profile 3"
                width={96}
                height={96}
                className="rounded-full mx-auto"
                onError={(e) => console.error('Image 3 failed to load:', e)}
                onLoad={() => console.log('Image 3 loaded successfully')}
              />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-6">Other External Images</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Google Identity Logo</h3>
              <Image
                src="https://developers.google.com/identity/images/g-logo.png"
                alt="Google Identity Logo"
                width={96}
                height={96}
                className="mx-auto"
                onError={(e) => console.error('Google logo failed to load:', e)}
                onLoad={() => console.log('Google logo loaded successfully')}
              />
            </div>

            <div className="text-center">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Gravatar Example</h3>
              <Image
                src="https://secure.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
                alt="Gravatar Example"
                width={96}
                height={96}
                className="rounded-full mx-auto"
                onError={(e) => console.error('Gravatar failed to load:', e)}
                onLoad={() => console.log('Gravatar loaded successfully')}
              />
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Test Results</h3>
            <p className="text-blue-700 text-sm">
              Check the browser console for image loading status. If you see "loaded successfully" messages, 
              the image configuration is working correctly. If you see errors, there may be configuration issues.
            </p>
          </div>

          <div className="mt-6 text-center">
            <a
              href="/auth"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Back to Authentication
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
