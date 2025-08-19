'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

declare global {
  interface Window {
    LemonSqueezy?: {
      Setup: (options: { eventHandler: (data: LemonEventData) => void }) => void;
      Url: {
        Close: () => void;
      };
    };
  }
}

interface LemonEventData {
  event?: string;
  [key: string]: unknown;
}

export default function LemonEventsClient() {
  const router = useRouter();

  useEffect(() => {
    // Initialize Lemon.js when the component mounts
    const initLemonJs = () => {
      if (typeof window !== 'undefined' && window.LemonSqueezy) {
        console.log('Initializing Lemon.js event handlers');
        
        window.LemonSqueezy.Setup({
          eventHandler: (data) => {
            console.log('Lemon.js event received:', data);
            
            if (data?.event === 'Checkout.Success') {
              console.log('Checkout successful, redirecting to thank-you page');
              
              // Close the modal if it's open
              try {
                window.LemonSqueezy?.Url?.Close?.();
              } catch (e) {
                console.error('Error closing Lemon.js modal:', e);
              }
              
              // Navigate to thank-you page after successful checkout
              setTimeout(() => {
                router.push('/pricing/thank-you');
              }, 500);
            }
          }
        });
      }
    };

    // Try to initialize immediately
    initLemonJs();

    // Also set up a backup to initialize after a delay in case the script loads later
    const timeoutId = setTimeout(() => {
      initLemonJs();
    }, 2000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [router]);

  return null;
}


