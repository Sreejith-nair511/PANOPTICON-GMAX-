'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'danger';
  className?: string;
}

const variantStyles = {
  default: {
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
    border: 'border-border',
  },
  accent: {
    iconBg: 'bg-accent/10',
    iconColor: 'text-accent',
    border: 'border-accent/20',
  },
  success: {
    iconBg: 'bg-success/10',
    iconColor: 'text-success',
    border: 'border-success/20',
  },
  warning: {
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning',
    border: 'border-warning/20',
  },
  danger: {
    iconBg: 'bg-danger/10',
    iconColor: 'text-danger',
    border: 'border-danger/20',
  },
};

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
  className,
}: StatsCardProps) {
  const styles = variantStyles[variant];

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className={cn(
        'metric-card rounded-xl border',
        styles.border,
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs text-muted-foreground font-medium tracking-wide uppercase">
          {title}
        </span>
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', styles.iconBg)}>
          <Icon className={cn('w-4.5 h-4.5', styles.iconColor)} />
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-3xl font-bold tabular-nums tracking-tight">
          {value}
        </div>

        <div className="flex items-center gap-2">
          {trend && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs font-medium',
                trend.value > 0
                  ? 'text-success'
                  : trend.value < 0
                    ? 'text-danger'
                    : 'text-muted-foreground'
              )}
            >
              {trend.value > 0 ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : trend.value < 0 ? (
                <TrendingDown className="w-3.5 h-3.5" />
              ) : (
                <Minus className="w-3.5 h-3.5" />
              )}
              <span>
                {Math.abs(trend.value)}% {trend.label}
              </span>
            </div>
          )}
          {subtitle && !trend && (
            <span className="text-xs text-muted-foreground">{subtitle}</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
