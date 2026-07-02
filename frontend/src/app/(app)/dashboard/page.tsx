'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Shield, Film, Users, FileText, BrainCircuit, AlertTriangle,
  TrendingUp, Target, Clock, MapPin, ChevronRight, Zap,
  Activity, Eye, Lock, Radio,
} from 'lucide-react';
import { mockCases, mockDashboardStats, mockAlerts, mockSuspects } from '@/lib/mockData';
import { cn, formatRelativeTime, getPriorityColor } from '@/lib/utils';
import { ConfidenceBadge } from '@/components/ui/ConfidenceBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DetectionChart, CaseActivityChart } from '@/components/dashboard/DetectionChart';

// ── Live clock ───────────────────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState<Date | null>(null);
  useEffect(() => {
    setTime(new Date());
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!time) return (
    <div className="text-right">
      <p className="text-2xl font-bold font-mono tabular-nums text-gradient-cyan">--:--:--</p>
      <p className="text-xs text-muted-foreground font-mono">Loading...</p>
    </div>
  );

  return (
    <div className="text-right" suppressHydrationWarning>
      <p className="text-2xl font-bold font-mono tabular-nums text-gradient-cyan" suppressHydrationWarning>
        {time.toLocaleTimeString('en-US', { hour12: false })}
      </p>
      <p className="text-xs text-muted-foreground font-mono" suppressHydrationWarning>
        {time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
    </div>
  );
}

// ── Priority strip ────────────────────────────────────────────────────────────
const priorityBorder: Record<string, string> = {
  critical: 'border-l-danger',
  high: 'border-l-warning',
  medium: 'border-l-accent',
  low: 'border-l-muted-foreground/40',
};

// ── Case card ─────────────────────────────────────────────────────────────────
function CaseCard({ c, index }: { c: typeof mockCases[0]; index: number }) {
  const isHistorical = ['case-jack','case-cooper','case-zodiac','case-tupac'].includes(c.id);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
    >
      <Link href={`/cases/${c.id}`}
        className={cn('block card-panel rounded-xl p-4 border-l-2 group relative overflow-hidden', priorityBorder[c.priority])}>
        {/* Historical badge */}
        {isHistorical && (
          <div className="absolute top-3 right-3 flex items-center gap-1 text-2xs px-1.5 py-0.5 rounded-full bg-amber-900/30 border border-amber-700/40 text-amber-400/80">
            <Lock className="w-2.5 h-2.5" /> COLD CASE
          </div>
        )}
        <div className="flex items-start gap-3">
          <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
            c.priority === 'critical' ? 'bg-danger/10' : c.priority === 'high' ? 'bg-warning/10' : 'bg-accent/10')}>
            <Shield className={cn('w-4 h-4', c.priority === 'critical' ? 'text-danger' : c.priority === 'high' ? 'text-warning' : 'text-accent')} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-2xs font-mono text-muted-foreground/50">{c.caseNumber}</span>
              <StatusBadge status={c.status} />
            </div>
            <h3 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-1">{c.title}</h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{c.description}</p>
            <div className="flex items-center gap-3 mt-2.5 flex-wrap">
              <span className="flex items-center gap-1 text-2xs text-muted-foreground">
                <MapPin className="w-3 h-3" />{c.location.split(',')[0]}
              </span>
              <span className="flex items-center gap-1 text-2xs text-muted-foreground">
                <Film className="w-3 h-3" />{c.evidenceCount}
              </span>
              <span className="flex items-center gap-1 text-2xs text-muted-foreground">
                <Users className="w-3 h-3" />{c.suspects}
              </span>
              {c.aiProcessed && <ConfidenceBadge score={c.confidenceScore} size="sm" showLabel={false} />}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ── Stat tile ─────────────────────────────────────────────────────────────────
function StatTile({ icon: Icon, label, value, color, sub }: { icon: React.ElementType; label: string; value: string | number; color: string; sub?: string }) {
  return (
    <motion.div whileHover={{ y: -2 }} className="metric-card rounded-xl">
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xs text-muted-foreground font-medium uppercase tracking-wider">{label}</span>
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', `${color}/10`)}>
          <Icon className={cn('w-4 h-4', color)} />
        </div>
      </div>
      <p className="text-3xl font-bold tabular-nums tracking-tight">{value}</p>
      {sub && <p className="text-2xs text-muted-foreground mt-1">{sub}</p>}
    </motion.div>
  );
}

