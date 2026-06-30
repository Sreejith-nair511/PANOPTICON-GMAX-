import React from 'react';

export default function AppLoading() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-accent/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent animate-spin" />
          <div className="absolute inset-2 rounded-full border border-accent/10 animate-pulse" />
        </div>
        <p className="text-xs text-muted-foreground font-mono tracking-wider animate-pulse">
          LOADING MODULE...
        </p>
      </div>
    </div>
  );
}
