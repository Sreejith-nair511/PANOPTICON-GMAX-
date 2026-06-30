'use client';

import React, { useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid, Text, Line, Sphere, Box, Html } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Box as BoxIcon, Maximize2, RotateCcw } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────
interface Camera3D {
  id: string;
  label: string;
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  activeSuspects: number;
}

interface SuspectPath {
  id: string;
  label: string;
  color: string;
  points: [number, number, number][];
  currentIndex: number;
}

interface SceneViewerProps {
  currentTime: number; // 0-1 normalised
  className?: string;
}

// ── Static scene data (Central Station mock) ─────────────────────────────────
const CAMERAS: Camera3D[] = [
  { id: 'CAM-STN-004', label: 'Platform 4',   position: [4, 3, 2],  rotation: [0, -0.8, 0], color: '#00B4D8', activeSuspects: 2 },
  { id: 'CAM-STN-002', label: 'Concourse',    position: [-5, 3, -3], rotation: [0, 0.6, 0],  color: '#00B4D8', activeSuspects: 0 },
  { id: 'CAM-STN-001', label: 'South Entrance', position: [-8, 3, 6], rotation: [0, 0.4, 0], color: '#00B4D8', activeSuspects: 0 },
  { id: 'CAM-STN-005', label: 'North Exit',   position: [8, 3, -5], rotation: [0, -0.5, 0], color: '#22C55E', activeSuspects: 0 },
];

// Suspect Alpha path through station
const ALPHA_WAYPOINTS: [number, number, number][] = [
  [-8, 0, 6],   // South entrance at t=0
  [-4, 0, 3],   // Ticketing area
  [-1, 0, 1],   // Moving toward platform
  [2, 0, 0.5],  // Platform entrance
  [4, 0, 0],    // Platform 4 — robbery
  [7, 0, -4],   // North exit
];

const BETA_WAYPOINTS: [number, number, number][] = [
  [-8, 0, 6.5],
  [-3.5, 0, 3.5],
  [-0.5, 0, 1.5],
  [2.5, 0, 1],
  [4.5, 0, 0.5],
  [7.5, 0, -3.5],
];

// ── Camera model ──────────────────────────────────────────────────────────────
function CameraModel({ cam, active }: { cam: Camera3D; active: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (meshRef.current && active) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group position={cam.position} rotation={cam.rotation}>
      {/* Body */}
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[0.4, 0.25, 0.6]} />
        <meshStandardMaterial color={active ? '#F59E0B' : '#1E2840'} metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Lens */}
      <mesh position={[0, 0, 0.35]}>
        <cylinderGeometry args={[0.08, 0.1, 0.2, 16]} />
        <meshStandardMaterial color="#111" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Mount pole */}
      <mesh position={[0, -1.5, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 3, 8]} />
        <meshStandardMaterial color="#1E2840" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Status LED */}
      <mesh position={[0.22, 0.14, 0]}>
        <sphereGeometry args={[0.04]} />
        <meshStandardMaterial
          color={active ? '#F59E0B' : '#22C55E'}
          emissive={active ? '#F59E0B' : '#22C55E'}
          emissiveIntensity={active ? 2 : 1}
        />
      </mesh>
      {/* FOV cone */}
      {active && (
        <mesh position={[0, -0.3, 2]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[1.5, 4, 16, 1, true]} />
          <meshStandardMaterial color="#F59E0B" transparent opacity={0.06} side={THREE.DoubleSide} />
        </mesh>
      )}
      {/* Label */}
      <Html position={[0, 1, 0]} center>
        <div className="text-2xs font-mono bg-black/70 text-accent px-1.5 py-0.5 rounded whitespace-nowrap border border-accent/30">
          {cam.id}
        </div>
      </Html>
    </group>
  );
}

