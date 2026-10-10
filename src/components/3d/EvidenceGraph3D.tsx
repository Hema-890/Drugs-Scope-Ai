import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GraphEdge, GraphNode } from '../../types';
import {
  Camera,
  Maximize2,
  Minimize2,
  MousePointer,
  RotateCcw,
  Search,
  Sparkles,
  Layers,
  Filter,
  Eye,
  Info
} from 'lucide-react';

interface EvidenceGraph3DProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onSelectNode?: (node: GraphNode | null) => void;
  selectedNodeId?: string;
  onSelectEdge?: (edge: GraphEdge | null) => void;
}

export const EvidenceGraph3D: React.FC<EvidenceGraph3DProps> = ({
  nodes,
  edges,
  onSelectNode,
  selectedNodeId,
  onSelectEdge
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [filterType, setFilterType] = useState<'all' | 'drug' | 'enzyme' | 'receptor'>('all');
  const [viewMode, setViewMode] = useState<'3d' | '2d'>('3d');
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [nodeSearch, setNodeSearch] = useState('');

  // Three.js refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const graphGroupRef = useRef<THREE.Group | null>(null);
  const nodeMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const animFrameIdRef = useRef<number | null>(null);

  // Drag interaction
  const isDraggingRef = useRef(false);
  const prevMouseRef = useRef({ x: 0, y: 0 });

  // Filtered nodes
  const filteredNodes = nodes.filter((n) => {
    if (filterType !== 'all' && n.type !== filterType) return false;
    if (nodeSearch && !n.label.toLowerCase().includes(nodeSearch.toLowerCase())) return false;
    return true;
  });

  const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));
  const filteredEdges = edges.filter(
    (e) => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const width = container.clientWidth || 700;
    const height = container.clientHeight || 550;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 22);
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
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x24d8ed, 1.5);
    dirLight.position.set(10, 15, 10);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x9475ff, 2.0, 50);
    pointLight.position.set(-10, -10, 10);
    scene.add(pointLight);

    // Root Graph Group
    const graphGroup = new THREE.Group();
    scene.add(graphGroup);
    graphGroupRef.current = graphGroup;

    // Rebuild Graph Meshes
    nodeMeshesRef.current.clear();

    // Map positions
    const nodePositionMap = new Map<string, THREE.Vector3>();

    filteredNodes.forEach((node, idx) => {
      let pos: THREE.Vector3;
      if (node.position) {
        pos = new THREE.Vector3(
          node.position[0],
          node.position[1],
          viewMode === '2d' ? 0 : node.position[2]
        );
      } else {
        const angle = (idx / filteredNodes.length) * Math.PI * 2;
        const radius = node.type === 'drug' ? 4.5 : 7.5;
        pos = new THREE.Vector3(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          viewMode === '2d' ? 0 : (idx % 2 === 0 ? 1.5 : -1.5)
        );
      }
      nodePositionMap.set(node.id, pos);

      // Node Mesh
      const sphereGeo = new THREE.SphereGeometry(node.size || 1.0, 20, 20);
      const isSelected = selectedNodeId === node.id;
      const hexColor = parseInt(node.color.replace('#', '0x'), 16);

      const mat = new THREE.MeshStandardMaterial({
        color: hexColor,
        emissive: hexColor,
        emissiveIntensity: isSelected ? 0.8 : 0.25,
        roughness: 0.2,
        metalness: 0.5
      });

      const mesh = new THREE.Mesh(sphereGeo, mat);
      mesh.position.copy(pos);
      mesh.userData = { node };

      graphGroup.add(mesh);
      nodeMeshesRef.current.set(node.id, mesh);

      // Selected Halo Ring
      if (isSelected) {
        const ringGeo = new THREE.RingGeometry(node.size * 1.3, node.size * 1.5, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: hexColor,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.position.copy(pos);
        graphGroup.add(ringMesh);
      }
    });

    // Edges
    filteredEdges.forEach((edge) => {
      const p1 = nodePositionMap.get(edge.source);
      const p2 = nodePositionMap.get(edge.target);
      if (!p1 || !p2) return;

      const edgeHex = parseInt(edge.color.replace('#', '0x'), 16);
      const points = [p1, p2];
      const geom = new THREE.BufferGeometry().setFromPoints(points);

      if (edge.dashed) {
        const lineMat = new THREE.LineDashedMaterial({
          color: edgeHex,
          dashSize: 0.35,
          gapSize: 0.2,
          linewidth: 2
        });
        const line = new THREE.Line(geom, lineMat);
        line.computeLineDistances();
        graphGroup.add(line);
      } else {
        const lineMat = new THREE.LineBasicMaterial({
          color: edgeHex,
          transparent: true,
          opacity: 0.65,
          linewidth: 1.5
        });
        const line = new THREE.Line(geom, lineMat);
        graphGroup.add(line);
      }
    });

    // Animation Loop
    let rotSpeed = 0.0015;
    const animate = () => {
      if (!isDraggingRef.current && viewMode === '3d') {
        graphGroup.rotation.y += rotSpeed;
      }
      renderer.render(scene, camera);
      animFrameIdRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Resize
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
  }, [nodes, edges, filterType, viewMode, selectedNodeId, nodeSearch]);

  // Mouse Interactions
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !graphGroupRef.current) return;
    const deltaX = e.clientX - prevMouseRef.current.x;
    const deltaY = e.clientY - prevMouseRef.current.y;

    graphGroupRef.current.rotation.y += deltaX * 0.007;
    if (viewMode === '3d') {
      graphGroupRef.current.rotation.x += deltaY * 0.007;
    }

    prevMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!cameraRef.current) return;
    cameraRef.current.position.z = Math.max(10, Math.min(45, cameraRef.current.position.z + e.deltaY * 0.02));
  };

  // Raycasting for node clicks
  const handleClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !cameraRef.current || !sceneRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, cameraRef.current);

    const meshes = Array.from(nodeMeshesRef.current.values());
    const intersects = raycaster.intersectObjects(meshes);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const node = hit.userData.node as GraphNode;
      if (onSelectNode) onSelectNode(node);
    } else {
      if (onSelectNode) onSelectNode(null);
    }
  };

  const resetCamera = () => {
    if (!cameraRef.current || !graphGroupRef.current) return;
    cameraRef.current.position.set(0, 0, 22);
    graphGroupRef.current.rotation.set(0, 0, 0);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[520px] lg:h-[620px] bg-[#050913] rounded-2xl overflow-hidden border border-white/[0.08] select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onClick={handleClick}
    >
      <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />

      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Search & Filter Chips */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Quick Node Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#71839E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={nodeSearch}
              onChange={(e) => setNodeSearch(e.target.value)}
              placeholder="Filter nodes..."
              className="bg-[#0B1120]/90 backdrop-blur-md border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-[#71839E] focus:outline-none focus:border-[#24D8ED]"
            />
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-1 bg-[#0B1120]/90 backdrop-blur-md p-1 rounded-xl border border-white/10">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'drug', label: 'Drugs', color: '#24D8ED' },
                { id: 'enzyme', label: 'CYP Enzymes', color: '#F2B961' },
                { id: 'receptor', label: 'Receptors', color: '#9475FF' }
              ] as const
            ).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilterType(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                  filterType === cat.id
                    ? 'bg-[#152238] text-white font-semibold shadow-sm border border-white/10'
                    : 'text-[#A6B5CB] hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: 2D/3D & Camera Tools */}
        <div className="flex items-center gap-2 pointer-events-auto bg-[#0B1120]/90 backdrop-blur-md p-1 rounded-xl border border-white/10">
          <button
            onClick={() => setViewMode(viewMode === '3d' ? '2d' : '3d')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
              viewMode === '3d' ? 'bg-[#24D8ED] text-[#070B14] font-semibold' : 'text-[#A6B5CB] hover:text-white'
            }`}
          >
            {viewMode === '3d' ? '3D Graph' : '2D Plane'}
          </button>
          <button
            onClick={resetCamera}
            title="Reset Camera"
            className="p-1.5 rounded-lg text-[#A6B5CB] hover:text-white hover:bg-white/5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Floating Legend Dock */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 bg-[#0B1120]/90 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl pointer-events-auto text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#24D8ED]" />
            <span className="text-[#A6B5CB]">Active Compounds</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F2B961]" />
            <span className="text-[#A6B5CB]">CYP Enzymes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#9475FF]" />
            <span className="text-[#A6B5CB]">Receptors / Channels</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t border-dashed border-[#F16D7B]" />
            <span className="text-[#F16D7B]">Conflict Axis</span>
          </div>
        </div>

        <div className="text-[11px] text-[#71839E] flex items-center gap-1">
          <MousePointer className="w-3 h-3 text-[#24D8ED]" />
          <span>Click any node to inspect evidence</span>
        </div>
      </div>
    </div>
  );
};
