'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Film, Users, Clock, MapPin, Shield, BrainCircuit,
  FileText, Upload, ChevronRight, Calendar, Tag, CheckCircle,
  AlertTriangle, Lock, Download, Eye, Bookmark, Camera,
  Target, Play, Network, Box, Printer, Sparkles, X,
} from 'lucide-react';
import {
  mockCases, mockEvidence, mockSuspects, mockTimeline,
} from '@/lib/mockData';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfidenceBadge } from '@/components/ui/ConfidenceBadge';
import {
  cn, formatTimestamp, formatRelativeTime, getPriorityColor,
  formatFileSize, formatDuration,
} from '@/lib/utils';
import { toast } from 'sonner';

// ── Case-specific synopsis copy ───────────────────────────────────────────────
const AI_SYNOPSIS: Record<string, string> = {
  'case-jack':
    'AI reanalysis of 1888 Whitechapel Metropolitan Police files complete. 47 digitised evidence items processed including crime scene photographs, witness statements, and police memoranda. Geographic profiling places the perpetrator in a 0.3-mile radius centred on Flower and Dean Street. Wound pattern analysis confirms left-handedness and anatomical knowledge. Current highest-ranked suspect: Aaron Kosminski (62% confidence) based on DNA, behavioural, and geographic correlation.',
  'case-cooper':
    'FBI NORJAK file analysis complete. 89 evidence items processed across 45 years of investigation. AI age-progression modelling applied to FBI composite sketch against 18 known suspects. Parachute drop zone calculation places landing in a 1.2-mile radius near Ariel, Washington. Ransom serial number analysis cross-referenced against Federal Reserve records. Current highest-ranked suspect: Richard Floyd McCoy Jr. (55% confidence) based on physical similarity, MO correlation, and timeline alignment.',
  'case-zodiac':
    '340-character cipher decoded 2020. Full linguistic analysis completed. NLP model identifies potential geographic references to Mount Diablo and Lake Berryessa. Handwriting analysis consistent across all letters — right-handed, estimated age 25-45 at time of writing. Geographic profiling centres on Vallejo-Benicia area. Current highest-ranked suspect: Arthur Leigh Allen (48% confidence). DNA from 2002 letter sample did not match Allen, but chain-of-custody is disputed.',
  'case-tupac':
    'Las Vegas homicide reconstruction complete. Cross-reference of all available CCTV, witness statements, and law enforcement reports. White BMW 750IL identified on 4 separate cameras. Partial plate captured on 2 cameras — matched to Las Vegas rental record. Timeline reconstruction confirms shooter fired from white BMW travelling eastbound on Flamingo Road. Investigation links to South Side Compton Crips (SSCC) and Death Row Records rivalry.',
  'case-001':
    'Two suspects identified via cross-camera analysis across 3 CCTV feeds. Complete movement reconstruction from station arrival (14:28) to north exit escape (14:33). Suspect Alpha — high-confidence facial capture at 14:32:28. Suspect Beta confirmed as lookout. Firearm detection at 14:32:14 corroborated across two independent camera angles. ReID match on adjacent street camera 45 minutes post-incident.',
  'case-002':
    'Riverside Park homicide reconstruction in progress. Person of Interest 1 identified entering park 24 minutes before victim found. Exit recorded 8 minutes after estimated time of death. Facial capture quality: medium (night conditions, 720p). Additional camera requests pending. Forensic image enhancement in progress.',
};

const PRIORITY_COLOR: Record<string, string> = {
  critical: '#ef4444', high: '#f59e0b', medium: '#00b4d8', low: '#64748b',
};

type Tab = 'overview' | 'evidence' | 'suspects' | 'timeline' | 'reports';

