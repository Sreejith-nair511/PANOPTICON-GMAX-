'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  Users,
  Camera,
  Target,
  MapPin,
  Clock,
  Zap,
  Activity,
  ChevronRight,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Link2,
} from 'lucide-react';
import { mockSuspects, mockCases, mockEvidence } from '@/lib/mockData';
import { ConfidenceBadge } from '@/components/ui/ConfidenceBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { cn, formatTimestamp, formatRelativeTime } from '@/lib/utils';

// Mock real-time tracking events
const liveEvents = [
  { id: 'ev-1', time: '14:32:28', type: 'reid_match', suspect: 'Suspect Alpha', camera: 'CAM-STN-004', confidence: 94, caseNumber: 'PAN-2026-0047' },
  { id: 'ev-2', time: '14:31:48', type: 'new_detection', suspect: 'Suspect Beta', camera: 'CAM-STN-004', confidence: 88, caseNumber: 'PAN-2026-0047' },
  { id: 'ev-3', time: '09:14:22', type: 'reid_match', suspect: 'Person of Interest 1', camera: 'CAM-PARK-N01', confidence: 71, caseNumber: 'PAN-2026-0043' },
  { id: 'ev-4', time: '03:15:44', type: 'new_detection', suspect: 'Suspect Gamma', camera: 'CAM-PORT-B02', confidence: 83, caseNumber: 'PAN-2026-0039' },
  { id: 'ev-5', time: '03:02:11', type: 'cross_cam', suspect: 'Suspect Delta', camera: 'CAM-PORT-B01 → CAM-PORT-B02', confidence: 91, caseNumber: 'PAN-2026-0039' },
];

const cameraGrid = [
  { id: 'CAM-STN-004', name: 'Central Station P4', status: 'active', suspects: 2, thumbnail: 'https://picsum.photos/seed/cam1/320/180' },
  { id: 'CAM-STN-002', name: 'Station Concourse', status: 'active', suspects: 0, thumbnail: 'https://picsum.photos/seed/cam2/320/180' },
  { id: 'CAM-PARK-N01', name: 'Riverside Park N', status: 'active', suspects: 1, thumbnail: 'https://picsum.photos/seed/cam3/320/180' },
  { id: 'CAM-PORT-B01', name: 'Port Zone B-1', status: 'active', suspects: 3, thumbnail: 'https://picsum.photos/seed/cam4/320/180' },
  { id: 'CAM-PORT-B02', name: 'Port Zone B-2', status: 'active', suspects: 4, thumbnail: 'https://picsum.photos/seed/cam5/320/180' },
  { id: 'CAM-DT-001', name: 'Downtown Core', status: 'idle', suspects: 0, thumbnail: 'https://picsum.photos/seed/cam6/320/180' },
];

