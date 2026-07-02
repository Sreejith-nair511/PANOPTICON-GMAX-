/**
 * PANOPTICON Forensic Data Layer
 * Live stats, correlation engine data, and simulation hooks
 */

export interface LiveSystemStats {
  activeCameras: number;
  processingFps: number;
  detectionAccuracy: number;
  reidMatches: number;
  queueDepth: number;
  gpuUsage: number;
  cpuUsage: number;
  memoryUsage: number;
  networkLatency: number;
  alertsLast24h: number;
  suspectsActive: number;
  evidenceIngested: number;
}

export interface DatasetMetric {
  dataset: string;
  metric: string;
  value: number;
  benchmark: number;
  unit: string;
}

export interface CorrelationLink {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'person_match' | 'object_link' | 'location' | 'temporal' | 'camera_crossover';
  confidence: number;
  evidence: string[];
  timestamp: string;
  cameraIds: string[];
}

export interface ForensicInsight {
  id: string;
  type: 'pattern' | 'anomaly' | 'match' | 'alert' | 'timeline_gap';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  confidence: number;
  timestamp: string;
  relatedEvidence: string[];
  datasetBacked: string;
}

export interface SuspectTrajectory {
  suspectId: string;
  label: string;
  color: string;
  path: Array<{
    time: string;
    cameraId: string;
    location: string;
    confidence: number;
    bbox?: [number, number, number, number];
  }>;
}

export interface EvidenceCorrelation {
  id: string;
  caseId: string;
  title: string;
  type: 'suspect_link' | 'object_match' | 'location_match' | 'time_proximity';
  confidence: number;
  evidenceA: { id: string; name: string; timestamp: string };
  evidenceB: { id: string; name: string; timestamp: string };
  sharedAttributes: string[];
  status: 'confirmed' | 'pending' | 'disputed';
}

export const LIVE_STATS_BASELINE: LiveSystemStats = {
  activeCameras: 14,
  processingFps: 42,
  detectionAccuracy: 94.2,
  reidMatches: 7,
  queueDepth: 3,
  gpuUsage: 67,
  cpuUsage: 34,
  memoryUsage: 58,
  networkLatency: 8,
  alertsLast24h: 12,
  suspectsActive: 23,
  evidenceIngested: 187,
};

export const DATASET_METRICS: DatasetMetric[] = [
  { dataset: 'MOT17',       metric: 'MOTA',         value: 77.45, benchmark: 75.0, unit: '%' },
  { dataset: 'MOT17',       metric: 'IDF1',         value: 83.21, benchmark: 78.0, unit: '%' },
  { dataset: 'MOT17',       metric: 'MOTP',         value: 82.13, benchmark: 80.0, unit: '%' },
  { dataset: 'Market-1501', metric: 'Rank-1',       value: 92.45, benchmark: 90.0, unit: '%' },
  { dataset: 'Market-1501', metric: 'Cross-Cam',    value: 89.67, benchmark: 85.0, unit: '%' },
  { dataset: 'Market-1501', metric: 'mAP',          value: 87.34, benchmark: 82.0, unit: '%' },
  { dataset: 'COCO',        metric: 'Mean AP',      value: 75.4,  benchmark: 70.0, unit: '%' },
  { dataset: 'COCO',        metric: 'AP₅₀',         value: 92.1,  benchmark: 88.0, unit: '%' },
  { dataset: 'COCO',        metric: 'Weapon AP',    value: 70.2,  benchmark: 65.0, unit: '%' },
];

export const FORENSIC_INSIGHTS: ForensicInsight[] = [
  {
    id: 'ins-001',
    type: 'match',
    severity: 'critical',
    title: 'Cross-Camera ReID Confirmed',
    description: 'Suspect Alpha matched across CAM-STN-004 → CAM-STN-002 with 94% confidence. Market-1501 validated cross-camera tracking.',
    confidence: 94,
    timestamp: '2026-06-30T14:32:28Z',
    relatedEvidence: ['EV-001', 'EV-002'],
    datasetBacked: 'Market-1501',
  },
  {
    id: 'ins-002',
    type: 'alert',
    severity: 'critical',
    title: 'Weapon Detected',
    description: 'Firearm detected in frame 1847 (14:32:14). COCO-trained YOLOv8 confidence 89%. Object persisted across 14 frames.',
    confidence: 89,
    timestamp: '2026-06-30T14:32:14Z',
    relatedEvidence: ['EV-001'],
    datasetBacked: 'COCO',
  },
  {
    id: 'ins-003',
    type: 'pattern',
    severity: 'high',
    title: 'Coordinated Movement Pattern',
    description: 'Two suspects maintain 2–4m spacing across 6 waypoints. MOT17 tracking validates coordinated pedestrian pattern.',
    confidence: 88,
    timestamp: '2026-06-30T14:31:48Z',
    relatedEvidence: ['EV-001', 'EV-003'],
    datasetBacked: 'MOT17',
  },
  {
    id: 'ins-004',
    type: 'timeline_gap',
    severity: 'medium',
    title: '47s Coverage Gap Detected',
    description: 'No camera coverage between 14:32:32–14:33:19 at north corridor. Suspect trajectory extrapolated via path modeling.',
    confidence: 72,
    timestamp: '2026-06-30T14:32:32Z',
    relatedEvidence: ['EV-002'],
    datasetBacked: 'MOT17',
  },
  {
    id: 'ins-005',
    type: 'anomaly',
    severity: 'high',
    title: 'Unusual Dwell Time',
    description: 'Suspect Beta stationary at platform 4 for 4m 12s before incident. Heatmap density 3.2σ above baseline.',
    confidence: 83,
    timestamp: '2026-06-30T14:28:14Z',
    relatedEvidence: ['EV-001'],
    datasetBacked: 'MOT17',
  },
];

