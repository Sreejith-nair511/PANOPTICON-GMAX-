'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, Printer, Shield, Lock, CheckCircle,
  AlertCircle, Sparkles, BrainCircuit, Layers, Clock,
  Users, Target, Camera, BarChart3, ChevronRight, X,
} from 'lucide-react';
import { ConfidenceBadge } from '@/components/ui/ConfidenceBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { cn, formatTimestamp, formatRelativeTime } from '@/lib/utils';
import { DATASET_METRICS, FORENSIC_INSIGHTS, EVIDENCE_CORRELATIONS, SUSPECT_TRAJECTORIES } from '@/lib/forensicData';
import { toast } from 'sonner';

interface ReportConfig {
  caseNumber: string;
  title: string;
  type: 'comprehensive' | 'timeline' | 'suspect' | 'evidence' | 'incident';
  includeDatasetMetrics: boolean;
  includeCorrelations: boolean;
  includeTrajectories: boolean;
  includeInsights: boolean;
  classificationLevel: 'restricted' | 'confidential' | 'secret';
}

const DEFAULT_CONFIG: ReportConfig = {
  caseNumber: 'PAN-2026-0047',
  title: 'Forensic Intelligence Report — Central Station Robbery',
  type: 'comprehensive',
  includeDatasetMetrics: true,
  includeCorrelations: true,
  includeTrajectories: true,
  includeInsights: true,
  classificationLevel: 'restricted',
};

const CLASSIFICATION_COLORS: Record<string, string> = {
  restricted: '#ef4444', confidential: '#f59e0b', secret: '#a78bfa',
};

// ── Report Section ──────────────────────────────────────────────────────────
function ReportSection({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-xs font-mono font-bold text-accent/50">{num}</span>
        <h3 className="text-base font-bold">{title}</h3>
        <div className="flex-1 h-px bg-border" />
      </div>
      {children}
    </motion.section>
  );
}

