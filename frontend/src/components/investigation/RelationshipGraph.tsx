'use client';

import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Handle,
  Position,
  NodeProps,
  BackgroundVariant,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Users, Film, Clock, Camera, AlertTriangle } from 'lucide-react';

// ── Custom node types ─────────────────────────────────────────────────────────
function SuspectNode({ data }: NodeProps) {
  return (
    <div className="px-3 py-2.5 rounded-xl border-2 border-warning/60 bg-[#1a1500] min-w-[120px] shadow-lg">
      <Handle type="target" position={Position.Top} className="!bg-warning/60 !border-warning" />
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-full bg-warning/20 flex items-center justify-center">
          <Users className="w-3 h-3 text-warning" />
        </div>
        <span className="text-xs font-bold text-warning">{data.label as string}</span>
      </div>
      <p className="text-2xs text-warning/60">{data.role as string}</p>
      <div className="mt-1.5 text-2xs font-mono text-warning/50">{data.confidence as string}%</div>
      <Handle type="source" position={Position.Bottom} className="!bg-warning/60 !border-warning" />
    </div>
  );
}

function CameraNode({ data }: NodeProps) {
  return (
    <div className="px-3 py-2.5 rounded-xl border-2 border-accent/50 bg-[#001520] min-w-[130px] shadow-lg">
      <Handle type="target" position={Position.Top} className="!bg-accent/60 !border-accent" />
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center">
          <Camera className="w-3 h-3 text-accent" />
        </div>
        <span className="text-xs font-semibold text-accent">{data.label as string}</span>
      </div>
      <p className="text-2xs text-accent/60">{data.location as string}</p>
      <Handle type="source" position={Position.Bottom} className="!bg-accent/60 !border-accent" />
    </div>
  );
}

function EventNode({ data }: NodeProps) {
  const severityColor = data.severity === 'critical' ? 'danger' : data.severity === 'high' ? 'warning' : 'success';
  return (
    <div
      className={`px-3 py-2.5 rounded-xl border-2 min-w-[140px] shadow-lg`}
      style={{
        borderColor: data.severity === 'critical' ? '#ef4444' : data.severity === 'high' ? '#f59e0b' : '#22c55e',
        background: data.severity === 'critical' ? '#1a0000' : data.severity === 'high' ? '#1a1000' : '#001a00',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ top: '50%' }}
        className={`!bg-${severityColor}/60`} />
      <div className="flex items-center gap-2 mb-1">
        <AlertTriangle className="w-3 h-3" style={{
          color: data.severity === 'critical' ? '#ef4444' : data.severity === 'high' ? '#f59e0b' : '#22c55e'
        }} />
        <span className="text-xs font-semibold text-foreground">{data.label as string}</span>
      </div>
      <p className="text-2xs text-muted-foreground">{data.time as string}</p>
      <Handle type="source" position={Position.Right} style={{ top: '50%' }} />
    </div>
  );
}

function EvidenceNode({ data }: NodeProps) {
  return (
    <div className="px-3 py-2.5 rounded-xl border-2 border-primary/50 bg-[#001030] min-w-[130px] shadow-lg">
      <Handle type="target" position={Position.Top} className="!bg-primary/60" />
      <div className="flex items-center gap-2 mb-1">
        <Film className="w-3 h-3 text-primary" />
        <span className="text-xs font-semibold text-primary">{data.label as string}</span>
      </div>
      <p className="text-2xs text-primary/60">{data.type as string}</p>
    </div>
  );
}

const nodeTypes = {
  suspect: SuspectNode,
  camera: CameraNode,
  event: EventNode,
  evidence: EvidenceNode,
};

// ── Static graph data ─────────────────────────────────────────────────────────
const INITIAL_NODES: Node[] = [
  // Suspects
  { id: 'sus-alpha', type: 'suspect', position: { x: 200, y: 100 }, data: { label: 'Suspect Alpha', role: 'Primary Actor', confidence: '94' } },
  { id: 'sus-beta',  type: 'suspect', position: { x: 500, y: 100 }, data: { label: 'Suspect Beta',  role: 'Lookout',       confidence: '88' } },
  // Cameras
  { id: 'cam-002', type: 'camera', position: { x: 50,  y: 320 }, data: { label: 'CAM-STN-002', location: 'Concourse'   } },
  { id: 'cam-004', type: 'camera', position: { x: 300, y: 320 }, data: { label: 'CAM-STN-004', location: 'Platform 4'  } },
  { id: 'cam-005', type: 'camera', position: { x: 550, y: 320 }, data: { label: 'CAM-STN-005', location: 'North Exit'  } },
  // Events
  { id: 'ev-arrive',  type: 'event', position: { x: 50,  y: 520 }, data: { label: 'Suspects Arrive',   time: '14:28:14', severity: 'high' } },
  { id: 'ev-robbery', type: 'event', position: { x: 300, y: 520 }, data: { label: 'Robbery Initiated', time: '14:32:14', severity: 'critical' } },
  { id: 'ev-flee',    type: 'event', position: { x: 550, y: 520 }, data: { label: 'Suspects Flee',     time: '14:33:01', severity: 'critical' } },
  // Evidence
  { id: 'evd-001', type: 'evidence', position: { x: 160, y: 680 }, data: { label: 'EV-001', type: 'CCTV Video 30min'  } },
  { id: 'evd-002', type: 'evidence', position: { x: 400, y: 680 }, data: { label: 'EV-002', type: 'CCTV Overview'     } },
  { id: 'evd-003', type: 'evidence', position: { x: 620, y: 680 }, data: { label: 'EV-003', type: 'Body Camera'       } },
];

