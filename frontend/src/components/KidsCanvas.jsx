import React, { useEffect, useRef } from "react";
import * as THREE from "three";

/*
 * A subtle WebGL backdrop of low-poly shapes in the brand-green palette,
 * gently bobbing and rotating. Purely decorative:
 *  - sits behind the hero content (pointer-events: none)
 *  - capped device-pixel-ratio for performance
 *  - fully disposed on unmount
 *  - skipped entirely when the user prefers reduced motion or WebGL is absent
 */
export default function KidsCanvas({ className }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const prefersReduced =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      return; // no WebGL — the doodles/content stand on their own
    }

    const width = mount.clientWidth || 1;
    const height = mount.clientHeight || 1;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 9;

    scene.add(new THREE.AmbientLight(0xffffff, 0.85));
    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(4, 6, 8);
    scene.add(key);

    const greens = [0x16a34a, 0x22c55e, 0x15803d, 0x4ade80, 0x86efac];
    const geoms = [
      new THREE.IcosahedronGeometry(1, 0),
      new THREE.TorusGeometry(0.7, 0.28, 12, 24),
      new THREE.DodecahedronGeometry(1, 0),
      new THREE.OctahedronGeometry(1, 0),
      new THREE.ConeGeometry(0.8, 1.4, 5),
    ];

    // Spread shapes toward the edges so the centered headline stays readable.
    const placements = [
      { x: -6.2, y: 2.3, s: 1.0 },
      { x: 6.0, y: 2.7, s: 1.2 },
      { x: -5.4, y: -2.6, s: 0.9 },
      { x: 5.6, y: -2.2, s: 1.05 },
      { x: -3.2, y: 3.1, s: 0.6 },
      { x: 3.4, y: -3.2, s: 0.7 },
      { x: 0.2, y: 3.4, s: 0.55 },
    ];

    const meshes = placements.map((p, i) => {
      const geo = geoms[i % geoms.length];
      const mat = new THREE.MeshStandardMaterial({
        color: greens[i % greens.length],
        flatShading: true,
        roughness: 0.55,
        metalness: 0.0,
        transparent: true,
        opacity: 0.9,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(p.x, p.y, -1 - (i % 3));
      mesh.scale.setScalar(p.s);
      mesh.userData = {
        rotSpeed: 0.15 + (i % 4) * 0.05,
        bobAmp: 0.25 + (i % 3) * 0.1,
        bobSpeed: 0.6 + (i % 5) * 0.12,
        phase: i * 0.9,
        baseY: p.y,
      };
      scene.add(mesh);
      return mesh;
    });

    const clock = new THREE.Clock();
    let frame;
    const animate = () => {
      const t = clock.getElapsedTime();
      meshes.forEach((m) => {
        const u = m.userData;
        m.rotation.x = t * u.rotSpeed;
        m.rotation.y = t * u.rotSpeed * 1.3;
        m.position.y = u.baseY + Math.sin(t * u.bobSpeed + u.phase) * u.bobAmp;
      });
      renderer.render(scene, camera);
      frame = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      geoms.forEach((g) => g.dispose());
      meshes.forEach((m) => m.material.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className={className} aria-hidden />;
}
