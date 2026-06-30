'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  Play, Pause, SkipBack, SkipForward, ZoomIn, ZoomOut,
  Maximize2, Layers, Filter, Tag, Bookmark, FileText,
  Clock, Users, Film, BrainCircuit, CheckCircle, Target,
  Box, Share2, Network, Video,
} from 'lucide-react';
import { VideoPlayer, VideoPlayerHandle } from '@/components/investigation/VideoPlayer';
import { mockEvidence, mockTimeline, mockSuspects, mockCases } from '@/lib/mockData';
import { ConfidenceBadge } from '@/components/ui/ConfidenceBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { cn, formatTimestamp, formatDuration, formatVideoTimestamp } from '@/lib/utils';
import { toast } from 'sonner';

// Lazy-load heavy 3D/graph components
const SceneViewer3D = dynamic(
  () => import('@/components/investigation/SceneViewer3D').then(m => ({ default: m.SceneViewer3D })),
  { ssr: false, loading: () => <LoadingPane label="Loading 3D Engine..." /> }
);
const RelationshipGraph = dynamic(
  () => import('@/components/investigation/RelationshipGraph').then(m => ({ default: m.RelationshipGraph })),
  { ssr: false, loading: () => <LoadingPane label="Loading Graph..." /> }
);

function LoadingPane({ label }: { label: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-[#060b17] rounded-xl border border-border">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

type PanelMode = 'single' | 'split' | 'quad';
type ViewMode = 'video' | '3d' | 'graph';

const SPEED_OPTIONS = [0.25, 0.5, 1, 2, 4];
const TOTAL_DURATION = 1800;

export default function InvestigationPage() {
  const [panelMode, setPanelMode] = useState<PanelMode>('split');
  const [viewMode, setViewMode] = useState<ViewMode>('video');
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(870);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [activeTimestamp, setActiveTimestamp] = useState<string | null>('tl-003');
  const [selectedCamera, setSelectedCamera] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [showOverlays, setShowOverlays] = useState(true);
  const [bookmarks, setBookmarks] = useState<number[]>([]);

  const videoRefs = useRef<(VideoPlayerHandle | null)[]>([]);
  const scrubIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeCase = mockCases[0];
  const caseEvidence = mockEvidence.filter(
    e => e.caseId === activeCase.id && (e.type === 'video' || e.type === 'bodycam')
  );
  const caseTimeline = mockTimeline.filter(t => t.caseId === activeCase.id);
  const caseSuspects = mockSuspects.filter(s => s.caseId === activeCase.id);

  const progressPct = (currentTime / TOTAL_DURATION) * 100;
  const normalised = currentTime / TOTAL_DURATION;

  // Advance time when playing
  useEffect(() => {
    if (playing) {
      scrubIntervalRef.current = setInterval(() => {
        setCurrentTime(t => {
          const next = t + playbackRate * 0.1;
          if (next >= TOTAL_DURATION) { setPlaying(false); return TOTAL_DURATION; }
          return next;
        });
      }, 100);
    }
    return () => { if (scrubIntervalRef.current) clearInterval(scrubIntervalRef.current); };
  }, [playing, playbackRate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') return;
      if (e.code === 'Space') { e.preventDefault(); setPlaying(p => !p); }
      if (e.code === 'KeyJ') setCurrentTime(t => Math.max(0, t - 10));
      if (e.code === 'KeyL') setCurrentTime(t => Math.min(TOTAL_DURATION, t + 10));
      if (e.code === 'KeyK') setPlaying(false);
      if (e.code === 'ArrowLeft') setCurrentTime(t => Math.max(0, t - 1 / 30));
      if (e.code === 'ArrowRight') setCurrentTime(t => Math.min(TOTAL_DURATION, t + 1 / 30));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleScrub = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setCurrentTime(Math.round(pct * TOTAL_DURATION));
  }, []);

  const handleTimeUpdate = useCallback((t: number) => {
    setCurrentTime(Math.round(t));
  }, []);

  const addBookmark = () => {
    setBookmarks(b => [...b, currentTime]);
    toast.success(`Bookmark added at ${formatVideoTimestamp(currentTime)}`);
  };

  const videoPanelCount = panelMode === 'single' ? 1 : panelMode === 'split' ? 2 : 4;

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Left sidebar ── */}
      <div className="w-64 shrink-0 border-r border-border flex flex-col bg-[#070c19] overflow-hidden">
        <div className="p-3 border-b border-border">
          <p className="text-2xs font-mono text-muted-foreground/60 mb-1">{activeCase.caseNumber}</p>
          <h2 className="text-xs font-semibold leading-snug line-clamp-2">{activeCase.title}</h2>
          <div className="flex items-center gap-2 mt-2">
            <StatusBadge status={activeCase.status} />
            <ConfidenceBadge score={activeCase.confidenceScore} size="sm" showLabel={false} />
          </div>
        </div>

        {/* Suspects */}
        <div className="p-3 border-b border-border">
          <p className="text-2xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Users className="w-3 h-3 text-accent/70" /> Suspects
          </p>
          {caseSuspects.map(s => (
            <div key={s.id} className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-border hover:border-accent/30 transition-colors cursor-pointer mb-1.5">
              <img src={s.thumbnailUrl} alt="" className="w-7 h-7 rounded-lg object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{s.label}</p>
                <p className="text-2xs text-muted-foreground">{s.cameras.length} cams</p>
              </div>
              <ConfidenceBadge score={s.confidenceScore} size="sm" showLabel={false} />
            </div>
          ))}
        </div>

        {/* Timeline events */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-3">
          <p className="text-2xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-accent/70" /> Events
          </p>
          <div className="relative">
            <div className="absolute left-2.5 top-0 bottom-0 w-px bg-accent/20" />
            <div className="space-y-1 pl-1">
              {caseTimeline.map(event => {
                const isActive = event.id === activeTimestamp;
                const sigColor = { critical:'border-danger text-danger', high:'border-warning text-warning', medium:'border-accent text-accent', low:'border-muted text-muted-foreground' }[event.significance];
                return (
                  <button key={event.id} onClick={() => setActiveTimestamp(event.id)}
                    className={cn('w-full flex items-start gap-2 p-2 rounded-lg text-left transition-all', isActive ? 'bg-accent/10 border border-accent/30' : 'hover:bg-surface-raised border border-transparent')}>
                    <div className={cn('w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5', isActive ? 'bg-accent border-accent' : sigColor)}>
                      {event.verified ? <CheckCircle className="w-2 h-2 text-white" /> : <div className="w-1 h-1 rounded-full bg-current" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-2xs font-mono text-muted-foreground/60">{formatTimestamp(event.timestamp, 'HH:mm:ss')}</p>
                      <p className="text-xs font-medium line-clamp-1">{event.title}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bookmarks */}
        {bookmarks.length > 0 && (
          <div className="p-3 border-t border-border">
            <p className="text-2xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Bookmark className="w-3 h-3 text-accent/70" /> Bookmarks
            </p>
            <div className="flex flex-wrap gap-1">
              {bookmarks.map((t, i) => (
                <button key={i} onClick={() => setCurrentTime(t)}
                  className="text-2xs font-mono px-1.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/30 hover:bg-accent/20">
                  {formatVideoTimestamp(t)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Center: main viewer ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* View mode tabs + toolbar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-[#080d1a] shrink-0 gap-3">
          {/* View mode */}
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            {([['video', Video, '2×'], ['3d', Box, '3D'], ['graph', Network, 'Graph']] as const).map(([mode, Icon, label]) => (
              <button key={mode} onClick={() => setViewMode(mode as ViewMode)}
                className={cn('flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors border-r border-border last:border-r-0',
                  viewMode === mode ? 'bg-accent/15 text-accent' : 'text-muted-foreground hover:text-foreground')}>
                <Icon className="w-3.5 h-3.5" />{label}
              </button>
            ))}
          </div>

          {viewMode === 'video' && (
            <div className="flex items-center border border-border rounded-lg overflow-hidden">
              {(['single','split','quad'] as PanelMode[]).map(m => (
                <button key={m} onClick={() => setPanelMode(m)}
                  className={cn('px-3 py-1.5 text-xs font-medium transition-colors border-r border-border last:border-r-0',
                    panelMode === m ? 'bg-accent/15 text-accent' : 'text-muted-foreground hover:text-foreground')}>
                  {m === 'single' ? '1×' : m === 'split' ? '2×' : '4×'}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button onClick={() => setShowOverlays(o => !o)}
              className={cn('flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors border',
                showOverlays ? 'border-accent/30 text-accent bg-accent/8' : 'border-border text-muted-foreground hover:text-foreground')}>
              <Layers className="w-3.5 h-3.5" /> Overlays
            </button>
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-accent border border-accent/25 hover:bg-accent/10 transition-colors">
              <BrainCircuit className="w-3.5 h-3.5" /> AI Mode
            </button>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 p-3 overflow-hidden">
          {viewMode === '3d' && (
            <SceneViewer3D currentTime={normalised} className="w-full h-full" />
          )}
          {viewMode === 'graph' && (
            <div className="w-full h-full rounded-xl overflow-hidden border border-border">
              <RelationshipGraph />
            </div>
          )}
          {viewMode === 'video' && (
            <div className={cn('w-full h-full',
              panelMode === 'quad' ? 'grid grid-cols-2 grid-rows-2 gap-2' :
              panelMode === 'split' ? 'grid grid-cols-2 gap-2' : 'flex')}>
              {caseEvidence.slice(0, videoPanelCount).map((ev, idx) => (
                <VideoPlayer
                  key={ev.id}
                  ref={(el) => { videoRefs.current[idx] = el; }}
                  src={ev.fileUrl?.startsWith('/storage') ? undefined : ev.fileUrl}
                  thumbnailUrl={ev.thumbnailUrl}
                  isActive={selectedCamera === idx}
                  playing={playing && selectedCamera === idx}
                  currentTime={currentTime}
                  zoom={panelMode === 'single' ? zoom : 1}
                  showOverlays={showOverlays}
                  cameraId={ev.metadata?.cameraId ?? ev.id.toUpperCase()}
                  cameraName={ev.originalName}
                  duration={ev.duration ?? TOTAL_DURATION}
                  onTimeUpdate={selectedCamera === idx ? handleTimeUpdate : undefined}
                  onSelect={() => setSelectedCamera(idx)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Playback controls (only in video mode) */}
        {viewMode === 'video' && (
          <div className="border-t border-border bg-[#080d1a] px-4 pt-3 pb-4 shrink-0">
            {/* Scrubber */}
            <div className="mb-3 relative">
              {/* Bookmark markers */}
              {bookmarks.map((bm, i) => (
                <button key={i} onClick={() => setCurrentTime(bm)}
                  className="absolute -top-1 z-10 w-1.5 h-5 bg-primary/60 rounded-sm hover:bg-primary transition-colors"
                  style={{ left: `${(bm / TOTAL_DURATION) * 100}%` }} />
              ))}
              {/* Event markers */}
              {caseTimeline.map(event => {
                const pct = ((new Date(event.timestamp).getHours() * 3600 + new Date(event.timestamp).getMinutes() * 60 + new Date(event.timestamp).getSeconds() - 14 * 3600) / TOTAL_DURATION) * 100;
                const clampedPct = Math.max(0, Math.min(100, pct));
                const color = { critical:'bg-danger', high:'bg-warning', medium:'bg-accent', low:'bg-muted-foreground' }[event.significance];
                return (
                  <button key={event.id} onClick={() => { setActiveTimestamp(event.id); setCurrentTime(Math.round(clampedPct / 100 * TOTAL_DURATION)); }}
                    className="absolute -top-0.5 z-10 group" style={{ left: `${clampedPct}%` }} title={event.title}>
                    <div className={cn('w-1.5 h-4 rounded-sm opacity-80 hover:opacity-100 hover:scale-110 transition-all', color)} />
                  </button>
                );
              })}
              {/* Track */}
              <div className="relative h-2 bg-surface-raised rounded-full cursor-pointer mt-4 overflow-visible" onClick={handleScrub}>
                <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-accent shadow-glow-sm"
                  style={{ left: `calc(${progressPct}% - 7px)` }} />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-2xs font-mono text-muted-foreground">14:30:00</span>
                <span className="text-2xs font-mono text-accent">{formatVideoTimestamp(currentTime)}</span>
                <span className="text-2xs font-mono text-muted-foreground">15:00:00</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button onClick={() => setCurrentTime(t => Math.max(0, t - 30))} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-raised transition-colors">
                  <SkipBack className="w-4 h-4" />
                </button>
                <button onClick={() => setPlaying(p => !p)} className="w-10 h-10 rounded-xl flex items-center justify-center bg-accent text-accent-foreground hover:bg-accent-glow transition-colors shadow-glow-sm">
                  {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
                <button onClick={() => setCurrentTime(t => Math.min(TOTAL_DURATION, t + 30))} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-raised transition-colors">
                  <SkipForward className="w-4 h-4" />
                </button>
                <select value={playbackRate} onChange={e => setPlaybackRate(Number(e.target.value))}
                  className="ml-2 px-2 py-1 text-xs bg-surface border border-border rounded-lg text-foreground focus:outline-none cursor-pointer">
                  {SPEED_OPTIONS.map(s => <option key={s} value={s} className="bg-[#0D1526]">{s}×</option>)}
                </select>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setZoom(z => Math.max(1, z - 0.25))} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-raised border border-border transition-colors">
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-xs font-mono text-muted-foreground w-8 text-center">{zoom.toFixed(2)}×</span>
                <button onClick={() => setZoom(z => Math.min(4, z + 0.25))} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-raised border border-border transition-colors">
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-5 bg-border mx-1" />
                <button onClick={addBookmark} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-surface-raised border border-border transition-colors">
                  <Bookmark className="w-3.5 h-3.5" /> Mark
                </button>
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-surface-raised border border-border transition-colors">
                  <Tag className="w-3.5 h-3.5" /> Annotate
                </button>
                <button className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-raised border border-border transition-colors">
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <p className="text-2xs text-muted-foreground/30 mt-1.5 text-center">
              Space play/pause · J -10s · L +10s · ←→ frame step
            </p>
          </div>
        )}
      </div>

      {/* ── Right: detections ── */}
      <div className="w-60 shrink-0 border-l border-border flex flex-col bg-[#070c19] overflow-hidden">
        <div className="p-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold">Detections</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">@ {formatVideoTimestamp(currentTime)}</p>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-3">
          <div>
            <p className="text-2xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Persons</p>
            {caseSuspects.map((s, i) => (
              <motion.div key={s.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="flex items-center gap-2 p-2 rounded-lg bg-surface border border-border mb-1.5 hover:border-warning/40 cursor-pointer">
                <div className="relative w-9 h-9 rounded-lg overflow-hidden shrink-0">
                  <img src={s.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 border-2 border-warning/60 rounded-lg" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium">{s.label}</p>
                  <ConfidenceBadge score={s.confidenceScore} size="sm" />
                </div>
              </motion.div>
            ))}
          </div>

          <div>
            <p className="text-2xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Objects</p>
            {[
              { label: 'Backpack',    confidence: 96, color: 'border-success/50' },
              { label: 'Firearm',     confidence: 89, color: 'border-danger/50' },
              { label: 'Mobile Phone',confidence: 74, color: 'border-accent/50' },
            ].map((obj, i) => (
              <motion.div key={obj.label} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.08 }}
                className={cn('flex items-center justify-between p-2 rounded-lg bg-surface border mb-1.5 cursor-pointer hover:border-accent/30', obj.color)}>
                <span className="text-xs">{obj.label}</span>
                <ConfidenceBadge score={obj.confidence} size="sm" showLabel={false} />
              </motion.div>
            ))}
          </div>

          {activeTimestamp && caseTimeline.filter(t => t.id === activeTimestamp).map(event => (
            <div key={event.id} className="p-3 rounded-lg bg-accent/8 border border-accent/25">
              <p className="text-xs font-semibold mb-1">{event.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{event.description}</p>
              <div className="mt-2 flex items-center gap-2">
                <ConfidenceBadge score={event.confidence} size="sm" />
                {event.verified && <span className="text-2xs text-success flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Verified</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="p-3 border-t border-border">
          <textarea placeholder="Add investigation notes..." rows={3}
            className="w-full px-2.5 py-2 text-xs bg-surface border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/40 resize-none" />
          <button onClick={() => toast.success('Note saved')}
            className="mt-1.5 w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-surface border border-border text-muted-foreground hover:text-foreground hover:border-accent/30 transition-colors">
            <FileText className="w-3.5 h-3.5" /> Save Note
          </button>
        </div>
      </div>
    </div>
  );
}
