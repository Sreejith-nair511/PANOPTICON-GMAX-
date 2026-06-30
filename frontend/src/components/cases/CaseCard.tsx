'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MapPin,
  Calendar,
  Film,
  Users,
  ArrowRight,
  MoreVertical,
  Shield,
  Clock,
} from 'lucide-react';
import { cn, formatTimestamp, formatRelativeTime, getPriorityColor } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfidenceBadge } from '@/components/ui/ConfidenceBadge';
import type { Case } from '@/types';

interface CaseCardProps {
  case: Case;
  view?: 'grid' | 'list';
}

const priorityColors: Record<string, string> = {
  critical: 'border-l-danger',
  high: 'border-l-warning',
  medium: 'border-l-accent',
  low: 'border-l-muted-foreground',
};

export function CaseCard({ case: c, view = 'grid' }: CaseCardProps) {
  if (view === 'list') {
    return (
      <motion.div whileHover={{ x: 2 }} transition={{ duration: 0.1 }}>
        <Link
          href={`/cases/${c.id}`}
          className={cn(
            'flex items-center gap-4 p-4 border-b border-border/50 hover:bg-surface-raised/40 transition-colors group border-l-2',
            priorityColors[c.priority]
          )}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xs font-mono text-muted-foreground/60">{c.caseNumber}</span>
              <StatusBadge status={c.status} />
              <span className={cn('text-xs capitalize font-medium', getPriorityColor(c.priority))}>
                {c.priority}
              </span>
            </div>
            <h3 className="text-sm font-semibold group-hover:text-accent transition-colors truncate">
              {c.title}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {c.location}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatRelativeTime(c.updatedAt)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <div className="text-center">
              <p className="text-sm font-semibold tabular-nums">{c.evidenceCount}</p>
              <p className="text-2xs text-muted-foreground">evidence</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold tabular-nums">{c.suspects}</p>
              <p className="text-2xs text-muted-foreground">suspects</p>
            </div>
            {c.aiProcessed && (
              <ConfidenceBadge score={c.confidenceScore} size="sm" showLabel={false} />
            )}
            <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-accent/60 transition-colors" />
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'card-panel rounded-xl p-4 transition-all duration-200 border-l-2 group',
        priorityColors[c.priority]
      )}
    >
      <Link href={`/cases/${c.id}`} className="block">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="text-2xs font-mono text-muted-foreground/60">{c.caseNumber}</span>
              <StatusBadge status={c.status} />
            </div>
            <h3 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-1">
              {c.title}
            </h3>
          </div>
          <button
            onClick={(e) => e.preventDefault()}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-raised transition-colors ml-2 shrink-0"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
          {c.description}
        </p>

        {/* Meta */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{c.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3 shrink-0" />
            <span>{formatTimestamp(c.incidentDate, 'dd MMM yyyy HH:mm')}</span>
          </div>
        </div>

        {/* Tags */}
        {c.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap mb-3">
            {c.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-2xs px-1.5 py-0.5 rounded bg-surface border border-border text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
            {c.tags.length > 3 && (
              <span className="text-2xs text-muted-foreground/50">+{c.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Footer stats */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Film className="w-3.5 h-3.5" />
              <span>{c.evidenceCount}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3.5 h-3.5" />
              <span>{c.suspects}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Shield className="w-3.5 h-3.5" />
              <span className={cn('capitalize font-medium', getPriorityColor(c.priority))}>
                {c.priority}
              </span>
            </div>
          </div>
          {c.aiProcessed ? (
            <ConfidenceBadge score={c.confidenceScore} size="sm" showLabel={false} />
          ) : (
            <span className="text-2xs text-muted-foreground/40">AI pending</span>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
