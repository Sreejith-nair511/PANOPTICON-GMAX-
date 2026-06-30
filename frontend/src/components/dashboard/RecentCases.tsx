'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Shield, Clock } from 'lucide-react';
import { cn, formatRelativeTime, getPriorityColor } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfidenceBadge } from '@/components/ui/ConfidenceBadge';
import type { Case } from '@/types';

interface RecentCasesProps {
  cases: Case[];
}

const priorityDot: Record<string, string> = {
  critical: 'bg-danger',
  high: 'bg-warning',
  medium: 'bg-accent',
  low: 'bg-muted-foreground',
};

export function RecentCases({ cases }: RecentCasesProps) {
  return (
    <div className="card-panel rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-accent" />
          <h2 className="text-sm font-semibold">Active Cases</h2>
          <span className="badge-info text-2xs">{cases.length}</span>
        </div>
        <Link
          href="/cases"
          className="flex items-center gap-1 text-xs text-accent hover:text-accent-glow transition-colors"
        >
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="divide-y divide-border/50">
        {cases.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              href={`/cases/${c.id}`}
              className="flex items-start gap-4 p-4 hover:bg-surface-raised/50 transition-colors group"
            >
              {/* Priority indicator */}
              <div className="flex flex-col items-center gap-1 pt-0.5">
                <div className={cn('w-2 h-2 rounded-full', priorityDot[c.priority])} />
              </div>

              {/* Case info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xs font-mono text-muted-foreground/60">
                    {c.caseNumber}
                  </span>
                  <StatusBadge status={c.status} />
                </div>
                <h3 className="text-sm font-medium text-foreground group-hover:text-accent transition-colors truncate">
                  {c.title}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {c.location}
                </p>

                <div className="flex items-center gap-4 mt-2">
                  <span className="text-2xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatRelativeTime(c.updatedAt)}
                  </span>
                  <span className="text-2xs text-muted-foreground">
                    {c.evidenceCount} evidence
                  </span>
                  <span className="text-2xs text-muted-foreground">
                    {c.suspects} suspects
                  </span>
                </div>
              </div>

              {/* Confidence */}
              {c.aiProcessed && (
                <div className="shrink-0">
                  <ConfidenceBadge score={c.confidenceScore} showLabel={false} size="sm" />
                </div>
              )}

              <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-accent/60 transition-colors shrink-0 self-center" />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
