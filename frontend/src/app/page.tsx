'use client';

import { useEffect } from 'react';

export default function RootPage() {
  useEffect(() => {
    // Get auth state directly from localStorage to avoid hydration wait
    const stored = localStorage.getItem('panopticon-auth');
    let isAuthenticated = false;
    
    if (stored) {
      try {
        const { state } = JSON.parse(stored);
        isAuthenticated = state?.isAuthenticated && state?.token;
      } catch {
        // Invalid storage, treat as not authenticated
      }
    }

    // Immediate redirect - no delays
    window.location.replace(isAuthenticated ? '/dashboard' : '/auth/login');
  }, []);

  return null;
}
