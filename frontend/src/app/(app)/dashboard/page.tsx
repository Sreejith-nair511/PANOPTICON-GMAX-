'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Shield, Film, Users, FileText, BrainCircuit, AlertTriangle,
  TrendingUp, Target, Clock, MapPin, ChevronRight, Zap, Activity,
  Eye, Lock, Radio, ArrowUpRight, Cpu, Database, Wifi,
} from 'lucide-react';
import { mockCases, mockDashboardStats, mockAlerts, mockSuspects } from '@/lib/mockData';
import { ConfidenceBadge } from '@/components/ui/ConfidenceBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DetectionChart, CaseActivityChart } from '@/components/dashboard/DetectionChart';
import { cn, formatRelativeTime } from '@/lib/utils';

// ── Live Clock (SSR-safe) ─────────────────────────────────────────────────────
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
      <p className="text-xs mt-0.5" style={{ color:'var(--text-secondary)' }} suppressHydrationWarning>
        {time ? time.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' }) : ''}
      </p>
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color, trend }: {
  label: string; value: string|number; sub?: string;
  icon: React.ElementType; color: string; trend?: string;
}) {
  return (
    <motion.div whileHover={{ y:-3, transition:{ duration:0.15 } }} className="metric-card group">
      <div style={{ position:'absolute', top:0, left:0, right:0, height:'1px', background:`linear-gradient(90deg, transparent, ${color}66, transparent)`, opacity:0, transition:'opacity 0.2s' }} className="group-hover:opacity-100" />
      <div className="flex items-start justify-between mb-4">
        <span className="text-2xs font-bold uppercase tracking-widest" style={{ color:'var(--text-dim)' }}>{label}</span>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background:`${color}15`, border:`1px solid ${color}25` }}>
          <Icon className="w-4 h-4" style={{ color }} />
        </div>
      </div>
      <div className="text-3xl font-bold tabular-nums tracking-tight mb-1">{value}</div>
      {(sub || trend) && (
        <div className="flex items-center gap-2">
          {trend && <span className="flex items-center gap-1 text-2xs font-semibold" style={{ color:'#4ade80' }}><TrendingUp className="w-3 h-3" />{trend}</span>}
          {sub && <span className="text-2xs" style={{ color:'var(--text-dim)' }}>{sub}</span>}
        </div>
      )}
    </motion.div>
  );
}

// ── Case row ──────────────────────────────────────────────────────────────────
const P_COLOR: Record<string,string> = { critical:'#ef4444', high:'#f59e0b', medium:'#00b4d8', low:'#64748b' };

