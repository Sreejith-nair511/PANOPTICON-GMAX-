import React from 'react';
import Link from 'next/link';
import { Eye, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/20 border border-accent/20 flex items-center justify-center mb-6">
        <Eye className="w-8 h-8 text-accent" />
      </div>
      <p className="text-xs font-mono text-accent/60 tracking-widest mb-2">404 — NOT FOUND</p>
      <h1 className="text-2xl font-bold mb-3">Page Not Found</h1>
      <p className="text-sm text-muted-foreground max-w-sm mb-8">
        The resource you requested does not exist or has been moved.
      </p>
      <Link
        href="/dashboard"
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-accent-foreground text-sm font-medium hover:bg-accent-glow transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Return to Dashboard
      </Link>
    </div>
  );
}