const INITIAL_EDGES: Edge[] = [
  // Suspects → Cameras (re-ID matches)
  { id: 'e1', source: 'sus-alpha', target: 'cam-002', label: 'detected', style: { stroke: '#F59E0B', strokeWidth: 2 }, animated: true },
  { id: 'e2', source: 'sus-alpha', target: 'cam-004', label: 'primary',  style: { stroke: '#F59E0B', strokeWidth: 3 }, animated: true },
  { id: 'e3', source: 'sus-beta',  target: 'cam-002', label: 'detected', style: { stroke: '#FB923C', strokeWidth: 2 }, animated: true },
  { id: 'e4', source: 'sus-beta',  target: 'cam-004', label: 'detected', style: { stroke: '#FB923C', strokeWidth: 2 }, animated: true },
  { id: 'e5', source: 'sus-alpha', target: 'cam-005', label: 'fled',     style: { stroke: '#EF4444', strokeWidth: 2 }, animated: true },
  { id: 'e6', source: 'sus-beta',  target: 'cam-005', label: 'fled',     style: { stroke: '#EF4444', strokeWidth: 2 }, animated: true },
  // Cameras → Events
  { id: 'e7',  source: 'cam-002', target: 'ev-arrive',  style: { stroke: '#00B4D8', strokeWidth: 1.5 } },
  { id: 'e8',  source: 'cam-004', target: 'ev-robbery', style: { stroke: '#EF4444', strokeWidth: 1.5 } },
  { id: 'e9',  source: 'cam-005', target: 'ev-flee',    style: { stroke: '#EF4444', strokeWidth: 1.5 } },
  // Events → Evidence
  { id: 'e10', source: 'ev-arrive',  target: 'evd-002', style: { stroke: '#6B7280', strokeWidth: 1 } },
  { id: 'e11', source: 'ev-robbery', target: 'evd-001', style: { stroke: '#6B7280', strokeWidth: 1 } },
  { id: 'e12', source: 'ev-flee',    target: 'evd-003', style: { stroke: '#6B7280', strokeWidth: 1 } },
  // Suspect co-presence
  { id: 'e13', source: 'sus-alpha', target: 'sus-beta', label: 'associates', style: { stroke: '#7C3AED', strokeWidth: 2, strokeDasharray: '5,5' } },
];

// ── Public component ──────────────────────────────────────────────────────────
export function RelationshipGraph() {
  const [nodes, , onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  return (
    <div className="w-full h-full" style={{ background: '#060b17' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={2}
        style={{ background: '#060b17' }}
        defaultEdgeOptions={{ style: { strokeWidth: 1.5 } }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#1E2840" />
        <Controls
          style={{
            background: '#0D1526',
            border: '1px solid #1E2840',
            borderRadius: '8px',
          }}
        />
        <MiniMap
          style={{ background: '#0D1526', border: '1px solid #1E2840', borderRadius: '8px' }}
          nodeColor={(n) =>
            n.type === 'suspect' ? '#F59E0B' :
            n.type === 'camera'  ? '#00B4D8' :
            n.type === 'event'   ? '#EF4444' : '#1565C0'
          }
          maskColor="rgba(6,11,23,0.7)"
        />
        <Panel position="top-left">
          <div className="flex items-center gap-3 bg-[#0D1526]/90 border border-border rounded-lg px-3 py-2 backdrop-blur-sm">
            {[
              { color: '#F59E0B', label: 'Suspect' },
              { color: '#00B4D8', label: 'Camera' },
              { color: '#EF4444', label: 'Event' },
              { color: '#1565C0', label: 'Evidence' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: item.color }} />
                <span className="text-2xs text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
