'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { AppShell } from '@/components/layout/AppShell';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, token } = useAuthStore();

  useEffect(() => {
    // Check authentication from localStorage directly
    const stored = localStorage.getItem('panopticon-auth');
    let isAuth = false;
    
    if (stored) {
      try {
        const { state } = JSON.parse(stored);
        isAuth = state?.isAuthenticated && state?.token;
      } catch {
        // Invalid storage
      }
    }

    // Redirect if not authenticated
    if (!isAuth) {
      window.location.replace('/auth/login');
    }
  }, []);

  // Render immediately - don't wait for hydration
  return <AppShell>{children}</AppShell>;
}