// ── Dataset Metrics Section ─────────────────────────────────────────────────
function DatasetMetricsSection() {
  const grouped = {
    'MOT17': DATASET_METRICS.filter(m => m.dataset === 'MOT17'),
    'Market-1501': DATASET_METRICS.filter(m => m.dataset === 'Market-1501'),
    'COCO': DATASET_METRICS.filter(m => m.dataset === 'COCO'),
  };
  const colors: Record<string, string> = { 'MOT17': '#00b4d8', 'Market-1501': '#f59e0b', 'COCO': '#22c55e' };
  const descriptions: Record<string, string> = {
    'MOT17': 'Multi-object pedestrian tracking — validates tracker consistency in CCTV sequences',
    'Market-1501': 'Person re-identification — cross-camera identity matching accuracy',
    'COCO': 'General object detection — 80-category detection including weapons',
  };

  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([dataset, metrics]) => (
        <div key={dataset} className="rounded-xl overflow-hidden border border-border">
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border"
            style={{ background: `${colors[dataset]}08` }}>
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: colors[dataset] }} />
            <span className="text-sm font-bold" style={{ color: colors[dataset] }}>{dataset}</span>
          </div>
          <div className="px-4 py-2 text-xs text-muted-foreground border-b border-border">
            {descriptions[dataset]}
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-white/[0.02]">
                {['Metric', 'Value', 'Benchmark', 'Status'].map(h => (
                  <th key={h} className="px-4 py-2 text-left text-2xs text-muted-foreground/60 font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.map(m => (
                <tr key={m.metric} className="border-b border-border/50">
                  <td className="px-4 py-2.5 text-xs font-semibold">{m.metric}</td>
                  <td className="px-4 py-2.5 text-xs font-mono font-bold" style={{ color: colors[dataset] }}>
                    {m.value}{m.unit}
                  </td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">{m.benchmark}{m.unit}</td>
                  <td className="px-4 py-2.5">
                    {m.value >= m.benchmark ? (
                      <span className="flex items-center gap-1 text-2xs text-success font-semibold">
                        <CheckCircle className="w-3 h-3" /> Above benchmark
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-2xs text-warning font-semibold">
                        <AlertCircle className="w-3 h-3" /> Below benchmark
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      {/* Composite score */}
      <div className="rounded-xl p-4 border"
        style={{ background: 'rgba(0,180,216,0.06)', borderColor: 'rgba(0,180,216,0.2)' }}>
        <div className="flex items-center gap-2 mb-2">
          <BarChart3 className="w-4 h-4 text-accent" />
          <span className="text-sm font-bold">Composite Forensic Confidence</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Weighted average: MOT17 (40%) + Market-1501 (35%) + COCO (25%)
        </p>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-3 rounded-full bg-white/5 overflow-hidden">
            <motion.div className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #00b4d8, #22c55e)' }}
              initial={{ width: 0 }} animate={{ width: '87.93%' }} transition={{ duration: 1.5 }} />
          </div>
          <span className="text-lg font-bold text-gradient-cyan shrink-0">87.93%</span>
        </div>
      </div>
    </div>
  );
}

// ── Full Report Viewer ──────────────────────────────────────────────────────
function ReportViewer({ config }: { config: ReportConfig }) {
  const classColor = CLASSIFICATION_COLORS[config.classificationLevel];
  const now = new Date().toISOString();
  const confirmedCorr = EVIDENCE_CORRELATIONS.filter(c => c.status === 'confirmed');

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-8">
      {/* Cover page */}
      <div className="rounded-2xl p-8 border"
        style={{ background: 'rgba(255,255,255,0.025)', borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#00b4d8,#1565c0)' }}>
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold tracking-widest text-gradient-cyan">PANOPTICON</p>
                <p className="text-2xs text-muted-foreground/50 tracking-widest">FORENSIC INTELLIGENCE SYSTEM</p>
              </div>
            </div>
            <h1 className="text-2xl font-bold mb-2">{config.title}</h1>
            <p className="text-sm text-muted-foreground">Case {config.caseNumber} · {config.type.charAt(0).toUpperCase() + config.type.slice(1)} Report</p>
          </div>
          <div className="text-right shrink-0 ml-6">
            <p className="text-2xs text-muted-foreground/50 uppercase tracking-wider mb-1">Classification</p>
            <p className="text-sm font-bold flex items-center gap-1" style={{ color: classColor }}>
              <Lock className="w-3.5 h-3.5" /> {config.classificationLevel.toUpperCase()}
            </p>
            <p className="text-2xs text-muted-foreground/50 uppercase tracking-wider mt-3 mb-1">Generated</p>
            <p className="text-xs font-mono">{formatTimestamp(now, 'dd MMM yyyy HH:mm')}</p>
            <p className="text-2xs text-muted-foreground/50 uppercase tracking-wider mt-2 mb-1">AI Engine</p>
            <p className="text-xs font-semibold text-accent">PANOPTICON v1.1</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 pt-5 border-t border-border">
          {[
            ['Dataset Models', '3 validated'],
            ['Evidence Links', `${EVIDENCE_CORRELATIONS.length} found`],
            ['Trajectories', `${SUSPECT_TRAJECTORIES.length} tracked`],
            ['Confidence', '87.93%'],
          ].map(([l, v]) => (
            <div key={l}>
              <p className="text-2xs text-muted-foreground/50 uppercase tracking-wider">{l}</p>
              <p className="text-sm font-bold mt-0.5">{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Executive Summary */}
      <ReportSection num="01" title="Executive Summary">
        <p className="text-sm text-muted-foreground leading-7">
          This report presents AI-assisted forensic analysis of the Central Station armed robbery (Case {config.caseNumber}).
          Analysis was performed using three validated benchmark datasets: <strong className="text-foreground">MOT17</strong> for
          multi-object pedestrian tracking, <strong className="text-foreground">Market-1501</strong> for cross-camera
          person re-identification, and <strong className="text-foreground">COCO</strong> for object and weapon detection.
          Composite forensic confidence: <strong className="text-accent">87.93%</strong>. All findings are evidence-referenced
          and camera-timestamped.
        </p>
      </ReportSection>

      {/* AI Forensic Insights */}
      {config.includeInsights && (
        <ReportSection num="02" title="AI Forensic Insights">
          <div className="space-y-3">
            {FORENSIC_INSIGHTS.map((ins, i) => (
              <motion.div key={ins.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                className="flex gap-4 p-4 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: ins.severity === 'critical' ? 'rgba(239,68,68,0.12)' : ins.severity === 'high' ? 'rgba(245,158,11,0.12)' : 'rgba(0,180,216,0.12)',
                    border: `1px solid ${ins.severity === 'critical' ? 'rgba(239,68,68,0.25)' : ins.severity === 'high' ? 'rgba(245,158,11,0.25)' : 'rgba(0,180,216,0.25)'}`,
                  }}>
                  <Sparkles className="w-4 h-4" style={{ color: ins.severity === 'critical' ? '#ef4444' : ins.severity === 'high' ? '#f59e0b' : '#00b4d8' }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold">{ins.title}</p>
                    <ConfidenceBadge score={ins.confidence} size="sm" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{ins.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-2xs font-mono text-muted-foreground/50">{ins.datasetBacked}</span>
                    <span className="text-2xs text-muted-foreground/40">{formatRelativeTime(ins.timestamp)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </ReportSection>
      )}

      {/* Dataset Metrics */}
      {config.includeDatasetMetrics && (
        <ReportSection num="03" title="Dataset Validation Metrics">
          <DatasetMetricsSection />
        </ReportSection>
      )}

      {/* Evidence Correlations */}
      {config.includeCorrelations && (
        <ReportSection num="04" title="Evidence Correlation Analysis">
          <div className="space-y-3">
            {EVIDENCE_CORRELATIONS.map((corr, i) => (
              <div key={corr.id} className="p-4 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-3 mb-2">
                  <p className="text-sm font-bold flex-1">{corr.title}</p>
                  <span className={cn('text-2xs px-2 py-0.5 rounded font-semibold',
                    corr.status === 'confirmed' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                  )}>{corr.status}</span>
                  <ConfidenceBadge score={corr.confidence} size="sm" />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <span className="font-mono">{corr.evidenceA.id}</span>
                  <span>↔</span>
                  <span className="font-mono">{corr.evidenceB.id}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {corr.sharedAttributes.map((a, j) => (
                    <span key={j} className="text-2xs px-1.5 py-0.5 rounded bg-accent/8 text-accent border border-accent/20">{a}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ReportSection>
      )}

      {/* Suspect Trajectories */}
      {config.includeTrajectories && (
        <ReportSection num="05" title="Suspect Movement Trajectories">
          <div className="space-y-4">
            {SUSPECT_TRAJECTORIES.map(traj => (
              <div key={traj.suspectId} className="rounded-xl overflow-hidden border border-border">
                <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border"
                  style={{ background: `${traj.color}08` }}>
                  <Target className="w-4 h-4" style={{ color: traj.color }} />
                  <span className="text-sm font-bold" style={{ color: traj.color }}>{traj.label}</span>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border bg-white/[0.02]">
                      {['Time', 'Camera', 'Location', 'Confidence'].map(h => (
                        <th key={h} className="px-4 py-2 text-left text-2xs text-muted-foreground/60 font-semibold uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {traj.path.map((pt, i) => (
                      <tr key={i} className="border-b border-border/40">
                        <td className="px-4 py-2.5 font-mono font-bold" style={{ color: traj.color }}>{pt.time}</td>
                        <td className="px-4 py-2.5 font-mono text-muted-foreground/70">{pt.cameraId}</td>
                        <td className="px-4 py-2.5">{pt.location}</td>
                        <td className="px-4 py-2.5"><ConfidenceBadge score={pt.confidence} size="sm" showLabel={false} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </ReportSection>
      )}

      {/* Conclusions */}
      <ReportSection num="06" title="Conclusions & Recommendations">
        <div className="space-y-3">
          {[
            { ok: true,  text: 'Two suspects confirmed via cross-camera re-identification (94% and 88% confidence). Market-1501 validated.' },
            { ok: true,  text: 'Complete movement reconstruction from station arrival to escape. MOT17-validated tracking consistency.' },
            { ok: true,  text: 'Firearm detection at 14:32:14 corroborated across 2 camera angles. COCO AP: 89%.' },
            { ok: true,  text: `${confirmedCorr.length} of ${EVIDENCE_CORRELATIONS.length} evidence correlations confirmed via cross-evidence matching.` },
            { ok: false, text: 'Facial biometric comparison pending — extended camera network access requested.' },
          ].map((c, i) => (
            <div key={i} className="flex items-start gap-3">
              {c.ok
                ? <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                : <AlertCircle className="w-4 h-4 text-warning mt-0.5 shrink-0" />}
              <p className="text-sm text-muted-foreground leading-relaxed">{c.text}</p>
            </div>
          ))}
          <div className="mt-4 p-4 rounded-xl"
            style={{ background: 'rgba(0,180,216,0.06)', border: '1px solid rgba(0,180,216,0.15)' }}>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold">AI Composite Summary</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Overall case reconstruction: <strong className="text-foreground">87.93%</strong> composite confidence.
              Timeline continuity: <strong className="text-foreground">High</strong>.
              Dataset validation: <strong className="text-foreground">MOT17 + Market-1501 + COCO</strong>.
              Admissibility classification: <strong style={{ color: classColor }}>{config.classificationLevel.toUpperCase()}</strong>.
            </p>
          </div>
        </div>
      </ReportSection>

      {/* Footer */}
      <div className="pt-6 flex justify-between text-2xs text-muted-foreground/40 font-mono border-t border-border">
        <span>PANOPTICON · {config.caseNumber}</span>
        <span style={{ color: classColor }}>{config.classificationLevel.toUpperCase()} · Law Enforcement Use Only</span>
      </div>
    </div>
  );
}

// ── Exported Component ──────────────────────────────────────────────────────
export function ForensicReportGenerator() {
  const [config, setConfig] = useState<ReportConfig>(DEFAULT_CONFIG);
  const [generating, setGenerating] = useState(false);
  const [genProgress, setGenProgress] = useState(0);
  const [reportReady, setReportReady] = useState(true);
  const [showConfig, setShowConfig] = useState(false);

  const generate = useCallback(() => {
    setGenerating(true);
    setGenProgress(0);
    setReportReady(false);
    const steps = ['Extracting evidence metadata', 'Running dataset validation', 'Correlating evidence', 'Computing trajectories', 'Generating narrative'];
    let step = 0;
    const iv = setInterval(() => {
      setGenProgress(p => {
        const next = p + 4;
        if (next >= 100) {
          clearInterval(iv);
          setGenerating(false);
          setReportReady(true);
          toast.success('Forensic report generated');
          return 100;
        }
        return next;
      });
    }, 80);
  }, []);

  const handleDownload = useCallback(() => {
    toast.promise(
      new Promise<void>(resolve => {
        setTimeout(() => {
          const content = [
            'PANOPTICON FORENSIC INTELLIGENCE REPORT',
            '='.repeat(50),
            '',
            `Case: ${config.caseNumber}`,
            `Title: ${config.title}`,
            `Generated: ${new Date().toLocaleString()}`,
            `Classification: ${config.classificationLevel.toUpperCase()}`,
            '',
            'DATASET VALIDATION',
            '-'.repeat(30),
            'MOT17 MOTA: 77.45% (benchmark: 75%) — PASS',
            'Market-1501 Rank-1: 92.45% (benchmark: 90%) — PASS',
            'COCO Mean AP: 75.4% (benchmark: 70%) — PASS',
            '',
            'COMPOSITE FORENSIC CONFIDENCE: 87.93%',
            '',
            `EVIDENCE CORRELATIONS: ${EVIDENCE_CORRELATIONS.length} found, ${EVIDENCE_CORRELATIONS.filter(c => c.status === 'confirmed').length} confirmed`,
            '',
            'Classification: RESTRICTED — Law Enforcement Use Only',
          ].join('\n');
          const blob = new Blob([content], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${config.caseNumber}_forensic_report.txt`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          resolve();
        }, 800);
      }),
      { loading: 'Preparing report…', success: 'Report downloaded', error: 'Download failed' }
    );
  }, [config]);

  const toggle = (field: keyof ReportConfig, val?: boolean) =>
    setConfig(c => ({ ...c, [field]: val !== undefined ? val : !c[field as keyof ReportConfig] }));

  return (
    <div className="flex h-full overflow-hidden bg-[#040810]">
      {/* Config sidebar */}
      <div className="w-72 shrink-0 flex flex-col border-r border-border bg-[#06091a]">
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-2 mb-1">
            <BrainCircuit className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-bold">Report Generator</h2>
          </div>
          <p className="text-2xs text-muted-foreground">Dataset-backed forensic reports</p>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
          {/* Case */}
          <div className="space-y-1.5">
            <label className="text-2xs font-semibold text-muted-foreground/60 uppercase tracking-wider">Case</label>
            <input value={config.caseNumber} onChange={e => setConfig(c => ({ ...c, caseNumber: e.target.value }))}
              className="w-full px-3 py-2 text-xs bg-surface border border-border rounded-lg text-foreground focus:outline-none focus:border-accent/40" />
          </div>
          {/* Classification */}
          <div className="space-y-1.5">
            <label className="text-2xs font-semibold text-muted-foreground/60 uppercase tracking-wider">Classification</label>
            <div className="flex gap-1">
              {(['restricted', 'confidential', 'secret'] as const).map(lvl => (
                <button key={lvl} onClick={() => setConfig(c => ({ ...c, classificationLevel: lvl }))}
                  className={cn('flex-1 py-1.5 text-2xs font-semibold capitalize rounded-lg border transition-colors',
                    config.classificationLevel === lvl
                      ? 'border-current text-white'
                      : 'border-border text-muted-foreground hover:text-foreground')}
                  style={config.classificationLevel === lvl ? { background: `${CLASSIFICATION_COLORS[lvl]}20`, borderColor: CLASSIFICATION_COLORS[lvl], color: CLASSIFICATION_COLORS[lvl] } : {}}>
                  {lvl}
                </button>
              ))}
            </div>
          </div>
          {/* Sections */}
          <div className="space-y-2">
            <label className="text-2xs font-semibold text-muted-foreground/60 uppercase tracking-wider">Include Sections</label>
            {[
              { key: 'includeInsights', label: 'AI Forensic Insights', icon: Sparkles },
              { key: 'includeDatasetMetrics', label: 'Dataset Benchmarks', icon: BarChart3 },
              { key: 'includeCorrelations', label: 'Evidence Correlations', icon: Layers },
              { key: 'includeTrajectories', label: 'Suspect Trajectories', icon: Target },
            ].map(({ key, label, icon: Icon }) => (
              <button key={key}
                onClick={() => toggle(key as keyof ReportConfig)}
                className={cn('w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all',
                  (config as any)[key] ? 'bg-accent/8 border-accent/25 text-foreground' : 'border-border text-muted-foreground hover:text-foreground')}>
                <Icon className="w-4 h-4 shrink-0" style={{ color: (config as any)[key] ? '#00b4d8' : undefined }} />
                <span className="text-xs font-medium flex-1">{label}</span>
                <div className={cn('w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0',
                  (config as any)[key] ? 'bg-accent border-accent' : 'border-border')}>
                  {(config as any)[key] && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <div className="p-4 border-t border-border space-y-2">
          {generating && (
            <div className="space-y-1.5">
              <div className="flex justify-between text-2xs">
                <span className="text-muted-foreground">Generating…</span>
                <span className="font-mono text-accent">{genProgress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-surface overflow-hidden">
                <motion.div className="h-full rounded-full bg-accent" animate={{ width: `${genProgress}%` }} />
              </div>
            </div>
          )}
          <button onClick={generate} disabled={generating}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg,#00b4d8,#1565c0)', color: 'white', boxShadow: '0 4px 16px rgba(0,180,216,0.35)' }}>
            <Sparkles className="w-4 h-4" />
            {generating ? 'Generating…' : 'Generate Report'}
          </button>
          {reportReady && (
            <button onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:border-accent/30 transition-colors">
              <Download className="w-4 h-4" /> Download
            </button>
          )}
        </div>
      </div>

      {/* Report viewer */}
      <div className="flex-1 overflow-y-auto p-6">
        {reportReady ? <ReportViewer config={config} /> : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <FileText className="w-16 h-16 text-muted-foreground/10 mx-auto mb-4" />
              <p className="text-muted-foreground">Configure and generate a report</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
