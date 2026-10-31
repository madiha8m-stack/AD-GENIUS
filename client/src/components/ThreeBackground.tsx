import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export function ThreeBackground() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    if (!mountRef.current) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let animationId: number;

    try {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );

      try {
        renderer = new THREE.WebGLRenderer({ 
          alpha: true, 
          antialias: true,
          failIfMajorPerformanceCaveat: false
        });
      } catch (error) {
        console.warn('WebGL not available, using fallback background');
        setHasWebGL(false);
        return;
      }

      if (!renderer) return;

      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      
      if (mountRef.current) {
        mountRef.current.appendChild(renderer.domElement);
      }

      camera.position.z = 5;

      const particles = new THREE.BufferGeometry();
      const particleCount = 2000;
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 50;
        positions[i + 1] = (Math.random() - 0.5) * 50;
        positions[i + 2] = (Math.random() - 0.5) * 50;

        const purpleBlue = Math.random() > 0.5;
        if (purpleBlue) {
          colors[i] = 0.54;
          colors[i + 1] = 0.36;
          colors[i + 2] = 0.96;
        } else {
          colors[i] = 0.2;
          colors[i + 1] = 0.6;
          colors[i + 2] = 1;
        }
      }

      particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const particleMaterial = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      });

      const particleSystem = new THREE.Points(particles, particleMaterial);
      scene.add(particleSystem);

      const geometries = [
        new THREE.OctahedronGeometry(0.3),
        new THREE.TetrahedronGeometry(0.3),
        new THREE.IcosahedronGeometry(0.3),
      ];

      const shapes: THREE.Mesh[] = [];
      for (let i = 0; i < 5; i++) {
        const geometry = geometries[Math.floor(Math.random() * geometries.length)];
        const material = new THREE.MeshBasicMaterial({
          color: Math.random() > 0.5 ? 0x8b5cf6 : 0x3b82f6,
          wireframe: true,
          transparent: true,
          opacity: 0.3,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10
        );
        shapes.push(mesh);
        scene.add(mesh);
      }

      let mouseX = 0;
      let mouseY = 0;

      const handleMouseMove = (event: MouseEvent) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
      };

      window.addEventListener('mousemove', handleMouseMove);

      const handleResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        if (renderer) {
          renderer.setSize(window.innerWidth, window.innerHeight);
        }
      };

      window.addEventListener('resize', handleResize);

      const animate = () => {
        animationId = requestAnimationFrame(animate);

        particleSystem.rotation.y += 0.0005;
        particleSystem.rotation.x += 0.0002;

        camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
        camera.position.y += (mouseY * 0.5 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        shapes.forEach((shape, index) => {
          shape.rotation.x += 0.001 * (index + 1);
          shape.rotation.y += 0.002 * (index + 1);
        });

        if (renderer) {
          renderer.render(scene, camera);
        }
      };

      animate();

      return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', handleResize);
        if (mountRef.current && renderer?.domElement) {
          mountRef.current.removeChild(renderer.domElement);
        }
        if (renderer) {
          renderer.dispose();
        }
      };
    } catch (error) {
      console.error('Three.js initialization error:', error);
      setHasWebGL(false);
    }
  }, []);

  return (
    <div
      ref={mountRef}
      className="fixed inset-0 -z-10"
      style={{ 
        background: hasWebGL 
          ? 'linear-gradient(to bottom, #0a0a0f, #1a0b2e)' 
          : 'linear-gradient(135deg, #0a0a0f 0%, #1a0b2e 50%, #0f0a1e 100%)'
      }}
    />
  );
}
