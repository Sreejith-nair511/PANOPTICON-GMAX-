"use client";

import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

interface Props {
  id: string;
  label: string;
  position: [number, number, number];
  onSelect?: (id: string) => void;
}

export default function EvidenceMarker({
  id,
  label,
  position,
  onSelect,
}: Props) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;

    const scale = 1 + Math.sin(clock.elapsedTime * 2) * 0.1;
    ref.current.scale.set(scale, scale, scale);
  });

  return (
    <>
      <mesh
        ref={ref}
        position={position}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(id);
        }}
      >
        <cylinderGeometry args={[0.35, 0.35, 0.08, 6]} />
        <meshStandardMaterial
          color="#FFD60A"
          emissive="#ffcc00"
          emissiveIntensity={0.5}
        />

        <Html distanceFactor={8}>
          <div className="px-2 py-1 rounded bg-black/80 text-white text-xs border border-red-500/40 whitespace-nowrap">
            {label}
          </div>
        </Html>
      </mesh>

      <pointLight position={position} color="#FFD60A" intensity={2} distance={3} />
    </>
  );
}