// ── Suspect marker ────────────────────────────────────────────────────────────
function SuspectMarker({
  position,
  label,
  color,
}: {
  position: [number, number, number];
  label: string;
  color: string;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(Date.now() * 0.003) * 0.15 + 0.8;
    }
  });

  return (
    <group position={position}>
      {/* Body cylinder */}
      <mesh castShadow>
        <cylinderGeometry args={[0.2, 0.2, 1.6, 12]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.6} />
      </mesh>
      {/* Head */}
      <mesh ref={meshRef} castShadow>
        <sphereGeometry args={[0.25]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.6} />
      </mesh>
      {/* Glow ring */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.35, 0.45, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} transparent opacity={0.7} />
      </mesh>
      {/* Label */}
      <Html position={[0, 2.2, 0]} center>
        <div
          className="text-2xs font-bold px-2 py-0.5 rounded whitespace-nowrap border"
          style={{ backgroundColor: color + '33', borderColor: color, color }}
        >
          {label}
        </div>
      </Html>
    </group>
  );
}

// ── Movement path ─────────────────────────────────────────────────────────────
function SuspectPath({ waypoints, color, progress }: { waypoints: [number,number,number][]; color: string; progress: number }) {
  const linePoints = waypoints.map(p => new THREE.Vector3(...p));

  // Interpolate current position along path
  const totalSegments = waypoints.length - 1;
  const globalT = progress * totalSegments;
  const segIdx = Math.min(Math.floor(globalT), totalSegments - 1);
  const segT = globalT - segIdx;
  const a = new THREE.Vector3(...waypoints[segIdx]);
  const b = new THREE.Vector3(...waypoints[Math.min(segIdx + 1, waypoints.length - 1)]);
  const pos = a.lerp(b, segT);

  return (
    <>
      {/* Full path */}
      <Line points={linePoints} color={color} lineWidth={1.5} dashed dashScale={2} opacity={0.4} transparent />
      {/* Travelled path */}
      {segIdx > 0 && (
        <Line
          points={[...waypoints.slice(0, segIdx + 1).map(p => new THREE.Vector3(...p)), pos]}
          color={color}
          lineWidth={3}
          opacity={0.9}
          transparent
        />
      )}
      {/* Current position marker */}
      <SuspectMarker position={[pos.x, pos.y, pos.z]} label={color === '#F59E0B' ? 'Suspect α' : 'Suspect β'} color={color} />
    </>
  );
}

// ── Floor plan ────────────────────────────────────────────────────────────────
function StationFloor() {
  return (
    <group>
      {/* Main floor */}
      <mesh receiveShadow position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 24]} />
        <meshStandardMaterial color="#0D1526" metalness={0.1} roughness={0.9} />
      </mesh>
      {/* Platform */}
      <mesh receiveShadow position={[4, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial color="#161D2F" />
      </mesh>
      {/* Walls */}
      {[
        { pos: [-15, 2, 0] as [number,number,number], rot: [0, Math.PI / 2, 0] as [number,number,number], size: [24, 4] as [number,number] },
        { pos: [15, 2, 0] as [number,number,number],  rot: [0, -Math.PI / 2, 0] as [number,number,number], size: [24, 4] as [number,number] },
        { pos: [0, 2, 12] as [number,number,number],  rot: [0, Math.PI, 0] as [number,number,number], size: [30, 4] as [number,number] },
        { pos: [0, 2, -12] as [number,number,number], rot: [0, 0, 0] as [number,number,number], size: [30, 4] as [number,number] },
      ].map((w, i) => (
        <mesh key={i} position={w.pos} rotation={w.rot}>
          <planeGeometry args={w.size} />
          <meshStandardMaterial color="#0A0F1E" side={THREE.BackSide} />
        </mesh>
      ))}
      {/* Platform pillars */}
      {[-2, 0, 2, 4, 6].map((x, i) => (
        <mesh key={i} position={[x, 1.5, -2]} castShadow>
          <cylinderGeometry args={[0.15, 0.15, 3, 8]} />
          <meshStandardMaterial color="#1E2840" metalness={0.5} roughness={0.5} />
        </mesh>
      ))}
      {/* Grid overlay */}
      <Grid
        position={[0, 0, 0]}
        args={[30, 24]}
        cellSize={2}
        cellThickness={0.3}
        cellColor="#00B4D820"
        sectionSize={6}
        sectionThickness={0.6}
        sectionColor="#00B4D840"
        fadeDistance={40}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={false}
      />
      {/* Zone labels */}
      <Text position={[-6, 0.1, 4]} rotation={[-Math.PI/2, 0, 0]} fontSize={0.5} color="#00B4D850" font="/fonts/JetBrainsMono.ttf">
        CONCOURSE
      </Text>
      <Text position={[4, 0.1, 0]} rotation={[-Math.PI/2, 0, 0]} fontSize={0.5} color="#00B4D850">
        PLATFORM 4
      </Text>
      <Text position={[-8, 0.1, 7]} rotation={[-Math.PI/2, 0, 0]} fontSize={0.4} color="#00B4D840">
        SOUTH ENTRANCE
      </Text>
    </group>
  );
}

