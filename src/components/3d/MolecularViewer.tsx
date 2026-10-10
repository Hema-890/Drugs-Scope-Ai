import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PdbAtom, PdbParsedModel } from '../../services/rcsbPdbApi';
import { Camera, Eye, Info, Maximize2, RefreshCw, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';

interface MolecularViewerProps {
  model: PdbParsedModel;
  title?: string;
  resolution?: number;
  method?: string;
  onAtomSelect?: (atom: PdbAtom | null) => void;
}

export type RepresentationMode = 'ball-and-stick' | 'space-filling' | 'backbone-ribbon' | 'ligand-focus';

export const MolecularViewer: React.FC<MolecularViewerProps> = ({
  model,
  title,
  resolution,
  method,
  onAtomSelect
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [repMode, setRepMode] = useState<RepresentationMode>('ball-and-stick');
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [hoveredAtom, setHoveredAtom] = useState<PdbAtom | null>(null);
  const [selectedAtom, setSelectedAtom] = useState<PdbAtom | null>(null);
  const [atomCount, setAtomCount] = useState<number>(0);

  // Three.js instances stored in refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const moleculeGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Mouse interaction state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  // Element CPK Color Map
  const getElementColor = (element: string, isHetatm: boolean): number => {
    if (isHetatm) return 0x9079F7; // Highlight ligands in accent violet
    switch (element.toUpperCase()) {
      case 'C': return 0x37D6E6; // Carbon -> Cyan
      case 'O': return 0xF16D76; // Oxygen -> Red
      case 'N': return 0x4D96FF; // Nitrogen -> Blue
      case 'S': return 0xEFB85A; // Sulfur -> Amber
      case 'P': return 0xFF9F45; // Phosphorus -> Orange
      case 'ZN':
      case 'FE': return 0x32C8B7; // Metals -> Medical Teal
      default: return 0xA7B5C9;
    }
  };

  // Re-build 3D Molecular Scene
  const buildMolecularGeometry = () => {
    if (!moleculeGroupRef.current) return;
    const group = moleculeGroupRef.current;

    // Dispose old children
    while (group.children.length > 0) {
      const child = group.children[0] as THREE.Mesh;
      if (child.geometry) child.geometry.dispose();
      if (Array.isArray(child.material)) {
        child.material.forEach((m) => m.dispose());
      } else if (child.material) {
        child.material.dispose();
      }
      group.remove(child);
    }

    const atoms = model.atoms;
    setAtomCount(atoms.length);
    if (!atoms || atoms.length === 0) return;

    const [cx, cy, cz] = model.center;

    if (repMode === 'space-filling') {
      // Space-filling (Van der Waals spheres)
      const sphereGeo = new THREE.SphereGeometry(1.2, 16, 16);
      atoms.forEach((atom) => {
        const mat = new THREE.MeshStandardMaterial({
          color: getElementColor(atom.element, atom.isHetatm),
          roughness: 0.3,
          metalness: 0.1
        });
        const mesh = new THREE.Mesh(sphereGeo, mat);
        mesh.position.set(atom.x - cx, atom.y - cy, atom.z - cz);
        mesh.userData = { atom };
        group.add(mesh);
      });
    } else if (repMode === 'ball-and-stick' || repMode === 'ligand-focus') {
      // Ball and stick
      const sphereGeo = new THREE.SphereGeometry(0.5, 14, 14);
      const hetatmGeo = new THREE.SphereGeometry(0.85, 18, 18);

      atoms.forEach((atom) => {
        // In ligand focus, dim non-ligand atoms
        const isFocus = repMode === 'ligand-focus';
        const isHet = atom.isHetatm;
        const radius = isHet ? 0.85 : 0.45;
        const color = getElementColor(atom.element, isHet);

        const mat = new THREE.MeshStandardMaterial({
          color,
          roughness: isHet ? 0.2 : 0.4,
          metalness: isHet ? 0.3 : 0.1,
          opacity: isFocus && !isHet ? 0.35 : 1.0,
          transparent: isFocus && !isHet
        });

        const mesh = new THREE.Mesh(isHet ? hetatmGeo : sphereGeo, mat);
        mesh.position.set(atom.x - cx, atom.y - cy, atom.z - cz);
        mesh.userData = { atom };
        group.add(mesh);
      });

      // Connect consecutive backbone atoms with cylindrical bonds
      const bondMat = new THREE.MeshStandardMaterial({
        color: 0x475569,
        roughness: 0.5,
        transparent: repMode === 'ligand-focus',
        opacity: repMode === 'ligand-focus' ? 0.25 : 0.8
      });

      for (let i = 0; i < atoms.length - 1; i++) {
        const a1 = atoms[i];
        const a2 = atoms[i + 1];
        if (a1.chainID === a2.chainID) {
          const dx = a2.x - a1.x;
          const dy = a2.y - a1.y;
          const dz = a2.z - a1.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          // Standard covalent bond distance threshold (< 2.0 Angstroms)
          if (dist > 0.8 && dist < 2.2) {
            const bondGeo = new THREE.CylinderGeometry(0.12, 0.12, dist, 8);
            const bondMesh = new THREE.Mesh(bondGeo, bondMat);

            // Position and orient cylinder between atoms
            bondMesh.position.set((a1.x + a2.x) / 2 - cx, (a1.y + a2.y) / 2 - cy, (a1.z + a2.z) / 2 - cz);
            const axis = new THREE.Vector3(dx, dy, dz).normalize();
            const up = new THREE.Vector3(0, 1, 0);
            const quaternion = new THREE.Quaternion().setFromUnitVectors(up, axis);
            bondMesh.setRotationFromQuaternion(quaternion);
            group.add(bondMesh);
          }
        }
      }
    } else if (repMode === 'backbone-ribbon') {
      // Backbone ribbon curve
      const caAtoms = atoms.filter((a) => a.name === 'CA');
      if (caAtoms.length > 2) {
        const points = caAtoms.map((a) => new THREE.Vector3(a.x - cx, a.y - cy, a.z - cz));
        const curve = new THREE.CatmullRomCurve3(points);
        const tubeGeo = new THREE.TubeGeometry(curve, caAtoms.length * 3, 0.45, 8, false);
        const tubeMat = new THREE.MeshStandardMaterial({
          color: 0x37D6E6,
          roughness: 0.25,
          metalness: 0.3
        });
        const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
        group.add(tubeMesh);

        // Add ligand atoms on top
        const hetAtoms = atoms.filter((a) => a.isHetatm);
        const hetGeo = new THREE.SphereGeometry(0.8, 16, 16);
        hetAtoms.forEach((atom) => {
          const mat = new THREE.MeshStandardMaterial({
            color: 0x9079F7,
            roughness: 0.2,
            metalness: 0.4
          });
          const mesh = new THREE.Mesh(hetGeo, mat);
          mesh.position.set(atom.x - cx, atom.y - cy, atom.z - cz);
          mesh.userData = { atom };
          group.add(mesh);
        });
      }
    }
  };

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 600;
    const height = containerRef.current.clientHeight || 450;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070B14);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 55);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true // for screenshots
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x37D6E6, 1.2);
    dirLight1.position.set(20, 30, 40);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x9079F7, 0.8);
    dirLight2.position.set(-20, -20, -20);
    scene.add(dirLight2);

    // 5. Molecule Container Group
    const molGroup = new THREE.Group();
    scene.add(molGroup);
    moleculeGroupRef.current = molGroup;

    // 6. Animation loop
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      if (autoRotate && moleculeGroupRef.current) {
        moleculeGroupRef.current.rotation.y += 0.004;
      }

      renderer.render(scene, camera);
    };
    animate();

    // 7. Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newWidth, newHeight);
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, []);

  // Update geometry whenever model or representation changes
  useEffect(() => {
    buildMolecularGeometry();
  }, [model, repMode]);

  // Mouse Interaction handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current || !cameraRef.current || !sceneRef.current) return;

    // Raycast atom hover
    const rect = canvasRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);
    if (moleculeGroupRef.current) {
      const intersects = raycaster.intersectObjects(moleculeGroupRef.current.children);
      const hit = intersects.find((i) => i.object.userData?.atom);
      if (hit) {
        setHoveredAtom(hit.object.userData.atom);
      } else {
        setHoveredAtom(null);
      }
    }

    // Drag rotate
    if (isDraggingRef.current && moleculeGroupRef.current) {
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      moleculeGroupRef.current.rotation.y += deltaX * 0.008;
      moleculeGroupRef.current.rotation.x += deltaY * 0.008;

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleClick = () => {
    if (hoveredAtom) {
      setSelectedAtom(hoveredAtom);
      if (onAtomSelect) onAtomSelect(hoveredAtom);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!cameraRef.current) return;
    cameraRef.current.position.z += e.deltaY * 0.05;
    cameraRef.current.position.z = Math.max(15, Math.min(120, cameraRef.current.position.z));
  };

  const resetCamera = () => {
    if (cameraRef.current && moleculeGroupRef.current) {
      cameraRef.current.position.set(0, 0, 55);
      moleculeGroupRef.current.rotation.set(0, 0, 0);
    }
  };

  const captureScreenshot = () => {
    if (!rendererRef.current) return;
    const dataUrl = rendererRef.current.domElement.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `PDB_${model.pdbId}_DrugScope_3D.png`;
    a.click();
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[540px] rounded-xl overflow-hidden bg-[#070B14] border border-white/10 select-none shadow-2xl"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleClick}
      onWheel={handleWheel}
    >
      <canvas ref={canvasRef} className="w-full h-full cursor-grab active:cursor-grabbing block" />

      {/* Top Header Information Overlay */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3 bg-[#101827]/85 backdrop-blur-md px-4 py-2.5 rounded-lg border border-white/10">
        <div className="w-2.5 h-2.5 rounded-full bg-[#37D6E6] animate-pulse" />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#37D6E6] bg-[#37D6E6]/10 px-2 py-0.5 rounded">
              PDB: {model.pdbId}
            </span>
            <span className="text-xs text-[#A7B5C9] font-medium">{method || 'X-RAY'}</span>
            {resolution && (
              <span className="text-xs text-[#32C8B7] font-mono">{resolution} Å</span>
            )}
          </div>
          <div className="text-xs font-semibold text-[#F4F7FB] truncate max-w-[340px] mt-0.5">
            {title || `Macromolecular Complex ${model.pdbId}`}
          </div>
        </div>
      </div>

      {/* Top-Right Viewer Toolbar */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 bg-[#101827]/85 backdrop-blur-md p-1.5 rounded-lg border border-white/10">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          title="Toggle Auto Rotation"
          className={`p-2 rounded hover:bg-white/10 transition-colors ${
            autoRotate ? 'text-[#37D6E6]' : 'text-[#A7B5C9]'
          }`}
        >
          <RotateCw className="w-4 h-4" />
        </button>
        <button
          onClick={resetCamera}
          title="Reset Camera Orientation"
          className="p-2 rounded text-[#A7B5C9] hover:text-white hover:bg-white/10 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
        <button
          onClick={captureScreenshot}
          title="Export High-Res 3D Figure"
          className="p-2 rounded text-[#A7B5C9] hover:text-[#32C8B7] hover:bg-white/10 transition-colors"
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>

      {/* Representation Mode Selector Dock */}
      <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1 bg-[#101827]/90 backdrop-blur-md p-1.5 rounded-lg border border-white/10 text-xs">
        <button
          onClick={() => setRepMode('ball-and-stick')}
          className={`px-3 py-1.5 rounded font-medium transition-all ${
            repMode === 'ball-and-stick'
              ? 'bg-[#37D6E6] text-[#070B14] font-semibold'
              : 'text-[#A7B5C9] hover:text-white hover:bg-white/5'
          }`}
        >
          Ball & Stick
        </button>
        <button
          onClick={() => setRepMode('space-filling')}
          className={`px-3 py-1.5 rounded font-medium transition-all ${
            repMode === 'space-filling'
              ? 'bg-[#37D6E6] text-[#070B14] font-semibold'
              : 'text-[#A7B5C9] hover:text-white hover:bg-white/5'
          }`}
        >
          Space Filling
        </button>
        <button
          onClick={() => setRepMode('backbone-ribbon')}
          className={`px-3 py-1.5 rounded font-medium transition-all ${
            repMode === 'backbone-ribbon'
              ? 'bg-[#37D6E6] text-[#070B14] font-semibold'
              : 'text-[#A7B5C9] hover:text-white hover:bg-white/5'
          }`}
        >
          Ribbon
        </button>
        <button
          onClick={() => setRepMode('ligand-focus')}
          className={`px-3 py-1.5 rounded font-medium transition-all ${
            repMode === 'ligand-focus'
              ? 'bg-[#9079F7] text-white font-semibold'
              : 'text-[#A7B5C9] hover:text-white hover:bg-white/5'
          }`}
        >
          Ligand Focus
        </button>
      </div>

      {/* Selected or Hovered Atom Inspector Card */}
      {(hoveredAtom || selectedAtom) && (
        <div className="absolute bottom-4 right-4 z-10 bg-[#101827]/90 backdrop-blur-md px-3.5 py-2.5 rounded-lg border border-[#37D6E6]/30 text-xs font-mono shadow-xl pointer-events-none">
          <div className="text-[#37D6E6] font-bold flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" />
            {(hoveredAtom || selectedAtom)?.isHetatm ? 'LIGAND ATOM' : 'PROTEIN RESIDUE'}
          </div>
          <div className="text-white mt-1">
            Residue: <span className="text-[#9079F7]">{(hoveredAtom || selectedAtom)?.resName}</span> #{(hoveredAtom || selectedAtom)?.resSeq} | Chain {(hoveredAtom || selectedAtom)?.chainID}
          </div>
          <div className="text-[#A7B5C9] mt-0.5">
            Atom: {(hoveredAtom || selectedAtom)?.name} ({(hoveredAtom || selectedAtom)?.element}) | Serial: {(hoveredAtom || selectedAtom)?.serial}
          </div>
          <div className="text-[10px] text-[#32C8B7] mt-0.5">
            Coords: [{(hoveredAtom || selectedAtom)?.x.toFixed(1)}, {(hoveredAtom || selectedAtom)?.y.toFixed(1)}, {(hoveredAtom || selectedAtom)?.z.toFixed(1)}] Å
          </div>
        </div>
      )}

      {/* Floating Instructions */}
      <div className="absolute bottom-16 right-4 text-[10px] text-white/40 font-mono pointer-events-none hidden md:block">
        Left Drag: Rotate • Scroll: Zoom • Click: Inspect Atom
      </div>
    </div>
  );
};
