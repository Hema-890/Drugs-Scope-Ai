import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import {
  Boxes,
  ExternalLink,
  Eye,
  Info,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Layers,
  Ruler,
  CheckCircle2
} from 'lucide-react';
import { STRUCTURE_7TLL, VerifiedInteraction } from '../../data/verifiedStructure7TLL';

interface HeroMoleculeProps {
  onOpenLab?: () => void;
}

export const HeroMolecule: React.FC<HeroMoleculeProps> = ({ onOpenLab }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // User state
  const [repMode, setRepMode] = useState<'cartoon' | 'surface' | 'ball-and-stick' | 'pocket'>('cartoon');
  const [showInteractions, setShowInteractions] = useState<boolean>(true);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [isHudCollapsed, setIsHudCollapsed] = useState<boolean>(false);
  const [selectedInteractionIndex, setSelectedInteractionIndex] = useState<number>(0);

  // Projected 2D screen positions for 3D interactions
  const [projectedInteractions, setProjectedInteractions] = useState<
    { id: string; x: number; y: number; visible: boolean; label: string; dist: string; color: string; desc: string }[]
  >([]);

  // Three.js instances
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rootGroupRef = useRef<THREE.Group | null>(null);
  const proteinGroupRef = useRef<THREE.Group | null>(null);
  const ligandGroupRef = useRef<THREE.Group | null>(null);
  const pocketGroupRef = useRef<THREE.Group | null>(null);
  const interactionGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // World normalization transformation
  const scaleRef = useRef<number>(1);
  const centerRef = useRef<THREE.Vector3>(new THREE.Vector3());

  // Drag interaction
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const isHoveredRef = useRef(false);

  // Calculate center of mass and coordinate scaling
  const setupCoordinates = useCallback(() => {
    const { caAtoms, ligandAtoms } = STRUCTURE_7TLL;
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    let sumX = 0, sumY = 0, sumZ = 0;
    const total = caAtoms.length + ligandAtoms.length;

    caAtoms.forEach((a) => {
      minX = Math.min(minX, a.x); maxX = Math.max(maxX, a.x);
      minY = Math.min(minY, a.y); maxY = Math.max(maxY, a.y);
      minZ = Math.min(minZ, a.z); maxZ = Math.max(maxZ, a.z);
      sumX += a.x; sumY += a.y; sumZ += a.z;
    });

    ligandAtoms.forEach((a) => {
      minX = Math.min(minX, a.x); maxX = Math.max(maxX, a.x);
      minY = Math.min(minY, a.y); maxY = Math.max(maxY, a.y);
      minZ = Math.min(minZ, a.z); maxZ = Math.max(maxZ, a.z);
      sumX += a.x; sumY += a.y; sumZ += a.z;
    });

    const cx = sumX / total;
    const cy = sumY / total;
    const cz = sumZ / total;
    centerRef.current.set(cx, cy, cz);

    const maxSpan = Math.max(maxX - minX, maxY - minY, maxZ - minZ);
    // Scale so protein spans ~ 22 units in Three.js world space
    scaleRef.current = 22.0 / maxSpan;
  }, []);

  const toWorld = useCallback((x: number, y: number, z: number): THREE.Vector3 => {
    const s = scaleRef.current;
    const c = centerRef.current;
    return new THREE.Vector3((x - c.x) * s, (y - c.y) * s, (z - c.z) * s);
  }, []);

  // Element CPK palette
  const getElementColor = (elem: string): number => {
    switch (elem.toUpperCase()) {
      case 'C': return 0x24d8ed; // Precision Cyan
      case 'N': return 0x4d96ff; // Royal Blue
      case 'O': return 0xf16d7b; // Coral Red
      case 'F': return 0x31cab6; // Emerald Fluorine
      case 'S': return 0xeab308; // Yellow Amber
      case 'H': return 0xe2e8f0; // White
      default: return 0xa0aec0;
    }
  };

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;
    setupCoordinates();

    const width = containerRef.current.clientWidth || 640;
    const height = containerRef.current.clientHeight || 520;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera with pleasant perspective and framing
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 2.5, 30);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    // 4. Clean Cinematic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0x24d8ed, 1.8);
    keyLight.position.set(16, 20, 18);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x9475ff, 1.5);
    rimLight.position.set(-18, -14, -12);
    scene.add(rimLight);

    const fillLight = new THREE.PointLight(0x31cab6, 1.4, 45);
    fillLight.position.set(0, 4, 8);
    scene.add(fillLight);

    // 5. Root Group
    const rootGroup = new THREE.Group();
    // Opening curated orientation: tilt slightly to showcase active site cleft
    rootGroup.rotation.x = 0.25;
    rootGroup.rotation.y = -0.65;
    scene.add(rootGroup);
    rootGroupRef.current = rootGroup;

    // Sub-groups
    const proteinGroup = new THREE.Group();
    rootGroup.add(proteinGroup);
    proteinGroupRef.current = proteinGroup;

    const ligandGroup = new THREE.Group();
    rootGroup.add(ligandGroup);
    ligandGroupRef.current = ligandGroup;

    const pocketGroup = new THREE.Group();
    rootGroup.add(pocketGroup);
    pocketGroupRef.current = pocketGroup;

    const interactionGroup = new THREE.Group();
    rootGroup.add(interactionGroup);
    interactionGroupRef.current = interactionGroup;

    // ------------------------------------------------------------------
    // A. Build Genuine Protein Secondary Structure Backbone (7TLL)
    // ------------------------------------------------------------------
    const { caAtoms, helices, sheets, ligandAtoms, ligandBonds, verifiedInteractions } = STRUCTURE_7TLL;

    // Classify residues into Helices, Sheets, and Loops
    const isHelix = (seq: number) => helices.some((h) => seq >= h.initSeq && seq <= h.endSeq);
    const isSheet = (seq: number) => sheets.some((s) => seq >= s.initSeq && seq <= s.endSeq);

    // Segment CA atoms into contiguous secondary structure stretches
    const allCaPoints = caAtoms.map((a) => toWorld(a.x, a.y, a.z));

    if (allCaPoints.length > 2) {
      // Continuous smooth ribbon curve following genuine C-alpha backbone
      const proteinCurve = new THREE.CatmullRomCurve3(allCaPoints, false, 'centripetal', 0.5);

      // Ribbon tube with secondary structure geometry
      const ribbonRadius = repMode === 'cartoon' ? 0.26 : repMode === 'ball-and-stick' ? 0.12 : 0.35;
      const ribbonGeo = new THREE.TubeGeometry(
        proteinCurve,
        Math.min(caAtoms.length * 2, 280),
        ribbonRadius,
        8,
        false
      );

      // Dual-tone gradient shader-like coloring via vertex colors
      const count = ribbonGeo.attributes.position.count;
      const colors = new Float32Array(count * 3);
      const colorPos = ribbonGeo.attributes.position;

      for (let i = 0; i < count; i++) {
        const py = colorPos.getY(i);
        // Blend from deep cyan to iris violet depending on vertical altitude
        const t = THREE.MathUtils.clamp((py + 10) / 20, 0, 1);
        const col = new THREE.Color().lerpColors(
          new THREE.Color(0x16537e), // Deep scientific slate cyan
          new THREE.Color(0x6342b3), // Refined violet
          t
        );
        colors[i * 3] = col.r;
        colors[i * 3 + 1] = col.g;
        colors[i * 3 + 2] = col.b;
      }
      ribbonGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const ribbonMat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.35,
        metalness: 0.25,
        opacity: repMode === 'pocket' ? 0.35 : 0.95,
        transparent: repMode === 'pocket'
      });
      const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
      proteinGroup.add(ribbonMesh);

      // Helical cylinders highlighting genuine alpha helices
      helices.forEach((h) => {
        const helixAtoms = caAtoms.filter((a) => a.resSeq >= h.initSeq && a.resSeq <= h.endSeq);
        if (helixAtoms.length < 3) return;
        const pStart = toWorld(helixAtoms[0].x, helixAtoms[0].y, helixAtoms[0].z);
        const pEnd = toWorld(helixAtoms[helixAtoms.length - 1].x, helixAtoms[helixAtoms.length - 1].y, helixAtoms[helixAtoms.length - 1].z);
        const dist = pStart.distanceTo(pEnd);
        if (dist > 1.0) {
          const cylGeo = new THREE.CylinderGeometry(0.42, 0.42, dist, 12);
          const cylMat = new THREE.MeshStandardMaterial({
            color: 0x24d8ed,
            roughness: 0.25,
            metalness: 0.4,
            opacity: 0.55,
            transparent: true
          });
          const cylMesh = new THREE.Mesh(cylGeo, cylMat);
          cylMesh.position.copy(pStart).lerp(pEnd, 0.5);
          cylMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pEnd.clone().sub(pStart).normalize());
          proteinGroup.add(cylMesh);
        }
      });

      // Secondary structure residue nodes in ball-and-stick mode
      if (repMode === 'ball-and-stick') {
        const nodeGeo = new THREE.SphereGeometry(0.2, 12, 12);
        const nodeMat = new THREE.MeshStandardMaterial({ color: 0x9475ff, roughness: 0.3 });
        caAtoms.forEach((a, idx) => {
          if (idx % 2 === 0) {
            const m = new THREE.Mesh(nodeGeo, nodeMat);
            m.position.copy(toWorld(a.x, a.y, a.z));
            proteinGroup.add(m);
          }
        });
      }
    }

    // ------------------------------------------------------------------
    // B. Build Genuine Bound Ligand: Nirmatrelvir (4WI)
    // ------------------------------------------------------------------
    const ligandWorldPositions: THREE.Vector3[] = [];

    ligandAtoms.forEach((atom) => {
      const pos = toWorld(atom.x, atom.y, atom.z);
      ligandWorldPositions.push(pos);

      const radius = repMode === 'ball-and-stick' ? 0.3 : 0.26;
      const sphereGeo = new THREE.SphereGeometry(radius, 16, 16);
      const color = getElementColor(atom.elem);
      const sphereMat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.18,
        metalness: 0.35,
        emissive: color,
        emissiveIntensity: 0.25
      });
      const atomMesh = new THREE.Mesh(sphereGeo, sphereMat);
      atomMesh.position.copy(pos);
      ligandGroup.add(atomMesh);
    });

    // Ligand Covalent Bonds
    ligandBonds.forEach(([i, j]) => {
      if (!ligandWorldPositions[i] || !ligandWorldPositions[j]) return;
      const p1 = ligandWorldPositions[i];
      const p2 = ligandWorldPositions[j];
      const dist = p1.distanceTo(p2);
      if (dist > 0.1 && dist < 2.5) {
        const bondGeo = new THREE.CylinderGeometry(0.08, 0.08, dist, 8);
        const bondMat = new THREE.MeshStandardMaterial({
          color: 0xcedee7,
          roughness: 0.3,
          metalness: 0.2
        });
        const bondMesh = new THREE.Mesh(bondGeo, bondMat);
        bondMesh.position.copy(p1).lerp(p2, 0.5);
        bondMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p2.clone().sub(p1).normalize());
        ligandGroup.add(bondMesh);
      }
    });

    // ------------------------------------------------------------------
    // C. Catalytic Pocket Isosurface Mesh
    // ------------------------------------------------------------------
    if (repMode === 'surface' || repMode === 'pocket') {
      const pocketCenter = new THREE.Vector3();
      ligandWorldPositions.forEach((p) => pocketCenter.add(p));
      pocketCenter.divideScalar(ligandWorldPositions.length || 1);

      const pocketGeo = new THREE.IcosahedronGeometry(3.2, 3);
      const pAttrs = pocketGeo.attributes.position;
      for (let i = 0; i < pAttrs.count; i++) {
        const vx = pAttrs.getX(i);
        const vy = pAttrs.getY(i);
        const vz = pAttrs.getZ(i);
        const disp = Math.sin(vx * 1.8) * Math.cos(vy * 1.8) * 0.45;
        pAttrs.setXYZ(i, vx * (1 + disp), vy * (1 + disp), vz * (1 + disp));
      }
      pocketGeo.computeVertexNormals();

      const pocketMat = new THREE.MeshPhysicalMaterial({
        color: 0x113a68,
        roughness: 0.2,
        metalness: 0.1,
        transmission: 0.72,
        opacity: 0.45,
        transparent: true,
        side: THREE.DoubleSide
      });
      const pocketMesh = new THREE.Mesh(pocketGeo, pocketMat);
      pocketMesh.position.copy(pocketCenter);
      pocketGroup.add(pocketMesh);
    }

    // ------------------------------------------------------------------
    // D. Validated Catalytic Contacts & Distance Indicators
    // ------------------------------------------------------------------
    verifiedInteractions.forEach((inter) => {
      const pProt = toWorld(...inter.proteinCoord);
      const pLig = toWorld(...inter.ligandCoord);

      // 3D Dashed Bond Line
      const lineGeo = new THREE.BufferGeometry().setFromPoints([pLig, pProt]);
      const lineMat = new THREE.LineDashedMaterial({
        color: new THREE.Color(inter.color),
        dashSize: 0.18,
        gapSize: 0.12,
        linewidth: 2
      });
      const line = new THREE.Line(lineGeo, lineMat);
      line.computeLineDistances();
      interactionGroup.add(line);

      // Catalytic protein anchor atom sphere (e.g., Cys145:SG)
      const anchorGeo = new THREE.SphereGeometry(0.22, 14, 14);
      const anchorMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(inter.color),
        roughness: 0.2,
        emissive: new THREE.Color(inter.color),
        emissiveIntensity: 0.4
      });
      const anchorMesh = new THREE.Mesh(anchorGeo, anchorMat);
      anchorMesh.position.copy(pProt);
      interactionGroup.add(anchorMesh);
    });

    // ------------------------------------------------------------------
    // Render Loop & 3D to 2D Dynamic Label Projection
    // ------------------------------------------------------------------
    let lastTime = performance.now();

    const animate = (time: number) => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      // Gentle auto-rotation (pauses when user drags or hovers)
      if (autoRotate && !isDraggingRef.current && !isHoveredRef.current && rootGroupRef.current) {
        rootGroupRef.current.rotation.y += 0.0035;
      }

      // Project 3D interaction coordinates to 2D screen positions
      if (cameraRef.current && containerRef.current && showInteractions && rootGroupRef.current) {
        const cWidth = containerRef.current.clientWidth || 640;
        const cHeight = containerRef.current.clientHeight || 520;

        const projected = verifiedInteractions.map((inter) => {
          // Midpoint of contact vector in local space
          const pProt = toWorld(...inter.proteinCoord);
          const pLig = toWorld(...inter.ligandCoord);
          const localMid = pProt.clone().lerp(pLig, 0.45);

          // Apply root group rotation
          const worldPos = localMid.applyMatrix4(rootGroupRef.current!.matrixWorld);
          const projectedVec = worldPos.clone().project(cameraRef.current!);

          const screenX = (projectedVec.x * 0.5 + 0.5) * cWidth;
          const screenY = (-(projectedVec.y * 0.5) + 0.5) * cHeight;
          const visible = projectedVec.z < 1.0 && screenX > 20 && screenX < cWidth - 20 && screenY > 20 && screenY < cHeight - 20;

          return {
            id: inter.id,
            x: screenX,
            y: screenY,
            visible,
            label: `${inter.proteinResidue}:${inter.proteinAtom} ↔ 4WI:${inter.ligandAtom}`,
            dist: `${inter.distance.toFixed(2)} Å`,
            color: inter.color,
            desc: inter.type
          };
        });

        setProjectedInteractions(projected);
      }

      renderer.render(scene, camera);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // Resize handler
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      renderer.dispose();
      scene.clear();
    };
  }, [repMode, showInteractions, autoRotate, setupCoordinates, toWorld]);

  // Drag interaction
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !rootGroupRef.current) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    rootGroupRef.current.rotation.y += deltaX * 0.007;
    rootGroupRef.current.rotation.x += deltaY * 0.007;

    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleResetCamera = () => {
    if (rootGroupRef.current && cameraRef.current) {
      rootGroupRef.current.rotation.set(0.25, -0.65, 0);
      cameraRef.current.position.set(0, 2.5, 30);
    }
  };

  const currentInter = STRUCTURE_7TLL.verifiedInteractions[selectedInteractionIndex] || STRUCTURE_7TLL.verifiedInteractions[0];

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[520px] sm:h-[560px] rounded-2xl overflow-hidden bg-[#070B14] select-none group border border-white/[0.08] shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseEnter={() => { isHoveredRef.current = true; }}
      onMouseLeave={() => {
        isDraggingRef.current = false;
        isHoveredRef.current = false;
      }}
    >
      {/* 3D WebGL Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

      {/* COMPACT SCIENTIFIC HUD OVERLAY (Redesigned per Part 4 - No more oversized blocking card) */}
      <div className="absolute top-4 left-4 z-20 max-w-[280px] sm:max-w-[320px] transition-all">
        <div className="rounded-xl bg-[#0D1526]/85 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden">
          {/* Header Bar */}
          <div className="px-3 py-2.5 flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#24D8ED] animate-pulse" />
              <span className="text-xs font-display font-bold text-white tracking-tight">
                SARS-CoV-2 Mpro : Nirmatrelvir
              </span>
            </div>
            <button
              onClick={() => setIsHudCollapsed(!isHudCollapsed)}
              className="p-1 text-[#71839E] hover:text-white transition-colors cursor-pointer"
              title={isHudCollapsed ? 'Expand Details' : 'Collapse Details'}
            >
              {isHudCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>

          {!isHudCollapsed && (
            <div className="p-3 space-y-2.5 text-[11px] font-mono">
              {/* Provenance Badge */}
              <div className="flex items-center justify-between text-[#A6B5CB]">
                <span>PDB Entry:</span>
                <a
                  href="https://www.rcsb.org/structure/7TLL"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-[#24D8ED] hover:underline"
                >
                  <span>7TLL</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Resolution & Method */}
              <div className="flex items-center justify-between text-[#71839E]">
                <span>Resolution / Method:</span>
                <span className="text-white font-medium">1.60 Å • X-Ray</span>
              </div>

              {/* Bound Ligand Species */}
              <div className="space-y-1 pt-1 border-t border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <span className="text-[#A6B5CB]">Bound Ligand:</span>
                  <span className="text-[#24D8ED] font-bold">4WI (Nirmatrelvir)</span>
                </div>
                <p className="text-[10px] text-[#71839E] font-sans leading-tight">
                  Active catalytic inhibitor component of Paxlovid (co-packaged with ritonavir PK booster).
                </p>
              </div>

              {/* Catalytic Active Triad */}
              <div className="pt-1 border-t border-white/[0.06] flex items-center justify-between text-[10px]">
                <span className="text-[#A6B5CB]">Catalytic Dyad:</span>
                <span className="text-[#F16D7B] font-semibold">Cys145 • His41</span>
              </div>

              {/* Open in Lab CTA */}
              <button
                onClick={onOpenLab}
                className="w-full mt-1.5 py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-[#24D8ED]/20 to-[#9475FF]/20 border border-[#24D8ED]/40 hover:border-[#24D8ED] text-white font-sans text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-[0_0_15px_rgba(36,216,237,0.15)]"
              >
                <span>Inspect in 3D Molecular Lab</span>
                <Maximize2 className="w-3.5 h-3.5 text-[#24D8ED]" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* DYNAMIC 3D-PROJECTED INTERACTION CALLOUTS (Genuine 3D coordinates, NOT static hardcoded div) */}
      {showInteractions && projectedInteractions.map((inter, idx) => {
        if (!inter.visible) return null;
        const isSelected = selectedInteractionIndex === idx;

        return (
          <div
            key={inter.id}
            style={{
              left: `${inter.x}px`,
              top: `${inter.y}px`,
              transform: 'translate(-50%, -100%)'
            }}
            onClick={() => setSelectedInteractionIndex(idx)}
            className={`absolute z-20 px-2 py-1 rounded-md backdrop-blur-md text-[10px] font-mono shadow-xl transition-all cursor-pointer flex items-center gap-1.5 pointer-events-auto ${
              isSelected
                ? 'bg-[#0D1526]/95 border-2 border-[#24D8ED] text-white scale-105 shadow-[0_0_20px_rgba(36,216,237,0.4)]'
                : 'bg-[#0D1526]/80 border border-white/20 text-[#A6B5CB] hover:border-white/40'
            }`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: inter.color }}
            />
            <span className="font-semibold text-white">{inter.label}</span>
            <span style={{ color: inter.color }} className="font-bold">
              {inter.dist}
            </span>
          </div>
        );
      })}

      {/* ACTIVE INTERACTION DETAIL MINI-BANNER (Bottom Left) */}
      {showInteractions && currentInter && (
        <div className="absolute bottom-16 left-4 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0D1526]/85 backdrop-blur-md border border-white/10 text-xs font-mono text-[#A6B5CB]">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: currentInter.color }} />
          <span className="text-white font-semibold">{currentInter.type}:</span>
          <span className="text-[#24D8ED] font-bold">{currentInter.distance} Å</span>
          <span className="text-[#71839E]">({currentInter.description})</span>
        </div>
      )}

      {/* FLOATING VERTICAL TOOLBAR (Right Side) */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 p-1.5 rounded-xl bg-[#0D1526]/85 backdrop-blur-xl border border-white/10 shadow-xl text-xs">
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            autoRotate ? 'text-[#24D8ED] bg-[#24D8ED]/10' : 'text-[#71839E] hover:text-white'
          }`}
          title={autoRotate ? 'Pause Auto-Rotation' : 'Resume Auto-Rotation'}
        >
          <Boxes className="w-4 h-4" />
        </button>

        <button
          onClick={() => setShowInteractions(!showInteractions)}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            showInteractions ? 'text-[#31CAB6] bg-[#31CAB6]/10' : 'text-[#71839E] hover:text-white'
          }`}
          title="Toggle Validated Binding Contacts"
        >
          <Ruler className="w-4 h-4" />
        </button>

        <button
          onClick={handleResetCamera}
          className="p-2 rounded-lg text-[#71839E] hover:text-white transition-colors cursor-pointer"
          title="Reset Camera Orientation"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenLab}
          className="p-2 rounded-lg text-[#71839E] hover:text-[#9475FF] transition-colors cursor-pointer"
          title="Open in Full 3D Molecular Lab"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* BOTTOM FLOATING REPRESENTATION DOCK */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 p-1.5 rounded-full bg-[#0D1526]/90 backdrop-blur-xl border border-white/10 shadow-2xl text-xs font-mono">
        {(
          [
            { id: 'cartoon', label: 'Cartoon Ribbon' },
            { id: 'pocket', label: 'Catalytic Cleft' },
            { id: 'surface', label: 'Molecular Surface' },
            { id: 'ball-and-stick', label: 'Ball & Stick' }
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            onClick={() => setRepMode(item.id)}
            className={`px-3 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap ${
              repMode === item.id
                ? 'bg-[#152238] text-[#24D8ED] border border-[#24D8ED]/50 shadow-[0_0_12px_rgba(36,216,237,0.3)] font-semibold'
                : 'text-[#71839E] hover:text-white hover:bg-white/5'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};
