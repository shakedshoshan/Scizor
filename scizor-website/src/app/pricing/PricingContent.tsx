'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useReturnToFree } from '@/hooks/useReturnToFree';
import { getUserData } from '@/hooks/getUserToken';
import { buildCheckoutUrl, getVariantPriceLabel } from '@/utils/lemonsqueezy';

interface PricingContentProps {
  products: any[];
  error: string | null;
}

export default function PricingContent({ products, error }: PricingContentProps) {
  const { user } = useAuth();
  const { returnToFree, loading: returnToFreeLoading, error: returnToFreeError } = useReturnToFree();
  const [showSuccess, setShowSuccess] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [userDataLoading, setUserDataLoading] = useState(false);
  const [userDataError, setUserDataError] = useState<string | null>(null);

  // Fetch user data when user changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.uid) {
        setUserDataLoading(true);
        setUserDataError(null);
        try {
          const result = await getUserData(user.uid);
          if (result.success) {
            setUserData(result.data);
          } else {
            setUserDataError(result.error || 'Failed to fetch user data');
          }
        } catch (err) {
          setUserDataError('Failed to fetch user data');
        } finally {
          setUserDataLoading(false);
        }
      } else {
        setUserData(null);
        setUserDataLoading(false);
        setUserDataError(null);
      }
    };

    fetchUserData();
  }, [user?.uid]);

  const handleReturnToFree = async () => {
    if (!user?.uid) {
      alert('Please sign in to manage your subscription');
      return;
    }

    // Check if user is already non-premium
    if (userData && !userData.is_premium) {
      alert('You are already on the free plan!');
      return;
    }

    try {
      const result = await returnToFree(user.uid);
      if (result.success) {
        setShowSuccess(true);
        // Refresh user data to reflect the change
        const refreshResult = await getUserData(user.uid);
        if (refreshResult.success) {
          setUserData(refreshResult.data);
        }
        setTimeout(() => setShowSuccess(false), 5000); // Hide success message after 5 seconds
      } else {
        alert(`Failed to return to free plan: ${result.message}`);
      }
    } catch (err) {
      console.error('Error returning to free:', err);
      alert('An error occurred while processing your request');
    }
  };

  // Get all variants across all products (include pending ones too)
  const allVariants = products.flatMap(({ product, variants, prices }) => 
    variants
      // Include both published and pending variants
      .filter((v: any) => ['published', 'pending'].includes(v.attributes?.status || ''))
      .map((variant: any) => ({
        variant,
        product,
        prices: prices[variant.id] || []
      }))
  );

  return (
    <section className="max-w-6xl mx-auto px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Simple, transparent pricing</h1>
        <p className="text-gray-600">Choose the plan that fits your workflow. Upgrade or cancel anytime.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-8 text-center">
          <p>Unable to load pricing information. Please try again later.</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      )}

      {showSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-8 text-center">
          <p>✅ Successfully returned to free plan! You now have 20 tokens and basic features.</p>
        </div>
      )}

      {returnToFreeError && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-8 text-center">
          <p>❌ Error: {returnToFreeError}</p>
        </div>
      )}

      {userDataError && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded-lg mb-8 text-center">
          <p>⚠️ Unable to load user data: {userDataError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Render Free plan statically */}
        <div className="border border-gray-200 rounded-2xl p-6 shadow-sm relative">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-semibold text-gray-900">Free</h3>
            {user && userData && !userData.is_premium && (
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Current Plan</span>
            )}
          </div>
          <p className="mt-1 text-3xl font-bold text-gray-900">$0</p>
          <p className="mt-2 text-gray-600">Get started with core features.</p>
          
          {/* Show user token info if available */}
          {user && userData && !userDataLoading && (
            <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
              <p className="text-gray-600">
                Tokens: <span className="font-medium">{userData.tokens}</span>
              </p>
              <p className="text-gray-600">
                Status: <span className="font-medium">{userData.is_premium ? 'Premium' : 'Free'}</span>
              </p>
            </div>
          )}
          <ul className="mt-6 space-y-2">
            {['Clipboard manager', 'Basic AI enhancements (rate limited)', 'Notes'].map((feat) => (
              <li key={feat} className="flex items-center text-gray-700">
                <svg className="w-5 h-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {feat}
              </li>
            ))}
          </ul>
          <div className="mt-8 space-y-2">
            {!user ? (
              <Link
                href="/auth"
                className="bg-white border border-gray-300 text-gray-900 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center justify-center w-full"
              >
                Start Free
              </Link>
            ) : userDataLoading ? (
              <button
                disabled
                className="bg-gray-100 border border-gray-300 text-gray-500 px-6 py-2 rounded-lg inline-flex items-center justify-center w-full cursor-not-allowed"
              >
                Loading...
              </button>
            ) : userData && !userData.is_premium ? (
              <button
                disabled
                className="bg-gray-100 border border-gray-300 text-gray-500 px-6 py-2 rounded-lg inline-flex items-center justify-center w-full cursor-not-allowed"
              >
                You're Already on Free Plan
              </button>
            ) : userData && userData.is_premium ? (
              <button
                onClick={handleReturnToFree}
                disabled={returnToFreeLoading}
                className="bg-white border border-gray-300 text-gray-900 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center justify-center w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {returnToFreeLoading ? 'Processing...' : 'Return to Free Plan'}
              </button>
            ) : (
              <button
                disabled
                className="bg-gray-100 border border-gray-300 text-gray-500 px-6 py-2 rounded-lg inline-flex items-center justify-center w-full cursor-not-allowed"
              >
                Unable to Load Plan Data
              </button>
            )}
            {user && userData && userData.is_premium && (
              <p className="text-xs text-gray-500 text-center">
                Click to downgrade from premium to free plan
              </p>
            )}
            {user && userData && !userData.is_premium && (
              <p className="text-xs text-green-600 text-center">
                You're currently on the free plan
              </p>
            )}
          </div>
        </div>

        {/* Render paid variants from Lemon Squeezy */}
        {allVariants.length > 0 ? (
          allVariants.map(({ variant, product, prices }) => {
            // Use product name as primary name
            const productName = product.attributes.name;
            const variantName = variant.attributes?.name;
            const displayName = productName || variantName || 'Plan';
            
            // Use product's formatted price if available
            let priceLabel = '';
            if (product.attributes.price_formatted) {
              priceLabel = product.attributes.price_formatted;
            } else {
              priceLabel = getVariantPriceLabel(variant, prices);
            }
            
            // Get subscription details
            const isSubscription = variant.attributes?.is_subscription || false;
            const interval = variant.attributes?.interval;
            const intervalCount = variant.attributes?.interval_count || 1;
            
            // Format subscription period if not already in price label
            if (isSubscription && !priceLabel.includes('/')) {
              const period = interval === 'month' ? (intervalCount === 1 ? '/mo' : `/${intervalCount} months`) :
                            interval === 'year' ? (intervalCount === 1 ? '/yr' : `/${intervalCount} years`) :
                            interval === 'week' ? (intervalCount === 1 ? '/wk' : `/${intervalCount} weeks`) : '';
              if (period) priceLabel += period;
            }
            
            // Use buy_now_url from product or variant if available, otherwise build it
            const buyNowUrl = product.attributes?.buy_now_url || variant.attributes?.buy_now_url;
            const checkoutHref = buildCheckoutUrl(variant.id, buyNowUrl);
            
            // Parse HTML description if available
            const rawDescription = product.attributes.description || '';
            const description = rawDescription.replace(/<\/?[^>]+(>|$)/g, '').trim() || 'Full access to premium features.';
            
            return (
              <div key={variant.id} className="border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold text-gray-900">{displayName}</h3>
                  {variantName && variantName !== 'Default' && productName !== variantName && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{variantName}</span>
                  )}
                  {variant.attributes?.test_mode && (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded ml-1">Test Mode</span>
                  )}
                </div>
                
                <p className="mt-1 text-3xl font-bold text-gray-900">{priceLabel}</p>
                <p className="mt-2 text-gray-600">{description}</p>
                
                <ul className="mt-6 space-y-2">
                  {['All Free features', 'Priority AI generation', 'Unlimited enhancements'].map((feat) => (
                    <li key={feat} className="flex items-center text-gray-700">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feat}
                    </li>
                  ))}
                  {variant.attributes?.has_free_trial && (
                    <li className="flex items-center text-blue-700">
                      <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {variant.attributes.trial_interval_count} day free trial
                    </li>
                  )}
                </ul>
                
                <div className="mt-8">
                  <a
                    className="lemonsqueezy-button bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 inline-flex items-center justify-center w-full"
                    href={checkoutHref}
                    data-ls-modal="checkout"
                    data-ls-product={product.id}
                    data-ls-variant={variant.id}
                  >
                    Get {displayName}
                  </a>
                </div>
              </div>
            );
          })
        ) : !error ? (
          // Show placeholder cards if no error but no products found
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-2xl p-6 shadow-sm animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
              
              <div className="space-y-2 mb-8">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-gray-200 mr-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                ))}
              </div>
              
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          ))
        ) : null}
      </div>

      <p className="text-center text-sm text-gray-500 mt-8">
        Payments are processed securely by Lemon Squeezy.
      </p>
    </section>
  );
}
