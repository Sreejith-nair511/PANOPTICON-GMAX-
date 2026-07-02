'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Plus, Search, LayoutGrid, List, FolderOpen,
  MapPin, Calendar, Film, Users, ChevronRight, Lock,
  Shield, Clock, Tag, X,
} from 'lucide-react';
import { mockCases } from '@/lib/mockData';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfidenceBadge } from '@/components/ui/ConfidenceBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { cn, formatTimestamp, formatRelativeTime, getPriorityColor } from '@/lib/utils';
import type { Case, CaseStatus, CasePriority } from '@/types';

const PRIORITY_COLORS: Record<string, string> = {
  critical: '#ef4444', high: '#f59e0b', medium: '#00b4d8', low: '#64748b',
};
const PRIORITY_BG: Record<string, string> = {
  critical: 'rgba(239,68,68,0.08)', high: 'rgba(245,158,11,0.08)',
  medium: 'rgba(0,180,216,0.08)',   low: 'rgba(100,116,139,0.05)',
};

function CaseCard({ c, view, idx }: { c: Case; view: 'grid'|'list'; idx: number }) {
  const isHistorical = ['case-jack','case-cooper','case-zodiac','case-tupac'].includes(c.id);
  const bColor = PRIORITY_COLORS[c.priority];

  if (view === 'list') {
    return (
      <motion.div initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay: idx*0.04 }}>
        <Link href={`/cases/${c.id}`}
          className="flex items-center gap-4 px-4 py-3.5 border-b border-border/50 hover:bg-white/[0.025] transition-colors group">
          <div className="w-1 h-10 rounded-full shrink-0" style={{ background: bColor, boxShadow:`0 0 8px ${bColor}60` }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xs font-mono text-muted-foreground/50">{c.caseNumber}</span>
              <StatusBadge status={c.status} />
              {isHistorical && <span className="text-2xs px-1.5 py-0.5 rounded font-semibold tracking-wider" style={{ background:'rgba(180,130,60,0.12)', border:'1px solid rgba(180,130,60,0.25)', color:'rgba(200,160,80,0.9)' }}>COLD</span>}
            </div>
            <p className="text-sm font-semibold group-hover:text-accent transition-colors truncate">{c.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
              <MapPin className="w-3 h-3 shrink-0" />{c.location}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-6 shrink-0">
            <div className="text-center"><p className="text-sm font-bold">{c.evidenceCount}</p><p className="text-2xs text-muted-foreground">evidence</p></div>
            <div className="text-center"><p className="text-sm font-bold">{c.suspects}</p><p className="text-2xs text-muted-foreground">suspects</p></div>
            {c.aiProcessed && <ConfidenceBadge score={c.confidenceScore} size="sm" showLabel={false} />}
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-accent transition-colors shrink-0" />
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay: idx*0.05 }}
      whileHover={{ y:-3, transition:{ duration:0.15 } }}>
      <Link href={`/cases/${c.id}`}
        className="block rounded-2xl overflow-hidden group relative"
        style={{ background: PRIORITY_BG[c.priority], border:`1px solid ${bColor}30`, boxShadow:`0 2px 20px rgba(0,0,0,0.4), 0 0 0 0.5px rgba(255,255,255,0.03) inset` }}>

        {/* Priority stripe */}
        <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background:`linear-gradient(90deg, ${bColor}, transparent)` }} />

        {/* Cold case ribbon */}
        {isHistorical && (
          <div className="absolute top-3 right-3 flex items-center gap-1 text-2xs font-bold px-2 py-0.5 rounded-full tracking-wider"
            style={{ background:'rgba(180,130,60,0.15)', border:'1px solid rgba(180,130,60,0.3)', color:'rgba(200,160,80,0.9)' }}>
            <Lock className="w-2.5 h-2.5" /> COLD CASE
          </div>
        )}

        <div className="p-5">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
              style={{ background:`${bColor}18`, border:`1px solid ${bColor}30` }}>
              <Shield className="w-4.5 h-4.5" style={{ color: bColor }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-2xs font-mono text-muted-foreground/50">{c.caseNumber}</span>
                <StatusBadge status={c.status} />
              </div>
              <h3 className="text-sm font-bold leading-snug group-hover:text-accent transition-colors pr-16 line-clamp-2">{c.title}</h3>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-4">{c.description}</p>

          <div className="space-y-1.5 mb-4">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 shrink-0 text-accent/50" />
              <span className="truncate">{c.location}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3 shrink-0 text-accent/50" />
              <span>{formatTimestamp(c.incidentDate, 'dd MMM yyyy')}</span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex gap-1 flex-wrap mb-4">
            {c.tags.slice(0,3).map(t => (
              <span key={t} className="text-2xs px-1.5 py-0.5 rounded-md font-mono" style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(148,163,184,0.8)' }}>#{t}</span>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3" style={{ borderTop:`1px solid rgba(255,255,255,0.06)` }}>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1 text-2xs text-muted-foreground"><Film className="w-3 h-3" />{c.evidenceCount}</span>
              <span className="flex items-center gap-1 text-2xs text-muted-foreground"><Users className="w-3 h-3" />{c.suspects}</span>
              <span className="text-2xs font-semibold capitalize" style={{ color: bColor }}>{c.priority}</span>
            </div>
            {c.aiProcessed ? <ConfidenceBadge score={c.confidenceScore} size="sm" showLabel={false} /> : (
              <span className="text-2xs text-muted-foreground/40 font-mono">AI pending</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export default function CasesPage() {
  const [view,    setView]    = useState<'grid'|'list'>('grid');
  const [search,  setSearch]  = useState('');
  const [status,  setStatus]  = useState<string>('all');
  const [priority,setPriority]= useState<string>('all');
  const [showNew, setShowNew] = useState(false);

  const filtered = useMemo(() => {
    let list = [...mockCases];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c => c.title.toLowerCase().includes(q) || c.caseNumber.toLowerCase().includes(q) || c.location.toLowerCase().includes(q));
    }
    if (status   !== 'all') list = list.filter(c => c.status   === status);
    if (priority !== 'all') list = list.filter(c => c.priority === priority);
    return list;
  }, [search, status, priority]);

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1 h-5 rounded-full bg-accent" style={{ boxShadow:'0 0 8px #00b4d8' }} />
              <span className="text-xs font-bold text-accent/80 tracking-widest uppercase">Case Management</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Investigations</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} of {mockCases.length} cases · {mockCases.filter(c=>c.status==='active').length} active</p>
          </div>
          <button onClick={() => setShowNew(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background:'linear-gradient(135deg,#00b4d8,#1565c0)', color:'white', boxShadow:'0 4px 20px rgba(0,180,216,0.35)' }}>
            <Plus className="w-4 h-4" /> New Investigation
          </button>
        </motion.div>

        {/* Filters */}
        <motion.div initial={{ opacity:0, y:4 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }}
          className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search cases…"
              className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-all"
              style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }} />
            {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground"><X className="w-3.5 h-3.5" /></button>}
          </div>

          {[
            { label:'All Status', options:[['all','All'],['active','Active'],['pending','Pending'],['closed','Closed']], val:status, set:setStatus },
            { label:'All Priority', options:[['all','All'],['critical','Critical'],['high','High'],['medium','Medium'],['low','Low']], val:priority, set:setPriority },
          ].map(f => (
            <select key={f.label} value={f.val} onChange={e => f.set(e.target.value)}
              className="px-3 py-2.5 text-sm rounded-xl text-foreground focus:outline-none cursor-pointer"
              style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
              {f.options.map(([v,l]) => <option key={v} value={v} style={{ background:'#0d1526' }}>{l}</option>)}
            </select>
          ))}

          <div className="ml-auto flex items-center rounded-xl overflow-hidden" style={{ border:'1px solid rgba(255,255,255,0.08)' }}>
            {(['grid','list'] as const).map((m, i) => {
              const Icon = m === 'grid' ? LayoutGrid : List;
              return (
                <button key={m} onClick={() => setView(m)}
                  className={cn('p-2.5 transition-colors', i > 0 && 'border-l border-border/50', view === m ? 'text-accent bg-accent/10' : 'text-muted-foreground hover:text-foreground')}>
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Cases */}
        {filtered.length === 0
          ? <EmptyState icon={FolderOpen} title="No cases found" description="Adjust your filters or create a new investigation." />
          : view === 'grid'
            ? <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((c,i) => <CaseCard key={c.id} c={c} view="grid" idx={i} />)}
              </div>
            : <div className="card-panel rounded-2xl overflow-hidden">
                <div className="px-4 py-3 text-2xs font-semibold text-muted-foreground/50 uppercase tracking-widest flex justify-between border-b border-border/50">
                  <span>Case Details</span><span>Stats</span>
                </div>
                {filtered.map((c,i) => <CaseCard key={c.id} c={c} view="list" idx={i} />)}
              </div>
        }
      </div>

      {/* New Case Modal */}
      {showNew && <NewCaseModal onClose={() => setShowNew(false)} />}
    </div>
  );
}

function NewCaseModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ title:'', priority:'high', category:'', location:'', date:'', description:'' });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)' }}>
      <motion.div initial={{ opacity:0, scale:0.97, y:8 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.97 }}
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background:'rgba(5,8,18,0.97)', border:'1px solid rgba(255,255,255,0.08)', boxShadow:'0 24px 80px rgba(0,0,0,0.8)' }}>
        <div className="flex items-center justify-between p-6" style={{ borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <h2 className="text-base font-bold">New Investigation</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Create a forensic investigation case</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          {[
            { k:'title', l:'Case Title', ph:'e.g. Armed Robbery – Central Mall', type:'text' },
            { k:'location', l:'Location', ph:'e.g. Central Station, Platform 4', type:'text' },
          ].map(f => (
            <div key={f.k}>
              <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">{f.l}</label>
              <input type={f.type} value={(form as any)[f.k]} onChange={e => set(f.k, e.target.value)} placeholder={f.ph}
                className="w-full mt-1.5 px-3.5 py-2.5 text-sm rounded-xl text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-all"
                style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)' }} />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Priority</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)}
                className="w-full mt-1.5 px-3.5 py-2.5 text-sm rounded-xl text-foreground focus:outline-none cursor-pointer"
                style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)' }}>
                {['critical','high','medium','low'].map(v => <option key={v} value={v} style={{ background:'#0d1526' }} className="capitalize">{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Date</label>
              <input type="datetime-local" value={form.date} onChange={e => set('date', e.target.value)}
                className="w-full mt-1.5 px-3.5 py-2.5 text-sm rounded-xl text-foreground focus:outline-none [color-scheme:dark]"
                style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)' }} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
              placeholder="Brief incident description…"
              className="w-full mt-1.5 px-3.5 py-2.5 text-sm rounded-xl text-foreground placeholder:text-muted-foreground/40 focus:outline-none resize-none"
              style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)' }} />
          </div>
        </div>
        <div className="flex gap-3 p-6" style={{ borderTop:'1px solid rgba(255,255,255,0.07)' }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm text-muted-foreground border border-border hover:text-foreground transition-colors">Cancel</button>
          <button onClick={onClose} disabled={!form.title || !form.location}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
            style={{ background:'linear-gradient(135deg,#00b4d8,#1565c0)', color:'white' }}>
            Create Investigation
          </button>
        </div>
      </motion.div>
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
}
