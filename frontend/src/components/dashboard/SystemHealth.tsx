'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Database, Cpu, HardDrive, Wifi, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const services = [
  { label: 'API Server', icon: Zap, status: 'operational', latency: '4ms' },
  { label: 'Database', icon: Database, status: 'operational', latency: '2ms' },
  { label: 'AI Pipeline', icon: Cpu, status: 'operational', latency: '120ms' },
  { label: 'Redis Cache', icon: Activity, status: 'operational', latency: '1ms' },
  { label: 'Storage', icon: HardDrive, status: 'operational', latency: '18ms' },
  { label: 'WebSocket', icon: Wifi, status: 'operational', latency: '8ms' },
];

const processingStats = [
  { label: 'Queue', value: 7, max: 50, color: 'bg-accent' },
  { label: 'CPU', value: 34, max: 100, color: 'bg-success' },
  { label: 'Memory', value: 62, max: 100, color: 'bg-warning' },
  { label: 'GPU', value: 78, max: 100, color: 'bg-primary' },
];

export function SystemHealth() {
  return (
    <div className="card-panel rounded-xl overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-accent" />
          <h2 className="text-sm font-semibold">System Health</h2>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="status-dot-active" />
          <span className="text-xs text-success/80">All Systems Operational</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Service status grid */}
        <div className="grid grid-cols-2 gap-2">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-border/50"
              >
                <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{service.label}</p>
                  <p className="text-2xs text-success/70">{service.latency}</p>
                </div>
                <div className="status-dot-active shrink-0" />
              </motion.div>
            );
          })}
        </div>

        {/* Resource utilization */}
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground mb-3 font-medium">Resource Utilization</p>
          <div className="space-y-3">
            {processingStats.map((stat) => (
              <div key={stat.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-muted-foreground">{stat.label}</span>
                  <span className="text-xs font-mono tabular-nums">
                    {stat.label === 'Queue' ? stat.value : `${stat.value}%`}
                  </span>
                </div>
                <div className="confidence-bar">
                  <motion.div
                    className={cn('confidence-fill', stat.color)}
                    initial={{ width: 0 }}
                    animate={{ width: `${(stat.value / stat.max) * 100}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