// ── Heatmap plane ─────────────────────────────────────────────────────────────
function HeatmapPlane() {
  const texture = useMemo(() => {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    // Background
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, size, size);
    // Hotspot near platform
    const addHotspot = (cx: number, cy: number, r: number, intensity: number) => {
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, `rgba(239,68,68,${intensity})`);
      g.addColorStop(0.4, `rgba(245,158,11,${intensity * 0.5})`);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
    };
    addHotspot(180, 128, 60, 0.6);  // Platform 4 hotspot
    addHotspot(80, 100, 40, 0.3);   // Ticketing area
    addHotspot(30, 140, 30, 0.2);   // South entrance
    return new THREE.CanvasTexture(canvas);
  }, []);

  return (
    <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[30, 24]} />
      <meshBasicMaterial map={texture} transparent opacity={0.5} depthWrite={false} />
    </mesh>
  );
}

// ── Main 3D scene ─────────────────────────────────────────────────────────────
function Scene({ progress }: { progress: number }) {
  return (
    <>
      <ambientLight intensity={0.3} color="#1a2744" />
      <directionalLight position={[10, 20, 10]} intensity={0.8} color="#60a5fa" castShadow />
      <pointLight position={[4, 4, 0]} intensity={1.5} color="#F59E0B" distance={8} />
      <pointLight position={[-5, 4, 0]} intensity={0.5} color="#00B4D8" distance={12} />

      <StationFloor />
      <HeatmapPlane />

      {/* Cameras */}
      {CAMERAS.map((cam) => (
        <CameraModel key={cam.id} cam={cam} active={cam.activeSuspects > 0} />
      ))}

      {/* Suspect paths */}
      <SuspectPath waypoints={ALPHA_WAYPOINTS} color="#F59E0B" progress={progress} />
      <SuspectPath waypoints={BETA_WAYPOINTS} color="#FB923C" progress={progress} />

      <OrbitControls
        makeDefault
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2.2}
        minDistance={4}
        maxDistance={35}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
}

// ── Public component ──────────────────────────────────────────────────────────
export function SceneViewer3D({ currentTime, className }: SceneViewerProps) {
  const progress = currentTime; // 0-1 normalised timeline position

  return (
    <div className={cn('relative w-full h-full rounded-xl overflow-hidden bg-[#050911] border border-border', className ?? '')}>
      {/* Legend */}
      <div className="absolute top-3 left-3 z-10 space-y-1.5">
        {[
          { color: '#F59E0B', label: 'Suspect α' },
          { color: '#FB923C', label: 'Suspect β' },
          { color: '#00B4D8', label: 'Camera' },
          { color: '#EF4444', label: 'Dwell zone' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 text-2xs font-mono text-white/70 bg-black/50 px-2 py-0.5 rounded backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            {item.label}
          </div>
        ))}
      </div>

      {/* Badge */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 text-2xs font-mono bg-black/60 text-accent px-2 py-1 rounded border border-accent/30 backdrop-blur-sm">
        <BoxIcon className="w-3 h-3" />
        3D RECONSTRUCTION
      </div>

      {/* Instructions */}
      <div className="absolute bottom-3 left-3 z-10 text-2xs text-white/40 font-mono">
        Drag to orbit · Scroll to zoom · Right-click to pan
      </div>

      <Canvas
        shadows
        camera={{ position: [0, 18, 20], fov: 45, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: false, toneMapping: THREE.ACESFilmicToneMapping }}
        dpr={[1, 1.5]}
      >
        <color attach="background" args={['#050911']} />
        <fog attach="fog" args={['#050911', 30, 60]} />
        <Suspense fallback={null}>
          <Scene progress={progress} />
        </Suspense>
      </Canvas>
    </div>
  );
}

function cn(...c: (string | undefined | false)[]) {
  return c.filter(Boolean).join(' ');
}