export default function CaseDetailPage() {
  const { id: caseId } = useParams() as { id: string };
  const [tab, setTab] = useState<Tab>('overview');

  const caseData = mockCases.find(c => c.id === caseId);
  const evidence  = mockEvidence .filter(e => e.caseId === caseId);
  const suspects  = mockSuspects .filter(s => s.caseId === caseId);
  const timeline  = mockTimeline .filter(t => t.caseId === caseId);

  if (!caseData) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <Shield className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Case not found.</p>
        <Link href="/cases" className="mt-4 inline-flex items-center gap-2 text-sm text-accent hover:text-accent-glow">
          <ArrowLeft className="w-4 h-4" /> Back to Cases
        </Link>
      </div>
    </div>
  );

  const isHistorical = ['case-jack','case-cooper','case-zodiac','case-tupac'].includes(caseId);
  const bColor = PRIORITY_COLOR[caseData.priority];
  const synopsis = AI_SYNOPSIS[caseId] ?? 'AI analysis in progress.';

  const TABS: { id: Tab; label: string; count?: number }[] = [
    { id: 'overview',  label: 'Overview'  },
    { id: 'evidence',  label: 'Evidence',  count: evidence.length  },
    { id: 'suspects',  label: 'Suspects',  count: suspects.length  },
    { id: 'timeline',  label: 'Timeline',  count: timeline.length  },
    { id: 'reports',   label: 'Reports'   },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-[1400px] mx-auto p-6 space-y-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/cases" className="flex items-center gap-1.5 hover:text-foreground transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Cases
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30" />
          <span className="font-mono text-xs text-muted-foreground/60">{caseData.caseNumber}</span>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/30" />
          <span className="text-foreground font-medium line-clamp-1 max-w-xs">{caseData.title}</span>
        </div>

        {/* Hero header */}
        <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }}
          className="rounded-2xl overflow-hidden relative"
          style={{ background:`linear-gradient(135deg, rgba(${bColor==='#ef4444'?'239,68,68':'245,158,11'===bColor?'245,158,11':'0,180,216'},0.07) 0%, rgba(5,8,18,0.95) 60%)`, border:`1px solid ${bColor}25`, boxShadow:`0 4px 40px rgba(0,0,0,0.5), 0 0 0 0.5px rgba(255,255,255,0.03) inset` }}>

          {/* Top accent bar */}
          <div className="h-0.5 w-full" style={{ background:`linear-gradient(90deg, ${bColor}, ${bColor}00)` }} />

          <div className="p-6">
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1 min-w-0">
                {/* Badges row */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="text-xs font-mono text-muted-foreground/50">{caseData.caseNumber}</span>
                  <StatusBadge status={caseData.status} />
                  <span className="text-xs font-bold capitalize px-2 py-0.5 rounded-md" style={{ background:`${bColor}18`, color:bColor, border:`1px solid ${bColor}35` }}>{caseData.priority}</span>
                  {isHistorical && (
                    <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-md tracking-wider" style={{ background:'rgba(180,130,60,0.15)', border:'1px solid rgba(180,130,60,0.3)', color:'rgba(200,160,80,0.9)' }}>
                      <Lock className="w-3 h-3" /> COLD CASE
                    </span>
                  )}
                  {caseData.aiProcessed && (
                    <span className="flex items-center gap-1 text-xs font-medium text-accent bg-accent/10 border border-accent/25 px-2 py-0.5 rounded-md">
                      <BrainCircuit className="w-3 h-3" /> AI Processed
                    </span>
                  )}
                </div>

                <h1 className="text-2xl font-bold tracking-tight mb-2">{caseData.title}</h1>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">{caseData.description}</p>

                <div className="flex flex-wrap gap-4 mt-4">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 text-accent/50" /> {caseData.location}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5 text-accent/50" />
                    {formatTimestamp(caseData.incidentDate, 'dd MMM yyyy')}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5 text-accent/50" />
                    Updated {formatRelativeTime(caseData.updatedAt)}
                  </span>
                </div>

                {/* Tags */}
                {caseData.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                    <Tag className="w-3 h-3 text-muted-foreground/40" />
                    {caseData.tags.map(t => (
                      <span key={t} className="text-2xs px-1.5 py-0.5 rounded-md font-mono" style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', color:'rgba(148,163,184,0.8)' }}>#{t}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Right stats block */}
              <div className="shrink-0 flex flex-col items-end gap-4">
                {caseData.aiProcessed && (
                  <div className="p-4 rounded-2xl text-right" style={{ background:'rgba(0,180,216,0.07)', border:'1px solid rgba(0,180,216,0.18)' }}>
                    <p className="text-2xs text-muted-foreground/60 uppercase tracking-wider mb-1.5">AI Confidence</p>
                    <ConfidenceBadge score={caseData.confidenceScore} showBar />
                  </div>
                )}
                <div className="flex items-center gap-5">
                  {[['Evidence', caseData.evidenceCount], ['Suspects', caseData.suspects]].map(([l,v]) => (
                    <div key={l} className="text-center">
                      <p className="text-3xl font-bold tabular-nums">{v}</p>
                      <p className="text-2xs text-muted-foreground uppercase tracking-wider">{l}</p>
                    </div>
                  ))}
                </div>
                {/* Quick actions */}
                <div className="flex items-center gap-2">
                  <Link href="/investigation" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all" style={{ background:'linear-gradient(135deg,#00b4d8,#1565c0)', color:'white' }}>
                    <Eye className="w-3.5 h-3.5" /> Investigate
                  </Link>
                  <Link href="/ai-assistant" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-accent/30 text-accent hover:bg-accent/10 transition-colors">
                    <BrainCircuit className="w-3.5 h-3.5" /> AI Copilot
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center gap-0.5" style={{ borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn('flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-px',
                tab===t.id ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground')}>
              {t.label}
              {t.count !== undefined && (
                <span className={cn('text-2xs px-1.5 py-0.5 rounded-full min-w-[18px] text-center', tab===t.id ? 'bg-accent/15 text-accent' : 'bg-white/5 text-muted-foreground')}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ duration:0.18 }}>
            {tab === 'overview'  && <OverviewTab caseData={caseData} evidence={evidence} suspects={suspects} timeline={timeline} synopsis={synopsis} />}
            {tab === 'evidence'  && <EvidenceTab  evidence={evidence} />}
            {tab === 'suspects'  && <SuspectsTab  suspects={suspects} />}
            {tab === 'timeline'  && <TimelineTab  timeline={timeline} />}
            {tab === 'reports'   && <ReportsTab   caseData={caseData} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Overview Tab ──────────────────────────────────────────────────────────────
function OverviewTab({ caseData, evidence, suspects, timeline, synopsis }: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-5">
        {/* AI Synopsis */}
        {caseData.aiProcessed && (
          <div className="p-5 rounded-2xl" style={{ background:'rgba(0,180,216,0.05)', border:'1px solid rgba(0,180,216,0.15)' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:'linear-gradient(135deg,#00b4d8,#1565c0)' }}>
                <BrainCircuit className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold">AI Forensic Synopsis</p>
                <p className="text-2xs text-accent/60">Gemini Pro · {new Date(caseData.updatedAt).toLocaleDateString()}</p>
              </div>
              <ConfidenceBadge score={caseData.confidenceScore} size="sm" className="ml-auto" />
            </div>
            <p className="text-sm text-muted-foreground leading-7">{synopsis}</p>
          </div>
        )}

        {/* Evidence preview grid */}
        {evidence.length > 0 && (
          <div className="rounded-2xl overflow-hidden" style={{ border:'1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)' }}>
              <div className="flex items-center gap-2"><Film className="w-4 h-4 text-accent" /><span className="text-sm font-semibold">Evidence ({evidence.length})</span></div>
              <Link href={`/evidence`} className="text-xs text-accent hover:text-accent-glow flex items-center gap-1">View all <ChevronRight className="w-3 h-3" /></Link>
            </div>
            {evidence.slice(0,4).map((ev: any) => (
              <div key={ev.id} className="flex items-center gap-4 px-5 py-3 data-row hover:bg-white/[0.025]">
                <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-surface-raised">
                  {ev.thumbnailUrl
                    ? <img src={ev.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center"><Film className="w-4 h-4 text-accent/30" /></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{ev.originalName}</p>
                  <p className="text-xs text-muted-foreground">{ev.type} · {formatFileSize(ev.size)}{ev.duration && ` · ${formatDuration(ev.duration)}`}</p>
                </div>
                <StatusBadge status={ev.status} />
                {ev.aiResults?.confidence && <ConfidenceBadge score={ev.aiResults.confidence} size="sm" showLabel={false} />}
              </div>
            ))}
          </div>
        )}

        {/* Timeline preview */}
        {timeline.length > 0 && (
          <div className="rounded-2xl overflow-hidden" style={{ border:'1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)' }}>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-accent" /><span className="text-sm font-semibold">Key Events ({timeline.length})</span></div>
            </div>
            <div className="p-4 space-y-2">
              {timeline.map((evt: any, i: number) => (
                <motion.div key={evt.id} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.06 }}
                  className="flex items-start gap-3 p-3 rounded-xl transition-colors hover:bg-white/[0.025]">
                  <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0', evt.significance==='critical'?'bg-danger':evt.significance==='high'?'bg-warning':'bg-accent')} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-2xs font-mono text-muted-foreground/50">{formatTimestamp(evt.timestamp,'HH:mm:ss')}</span>
                      <span className={cn('text-2xs font-semibold capitalize', evt.significance==='critical'?'text-danger':evt.significance==='high'?'text-warning':'text-accent')}>{evt.significance}</span>
                    </div>
                    <p className="text-sm font-medium">{evt.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{evt.description}</p>
                  </div>
                  <ConfidenceBadge score={evt.confidence} size="sm" showLabel={false} />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right sidebar */}
      <div className="space-y-4">
        {/* Case info */}
        <div className="p-5 rounded-2xl space-y-3" style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)' }}>
          <h3 className="text-sm font-bold mb-1">Case Information</h3>
          {[
            ['Case Number',   caseData.caseNumber],
            ['Category',      caseData.category],
            ['Created By',    caseData.createdBy],
            ['Incident Date', formatTimestamp(caseData.incidentDate,'dd MMM yyyy')],
            ['Case Opened',   formatTimestamp(caseData.createdAt,'dd MMM yyyy')],
            ['Last Updated',  formatRelativeTime(caseData.updatedAt)],
          ].map(([l,v]) => (
            <div key={l} className="flex justify-between items-start gap-4 py-1.5" style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
              <span className="text-xs text-muted-foreground/70 shrink-0">{l}</span>
              <span className="text-xs font-semibold text-right">{v}</span>
            </div>
          ))}
        </div>

        {/* Suspects card */}
        {suspects.length > 0 && (
          <div className="p-5 rounded-2xl" style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-warning" />
              <h3 className="text-sm font-bold">Suspects ({suspects.length})</h3>
            </div>
            <div className="space-y-3">
              {suspects.map((s: any) => (
                <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer" style={{ border:'1px solid rgba(255,255,255,0.05)' }}>
                  <img src={s.thumbnailUrl} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{s.label}</p>
                    <p className="text-2xs text-muted-foreground">{s.cameras.length} cameras · {s.appearances} sightings</p>
                  </div>
                  <ConfidenceBadge score={s.confidenceScore} size="sm" showLabel={false} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className="p-5 rounded-2xl" style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)' }}>
          <h3 className="text-sm font-bold mb-3">Quick Actions</h3>
          <div className="space-y-1.5">
            {[
              { l:'Open Investigation', icon:Eye,          href:'/investigation', accent:true  },
              { l:'AI Copilot',          icon:BrainCircuit, href:'/ai-assistant',  accent:false },
              { l:'3D Scene View',       icon:Box,          href:'/investigation', accent:false },
              { l:'Relationship Graph',  icon:Network,      href:'/investigation', accent:false },
              { l:'View Reports',        icon:FileText,     href:'/reports',       accent:false },
            ].map(a => {
              const Icon = a.icon;
              return (
                <Link key={a.l} href={a.href}
                  className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all font-medium', a.accent ? 'text-white' : 'text-muted-foreground hover:text-foreground hover:bg-white/5')}
                  style={a.accent ? { background:'linear-gradient(135deg,#00b4d8,#1565c0)' } : { border:'1px solid rgba(255,255,255,0.06)' }}>
                  <Icon className={cn('w-4 h-4 shrink-0', a.accent ? 'text-white' : 'text-accent/60')} />{a.l}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Evidence Tab ──────────────────────────────────────────────────────────────
function EvidenceTab({ evidence }: { evidence: any[] }) {
  if (!evidence.length) return (
    <div className="rounded-2xl p-16 text-center" style={{ border:'1px solid rgba(255,255,255,0.07)' }}>
      <Film className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
      <p className="text-sm text-muted-foreground">No evidence uploaded yet.</p>
    </div>
  );
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {evidence.map((ev: any, i: number) => (
        <motion.div key={ev.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.06 }}
          className="rounded-2xl overflow-hidden group cursor-pointer transition-all hover:-translate-y-1"
          style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)', boxShadow:'0 2px 20px rgba(0,0,0,0.4)' }}>
          <div className="relative h-44 overflow-hidden bg-surface-raised">
            {ev.thumbnailUrl
              ? <img src={ev.thumbnailUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              : <div className="w-full h-full flex items-center justify-center"><Film className="w-10 h-10 text-muted-foreground/20" /></div>}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            {(ev.type==='video'||ev.type==='bodycam'||ev.type==='drone') && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm" style={{ background:'rgba(0,180,216,0.75)' }}>
                  <Play className="w-5 h-5 text-white ml-0.5" />
                </div>
              </div>
            )}
            <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
              <span className="badge-info text-2xs capitalize">{ev.type}</span>
              <StatusBadge status={ev.status} className="text-2xs" />
            </div>
            {ev.duration && <span className="absolute bottom-2 right-2 text-xs text-white/80 font-mono bg-black/60 px-1.5 py-0.5 rounded">{formatDuration(ev.duration)}</span>}
            {ev.aiResults && (
              <span className="absolute top-2 right-2 flex items-center gap-1 text-2xs px-1.5 py-0.5 rounded-full backdrop-blur-sm" style={{ background:'rgba(0,180,216,0.25)', border:'1px solid rgba(0,180,216,0.4)', color:'#7dd3fc' }}>
                <BrainCircuit className="w-2.5 h-2.5" /> AI
              </span>
            )}
          </div>
          <div className="p-3.5">
            <h4 className="text-sm font-semibold truncate mb-1">{ev.originalName}</h4>
            <p className="text-xs text-muted-foreground">{formatFileSize(ev.size)}{ev.resolution && ` · ${ev.resolution}`}{ev.fps && ` · ${ev.fps}fps`}</p>
            {ev.metadata?.cameraLocation && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 shrink-0" />{ev.metadata.cameraLocation}
              </p>
            )}
            {ev.aiResults?.confidence && (
              <div className="mt-2.5 pt-2.5 flex items-center justify-between" style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
                <span className="text-2xs text-muted-foreground/60">AI Confidence</span>
                <ConfidenceBadge score={ev.aiResults.confidence} size="sm" showLabel={false} />
              </div>
            )}
            {ev.aiResults?.synopsis && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed italic opacity-70">{ev.aiResults.synopsis}</p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ── Suspects Tab ──────────────────────────────────────────────────────────────
function SuspectsTab({ suspects }: { suspects: any[] }) {
  if (!suspects.length) return (
    <div className="rounded-2xl p-16 text-center" style={{ border:'1px solid rgba(255,255,255,0.07)' }}>
      <Users className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
      <p className="text-sm text-muted-foreground">No suspects identified yet.</p>
      <p className="text-xs text-muted-foreground/60 mt-1">Run AI processing on evidence to identify persons.</p>
    </div>
  );
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {suspects.map((s: any, i: number) => (
        <motion.div key={s.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
          className="p-5 rounded-2xl" style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)' }}>
          <div className="flex items-start gap-4 mb-4">
            <div className="relative shrink-0">
              <img src={s.thumbnailUrl} alt={s.label} className="w-16 h-16 rounded-2xl object-cover" style={{ border:'2px solid rgba(245,158,11,0.4)' }} />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 flex items-center justify-center text-2xs font-bold" style={{ background:s.status==='unidentified'?'#f59e0b':'#22c55e', borderColor:'#04060e' }}>?</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold">{s.label}</h3>
                  <StatusBadge status={s.status} className="mt-1" />
                </div>
                <ConfidenceBadge score={s.confidenceScore} showBar />
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed mb-4">{s.description}</p>

          {s.attributes.clothing && (
            <div className="mb-3">
              <p className="text-2xs text-muted-foreground/60 uppercase tracking-wider mb-1.5">Clothing</p>
              <div className="flex flex-wrap gap-1">
                {s.attributes.clothing.map((c: string) => (
                  <span key={c} className="text-2xs px-2 py-0.5 rounded-md" style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(148,163,184,0.9)' }}>{c}</span>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 mb-3">
            {[['Gender', s.attributes.gender||'—'],['Age', s.attributes.ageRange||'—'],['Cameras', String(s.cameras.length)]].map(([l,v])=>(
              <div key={l} className="text-center p-2 rounded-lg" style={{ background:'rgba(255,255,255,0.04)' }}>
                <p className="text-2xs text-muted-foreground/60 uppercase tracking-wider">{l}</p>
                <p className="text-xs font-bold mt-0.5">{v}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2" style={{ borderTop:'1px solid rgba(255,255,255,0.06)' }}>
            <span>First: {formatTimestamp(s.firstSeen,'HH:mm dd MMM')}</span>
            <span>·</span>
            <span>Last: {formatTimestamp(s.lastSeen,'HH:mm dd MMM')}</span>
          </div>

          {s.notes && (
            <p className="mt-3 text-xs leading-relaxed p-3 rounded-xl" style={{ background:'rgba(0,180,216,0.06)', border:'1px solid rgba(0,180,216,0.15)', color:'rgba(125,211,252,0.85)' }}>{s.notes}</p>
          )}
        </motion.div>
      ))}
    </div>
  );
}

// ── Timeline Tab ──────────────────────────────────────────────────────────────
function TimelineTab({ timeline }: { timeline: any[] }) {
  if (!timeline.length) return (
    <div className="rounded-2xl p-16 text-center" style={{ border:'1px solid rgba(255,255,255,0.07)' }}>
      <Clock className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
      <p className="text-sm text-muted-foreground">No timeline events yet.</p>
      <p className="text-xs text-muted-foreground/60 mt-1">Process evidence with AI to auto-generate timeline.</p>
    </div>
  );
  const sigColor: Record<string,string> = { critical:'#ef4444', high:'#f59e0b', medium:'#00b4d8', low:'#64748b' };
  return (
    <div className="relative pl-8">
      <div className="absolute left-3.5 top-0 bottom-0 w-px" style={{ background:'linear-gradient(to bottom, rgba(0,180,216,0.4), rgba(0,180,216,0.1), transparent)' }} />
      <div className="space-y-5">
        {timeline.map((evt: any, i: number) => {
          const col = sigColor[evt.significance];
          return (
            <motion.div key={evt.id} initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.07 }}
              className="relative">
              {/* Node */}
              <div className="absolute -left-[22px] top-4 w-5 h-5 rounded-full border-2 flex items-center justify-center" style={{ background:'#04060e', borderColor:col }}>
                {evt.verified ? <CheckCircle className="w-2.5 h-2.5" style={{ color:col }} /> : <div className="w-1.5 h-1.5 rounded-full" style={{ background:col }} />}
              </div>

              <div className="rounded-2xl overflow-hidden" style={{ background:'rgba(255,255,255,0.025)', border:`1px solid ${col}25` }}>
                {/* Accent top */}
                <div className="h-0.5" style={{ background:`linear-gradient(90deg, ${col}, transparent)` }} />
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-xs font-mono font-bold" style={{ color:col }}>
                          {formatTimestamp(evt.timestamp,'HH:mm:ss')}
                        </span>
                        <span className="text-2xs px-2 py-0.5 rounded-full font-semibold capitalize" style={{ background:`${col}18`, color:col, border:`1px solid ${col}30` }}>
                          {evt.significance}
                        </span>
                        <span className="badge-info text-2xs capitalize">{evt.type.replace(/_/g,' ')}</span>
                        {evt.verified && <span className="flex items-center gap-1 text-2xs text-success"><CheckCircle className="w-3 h-3" /> Verified</span>}
                      </div>
                      <h3 className="text-sm font-bold mb-1">{evt.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{evt.description}</p>
                    </div>
                    <ConfidenceBadge score={evt.confidence} size="sm" showLabel={false} />
                  </div>

                  {evt.frameUrl && (
                    <div className="mt-3 rounded-xl overflow-hidden">
                      <img src={evt.frameUrl} alt="Evidence frame" className="w-full h-36 object-cover" />
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-3 pt-3 text-xs text-muted-foreground/60" style={{ borderTop:`1px solid ${col}15` }}>
                    <Camera className="w-3 h-3" />{evt.source}
                    {evt.location && <><span>→</span><MapPin className="w-3 h-3" />{evt.location}</>}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── Reports Tab ───────────────────────────────────────────────────────────────
function ReportsTab({ caseData }: { caseData: any }) {
  const handleDownload = () => {
    toast.promise(
      new Promise<void>((resolve) => {
        setTimeout(() => {
          const content = `PANOPTICON FORENSIC INTELLIGENCE REPORT\n${'='.repeat(50)}\n\nCase: ${caseData.caseNumber}\nTitle: ${caseData.title}\nGenerated: ${new Date().toLocaleString()}\nClassification: RESTRICTED\n\n${caseData.description}\n`;
          const blob = new Blob([content], { type:'text/plain' });
          const url  = URL.createObjectURL(blob);
          const a    = document.createElement('a');
          a.href = url; a.download = `${caseData.caseNumber}_report.txt`;
          document.body.appendChild(a); a.click();
          document.body.removeChild(a); URL.revokeObjectURL(url);
          resolve();
        }, 1200);
      }),
      { loading:'Generating report…', success:'Report downloaded', error:'Failed' }
    );
  };

  return (
    <div className="space-y-4">
      <div className="p-5 rounded-2xl" style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.07)' }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-bold">Forensic Reports</h3>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => toast.success('Report queued for generation')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
              style={{ background:'linear-gradient(135deg,#00b4d8,#1565c0)', color:'white' }}>
              <Sparkles className="w-3.5 h-3.5" /> Generate AI Report
            </button>
          </div>
        </div>

        {/* Report row */}
        <div className="flex items-center gap-4 p-4 rounded-xl transition-colors hover:bg-white/[0.03] cursor-pointer" style={{ border:'1px solid rgba(255,255,255,0.07)' }}>
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background:'rgba(0,180,216,0.12)', border:'1px solid rgba(0,180,216,0.25)' }}>
            <FileText className="w-5 h-5 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Comprehensive Forensic Report</p>
            <p className="text-xs text-muted-foreground">{caseData.caseNumber} · AI-generated · Reviewed</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="badge-active text-2xs">reviewed</span>
            <button onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all text-accent border border-accent/25 hover:bg-accent/10">
              <Download className="w-3.5 h-3.5" /> Download
            </button>
            <Link href="/reports" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground border border-border hover:text-foreground hover:bg-white/5 transition-colors">
              <Eye className="w-3.5 h-3.5" /> View
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
