'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Shield, Film, Users, FileText, BrainCircuit, AlertTriangle,
  TrendingUp, Target, Clock, MapPin, ChevronRight, Zap, Activity,
  Eye, Lock, Radio, ArrowUpRight, Cpu, Database, Wifi,
  Layers, Crosshair, BarChart3, Gauge, Radar, GitMerge,
  AlertCircle, CheckCircle2, Sparkles, Siren,
} from 'lucide-react';
import { mockCases, mockDashboardStats, mockAlerts, mockSuspects } from '@/lib/mockData';
import { ConfidenceBadge } from '@/components/ui/ConfidenceBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DetectionChart, CaseActivityChart } from '@/components/dashboard/DetectionChart';
import { cn, formatRelativeTime } from '@/lib/utils';
import {
  LIVE_STATS_BASELINE, DATASET_METRICS, FORENSIC_INSIGHTS,
  jitterStats, type LiveSystemStats,
} from '@/lib/forensicData';

// ── Live Clock ──────────────────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState<Date | null>(null);
  useEffect(() => {
    setTime(new Date());
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="text-right" suppressHydrationWarning>
      <p className="text-3xl font-bold font-mono tabular-nums text-gradient-cyan" suppressHydrationWarning>
        {time ? time.toLocaleTimeString('en-US', { hour12: false }) : '--:--:--'}
      </p>
      <p className="text-xs mt-0.5 text-muted-foreground" suppressHydrationWarning>
        {time ? time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}
      </p>
    </div>
  );
}

// ── Gauge Ring ──────────────────────────────────────────────────────────────
function GaugeRing({ value, max = 100, color, size = 56, strokeWidth = 4 }: {
  value: number; max?: number; color: string; size?: number; strokeWidth?: number;
}) {
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (value / max) * circ;
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.6s ease', filter: `drop-shadow(0 0 4px ${color}88)` }} />
    </svg>
  );
}

