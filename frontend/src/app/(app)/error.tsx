'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[PANOPTICON Error]', error);
  }, [error]);

  return (
    <div className="flex h-full items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center"
      >
        <div className="w-16 h-16 rounded-2xl bg-danger/10 border border-danger/20 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-8 h-8 text-danger" />
        </div>
        <h2 className="text-lg font-bold mb-2">Module Error</h2>
        <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
          An unexpected error occurred in this module.
        </p>
        {error.message && (
          <pre className="text-xs text-danger/70 bg-danger/5 border border-danger/15 rounded-lg px-4 py-3 mb-6 font-mono text-left overflow-auto max-h-32">
            {error.message}
          </pre>
        )}
        <div className="flex items-center gap-3 justify-center">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-medium hover:bg-accent-glow transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground hover:border-accent/30 transition-colors"
          >
            <Home className="w-4 h-4" /> Dashboard
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
