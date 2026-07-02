"use client";

export default function Room() {
  return (
    <>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, 2.5, -15]}>
        <boxGeometry args={[30, 5, 0.2]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-15, 2.5, 0]}>
        <boxGeometry args={[0.2, 5, 20]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      {/* Right Wall */}
      <mesh position={[15, 2.5, 0]}>
        <boxGeometry args={[0.2, 5, 20]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 5, 0]}>
        <boxGeometry args={[20, 0.2, 20]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>
    </>
  );
}
