'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  BrainCircuit,
  Upload,
  UserCheck,
  FileText,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { formatRelativeTime, cn } from '@/lib/utils';

const activities = [
  {
    id: 1,
    type: 'ai_complete',
    icon: BrainCircuit,
    iconColor: 'text-accent',
    iconBg: 'bg-accent/10',
    title: 'AI Processing Complete',
    description: 'Drone footage analysis for PAN-2026-0039 — 6 suspects tracked.',
    time: '2026-06-30T09:00:00Z',
  },
  {
    id: 2,
    type: 'evidence_upload',
    icon: Upload,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
    title: 'New Evidence Uploaded',
    description: 'Off. Rodriguez body camera footage added to PAN-2026-0052.',
    time: '2026-06-30T08:35:00Z',
  },
  {
    id: 3,
    type: 'suspect_match',
    icon: UserCheck,
    iconColor: 'text-success',
    iconBg: 'bg-success/10',
    title: 'Suspect Re-ID Match',
    description: 'Suspect Alpha matched across 3 cameras in PAN-2026-0047.',
    time: '2026-06-30T08:10:00Z',
  },
  {
    id: 4,
    type: 'report',
    icon: FileText,
    iconColor: 'text-warning',
    iconBg: 'bg-warning/10',
    title: 'Report Generated',
    description: 'Comprehensive forensic report ready for PAN-2026-0047.',
    time: '2026-06-30T07:45:00Z',
  },
  {
    id: 5,
    type: 'alert',
    icon: AlertTriangle,
    iconColor: 'text-danger',
    iconBg: 'bg-danger/10',
    title: 'Priority Alert',
    description: 'Critical — new suspect sighting linked to PAN-2026-0047.',
    time: '2026-06-29T23:30:00Z',
  },
];

export function ActivityFeed() {
  return (
    <div className="card-panel rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-border">
        <Clock className="w-4 h-4 text-accent" />
        <h2 className="text-sm font-semibold">Recent Activity</h2>
      </div>

      <div className="p-3 space-y-1">
        {activities.map((activity, i) => {
          const Icon = activity.icon;
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-raised/50 transition-colors cursor-default"
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                  activity.iconBg
                )}
              >
                <Icon className={cn('w-4 h-4', activity.iconColor)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{activity.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {activity.description}
                </p>
                <p className="text-2xs text-muted-foreground/60 mt-1">
                  {formatRelativeTime(activity.time)}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
