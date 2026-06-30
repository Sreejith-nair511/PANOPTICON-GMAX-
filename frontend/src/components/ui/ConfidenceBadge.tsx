'use client';

import React from 'react';
import { cn, getConfidenceColor, getConfidenceLabel } from '@/lib/utils';

interface ConfidenceBadgeProps {
  score: number;
  showLabel?: boolean;
  showBar?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export function ConfidenceBadge({
  score,
  showLabel = true,
  showBar = false,
  size = 'md',
  className,
}: ConfidenceBadgeProps) {
  const colorClass = getConfidenceColor(score);
  const label = getConfidenceLabel(score);

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'rounded font-mono font-semibold tabular-nums',
            size === 'sm' ? 'text-2xs px-1.5 py-0.5' : 'text-xs px-2 py-0.5',
            score >= 85
              ? 'bg-success/15 text-success border border-success/30'
              : score >= 70
                ? 'bg-warning/15 text-warning border border-warning/30'
                : score >= 50
                  ? 'bg-accent/15 text-accent border border-accent/30'
                  : 'bg-danger/15 text-danger border border-danger/30'
          )}
        >
          {score}%
        </div>
        {showLabel && (
          <span
            className={cn(
              'text-muted-foreground',
              size === 'sm' ? 'text-2xs' : 'text-xs'
            )}
          >
            {label}
          </span>
        )}
      </div>
      {showBar && (
        <div className="confidence-bar w-full">
          <div
            className={cn('confidence-fill', colorClass)}
            style={{ width: `${score}%` }}
          />
        </div>
      )}
    </div>
  );
}