export const EVIDENCE_CORRELATIONS: EvidenceCorrelation[] = [
  {
    id: 'corr-001',
    caseId: 'case-001',
    title: 'Suspect Alpha: Station → Concourse',
    type: 'suspect_link',
    confidence: 94,
    evidenceA: { id: 'EV-001', name: 'Station Camera 4', timestamp: '2026-06-30T14:32:28Z' },
    evidenceB: { id: 'EV-002', name: 'Concourse Camera', timestamp: '2026-06-30T14:34:15Z' },
    sharedAttributes: ['Height: ~180cm', 'Dark jacket', 'Baseball cap', 'Backpack'],
    status: 'confirmed',
  },
  {
    id: 'corr-002',
    caseId: 'case-001',
    title: 'Backpack: Dropped → Picked Up',
    type: 'object_match',
    confidence: 87,
    evidenceA: { id: 'EV-001', name: 'Station Camera 4', timestamp: '2026-06-30T14:32:40Z' },
    evidenceB: { id: 'EV-003', name: 'Body Camera Rodriguez', timestamp: '2026-06-30T14:35:22Z' },
    sharedAttributes: ['Blue backpack', 'Estimated 8kg load', 'Distinctive side pocket'],
    status: 'confirmed',
  },
  {
    id: 'corr-003',
    caseId: 'case-001',
    title: 'Suspect Beta: Time Proximity Match',
    type: 'time_proximity',
    confidence: 78,
    evidenceA: { id: 'EV-002', name: 'Concourse Camera', timestamp: '2026-06-30T14:33:55Z' },
    evidenceB: { id: 'EV-004', name: 'North Exit Camera', timestamp: '2026-06-30T14:34:10Z' },
    sharedAttributes: ['Grey hoodie', 'White sneakers', '15s gap → consistent with walking pace'],
    status: 'pending',
  },
  {
    id: 'corr-004',
    caseId: 'case-001',
    title: 'Vehicle: Getaway Car Match',
    type: 'location_match',
    confidence: 81,
    evidenceA: { id: 'EV-005', name: 'North Exit Camera', timestamp: '2026-06-30T14:33:18Z' },
    evidenceB: { id: 'EV-006', name: 'Street CCTV', timestamp: '2026-06-30T14:33:45Z' },
    sharedAttributes: ['Black sedan', 'Partial plate: **4-7**', 'No headlights'],
    status: 'pending',
  },
];

export const SUSPECT_TRAJECTORIES: SuspectTrajectory[] = [
  {
    suspectId: 'susp-alpha',
    label: 'Suspect α',
    color: '#f59e0b',
    path: [
      { time: '14:28:14', cameraId: 'CAM-STN-001', location: 'South Entrance', confidence: 91 },
      { time: '14:29:45', cameraId: 'CAM-STN-002', location: 'Main Concourse', confidence: 88 },
      { time: '14:31:20', cameraId: 'CAM-STN-003', location: 'Platform Access', confidence: 93 },
      { time: '14:32:14', cameraId: 'CAM-STN-004', location: 'Platform 4', confidence: 96 },
      { time: '14:33:01', cameraId: 'CAM-STN-005', location: 'North Exit', confidence: 94 },
    ],
  },
  {
    suspectId: 'susp-beta',
    label: 'Suspect β',
    color: '#fb923c',
    path: [
      { time: '14:28:14', cameraId: 'CAM-STN-001', location: 'South Entrance', confidence: 85 },
      { time: '14:29:50', cameraId: 'CAM-STN-002', location: 'Main Concourse', confidence: 82 },
      { time: '14:31:48', cameraId: 'CAM-STN-004', location: 'Platform 4 Perimeter', confidence: 88 },
      { time: '14:33:01', cameraId: 'CAM-STN-005', location: 'North Exit', confidence: 91 },
    ],
  },
];

/** Simulate small random jitter for live stats */
export function jitterStats(base: LiveSystemStats, tick: number): LiveSystemStats {
  const jit = (v: number, range: number) =>
    Math.max(0, Math.min(100, v + (Math.sin(tick * 0.3 + v) * range)));
  return {
    ...base,
    processingFps:     Math.round(jit(base.processingFps, 4)),
    gpuUsage:          Math.round(jit(base.gpuUsage, 6)),
    cpuUsage:          Math.round(jit(base.cpuUsage, 5)),
    memoryUsage:       Math.round(jit(base.memoryUsage, 3)),
    networkLatency:    Math.round(Math.max(1, base.networkLatency + Math.sin(tick * 0.7) * 3)),
    reidMatches:       Math.max(0, base.reidMatches + Math.round(Math.sin(tick * 0.2) * 2)),
    detectionAccuracy: parseFloat(jit(base.detectionAccuracy, 1.5).toFixed(1)),
  };
}
