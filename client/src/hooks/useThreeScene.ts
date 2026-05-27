import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  initializeScene,
  setupLighting,
  cleanupScene,
  handleWindowResize,
} from '../utils/three-utils';

interface UseThreeSceneOptions {
  backgroundColor?: number;
  transparent?: boolean;
  onSceneReady?: (scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer) => void;
  onAnimate?: (scene: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer, deltaTime: number) => void;
}

export function useThreeScene(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  options: UseThreeSceneOptions = {}
) {
  const {
    backgroundColor = 0x0a0a0a,
    transparent = true,
    onSceneReady,
    onAnimate,
  } = options;

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(Date.now());
  const onSceneReadyRef = useRef(onSceneReady);
  const onAnimateRef = useRef(onAnimate);
  // State flag to trigger a re-render once the scene is ready —
  // refs don't cause re-renders, so without this ProductModel3D would
  // always see scene = null and never create the 3D model.
  const [, setSceneVersion] = useState(0);

  // Keep callback refs updated without triggering re-init
  useEffect(() => {
    onSceneReadyRef.current = onSceneReady;
    onAnimateRef.current = onAnimate;
  }, [onSceneReady, onAnimate]);

  // Initialize scene
  useEffect(() => {
    if (!canvasRef.current) return;

    try {
      const { scene, camera, renderer } = initializeScene(canvasRef.current, {
        backgroundColor,
        transparent,
      });

      sceneRef.current = scene;
      cameraRef.current = camera;
      rendererRef.current = renderer;

      // Setup lighting
      setupLighting(scene);

      // Trigger re-render so consumers get the real scene (not null)
      setSceneVersion(v => v + 1);

      // Call onSceneReady callback
      if (onSceneReadyRef.current) {
        onSceneReadyRef.current(scene, camera, renderer);
      }

      // Animation loop
      const animate = () => {
        if (!sceneRef.current || !cameraRef.current || !rendererRef.current) return;

        animationFrameRef.current = requestAnimationFrame(animate);

        const currentTime = Date.now();
        const deltaTime = (currentTime - lastTimeRef.current) / 1000;
        lastTimeRef.current = currentTime;

        // Call custom animation callback
        if (onAnimateRef.current) {
          onAnimateRef.current(sceneRef.current, cameraRef.current, rendererRef.current, deltaTime);
        } else {
          // Default render
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      };

      animate();

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    } catch (error) {
      console.error('Failed to initialize Three.js scene:', error);
    }
  }, [backgroundColor, transparent]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current && canvasRef.current) {
        handleWindowResize(cameraRef.current, rendererRef.current, canvasRef.current);
      }
    };

    window.addEventListener('resize', handleResize);
    // Initial resize
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (sceneRef.current && rendererRef.current) {
        cleanupScene(sceneRef.current, rendererRef.current);
      }
    };
  }, []);

  return {
    scene: sceneRef.current,
    camera: cameraRef.current,
    renderer: rendererRef.current,
  };
}
