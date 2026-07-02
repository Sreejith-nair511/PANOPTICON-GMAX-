'use client';

import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  Connection,
  Handle,
  Position,
  NodeProps,
  BackgroundVariant,
  Panel,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
} from '@xyflow/react';
// CSS loaded globally in layout to avoid SSR chunk failure
import { Users, Film, Clock, Camera, AlertTriangle } from 'lucide-react';

// ── Custom nodes ─────────────────────────────────────────────────────────────
function SuspectNode({ data }: NodeProps) {
  return (
    <div style={{ padding:'10px 14px', borderRadius:'12px', border:'2px solid #f59e0b66', background:'rgba(26,21,0,0.95)', minWidth:'130px' }}>
      <Handle type="target" position={Position.Top} style={{ background:'#f59e0b', border:'none', width:8, height:8 }} />
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
        <div style={{ width:24, height:24, borderRadius:6, background:'rgba(245,158,11,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Users size={12} color="#f59e0b" />
        </div>
        <span style={{ fontSize:12, fontWeight:700, color:'#f59e0b' }}>{String(data.label)}</span>
      </div>
      <p style={{ fontSize:10, color:'rgba(245,158,11,0.6)', margin:0 }}>{String(data.role)}</p>
      <p style={{ fontSize:10, color:'rgba(245,158,11,0.45)', margin:'4px 0 0', fontFamily:'monospace' }}>{String(data.confidence)}% confidence</p>
      <Handle type="source" position={Position.Bottom} style={{ background:'#f59e0b', border:'none', width:8, height:8 }} />
    </div>
  );
}

function CameraNode({ data }: NodeProps) {
  return (
    <div style={{ padding:'10px 14px', borderRadius:'12px', border:'2px solid #00b4d866', background:'rgba(0,21,32,0.95)', minWidth:'140px' }}>
      <Handle type="target" position={Position.Top} style={{ background:'#00b4d8', border:'none', width:8, height:8 }} />
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
        <div style={{ width:24, height:24, borderRadius:6, background:'rgba(0,180,216,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Camera size={12} color="#00b4d8" />
        </div>
        <span style={{ fontSize:12, fontWeight:600, color:'#00b4d8' }}>{String(data.label)}</span>
      </div>
      <p style={{ fontSize:10, color:'rgba(0,180,216,0.55)', margin:0 }}>{String(data.location)}</p>
      <Handle type="source" position={Position.Bottom} style={{ background:'#00b4d8', border:'none', width:8, height:8 }} />
    </div>
  );
}

function EventNode({ data }: NodeProps) {
  const col = data.severity === 'critical' ? '#ef4444' : data.severity === 'high' ? '#f59e0b' : '#22c55e';
  return (
    <div style={{ padding:'10px 14px', borderRadius:'12px', border:`2px solid ${col}66`, background:`rgba(${data.severity === 'critical' ? '26,0,0' : data.severity === 'high' ? '26,16,0' : '0,26,0'},0.95)`, minWidth:'150px' }}>
      <Handle type="target" position={Position.Left} style={{ top:'50%', background:col, border:'none', width:8, height:8 }} />
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
        <AlertTriangle size={12} color={col} />
        <span style={{ fontSize:12, fontWeight:600, color:col }}>{String(data.label)}</span>
      </div>
      <p style={{ fontSize:10, color:`${col}88`, margin:0, fontFamily:'monospace' }}>{String(data.time)}</p>
      <Handle type="source" position={Position.Right} style={{ top:'50%', background:col, border:'none', width:8, height:8 }} />
    </div>
  );
}

function EvidenceNode({ data }: NodeProps) {
  return (
    <div style={{ padding:'10px 14px', borderRadius:'12px', border:'2px solid #1565c066', background:'rgba(0,6,28,0.95)', minWidth:'130px' }}>
      <Handle type="target" position={Position.Top} style={{ background:'#1565c0', border:'none', width:8, height:8 }} />
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
        <Film size={12} color="#1565c0" />
        <span style={{ fontSize:12, fontWeight:600, color:'#4d94ff' }}>{String(data.label)}</span>
      </div>
      <p style={{ fontSize:10, color:'rgba(77,148,255,0.55)', margin:0 }}>{String(data.type)}</p>
    </div>
  );
}

const nodeTypes = { suspect: SuspectNode, camera: CameraNode, event: EventNode, evidence: EvidenceNode };

// ── Graph data ────────────────────────────────────────────────────────────────
const INIT_NODES: Node[] = [
  { id:'sus-alpha', type:'suspect', position:{x:200,y:60},  data:{ label:'Suspect Alpha', role:'Primary Actor', confidence:'94' } },
  { id:'sus-beta',  type:'suspect', position:{x:480,y:60},  data:{ label:'Suspect Beta',  role:'Lookout',       confidence:'88' } },
  { id:'cam-002',   type:'camera',  position:{x:40,y:280},  data:{ label:'CAM-STN-002', location:'Concourse'    } },
  { id:'cam-004',   type:'camera',  position:{x:280,y:280}, data:{ label:'CAM-STN-004', location:'Platform 4'   } },
  { id:'cam-005',   type:'camera',  position:{x:520,y:280}, data:{ label:'CAM-STN-005', location:'North Exit'   } },
  { id:'ev-arrive', type:'event',   position:{x:40,y:480},  data:{ label:'Suspects Arrive',   time:'14:28:14', severity:'high'     } },
  { id:'ev-robbery',type:'event',   position:{x:280,y:480}, data:{ label:'Robbery Initiated', time:'14:32:14', severity:'critical' } },
  { id:'ev-flee',   type:'event',   position:{x:520,y:480}, data:{ label:'Suspects Flee',     time:'14:33:01', severity:'critical' } },
  { id:'evd-001',   type:'evidence',position:{x:150,y:640}, data:{ label:'EV-001', type:'CCTV 30min'  } },
  { id:'evd-002',   type:'evidence',position:{x:380,y:640}, data:{ label:'EV-002', type:'CCTV Overview'} },
  { id:'evd-003',   type:'evidence',position:{x:570,y:640}, data:{ label:'EV-003', type:'Body Camera' } },
];

const INIT_EDGES: Edge[] = [
  { id:'e1',  source:'sus-alpha', target:'cam-002', label:'detected', animated:true,  style:{stroke:'#f59e0b',strokeWidth:2} },
  { id:'e2',  source:'sus-alpha', target:'cam-004', label:'primary',  animated:true,  style:{stroke:'#f59e0b',strokeWidth:3} },
  { id:'e3',  source:'sus-beta',  target:'cam-002', label:'detected', animated:true,  style:{stroke:'#fb923c',strokeWidth:2} },
  { id:'e4',  source:'sus-beta',  target:'cam-004', label:'detected', animated:true,  style:{stroke:'#fb923c',strokeWidth:2} },
  { id:'e5',  source:'sus-alpha', target:'cam-005', label:'fled',     animated:true,  style:{stroke:'#ef4444',strokeWidth:2} },
  { id:'e6',  source:'sus-beta',  target:'cam-005', label:'fled',     animated:true,  style:{stroke:'#ef4444',strokeWidth:2} },
  { id:'e7',  source:'cam-002',   target:'ev-arrive',  style:{stroke:'#00b4d8',strokeWidth:1.5} },
  { id:'e8',  source:'cam-004',   target:'ev-robbery', style:{stroke:'#ef4444',strokeWidth:1.5} },
  { id:'e9',  source:'cam-005',   target:'ev-flee',    style:{stroke:'#ef4444',strokeWidth:1.5} },
  { id:'e10', source:'ev-arrive',  target:'evd-002', style:{stroke:'#374151',strokeWidth:1} },
  { id:'e11', source:'ev-robbery', target:'evd-001', style:{stroke:'#374151',strokeWidth:1} },
  { id:'e12', source:'ev-flee',    target:'evd-003', style:{stroke:'#374151',strokeWidth:1} },
  { id:'e13', source:'sus-alpha', target:'sus-beta', label:'associates', style:{stroke:'#7c3aed',strokeWidth:2,strokeDasharray:'6 4'} },
];

export function RelationshipGraph() {
  const [nodes, , onNodesChange] = useNodesState(INIT_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INIT_EDGES);
  const onConnect = useCallback((c: Connection) => setEdges(eds => addEdge(c, eds)), [setEdges]);

  return (
    <div style={{ width:'100%', height:'100%', background:'#060b17' }}>
      <ReactFlow
        nodes={nodes} edges={edges}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView fitViewOptions={{ padding:0.18 }}
        minZoom={0.25} maxZoom={2.5}
        style={{ background:'#060b17' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={28} size={1} color="#1e2840" />
        <Controls style={{ background:'#0d1526', border:'1px solid #1e2840', borderRadius:8 }} />
        <MiniMap
          style={{ background:'#0d1526', border:'1px solid #1e2840', borderRadius:8 }}
          nodeColor={n => n.type==='suspect'?'#f59e0b':n.type==='camera'?'#00b4d8':n.type==='event'?'#ef4444':'#1565c0'}
          maskColor="rgba(6,11,23,0.75)"
        />
        <Panel position="top-left">
          <div style={{ display:'flex', gap:12, alignItems:'center', background:'rgba(13,21,38,0.9)', border:'1px solid #1e2840', borderRadius:8, padding:'6px 12px', backdropFilter:'blur(8px)' }}>
            {[['#f59e0b','Suspect'],['#00b4d8','Camera'],['#ef4444','Event'],['#1565c0','Evidence']].map(([color, label]) => (
              <div key={label} style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:color }} />
                <span style={{ fontSize:10, color:'#94a3b8' }}>{label}</span>
              </div>
            ))}
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
