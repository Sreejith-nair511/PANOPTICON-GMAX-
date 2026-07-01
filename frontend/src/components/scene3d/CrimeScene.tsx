"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import Room from "./Room";
import EvidenceMarker from "./EvidenceMarker";
import { Grid } from "@react-three/drei";
export default function CrimeScene() {
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden bg-black">
      <Canvas
        shadows
        camera={{
          position: [8, 5, 8],
          fov: 50,
        }}
      >
        <ambientLight intensity={1.2} />

        <directionalLight position={[5, 10, 5]} intensity={1.8} castShadow />

        <pointLight position={[0, 4, 0]} intensity={0.8} color="#88ccff" />

        <Room />

        <EvidenceMarker
          id="knife"
          label="Knife"
          position={[0, 0.25, 0]}
          onSelect={setSelectedEvidence}
        />

        <EvidenceMarker
          id="phone"
          label="Phone"
          position={[3, 0.25, 2]}
          onSelect={setSelectedEvidence}
        />

        <EvidenceMarker
          id="backpack"
          label="Backpack"
          position={[-2, 0.25, -4]}
          onSelect={setSelectedEvidence}
        />

        <OrbitControls
          minDistance={6}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2.1}
        />
        <Grid
          position={[0, 0.01, 0]}
          args={[20, 20]}
          cellSize={1}
          cellThickness={0.5}
          sectionSize={5}
          sectionThickness={1}
          fadeDistance={30}
          fadeStrength={1}
        />
      </Canvas>

      {selectedEvidence && (
        <div className="absolute top-4 right-4 bg-black/90 border border-slate-700 rounded-lg p-4 w-64 text-sm text-white">
          <h3 className="font-bold mb-2">Evidence Selected</h3>

          <p>
            <span className="text-slate-400">ID:</span> {selectedEvidence}
          </p>

          <p className="mt-2 text-slate-400">Metadata panel placeholder.</p>
        </div>
      )}
    </div>
  );
}
