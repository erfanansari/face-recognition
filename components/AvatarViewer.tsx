'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FaceAvatar } from '@/lib/faceAvatar';

interface AvatarViewerProps {}

export default function AvatarViewer({}: AvatarViewerProps) {
  const gender = 'male'; // Default to male
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const avatarRef = useRef<THREE.Object3D>();
  const faceAvatarRef = useRef<FaceAvatar>();
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedGlasses, setSelectedGlasses] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const initializeScene = async () => {
      try {
        setError(null);
        setLoadingProgress(10);

        // Create renderer
        const renderer = new THREE.WebGLRenderer({
          canvas: canvasRef.current!,
          antialias: true,
          alpha: true
        });
        renderer.setSize(800, 600);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0x2a2a2a, 1);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        rendererRef.current = renderer;

        setLoadingProgress(20);

        // Create scene
        const scene = new THREE.Scene();
        sceneRef.current = scene;

        // Create camera
        const camera = new THREE.PerspectiveCamera(45, 800 / 600, 1, 2000);
        camera.position.z = 120; // Match Three.js decals example

        setLoadingProgress(30);

        // Add lighting setup matching Three.js decals example
        const ambientLight = new THREE.AmbientLight(0x666666);
        scene.add(ambientLight);

        const dirLight1 = new THREE.DirectionalLight(0xffddcc, 3);
        dirLight1.position.set(1, 0.75, 0.5);
        scene.add(dirLight1);

        const dirLight2 = new THREE.DirectionalLight(0xccccff, 3);
        dirLight2.position.set(-1, 0.75, -0.5);
        scene.add(dirLight2);

        setLoadingProgress(40);

        // Initialize FaceAvatar system
        faceAvatarRef.current = new FaceAvatar(scene);

        // Load realistic 3D head model with fallback
        try {
          await loadRealisticHead(scene);
        } catch (error) {
          console.log('Primary model failed, using FaceAvatar fallback');
          await faceAvatarRef.current.createAvatar(gender);
        }

        // Add orbit controls
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        controls.maxDistance = 300;
        controls.minDistance = 50;
        controls.target.set(0, 0, 0); // Focus on center
        controls.autoRotate = false;
        controls.enablePan = true;
        controls.panSpeed = 0.3;
        controls.rotateSpeed = 0.8;
        controls.zoomSpeed = 0.8;

        // Animation loop
        const animate = () => {
          requestAnimationFrame(animate);
          controls.update();
          renderer.render(scene, camera);
        };
        animate();

        setIsLoading(false);
        setLoadingProgress(100);
      } catch (error) {
        console.error('Failed to initialize 3D scene:', error);
        setError('Failed to load 3D avatar. Please try again.');
        setIsLoading(false);
      }
    };

    initializeScene();

    return () => {
      // Clean up Three.js resources
      if (faceAvatarRef.current) {
        faceAvatarRef.current.dispose();
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (sceneRef.current) {
        sceneRef.current.clear();
      }
    };
  }, []);

  const loadRealisticHead = async (scene: THREE.Scene) => {
    try {
      setLoadingProgress(50);

      // Use realistic human head model from Three.js examples
      const avatarUrl = 'https://threejs.org/examples/models/gltf/LeePerrySmith/LeePerrySmith.glb';

      const loader = new GLTFLoader();
      setLoadingProgress(60);

      return new Promise((resolve, reject) => {
        loader.load(
          avatarUrl,
          (gltf) => {
            setLoadingProgress(80);

            const avatar = gltf.scene;

            // Scale and position the head properly (matching Three.js decals example)
            avatar.scale.multiplyScalar(10); // Match Three.js decals example scaling
            avatar.position.set(0, 0, 0); // Center the head

            // Setup materials and shadows for realistic rendering
            avatar.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;

                if (child.material instanceof THREE.MeshStandardMaterial) {
                  child.material.envMapIntensity = 0.5;
                  child.material.roughness = 0.8;
                  child.material.metalness = 0.1;
                }
              }
            });

            scene.add(avatar);
            avatarRef.current = avatar;

            setLoadingProgress(90);
            resolve(avatar);
          },
          (progress) => {
            const percentage = (progress.loaded / progress.total) * 100;
            setLoadingProgress(60 + (percentage * 0.2));
          },
          (error) => {
            console.error('Error loading realistic head:', error);
            reject(error);
          }
        );
      });
    } catch (error) {
      console.error('Failed to load realistic head:', error);
      throw error;
    }
  };


  const createSimpleHead = (scene: THREE.Scene) => {
    // Create a simple but clean head geometry as last resort
    const headGeometry = new THREE.SphereGeometry(0.5, 32, 16);
    const headMaterial = new THREE.MeshPhongMaterial({
      color: 0xe8d5c8,
      shininess: 10,
    });

    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 0, 0);
    head.castShadow = true;
    head.receiveShadow = true;

    scene.add(head);
    avatarRef.current = head;
    setLoadingProgress(100);
  };

  const handleGlassesSelect = (glassesType: string) => {
    if (faceAvatarRef.current) {
      if (selectedGlasses === glassesType) {
        // Remove glasses if same type is selected
        faceAvatarRef.current.removeGlasses();
        setSelectedGlasses(null);
      } else {
        // Add new glasses
        faceAvatarRef.current.addGlasses(glassesType);
        setSelectedGlasses(glassesType);
      }
    }
  };

  const glassesOptions = [
    { type: 'aviator', label: 'Aviator', emoji: '🕶️' },
    { type: 'round', label: 'Round', emoji: '👓' },
    { type: 'square', label: 'Square', emoji: '🤓' },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Realistic 3D Head Model
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          High-quality human head with detailed facial features
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-lg z-10">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-300">Loading realistic head model...</p>
                  <div className="w-64 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${loadingProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {loadingProgress}%
                  </p>
                </div>
              </div>
            )}
            <canvas
              ref={canvasRef}
              className="w-full h-auto rounded-lg"
              style={{ minHeight: '600px' }}
            />
          </div>

          {!isLoading && !error && (
            <>
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                <strong>Controls:</strong> Drag to rotate • Scroll to zoom • Right-click to pan
              </div>
              <div className="mt-2 text-xs text-gray-400 dark:text-gray-500 text-center">
                Photorealistic human head model with detailed facial anatomy
              </div>

              {/* Glasses Selection */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-4">
                  Try On Glasses
                </h3>
                <div className="flex justify-center gap-4">
                  {glassesOptions.map((option) => (
                    <button
                      key={option.type}
                      onClick={() => handleGlassesSelect(option.type)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        selectedGlasses === option.type
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-400'
                      }`}
                    >
                      <div className="text-2xl mb-2">{option.emoji}</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {option.label}
                      </div>
                    </button>
                  ))}
                  {selectedGlasses && (
                    <button
                      onClick={() => handleGlassesSelect('')}
                      className="p-4 rounded-lg border-2 border-red-200 dark:border-red-600 hover:border-red-300 dark:hover:border-red-400 transition-all duration-200"
                    >
                      <div className="text-2xl mb-2">❌</div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        Remove
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}