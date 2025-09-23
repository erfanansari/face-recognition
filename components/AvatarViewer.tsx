'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import { FaceAvatar } from '@/lib/faceAvatar';
import GlassesSelector from './GlassesSelector';

interface AvatarViewerProps {
  image: string;
  landmarks: any;
  onReset: () => void;
}

export default function AvatarViewer({ image, landmarks, onReset }: AvatarViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const avatarRef = useRef<FaceAvatar>();
  const [selectedGlasses, setSelectedGlasses] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!canvasRef.current || !landmarks) return;

    const initializeScene = async () => {
      try {
        // Create renderer
        const renderer = new THREE.WebGLRenderer({
          canvas: canvasRef.current!,
          antialias: true,
          alpha: true
        });
        renderer.setSize(800, 600);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0x000000, 0);
        rendererRef.current = renderer;

        // Create scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Create camera
        const camera = new THREE.PerspectiveCamera(50, 800 / 600, 0.1, 1000);
        camera.position.z = 5;

        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        // Create face avatar
        const faceAvatar = new FaceAvatar(scene);
        await faceAvatar.createFromLandmarks(landmarks, image);
        avatarRef.current = faceAvatar;

        // Add orbit controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.maxDistance = 10;
        controls.minDistance = 2;

        // Animation loop
        const animate = () => {
          requestAnimationFrame(animate);
          controls.update();
          renderer.render(scene, camera);
        };
        animate();

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to initialize 3D scene:', error);
        setIsLoading(false);
      }
    };

    initializeScene();

    return () => {
      // Clean up Three.js resources
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (avatarRef.current) {
        avatarRef.current.dispose();
      }
      if (sceneRef.current) {
        sceneRef.current.clear();
      }
    };
  }, [landmarks, image]);

  useEffect(() => {
    if (avatarRef.current && selectedGlasses) {
      avatarRef.current.addGlasses(selectedGlasses);
    } else if (avatarRef.current && !selectedGlasses) {
      avatarRef.current.removeGlasses();
    }
  }, [selectedGlasses]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Your 3D Avatar
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedGlasses(null)}
            className="px-4 py-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-800 dark:text-blue-200 rounded-lg transition-colors"
          >
            Remove Glasses
          </button>
          <button
            onClick={onReset}
            className="px-4 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-800 dark:text-red-200 rounded-lg transition-colors"
          >
            Remove Photo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="relative">
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-300">Creating 3D avatar...</p>
                  </div>
                </div>
              )}
              <canvas
                ref={canvasRef}
                className="w-full h-auto rounded-lg"
                style={{ maxHeight: '600px' }}
              />
            </div>
            <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
              Drag to rotate • Scroll to zoom • Right-click to pan
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <GlassesSelector
            selectedGlasses={selectedGlasses}
            onSelectGlasses={setSelectedGlasses}
          />
        </div>
      </div>
    </div>
  );
}