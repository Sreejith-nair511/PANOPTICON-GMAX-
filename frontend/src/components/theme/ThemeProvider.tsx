'use client';

import { ReactNode, useEffect, useState } from 'react';
import { initializeTheme } from '@/lib/theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initializeTheme();
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <>{children}</>;
}