function CaseRow({ c, i }: { c: typeof mockCases[0]; i: number }) {
  const isHistorical = ['case-jack','case-cooper','case-zodiac','case-tupac'].includes(c.id);
  const col = P_COLOR[c.priority];
  return (
    <motion.div initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.05 }}>
      <Link href={`/cases/${c.id}`}
        className="flex items-center gap-4 px-5 py-3.5 transition-colors group"
        style={{ borderBottom:'1px solid var(--border)' }}>
        <div className="w-1 h-10 rounded-full shrink-0" style={{ background:col, boxShadow:`0 0 10px ${col}50` }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-2xs font-mono" style={{ color:'var(--text-dim)' }}>{c.caseNumber}</span>
            <StatusBadge status={c.status} />
            {isHistorical && (
              <span className="text-2xs font-bold flex items-center gap-1 px-1.5 py-0.5 rounded" style={{ background:'rgba(180,130,60,0.12)', border:'1px solid rgba(180,130,60,0.25)', color:'rgba(200,160,80,0.9)' }}>
                <Lock className="w-2.5 h-2.5" />COLD
              </span>
            )}
          </div>
          <p className="text-sm font-semibold group-hover:text-[#38e1ff] transition-colors line-clamp-1">{c.title}</p>
          <p className="text-xs line-clamp-1 flex items-center gap-1 mt-0.5" style={{ color:'var(--text-dim)' }}>
            <MapPin className="w-3 h-3 shrink-0" />{c.location}
          </p>
        </div>
        <div className="hidden md:flex items-center gap-5 shrink-0">
          <div className="text-center">
            <p className="text-sm font-bold tabular-nums">{c.evidenceCount}</p>
            <p className="text-2xs" style={{ color:'var(--text-dim)' }}>evidence</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold tabular-nums">{c.suspects}</p>
            <p className="text-2xs" style={{ color:'var(--text-dim)' }}>suspects</p>
          </div>
          {c.aiProcessed && <ConfidenceBadge score={c.confidenceScore} size="sm" showLabel={false} />}
        </div>
        <ChevronRight className="w-4 h-4 shrink-0 opacity-30 group-hover:opacity-100 group-hover:text-[#00b4d8] transition-all" />
      </Link>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const stats = mockDashboardStats;
  const criticals = mockAlerts.filter(a => a.severity==='critical' && !a.read);

  const STATS = [
    { label:'Active Cases',     value:stats.activeCases,   sub:'4 current + 2 historical', icon:Shield,       color:'#00b4d8', trend:'+12%' },
    { label:'Evidence Items',   value:stats.totalEvidence, sub:`${stats.processingQueue} in queue`, icon:Film, color:'#1565c0', trend:'+8%'  },
    { label:'Suspects Tracked', value:stats.suspectsTracked, sub:'ReID active',             icon:Users,        color:'#f59e0b'               },
    { label:'AI Accuracy',      value:`${stats.aiAccuracy}%`, sub:'model performance',      icon:BrainCircuit, color:'#22c55e', trend:'+2.3%' },
    { label:'Queue',            value:stats.processingQueue,  sub:'~14 min avg',            icon:Target,       color:'#00b4d8'               },
    { label:'Reports',          value:stats.reportsGenerated, sub:'this month',             icon:FileText,     color:'#1565c0', trend:'+5'    },
    { label:'Alerts',           value:stats.alertsToday,    sub:'1 critical',               icon:AlertTriangle,color:'#f59e0b'               },
    { label:'Detection Rate',   value:'94.2%',              sub:'frame accuracy',           icon:TrendingUp,   color:'#22c55e', trend:'+1.8%' },
  ];

  const SERVICES = [
    { l:'API',      icon:Zap,      ok:true,  ms:'4ms'   },
    { l:'Database', icon:Database, ok:true,  ms:'2ms'   },
    { l:'AI',       icon:Cpu,      ok:true,  ms:'120ms' },
    { l:'Redis',    icon:Activity, ok:true,  ms:'1ms'   },
    { l:'Network',  icon:Wifi,     ok:true,  ms:'8ms'   },
  ];

  return (
    <div style={{ height:'100%', overflowY:'auto' }}>
      <div style={{ maxWidth:1600, margin:'0 auto', padding:'1.5rem', display:'flex', flexDirection:'column', gap:'1.5rem' }}>

        {/* Header */}
        <div className="flex items-start justify-between gap-6">
          <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}>
            <div className="flex items-center gap-2 mb-1">
              <div style={{ width:4, height:20, borderRadius:2, background:'var(--accent)', boxShadow:`0 0 10px var(--accent-glow)` }} />
              <span className="text-2xs font-bold uppercase tracking-widest" style={{ color:'var(--accent)' }}>Operations Center</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Intelligence Dashboard</h1>
            <p className="text-sm mt-1" style={{ color:'var(--text-secondary)' }}>
              {stats.activeCases} active · {stats.processingQueue} queued · AI accuracy {stats.aiAccuracy}%
            </p>
          </motion.div>
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.1 }}>
            <LiveClock />
          </motion.div>
        </div>

        {/* Critical alert */}
        {criticals.map(a => (
          <motion.div key={a.id} initial={{ opacity:0, y:-4 }} animate={{ opacity:1, y:0 }}
            style={{ display:'flex', alignItems:'center', gap:16, padding:'14px 20px', borderRadius:14, background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.2)', backdropFilter:'blur(8px)' }}>
            <div style={{ width:36, height:36, borderRadius:10, background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.25)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <AlertTriangle className="w-5 h-5" style={{ color:'#ef4444' }} />
            </div>
            <div style={{ flex:1 }}>
              <p className="text-sm font-bold" style={{ color:'#f87171' }}>{a.title}</p>
              <p className="text-xs mt-0.5" style={{ color:'var(--text-secondary)' }}>{a.message}</p>
            </div>
            <Link href="/investigation"
              className="text-xs font-semibold px-4 py-2 rounded-xl transition-all hover:scale-105"
              style={{ background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.3)', color:'#f87171' }}>
              Investigate →
            </Link>
          </motion.div>
        ))}

        {/* Stats grid */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.05 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s,i) => <StatCard key={s.label} {...s} />)}
        </motion.div>

        {/* Main 3-col grid */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 340px', gap:'1.25rem' }}>

          {/* Cases list */}
          <div style={{ gridColumn:'1/3' }}>
            <div className="card-panel-flat overflow-hidden" style={{ borderRadius:16 }}>
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom:'1px solid var(--border)', background:'rgba(255,255,255,0.01)' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:'var(--accent-dim)' }}>
                    <Eye className="w-4 h-4" style={{ color:'var(--accent)' }} />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Active Investigations</p>
                    <p className="text-2xs" style={{ color:'var(--text-dim)' }}>{mockCases.length} total cases</p>
                  </div>
                </div>
                <Link href="/cases" className="flex items-center gap-1 text-xs font-semibold transition-colors hover:text-[#38e1ff]" style={{ color:'var(--accent)' }}>
                  View all <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              {mockCases.slice(0,6).map((c,i) => <CaseRow key={c.id} c={c} i={i} />)}
            </div>
          </div>

          {/* Right column */}
          <div style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>

            {/* Alert feed */}
            <div className="card-panel-flat overflow-hidden" style={{ borderRadius:16 }}>
              <div className="flex items-center gap-2.5 px-4 py-3.5" style={{ borderBottom:'1px solid var(--border)', background:'rgba(255,255,255,0.01)' }}>
                <div className="w-2 h-2 rounded-full bg-danger animate-pulse" style={{ boxShadow:'0 0 8px #ef4444' }} />
                <Radio className="w-4 h-4" style={{ color:'#ef4444' }} />
                <span className="text-sm font-bold">Live Alerts</span>
                <span className="badge-critical text-2xs ml-1">{mockAlerts.filter(a=>!a.read).length}</span>
              </div>
              {mockAlerts.map((a,i) => (
                <motion.div key={a.id} initial={{ opacity:0, x:12 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.07 }}
                  className="flex gap-3 px-4 py-3 cursor-pointer"
                  style={{ borderBottom:'1px solid var(--border)', background: !a.read ? 'rgba(0,180,216,0.03)' : 'transparent', transition:'background 0.15s' }}>
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: a.severity==='critical'?'#ef4444':a.severity==='warning'?'#f59e0b':'#00b4d8' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold">{a.title}</p>
                    <p className="text-xs line-clamp-2 mt-0.5 leading-relaxed" style={{ color:'var(--text-secondary)' }}>{a.message}</p>
                    <p className="text-2xs mt-1" style={{ color:'var(--text-dim)' }}>{formatRelativeTime(a.createdAt)}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* System health */}
            <div className="card-panel-flat overflow-hidden" style={{ borderRadius:16 }}>
              <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom:'1px solid var(--border)', background:'rgba(255,255,255,0.01)' }}>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4" style={{ color:'var(--accent)' }} />
                  <span className="text-sm font-bold">System Health</span>
                </div>
                <span className="flex items-center gap-1.5 text-2xs font-bold" style={{ color:'#4ade80' }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> All Operational
                </span>
              </div>
              <div className="p-4 space-y-2">
                {SERVICES.map(s => {
                  const Icon = s.icon;
                  return (
                    <div key={s.l} className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors" style={{ border:'1px solid var(--border)' }}>
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background:'var(--accent-dim)' }}>
                        <Icon className="w-3.5 h-3.5" style={{ color:'var(--accent)' }} />
                      </div>
                      <span className="text-xs font-semibold flex-1">{s.l}</span>
                      <span className="text-2xs font-mono" style={{ color:'#4ade80' }}>{s.ms}</span>
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background:'#22c55e', boxShadow:'0 0 6px #22c55e' }} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Suspects */}
            <div className="card-panel-flat overflow-hidden" style={{ borderRadius:16 }}>
              <div className="flex items-center justify-between px-4 py-3.5" style={{ borderBottom:'1px solid var(--border)', background:'rgba(255,255,255,0.01)' }}>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" style={{ color:'#f59e0b' }} />
                  <span className="text-sm font-bold">Suspects</span>
                </div>
                <Link href="/tracking" className="text-xs font-semibold" style={{ color:'var(--accent)' }}>All →</Link>
              </div>
              <div className="p-3 space-y-2">
                {mockSuspects.slice(0,4).map((s,i) => (
                  <motion.div key={s.id} initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ delay:i*0.06 }}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl cursor-pointer transition-colors"
                    style={{ border:'1px solid var(--border)', transition:'all 0.15s' }}>
                    <div className="relative shrink-0">
                      <img src={s.thumbnailUrl} alt="" className="w-8 h-8 rounded-xl object-cover" />
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2" style={{ background:'#f59e0b', borderColor:'var(--bg-surface)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{s.label}</p>
                      <p className="text-2xs" style={{ color:'var(--text-dim)' }}>{s.cameras.length} cams</p>
                    </div>
                    <ConfidenceBadge score={s.confidenceScore} size="sm" showLabel={false} />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <DetectionChart />
          <CaseActivityChart />
        </div>

        {/* AI Pipeline */}
        <div className="card-panel-flat overflow-hidden" style={{ borderRadius:16 }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom:'1px solid var(--border)', background:'rgba(255,255,255,0.01)' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background:'var(--accent-dim)' }}>
                <BrainCircuit className="w-4 h-4" style={{ color:'var(--accent)' }} />
              </div>
              <div>
                <p className="text-sm font-bold">AI Processing Pipeline</p>
                <p className="text-2xs" style={{ color:'var(--text-dim)' }}>Active jobs</p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color:'var(--accent)' }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background:'var(--accent)' }} /> Live
            </span>
          </div>
          <div className="overflow-x-auto">
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'rgba(255,255,255,0.02)' }}>
                  {['Case','File','Status','Duration','Detections','Confidence'].map(h => (
                    <th key={h} style={{ padding:'10px 20px', textAlign:'left', fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--text-dim)', borderBottom:'1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { c:'PAN-1888-0001', f:'Whitechapel photo batch', s:'completed', d:'2h 14m', det:'47 images', conf:71 },
                  { c:'PAN-1971-0001', f:'NORJAK FBI files',        s:'completed', d:'3h 02m', det:'89 docs',   conf:41 },
                  { c:'PAN-2026-0047', f:'Station Camera 4',        s:'completed', d:'45m',    det:'124 frames',conf:92 },
                  { c:'PAN-1969-0001', f:'Cipher image analysis',   s:'processing',d:'running…',det:'—',        conf:0  },
                ].map((job,i) => (
                  <tr key={i} className="data-row">
                    <td style={{ padding:'12px 20px' }}><span style={{ fontFamily:'monospace', fontSize:11, color:'var(--text-dim)' }}>{job.c}</span></td>
                    <td style={{ padding:'12px 20px' }}><span style={{ fontSize:13, fontWeight:500 }}>{job.f}</span></td>
                    <td style={{ padding:'12px 20px' }}>
                      <span className={job.s==='completed'?'badge-active':job.s==='processing'?'badge-info':'badge-pending'}>{job.s}</span>
                    </td>
                    <td style={{ padding:'12px 20px' }}><span style={{ fontFamily:'monospace', fontSize:12, color:'var(--text-secondary)' }}>{job.d}</span></td>
                    <td style={{ padding:'12px 20px' }}><span style={{ fontSize:12, color:'var(--text-secondary)' }}>{job.det}</span></td>
                    <td style={{ padding:'12px 20px' }}>
                      {job.conf > 0 ? <ConfidenceBadge score={job.conf} size="sm" showLabel={false} /> : <span style={{ color:'var(--text-dim)', fontSize:12 }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
