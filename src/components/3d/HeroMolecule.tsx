import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Boxes,
  ExternalLink,
  Eye,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles
} from 'lucide-react';

interface HeroMoleculeProps {
  onOpenLab?: () => void;
}

export const HeroMolecule: React.FC<HeroMoleculeProps> = ({ onOpenLab }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [repMode, setRepMode] = useState<'cartoon' | 'surface' | 'ball-and-stick' | 'space-fill'>('cartoon');
  const [showInteractions, setShowInteractions] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const proteinGroupRef = useRef<THREE.Group | null>(null);
  const ligandGroupRef = useRef<THREE.Group | null>(null);
  const interactionGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Mouse interaction
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 600;
    const height = containerRef.current.clientHeight || 480;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 32);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    // Ambient and Directional Lights for metallic/iridescent sheen
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const cyanLight = new THREE.DirectionalLight(0x24D8ED, 2.5);
    cyanLight.position.set(20, 25, 20);
    scene.add(cyanLight);

    const violetLight = new THREE.DirectionalLight(0x9475FF, 2.2);
    violetLight.position.set(-20, -20, 15);
    scene.add(violetLight);

    const blueLight = new THREE.PointLight(0x1E90FF, 3, 50);
    blueLight.position.set(0, 10, -10);
    scene.add(blueLight);

    // Root Molecule Container
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);

    // 1. Protein Ribbon Alpha-Helix Backbone (Vivid Cyan & Violet Ribbon)
    const proteinGroup = new THREE.Group();
    rootGroup.add(proteinGroup);
    proteinGroupRef.current = proteinGroup;

    // Generate helical protein ribbon curve
    const helixPoints1: THREE.Vector3[] = [];
    const helixPoints2: THREE.Vector3[] = [];
    const turns = 4.5;
    const pointsCount = 180;
    const r1 = 9.5;
    const h1 = 22;

    for (let i = 0; i <= pointsCount; i++) {
      const t = (i / pointsCount) * Math.PI * 2 * turns;
      const x = Math.cos(t) * r1;
      const y = (i / pointsCount) * h1 - h1 / 2;
      const z = Math.sin(t) * (r1 * 0.7);
      helixPoints1.push(new THREE.Vector3(x, y, z));
    }

    for (let i = 0; i <= pointsCount; i++) {
      const t = (i / pointsCount) * Math.PI * 2 * (turns * 0.8) + 1.2;
      const x = Math.sin(t) * (r1 * 0.9) - 2;
      const y = (i / pointsCount) * (h1 * 0.9) - (h1 * 0.9) / 2;
      const z = Math.cos(t) * (r1 * 0.6) + 3;
      helixPoints2.push(new THREE.Vector3(x, y, z));
    }

    const curve1 = new THREE.CatmullRomCurve3(helixPoints1);
    const tubeGeo1 = new THREE.TubeGeometry(curve1, 140, 0.75, 12, false);
    const ribbonMat1 = new THREE.MeshStandardMaterial({
      color: 0x24D8ED,
      roughness: 0.15,
      metalness: 0.4,
      emissive: 0x0A4D5C,
      emissiveIntensity: 0.3
    });
    const ribbonMesh1 = new THREE.Mesh(tubeGeo1, ribbonMat1);
    proteinGroup.add(ribbonMesh1);

    const curve2 = new THREE.CatmullRomCurve3(helixPoints2);
    const tubeGeo2 = new THREE.TubeGeometry(curve2, 120, 0.7, 12, false);
    const ribbonMat2 = new THREE.MeshStandardMaterial({
      color: 0x9475FF,
      roughness: 0.2,
      metalness: 0.35,
      emissive: 0x2C1B5E,
      emissiveIntensity: 0.3
    });
    const ribbonMesh2 = new THREE.Mesh(tubeGeo2, ribbonMat2);
    proteinGroup.add(ribbonMesh2);

    // 2. Bound Ligand (Nirmatrelvir / Paxlovid Core in Ball-and-Stick)
    const ligandGroup = new THREE.Group();
    rootGroup.add(ligandGroup);
    ligandGroupRef.current = ligandGroup;

    const atomSphereGeo = new THREE.SphereGeometry(0.5, 16, 16);
    const atomMaterials = {
      C: new THREE.MeshStandardMaterial({ color: 0x24D8ED, roughness: 0.2, metalness: 0.3 }), // Cyan
      O: new THREE.MeshStandardMaterial({ color: 0xF16D7B, roughness: 0.2, metalness: 0.1 }), // Red
      N: new THREE.MeshStandardMaterial({ color: 0x4D96FF, roughness: 0.2, metalness: 0.2 }), // Blue
      H: new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.3, metalness: 0.1 })  // White
    };

    const ligandAtoms: { pos: [number, number, number]; elem: 'C' | 'O' | 'N' | 'H' }[] = [
      { pos: [0, 0, 1], elem: 'C' },
      { pos: [1.2, 0.8, 1.2], elem: 'C' },
      { pos: [2.2, 0.2, 0.8], elem: 'N' },
      { pos: [1.8, -1.1, 0.2], elem: 'C' },
      { pos: [0.5, -1.3, 0.3], elem: 'C' },
      { pos: [-0.6, 1.1, 1.5], elem: 'O' },
      { pos: [-1.2, -0.4, 0.5], elem: 'N' },
      { pos: [-2.4, 0.2, 0.3], elem: 'C' },
      { pos: [-2.6, 1.4, 0.8], elem: 'O' },
      { pos: [3.4, 0.8, 1.1], elem: 'C' },
      { pos: [4.2, 0.2, 0.4], elem: 'O' },
      { pos: [0.8, 1.9, 1.8], elem: 'H' },
      { pos: [1.4, -2.1, -0.4], elem: 'O' }
    ];

    ligandAtoms.forEach((atom) => {
      const mesh = new THREE.Mesh(atomSphereGeo, atomMaterials[atom.elem]);
      mesh.position.set(...atom.pos);
      ligandGroup.add(mesh);
    });

    // Covalent bonds for ligand
    const bondMat = new THREE.MeshStandardMaterial({ color: 0x64748B, roughness: 0.4 });
    for (let i = 0; i < ligandAtoms.length; i++) {
      for (let j = i + 1; j < ligandAtoms.length; j++) {
        const p1 = new THREE.Vector3(...ligandAtoms[i].pos);
        const p2 = new THREE.Vector3(...ligandAtoms[j].pos);
        const dist = p1.distanceTo(p2);

        if (dist > 0.8 && dist < 1.9) {
          const cylinderGeo = new THREE.CylinderGeometry(0.12, 0.12, dist, 8);
          const bondMesh = new THREE.Mesh(cylinderGeo, bondMat);
          bondMesh.position.copy(p1.clone().add(p2).multiplyScalar(0.5));
          const axis = p2.clone().sub(p1).normalize();
          const up = new THREE.Vector3(0, 1, 0);
          bondMesh.setRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(up, axis));
          ligandGroup.add(bondMesh);
        }
      }
    }

    // 3. Hydrogen Bond / Non-covalent interaction lines (matching "Hydrogen bond 2.8 Å" callout)
    const interactionGroup = new THREE.Group();
    rootGroup.add(interactionGroup);
    interactionGroupRef.current = interactionGroup;

    const dashMat = new THREE.LineDashedMaterial({
      color: 0x31CAB6,
      linewidth: 2,
      scale: 1,
      dashSize: 0.3,
      gapSize: 0.2
    });

    const hBondLineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(2.2, 0.2, 0.8), // Ligand Nitrogen
      new THREE.Vector3(4.5, -0.8, 2.5) // Active site residue oxygen
    ]);
    const hBondLine = new THREE.Line(hBondLineGeo, dashMat);
    hBondLine.computeLineDistances();
    interactionGroup.add(hBondLine);

    // Residue target atom
    const residueAtom = new THREE.Mesh(
      new THREE.SphereGeometry(0.55, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0xF16D7B, roughness: 0.2 })
    );
    residueAtom.position.set(4.5, -0.8, 2.5);
    interactionGroup.add(residueAtom);

    // Animation Loop
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      if (autoRotate && rootGroup) {
        rootGroup.rotation.y += 0.0035;
        rootGroup.rotation.x = Math.sin(Date.now() * 0.0008) * 0.1;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize handling
    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const newW = containerRef.current.clientWidth;
      const newH = containerRef.current.clientHeight;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, []);

  // Mouse drag rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !proteinGroupRef.current?.parent) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    proteinGroupRef.current.parent.rotation.y += deltaX * 0.008;
    proteinGroupRef.current.parent.rotation.x += deltaY * 0.008;

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[540px] rounded-2xl overflow-hidden bg-[#070B14] select-none group border border-white/[0.08]"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

      {/* Top Floating HUD Card (Matching Reference Image 1) */}
      <div className="absolute top-5 left-5 z-20 p-4 rounded-2xl bg-[#0D1526]/85 backdrop-blur-xl border border-white/10 shadow-2xl max-w-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#9475FF]" />
            <span className="text-xs font-display font-bold text-white">Paxlovid (Nirmatrelvir)</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-[#71839E] hover:text-[#24D8ED] cursor-pointer" />
        </div>

        <div className="text-[11px] text-[#A6B5CB] font-mono">
          SARS-CoV-2 Mpro inhibitor
        </div>

        <div className="space-y-1 text-[10px] text-[#A6B5CB] font-mono pt-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#9475FF]" />
            <span>Protein (Mpro)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#24D8ED]" />
            <span>Nirmatrelvir (Ligand)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#31CAB6]" />
            <span>Hydrogen bond</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4ADE80]" />
            <span>Hydrophobic interaction</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F16D7B]" />
            <span>Electrostatic interaction</span>
          </div>
        </div>

        <button
          onClick={onOpenLab}
          className="w-full mt-2 py-1.5 rounded-lg bg-[#152238] border border-white/10 hover:border-[#24D8ED]/40 text-[11px] font-semibold text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>Show Interactions</span>
          <span className="text-[#24D8ED]">›</span>
        </button>
      </div>

      {/* Floating 3D Interaction Label (Matching "Hydrogen bond 2.8 Å" callout in Reference 1) */}
      <div className="absolute top-[38%] right-[22%] z-20 px-2.5 py-1 rounded-md bg-[#0D1526]/90 border border-[#31CAB6]/40 backdrop-blur-md text-[10px] font-mono text-[#31CAB6] shadow-xl pointer-events-none flex items-center gap-1.5 animate-pulse">
        <span className="w-1.5 h-1.5 rounded-full bg-[#31CAB6]" />
        Hydrogen bond 2.8 Å
      </div>

      {/* Right Floating Vertical Toolbar (Matching Reference 1 & 3) */}
      <div className="absolute top-5 right-5 z-20 flex flex-col gap-1.5 p-1.5 rounded-xl bg-[#0D1526]/85 backdrop-blur-xl border border-white/10 shadow-xl text-xs">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            autoRotate ? 'text-[#24D8ED] bg-[#24D8ED]/10' : 'text-[#71839E] hover:text-white'
          }`}
          title="3D Orbit Toggle"
        >
          <Boxes className="w-4 h-4" />
        </button>
        <button
          onClick={() => setRepMode('surface')}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            repMode === 'surface' ? 'text-[#24D8ED] bg-[#24D8ED]/10' : 'text-[#71839E] hover:text-white'
          }`}
          title="Surface Representation"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={() => setRepMode('cartoon')}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            repMode === 'cartoon' ? 'text-[#24D8ED] bg-[#24D8ED]/10' : 'text-[#71839E] hover:text-white'
          }`}
          title="Ribbons Representation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={onOpenLab}
          className="p-2 rounded-lg text-[#71839E] hover:text-[#9475FF] transition-colors cursor-pointer"
          title="Fullscreen in 3D Lab"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Floating Mode Dock (Matching Reference Image 1) */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 p-1.5 rounded-full bg-[#0D1526]/90 backdrop-blur-xl border border-white/10 shadow-2xl text-xs font-mono">
        {(['cartoon', 'surface', 'ball-and-stick', 'space-fill'] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setRepMode(mode)}
            className={`px-3.5 py-1.5 rounded-full capitalize transition-all cursor-pointer ${
              repMode === mode
                ? 'bg-[#152238] text-[#24D8ED] border border-[#24D8ED]/50 shadow-[0_0_10px_rgba(36,216,237,0.3)] font-semibold'
                : 'text-[#71839E] hover:text-white hover:bg-white/5'
            }`}
          >
            {mode === 'cartoon' ? 'Cartoon' : mode === 'ball-and-stick' ? 'Ball & Stick' : mode === 'space-fill' ? 'Space Fill' : 'Surface'}
          </button>
        ))}
      </div>
    </div>
  );
};
