'use client';

import React, { useEffect, useRef } from 'react';
import { getAuth } from 'firebase/auth';

interface FirebaseUIWrapperProps {
  config: any;
  containerId: string;
}

const FirebaseUIWrapper: React.FC<FirebaseUIWrapperProps> = ({ config, containerId }) => {
  const uiRef = useRef<any>(null);

  useEffect(() => {
    const initFirebaseUI = async () => {
      try {
        // Load FirebaseUI from CDN
        const script = document.createElement('script');
        script.src = 'https://www.gstatic.com/firebasejs/ui/6.1.0/firebase-ui-auth.js';
        script.onload = () => {
          const auth = getAuth();
          if (!uiRef.current) {
            // @ts-ignore - FirebaseUI is loaded globally
            uiRef.current = new (window as any).firebaseui.auth.AuthUI(auth);
          }
          uiRef.current.start(`#${containerId}`, config);
        };
        document.head.appendChild(script);

        // Load CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://www.gstatic.com/firebasejs/ui/6.1.0/firebase-ui-auth.css';
        document.head.appendChild(link);
      } catch (error) {
        console.error('Error initializing FirebaseUI:', error);
      }
    };

    initFirebaseUI();

    return () => {
      if (uiRef.current) {
        uiRef.current.reset();
      }
    };
  }, [config, containerId]);

  return <div id={containerId}></div>;
};

export default FirebaseUIWrapper; 