export default function TrackingPage() {
  const [selectedSuspect, setSelectedSuspect] = useState(mockSuspects[0]);
  const [feed, setFeed] = useState(liveEvents);
  const [ticker, setTicker] = useState(0);

  // Simulate live events
  useEffect(() => {
    const interval = setInterval(() => {
      setTicker((t) => t + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const allSuspects = mockCases.flatMap((c) =>
    mockSuspects.filter((s) => s.caseId === c.id).map((s) => ({ ...s, caseNumber: c.caseNumber }))
  );

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: suspects list */}
      <div className="w-72 shrink-0 border-r border-border flex flex-col bg-[#070c19]">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-semibold">Active Tracking</h2>
            <div className="ml-auto flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-2xs text-success/80">Live</span>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search suspects..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/40"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-border/50">
          {allSuspects.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSuspect(s)}
              className={cn(
                'w-full flex items-start gap-3 p-4 text-left transition-colors',
                selectedSuspect?.id === s.id
                  ? 'bg-accent/8 border-l-2 border-l-accent'
                  : 'hover:bg-surface-raised/50 border-l-2 border-l-transparent'
              )}
            >
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-surface-raised">
                  <img src={s.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <div className={cn(
                  'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#070c19]',
                  s.status === 'unidentified' ? 'bg-warning' : s.status === 'identified' ? 'bg-success' : 'bg-muted-foreground'
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold truncate">{s.label}</span>
                  <ConfidenceBadge score={s.confidenceScore} size="sm" showLabel={false} />
                </div>
                <p className="text-2xs font-mono text-muted-foreground/60 mt-0.5">{'caseNumber' in s ? (s as any).caseNumber : ''}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xs text-muted-foreground flex items-center gap-1">
                    <Camera className="w-2.5 h-2.5" />
                    {s.cameras.length} cameras
                  </span>
                  <span className="text-2xs text-muted-foreground">{s.appearances} sightings</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Center: main tracking view */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top stats bar */}
        <div className="flex items-center gap-6 px-6 py-3 border-b border-border bg-[#080d1a] shrink-0">
          {[
            { label: 'Active Cameras', value: '14', icon: Camera, color: 'text-accent' },
            { label: 'Suspects Tracked', value: '23', icon: Target, color: 'text-warning' },
            { label: 'Live Detections', value: String(ticker % 5 + 2), icon: Activity, color: 'text-success' },
            { label: 'ReID Matches', value: String(ticker % 3 + 1), icon: Link2, color: 'text-primary' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center">
                  <Icon className={cn('w-4 h-4', stat.color)} />
                </div>
                <div>
                  <p className="text-lg font-bold tabular-nums leading-none">{stat.value}</p>
                  <p className="text-2xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            );
          })}
          <div className="ml-auto flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:text-foreground border border-border hover:border-accent/30 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>
        </div>

        {/* Camera grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Selected suspect header */}
          {selectedSuspect && (
            <motion.div
              key={selectedSuspect.id}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 p-4 rounded-xl bg-warning/5 border border-warning/20 mb-4"
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                <img src={selectedSuspect.thumbnailUrl} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-warning" />
                  <span className="text-sm font-semibold text-warning">
                    Tracking: {selectedSuspect.label}
                  </span>
                  <ConfidenceBadge score={selectedSuspect.confidenceScore} size="sm" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Last seen: {formatRelativeTime(selectedSuspect.lastSeen)} · {selectedSuspect.cameras.join(', ')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-warning/10 border border-warning/30">
                  <div className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
                  <span className="text-xs text-warning/80 font-medium">BOLO Active</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Camera grid */}
          <div className="grid grid-cols-3 gap-3">
            {cameraGrid.map((cam, i) => (
              <motion.div
                key={cam.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  'relative rounded-xl overflow-hidden border transition-all duration-200',
                  cam.suspects > 0 ? 'border-warning/40' : 'border-border'
                )}
              >
                <div className="relative aspect-video bg-black">
                  <img
                    src={cam.thumbnail}
                    alt={cam.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0" style={{
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0.05) 4px)'
                  }} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Camera ID */}
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    <div className={cn('w-1.5 h-1.5 rounded-full', cam.status === 'active' ? 'bg-success animate-pulse' : 'bg-muted-foreground')} />
                    <span className="text-2xs font-mono text-white/80 bg-black/50 px-1.5 py-0.5 rounded">{cam.id}</span>
                  </div>

                  {/* Suspects detected */}
                  {cam.suspects > 0 && (
                    <div className="absolute top-2 right-2">
                      <span className="flex items-center gap-1 text-2xs bg-warning/80 text-black px-1.5 py-0.5 rounded font-bold backdrop-blur-sm">
                        <Target className="w-2.5 h-2.5" />
                        {cam.suspects}
                      </span>
                    </div>
                  )}

                  {/* Mock detection overlay for suspect cams */}
                  {cam.suspects > 0 && cam.id === 'CAM-STN-004' && (
                    <div className="absolute border-2 border-warning/80 rounded"
                      style={{ left: '35%', top: '20%', width: '15%', height: '55%' }}>
                    </div>
                  )}
                </div>

                <div className="p-2 bg-[#080d1a]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium truncate">{cam.name}</span>
                    <span className={cn('text-2xs', cam.status === 'active' ? 'text-success/70' : 'text-muted-foreground')}>
                      {cam.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: live event feed */}
      <div className="w-72 shrink-0 border-l border-border flex flex-col bg-[#070c19]">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold">Live Events</span>
            <div className="ml-auto flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-2xs text-accent/70">Streaming</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-border/50">
          <AnimatePresence>
            {feed.map((event, i) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: 12, backgroundColor: 'rgba(0,180,216,0.1)' }}
                animate={{ opacity: 1, x: 0, backgroundColor: 'transparent' }}
                transition={{ delay: i * 0.05 }}
                className="p-3 hover:bg-surface-raised/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={cn(
                    'w-1.5 h-1.5 rounded-full shrink-0',
                    event.type === 'reid_match' ? 'bg-success' :
                    event.type === 'cross_cam' ? 'bg-accent' : 'bg-warning'
                  )} />
                  <span className={cn(
                    'text-2xs font-medium capitalize',
                    event.type === 'reid_match' ? 'text-success/80' :
                    event.type === 'cross_cam' ? 'text-accent/80' : 'text-warning/80'
                  )}>
                    {event.type.replace(/_/g, ' ')}
                  </span>
                  <span className="ml-auto text-2xs font-mono text-muted-foreground/60">{event.time}</span>
                </div>
                <p className="text-xs font-semibold">{event.suspect}</p>
                <p className="text-2xs text-muted-foreground mt-0.5">{event.camera}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-2xs font-mono text-muted-foreground/60">{event.caseNumber}</span>
                  <ConfidenceBadge score={event.confidence} size="sm" showLabel={false} />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
