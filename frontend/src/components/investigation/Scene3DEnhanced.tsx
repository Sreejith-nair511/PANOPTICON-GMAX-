'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Download, Eye, EyeOff, Settings2, Maximize2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Evidence3D {
  id: string;
  position: [number, number, number];
  type: 'marker' | 'suspect' | 'weapon' | 'evidence';
  label: string;
  color?: string;
  confidence?: number;
  timestamp?: string;
}

interface Scene3DEnhancedProps {
  evidenceMarkers?: Evidence3D[];
  cameraCount?: number;
  onMarkerSelect?: (marker: Evidence3D) => void;
  showGrid?: boolean;
  showLights?: boolean;
  autoRotate?: boolean;
}

export function Scene3DEnhanced({
  evidenceMarkers = [],
  cameraCount = 2,
  onMarkerSelect,
  showGrid = true,
  showLights = true,
  autoRotate = true,
}: Scene3DEnhancedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const markersRef = useRef<Map<string, THREE.Object3D>>(new Map());
  const [stats, setStats] = useState({ fps: 0, triangles: 0 });
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x03050d);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 5, 15);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    if (showLights) {
      // Ambient light
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      // Directional light (sun)
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
      dirLight.position.set(10, 15, 10);
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.width = 2048;
      dirLight.shadow.mapSize.height = 2048;
      scene.add(dirLight);

      // Point lights for scene ambiance
      const pointLight1 = new THREE.PointLight(0x00b4d8, 0.3, 20);
      pointLight1.position.set(-8, 4, -8);
      scene.add(pointLight1);

      const pointLight2 = new THREE.PointLight(0xff6b9d, 0.2, 15);
      pointLight2.position.set(8, 3, -8);
      scene.add(pointLight2);
    }

    // Grid
    if (showGrid) {
      const gridHelper = new THREE.GridHelper(20, 20, 0x00b4d8, 0x444444);
      (gridHelper.material as THREE.LineBasicMaterial).opacity = 0.15;
      (gridHelper.material as THREE.LineBasicMaterial).transparent = true;
      scene.add(gridHelper);
    }

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(30, 30);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a2332,
      metalness: 0.1,
      roughness: 0.8,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Add camera indicators
    for (let i = 0; i < cameraCount; i++) {
      const angle = (i / cameraCount) * Math.PI * 2;
      const cameraHelper = createCameraMarker(angle);
      scene.add(cameraHelper);
    }

    // Add evidence markers
    const addMarker = (evidence: Evidence3D) => {
      if (markersRef.current.has(evidence.id)) {
        markersRef.current.delete(evidence.id);
      }

      const marker = createEvidenceMarker(evidence);
      marker.userData = evidence;
      scene.add(marker);
      markersRef.current.set(evidence.id, marker);

      // Add click handler
      marker.userData.clickable = true;
      marker.userData.onSelect = () => onMarkerSelect?.(evidence);
    };

    evidenceMarkers.forEach(addMarker);

    // Raycaster for picking
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseClick = (event: MouseEvent) => {
      if (!rendererRef.current) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(Array.from(markersRef.current.values()));

      if (intersects.length > 0) {
        let obj: any = intersects[0].object;
        while (obj.parent) {
          if (obj.userData.onSelect) {
            obj.userData.onSelect();
            break;
          }
          obj = obj.parent;
        }
      }
    };

    renderer.domElement.addEventListener('click', onMouseClick);

    // Animation loop
    let frameCount = 0;
    let lastTime = performance.now();
    let lastFpsTime = performance.now();

    const animate = () => {
      requestAnimationFrame(animate);

      // Auto-rotate
      if (autoRotate && sceneRef.current) {
        sceneRef.current.rotation.y += 0.0005;
      }

      // Update marker animations
      markersRef.current.forEach((marker) => {
        const mesh = marker.children[0];
        if (mesh instanceof THREE.Mesh) {
          if (marker.userData.type === 'suspect') {
            // Suspect: gentle breathing animation (scale)
            mesh.scale.y = 1 + Math.sin(Date.now() * 0.004) * 0.08;
          } else if (marker.userData.type === 'weapon') {
            // Weapon: rotation + pulsing glow
            mesh.rotation.z += 0.01;
            mesh.scale.set(1 + Math.sin(Date.now() * 0.005) * 0.1, 1, 1);
          } else if (marker.userData.type === 'evidence') {
            // Evidence: gentle rotation
            mesh.rotation.y += 0.01;
          } else if (marker.userData.type === 'marker') {
            // Marker: spinning
            mesh.rotation.x += 0.02;
            mesh.rotation.y += 0.02;
          }
        }
      });

      // FPS counter
      frameCount++;
      const now = performance.now();
      if (now >= lastFpsTime + 1000) {
        setStats({
          fps: frameCount,
          triangles: renderer.info.render.triangles,
        });
        frameCount = 0;
        lastFpsTime = now;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', onMouseClick);
      if (containerRef.current && renderer.domElement.parentNode === containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [cameraCount, showGrid, showLights, autoRotate, evidenceMarkers, onMarkerSelect]);

  const handleDownloadScene = () => {
    if (!rendererRef.current) return;
    const link = document.createElement('a');
    link.href = rendererRef.current.domElement.toDataURL('image/png');
    link.download = `crime-scene-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="relative w-full h-full bg-var(--bg-base) rounded-lg overflow-hidden border border-var(--border)">
      <div ref={containerRef} className="w-full h-full" />

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-4 right-4 flex gap-2 z-10"
      >
        <button
          onClick={handleDownloadScene}
          className="px-3 py-2 rounded-lg bg-var(--accent)/10 border border-var(--accent)/25 text-var(--accent) hover:bg-var(--accent)/20 transition-colors flex items-center gap-2 text-sm"
        >
          <Download className="w-4 h-4" /> Screenshot
        </button>

        <button
          onClick={() => setShowDebug(!showDebug)}
          className="px-3 py-2 rounded-lg bg-var(--warning)/10 border border-var(--warning)/25 text-var(--warning) hover:bg-var(--warning)/20 transition-colors text-sm"
        >
          {showDebug ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
      </motion.div>

      {/* Stats Debug Panel */}
      {showDebug && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="absolute bottom-4 left-4 p-3 rounded-lg bg-var(--bg-overlay) border border-var(--accent)/25 text-var(--text-secondary) text-xs font-mono space-y-1 z-10"
        >
          <div>FPS: <span className="text-var(--accent)">{stats.fps}</span></div>
          <div>Triangles: <span className="text-var(--accent)">{stats.triangles}</span></div>
          <div>Markers: <span className="text-var(--accent)">{evidenceMarkers.length}</span></div>
        </motion.div>
      )}
    </div>
  );
}

function createCameraMarker(angle: number): THREE.Object3D {
  const group = new THREE.Group();

  // Camera frustum visualization
  const geometry = new THREE.ConeGeometry(1, 3, 8);
  const material = new THREE.MeshBasicMaterial({
    color: 0x00b4d8,
    transparent: true,
    opacity: 0.3,
    wireframe: false,
  });
  const cone = new THREE.Mesh(geometry, material);
  cone.rotation.z = Math.PI / 2;

  const radius = 12;
  group.position.set(Math.cos(angle) * radius, 4, Math.sin(angle) * radius);
  group.add(cone);

  // Camera indicator light
  const light = new THREE.PointLight(0x00b4d8, 0.5, 15);
  group.add(light);

  return group;
}

function createEvidenceMarker(evidence: Evidence3D): THREE.Object3D {
  const group = new THREE.Group();

  const typeConfig: Record<string, { color: string }> = {
    marker: { color: '#00b4d8' },
    suspect: { color: '#f97316' },
    weapon: { color: '#ef4444' },
    evidence: { color: '#22c55e' },
  };

  const config = typeConfig[evidence.type] || typeConfig.marker;

  // Create SIMPLE geometry based on type
  let geometry: THREE.BufferGeometry;
  
  if (evidence.type === 'suspect') {
    // Simple flat square for suspects
    geometry = new THREE.PlaneGeometry(0.5, 0.8);
  } else if (evidence.type === 'weapon') {
    // Thin rectangle for weapons
    geometry = new THREE.PlaneGeometry(0.3, 0.6);
  } else if (evidence.type === 'evidence') {
    // Cube for evidence
    geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  } else {
    // Star for markers
    geometry = createStarGeometry(0.6, 8);
  }

  const material = new THREE.MeshStandardMaterial({
    color: evidence.color || config.color,
    metalness: 0.6,
    roughness: 0.2,
    emissive: new THREE.Color(evidence.color || config.color),
    emissiveIntensity: 0.3,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData = evidence;

  group.position.set(...evidence.position);
  group.add(mesh);

  // Label
  const labelCanvas = document.createElement('canvas');
  labelCanvas.width = 256;
  labelCanvas.height = 64;
  const ctx = labelCanvas.getContext('2d')!;
  ctx.fillStyle = evidence.color || config.color;
  ctx.font = 'bold 24px Arial';
  ctx.fillText(evidence.label, 10, 40);
  if (evidence.confidence) {
    ctx.font = '14px Arial';
    ctx.fillText(`${Math.round(evidence.confidence * 100)}%`, 10, 60);
  }

  const texture = new THREE.CanvasTexture(labelCanvas);
  const spriteGeometry = new THREE.PlaneGeometry(2, 0.5);
  const spriteMaterial = new THREE.MeshBasicMaterial({ map: texture, transparent: true });
  const label = new THREE.Mesh(spriteGeometry, spriteMaterial);
  label.position.y = 1.2;
  group.add(label);

  return group;
}

// Create star/spike geometry for markers
function createStarGeometry(size: number, points: number): THREE.BufferGeometry {
  const geometry = new THREE.OctahedronGeometry(size, 1);

  // Create vertices for a star shape
  const positionAttribute = geometry.getAttribute('position');
  const positions = positionAttribute.array as Float32Array;

  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];
    const dist = Math.sqrt(x * x + y * y + z * z);

    // Alternate between inner and outer points
    const scale = (i / 3) % 2 === 0 ? 1.2 : 0.6;
    positions[i] = (x / dist) * size * scale;
    positions[i + 1] = (y / dist) * size * scale;
    positions[i + 2] = (z / dist) * size * scale;
  }

  positionAttribute.needsUpdate = true;
  geometry.computeVertexNormals();

  return geometry;
}
