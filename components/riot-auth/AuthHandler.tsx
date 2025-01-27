'use client';

import { useEffect } from 'react';

export default function AuthHandler() {
  useEffect(() => {
    // Check if we have a hash fragment with auth data
    if (typeof window !== 'undefined' && window.location.hash) {
      try {
        // Parse the auth data
        const params = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = params.get('access_token');
        const idToken = params.get('id_token');

        if (accessToken && idToken) {
          // Store tokens in sessionStorage
          sessionStorage.setItem('accessToken', accessToken);
          sessionStorage.setItem('idToken', idToken);

          // Clean up the URL but maintain the page state
          window.history.replaceState(null, '', window.location.pathname);
          
          // Force a refresh of the page to update the UI
          window.location.reload();
        }
      } catch (error) {
        console.error('Error handling auth redirect:', error);
      }
    }
  }, []);

  return null;
}