'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  Download,
  Eye,
  BrainCircuit,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  Search,
  Printer,
  Share2,
  Trash2,
  ChevronRight,
  Shield,
  Film,
  Users,
  Calendar,
  MoreVertical,
  Sparkles,
} from 'lucide-react';
import { mockReport, mockCases } from '@/lib/mockData';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ConfidenceBadge } from '@/components/ui/ConfidenceBadge';
import { cn, formatTimestamp, formatRelativeTime } from '@/lib/utils';

const mockReports = [
  {
    id: 'rpt-001',
    caseId: 'case-001',
    caseNumber: 'PAN-2026-0047',
    type: 'comprehensive',
    title: 'Comprehensive Forensic Report – Central Station Robbery',
    status: 'reviewed',
    generatedAt: '2026-06-30T10:00:00Z',
    generatedBy: 'AI (Gemini Pro)',
    reviewedBy: 'Det. Sarah Kim',
    pages: 24,
    version: 2,
  },
  {
    id: 'rpt-002',
    caseId: 'case-002',
    caseNumber: 'PAN-2026-0043',
    type: 'timeline',
    title: 'Event Timeline Report – Riverside Homicide',
    status: 'generated',
    generatedAt: '2026-06-29T14:30:00Z',
    generatedBy: 'AI (Gemini Pro)',
    pages: 11,
    version: 1,
  },
  {
    id: 'rpt-003',
    caseId: 'case-003',
    caseNumber: 'PAN-2026-0039',
    type: 'suspect',
    title: 'Suspect Profile Report – Port District Vehicle Ring',
    status: 'draft',
    generatedAt: '2026-06-28T09:00:00Z',
    generatedBy: 'AI (Gemini Pro)',
    pages: 18,
    version: 1,
  },
  {
    id: 'rpt-004',
    caseId: 'case-005',
    caseNumber: 'PAN-2026-0031',
    type: 'evidence',
    title: 'Evidence Summary – Narcotics Distribution Network',
    status: 'final',
    generatedAt: '2026-06-27T16:00:00Z',
    generatedBy: 'AI (Gemini Pro)',
    reviewedBy: 'Det. Sarah Kim',
    pages: 47,
    version: 3,
  },
];

const reportTypeConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  comprehensive: { icon: FileText, color: 'text-accent', label: 'Comprehensive' },
  timeline: { icon: Clock, color: 'text-primary', label: 'Timeline' },
  suspect: { icon: Users, color: 'text-warning', label: 'Suspect Profile' },
  evidence: { icon: Film, color: 'text-success', label: 'Evidence' },
  incident: { icon: Shield, color: 'text-danger', label: 'Incident' },
};

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<typeof mockReports[0] | null>(mockReports[0]);
  const [search, setSearch] = useState('');
  const [showGenerate, setShowGenerate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);

  const filtered = mockReports.filter(
    (r) =>
      !search ||
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.caseNumber.toLowerCase().includes(search.toLowerCase())
  );

  const handleGenerate = () => {
    setGenerating(true);
    setGenProgress(0);
    setShowGenerate(false);
    const iv = setInterval(() => {
      setGenProgress((p) => {
        if (p >= 100) {
          clearInterval(iv);
          setGenerating(false);
          return 100;
        }
        return p + 5;
      });
    }, 150);
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left: report list */}
      <div className="w-80 shrink-0 border-r border-border flex flex-col bg-[#070c19]">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-sm font-semibold">Reports</h1>
            <button
              onClick={() => setShowGenerate(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-accent-foreground text-xs font-medium hover:bg-accent-glow transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Generate
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-surface border border-border rounded-lg text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-accent/40"
            />
          </div>
        </div>

        {/* Generating indicator */}
        <AnimatePresence>
          {generating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="mx-3 my-2 p-3 rounded-lg bg-accent/8 border border-accent/25">
                <div className="flex items-center gap-2 mb-2">
                  <BrainCircuit className="w-3.5 h-3.5 text-accent animate-pulse" />
                  <span className="text-xs font-medium text-accent">Generating report...</span>
                  <span className="ml-auto text-xs font-mono text-accent/70">{genProgress}%</span>
                </div>
                <div className="confidence-bar">
                  <motion.div
                    className="confidence-fill bg-accent"
                    animate={{ width: `${genProgress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Report list */}
        <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-border/50">
          {filtered.map((report) => {
            const typeConfig = reportTypeConfig[report.type] || reportTypeConfig.comprehensive;
            const TypeIcon = typeConfig.icon;
            return (
              <button
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className={cn(
                  'w-full flex items-start gap-3 p-4 text-left transition-colors',
                  selectedReport?.id === report.id
                    ? 'bg-accent/8 border-l-2 border-l-accent'
                    : 'hover:bg-surface-raised/50 border-l-2 border-l-transparent'
                )}
              >
                <div className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                  selectedReport?.id === report.id ? 'bg-accent/15' : 'bg-surface'
                )}>
                  <TypeIcon className={cn('w-4 h-4', typeConfig.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                    <span className="text-2xs font-mono text-muted-foreground/60">{report.caseNumber}</span>
                    <StatusBadge status={report.status} className="text-2xs" />
                  </div>
                  <p className="text-xs font-medium text-foreground line-clamp-2">{report.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xs text-muted-foreground">{report.pages}p</span>
                    <span className="text-2xs text-muted-foreground">v{report.version}</span>
                    <span className="text-2xs text-muted-foreground">{formatRelativeTime(report.generatedAt)}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: report viewer */}
      {selectedReport ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Report header */}
          <div className="flex items-center justify-between p-6 border-b border-border bg-[#080d1a]/80 backdrop-blur-sm shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-muted-foreground/60">{selectedReport.caseNumber}</span>
                <StatusBadge status={selectedReport.status} />
                <span className="badge-info text-2xs capitalize">{reportTypeConfig[selectedReport.type]?.label}</span>
              </div>
              <h2 className="text-base font-bold">{selectedReport.title}</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Generated {formatTimestamp(selectedReport.generatedAt)} by {selectedReport.generatedBy}
                {selectedReport.reviewedBy && ` · Reviewed by ${selectedReport.reviewedBy}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-surface-raised border border-border transition-colors">
                <Share2 className="w-4 h-4" />
                Share
              </button>
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-surface-raised border border-border transition-colors">
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-accent text-accent-foreground hover:bg-accent-glow transition-colors"
                onClick={() => {
                  import('sonner').then(({ toast }) => {
                    toast.promise(
                      new Promise(res => setTimeout(res, 2000)),
                      {
                        loading: 'Generating PDF...',
                        success: 'Report downloaded',
                        error: 'PDF generation failed',
                      }
                    );
                  });
                }}
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>

          {/* Report body */}
          <div className="flex-1 overflow-y-auto p-8 max-w-4xl mx-auto w-full">
            {/* Cover area */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="card-panel rounded-2xl p-8 border-accent/15 mb-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-xs font-bold tracking-widest">PANOPTICON</p>
                        <p className="text-2xs text-muted-foreground tracking-widest">FORENSIC INTELLIGENCE</p>
                      </div>
                    </div>
                    <h1 className="text-2xl font-bold mb-1">{selectedReport.title}</h1>
                    <p className="text-sm text-muted-foreground">
                      Case {selectedReport.caseNumber} · {reportTypeConfig[selectedReport.type]?.label} Report
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xs text-muted-foreground">CLASSIFICATION</p>
                    <p className="text-sm font-bold text-danger">RESTRICTED</p>
                    <p className="text-2xs text-muted-foreground mt-3">Report ID</p>
                    <p className="text-xs font-mono">{selectedReport.id.toUpperCase()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 pt-6 border-t border-border">
                  {[
                    { label: 'Generated', value: formatTimestamp(selectedReport.generatedAt, 'dd MMM yyyy') },
                    { label: 'Version', value: `v${selectedReport.version}` },
                    { label: 'Pages', value: selectedReport.pages.toString() },
                    { label: 'Status', value: selectedReport.status.toUpperCase() },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-2xs text-muted-foreground uppercase tracking-wider">{item.label}</p>
                      <p className="text-sm font-semibold mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Executive Summary */}
            <ReportSection
              number="01"
              title="Executive Summary"
              delay={0.1}
            >
              <p className="text-sm text-muted-foreground leading-relaxed">
                {mockReport.summary}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed mt-3">
                This report presents AI-assisted forensic analysis of video evidence collected across three camera systems at Central Station. Cross-camera re-identification with ByteTrack and FastReID algorithms produced high-confidence suspect tracking. All findings are supported by timestamped evidence frames with associated confidence scores.
              </p>
            </ReportSection>

            {/* Timeline Section */}
            <ReportSection
              number="02"
              title="Event Timeline Reconstruction"
              delay={0.15}
            >
              <div className="space-y-4">
                {[
                  { time: '14:28:14', event: 'Two suspects enter Central Station via south entrance.', camera: 'CAM-STN-002', confidence: 91, significance: 'high' },
                  { time: '14:29:02', event: 'Suspects observed loitering at ticketing area. Target selection behavior noted.', camera: 'CAM-STN-002', confidence: 87, significance: 'medium' },
                  { time: '14:31:48', event: 'Suspects approach Platform 4. Both suspects confirmed by cross-reference.', camera: 'CAM-STN-004', confidence: 95, significance: 'high' },
                  { time: '14:32:14', event: 'Armed robbery initiated. Firearm detected in suspect Alpha\'s right hand.', camera: 'CAM-STN-004', confidence: 89, significance: 'critical' },
                  { time: '14:33:01', event: 'Suspects flee via emergency north exit. Backpack confirmed in suspect Alpha\'s possession.', camera: 'CAM-STN-004', confidence: 97, significance: 'critical' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl bg-surface border border-border">
                    <div className="shrink-0">
                      <span className="text-sm font-mono font-bold text-accent">{item.time}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{item.event}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-2xs font-mono text-muted-foreground">{item.camera}</span>
                        <ConfidenceBadge score={item.confidence} size="sm" />
                        <span className={cn(
                          'text-2xs capitalize font-medium',
                          item.significance === 'critical' ? 'text-danger' : item.significance === 'high' ? 'text-warning' : 'text-accent'
                        )}>
                          {item.significance} significance
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ReportSection>

            {/* Suspect Profiles */}
            <ReportSection
              number="03"
              title="Suspect Profiles"
              delay={0.2}
            >
              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    label: 'Suspect Alpha',
                    role: 'Primary Actor',
                    confidence: 94,
                    attributes: 'Male, ~30-35 yrs, dark jacket, baseball cap',
                    cameras: 2,
                    firstSeen: '14:28:14',
                    lastSeen: '14:33:01',
                  },
                  {
                    label: 'Suspect Beta',
                    role: 'Lookout',
                    confidence: 88,
                    attributes: 'Male, ~25-30 yrs, grey hoodie, blue jeans',
                    cameras: 2,
                    firstSeen: '14:28:14',
                    lastSeen: '14:33:01',
                  },
                ].map((s, i) => (
                  <div key={i} className="p-5 rounded-xl bg-surface border border-border">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-bold">{s.label}</h4>
                        <span className="badge-pending text-2xs">{s.role}</span>
                      </div>
                      <ConfidenceBadge score={s.confidence} showBar />
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{s.attributes}</p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-muted-foreground text-2xs">First Seen</p>
                        <p className="font-mono">{s.firstSeen}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-2xs">Last Seen</p>
                        <p className="font-mono">{s.lastSeen}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-2xs">Cameras</p>
                        <p className="font-medium">{s.cameras}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ReportSection>

            {/* Evidence Inventory */}
            <ReportSection
              number="04"
              title="Evidence Inventory"
              delay={0.25}
            >
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    {['ID', 'Description', 'Type', 'Duration', 'Status', 'AI Confidence'].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-2xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 'EV-001', desc: 'Station Camera 4 – Platform 4', type: 'Video', dur: '30:00', status: 'processed', conf: 92 },
                    { id: 'EV-002', desc: 'Station Camera 2 – Concourse', type: 'Video', dur: '30:00', status: 'processed', conf: 88 },
                    { id: 'EV-003', desc: 'Off. Rodriguez Body Camera', type: 'Body Cam', dur: '15:00', status: 'processed', conf: 97 },
                  ].map((ev) => (
                    <tr key={ev.id} className="data-row">
                      <td className="px-3 py-2.5 text-xs font-mono text-muted-foreground">{ev.id}</td>
                      <td className="px-3 py-2.5 text-xs">{ev.desc}</td>
                      <td className="px-3 py-2.5 text-xs">{ev.type}</td>
                      <td className="px-3 py-2.5 text-xs font-mono">{ev.dur}</td>
                      <td className="px-3 py-2.5"><StatusBadge status={ev.status} /></td>
                      <td className="px-3 py-2.5"><ConfidenceBadge score={ev.conf} size="sm" showLabel={false} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ReportSection>

            {/* Conclusions */}
            <ReportSection
              number="05"
              title="Conclusions & Recommendations"
              delay={0.3}
            >
              <div className="space-y-3">
                {[
                  { icon: CheckCircle, color: 'text-success', text: 'Two distinct suspects confirmed through cross-camera re-identification with high confidence (94% and 88%).' },
                  { icon: CheckCircle, color: 'text-success', text: 'Complete movement reconstruction achieved from arrival (14:28) through escape (14:33).' },
                  { icon: CheckCircle, color: 'text-success', text: 'Firearm detection at 14:32:14 corroborated across two camera angles.' },
                  { icon: AlertCircle, color: 'text-warning', text: 'Facial recognition analysis pending — requesting extended camera network access for further cross-referencing.' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', item.color)} />
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.text}</p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-accent/5 border border-accent/20">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  <span className="text-sm font-semibold">AI Confidence Summary</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Overall case reconstruction confidence: <strong className="text-foreground">87%</strong>.
                  Timeline continuity: <strong className="text-foreground">High</strong>.
                  Suspect identification certainty: <strong className="text-foreground">High</strong>.
                  Additional camera access could increase confidence to &gt;95%.
                </p>
              </div>
            </ReportSection>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-border flex items-center justify-between text-2xs text-muted-foreground">
              <span>PANOPTICON Forensic Intelligence Platform · {selectedReport.id.toUpperCase()}</span>
              <span>RESTRICTED · Law Enforcement Use Only</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FileText className="w-12 h-12 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Select a report to view</p>
          </div>
        </div>
      )}

      {/* Generate modal */}
      <AnimatePresence>
        {showGenerate && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-md glass-strong rounded-2xl border border-border shadow-panel"
            >
              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3 mb-1">
                  <BrainCircuit className="w-5 h-5 text-accent" />
                  <h2 className="text-base font-semibold">Generate AI Report</h2>
                </div>
                <p className="text-sm text-muted-foreground">Select case and report type</p>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Case</label>
                  <select className="mt-1.5 w-full px-3 py-2.5 text-sm bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:border-accent/50 cursor-pointer">
                    {mockCases.filter(c => c.status === 'active').map(c => (
                      <option key={c.id} value={c.id} className="bg-[#0D1526]">
                        {c.caseNumber} – {c.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Report Type</label>
                  <div className="grid grid-cols-2 gap-2 mt-1.5">
                    {Object.entries(reportTypeConfig).map(([type, config]) => {
                      const Icon = config.icon;
                      return (
                        <label key={type} className="flex items-center gap-2.5 p-3 rounded-lg bg-surface border border-border hover:border-accent/30 transition-colors cursor-pointer">
                          <input type="radio" name="reportType" value={type} className="accent-blue-500" defaultChecked={type === 'comprehensive'} />
                          <Icon className={cn('w-4 h-4', config.color)} />
                          <span className="text-xs font-medium">{config.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 p-6 border-t border-border">
                <button
                  onClick={() => setShowGenerate(false)}
                  className="flex-1 px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerate}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-accent text-accent-foreground rounded-lg hover:bg-accent-glow transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate
                </button>
              </div>
            </motion.div>
            <div className="absolute inset-0 -z-10" onClick={() => setShowGenerate(false)} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReportSection({
  number,
  title,
  children,
  delay = 0,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="mb-8"
    >
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs font-mono font-bold text-accent/60">{number}</span>
        <h3 className="text-base font-bold">{title}</h3>
        <div className="flex-1 h-px bg-border" />
      </div>
      {children}
    </motion.section>
  );
}
