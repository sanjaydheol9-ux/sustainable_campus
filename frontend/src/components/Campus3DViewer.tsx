import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface Campus3DViewerProps {
  onSelectZone?: (zoneName: string) => void;
  selectedZone?: string | null;
}

export default function Campus3DViewer({ onSelectZone, selectedZone }: Campus3DViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [modelStatus, setModelStatus] = useState<'loading' | 'loaded_custom' | 'loaded_procedural' | 'error'>('loading');
  const [loadProgress, setLoadProgress] = useState(0);
  const [hoveredBuilding, setHoveredBuilding] = useState<string | null>(null);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const controlsRef = useRef<OrbitControls | null>(null);

  const toggleAutoRotate = useCallback(() => {
    setIsAutoRotating((prev) => {
      const next = !prev;
      if (controlsRef.current) controlsRef.current.autoRotate = next;
      return next;
    });
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // ── Scene ──────────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0a0e1a');
    scene.fog = new THREE.Fog('#0a0e1a', 80, 300);

    const W = container.clientWidth;
    const H = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 2000);
    camera.position.set(50, 40, 50);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // ── Orbit Controls ────────────────────────────────────────────────────────
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.07;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.minDistance = 2;
    controls.maxDistance = 1000;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.4;
    controlsRef.current = controls;

    // ── Lighting ──────────────────────────────────────────────────────────────
    // Hemisphere for sky/ground ambient
    const hemi = new THREE.HemisphereLight(0xd6e4f7, 0x2a3a4a, 0.8);
    scene.add(hemi);

    // Main sun-like directional light with shadows
    const sun = new THREE.DirectionalLight(0xfff5e0, 2.0);
    sun.position.set(60, 120, 80);
    sun.castShadow = true;
    sun.shadow.mapSize.set(4096, 4096);
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 800;
    sun.shadow.camera.left = -150;
    sun.shadow.camera.right = 150;
    sun.shadow.camera.top = 150;
    sun.shadow.camera.bottom = -150;
    sun.shadow.bias = -0.0005;
    sun.shadow.normalBias = 0.02;
    scene.add(sun);

    // Fill light from opposite side
    const fill = new THREE.DirectionalLight(0x9ab8d4, 0.6);
    fill.position.set(-40, 40, -60);
    scene.add(fill);

    // Subtle rim from below for richness
    const rim = new THREE.DirectionalLight(0x4a6a8a, 0.3);
    rim.position.set(0, -20, 30);
    scene.add(rim);

    // ── Ground ────────────────────────────────────────────────────────────────
    const groundGeo = new THREE.PlaneGeometry(600, 600);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1a2535,
      roughness: 0.85,
      metalness: 0.15,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Subtle grid on the ground
    const grid = new THREE.GridHelper(300, 60, 0x2a3a4a, 0x1a2535);
    grid.position.y = 0.01;
    scene.add(grid);

    // ── Load the .glb model ───────────────────────────────────────────────────
    const loader = new GLTFLoader();
    const clickableObjects: THREE.Object3D[] = [];

    loader.load(
      '/models/A1.glb',
      (gltf) => {
        const model = gltf.scene;

        // ── Step 1: Measure original bounding box BEFORE any repositioning ──
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // ── Step 2: Reposition so model sits ON the ground (y = 0) ─────────
        // Move X/Z to center, move Y so bottom of model is at y = 0
        model.position.set(
          -center.x,
          -box.min.y,       // lift so bottom face = 0
          -center.z
        );

        // ── Step 3: Enhance existing materials (DON'T replace them) ─────────
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            // Enhance each existing material with better PBR properties
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.forEach((mat) => {
              if (!mat) return;
              if (mat instanceof THREE.MeshStandardMaterial ||
                  mat instanceof THREE.MeshPhysicalMaterial) {
                mat.envMapIntensity = 1.0;
                // Ensure proper color space
                if (mat.map) mat.map.colorSpace = THREE.SRGBColorSpace;
                if (mat.emissiveMap) mat.emissiveMap.colorSpace = THREE.SRGBColorSpace;
                mat.needsUpdate = true;
              } else if (mat instanceof THREE.MeshLambertMaterial ||
                         mat instanceof THREE.MeshPhongMaterial) {
                // SketchUp often exports Lambert/Phong — convert to Standard
                // while PRESERVING original color
                const color = mat.color ? mat.color.clone() : new THREE.Color(0xcccccc);
                const newMat = new THREE.MeshStandardMaterial({
                  color: color,
                  roughness: 0.6,
                  metalness: 0.1,
                  map: (mat as any).map || null,
                });
                if ((mat as any).map) (mat as any).map.colorSpace = THREE.SRGBColorSpace;
                mesh.material = newMat;
              }
            });

            clickableObjects.push(mesh);
          }
        });

        scene.add(model);

        // ── Step 4: Auto-frame camera ────────────────────────────────────────
        const fov = camera.fov * (Math.PI / 180);
        const maxDim = Math.max(size.x, size.y, size.z);
        const camDist = (maxDim / 2) / Math.tan(fov / 2) * 2.5;

        // Position camera at a nice 3/4 view angle
        const targetY = size.y * 0.4;
        camera.position.set(camDist * 0.8, camDist * 0.55, camDist * 0.8);
        camera.lookAt(0, targetY, 0);

        controls.target.set(0, targetY, 0);
        controls.minDistance = maxDim * 0.3;
        controls.maxDistance = maxDim * 10;
        controls.update();

        // ── Step 5: Scale sun shadow camera to fit model ─────────────────────
        const pad = maxDim * 0.7;
        sun.shadow.camera.left = -maxDim - pad;
        sun.shadow.camera.right = maxDim + pad;
        sun.shadow.camera.top = maxDim + pad;
        sun.shadow.camera.bottom = -maxDim - pad;
        sun.shadow.camera.updateProjectionMatrix();

        setModelStatus('loaded_custom');
        setLoadProgress(100);
      },
      (progress) => {
        if (progress.total > 0) {
          setLoadProgress(Math.round((progress.loaded / progress.total) * 100));
        }
      },
      (_err) => {
        // Fallback: build a nice procedural campus twin
        buildProceduralCampus();
        setModelStatus('loaded_procedural');
        setLoadProgress(100);
      }
    );

    // ── Procedural Fallback Campus ────────────────────────────────────────────
    function buildProceduralCampus() {
      const buildings = [
        { name: 'Zone 01 · North Hall',       x: -18, z: -14, w: 12, h: 10, d: 16, color: 0x2d4a6b },
        { name: 'Zone 02 · Central Library',  x:  10, z: -15, w: 18, h: 16, d: 14, color: 0x3b5a7a },
        { name: 'Zone 03 · Science Complex',  x: -10, z:  14, w: 16, h: 20, d: 18, color: 0x4a6a8a },
        { name: 'Zone 04 · Innovation Quad',  x:  16, z:  12, w: 14, h: 12, d: 12, color: 0x5a7a9a },
      ];

      buildings.forEach((b) => {
        const group = new THREE.Group();
        group.position.set(b.x, 0, b.z);

        // Main body
        const bodyGeo = new THREE.BoxGeometry(b.w, b.h, b.d);
        const bodyMat = new THREE.MeshStandardMaterial({
          color: b.color,
          roughness: 0.55,
          metalness: 0.3,
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = b.h / 2;
        body.castShadow = true;
        body.receiveShadow = true;
        body.name = b.name;
        group.add(body);
        clickableObjects.push(body);

        // Glass facade panels
        const glassGeo = new THREE.BoxGeometry(b.w + 0.1, b.h * 0.7, 0.2);
        const glassMat = new THREE.MeshPhysicalMaterial({
          color: 0x88aacc,
          roughness: 0.05,
          metalness: 0.1,
          transmission: 0.7,
          transparent: true,
          opacity: 0.5,
        });
        const glassFront = new THREE.Mesh(glassGeo, glassMat);
        glassFront.position.set(0, b.h * 0.5, b.d / 2 + 0.1);
        group.add(glassFront);

        // Flat roof
        const roofGeo = new THREE.BoxGeometry(b.w + 0.5, 0.4, b.d + 0.5);
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x1a2a3a, roughness: 0.8 });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = b.h + 0.2;
        roof.castShadow = true;
        group.add(roof);

        scene.add(group);
      });

      // Frame camera to campus
      camera.position.set(55, 40, 55);
      controls.target.set(0, 10, 0);
      controls.update();
    }

    // ── Raycasting / Interaction ──────────────────────────────────────────────
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(clickableObjects, true);

      if (hits.length > 0) {
        const obj = hits[0].object;
        const name = obj.name || obj.parent?.name || 'Structure';
        setHoveredBuilding(name && name !== '' ? name : 'Campus Structure');
        container.style.cursor = 'pointer';
      } else {
        setHoveredBuilding(null);
        container.style.cursor = 'default';
      }
    };

    const onClick = () => {
      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObjects(clickableObjects, true);
      if (hits.length > 0) {
        const name = hits[0].object.name || hits[0].object.parent?.name;
        if (name && onSelectZone) onSelectZone(name);
      }
    };

    container.addEventListener('mousemove', onMouseMove);
    container.addEventListener('click', onClick);

    // ── Resize ────────────────────────────────────────────────────────────────
    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // ── Render Loop ───────────────────────────────────────────────────────────
    let rafId: number;
    const animate = () => {
      rafId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      container.removeEventListener('mousemove', onMouseMove);
      container.removeEventListener('click', onClick);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onSelectZone]);

  return (
    <div className="relative w-full h-[520px] rounded-3xl overflow-hidden border border-white/10 shadow-[0_16px_64px_0_rgba(0,0,0,0.8)] bg-[#0a0e1a]">
      {/* Three.js mount point */}
      <div ref={mountRef} className="w-full h-full" />

      {/* ── Loading screen ───────────────────────────────────────────────────── */}
      {modelStatus === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0e1a] z-20 gap-5">
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full border border-white/10" />
            <div className="absolute inset-0 rounded-full border-t-2 border-white/70 animate-spin" />
            <div
              className="absolute inset-2 rounded-full border-t border-white/30 animate-spin"
              style={{ animationDirection: 'reverse', animationDuration: '2s' }}
            />
            <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-white">
              {loadProgress}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-[11px] font-mono tracking-[0.25em] uppercase text-white/40">
              Parsing Campus Model
            </div>
            <div className="w-48 h-0.5 bg-white/10 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-white/70 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${loadProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Status pill ──────────────────────────────────────────────────────── */}
      {modelStatus !== 'loading' && (
        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm border border-white/15 text-[11px] font-mono text-white/75">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399] animate-pulse" />
          {modelStatus === 'loaded_custom' ? 'A1.GLB · LIVE TWIN' : 'PROCEDURAL TWIN · LIVE'}
        </div>
      )}

      {/* ── Controls row ─────────────────────────────────────────────────────── */}
      {modelStatus !== 'loading' && (
        <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
          <button
            onClick={toggleAutoRotate}
            className={`px-3 py-1.5 rounded-full text-[10px] font-mono border transition-all backdrop-blur-sm ${
              isAutoRotating
                ? 'bg-white/20 border-white/30 text-white'
                : 'bg-black/40 border-white/10 text-white/40 hover:text-white hover:border-white/25'
            }`}
          >
            {isAutoRotating ? '⟳ AUTO-ROTATE ON' : '⏸ AUTO-ROTATE OFF'}
          </button>
          <div className="hidden sm:flex px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-[10px] font-mono text-white/35 items-center gap-1">
            <span>Drag</span><span className="text-white/15">·</span>
            <span>Scroll</span><span className="text-white/15">·</span>
            <span>Right-Pan</span>
          </div>
        </div>
      )}

      {/* ── Hover tooltip ────────────────────────────────────────────────────── */}
      {hoveredBuilding && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-16 z-10 px-4 py-2.5 rounded-xl bg-black/75 backdrop-blur-md border border-white/20 shadow-xl text-xs pointer-events-none whitespace-nowrap">
          <div className="text-[9px] font-mono text-white/35 uppercase tracking-widest mb-0.5">Structure</div>
          <div className="font-semibold text-white">{hoveredBuilding}</div>
          <div className="text-[9px] text-white/40 font-mono mt-0.5">Click to inspect telemetry →</div>
        </div>
      )}

      {/* ── Selected zone strip ───────────────────────────────────────────────── */}
      {selectedZone ? (
        <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between px-4 py-2 rounded-xl bg-black/65 backdrop-blur-md border border-white/20 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#34d399]" />
            <span className="text-white/45">SECTOR:</span>
            <span className="text-white font-semibold max-w-[200px] truncate">{selectedZone}</span>
          </div>
          <div className="flex gap-4 text-white/40">
            <span>Load <strong className="text-white/75">418 kW</strong></span>
            <span>Health <strong className="text-white/75">98.4%</strong></span>
          </div>
        </div>
      ) : (
        modelStatus === 'loaded_custom' && (
          <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between px-4 py-2 rounded-xl bg-black/40 backdrop-blur-sm border border-white/10 text-[10px] font-mono text-white/30">
            <span>A1.glb · 567 KB · Original SketchUp materials preserved</span>
            <span>Click any part of the building to inspect</span>
          </div>
        )
      )}
    </div>
  );
}
