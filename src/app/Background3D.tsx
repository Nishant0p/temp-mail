'use client';

import { useRef } from 'react';
import { useFrame, Canvas } from '@react-three/fiber';
import { Icosahedron } from '@react-three/drei';

function AnimatedCrystal() {
  const crystalRef = useRef<any>(null);
  
  useFrame((state) => {
    if (crystalRef.current) {
      crystalRef.current.rotation.x = state.clock.elapsedTime * 0.1;
      crystalRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  return (
    <Icosahedron ref={crystalRef} args={[1, 0]} scale={2.5}>
      <meshPhysicalMaterial 
        color="#818cf8"
        emissive="#4c1d95"
        emissiveIntensity={0.2}
        roughness={0.1}
        metalness={0.8}
        clearcoat={1}
        clearcoatRoughness={0.1}
        wireframe={true}
      />
    </Icosahedron>
  );
}

export default function Background3D() {
  return (
    <div className="fixed inset-0 -z-10 bg-slate-950 overflow-hidden flex items-center justify-center opacity-40">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950"></div>
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={1} />
        <directionalLight position={[10, 10, 5]} intensity={2} color="#818cf8" />
        <directionalLight position={[-10, -10, -5]} intensity={1} color="#c084fc" />
        <AnimatedCrystal />
      </Canvas>
    </div>
  );
}
