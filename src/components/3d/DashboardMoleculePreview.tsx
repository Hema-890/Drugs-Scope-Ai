import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ExternalLink, Maximize2, Settings, Target } from 'lucide-react';

interface DashboardMoleculePreviewProps {
  onExpand?: () => void;
}

export const DashboardMoleculePreview: React.FC<DashboardMoleculePreviewProps> = ({ onExpand }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [repMode, setRepMode] = useState<'surface' | 'cartoon' | 'ball-and-stick'>('ball-and-stick');
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 240;
    const height = containerRef.current.clientHeight || 200;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 16);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x24D8ED, 2.0);
    dirLight1.position.set(10, 15, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x9475FF, 1.8);
    dirLight2.position.set(-10, -10, 10);
    scene.add(dirLight2);

    const group = new THREE.Group();
    scene.add(group);

    // Ball and stick molecule model
    const sphereGeo = new THREE.SphereGeometry(0.42, 16, 16);
    const atomMatCyan = new THREE.MeshStandardMaterial({ color: 0x24D8ED, roughness: 0.2, metalness: 0.3 });
    const atomMatRed = new THREE.MeshStandardMaterial({ color: 0xF16D7B, roughness: 0.2 });
    const atomMatBlue = new THREE.MeshStandardMaterial({ color: 0x4D96FF, roughness: 0.2 });
    const atomMatWhite = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.3 });

    const positions: [number, number, number, THREE.Material][] = [
      [0, 0, 0, atomMatCyan],
      [1.1, 0.7, 0.2, atomMatCyan],
      [2.0, 0.1, -0.4, atomMatBlue],
      [1.6, -1.2, -0.2, atomMatCyan],
      [0.3, -1.3, 0.4, atomMatCyan],
      [-0.8, 1.0, 0.5, atomMatRed],
      [-1.3, -0.5, 0.1, atomMatBlue],
      [-2.3, 0.2, -0.2, atomMatCyan],
      [-2.4, 1.4, 0.2, atomMatRed],
      [1.2, 1.8, 0.3, atomMatWhite],
      [2.5, -2.1, -0.6, atomMatRed]
    ];

    positions.forEach(([x, y, z, mat]) => {
      const mesh = new THREE.Mesh(sphereGeo, mat);
      mesh.position.set(x, y, z);
      group.add(mesh);
    });

    const bondMat = new THREE.MeshStandardMaterial({ color: 0x64748B, roughness: 0.4 });
    for (let i = 0; i < positions.length - 1; i++) {
      const p1 = new THREE.Vector3(positions[i][0], positions[i][1], positions[i][2]);
      const p2 = new THREE.Vector3(positions[i + 1][0], positions[i + 1][1], positions[i + 1][2]);
      const dist = p1.distanceTo(p2);
      if (dist < 1.8) {
        const cyl = new THREE.CylinderGeometry(0.1, 0.1, dist, 8);
        const bond = new THREE.Mesh(cyl, bondMat);
        bond.position.copy(p1.clone().add(p2).multiplyScalar(0.5));
        const axis = p2.clone().sub(p1).normalize();
        bond.setRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis));
        group.add(bond);
      }
    }

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      group.rotation.y += 0.006;
      group.rotation.x += 0.002;
      renderer.render(scene, camera);
    };
    animate();

    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="flex flex-col h-full justify-between">
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center flex-1">
        {/* 3D Canvas Box */}
        <div ref={containerRef} className="sm:col-span-7 h-44 relative rounded-xl bg-[#070B14]/80 overflow-hidden border border-white/5">
          <canvas ref={canvasRef} className="w-full h-full block" />
        </div>

        {/* Right Details Box (Matching Reference 2) */}
        <div className="sm:col-span-5 space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white text-xs">Paxlovid</span>
            <span className="text-[10px] text-[#A6B5CB]">(Nirmatrelvir)</span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#24D8ED]/15 text-[#24D8ED]">Drug</span>
          </div>

          <div className="text-[10px] text-[#71839E] font-mono">
            SARS-CoV-2 Mpro inhibitor
          </div>

          <div className="space-y-1 text-[10px] font-mono pt-1 text-[#A6B5CB]">
            <div className="flex justify-between">
              <span className="text-[#71839E]">Formula:</span>
              <span className="text-white">C23H32F3N5O4</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#71839E]">Weight:</span>
              <span className="text-white">499.5 g/mol</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#71839E]">Targets:</span>
              <span className="text-[#9475FF]">Mpro (6LU7)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#71839E]">Affinity (Pred):</span>
              <span className="text-[#31CAB6] font-bold">-9.2 kcal/mol</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Mode Pills matching Reference 2 */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[10px] font-mono">
        <div className="flex items-center gap-1">
          {(['surface', 'cartoon', 'ball-and-stick'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setRepMode(m)}
              className={`px-2.5 py-1 rounded-md capitalize transition-colors cursor-pointer ${
                repMode === m
                  ? 'bg-[#152238] text-[#24D8ED] font-semibold border border-[#24D8ED]/40'
                  : 'text-[#71839E] hover:text-white'
              }`}
            >
              {m === 'ball-and-stick' ? 'Ball & Stick' : m}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-[#71839E]">
          <Target className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
          <Settings className="w-3.5 h-3.5 hover:text-white cursor-pointer" />
          <Maximize2 onClick={onExpand} className="w-3.5 h-3.5 hover:text-[#24D8ED] cursor-pointer" />
        </div>
      </div>
    </div>
  );
};
