import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import {
  Activity,
  AlertTriangle,
  Atom,
  Camera,
  CheckCircle2,
  ChevronRight,
  Download,
  ExternalLink,
  Eye,
  Layers,
  Maximize2,
  Minimize2,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  Sparkles,
  Tag,
  Target,
  Zap
} from 'lucide-react';
import {
  RegimenMechanisticPayload,
  DrugMolecularContext,
  MolecularAtom
} from '../../services/molecularContextEngine';

interface EvidenceMolecularPanelProps {
  payload: RegimenMechanisticPayload;
  onOpenLab?: (pdbId: string) => void;
}

type ViewMode = 'molecules' | 'target' | 'mechanism' | 'risk' | 'evidence';
type RepStyle = 'ball-and-stick' | 'space-fill' | 'wireframe' | 'surface';

export const EvidenceMolecularPanel: React.FC<EvidenceMolecularPanelProps> = ({
  payload,
  onOpenLab
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<ViewMode>('molecules');
  // Selected drug index for 3D inspection
  const [selectedDrugIndex, setSelectedDrugIndex] = useState<number>(0);
  // 3D representation mode
  const [repStyle, setRepStyle] = useState<RepStyle>('ball-and-stick');
  // Auto-rotation toggle
  const [isRotating, setIsRotating] = useState<boolean>(true);
  // Atom labels toggle
  const [showLabels, setShowLabels] = useState<boolean>(false);
  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const activeDrug: DrugMolecularContext = payload.drugs[selectedDrugIndex] || payload.drugs[0];

  // Three.js object references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const moleculeGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Mouse drag interaction
  const isDraggingRef = useRef<boolean>(false);
  const previousMousePositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const rotationVelocityRef = useRef<{ x: number; y: number }>({ x: 0, y: 0.003 });

  // 2D projected screen labels for atoms
  const [projectedAtomLabels, setProjectedAtomLabels] = useState<
    Array<{ id: number; symbol: string; x: number; y: number; visible: boolean }>
  >([]);

  // CPK element coloring palette
  const getCpkColor = useCallback((elem: string): number => {
    switch (elem.toUpperCase()) {
      case 'C': return 0x24d8ed; // Cyan
      case 'N': return 0x4d96ff; // Blue
      case 'O': return 0xf43f5e; // Crimson
      case 'S': return 0xf59e0b; // Amber
      case 'P': return 0xf97316; // Orange
      case 'F':
      case 'CL': return 0x10b981; // Emerald
      case 'H': return 0xffffff; // White
      default: return 0xa855f7; // Violet
    }
  }, []);

  const getVanDerWaalsRadius = useCallback((elem: string): number => {
    switch (elem.toUpperCase()) {
      case 'H': return 0.45;
      case 'C': return 0.77;
      case 'N': return 0.72;
      case 'O': return 0.68;
      case 'F': return 0.65;
      case 'CL': return 0.99;
      case 'S': return 1.02;
      case 'P': return 1.05;
      default: return 0.75;
    }
  }, []);

  // Build 3D meshes for the active small molecule
  const buildMoleculeMeshes = useCallback(() => {
    if (!moleculeGroupRef.current || !activeDrug) return;

    // Clear previous objects
    while (moleculeGroupRef.current.children.length > 0) {
      const child = moleculeGroupRef.current.children[0];
      moleculeGroupRef.current.remove(child);
      if ((child as any).geometry) (child as any).geometry.dispose();
      if ((child as any).material) {
        if (Array.isArray((child as any).material)) {
          (child as any).material.forEach((m: any) => m.dispose());
        } else {
          (child as any).material.dispose();
        }
      }
    }

    // Compute center of mass
    let sumX = 0, sumY = 0, sumZ = 0;
    activeDrug.atoms.forEach((a) => {
      sumX += a.x; sumY += a.y; sumZ += a.z;
    });
    const count = activeDrug.atoms.length || 1;
    const cx = sumX / count;
    const cy = sumY / count;
    const cz = sumZ / count;

    // Center offset coordinates
    const atomCoords = new Map<number, THREE.Vector3>();
    activeDrug.atoms.forEach((a) => {
      atomCoords.set(a.id, new THREE.Vector3(a.x - cx, a.y - cy, a.z - cz));
    });

    const isSpaceFill = repStyle === 'space-fill';
    const isWireframe = repStyle === 'wireframe';
    const isSurface = repStyle === 'surface';

    // 1. Build Atoms
    activeDrug.atoms.forEach((a) => {
      const pos = atomCoords.get(a.id);
      if (!pos) return;

      const vdwRadius = getVanDerWaalsRadius(a.element);
      const radius = isSpaceFill ? vdwRadius * 1.15 : isWireframe ? 0.15 : 0.42;
      const sphereGeo = new THREE.SphereGeometry(radius, 20, 20);
      const color = getCpkColor(a.element);

      const mat = isSurface
        ? new THREE.MeshPhysicalMaterial({
            color,
            transparent: true,
            opacity: 0.65,
            roughness: 0.2,
            transmission: 0.3,
            metalness: 0.1
          })
        : new THREE.MeshStandardMaterial({
            color,
            roughness: 0.3,
            metalness: 0.2
          });

      const mesh = new THREE.Mesh(sphereGeo, mat);
      mesh.position.copy(pos);
      moleculeGroupRef.current?.add(mesh);
    });

    // 2. Build Chemical Bonds
    if (!isSpaceFill) {
      activeDrug.bonds.forEach((b) => {
        const p1 = atomCoords.get(b.from);
        const p2 = atomCoords.get(b.to);
        if (!p1 || !p2) return;

        const distance = p1.distanceTo(p2);
        const bondRadius = isWireframe ? 0.04 : 0.12;
        const bondGeo = new THREE.CylinderGeometry(bondRadius, bondRadius, distance, 12);
        const bondMat = new THREE.MeshStandardMaterial({
          color: 0x64748b,
          roughness: 0.5,
          metalness: 0.3
        });

        const cylinder = new THREE.Mesh(bondGeo, bondMat);
        const midPoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        cylinder.position.copy(midPoint);

        const direction = new THREE.Vector3().subVectors(p2, p1).normalize();
        const orientation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
        cylinder.setRotationFromQuaternion(orientation);

        moleculeGroupRef.current?.add(cylinder);
      });
    }

    // 3. Optional Surface Halo
    if (isSurface) {
      const haloGeo = new THREE.DodecahedronGeometry(3.5, 2);
      const haloMat = new THREE.MeshBasicMaterial({
        color: 0x24d8ed,
        wireframe: true,
        transparent: true,
        opacity: 0.12
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      moleculeGroupRef.current?.add(haloMesh);
    }
  }, [activeDrug, repStyle, getCpkColor, getVanDerWaalsRadius]);

  // Initialize Three.js viewport
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 400;
    const height = 300;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 9);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    rendererRef.current = renderer;

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x24d8ed, 1.4);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x9475ff, 1.0);
    dirLight2.position.set(-5, -6, -4);
    scene.add(dirLight2);

    const molGroup = new THREE.Group();
    scene.add(molGroup);
    moleculeGroupRef.current = molGroup;

    buildMoleculeMeshes();

    // Render loop
    const animate = () => {
      if (moleculeGroupRef.current) {
        if (isRotating && !isDraggingRef.current) {
          moleculeGroupRef.current.rotation.y += rotationVelocityRef.current.y;
          moleculeGroupRef.current.rotation.x += rotationVelocityRef.current.x;
        }

        // Project atom positions onto 2D screen space for labels
        if (showLabels && cameraRef.current && containerRef.current && activeDrug) {
          const w = containerRef.current.clientWidth;
          const h = 300;
          const labels: Array<{ id: number; symbol: string; x: number; y: number; visible: boolean }> = [];

          // Compute center of mass
          let sx = 0, sy = 0, sz = 0;
          activeDrug.atoms.forEach((a) => { sx += a.x; sy += a.y; sz += a.z; });
          const cnt = activeDrug.atoms.length || 1;
          const cx = sx / cnt, cy = sy / cnt, cz = sz / cnt;

          activeDrug.atoms.slice(0, 10).forEach((a) => {
            const worldPos = new THREE.Vector3(a.x - cx, a.y - cy, a.z - cz);
            worldPos.applyEuler(moleculeGroupRef.current!.rotation);
            worldPos.add(moleculeGroupRef.current!.position);

            const screenPos = worldPos.clone().project(cameraRef.current!);
            const sxPos = ((screenPos.x + 1) * w) / 2;
            const syPos = ((-screenPos.y + 1) * h) / 2;

            labels.push({
              id: a.id,
              symbol: a.element,
              x: sxPos,
              y: syPos,
              visible: screenPos.z < 1.0 && sxPos > 10 && sxPos < w - 10 && syPos > 10 && syPos < h - 10
            });
          });

          setProjectedAtomLabels(labels);
        } else {
          setProjectedAtomLabels([]);
        }
      }

      renderer.render(scene, camera);
      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const nw = containerRef.current.clientWidth;
      const nh = 300;
      cameraRef.current.aspect = nw / nh;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(nw, nh);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      renderer.dispose();
    };
  }, [buildMoleculeMeshes, isRotating, showLabels, activeDrug]);

  // Re-build on structure change
  useEffect(() => {
    buildMoleculeMeshes();
  }, [buildMoleculeMeshes]);

  // Mouse interaction handlers for rotation
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !moleculeGroupRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    moleculeGroupRef.current.rotation.y += deltaX * 0.008;
    moleculeGroupRef.current.rotation.x += deltaY * 0.008;

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Zoom control
  const handleZoom = (direction: 'in' | 'out') => {
    if (!cameraRef.current) return;
    const delta = direction === 'in' ? -1.0 : 1.0;
    cameraRef.current.position.z = Math.max(4.0, Math.min(16.0, cameraRef.current.position.z + delta));
  };

  const handleResetCamera = () => {
    if (cameraRef.current && moleculeGroupRef.current) {
      cameraRef.current.position.set(0, 0, 9);
      moleculeGroupRef.current.rotation.set(0, 0, 0);
    }
  };

  // Snapshot capture
  const handleExportSnapshot = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `DrugScope_3D_${activeDrug.genericName}_${Date.now()}.png`;
    a.click();
  };

  // Aggregate all unique macromolecular targets across analyzed medicines
  const allTargets = useMemo(() => {
    const list: Array<{ symbol: string; name: string; pdbId: string; type: 'primary' | 'secondary' }> = [];
    const seen = new Set<string>();
    payload.drugs.forEach((d) => {
      if (d.primaryTarget && !seen.has(d.primaryTarget.geneSymbol)) {
        seen.add(d.primaryTarget.geneSymbol);
        list.push({
          symbol: d.primaryTarget.geneSymbol,
          name: d.primaryTarget.name,
          pdbId: d.primaryTarget.pdbId,
          type: 'primary'
        });
      }
      if (d.secondaryTarget && !seen.has(d.secondaryTarget.geneSymbol)) {
        seen.add(d.secondaryTarget.geneSymbol);
        list.push({
          symbol: d.secondaryTarget.geneSymbol,
          name: d.secondaryTarget.name,
          pdbId: d.secondaryTarget.pdbId,
          type: 'secondary'
        });
      }
    });
    return list;
  }, [payload.drugs]);

  return (
    <div
      ref={containerRef}
      className={`glass-panel rounded-3xl border border-white/10 bg-[#0B1120]/95 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col transition-all ${
        isFullscreen ? 'fixed inset-4 sm:inset-10 z-50 overflow-y-auto max-h-[92vh]' : ''
      }`}
    >
      {/* ================================================================== */}
      {/* PANEL HEADER WITH MODE SWITCHER TABS                               */}
      {/* ================================================================== */}
      <div className="p-4 border-b border-white/10 bg-[#070B14]/80 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Atom className="w-4 h-4 text-[#24D8ED] animate-spin-slow" />
            <span className="text-xs font-display font-bold text-white tracking-wider uppercase">
              3D Molecular Intelligence
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#24D8ED]/10 text-[#24D8ED] border border-[#24D8ED]/30">
              Live RCSB / PubChem
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleExportSnapshot}
              title="Export 3D Snapshot PNG"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#A7B5C9] hover:text-white transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetCamera}
              title="Reset Viewport Camera"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#A7B5C9] hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen 3D Studio'}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#A7B5C9] hover:text-white transition-colors cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-[#37D6E6]" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Tab Selection Row */}
        <div className="grid grid-cols-5 gap-1 p-1 bg-[#101827] rounded-xl border border-white/10 text-[11px] font-medium text-center">
          {[
            { id: 'molecules', label: 'Molecule' },
            { id: 'target', label: 'Target' },
            { id: 'mechanism', label: 'Mechanism' },
            { id: 'risk', label: 'Risk Map' },
            { id: 'evidence', label: 'Evidence' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as ViewMode)}
              className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-[#24D8ED] to-[#9475FF] text-[#070B14] font-bold shadow-sm'
                  : 'text-[#A7B5C9] hover:text-white hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ================================================================== */}
      {/* 3D VIEWPORT CANVAS STAGE                                           */}
      {/* ================================================================== */}
      <div
        className="relative bg-gradient-to-b from-[#070B14] to-[#0B1120] border-b border-white/10 overflow-hidden select-none cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <canvas ref={canvasRef} className={`w-full block ${isFullscreen ? 'h-[440px]' : 'h-[300px]'}`} />

        {/* 2D Projected Atom Labels Overlay */}
        {showLabels &&
          projectedAtomLabels.map((lbl) =>
            lbl.visible ? (
              <div
                key={lbl.id}
                style={{ left: `${lbl.x}px`, top: `${lbl.y}px` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none text-[9px] font-mono font-bold px-1 rounded bg-[#070B14]/80 border border-white/20 text-[#24D8ED]"
              >
                {lbl.symbol}
              </div>
            ) : null
          )}

        {/* Medicine Selector Pills Overlay (Top Left of Viewport) */}
        {payload.drugs.length > 1 && (
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 p-1 rounded-xl bg-[#070B14]/80 backdrop-blur-md border border-white/15">
            {payload.drugs.map((d, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedDrugIndex(idx)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-semibold transition-all cursor-pointer ${
                  selectedDrugIndex === idx
                    ? 'bg-[#24D8ED] text-[#070B14]'
                    : 'text-[#A7B5C9] hover:text-white'
                }`}
              >
                {d.drugName}
              </button>
            ))}
          </div>
        )}

        {/* 3D Representation Controls (Bottom Floating Bar) */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 p-1.5 rounded-xl bg-[#070B14]/85 backdrop-blur-md border border-white/15">
          <div className="flex items-center gap-1">
            {[
              { id: 'ball-and-stick', label: 'B&S' },
              { id: 'space-fill', label: 'Space-Fill' },
              { id: 'wireframe', label: 'Wire' },
              { id: 'surface', label: 'Surface' }
            ].map((rep) => (
              <button
                key={rep.id}
                type="button"
                onClick={() => setRepStyle(rep.id as RepStyle)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-mono transition-all cursor-pointer ${
                  repStyle === rep.id
                    ? 'bg-white/20 text-white font-bold'
                    : 'text-[#A7B5C9] hover:text-white'
                }`}
              >
                {rep.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            {/* Zoom Controls */}
            <button
              type="button"
              onClick={() => handleZoom('out')}
              className="px-1.5 py-0.5 rounded-md text-[11px] font-mono text-[#A7B5C9] hover:text-white transition-all cursor-pointer"
              title="Zoom Out"
            >
              −
            </button>
            <button
              type="button"
              onClick={() => handleZoom('in')}
              className="px-1.5 py-0.5 rounded-md text-[11px] font-mono text-[#A7B5C9] hover:text-white transition-all cursor-pointer"
              title="Zoom In"
            >
              +
            </button>

            <button
              type="button"
              onClick={() => setShowLabels(!showLabels)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-mono transition-all cursor-pointer ${
                showLabels ? 'bg-[#24D8ED]/30 text-[#24D8ED] font-bold' : 'text-[#A7B5C9]'
              }`}
              title="Toggle Atom Element Labels"
            >
              Labels
            </button>

            <button
              type="button"
              onClick={() => setIsRotating(!isRotating)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-mono transition-all cursor-pointer ${
                isRotating ? 'text-[#32C8B7]' : 'text-[#A7B5C9]'
              }`}
            >
              {isRotating ? 'Spinning' : 'Paused'}
            </button>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* CONTEXT BIOMOLECULAR ENTITY CHIPS & MECHANISTIC RISK BANNER        */}
      {/* ================================================================== */}
      <div className="p-3.5 bg-[#070B14]/90 border-b border-white/10 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[#A7B5C9] flex items-center gap-1.5">
            <Tag className="w-3 h-3 text-[#37D6E6]" />
            <span>Mapped Molecular Targets & Ligands</span>
          </span>
          <span className="text-[10px] font-mono text-[#37D6E6]">
            {payload.drugs.length} Drugs • {allTargets.length} Receptors
          </span>
        </div>

        {/* Labeled Chips: Selected Drugs and Targets (VKORC1, CYP2C9, COX-1, etc.) */}
        <div className="flex flex-wrap items-center gap-1.5">
          {payload.drugs.map((d, idx) => (
            <button
              key={`chip-drug-${idx}`}
              type="button"
              onClick={() => {
                setSelectedDrugIndex(idx);
                setActiveTab('molecules');
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedDrugIndex === idx
                  ? 'bg-[#24D8ED]/20 text-[#24D8ED] border border-[#24D8ED]/60 font-bold shadow-sm'
                  : 'bg-white/5 text-[#A7B5C9] hover:text-white border border-white/10'
              }`}
            >
              <Atom className="w-3 h-3 text-[#24D8ED]" />
              <span>{d.drugName}</span>
            </button>
          ))}

          {allTargets.map((tgt, idx) => (
            <button
              key={`chip-tgt-${idx}`}
              type="button"
              onClick={() => setActiveTab('target')}
              className="px-2.5 py-1 rounded-lg text-[10px] font-mono flex items-center gap-1.5 bg-[#9475FF]/10 text-[#C4B5FD] hover:bg-[#9475FF]/20 border border-[#9475FF]/30 transition-all cursor-pointer"
              title={`${tgt.name} (${tgt.pdbId})`}
            >
              <Target className="w-3 h-3 text-[#9475FF]" />
              <span>{tgt.symbol}</span>
              <span className="text-[9px] text-[#A7B5C9]">({tgt.pdbId})</span>
            </button>
          ))}
        </div>

        {/* Risk Caption Banner */}
        <div className="p-2.5 rounded-xl bg-gradient-to-r from-rose-500/15 via-amber-500/10 to-transparent border border-rose-500/30 flex items-start gap-2.5 text-xs">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="text-[11px] font-bold text-rose-200">
              {payload.drugs.some((d) => d.drugName.toLowerCase().includes('warfarin')) &&
              payload.drugs.some((d) => d.drugName.toLowerCase().includes('aspirin'))
                ? 'Combined anticoagulant + antiplatelet effect increases severe bleeding risk'
                : payload.interactionClassification}
            </div>
            <div className="text-[10px] text-[#A7B5C9] leading-snug">
              {payload.mechanisticSummary}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================== */}
      {/* TAB CONTENT PANELS                                                 */}
      {/* ================================================================== */}
      <div className="p-4 space-y-4 max-h-[360px] overflow-y-auto">
        {/* ---------------------------------------------------------------- */}
        {/* TAB 1: MOLECULE METADATA                                         */}
        {/* ---------------------------------------------------------------- */}
        {activeTab === 'molecules' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div>
                <h4 className="text-sm font-bold text-white">{activeDrug.genericName}</h4>
                <div className="text-[10px] font-mono text-[#A7B5C9]">{activeDrug.formula}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono text-[#24D8ED] bg-[#24D8ED]/10 border border-[#24D8ED]/30 px-2 py-0.5 rounded-full">
                  MW: {activeDrug.molecularWeight.toFixed(2)} g/mol
                </span>
                <div className="text-[9px] font-mono text-[#A7B5C9] mt-0.5">
                  PubChem CID: {activeDrug.pubchemCid}
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#070B14] border border-white/5 space-y-1">
              <div className="text-[10px] font-mono text-[#A7B5C9] uppercase">Canonical SMILES:</div>
              <div className="text-[10px] font-mono text-[#24D8ED] break-all leading-tight opacity-90">
                {activeDrug.smiles}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-white">Target Receptors & Enzymes:</div>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-white font-mono flex items-center gap-1.5">
                  <Target className="w-3 h-3 text-[#24D8ED]" />
                  <span>{activeDrug.primaryTarget.geneSymbol}</span>
                  <span className="text-[9px] text-[#A7B5C9]">({activeDrug.primaryTarget.pdbId})</span>
                </span>
                {activeDrug.secondaryTarget && (
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-white font-mono flex items-center gap-1.5">
                    <Target className="w-3 h-3 text-[#9475FF]" />
                    <span>{activeDrug.secondaryTarget.geneSymbol}</span>
                    <span className="text-[9px] text-[#A7B5C9]">({activeDrug.secondaryTarget.pdbId})</span>
                  </span>
                )}
              </div>
            </div>

            {onOpenLab && (
              <button
                type="button"
                onClick={() => onOpenLab(activeDrug.primaryTarget.pdbId)}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#24D8ED]/20 to-[#9475FF]/20 hover:from-[#24D8ED]/30 hover:to-[#9475FF]/30 border border-[#24D8ED]/40 text-[#24D8ED] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Inspect in 3D Molecular Lab</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* TAB 2: BIOLOGICAL RECEPTOR TARGET                                */}
        {/* ---------------------------------------------------------------- */}
        {activeTab === 'target' && (
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-[#070B14] border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-[#24D8ED]" />
                  <span>{activeDrug.primaryTarget.geneSymbol}</span>
                </div>
                <span className="text-[10px] font-mono text-[#32C8B7] bg-[#32C8B7]/10 px-2 py-0.5 rounded">
                  PDB: {activeDrug.primaryTarget.pdbId}
                </span>
              </div>
              <div className="text-[11px] text-[#E2E8F0] font-medium">
                {activeDrug.primaryTarget.name}
              </div>
              <p className="text-[11px] text-[#A7B5C9] leading-relaxed">
                {activeDrug.primaryTarget.description}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="text-[11px] font-mono text-[#A7B5C9] uppercase">
                Active Site & Key Catalytic Residues:
              </div>
              <div className="space-y-1">
                {activeDrug.primaryTarget.keyResidues.map((res, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-white/5 border border-white/5 text-[11px] flex items-center justify-between"
                  >
                    <span className="font-mono font-bold text-[#24D8ED]">
                      {res.residue}-{res.position}
                    </span>
                    <span className="text-[10px] text-[#A7B5C9] truncate ml-2">
                      {res.role}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[10px] font-mono text-[#A7B5C9] flex items-center justify-between pt-1 border-t border-white/5">
              <span>UniProt: {activeDrug.primaryTarget.uniprotId}</span>
              <a
                href={`https://www.rcsb.org/structure/${activeDrug.primaryTarget.pdbId}`}
                target="_blank"
                rel="noreferrer"
                className="text-[#24D8ED] hover:underline flex items-center gap-1"
              >
                <span>RCSB Entry</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* TAB 3: MECHANISM & PATHWAY CONFLICT                              */}
        {/* ---------------------------------------------------------------- */}
        {activeTab === 'mechanism' && (
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
              <div className="text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{payload.interactionClassification}</span>
              </div>
              <p className="text-xs text-amber-100/90 leading-relaxed">
                {payload.mechanisticSummary}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-white">Biochemical Conflict Pathway:</div>
              <p className="text-xs text-[#A7B5C9] leading-relaxed bg-[#070B14] p-3 rounded-xl border border-white/5">
                {payload.pathwayConflictDescription}
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="text-[11px] font-mono text-[#A7B5C9]">Critical Enzymes & Transporters:</div>
              <div className="flex flex-wrap gap-1.5">
                {payload.keyEnzymesInvolved.map((enz, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#24D8ED]/10 border border-[#24D8ED]/30 text-[#24D8ED]"
                  >
                    {enz}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* TAB 4: ORGAN SYSTEM RISK MAP                                     */}
        {/* ---------------------------------------------------------------- */}
        {activeTab === 'risk' && (
          <div className="space-y-3">
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#24D8ED]" />
              <span>Target Organ Toxicological Distribution</span>
            </div>

            <div className="space-y-2.5">
              {[
                { label: 'Bleeding / Hemorrhage', value: payload.riskLevels.bleeding, color: 'bg-rose-500' },
                { label: 'Hepatic / Liver Strain', value: payload.riskLevels.hepatic, color: 'bg-amber-500' },
                { label: 'Renal / Nephrotoxicity', value: payload.riskLevels.renal, color: 'bg-blue-500' },
                { label: 'Cardiovascular Risk', value: payload.riskLevels.cardiac, color: 'bg-purple-500' },
                { label: 'Metabolic / Lactic Acid', value: payload.riskLevels.metabolic, color: 'bg-emerald-500' }
              ].map((r, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#A7B5C9]">{r.label}</span>
                    <span className="font-mono font-bold text-white">{r.value}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${r.color} transition-all duration-500`}
                      style={{ width: `${r.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-[#070B14] border border-white/5 text-[10px] text-[#A7B5C9] flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#24D8ED] shrink-0" />
              <span>
                Calculated from verified openFDA pharmacovigilance reports and clinical adverse reaction signals.
              </span>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* TAB 5: SCIENTIFIC EVIDENCE POINTERS                              */}
        {/* ---------------------------------------------------------------- */}
        {activeTab === 'evidence' && (
          <div className="space-y-2.5">
            <div className="text-xs font-semibold text-white flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#32C8B7]" />
              <span>Direct Structural & Literature Provenance:</span>
            </div>

            <div className="space-y-2">
              {payload.evidencePointers.map((ev, idx) => (
                <a
                  key={idx}
                  href={ev.link}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-xl bg-[#070B14] hover:bg-white/5 border border-white/5 hover:border-white/20 transition-all flex items-center justify-between text-xs text-white block group"
                >
                  <div className="truncate mr-2">
                    <div className="font-medium truncate group-hover:text-[#24D8ED] transition-colors">
                      {ev.title}
                    </div>
                    <div className="text-[10px] font-mono text-[#A7B5C9] mt-0.5">
                      {ev.identifier}
                    </div>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-[#24D8ED] shrink-0" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
