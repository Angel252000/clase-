import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  createPopsicleGeometry,
  createConeIceCreamGeometry,
  createCupIceCreamGeometry,
  createSoftServeGeometry,
  setupMouseControls,
} from '../utils/three-utils';
import { useThreeScene } from '../hooks/useThreeScene';
import type { Product } from '../data/products';

interface ProductModel3DProps {
  product: Product;
  autoRotate?: boolean;
}

export const ProductModel3D: React.FC<ProductModel3DProps> = ({
  product,
  autoRotate = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const modelGroupRef = useRef<THREE.Group | null>(null);
  const isDraggingRef = useRef(false);
  const [isReady, setIsReady] = useState(false);
  const timeRef = useRef(0);
  // Controls whether the animation loop renders — paused when not visible
  const isVisibleRef = useRef(false);

  const { scene } = useThreeScene(canvasRef, {
    transparent: true,
    onAnimate: (sceneInstance, cameraInstance, rendererInstance, deltaTime) => {
      // Only render when the canvas is visible in the viewport
      if (!isVisibleRef.current) return;

      timeRef.current += deltaTime;

      if (modelGroupRef.current && autoRotate && !isDraggingRef.current) {
        modelGroupRef.current.rotation.y += 0.008;
        // Subtle floating motion
        modelGroupRef.current.position.y = Math.sin(timeRef.current * 1.2) * 0.08;
      }

      rendererInstance.render(sceneInstance, cameraInstance);
    },
  });

  // IntersectionObserver — start rendering only when canvas enters the viewport
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new IntersectionObserver(
      ([entry]) => { isVisibleRef.current = entry.isIntersecting; },
      { threshold: 0.1 }
    );
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  // Create or update model when product or scene changes
  useEffect(() => {
    if (!scene) return;

    // Remove previous model
    if (modelGroupRef.current) {
      scene.remove(modelGroupRef.current);
      modelGroupRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    }

    // Create new model based on product type
    let modelGroup: THREE.Group;

    switch (product.modelType) {
      case 'softserve':
        modelGroup = createSoftServeGeometry(product.theme, 0.9);
        break;
      case 'cone':
        modelGroup = createConeIceCreamGeometry(product.theme, 0.8);
        break;
      case 'cup':
        modelGroup = createCupIceCreamGeometry(product.theme, 0.9);
        break;
      case 'popsicle':
      case 'icecream':
      default:
        modelGroup = createPopsicleGeometry(product.theme, 0.95);
        break;
    }

    scene.add(modelGroup);
    modelGroupRef.current = modelGroup;
    setIsReady(true);

    // Set up controls
    let cleanup: (() => void) | undefined;
    if (canvasRef.current) {
      cleanup = setupMouseControls(canvasRef.current, modelGroup, 0.008, 0.008);
    }

    // Track dragging state for autoRotate
    const onMouseDown = () => {
      isDraggingRef.current = true;
    };
    const onMouseUp = () => {
      setTimeout(() => {
        isDraggingRef.current = false;
      }, 1500); // Resume auto-rotate after 1.5s of no interaction
    };

    canvasRef.current?.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    canvasRef.current?.addEventListener('touchstart', onMouseDown);
    canvasRef.current?.addEventListener('touchend', onMouseUp);

    return () => {
      cleanup?.();
      canvasRef.current?.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      canvasRef.current?.removeEventListener('touchstart', onMouseDown);
      canvasRef.current?.removeEventListener('touchend', onMouseUp);

      if (modelGroupRef.current && scene) {
        scene.remove(modelGroupRef.current);
      }
    };
  }, [scene, product]);

  return (
    <div
      className="relative w-full h-full rounded-[30px] overflow-hidden border border-white/10 backdrop-blur-xl"
      style={{
        background: `radial-gradient(circle at center, ${product.theme}22 0%, ${product.theme}08 50%, transparent 100%)`,
      }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        style={{ display: 'block', touchAction: 'none' }}
      />

      {/* Hint text */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] text-white/40 font-semibold tracking-widest uppercase pointer-events-none flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
        </svg>
        Arrastra para rotar
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </div>

      {/* Color decoration corners */}
      <div
        className="absolute top-4 left-4 w-2 h-2 rounded-full"
        style={{ backgroundColor: product.theme, boxShadow: `0 0 12px ${product.theme}` }}
      />
      <div
        className="absolute top-4 right-4 w-2 h-2 rounded-full"
        style={{ backgroundColor: product.theme, boxShadow: `0 0 12px ${product.theme}` }}
      />

      {/* Loading indicator */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-white/40 text-xs tracking-widest uppercase">Cargando 3D...</div>
        </div>
      )}
    </div>
  );
};