// ── Live alerts feed ──────────────────────────────────────────────────────────
function AlertsFeed() {
  const unread = mockAlerts.filter(a => !a.read);
  return (
    <div className="card-panel rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-border">
        <div className="w-2 h-2 rounded-full bg-danger animate-pulse" />
        <Radio className="w-4 h-4 text-danger" />
        <span className="text-sm font-semibold">Live Alerts</span>
        {unread.length > 0 && <span className="badge-critical text-2xs ml-1">{unread.length}</span>}
      </div>
      <div className="divide-y divide-border/40">
        {mockAlerts.map((alert, i) => (
          <motion.div key={alert.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
            className={cn('flex gap-3 p-4 hover:bg-surface-raised/40 transition-colors cursor-pointer', !alert.read && 'bg-accent/4')}>
            <div className={cn('w-1.5 h-1.5 rounded-full mt-1.5 shrink-0',
              alert.severity === 'critical' ? 'bg-danger' : alert.severity === 'warning' ? 'bg-warning' : 'bg-accent')} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold">{alert.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">{alert.message}</p>
              <p className="text-2xs text-muted-foreground/50 mt-1">{formatRelativeTime(alert.createdAt)}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Suspects carousel ─────────────────────────────────────────────────────────
function SuspectsPanel() {
  return (
    <div className="card-panel rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 p-4 border-b border-border">
        <Target className="w-4 h-4 text-warning" />
        <span className="text-sm font-semibold">Tracked Suspects</span>
        <Link href="/tracking" className="ml-auto text-xs text-accent hover:text-accent-glow flex items-center gap-1">
          View all <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="p-3 grid grid-cols-2 gap-2">
        {mockSuspects.slice(0, 4).map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.07 }}
            className="flex items-center gap-2 p-2.5 rounded-lg bg-surface border border-border hover:border-warning/30 transition-colors cursor-pointer">
            <div className="relative shrink-0">
              <img src={s.thumbnailUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#080d1a] bg-warning" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate">{s.label}</p>
              <ConfidenceBadge score={s.confidenceScore} size="sm" showLabel={false} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const stats = mockDashboardStats;
  const criticalAlerts = mockAlerts.filter(a => a.severity === 'critical' && !a.read);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto overflow-y-auto h-full">
      {/* Header row */}
      <div className="flex items-start justify-between gap-6">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 h-5 rounded-full bg-accent" />
            <span className="text-xs font-semibold text-accent/80 tracking-widest uppercase">Operations Center</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Intelligence Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">{stats.activeCases} active · {stats.processingQueue} queued · AI accuracy {stats.aiAccuracy}%</p>
        </motion.div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <LiveClock />
        </motion.div>
      </div>

      {/* Critical alert banner */}
      {criticalAlerts.map(alert => (
        <motion.div key={alert.id} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-4 rounded-xl bg-danger/6 border border-danger/25 backdrop-blur-sm">
          <div className="w-8 h-8 rounded-lg bg-danger/15 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-danger" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-danger">{alert.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
          </div>
          <Link href="/investigation" className="shrink-0 text-xs border border-danger/25 text-danger/80 hover:text-danger hover:border-danger/50 px-3 py-1.5 rounded-lg transition-colors">
            Investigate →
          </Link>
        </motion.div>
      ))}

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatTile icon={Shield} label="Active Cases" value={stats.activeCases} color="text-accent" sub="4 current + 2 historical" />
        <StatTile icon={Film} label="Evidence Items" value={stats.totalEvidence} color="text-primary" sub={`${stats.processingQueue} in queue`} />
        <StatTile icon={Users} label="Suspects Tracked" value={stats.suspectsTracked} color="text-warning" sub="Cross-camera ReID live" />
        <StatTile icon={BrainCircuit} label="AI Accuracy" value={`${stats.aiAccuracy}%`} color="text-success" sub="+2.3% vs last month" />
        <StatTile icon={Target} label="Processing Queue" value={stats.processingQueue} color="text-accent" sub="~14 min avg" />
        <StatTile icon={FileText} label="Reports" value={stats.reportsGenerated} color="text-primary" sub="This month" />
        <StatTile icon={AlertTriangle} label="Alerts Today" value={stats.alertsToday} color="text-warning" sub="1 critical" />
        <StatTile icon={TrendingUp} label="Detection Rate" value="94.2%" color="text-success" sub="+1.8% vs last week" />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Cases — 2 cols */}
        <div className="xl:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Eye className="w-4 h-4 text-accent" /> Active Investigations
            </h2>
            <Link href="/cases" className="text-xs text-accent hover:text-accent-glow flex items-center gap-1">All cases <ChevronRight className="w-3 h-3" /></Link>
          </div>
          {mockCases.slice(0, 5).map((c, i) => <CaseCard key={c.id} c={c} index={i} />)}
        </div>

        {/* Right col */}
        <div className="space-y-4">
          <AlertsFeed />
          <SuspectsPanel />
          <DetectionChart />
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CaseActivityChart />
        {/* AI pipeline */}
        <div className="card-panel rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 p-4 border-b border-border">
            <BrainCircuit className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold">AI Processing Pipeline</span>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-xs text-accent/70">Live</span>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {[
              { case: 'PAN-1888-0001', file: 'Historical photograph batch', status: 'completed', conf: 71 },
              { case: 'PAN-1971-0001', file: 'NORJAK FBI files', status: 'completed', conf: 41 },
              { case: 'PAN-2026-0047', file: 'Station Camera 4', status: 'completed', conf: 92 },
              { case: 'PAN-1969-0001', file: 'Cipher image analysis', status: 'processing', conf: 0 },
            ].map((job, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-surface border border-border/60">
                <div className={cn('w-2 h-2 rounded-full shrink-0', job.status === 'completed' ? 'bg-success' : 'bg-accent animate-pulse')} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-muted-foreground/60">{job.case}</p>
                  <p className="text-sm truncate">{job.file}</p>
                </div>
                {job.conf > 0 ? <ConfidenceBadge score={job.conf} size="sm" showLabel={false} /> : (
                  <span className="text-2xs text-accent/70 font-mono">running…</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
