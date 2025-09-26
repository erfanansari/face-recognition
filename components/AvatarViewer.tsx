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
  const [glassesModels, setGlassesModels] = useState<{[key: string]: THREE.Object3D}>({});
  const [currentGlassesObject, setCurrentGlassesObject] = useState<THREE.Object3D | null>(null);

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
        camera.position.z = 50; // Zoom in closer for head model

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
        controls.maxDistance = 100;
        controls.minDistance = 20;
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
      if (currentGlassesObject && sceneRef.current) {
        sceneRef.current.remove(currentGlassesObject);
      }
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

      // Use local male head sculpt model
      const avatarUrl = '/male_head_sculpt.glb';

      const loader = new GLTFLoader();
      setLoadingProgress(60);

      return new Promise((resolve, reject) => {
        loader.load(
          avatarUrl,
          (gltf) => {
            setLoadingProgress(80);

            const avatar = gltf.scene;

            // Scale and position the head properly (balanced size)
            avatar.scale.multiplyScalar(25); // Balanced scaling for custom head model
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

  const loadGlassesModel = async (glassesFile: string): Promise<THREE.Object3D> => {
    const loader = new GLTFLoader();
    return new Promise((resolve, reject) => {
      loader.load(
        glassesFile,
        (gltf) => {
          const glasses = gltf.scene.clone();

          // Scale and position the glasses properly for the head
          glasses.scale.setScalar(2); // Reasonable scale relative to head scale of 25

          // Position glasses at proper eye level on the face
          glasses.position.set(0, 2, 3); // Eye level on the face

          // Apply standard rotation for proper orientation
          glasses.rotation.set(0, 0, 0); // Reset any weird rotations

          // Setup materials for proper rendering
          glasses.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              if (child.material) {
                if (Array.isArray(child.material)) {
                  child.material.forEach((mat) => {
                    if (mat instanceof THREE.MeshStandardMaterial) {
                      mat.envMapIntensity = 0.5;
                    }
                  });
                } else if (child.material instanceof THREE.MeshStandardMaterial) {
                  child.material.envMapIntensity = 0.5;
                }
              }
            }
          });

          resolve(glasses);
        },
        undefined,
        reject
      );
    });
  };

  const handleGlassesSelect = async (glassesType: string) => {
    if (!sceneRef.current) return;

    // Remove current glasses
    if (currentGlassesObject) {
      sceneRef.current.remove(currentGlassesObject);
      setCurrentGlassesObject(null);
    }

    if (selectedGlasses === glassesType) {
      // Remove glasses if same type is selected
      setSelectedGlasses(null);
      return;
    }

    // Find the glasses option
    const glassesOption = glassesOptions.find(option => option.type === glassesType);
    if (!glassesOption) return;

    try {
      // Check if we already loaded this model
      if (glassesModels[glassesType]) {
        const glasses = glassesModels[glassesType].clone();
        sceneRef.current.add(glasses);
        setCurrentGlassesObject(glasses);
        setSelectedGlasses(glassesType);
      } else {
        // Load the model for the first time
        const glasses = await loadGlassesModel(glassesOption.file);

        // Store the loaded model for reuse
        setGlassesModels(prev => ({
          ...prev,
          [glassesType]: glasses.clone()
        }));

        sceneRef.current.add(glasses);
        setCurrentGlassesObject(glasses);
        setSelectedGlasses(glassesType);
      }
    } catch (error) {
      console.error('Error loading glasses model:', error);
    }
  };

  const glassesOptions = [
    { type: 'classic', label: 'Classic', description: 'Timeless aviator style', file: '/sunglasses/classic.glb' },
    { type: 'modern', label: 'Modern', description: 'Contemporary design', file: '/sunglasses/modern.glb' },
    { type: 'premium', label: 'Premium', description: 'Luxury materials', file: '/sunglasses/premium.glb' },
    { type: 'designer', label: 'Designer', description: 'Fashion forward', file: '/sunglasses/designer.glb' },
    { type: 'retro', label: 'Retro', description: 'Pixel art inspired', file: '/sunglasses/retro.glb' },
    { type: 'clubmaster', label: 'Clubmaster', description: 'Sophisticated browline', file: '/sunglasses/clubmaster.glb' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
      {/* Modern Header */}
      <div className="relative z-10 pt-8 pb-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Virtual Try-On Studio
          </h1>
          <p className="text-gray-400 text-lg">
            Realistic 3D avatar with AI-powered accessories
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-6 px-4 lg:px-8 max-w-7xl mx-auto">

        {/* 3D Viewport - Main Focus */}
        <div className="flex-1 relative">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden">

            {/* Error State */}
            {error && (
              <div className="absolute top-4 left-4 right-4 z-20">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 backdrop-blur-sm">
                  <p className="text-red-400 text-center">{error}</p>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm z-10">
                <div className="text-center">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-gray-600 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-8 h-8 bg-blue-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  <p className="text-gray-300 text-lg mb-4">Loading 3D Model...</p>

                  {/* Modern Progress Bar */}
                  <div className="w-80 bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${loadingProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-blue-400 text-sm mt-2 font-mono">
                    {loadingProgress}%
                  </p>
                </div>
              </div>
            )}

            {/* 3D Canvas */}
            <canvas
              ref={canvasRef}
              className="w-full rounded-2xl"
              style={{ height: '70vh', minHeight: '500px' }}
            />

            {/* Controls Overlay */}
            {!isLoading && !error && (
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/40 backdrop-blur-md rounded-xl p-3 border border-gray-600/30">
                  <div className="flex items-center justify-center gap-6 text-xs text-gray-300">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>Drag to rotate</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Scroll to zoom</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span>Right-click to pan</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Accessories Panel */}
        {!isLoading && !error && (
          <div className="lg:w-80">
            <div className="bg-gray-900/95 backdrop-blur-sm rounded-xl border border-gray-800 shadow-xl p-4 sticky top-8">

              {/* Panel Header */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">Eyewear Collection</h3>
                <div className="w-10 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              </div>

              {/* Glasses List */}
              <div className="space-y-2 mb-6">
                {glassesOptions.map((option) => (
                  <button
                    key={option.type}
                    onClick={() => handleGlassesSelect(option.type)}
                    className={`w-full p-3 rounded-lg border transition-all duration-200 text-left group ${
                      selectedGlasses === option.type
                        ? 'border-blue-500 bg-blue-500/5 shadow-md'
                        : 'border-gray-700 hover:border-gray-600 bg-gray-800/30 hover:bg-gray-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium text-sm mb-0.5">
                          {option.label}
                        </div>
                        <div className="text-gray-400 text-xs">
                          {option.description}
                        </div>
                      </div>
                      <div className={`w-2.5 h-2.5 rounded-full border-2 transition-colors ${
                        selectedGlasses === option.type
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-500 group-hover:border-gray-400'
                      }`}>
                        {selectedGlasses === option.type && (
                          <div className="w-full h-full rounded-full bg-white scale-50"></div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Remove Button */}
              {selectedGlasses && (
                <button
                  onClick={() => handleGlassesSelect('')}
                  className="w-full p-2.5 rounded-lg border border-gray-600 bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200 text-gray-300 hover:text-white"
                >
                  <div className="flex items-center justify-center gap-2">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="font-medium text-sm">Clear Selection</span>
                  </div>
                </button>
              )}

              {/* Footer Info */}
              <div className="mt-6 pt-4 border-t border-gray-800">
                <div className="text-center space-y-1">
                  <p className="text-xs text-gray-500 font-medium">
                    WebGL Powered Rendering
                  </p>
                  <p className="text-xs text-gray-600">
                    Real-time 3D visualization
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}