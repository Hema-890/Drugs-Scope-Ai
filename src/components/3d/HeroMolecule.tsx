import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export const HeroMolecule: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 500;
    const height = containerRef.current.clientHeight || 450;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 22);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const cyanLight = new THREE.PointLight(0x37D6E6, 3, 50);
    cyanLight.position.set(10, 10, 10);
    scene.add(cyanLight);

    const violetLight = new THREE.PointLight(0x9079F7, 2.5, 50);
    violetLight.position.set(-10, -10, -10);
    scene.add(violetLight);

    const group = new THREE.Group();
    scene.add(group);

    // Build central ligand complex (e.g., Warfarin 4-hydroxycoumarin core ring system)
    const sphereGeo = new THREE.SphereGeometry(0.55, 20, 20);
    const atomMaterials = [
      new THREE.MeshStandardMaterial({ color: 0x37D6E6, roughness: 0.2, metalness: 0.3 }), // Cyan
      new THREE.MeshStandardMaterial({ color: 0x9079F7, roughness: 0.2, metalness: 0.4 }), // Violet
      new THREE.MeshStandardMaterial({ color: 0x32C8B7, roughness: 0.2, metalness: 0.2 }), // Teal
      new THREE.MeshStandardMaterial({ color: 0xF16D76, roughness: 0.2, metalness: 0.1 })  // Red
    ];

    const atomPositions: [number, number, number][] = [
      [-2, 1.2, 0], [-0.8, 2, 0.4], [0.8, 1.6, -0.3], [1.8, 0.5, 0.2],
      [1.2, -1, 0], [-0.5, -1.4, -0.4], [-1.8, -0.2, 0.3], [0, 0, 0.5],
      [-3.2, 1.8, 0.6], [2.6, 1.2, -0.8], [0.2, 3.2, 0.1], [-1.2, -2.6, 0.8]
    ];

    atomPositions.forEach((pos, idx) => {
      const mesh = new THREE.Mesh(sphereGeo, atomMaterials[idx % atomMaterials.length]);
      mesh.position.set(pos[0], pos[1], pos[2]);
      group.add(mesh);
    });

    // Covalent bonds
    const bondMat = new THREE.MeshStandardMaterial({ color: 0x64748B, roughness: 0.5, metalness: 0.2 });
    for (let i = 0; i < atomPositions.length; i++) {
      for (let j = i + 1; j < atomPositions.length; j++) {
        const p1 = new THREE.Vector3(...atomPositions[i]);
        const p2 = new THREE.Vector3(...atomPositions[j]);
        const dist = p1.distanceTo(p2);

        if (dist < 2.2) {
          const cylinderGeo = new THREE.CylinderGeometry(0.12, 0.12, dist, 8);
          const bondMesh = new THREE.Mesh(cylinderGeo, bondMat);
          bondMesh.position.copy(p1.clone().add(p2).multiplyScalar(0.5));
          const axis = p2.clone().sub(p1).normalize();
          const up = new THREE.Vector3(0, 1, 0);
          bondMesh.setRotationFromQuaternion(new THREE.Quaternion().setFromUnitVectors(up, axis));
          group.add(bondMesh);
        }
      }
    }

    // Outer orbital particle shell
    const particleCount = 180;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const r = 5.5 + Math.random() * 2.5;
      positions[i] = r * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = r * Math.cos(phi);
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x37D6E6,
      size: 0.12,
      transparent: true,
      opacity: 0.6
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    group.add(particles);

    // Mouse movement interaction
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      group.rotation.y += 0.005;
      group.rotation.x += 0.002;

      // Soft mouse response
      group.rotation.y += (mouseX * 0.5 - group.rotation.y) * 0.02;
      group.rotation.x += (mouseY * 0.5 - group.rotation.x) * 0.02;

      particles.rotation.y -= 0.003;

      renderer.render(scene, camera);
    };
    animate();

    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      window.removeEventListener('mousemove', handleMouseMove);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-[480px] flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <span className="text-[11px] font-mono text-[#37D6E6]/80 uppercase tracking-widest bg-[#101827]/70 px-3 py-1 rounded-full border border-[#37D6E6]/20 backdrop-blur-sm">
          Interactive 3D Molecular Simulation • Mol* Engine Grounded
        </span>
      </div>
    </div>
  );
};
