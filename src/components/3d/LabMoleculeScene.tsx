import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Camera,
  Maximize2,
  Minimize2,
  MousePointer,
  Play,
  Pause,
  RotateCcw,
  Ruler,
  Settings,
  Target,
  Box,
  Check
} from 'lucide-react';

export interface ResidueInteraction {
  id: string;
  residue: string;
  chain: string;
  resSeq: number;
  type: string;
  distance: string;
  color: string;
  position: [number, number, number];
}

interface LabMoleculeSceneProps {
  structureId?: string;
  structureTitle?: string;
  resolution?: string;
  onSelectResidue?: (res: ResidueInteraction) => void;
  selectedResidueId?: string;
}

export const LabMoleculeScene: React.FC<LabMoleculeSceneProps> = ({
  structureId = '7K3N',
  structureTitle = 'SARS-CoV-2 Main Protease (Mpro)',
  resolution = '2.1 Å',
  onSelectResidue,
  selectedResidueId = 'cys145'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Viewer modes
  const [repMode, setRepMode] = useState<'cartoon' | 'surface' | 'ball-stick' | 'licorice' | 'space-fill'>('cartoon');
  const [showProtein, setShowProtein] = useState(true);
  const [showLigand, setShowLigand] = useState(true);
  const [showInteractions, setShowInteractions] = useState(true);
  const [showSurface, setShowSurface] = useState(true);
  const [isRotating, setIsRotating] = useState(true);
  const [activeTool, setActiveTool] = useState<'select' | 'measure' | 'focus'>('select');
  const [measuredDistance, setMeasuredDistance] = useState<string | null>(null);

  // Residue interaction pins
  const interactions: ResidueInteraction[] = [
    { id: 'cys145', residue: 'Cys145', chain: 'A', resSeq: 145, type: 'Covalent bond (S-C)', distance: '2.0 Å', color: '#F16D7B', position: [0.8, 1.2, 0.4] },
    { id: 'his41', residue: 'His41', chain: 'A', resSeq: 41, type: 'Hydrogen bond', distance: '2.8 Å', color: '#24D8ED', position: [-1.4, 1.1, -0.6] },
    { id: 'glu166', residue: 'Glu166', chain: 'A', resSeq: 166, type: 'Hydrogen bond', distance: '3.1 Å', color: '#24D8ED', position: [2.1, 0.1, -0.8] },
    { id: 'his163', residue: 'His163', chain: 'A', resSeq: 163, type: 'π-π stacking', distance: '3.6 Å', color: '#9475FF', position: [1.8, -0.8, 0.9] },
    { id: 'gln189', residue: 'Gln189', chain: 'A', resSeq: 189, type: 'Hydrogen bond', distance: '2.9 Å', color: '#24D8ED', position: [0.3, -1.6, -0.5] }
  ];

  // Screen projections for residue labels
  const [projectedLabels, setProjectedLabels] = useState<
    { id: string; name: string; x: number; y: number; visible: boolean; dist: string; color: string }[]
  >([]);

  // Three.js references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const moleculeGroupRef = useRef<THREE.Group | null>(null);
  const proteinGroupRef = useRef<THREE.Group | null>(null);
  const ligandGroupRef = useRef<THREE.Group | null>(null);
  const surfaceGroupRef = useRef<THREE.Group | null>(null);
  const interactionGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });
  const rotVelocityRef = useRef({ x: 0, y: 0.003 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 650;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(0, 0, 18);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x24d8ed, 1.8);
    dirLight1.position.set(10, 15, 12);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x9475ff, 1.4);
    dirLight2.position.set(-12, -10, -8);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0x31cab6, 2.0, 30);
    pointLight.position.set(0, 2, 5);
    scene.add(pointLight);

    // Root Molecule Group
    const rootGroup = new THREE.Group();
    scene.add(rootGroup);
    moleculeGroupRef.current = rootGroup;

    // 1. Protein Ribbon Group
    const proteinGroup = new THREE.Group();
    rootGroup.add(proteinGroup);
    proteinGroupRef.current = proteinGroup;

    // Build alpha helices & beta sheets
    const buildProteinRibbons = () => {
      // Helix 1 (Cyan to Blue)
      const helix1Points: THREE.Vector3[] = [];
      const turns = 4.5;
      const pointsCount = 140;
      for (let i = 0; i <= pointsCount; i++) {
        const t = (i / pointsCount) * (Math.PI * 2 * turns);
        const r = 2.4 + Math.sin(i * 0.05) * 0.4;
        const x = Math.cos(t) * r - 3.8;
        const y = (i / pointsCount) * 8.5 - 4.2;
        const z = Math.sin(t) * r + 0.8;
        helix1Points.push(new THREE.Vector3(x, y, z));
      }
      const curve1 = new THREE.CatmullRomCurve3(helix1Points);
      const tubeGeo1 = new THREE.TubeGeometry(curve1, 100, 0.45, 12, false);
      const tubeMat1 = new THREE.MeshStandardMaterial({
        color: 0x24d8ed,
        roughness: 0.25,
        metalness: 0.65,
        emissive: 0x0f4b66,
        emissiveIntensity: 0.35
      });
      const tubeMesh1 = new THREE.Mesh(tubeGeo1, tubeMat1);
      proteinGroup.add(tubeMesh1);

      // Helix 2 (Violet / Magenta)
      const helix2Points: THREE.Vector3[] = [];
      for (let i = 0; i <= 120; i++) {
        const t = (i / 120) * (Math.PI * 2 * 3.8);
        const r = 2.2;
        const x = Math.cos(t + 1.2) * r + 3.6;
        const y = (i / 120) * 7.5 - 3.8;
        const z = Math.sin(t + 1.2) * r - 1.2;
        helix2Points.push(new THREE.Vector3(x, y, z));
      }
      const curve2 = new THREE.CatmullRomCurve3(helix2Points);
      const tubeGeo2 = new THREE.TubeGeometry(curve2, 90, 0.42, 12, false);
      const tubeMat2 = new THREE.MeshStandardMaterial({
        color: 0x9475ff,
        roughness: 0.2,
        metalness: 0.7,
        emissive: 0x361a7a,
        emissiveIntensity: 0.4
      });
      const tubeMesh2 = new THREE.Mesh(tubeGeo2, tubeMat2);
      proteinGroup.add(tubeMesh2);

      // Connecting Loop Ribbon (Medical Teal)
      const loopPoints: THREE.Vector3[] = [
        helix1Points[helix1Points.length - 1],
        new THREE.Vector3(-1.5, 4.8, 1.5),
        new THREE.Vector3(0.5, 4.2, -1.0),
        new THREE.Vector3(2.5, 4.0, 0.5),
        helix2Points[helix2Points.length - 1]
      ];
      const curveLoop = new THREE.CatmullRomCurve3(loopPoints);
      const loopGeo = new THREE.TubeGeometry(curveLoop, 40, 0.3, 10, false);
      const loopMat = new THREE.MeshStandardMaterial({
        color: 0x31cab6,
        roughness: 0.3,
        metalness: 0.5
      });
      const loopMesh = new THREE.Mesh(loopGeo, loopMat);
      proteinGroup.add(loopMesh);

      // Lower Arch Loop
      const lowerLoopPoints: THREE.Vector3[] = [
        helix1Points[0],
        new THREE.Vector3(-2.0, -4.6, -1.0),
        new THREE.Vector3(0.0, -4.2, 1.2),
        new THREE.Vector3(2.2, -4.5, -0.8),
        helix2Points[0]
      ];
      const curveLower = new THREE.CatmullRomCurve3(lowerLoopPoints);
      const lowerGeo = new THREE.TubeGeometry(curveLower, 40, 0.3, 10, false);
      const lowerMesh = new THREE.Mesh(lowerGeo, loopMat);
      proteinGroup.add(lowerMesh);
    };
    buildProteinRibbons();

    // 2. Active Site Semi-Transparent Molecular Cavity Surface
    const surfaceGroup = new THREE.Group();
    rootGroup.add(surfaceGroup);
    surfaceGroupRef.current = surfaceGroup;

    const pocketGeo = new THREE.IcosahedronGeometry(2.8, 3);
    // Deform vertices slightly to look like biological binding pocket
    const posAttr = pocketGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const vx = posAttr.getX(i);
      const vy = posAttr.getY(i);
      const vz = posAttr.getZ(i);
      const noise = Math.sin(vx * 2.5) * Math.cos(vy * 2.5) * 0.35;
      posAttr.setXYZ(i, vx * (1 + noise), vy * (1 + noise), vz * (1 + noise));
    }
    pocketGeo.computeVertexNormals();

    const pocketMat = new THREE.MeshPhysicalMaterial({
      color: 0x18427a,
      roughness: 0.15,
      metalness: 0.1,
      transmission: 0.65,
      opacity: 0.45,
      transparent: true,
      wireframe: false,
      side: THREE.DoubleSide
    });
    const pocketMesh = new THREE.Mesh(pocketGeo, pocketMat);
    pocketMesh.position.set(0.3, 0.2, 0.0);
    surfaceGroup.add(pocketMesh);

    // 3. Ligand (N3 / Nirmatrelvir Inhibitor) in Active Site Pocket
    const ligandGroup = new THREE.Group();
    rootGroup.add(ligandGroup);
    ligandGroupRef.current = ligandGroup;

    // Atom definitions [x, y, z, element, radius]
    const ligandAtoms: [number, number, number, string, number][] = [
      [0.0, 0.0, 0.0, 'C', 0.26],
      [0.6, 0.5, 0.2, 'C', 0.26],
      [-0.6, 0.4, -0.2, 'N', 0.26],
      [1.4, 0.1, 0.1, 'C', 0.26],
      [1.8, -0.7, 0.8, 'O', 0.28],
      [0.4, 1.5, 0.3, 'O', 0.28],
      [-1.3, -0.2, 0.1, 'C', 0.26],
      [-2.1, 0.5, 0.7, 'C', 0.26],
      [-0.8, -1.2, 0.4, 'N', 0.26],
      [0.2, -1.0, 0.1, 'C', 0.26],
      [-1.8, -1.6, -0.3, 'C', 0.26],
      [0.8, 1.1, 0.4, 'S', 0.32] // Cys145 covalent attachment atom
    ];

    const getElementColor = (elem: string) => {
      switch (elem) {
        case 'C': return 0x24d8ed; // Cyan
        case 'N': return 0x4d96ff; // Blue
        case 'O': return 0xf16d7b; // Red
        case 'S': return 0xf2b961; // Yellow/Amber
        default: return 0xffffff;
      }
    };

    ligandAtoms.forEach(([x, y, z, elem, r]) => {
      const atomGeo = new THREE.SphereGeometry(r, 16, 16);
      const atomMat = new THREE.MeshStandardMaterial({
        color: getElementColor(elem),
        roughness: 0.2,
        metalness: 0.4,
        emissive: getElementColor(elem),
        emissiveIntensity: 0.2
      });
      const atomMesh = new THREE.Mesh(atomGeo, atomMat);
      atomMesh.position.set(x + 0.2, y + 0.1, z);
      ligandGroup.add(atomMesh);
    });

    // Ligand Bonds (cylinders between consecutive atoms)
    for (let i = 0; i < ligandAtoms.length - 1; i++) {
      const p1 = new THREE.Vector3(ligandAtoms[i][0] + 0.2, ligandAtoms[i][1] + 0.1, ligandAtoms[i][2]);
      const p2 = new THREE.Vector3(ligandAtoms[i + 1][0] + 0.2, ligandAtoms[i + 1][1] + 0.1, ligandAtoms[i + 1][2]);
      const dist = p1.distanceTo(p2);
      if (dist < 1.4) {
        const bondGeo = new THREE.CylinderGeometry(0.08, 0.08, dist, 8);
        const bondMat = new THREE.MeshStandardMaterial({
          color: 0xd8e4f5,
          roughness: 0.3,
          metalness: 0.2
        });
        const bondMesh = new THREE.Mesh(bondGeo, bondMat);
        bondMesh.position.copy(p1).lerp(p2, 0.5);
        bondMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), p2.clone().sub(p1).normalize());
        ligandGroup.add(bondMesh);
      }
    }

    // 4. Interaction Dotted Lines & Pins
    const interactionGroup = new THREE.Group();
    rootGroup.add(interactionGroup);
    interactionGroupRef.current = interactionGroup;

    interactions.forEach((inter) => {
      const ligCenter = new THREE.Vector3(0.2, 0.1, 0);
      const resPos = new THREE.Vector3(...inter.position);

      // Dotted line
      const points = [ligCenter, resPos];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      const lineMat = new THREE.LineDashedMaterial({
        color: inter.id === 'cys145' ? 0xf16d7b : inter.id === 'his163' ? 0x9475ff : 0x24d8ed,
        dashSize: 0.15,
        gapSize: 0.1,
        linewidth: 2
      });
      const line = new THREE.Line(lineGeo, lineMat);
      line.computeLineDistances();
      interactionGroup.add(line);

      // Contact Sphere at residue anchor
      const anchorGeo = new THREE.SphereGeometry(0.18, 12, 12);
      const anchorMat = new THREE.MeshStandardMaterial({
        color: inter.id === 'cys145' ? 0xf16d7b : inter.id === 'his163' ? 0x9475ff : 0x24d8ed,
        emissive: inter.id === 'cys145' ? 0xf16d7b : 0x24d8ed,
        emissiveIntensity: 0.6
      });
      const anchorMesh = new THREE.Mesh(anchorGeo, anchorMat);
      anchorMesh.position.copy(resPos);
      interactionGroup.add(anchorMesh);
    });

    // Animation Loop & Screen Projections
    const animate = () => {
      if (isRotating && !isDraggingRef.current) {
        rootGroup.rotation.y += rotVelocityRef.current.y;
      }

      renderer.render(scene, camera);

      // Project 3D interaction points to 2D screen coordinates
      const proj = interactions.map((inter) => {
        const v = new THREE.Vector3(...inter.position);
        v.applyMatrix4(rootGroup.matrixWorld);
        v.project(camera);

        const hw = width / 2;
        const hh = height / 2;
        const screenX = v.x * hw + hw;
        const screenY = -(v.y * hh) + hh;

        return {
          id: inter.id,
          name: inter.residue,
          x: screenX,
          y: screenY,
          visible: v.z < 1.0,
          dist: inter.distance,
          color: inter.color
        };
      });
      setProjectedLabels(proj);

      animFrameIdRef.current = requestAnimationFrame(animate);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [structureId]);

  // Visibility Toggles
  useEffect(() => {
    if (proteinGroupRef.current) proteinGroupRef.current.visible = showProtein;
    if (ligandGroupRef.current) ligandGroupRef.current.visible = showLigand;
    if (surfaceGroupRef.current) surfaceGroupRef.current.visible = showSurface;
    if (interactionGroupRef.current) interactionGroupRef.current.visible = showInteractions;
  }, [showProtein, showLigand, showSurface, showInteractions]);

  // Mouse Interaction (Orbit Drag & Zoom)
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !moleculeGroupRef.current) return;
    const deltaX = e.clientX - prevMouseRef.current.x;
    const deltaY = e.clientY - prevMouseRef.current.y;

    moleculeGroupRef.current.rotation.y += deltaX * 0.007;
    moleculeGroupRef.current.rotation.x += deltaY * 0.007;

    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!cameraRef.current) return;
    cameraRef.current.position.z = Math.max(8, Math.min(35, cameraRef.current.position.z + e.deltaY * 0.015));
  };

  const resetCamera = () => {
    if (!cameraRef.current || !moleculeGroupRef.current) return;
    cameraRef.current.position.set(0, 0, 18);
    moleculeGroupRef.current.rotation.set(0, 0, 0);
  };

  const captureScreenshot = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${structureId}-molecular-lab.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[580px] lg:min-h-[700px] bg-[#050913] rounded-2xl overflow-hidden border border-white/[0.08] select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* 3D Canvas */}
      <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

      {/* Top-Left Floating Structure Metadata Badge */}
      <div className="absolute top-4 left-4 z-20 pointer-events-auto">
        <div className="bg-[#0B1120]/85 backdrop-blur-md border border-white/10 rounded-xl p-3.5 shadow-2xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#24D8ED]/20 to-[#9475FF]/20 border border-[#24D8ED]/30 flex items-center justify-center shrink-0">
            <Box className="w-5 h-5 text-[#24D8ED]" />
          </div>
          <div>
            <div className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <span>{structureTitle}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] font-mono text-[#24D8ED]">PDB: {structureId}</span>
              <span className="text-[11px] text-[#71839E]">•</span>
              <span className="text-[11px] font-mono text-[#A6B5CB]">{resolution} Resolution</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#24D8ED]/10 text-[#24D8ED] border border-[#24D8ED]/30">
                Protein-Ligand Complex
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#9475FF]/10 text-[#9475FF] border border-[#9475FF]/30">
                Viral Target
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating 3D Residue Badges */}
      {showInteractions &&
        projectedLabels.map((item) => {
          if (!item.visible) return null;
          const isSelected = selectedResidueId?.toLowerCase() === item.id.toLowerCase();
          return (
            <div
              key={item.id}
              style={{
                left: `${item.x}px`,
                top: `${item.y}px`,
                transform: 'translate(-50%, -120%)'
              }}
              onClick={(e) => {
                e.stopPropagation();
                const matched = interactions.find((i) => i.id === item.id);
                if (matched && onSelectResidue) onSelectResidue(matched);
              }}
              className={`absolute z-10 cursor-pointer pointer-events-auto transition-transform hover:scale-110 ${
                isSelected ? 'scale-115' : ''
              }`}
            >
              <div
                className="px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold shadow-lg backdrop-blur-md flex items-center gap-1.5 border"
                style={{
                  backgroundColor: isSelected ? 'rgba(36, 216, 237, 0.25)' : 'rgba(11, 17, 32, 0.85)',
                  borderColor: isSelected ? item.color : 'rgba(255, 255, 255, 0.15)',
                  color: isSelected ? '#FFFFFF' : item.color
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name}</span>
                <span className="text-[9px] text-[#A6B5CB] opacity-80">{item.dist}</span>
              </div>
            </div>
          );
        })}

      {/* Top-Right Floating Tool Icons */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 bg-[#0B1120]/80 backdrop-blur-md border border-white/10 p-1.5 rounded-xl shadow-xl pointer-events-auto">
        <button
          onClick={() => setActiveTool('select')}
          title="Selection Cursor"
          className={`p-2 rounded-lg transition-all ${
            activeTool === 'select' ? 'bg-[#24D8ED] text-[#070B14]' : 'text-[#A6B5CB] hover:bg-white/10 hover:text-white'
          }`}
        >
          <MousePointer className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setActiveTool('measure');
            setMeasuredDistance('2.8 Å (His41 - O1)');
          }}
          title="Measurement Tool"
          className={`p-2 rounded-lg transition-all ${
            activeTool === 'measure' ? 'bg-[#24D8ED] text-[#070B14]' : 'text-[#A6B5CB] hover:bg-white/10 hover:text-white'
          }`}
        >
          <Ruler className="w-4 h-4" />
        </button>
        <button
          onClick={resetCamera}
          title="Reset Camera"
          className="p-2 rounded-lg text-[#A6B5CB] hover:bg-white/10 hover:text-white transition-all"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            if (cameraRef.current) cameraRef.current.position.set(0, 0, 11);
          }}
          title="Focus Binding Pocket"
          className="p-2 rounded-lg text-[#A6B5CB] hover:bg-white/10 hover:text-white transition-all"
        >
          <Target className="w-4 h-4" />
        </button>
        <button
          onClick={captureScreenshot}
          title="Capture High-Res Screenshot"
          className="p-2 rounded-lg text-[#A6B5CB] hover:bg-white/10 hover:text-white transition-all"
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Floating Control Dock */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 bg-[#0B1120]/90 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-2xl shadow-2xl pointer-events-auto">
        {/* Play/Pause Rotation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              isRotating ? 'bg-[#24D8ED]/15 text-[#24D8ED]' : 'bg-white/5 text-[#A6B5CB] hover:text-white'
            }`}
            title={isRotating ? 'Pause Rotation' : 'Start Auto-Rotation'}
          >
            {isRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          {/* Representation Selector */}
          <div className="flex items-center gap-1 bg-[#070B14] p-1 rounded-xl border border-white/[0.08]">
            {(
              [
                { id: 'cartoon', label: 'Cartoon' },
                { id: 'surface', label: 'Surface' },
                { id: 'ball-stick', label: 'Ball & Stick' },
                { id: 'licorice', label: 'Licorice' },
                { id: 'space-fill', label: 'Space Fill' }
              ] as const
            ).map((mode) => (
              <button
                key={mode.id}
                onClick={() => setRepMode(mode.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  repMode === mode.id
                    ? 'bg-[#24D8ED] text-[#070B14] font-semibold shadow-sm'
                    : 'text-[#A6B5CB] hover:text-white hover:bg-white/5'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Component Visibility Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowProtein(!showProtein)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all border ${
              showProtein
                ? 'bg-[#24D8ED]/10 border-[#24D8ED]/30 text-[#24D8ED]'
                : 'bg-white/[0.02] border-white/5 text-[#71839E]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#24D8ED]" />
            Protein
          </button>
          <button
            onClick={() => setShowLigand(!showLigand)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all border ${
              showLigand
                ? 'bg-[#9475FF]/10 border-[#9475FF]/30 text-[#9475FF]'
                : 'bg-white/[0.02] border-white/5 text-[#71839E]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#9475FF]" />
            Ligand
          </button>
          <button
            onClick={() => setShowInteractions(!showInteractions)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all border ${
              showInteractions
                ? 'bg-[#31CAB6]/10 border-[#31CAB6]/30 text-[#31CAB6]'
                : 'bg-white/[0.02] border-white/5 text-[#71839E]'
            }`}
          >
            <span className="w-2 h-0.5 bg-[#31CAB6]" />
            Interactions
          </button>
          <button
            onClick={() => setShowSurface(!showSurface)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all border ${
              showSurface
                ? 'bg-[#24D8ED]/10 border-[#24D8ED]/30 text-[#24D8ED]'
                : 'bg-white/[0.02] border-white/5 text-[#71839E]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#24D8ED]/50" />
            Surface
          </button>
        </div>

        {/* Auxiliary Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {}}
            className="p-1.5 rounded-lg text-[#A6B5CB] hover:bg-white/10 hover:text-white transition-all"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (containerRef.current) {
                if (document.fullscreenElement) {
                  document.exitFullscreen();
                } else {
                  containerRef.current.requestFullscreen();
                }
              }
            }}
            className="p-1.5 rounded-lg text-[#A6B5CB] hover:bg-white/10 hover:text-white transition-all"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
