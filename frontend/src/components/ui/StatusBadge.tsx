'use client';

import React from 'react';
import { cn, getStatusBadgeClass } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  label?: string;
  className?: string;
}

export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <span className={cn(getStatusBadgeClass(status), 'capitalize', className)}>
      {label ?? status}
    </span>
  );
}