// ── Live Stats Panel ────────────────────────────────────────────────────────
function LiveStatsPanel({ stats }: { stats: LiveSystemStats }) {
  return (
    <div className="card-panel-flat rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border bg-white/[0.01]">
        <div className="w-2 h-2 rounded-full bg-success animate-pulse" style={{ boxShadow: '0 0 8px #22c55e' }} />
        <Gauge className="w-4 h-4 text-accent" />
        <span className="text-sm font-bold">Live System Telemetry</span>
        <span className="ml-auto text-2xs font-mono text-success/70">STREAMING</span>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-px bg-border">
        {[
          { label: 'GPU', value: stats.gpuUsage, color: '#f59e0b', suffix: '%' },
          { label: 'CPU', value: stats.cpuUsage, color: '#00b4d8', suffix: '%' },
          { label: 'MEM', value: stats.memoryUsage, color: '#a78bfa', suffix: '%' },
          { label: 'FPS', value: stats.processingFps, max: 60, color: '#22c55e', suffix: '' },
          { label: 'ReID', value: stats.reidMatches, max: 20, color: '#fb923c', suffix: '/min' },
          { label: 'NET', value: Math.min(100, stats.networkLatency * 5), color: '#38bdf8', suffix: `${stats.networkLatency}ms`, raw: true },
        ].map(({ label, value, max = 100, color, suffix, raw }) => (
          <div key={label} className="flex flex-col items-center justify-center gap-1.5 py-4 bg-[var(--bg-surface)] relative">
            <div className="relative">
              <GaugeRing value={value} max={max} color={color} size={52} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold tabular-nums" style={{ color }}>{value}</span>
              </div>
            </div>
            <span className="text-2xs text-muted-foreground font-mono uppercase">{label}</span>
            {!raw && <span className="text-2xs text-muted-foreground/50">{suffix}</span>}
            {raw && <span className="text-2xs" style={{ color }}>{suffix}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Dataset Metrics Panel ───────────────────────────────────────────────────
function DatasetMetricsPanel() {
  const grouped = {
    'MOT17': DATASET_METRICS.filter(m => m.dataset === 'MOT17'),
    'Market-1501': DATASET_METRICS.filter(m => m.dataset === 'Market-1501'),
    'COCO': DATASET_METRICS.filter(m => m.dataset === 'COCO'),
  };
  const colors: Record<string, string> = {
    'MOT17': '#00b4d8', 'Market-1501': '#f59e0b', 'COCO': '#22c55e',
  };
  return (
    <div className="card-panel-flat rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border bg-white/[0.01]">
        <Layers className="w-4 h-4 text-accent" />
        <span className="text-sm font-bold">Dataset Benchmarks</span>
        <span className="ml-auto text-2xs text-muted-foreground">MOT17 · Market-1501 · COCO</span>
      </div>
      <div className="p-4 space-y-4">
        {Object.entries(grouped).map(([dataset, metrics]) => (
          <div key={dataset}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ background: colors[dataset], boxShadow: `0 0 6px ${colors[dataset]}` }} />
              <span className="text-xs font-bold" style={{ color: colors[dataset] }}>{dataset}</span>
            </div>
            <div className="space-y-1.5">
              {metrics.map(m => (
                <div key={m.metric} className="flex items-center gap-3">
                  <span className="text-2xs text-muted-foreground w-20 shrink-0">{m.metric}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: colors[dataset] }}
                      initial={{ width: 0 }}
                      animate={{ width: `${m.value}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                    />
                  </div>
                  <span className="text-2xs font-mono font-bold tabular-nums w-12 text-right" style={{ color: m.value >= m.benchmark ? '#22c55e' : '#f59e0b' }}>
                    {m.value}{m.unit}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Forensic Insights Feed ──────────────────────────────────────────────────
function ForensicInsightsFeed() {
  const sevColor: Record<string, string> = {
    critical: '#ef4444', high: '#f59e0b', medium: '#00b4d8', low: '#64748b',
  };
  const typeIcon: Record<string, React.ElementType> = {
    match: CheckCircle2, alert: Siren, pattern: Radar,
    anomaly: AlertCircle, timeline_gap: Clock,
  };
  return (
    <div className="card-panel-flat rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border bg-white/[0.01]">
        <Sparkles className="w-4 h-4 text-accent" />
        <span className="text-sm font-bold">AI Forensic Insights</span>
        <span className="ml-1 badge-info text-2xs">{FORENSIC_INSIGHTS.length}</span>
        <span className="ml-auto text-2xs font-mono text-accent/70">LIVE</span>
      </div>
      <div className="divide-y divide-border/50">
        {FORENSIC_INSIGHTS.map((ins, i) => {
          const Icon = typeIcon[ins.type] ?? Sparkles;
          const col = sevColor[ins.severity];
          return (
            <motion.div key={ins.id}
              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
              className="flex gap-3 p-4 hover:bg-white/[0.02] cursor-pointer transition-colors">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: `${col}15`, border: `1px solid ${col}30` }}>
                <Icon className="w-3.5 h-3.5" style={{ color: col }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-bold">{ins.title}</span>
                  <span className="text-2xs font-mono px-1.5 py-0.5 rounded"
                    style={{ background: `${col}12`, color: col, border: `1px solid ${col}25` }}>
                    {ins.severity}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{ins.description}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-2xs font-mono text-muted-foreground/50">{ins.datasetBacked}</span>
                  <ConfidenceBadge score={ins.confidence} size="sm" showLabel={false} />
                  <span className="text-2xs text-muted-foreground/40 ml-auto">{formatRelativeTime(ins.timestamp)}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color, trend }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string; trend?: string;
}) {
  return (
    <motion.div whileHover={{ y: -3, transition: { duration: 0.15 } }} className="metric-card group">
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(90deg, transparent, ${color}66, transparent)`, opacity: 0, transition: 'opacity 0.2s' }} className="group-hover:opacity-100" />
      <div className="flex items-start justify-between mb-4">
        <span className="text-2xs font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <div className="text-3xl font-bold tabular-nums tracking-tight mb-1">{value}</div>
      {(sub || trend) && (
        <div className="flex items-center gap-2">
          {trend && <span className="flex items-center gap-1 text-2xs font-semibold text-success"><TrendingUp className="w-3 h-3" />{trend}</span>}
          {sub && <span className="text-2xs text-muted-foreground">{sub}</span>}
        </div>
      )}
    </motion.div>
  );
}

// ── Case Row ────────────────────────────────────────────────────────────────
const P_COLOR: Record<string, string> = { critical: '#ef4444', high: '#f59e0b', medium: '#00b4d8', low: '#64748b' };

function CaseRow({ c, i }: { c: typeof mockCases[0]; i: number }) {
  const isHistorical = ['case-jack', 'case-cooper', 'case-zodiac', 'case-tupac'].includes(c.id);
  const col = P_COLOR[c.priority];
  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
      <Link href={`/cases/${c.id}`}
        className="flex items-center gap-4 px-5 py-3.5 transition-colors group"
        style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="w-1 h-10 rounded-full shrink-0" style={{ background: col, boxShadow: `0 0 10px ${col}50` }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-2xs font-mono text-muted-foreground/60">{c.caseNumber}</span>
            <StatusBadge status={c.status} />
            {isHistorical && (
              <span className="text-2xs font-bold flex items-center gap-1 px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(180,130,60,0.12)', border: '1px solid rgba(180,130,60,0.25)', color: 'rgba(200,160,80,0.9)' }}>
                <Lock className="w-2.5 h-2.5" />COLD
              </span>
            )}
          </div>
          <p className="text-sm font-semibold group-hover:text-[#38e1ff] transition-colors line-clamp-1">{c.title}</p>
          <p className="text-xs flex items-center gap-1 mt-0.5 text-muted-foreground">
            <MapPin className="w-3 h-3 shrink-0" />{c.location}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-5 shrink-0">
          <div className="text-center">
            <p className="text-sm font-bold tabular-nums">{c.evidenceCount}</p>
            <p className="text-2xs text-muted-foreground">evidence</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold tabular-nums">{c.suspects}</p>
            <p className="text-2xs text-muted-foreground">suspects</p>
          </div>
          {c.aiProcessed && <ConfidenceBadge score={c.confidenceScore} size="sm" showLabel={false} />}
        </div>
        <ChevronRight className="w-4 h-4 shrink-0 opacity-30 group-hover:opacity-100 group-hover:text-[#00b4d8] transition-all" />
      </Link>
    </motion.div>
  );
}

// ── Main Dashboard ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const stats = mockDashboardStats;
  const criticals = mockAlerts.filter(a => a.severity === 'critical' && !a.read);
  const [liveStats, setLiveStats] = useState<LiveSystemStats>(LIVE_STATS_BASELINE);
  const [tick, setTick] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'telemetry' | 'insights'>('overview');

  useEffect(() => {
    const iv = setInterval(() => {
      setTick(t => t + 1);
      setLiveStats(s => jitterStats(s, tick));
    }, 2000);
    return () => clearInterval(iv);
  }, [tick]);

  const STATS = [
    { label: 'Active Cases',      value: stats.activeCases,        sub: '4 active · 2 historical', icon: Shield,       color: '#00b4d8', trend: '+12%' },
    { label: 'Evidence Items',    value: stats.totalEvidence,      sub: `${stats.processingQueue} queued`, icon: Film, color: '#1565c0', trend: '+8%' },
    { label: 'Suspects Tracked',  value: liveStats.suspectsActive, sub: 'ReID active',              icon: Users,        color: '#f59e0b' },
    { label: 'AI Accuracy',       value: `${liveStats.detectionAccuracy}%`, sub: 'frame detection', icon: BrainCircuit, color: '#22c55e', trend: '+2.3%' },
    { label: 'Active Cameras',    value: liveStats.activeCameras,  sub: 'live feeds',               icon: Crosshair,    color: '#a78bfa' },
    { label: 'Reports',           value: stats.reportsGenerated,   sub: 'this month',               icon: FileText,     color: '#1565c0', trend: '+5' },
    { label: 'Processing FPS',    value: liveStats.processingFps,  sub: 'inference',                icon: Zap,          color: '#00b4d8' },
    { label: 'ReID Matches',      value: `${liveStats.reidMatches}/min`, sub: 'cross-camera',       icon: GitMerge,     color: '#fb923c' },
  ];

  const SERVICES = [
    { l: 'API',      icon: Zap,      ms: '4ms'    },
    { l: 'Database', icon: Database, ms: '2ms'    },
    { l: 'AI/YOLO',  icon: Cpu,      ms: '120ms'  },
    { l: 'Redis',    icon: Activity, ms: '1ms'    },
    { l: 'Network',  icon: Wifi,     ms: `${liveStats.networkLatency}ms` },
  ];

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Header */}
        <div className="flex items-start justify-between gap-6">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-2 mb-1">
              <div style={{ width: 4, height: 20, borderRadius: 2, background: 'var(--accent)', boxShadow: '0 0 10px var(--accent-glow)' }} />
              <span className="text-2xs font-bold uppercase tracking-widest text-accent">Operations Center</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Intelligence Dashboard</h1>
            <p className="text-sm mt-1 text-muted-foreground">
              {stats.activeCases} active · {liveStats.processingFps} fps · {liveStats.detectionAccuracy}% accuracy
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
            <LiveClock />
          </motion.div>
        </div>

        {/* Critical alert banner */}
        <AnimatePresence>
          {criticals.map(a => (
            <motion.div key={a.id}
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-4 px-5 py-3.5 rounded-2xl"
              style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', backdropFilter: 'blur(8px)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <Siren className="w-5 h-5 text-danger" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#f87171]">{a.title}</p>
                <p className="text-xs mt-0.5 text-muted-foreground">{a.message}</p>
              </div>
              <Link href="/investigation"
                className="text-xs font-semibold px-4 py-2 rounded-xl transition-all hover:scale-105"
                style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                Investigate →
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-surface border border-border w-fit">
          {(['overview', 'telemetry', 'insights'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={cn('px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all',
                activeTab === tab ? 'bg-accent/15 text-accent' : 'text-muted-foreground hover:text-foreground')}>
              {tab}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {activeTab === 'overview' && (
          <>
            {/* Stats grid */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {STATS.map(s => <StatCard key={s.label} {...s} />)}
            </motion.div>

            {/* Main content: cases + right col */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 340px', gap: '1.25rem' }}>
              {/* Cases */}
              <div style={{ gridColumn: '1/3' }}>
                <div className="card-panel-flat overflow-hidden rounded-2xl">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-white/[0.01]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[var(--accent-dim)]">
                        <Eye className="w-4 h-4 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">Active Investigations</p>
                        <p className="text-2xs text-muted-foreground">{mockCases.length} total cases</p>
                      </div>
                    </div>
                    <Link href="/cases" className="flex items-center gap-1 text-xs font-semibold text-accent hover:text-[#38e1ff] transition-colors">
                      View all <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  {mockCases.slice(0, 6).map((c, i) => <CaseRow key={c.id} c={c} i={i} />)}
                </div>
              </div>

              {/* Right column */}
              <div className="flex flex-col gap-5">
                {/* Alert feed */}
                <div className="card-panel-flat overflow-hidden rounded-2xl">
                  <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-border bg-white/[0.01]">
                    <div className="w-2 h-2 rounded-full bg-danger animate-pulse" style={{ boxShadow: '0 0 8px #ef4444' }} />
                    <Radio className="w-4 h-4 text-danger" />
                    <span className="text-sm font-bold">Live Alerts</span>
                    <span className="badge-critical text-2xs ml-1">{mockAlerts.filter(a => !a.read).length}</span>
                  </div>
                  {mockAlerts.slice(0, 5).map((a, i) => (
                    <motion.div key={a.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                      className="flex gap-3 px-4 py-3 cursor-pointer"
                      style={{ borderBottom: '1px solid var(--border)', background: !a.read ? 'rgba(0,180,216,0.03)' : 'transparent' }}>
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                        style={{ background: a.severity === 'critical' ? '#ef4444' : a.severity === 'warning' ? '#f59e0b' : '#00b4d8' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold">{a.title}</p>
                        <p className="text-xs line-clamp-2 mt-0.5 leading-relaxed text-muted-foreground">{a.message}</p>
                        <p className="text-2xs mt-1 text-muted-foreground/60">{formatRelativeTime(a.createdAt)}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* System health */}
                <div className="card-panel-flat overflow-hidden rounded-2xl">
                  <div className="flex items-center justify-between px-4 py-3.5 border-b border-border bg-white/[0.01]">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-accent" />
                      <span className="text-sm font-bold">System Health</span>
                    </div>
                    <span className="flex items-center gap-1.5 text-2xs font-bold text-success">
                      <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> All Operational
                    </span>
                  </div>
                  <div className="p-4 space-y-2">
                    {SERVICES.map(s => {
                      const Icon = s.icon;
                      return (
                        <div key={s.l} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-[var(--accent-dim)]">
                            <Icon className="w-3.5 h-3.5 text-accent" />
                          </div>
                          <span className="text-xs font-semibold flex-1">{s.l}</span>
                          <span className="text-2xs font-mono text-success">{s.ms}</span>
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <DetectionChart />
              <CaseActivityChart />
            </div>
          </>
        )}

        {/* ── Telemetry Tab ── */}
        {activeTab === 'telemetry' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <LiveStatsPanel stats={liveStats} />
            <DatasetMetricsPanel />
          </motion.div>
        )}

        {/* ── Insights Tab ── */}
        {activeTab === 'insights' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <ForensicInsightsFeed />
          </motion.div>
        )}

      </div>
    </div>
  );
}
